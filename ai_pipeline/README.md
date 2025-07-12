# AI Pipeline Modules

This directory contains modular stages for the multi-stage AI extraction pipeline:

- ocr_stage.py: OCR and image-to-text conversion (Tesseract, Google Vision API)
- nlp_stage.py: NLP-based entity and metric extraction (spaCy, NLTK)
- llm_stage.py: LLM-based context understanding, validation, and structuring (Gemini, GPT)

Each stage is designed to be independently testable and reusable.
