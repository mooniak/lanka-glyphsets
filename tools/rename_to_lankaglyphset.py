# MENU: Scripts > LankaGlyphset > Rename glyphs to LankaGlyphset names
# -*- coding: utf-8 -*-
"""
Rename AbhayaLibre glyphs to LankaGlyphset names  (Glyphs.app macro)
====================================================================

Run this from the Glyphs.app **Macro panel** (Window > Macro Panel) with the
AbhayaLibre font open and frontmost, OR copy it into Scripts folder.

What it does
------------
For every glyph in the frontmost font it computes the corresponding
LankaGlyphset name following the project naming standard (README), renames the
glyph, and writes a full report next to the font file. Both Sinhala (-sinh) and
Tamil (-taml) glyphs are converted. Sinhala names are validated against the
canonical YAML set; Tamil has no canonical set yet, so Tamil names are not
validated (in_standard = "n/a").

Glyphs whose new name is NOT an enumerated canonical name (from the YAML
glyphsets) are still renamed by rule, but FLAGGED in the report. Glyphs whose
rule is genuinely ambiguous (e.g. pre-base repha clusters handled via GPOS) are
LEFT UNTOUCHED and listed under "ambiguous" so you can decide manually.

Safety
------
DRY_RUN = True  ->  nothing is renamed; the report is still written so you can
                    review every proposed change first.
Set DRY_RUN = False to actually apply the renames.
"""
import os, datetime

# ===================== CONFIG =====================
DRY_RUN = True          # set to False to actually rename glyphs
UPDATE_FEATURES = True  # also rewrite OT feature code, classes & prefixes
REPORT_PATH = None      # None -> auto (next to the .glyphs file, else Desktop)
# ==================================================

import re

# ---- consonant inventory (base form ends in trailing 'a') -------------------
# Used to strip the inherent 'a' for virama / sign ligatures and to capitalise
# the second member of a conjunct.
CONSONANTS = [
    "ka", "kha", "ga", "gha", "nga", "ngga", "nnga",
    "ca", "cha", "ja", "jha", "nya", "jnya", "nyja",
    "tta", "ttha", "dda", "ddha", "nna", "nndda",
    "ta", "tha", "da", "dha", "na", "nda",
    "pa", "pha", "ba", "bha", "ma", "mba",
    "ya", "ra", "la", "va", "sha", "ssa", "sa", "ha", "lla", "fa",
]
CONS_SET = set(CONSONANTS)

# Old Abhaya consonant spelling -> LankaGlyphset spelling for the same Unicode
# letter. ngga (U+0D9F, ඟ) is named "nnga" in the LankaGlyphset standard.
CONS_RENAME = {"ngga": "nnga"}

# Old standalone-sign name (without -sinh) -> new standalone-sign name.
SIGN_MAP = {
    "aa-sign": "aasign", "ae-sign": "aesign", "aae-sign": "aaesign",
    "i-sign": "isign", "ii-sign": "iisign", "u-sign": "usign", "uu-sign": "uusign",
    "e-sign": "esign", "ee-sign": "eesign", "o-sign": "osign", "oo-sign": "oosign",
    "ai-sign": "aisign", "au-sign": "ausign",
    "vocalicR-sign": "vocalicrsign", "vocalicRr-sign": "vocalicrrsign",
    "vocalicL-sign": "vocaliclsign", "vocalicLl-sign": "vocalicllsign",
    "al-sign": "virama", "rakar-sign": "rasign", "repha-sign": "repha",
    "yansa-sign": "yasign",
    "anusvara": "anusvaraya", "visarga": "visargaya",
    "candrabindu": "candrabindu",
    "touch": "touch",
}

# Independent vowel case fixes (vocalicR -> vocalicr etc.); others unchanged.
VOWEL_MAP = {
    "vocalicR": "vocalicr", "vocalicRr": "vocalicrr",
    "vocalicL": "vocalicl", "vocalicLl": "vocalicll",
}

# Old vowel-ligature suffix -> capital sign letters used in new names.
VOWEL_SIGN = {"i": "I", "ii": "Ii", "u": "U", "uu": "Uu",
              "ae": "Ae", "aae": "Aae", "aa": "Aa", "ai": "Ai",
              "e": "E", "ee": "Ee", "o": "O", "oo": "Oo", "au": "Au"}

# Old vowel-ligature token -> full sign glyph name (for underscore-joined names).
VOWEL_FULL = {"i": "isign", "ii": "iisign", "u": "usign", "uu": "uusign",
              "aa": "aasign", "ae": "aesign", "aae": "aaesign", "oo": "oosign"}

# Archaic numerals: old word+"Archaic"-sinhala -> "archaic"+word-sinh
ARCHAIC = ["one", "two", "three", "four", "five", "six", "seven", "eight",
           "nine", "ten", "twenty", "thirty", "forty", "fifty", "sixty",
           "seventy", "eighty", "ninety", "onehundred", "onethousand"]

