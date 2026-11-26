// ============================================================
// mount.js — SATU-SATUNYA sistem routing URL lama -> struktur folder baru.
// Dipakai 404.html. GitHub Pages menyajikan 404.html untuk path yang tidak ada fisiknya
// (mis. /ppdb/, /portal/, /ppdb.html); skrip ini menerjemahkannya ke lokasi baru
// (mis. /pages/ppdb/) memakai tabel rute SITE.pages dari config.js, lalu location.replace().
// Folder-folder "index.html palsu" (/ppdb/, /sd/, ...) sudah dihapus; tidak ada lagi sistem routing kedua.
// Path yang tidak dikenal dibiarkan: halaman 404 asli (pencarian halaman) tetap tampil.
// ============================================================
(function () {
  "use strict";
  var S = window.SITE;
  if (!S || !S.pages) return;

  var ROOT = S.root, PAGES = S.pages;
  var HOME_ALIAS = { "": 1, index: 1, beranda: 1, home: 1 };

  // Path relatif terhadap ROOT, mis. "ppdb/", "ppdb.html", "login/", "admin.html"
  function relPath(pathname) {
    var base;
    try { base = new URL(ROOT, location.href).pathname; } catch (e) { return null; }
    var p = pathname == null ? location.pathname : pathname;
    if (p.indexOf(base) !== 0) return null;
    return p.slice(base.length);
  }

  // Mengembalikan URL tujuan (tanpa query/hash) atau null bila bukan URL lama yang dikenal.
  function resolve(rel) {
    if (rel == null) return null;
    var parts = rel.split("/").filter(Boolean);
    if (!parts.length) return ROOT;
    var first = parts[0].replace(/\.html?$/i, "").toLowerCase();
    if (first === "pages" || first === "assets" || first === "data") return null;   // path baru yang sah (tidak dialihkan)
    var rest = parts.slice(1);
    if (HOME_ALIAS[first] && !rest.length) return ROOT;
    if (first === "admin" && rest.length === 1 && rest[0].toLowerCase() === "login") return ROOT + PAGES.login.url;   // /admin/login -> /admin/login.html
    if (!PAGES[first]) return null;
    // hanya bentuk lama: /nama, /nama/, /nama.html, /nama/index.html
    if (rest.length > 1 || (rest.length === 1 && !/^index\.html?$/i.test(rest[0]))) return null;
    return ROOT + PAGES[first].url;
  }

  function go(target) { location.replace(target + location.search + location.hash); }

  window.LSRouter = { resolve: resolve, relPath: relPath, go: go };

  // Mode 404: alihkan bila cocok dengan rute lama
  if (window.__LS_404__) {
    var t = resolve(relPath());
    if (t && t !== location.href.split(/[?#]/)[0]) go(t);
    else document.documentElement.style.visibility = "";
  }
})();
