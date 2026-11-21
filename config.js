// ============================================================
// config.js — FIXED: Bootstrap situs
// PERBAIKAN:
// 1. TIDAK LAGI redirect .html -> /folder/ (itu yang bikin 404)
// 2. TIDAK LAGI pasang <base> (itu yang merusak path JS)
// 3. TIDAK LAGI ubah link .html jadi folder
// 4. Tambah alias window.CONFIG agar nyambung ke admin.js / admin.html
// TOKEN TIDAK BOLEH DI-HARDCODE — jangan tulis PAT di sini.
// ============================================================
(function () {
  "use strict";

  var SELF = (document.currentScript && document.currentScript.src) || "";
  var ROOT = SELF ? SELF.replace(/config\.js(\?.*)?$/i, "") : location.href.replace(/[^/]*$/, "");
  var FILE = location.protocol === "file:";

  var PAGES = {
    login:    { label: "Login Administrator", icon: "shield-check", desc: "Gerbang PAT untuk pengelola sekolah." },
    admin:    { label: "Panel Administrator", icon: "layout-dashboard", desc: "Akademik, keuangan, SDM, LMS, konten." },
    portal:   { label: "Portal Orang Tua", icon: "users", desc: "Nilai, absensi, tagihan, dan chat wali kelas." },
    ppdb:     { label: "PPDB Online", icon: "user-plus", desc: "Formulir penerimaan peserta didik baru." },
    belajar:  { label: "E-Learning", icon: "book-open", desc: "Materi, video, dan tugas pembelajaran." },
    cbt:      { label: "Ujian Online CBT", icon: "timer", desc: "Ujian berbasis komputer dengan token." },
    tuition:  { label: "Biaya Pendidikan", icon: "wallet", desc: "Rincian SPP per jenjang dan simulasi cicilan." },
    kalender: { label: "Kalender Akademik", icon: "calendar-days", desc: "Agenda satu tahun ajaran penuh." },
    sd:       { label: "Program SD", icon: "baby", desc: "Sekolah Dasar — literasi, numerasi, karakter." },
    smp:      { label: "Program SMP", icon: "book-open", desc: "Sekolah Menengah Pertama — projek & minat." },
    sma:      { label: "Program SMA", icon: "graduation-cap", desc: "Sekolah Menengah Atas — MIPA & IPS." },
    smk:      { label: "Program SMK", icon: "wrench", desc: "Sekolah Menengah Kejuruan — PKL & kompetensi." },
    seed:     { label: "Seeder Data", icon: "database-zap", desc: "Generator dataset dummy relasional." }
  };

  window.SITE = { root: ROOT, pages: PAGES, isFile: FILE, mounted: !!window.__LS_MOUNTED__ };

  // FIXED: JANGAN pasang <base> — merusak src="admin.js" dan href="#/siswa" di SPA
  // Dihapus total.

  // ---- Auto-konfigurasi repo dari root nyata (tanpa tebak-tebakan) ----
  var prev = window.APP_CONFIG || {};
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

  var finalOwner = isPlaceholder(prev.GITHUB_USERNAME) ? (owner || "synchficker") : prev.GITHUB_USERNAME;
  var finalRepo = isPlaceholder(prev.GITHUB_REPO) ? (repo || "sis") : prev.GITHUB_REPO;
  var finalBranch = prev.GITHUB_BRANCH || "main";

  window.APP_CONFIG = {
    GITHUB_USERNAME: finalOwner,
    GITHUB_REPO: finalRepo,
    GITHUB_BRANCH: finalBranch
  };

  // FIXED: Alias agar admin.js / admin.html / app.js yang nyari CONFIG bisa ketemu
  // admin.js nyari: cfg.OWNER / cfg.REPO
  // app.js nyari: APP_CONFIG.GITHUB_USERNAME
  // Keduanya sekarang tersedia
  window.CONFIG = {
    OWNER: finalOwner,
    REPO: finalRepo,
    BRANCH: finalBranch,
    GITHUB_USERNAME: finalOwner,
    GITHUB_REPO: finalRepo,
    GITHUB_BRANCH: finalBranch,
    SCHOOL_NAME: (window.CONFIG && window.CONFIG.SCHOOL_NAME) || "SIS Sekolah",
    ROOT: ROOT
  };
  window.SIS_CONFIG = window.CONFIG;

  // FIXED: siteUrl & go — JANGAN ubah .html jadi /folder/
  // Github Pages tidak punya folder routing, jadi .html harus tetap .html
  window.siteUrl = function (page, tail) {
    if (!page || page === "index" || page === "beranda") return ROOT + (tail || "");
    // Selalu kembalikan .html apa adanya
    if (String(page).indexOf(".html") !== -1) return page + (tail || "");
    return ROOT + page + ".html" + (tail || "");
  };
  window.go = function (page, tail) { location.href = window.siteUrl(page, tail); };

  // FIXED: JANGAN redirect kanonis .html -> /folder/
  // Dihapus total. Biarkan https://.../admin.html tetap di admin.html
  // Biarkan https://.../admin.html#/siswa tetap jalan sebagai SPA hash-router

  // FIXED: JANGAN normalisasi / ubah semua link & iframe
  // Fungsi fix() yang lama mengubah href="index.html" jadi "index/" dan merusak sidebar admin
  // Dihapus total. Link dibiarkan apa adanya.

  console.log("[config.js FIXED] OWNER:", finalOwner, "REPO:", finalRepo, "BRANCH:", finalBranch, "ROOT:", ROOT);
})();