NS = "-sinh"
TAML = "-taml"

# ===== Tamil (-taml) tables =================================================
# Tamil base consonants (all end in inherent 'a' except 'nna2', the alveolar
# n U+0BA9, which the user asked to leave unchanged and flagged).
TAML_CONS = {
    "ka", "nga", "ca", "ja", "nya", "tta", "nna", "ta", "na",
    "pa", "ma", "ya", "ra", "rra", "la", "lla", "zha", "va",
    "sha", "ssa", "sa", "ha",
}
TAML_VOWELS = {"a", "aa", "i", "ii", "u", "uu", "e", "ee", "ai", "o", "oo", "au"}
# Standalone-token glyphs that are already conformant and left unchanged.
TAML_KEEP = {
    "om", "shree",
    "zero", "one", "two", "three", "four", "five", "six", "seven",
    "eight", "nine", "ten", "hundred", "thousand",
}
# Vowel-sign (matra) renames: X-sign -> Xsign.
TAML_SIGN_MAP = {
    "aa-sign": "aasign", "i-sign": "isign", "ii-sign": "iisign",
    "u-sign": "usign", "uu-sign": "uusign", "e-sign": "esign",
    "ee-sign": "eesign", "ai-sign": "aisign", "o-sign": "osign",
    "oo-sign": "oosign", "au-sign": "ausign", "virama-sign": "virama",
    # special signs (Sinhala-style full names per user choice)
    "anusvara": "anusvaraya", "visarga": "visargaya",
    "au-lengthmark": "aulengthmark",
    # Tamil symbol marks: sign<name>; rupee -> indianrupee
    "day-sign": "signday", "month-sign": "signmonth", "year-sign": "signyear",
    "debit-sign": "signdebit", "credit-sign": "signcredit",
    "asabove-sign": "signasabove", "number-sign": "signnumber",
    "rupee-sign": "indianrupee",
}


def _drop_a(cons):
    """Drop the trailing inherent 'a' of a consonant base. ka->k, nga->ng."""
    return cons[:-1] if cons.endswith("a") else cons


def _conjunct(first, second):
    """ka_ssa -> kSsa : drop trailing a of first, capitalise first letter of second."""
    first = CONS_RENAME.get(first, first)
    second = CONS_RENAME.get(second, second)
    return _drop_a(first) + second[0].upper() + second[1:]


def _resolve_cluster(stem):
    """Convert an old consonant/conjunct stem (e.g. 'ka', 'na_da', 'ka_ssa')
    into its new cluster name (e.g. 'ka', 'nDa', 'kSsa'). Returns None if the
    stem is not a recognised consonant/conjunct."""
    if "_" in stem:
        parts = stem.split("_")
        if len(parts) == 2 and parts[0] in CONS_SET and parts[1] in CONS_SET:
            return _conjunct(parts[0], parts[1])
        return None
    if stem in CONS_SET:
        return CONS_RENAME.get(stem, stem)
    return None


# Explicit whole-name overrides for cases that don't follow a general rule.
EXPLICIT_OVERRIDES = {
    "da-yansa-oo.post.ss01-sinh": "da_yansa_oosign-sinh",
}


def build_rename_map(old_names):
    """Given an iterable of existing glyph names, return {old: new} for every
    glyph whose name actually changes (status 'renamed')."""
    m = {}
    for old in old_names:
        new, status, _ = convert(old)
        if status == "renamed" and new != old:
            m[old] = new
    return m


# Characters that may appear inside a glyph name. Used for token boundaries so
# that replacing "ka-sinh" never touches "ka-sinh.alt" or "kka-sinh".
_NAME_CHARS = r"A-Za-z0-9._\-"


def make_code_rewriter(rename_map):
    """Return a function code->(new_code, n_replacements) that rewrites whole
    glyph-name tokens using rename_map. Longest names are tried first so that a
    name which is a prefix of another is not matched partially."""
    if not rename_map:
        return lambda code: (code, 0)
    olds = sorted(rename_map.keys(), key=len, reverse=True)
    alt = "|".join(re.escape(o) for o in olds)
    pat = re.compile(r"(?<![%s])(?:%s)(?![%s])" % (_NAME_CHARS, alt, _NAME_CHARS))

    def rewrite(code):
        if not code:
            return code, 0
        count = [0]

        def repl(mo):
            count[0] += 1
            return rename_map[mo.group(0)]

        return pat.sub(repl, code), count[0]

    return rewrite


