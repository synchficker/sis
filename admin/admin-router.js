// ============================================================
// admin-router.js — Router hash (#/modul), Sidebar 6 grup collapsible,
// pencarian menu, breadcrumb, dan inisialisasi shell Panel Admin.
// DIMUAT TERAKHIR: semua modul sudah mendaftar ke MOD sebelum route() awal berjalan.
// Nama route hash TIDAK diubah (#/siswa, #/spp, #/absensi, #/rapor, #/slider, #/galeri, ...).
// ============================================================

// ---- Definisi menu: [kunci-route, label, ikon-lucide, opsi] -------------------
// "soon" = modul belum ada (tampil non-aktif sampai file modulnya dibuat).
const ADMIN_MENU = [
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", direct: "dashboard" },
  { id: "akademik", label: "Akademik & Kesiswaan", icon: "graduation-cap", open: true, items: [
    ["ppdb", "PPDB", "user-plus"], ["siswa", "Siswa", "users"], ["kelas", "Kelas / Rombel", "school"], ["mutasi", "Mutasi", "arrow-left-right"],
    ["absensi", "Absensi Siswa", "qr-code"], ["absensi-guru", "Absensi Guru", "calendar-check"], ["jurnal", "Jurnal Mengajar", "pen-line"],
    ["nilai", "Nilai", "clipboard-list"], ["rapor", "e-Rapor", "graduation-cap"], ["ujian", "Ujian CBT", "timer"], ["soal", "Bank Soal", "list-checks"],
    ["laporan", "Pelaporan Dinas", "file-text"]
  ] },
  { id: "lms", label: "Belajar / LMS", icon: "book-open", items: [
    ["materi", "Materi", "book-open"], ["video", "Video Belajar", "video"], ["tugas", "Tugas", "clipboard-check"]
  ] },
  { id: "keuangan", label: "Keuangan", icon: "wallet", items: [
    ["spp", "SPP", "wallet"], ["bos", "BOS", "landmark"], ["gaji", "Penggajian", "banknote"]
  ] },
  { id: "sdm", label: "SDM & Sarpras", icon: "briefcase", items: [
    ["guru", "Guru / TU", "briefcase"], ["kinerja", "Penilaian Kinerja", "award"], ["inventaris", "Inventaris", "boxes"],
    ["buku", "Perpustakaan", "library"], ["peminjaman", "Peminjaman", "repeat"]
  ] },
  { id: "website", label: "Website & Sistem", icon: "globe", items: [
    ["media", "Media Library", "images"], ["slider", "Slider", "gallery-horizontal-end"], ["galeri", "Galeri", "layout-grid"],
    ["kegiatan", "Kegiatan", "calendar-heart"], ["biaya", "Konten (Biaya Pendidikan)", "file-pen-line"], ["kalender", "Kalender", "calendar-days"],
    ["tampilan", "UI / Tampilan", "panels-top-left"], ["chat", "Chat Wali", "message-circle"], ["notifikasi", "WA Gateway & Notifikasi", "bell"],
    ["audit", "Audit Log", "shield-check"], ["pengaturan", "Pengaturan", "settings"], ["login", "Pengaturan Form Login", "log-in"]
  ] }
];
const PUBLIC_LINKS = [["index", "Beranda"], ["tuition", "Tuition Fee"], ["kalender", "Kalender"], ["ppdb", "PPDB"], ["portal", "Portal Ortu"], ["belajar", "E-Learning"], ["cbt", "Ujian CBT"]];

const MENU_LOOKUP = {};   // kunci -> { label, group }
ADMIN_MENU.forEach(g => { if (g.direct) MENU_LOOKUP[g.direct] = { label: g.label, group: null }; else g.items.forEach(i => { MENU_LOOKUP[i[0]] = { label: i[1], group: g.label, gid: g.id, soon: !!(i[3] && i[3].soon) }; }); });

const NAV_ITEM_CLS = "navlink flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800";
const grpOpen = {}; ADMIN_MENU.forEach(g => { if (g.items) grpOpen[g.id] = !!g.open; });   // default: hanya "Akademik" terbuka
let menuQuery = "";

