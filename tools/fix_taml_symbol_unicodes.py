# MENU: Scripts > LankaGlyphset > Fix Tamil symbol Unicodes
# -*- coding: utf-8 -*-
"""
Reassign the correct Unicode to renamed Tamil symbol glyphs (calendar/currency
marks). Run in the Macro panel with the font frontmost.
"""

# new glyph name -> Unicode code point (hex)
TAML_SYMBOL_UNICODES = {
    "signday-taml":     "0BF3",  # Tamil day sign
    "signmonth-taml":   "0BF4",  # Tamil month sign
    "signyear-taml":    "0BF5",  # Tamil year sign
    "signdebit-taml":   "0BF6",  # Tamil debit sign
    "signcredit-taml":  "0BF7",  # Tamil credit sign
    "signasabove-taml": "0BF8",  # Tamil as-above sign
    "signnumber-taml":  "0BFA",  # Tamil number sign
    "indianrupee-taml": "0BF9",  # Tamil rupee sign
}

font = Glyphs.font
fixed, missing = 0, []
for name, uni in TAML_SYMBOL_UNICODES.items():
    g = font.glyphs[name]
    if g is None:
        missing.append(name)
        continue
    if g.unicode != uni:
        g.unicode = uni
        fixed += 1

print("Reassigned Unicode for %d Tamil symbol glyph(s)." % fixed)
if missing:
    print("Not found in font (skipped): %s" % ", ".join(missing))
