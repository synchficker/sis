// ============================================================
// config.js — Bootstrap situs: root otomatis, tabel rute halaman (struktur
// folder baru), auto-konfigurasi repo, normalisasi tautan, prefetch.
// Tetap di ROOT situs. Routing URL lama -> baru ada di assets/js/mount.js.
// Dimuat paling awal oleh setiap halaman.
// TOKEN TIDAK BOLEH DI-HARDCODE — jangan tulis PAT di sini.
// ============================================================
(function () {
  "use strict";

  var SELF = (document.currentScript && document.currentScript.src) || "";
  var ROOT = SELF ? SELF.replace(/config\.js(\?.*)?$/i, "") : location.href.replace(/[^/]*$/, "");
  var FILE = location.protocol === "file:";

  var PAGES = {
    login:    { url: "admin/login.html", path: "admin/login.html", label: "Login Administrator", icon: "shield-check", desc: "Gerbang PAT untuk pengelola sekolah." },
    admin:    { url: "admin/", path: "admin/index.html", label: "Panel Administrator", icon: "layout-dashboard", desc: "Akademik, keuangan, SDM, LMS, konten." },
    portal:   { url: "pages/portal/", path: "pages/portal/index.html", label: "Portal Orang Tua", icon: "users", desc: "Nilai, absensi, tagihan, dan chat wali kelas." },
    ppdb:     { url: "pages/ppdb/", path: "pages/ppdb/index.html", label: "PPDB Online", icon: "user-plus", desc: "Formulir penerimaan peserta didik baru." },
    belajar:  { url: "pages/belajar/", path: "pages/belajar/index.html", label: "E-Learning", icon: "book-open", desc: "Materi, video, dan tugas pembelajaran." },
    cbt:      { url: "pages/cbt/", path: "pages/cbt/index.html", label: "Ujian Online CBT", icon: "timer", desc: "Ujian berbasis komputer dengan token." },
    tuition:  { url: "pages/tuition/", path: "pages/tuition/index.html", label: "Biaya Pendidikan", icon: "wallet", desc: "Rincian SPP per jenjang dan simulasi cicilan." },
    kalender: { url: "pages/kalender/", path: "pages/kalender/index.html", label: "Kalender Akademik", icon: "calendar-days", desc: "Agenda satu tahun ajaran penuh." },
    sd:       { url: "pages/sd/", path: "pages/sd/index.html", label: "Program SD", icon: "baby", desc: "Sekolah Dasar — literasi, numerasi, karakter." },
    smp:      { url: "pages/smp/", path: "pages/smp/index.html", label: "Program SMP", icon: "book-open", desc: "Sekolah Menengah Pertama — projek & minat." },
    sma:      { url: "pages/sma/", path: "pages/sma/index.html", label: "Program SMA", icon: "graduation-cap", desc: "Sekolah Menengah Atas — MIPA & IPS." },
    smk:      { url: "pages/smk/", path: "pages/smk/index.html", label: "Program SMK", icon: "wrench", desc: "Sekolah Menengah Kejuruan — PKL & kompetensi." },
    seed:     { url: "pages/seed/", path: "pages/seed/index.html", label: "Seeder Data", icon: "database-zap", desc: "Generator dataset dummy relasional." }
  };

  window.SITE = { root: ROOT, pages: PAGES, isFile: FILE };

  // <base> menjamin semua aset relatif tetap benar dari kedalaman mana pun
  if (!document.querySelector("base")) {
    var b = document.createElement("base");
    b.href = ROOT; b.setAttribute("data-site", "1");
    document.head.insertBefore(b, document.head.firstChild);
  }

  // ---- Auto-konfigurasi repo dari root nyata (tanpa tebak-tebakan) ----
  // ISI BAGIAN INI bila situs TIDAK dibuka dari https://<user>.github.io/<repo>/ (domain kustom, Netlify, Vercel, localhost, dll.).
  // Tanpa ini, Login & semua simpan/hapus di Panel Admin gagal dengan "Konfigurasi repo belum diisi".
  // Contoh: { GITHUB_USERNAME: "sekolahku", GITHUB_REPO: "sis", GITHUB_BRANCH: "main" }
  var MANUAL = { GITHUB_USERNAME: "", GITHUB_REPO: "", GITHUB_BRANCH: "main" };
  var prev = window.APP_CONFIG || {};
  ["GITHUB_USERNAME", "GITHUB_REPO", "GITHUB_BRANCH"].forEach(function (k) { if (!prev[k] || /^GANTI/i.test(String(prev[k]))) prev[k] = MANUAL[k]; });
  var owner = "", repo = "";
  try {
    var u = new URL(ROOT);
    var seg = u.pathname.split("/").filter(Boolean);
    if (u.hostname.endsWith(".github.io")) {
      owner = u.hostname.split(".")[0];
      repo = seg.length ? seg[0] : owner + ".github.io";
    }
  } catch (e) {}
  var isPlaceholder = function (v) { return !v || /^GANTI/i.test(String(v)); };
  window.APP_CONFIG = {
    GITHUB_USERNAME: isPlaceholder(prev.GITHUB_USERNAME) ? (owner || "GANTI_USERNAME_GITHUB") : prev.GITHUB_USERNAME,
    GITHUB_REPO: isPlaceholder(prev.GITHUB_REPO) ? (repo || "GANTI_NAMA_REPO") : prev.GITHUB_REPO,
    GITHUB_BRANCH: prev.GITHUB_BRANCH || "main"
  };

  // ---- Nama halaman logis ("ppdb.html") -> lokasi nyata di struktur folder baru ("pages/ppdb/") ----
  // Kode & tautan lama boleh tetap menulis "ppdb.html"; clean() menerjemahkannya. Satu-satunya sumber kebenaran = PAGES di atas.
  function clean(href) {
    var s = String(href == null ? "" : href);
    if (!s || /^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(s)) return s;
    var m = s.match(/^\.?\/?([a-z0-9_-]+)\.html([?#].*)?$/i);
    if (!m) return s;
    var name = m[1].toLowerCase(), tail = m[2] || "";
    if (name === "404") return s;
    if (name === "index") return ROOT + tail;
    if (PAGES[name]) return (FILE ? PAGES[name].path : PAGES[name].url) + tail;
    return s;
  }
  window.cleanUrl = clean;

  // Cegah "kedipan" header/footer statis bawaan tiap halaman sebelum app.js memasang header & footer seragam
  // (sama dengan beranda). Tidak berlaku untuk Panel Admin / Seeder yang memakai bilah atas sendiri.
  (function () {
    var isTool = /^(admin|seed)$/.test(String(window.__LS_PAGE__ || "")) || /(^|\/)(admin|seed)(\/|\.html)?$/i.test(location.pathname);
    if (isTool || !document.head) return;
    var st = document.createElement("style"); st.id = "lsPre";
    st.textContent = "body>header:not(#lsHeader),body>footer:not(#lsFooter){visibility:hidden!important}";
    document.head.appendChild(st);
  })();
  window.siteUrl = function (page, tail) {
    if (!page || page === "index" || page === "beranda") return ROOT + (tail || "");
    return (PAGES[page] ? (FILE ? ROOT + PAGES[page].path : ROOT + PAGES[page].url) : page) + (tail || "");
  };
  window.go = function (page, tail) { location.href = window.siteUrl(page, tail); };

  // (Pengalihan URL lama /ppdb/, /portal/, /ppdb.html, dst. ditangani assets/js/mount.js lewat 404.html.)

  // ---- Normalisasi seluruh tautan & iframe, termasuk yang dibuat dinamis ----
  function fix(root) {
    (root || document).querySelectorAll("a[href],area[href]").forEach(function (a) {
      if (a.hasAttribute("download")) return;
      var h = a.getAttribute("href"), c = clean(h);
      if (c !== h) a.setAttribute("href", c);
    });
    (root || document).querySelectorAll("iframe[src]").forEach(function (f) {
      var s = f.getAttribute("src"), c = clean(s);
      if (c !== s) f.setAttribute("src", c);
    });
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var raw = a.getAttribute("href");
    // FIXED: <base href=ROOT> membuat tautan "#/siswa" diresolusi ke ROOT#/siswa -> setiap klik menu Panel Admin
    // (dan tautan #anchor di halaman bersarang) membuka BERANDA PUBLIK. Tautan hash kini ditangani di halaman saat ini.
    if (raw && raw.charAt(0) === "#") {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target !== "_self")) return;
      e.preventDefault();
      if (raw.length > 1 && raw !== location.hash) location.hash = raw;
      else if (raw.length > 1) window.dispatchEvent(new HashChangeEvent("hashchange"));
      return;
    }
    var c = clean(raw);
    if (c !== raw) a.setAttribute("href", c);
  }, true);

  var seen = {};
  document.addEventListener("pointerenter", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || seen[a.href]) return;
    try {
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || /\.(json|png|jpe?g|svg|pdf|zip|csv)$/i.test(u.pathname)) return;
      seen[a.href] = 1;
      var l = document.createElement("link"); l.rel = "prefetch"; l.href = u.href; l.as = "document";
      document.head.appendChild(l);
    } catch (x) {}
  }, true);

  function start() {
    fix();
    var t = 0;
    new MutationObserver(function (ms) {
      var need = ms.some(function (m) {
        return [].some.call(m.addedNodes, function (n) {
          return n.nodeType === 1 && (n.matches?.("a[href],iframe[src]") || n.querySelector?.("a[href],iframe[src]"));
        });
      });
      if (!need) return;
      clearTimeout(t); t = setTimeout(function () { fix(); }, 30);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();