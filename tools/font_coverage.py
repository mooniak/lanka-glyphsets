#!/usr/bin/env python3
"""
font_coverage.py — Report which Sinhala orthographic units a font can render.

For every candidate orthographic sequence (a Unicode string such as "ක", "කි",
or the conjunct "ක්‍ෂ") the tool shapes the string with HarfBuzz against the
target font and inspects the result. This catches BOTH failure modes a font
developer cares about:

  * the glyph is simply missing            -> UNSUPPORTED
  * the glyph exists but no OpenType
    feature (.fea / GSUB) wires it up       -> GLYPH_PRESENT_NO_FEA
  * the cluster renders but the required
    conjunct ligature is not formed         -> PARTIAL
  * everything renders correctly            -> SUPPORTED

Default output is the list of Unicode strings the font supports, one per line
(orthographically correct rendering). Use --report for the full breakdown.

Candidate sources (pick one):
  --builtin                Generate the standard Sinhala syllabary internally
                           (default when nothing else is given).
  --candidates FILE.json   JSON array of {"name": "...", "sequence": "..."}
                           — i.e. the output of `glyphsets generate -f json`.
  --candidates FILE.txt    Plain text, one sequence per line. Optional
                           "name<TAB>sequence" per line to enable ligature
                           (GLYPH_PRESENT_NO_FEA) detection.

Requires: uharfbuzz, fonttools
    pip install uharfbuzz fonttools
"""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path

import uharfbuzz as hb
from fontTools.ttLib import TTFont

# ---------------------------------------------------------------------------
# Sinhala Unicode building blocks (for the --builtin candidate generator)
# ---------------------------------------------------------------------------

AL = "්"      # al-lakuna / virama
ZWJ = "‍"

INDEPENDENT_VOWELS = {
    0x0D85: "a", 0x0D86: "aa", 0x0D87: "ae", 0x0D88: "aae",
    0x0D89: "i", 0x0D8A: "ii", 0x0D8B: "u", 0x0D8C: "uu",
    0x0D8D: "vocalicr", 0x0D8E: "vocalicrr",
    0x0D8F: "vocalicl", 0x0D90: "vocalicll",
    0x0D91: "e", 0x0D92: "ee", 0x0D93: "ai",
    0x0D94: "o", 0x0D95: "oo", 0x0D96: "au",
}

# Consonant codepoint -> base glyph name (name without trailing inherent 'a')
CONSONANTS = {
    0x0D9A: "k",  0x0D9B: "kh", 0x0D9C: "g",  0x0D9D: "gh", 0x0D9E: "ng",
    0x0D9F: "nng", 0x0DA0: "c", 0x0DA1: "ch", 0x0DA2: "j",  0x0DA3: "jh",
    0x0DA4: "ny", 0x0DA5: "jny", 0x0DA6: "nyj",
    0x0DA7: "tt", 0x0DA8: "tth", 0x0DA9: "dd", 0x0DAA: "ddh", 0x0DAB: "nn",
    0x0DAC: "nndd",
    0x0DAD: "t",  0x0DAE: "th", 0x0DAF: "d",  0x0DB0: "dh", 0x0DB1: "n",
    0x0DB3: "nd",
    0x0DB4: "p",  0x0DB5: "ph", 0x0DB6: "b",  0x0DB7: "bh", 0x0DB8: "m",
    0x0DB9: "mb",
    0x0DBA: "y",  0x0DBB: "r",  0x0DBD: "l",  0x0DC0: "v",
    0x0DC1: "sh", 0x0DC2: "ss", 0x0DC3: "s",  0x0DC4: "h",  0x0DC5: "ll",
    0x0DC6: "f",
}

# Dependent vowel sign codepoint -> name suffix (matches glyphset convention)
VOWEL_SIGNS = {
    0x0DCF: "aa", 0x0DD0: "ae", 0x0DD1: "aae",
    0x0DD2: "I", 0x0DD3: "Ii", 0x0DD4: "U", 0x0DD6: "Uu",
    0x0DD8: "vocalicr",
    0x0DD9: "e", 0x0DDA: "ee", 0x0DDB: "ai",
    0x0DDC: "o", 0x0DDD: "oo", 0x0DDE: "au",
    0x0DF2: "vocalicrr", 0x0DF3: "vocalicll",
}


