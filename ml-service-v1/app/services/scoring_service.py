def calculate_scores(
    maximum_similarity: float,
    technology_count: int,
    description_length: int,
    recommended_technology_count: int
):

    similarity = round(
        maximum_similarity,
        2
    )

    originality = round(
        max(
            0,
            100 - similarity
        ),
        2
    )

    # Description score
    if description_length >= 500:
        description_score = 100

    elif description_length >= 300:
        description_score = 80

    elif description_length >= 150:
        description_score = 60

    elif description_length >= 100:
        description_score = 40

    else:
        description_score = 20

    # Technology score
    technology_score = min(
        technology_count * 15,
        100
    )

    # Technology expansion score
    technology_gap_score = min(
        recommended_technology_count * 20,
        100
    )

    innovation = round(
        (
            originality * 0.50
            +
            description_score * 0.20
            +
            technology_score * 0.20
            +
            technology_gap_score * 0.10
        ),
        2
    )

    innovation_gap = round(
        (
            originality * 0.60
            +
            technology_gap_score * 0.20
            +
            description_score * 0.20
        ),
        2
    )

    return {
        "similarity": similarity,
        "originality": originality,
        "innovation": innovation,
        "innovation_gap": innovation_gap
    }