function navItemHTML(i) {
  const soon = i[3] && i[3].soon;
  const q = (i[1] + " " + i[0]).toLowerCase();
  if (soon) return '<span data-item data-q="' + q + '" title="Segera hadir" class="flex items-center gap-2.5 px-3 py-2 rounded-lg opacity-50 cursor-not-allowed select-none"><i data-lucide="' + i[2] + '" class="w-4 h-4"></i><span class="flex-1">' + i[1] + '</span><span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">Segera</span></span>';
  return '<a href="#/' + i[0] + '" data-nav="' + i[0] + '" data-item data-q="' + q + '" class="' + NAV_ITEM_CLS + '"><i data-lucide="' + i[2] + '" class="w-4 h-4"></i><span class="truncate">' + i[1] + '</span></a>';
}
function renderNav() {
  const nav = document.getElementById("nav"); if (!nav) return;
  const pub = PUBLIC_LINKS.map(p => '<a href="' + esc(window.siteUrl ? window.siteUrl(p[0]) : "#") + '" target="_blank" rel="noopener" class="hover:text-emerald-400">' + p[1] + "</a>").join("");
  nav.innerHTML = ADMIN_MENU.map(g => {
    if (g.direct) return '<div data-grp-wrap="dashboard">' + navItemHTML([g.direct, g.label, g.icon]) + "</div>";
    return '<div data-grp-wrap="' + g.id + '"><button type="button" data-grp="' + g.id + '" aria-expanded="false" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800 hover:text-slate-200">' +
      '<i data-lucide="' + g.icon + '" class="w-4 h-4"></i><span class="flex-1 text-left">' + g.label.replace("&", "&amp;") + '</span><span class="text-[10px] font-semibold text-slate-500 normal-case">' + g.items.length + '</span>' +
      '<span data-chev class="transition-transform"><i data-lucide="chevron-down" class="w-4 h-4"></i></span></button>' +
      '<div data-grp-body="' + g.id + '" class="hidden pl-3 ml-3 mt-0.5 mb-1 space-y-0.5 border-l border-slate-800">' + g.items.map(navItemHTML).join("") + "</div></div>";
  }).join("") +
    '<div id="navEmpty" class="hidden px-3 py-6 text-center text-xs text-slate-500">Menu tidak ditemukan.</div>' +
    '<div class="px-3 pt-3 text-[11px] text-slate-500">Halaman publik:</div><div class="px-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">' + pub + "</div>";
  nav.querySelectorAll("[data-grp]").forEach(b => b.onclick = () => { menuQuery = ""; const s = document.getElementById("menuSearch"); if (s) s.value = ""; setGroupOpen(b.dataset.grp, !grpOpen[b.dataset.grp]); applyMenuFilter(); });
  applyMenuFilter(); refreshIcons();
}
function setGroupOpen(id, open) { grpOpen[id] = !!open; applyMenuFilter(); }
// Tampilan sidebar = fungsi dari (status buka/tutup grup, kata kunci pencarian).
function applyMenuFilter() {
  const nav = document.getElementById("nav"); if (!nav) return;
  const q = menuQuery.trim().toLowerCase(); let hits = 0;
  nav.querySelectorAll("[data-grp-wrap]").forEach(w => {
    const id = w.dataset.grpWrap, body = w.querySelector("[data-grp-body]"), btn = w.querySelector("[data-grp]");
    const items = [...w.querySelectorAll("[data-item]")];
    if (!body) { const m = !q || items.some(i => i.dataset.q.includes(q)); w.classList.toggle("hidden", !m); if (m) hits++; return; }
    let any = 0; items.forEach(i => { const m = !q || i.dataset.q.includes(q); i.classList.toggle("hidden", !m); if (m) any++; });
    hits += any;
    const open = q ? any > 0 : grpOpen[id];
    w.classList.toggle("hidden", !!q && !any);
    body.classList.toggle("hidden", !open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    const ch = btn.querySelector("[data-chev]"); if (ch) ch.classList.toggle("rotate-180", open);
  });
  const em = document.getElementById("navEmpty"); if (em) em.classList.toggle("hidden", hits > 0);
  const x = document.getElementById("menuSearchX"); if (x) x.classList.toggle("hidden", !q);
}
function wireMenuSearch() {
  const s = document.getElementById("menuSearch"); if (!s) return;
  s.oninput = () => { menuQuery = s.value; applyMenuFilter(); };
  s.onkeydown = e => {
    if (e.key === "Escape") { s.value = ""; menuQuery = ""; applyMenuFilter(); s.blur(); }
    if (e.key === "Enter") { const first = document.querySelector("#nav [data-nav]:not(.hidden)"); const vis = [...document.querySelectorAll("#nav [data-nav]")].find(a => !a.classList.contains("hidden") && !a.closest(".hidden")); if (vis || first) { location.hash = (vis || first).getAttribute("href"); s.value = ""; menuQuery = ""; applyMenuFilter(); } }
  };
  const x = document.getElementById("menuSearchX"); if (x) x.onclick = () => { s.value = ""; menuQuery = ""; applyMenuFilter(); s.focus(); };
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSidebar(); s.focus(); s.select(); } });
}
function openSidebar() { document.getElementById("sidebar").classList.remove("-translate-x-full"); document.getElementById("backdrop").classList.remove("hidden"); }
function closeSidebar() { document.getElementById("sidebar").classList.add("-translate-x-full"); document.getElementById("backdrop").classList.add("hidden"); }