@dataclass
class Candidate:
    name: str | None      # expected precomposed glyph name (without namespace), or None
    sequence: str         # the Unicode string to shape
    ligature: bool        # True if a single precomposed glyph is expected


def builtin_candidates() -> list[Candidate]:
    """Generate the regular Sinhala orthographic syllabary."""
    out: list[Candidate] = []

    # Independent vowels
    for cp, name in INDEPENDENT_VOWELS.items():
        out.append(Candidate(name, chr(cp), ligature=False))

    for ccp, cbase in CONSONANTS.items():
        cchar = chr(ccp)
        # Bare consonant (inherent vowel) — name is base + 'a'
        out.append(Candidate(cbase + "a", cchar, ligature=False))
        # Pure consonant (al-lakuna). Precomposed "touching"/al glyph expected.
        out.append(Candidate(cbase, cchar + AL, ligature=True))
        # Consonant + each vowel sign
        for scp, suffix in VOWEL_SIGNS.items():
            out.append(Candidate(cbase + suffix, cchar + chr(scp), ligature=True))
        # Rakaransaya: C + al + ZWJ + ra
        out.append(Candidate(cbase + "Ra", cchar + AL + ZWJ + chr(0x0DBB),
                             ligature=True))
        # Yansaya: C + al + ZWJ + ya
        out.append(Candidate(cbase + "ya", cchar + AL + ZWJ + chr(0x0DBA),
                             ligature=True))

    return out


def load_candidates(path: Path) -> list[Candidate]:
    text = path.read_text(encoding="utf-8")
    out: list[Candidate] = []
    if path.suffix.lower() == ".json":
        data = json.loads(text)
        for item in data:
            if isinstance(item, str):
                out.append(Candidate(None, item, ligature=len(item) > 1))
            else:
                seq = item.get("sequence") or item.get("seq") or ""
                name = item.get("name")
                # A precomposed glyph is expected when the cluster is multi-codepoint
                lig = len(seq) > 1
                out.append(Candidate(name, seq, ligature=lig))
    else:
        for line in text.splitlines():
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            if "\t" in line:
                name, seq = line.split("\t", 1)
                out.append(Candidate(name or None, seq, ligature=len(seq) > 1))
            else:
                out.append(Candidate(None, line, ligature=len(line) > 1))
    return out


# ---------------------------------------------------------------------------
# Font / shaping
# ---------------------------------------------------------------------------

class FontProbe:
    def __init__(self, font_path: Path, namespace: str = "sinh"):
        self.path = font_path
        self.namespace = namespace
        blob = hb.Blob.from_file_path(str(font_path))
        face = hb.Face(blob)
        self.hbfont = hb.Font(face)

        tt = TTFont(str(font_path), fontNumber=0, lazy=True)
        self.glyph_order = set(tt.getGlyphOrder())
        # Codepoints the cmap can map directly
        self.cmap = set()
        try:
            self.cmap = set(tt.getBestCmap().keys())
        except Exception:
            pass
        tt.close()

    def expected_glyph_names(self, name: str) -> list[str]:
        """Possible glyph-order names for a candidate's expected glyph."""
        return [f"{name}-{self.namespace}", f"{self.namespace}.{name}", name]

    def has_glyph_named(self, name: str | None) -> bool:
        if not name:
            return False
        return any(n in self.glyph_order for n in self.expected_glyph_names(name))

    def shape(self, text: str):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        # Default feature set (no manual overrides — test real rendering)
        hb.shape(self.hbfont, buf, {})
        gids = [info.codepoint for info in buf.glyph_infos]
        names = [self.hbfont.glyph_to_string(g) for g in gids]
        return gids, names


# Status constants
SUPPORTED = "SUPPORTED"
PARTIAL = "PARTIAL"
GLYPH_PRESENT_NO_FEA = "GLYPH_PRESENT_NO_FEA"
UNSUPPORTED = "UNSUPPORTED"


