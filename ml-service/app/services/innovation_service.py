import json
from functools import lru_cache
from pathlib import Path

from .similarity_service import canonical_tech

# ml-service/app/services/innovation_service.py -> ml-service/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CATALOG_PATH = BASE_DIR / "data" / "technology_catalog.json"


@lru_cache(maxsize=1)
def load_technology_catalog():
    with open(CATALOG_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def recommend_technologies(domain: str, current_technologies: list):
    catalog = load_technology_catalog()

    # case-insensitive domain lookup
    by_domain = {key.lower(): value for key, value in catalog.items()}
    available = by_domain.get((domain or "").strip().lower(), [])

    current = {canonical_tech(t) for t in (current_technologies or [])}

    recommended = []
    for technology in available:
        if canonical_tech(technology) not in current and technology not in recommended:
            recommended.append(technology)

    return recommended[:5]


def technology_rationale(domain: str, recommended: list):
    if not recommended:
        return (
            "The current technology stack already covers the main "
            "technologies identified for this domain."
        )

    technologies = ", ".join(recommended[:3])
    return (
        f"For {domain}, technologies such as {technologies} can add new "
        f"capabilities and help differentiate the project."
    )


def generate_innovation_ideas(domain, similar_projects, recommended_technologies, current_technologies):
    ideas = []

    if similar_projects:
        highest = similar_projects[0]

        if highest["similarity_score"] >= 80:
            ideas.append(
                f"Your idea is highly similar to '{highest['title']}'. Add a new "
                f"workflow, feature, or target user group that is not present in that project."
            )
        elif highest["similarity_score"] >= 60:
            ideas.append(
                f"'{highest['title']}' is moderately similar. Focus on a clearly "
                f"different problem-solving approach or feature."
            )
        else:
            ideas.append(
                "The idea has relatively low similarity with the current project "
                "collection. Clearly document the unique contribution."
            )

    if recommended_technologies:
        ideas.append(
            f"Consider integrating {recommended_technologies[0]} "
            f"to introduce an additional technical capability."
        )

    domain_ideas = {
        "Web Development": "Add intelligent personalization, real-time analytics, or automated workflows.",
        "Mobile Application": "Consider offline support, smart notifications, location-based features, or accessibility improvements.",
        "Data Science": "Add explainable analytics, prediction confidence, model monitoring, or interactive dashboards.",
        "AI / ML": "Add explainable AI, human feedback, confidence scores, or continuous model improvement.",
        "Cyber Security": "Add anomaly detection, risk scoring, automated alerts, or security audit features.",
        "IoT": "Consider predictive maintenance, edge processing, real-time alerts, or sensor analytics.",
        "Cloud Computing": "Add monitoring, automated scaling, cost optimization, or fault recovery.",
        "Software Development": "Add role-based workflows, audit logs, plugin support, automation, or intelligent assistance.",
    }

    if domain in domain_ideas:
        ideas.append(domain_ideas[domain])

    if len(current_technologies) <= 1:
        ideas.append(
            "Consider combining another suitable technology with the current stack "
            "to increase the technical depth of the project."
        )

    return ideas[:5]


def generate_suggestions(similarity, originality, description_length):
    suggestions = []

    if similarity >= 80:
        suggestions.append({
            "title": "Add a unique feature",
            "description": "The idea is highly similar to an existing project. Introduce a feature or workflow that clearly differentiates your solution.",
            "icon": "bi-lightbulb",
        })
    elif similarity >= 60:
        suggestions.append({
            "title": "Differentiate your approach",
            "description": "The idea has moderate similarity. Explain how your implementation solves the problem differently.",
            "icon": "bi-stars",
        })
    else:
        suggestions.append({
            "title": "Build on the unique idea",
            "description": "The idea shows relatively low similarity with the current project collection.",
            "icon": "bi-lightbulb",
        })

    if description_length < 150:
        suggestions.append({
            "title": "Improve the description",
            "description": "Explain the problem, target users, proposed solution and unique contribution in more detail.",
            "icon": "bi-file-text",
        })

    if originality >= 80:
        suggestions.append({
            "title": "Strong originality",
            "description": "The idea has relatively low similarity with the current project collection.",
            "icon": "bi-award",
        })

    return suggestions
