#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "pip>=26.0.1",
#     "spacy>=3.8.11",
# ]
# ///
"""Precompute English inflections for vocabulary-en.json.

Usage as script:
  python tools/precompute_en_inflections.py

Usage as library:
  from precompute_en_inflections import precompute_inflections
  result = precompute_inflections(vocab_path, out_path)
"""

import json
import os
import re

VOCAB_PATH = os.path.join(os.getcwd(), "src", "data", "vocabulary-en.json")
OUT_PATH = os.path.join(os.getcwd(), "public", "data", "vocabulary-en-inflections.json")

DETERMINERS = ("the", "a", "an")
VOWELS = "aeiou"

IRREGULAR_VERBS = {
    "be": {
        "present": {"I": "am", "you": "are", "he": "is", "we": "are", "they": "are"},
        "preterite": {
            "I": "was",
            "you": "were",
            "he": "was",
            "we": "were",
            "they": "were",
        },
        "past_participle": "been",
    },
    "have": {
        "present": {
            "I": "have",
            "you": "have",
            "he": "has",
            "we": "have",
            "they": "have",
        },
        "preterite": {
            "I": "had",
            "you": "had",
            "he": "had",
            "we": "had",
            "they": "had",
        },
        "past_participle": "had",
    },
    "do": {
        "present": {"I": "do", "you": "do", "he": "does", "we": "do", "they": "do"},
        "preterite": {
            "I": "did",
            "you": "did",
            "he": "did",
            "we": "did",
            "they": "did",
        },
        "past_participle": "done",
    },
    "go": {
        "present": {"I": "go", "you": "go", "he": "goes", "we": "go", "they": "go"},
        "preterite": {
            "I": "went",
            "you": "went",
            "he": "went",
            "we": "went",
            "they": "went",
        },
        "past_participle": "gone",
    },
    "say": {
        "present": {"I": "say", "you": "say", "he": "says", "we": "say", "they": "say"},
        "preterite": {
            "I": "said",
            "you": "said",
            "he": "said",
            "we": "said",
            "they": "said",
        },
        "past_participle": "said",
    },
    "make": {
        "present": {
            "I": "make",
            "you": "make",
            "he": "makes",
            "we": "make",
            "they": "make",
        },
        "preterite": {
            "I": "made",
            "you": "made",
            "he": "made",
            "we": "made",
            "they": "made",
        },
        "past_participle": "made",
    },
    "know": {
        "present": {
            "I": "know",
            "you": "know",
            "he": "knows",
            "we": "know",
            "they": "know",
        },
        "preterite": {
            "I": "knew",
            "you": "knew",
            "he": "knew",
            "we": "knew",
            "they": "knew",
        },
        "past_participle": "known",
    },
    "think": {
        "present": {
            "I": "think",
            "you": "think",
            "he": "thinks",
            "we": "think",
            "they": "think",
        },
        "preterite": {
            "I": "thought",
            "you": "thought",
            "he": "thought",
            "we": "thought",
            "they": "thought",
        },
        "past_participle": "thought",
    },
    "take": {
        "present": {
            "I": "take",
            "you": "take",
            "he": "takes",
            "we": "take",
            "they": "take",
        },
        "preterite": {
            "I": "took",
            "you": "took",
            "he": "took",
            "we": "took",
            "they": "took",
        },
        "past_participle": "taken",
    },
    "see": {
        "present": {"I": "see", "you": "see", "he": "sees", "we": "see", "they": "see"},
        "preterite": {
            "I": "saw",
            "you": "saw",
            "he": "saw",
            "we": "saw",
            "they": "saw",
        },
        "past_participle": "seen",
    },
    "come": {
        "present": {
            "I": "come",
            "you": "come",
            "he": "comes",
            "we": "come",
            "they": "come",
        },
        "preterite": {
            "I": "came",
            "you": "came",
            "he": "came",
            "we": "came",
            "they": "came",
        },
        "past_participle": "come",
    },
    "write": {
        "present": {
            "I": "write",
            "you": "write",
            "he": "writes",
            "we": "write",
            "they": "write",
        },
        "preterite": {
            "I": "wrote",
            "you": "wrote",
            "he": "wrote",
            "we": "wrote",
            "they": "wrote",
        },
        "past_participle": "written",
    },
    "eat": {
        "present": {"I": "eat", "you": "eat", "he": "eats", "we": "eat", "they": "eat"},
        "preterite": {
            "I": "ate",
            "you": "ate",
            "he": "ate",
            "we": "ate",
            "they": "ate",
        },
        "past_participle": "eaten",
    },
    "run": {
        "present": {"I": "run", "you": "run", "he": "runs", "we": "run", "they": "run"},
        "preterite": {
            "I": "ran",
            "you": "ran",
            "he": "ran",
            "we": "ran",
            "they": "ran",
        },
        "past_participle": "run",
    },
    "give": {
        "present": {
            "I": "give",
            "you": "give",
            "he": "gives",
            "we": "give",
            "they": "give",
        },
        "preterite": {
            "I": "gave",
            "you": "gave",
            "he": "gave",
            "we": "gave",
            "they": "gave",
        },
        "past_participle": "given",
    },
    "bring": {
        "present": {
            "I": "bring",
            "you": "bring",
            "he": "brings",
            "we": "bring",
            "they": "bring",
        },
        "preterite": {
            "I": "brought",
            "you": "brought",
            "he": "brought",
            "we": "brought",
            "they": "brought",
        },
        "past_participle": "brought",
    },
    "buy": {
        "present": {"I": "buy", "you": "buy", "he": "buys", "we": "buy", "they": "buy"},
        "preterite": {
            "I": "bought",
            "you": "bought",
            "he": "bought",
            "we": "bought",
            "they": "bought",
        },
        "past_participle": "bought",
    },
    "feel": {
        "present": {
            "I": "feel",
            "you": "feel",
            "he": "feels",
            "we": "feel",
            "they": "feel",
        },
        "preterite": {
            "I": "felt",
            "you": "felt",
            "he": "felt",
            "we": "felt",
            "they": "felt",
        },
        "past_participle": "felt",
    },
}

