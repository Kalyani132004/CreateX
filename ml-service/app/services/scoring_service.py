"""
Scores. Same output keys as before: similarity, originality, innovation,
innovation_gap.

What changed vs. the original, and why:
  * BUG: the old innovation score gave +10% for `recommended_technology_count`,
    i.e. it rewarded a project for MISSING catalog technologies (and the count
    was capped at 5, so it was effectively a constant +10). Removed.
  * Description quality counts distinct meaningful words instead of characters,
    so padding or repeating text no longer raises the score.
  * Technology score uses distinct, canonicalised technologies with diminishing
    returns instead of 15 points each.
  * `description_length` and `recommended_technology_count` are still accepted
    so existing callers don't break.

NOTE on innovation_gap: I kept its original meaning (a weighted blend that
rises with originality) minus the technology-gap term. If you intended
"remaining headroom" (100 - innovation), say so and it is a one-line change.
"""

import re

from .similarity_service import GENERIC_TERMS, canonical_tech_set
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

_IGNORED = set(ENGLISH_STOP_WORDS) | GENERIC_TERMS
_TECH_POINTS = [0, 30, 55, 75, 90, 100]  # by distinct technology count (5+ = 100)


def _description_score(description_text, description_length) -> int:
    if description_text is not None:
        words = {
            w for w in re.findall(r"[a-z0-9+#]+", description_text.lower())
            if len(w) > 2 and w not in _IGNORED
        }
        n = len(words)
        for threshold, score in ((70, 100), (45, 80), (25, 60), (15, 40)):
            if n >= threshold:
                return score
        return 20

    # legacy fallback: original character thresholds
    for threshold, score in ((500, 100), (300, 80), (150, 60), (100, 40)):
        if description_length >= threshold:
            return score
    return 20


def calculate_scores(
    maximum_similarity: float,
    technology_count: int = 0,
    description_length: int = 0,
    recommended_technology_count: int = 0,  # accepted, intentionally unused
    *,
    description_text=None,
    technologies=None,
):
    similarity = round(min(100.0, max(0.0, maximum_similarity)), 2)
    originality = round(100 - similarity, 2)

    description_score = _description_score(description_text, description_length)

    if technologies is not None:
        technology_count = len(canonical_tech_set(technologies))
    technology_score = _TECH_POINTS[min(technology_count, len(_TECH_POINTS) - 1)]

    innovation = round(
        originality * 0.60 + description_score * 0.20 + technology_score * 0.20, 2
    )
    innovation_gap = round(originality * 0.75 + description_score * 0.25, 2)

    return {
        "similarity": similarity,
        "originality": originality,
        "innovation": innovation,
        "innovation_gap": innovation_gap,
    }
