# Sinhala glyphs sorting for font development

This is deloping a set of filters for sorting various sinhala text strings for testing in font development.

Two kinds of glpyhs, these might vary depending on the project and designer preference.;

- Atomically-designed glyphs (with outlines or refrences to other glpyhs, 
  - almost all orthographic ligatures in level 0 will need to atomically deisgned) 
  - Almost all ි combinations may be atomically designed for higher quality
    - ි has three typographic forms minimum
    - ු has thwo typographic forms
    - ෙ ෛ ෘ ෑ ෑ combinations do not need to be atomically designed as these marks are spacing
  - Only some of 
- Ot composite glpyhs (Composed using gpos)
  - ්‍ර", "ර්‍" combiantions may or may not be OT composits


Groups basd on elements;



Bases:
  pimary shape groups:
    ග: ක ග ඝ ඟ ඤ ඥ ණ ත න භ ශ හ
    ට: ඔ ඕ ච ට ඩ ඞ ධ ඬ ව ම ඹ
    එ: එ ඒ ඨ ඪ ඵ
    බ: ඛ බ
    ප: ජ ඡ ඦ ය ල ළ ස ෂ ෆ ඉ ඊ ඍ ඎ ඏ ඐ ර
    උ: අ උ ද ඳ
    ර: ර ඊ රි ර් රැ රී රූ
    ටි: ටී චී ඩී
    ග්‍රි: ක්‍රී ච්‍රී ප්‍රී ශ්‍රී දු

  elements:
    eye_ka: ක ත න භ හ
    eye_line: එ ච ඩ ඝ ඪ භ ස
    loop: ඔ ම ඹ
    trap: එ ඒ ඨ ථ ඪ ඵ ව
    hang: ඤ ඥ ඟ ඬ ඳ
    diagonal: ජ ජ ඡ ඦ ණ ඦ ර ඊ රි ර් රැ රී රූ

  density:
    high: ඉ ණ ඔ ඕ ඝ ඥ ම ඹ ෂ
    medium: ක ඊ ළ
    low: ට ථ ර ෆ උ ඵ


  simialr-right-side:
  - ක ත ග ඟ ණ න භ ශ හ ෆ ඉ ා ෘ ෟ
  - ජ ඦ ර ඊ
  - ට ච ධ ව ඩ ඣ
  - ඨ ථ එ ඪ ඵ
  - ඔ ඕ ඛ බ ධ ච ඩ ඣ ඬ ම ඹ
  - ප ය ඝ ස ෂ
  - අ ල ළ
  - උ ද ඤ ඥ ඳ ැ ෑ ්‍

  simialr-left-side:
  - ක ත ණ න ඣ
  - ග ඟ ඤ ඥ ඦ ශ ඬ ඳ ඏ ෙ
  - එ ච ඩ ඝ ඪ භ ස
  - ට ධ ඛ බ
  - ඔ ඕ ම ඹ
  - ජ ඨ ථ ය ර ඊ ල ඉ ළ ෆ
  - අ උ ප ඡ ද ව හ ඵ ස ෂ

Ligatures:
  pimary shape groups:
    ක්: ක් ග් ඝ් ඟ් ඤ් ඥ් ණ් ත් ද් න් ප් භ් ය් ර් ල් ශ් ෂ් ස් හ් ළ් ෆ් ක්‍ෂ් ත්‍ථ් ත්‍න් ද් න්‍ද්
    ඛ්: ඛ් 
    කි: කි ති නි	කී තී නී
    ගි: ඟි ශි ෆි	ගී ඟී ශී ෆී
    ඡි: ජි ඦි	ඡී ජී ඦී
    ඨි: ඪි ථි ඵි ට්‍ඨි ත්‍ථි න්‍ථි	ඨී ඪී ථී ඵී ට්‍ඨී ත්‍ථී න්‍ථී
    දි: ද්‍රි	දී ද්‍රී
    ඳි: ඳ්‍රි	ඳි ඳී ඳ්‍රົ ඳົ
    භි: හි	භී හී
    ඤ: ඥි න්‍දි න්‍ද්‍රි	ඤී ඥී න්‍දී න්‍ද්‍රී
    ලි: ළි ලී ළී
    පි: ෂි ක්‍ෂි පී ෂි ෂී ක්‍ෂි
    ඝි: සි	ඝී සී
    පු: 

da-forms : ද ඳ ඤ ඥ න්‍ද

position:
    body: ා ැ ෑ ෘ ෟ ෛ ො ෝ ෞ
    above: ි ී
    below: ු ූ 