def _convert_taml_name(name):
    """Convert a Tamil (-taml) glyph name. Handles an optional alternate/style
    dot-suffix that may appear either before or after the namespace, e.g.
    'i-sign.alt1-taml' and 'ai-sign-taml.alt'."""
    # 1. suffix AFTER the namespace ('...-taml.alt'): normalise the variant
    # suffix to BEFORE the namespace ('...alt-taml') per the LankaGlyphset
    # tooling convention (e.g. esign._ui-sinh, daa._c-sinh).
    m = re.match(r"^(.*-taml)((?:\.[^.]+)+)$", name)
    if m:
        new, status, note = _convert_taml_name(m.group(1))
        if new.endswith(TAML):
            full = new[:-len(TAML)] + m.group(2) + TAML
        else:
            full = new + m.group(2)
        st = "unchanged" if full == name else "renamed"
        return full, st, note + " (+ alternate suffix %s)" % m.group(2)

    if not name.endswith(TAML):
        return name, "skip", "not a Tamil (-taml) glyph"
    stem = name[:-len(TAML)]

    # 2. suffix WITHIN the stem before the namespace: 'i-sign.alt1'
    dot = ""
    dm = re.match(r"^(.*?)((?:\.[^.]+)+)$", stem)
    if dm:
        stem, dot = dm.group(1), dm.group(2)

    def out(new_stem, status, note):
        full = new_stem + dot + TAML
        st = status
        if status == "renamed" and full == name:
            st = "unchanged"
        return full, st, note

    # base vowels & consonants ------------------------------------------------
    if stem in TAML_VOWELS:
        return out(stem, "renamed", "Tamil base vowel")
    if stem in TAML_KEEP:
        return out(stem, "renamed", "Tamil base/symbol glyph")
    if stem in TAML_CONS:
        return out(stem, "renamed", "Tamil base consonant")

    # nna2 base and all nna2-* forms: left unchanged + flagged (user choice) --
    if stem == "nna2" or stem.startswith("nna2-"):
        return name, "ambiguous", "Tamil nna2 (U+0BA9) form: flagged for manual naming"

    # signs / symbol marks ----------------------------------------------------
    if stem in TAML_SIGN_MAP:
        return out(TAML_SIGN_MAP[stem], "renamed", "Tamil sign/symbol")

    # kssa conjunct + its vowel ligatures (recapitalise to kSsa) --------------
    if stem == "kssa":
        return out("kSsa", "renamed", "Tamil conjunct kssa->kSsa")
    if stem.startswith("kssa-"):
        v = stem[len("kssa-"):]
        if v in VOWEL_SIGN:
            return out("kSs" + VOWEL_SIGN[v], "renamed", "Tamil kssa+vowel ligature")
        return name, "ambiguous", "Tamil kssa combination: unhandled modifier"

    # consonant + vowel-sign ligature: <cons>-<vowel> -> drop 'a' + Capital ---
    if "-" in stem:
        cons, _, v = stem.partition("-")
        if cons in TAML_CONS and v in VOWEL_SIGN:
            return out(_drop_a(cons) + VOWEL_SIGN[v], "renamed",
                       "Tamil consonant+vowel-sign ligature")

    return name, "ambiguous", "Tamil glyph: no matching rule"


