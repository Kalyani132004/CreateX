import re


def clean_text(text: str) -> str:

    if not text:
        return ""

    text = text.lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


def build_project_text(
    title: str,
    description: str,
    domain: str,
    technologies: list[str]
) -> str:

    technology_text = " ".join(
        technologies
    )

    combined_text = " ".join(
        [
            title,
            description,
            domain,
            technology_text
        ]
    )

    return clean_text(
        combined_text
    )