// Menu aktif + grup induknya dibuka + breadcrumb + judul tab
function syncChrome(key) {
  const info = MENU_LOOKUP[key] || { label: (MOD[key] && MOD[key].title) || key, group: null };
  if (info.gid && !grpOpen[info.gid]) grpOpen[info.gid] = true;
  applyMenuFilter();
  document.querySelectorAll("[data-nav]").forEach(a => {
    const on = a.dataset.nav === key;
    a.classList.toggle("bg-emerald-600", on); a.classList.toggle("text-white", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  const act = document.querySelector('#nav [data-nav="' + key + '"]'); if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest" });
  const cr = document.getElementById("crumb");
  if (cr) {
    const sep = '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-300 shrink-0"></i>';
    cr.innerHTML = '<a href="#/dashboard" class="inline-flex items-center gap-1 hover:text-emerald-700 shrink-0"><i data-lucide="home" class="w-3.5 h-3.5"></i>Admin</a>' +
      (info.group ? sep + '<span class="shrink-0">' + esc(info.group) + "</span>" : "") +
      sep + '<span class="font-bold text-slate-700 shrink-0" aria-current="page">' + esc(info.label) + "</span>";
  }
  const sch = (document.getElementById("schoolName") || {}).textContent || "Sekolah";
  document.title = info.label + " — Admin " + (sch === "SIS Sekolah" ? "" : sch);
}

async function route() {
  if (typeof stopScanner === "function") stopScanner();
  // Default = Dashboard. Hash kosong/tidak dikenal -> Dashboard.
  let key = location.hash.replace("#/", "") || "dashboard";
  if (!MOD[key]) key = "dashboard";
  if (!location.hash) history.replaceState(null, "", location.pathname + location.search + "#/dashboard");
  const m = MOD[key];
  // Tutup overlay yang masih terbuka dari modul sebelumnya (drawer Slider/Kegiatan/Konten, modal form, picker) agar tidak menutupi modul baru.
  document.querySelectorAll('[id$="Drawer"]').forEach(d => d.classList.add("hidden"));
  if (typeof closeModal === "function") closeModal();
  const mp = document.getElementById("mpOv"); if (mp) mp.remove();
  document.body.style.overflow = "";
  const sa = document.getElementById("scrollArea"); if (sa) sa.scrollTop = 0;
  syncChrome(key);
  closeSidebar();
  app.onclick = null;
  app.innerHTML = '<div class="flex items-center gap-3 text-slate-400 text-sm py-16 justify-center"><div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>Memuat data…</div>';
  try {
    if (m.render) { const fn = typeof m.render === "string" ? window[m.render] : m.render; await fn(key); }
    else await renderCRUD(key);
  } catch (e) {
    app.innerHTML = card('<p class="text-sm text-red-600 font-semibold">Gagal memuat modul: ' + esc(e.message) + '</p><p class="text-xs text-slate-500 mt-1">Periksa config.js, koneksi, atau klik Sinkron.</p>');
    toast(e.message, "error");
  }
  refreshIcons();
  lsPaginate();
}

// ---- Inisialisasi shell ----
document.getElementById("ghUser").textContent = sessionStorage.getItem("gh_user") || "admin";
const _av = sessionStorage.getItem("gh_avatar"); if (_av) document.getElementById("ghAvatar").src = _av;
const _rc = repoCfg(); document.getElementById("repoLabel").textContent = _rc.owner + "/" + _rc.repo + " (" + _rc.branch + ")";
fetchJSON("settings.json").then(s => { document.getElementById("schoolName").textContent = s.nama_sekolah; syncChrome((location.hash.replace("#/", "") && MOD[location.hash.replace("#/", "")]) ? location.hash.replace("#/", "") : "dashboard"); }).catch(() => {});
document.getElementById("btnLogout").onclick = logout;
document.getElementById("btnSync").onclick = () => { clearDataCache(); route(); toast("Cache sesi dibersihkan — data dimuat ulang dari repo.", "info"); };
document.getElementById("btnMenu").onclick = openSidebar;
document.getElementById("backdrop").onclick = closeSidebar;
const _sc = document.getElementById("sidebarClose"); if (_sc) _sc.onclick = closeSidebar;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !document.getElementById("sidebar").classList.contains("-translate-x-full")) closeSidebar(); });
document.getElementById("modalX").onclick = closeModal;
document.getElementById("modalCancel").onclick = closeModal;
renderNav(); wireMenuSearch();
window.addEventListener("hashchange", route);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", route); else route();