IRREGULAR_NOUNS = {
    "man": "men",
    "woman": "women",
    "child": "children",
    "person": "people",
    "mouse": "mice",
    "goose": "geese",
    "foot": "feet",
    "tooth": "teeth",
    "ox": "oxen",
}

PERSON_KEYS = ["I", "you", "he", "we", "they"]


def strip_determiner(text):
    """Strip English articles (the, a, an) from text."""
    text = text or ""
    stripped = text.strip()
    for det in DETERMINERS:
        if stripped.lower().startswith(f"{det} "):
            return stripped[len(det) + 1 :].strip()
    return stripped


def normalize(text):
    """Normalize text: strip articles, lowercase, remove punctuation."""
    if not text:
        return ""
    return re.sub(r"[^a-z]", "", strip_determiner(text).lower())


def add_third_person_s(base):
    """Add -s or -es for third person singular present."""
    if base.endswith("y") and len(base) > 1 and base[-2] not in VOWELS:
        return base[:-1] + "ies"
    if base.endswith(("o", "ch", "s", "sh", "x", "z")):
        return base + "es"
    return base + "s"


def conj_present(verb, person="he"):
    """Conjugate verb in present tense."""
    base = normalize(verb)
    info = IRREGULAR_VERBS.get(base, {})
    if info.get("present"):
        return info["present"].get(
            person, base if person != "he" else add_third_person_s(base)
        )
    if person == "he":
        return add_third_person_s(base)
    return base


