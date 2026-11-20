// ============================================================
// app.js — Library inti + Kerangka Situs Bersama (header/footer)
// VanillaJS. Dipakai oleh SELURUH halaman .html.
// TOKEN TIDAK BOLEH DI-HARDCODE
// ============================================================

/* Helper DOM global aman (properti window, bukan deklarasi let/const)
   sehingga halaman yang punya `const $` sendiri tetap boleh menimpanya. */
if (typeof window.$ !== "function") window.$ = function (id) { return document.getElementById(id); };
if (typeof window.$$ !== "function") window.$$ = function (sel, root) { return Array.from((root || document).querySelectorAll(sel)); };

function repoCfg() {
  const c = window.APP_CONFIG || {};
  let owner = (c.GITHUB_USERNAME || "").trim();
  let repo = (c.GITHUB_REPO || "").trim();
  const branch = (c.GITHUB_BRANCH || "main").trim();
  if (owner.startsWith("GANTI")) owner = "";
  if (repo.startsWith("GANTI")) repo = "";
  const h = location.hostname;
  if (h.endsWith(".github.io")) {
    if (!owner) owner = h.split(".")[0];
    if (!repo) {
      const seg = location.pathname.split("/").filter(Boolean);
      repo = (seg.length && !seg[0].endsWith(".html")) ? seg[0] : owner + ".github.io";
    }
  }
  return { owner, repo, branch };
}

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const trunc = (v, n = 60) => { const s = String(v ?? ""); return s.length > n ? s.slice(0, n) + "…" : s; };
const fmtRp = v => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v) || 0);
const fmtTgl = v => { if (!v) return "-"; const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); };
const fmtWaktu = v => { if (!v) return "-"; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }); };
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const nowTime = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const refreshIcons = () => { if (window.lucide) lucide.createIcons(); };

function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function download(name, text, mime = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: mime + ";charset=utf-8" }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function toCSV(rows, cols) {
  const q = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  return [cols.map(c => q(c.l)).join(","), ...rows.map(r => cols.map(c => q(r[c.k])).join(","))].join("\r\n");
}
const PRINT_CSS = "body{font-family:Arial,sans-serif;color:#0f172a;padding:24px;font-size:13px}h1,h2,h3{margin:0 0 4px}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #94a3b8;padding:6px 8px;text-align:left}th{background:#f1f5f9}.muted{color:#64748b}.center{text-align:center}.right{text-align:right}.grid{display:flex;flex-wrap:wrap;gap:12px}.card{border:1px solid #94a3b8;border-radius:8px;padding:10px;width:150px;text-align:center}.ttd{display:flex;justify-content:space-between;margin-top:32px}.ttd div{width:220px;text-align:center}";
function printHTML(title, body) {
  const w = window.open("", "_blank");
  w.document.write('<!DOCTYPE html><html><head><title>' + esc(title) + '</title><style>' + PRINT_CSS + '</style></head><body>' + body + '</body></html>');
  w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
}
function ytEmbed(u) {
  try {
    const x = new URL(u);
    if (x.hostname.includes("youtu.be")) return "https://www.youtube.com/embed/" + x.pathname.slice(1);
    if (x.searchParams.get("v")) return "https://www.youtube.com/embed/" + x.searchParams.get("v");
  } catch (e) {}
  return u;
}

let _loadCount = 0;
function showLoading(txt = "Memproses…") {
  _loadCount++;
  let el = document.getElementById("loading");
  if (!el) {
    el = document.createElement("div"); el.id = "loading";
    el.className = "fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center";
    el.innerHTML = '<div class="bg-white rounded-2xl shadow-xl px-6 py-5 flex items-center gap-3"><div class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div><span id="loadingTxt" class="text-sm font-semibold text-slate-700"></span></div>';
    document.body.appendChild(el);
  }
  document.getElementById("loadingTxt").textContent = txt;
  el.classList.remove("hidden");
}
function hideLoading() { _loadCount = Math.max(0, _loadCount - 1); if (!_loadCount) { const el = document.getElementById("loading"); if (el) el.classList.add("hidden"); } }
function toast(msg, type = "info") {
  let w = document.getElementById("toasts");
  if (!w) { w = document.createElement("div"); w.id = "toasts"; w.className = "fixed bottom-4 right-4 z-[100] space-y-2"; document.body.appendChild(w); }
  const c = { success: "bg-emerald-600", error: "bg-rose-600", info: "bg-slate-800" }[type] || "bg-slate-800";
  const i = { success: "circle-check", error: "triangle-alert", info: "info" }[type] || "info";
  const el = document.createElement("div");
  el.className = c + " text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-start gap-2";
  el.innerHTML = '<i data-lucide="' + i + '" class="w-4 h-4 mt-0.5 shrink-0"></i><span>' + esc(msg) + "</span>";
  w.appendChild(el); refreshIcons();
  setTimeout(() => el.remove(), 4500);
}

