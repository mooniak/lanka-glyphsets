# Glyphset levels

Lanka Glyphsets defines four cumulative Sinhala levels and three cumulative Tamil
levels. Each level is a superset of the one before it — `sinhala-1-core.yaml`
includes every glyph in `sinhala-0-kernel.yaml`, and so on. The Tamil levels are
described after the Sinhala ones and are independent of them.

- **Sinhala-0: Kernel** — Minimal character set with essential consonants, vowels, and basic signs for fundamental Sinhala text display.
- **Sinhala-1: Core** — Standard coverage for mobile devices with common ligatures and basic conjuncts like ක්‍ෂ.
- **Sinhala-2: Plus** — Extended support with common ligated conjuncts (සංයෝග අකුරු) for general documents and books.
- **Sinhala-3: Pro** — Complete coverage including historical forms, rare conjuncts, and full Pali/Sanskrit support for classical texts.

The Lanka Glyphsets levels (Sinhala 0-3) correspond directly to ICTA's classification: Sinhala 1, 2, and 3 map to ICTA Level 1, 2, and 3 respectively. Sinhala 0 (Kernel) is an additional minimal level introduced by this project for basic character support.

## Sinhala Glyphset Comparison

| Feature | Sinhala 0 — Kernel | Sinhala 1 — Core | Sinhala 2 — Plus | Sinhala 3 — Pro |
|---------|-------------------|------------------|------------------|-----------------|
| **Target Use** | Basic text display | Mobile devices | Documents & books | Classical texts |
| **Base Characters** | Consonants (41), Independent vowels (16), Semi-consonants (2) | Full Sinhala Unicode block | *Inherits from Core* | *Inherits from Plus* |
| **Pillam (Modifier Signs)** | 13 basic signs | ✓ | ✓ | ✓ |
| **Special Signs** | rakaransaya, yansaya, repaya | ✓ | ✓ | ✓ |
| **Consonant-Vowel Ligatures** | — | Required ligatures | ✓ | ✓ |
| **Touching Clusters** | — | Via `dist` feature | ✓ | බැඳි අකුරු (bandi akuru) |
| **Basic Conjuncts** | — | ක්‍ෂ | ✓ | ✓ |
| **Common Ligated Conjuncts** | — | — | සංයෝග අකුරු (sanyoga akuru) | ✓ |
| **Rare Ligated Conjuncts** | — | — | — | ඞ්‍ග, ච්‍ච, ඤ්‍ච, ඤ්‍ඡ, ඤ්‍ජ, ණ්‍ඩ, බ්‍බ, ම්‍බ |
| **da-like Below-base Forms** | — | — | — | දා දැ ඳෝ ද්‍ය ද්‍යා ඤා ඤැ ඥැ ඥෝ |
| **Historical Forms** | — | — | — | Fa form (පf), Historical kombuwa |
| **Punctuation** | — | Kundaliya | ✓ | ✓ |
| **Archaic Numbers** | — | — | — | 20 glyphs |
| **Astrological Numbers** | — | — | — | 10 glyphs |

## Tamil levels

- **Tamil-0: Kernel** — The full Tamil Unicode block, the shaping controls (ZWJ, ZWNJ, dotted circle) and punctuation, plus the forms that cannot be made by placing a sign: டி டீ, the 36 native consonant + ு/ூ forms, க்ஷ and ஸ்ரீ.
- **Tamil-1: Core** — The ி/ீ mechanism for every consonant, the Grantha letters with ு/ூ, and க்ஷ with vowel signs.
- **Tamil-2: Pro** — The traditional (pre-1978) orthography, and the alternate ra.

Unlike Sinhala, there is no ICTA classification to follow. These levels are
**working definitions**: the split of Grantha ு/ூ and the traditional forms still
needs sign-off from a Tamil type specialist. See [tamil-decisions.md](tamil-decisions.md).

## Tamil Glyphset Comparison

| Feature | Tamil 0 — Kernel | Tamil 1 — Core | Tamil 2 — Pro |
|---------|------------------|----------------|---------------|
| **Target Use** | Basic text display | Professional typography | Heritage and classical text |
| **Unicode block** | All 72 assigned characters (U+0B80–0BFF) | *Inherits from Kernel* | *Inherits from Core* |
| **Shaping and punctuation** | ZWJ, ZWNJ, dotted circle, punctuation | ✓ | ✓ |
| **ி / ீ** | டி டீ | Every consonant (glyph or shape-group alternate) | ✓ |
| **ு / ூ** | 18 native consonants (36 forms) | Grantha ஜ ஷ ஸ ஹ and க்ஷ (10 forms) | ✓ |
| **Conjuncts** | க்ஷ, ஸ்ரீ | க்ஷ + ி ு ூ | ✓ |
| **Traditional orthography** | — | — | ணா னா றா, ணை னை லை ளை |
| **Alternate ra** | — | — | `ra-taml.alt` |
| **Entries** | 150 | 31 | 8 |

A consonant + sign form is met either by its own glyph or by the sign alternate of
its shape group (`kI-taml`, or `isign-taml.ka`). The rule is in
[naming-standard.md](naming-standard.md#4-consonant--vowel-sign-forms).

## Glyph Categories

**Required ligature glyphs**
  - Consonant-vowel ligatures

**Other glyphs**
  - Rakar consonant clusters + modifier signs
  - Ligated conjuncts + modifier signs
  - Touching consonants + modifier signs
  - Complex forms

---

## A word about Sinhala fonts level definitions by ICTA

Sinhala fonts are standardized into three different levels by ICTA, but this definition is only based on the functionality and it does not provide a clear identification of number of glyphs or coverage. We will try to define these here.

Quoted from ICTA documentation
TODO: Add links

```
**Level 1 fonts**
These fonts commonly used vowels, consonants and consonants with modifiers and they are intended to be used in mobile devices. This level supports special characters such as yansaya,rakaransaya and repaya and "ක්ෂ"**

**Level 2 fonts**
These fonts shall have all the features of level one font and additionally support existing combination of Sinhala consonants with repaya. These fonts are intended for general applications such as documents and books.

**Level 3 fonts**
These fonts support special characters and all combinations of strokes with conjuncts including "repaya+ispilla" combinations and touching conjuncts. These fonts fully support Pali and Sanskrit languages and are intended for historic or classical Sinhala documents.
```