def classify(probe: FontProbe, cand: Candidate) -> tuple[str, str]:
    """Return (status, note) for a candidate against the font."""
    gids, gnames = probe.shape(cand.sequence)

    # .notdef (gid 0) => at least one codepoint has no glyph at all
    if 0 in gids:
        # Distinguish "base codepoint missing" from "ligature not formed"
        missing = [c for c in cand.sequence
                   if not (ord(c) in probe.cmap or unicodedata.combining(c)
                           or c in (ZWJ, AL))]
        note = "no glyph for: " + " ".join(
            f"U+{ord(c):04X}" for c in missing) if missing else ".notdef in output"
        return UNSUPPORTED, note

    if not cand.ligature:
        # Simple unit (independent vowel / bare consonant): rendered = supported
        return SUPPORTED, f"{len(gids)} glyph(s)"

    # Ligature candidate: did shaping actually use the precomposed glyph?
    expected = probe.expected_glyph_names(cand.name) if cand.name else []
    used_expected = any(n in gnames for n in expected)

    if used_expected:
        return SUPPORTED, f"ligature -> {'+'.join(gnames)}"

    if cand.name and probe.has_glyph_named(cand.name):
        # The precomposed glyph is in the font but the shaper didn't reach it:
        # the OpenType feature that forms it is missing/broken.
        return GLYPH_PRESENT_NO_FEA, (
            f"glyph '{cand.name}' present but unused; shaped as {'+'.join(gnames)}")

    # Renders as separate components without notdef. Legible but not ligated.
    if len(gids) > 1:
        return PARTIAL, f"renders decomposed: {'+'.join(gnames)}"

    # Single glyph, no notdef, name unknown — treat as supported.
    return SUPPORTED, f"-> {'+'.join(gnames)}"


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Report which Sinhala orthographic units a font renders.")
    ap.add_argument("font", type=Path, help="Path to .ttf/.otf font file")
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--builtin", action="store_true",
                     help="Use the built-in Sinhala syllabary (default)")
    src.add_argument("--candidates", type=Path,
                     help="JSON (generate -f json) or text list of sequences")
    ap.add_argument("--namespace", default="sinh",
                    help="Glyph-name namespace used by the font (default: sinh)")
    ap.add_argument("--report", action="store_true",
                    help="Full tab-separated report instead of supported list")
    ap.add_argument("--status", default="SUPPORTED",
                    help="In default mode, which statuses to print "
                         "(comma list, or 'all'). Default: SUPPORTED")
    ap.add_argument("-o", "--output", type=Path, help="Write to file")
    args = ap.parse_args()

    if not args.font.exists():
        print(f"error: font not found: {args.font}", file=sys.stderr)
        return 1

    probe = FontProbe(args.font, namespace=args.namespace)

    if args.candidates:
        candidates = load_candidates(args.candidates)
    else:
        candidates = builtin_candidates()

    results = [(c, *classify(probe, c)) for c in candidates]

    lines: list[str] = []
    if args.report:
        lines.append("# sequence\tcodepoints\tstatus\tnote")
        for cand, status, note in results:
            cps = " ".join(f"U+{ord(ch):04X}" for ch in cand.sequence)
            lines.append(f"{cand.sequence}\t{cps}\t{status}\t{note}")
        # Summary
        counts: dict[str, int] = {}
        for _, status, _ in results:
            counts[status] = counts.get(status, 0) + 1
        lines.append("")
        lines.append("# summary: " + ", ".join(
            f"{k}={v}" for k, v in sorted(counts.items())))
    else:
        wanted = ({SUPPORTED, PARTIAL, GLYPH_PRESENT_NO_FEA, UNSUPPORTED}
                  if args.status.lower() == "all"
                  else {s.strip() for s in args.status.split(",")})
        seen: set[str] = set()
        for cand, status, _ in results:
            if status in wanted and cand.sequence not in seen:
                seen.add(cand.sequence)
                lines.append(cand.sequence)

    out = "\n".join(lines) + "\n"
    if args.output:
        args.output.write_text(out, encoding="utf-8")
        print(f"wrote {len(lines)} lines to {args.output}", file=sys.stderr)
    else:
        sys.stdout.write(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
