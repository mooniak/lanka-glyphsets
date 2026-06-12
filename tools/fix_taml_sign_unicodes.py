# MENU: Scripts > LankaGlyphset > Fix Tamil sign Unicodes
# -*- coding: utf-8 -*-
"""
Reassign the correct Unicode to renamed Tamil sign glyphs.

After renaming to LankaGlyphset names, Glyphs no longer recognises these Tamil
matra/sign names and clears their Unicode. Run this in the Macro panel (with the
font frontmost) to set them back.
"""

# new glyph name -> Unicode code point (hex)
TAML_SIGN_UNICODES = {
    "virama-taml":       "0BCD",  # pulli (virama)
    "anusvaraya-taml":   "0B82",  # anusvara
    "visargaya-taml":    "0B83",  # visarga / aytham
    "aasign-taml":       "0BBE",  # vowel sign AA
    "isign-taml":        "0BBF",  # vowel sign I
    "iisign-taml":       "0BC0",  # vowel sign II
    "usign-taml":        "0BC1",  # vowel sign U
    "uusign-taml":       "0BC2",  # vowel sign UU
    "esign-taml":        "0BC6",  # vowel sign E
    "eesign-taml":       "0BC7",  # vowel sign EE
    "aisign-taml":       "0BC8",  # vowel sign AI
    "osign-taml":        "0BCA",  # vowel sign O
    "oosign-taml":       "0BCB",  # vowel sign OO
    "ausign-taml":       "0BCC",  # vowel sign AU
    "aulengthmark-taml": "0BD7",  # au length mark
}

font = Glyphs.font
fixed, missing = 0, []
for name, uni in TAML_SIGN_UNICODES.items():
    g = font.glyphs[name]
    if g is None:
        missing.append(name)
        continue
    if g.unicode != uni:
        g.unicode = uni
        fixed += 1

print("Reassigned Unicode for %d Tamil sign glyph(s)." % fixed)
if missing:
    print("Not found in font (skipped): %s" % ", ".join(missing))
