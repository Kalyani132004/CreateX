from typing import List

from pydantic import BaseModel, Field


class ExistingProject(BaseModel):

    id: int

    title: str

    description: str

    domain: str

    technologies: List[str] = Field(
        default_factory=list
    )


class ProjectInput(BaseModel):

    title: str

    description: str

    domain: str

    technologies: List[str] = Field(
        default_factory=list
    )

    existing_projects: List[ExistingProject] = Field(
        default_factory=list
    )


class SimilarProject(BaseModel):

    project_id: int

    title: str

    similarity_score: float


class InnovationSuggestion(BaseModel):

    title: str

    description: str

    icon: str


class TechnologyRecommendation(BaseModel):

    current: List[str]

    recommended: List[str]

    rationale: str


class RecommendationResponse(BaseModel):

    similarity: float

    originality: float

    innovation: float

    innovation_gap: float

    similar_projects: List[SimilarProject]

    suggestions: List[InnovationSuggestion]

    innovation_ideas: List[str]

    technology_recommendation: TechnologyRecommendation