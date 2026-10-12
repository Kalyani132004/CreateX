"""
Project similarity.

What changed vs. the original, and why:
  * Word AND character n-gram TF-IDF are blended, so "recognising" /
    "recognition" / small typos still match (plain unigrams scored a clear
    paraphrased duplicate at ~29%).
  * Generic filler words ("project", "system", "using"...) are ignored so two
    unrelated "management systems" don't look alike.
  * Technology overlap (Jaccard on canonical names) is a small extra signal.
  * The corpus is vectorised once and cached; a request only transforms the
    new project instead of re-fitting on every existing project.
  * The project being analysed can be excluded (re-analysis after an edit no
    longer matches itself at 100%).
  * Empty / stop-word-only text returns [] instead of raising.
  * A calibration hook (CALIBRATION) exists so the 60/80 thresholds used in
    innovation_service can be tuned from evaluate_similarity.py results.
"""

import hashlib
import re
import threading

import numpy as np
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

WEIGHT_WORD = 0.70
WEIGHT_CHAR = 0.25
WEIGHT_TECH = 0.05  # renormalised away when either side lists no technologies

GENERIC_TERMS = {
    "project", "projects", "system", "systems", "application", "applications",
    "app", "apps", "using", "used", "based", "user", "users", "platform",
    "develop", "developed", "developing", "provide", "provides", "allow",
    "allows", "help", "helps", "tool", "software", "solution", "proposed",
}
STOP_WORDS = sorted(set(ENGLISH_STOP_WORDS) | GENERIC_TERMS)

# (raw_score, calibrated_score) anchor points, both on a 0-100 scale, monotone,
# piecewise-linear. Identity by default: the blended score is already spread
# well (paraphrased duplicate ~64, unrelated ~2-7 in my smoke test). Only change
# this using results from evaluate_similarity.py on YOUR labelled pairs.
CALIBRATION = [(0, 0), (100, 100)]

_RETURN_RAW = False  # evaluate_similarity.py flips this to see uncalibrated scores
TOKEN_PATTERN = r"(?u)\b\w[\w+#]*\b"

_ALIASES = {
    "reactjs": "react", "react.js": "react", "nodejs": "node", "node.js": "node",
    "expressjs": "express", "express.js": "express", "vuejs": "vue", "vue.js": "vue",
    "nextjs": "next", "next.js": "next", "postgres": "postgresql",
    "mongo": "mongodb", "js": "javascript", "ts": "typescript",
    "sklearn": "scikit-learn", "tf": "tensorflow", "k8s": "kubernetes",
}


def canonical_tech(name: str) -> str:
    """Case/spacing-insensitive technology key ('Node.js' == 'nodejs')."""
    key = re.sub(r"\s+", "", str(name).strip().lower())
    return _ALIASES.get(key, key)


def canonical_tech_set(technologies) -> set:
    return {canonical_tech(t) for t in (technologies or []) if str(t).strip()}


# ---------------------------------------------------------------------------
# Text preparation
# ---------------------------------------------------------------------------

def _project_text(title, description, domain=None, technologies=None) -> str:
    # Title + description only. Domain and technology names are deliberately NOT
    # in the text: projects sharing a domain or a stack ("Web Development",
    # React + Node) are not duplicates, and including them inflated unrelated
    # same-stack pairs in testing. Stack overlap is a separate, small signal.
    # The title is repeated so it carries more weight than one body sentence.
    parts = [title or "", title or "", description or ""]
    return " ".join(p for p in parts if p).lower()


def calibrate(raw_percent: float) -> float:
    xs, ys = zip(*CALIBRATION)
    return float(np.interp(raw_percent, xs, ys))


# ---------------------------------------------------------------------------
# Corpus cache
# ---------------------------------------------------------------------------

class _Corpus:
    def __init__(self, projects):
        self.projects = projects
        self.texts = [
            _project_text(p.title, p.description, p.domain, p.technologies)
            for p in projects
        ]
        self.tech_sets = [canonical_tech_set(p.technologies) for p in projects]

        self.word = TfidfVectorizer(
            stop_words=STOP_WORDS, ngram_range=(1, 2), sublinear_tf=True,
            strip_accents="unicode", token_pattern=TOKEN_PATTERN,
        )
        self.char = TfidfVectorizer(
            analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True,
            strip_accents="unicode",
        )
        # A corpus made only of stop words has no vocabulary; handled by caller.
        self.word_matrix = self.word.fit_transform(self.texts)
        self.char_matrix = self.char.fit_transform(self.texts)


_cache_lock = threading.Lock()
_cache = {"key": None, "corpus": None}


def _fingerprint(projects) -> str:
    h = hashlib.sha1()
    for p in projects:
        h.update(repr((p.id, p.title, p.description, p.domain,
                       tuple(p.technologies or []))).encode("utf-8"))
    return h.hexdigest()


def _get_corpus(projects) -> _Corpus:
    key = _fingerprint(projects)
    with _cache_lock:
        if _cache["key"] != key:
            _cache["corpus"] = _Corpus(projects)
            _cache["key"] = key
        return _cache["corpus"]


# ---------------------------------------------------------------------------
# Public API (backwards compatible with the original call)
# ---------------------------------------------------------------------------

def find_similar_projects(
    new_project_text: str = "",
    existing_projects=None,
    max_results: int = 5,
    *,
    title: str = "",
    description: str = "",
    domain: str = "",
    technologies=None,
    exclude_project_id=None,
):
    """
    Returns [{"project_id", "title", "similarity_score"}] sorted high -> low.
    Pass title/description/domain/technologies for the full hybrid score; with
    only `new_project_text` it still works using the text signals alone.
    """
    existing = [
        p for p in (existing_projects or [])
        if exclude_project_id is None or p.id != exclude_project_id
    ]
    if not existing:
        return []

    new_text = (
        _project_text(title, description, domain, technologies)
        if (title or description) else (new_project_text or "").lower()
    )
    if not new_text.strip():
        return []

    try:
        corpus = _get_corpus(existing)
        if not corpus.word.build_analyzer()(new_text):
            return []  # only stop words / filler: nothing meaningful to compare
        word_scores = cosine_similarity(corpus.word.transform([new_text]), corpus.word_matrix)[0]
        char_scores = cosine_similarity(corpus.char.transform([new_text]), corpus.char_matrix)[0]
    except ValueError:
        # empty vocabulary (e.g. only stop words) -> nothing meaningful to compare
        return []

    new_tech = canonical_tech_set(technologies)

    results = []
    for i, project in enumerate(corpus.projects):
        score = WEIGHT_WORD * word_scores[i] + WEIGHT_CHAR * char_scores[i]
        weight = WEIGHT_WORD + WEIGHT_CHAR

        other_tech = corpus.tech_sets[i]
        if new_tech and other_tech:
            jaccard = len(new_tech & other_tech) / len(new_tech | other_tech)
            score += WEIGHT_TECH * jaccard
            weight += WEIGHT_TECH

        raw = 100.0 * score / weight
        if _RETURN_RAW:
            results.append({"project_id": project.id, "title": project.title,
                            "similarity_score": float(round(raw, 2))})
            continue
        results.append({
            "project_id": project.id,
            "title": project.title,
            "similarity_score": float(round(min(100.0, max(0.0, calibrate(raw))), 2)),
        })

    results.sort(key=lambda r: r["similarity_score"], reverse=True)
    return results[:max_results]
