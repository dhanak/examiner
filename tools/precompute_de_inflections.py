#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "pip>=26.0.1",
#     "spacy>=3.8.11",
# ]
# ///
"""
Precompute German inflections for vocabulary-de.json.

Behavior:
- Attempts to use spaCy if available to analyze forms, but does not require it.
- Generates a JSON mapping of vocabulary IDs to inflection tables:
  - verbs: present (ich/du/er/wir/ihr/sie), preterite (same persons), past_participle
  - nouns: plural
- Writes output to /tmp/vocab_de_inflections.json

Run locally (no commit). If spaCy + model are available the script will use them for analysis; otherwise it falls back to heuristics.
"""

import json
import os
import re
import sys

VOCAB_PATH = os.path.join(os.getcwd(), "src", "data", "vocabulary-de.json")
OUT_PATH = "/tmp/vocab_de_inflections.json"


# Heuristic functions (simple, not comprehensive)
def strip_article(s):
    return re.sub(r"^(der|die|das)\s+", "", s, flags=re.I).strip()


def normalize(s):
    s = strip_article(str(s))
    s = s.lower()
    s = re.sub(r"[^a-zäöüß]", "", s)
    return s


# Small irregular tables for common verbs
IRREGULAR_PRESENT = {
    "sein": {
        "ich": "bin",
        "du": "bist",
        "er": "ist",
        "wir": "sind",
        "ihr": "seid",
        "sie": "sind",
    },
    "haben": {
        "ich": "habe",
        "du": "hast",
        "er": "hat",
        "wir": "haben",
        "ihr": "habt",
        "sie": "haben",
    },
    "werden": {
        "ich": "werde",
        "du": "wirst",
        "er": "wird",
        "wir": "werden",
        "ihr": "werdet",
        "sie": "werden",
    },
}
IRREGULAR_PAST = {
    "sein": {
        "ich": "war",
        "du": "warst",
        "er": "war",
        "wir": "waren",
        "ihr": "wart",
        "sie": "waren",
    },
    "haben": {
        "ich": "hatte",
        "du": "hattest",
        "er": "hatte",
        "wir": "hatten",
        "ihr": "hattet",
        "sie": "hatten",
    },
}
IRREGULAR_PARTICIPLE = {
    "sein": "gewesen",
    "haben": "gehabt",
    "werden": "geworden",
    "gehen": "gegangen",
    "lesen": "gelesen",
    "spielen": "gespielt",
    "machen": "gemacht",
    "sprechen": "gesprochen",
    "sehen": "gesehen",
    "nehmen": "genommen",
    "kommen": "gekommen",
    "trinken": "getrunken",
}

INSEPARABLE_PREFIXES = ("be", "emp", "ent", "er", "ver", "miss", "zer")


def conj_present(verb, person="er"):
    v = normalize(verb)
    if v in IRREGULAR_PRESENT:
        return IRREGULAR_PRESENT[v].get(person, IRREGULAR_PRESENT[v].get("er"))
    # naive stem
    stem = re.sub(r"(en|n)$", "", v)
    if stem.endswith(("t", "d")):
        if person == "du":
            return stem + "est"
        if person == "ich":
            return stem + "e"
        if person in ("er", "sie", "es"):
            return stem + "et"
        if person == "ihr":
            return stem + "et"
        return stem + "t"
    if person == "ich":
        return stem + "e"
    if person == "du":
        return stem + "st"
    if person in ("er", "sie", "es"):
        return stem + "t"
    if person == "wir":
        return v
    if person == "ihr":
        return stem + "t"
    return stem + "t"


def conj_preterite(verb, person="er"):
    v = normalize(verb)
    if v in IRREGULAR_PAST:
        return IRREGULAR_PAST[v].get(person, IRREGULAR_PAST[v].get("er"))
    stem = re.sub(r"(en|n)$", "", v)
    endings = {
        "ich": "te",
        "du": "test",
        "er": "te",
        "wir": "ten",
        "ihr": "tet",
        "sie": "ten",
    }
    return stem + endings.get(person, "te")


def past_participle(verb):
    v = normalize(verb)
    if v in IRREGULAR_PARTICIPLE:
        return IRREGULAR_PARTICIPLE[v]
    # inseparable prefixes -> no ge-
    for p in INSEPARABLE_PREFIXES:
        if v.startswith(p) and len(v) > len(p) + 1:
            stem = re.sub(r"(en|n)$", "", v)
            return stem + "t"
    stem = re.sub(r"(en|n)$", "", v)
    return "ge" + stem + "t"


def pluralize_noun(noun):
    s = strip_article(noun)
    s_norm = s.lower()
    # feminine -in -> -innen
    if s_norm.endswith("in") and len(s_norm) > 3:
        return s + "nen"
    if s.endswith("e"):
        return s + "n"
    if s.endswith(("er", "el", "en")):
        return s
    if len(s) <= 3:
        return s + "er"
    # default try -e and naive umlaut
    res = s + "e"
    res = res.replace("a", "ä").replace("o", "ö").replace("u", "ü")
    return res


# Try to optionally use spaCy to get lemmas/morph info
HAS_SPACY = False
try:
    import spacy
    from spacy.cli import download_module

    try:
        download_module.download("de_core_news_sm")
        nlp = spacy.load("de_core_news_sm")
        HAS_SPACY = True
    except Exception:
        # model not available
        nlp = None
        HAS_SPACY = False
except Exception:
    nlp = None
    HAS_SPACY = False

print("spaCy available:", HAS_SPACY)

# Load vocabulary
if not os.path.exists(VOCAB_PATH):
    print("Vocabulary file not found at", VOCAB_PATH)
    sys.exit(1)

with open(VOCAB_PATH, "r", encoding="utf-8") as f:
    vocab = json.load(f)

words = vocab.get("words") or []
print("Loaded", len(words), "words")

inflections = {}

for w in words:
    wid = w.get("id")
    word_txt = w.get("word")
    pos = w.get("partOfSpeech")
    entry = {"base": word_txt, "pos": pos}
    if pos == "verb":
        lemma = strip_article(word_txt)
        entry["present"] = {
            p: conj_present(lemma, p) for p in ["ich", "du", "er", "wir", "ihr", "sie"]
        }
        entry["preterite"] = {
            p: conj_preterite(lemma, p)
            for p in ["ich", "du", "er", "wir", "ihr", "sie"]
        }
        entry["past_participle"] = past_participle(lemma)
    elif pos == "noun":
        entry["plural"] = pluralize_noun(word_txt)
        entry["lemma"] = strip_article(word_txt)
    else:
        # adjectives/adverbs etc: keep base
        entry["lemma"] = strip_article(word_txt)
    inflections[wid] = entry

# Save output
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(
        {"meta": {"spaCy": HAS_SPACY}, "inflections": inflections},
        f,
        ensure_ascii=False,
        indent=2,
    )

print("Wrote inflections to", OUT_PATH)

# Print a small sample
sample_keys = list(inflections.keys())[:10]
for k in sample_keys:
    print(k, "->", inflections[k])

print(
    "\nDone. If you have spaCy and the German model installed, re-run and the script will report model availability. For production, consider precomputing additional case forms and irregular tables using a robust morphological tool (spaCy, pymorphy, or similar)."
)
