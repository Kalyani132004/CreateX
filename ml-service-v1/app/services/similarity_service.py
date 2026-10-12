from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ..schemas import ExistingProject
from ..utils.text_utils import build_project_text


def find_similar_projects(
    new_project_text: str,
    existing_projects: list[ExistingProject],
    max_results: int = 5
):

    if not existing_projects:
        return []

    existing_texts = []

    for project in existing_projects:

        text = build_project_text(
            title=project.title,
            description=project.description,
            domain=project.domain,
            technologies=project.technologies
        )

        existing_texts.append(
            text
        )

    documents = [
        new_project_text
    ] + existing_texts

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    matrix = vectorizer.fit_transform(
        documents
    )

    # cosine similarity between the new project (row 0)
    # and every existing project (rows 1...)
    scores = cosine_similarity(
        matrix[0],
        matrix[1:]
    )[0]

    results = []

    for index, score in enumerate(scores):

        project = existing_projects[index]

        results.append(
            {
                "project_id": project.id,
                "title": project.title,
                "similarity_score": round(
                    float(score) * 100,
                    2
                )
            }
        )

    results.sort(
        key=lambda item: item["similarity_score"],
        reverse=True
    )

    return results[:max_results]
