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

Usage as script:
  python tools/precompute_de_inflections.py

Usage as library:
  from precompute_de_inflections import precompute_inflections
  result = precompute_inflections(vocab_path, out_path)
"""

import json
import os
import re
import sys

VOCAB_PATH = os.path.join(os.getcwd(), "src", "data", "vocabulary-de.json")
OUT_PATH = os.path.join(os.getcwd(), "public", "data", "vocabulary-de-inflections.json")


def strip_article(s):
    """Strip German articles (der, die, das) from a string."""
    return re.sub(r"^(der|die|das)\s+", "", s, flags=re.I).strip()


def normalize(s):
    """Normalize a string for comparison: strip articles, lowercase, remove punctuation."""
    s = strip_article(str(s))
    s = s.lower()
    s = re.sub(r"[^a-zäöüß]", "", s)
    return s


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
    "gehen": {
        "ich": "gehe",
        "du": "gehst",
        "er": "geht",
        "wir": "gehen",
        "ihr": "geht",
        "sie": "gehen",
    },
    "sehen": {
        "ich": "sehe",
        "du": "siehst",
        "er": "sieht",
        "wir": "sehen",
        "ihr": "seht",
        "sie": "sehen",
    },
    "geben": {
        "ich": "gebe",
        "du": "gibst",
        "er": "gibt",
        "wir": "geben",
        "ihr": "gebt",
        "sie": "geben",
    },
    "nehmen": {
        "ich": "nehme",
        "du": "nimmst",
        "er": "nimmt",
        "wir": "nehmen",
        "ihr": "nehmt",
        "sie": "nehmen",
    },
    "sprechen": {
        "ich": "spreche",
        "du": "sprichst",
        "er": "spricht",
        "wir": "sprechen",
        "ihr": "sprecht",
        "sie": "sprechen",
    },
    "treffen": {
        "ich": "treffe",
        "du": "triffst",
        "er": "trifft",
        "wir": "treffen",
        "ihr": "trefft",
        "sie": "treffen",
    },
    "essen": {
        "ich": "esse",
        "du": "isst",
        "er": "isst",
        "wir": "essen",
        "ihr": "esst",
        "sie": "essen",
    },
    "vergessen": {
        "ich": "vergesse",
        "du": "vergisst",
        "er": "vergisst",
        "wir": "vergessen",
        "ihr": "vergesst",
        "sie": "vergessen",
    },
    "helfen": {
        "ich": "helfe",
        "du": "hilfst",
        "er": "hilft",
        "wir": "helfen",
        "ihr": "helft",
        "sie": "helfen",
    },
    "tragen": {
        "ich": "trage",
        "du": "trägst",
        "er": "trägt",
        "wir": "tragen",
        "ihr": "tragt",
        "sie": "tragen",
    },
    "fallen": {
        "ich": "falle",
        "du": "fällst",
        "er": "fällt",
        "wir": "fallen",
        "ihr": "fallt",
        "sie": "fallen",
    },
    "halten": {
        "ich": "halte",
        "du": "hältst",
        "er": "hält",
        "wir": "halten",
        "ihr": "haltet",
        "sie": "halten",
    },
    "lassen": {
        "ich": "lasse",
        "du": "lässt",
        "er": "lässt",
        "wir": "lassen",
        "ihr": "lasst",
        "sie": "lassen",
    },
    "laufen": {
        "ich": "laufe",
        "du": "läufst",
        "er": "läuft",
        "wir": "laufen",
        "ihr": "lauft",
        "sie": "laufen",
    },
    "fahren": {
        "ich": "fahre",
        "du": "fährst",
        "er": "fährt",
        "wir": "fahren",
        "ihr": "fahrt",
        "sie": "fahren",
    },
    "tragen": {
        "ich": "trage",
        "du": "trägst",
        "er": "trägt",
        "wir": "tragen",
        "ihr": "tragt",
        "sie": "tragen",
    },
    "schlafen": {
        "ich": "schlafe",
        "du": "schläfst",
        "er": "schläft",
        "wir": "schlafen",
        "ihr": "schlaft",
        "sie": "schlafen",
    },
    "wissen": {
        "ich": "weiß",
        "du": "weißt",
        "er": "weiß",
        "wir": "wissen",
        "ihr": "wisst",
        "sie": "wissen",
    },
    "wollen": {
        "ich": "will",
        "du": "willst",
        "er": "will",
        "wir": "wollen",
        "ihr": "wollt",
        "sie": "wollen",
    },
    "sollen": {
        "ich": "soll",
        "du": "sollst",
        "er": "soll",
        "wir": "sollen",
        "ihr": "sollt",
        "sie": "sollen",
    },
    "können": {
        "ich": "kann",
        "du": "kannst",
        "er": "kann",
        "wir": "können",
        "ihr": "könnt",
        "sie": "können",
    },
    "müssen": {
        "ich": "muss",
        "du": "musst",
        "er": "muss",
        "wir": "müssen",
        "ihr": "müsst",
        "sie": "müssen",
    },
    "dürfen": {
        "ich": "darf",
        "du": "darfst",
        "er": "darf",
        "wir": "dürfen",
        "ihr": "dürft",
        "sie": "dürfen",
    },
    "mögen": {
        "ich": "mag",
        "du": "magst",
        "er": "mag",
        "wir": "mögen",
        "ihr": "mögt",
        "sie": "mögen",
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
    "werden": {
        "ich": "wurde",
        "du": "wurdest",
        "er": "wurde",
        "wir": "wurden",
        "ihr": "wurdet",
        "sie": "wurden",
    },
    "gehen": {
        "ich": "ging",
        "du": "gingst",
        "er": "ging",
        "wir": "gingen",
        "ihr": "gingt",
        "sie": "gingen",
    },
    "sehen": {
        "ich": "sah",
        "du": "sahst",
        "er": "sah",
        "wir": "sahen",
        "ihr": "saht",
        "sie": "sahen",
    },
    "geben": {
        "ich": "gab",
        "du": "gabst",
        "er": "gab",
        "wir": "gaben",
        "ihr": "gabt",
        "sie": "gaben",
    },
    "nehmen": {
        "ich": "nahm",
        "du": "nahmst",
        "er": "nahm",
        "wir": "nahmen",
        "ihr": "nahmt",
        "sie": "nahmen",
    },
    "sprechen": {
        "ich": "sprach",
        "du": "sprachst",
        "er": "sprach",
        "wir": "sprachen",
        "ihr": "spracht",
        "sie": "sprachen",
    },
    "treffen": {
        "ich": "traf",
        "du": "trafst",
        "er": "traf",
        "wir": "trafen",
        "ihr": "traft",
        "sie": "trafen",
    },
    "essen": {
        "ich": "aß",
        "du": "aßest",
        "er": "aß",
        "wir": "aßen",
        "ihr": "aßet",
        "sie": "aßen",
    },
    "vergessen": {
        "ich": "vergaß",
        "du": "vergaßt",
        "er": "vergaß",
        "wir": "vergaßen",
        "ihr": "vergaßt",
        "sie": "vergaßen",
    },
    "helfen": {
        "ich": "half",
        "du": "halfst",
        "er": "half",
        "wir": "halfen",
        "ihr": "halft",
        "sie": "halfen",
    },
    "tragen": {
        "ich": "trug",
        "du": "trugst",
        "er": "trug",
        "wir": "trugen",
        "ihr": "trugt",
        "sie": "trugen",
    },
    "fall": {
        "ich": "fiel",
        "du": "fielst",
        "er": "fiel",
        "wir": "fielen",
        "ihr": "fielt",
        "sie": "fielen",
    },
    "halten": {
        "ich": "hielt",
        "du": "hieltest",
        "er": "hielt",
        "wir": "hielten",
        "ihr": "hieltet",
        "sie": "hielten",
    },
    "lassen": {
        "ich": "ließ",
        "du": "ließest",
        "er": "ließ",
        "wir": "ließen",
        "ihr": "ließet",
        "sie": "ließen",
    },
    "laufen": {
        "ich": "lief",
        "du": "liefst",
        "er": "lief",
        "wir": "liefen",
        "ihr": "lieft",
        "sie": "liefen",
    },
    "fahren": {
        "ich": "fuhr",
        "du": "fuhrst",
        "er": "fuhr",
        "wir": "fuhren",
        "ihr": "fuhrt",
        "sie": "fuhren",
    },
    "schlafen": {
        "ich": "schlief",
        "du": "schliefst",
        "er": "schlief",
        "wir": "schliefen",
        "ihr": "schlieft",
        "sie": "schliefen",
    },
    "wissen": {
        "ich": "wusste",
        "du": "wusstest",
        "er": "wusste",
        "wir": "wussten",
        "ihr": "wusstet",
        "sie": "wussten",
    },
    "wollen": {
        "ich": "wollte",
        "du": "wolltest",
        "er": "wollte",
        "wir": "wollten",
        "ihr": "wolltet",
        "sie": "wollten",
    },
    "sollen": {
        "ich": "sollte",
        "du": "solltest",
        "er": "sollte",
        "wir": "sollten",
        "ihr": "solltet",
        "sie": "sollten",
    },
    "können": {
        "ich": "konnte",
        "du": "konntest",
        "er": "konnte",
        "wir": "konnten",
        "ihr": "konntet",
        "sie": "konnten",
    },
    "müssen": {
        "ich": "musste",
        "du": "musstest",
        "er": "musste",
        "wir": "mussten",
        "ihr": "musstet",
        "sie": "mussten",
    },
    "dürfen": {
        "ich": "durfte",
        "du": "durftest",
        "er": "durfte",
        "wir": "durften",
        "ihr": "durftet",
        "sie": "durften",
    },
    "mögen": {
        "ich": "mochte",
        "du": "mochtest",
        "er": "mochte",
        "wir": "mochten",
        "ihr": "mochtet",
        "sie": "mochten",
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
    "geben": "gegeben",
    "helfen": "geholfen",
    "treffen": "getroffen",
    "essen": "gegessen",
    "vergessen": "vergessen",
    "laufen": "gelaufen",
    "fahren": "gefahren",
    "tragen": "getragen",
    "fallen": "gefallen",
    "halten": "gehalten",
    "lassen": "gelassen",
    "schlafen": "geschlafen",
    "wissen": "gewusst",
    "wollen": "gewollt",
    "sollen": "gesollt",
    "können": "gekonnt",
    "müssen": "gemusst",
    "dürfen": "gedurft",
    "mögen": "gemocht",
}

INSEPARABLE_PREFIXES = ("be", "emp", "ent", "er", "ver", "miss", "zer")


def conj_present(verb, person="er"):
    """Conjugate verb in present tense."""
    v = normalize(verb)
    if v in IRREGULAR_PRESENT:
        return IRREGULAR_PRESENT[v].get(person, IRREGULAR_PRESENT[v].get("er"))
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
    """Conjugate verb in preterite (simple past) tense."""
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
    """Generate past participle of a verb."""
    v = normalize(verb)
    if v in IRREGULAR_PARTICIPLE:
        return IRREGULAR_PARTICIPLE[v]
    for p in INSEPARABLE_PREFIXES:
        if v.startswith(p) and len(v) > len(p) + 1:
            stem = re.sub(r"(en|n)$", "", v)
            return stem + "t"
    stem = re.sub(r"(en|n)$", "", v)
    return "ge" + stem + "t"


def pluralize_noun(noun):
    """Generate plural form of a noun."""
    s = strip_article(noun)
    s_norm = s.lower()
    if s_norm.endswith("in") and len(s_norm) > 3:
        return s + "nen"
    if s.endswith("e"):
        return s + "n"
    if s.endswith(("er", "el", "en")):
        return s
    if len(s) <= 3:
        return s + "er"
    res = s + "e"
    res = res.replace("a", "ä").replace("o", "ö").replace("u", "ü")
    return res


def precompute_inflections(vocab_path, out_path):
    """Main function to precompute inflections from vocabulary."""
    # Load spaCy if available
    HAS_SPACY = False
    nlp = None
    try:
        import spacy
        from spacy.cli import download_module

        try:
            download_module.download("de_core_news_sm")
            nlp = spacy.load("de_core_news_sm")
            HAS_SPACY = True
        except Exception:
            pass
    except Exception:
        pass

    print("spaCy available:", HAS_SPACY)

    # Load vocabulary
    if not os.path.exists(vocab_path):
        print("Vocabulary file not found at", vocab_path)
        return None

    with open(vocab_path, "r", encoding="utf-8") as f:
        vocab = json.load(f)

    words = vocab.get("words") or []
    print("Loaded", len(words), "words")

    inflections = {}

    # Generate inflections for each vocabulary word
    for w in words:
        wid = w.get("id")
        word_txt = w.get("word")
        pos = w.get("partOfSpeech")
        entry = {"base": word_txt, "pos": pos}
        if pos == "verb":
            lemma = strip_article(word_txt)
            entry["present"] = {
                p: conj_present(lemma, p)
                for p in ["ich", "du", "er", "wir", "ihr", "sie"]
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
            entry["lemma"] = strip_article(word_txt)
        inflections[wid] = entry
        try:
            norm_key = normalize(strip_article(word_txt))
            if norm_key and norm_key not in inflections:
                inflections[norm_key] = entry
        except Exception:
            pass

    # Collect observed forms from example sentences
    observed = {}

    for w in words:
        example = w.get("example") or ""
        if not example or not HAS_SPACY or not nlp:
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

            # Extract features
            feats = tok.morph.to_dict() if tok.morph else {}
            form_key = tok.text  # Deduplicate by form text only

            # Initialize or add to observed
            if lemma_key not in observed:
                observed[lemma_key] = {
                    "forms": {},
                    "pos": p,
                    "lemma": tok.lemma_ or tok.text,
                }

            # Merge features for same form: if seen before, append case/number info
            if form_key not in observed[lemma_key]["forms"]:
                observed[lemma_key]["forms"][form_key] = {
                    "form": tok.text,
                    "features": [feats],
                }
            else:
                observed[lemma_key]["forms"][form_key]["features"].append(feats)

    # Merge observed forms and detect irregulars
    irregular = {"verbs": {}, "nouns": {}}

    for lemma_key, data in observed.items():
        forms_dict = data["forms"]
        pos = data["pos"]
        lemma = data["lemma"]

        # Flatten forms_dict and deduplicate feature sets per form
        forms_list = []
        for form_key, form_data in forms_dict.items():
            feats_list = form_data["features"]
            # Deduplicate feature dicts for this form
            seen_feats = set()
            unique_feats = []
            for feats in feats_list:
                feats_json = json.dumps(feats, sort_keys=True, ensure_ascii=False)
                if feats_json not in seen_feats:
                    seen_feats.add(feats_json)
                    unique_feats.append(feats)
            # Use first feature set (or merge?) for detection; store one entry with first feats
            if unique_feats:
                forms_list.append({"form": form_key, "features": unique_feats[0]})

        # Get or create entry
        entry = inflections.get(lemma_key)
        if not entry:
            entry = {"base": lemma, "pos": pos, "lemma": lemma}
            if pos == "verb":
                entry["present"] = {
                    p: conj_present(lemma, p)
                    for p in ["ich", "du", "er", "wir", "ihr", "sie"]
                }
                entry["preterite"] = {
                    p: conj_preterite(lemma, p)
                    for p in ["ich", "du", "er", "wir", "ihr", "sie"]
                }
                entry["past_participle"] = past_participle(lemma)
            elif pos == "noun":
                entry["plural"] = pluralize_noun(lemma)
            inflections[lemma_key] = entry

        entry["observed"] = forms_list

        # Detect irregulars using spaCy morphological features
        if pos == "verb":
            gen_present = entry.get("present", {})
            gen_pret = entry.get("preterite", {})
            gen_part = entry.get("past_participle")

            for obs in forms_list:
                feats = obs.get("features", {})
                form_norm = normalize(obs["form"])

                # Map spaCy Person (1/2/3) + Number (Sing/Plur) to our persons
                person_val = feats.get("Person", "3")
                number_val = feats.get("Number", "Sing")
                person_map = {
                    ("1", "Sing"): "ich",
                    ("2", "Sing"): "du",
                    ("3", "Sing"): "er",
                    ("1", "Plur"): "wir",
                    ("2", "Plur"): "ihr",
                    ("3", "Plur"): "sie",
                }
                person = person_map.get((person_val, number_val), "er")

                # Present tense
                if feats.get("Tense") == "Pres":
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
                num = feats.get("Number")

                # Plural
                if num == "Plur" and gen_plural:
                    form_norm = normalize(obs["form"])
                    if normalize(gen_plural) != form_norm:
                        irregular["nouns"].setdefault(lemma_key, {})["plural"] = obs[
                            "form"
                        ]
                        entry["plural"] = obs["form"]

    # Add metadata
    if irregular["verbs"] or irregular["nouns"]:
        inflections["__meta"] = {"irregular": irregular}

    # Write output
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(
            {"meta": {"spaCy": HAS_SPACY}, "inflections": inflections},
            f,
            ensure_ascii=False,
            indent=2,
        )

    print("Wrote inflections to", out_path)


def main():
    """CLI entry point."""
    precompute_inflections(VOCAB_PATH, OUT_PATH)


if __name__ == "__main__":
    main()
