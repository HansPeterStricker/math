// German/English language switching for the pages of the project.
//
// Choice of language: parameter `?lang=en` or `?lang=de` in the address, otherwise the most recently chosen
// language
// (localStorage), otherwise German. The switcher at the bottom left reloads the page with the other parameter.
//
// Translations:
// - Data: window.EN_TEXTS = { <hash of the German text>: "English text" }, generated from translations/arbeit/*.json
//   (see translations/README.md). I18N.data(obj) replaces, on loading, all texts of a data object whose hash is listed
//   there. Fields with identifiers and codes (CODE_FIELDS) stay unchanged.
// - Interface: window.EN_UI = { "German text": "English text", "#identifier": "English HTML" }.
//   I18N.t("German text") returns the English version; on loading, elements with data-t="identifier" receive
//   the HTML from EN_UI["#identifier"], elements with data-t-title="identifier" receive the title attribute from
//   EN_UI["#identifier"].
//   The page title is stored under EN_UI["#title"].
// Missing translations stay German and are collected in I18N.missing (console: I18N.missing).
//
// Order of the scripts on a page: data files, translations/en-alle.js, translations/ui-*.js, translations/sprache.js,
// page code.
// sprache.js translates the known data objects (DATA_OBJECTS) immediately on loading.

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(null);
  else root.I18N = factory(root);
})(typeof window !== "undefined" ? window : this, function (w) {
  "use strict";

  // Keys whose values are identifiers, codes or references and are never translated.
  const CODE_FIELDS = new Set(["id", "from", "to", "premises", "kind", "type", "state", "area", "msc", "methods",
    "ag", "large", "gallery", "lists", "status", "ref", "border", "target", "a", "b", "an", "flags", "water",
    "category", "verification", "share", "lean", "company", "climate", "majorField", "color", "date", "key",
    "url", "image", "link", "name_de", "uses", "theoremConcepts", "kinds", "route", "drawing", "also",
    "specialCaseOf", "form", "source", "direction", "isA",
    // historical name of a theorem (map 1830, step P2): shown in the original language, never translated
    "historicalName",
    // province keys of a correspondence side (map 1830 uses words like "algebra")
    "provinces",
    // "kategorie" was the former name of the field `category`; it is also the id of a concept in
    // verstaendlichkeit.js, whose entry was therefore skipped. Kept so that the set of translated texts stays the same.
    "kategorie"]);

  // Code keys under which some files hold lists or tables of objects with visible texts
  // (AG.methods, AR.methods, GREAT_PROBLEMS.lists, GREAT_PROBLEMS.status; AREA_TEXTS.provinces holds the texts of the
  // provinces, while `provinces` of map 1830 is a list of keys).
  const ALSO_LISTS = new Set(["methods", "lists", "status", "kinds", "provinces"]);

  // Keys under which, depending on the file, there is either a code (lowercase, without spaces, e.g. `hoehen`) or a
  // visible
  // text (source references of the gallery, fields of the table of great theorems). Codes are not translated.
  // `tacit` (map 1830) holds node ids or short German notes.
  const MIXED_FIELDS = new Set(["source", "field", "tacit"]);

  // Data objects that are translated on loading, if present.
  const DATA_OBJECTS = ["AG", "AG_LARGE", "AR", "AG_COMPR", "AR_COMPR", "ARXIV_FIELDS", "GREAT_PROBLEMS", "WORLD_MAP", "LANGLANDS",
    "NEIGHBORHOOD", "CITY", "ALGGEO", "CITY_PLAN", "AG_CONCEPTS", "AG_CONCEPTS_LARGE", "AR_CONCEPTS", "GALLERY", "THEORY", "AREA_TEXTS"];

  // cyrb53: 53-bit hash of a text, as a string in base 36.
  function hash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  // Translatable texts: at least three consecutive letters; formulas only if \text{…} contains words.
  function translatable(s, key) {
    if (typeof s !== "string" || !/[A-Za-zÄÖÜäöüß]{3}/.test(s)) return false;
    if (/^https?:\/\//.test(s)) return false;
    if (MIXED_FIELDS.has(key) && /^[a-z0-9_.-]+$/.test(s)) return false;
    // Formulas in LaTeX only if \text{…} contains words; plain-text formulas (gallery, without backslash) are
    // treated like texts.
    if (key === "formula" && s.includes("\\")) return /\\(text|mbox|textrm|textit)\s*\{[^}]*[A-Za-zÄÖÜäöüß]{2}/.test(s);
    return true;
  }

  // Calls f(text, key, object, fieldKey) for every translatable text in obj. Keys from CODE_FIELDS are
  // skipped if their value is a text or a list of simple values.
  function traverse(obj, f) {
    (function walkOn(o, key) {
      if (Array.isArray(o)) { o.forEach((x, i) => { if (typeof x === "string") { if (translatable(x, key)) f(x, key, o, i); } else walkOn(x, key); }); return; }
      if (!o || typeof o !== "object") return;
      Object.keys(o).forEach((k) => {
        const v = o[k];
        // Code fields are skipped. Exception: under the keys in ALSO_LISTS, some files hold
        // lists of objects with visible names (e.g. `methods` with id, name, text); these are traversed.
        if (CODE_FIELDS.has(k) && !(ALSO_LISTS.has(k) && v && typeof v === "object" && Object.values(v).some((x) => x && typeof x === "object"))) return;
        if (typeof v === "string") { if (translatable(v, k)) f(v, k, o, k); }
        else walkOn(v, k);
      });
    })(obj, "");
  }

  if (!w) return { hash, translatable, traverse, CODE_FIELDS, DATA_OBJECTS };

  // ---- Browser ----
  let param = null, stored = null;
  // A page with a fixed language sets window.LANG_FIXED ("en" or "de") before this script: the address and the stored
  // choice are ignored, nothing is stored and there is no switch DE | EN (draft 10 of the map, plan step 1.5).
  const fixed = w.LANG_FIXED === "en" || w.LANG_FIXED === "de" ? w.LANG_FIXED : null;
  try { param = new URLSearchParams(w.location.search).get("lang"); } catch (e) { /* without address */ }
  try { stored = w.localStorage.getItem("sprache"); } catch (e) { /* without storage */ }
  if (param && !fixed) { try { w.localStorage.setItem("sprache", param); } catch (e) { /* without storage */ } }
  const code = (fixed || param || stored || "de") === "en" ? "en" : "de";
  const en = code === "en";
  const missing = [];

  const texts = () => w.EN_TEXTS || {};
  const ui = () => w.EN_UI || {};

  // Translation of an interface text (or data text). Unchanged in German.
  function t(de) {
    if (!en || typeof de !== "string") return de;
    const u = ui();
    if (Object.prototype.hasOwnProperty.call(u, de)) return u[de];
    const x = texts()[hash(de)];
    if (x !== undefined) return x;
    if (/[A-Za-zÄÖÜäöüß]{3}/.test(de) && missing.length < 2000 && !missing.includes(de)) missing.push(de);
    return de;
  }

  // Translates all texts of a data object in place. The German name is kept in name_de,
  // because some pages merge nodes from different files by their name.
  function data(obj) {
    if (!en || !obj) return obj;
    const tx = texts();
    traverse(obj, (s, key, o, fieldKey) => {
      const x = tx[hash(s)];
      if (x === undefined) { if (missing.length < 2000 && !missing.includes(s)) missing.push(s); return; }
      if (fieldKey === "name" && !Array.isArray(o) && o.name_de === undefined) o.name_de = s;
      o[fieldKey] = x;
    });
    return obj;
  }

  // Translates the marked elements of the page.
  function dom(rootEl) {
    if (!en) return;
    const u = ui(), r = rootEl || w.document;
    r.querySelectorAll("[data-t]").forEach((el) => {
      if (el.dataset.tFertig) return;
      el.dataset.tFertig = "1";
      const x = u["#" + el.getAttribute("data-t")];
      if (x !== undefined) el.innerHTML = x; else missing.push("#" + el.getAttribute("data-t"));
    });
    r.querySelectorAll("[data-t-title]").forEach((el) => {
      const x = u["#" + el.getAttribute("data-t-title")];
      if (x !== undefined) el.setAttribute("title", x);
    });
    if (!rootEl) {
      if (u["#title"]) w.document.title = u["#title"];
      w.document.documentElement.setAttribute("lang", "en");
    }
  }

  // Address of the same page in the other language (the hash is kept).
  function address(target) {
    const a = new URL(w.location.href);
    a.searchParams.set("lang", target);
    return a.toString();
  }

  function switcher() {
    if (fixed || w.document.getElementById("sprache-umschalter")) return;
    const b = w.document.createElement("div");
    b.id = "sprache-umschalter";
    b.setAttribute("style", "position:fixed;bottom:8px;left:10px;z-index:9999;font:13px/1 system-ui,sans-serif;" +
      "background:rgba(255,253,246,.92);border:1px solid #b9ac8f;border-radius:4px;padding:4px 6px;color:#3a2a1c;");
    const button = (c, text) => c === code
      ? `<b style="padding:0 4px">${text}</b>`
      : `<a href="#" data-lang="${c}" style="padding:0 4px;color:#6b5a3a;text-decoration:none">${text}</a>`;
    b.innerHTML = button("de", "DE") + "|" + button("en", "EN");
    b.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-lang]");
      if (!a) return;
      e.preventDefault();
      try { w.localStorage.setItem("sprache", a.dataset.lang); } catch (x) { /* without storage */ }
      w.location.href = address(a.dataset.lang);
    });
    w.document.body.appendChild(b);
  }

  const SP = { code, en, hash, t, data, dom, switcher, address, missing, traverse, CODE_FIELDS };

  DATA_OBJECTS.forEach((n) => { if (w[n]) data(w[n]); });
  if (w.document && w.document.body) { dom(); switcher(); }
  if (w.document) w.document.addEventListener("DOMContentLoaded", () => { dom(); switcher(); });
  return SP;
});