def convert(name):
    if name in EXPLICIT_OVERRIDES:
        return EXPLICIT_OVERRIDES[name], "renamed", "explicit override"

    # Only handle Sinhala glyphs (namespace -sinh, or archaic -sinhala numerals).
    if name.endswith("-sinhala"):
        word = name[:-len("-sinhala")]
        if word.endswith("Archaic"):
            base = word[:-len("Archaic")]
            if base in ARCHAIC:
                return f"archaic{base}{NS}", "renamed", "archaic numeral namespace -sinhala->-sinh"
        return name, "ambiguous", "ends in -sinhala but unrecognised numeral"

    # ---- Tamil (-taml) glyphs -------------------------------------------------
    if TAML in name:
        return _convert_taml_name(name)

    # Split off any alternate/style suffix that follows the namespace, e.g.
    # "repha-sign-sinh.001" -> base "repha-sign-sinh", suffix ".001"
    # "fa-al-sinh.hist"      -> base "fa-al-sinh",      suffix ".hist"
    # The suffix is preserved verbatim (it marks an alternate of the glyph).
    m = re.match(r"^(.*-sinh)((?:\.[^.]+)+)$", name)
    if m:
        base_name, post = m.group(1), m.group(2)
        new, status, note = convert(base_name)
        new_full = new + post
        if status == "skip":
            return name, "skip", note
        st = "unchanged" if new_full == name else (
            "ambiguous" if status == "ambiguous" else "renamed")
        return new_full, st, note + " (+ alternate suffix %s)" % post

    if not name.endswith(NS):
        return name, "skip", "not a Sinhala (-sinh) glyph"

    stem = name[:-len(NS)]  # everything before -sinh

    # --- 0. explicit special-case stems ---------------------------------------
    SPECIAL = {
        "u-sign.sub": "usign.rasign",     # below-base usign after rakaransaya
        "uu-sign.sub": "uusign.rasign",
        "aa-sign.al": "aasign_virama",    # README §9 aasign + virama
    }
    if stem in SPECIAL:
        return SPECIAL[stem] + NS, "renamed", "special contextual sign"

    # --- 1. exact standalone signs --------------------------------------------
    if stem in SIGN_MAP:
        new = SIGN_MAP[stem] + NS
        return new, ("unchanged" if new == name else "renamed"), "standalone sign"

    # --- 2. independent vowels & base consonants (unchanged except case) ------
    if stem in VOWEL_MAP:
        return VOWEL_MAP[stem] + NS, "renamed", "independent vowel case fix"
    if stem in "a aa ae aae i ii u uu e ee ai o oo au".split():
        return name, "unchanged", "base vowel"
    if stem in CONS_SET:
        new = CONS_RENAME.get(stem, stem) + NS
        return new, ("renamed" if new != name else "unchanged"), "base consonant"

    # --- handle trailing dot-suffix variants (.001 .hist .ss01 etc.) ----------
    # We split off a single trailing ".xxx" so the core can be matched, then
    # decide. Many of these are genuinely ambiguous -> flagged.
    dot_suffix = ""
    core = stem
    m = re.match(r"^(.*?)((?:\.[A-Za-z0-9]+)+)$", stem)
    if m:
        core, dot_suffix = m.group(1), m.group(2)

    # --- 3. ss01 / below-base 'da-like' stylistic forms -----------------------
    if ".ss01" in stem:
        res = _convert_ss01(stem)
        if res:
            return res
        return name, "ambiguous", "ss01 below-base form, no clear target"

    # --- tokenise the hyphen-separated old cluster ----------------------------
    # old grammar: <cluster>[-rakar][-<vowel>|-al][-repha]  with cluster being a
    # consonant, conjunct, or one of the special bases (yansa-sign, ra ...).
    tokens = stem.split("-")

    # yansa combinations ------------------------------------------------------
    if tokens[0] == "yansa":
        return _convert_yansa(stem, name)

    # anusvara_sha combinations ----------------------------------------------
    if stem.startswith("anusvara_sha"):
        rest = stem[len("anusvara_sha"):]  # "", "-i", "-ii", "-u", "-uu", "-al"
        if rest == "":
            return "anusvarayaSha" + NS, "renamed", "anusvaraya + sha"
        base = "anusvarayaSh"  # anusvarayaSha with inherent 'a' dropped
        if rest == "-al":
            return base + NS, "renamed", "anusvarayaSha + virama"
        tok = rest[1:]
        if tok in VOWEL_SIGN:
            return base + VOWEL_SIGN[tok] + NS, "renamed", "anusvarayaSha + vowel sign"
        return name, "ambiguous", "anusvarayaSha + unhandled modifier"

    cluster = tokens[0]
    mods = tokens[1:]
    # A trailing 'sign' token just marks the preceding vowel as a sign form
    # (e.g. ra-ae-sign -> ra + ae). Drop it.
    mods = [t for t in mods if t != "sign"]

    new_cluster = _resolve_cluster(cluster)
    if new_cluster is None:
        return name, "ambiguous", f"unrecognised cluster '{cluster}'"

    # repha (repaya) combinations: join repaya to the cluster with an underscore
    # e.g. ka-repha -> ka_repha ; ka_ssa-repha -> kSsa_repha ;
    #      ka-repha-... not attested. Trailing vowel/al joins as a full sign name.
    if "repha" in mods:
        rest = [t for t in mods if t != "repha"]
        nm = new_cluster + "_repha"
        for t in rest:
            if t == "al":
                nm += "_virama"
            elif t in VOWEL_FULL:
                nm += "_" + VOWEL_FULL[t]
            else:
                return name, "ambiguous", f"repha combo with unhandled modifier '{t}'"
        return nm + NS, "renamed", "repaya (repha) combination"

    has_rakar = "rakar" in mods
    # vowel / al among mods
    vowel = None
    has_al = False
    for t in mods:
        if t == "rakar":
            continue
        if t == "al":
            has_al = True
        elif t in VOWEL_SIGN:
            vowel = t
        else:
            return name, "ambiguous", f"unhandled modifier '{t}'"

    # Build the new name -------------------------------------------------------
    base = new_cluster
    if has_rakar:
        # drop inherent 'a' of the cluster, add R, then sign/al/'a'
        stem_noa = _drop_a(base)
        if has_al:
            new = stem_noa + "R"            # ka-rakar-al -> kR
        elif vowel:
            new = stem_noa + "R" + VOWEL_SIGN[vowel]   # ka-rakar-i -> kRI
        else:
            new = stem_noa + "Ra"           # ka-rakar -> kRa
        return new + NS, ("unchanged" if new + NS == name else "renamed"), "rakar ligature"

    if has_al:
        new = _drop_a(base)                 # ka-al -> k ; na_da-al -> nD
        return new + NS, "renamed", "pure-consonant (virama) ligature"

    if vowel:
        new = _drop_a(base) + VOWEL_SIGN[vowel]   # ka-i -> kI ; ra-ae-sign handled below
        return new + NS, "renamed", "consonant+vowel-sign ligature"

    # cluster alone but wasn't caught earlier (e.g. conjunct base na_da -> nDa)
    return new_cluster + NS, ("unchanged" if new_cluster + NS == name else "renamed"), "cluster base"


