"""
RECONSTRUCTED. similarity_service no longer calls this (it builds its own
title+description text), so it is kept only for backwards compatibility.
Keep your own version if you have one.
"""


def build_project_text(title="", description="", domain="", technologies=None):
    parts = [title or "", description or "", domain or "", " ".join(technologies or [])]
    return " ".join(p for p in parts if p).lower()
