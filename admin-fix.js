/* ============================================================================
   admin-fix.js — Lapisan Pemulihan & Diagnostik Panel Admin
   Dimuat PALING AKHIR di admin.html. Idempoten, tanpa dependensi baru.
   - Mendeteksi file modul yang gagal dimuat (panel diagnostik nyata)
   - Menyediakan fallback lengkap: helper inti, mesin CRUD, editor konfigurasi,
     dan modul khusus sehingga SETIAP item sidebar tetap berfungsi
   - Tidak menimpa modul yang sudah sehat: native dicoba dulu, fallback hanya
     bila native tidak ada atau melempar error
   TOKEN TIDAK BOLEH DI-HARDCODE — token hanya dari sessionStorage.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__SIS_FIX__) return;
  window.__SIS_FIX__ = "1.0.0";

  var G = window, D = document;
  var q = function (id) { return D.getElementById(id); };
  var APP = q("app");
  if (!APP) { APP = D.createElement("main"); APP.id = "app"; APP.className = "flex-1 p-4 md:p-6 w-full mx-auto"; D.body.appendChild(APP); }

  /* ---------------------------------------------------------------- util */
  var has = function (n) { return typeof G[n] === "function"; };
  var esc = has("esc") ? G.esc : function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var uid = has("uid") ? G.uid : function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  var rp = has("fmtRp") ? G.fmtRp : function (v) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v) || 0); };
  var tg = has("fmtTgl") ? G.fmtTgl : function (v) { if (!v) return "-"; var d = new Date(v); return isNaN(d) ? String(v) : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); };
  var wk = has("fmtWaktu") ? G.fmtWaktu : function (v) { if (!v) return "-"; var d = new Date(v); return isNaN(d) ? String(v) : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }); };
  var now = has("today") ? G.today : function () { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var jam = has("nowTime") ? G.nowTime : function () { var d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  var BLN = G.BULAN || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var icons = function () { if (G.lucide && G.lucide.createIcons) try { G.lucide.createIcons(); } catch (e) {} };
  var cut = function (v, n) { var s = String(v == null ? "" : v); return s.length > (n || 60) ? s.slice(0, n || 60) + "…" : s; };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  var toast = has("toast") ? G.toast : function (m, t) {
    var w = q("toasts");
    if (!w) { w = D.createElement("div"); w.id = "toasts"; w.className = "fixed bottom-4 right-4 z-[120] space-y-2"; w.style.maxWidth = "min(24rem,calc(100vw - 2rem))"; D.body.appendChild(w); }
    var c = { success: "bg-emerald-600", error: "bg-rose-600", info: "bg-slate-800" }[t] || "bg-slate-800";
    var e = D.createElement("div");
    e.className = c + " text-white text-sm px-4 py-3 rounded-xl shadow-lg";
    e.textContent = m; w.appendChild(e); setTimeout(function () { e.remove(); }, 4200);
  };
  var busy = function (on, txt) {
    var l = q("loading");
    if (on) {
      if (!l) {
        l = D.createElement("div"); l.id = "loading";
        l.className = "fixed inset-0 z-[115] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center";
        l.innerHTML = '<div class="bg-white rounded-2xl shadow-xl px-6 py-5 flex items-center gap-3"><div class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div><span id="loadingTxt" class="text-sm font-semibold text-slate-700"></span></div>';
        D.body.appendChild(l);
      }
      q("loadingTxt").textContent = txt || "Memproses…"; l.classList.remove("hidden");
    } else if (l) l.classList.add("hidden");
  };
  var dl = has("download") ? G.download : function (name, text, mime) {
    var a = D.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: (mime || "application/json") + ";charset=utf-8" }));
    a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  };
  var csv = has("toCSV") ? G.toCSV : function (rows, cols) {
    var qq = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; };
    return [cols.map(function (c) { return qq(c.l); }).join(",")].concat(rows.map(function (r) {
      return cols.map(function (c) { return qq(r[c.k]); }).join(",");
    })).join("\r\n");
  };
  var printDoc = has("printHTML") ? G.printHTML : function (title, body) {
    var w = G.open("", "_blank");
    w.document.write('<!DOCTYPE html><html><head><title>' + esc(title) + '</title><style>body{font-family:Arial,sans-serif;padding:24px;font-size:13px;color:#0f172a}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #94a3b8;padding:6px 8px;text-align:left}th{background:#f1f5f9}.center{text-align:center}.right{text-align:right}.muted{color:#64748b}.ttd{display:flex;justify-content:space-between;margin-top:32px}.ttd div{width:220px;text-align:center}</style></head><body>' + body + "</body></html>");
    w.document.close(); setTimeout(function () { w.focus(); w.print(); }, 350);
  };

  /* ------------------------------------------------- repo & API fallback */
  function repo() {
    if (has("repoCfg")) { try { var r = G.repoCfg(); if (r && r.owner && r.repo) return r; } catch (e) {} }
    var c = G.APP_CONFIG || {}, owner = "", name = "";
    var root = G.SIS_ROOT || (function () {
      var s = D.querySelector('script[src*="admin-fix.js"]');
      return s ? s.src.replace(/admin-fix\.js(\?.*)?$/i, "") : location.href.replace(/[^/]*$/, "");
    })();
    try {
      var u = new URL(root, location.href), seg = u.pathname.split("/").filter(Boolean);
      if (u.hostname.endsWith(".github.io")) { owner = u.hostname.split(".")[0]; name = seg.length ? seg[0] : owner + ".github.io"; }
    } catch (e) {}
    var ph = function (v) { return !v || /^GANTI/i.test(String(v)); };
    return {
      owner: ph(c.GITHUB_USERNAME) ? owner : c.GITHUB_USERNAME,
      repo: ph(c.GITHUB_REPO) ? name : c.GITHUB_REPO,
      branch: c.GITHUB_BRANCH || "main"
    };
  }
  function b64(str) {
    var b = new TextEncoder().encode(str), s = "";
    for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  }
  var readJSON = has("fetchJSON") ? G.fetchJSON : async function (file, force) {
    var k = "sicache:" + file;
    if (!force) { try { var c = JSON.parse(sessionStorage.getItem(k)); if (c && Date.now() - c.t < 600000) return c.d; } catch (e) {} }
    var d = null;
    try { var r = await fetch("data/" + file + "?t=" + Date.now()); if (r.ok) d = await r.json(); } catch (e) {}
    if (d === null) {
      var R = repo();
      if (!R.owner || !R.repo) throw new Error("Repo belum terkonfigurasi (config.js).");
      var r2 = await fetch("https://raw.githubusercontent.com/" + R.owner + "/" + R.repo + "/" + R.branch + "/data/" + file + "?t=" + Date.now());
      if (!r2.ok) throw new Error("Gagal memuat " + file + " (" + r2.status + ")");
      d = await r2.json();
    }
    try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
    return d;
  };
  var writeJSON = has("pushJSON") ? G.pushJSON : async function (file, data, retry) {
    var token = sessionStorage.getItem("gh_token");
    if (!token) throw new Error("Sesi login tidak ada. Silakan login ulang.");
    var R = repo();
    if (!R.owner || !R.repo) throw new Error("Repo belum terkonfigurasi (config.js).");
    var url = "https://api.github.com/repos/" + R.owner + "/" + R.repo + "/contents/data/" + file;
    var H = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "Content-Type": "application/json" };
    var g = await fetch(url + "?ref=" + R.branch + "&t=" + Date.now(), { headers: H });
    var sha;
    if (g.ok) sha = (await g.json()).sha;
    else if (g.status === 401) throw new Error("Token tidak valid / kedaluwarsa.");
    else if (g.status !== 404) throw new Error("GET SHA gagal (" + g.status + ").");
    var body = { message: "Update " + file, content: b64(JSON.stringify(data, null, 2)), branch: R.branch };
    if (sha) body.sha = sha;
    var p = await fetch(url, { method: "PUT", headers: H, body: JSON.stringify(body) });
    if (p.ok) { var j = await p.json(); try { sessionStorage.setItem("sicache:" + file, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {} return j; }
    if ((p.status === 409 || p.status === 422) && !retry) return writeJSON(file, data, true);
    throw new Error("PUT gagal (" + p.status + "): " + cut(await p.text(), 150));
  };
  var save = has("saveData") ? G.saveData : async function (file, data, modul, aksi, detail) {
    busy(true, "Menyimpan ke GitHub…");
    try {
      await writeJSON(file, data);
      try {
        var log = []; try { log = await readJSON("audit.json"); } catch (e) {}
        if (!Array.isArray(log)) log = [];
        log.unshift({ id: uid(), waktu: new Date().toISOString(), aktor: sessionStorage.getItem("gh_user") || "admin", modul: modul, aksi: aksi, detail: String(detail || "").slice(0, 200) });
        await writeJSON("audit.json", log.slice(0, 500));
      } catch (e) {}
      toast("Tersimpan: " + aksi, "success");
      return true;
    } catch (e) { toast(e.message, "error"); return false; }
    finally { busy(false); }
  };

  /* ------------------------------------------------------- diagnostics */
  var DIAG = [], ERRORS = [];
  G.addEventListener("error", function (e) {
    ERRORS.push({ src: (e.filename || "").split("/").pop() + ":" + e.lineno, msg: e.message });
    paintDiag();
  });
  G.addEventListener("unhandledrejection", function (e) {
    ERRORS.push({ src: "promise", msg: String((e.reason && e.reason.message) || e.reason) });
    paintDiag();
  });
  var SENTINEL = [
    ["app.js", function () { return has("fetchJSON") && has("pushJSON") && has("saveData"); }],
    ["admin.js", function () { return typeof G.MOD !== "undefined" && has("renderCRUD"); }],
    ["admin-mods.js", function () { return has("renderAbsensi") && has("renderRapor") && has("renderUjian"); }],
    ["admin-mods2.js", function () { return has("renderSPP") && has("renderGaji") && has("renderAudit") && has("renderChat"); }],
    ["admin-mods3.js", function () { return has("renderWA") && has("renderPeminjaman"); }],
    ["admin-mods4.js", function () { return has("renderDashboard") && has("renderLaporan") && has("renderSettings"); }],
    ["admin-kegiatan.js", function () { return !!(G.MOD && G.MOD.kegiatan); }],
    ["admin-konten.js", function () { return !!(G.MOD && G.MOD.biaya && G.MOD.kalender); }],
    ["admin-slider.js", function () { return !!(G.MOD && G.MOD.slider); }],
    ["admin-galeri.js", function () { return !!(G.MOD && G.MOD.galeri); }],
    ["admin-login.js", function () { return !!(G.MOD && G.MOD.login); }],
    ["admin-ui.js", function () { return !!(G.MOD && G.MOD.tampilan); }]
  ];
  function scan() {
    DIAG = SENTINEL.map(function (s) {
      var ok = false; try { ok = !!s[1](); } catch (e) { ok = false; }
      return { file: s[0], ok: ok };
    });
    return DIAG;
  }
  function paintDiag() {
    var host = q("fxDiagBody"); if (!host) return;
    scan();
    var bad = DIAG.filter(function (d) { return !d.ok; });
    var R = repo();
    host.innerHTML =
      '<div class="grid grid-cols-2 gap-2 mb-3 text-[11px]">' +
        '<div class="rounded-xl border border-slate-200 p-2.5"><div class="text-slate-400 font-bold uppercase text-[9.5px]">Repo target</div><div class="font-mono font-bold text-slate-700 truncate">' + esc(R.owner || "?") + "/" + esc(R.repo || "?") + " · " + esc(R.branch) + '</div></div>' +
        '<div class="rounded-xl border border-slate-200 p-2.5"><div class="text-slate-400 font-bold uppercase text-[9.5px]">Sesi</div><div class="font-mono font-bold ' + (sessionStorage.getItem("gh_token") ? "text-emerald-600" : "text-rose-600") + '">' + (sessionStorage.getItem("gh_token") ? esc(sessionStorage.getItem("gh_user") || "aktif") : "tidak ada token") + "</div></div>" +
      "</div>" +
      '<div class="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Status pemuatan berkas</div>' +
      '<div class="space-y-1">' + DIAG.map(function (d) {
        return '<div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg ' + (d.ok ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200") + '">' +
          '<span class="w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ' + (d.ok ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") + '">' + (d.ok ? "✓" : "✕") + "</span>" +
          '<span class="font-mono text-[11px] flex-1 truncate ' + (d.ok ? "text-emerald-800" : "text-rose-800") + '">' + esc(d.file) + "</span>" +
          (d.ok ? "" : '<a href="' + esc(d.file) + '" target="_blank" class="text-[10px] font-bold text-rose-600 underline shrink-0">cek</a>') + "</div>";
      }).join("") + "</div>" +
      (bad.length ? '<p class="mt-2.5 text-[11px] text-rose-700 leading-relaxed"><b>' + bad.length + " berkas gagal dimuat.</b> Modul terkait dijalankan oleh mesin fallback di lapisan ini, jadi semua menu tetap bisa dipakai. Penyebab umum: berkas tidak ada di root, nama berbeda huruf besar/kecil, atau SyntaxError di dalamnya.</p>" : '<p class="mt-2.5 text-[11px] text-emerald-700">Semua berkas modul sehat.</p>') +
      (ERRORS.length ? '<div class="mt-2.5"><div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Error tertangkap (' + ERRORS.length + ')</div><div class="space-y-1 max-h-28 overflow-y-auto fx-scroll">' + ERRORS.slice(-8).map(function (e) {
        return '<div class="text-[10.5px] font-mono bg-slate-900 text-rose-300 rounded-lg px-2 py-1.5 break-all">' + esc(e.src) + " → " + esc(cut(e.msg, 160)) + "</div>";
      }).join("") + "</div></div>" : "") +
      '<div class="mt-3 flex flex-wrap gap-2">' +
        '<button type="button" id="fxCopy" class="px-3 py-2 rounded-lg bg-slate-900 text-white text-[11px] font-bold">Salin laporan</button>' +
        '<button type="button" id="fxHard" class="px-3 py-2 rounded-lg border border-slate-300 text-[11px] font-bold">Muat ulang tanpa cache</button>' +
        '<button type="button" id="fxClear" class="px-3 py-2 rounded-lg border border-slate-300 text-[11px] font-bold">Bersihkan cache data</button>' +
      "</div>";
    var cp = q("fxCopy");
    if (cp) cp.onclick = function () {
      var txt = "SIS Admin Diagnostics " + new Date().toISOString() + "\nRepo: " + R.owner + "/" + R.repo + "@" + R.branch +
        "\nToken: " + (sessionStorage.getItem("gh_token") ? "ada" : "tidak ada") +
        "\n\nFILES:\n" + DIAG.map(function (d) { return (d.ok ? "OK   " : "FAIL ") + d.file; }).join("\n") +
        "\n\nERRORS:\n" + (ERRORS.map(function (e) { return e.src + " → " + e.msg; }).join("\n") || "(none)");
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast("Laporan disalin.", "success"); }, function () { dl("diagnostik-admin.txt", txt, "text/plain"); });
    };
    var hd = q("fxHard"); if (hd) hd.onclick = function () { location.replace(location.pathname + "?t=" + Date.now() + location.hash); };
    var cl = q("fxClear"); if (cl) cl.onclick = function () {
      Object.keys(sessionStorage).filter(function (k) { return k.indexOf("sicache:") === 0; }).forEach(function (k) { sessionStorage.removeItem(k); });
      toast("Cache data dibersihkan.", "success"); safeRoute();
    };
    icons();
  }
  function diagShell() {
    if (q("fxDiag")) return;
    var st = D.createElement("style");
    st.textContent =
      "#fxDiag{position:fixed;right:14px;bottom:14px;z-index:118;font-family:Inter,system-ui,sans-serif}" +
      "#fxDiagPanel{position:absolute;right:0;bottom:52px;width:min(360px,calc(100vw - 28px));max-height:min(70vh,560px);overflow-y:auto;background:#fff;border:1px solid #cbd5e1;border-radius:18px;box-shadow:0 30px 60px -28px rgba(15,23,42,.55);padding:14px;display:none}" +
      "#fxDiag.open #fxDiagPanel{display:block}" +
      ".fx-scroll,#fxDiagPanel{scrollbar-width:thin;scrollbar-color:#16a34a #eef2f7}" +
      ".fx-scroll::-webkit-scrollbar,#fxDiagPanel::-webkit-scrollbar{width:9px}" +
      ".fx-scroll::-webkit-scrollbar-track,#fxDiagPanel::-webkit-scrollbar-track{background:#eef2f7;border-radius:99px}" +
      ".fx-scroll::-webkit-scrollbar-thumb,#fxDiagPanel::-webkit-scrollbar-thumb{background:linear-gradient(#16a34a,#0d9488);border-radius:99px;border:2px solid #eef2f7}" +
      "#fxFab{display:inline-flex;align-items:center;gap:7px;padding:10px 14px;border-radius:99px;border:0;cursor:pointer;font-weight:800;font-size:12px;color:#04120e;background:linear-gradient(120deg,#34d399,#22d3ee);box-shadow:0 16px 30px -14px rgba(16,185,129,.8)}" +
      "#fxFab.warn{background:linear-gradient(120deg,#fbbf24,#fb7185);color:#2b0b12}" +
      ".fx-tbl{width:100%;text-align:left;border-collapse:collapse}.fx-tbl th{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;padding:8px 10px;background:#f8fafc;position:sticky;top:0;z-index:1}" +
      ".fx-tbl td{padding:8px 10px;font-size:12.5px;border-top:1px solid #f1f5f9;vertical-align:middle}" +
      ".fx-tbl tr:hover td{background:#f8fafc}" +
      ".fx-wrap{overflow:auto;max-height:60vh;scrollbar-width:thin;scrollbar-color:#16a34a #eef2f7}" +
      ".fx-wrap::-webkit-scrollbar{width:10px;height:10px}.fx-wrap::-webkit-scrollbar-track{background:#eef2f7}.fx-wrap::-webkit-scrollbar-thumb{background:linear-gradient(#16a34a,#0d9488);border-radius:99px;border:2px solid #eef2f7}" +
      ".fx-in{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px;font-size:13px;outline:none;background:#fff;color:#0f172a}" +
      ".fx-in:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.16)}" +
      ".fx-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:10px;font-size:12.5px;font-weight:800;cursor:pointer;border:1px solid #cbd5e1;background:#fff;color:#0f172a}" +
      ".fx-btn:hover{background:#f8fafc}.fx-btn.p{background:#16a34a;border-color:#16a34a;color:#fff}.fx-btn.p:hover{background:#15803d}" +
      ".fx-btn.d{background:#e11d48;border-color:#e11d48;color:#fff}.fx-btn.a{background:#f59e0b;border-color:#f59e0b;color:#2b1a02}" +
      ".fx-chip{padding:4px 10px;border-radius:99px;font-size:10.5px;font-weight:800;border:1px solid #cbd5e1;background:#fff;cursor:pointer}" +
      ".fx-chip.on{background:#16a34a;border-color:#16a34a;color:#fff}" +
      ".fx-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 1px 2px rgba(15,23,42,.04)}" +
      "#fxDrawer{position:fixed;inset:0;z-index:119;display:none}#fxDrawer.open{display:block}" +
      "#fxDrawer .sc{position:absolute;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(3px)}" +
      "#fxDrawer .pn{position:absolute;right:0;top:0;bottom:0;width:min(560px,100%);background:#fff;display:flex;flex-direction:column;box-shadow:-20px 0 60px -30px rgba(15,23,42,.6);animation:fxSlide .3s cubic-bezier(.2,.8,.2,1)}" +
      "@keyframes fxSlide{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}" +
      "#fxUndo{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:120;display:none;align-items:center;gap:12px;background:#0f172a;color:#fff;padding:11px 16px;border-radius:16px;font-size:12.5px;box-shadow:0 20px 40px -18px rgba(0,0,0,.7);max-width:calc(100vw - 24px);flex-wrap:wrap;justify-content:center}" +
      "#fxUndo.open{display:flex}" +
      "@media (max-width:640px){#fxDiag{right:10px;bottom:10px}.fx-tbl td,.fx-tbl th{padding:6px 7px}}";
    D.head.appendChild(st);

    var w = D.createElement("div"); w.id = "fxDiag";
    w.innerHTML = '<div id="fxDiagPanel"><div class="flex items-center gap-2 mb-2.5"><b class="text-sm flex-1" style="font-family:Inter">Diagnostik Panel Admin</b><button type="button" id="fxClose" class="fx-btn" style="padding:4px 9px">Tutup</button></div><div id="fxDiagBody"></div></div>' +
      '<button type="button" id="fxFab"><span id="fxDot">●</span><span id="fxFabTxt">Diagnostik</span></button>';
    D.body.appendChild(w);
    q("fxFab").onclick = function () { w.classList.toggle("open"); paintDiag(); };
    q("fxClose").onclick = function () { w.classList.remove("open"); };

    var dr = D.createElement("div"); dr.id = "fxDrawer";
    dr.innerHTML = '<div class="sc"></div><aside class="pn"><div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3"><b id="fxDrT" class="flex-1 text-slate-800">Detail</b><button type="button" id="fxDrX" class="fx-btn" style="padding:5px 10px">Tutup</button></div><div id="fxDrB" class="flex-1 overflow-y-auto fx-scroll p-5"></div><div id="fxDrF" class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2"></div></aside>';
    D.body.appendChild(dr);
    q("fxDrX").onclick = closeDrawer;
    dr.querySelector(".sc").onclick = closeDrawer;

    var un = D.createElement("div"); un.id = "fxUndo";
    un.innerHTML = '<span id="fxUndoTxt"></span><button type="button" id="fxUndoBtn" class="fx-btn p" style="padding:6px 12px">Urungkan</button>';
    D.body.appendChild(un);
    D.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeDrawer(); w.classList.remove("open"); } });
    icons();
  }
  function refreshFab() {
    scan();
    var bad = DIAG.filter(function (d) { return !d.ok; }).length;
    var f = q("fxFab"), t = q("fxFabTxt");
    if (!f) return;
    f.classList.toggle("warn", bad > 0);
    t.textContent = bad ? bad + " berkas gagal" : "Diagnostik";
  }
  var undoTimer = null;
  function offerUndo(label, fn) {
    var u = q("fxUndo"); if (!u) return;
    q("fxUndoTxt").textContent = label;
    u.classList.add("open");
    q("fxUndoBtn").onclick = function () { u.classList.remove("open"); fn(); };
    clearTimeout(undoTimer); undoTimer = setTimeout(function () { u.classList.remove("open"); }, 9000);
  }
  function drawer(title, bodyHTML, footerHTML) {
    diagShell();
    q("fxDrT").textContent = title;
    q("fxDrB").innerHTML = bodyHTML;
    q("fxDrF").innerHTML = footerHTML || "";
    q("fxDrawer").classList.add("open");
    icons();
    return q("fxDrB");
  }
  function closeDrawer() { var d = q("fxDrawer"); if (d) d.classList.remove("open"); }

  /* ------------------------------------------------------------- MOD */
  var M = (typeof G.MOD !== "undefined" && G.MOD) ? G.MOD : (G.MOD = {});
  var SCHEMA = {
    "siswa.json": { title: "Data Induk Siswa", group: "A", icon: "users", cols: ["nis", "nisn", "nama", "jk", "kelas", "status"], f: [
      ["nis", "NIS", "text", 1], ["nisn", "NISN", "text"], ["nama", "Nama Lengkap", "text", 1], ["jk", "Jenis Kelamin", "sel:L,P"],
      ["tempat_lahir", "Tempat Lahir", "text"], ["tanggal_lahir", "Tanggal Lahir", "date"], ["agama", "Agama", "sel:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu"],
      ["kelas", "Kelas", "ref:kelas.json:nama", 1], ["nama_ayah", "Nama Ayah", "text"], ["nama_ibu", "Nama Ibu", "text"],
      ["no_hp_ortu", "No. HP Orang Tua", "tel"], ["status", "Status", "sel:Aktif,Lulus,Pindah,Keluar"], ["tanggal_masuk", "Tanggal Masuk", "date"], ["alamat", "Alamat", "area"]] },
    "kelas.json": { title: "Rombel / Kelas", group: "A", icon: "school", cols: ["nama", "tingkat", "jurusan", "wali_kelas", "kapasitas"], f: [
      ["nama", "Nama Rombel", "text", 1], ["tingkat", "Tingkat", "sel:1,2,3,4,5,6,7,8,9,10,11,12"], ["jurusan", "Jurusan", "text"],
      ["wali_kelas", "Wali Kelas", "ref:guru.json:id:nama"], ["kapasitas", "Kapasitas", "num"], ["tahun_ajaran", "Tahun Ajaran", "text"]] },
    "mutasi.json": { title: "Mutasi Siswa", group: "A", icon: "arrow-left-right", cols: ["tanggal", "nis", "jenis", "tujuan_asal"], f: [
      ["tanggal", "Tanggal", "date", 1], ["nis", "Siswa", "ref:siswa.json:nis:nama", 1], ["jenis", "Jenis", "sel:Masuk,Keluar,Pindah Kelas,Pindah Sekolah"],
      ["tujuan_asal", "Asal / Tujuan", "text"], ["keterangan", "Keterangan", "area"]] },
    "nilai.json": { title: "Input Nilai", group: "A", icon: "clipboard-list", cols: ["nis", "mapel", "jenis", "tp", "nilai", "semester"], f: [
      ["nis", "Siswa", "ref:siswa.json:nis:nama", 1], ["mapel", "Mata Pelajaran", "ref:settings.json:mapel", 1],
      ["jenis", "Jenis", "sel:Formatif,Sumatif,UH,PTS,PAS,UAS,CBT"], ["tp", "TP / KD", "text"], ["nilai", "Nilai (0–100)", "num", 1],
      ["semester", "Semester", "sel:Ganjil,Genap"], ["tahun_ajaran", "Tahun Ajaran", "text"]] },
    "ppdb.json": { title: "PPDB Online", group: "A", icon: "user-plus", cols: ["nomor_daftar", "nama", "asal_sekolah", "pilihan_kelas", "status"], f: [
      ["nomor_daftar", "No. Pendaftaran", "text"], ["tanggal_daftar", "Tanggal Daftar", "date"], ["nama", "Nama", "text", 1], ["nisn", "NISN", "text"],
      ["jk", "Jenis Kelamin", "sel:L,P"], ["tempat_lahir", "Tempat Lahir", "text"], ["tanggal_lahir", "Tanggal Lahir", "date"],
      ["asal_sekolah", "Asal Sekolah", "text"], ["nama_ortu", "Nama Orang Tua", "text"], ["no_hp", "No. HP", "tel"],
      ["pilihan_kelas", "Pilihan Kelas", "ref:kelas.json:nama"], ["status", "Status", "sel:Menunggu,Diterima,Ditolak"], ["alamat", "Alamat", "area"]] },
    "materi.json": { title: "E-Learning / Materi", group: "B", icon: "book-open", cols: ["judul", "mapel", "kelas", "tipe", "tanggal"], f: [
      ["judul", "Judul", "text", 1], ["mapel", "Mata Pelajaran", "ref:settings.json:mapel"], ["kelas", "Kelas", "ref:kelas.json:nama"],
      ["tipe", "Tipe", "sel:Materi,Video,Artikel,Link"], ["url", "URL", "text"], ["tanggal", "Tanggal", "date"], ["deskripsi", "Deskripsi", "area"]] },
    "tugas.json": { title: "Tugas", group: "B", icon: "clipboard-check", cols: ["judul", "mapel", "kelas", "deadline"], f: [
      ["judul", "Judul", "text", 1], ["mapel", "Mata Pelajaran", "ref:settings.json:mapel"], ["kelas", "Kelas", "ref:kelas.json:nama"],
      ["deadline", "Tenggat", "date"], ["lampiran", "URL Lampiran", "text"], ["deskripsi", "Instruksi", "area"]] },
    "soal.json": { title: "Bank Soal", group: "B", icon: "list-checks", cols: ["mapel", "kelas", "pertanyaan", "kunci"], f: [
      ["mapel", "Mata Pelajaran", "ref:settings.json:mapel", 1], ["kelas", "Kelas", "ref:kelas.json:nama"], ["pertanyaan", "Pertanyaan", "area", 1],
      ["a", "Pilihan A", "text", 1], ["b", "Pilihan B", "text", 1], ["c", "Pilihan C", "text", 1], ["d", "Pilihan D", "text", 1], ["e", "Pilihan E", "text"],
      ["kunci", "Kunci", "sel:A,B,C,D,E", 1], ["pembahasan", "Pembahasan", "area"]] },
    "bos.json": { title: "Dana BOS", group: "C", icon: "landmark", cols: ["tanggal", "jenis", "kategori", "uraian", "jumlah", "triwulan"], f: [
      ["tanggal", "Tanggal", "date", 1], ["jenis", "Jenis", "sel:Penerimaan,Pengeluaran", 1],
      ["kategori", "Kategori", "sel:BOS Reguler,Perpustakaan,Kegiatan Pembelajaran,Administrasi Sekolah,Pemeliharaan Sarpras,Honor Guru Non-ASN,Pengembangan Profesi,Langganan Daya & Jasa,Lainnya"],
      ["uraian", "Uraian", "text", 1], ["jumlah", "Jumlah (Rp)", "num", 1], ["triwulan", "Triwulan", "sel:I,II,III,IV"], ["tahun", "Tahun", "num"]] },
    "guru.json": { title: "Data Guru / TU", group: "D", icon: "briefcase", cols: ["nip", "nama", "jabatan", "mapel", "status", "gaji_pokok"], f: [
      ["nip", "NIP / NUPTK", "text"], ["nama", "Nama", "text", 1], ["jk", "Jenis Kelamin", "sel:L,P"],
      ["jabatan", "Jabatan", "sel:Guru Mapel,Wali Kelas,TU,Kepala Sekolah,Operator"], ["mapel", "Mapel Diampu", "text"],
      ["status", "Status", "sel:PNS,PPPK,Honorer"], ["pendidikan", "Pendidikan", "text"], ["no_hp", "No. HP", "tel"], ["email", "Email", "text"],
      ["gaji_pokok", "Gaji Pokok (Rp)", "num"], ["tanggal_masuk", "Tanggal Masuk", "date"]] },
    "absensi-guru.json": { title: "Absensi Guru", group: "D", icon: "calendar-check", cols: ["tanggal", "guru_id", "jam_masuk", "jam_pulang", "status"], f: [
      ["tanggal", "Tanggal", "date", 1], ["guru_id", "Pegawai", "ref:guru.json:id:nama", 1], ["jam_masuk", "Jam Masuk", "time"],
      ["jam_pulang", "Jam Pulang", "time"], ["status", "Status", "sel:Hadir,Sakit,Izin,Dinas Luar,Alfa"], ["catatan", "Catatan", "area"]] },
    "jurnal.json": { title: "Jurnal Mengajar", group: "D", icon: "pen-line", cols: ["tanggal", "guru_id", "kelas", "mapel", "jam_ke"], f: [
      ["tanggal", "Tanggal", "date", 1], ["guru_id", "Guru", "ref:guru.json:id:nama", 1], ["kelas", "Kelas", "ref:kelas.json:nama"],
      ["mapel", "Mata Pelajaran", "ref:settings.json:mapel"], ["jam_ke", "Jam Ke-", "text"], ["materi", "Materi", "area", 1], ["catatan", "Catatan", "area"]] },
    "kinerja.json": { title: "Penilaian Kinerja", group: "D", icon: "award", cols: ["guru_id", "periode", "pedagogik", "profesional", "sosial", "kepribadian"], f: [
      ["guru_id", "Pegawai", "ref:guru.json:id:nama", 1], ["periode", "Periode", "text"], ["pedagogik", "Pedagogik", "num"],
      ["profesional", "Profesional", "num"], ["sosial", "Sosial", "num"], ["kepribadian", "Kepribadian", "num"], ["penilai", "Penilai", "text"], ["catatan", "Catatan", "area"]] },
    "inventaris.json": { title: "Inventaris Barang", group: "F", icon: "boxes", cols: ["kode_barang", "nama", "kategori", "jumlah", "kondisi", "lokasi"], f: [
      ["kode_barang", "Kode Barang", "text", 1], ["nama", "Nama Barang", "text", 1],
      ["kategori", "Kategori", "sel:Elektronik,Mebel,Alat Peraga,Olahraga,ATK,Lainnya"], ["jumlah", "Jumlah", "num"],
      ["kondisi", "Kondisi", "sel:Baik,Rusak Ringan,Rusak Berat"], ["lokasi", "Lokasi", "text"],
      ["sumber_dana", "Sumber Dana", "sel:BOS,APBD,Hibah,Komite"], ["tanggal_perolehan", "Tanggal Perolehan", "date"]] },
    "buku.json": { title: "Katalog Buku", group: "F", icon: "library", cols: ["isbn", "judul", "pengarang", "kategori", "rak", "stok"], f: [
      ["isbn", "ISBN", "text"], ["judul", "Judul", "text", 1], ["pengarang", "Pengarang", "text"], ["penerbit", "Penerbit", "text"],
      ["tahun", "Tahun", "num"], ["kategori", "Kategori", "sel:Pelajaran,Fiksi,Nonfiksi,Referensi,Anak"], ["rak", "Rak", "text"], ["stok", "Stok", "num"]] },
    "kegiatan.json": { title: "Kegiatan Sekolah", group: "W", icon: "images", cols: ["urutan", "judul", "kategori", "tanggal", "status"], f: [
      ["urutan", "Urutan", "num"], ["judul", "Judul", "text", 1],
      ["kategori", "Kategori", "sel:Akademik,Olahraga,Seni & Budaya,Keagamaan,Sosial & Lingkungan,Literasi,Teknologi,Pramuka,Kewirausahaan"],
      ["tanggal", "Tanggal", "date"], ["lokasi", "Lokasi", "text"], ["peserta", "Peserta", "text"], ["penyelenggara", "Penyelenggara", "text"],
      ["ringkasan", "Ringkasan", "area"], ["deskripsi", "Deskripsi", "area"], ["foto", "URL Foto", "text"],
      ["status", "Status", "sel:Tampil,Draft"], ["unggulan", "Unggulan", "bool"]] },
    "kalender.json": { title: "Kalender Akademik", group: "W", icon: "calendar-days", cols: ["mulai", "selesai", "judul", "kategori", "semester", "status"], f: [
      ["judul", "Judul", "text", 1], ["kategori", "Kategori", "sel:Akademik,Asesmen,Kegiatan,PPDB,Keagamaan,Rapat Orang Tua,Libur Nasional,Libur Semester"],
      ["mulai", "Mulai", "date", 1], ["selesai", "Selesai", "date"], ["semester", "Semester", "sel:Ganjil,Genap"],
      ["lokasi", "Lokasi", "text"], ["keterangan", "Keterangan", "area"], ["penting", "Penting", "bool"], ["status", "Status", "sel:Tampil,Draft"]] }
  };
  var CONFIGS = {
    "settings.json": { title: "Pengaturan Sekolah", icon: "settings", group: "S" },
    "ui.json": { title: "Antarmuka Halaman Muka", icon: "panels-top-left", group: "W" },
    "slider.json": { title: "Hero Slider", icon: "gallery-horizontal-end", group: "W" },
    "galeri.json": { title: "Pengaturan Galeri", icon: "layout-grid", group: "W" },
    "login.json": { title: "Pengaturan Form Login", icon: "shield-check", group: "W" }
  };
  var KEYMAP = {
    siswa: "siswa.json", kelas: "kelas.json", mutasi: "mutasi.json", nilai: "nilai.json", ppdb: "ppdb.json",
    materi: "materi.json", video: "materi.json", tugas: "tugas.json", soal: "soal.json", bos: "bos.json",
    guru: "guru.json", "absensi-guru": "absensi-guru.json", jurnal: "jurnal.json", kinerja: "kinerja.json",
    inventaris: "inventaris.json", buku: "buku.json", kegiatan: "kegiatan.json", kalender: "kalender.json",
    pengaturan: "settings.json", tampilan: "ui.json", slider: "slider.json", galeri: "galeri.json", login: "login.json"
  };
  var CUSTOM = ["dashboard", "absensi", "rapor", "ujian", "spp", "gaji", "audit", "chat", "notifikasi", "peminjaman", "laporan", "biaya"];
  function ensureMOD() {
    Object.keys(KEYMAP).forEach(function (k) {
      var file = KEYMAP[k], sc = SCHEMA[file], cf = CONFIGS[file];
      if (!M[k]) M[k] = { title: (sc && sc.title) || (cf && cf.title) || k, file: file, fields: sc ? sc.f : null, cols: sc ? sc.cols : null, __fx: 1 };
      else { if (!M[k].file) M[k].file = file; if (sc && !M[k].fields) { M[k].fields = sc.f; M[k].cols = sc.cols; } }
    });
    CUSTOM.forEach(function (k) { if (!M[k]) M[k] = { title: k.charAt(0).toUpperCase() + k.slice(1), render: "fx_" + k, __fx: 1 }; });
    if (!M.dashboard) M.dashboard = { title: "Dashboard", render: "fx_dashboard" };
  }

  /* ------------------------------------------------------- CRUD engine */
  var ST = {};
  function state(key) {
    if (!ST[key]) ST[key] = { rows: [], q: "", filter: "", sort: "", dir: 1, page: 1, size: 25, sel: {}, drag: null };
    return ST[key];
  }
  var VKEY = "fx_views";
  function views() { try { return JSON.parse(localStorage.getItem(VKEY)) || {}; } catch (e) { return {}; } }
  function setViews(v) { localStorage.setItem(VKEY, JSON.stringify(v)); }
  var REFC = {};
  async function refOpts(spec) {
    var p = spec.split(":"), file = p[1], vk = p[2] || "id", lk = p[3] || vk;
    var ck = file + "|" + vk + "|" + lk;
    if (REFC[ck]) return REFC[ck];
    var out = [];
    try {
      var d = await readJSON(file);
      if (file === "settings.json" && Array.isArray(d[vk])) out = d[vk].map(function (x) { return [x, x]; });
      else if (Array.isArray(d)) out = d.slice(0, 800).map(function (r) { return [r[vk], String(r[lk] != null ? r[lk] : r[vk]) + (lk !== vk && r[vk] ? " · " + r[vk] : "")]; });
    } catch (e) {}
    REFC[ck] = out; return out;
  }
  function labelOf(rows, v) {
    for (var i = 0; i < rows.length; i++) if (String(rows[i].id) === String(v) || String(rows[i].nis) === String(v)) return rows[i].nama || rows[i].judul || v;
    return v;
  }
  var MONEY = /nominal|pokok|total|jumlah|gaji|tunjangan|potongan|denda|biaya|spp/;
  var BADGE = /^(status|jenis|kondisi|metode|tipe|kategori|semester)$/;
  function tone(v) {
    if (/^(Aktif|Lunas|Diterima|Hadir|Baik|Dibayar|Terkirim|Dikembalikan|Selesai|Tampil|Penerimaan|Ganjil)$/.test(v)) return "background:#dcfce7;color:#15803d;border:1px solid #86efac";
    if (/^(Belum|Menunggu|Dipinjam|Draft|Izin|Antrean|Rusak Ringan|Genap)$/.test(v)) return "background:#fef3c7;color:#b45309;border:1px solid #fcd34d";
    if (/^(Alfa|Ditolak|Keluar|Rusak Berat|Pengeluaran)$/.test(v)) return "background:#ffe4e6;color:#be123c;border:1px solid #fda4af";
    return "background:#e0f2fe;color:#0369a1;border:1px solid #7dd3fc";
  }
  function head(title, desc, right) {
    return '<div class="mb-4 flex flex-wrap items-end gap-3"><div class="min-w-0 flex-1">' +
      '<h1 class="text-xl md:text-2xl font-extrabold text-slate-800" style="font-family:Inter">' + esc(title) + "</h1>" +
      (desc ? '<p class="text-sm text-slate-500 mt-1 max-w-3xl">' + esc(desc) + "</p>" : "") +
      "</div>" + (right || "") + "</div>";
  }
  async function loadRows(key) {
    var m = M[key], s = state(key);
    var d = await readJSON(m.file);
    s.rows = Array.isArray(d) ? d : [];
    if (key === "video") s.rows = s.rows.filter(function (r) { return r.tipe === "Video"; });
    return s.rows;
  }
  function filtered(key) {
    var s = state(key), m = M[key], r = s.rows.slice();
    if (s.filter) { var f = filterField(key); r = r.filter(function (x) { return String(x[f]) === s.filter; }); }
    if (s.q) { var qq = s.q.toLowerCase(); r = r.filter(function (x) { return JSON.stringify(x).toLowerCase().indexOf(qq) > -1; }); }
    if (s.sort) r.sort(function (a, b) {
      var x = a[s.sort], y = b[s.sort];
      var n = (typeof x === "number" && typeof y === "number") ? x - y : String(x == null ? "" : x).localeCompare(String(y == null ? "" : y));
      return n * s.dir;
    });
    return r;
  }
  function filterField(key) {
    var s = state(key);
    var cand = ["status", "kategori", "jenis", "kelas", "mapel", "tipe", "semester", "kondisi", "jabatan"];
    for (var i = 0; i < cand.length; i++) if (s.rows.length && s.rows[0][cand[i]] !== undefined) return cand[i];
    return null;
  }
  async function renderCRUDfx(key) {
    var m = M[key], s = state(key);
    APP.innerHTML = head(m.title, "Sumber: data/" + m.file + " · setiap perubahan menjadi commit GitHub beserta audit log.") +
      '<div class="fx-card p-8 text-center text-slate-400 text-sm">Memuat data…</div>';
    await loadRows(key);
    paintCRUD(key);
  }
  function paintCRUD(key) {
    var m = M[key], s = state(key), rows = filtered(key);
    var cols = (m.cols || Object.keys(s.rows[0] || {}).slice(0, 6)).filter(function (c) { return s.rows.length ? s.rows[0][c] !== undefined : true; });
    var ff = filterField(key);
    var vals = ff ? Array.from(new Set(s.rows.map(function (r) { return r[ff]; }).filter(function (v) { return v != null && v !== ""; }))).sort() : [];
    var pages = Math.max(1, Math.ceil(rows.length / s.size));
    s.page = Math.min(s.page, pages);
    var slice = rows.slice((s.page - 1) * s.size, s.page * s.size);
    var selN = Object.keys(s.sel).filter(function (k) { return s.sel[k]; }).length;
    var vw = (views()[key] || []);
    var orderable = s.rows.length && s.rows[0].urutan !== undefined;

    APP.innerHTML = head(m.title, "Sumber: data/" + m.file + " · " + s.rows.length + " record",
      '<button type="button" class="fx-btn p" data-add><span>＋</span>Tambah</button>') +
      '<div class="fx-card overflow-hidden">' +
        '<div class="p-3.5 border-b border-slate-100 space-y-2.5">' +
          '<div class="flex flex-wrap gap-2 items-center">' +
            '<input class="fx-in" style="flex:1;min-width:170px" placeholder="Cari di semua kolom…" value="' + esc(s.q) + '" data-q>' +
            (ff ? '<select class="fx-in" style="width:auto" data-filter><option value="">Semua ' + esc(ff) + "</option>" + vals.map(function (v) { return '<option ' + (s.filter === String(v) ? "selected" : "") + ">" + esc(v) + "</option>"; }).join("") + "</select>" : "") +
            '<select class="fx-in" style="width:auto" data-sort><option value="">Urutan asli</option>' + cols.map(function (c) { return '<option value="' + c + '" ' + (s.sort === c ? "selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select>" +
            '<button type="button" class="fx-btn" data-dir>' + (s.dir === 1 ? "↑ ASC" : "↓ DESC") + "</button>" +
            '<select class="fx-in" style="width:auto" data-size>' + [15, 25, 50, 100].map(function (n) { return "<option " + (s.size === n ? "selected" : "") + ">" + n + "</option>"; }).join("") + "</select>" +
            '<button type="button" class="fx-btn" data-csv>CSV</button>' +
            '<button type="button" class="fx-btn" data-json>JSON</button>' +
          "</div>" +
          '<div class="flex flex-wrap items-center gap-1.5 text-[11px]">' +
            '<span class="font-bold text-slate-400 uppercase text-[9.5px]">Tampilan tersimpan</span>' +
            vw.map(function (v, i) { return '<span class="fx-chip" style="cursor:default">' + esc(v.n) + ' <button type="button" data-vw="' + i + '" style="font-weight:800">buka</button> <button type="button" data-vd="' + i + '" style="color:#e11d48;font-weight:800">×</button></span>'; }).join("") +
            '<button type="button" class="fx-chip" data-vsave>+ simpan</button>' +
            (orderable ? '<span class="ml-auto text-slate-400">Seret baris untuk mengubah urutan</span>' : "") +
          "</div>" +
        "</div>" +
        (selN ? '<div class="px-3.5 py-2.5 border-b border-emerald-100 flex flex-wrap items-center gap-2" style="background:#f0fdf4"><b class="text-[12px]" style="color:#15803d">' + selN + ' dipilih</b><button type="button" class="fx-btn p" data-bulk="Tampil">Publikasikan</button><button type="button" class="fx-btn a" data-bulk="Draft">Draf</button><button type="button" class="fx-btn d" data-bdel>Hapus</button><button type="button" class="fx-btn" data-bclr>Batal</button></div>' : "") +
        '<div class="fx-wrap"><table class="fx-tbl"><thead><tr>' +
          '<th style="width:34px"><input type="checkbox" data-all ' + (slice.length && slice.every(function (r) { return s.sel[r.id]; }) ? "checked" : "") + "></th>" +
          (orderable ? '<th style="width:26px"></th>' : "") +
          cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") +
          '<th style="text-align:right;width:130px">Aksi</th></tr></thead><tbody>' +
          (slice.map(function (r, i) {
            return "<tr data-row=\"" + esc(r.id) + "\"" + (orderable ? ' draggable="true"' : "") + ">" +
              '<td><input type="checkbox" data-sel="' + esc(r.id) + '" ' + (s.sel[r.id] ? "checked" : "") + "></td>" +
              (orderable ? '<td style="color:#cbd5e1;cursor:grab">⠿</td>' : "") +
              cols.map(function (c) {
                var v = r[c];
                if (typeof v === "boolean") v = v ? "✓" : "—";
                if (Array.isArray(v)) v = v.length + " item";
                if (v && typeof v === "object") v = JSON.stringify(v);
                if (typeof r[c] === "number" && MONEY.test(c)) return '<td style="text-align:right;font-variant-numeric:tabular-nums">' + esc(rp(r[c])) + "</td>";
                if (BADGE.test(c) && v) return '<td><span style="padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;' + tone(String(v)) + '">' + esc(cut(v, 22)) + "</span></td>";
                if (/tanggal|deadline|mulai|selesai/.test(c) && v) return '<td style="white-space:nowrap">' + esc(tg(v)) + "</td>";
                return "<td>" + esc(cut(v, 46)) + "</td>";
              }).join("") +
              '<td style="text-align:right;white-space:nowrap">' +
                '<button type="button" class="fx-btn" style="padding:4px 8px" data-view="' + esc(r.id) + '">Detail</button> ' +
                '<button type="button" class="fx-btn" style="padding:4px 8px" data-edit="' + esc(r.id) + '">Edit</button> ' +
                '<button type="button" class="fx-btn d" style="padding:4px 8px" data-del="' + esc(r.id) + '">Hapus</button>' +
              "</td></tr>";
          }).join("") || '<tr><td colspan="' + (cols.length + 3) + '" style="padding:34px;text-align:center;color:#94a3b8">Tidak ada record yang cocok.</td></tr>') +
        "</tbody></table></div>" +
        '<div class="px-3.5 py-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11.5px] text-slate-500">' +
          "<span>" + rows.length + " cocok / " + s.rows.length + " total</span><span style=\"flex:1\"></span>" +
          '<button type="button" class="fx-btn" style="padding:4px 9px" data-pg="1">«</button>' +
          '<button type="button" class="fx-btn" style="padding:4px 9px" data-pg="' + Math.max(1, s.page - 1) + '">‹</button>' +
          "<span>Hal " + s.page + " / " + pages + "</span>" +
          '<button type="button" class="fx-btn" style="padding:4px 9px" data-pg="' + Math.min(pages, s.page + 1) + '">›</button>' +
          '<button type="button" class="fx-btn" style="padding:4px 9px" data-pg="' + pages + '">»</button>' +
        "</div></div>";
    icons();
    wireCRUD(key, cols, slice);
  }
  function wireCRUD(key, cols, slice) {
    var m = M[key], s = state(key);
    var set = function (sel, ev, fn) { var e = APP.querySelector(sel); if (e) e[ev] = fn; };
    set("[data-q]", "oninput", function (e) { s.q = e.target.value; s.page = 1; paintCRUD(key); var n = APP.querySelector("[data-q]"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } });
    set("[data-filter]", "onchange", function (e) { s.filter = e.target.value; s.page = 1; paintCRUD(key); });
    set("[data-sort]", "onchange", function (e) { s.sort = e.target.value; paintCRUD(key); });
    set("[data-dir]", "onclick", function () { s.dir *= -1; paintCRUD(key); });
    set("[data-size]", "onchange", function (e) { s.size = +e.target.value; s.page = 1; paintCRUD(key); });
    set("[data-add]", "onclick", function () { editRecord(key, null); });
    set("[data-csv]", "onclick", function () { dl(m.file.replace(".json", "") + ".csv", csv(filtered(key), cols.map(function (c) { return { k: c, l: c }; })), "text/csv"); });
    set("[data-json]", "onclick", function () { dl(m.file, JSON.stringify(s.rows, null, 2)); });
    set("[data-vsave]", "onclick", function () {
      var n = prompt("Nama tampilan:", (s.filter || s.q || "Semua") + " · " + (s.sort || "asli"));
      if (!n) return; var all = views(); all[key] = all[key] || [];
      all[key].push({ n: n.slice(0, 26), q: s.q, filter: s.filter, sort: s.sort, dir: s.dir, size: s.size });
      setViews(all); paintCRUD(key); toast("Tampilan tersimpan.", "success");
    });
    APP.querySelectorAll("[data-vw]").forEach(function (b) {
      b.onclick = function () { var v = (views()[key] || [])[+b.dataset.vw]; if (!v) return; s.q = v.q; s.filter = v.filter; s.sort = v.sort; s.dir = v.dir; s.size = v.size; s.page = 1; paintCRUD(key); };
    });
    APP.querySelectorAll("[data-vd]").forEach(function (b) {
      b.onclick = function () { var all = views(), rm = (all[key] || []).splice(+b.dataset.vd, 1)[0]; setViews(all); paintCRUD(key); offerUndo('Tampilan "' + rm.n + '" dihapus', function () { var a2 = views(); a2[key] = a2[key] || []; a2[key].push(rm); setViews(a2); paintCRUD(key); }); };
    });
    APP.querySelectorAll("[data-pg]").forEach(function (b) { b.onclick = function () { s.page = +b.dataset.pg; paintCRUD(key); }; });
    set("[data-all]", "onchange", function (e) { slice.forEach(function (r) { s.sel[r.id] = e.target.checked; }); paintCRUD(key); });
    APP.querySelectorAll("[data-sel]").forEach(function (c) { c.onchange = function () { s.sel[c.dataset.sel] = c.checked; paintCRUD(key); }; });
    set("[data-bclr]", "onclick", function () { s.sel = {}; paintCRUD(key); });
    APP.querySelectorAll("[data-bulk]").forEach(function (b) {
      b.onclick = async function () {
        var snap = clone(s.rows), val = b.dataset.bulk, n = 0;
        s.rows.forEach(function (r) { if (s.sel[r.id] && r.status !== undefined) { r.status = val; n++; } });
        if (!n) return toast("Record terpilih tidak punya kolom status.", "info");
        s.sel = {}; paintCRUD(key);
        if (!await save(m.file, s.rows, m.title, "UBAH STATUS MASSAL", n + " record → " + val)) { s.rows = snap; paintCRUD(key); }
      };
    });
    set("[data-bdel]", "onclick", async function () {
      var ids = Object.keys(s.sel).filter(function (k) { return s.sel[k]; });
      if (!ids.length || !confirm("Hapus " + ids.length + " record terpilih?")) return;
      var snap = clone(s.rows), removed = s.rows.filter(function (r) { return s.sel[r.id]; });
      s.rows = s.rows.filter(function (r) { return !s.sel[r.id]; }); s.sel = {}; paintCRUD(key);
      offerUndo(removed.length + " record dihapus", async function () { s.rows = snap; paintCRUD(key); await save(m.file, s.rows, m.title, "URUNGKAN HAPUS", removed.length + " record dipulihkan"); });
      await save(m.file, s.rows, m.title, "HAPUS MASSAL", removed.length + " record");
    });
    APP.querySelectorAll("[data-view]").forEach(function (b) { b.onclick = function () { viewRecord(key, s.rows.find(function (r) { return String(r.id) === b.dataset.view; })); }; });
    APP.querySelectorAll("[data-edit]").forEach(function (b) { b.onclick = function () { editRecord(key, s.rows.find(function (r) { return String(r.id) === b.dataset.edit; })); }; });
    APP.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = async function () {
        var r = s.rows.find(function (x) { return String(x.id) === b.dataset.del; });
        if (!r || !confirm('Hapus "' + (r.nama || r.judul || r.id) + '"?')) return;
        var snap = clone(s.rows);
        s.rows = s.rows.filter(function (x) { return x.id !== r.id; }); paintCRUD(key);
        offerUndo("1 record dihapus", async function () { s.rows = snap; paintCRUD(key); await save(m.file, s.rows, m.title, "URUNGKAN HAPUS", r.id); });
        await save(m.file, s.rows, m.title, "HAPUS", r.nama || r.judul || r.id);
      };
    });
    APP.querySelectorAll("[data-row][draggable]").forEach(function (tr) {
      tr.ondragstart = function (e) { s.drag = tr.dataset.row; tr.style.opacity = ".4"; try { e.dataTransfer.setData("text/plain", s.drag); } catch (x) {} };
      tr.ondragend = function () { tr.style.opacity = ""; APP.querySelectorAll("[data-row]").forEach(function (x) { x.style.boxShadow = ""; }); };
      tr.ondragover = function (e) { e.preventDefault(); tr.style.boxShadow = "inset 0 0 0 2px #34d399"; };
      tr.ondragleave = function () { tr.style.boxShadow = ""; };
      tr.ondrop = async function (e) {
        e.preventDefault();
        var t = tr.dataset.row; if (!s.drag || s.drag === t) return;
        var snap = clone(s.rows), a = s.rows.slice();
        var f = a.findIndex(function (r) { return String(r.id) === s.drag; }), to = a.findIndex(function (r) { return String(r.id) === t; });
        if (f < 0 || to < 0) return;
        a.splice(to, 0, a.splice(f, 1)[0]); a.forEach(function (r, i) { r.urutan = i + 1; });
        s.rows = a; s.drag = null; s.sort = ""; paintCRUD(key);
        if (!await save(m.file, s.rows, m.title, "URUTKAN", "Urutan diperbarui")) { s.rows = snap; paintCRUD(key); }
      };
    });
  }
  function fieldHTML(f, v) {
    var k = f[0], l = f[1], t = f[2] || "text", req = f[3];
    var val = v == null ? "" : v;
    var lab = '<label style="display:block;margin-bottom:11px"><span style="display:block;font-size:11px;font-weight:800;color:#475569;margin-bottom:5px">' + esc(l) + (req ? " *" : "") + "</span>";
    if (t === "bool") return '<label style="display:flex;align-items:center;gap:9px;margin-bottom:11px;font-size:12.5px;font-weight:700;color:#475569"><input type="checkbox" name="' + k + '" ' + (val ? "checked" : "") + ' style="width:18px;height:18px;accent-color:#16a34a">' + esc(l) + "</label>";
    if (t === "area") return lab + '<textarea class="fx-in" name="' + k + '" rows="3"' + (req ? " required" : "") + ">" + esc(val) + "</textarea></label>";
    if (t.indexOf("sel:") === 0) return lab + '<select class="fx-in" name="' + k + '"' + (req ? " required" : "") + '><option value="">— pilih —</option>' + t.slice(4).split(",").map(function (o) { return '<option ' + (String(val) === o ? "selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select></label>";
    if (t.indexOf("ref:") === 0) return lab + '<select class="fx-in" name="' + k + '" data-ref="' + esc(t) + '"' + (req ? " required" : "") + '><option value="' + esc(val) + '">' + (val ? esc(val) : "— pilih —") + "</option></select></label>";
    return lab + '<input class="fx-in" type="' + (t === "num" ? "number" : t === "date" ? "date" : t === "time" ? "time" : t === "tel" ? "tel" : "text") + '" name="' + k + '" value="' + esc(val) + '"' + (t === "num" ? ' step="any"' : "") + (req ? " required" : "") + "></label>";
  }
  async function fillRefs(scope, row) {
    var els = scope.querySelectorAll("[data-ref]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], spec = el.dataset.ref, cur = row ? row[el.name] : "";
      var o = await refOpts(spec);
      el.innerHTML = '<option value="">— pilih —</option>' + o.map(function (p) {
        return '<option value="' + esc(p[0]) + '" ' + (String(cur) === String(p[0]) ? "selected" : "") + ">" + esc(cut(p[1], 60)) + "</option>";
      }).join("");
    }
  }
  function viewRecord(key, r) {
    if (!r) return;
    var m = M[key];
    var body = '<div class="space-y-2">' + Object.keys(r).map(function (k) {
      var v = r[k]; if (v && typeof v === "object") v = JSON.stringify(v, null, 2);
      return '<div style="border:1px solid #e2e8f0;border-radius:12px;padding:9px 11px"><div style="font-size:9.5px;font-weight:800;text-transform:uppercase;color:#94a3b8">' + esc(k) + '</div><div style="font-size:12.5px;color:#0f172a;white-space:pre-wrap;word-break:break-word;font-family:' + (typeof r[k] === "object" ? "ui-monospace,monospace" : "inherit") + '">' + esc(v == null ? "—" : v) + "</div></div>";
    }).join("") + "</div>";
    drawer(m.title + " · Detail", body, '<button type="button" class="fx-btn" id="fxVcopy">Salin JSON</button><button type="button" class="fx-btn p" id="fxVedit">Edit record</button>');
    q("fxVcopy").onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(JSON.stringify(r, null, 2)) : Promise.reject()).then(function () { toast("JSON disalin.", "success"); }, function () { dl((r.id || "record") + ".json", JSON.stringify(r, null, 2)); }); };
    q("fxVedit").onclick = function () { editRecord(key, r); };
  }
  async function editRecord(key, row) {
    var m = M[key], s = state(key), fields = m.fields;
    if (!fields) {
      var keys = Object.keys(row || s.rows[0] || { id: "", nama: "" });
      fields = keys.map(function (k) { return [k, k, typeof (row || s.rows[0])[k] === "number" ? "num" : typeof (row || s.rows[0])[k] === "boolean" ? "bool" : "text"]; });
    }
    var body = '<form id="fxForm">' + fields.map(function (f) { return fieldHTML(f, row ? row[f[0]] : (f[2] === "date" ? now() : f[0] === "status" ? "Tampil" : "")); }).join("") + "</form>";
    drawer((row ? "Edit " : "Tambah ") + m.title, body, '<button type="button" class="fx-btn" id="fxCancel">Batal</button><button type="button" class="fx-btn p" id="fxOk">Simpan</button>');
    q("fxCancel").onclick = closeDrawer;
    await fillRefs(q("fxForm"), row);
    q("fxOk").onclick = async function () {
      var form = q("fxForm");
      if (!form.reportValidity()) return;
      var o = {};
      fields.forEach(function (f) {
        var el = form.elements[f[0]]; if (!el) return;
        o[f[0]] = f[2] === "bool" ? el.checked : f[2] === "num" ? (el.value === "" ? 0 : Number(el.value)) : el.value;
      });
      var rec = Object.assign({}, row || {}, o);
      if (!rec.id) rec.id = uid();
      var snap = clone(s.rows);
      if (row) { var i = s.rows.findIndex(function (x) { return x.id === row.id; }); s.rows[i] = rec; }
      else s.rows.unshift(rec);
      closeDrawer(); paintCRUD(key);
      if (!await save(m.file, s.rows, m.title, row ? "EDIT" : "TAMBAH", rec.nama || rec.judul || rec.id)) { s.rows = snap; paintCRUD(key); }
    };
  }

  /* -------------------------------------------- generic config editor */
  function typeOf(v) {
    if (typeof v === "boolean") return "bool";
    if (typeof v === "number") return "num";
    if (Array.isArray(v)) return (v.length && typeof v[0] === "object") ? "objlist" : "list";
    if (v && typeof v === "object") return "obj";
    return "text";
  }
  function cfgNode(obj, path, depth) {
    return Object.keys(obj).map(function (k) {
      var p = path ? path + "." + k : k, v = obj[k], t = typeOf(v);
      var label = '<span style="font-size:11px;font-weight:800;color:#475569">' + esc(k) + "</span>";
      if (t === "bool") return '<label style="display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #e2e8f0;border-radius:11px;padding:8px 11px;margin-bottom:7px"><span style="font-size:12px;font-weight:700;color:#475569">' + esc(k) + '</span><input type="checkbox" data-cfg="' + esc(p) + '" ' + (v ? "checked" : "") + ' style="width:18px;height:18px;accent-color:#16a34a"></label>';
      if (t === "num") return '<div style="margin-bottom:9px">' + label + '<input class="fx-in" type="number" step="any" data-cfg="' + esc(p) + '" value="' + esc(v) + '"></div>';
      if (t === "text") return '<div style="margin-bottom:9px">' + label + (String(v).length > 64
        ? '<textarea class="fx-in" rows="3" data-cfg="' + esc(p) + '">' + esc(v) + "</textarea>"
        : '<input class="fx-in" data-cfg="' + esc(p) + '" value="' + esc(v) + '">') + "</div>";
      if (t === "list") return '<div style="margin-bottom:9px">' + label + '<textarea class="fx-in" rows="2" data-cfg="' + esc(p) + '" data-kind="list">' + esc(v.join(", ")) + '</textarea><span style="font-size:10px;color:#94a3b8">pisahkan dengan koma</span></div>';
      if (t === "obj") return '<details ' + (depth < 1 ? "open" : "") + ' style="border:1px solid #e2e8f0;border-radius:13px;padding:9px 11px;margin-bottom:8px"><summary style="cursor:pointer;font-size:12px;font-weight:800;color:#0f172a">' + esc(k) + ' <span style="color:#94a3b8;font-weight:600">(' + Object.keys(v).length + ' kunci)</span></summary><div style="margin-top:9px">' + cfgNode(v, p, depth + 1) + "</div></details>";
      if (t === "objlist") return '<details style="border:1px solid #e2e8f0;border-radius:13px;padding:9px 11px;margin-bottom:8px"><summary style="cursor:pointer;font-size:12px;font-weight:800;color:#0f172a">' + esc(k) + ' <span style="color:#94a3b8;font-weight:600">(' + v.length + ' butir)</span></summary><div style="margin-top:9px">' +
        v.map(function (it, i) { return '<div style="border:1px solid #f1f5f9;border-radius:11px;padding:8px;margin-bottom:7px;background:#f8fafc"><div style="font-size:9.5px;font-weight:800;color:#94a3b8;margin-bottom:5px">#' + (i + 1) + "</div>" + cfgNode(it, p + "[" + i + "]", depth + 2) + "</div>"; }).join("") +
        '<button type="button" class="fx-btn" data-cfgadd="' + esc(p) + '">+ butir</button> <button type="button" class="fx-btn d" data-cfgpop="' + esc(p) + '">− butir terakhir</button></div></details>';
      return "";
    }).join("");
  }
  function getPath(o, p) {
    var parts = p.replace(/\[(\d+)\]/g, ".$1").split(".");
    for (var i = 0; i < parts.length; i++) { if (o == null) return undefined; o = o[parts[i]]; }
    return o;
  }
  function setPath(o, p, val) {
    var parts = p.replace(/\[(\d+)\]/g, ".$1").split("."), cur = o;
    for (var i = 0; i < parts.length - 1; i++) { if (cur[parts[i]] == null) cur[parts[i]] = {}; cur = cur[parts[i]]; }
    cur[parts[parts.length - 1]] = val;
  }
  async function renderConfigFx(key) {
    var m = M[key], file = m.file;
    APP.innerHTML = head(m.title, "Sumber: data/" + file) + '<div class="fx-card p-8 text-center text-slate-400 text-sm">Memuat konfigurasi…</div>';
    var data;
    try { data = await readJSON(file, true); } catch (e) { APP.innerHTML = head(m.title) + '<div class="fx-card p-6 text-sm" style="color:#be123c">' + esc(e.message) + "</div>"; return; }
    if (Array.isArray(data)) { state(key).rows = data; return paintCRUD(key); }
    var work = clone(data);
    APP.innerHTML = head(m.title, "Sumber: data/" + file + " · perubahan diterapkan saat disimpan",
      '<button type="button" class="fx-btn" id="cfgExport">Ekspor</button> <button type="button" class="fx-btn" id="cfgReload">Muat ulang</button> <button type="button" class="fx-btn p" id="cfgSave">Simpan</button>') +
      '<div class="fx-card p-4 md:p-5"><div id="cfgTree">' + cfgNode(work, "", 0) + "</div></div>" +
      '<p class="text-[11px] text-slate-400 mt-3">Editor ini menulis langsung ke berkas konfigurasi. Struktur & kunci tidak diubah, hanya nilainya.</p>';
    icons();
    function collect() {
      APP.querySelectorAll("[data-cfg]").forEach(function (el) {
        var p = el.dataset.cfg, cur = getPath(work, p);
        var v;
        if (el.type === "checkbox") v = el.checked;
        else if (el.dataset.kind === "list") v = el.value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
        else if (typeof cur === "number") v = el.value === "" ? 0 : Number(el.value);
        else v = el.value;
        setPath(work, p, v);
      });
    }
    APP.querySelectorAll("[data-cfgadd]").forEach(function (b) {
      b.onclick = function () {
        collect();
        var arr = getPath(work, b.dataset.cfgadd) || [];
        var tpl = arr.length ? clone(arr[arr.length - 1]) : {};
        Object.keys(tpl).forEach(function (k) { if (typeof tpl[k] === "string") tpl[k] = ""; });
        arr.push(tpl); setPath(work, b.dataset.cfgadd, arr); redraw();
      };
    });
    APP.querySelectorAll("[data-cfgpop]").forEach(function (b) {
      b.onclick = function () { collect(); var arr = getPath(work, b.dataset.cfgpop) || []; arr.pop(); setPath(work, b.dataset.cfgpop, arr); redraw(); };
    });
    function redraw() { q("cfgTree").innerHTML = cfgNode(work, "", 0); bind(); icons(); }
    function bind() {
      APP.querySelectorAll("[data-cfgadd]").forEach(function (b) { b.onclick = function () { collect(); var arr = getPath(work, b.dataset.cfgadd) || []; var tpl = arr.length ? clone(arr[arr.length - 1]) : {}; Object.keys(tpl).forEach(function (k) { if (typeof tpl[k] === "string") tpl[k] = ""; }); arr.push(tpl); setPath(work, b.dataset.cfgadd, arr); redraw(); }; });
      APP.querySelectorAll("[data-cfgpop]").forEach(function (b) { b.onclick = function () { collect(); var arr = getPath(work, b.dataset.cfgpop) || []; arr.pop(); setPath(work, b.dataset.cfgpop, arr); redraw(); }; });
    }
    q("cfgExport").onclick = function () { collect(); dl(file, JSON.stringify(work, null, 2)); };
    q("cfgReload").onclick = function () { renderConfigFx(key); };
    q("cfgSave").onclick = async function () {
      collect();
      if (await save(file, work, "Konten Website", "UPDATE KONFIGURASI", file)) toast("Konfigurasi tersimpan.", "success");
    };
  }

  /* -------------------------------------------------- bespoke modules */
  var CACHE = {};
  async function grab(f) { try { var d = await readJSON(f); CACHE[f] = Array.isArray(d) ? d : d; return CACHE[f]; } catch (e) { CACHE[f] = []; return []; } }
  function statCard(l, v, c, ic) {
    return '<div class="fx-card p-4"><div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;color:#64748b"><i data-lucide="' + ic + '" style="width:15px;height:15px;color:' + c + '"></i>' + esc(l) + '</div><div style="font-size:23px;font-weight:800;color:' + c + ';margin-top:5px">' + esc(v) + "</div></div>";
  }
  G.fx_dashboard = async function () {
    APP.innerHTML = head("Dashboard", "Ringkasan operasional sekolah") + '<div class="fx-card p-8 text-center text-slate-400 text-sm">Menghitung…</div>';
    var s = await grab("siswa.json"), g = await grab("guru.json"), k = await grab("kelas.json"),
      sp = await grab("spp.json"), ab = await grab("absensi.json"), au = await grab("audit.json"), kg = await grab("kegiatan.json");
    var belum = sp.filter(function (x) { return x.status === "Belum"; });
    var today = now(), abT = ab.filter(function (x) { return x.tanggal === today; });
    APP.innerHTML = head("Dashboard", "Ringkasan operasional sekolah · " + tg(today)) +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' +
        statCard("Siswa Aktif", s.filter(function (x) { return x.status === "Aktif"; }).length, "#16a34a", "users") +
        statCard("Guru & Tendik", g.length, "#0284c7", "briefcase") +
        statCard("Rombel", k.length, "#7c3aed", "school") +
        statCard("Tunggakan SPP", rp(belum.reduce(function (a, b) { return a + (b.nominal || 0); }, 0)), "#e11d48", "wallet") +
      "</div>" +
      '<div class="grid lg:grid-cols-2 gap-4">' +
        '<div class="fx-card p-4"><b class="text-sm">Absensi hari ini</b><div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:11px">' +
          ["Hadir", "Sakit", "Izin", "Alfa"].map(function (x) { return '<span style="padding:7px 12px;border-radius:11px;background:#f8fafc;border:1px solid #e2e8f0;font-size:12.5px;font-weight:800">' + x + ": " + abT.filter(function (a) { return a.status === x; }).length + "</span>"; }).join("") +
          '</div><div style="margin-top:12px;font-size:12.5px;color:#64748b">Kegiatan terpublikasi: <b>' + kg.filter(function (x) { return x.status !== "Draft"; }).length + "</b></div>" +
          '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:7px"><a href="#/absensi" class="fx-btn p">Absensi</a><a href="#/spp" class="fx-btn">SPP</a><a href="#/kegiatan" class="fx-btn">Kegiatan</a></div></div>' +
        '<div class="fx-card p-4"><b class="text-sm">Audit terbaru</b><div style="margin-top:11px;display:grid;gap:6px">' +
          (au.slice(0, 7).map(function (l) { return '<div style="display:flex;gap:9px;font-size:12px"><span style="color:#16a34a;font-weight:800;white-space:nowrap">' + esc(l.aksi) + '</span><span style="color:#475569;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(l.detail) + '</span><span style="color:#94a3b8;font-size:10.5px;white-space:nowrap">' + esc(wk(l.waktu)) + "</span></div>"; }).join("") || '<span style="color:#94a3b8;font-size:12px">Belum ada aktivitas.</span>') +
          '</div><a href="#/audit" class="fx-btn" style="margin-top:12px">Lihat semua</a></div>' +
      "</div>";
    icons();
  };
  G.fx_absensi = async function () {
    var ab = await grab("absensi.json"), sw = await grab("siswa.json");
    var day = ST.__abDay || now();
    function paint() {
      var rows = ab.filter(function (a) { return a.tanggal === day; });
      APP.innerHTML = head("Absensi Siswa", "Rekap harian, input manual, dan kartu QR") +
        '<div class="fx-card p-4 mb-4"><div style="display:flex;flex-wrap:wrap;gap:9px;align-items:end">' +
          '<label style="font-size:11px;font-weight:800;color:#475569">Tanggal<input class="fx-in" type="date" id="abDay" value="' + day + '"></label>' +
          ["Hadir", "Sakit", "Izin", "Alfa"].map(function (x) { return '<span style="padding:7px 12px;border-radius:11px;background:#f8fafc;border:1px solid #e2e8f0;font-size:12.5px;font-weight:800">' + x + ": " + rows.filter(function (r) { return r.status === x; }).length + "</span>"; }).join("") +
          '<button type="button" class="fx-btn p" id="abAdd">Input manual</button><button type="button" class="fx-btn" id="abQr">Kartu QR</button>' +
        "</div></div>" +
        '<div class="fx-card overflow-hidden"><div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Jam</th><th>NIS</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Metode</th><th></th></tr></thead><tbody>' +
        (rows.map(function (r) { return '<tr><td>' + esc(r.jam) + '</td><td style="font-family:ui-monospace,monospace">' + esc(r.nis) + "</td><td><b>" + esc(r.nama) + "</b></td><td>" + esc(r.kelas) + '</td><td><span style="padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;' + tone(r.status) + '">' + esc(r.status) + "</span></td><td>" + esc(r.metode) + '</td><td style="text-align:right"><button type="button" class="fx-btn d" style="padding:4px 8px" data-abdel="' + esc(r.id) + '">Hapus</button></td></tr>'; }).join("") || '<tr><td colspan="7" style="padding:30px;text-align:center;color:#94a3b8">Belum ada catatan pada tanggal ini.</td></tr>') +
        "</tbody></table></div></div>";
      icons();
      q("abDay").onchange = function (e) { day = e.target.value; ST.__abDay = day; paint(); };
      q("abAdd").onclick = function () {
        drawer("Input Absensi Manual",
          '<form id="abF"><label style="display:block;margin-bottom:11px"><span style="font-size:11px;font-weight:800;color:#475569">Siswa *</span><select class="fx-in" name="nis" required><option value="">— pilih —</option>' + sw.map(function (s) { return '<option value="' + esc(s.nis) + '">' + esc(s.nama + " · " + s.nis + " · " + s.kelas) + "</option>"; }).join("") + '</select></label>' +
          '<label style="display:block;margin-bottom:11px"><span style="font-size:11px;font-weight:800;color:#475569">Tanggal</span><input class="fx-in" type="date" name="tanggal" value="' + day + '"></label>' +
          '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Status</span><select class="fx-in" name="status">' + ["Hadir", "Sakit", "Izin", "Alfa"].map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select></label></form>",
          '<button type="button" class="fx-btn" id="abC">Batal</button><button type="button" class="fx-btn p" id="abO">Catat</button>');
        q("abC").onclick = closeDrawer;
        q("abO").onclick = async function () {
          var f = q("abF"), nis = f.nis.value; if (!nis) return toast("Pilih siswa.", "error");
          var s = sw.find(function (x) { return x.nis === nis; });
          if (ab.some(function (a) { return a.nis === nis && a.tanggal === f.tanggal.value; })) return toast("Siswa sudah tercatat pada tanggal itu.", "info");
          ab.unshift({ id: uid(), tanggal: f.tanggal.value, nis: s.nis, nama: s.nama, kelas: s.kelas, status: f.status.value, metode: "Manual", jam: jam() });
          closeDrawer(); day = f.tanggal.value; ST.__abDay = day; paint();
          await save("absensi.json", ab, "Absensi", "INPUT ABSENSI", s.nama + " " + f.status.value);
        };
      };
      q("abQr").onclick = function () {
        var list = sw.filter(function (s) { return s.status === "Aktif"; }).slice(0, 60);
        drawer("Kartu QR Absensi", '<p style="font-size:12px;color:#64748b;margin-bottom:12px">Isi QR: <code>SIS:NIS</code>. Menampilkan 60 siswa aktif pertama.</p><div id="qrG" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px">' +
          list.map(function (s) { return '<div style="border:1px solid #e2e8f0;border-radius:13px;padding:9px;text-align:center"><div id="q_' + esc(s.nis) + '" style="display:flex;justify-content:center"></div><div style="font-size:10.5px;font-weight:800;margin-top:6px">' + esc(cut(s.nama, 20)) + '</div><div style="font-size:9.5px;color:#94a3b8">' + esc(s.nis) + "</div></div>"; }).join("") + "</div>",
          '<button type="button" class="fx-btn" id="qrP">Cetak</button>');
        if (G.QRCode) list.forEach(function (s) { var el = q("q_" + s.nis); if (el) new G.QRCode(el, { text: "SIS:" + s.nis, width: 88, height: 88 }); });
        else toast("Pustaka QR belum dimuat.", "info");
        q("qrP").onclick = function () {
          var cards = Array.prototype.map.call(D.querySelectorAll("#qrG canvas"), function (c) { return c.toDataURL("image/png"); });
          printDoc("Kartu QR Absensi", '<h2 class="center">Kartu QR Absensi</h2><div style="display:flex;flex-wrap:wrap;gap:10px">' + cards.map(function (src, i) { return '<div style="border:1px solid #94a3b8;border-radius:8px;padding:8px;width:130px;text-align:center"><img src="' + src + '" width="100"><div style="font-size:10px;font-weight:700">' + esc(list[i].nama) + '</div><div style="font-size:9px;color:#64748b">' + esc(list[i].nis) + "</div></div>"; }).join("") + "</div>");
        };
      };
      APP.querySelectorAll("[data-abdel]").forEach(function (b) {
        b.onclick = async function () {
          var snap = clone(ab); ab = ab.filter(function (x) { return String(x.id) !== b.dataset.abdel; }); CACHE["absensi.json"] = ab; paint();
          offerUndo("Catatan dihapus", function () { ab = snap; CACHE["absensi.json"] = ab; paint(); });
          await save("absensi.json", ab, "Absensi", "HAPUS ABSENSI", day);
        };
      });
    }
    paint();
  };
  G.fx_rapor = async function () {
    var sw = await grab("siswa.json"), nl = await grab("nilai.json"), kl = await grab("kelas.json"), gu = await grab("guru.json"), st = await readJSON("settings.json").catch(function () { return {}; });
    APP.innerHTML = head("e-Rapor", "Rekap nilai per siswa, Kurikulum Merdeka atau K13, siap cetak") +
      '<div class="fx-card p-4"><div style="display:flex;flex-wrap:wrap;gap:9px;align-items:end">' +
        '<label style="flex:1;min-width:200px;font-size:11px;font-weight:800;color:#475569">Siswa<select class="fx-in" id="rpS"><option value="">— pilih —</option>' + sw.map(function (s) { return '<option value="' + esc(s.nis) + '">' + esc(s.nama + " · " + s.kelas) + "</option>"; }).join("") + "</select></label>" +
        '<label style="font-size:11px;font-weight:800;color:#475569">Kurikulum<select class="fx-in" id="rpK"><option>Merdeka</option><option>K13</option></select></label>' +
        '<label style="font-size:11px;font-weight:800;color:#475569">Semester<select class="fx-in" id="rpM"><option>Ganjil</option><option>Genap</option></select></label>' +
        '<button type="button" class="fx-btn p" id="rpGo">Tampilkan</button><button type="button" class="fx-btn" id="rpPr">Cetak</button>' +
      "</div></div><div id=\"rpOut\" style=\"margin-top:14px\"></div>";
    icons();
    var lastDoc = "";
    var pred = function (n, k) { return k === "Merdeka" ? (n >= 81 ? "Mahir" : n >= 71 ? "Cakap" : n >= 61 ? "Dasar" : "Perlu Bimbingan") : (n >= 85 ? "A" : n >= 70 ? "B" : n >= 55 ? "C" : "D"); };
    q("rpGo").onclick = function () {
      var nis = q("rpS").value; if (!nis) return toast("Pilih siswa.", "info");
      var s = sw.find(function (x) { return x.nis === nis; }), kur = q("rpK").value, sem = q("rpM").value;
      var rows = nl.filter(function (n) { return n.nis === nis && (!n.semester || n.semester === sem); });
      var by = {}; rows.forEach(function (n) { (by[n.mapel] = by[n.mapel] || []).push(Number(n.nilai) || 0); });
      var keys = Object.keys(by);
      var avgAll = keys.length ? Math.round(keys.reduce(function (a, k) { return a + by[k].reduce(function (x, y) { return x + y; }, 0) / by[k].length; }, 0) / keys.length) : 0;
      var kk = kl.find(function (x) { return x.nama === s.kelas; }), wali = kk ? gu.find(function (g) { return g.id === kk.wali_kelas; }) : null;
      var body = '<div class="center"><h2>' + esc(st.nama_sekolah || "Sekolah") + '</h2><div class="muted">NPSN ' + esc(st.npsn || "-") + " · TA " + esc(st.tahun_ajaran || "-") + '</div><hr><h3>LAPORAN HASIL BELAJAR</h3><div class="muted">Kurikulum ' + kur + " · Semester " + sem + "</div></div>" +
        "<table><tr><th>Nama</th><td><b>" + esc(s.nama) + "</b></td><th>NIS / NISN</th><td>" + esc(s.nis) + " / " + esc(s.nisn || "-") + "</td></tr>" +
        "<tr><th>Kelas</th><td>" + esc(s.kelas) + "</td><th>Wali Kelas</th><td>" + esc(wali ? wali.nama : "-") + "</td></tr></table>" +
        "<table><tr><th>No</th><th>Mata Pelajaran</th><th>Rata-rata</th><th>Predikat</th></tr>" +
        (keys.map(function (k, i) { var a = Math.round(by[k].reduce(function (x, y) { return x + y; }, 0) / by[k].length); return "<tr><td>" + (i + 1) + "</td><td>" + esc(k) + '</td><td class="center">' + a + '</td><td class="center">' + pred(a, kur) + "</td></tr>"; }).join("") || '<tr><td colspan="4" class="center muted">Belum ada nilai.</td></tr>') +
        '<tr><th colspan="2" class="right">Rata-rata</th><th class="center">' + avgAll + '</th><th class="center">' + pred(avgAll, kur) + "</th></tr></table>" +
        '<div class="ttd"><div>Orang Tua/Wali<br><br><br>(........................)</div><div>Wali Kelas<br><br><br><b>' + esc(wali ? wali.nama : "........................") + '</b></div><div>Kepala Sekolah<br><br><br><b>' + esc(st.kepala_sekolah || "........................") + "</b></div></div>";
      lastDoc = body;
      q("rpOut").innerHTML = '<div class="fx-card p-4" style="font-size:13px">' + body + "</div>";
    };
    q("rpPr").onclick = function () { if (!lastDoc) return toast("Klik Tampilkan dahulu.", "info"); printDoc("Rapor", lastDoc); };
  };
  G.fx_spp = async function () {
    var sp = await grab("spp.json"), sw = await grab("siswa.json"), kl = await grab("kelas.json"), st = await readJSON("settings.json").catch(function () { return {}; });
    var tab = ST.__sppTab || "tagihan";
    function paint() {
      var belum = sp.filter(function (x) { return x.status === "Belum"; });
      var body;
      if (tab === "tagihan") {
        body = '<div class="fx-card p-4 mb-3"><div style="display:flex;flex-wrap:wrap;gap:9px;align-items:end">' +
          '<label style="font-size:11px;font-weight:800;color:#475569">Bulan<select class="fx-in" id="gB">' + BLN.map(function (b, i) { return '<option value="' + (i + 1) + '" ' + (i === new Date().getMonth() ? "selected" : "") + ">" + b + "</option>"; }).join("") + "</select></label>" +
          '<label style="font-size:11px;font-weight:800;color:#475569">Tahun<input class="fx-in" type="number" id="gT" value="' + new Date().getFullYear() + '"></label>' +
          '<label style="font-size:11px;font-weight:800;color:#475569">Kelas<select class="fx-in" id="gK"><option value="ALL">Semua</option>' + kl.map(function (k) { return "<option>" + esc(k.nama) + "</option>"; }).join("") + "</select></label>" +
          '<label style="font-size:11px;font-weight:800;color:#475569">Nominal<input class="fx-in" type="number" id="gN" value="' + (st.spp_nominal || 150000) + '"></label>' +
          '<button type="button" class="fx-btn p" id="gGo">Generate tagihan</button></div></div>' +
          '<div class="fx-card overflow-hidden"><div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Siswa</th><th>Kelas</th><th>Bulan</th><th>Nominal</th><th>VA</th><th>Status</th><th></th></tr></thead><tbody>' +
          sp.slice(0, 300).map(function (r) {
            return "<tr><td><b>" + esc(r.nama) + "</b></td><td>" + esc(r.kelas) + "</td><td>" + esc(BLN[(r.bulan || 1) - 1]) + " " + esc(r.tahun) + '</td><td style="text-align:right">' + esc(rp(r.nominal)) + '</td><td style="font-family:ui-monospace,monospace;font-size:11px">' + esc(r.va) + '</td><td><span style="padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;' + tone(r.status) + '">' + esc(r.status) + "</span></td>" +
              '<td style="text-align:right;white-space:nowrap">' + (r.status === "Belum" ? '<button type="button" class="fx-btn p" style="padding:4px 8px" data-pay="' + esc(r.id) + '">Bayar</button> ' : "") + '<button type="button" class="fx-btn d" style="padding:4px 8px" data-sdel="' + esc(r.id) + '">Hapus</button></td></tr>';
          }).join("") + "</tbody></table></div></div>";
      } else {
        var grp = {};
        belum.forEach(function (b) { var g = grp[b.nis] = grp[b.nis] || { nama: b.nama, kelas: b.kelas, n: 0, total: 0, bl: [] }; g.n++; g.total += b.nominal || 0; g.bl.push(BLN[(b.bulan || 1) - 1]); });
        body = '<div class="fx-card overflow-hidden"><div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Siswa</th><th>Kelas</th><th>Bulan menunggak</th><th>Total</th><th></th></tr></thead><tbody>' +
          (Object.keys(grp).map(function (nis) {
            var g = grp[nis], s = sw.find(function (x) { return x.nis === nis; });
            var msg = "Yth. Orang Tua " + g.nama + ", tagihan SPP belum dibayar: " + g.bl.join(", ") + ". Total " + rp(g.total) + ". Mohon segera melakukan pembayaran. — " + (st.nama_sekolah || "Sekolah");
            return "<tr><td><b>" + esc(g.nama) + "</b></td><td>" + esc(g.kelas) + "</td><td>" + esc(cut(g.bl.join(", "), 40)) + '</td><td style="text-align:right;font-weight:800;color:#e11d48">' + esc(rp(g.total)) + '</td><td style="text-align:right"><a class="fx-btn" target="_blank" href="https://wa.me/' + esc(String((s && s.no_hp_ortu) || "").replace(/^0/, "62")) + "?text=" + encodeURIComponent(msg) + '">Ingatkan</a></td></tr>";
          }).join("") || '<tr><td colspan="5" style="padding:30px;text-align:center;color:#94a3b8">Tidak ada tunggakan.</td></tr>') + "</tbody></table></div></div>";
      }
      APP.innerHTML = head("SPP · VA & QRIS", "Generate tagihan massal, tandai pembayaran, pantau tunggakan") +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' +
          statCard("Total tagihan", sp.length, "#0f172a", "receipt") +
          statCard("Tunggakan", rp(belum.reduce(function (a, b) { return a + (b.nominal || 0); }, 0)), "#e11d48", "wallet") +
          statCard("Siswa menunggak", Object.keys(belum.reduce(function (a, b) { a[b.nis] = 1; return a; }, {})).length, "#f59e0b", "users") +
          statCard("Lunas", sp.filter(function (x) { return x.status === "Lunas"; }).length, "#16a34a", "circle-check") +
        "</div>" +
        '<div style="display:flex;gap:7px;margin-bottom:12px"><button type="button" class="fx-chip ' + (tab === "tagihan" ? "on" : "") + '" data-tab="tagihan">Tagihan</button><button type="button" class="fx-chip ' + (tab === "tunggakan" ? "on" : "") + '" data-tab="tunggakan">Tunggakan</button></div>' + body;
      icons();
      APP.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; ST.__sppTab = tab; paint(); }; });
      var gg = q("gGo");
      if (gg) gg.onclick = async function () {
        var bl = +q("gB").value, th = +q("gT").value, kk = q("gK").value, nom = +q("gN").value;
        var target = sw.filter(function (s) { return s.status === "Aktif" && (kk === "ALL" || s.kelas === kk); });
        var baru = target.filter(function (s) { return !sp.some(function (x) { return x.nis === s.nis && x.bulan === bl && x.tahun === th; }); })
          .map(function (s) { return { id: uid(), nis: s.nis, nama: s.nama, kelas: s.kelas, bulan: bl, tahun: th, nominal: nom, status: "Belum", metode: "", tanggal_bayar: "", va: ((st.bank && st.bank.va_prefix) || "88088") + s.nis + String(bl).padStart(2, "0") + String(th).slice(2) }; });
        if (!baru.length) return toast("Semua siswa target sudah punya tagihan bulan itu.", "info");
        sp = baru.concat(sp); CACHE["spp.json"] = sp; paint();
        await save("spp.json", sp, "Keuangan", "GENERATE SPP", baru.length + " tagihan " + BLN[bl - 1] + " " + th);
      };
      APP.querySelectorAll("[data-pay]").forEach(function (b) {
        b.onclick = function () {
          var r = sp.find(function (x) { return String(x.id) === b.dataset.pay; });
          drawer("Pembayaran SPP · " + r.nama, '<p style="font-size:13px;color:#475569;margin-bottom:12px">' + esc(BLN[(r.bulan || 1) - 1]) + " " + esc(r.tahun) + " · <b>" + esc(rp(r.nominal)) + "</b> · VA <code>" + esc(r.va) + "</code></p>" +
            '<label style="display:block;margin-bottom:11px"><span style="font-size:11px;font-weight:800;color:#475569">Metode</span><select class="fx-in" id="pyM"><option>Transfer VA</option><option>QRIS</option><option>Tunai</option></select></label>' +
            '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Tanggal bayar</span><input class="fx-in" type="date" id="pyT" value="' + now() + '"></label>',
            '<button type="button" class="fx-btn" id="pyC">Batal</button><button type="button" class="fx-btn p" id="pyO">Konfirmasi lunas</button>');
          q("pyC").onclick = closeDrawer;
          q("pyO").onclick = async function () {
            r.status = "Lunas"; r.metode = q("pyM").value; r.tanggal_bayar = q("pyT").value;
            closeDrawer(); paint();
            await save("spp.json", sp, "Keuangan", "BAYAR SPP", r.nama + " " + rp(r.nominal) + " via " + r.metode);
          };
        };
      });
      APP.querySelectorAll("[data-sdel]").forEach(function (b) {
        b.onclick = async function () {
          var snap = clone(sp); sp = sp.filter(function (x) { return String(x.id) !== b.dataset.sdel; }); CACHE["spp.json"] = sp; paint();
          offerUndo("Tagihan dihapus", function () { sp = snap; CACHE["spp.json"] = sp; paint(); });
          await save("spp.json", sp, "Keuangan", "HAPUS TAGIHAN", b.dataset.sdel);
        };
      });
    }
    paint();
  };
  G.fx_gaji = async function () {
    var gj = await grab("gaji.json"), gu = await grab("guru.json");
    function paint() {
      APP.innerHTML = head("Penggajian", "Generate slip dari data pegawai, tandai dibayar, cetak slip") +
        '<div class="fx-card p-4 mb-3"><div style="display:flex;flex-wrap:wrap;gap:9px;align-items:end">' +
          '<label style="font-size:11px;font-weight:800;color:#475569">Bulan<select class="fx-in" id="pB">' + BLN.map(function (b, i) { return '<option value="' + (i + 1) + '" ' + (i === new Date().getMonth() ? "selected" : "") + ">" + b + "</option>"; }).join("") + "</select></label>" +
          '<label style="font-size:11px;font-weight:800;color:#475569">Tahun<input class="fx-in" type="number" id="pT" value="' + new Date().getFullYear() + '"></label>' +
          '<button type="button" class="fx-btn p" id="pGo">Generate semua pegawai</button></div></div>' +
        '<div class="fx-card overflow-hidden"><div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Pegawai</th><th>Periode</th><th>Pokok</th><th>Tunjangan</th><th>Potongan</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>' +
        gj.slice(0, 300).map(function (g) {
          return "<tr><td><b>" + esc(g.nama) + "</b></td><td>" + esc(BLN[(g.bulan || 1) - 1]) + " " + esc(g.tahun) + '</td><td style="text-align:right">' + esc(rp(g.pokok)) + '</td><td style="text-align:right">' + esc(rp(g.tunjangan)) + '</td><td style="text-align:right">' + esc(rp(g.potongan)) + '</td><td style="text-align:right;font-weight:800">' + esc(rp(g.total)) + '</td><td><span style="padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;' + tone(g.status) + '">' + esc(g.status) + "</span></td>" +
            '<td style="text-align:right;white-space:nowrap">' + (g.status !== "Dibayar" ? '<button type="button" class="fx-btn p" style="padding:4px 8px" data-gpay="' + esc(g.id) + '">Bayar</button> ' : "") + '<button type="button" class="fx-btn" style="padding:4px 8px" data-gslip="' + esc(g.id) + '">Slip</button></td></tr>';
        }).join("") + "</tbody></table></div></div>";
      icons();
      q("pGo").onclick = async function () {
        var bl = +q("pB").value, th = +q("pT").value;
        var baru = gu.filter(function (g) { return !gj.some(function (x) { return x.guru_id === g.id && x.bulan === bl && x.tahun === th; }); })
          .map(function (g) { return { id: uid(), guru_id: g.id, nama: g.nama, bulan: bl, tahun: th, pokok: g.gaji_pokok || 0, tunjangan: 0, potongan: 0, total: g.gaji_pokok || 0, status: "Belum", tanggal_bayar: "" }; });
        if (!baru.length) return toast("Semua pegawai sudah punya slip periode itu.", "info");
        gj = baru.concat(gj); CACHE["gaji.json"] = gj; paint();
        await save("gaji.json", gj, "Keuangan", "GENERATE GAJI", baru.length + " slip");
      };
      APP.querySelectorAll("[data-gpay]").forEach(function (b) {
        b.onclick = async function () {
          var g = gj.find(function (x) { return String(x.id) === b.dataset.gpay; });
          if (!confirm("Tandai gaji " + g.nama + " (" + rp(g.total) + ") dibayar?")) return;
          g.status = "Dibayar"; g.tanggal_bayar = now(); paint();
          await save("gaji.json", gj, "Keuangan", "BAYAR GAJI", g.nama + " " + rp(g.total));
        };
      });
      APP.querySelectorAll("[data-gslip]").forEach(function (b) {
        b.onclick = function () {
          var g = gj.find(function (x) { return String(x.id) === b.dataset.gslip; });
          printDoc("Slip Gaji " + g.nama, '<div class="center"><h2>SLIP GAJI PEGAWAI</h2><div class="muted">Periode ' + esc(BLN[(g.bulan || 1) - 1]) + " " + esc(g.tahun) + "</div></div>" +
            "<table><tr><th>Nama</th><td>" + esc(g.nama) + "</td></tr><tr><th>Gaji Pokok</th><td class='right'>" + rp(g.pokok) + "</td></tr><tr><th>Tunjangan</th><td class='right'>" + rp(g.tunjangan) + "</td></tr><tr><th>Potongan</th><td class='right'>(" + rp(g.potongan) + ")</td></tr><tr><th>TOTAL DITERIMA</th><td class='right'><b>" + rp(g.total) + "</b></td></tr><tr><th>Status</th><td>" + esc(g.status) + "</td></tr></table>" +
            '<div class="ttd"><div>Penerima<br><br><br><b>' + esc(g.nama) + "</b></div><div>Bendahara<br><br><br>(........................)</div></div>");
        };
      });
    }
    paint();
  };
  G.fx_audit = async function () {
    var log = await grab("audit.json"), f = "";
    function paint() {
      var mods = Array.from(new Set(log.map(function (l) { return l.modul; }).filter(Boolean)));
      var rows = f ? log.filter(function (l) { return l.modul === f; }) : log;
      APP.innerHTML = head("Audit Log", "Tercatat otomatis untuk setiap operasi tulis ke GitHub") +
        '<div class="fx-card p-3.5 mb-3"><div style="display:flex;flex-wrap:wrap;gap:9px"><select class="fx-in" style="width:auto" id="auF"><option value="">Semua modul</option>' + mods.map(function (m) { return "<option " + (f === m ? "selected" : "") + ">" + esc(m) + "</option>"; }).join("") + '</select><button type="button" class="fx-btn" id="auC">Ekspor CSV</button></div></div>' +
        '<div class="fx-card overflow-hidden"><div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Waktu</th><th>Aktor</th><th>Modul</th><th>Aksi</th><th>Detail</th></tr></thead><tbody>' +
        (rows.slice(0, 400).map(function (l) { return "<tr><td style='white-space:nowrap;font-size:11px'>" + esc(wk(l.waktu)) + "</td><td><b>" + esc(l.aktor) + "</b></td><td>" + esc(l.modul) + '</td><td style="color:#15803d;font-weight:800;font-size:11px">' + esc(l.aksi) + "</td><td>" + esc(cut(l.detail, 70)) + "</td></tr>"; }).join("") || '<tr><td colspan="5" style="padding:30px;text-align:center;color:#94a3b8">Belum ada log.</td></tr>') +
        "</tbody></table></div></div>";
      icons();
      q("auF").onchange = function (e) { f = e.target.value; paint(); };
      q("auC").onclick = function () { dl("audit-log.csv", csv(rows, [{ k: "waktu", l: "waktu" }, { k: "aktor", l: "aktor" }, { k: "modul", l: "modul" }, { k: "aksi", l: "aksi" }, { k: "detail", l: "detail" }]), "text/csv"); };
    }
    paint();
  };
  G.fx_chat = async function () {
    var ch = await grab("chat.json"), sw = await grab("siswa.json");
    var nis = ST.__chatNis || (ch[0] && ch[0].nis) || (sw[0] && sw[0].nis);
    function paint() {
      var s = sw.find(function (x) { return x.nis === nis; });
      var msgs = ch.filter(function (c) { return c.nis === nis; }).sort(function (a, b) { return String(a.waktu).localeCompare(String(b.waktu)); });
      var threads = Array.from(new Set(ch.map(function (c) { return c.nis; })));
      APP.innerHTML = head("Chat Wali Kelas", "Pesan sekolah tersimpan di chat.json dan dibaca Portal Orang Tua") +
        '<div class="grid lg:grid-cols-3 gap-4">' +
          '<div class="fx-card p-3.5"><label style="font-size:11px;font-weight:800;color:#475569">Percakapan<select class="fx-in" id="chPick">' + sw.slice(0, 400).map(function (x) { return '<option value="' + esc(x.nis) + '" ' + (x.nis === nis ? "selected" : "") + ">" + esc(x.nama + " · " + x.kelas) + "</option>"; }).join("") + "</select></label>" +
            '<div style="margin-top:11px;display:grid;gap:5px;max-height:320px;overflow-y:auto" class="fx-scroll">' + threads.slice(0, 60).map(function (n) { var x = sw.find(function (y) { return y.nis === n; }); var last = ch.filter(function (c) { return c.nis === n; }).slice(-1)[0]; return '<button type="button" data-th="' + esc(n) + '" style="text-align:left;padding:8px 10px;border-radius:11px;border:1px solid ' + (n === nis ? "#86efac;background:#f0fdf4" : "#e2e8f0;background:#fff") + '"><b style="font-size:12px;display:block">' + esc(x ? x.nama : n) + '</b><span style="font-size:10.5px;color:#94a3b8;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(last ? last.pesan : "") + "</span></button>"; }).join("") + "</div></div>" +
          '<div class="fx-card lg:col-span-2" style="display:flex;flex-direction:column"><div style="padding:12px 14px;border-bottom:1px solid #f1f5f9"><b style="font-size:13px">' + esc(s ? "Orang Tua " + s.nama : "-") + '</b><div style="font-size:11px;color:#94a3b8">' + esc(s ? s.kelas : "") + "</div></div>" +
            '<div style="flex:1;padding:14px;display:grid;gap:8px;max-height:46vh;overflow-y:auto;background:#f8fafc" class="fx-scroll">' +
            (msgs.map(function (m) { var mine = m.dari === "sekolah"; return '<div style="display:flex;justify-content:' + (mine ? "flex-end" : "flex-start") + '"><div style="max-width:80%;padding:9px 12px;border-radius:16px;font-size:12.5px;' + (mine ? "background:#16a34a;color:#fff;border-bottom-right-radius:4px" : "background:#fff;border:1px solid #e2e8f0;border-bottom-left-radius:4px") + '">' + esc(m.pesan) + '<div style="font-size:9.5px;margin-top:4px;opacity:.75">' + (mine ? "Sekolah" : "Orang Tua") + " · " + esc(wk(m.waktu)) + "</div></div></div>"; }).join("") || '<p style="text-align:center;color:#94a3b8;font-size:12.5px;padding:26px 0">Belum ada pesan.</p>') +
            "</div>" +
            '<form id="chF" style="padding:11px;border-top:1px solid #f1f5f9;display:flex;gap:8px"><input class="fx-in" name="pesan" required placeholder="Tulis pesan sebagai wali kelas…"><button class="fx-btn p" type="submit">Kirim</button></form></div>' +
        "</div>";
      icons();
      q("chPick").onchange = function (e) { nis = e.target.value; ST.__chatNis = nis; paint(); };
      APP.querySelectorAll("[data-th]").forEach(function (b) { b.onclick = function () { nis = b.dataset.th; ST.__chatNis = nis; paint(); }; });
      q("chF").onsubmit = async function (e) {
        e.preventDefault();
        var p = e.target.pesan.value.trim(); if (!p || !nis) return;
        ch.push({ id: uid(), nis: nis, dari: "sekolah", pesan: p, waktu: new Date().toISOString() });
        CACHE["chat.json"] = ch; paint();
        await save("chat.json", ch, "Komunikasi", "KIRIM CHAT", "ke ortu NIS " + nis);
      };
    }
    paint();
  };
  G.fx_notifikasi = async function () {
    var nt = await grab("notifikasi.json"), sw = await grab("siswa.json"), sp = await grab("spp.json"), st = await readJSON("settings.json").catch(function () { return {}; });
    function paint() {
      APP.innerHTML = head("Notifikasi WA", "Antrean pesan WhatsApp; kirim manual via wa.me atau gateway Fonnte") +
        '<div class="fx-card p-4 mb-3"><div style="display:flex;flex-wrap:wrap;gap:9px;align-items:end">' +
          '<label style="font-size:11px;font-weight:800;color:#475569">Target<select class="fx-in" id="wT"><option value="ALL">Semua siswa aktif</option>' + sw.slice(0, 400).map(function (s) { return '<option value="' + esc(s.nis) + '">' + esc(s.nama) + "</option>"; }).join("") + "</select></label>" +
          '<label style="font-size:11px;font-weight:800;color:#475569">Jenis<select class="fx-in" id="wJ"><option>Pengumuman</option><option>Tagihan</option><option>Absensi</option><option>Nilai</option></select></label>' +
          '<label style="flex:1;min-width:200px;font-size:11px;font-weight:800;color:#475569">Token Fonnte (opsional)<input class="fx-in" id="wK" type="password" value="' + esc(sessionStorage.getItem("wa_key") || "") + '" placeholder="kosong = kirim manual"></label>' +
          '<button type="button" class="fx-btn" id="wKs">Simpan token</button>' +
          '<button type="button" class="fx-btn p" id="wQ">Masukkan antrean</button></div>' +
          '<label style="display:block;margin-top:9px;font-size:11px;font-weight:800;color:#475569">Isi pesan (jenis Tagihan diisi otomatis per siswa)<textarea class="fx-in" id="wP" rows="2">' + esc(st.pengumuman || "Assalamualaikum, berikut informasi dari sekolah.") + "</textarea></label></div>" +
        '<div class="fx-card overflow-hidden"><div style="padding:11px 14px;border-bottom:1px solid #f1f5f9;display:flex;gap:8px;align-items:center"><b style="font-size:13px;flex:1">Antrean (' + nt.filter(function (n) { return n.status === "Antrean"; }).length + ")</b><button type=\"button\" class=\"fx-btn p\" id=\"wAll\">Kirim semua antrean</button></div>" +
        '<div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Waktu</th><th>Siswa</th><th>No. HP</th><th>Jenis</th><th>Pesan</th><th>Status</th><th></th></tr></thead><tbody>' +
        (nt.slice(0, 300).map(function (n) { return "<tr><td style='font-size:11px;white-space:nowrap'>" + esc(wk(n.waktu)) + "</td><td><b>" + esc(n.nama) + '</b></td><td style="font-family:ui-monospace,monospace;font-size:11px">' + esc(n.no_hp) + "</td><td>" + esc(n.jenis) + "</td><td>" + esc(cut(n.pesan, 60)) + '</td><td><span style="padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;' + tone(n.status) + '">' + esc(n.status) + '</span></td><td style="text-align:right"><button type="button" class="fx-btn p" style="padding:4px 8px" data-ws="' + esc(n.id) + '">Kirim</button></td></tr>'; }).join("") || '<tr><td colspan="7" style="padding:30px;text-align:center;color:#94a3b8">Antrean kosong.</td></tr>') +
        "</tbody></table></div></div>";
      icons();
      q("wKs").onclick = function () { var v = q("wK").value.trim(); if (v) sessionStorage.setItem("wa_key", v); else sessionStorage.removeItem("wa_key"); toast("Token gateway disimpan di sesi ini saja.", "success"); };
      q("wQ").onclick = async function () {
        var t = q("wT").value, j = q("wJ").value, p = q("wP").value.trim();
        var target = t === "ALL" ? sw.filter(function (s) { return s.status === "Aktif"; }) : sw.filter(function (s) { return s.nis === t; });
        if (!target.length) return toast("Tidak ada target.", "error");
        var baru = target.slice(0, 200).map(function (s) {
          var msg = p;
          if (j === "Tagihan") { var b = sp.filter(function (x) { return x.nis === s.nis && x.status === "Belum"; }); msg = "Yth. Orang Tua " + s.nama + ", tagihan SPP belum dibayar: " + b.map(function (x) { return BLN[(x.bulan || 1) - 1]; }).join(", ") + ". Total " + rp(b.reduce(function (a, x) { return a + (x.nominal || 0); }, 0)) + ". — " + (st.nama_sekolah || "Sekolah"); }
          return { id: uid(), nis: s.nis, nama: s.nama, no_hp: s.no_hp_ortu || "", jenis: j, pesan: msg, status: "Antrean", waktu: new Date().toISOString() };
        });
        nt = baru.concat(nt); CACHE["notifikasi.json"] = nt; paint();
        await save("notifikasi.json", nt, "Komunikasi", "ANTRE NOTIFIKASI", baru.length + " pesan " + j);
      };
      async function send(n) {
        var hp = String(n.no_hp || "").replace(/^0/, "62");
        if (!hp) { toast("Nomor HP " + n.nama + " kosong.", "error"); return false; }
        var key = sessionStorage.getItem("wa_key");
        if (key) {
          try {
            var fd = new FormData(); fd.append("target", hp); fd.append("message", n.pesan);
            var r = await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: key }, body: fd });
            var j = await r.json(); if (j.status) return true; throw new Error(j.reason || "ditolak gateway");
          } catch (e) { toast("Gateway gagal (" + e.message + ") → beralih ke wa.me.", "info"); }
        }
        G.open("https://wa.me/" + hp + "?text=" + encodeURIComponent(n.pesan), "_blank");
        return true;
      }
      APP.querySelectorAll("[data-ws]").forEach(function (b) {
        b.onclick = async function () {
          var n = nt.find(function (x) { return String(x.id) === b.dataset.ws; });
          if (await send(n)) { n.status = "Terkirim"; paint(); await save("notifikasi.json", nt, "Komunikasi", "KIRIM NOTIFIKASI", n.nama); }
        };
      });
      q("wAll").onclick = async function () {
        var antre = nt.filter(function (n) { return n.status === "Antrean"; }).slice(0, 25);
        if (!antre.length) return toast("Antrean kosong.", "info");
        busy(true, "Mengirim " + antre.length + " notifikasi…");
        var ok = 0;
        for (var i = 0; i < antre.length; i++) { if (await send(antre[i])) { antre[i].status = "Terkirim"; ok++; } await new Promise(function (r) { setTimeout(r, 500); }); }
        busy(false); paint();
        await save("notifikasi.json", nt, "Komunikasi", "KIRIM NOTIFIKASI", ok + " pesan terkirim");
      };
    }
    paint();
  };
  G.fx_peminjaman = async function () {
    var pm = await grab("peminjaman.json"), bk = await grab("buku.json"), sw = await grab("siswa.json"), st = await readJSON("settings.json").catch(function () { return {}; });
    var fine = st.denda_per_hari || 500;
    function paint() {
      var jt = new Date(); jt.setDate(jt.getDate() + 7);
      var jatuh = jt.toISOString().slice(0, 10);
      APP.innerHTML = head("Peminjaman Buku", "Sirkulasi perpustakaan dengan denda otomatis per hari keterlambatan") +
        '<div class="fx-card p-4 mb-3"><form id="pmF" style="display:flex;flex-wrap:wrap;gap:9px;align-items:end">' +
          '<label style="flex:1;min-width:190px;font-size:11px;font-weight:800;color:#475569">Buku (stok &gt; 0)<select class="fx-in" name="buku_id" required><option value="">— pilih —</option>' + bk.filter(function (b) { return b.stok > 0; }).slice(0, 400).map(function (b) { return '<option value="' + esc(b.id) + '">' + esc(cut(b.judul, 44) + " · stok " + b.stok) + "</option>"; }).join("") + "</select></label>" +
          '<label style="flex:1;min-width:170px;font-size:11px;font-weight:800;color:#475569">Siswa<select class="fx-in" name="nis" required><option value="">— pilih —</option>' + sw.slice(0, 400).map(function (s) { return '<option value="' + esc(s.nis) + '">' + esc(s.nama + " · " + s.kelas) + "</option>"; }).join("") + "</select></label>" +
          '<label style="font-size:11px;font-weight:800;color:#475569">Jatuh tempo<input class="fx-in" type="date" name="jatuh" value="' + jatuh + '"></label>' +
          '<button class="fx-btn p" type="submit">Pinjamkan</button></form>' +
          '<p style="font-size:11px;color:#94a3b8;margin-top:8px">Denda: ' + rp(fine) + "/hari. Stok buku ikut diperbarui.</p></div>" +
        '<div class="fx-card overflow-hidden"><div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Buku</th><th>Siswa</th><th>Pinjam</th><th>Jatuh tempo</th><th>Kembali</th><th>Status</th><th>Denda</th><th></th></tr></thead><tbody>' +
        (pm.slice(0, 300).map(function (p) {
          var b = bk.find(function (x) { return x.id === p.buku_id; }), s = sw.find(function (x) { return x.nis === p.nis; });
          return "<tr><td><b>" + esc(cut(b ? b.judul : p.buku_id, 34)) + "</b></td><td>" + esc(s ? s.nama : p.nis) + "</td><td>" + esc(tg(p.tanggal_pinjam)) + "</td><td>" + esc(tg(p.tanggal_jatuh_tempo)) + "</td><td>" + esc(p.tanggal_kembali ? tg(p.tanggal_kembali) : "—") + '</td><td><span style="padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;' + tone(p.status) + '">' + esc(p.status) + '</span></td><td style="text-align:right;font-weight:800;color:' + (p.denda ? "#e11d48" : "#94a3b8") + '">' + esc(rp(p.denda)) + "</td>" +
            '<td style="text-align:right">' + (p.status === "Dipinjam" ? '<button type="button" class="fx-btn p" style="padding:4px 8px" data-back="' + esc(p.id) + '">Kembalikan</button>' : "") + "</td></tr>";
        }).join("") || '<tr><td colspan="8" style="padding:30px;text-align:center;color:#94a3b8">Belum ada peminjaman.</td></tr>') +
        "</tbody></table></div></div>";
      icons();
      q("pmF").onsubmit = async function (e) {
        e.preventDefault();
        var f = e.target, b = bk.find(function (x) { return x.id === f.buku_id.value; });
        if (!b || b.stok < 1) return toast("Stok buku habis.", "error");
        pm.unshift({ id: uid(), buku_id: b.id, nis: f.nis.value, tanggal_pinjam: now(), tanggal_jatuh_tempo: f.jatuh.value, tanggal_kembali: "", status: "Dipinjam", denda: 0 });
        b.stok--; CACHE["peminjaman.json"] = pm; CACHE["buku.json"] = bk; paint();
        if (await save("peminjaman.json", pm, "Perpustakaan", "PEMINJAMAN", b.judul)) await writeJSON("buku.json", bk).catch(function () {});
      };
      APP.querySelectorAll("[data-back]").forEach(function (btn) {
        btn.onclick = async function () {
          var p = pm.find(function (x) { return String(x.id) === btn.dataset.back; });
          var late = Math.max(0, Math.floor((new Date(now()) - new Date(p.tanggal_jatuh_tempo)) / 864e5));
          var d = late * fine;
          if (!confirm("Kembalikan buku ini?" + (late ? " Terlambat " + late + " hari → denda " + rp(d) + "." : " Tepat waktu."))) return;
          p.status = "Dikembalikan"; p.tanggal_kembali = now(); p.denda = d;
          var b = bk.find(function (x) { return x.id === p.buku_id; }); if (b) b.stok++;
          paint();
          if (await save("peminjaman.json", pm, "Perpustakaan", "PENGEMBALIAN", "denda " + rp(d))) await writeJSON("buku.json", bk).catch(function () {});
        };
      });
    }
    paint();
  };
  G.fx_ujian = async function () {
    var uj = await grab("ujian.json"), so = await grab("soal.json"), kl = await grab("kelas.json"), st = await readJSON("settings.json").catch(function () { return {}; });
    function paint() {
      APP.innerHTML = head("Ujian Online (CBT)", "Paket ujian dari bank soal + token; impor hasil CBT ke nilai") +
        '<div class="fx-card p-3.5 mb-3" style="display:flex;flex-wrap:wrap;gap:8px"><button type="button" class="fx-btn p" id="ujAdd">Buat ujian</button>' +
          '<label class="fx-btn" style="cursor:pointer">Impor hasil CBT<input type="file" accept=".json" id="ujImp" style="display:none"></label>' +
          '<a href="cbt.html" target="_blank" class="fx-btn">Buka halaman CBT</a></div>' +
        '<div class="fx-card overflow-hidden"><div class="fx-wrap"><table class="fx-tbl"><thead><tr><th>Judul</th><th>Mapel</th><th>Kelas</th><th>Durasi</th><th>Token</th><th>Soal</th><th>Status</th><th></th></tr></thead><tbody>' +
        (uj.slice(0, 300).map(function (u) { return "<tr><td><b>" + esc(cut(u.judul, 40)) + "</b></td><td>" + esc(u.mapel) + "</td><td>" + esc(u.kelas) + "</td><td>" + esc(u.durasi) + ' mnt</td><td style="font-family:ui-monospace,monospace">' + esc(u.token) + "</td><td>" + ((u.soal_ids || []).length) + '</td><td><span style="padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;' + tone(u.status) + '">' + esc(u.status) + '</span></td><td style="text-align:right"><button type="button" class="fx-btn d" style="padding:4px 8px" data-ud="' + esc(u.id) + '">Hapus</button></td></tr>'; }).join("") || '<tr><td colspan="8" style="padding:30px;text-align:center;color:#94a3b8">Belum ada ujian.</td></tr>') +
        "</tbody></table></div></div>";
      icons();
      q("ujAdd").onclick = function () {
        var mapel = Array.from(new Set(so.map(function (s) { return s.mapel; }).filter(Boolean)));
        drawer("Buat Ujian CBT",
          '<form id="ujF"><label style="display:block;margin-bottom:10px"><span style="font-size:11px;font-weight:800;color:#475569">Judul *</span><input class="fx-in" name="judul" required></label>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Mapel *</span><select class="fx-in" name="mapel" id="ujM" required><option value="">— pilih —</option>' + mapel.map(function (m) { return "<option>" + esc(m) + "</option>"; }).join("") + "</select></label>" +
          '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Kelas *</span><select class="fx-in" name="kelas" required><option value="">— pilih —</option>' + kl.slice(0, 300).map(function (k) { return "<option>" + esc(k.nama) + "</option>"; }).join("") + "</select></label>" +
          '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Durasi (menit)</span><input class="fx-in" type="number" name="durasi" value="30" min="1"></label>' +
          '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Token *</span><input class="fx-in" name="token" required placeholder="MTK7A"></label>' +
          '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Tanggal</span><input class="fx-in" type="date" name="tanggal" value="' + now() + '"></label>' +
          '<label style="display:block"><span style="font-size:11px;font-weight:800;color:#475569">Status</span><select class="fx-in" name="status"><option>Draft</option><option>Aktif</option><option>Selesai</option></select></label></div>' +
          '<div style="margin-top:12px"><span style="font-size:11px;font-weight:800;color:#475569">Pilih soal (minimal 1)</span><div id="ujBox" style="margin-top:6px;border:1px solid #e2e8f0;border-radius:12px;max-height:220px;overflow-y:auto" class="fx-scroll"></div></div></form>',
          '<button type="button" class="fx-btn" id="ujC">Batal</button><button type="button" class="fx-btn p" id="ujO">Simpan ujian</button>');
        var picked = {};
        function box() {
          var mp = q("ujM").value, list = so.filter(function (s) { return !mp || s.mapel === mp; }).slice(0, 200);
          q("ujBox").innerHTML = list.map(function (s) { return '<label style="display:flex;gap:8px;padding:8px 10px;border-bottom:1px solid #f8fafc;font-size:12px;cursor:pointer"><input type="checkbox" value="' + esc(s.id) + '" ' + (picked[s.id] ? "checked" : "") + ' style="accent-color:#16a34a"><span>' + esc(cut(s.pertanyaan, 90)) + ' <span style="color:#94a3b8">(kunci ' + esc(s.kunci) + ")</span></span></label>"; }).join("") || '<p style="padding:14px;color:#94a3b8;font-size:12px">Tidak ada soal untuk mapel ini.</p>';
          q("ujBox").querySelectorAll("input").forEach(function (i) { i.onchange = function () { picked[i.value] = i.checked; }; });
        }
        q("ujM").onchange = box; box();
        q("ujC").onclick = closeDrawer;
        q("ujO").onclick = async function () {
          var f = q("ujF"); if (!f.reportValidity()) return;
          var ids = Object.keys(picked).filter(function (k) { return picked[k]; });
          if (!ids.length) return toast("Pilih minimal 1 soal.", "error");
          uj.unshift({ id: uid(), judul: f.judul.value, mapel: f.mapel.value, kelas: f.kelas.value, durasi: +f.durasi.value || 30, token: f.token.value.trim(), tanggal: f.tanggal.value, status: f.status.value, soal_ids: ids });
          CACHE["ujian.json"] = uj; closeDrawer(); paint();
          await save("ujian.json", uj, "LMS/CBT", "BUAT UJIAN", f.judul.value);
        };
      };
      q("ujImp").onchange = async function (e) {
        var f = e.target.files[0]; if (!f) return;
        try {
          var hs = JSON.parse(await f.text()); if (!Array.isArray(hs)) hs = [hs];
          var nl = await grab("nilai.json"), n = 0;
          hs.forEach(function (h) {
            var u = uj.find(function (x) { return x.id === h.ujian_id; });
            if (!u || !h.nis || h.nilai === undefined) return;
            nl.unshift({ id: uid(), nis: h.nis, mapel: u.mapel, jenis: "CBT", tp: u.judul, nilai: Number(h.nilai), semester: st.semester || "Ganjil", tahun_ajaran: st.tahun_ajaran || "" }); n++;
          });
          if (!n) return toast("Tidak ada hasil valid (perlu ujian_id, nis, nilai).", "error");
          CACHE["nilai.json"] = nl;
          await save("nilai.json", nl, "LMS/CBT", "IMPOR HASIL CBT", n + " hasil");
        } catch (err) { toast("File tidak valid: " + err.message, "error"); }
        e.target.value = "";
      };
      APP.querySelectorAll("[data-ud]").forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("Hapus ujian ini?")) return;
          var snap = clone(uj); uj = uj.filter(function (x) { return String(x.id) !== b.dataset.ud; }); CACHE["ujian.json"] = uj; paint();
          offerUndo("Ujian dihapus", function () { uj = snap; CACHE["ujian.json"] = uj; paint(); });
          await save("ujian.json", uj, "LMS/CBT", "HAPUS UJIAN", b.dataset.ud);
        };
      });
    }
    paint();
  };
  G.fx_laporan = async function () {
    var st = await readJSON("settings.json").catch(function () { return {}; });
    var items = [
      ["dapodik", "Export Dapodik — Siswa", "CSV kolom selaras template Dapodik.", "siswa.json"],
      ["anbk", "Peserta ANBK", "CSV peserta kelas 5 / 8 / 11 beserta nama ibu kandung.", "siswa.json"],
      ["bos", "Laporan BOS — BKU", "CSV buku kas umum penerimaan & pengeluaran.", "bos.json"],
      ["bosprint", "Laporan BOS — Cetak", "BKU + rekap kategori + saldo, siap tanda tangan.", "bos.json"],
      ["abs", "Rekap Absensi Siswa", "CSV seluruh catatan absensi.", "absensi.json"],
      ["nilai", "Rekap Nilai", "CSV seluruh nilai per semester.", "nilai.json"],
      ["inv", "Inventaris (KIB)", "CSV daftar barang, kondisi, lokasi, sumber dana.", "inventaris.json"],
      ["gaji", "Rekap Penggajian", "CSV slip gaji seluruh pegawai.", "gaji.json"]
    ];
    APP.innerHTML = head("Pelaporan Dinas", "Export CSV/JSON format Dapodik, ANBK, BOS, dan rekap operasional") +
      '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">' + items.map(function (i) {
        return '<div class="fx-card p-4"><b style="font-size:13px;display:block">' + esc(i[1]) + '</b><p style="font-size:11.5px;color:#64748b;margin:6px 0 11px">' + esc(i[2]) + '</p><button type="button" class="fx-btn p" data-ex="' + i[0] + '">' + (i[0] === "bosprint" ? "Cetak" : "Unduh CSV") + "</button></div>";
      }).join("") + "</div>" +
      '<p style="font-size:11px;color:#94a3b8;margin-top:12px">Sesuaikan header dengan template resmi terbaru dari dinas/kemendikbud sebelum unggah.</p>';
    icons();
    APP.querySelectorAll("[data-ex]").forEach(function (b) {
      b.onclick = async function () {
        var k = b.dataset.ex; busy(true, "Menyiapkan berkas…");
        try {
          if (k === "dapodik") { var s = await readJSON("siswa.json"); dl("dapodik-siswa.csv", csv(s, ["nisn", "nama", "jk", "nis", "tempat_lahir", "tanggal_lahir", "agama", "nama_ayah", "nama_ibu", "alamat", "kelas", "status", "tanggal_masuk"].map(function (x) { return { k: x, l: x }; })), "text/csv"); }
          else if (k === "anbk") {
            var sw = await readJSON("siswa.json"), kl = await readJSON("kelas.json");
            var el = sw.filter(function (s) { var kk = kl.find(function (x) { return x.nama === s.kelas; }); return kk && ["5", "8", "11"].indexOf(String(kk.tingkat)) > -1 && s.status === "Aktif"; });
            if (!el.length) toast("Tidak ada siswa kelas 5/8/11; berkas berisi header saja.", "info");
            dl("anbk-peserta.csv", csv(el, [{ k: "nisn", l: "nisn" }, { k: "nama", l: "nama_peserta" }, { k: "jk", l: "jenis_kelamin" }, { k: "tempat_lahir", l: "tempat_lahir" }, { k: "tanggal_lahir", l: "tanggal_lahir" }, { k: "kelas", l: "rombel" }, { k: "nama_ibu", l: "nama_ibu_kandung" }]), "text/csv");
          }
          else if (k === "bos" || k === "bosprint") {
            var bo = await readJSON("bos.json");
            if (k === "bos") dl("bos-bku.csv", csv(bo, ["tanggal", "jenis", "kategori", "uraian", "jumlah", "triwulan", "tahun"].map(function (x) { return { k: x, l: x }; })), "text/csv");
            else {
              var sorted = bo.slice().sort(function (a, c) { return String(a.tanggal).localeCompare(String(c.tanggal)); });
              var masuk = bo.filter(function (x) { return x.jenis === "Penerimaan"; }).reduce(function (a, x) { return a + (x.jumlah || 0); }, 0);
              var keluar = bo.filter(function (x) { return x.jenis === "Pengeluaran"; }).reduce(function (a, x) { return a + (x.jumlah || 0); }, 0);
              var kat = {}; bo.filter(function (x) { return x.jenis === "Pengeluaran"; }).forEach(function (x) { kat[x.kategori] = (kat[x.kategori] || 0) + (x.jumlah || 0); });
              printDoc("Laporan BOS", '<div class="center"><h2>LAPORAN PENGGUNAAN DANA BOS</h2><div class="muted">' + esc(st.nama_sekolah || "") + " · NPSN " + esc(st.npsn || "") + "</div></div>" +
                "<table><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Uraian</th><th>Jumlah</th></tr>" +
                sorted.slice(0, 400).map(function (x) { return "<tr><td>" + esc(tg(x.tanggal)) + "</td><td>" + esc(x.jenis) + "</td><td>" + esc(x.kategori) + "</td><td>" + esc(x.uraian) + '</td><td class="right">' + rp(x.jumlah) + "</td></tr>"; }).join("") +
                '<tr><th colspan="4" class="right">Total Penerimaan</th><th class="right">' + rp(masuk) + '</th></tr><tr><th colspan="4" class="right">Total Pengeluaran</th><th class="right">' + rp(keluar) + '</th></tr><tr><th colspan="4" class="right">SALDO</th><th class="right">' + rp(masuk - keluar) + "</th></tr></table>" +
                "<h3>Rekap per Kategori</h3><table><tr><th>Kategori</th><th>Jumlah</th></tr>" + Object.keys(kat).map(function (c) { return "<tr><td>" + esc(c) + '</td><td class="right">' + rp(kat[c]) + "</td></tr>"; }).join("") + "</table>" +
                '<div class="ttd"><div>Bendahara BOS<br><br><br>(........................)</div><div>Kepala Sekolah<br><br><br><b>' + esc(st.kepala_sekolah || "") + "</b></div></div>");
            }
          }
          else {
            var map = { abs: "absensi.json", nilai: "nilai.json", inv: "inventaris.json", gaji: "gaji.json" }[k];
            var d = await readJSON(map);
            var keys = Object.keys(d[0] || {}).filter(function (x) { return typeof d[0][x] !== "object"; });
            dl(map.replace(".json", "") + ".csv", csv(d, keys.map(function (x) { return { k: x, l: x }; })), "text/csv");
          }
        } catch (e) { toast(e.message, "error"); }
        busy(false);
      };
    });
  };
  G.fx_biaya = async function () {
    var st = await readJSON("settings.json", true).catch(function () { return {}; });
    if (!st.biaya) st.biaya = {};
    var JEN = ["SD", "SMP", "SMA", "SMK"];
    var FLD = [["uang_pangkal", "Uang Pangkal"], ["spp", "SPP / bulan"], ["uang_media", "Uang Media / bulan"], ["uang_kegiatan", "Uang Kegiatan / bulan"], ["seragam", "Seragam"], ["buku", "Buku Tahunan"], ["kegiatan_tahunan", "Kegiatan Tahunan"], ["daftar_ulang", "Daftar Ulang"], ["praktikum", "Praktikum"], ["pkl", "PKL"]];
    JEN.forEach(function (j) { if (!st.biaya[j]) st.biaya[j] = FLD.reduce(function (a, f) { a[f[0]] = 0; return a; }, {}); });
    function tot(f) { var m = (f.spp || 0) + (f.uang_media || 0) + (f.uang_kegiatan || 0); var y = (f.seragam || 0) + (f.buku || 0) + (f.kegiatan_tahunan || 0) + (f.daftar_ulang || 0) + (f.praktikum || 0) + (f.pkl || 0); return { m: m, y: y, t1: (f.uang_pangkal || 0) + m * 12 + y }; }
    APP.innerHTML = head("Biaya Pendidikan", "Rincian per jenjang yang dipakai halaman Tuition Fee") +
      '<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">' + JEN.map(function (j) {
        var t = tot(st.biaya[j]);
        return '<div class="fx-card p-4"><b style="font-size:14px">' + j + '</b><div style="font-size:11.5px;color:#64748b;margin-top:7px;display:grid;gap:3px"><span>Pangkal <b style="float:right">' + rp(st.biaya[j].uang_pangkal) + '</b></span><span>Bulanan <b style="float:right">' + rp(t.m) + '</b></span><span>Tahunan <b style="float:right">' + rp(t.y) + '</b></span></div><div style="margin-top:9px;padding-top:8px;border-top:1px solid #f1f5f9;font-size:12px;font-weight:800;color:#15803d">Tahun 1: ' + rp(t.t1) + '</div><button type="button" class="fx-btn" style="margin-top:10px;width:100%;justify-content:center" data-bj="' + j + '">Kelola</button></div>';
      }).join("") + "</div>" +
      '<div class="fx-card p-4"><b style="font-size:13px">Kebijakan pembayaran</b><form id="polF" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:11px">' +
        [["diskon_saudara_persen", "Diskon saudara (%)"], ["beasiswa_maks_persen", "Beasiswa maks (%)"], ["denda_terlambat_persen", "Denda telat (%)"], ["jatuh_tempo_tanggal", "Jatuh tempo (tgl)"]].map(function (f) {
          var v = (st.kebijakan || {})[f[0]] || 0;
          return '<label style="font-size:11px;font-weight:800;color:#475569">' + f[1] + '<input class="fx-in" type="number" name="' + f[0] + '" value="' + v + '"></label>';
        }).join("") +
        '<div style="grid-column:1/-1"><button class="fx-btn p" type="submit">Simpan kebijakan</button></div></form></div>';
    icons();
    APP.querySelectorAll("[data-bj]").forEach(function (b) {
      b.onclick = function () {
        var j = b.dataset.bj, f = st.biaya[j];
        drawer("Biaya " + j, '<form id="bjF" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + FLD.map(function (x) {
          return '<label style="font-size:11px;font-weight:800;color:#475569">' + x[1] + '<input class="fx-in" type="number" min="0" step="1000" name="' + x[0] + '" value="' + (f[x[0]] || 0) + '"></label>';
        }).join("") + "</form>", '<button type="button" class="fx-btn" id="bjC">Batal</button><button type="button" class="fx-btn p" id="bjO">Simpan</button>');
        q("bjC").onclick = closeDrawer;
        q("bjO").onclick = async function () {
          var fm = q("bjF"); FLD.forEach(function (x) { f[x[0]] = +fm[x[0]].value || 0; });
          if (j === st.jenjang) st.spp_nominal = f.spp;
          closeDrawer(); G.fx_biaya();
          await save("settings.json", st, "Konten Website", "UPDATE BIAYA", j + " · tahun 1 " + rp(tot(f).t1));
        };
      };
    });
    q("polF").onsubmit = async function (e) {
      e.preventDefault();
      var fm = e.target; st.kebijakan = st.kebijakan || {};
      ["diskon_saudara_persen", "beasiswa_maks_persen", "denda_terlambat_persen", "jatuh_tempo_tanggal"].forEach(function (k) { st.kebijakan[k] = +fm[k].value || 0; });
      if (!st.kebijakan.cicilan_pangkal_opsi) st.kebijakan.cicilan_pangkal_opsi = [1, 3, 6, 12];
      await save("settings.json", st, "Konten Website", "UPDATE KEBIJAKAN BIAYA", "diskon " + st.kebijakan.diskon_saudara_persen + "%");
    };
  };

  /* ------------------------------------------------------ nav & router */
  var NAVDEF = [
    ["Utama", [["dashboard", "Dashboard", "layout-dashboard"]]],
    ["A • Akademik & Kesiswaan", [["ppdb", "PPDB Online", "user-plus"], ["siswa", "Data Induk Siswa", "users"], ["kelas", "Rombel / Kelas", "school"], ["mutasi", "Mutasi Siswa", "arrow-left-right"], ["absensi", "Absensi Siswa (QR)", "qr-code"], ["nilai", "Input Nilai", "clipboard-list"], ["rapor", "e-Rapor", "graduation-cap"]]],
    ["B • Pembelajaran (LMS)", [["materi", "E-Learning / Materi", "book-open"], ["video", "Video Belajar", "video"], ["tugas", "Tugas", "clipboard-check"], ["ujian", "Ujian Online (CBT)", "timer"], ["soal", "Bank Soal", "list-checks"]]],
    ["C • Keuangan", [["spp", "SPP / VA / QRIS", "wallet"], ["bos", "Dana BOS", "landmark"], ["gaji", "Penggajian", "banknote"], ["audit", "Audit Log", "shield-check"]]],
    ["D • Kepegawaian", [["guru", "Data Guru / TU", "briefcase"], ["absensi-guru", "Absensi Guru", "calendar-check"], ["jurnal", "Jurnal Mengajar", "pen-line"], ["kinerja", "Penilaian Kinerja", "award"]]],
    ["E • Komunikasi Ortu", [["chat", "Chat Wali Kelas", "message-circle"], ["notifikasi", "Notifikasi WA", "bell"]]],
    ["F • Sarpras & Perpustakaan", [["inventaris", "Inventaris Barang", "boxes"], ["buku", "Katalog Buku", "library"], ["peminjaman", "Peminjaman Buku", "repeat"]]],
    ["G • Pelaporan Dinas", [["laporan", "Export Dapodik / ANBK / BOS", "file-text"]]],
    ["Konten Website", [["kegiatan", "Kegiatan Sekolah", "images"], ["galeri", "Pengaturan Galeri", "layout-grid"], ["slider", "Hero Slider", "gallery-horizontal-end"], ["biaya", "Biaya Pendidikan", "wallet"], ["kalender", "Kalender Akademik", "calendar-days"], ["login", "Form Login", "shield-check"], ["tampilan", "Antarmuka Beranda", "panels-top-left"]]],
    ["Sistem", [["pengaturan", "Pengaturan Sekolah", "settings"]]]
  ];
  function buildNav() {
    var nav = q("nav"); if (!nav) return;
    var existing = {};
    nav.querySelectorAll("[data-nav]").forEach(function (a) { existing[a.dataset.nav] = 1; });
    var missing = [];
    NAVDEF.forEach(function (g) { g[1].forEach(function (it) { if (!existing[it[0]]) missing.push(it); }); });
    if (!missing.length) return;
    var frag = D.createElement("div");
    frag.innerHTML = '<div><div class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Modul dipulihkan</div>' +
      missing.map(function (it) { return '<a href="#/' + it[0] + '" data-nav="' + it[0] + '" class="navlink flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800"><i data-lucide="' + it[2] + '" class="w-4 h-4"></i>' + esc(it[1]) + "</a>"; }).join("") + "</div>";
    var sys = Array.prototype.find.call(nav.children, function (c) { return /Sistem/.test(c.textContent); });
    nav.insertBefore(frag, sys || null);
    icons();
  }
  function markNav(key) {
    D.querySelectorAll("[data-nav]").forEach(function (a) {
      var on = a.dataset.nav === key;
      a.classList.toggle("bg-emerald-600", on);
      a.classList.toggle("text-white", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var sb = q("sidebar"), bd = q("backdrop");
    if (sb && G.innerWidth < 1024) { sb.classList.add("-translate-x-full"); if (bd) bd.classList.add("hidden"); }
  }
  function resolve(r) { return typeof r === "string" ? G[r] : r; }
  var routing = false;
  async function safeRoute() {
    if (routing) return; routing = true;
    try {
      ensureMOD(); buildNav();
      var key = (location.hash.replace(/^#\/?/, "") || "siswa").split("?")[0];
      if (!M[key]) key = "siswa";
      var m = M[key];
      markNav(key);
      APP.onclick = null;
      APP.innerHTML = '<div class="fx-card p-10 text-center text-slate-400 text-sm">Memuat modul…</div>';
      var done = false;
      if (m.render) {
        var fn = resolve(m.render);
        if (typeof fn === "function") { try { await fn(key); done = true; } catch (e) { ERRORS.push({ src: key + " (native)", msg: e.message }); } }
      }
      if (!done && m.file && has("renderCRUD") && m.fields && !m.__fx) {
        try { await G.renderCRUD(key); done = true; } catch (e) { ERRORS.push({ src: key + " (CRUD native)", msg: e.message }); }
      }
      if (!done) {
        if (CUSTOM.indexOf(key) > -1 && typeof G["fx_" + key] === "function") await G["fx_" + key]();
        else if (m.file && SCHEMA[m.file]) await renderCRUDfx(key);
        else if (m.file && CONFIGS[m.file]) await renderConfigFx(key);
        else APP.innerHTML = head(m.title || key) + '<div class="fx-card p-6 text-sm text-slate-500">Modul ini tidak memiliki berkas data yang dikenali.</div>';
      }
      icons(); refreshFab();
    } catch (e) {
      APP.innerHTML = '<div class="fx-card p-6"><b class="text-rose-600 text-sm">Modul gagal dimuat.</b><p class="text-xs text-slate-500 mt-2 font-mono break-all">' + esc(e.message) + '</p><button type="button" class="fx-btn p mt-3" onclick="location.reload()">Muat ulang</button></div>';
      ERRORS.push({ src: "router", msg: e.message }); refreshFab();
    } finally { routing = false; }
  }
  G.route = safeRoute;

  /* --------------------------------------------------------- chrome */
  function bindChrome() {
    var lo = q("btnLogout");
    if (lo) lo.onclick = function () {
      Object.keys(sessionStorage).filter(function (k) { return ["gh_token", "gh_user", "gh_avatar", "gh_token_exp", "wa_key"].indexOf(k) > -1 || k.indexOf("sicache:") === 0; }).forEach(function (k) { sessionStorage.removeItem(k); });
      location.replace(G.siteUrl ? G.siteUrl("login") : "login/");
    };
    var sy = q("btnSync");
    if (sy) sy.onclick = function () {
      Object.keys(sessionStorage).filter(function (k) { return k.indexOf("sicache:") === 0; }).forEach(function (k) { sessionStorage.removeItem(k); });
      REFC = {}; CACHE = {}; ST = {}; toast("Cache dibersihkan — memuat ulang data.", "info"); safeRoute();
    };
    var mb = q("btnMenu"), sb = q("sidebar"), bd = q("backdrop");
    if (mb && sb) mb.onclick = function () { sb.classList.toggle("-translate-x-full"); if (bd) bd.classList.toggle("hidden"); };
    if (bd && sb) bd.onclick = function () { sb.classList.add("-translate-x-full"); bd.classList.add("hidden"); };
    var mx = q("modalX"), mc = q("modalCancel"), md = q("modal");
    var close = function () { if (md) md.classList.add("hidden"); };
    if (mx) mx.onclick = close;
    if (mc) mc.onclick = close;
    var gu = q("ghUser"); if (gu) gu.textContent = sessionStorage.getItem("gh_user") || "admin";
    var ga = q("ghAvatar"), av = sessionStorage.getItem("gh_avatar"); if (ga && av) ga.src = av;
    var rl = q("repoLabel"); if (rl) { var R = repo(); rl.textContent = (R.owner || "?") + "/" + (R.repo || "?") + " (" + R.branch + ")"; }
    readJSON("settings.json").then(function (s) { var sn = q("schoolName"); if (sn && s.nama_sekolah) sn.textContent = s.nama_sekolah; }).catch(function () {});
  }

  /* ------------------------------------------------------------ boot */
  function boot() {
    diagShell();
    if (!sessionStorage.getItem("gh_token")) {
      location.replace(G.siteUrl ? G.siteUrl("login") : "login/");
      return;
    }
    ensureMOD(); buildNav(); bindChrome();
    G.addEventListener("hashchange", function () { setTimeout(safeRoute, 0); });
    scan(); refreshFab(); paintDiag();
    safeRoute();
    var bad = DIAG.filter(function (d) { return !d.ok; });
    if (bad.length) toast(bad.length + " berkas modul gagal dimuat — mesin fallback aktif. Klik Diagnostik untuk detail.", "error");
    setTimeout(function () { scan(); refreshFab(); }, 1200);
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", boot); else boot();
})();