def _convert_yansa(stem, name):
    # yansa-sign                 -> yasign
    # yansa-sign.i / .ii         -> yasign_isign / yasign_iisign
    # yansa-sign-u / -uu         -> yasign_usign / yasign_uusign
    # yansa-sign.al              -> yasign_virama
    # yansa-sign.repha           -> yasign_repha
    # yansa-sign-repha-aa/-u/-uu -> yasign_repha_aasign / _usign / _uusign
    rest = stem[len("yansa-sign"):]
    table = {
        "": "yasign",
        ".i": "yasign_isign", ".ii": "yasign_iisign",
        "-u": "yasign_usign", "-uu": "yasign_uusign",
        ".al": "yasign_virama",
        ".repha": "yasign_repha",
        "-repha-aa": "yasign_repha_aasign",
        "-repha-u": "yasign_repha_usign",
        "-repha-uu": "yasign_repha_uusign",
    }
    if rest in table:
        return table[rest] + NS, "renamed", "yansaya combination"
    return name, "ambiguous", "yansaya combination: no clear target"


def _convert_ss01(stem):
    # Map old da-like ss01 forms to new <cluster><vowel>._c-sinh style.
    # old:  da-aa.ss01 / da-ae.ss01 / da-aae.ss01 / da-vocalicR.ss01
    #       da-yansa.post.ss01 / da-yansa-aa.post.ss01 / da-yansa-u.post.ss01 ...
    #       da-aa.al.ss01  (-> ..._virama._c)
    #       da-rakar-aa.ss01 (-> dRaa._c)
    #       nda-* , jnya-*, nya-*, na_da-*
    body = stem[:-len(".ss01")] if stem.endswith(".ss01") else None
    if body is None:
        # may be like da-aa.al.ss01
        m = re.match(r"^(.*)\.ss01$", stem)
        if not m:
            return None
        body = m.group(1)

    al = False
    if body.endswith(".al"):
        al = True
        body = body[:-3]

    toks = body.split("-")
    cluster = toks[0]
    new_cluster = _resolve_cluster(cluster)
    if new_cluster is None:
        return None
    rest = toks[1:]

    # rakar branch: da-rakar-aa -> dRaa._c
    if "rakar" in rest:
        rest = [t for t in rest if t != "rakar"]
        vw = rest[0] if rest else "aa"
        sgn = {"aa": "aa"}.get(vw)
        if sgn is None:
            return None
        nm = _drop_a(new_cluster) + "R" + sgn + "._c" + NS
        return nm, "renamed", "ss01 rakar below-base form"

    # yansa (post) branch: da-yansa.post / da-yansa-aa.post / da-yansa-u.post
    if rest and rest[0].startswith("yansa"):
        # strip trailing ".post" already gone? body had .post inside token
        # tokens look like ['yansa.post'] or ['yansa', 'aa.post'] etc.
        joined = "-".join(rest).replace(".post", "")
        parts = joined.split("-")
        # parts[0] == 'yansa'
        vw = parts[1] if len(parts) > 1 else None
        base = _drop_a(new_cluster) + "y"
        if vw is None:
            nm = base + "a._c"
        elif vw == "aa":
            nm = base + "aa._c"
        elif vw in ("u", "uu"):
            nm = base + VOWEL_SIGN[vw] + "._c"
        elif vw in ("oo",):
            return None  # not defined in YAML
        else:
            return None
        return nm + NS, "renamed", "ss01 yansa below-base form"

    # plain vowel branch: da-aa / da-ae / da-aae / da-vocalicR / da-vocalicRr
    vw = rest[0] if rest else None
    cl_noa = _drop_a(new_cluster)
    vowel_tail = {
        "aa": "aa", "ae": "ae", "aae": "aae",
        "vocalicR": "vocalicr", "vocalicRr": "vocalicrr",
    }
    if vw in vowel_tail:
        nm = cl_noa + vowel_tail[vw]
        if al:
            nm += "_virama"
        nm += "._c"
        return nm + NS, "renamed", "ss01 below-base vowel form"
    return None

