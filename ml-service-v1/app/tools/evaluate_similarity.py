"""
Measure whether the new similarity beats the old one ON YOUR DATA.

Usage:  python tools/evaluate_similarity.py labelled_pairs.json

labelled_pairs.json — a list of pairs you (or a faculty member) have judged:
[
  {"a": {"title": "...", "description": "...", "domain": "...", "technologies": ["..."]},
   "b": {"title": "...", "description": "...", "domain": "...", "technologies": ["..."]},
   "similar": true}          # true = same idea / near-duplicate, false = different
  , ...
]
Aim for at least 100 pairs, roughly half similar and half not, including
HARD negatives (same domain / same stack, different idea).

Prints ROC-AUC and the best-F1 threshold for the old method and the new one.
Use the new method's best threshold to set the 60/80 cut-offs (or fill in
CALIBRATION in similarity_service.py).
"""
import json
import sys
from types import SimpleNamespace as P

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import precision_recall_curve, roc_auc_score
from sklearn.metrics.pairwise import cosine_similarity

sys.path.insert(0, ".")
from app.services import similarity_service as new  # noqa: E402


def text(p):
    return " ".join([p["title"], p["description"], p.get("domain", ""), " ".join(p.get("technologies", []))])


def old_score(a, b):
    m = TfidfVectorizer(stop_words="english").fit_transform([text(a), text(b)])
    return float(cosine_similarity(m[0], m[1])[0][0]) * 100


def new_score(a, b):
    new._RETURN_RAW = True
    other = P(id=0, **{k: b.get(k, [] if k == "technologies" else "") for k in ("title", "description", "domain", "technologies")})
    res = new.find_similar_projects(existing_projects=[other], **{k: a.get(k, [] if k == "technologies" else "") for k in ("title", "description", "domain", "technologies")})
    return res[0]["similarity_score"] if res else 0.0


def report(name, scores, labels):
    auc = roc_auc_score(labels, scores)
    prec, rec, thr = precision_recall_curve(labels, scores)
    f1 = (2 * prec * rec) / (prec + rec + 1e-9)
    i = f1[:-1].argmax()
    print(f"{name:>4}: ROC-AUC {auc:.3f} | best F1 {f1[i]:.3f} at threshold {thr[i]:.1f}")


if __name__ == "__main__":
    pairs = json.load(open(sys.argv[1], encoding="utf-8"))
    labels = [1 if p["similar"] else 0 for p in pairs]
    report("old", [old_score(p["a"], p["b"]) for p in pairs], labels)
    report("new", [new_score(p["a"], p["b"]) for p in pairs], labels)
