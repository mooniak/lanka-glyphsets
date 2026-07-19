# Glyphset levels

Lanka Glyphsets defines four cumulative Sinhala levels, plus a Tamil glyphset. Each
level is a superset of the one before it — `sinhala-1-core.yaml` includes every
glyph in `sinhala-0-kernel.yaml`, and so on.

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