CANONICAL = frozenset({
    'a-sinh',
    'aa-sinh',
    'aae-sinh',
    'aaesign-sinh',
    'aasign-sinh',
    'ae-sinh',
    'aesign-sinh',
    'ai-sinh',
    'aisign-sinh',
    'anusvaraya-sinh',
    'anusvarayaSha-sinh',
    'archaiceight-sinh',
    'archaiceighty-sinh',
    'archaicfifty-sinh',
    'archaicfive-sinh',
    'archaicforty-sinh',
    'archaicfour-sinh',
    'archaicnine-sinh',
    'archaicninety-sinh',
    'archaicone-sinh',
    'archaiconehundred-sinh',
    'archaiconethousand-sinh',
    'archaicseven-sinh',
    'archaicseventy-sinh',
    'archaicsix-sinh',
    'archaicsixty-sinh',
    'archaicten-sinh',
    'archaicthirty-sinh',
    'archaicthree-sinh',
    'archaictwenty-sinh',
    'archaictwo-sinh',
    'asterisk-sinh',
    'au-sinh',
    'ausign-sinh',
    'b-sinh',
    'bI-sinh',
    'bIi-sinh',
    'ba-sinh',
    'backslash-sinh',
    'bhU-sinh',
    'bhUu-sinh',
    'bha-sinh',
    'bracketleft-sinh',
    'bracketright-sinh',
    'bullet-sinh',
    'c-sinh',
    'cI-sinh',
    'cIi-sinh',
    'ca-sinh',
    'candrabindu-sinh',
    'ch-sinh',
    'chI-sinh',
    'chIi-sinh',
    'cha-sinh',
    'colon-sinh',
    'comma-sinh',
    'dRa-sinh',
    'dRaa._c-sinh',
    'dU-sinh',
    'dUu-sinh',
    'dVa-sinh',
    'da-sinh',
    'daa._c-sinh',
    'daa_virama._c-sinh',
    'daae._c-sinh',
    'dae._c-sinh',
    'dd-sinh',
    'ddDha-sinh',
    'ddI-sinh',
    'ddIi-sinh',
    'dda-sinh',
    'ddh-sinh',
    'ddhI-sinh',
    'ddhIi-sinh',
    'ddha-sinh',
    'dh-sinh',
    'dhI-sinh',
    'dhIi-sinh',
    'dha-sinh',
    'divide-sinh',
    'dvocalicr._c-sinh',
    'dvocalicrr._c-sinh',
    'dy._c-sinh',
    'dyU._c-sinh',
    'dyUu._c-sinh',
    'dya._c-sinh',
    'dyaa._c-sinh',
    'dyaa_virama._c-sinh',
    'e-sinh',
    'ee-sinh',
    'eesign-sinh',
    'emdash-sinh',
    'endash-sinh',
    'equal-sinh',
    'esign-sinh',
    'esign._ui-sinh',
    'exclam-sinh',
    'fPI-sinh',
    'fPIi-sinh',
    'fPa-sinh',
    'fa-sinh',
    'gU-sinh',
    'gUu-sinh',
    'ga-sinh',
    'gha-sinh',
    'greater-sinh',
    'ha-sinh',
    'hyphen-sinh',
    'i-sinh',
    'ii-sinh',
    'iisign-sinh',
    'isign-sinh',
    'j-sinh',
    'jI-sinh',
    'jIi-sinh',
    'ja-sinh',
    'jh-sinh',
    'jhI-sinh',
    'jhIi-sinh',
    'jha-sinh',
    'jny-sinh',
    'jnyI-sinh',
    'jnyIi-sinh',
    'jnyU-sinh',
    'jnyUu-sinh',
    'jnya-sinh',
    'kSsa-sinh',
    'kU-sinh',
    'kUu-sinh',
    'kV-sinh',
    'kVI-sinh',
    'kVIi-sinh',
    'kVa-sinh',
    'ka-sinh',
    'kh-sinh',
    'khI-sinh',
    'khIi-sinh',
    'kha-sinh',
    'kunddaliya-sinh',
    'lU-sinh',
    'lUu-sinh',
    'la-sinh',
    'less-sinh',
    'litheight-sinh',
    'lithfive-sinh',
    'lithfour-sinh',
    'lithnine-sinh',
    'lithone-sinh',
    'lithseven-sinh',
    'lithsix-sinh',
    'liththree-sinh',
    'lithtwo-sinh',
    'lithzero-sinh',
    'llU-sinh',
    'llUu-sinh',
    'lla-sinh',
    'm-sinh',
    'mI-sinh',
    'mIi-sinh',
    'ma-sinh',
    'mb-sinh',
    'mbI-sinh',
    'mbIi-sinh',
    'mba-sinh',
    'multiply-sinh',
    'nDI-sinh',
    'nDIi-sinh',
    'nDRa-sinh',
    'nDRaa._c-sinh',
    'nDa-sinh',
    'nDaa._c-sinh',
    'nDaa_virama._c-sinh',
    'nDaae._c-sinh',
    'nDae._c-sinh',
    'nDhI-sinh',
    'nDhIi-sinh',
    'nDha-sinh',
    'nDvocalicr._c-sinh',
    'nDvocalicrr._c-sinh',
    'nThI-sinh',
    'nThIi-sinh',
    'nTha-sinh',
    'nVa-sinh',
    'na-sinh',
    'ndU-sinh',
    'ndUu-sinh',
    'nda-sinh',
    'ng-sinh',
    'ngDha-sinh',
    'ngI-sinh',
    'ngIi-sinh',
    'ngU-sinh',
    'ngUu-sinh',
    'nga-sinh',
    'nnDda-sinh',
    'nna-sinh',
    'nndd-sinh',
    'nnddI-sinh',
    'nnddIi-sinh',
    'nndda-sinh',
    'nnga-sinh',
    'numbersign-sinh',
    'nyCa-sinh',
    'nyCha-sinh',
    'nyJa-sinh',
    'nyJaa._c-sinh',
    'nyJaa_virama._c-sinh',
    'nyJaae._c-sinh',
    'nyJae._c-sinh',
    'nyRa-sinh',
    'nyU-sinh',
    'nyUu-sinh',
    'nya-sinh',
    'nyaa._c-sinh',
    'nyaa_virama._c-sinh',
    'nyaae._c-sinh',
    'nyae._c-sinh',
    'nyj-sinh',
    'nyjI-sinh',
    'nyjIi-sinh',
    'nyjU-sinh',
    'nyjUu-sinh',
    'o-sinh',
    'oo-sinh',
    'oosign-sinh',
    'osign-sinh',
    'pa-sinh',
    'parenleft-sinh',
    'parenright-sinh',
    'percent-sinh',
    'period-sinh',
    'periodcentered-sinh',
    'ph-sinh',
    'phI-sinh',
    'phIi-sinh',
    'pha-sinh',
    'plus-sinh',
    'question-sinh',
    'quotedbl-sinh',
    'quotedblleft-sinh',
    'quotedblright-sinh',
    'quoteleft-sinh',
    'quoteright-sinh',
    'quotesingle-sinh',
    'r-sinh',
    'rAae-sinh',
    'rAe-sinh',
    'rI-sinh',
    'rIi-sinh',
    'rU-sinh',
    'rUu-sinh',
    'ra-sinh',
    'rasign-sinh',
    'repha-sinh',
    'sa-sinh',
    'semicolon-sinh',
    'shU-sinh',
    'shUu-sinh',
    'sha-sinh',
    'slash-sinh',
    'space-sinh',
    'ss01 Da Forms-sinh',
    'ssa-sinh',
    'tThI-sinh',
    'tThIi-sinh',
    'tTha-sinh',
    'tU-sinh',
    'tUu-sinh',
    'tVI-sinh',
    'tVIi-sinh',
    'tVa-sinh',
    'ta-sinh',
    'th-sinh',
    'thI-sinh',
    'thIi-sinh',
    'tha-sinh',
    'tt-sinh',
    'ttI-sinh',
    'ttIi-sinh',
    'ttTtha-sinh',
    'tta-sinh',
    'tth-sinh',
    'tthI-sinh',
    'tthIi-sinh',
    'ttha-sinh',
    'u-sinh',
    'underscore-sinh',
    'usign-sinh',
    'usign.rasign-sinh',
    'uu-sinh',
    'uusign-sinh',
    'uusign.rasign-sinh',
    'v-sinh',
    'vI-sinh',
    'vIi-sinh',
    'va-sinh',
    'virama-sinh',
    'visargaya-sinh',
    'vocalicl-sinh',
    'vocalicll-sinh',
    'vocalicllsign-sinh',
    'vocaliclsign-sinh',
    'vocalicr-sinh',
    'vocalicrr-sinh',
    'vocalicrrsign-sinh',
    'vocalicrsign-sinh',
    'ya-sinh',
    'yasign-sinh',
    'zerowidthjoiner-sinh'
})


