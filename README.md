# Lanka glyphsets by Mooniak (WIP)

Lanka Glyphsets project by Mooniak aims to define glyphsets for fonts made targeting Sri Lankan users and audeinces. This is a work-in-progress project.


## PRINCIPALS


## NAMING STANDARD

An underscore (_) joins existing glyphs to form a ligature of those glyphs, while a dot (.) appends a suffix to an existing glyph to form a variant of that glyph.


1. Namespaces: 'sinh' and 'taml'
2. Sinhala pillam (aka vowel signs, matras) are called `signs` and are indicated with the phonetic indeicator of the sign suffiexd by `-sign`
 ```
    - aa-sign: # (aela-pilla)
    - aae-sign: # (diga aeda-pilla)
    - i-sign: #(is-pilla)
    - ae-sign: # (aeda-pilla)
    - ii-sign: #(diga is-pilla)
    - u-sign.02: ( u-sign after rakar)
    - uu-sign.02: ( uu-sign after rakar)
    - u-sign_al-sign:
    ...
```
Alternative signs

   
```
    - i-sign.alt1
    - ii-sign.alt2
    - i-sign.alt2
    - ii-sign.alt1
    ...
```

3. Special signs are al-alkuna (THe vowel killer sign similar virama or halant), rakaranasaya (post base`ra), repaya (pre base `ra` ) and Yanasaya (post base `ya`). These are named as follwoing.

```
    - al-sign
    - rakr-sign
    - repa-sign
    - yans-sign
```

4. Consonant-vowel ligatures 

```
    ka-i
    na-ii
    n-u
    p-uu

```
5. Rakar ligatures 

```
    ka_rakr
    ka_rakr-ii
    ma_rakr
    ma-rakr-i
```

6. Ligated conjuncts (සංයෝග අකුරු Sanyoga Akuru)

```
ka_ssa
na_da
da_va
ba_ba

na_da-i
na-da-rakar-ii
```

7. Touching conjuncts (බැඳි අකුරු Bendi Akuru)

```
da_va.tuch
da_va-ii.tuch
ba_ba.tuch

```


8. Historical and stylistic alternates  (බැඳි අකුරු Bendi Akuru)

```
fa.altn #Historical Fa form (පf)\
e-sign.altn 

```


Below base forms of pillam following Da forms (දා දැ දැ ඳෝ ද්‍ය ද්‍ය ද්‍යා ඤා ඤැ ඤැ ඥැ ඥැ ඥෝ) 

```
da_aa-sign.belw
da_yans-sign.belw

```

9. 

da_aa-sign-sinh


n_da_rakar-i
na_da_rakar-i

da_va_rakar-ii

al-sign.2-sign

da_rakar-i-sinh
da_rakar-ii-sinh
ka_va
ka_ssa_repaya


### Sinhala






**Requierd ligature glyphs** 
  - Consonant-vowel ligatures

**Other glyphs** 
  - Rakar consonant clusters + modifier signs  
  - Ligated conjuncts + modifier signs
  - Touching consonants + modifier signs
  - Complex forms


### Sinhala 0 — Kernal
  - Consonants 41
  - Independent vowels 16
  - Semi Consonants  2
  - Sinhala Pillam (Consonants modifier signs) 13					
- rakaransaya
- yanasaya

### Sinhala 1 — Core
- Sinhala Unicode block 
- Requierd ligature glyphs
- Touching consonant clusters implemented with dist feature
- ක්‍ෂ 

- Kundaliya (Sinhala puncuation sign)

### Sinhala 2 — Plus
  - Common ligated conjuncts (සංයෝග අකුරු sanyoga akuru)

### Sinhala 3 — Pro
  - Below base forms of pillam following Da forms (දා දැ දැ ඳෝ ද්‍ය ද්‍ය ද්‍යා ඤා ඤැ ඤැ ඥැ ඥැ ඥෝ) 
  - Historical Fa form (පf)
  - Historical kombuwa
  - Rare ligated conjuncts (සංයෝග අකුරු sanyoga akuru) ඞ්‍ග, ච්‍ච, ඤ්‍ච, ඤ්‍ඡ, ඤ්‍ජ, ණ්‍ඩ, බ්‍බ, ම්‍බ
- Sinhala Archaic Numbers   - 20
— Sinhala Astrological Numbers - 10
  - Touching consonant clusters (බැඳි අකුරු bandi akuru)

***

## Sinhala fonts level definition by ICTA
Sinhala fonts are standardized into three different levels by ICTA, but this definition is only based on the functionality and it does not provide a clear identification of number of glyphs or coverage. We will try to define these here.			

Qoted from ICTA documentation 
TODO: Add links

```
**Level 1 fonts**
These fonts commonly used vowels, consonants and consonants with modifiers and they are intended to be used in mobile devices. This level supports special characters such as yansaya,rakaransaya and repaya and “ක්ෂ”**

**Level 2 fonts** 
These fonts shall have all the features of level one font and additionally support existing combination of Sinhala consonants with repaya. These fonts are intended for general applications such as documents and books.  

**Level 3 fonts**
These fonts support special characters and all combinations of strokes with conjuncts including “repaya+ispilla” combinations and touching conjuncts. These fonts fully support Pali and Sanskrit langauges and are intended for historic or classical Sinhala documents.
```