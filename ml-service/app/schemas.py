"""
RECONSTRUCTED from how the code uses these models. If you already have a
schemas.py, keep yours and only add the optional `id` field to ProjectInput
(needed so a project being re-analysed can exclude itself).
"""
from typing import List, Optional, Union

from pydantic import BaseModel, Field

ProjectId = Union[int, str]


class ExistingProject(BaseModel):
    id: ProjectId
    title: str = ""
    description: str = ""
    domain: str = ""
    technologies: List[str] = Field(default_factory=list)


class ProjectInput(BaseModel):
    id: Optional[ProjectId] = None  # id of the project being analysed, if it already exists
    title: str = ""
    description: Optional[str] = ""
    domain: str = ""
    technologies: List[str] = Field(default_factory=list)
    existing_projects: List[ExistingProject] = Field(default_factory=list)


class SimilarProject(BaseModel):
    project_id: ProjectId
    title: str
    similarity_score: float


class Suggestion(BaseModel):
    title: str
    description: str
    icon: str = ""


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
    suggestions: List[Suggestion]
    innovation_ideas: List[str]
    technology_recommendation: TechnologyRecommendation