# ===================== Glyphs.app driver =====================
def _resolve_report_path(font):
    if REPORT_PATH:
        return REPORT_PATH
    try:
        fp = font.filepath
    except Exception:
        fp = None
    if fp:
        d = os.path.dirname(fp)
        base = os.path.splitext(os.path.basename(fp))[0]
        return os.path.join(d, base + "_rename_report.tsv")
    return os.path.expanduser("~/Desktop/lankaglyphset_rename_report.tsv")


def main():
    try:
        font = Glyphs.font  # noqa: F821  (provided by Glyphs.app)
    except NameError:
        print("This script must be run inside Glyphs.app (no 'Glyphs' object).")
        return
    if font is None:
        print("No font open. Open AbhayaLibre and try again.")
        return

    # Pass 1: compute proposed names, detect collisions against final name set.
    existing = {g.name for g in font.glyphs}
    rows = []          # (old, new, status, in_standard, note)
    proposed = {}      # new_name -> [old names]
    for g in font.glyphs:
        old = g.name
        new, status, note = convert(old)
        if new.endswith("-taml"):
            in_std = "n/a"   # no canonical Tamil set defined yet
        elif new.endswith("-sinh"):
            in_std = new in CANONICAL
        else:
            in_std = ""
        rows.append([old, new, status, in_std, note])
        if status in ("renamed",):
            proposed.setdefault(new, []).append(old)

    # collision detection: proposed name already used by a DIFFERENT, non-renamed
    # glyph, or two renames target the same new name.
    rename_targets = {}
    for old, new, status, in_std, note in rows:
        if status == "renamed":
            rename_targets.setdefault(new, []).append(old)
    collisions = {}
    for new, olds in rename_targets.items():
        clash = list(olds)
        # an untouched existing glyph already named `new`?
        if new in existing and new not in [r[0] for r in rows if r[2] == "renamed"]:
            # only a clash if some other glyph keeps that name
            keepers = [r[0] for r in rows if r[0] == new and r[2] != "renamed"]
            clash += keepers
        if len(clash) > 1:
            collisions[new] = clash

    # Pass 2: apply renames (unless dry run).
    applied = 0
    skipped_collision = 0
    if not DRY_RUN:
        # rename in two stages to avoid transient name clashes
        TMP = "__tmp__"
        # stage A: move every glyph that will be renamed to a unique temp name
        plan = [(g, convert(g.name)) for g in font.glyphs]
        for i, (g, (new, status, note)) in enumerate(plan):
            if status == "renamed" and new not in collisions:
                g.name = "%s_%04d-RENAMETMP" % (TMP, i)
        for g, (new, status, note) in plan:
            if status == "renamed" and new not in collisions:
                g.name = new
                applied += 1
            elif status == "renamed" and new in collisions:
                skipped_collision += 1

    # Pass 3: rewrite OpenType feature code, classes and prefixes so they
    # reference the new glyph names. Glyphs does NOT do this for manual code.
    feat_stats = {"classes": 0, "featurePrefixes": 0, "features": 0}
    feat_detail = []   # (kind, name, n_replacements)
    if UPDATE_FEATURES:
        rename_map = {old: new for old, new, status, _, _ in rows
                      if status == "renamed"}
        rewrite = make_code_rewriter(rename_map)
        collections = [
            ("classes", getattr(font, "classes", []) or []),
            ("featurePrefixes", getattr(font, "featurePrefixes", []) or []),
            ("features", getattr(font, "features", []) or []),
        ]
        for kind, coll in collections:
            for item in coll:
                code = getattr(item, "code", None)
                if not code:
                    continue
                new_code, n = rewrite(code)
                if n:
                    feat_stats[kind] += n
                    feat_detail.append((kind, getattr(item, "name", "?"), n))
                    if not DRY_RUN:
                        item.code = new_code

    # write report
    path = _resolve_report_path(font)
    counts = {}
    for _, _, status, _, _ in rows:
        counts[status] = counts.get(status, 0) + 1
    flagged = [r for r in rows if r[2] == "renamed" and not r[3]]
    ambiguous = [r for r in rows if r[2] == "ambiguous"]
    with open(path, "w") as f:
        f.write("# LankaGlyphset rename report\n")
        f.write("# generated: %s\n" % datetime.datetime.now().isoformat(timespec="seconds"))
        f.write("# font: %s\n" % (getattr(font, "filepath", "") or "<unsaved>"))
        f.write("# DRY_RUN: %s\n" % DRY_RUN)
        f.write("# total glyphs: %d\n" % len(rows))
        f.write("# status counts: %s\n" % counts)
        f.write("# renamed but NOT in canonical YAML set (flagged): %d\n" % len(flagged))
        f.write("# ambiguous (left untouched): %d\n" % len(ambiguous))
        if UPDATE_FEATURES:
            f.write("# feature-code replacements: %s (total %d)\n"
                    % (feat_stats, sum(feat_stats.values())))
            for kind, nm, n in feat_detail:
                f.write("#   %s '%s': %d\n" % (kind, nm, n))
        if collisions:
            f.write("# NAME COLLISIONS (NOT applied, resolve manually): %d\n" % len(collisions))
            for new, olds in sorted(collisions.items()):
                f.write("#   %s  <-  %s\n" % (new, ", ".join(olds)))
        f.write("#\n")
        f.write("old_name\tnew_name\tstatus\tin_standard\tnote\n")
        for old, new, status, in_std, note in rows:
            f.write("%s\t%s\t%s\t%s\t%s\n" % (old, new, status, in_std, note))

    print("=" * 60)
    print("LankaGlyphset rename %s" % ("DRY RUN (nothing changed)" if DRY_RUN else "APPLIED"))
    print("Total glyphs        : %d" % len(rows))
    print("Status counts       : %s" % counts)
    print("Renamed (applied)   : %d" % applied)
    print("Flagged (renamed, not in YAML set): %d" % len(flagged))
    print("Ambiguous (untouched): %d" % len(ambiguous))
    if UPDATE_FEATURES:
        print("Feature-code edits  : %d replacements %s" % (sum(feat_stats.values()), feat_stats))
    if collisions:
        print("COLLISIONS (not applied): %d  -- see report" % len(collisions))
    print("Report written to   : %s" % path)
    if DRY_RUN:
        print("\nDRY_RUN is on. Review the report, then set DRY_RUN = False to apply.")
    print("=" * 60)


if __name__ == "__main__":
    main()
