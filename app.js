// ============================================================
// app.js — Library inti (VanillaJS, tanpa framework)
// Baca: fetch lokal /data/*.json + fallback raw.githubusercontent
// Tulis: GitHub Contents API (GET SHA -> PUT base64)
// TOKEN TIDAK BOLEH DI-HARDCODE
// ============================================================

/* Helper DOM global aman: dipasang sebagai properti window (bukan
   deklarasi let/const) sehingga halaman yang punya `const $` sendiri
   tetap boleh menimpanya tanpa SyntaxError. Semua modul admin yang
   memakai $(id) dijamin berfungsi. */
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
  if (!w) { w = document.createElement("div"); w.id = "toasts"; w.className = "fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm"; document.body.appendChild(w); }
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
  if (!force) {
    try { const c = JSON.parse(sessionStorage.getItem(key)); if (c && Date.now() - c.t < 600000) return c.d; } catch (e) {}
  }
  let data = null;
  try {
    const r = await fetch("data/" + file + "?t=" + Date.now());
    if (r.ok) data = await r.json();
  } catch (e) {}
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
document.addEventListener("DOMContentLoaded", refreshIcons);

// ============================================================
// Navigasi situs publik — menyisipkan tautan Tuition Fee dan
// Kalender Akademik pada navbar, menu mobile, footer, dan
// seksi Akademik di beranda tanpa mengubah index.html.
// ============================================================
(function siteNav() {
  const run = () => {
    if (!document.getElementById("navNama") || !document.getElementById("mMenu")) return;
    const desk = document.querySelector("header nav");
    const mk = (href, label, cls) => { const a = document.createElement("a"); a.href = href; a.textContent = label; a.className = cls; return a; };
    const put = (host, afterSel, href, label, cls) => {
      if (!host || host.querySelector('a[href="' + href + '"]')) return;
      const anchor = afterSel ? host.querySelector(afterSel) : null;
      const el = mk(href, label, cls);
      if (anchor) anchor.insertAdjacentElement("afterend", el); else host.appendChild(el);
    };
    const dCls = "px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-700";
    const mCls = "block px-3 py-2 rounded-lg hover:bg-brand-50";
    put(desk, 'a[href="#program"]', "tuition.html", "Tuition Fee", dCls);
    put(desk, 'a[href="#akademik"]', "kalender.html", "Kalender", dCls);
    const mob = document.getElementById("mMenu");
    put(mob, 'a[href="#program"]", '.replace('", ', ''), "tuition.html", "Tuition Fee", mCls);
    put(mob, 'a[href="#akademik"]', "kalender.html", "Kalender Akademik", mCls);
    document.querySelectorAll("footer ul").forEach(ul => {
      if (!ul.querySelector('a[href="ppdb.html"]')) return;
      if (ul.querySelector('a[href="tuition.html"]')) return;
      const li = document.createElement("li");
      li.innerHTML = '<a href="tuition.html" class="hover:text-brand-400">Tuition Fee</a>';
      ul.insertBefore(li, ul.firstChild);
      const li2 = document.createElement("li");
      li2.innerHTML = '<a href="kalender.html" class="hover:text-brand-400">Kalender Akademik</a>';
      li.insertAdjacentElement("afterend", li2);
    });
    const ak = document.getElementById("akademik");
    if (ak && !ak.querySelector('a[href="kalender.html"]')) {
      const head = ak.querySelector('a[href="belajar.html"]');
      if (head) {
        const a = mk("kalender.html", "Kalender Penuh", "inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 ml-2");
        head.insertAdjacentElement("afterend", a);
        head.parentElement.classList.add("flex", "flex-wrap", "items-center");
      }
    }
    refreshIcons();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
