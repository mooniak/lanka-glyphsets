/*
 * converter.js — UI glue for the LankaGlyphset ⇄ Unicode converter.
 * Uses the shared engine on `window.LankaGlyphset` (lankaglyphset-map.js).
 */
(function () {
  "use strict";
  var L = window.LankaGlyphset;

  // Per-script samples and wording. The engine picks the script from the text or the
  // name's namespace; the toggle passes it explicitly so a bare name resolves too.
  var SCRIPTS = {
    sinhala: {
      label: "Sinhala", ns: "-sinh",
      uni: ["ක", "කි", "ක්", "ක්‍ර", "ක්‍ෂ", "ක්‍රි", "දා", "ඤා", "රැ",
        "කර්‍", "න්‍ද්‍ර", "ර්‍", "අ", "ා", "ඉ"],
      name: ["ka-sinh", "kI-sinh", "k-sinh", "kRa-sinh", "kSsa-sinh",
        "kRI-sinh", "daa._c-sinh", "nyaa._c-sinh", "rAe-sinh", "ka_repha-sinh",
        "nDRa-sinh", "repha-sinh", "a-sinh", "aasign-sinh"],
      phUni: "කි\nක්‍ර\nක්‍ෂ\nදා",
      phName: "kRa-sinh\nkSsa-sinh\nka\ndaa._c-sinh",
      textHint: "Type or paste Sinhala text above."
    },
    tamil: {
      label: "Tamil", ns: "-taml",
      uni: ["க", "கி", "க்", "டி", "பு", "னூ", "கா", "கொ", "க்ஷ", "க்ஷி", "ஸ்ரீ", "ஶ்ரீ",
        "அ", "ஔ", "ஃ", "௧", "௹"],
      name: ["ka-taml", "kI-taml", "k-taml", "ttI-taml", "pU-taml", "nnnUu-taml", "kSsa-taml",
        "shree-taml", "isign-taml.ka", "usign-taml.pa", "ra-taml.alt", "one-taml", "au-taml"],
      phUni: "கி\nடி\nக்ஷ\nஸ்ரீ",
      phName: "kI-taml\nkSsa-taml\nka\nisign-taml.ka",
      textHint: "Type or paste Tamil text above."
    }
  };
  var script = "sinhala";
  function opts() { return { script: script }; }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("show"); }, 1400);
  }

  function copy(text, label) {
    if (!text) { toast("Nothing to copy"); return; }
    navigator.clipboard.writeText(text).then(
      function () { toast((label || "Copied") + " ✓"); },
      function () { toast("Copy failed"); }
    );
  }

  function badge(kind, tier) {
    if (kind === "canon") return '<span class="badge canon">' + esc(tier || "canonical") + '</span>';
    if (kind === "flag") return '<span class="badge flag">derived</span>';
    return '<span class="badge err">unresolved</span>';
  }

  // Split free-form input into entries. Whitespace/commas separate tokens; inside a
  // token, greedy longest-match against the engine splits unseparated runs
  // (e.g. "කකිදා" or "kakIdaa"). `ok(str)` says whether the engine resolves it.
  function segment(raw, ok, maxLen) {
    var out = [];
    raw.split(/[\s,;،、]+/).forEach(function (tok) {
      if (!tok) return;
      var chars = Array.from(tok), i = 0;
      if (ok(tok)) { out.push(tok); return; }
      while (i < chars.length) {
        var n = Math.min(maxLen, chars.length - i), took = 0;
        for (; n > 0; n--) {
          if (ok(chars.slice(i, i + n).join(""))) { took = n; break; }
        }
        if (!took) took = 1;
        out.push(chars.slice(i, i + took).join(""));
        i += took;
      }
    });
    return out;
  }
  function okUni(s) { return !L.unicodeToName(s, opts()).error; }
  function okName(s) { return !L.nameToUnicode(s, opts()).error; }

  // ---- Unicode -> Name ----
  var uniResults = [];   // resolved names for "copy all"
  function runUni() {
    var raw = document.getElementById("in-uni").value;
    var lines = segment(raw, okUni, 10);
    var rows = [], nCanon = 0, nFlag = 0, nErr = 0;
    uniResults = [];
    lines.forEach(function (line) {
      var s = line.trim();
      if (s === "") return;
      var r = L.unicodeToName(s, opts());
      if (r.error) {
        nErr++;
        rows.push('<tr><td class="glyph">' + esc(s) + '</td><td class="cp">' +
          esc(r.hex || L.hex(s)) + '</td><td>' + badge("err") +
          '</td><td class="note">no name rule matched</td></tr>');
      } else {
        r.canonical ? nCanon++ : nFlag++;
        uniResults.push(r.name);
        rows.push('<tr class="copyable" data-copy="' + esc(r.name) + '">' +
          '<td class="glyph">' + esc(s) + '</td>' +
          '<td class="cp">' + esc(L.hex(s)) + '</td>' +
          '<td><span class="name">' + esc(r.name) + '</span> ' +
          badge(r.canonical ? "canon" : "flag", r.tier) + '</td>' +
          '<td class="note">' + esc(r.note || "") + '</td></tr>');
      }
    });
    var out = document.getElementById("out-uni");
    if (!rows.length) { out.innerHTML = '<div class="empty">' + SCRIPTS[script].textHint + '</div>'; }
    else {
      out.innerHTML = '<table><thead><tr><th>Glyph</th><th class="mono">Codepoints</th>' +
        '<th>LankaGlyphset name</th><th>Note</th></tr></thead><tbody>' +
        rows.join("") + '</tbody></table>';
    }
    document.getElementById("sum-uni").innerHTML =
      '<b>' + uniResults.length + '</b> resolved · <b>' + nCanon + '</b> canonical · <b>' +
      nFlag + '</b> flagged · <b>' + nErr + '</b> unresolved';
  }

  // ---- Name -> Unicode ----
  var nameResults = [];
  function runName() {
    var lines = segment(document.getElementById("in-name").value, okName, 40);
    var rows = [], ok = 0, nErr = 0;
    nameResults = [];
    lines.forEach(function (line) {
      var s = line.trim();
      if (s === "") return;
      var r = L.nameToUnicode(s, opts());
      if (r.error) {
        nErr++;
        rows.push('<tr><td>' + esc(s) + '</td><td class="glyph">—</td>' +
          '<td class="cp"></td><td>' + badge("err") + '</td></tr>');
      } else {
        ok++;
        nameResults.push(r.unicode);
        rows.push('<tr class="copyable" data-copy="' + esc(r.unicode) + '">' +
          '<td class="name">' + esc(s) + '</td>' +
          '<td class="glyph">' + esc(r.unicode) + '</td>' +
          '<td class="cp">' + esc(r.hex) + '</td>' +
          '<td>' + badge(r.canonical ? "canon" : "flag", r.tier) +
          (r.variant ? ' <span class="note">alternate "' + esc(r.variant) + '" — shows the base glyph</span>' : '') +
          '</td></tr>');
      }
    });
    var out = document.getElementById("out-name");
    if (!rows.length) { out.innerHTML = '<div class="empty">Type or paste glyph names above.</div>'; }
    else {
      out.innerHTML = '<table><thead><tr><th>Name</th><th>Glyph</th>' +
        '<th class="mono">Codepoints</th><th>Status</th></tr></thead><tbody>' +
        rows.join("") + '</tbody></table>';
    }
    document.getElementById("sum-name").innerHTML =
      '<b>' + ok + '</b> resolved · <b>' + nErr + '</b> unresolved';
  }

  // ---- wiring ----
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      document.querySelectorAll(".panel").forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      document.getElementById("panel-" + tab.dataset.mode).classList.add("active");
    });
  });

  document.getElementById("in-uni").addEventListener("input", runUni);
  document.getElementById("in-name").addEventListener("input", runName);

  document.querySelectorAll("[data-sample]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.sample === "uni") { document.getElementById("in-uni").value = SCRIPTS[script].uni.join("\n"); runUni(); }
      else { document.getElementById("in-name").value = SCRIPTS[script].name.join("\n"); runName(); }
    });
  });

  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.copy === "names") copy(uniResults.join("\n"), uniResults.length + " names copied");
      else if (b.dataset.copy === "strings") copy(nameResults.join("\n"), nameResults.length + " strings copied");
    });
  });

  // Row click-to-copy (delegated).
  document.body.addEventListener("click", function (e) {
    var tr = e.target.closest("tr.copyable");
    if (tr && tr.dataset.copy) copy(tr.dataset.copy, "Copied");
  });

  // Script toggle: swap wording and placeholders, clear the inputs, and re-run.
  function setScript(next) {
    script = next;
    var def = SCRIPTS[script];
    document.body.classList.toggle("tamil", script === "tamil");
    document.querySelectorAll(".script-tab").forEach(function (t) {
      t.classList.toggle("active", t.dataset.script === script);
    });
    document.getElementById("lbl-uni-script").textContent = def.label;
    document.getElementById("lbl-ns").textContent = def.ns;
    document.getElementById("in-uni").placeholder = def.phUni;
    document.getElementById("in-name").placeholder = def.phName;
    document.getElementById("in-uni").value = "";
    document.getElementById("in-name").value = "";
    runUni(); runName();
  }
  document.querySelectorAll(".script-tab").forEach(function (t) {
    t.addEventListener("click", function () { setScript(t.dataset.script); });
  });

  setScript("sinhala");
})();
