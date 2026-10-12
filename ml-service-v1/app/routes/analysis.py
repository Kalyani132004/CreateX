from fastapi import APIRouter

from ..schemas import (
    ProjectInput,
    RecommendationResponse
)

from ..utils.text_utils import (
    build_project_text
)

from ..services.similarity_service import (
    find_similar_projects
)

from ..services.scoring_service import (
    calculate_scores
)

from ..services.innovation_service import (
    recommend_technologies,
    technology_rationale,
    generate_innovation_ideas,
    generate_suggestions
)


router = APIRouter(
    prefix="/api/ml",
    tags=["ML Analysis"]
)


@router.post(
    "/analyze",
    response_model=RecommendationResponse
)
def analyze_project(
    project: ProjectInput
):

    # -------------------------------------------------
    # 1. Build text for new project
    # -------------------------------------------------

    project_text = build_project_text(
        title=project.title,
        description=project.description,
        domain=project.domain,
        technologies=project.technologies
    )

    # -------------------------------------------------
    # 2. Compare against ALL existing projects
    # -------------------------------------------------

    similar_projects = find_similar_projects(
        new_project_text=project_text,
        existing_projects=project.existing_projects,
        max_results=5
    )

    # -------------------------------------------------
    # 3. Find highest similarity
    # -------------------------------------------------

    if similar_projects:

        maximum_similarity = (
            similar_projects[0]["similarity_score"]
        )

    else:

        maximum_similarity = 0.0

    # -------------------------------------------------
    # 4. Technology recommendations
    # -------------------------------------------------

    recommended_technologies = (
        recommend_technologies(
            domain=project.domain,
            current_technologies=project.technologies
        )
    )

    # -------------------------------------------------
    # 5. Calculate scores
    # -------------------------------------------------

    scores = calculate_scores(

        maximum_similarity=maximum_similarity,

        technology_count=len(
            project.technologies
        ),

        description_length=len(
            project.description
        ),

        recommended_technology_count=len(
            recommended_technologies
        )
    )

    # -------------------------------------------------
    # 6. Innovation ideas
    # -------------------------------------------------

    innovation_ideas = (
        generate_innovation_ideas(

            domain=project.domain,

            similar_projects=similar_projects,

            recommended_technologies=(
                recommended_technologies
            ),

            current_technologies=(
                project.technologies
            )
        )
    )

    # -------------------------------------------------
    # 7. General suggestions
    # -------------------------------------------------

    suggestions = (
        generate_suggestions(

            similarity=(
                scores["similarity"]
            ),

            originality=(
                scores["originality"]
            ),

            description_length=len(
                project.description
            )
        )
    )

    # -------------------------------------------------
    # 8. Final response
    # -------------------------------------------------

    return {

        "similarity":
            scores["similarity"],

        "originality":
            scores["originality"],

        "innovation":
            scores["innovation"],

        "innovation_gap":
            scores["innovation_gap"],

        "similar_projects":
            similar_projects,

        "suggestions":
            suggestions,

        "innovation_ideas":
            innovation_ideas,

        "technology_recommendation": {

            "current":
                project.technologies,

            "recommended":
                recommended_technologies,

            "rationale":
                technology_rationale(
                    project.domain,
                    recommended_technologies
                )
        }
    }