async function fetchJSON(file, force = false) {
  const key = "sicache:" + file;
  if (!force) { try { const c = JSON.parse(sessionStorage.getItem(key)); if (c && Date.now() - c.t < 600000) return c.d; } catch (e) {} }
  let data = null;
  try { const r = await fetch("data/" + file + "?t=" + Date.now()); if (r.ok) data = await r.json(); } catch (e) {}
  if (data === null) {
    const { owner, repo, branch } = repoCfg();
    if (!owner || !repo) throw new Error("Gagal memuat " + file + ". Isi config.js atau jalankan dari GitHub Pages.");
    const r2 = await fetch("https://raw.githubusercontent.com/" + owner + "/" + repo + "/" + branch + "/data/" + file + "?t=" + Date.now());
    if (!r2.ok) throw new Error("Gagal memuat " + file + " (" + r2.status + ")");
    data = await r2.json();
  }
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
  return data;
}
function clearDataCache() { Object.keys(sessionStorage).filter(k => k.startsWith("sicache:")).forEach(k => sessionStorage.removeItem(k)); }

async function pushJSON(file, data, _retry = false) {
  // TOKEN TIDAK BOLEH DI-HARDCODE
  const token = sessionStorage.getItem("gh_token");
  if (!token) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const { owner, repo, branch } = repoCfg();
  if (!owner || !repo) throw new Error("Konfigurasi repo belum diisi (config.js).");
  const url = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/data/" + file;
  const H = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "Content-Type": "application/json" };
  const g = await fetch(url + "?ref=" + branch + "&t=" + Date.now(), { headers: H });
  let sha;
  if (g.ok) sha = (await g.json()).sha;
  else if (g.status === 401) throw new Error("Token tidak valid / kedaluwarsa. Login ulang.");
  else if (g.status !== 404) throw new Error("GET SHA gagal (" + g.status + "). Cek izin token & nama repo.");
  const body = { message: "Update " + file, content: b64enc(JSON.stringify(data, null, 2)), branch };
  if (sha) body.sha = sha;
  const p = await fetch(url, { method: "PUT", headers: H, body: JSON.stringify(body) });
  if (p.ok) {
    const j = await p.json();
    try { sessionStorage.setItem("sicache:" + file, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
    return j;
  }
  if ((p.status === 409 || p.status === 422) && !_retry) return pushJSON(file, data, true);
  throw new Error("PUT gagal (" + p.status + "): " + trunc(await p.text(), 160));
}

async function saveData(file, data, modul, aksi, detail) {
  showLoading("Menyimpan ke GitHub…");
  try {
    await pushJSON(file, data);
    try {
      let log = []; try { log = await fetchJSON("audit.json"); } catch (e) {}
      log.unshift({ id: uid(), waktu: new Date().toISOString(), aktor: sessionStorage.getItem("gh_user") || "admin", modul, aksi, detail: String(detail || "").slice(0, 200) });
      await pushJSON("audit.json", log.slice(0, 500));
    } catch (e) { console.warn("Audit gagal dicatat:", e); }
    toast("Berhasil: " + aksi + " — commit \"Update " + file + "\" terkirim.", "success");
    return true;
  } catch (e) { toast(e.message, "error"); return false; }
  finally { hideLoading(); }
}

function requireAuth() {
  // TOKEN TIDAK BOLEH DI-HARDCODE
  if (!sessionStorage.getItem("gh_token")) location.replace("login.html");
}
function logout() {
  Object.keys(sessionStorage).filter(k => ["gh_token", "gh_user", "gh_avatar", "wa_key"].includes(k) || k.startsWith("sicache:")).forEach(k => sessionStorage.removeItem(k));
  location.replace("login.html");
}

// ============================================================
// KERANGKA SITUS BERSAMA — header & footer identik di semua
// halaman, plus perbaikan responsif (anti geser horizontal).
// ============================================================
(function siteShell() {
  const PAGE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const IS_HOME = PAGE === "" || PAGE === "index.html";
  const IS_APP = /^(admin|seed)\.html$/.test(PAGE);
  const IS_AUTH = PAGE === "login.html";
  const HDR = 72;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("ls-ready");
  if (IS_APP) document.documentElement.classList.add("ls-app");
  if (IS_AUTH) document.documentElement.classList.add("ls-auth");

  /* ---------- CSS bersama ---------- */
  if (!document.getElementById("lsStyle")) {
    const st = document.createElement("style");
    st.id = "lsStyle";
    st.textContent = `
:root{--hdr-h:${HDR}px;--ls-jade:#16a34a;--ls-jade-d:#15803d;--ls-teal:#0d9488;--ls-amber:#fbbf24;--ls-ink:#0f172a;--ls-track:#f0fdf4}
html{overflow-x:clip;-webkit-text-size-adjust:100%;scroll-padding-top:calc(var(--hdr-h) + 14px);scrollbar-color:var(--ls-jade) var(--ls-track);scrollbar-width:thin}
body{overflow-x:clip;width:100%;max-width:100%;position:relative;padding-top:var(--hdr-h);min-height:100vh}
body>div.min-h-screen:first-child,body>section.min-h-screen:first-child{min-height:calc(100vh - var(--hdr-h))}
img,svg,video,canvas,iframe{max-width:100%}
iframe{border:0}
pre,code{overflow-wrap:anywhere;word-break:break-word}
.overflow-x-auto,.overflow-auto{max-width:100%;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
[class*="grid"]>*,[class*="flex"]>*{min-width:0}
table{max-width:100%}
@media (max-width:640px){
  [class*="min-w-["]:not(table):not(thead):not(tbody):not(tr):not(th):not(td){min-width:0!important}
  .max-w-xs,.max-w-sm,.max-w-md{max-width:100%}
  h1{overflow-wrap:anywhere}
}
html:not(.ls-app) ::-webkit-scrollbar{width:11px;height:11px}
html:not(.ls-app) ::-webkit-scrollbar-track{background:var(--ls-track)}
html:not(.ls-app) ::-webkit-scrollbar-thumb{background:linear-gradient(var(--ls-jade),var(--ls-teal));border-radius:99px;border:2px solid var(--ls-track)}
html:not(.ls-app) ::-webkit-scrollbar-thumb:hover{background:var(--ls-jade-d)}
html:not(.ls-app) ::-webkit-scrollbar-corner{background:var(--ls-track)}
#toasts{max-width:min(24rem,calc(100vw - 2rem))!important}
[id$="UndoBar"]{max-width:calc(100vw - 1.5rem);flex-wrap:wrap;justify-content:center;text-align:center}
#lsHeader{transition:box-shadow .3s,background .3s}
#lsHeader.ls-scrolled{box-shadow:0 10px 30px -18px rgba(15,23,42,.35)}
#lsHeader .ls-link{position:relative}
#lsHeader .ls-link::after{content:"";position:absolute;left:12px;right:12px;bottom:4px;height:2px;border-radius:99px;background:linear-gradient(90deg,var(--ls-jade),var(--ls-teal));transform:scaleX(0);transform-origin:left;transition:transform .28s cubic-bezier(.2,.7,.3,1)}
#lsHeader .ls-link:hover::after,#lsHeader .ls-link[aria-current="page"]::after,#lsHeader .ls-link.ls-on::after{transform:scaleX(1)}
#lsHeader .ls-link[aria-current="page"],#lsHeader .ls-link.ls-on{color:var(--ls-jade-d);background:#f0fdf4}
#lsMenu{display:grid;grid-template-rows:0fr;transition:grid-template-rows .34s cubic-bezier(.2,.7,.3,1)}
#lsMenu.ls-open{grid-template-rows:1fr}
#lsMenu>div{overflow:hidden}
#lsSkip{position:absolute;left:-9999px;top:0;z-index:100}
#lsSkip:focus{left:12px;top:12px;padding:.6rem 1rem;border-radius:.75rem;background:var(--ls-jade);color:#fff;font-weight:700}
#adminGate{opacity:.2;transition:opacity .3s,color .3s}
#adminGate:hover,#adminGate:focus-visible{opacity:1}
#adminGate .gate-tip{opacity:0;transform:translate(-50%,4px);transition:opacity .2s,transform .2s}
#adminGate:hover .gate-tip,#adminGate:focus-visible .gate-tip{opacity:1;transform:translate(-50%,0)}
html.ls-app body{padding-top:var(--hdr-h)}
html.ls-app #lsHeader{z-index:60}
html.ls-app #sidebar{top:var(--hdr-h)!important;bottom:0;height:auto!important}
html.ls-app header:not(#lsHeader){top:var(--hdr-h)!important}
html.ls-app #lsFooter{margin-top:0}
html.ls-auth body>div.min-h-screen{min-height:calc(100vh - var(--hdr-h))}
@media (prefers-reduced-motion:reduce){#lsHeader,#lsMenu,#lsHeader .ls-link::after{transition:none}}
`;
    document.head.appendChild(st);
  }

  /* ---------- markup bersama ---------- */
  const NAV = [
    ["#profil", "Profil"], ["#program", "Program"], ["tuition.html", "Tuition Fee"],
    ["kalender.html", "Kalender"], ["#kegiatan", "Kegiatan"], ["#akademik", "Akademik"],
    ["#fasilitas", "Fasilitas"], ["#kontak", "Kontak"]
  ];
  const href = h => h.startsWith("#") ? (IS_HOME ? h : "index.html" + h) : h;
  const activeOf = h => {
    if (h === "tuition.html") return PAGE === "tuition.html";
    if (h === "kalender.html") return PAGE === "kalender.html";
    if (h === "#program") return /^(sd|smp|sma|smk)\.html$/.test(PAGE);
    return false;
  };
  const deskLinks = NAV.map(([h, l]) =>
    '<a href="' + href(h) + '" data-ls-nav="' + esc(h) + '"' + (activeOf(h) ? ' aria-current="page"' : "") +
    ' class="ls-link px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition">' + l + "</a>").join("");
  const mobLinks = NAV.map(([h, l]) =>
    '<a href="' + href(h) + '" data-ls-nav="' + esc(h) + '"' + (activeOf(h) ? ' aria-current="page"' : "") +
    ' class="ls-link block px-3 py-2.5 rounded-lg hover:bg-brand-50">' + l + "</a>").join("");

  const headerHTML = `
<a id="lsSkip" href="#lsMain">Lewati ke konten utama</a>
<header id="lsHeader" data-ls="1" class="fixed top-0 inset-x-0 z-50 bg-white/92 backdrop-blur-xl border-b border-slate-100">
  <div class="max-w-7xl mx-auto px-4 h-[72px] flex items-center gap-3">
    <a href="${IS_HOME ? "#beranda" : "index.html"}" class="flex items-center gap-2.5 min-w-0 shrink-0">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20"><i data-lucide="school" class="w-5 h-5"></i></div>
      <div class="min-w-0 leading-tight">
        <div id="navNama" class="font-display font-bold text-brand-800 truncate max-w-[42vw] sm:max-w-[220px]">Nama Sekolah</div>
        <div id="navNpsn" class="text-[11px] text-slate-400 truncate">NPSN —</div>
      </div>
    </a>
    <nav class="hidden lg:flex items-center gap-0.5 ml-4 text-sm font-semibold text-slate-600" aria-label="Navigasi utama">${deskLinks}</nav>
    <div class="flex-1"></div>
    <span id="cbtTimer" class="hidden font-mono font-extrabold text-base bg-rose-600 text-white px-3 py-1 rounded-lg shrink-0"></span>
    <div class="hidden md:flex items-center gap-2 shrink-0">
      <a href="portal.html" class="text-sm font-bold px-3 py-2 rounded-lg text-brand-700 hover:bg-brand-50 transition">Portal Ortu</a>
      <a href="ppdb.html" class="text-sm font-bold px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-sm inline-flex items-center gap-1.5 transition"><i data-lucide="user-plus" class="w-4 h-4"></i>Daftar Sekarang</a>
    </div>
    <button id="pLogout" class="hidden text-xs font-bold px-3 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 shrink-0">Keluar</button>
    <button id="mBtn" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 shrink-0" aria-label="Buka menu" aria-expanded="false" aria-controls="lsMenu"><i data-lucide="menu" class="w-6 h-6"></i></button>
    <span id="ppdbSchool" class="sr-only"></span><span id="bSchool" class="sr-only"></span><span id="pSchool" class="sr-only"></span>
  </div>
  <div id="lsMenu" class="lg:hidden border-t border-slate-100 bg-white">
    <div>
      <div id="mMenu" class="px-4 py-3 space-y-1 text-sm font-semibold max-h-[calc(100vh-140px)] overflow-y-auto">
        ${mobLinks}
        <a href="belajar.html" class="ls-link block px-3 py-2.5 rounded-lg hover:bg-brand-50">E-Learning</a>
        <a href="cbt.html" class="ls-link block px-3 py-2.5 rounded-lg hover:bg-brand-50">Ujian CBT</a>
        <div class="flex gap-2 pt-2 pb-1">
          <a href="ppdb.html" class="flex-1 text-center px-3 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold">Daftar</a>
          <a href="portal.html" class="flex-1 text-center px-3 py-2.5 rounded-xl bg-brand-600 text-white font-bold">Portal Ortu</a>
        </div>
      </div>
    </div>
  </div>
</header>`;

  const footerHTML = `
<footer id="lsFooter" data-ls="1" class="bg-slate-900 text-slate-300">
  <div class="max-w-7xl mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
    <div class="lg:col-span-2 min-w-0">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 text-white flex items-center justify-center shrink-0"><i data-lucide="school" class="w-5 h-5"></i></div>
        <b id="footNama" class="font-display text-white text-lg truncate">Nama Sekolah</b>
      </div>
      <p id="footAlamat" class="text-sm mt-4 text-slate-400 max-w-sm"></p>
      <p id="footTelp" class="text-sm mt-2 text-slate-400"></p>
      <div class="flex flex-wrap gap-2 mt-4">
        <a id="footWa" target="_blank" rel="noopener" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 transition" title="WhatsApp"><i data-lucide="message-circle" class="w-4 h-4"></i></a>
        <a id="footMail" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 transition" title="Email"><i data-lucide="mail" class="w-4 h-4"></i></a>
        <a href="${href("#kontak")}" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 transition" title="Instagram"><i data-lucide="instagram" class="w-4 h-4"></i></a>
        <a href="${href("#kontak")}" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 transition" title="YouTube"><i data-lucide="youtube" class="w-4 h-4"></i></a>
      </div>
    </div>
    <div><b class="text-white text-sm uppercase tracking-wider">About Us</b>
      <ul class="mt-4 space-y-2 text-sm">
        <li><a href="${href("#profil")}" class="hover:text-brand-400 transition">Profil Sekolah</a></li>
        <li><a href="${href("#program")}" class="hover:text-brand-400 transition">Program</a></li>
        <li><a href="${href("#fasilitas")}" class="hover:text-brand-400 transition">Fasilitas</a></li>
        <li><a href="${href("#kontak")}" class="hover:text-brand-400 transition">Kontak</a></li>
      </ul>
    </div>
    <div><b class="text-white text-sm uppercase tracking-wider">Layanan</b>
      <ul class="mt-4 space-y-2 text-sm">
        <li><a href="tuition.html" class="hover:text-brand-400 transition">Tuition Fee</a></li>
        <li><a href="kalender.html" class="hover:text-brand-400 transition">Kalender Akademik</a></li>
        <li><a href="ppdb.html" class="hover:text-brand-400 transition">PPDB Online</a></li>
        <li><a href="portal.html" class="hover:text-brand-400 transition">Portal Orang Tua</a></li>
        <li><a href="belajar.html" class="hover:text-brand-400 transition">E-Learning</a></li>
        <li><a href="cbt.html" class="hover:text-brand-400 transition">Ujian CBT</a></li>
      </ul>
    </div>
    <div><b class="text-white text-sm uppercase tracking-wider">Jelajahi</b>
      <ul class="mt-4 space-y-2 text-sm">
        <li><a href="${href("#kegiatan")}" class="hover:text-brand-400 transition">Kegiatan Sekolah</a></li>
        <li><a href="${href("#akademik")}" class="hover:text-brand-400 transition">Agenda Akademik</a></li>
        <li><a href="${href("#berita")}" class="hover:text-brand-400 transition">Berita</a></li>
        <li><a href="sd.html" class="hover:text-brand-400 transition">SD</a> · <a href="smp.html" class="hover:text-brand-400 transition">SMP</a> · <a href="sma.html" class="hover:text-brand-400 transition">SMA</a> · <a href="smk.html" class="hover:text-brand-400 transition">SMK</a></li>
      </ul>
    </div>
  </div>
  <div class="border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 py-5 text-xs text-slate-500 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      <span class="sm:flex-1 text-center sm:text-left">© 2026 <span id="footCopy">Nama Sekolah</span>. Sistem Informasi Sekolah statis (GitHub Pages).</span>
      <a href="login.html" id="adminGate" rel="nofollow" aria-label="Login Administrator" title="Login Administrator"
         class="relative shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-300 hover:text-amber-300 outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60">
        <i data-lucide="lock" class="w-3.5 h-3.5"></i>
        <span class="gate-tip pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-300">Area Administrator</span>
      </a>
      <span class="sm:flex-1 text-center sm:text-right">Slider &amp; konten dikelola dari Panel Admin • <code>data/*.json</code></span>
    </div>
  </div>
</footer>`;

  /* ---------- pasang / rapikan ---------- */
  const KEEP_IDS = ["cbtTimer", "pLogout", "pSchool", "ppdbSchool", "bSchool", "navNama", "navNpsn", "mBtn", "mMenu"];

  function markKeep() {
    if (!IS_APP) return;
    document.querySelectorAll("header:not(#lsHeader)").forEach(h => { h.dataset.lsKeep = "1"; });
  }
  function rescue(oldHeader) {
    // pindahkan elemen ber-id penting dari header lama bila belum ada di header baru
    KEEP_IDS.forEach(id => {
      if (document.querySelector("#lsHeader #" + id)) return;
      const node = oldHeader.querySelector("#" + id);
      if (node) document.querySelector("#lsHeader .max-w-7xl").appendChild(node);
    });
  }
  function stripOffset() {
    document.querySelectorAll('[class*="pt-[72px]"]').forEach(el => { if (!el.closest("#lsHeader")) el.classList.remove("pt-[72px]"); });
    document.querySelectorAll('[style*="padding-top"]').forEach(el => {
      if (el.id === "lsHeader" || el.closest("#lsHeader")) return;
      if (/padding-top:\s*72px/.test(el.getAttribute("style") || "")) el.style.paddingTop = "";
    });
  }
  function patchSlider() {
    const s = document.getElementById("slider");
    if (!s || !CSS.supports("height", "100svh")) return;
    const h = s.style.height || "";
    if (h.includes("100vh")) s.style.height = h.replace("100vh", "100svh");
  }
  function anchorMain() {
    if (document.getElementById("lsMain")) return;
    const target = document.querySelector("main") || document.querySelector("#root") || document.querySelector("section") || document.body;
    if (target === document.body) {
      const w = document.createElement("div"); w.id = "lsMain";
      const kids = [...document.body.childNodes].filter(n => n.nodeType === 1 && !["lsHeader", "lsFooter", "lsSkip"].includes(n.id) && n.tagName !== "SCRIPT" && n.tagName !== "STYLE");
      if (kids.length) document.body.insertBefore(w, kids[0]);
      kids.forEach(k => { if (!k.dataset || k.dataset.ls !== "1") w.appendChild(k); });
    } else target.id = target.id || "lsMain";
  }

  let syncRaf = 0;
  function sync() {
    if (syncRaf) return;
    syncRaf = requestAnimationFrame(() => {
      syncRaf = 0;
      markKeep();
      document.querySelectorAll("header:not(#lsHeader)").forEach(h => {
        if (h.dataset.lsKeep === "1") return;
        rescue(h); h.remove();
      });
      document.querySelectorAll("footer:not(#lsFooter)").forEach(f => f.remove());
      if (!document.getElementById("lsHeader")) document.body.insertAdjacentHTML("afterbegin", headerHTML);
      if (!document.getElementById("lsFooter")) document.body.insertAdjacentHTML("beforeend", footerHTML);
      stripOffset(); patchSlider(); anchorMain(); wire(); hydrate(); refreshIcons();
    });
  }

  /* ---------- interaksi header ---------- */
  let wired = false;
  function wire() {
    const btn = document.getElementById("mBtn"), menu = document.getElementById("lsMenu"), hdr = document.getElementById("lsHeader");
    if (!btn || !menu || wired) return;
    wired = true;
    const setOpen = open => {
      menu.classList.toggle("ls-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.innerHTML = '<i data-lucide="' + (open ? "x" : "menu") + '" class="w-6 h-6"></i>';
      refreshIcons();
    };
    btn.onclick = () => setOpen(!menu.classList.contains("ls-open"));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", e => { if (!hdr.contains(e.target)) setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth >= 1024) setOpen(false); }, { passive: true });
    const onScroll = () => hdr.classList.toggle("ls-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    if (IS_HOME && "IntersectionObserver" in window) {
      const ids = NAV.filter(n => n[0].startsWith("#")).map(n => n[0].slice(1));
      const links = [...document.querySelectorAll('#lsHeader [data-ls-nav^="#"]')];
      const io = new IntersectionObserver(en => {
        en.forEach(x => {
          if (!x.isIntersecting) return;
          links.forEach(l => l.classList.toggle("ls-on", l.dataset.lsNav === "#" + x.target.id));
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      ids.forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------- isi dari settings ---------- */
  let hydrated = false;
  async function hydrate() {
    if (hydrated) return; hydrated = true;
    let st = {};
    try { st = await fetchJSON("settings.json"); } catch (e) {}
    const nama = st.nama_sekolah || "Nama Sekolah";
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    ["navNama", "footNama", "footCopy", "ppdbSchool", "bSchool", "pSchool"].forEach(id => set(id, nama));
    set("navNpsn", "NPSN " + (st.npsn || "—"));
    set("footAlamat", st.alamat || "");
    set("footTelp", st.telepon || "");
    const wa = "https://wa.me/" + String(st.wa_admin || "").replace(/^0/, "62");
    const w = document.getElementById("footWa"); if (w) w.href = wa;
    const m = document.getElementById("footMail"); if (m) m.href = "mailto:" + (st.email || "");
    refreshIcons();
  }

  /* ---------- jalankan ---------- */
  markKeep();
  document.querySelectorAll("header:not(#lsHeader)").forEach(h => { if (h.dataset.lsKeep !== "1") { rescue(h); h.remove(); } });
  document.querySelectorAll("footer:not(#lsFooter)").forEach(f => f.remove());
  document.body.insertAdjacentHTML("afterbegin", headerHTML);
  document.body.insertAdjacentHTML("beforeend", footerHTML);
  stripOffset(); anchorMain(); wire(); hydrate(); refreshIcons();

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();
  window.addEventListener("load", sync);

  let moT = 0;
  const mo = new MutationObserver(muts => {
    const relevant = muts.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && (n.tagName === "HEADER" || n.tagName === "FOOTER" || n.querySelector?.("header,footer,[class*='pt-[72px]'],#slider"))));
    if (!relevant) return;
    clearTimeout(moT); moT = setTimeout(sync, 40);
  });
  mo.observe(document.body, { childList: true, subtree: true });

  if (reduce) document.documentElement.style.scrollBehavior = "auto";
})();

document.addEventListener("DOMContentLoaded", refreshIcons);
