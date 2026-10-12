from fastapi import APIRouter

from ..schemas import ProjectInput, RecommendationResponse
from ..services.innovation_service import (
    generate_innovation_ideas,
    generate_suggestions,
    recommend_technologies,
    technology_rationale,
)
from ..services.scoring_service import calculate_scores
from ..services.similarity_service import find_similar_projects

router = APIRouter(prefix="/api/ml", tags=["ML Analysis"])


@router.post("/analyze", response_model=RecommendationResponse)
def analyze_project(project: ProjectInput):

    description = project.description or ""
    technologies = project.technologies or []

    # 1. Similar projects (field-aware, cached corpus, self excluded)
    similar_projects = find_similar_projects(
        existing_projects=project.existing_projects,
        max_results=5,
        title=project.title,
        description=description,
        domain=project.domain,
        technologies=technologies,
        exclude_project_id=project.id,
    )

    # 2. Highest similarity
    maximum_similarity = similar_projects[0]["similarity_score"] if similar_projects else 0.0

    # 3. Technology recommendations
    recommended_technologies = recommend_technologies(
        domain=project.domain,
        current_technologies=technologies,
    )

    # 4. Scores
    scores = calculate_scores(
        maximum_similarity=maximum_similarity,
        description_text=description,
        technologies=technologies,
    )

    # 5. Innovation ideas
    innovation_ideas = generate_innovation_ideas(
        domain=project.domain,
        similar_projects=similar_projects,
        recommended_technologies=recommended_technologies,
        current_technologies=technologies,
    )

    # 6. General suggestions
    suggestions = generate_suggestions(
        similarity=scores["similarity"],
        originality=scores["originality"],
        description_length=len(description),
    )

    # 7. Response
    return {
        "similarity": scores["similarity"],
        "originality": scores["originality"],
        "innovation": scores["innovation"],
        "innovation_gap": scores["innovation_gap"],
        "similar_projects": similar_projects,
        "suggestions": suggestions,
        "innovation_ideas": innovation_ideas,
        "technology_recommendation": {
            "current": technologies,
            "recommended": recommended_technologies,
            "rationale": technology_rationale(project.domain, recommended_technologies),
        },
    }