def conj_preterite(verb, person=None):
    """Conjugate verb in past tense."""
    base = normalize(verb)
    info = IRREGULAR_VERBS.get(base, {})
    preterite = info.get("preterite")
    if preterite:
        return preterite.get(person, preterite.get("I", base + "ed"))
    if base.endswith("e"):
        return base + "d"
    if base.endswith("y") and len(base) > 1 and base[-2] not in VOWELS:
        return base[:-1] + "ied"
    if (
        len(base) >= 3
        and base[-1] not in VOWELS
        and base[-2] in VOWELS
        and base[-3] not in VOWELS
    ):
        return base + base[-1] + "ed"
    return base + "ed"


def past_participle(verb):
    """Generate past participle of verb."""
    base = normalize(verb)
    info = IRREGULAR_VERBS.get(base, {})
    if info.get("past_participle"):
        return info["past_participle"]
    return conj_preterite(verb)


def pluralize_noun(noun):
    """Generate plural form of noun."""
    base = strip_determiner(noun)
    norm = normalize(base)
    if norm in IRREGULAR_NOUNS:
        return IRREGULAR_NOUNS[norm]
    if base.endswith("y") and len(base) > 1 and base[-2].lower() not in VOWELS:
        return base[:-1] + "ies"
    if base.endswith(("s", "sh", "ch", "x", "z")):
        return base + "es"
    return base + "s"


def load_spacy():
    """Load spaCy English model if available."""
    try:
        import spacy
        from spacy.cli import download as download_module

        try:
            download_module("en_core_web_sm")
        except Exception:
            pass
        nlp = spacy.load("en_core_web_sm")
        return True, nlp
    except Exception:
        return False, None


def map_person_number(person, number):
    """Map spaCy Person/Number to English person key."""
    if person == "1" and number == "Sing":
        return "I"
    if person == "1" and number == "Plur":
        return "we"
    if person == "2":
        return "you"
    if person == "3" and number == "Plur":
        return "they"
    return "he"


def flatten_forms(forms_dict):
    """Deduplicate forms by flattening feature lists."""
    forms_list = []
    for form_key, data in forms_dict.items():
        feats_seen = set()
        unique_feats = []
        for feats in data["features"]:
            feats_json = json.dumps(feats, sort_keys=True, ensure_ascii=False)
            if feats_json not in feats_seen:
                feats_seen.add(feats_json)
                unique_feats.append(feats)
        if unique_feats:
            forms_list.append({"form": data["form"], "features": unique_feats[0]})
    return forms_list


