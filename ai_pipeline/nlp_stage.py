try:
    import spacy
except ImportError:
    spacy = None

def extract_entities(text: str) -> list[dict]:
    """
    Extract named entities from text using spaCy.
    Args:
        text (str): Input text.
    Returns:
        list[dict]: List of entities with type and text.
    Note:
        This is a placeholder for more advanced metric extraction.
    """
    if not spacy:
        raise ImportError("spaCy is required for NLP. Please install it.")
    nlp = spacy.load('en_core_web_sm')
    doc = nlp(text)
    return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