def precompute_inflections(vocab_path, out_path):
    """Main function to precompute inflections from vocabulary."""
    has_spacy, nlp = load_spacy()
    print("spaCy available:", has_spacy)

    if not os.path.exists(vocab_path):
        print("Vocabulary file not found:", vocab_path)
        return None

    with open(vocab_path, "r", encoding="utf-8") as fh:
        vocab = json.load(fh)

    words = vocab.get("words") or []
    print("Loaded", len(words), "English vocabulary entries")

    inflections = {}

    # Generate inflections for each vocabulary word
    for w in words:
        wid = w.get("id")
        word_txt = w.get("word") or ""
        pos = w.get("partOfSpeech")
        lemma = strip_determiner(word_txt)
        if not wid or not word_txt:
            continue

        entry = {"base": word_txt, "pos": pos, "lemma": lemma}

        if pos == "verb":
            entry["present"] = {p: conj_present(word_txt, p) for p in PERSON_KEYS}
            entry["preterite"] = {p: conj_preterite(word_txt, p) for p in PERSON_KEYS}
            entry["past_participle"] = past_participle(word_txt)
        elif pos == "noun":
            entry["plural"] = pluralize_noun(word_txt)

        inflections[wid] = entry
        norm_key = normalize(lemma)
        if norm_key and norm_key not in inflections:
            inflections[norm_key] = entry

    # Collect observed forms from example sentences
    observed = {}

    for w in words:
        example = w.get("example") or ""
        if not example or not has_spacy or not nlp:
            continue

        doc = nlp(example)
        for tok in doc:
            if not tok.is_alpha:
                continue

            # Map spaCy POS
            if tok.pos_ == "VERB":
                p = "verb"
            elif tok.pos_ == "NOUN":
                p = "noun"
            elif tok.pos_ == "ADJ":
                p = "adjective"
            else:
                continue

            lemma_key = normalize(tok.lemma_ or tok.text)
            if not lemma_key:
                continue

            feats = tok.morph.to_dict() if tok.morph else {}
            form_key = tok.text

            if lemma_key not in observed:
                observed[lemma_key] = {
                    "forms": {},
                    "pos": p,
                    "lemma": tok.lemma_ or tok.text,
                }

            forms = observed[lemma_key]["forms"]
            if form_key not in forms:
                forms[form_key] = {"form": tok.text, "features": [feats]}
            else:
                forms[form_key]["features"].append(feats)

    # Merge observed forms and detect irregulars
    irregular = {"verbs": {}, "nouns": {}}

    for lemma_key, data in observed.items():
        forms_list = flatten_forms(data["forms"])
        pos = data["pos"]
        lemma = data["lemma"]

        entry = inflections.get(lemma_key)
        if not entry:
            entry = {"base": lemma, "pos": pos, "lemma": lemma}
            if pos == "verb":
                entry["present"] = {p: conj_present(lemma, p) for p in PERSON_KEYS}
                entry["preterite"] = {p: conj_preterite(lemma, p) for p in PERSON_KEYS}
                entry["past_participle"] = past_participle(lemma)
            elif pos == "noun":
                entry["plural"] = pluralize_noun(lemma)
            inflections[lemma_key] = entry

        entry["observed"] = forms_list

        if pos == "verb":
            gen_present = entry.get("present", {})
            gen_pret = entry.get("preterite", {})
            gen_part = entry.get("past_participle")

            for obs in forms_list:
                feats = obs.get("features", {})
                person = map_person_number(feats.get("Person"), feats.get("Number"))
                form_norm = normalize(obs["form"])

                # Present tense (exclude gerunds and participles)
                if feats.get("Tense") == "Pres" and feats.get("VerbForm") != "Ger" and feats.get("VerbForm") != "Part":
                    gen_form = gen_present.get(person)
                    if gen_form and normalize(gen_form) != form_norm:
                        irregular["verbs"].setdefault(lemma_key, {}).setdefault(
                            "present", {}
                        )[person] = obs["form"]
                        entry["present"][person] = obs["form"]

                # Past tense
                elif feats.get("Tense") == "Past" and feats.get("VerbForm") != "Part":
                    gen_form = gen_pret.get(person)
                    if gen_form and normalize(gen_form) != form_norm:
                        irregular["verbs"].setdefault(lemma_key, {}).setdefault(
                            "preterite", {}
                        )[person] = obs["form"]
                        entry["preterite"][person] = obs["form"]

                # Past participle
                elif feats.get("VerbForm") == "Part":
                    if gen_part and normalize(gen_part) != form_norm:
                        irregular["verbs"].setdefault(lemma_key, {})[
                            "past_participle"
                        ] = obs["form"]
                        entry["past_participle"] = obs["form"]

        elif pos == "noun":
            gen_plural = entry.get("plural", "")
            for obs in forms_list:
                feats = obs.get("features", {})
                if feats.get("Number") == "Plur" and gen_plural:
                    if normalize(gen_plural) != normalize(obs["form"]):
                        irregular["nouns"].setdefault(lemma_key, {})["plural"] = obs[
                            "form"
                        ]
                        entry["plural"] = obs["form"]

    # Add metadata
    if irregular["verbs"] or irregular["nouns"]:
        inflections["__meta"] = {"irregular": irregular}

    # Write output
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(
            {"meta": {"spaCy": has_spacy}, "inflections": inflections},
            fh,
            ensure_ascii=False,
            indent=2,
        )

    print("Wrote English inflections to", out_path)
    return inflections


def main():
    """CLI entry point."""
    precompute_inflections(VOCAB_PATH, OUT_PATH)


if __name__ == "__main__":
    main()
