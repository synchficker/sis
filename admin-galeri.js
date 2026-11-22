// ============================================================
// admin-galeri.js — CMS "Pengaturan Galeri" (data/galeri.json)
// Mengendalikan galeri Bento bertahap pada index.html:
// jumlah kartu awal, tambahan per klik "Lihat", batas maksimum,
// tata letak, gaya, filter, urutan, serta tombol Lihat/Jeda/Ringkas.
// Mandiri: memiliki helper DOM sendiri, tidak bergantung global $.
// ============================================================
(() => {
"use strict";

const el = id => document.getElementById(id);
const INP = (typeof inp !== "undefined") ? inp : 'class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"';
const head = m => (typeof pageHead !== "undefined") ? pageHead(m) : '<div class="mb-5"><h1 class="text-xl md:text-2xl font-extrabold text-slate-800">' + esc(m.title) + '</h1><p class="text-sm text-slate-500 mt-1">' + esc(m.desc || "") + "</p></div>";

const GL_DEF = {
  aktif: true,
  judul: "Aktivitas & Kegiatan Sekolah",
  subjudul: "Dokumentasi kegiatan siswa sepanjang tahun ajaran — akademik, seni, olahraga, keagamaan, hingga kewirausahaan. Klik kartu untuk melihat detail kegiatan.",
  awal: 9, batch: 9, maks: 0,
  tombolLabel: "Lihat", tombolSisa: true,
  mode: "bento", kolom: 4, tinggiBaris: 190, gap: 16, radius: 24, overlay: 78,
  efekHover: "zoom", urut: "urutan",
  filter: true, kategoriBatas: 0, hanyaUnggulan: false,
  autoMuat: false, animasi: true,
  tampilInfo: true, tampilTanggal: true, tampilKategori: true, tampilRingkasan: true, lightbox: true
};
const GL_PKEY = "gl_presets";
const GL_HOVER = [["zoom", "Zoom foto"], ["bright", "Terang & saturasi"], ["lift", "Angkat kartu"], ["none", "Tanpa efek"]];
const GL_URUT = [["urutan", "Urutan manual (urutan)"], ["terbaru", "Tanggal terbaru"], ["terlama", "Tanggal terlama"], ["judul", "Judul A–Z"]];
const BP = 'class="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg"';
const BS = 'class="inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-sm font-bold px-4 py-2 rounded-lg"';
const GL_QUICK = [
  ["9 kartu · bento 4 kolom", { awal: 9, batch: 9, kolom: 4, mode: "bento", tinggiBaris: 190, gap: 16 }],
  ["12 kartu · bento 4 kolom", { awal: 12, batch: 12, kolom: 4, mode: "bento", tinggiBaris: 190, gap: 16 }],
  ["16 kartu · grid 4 kolom", { awal: 16, batch: 16, kolom: 4, mode: "grid", tinggiBaris: 180, gap: 14 }],
  ["Ringkas 6 · majalah", { awal: 6, batch: 6, kolom: 3, mode: "bento", tinggiBaris: 220, gap: 18 }],
  ["Padat 24 · mozaik", { awal: 24, batch: 24, kolom: 6, mode: "bento", tinggiBaris: 140, gap: 8 }]
];
const GL_CTRL = [
  { k: "aktif", t: "tog", l: "Tampilkan seksi galeri di beranda", icon: "eye", grp: "Umum" },
  { k: "awal", t: "range", l: "Kartu saat pertama dibuka", min: 3, max: 24, step: 1, icon: "layout-grid", grp: "Paginasi", fmt: v => v + " kartu" },
  { k: "batch", t: "range", l: "Tambahan per klik Lihat", min: 3, max: 24, step: 1, icon: "plus", grp: "Paginasi", fmt: v => "+" + v + " kartu" },
  { k: "maks", t: "range", l: "Batas maksimum ditampilkan", min: 0, max: 1000, step: 10, icon: "gauge", grp: "Paginasi", fmt: v => v === 0 ? "tanpa batas" : v + " kartu" },
  { k: "tombolLabel", t: "txt", l: "Label tombol muat", icon: "type", grp: "Paginasi" },
  { k: "tombolSisa", t: "tog", l: "Sertakan jumlah sisa di tombol", icon: "hash", grp: "Paginasi" },
  { k: "autoMuat", t: "tog", l: "Muat otomatis saat digulir", icon: "play", grp: "Paginasi" },
  { k: "mode", t: "sel", l: "Gaya tata letak", opts: [["bento", "Bento (kartu bervariasi)"], ["grid", "Grid seragam"]], icon: "layout-template", grp: "Tata Letak" },
  { k: "kolom", t: "range", l: "Kolom (layar besar)", min: 2, max: 6, step: 1, icon: "grid-2x2", grp: "Tata Letak", fmt: v => v + " kolom" },
  { k: "tinggiBaris", t: "range", l: "Tinggi baris", min: 120, max: 280, step: 5, icon: "move-vertical", grp: "Tata Letak", fmt: v => v + " px" },
  { k: "gap", t: "range", l: "Jarak antar kartu", min: 4, max: 32, step: 2, icon: "move-horizontal", grp: "Tata Letak", fmt: v => v + " px" },
  { k: "radius", t: "range", l: "Lengkung sudut", min: 0, max: 40, step: 2, icon: "square", grp: "Tata Letak", fmt: v => v + " px" },
  { k: "overlay", t: "range", l: "Kegelapan overlay", min: 30, max: 95, step: 1, icon: "contrast", grp: "Gaya", fmt: v => v + "%" },
  { k: "efekHover", t: "sel", l: "Efek saat kursor di atas", opts: GL_HOVER, icon: "mouse-pointer-2", grp: "Gaya" },
  { k: "animasi", t: "tog", l: "Animasi muncul bertahap", icon: "sparkles", grp: "Gaya" },
  { k: "urut", t: "sel", l: "Urutan tampilan", opts: GL_URUT, icon: "arrow-down-up", grp: "Konten" },
  { k: "hanyaUnggulan", t: "tog", l: "Hanya kegiatan unggulan", icon: "star", grp: "Konten" },
  { k: "filter", t: "tog", l: "Tampilkan filter kategori", icon: "filter", grp: "Konten" },
  { k: "kategoriBatas", t: "range", l: "Batas jumlah kategori", min: 0, max: 12, step: 1, icon: "tags", grp: "Konten", fmt: v => v === 0 ? "semua" : v + " kategori" },
  { k: "tampilInfo", t: "tog", l: "Tampilkan blok teks kartu", icon: "text", grp: "Konten" },
  { k: "tampilTanggal", t: "tog", l: "Tampilkan tanggal", icon: "calendar", grp: "Konten" },
  { k: "tampilKategori", t: "tog", l: "Tampilkan label kategori", icon: "badge", grp: "Konten" },
  { k: "tampilRingkasan", t: "tog", l: "Tampilkan ringkasan", icon: "align-left", grp: "Konten" },
  { k: "lightbox", t: "tog", l: "Kartu dapat diklik (detail)", icon: "maximize-2", grp: "Konten" }
];

let GL = { ...GL_DEF }, GL_DATA = [], glShown = 0, glCat = "Semua", glAuto = false;
let glUndoT = null, glResizeBound = false, glAnimRaf = 0;

const glPresets = () => { try { return JSON.parse(localStorage.getItem(GL_PKEY)) || []; } catch (e) { return []; } };
const glSetPresets = v => localStorage.setItem(GL_PKEY, JSON.stringify(v));

function glStyle() {
  if (el("glStyleTag")) return;
  const s = document.createElement("style");
  s.id = "glStyleTag";
  s.textContent =
    '.glc{position:relative;overflow:hidden;text-align:left;transition:box-shadow .3s,transform .3s,opacity .5s}' +
    '.glc img{transition:transform .8s cubic-bezier(.2,.7,.3,1),filter .4s}' +
    '.glc:hover{box-shadow:0 18px 38px -16px rgba(22,101,52,.5)}' +
    '.glc[data-hv="zoom"]:hover img{transform:scale(1.08)}' +
    '.glc[data-hv="bright"]:hover img{filter:brightness(1.15) saturate(1.16)}' +
    '.glc[data-hv="lift"]:hover{transform:translateY(-5px)}' +
    '.glc[data-hv="none"]:hover img{transform:none;filter:none}' +
    '.glc.an{opacity:0;transform:translateY(14px)}' +
    '.glc.an.in{opacity:1;transform:none}';
  document.head.appendChild(s);
}

function glSpan(i) {
  if (GL.mode !== "bento") return "";
  const c = GL.kolom, j = i % 9;
  if (c >= 4) return ["col-span-2 row-span-2", "", "", "col-span-2", "", "", "col-span-2", "col-span-2", "col-span-2"][j];
  if (c === 3) return j === 0 ? "col-span-2 row-span-2" : j === 4 ? "col-span-2" : "";
  return j === 0 ? "col-span-2 row-span-2" : (j === 3 || j === 6) ? "col-span-2" : "";
}
function glSorted() {
  let a = GL_DATA.filter(k => k.status !== "Draft");
  if (GL.hanyaUnggulan) a = a.filter(k => k.unggulan);
  a = a.slice();
  if (GL.urut === "terbaru") a.sort((x, y) => String(y.tanggal || "").localeCompare(String(x.tanggal || "")));
  else if (GL.urut === "terlama") a.sort((x, y) => String(x.tanggal || "").localeCompare(String(y.tanggal || "")));
  else if (GL.urut === "judul") a.sort((x, y) => String(x.judul || "").localeCompare(String(y.judul || "")));
  else a.sort((x, y) => (x.urutan || 99) - (y.urutan || 99));
  return a;
}
const glFiltered = () => glSorted().filter(k => glCat === "Semua" || k.kategori === glCat);
const glCap = () => { const n = glFiltered().length; return GL.maks > 0 ? Math.min(GL.maks, n) : n; };

function glCard(k, i) {
  const big = i % 9 === 0, ov = Math.max(20, Math.min(95, GL.overlay)) / 100;
  const tag = GL.lightbox ? "button" : "div";
  return "<" + tag + (GL.lightbox ? ' type="button"' : "") + ' data-hv="' + esc(GL.efekHover) + '" data-an="' + (i % 9) + '" class="glc group ring-1 ring-slate-900/10' + (GL.animasi ? " an" : "") + " " + glSpan(i) + '" style="border-radius:' + GL.radius + 'px">' +
    '<div class="w-full h-full" style="background:linear-gradient(135deg,#16a34a,#0d9488)"><img src="' + esc(k.foto || "") + '" loading="lazy" class="w-full h-full object-cover" onerror="this.style.display=\'none\'" alt=""></div>' +
    '<div class="absolute inset-0" style="background:linear-gradient(to top, rgba(2,6,23,' + ov + '), rgba(2,6,23,' + (ov * .42).toFixed(2) + ') 55%, rgba(2,6,23,' + (ov * .08).toFixed(2) + '))"></div>' +
    (GL.tampilKategori ? '<div class="absolute top-2 left-2 flex flex-wrap gap-1"><span class="px-2 py-0.5 rounded-full bg-white/90 text-emerald-800 text-[9px] font-bold uppercase">' + esc(k.kategori || "Kegiatan") + "</span>" + (k.unggulan ? '<span class="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-bold">★</span>' : "") + "</div>" : "") +
    (GL.lightbox ? '<span class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i data-lucide="maximize-2" class="w-3 h-3"></i></span>' : "") +
    (GL.tampilInfo ? '<div class="absolute inset-x-0 bottom-0 p-2.5 ' + (big ? "md:p-4" : "") + ' text-white">' +
      (GL.tampilTanggal ? '<div class="text-[9px] font-semibold text-amber-300">' + esc(fmtTgl(k.tanggal)) + "</div>" : "") +
      '<div class="font-bold leading-snug mt-0.5 ' + (big ? "text-sm md:text-lg" : "text-[11px] line-clamp-2") + '">' + esc(k.judul) + "</div>" +
      (GL.tampilRingkasan && big ? '<div class="text-[10px] text-white/75 mt-1 line-clamp-2">' + esc(k.ringkasan || "") + "</div>" : "") +
      "</div>" : "") +
    "</" + tag + ">";
}

function glPreviewCols() {
  const grid = el("glGrid"); if (!grid) return;
  const wide = grid.clientWidth >= 620;
  grid.style.gridTemplateColumns = "repeat(" + (wide ? GL.kolom : 2) + ",minmax(0,1fr))";
  grid.style.gridAutoRows = (wide ? GL.tinggiBaris : Math.round(GL.tinggiBaris * .62)) + "px";
}
function glAnimate() {
  const grid = el("glGrid"); if (!grid) return;
  const pending = grid.querySelectorAll(".glc.an:not(.in)");
  if (!GL.animasi) { pending.forEach(c => c.classList.remove("an")); return; }
  if (glAnimRaf) cancelAnimationFrame(glAnimRaf);
  glAnimRaf = requestAnimationFrame(() => {
    pending.forEach(c => { c.style.transitionDelay = (Number(c.dataset.an || 0) * 45) + "ms"; c.classList.add("in"); });
    glAnimRaf = 0;
  });
}
function glPaintPreview(reset) {
  const grid = el("glGrid"); if (!grid) return;
  grid.style.gap = GL.gap + "px";
  grid.style.gridAutoFlow = "dense";
  const list = glFiltered(), cap = glCap();
  if (reset) { grid.innerHTML = ""; glShown = 0; }
  if (!list.length) {
    grid.innerHTML = '<div class="col-span-2 py-10 text-center text-sm text-slate-400">Tidak ada kegiatan yang cocok dengan pengaturan ini.</div>';
  } else {
    const target = Math.min(reset ? Math.min(GL.awal, cap) : glShown + GL.batch, cap);
    if (target > glShown) {
      grid.insertAdjacentHTML("beforeend", list.slice(glShown, target).map((k, i) => glCard(k, glShown + i)).join(""));
      glShown = target;
    }
  }
  const left = Math.max(0, cap - glShown), pct = cap ? Math.round(glShown / cap * 100) : 100;
  const set = (id, txt) => { const e = el(id); if (e) e.textContent = txt; };
  set("glProgTxt", glShown + " / " + cap + " kartu");
  set("glPct", pct + "%");
  const bar = el("glBar"); if (bar) bar.style.width = pct + "%";
  const more = el("glMore");
  if (more) {
    if (left > 0) { more.classList.remove("hidden"); const sp = more.querySelector("span"); if (sp) sp.textContent = (GL.tombolLabel || "Lihat") + (GL.tombolSisa ? " " + Math.min(GL.batch, left) + " lagi" : ""); }
    else more.classList.add("hidden");
  }
  const col = el("glCollapse"); if (col) col.classList.toggle("hidden", glShown <= Math.min(GL.awal, cap));
  const done = el("glDone"); if (done) done.classList.toggle("hidden", left !== 0 || !cap);
  const ab = el("glAutoBtn"); if (ab) ab.classList.toggle("hidden", left === 0);
  set("glMeta", list.length + " cocok · " + (cap ? Math.ceil(cap / Math.max(1, GL.batch)) : 0) + " batch · " + glShown + " kartu di DOM");
  set("glPvCount", list.length + " kegiatan");
  glPreviewCols(); glAnimate(); refreshIcons();
}
function glCats() {
  const host = el("glCats"); if (!host) return;
  if (!GL.filter) { host.innerHTML = ""; host.classList.add("hidden"); return; }
  host.classList.remove("hidden");
  const all = glSorted();
  let cats = [...new Set(all.map(k => k.kategori).filter(Boolean))];
  if (GL.kategoriBatas > 0) cats = cats.slice(0, GL.kategoriBatas);
  const list = ["Semua", ...cats];
  if (!list.includes(glCat)) glCat = "Semua";
  host.innerHTML = list.map(c => {
    const on = c === glCat, n = c === "Semua" ? all.length : all.filter(k => k.kategori === c).length;
    return '<button type="button" data-gc="' + esc(c) + '" class="px-2.5 py-1 rounded-full text-[11px] font-bold border ' + (on ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300") + '">' + esc(c) + " " + n + "</button>";
  }).join("");
  host.querySelectorAll("[data-gc]").forEach(b => b.onclick = () => { glCat = b.dataset.gc; glCats(); glPaintPreview(true); });
}
function glAutoCheck() {
  const sc = el("glScroll"); if (!sc || !glAuto) return;
  if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 120) glPaintPreview(false);
}

async function renderGaleri() {
  glStyle();
  try { GL = { ...GL_DEF, ...(await fetchJSON("galeri.json")) }; } catch (e) { GL = { ...GL_DEF }; }
  const d = await fetchJSON("kegiatan.json").catch(() => []);
  GL_DATA = Array.isArray(d) ? d : [];
  glCat = "Semua"; glAuto = !!GL.autoMuat; glShown = 0;
  glRender();
}

function glRender() {
  const groups = ["Umum", "Paginasi", "Tata Letak", "Gaya", "Konten"];
  const total = GL_DATA.length;
  const tampil = GL_DATA.filter(k => k.status === "Tampil").length;
  const ung = GL_DATA.filter(k => k.unggulan && k.status !== "Draft").length;
  const cats = [...new Set(GL_DATA.filter(k => k.status !== "Draft").map(k => k.kategori).filter(Boolean))];
  const st = (l, v, c, i) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"><div class="flex items-center gap-2 text-xs font-bold text-slate-500"><i data-lucide="' + i + '" class="w-4 h-4 text-' + c + '-600"></i>' + l + '</div><div class="text-2xl font-extrabold text-' + c + '-600 mt-1">' + v + "</div></div>";

  const ctrlHTML = groups.map(g => {
    const items = GL_CTRL.filter(c => c.grp === g);
    if (!items.length) return "";
    return '<div class="mb-1"><div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 mt-2">' + g + "</div>" +
      items.map(c => {
        const v = GL[c.k];
        if (c.t === "tog") return '<label class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-emerald-400 mb-2"><span class="flex items-center gap-2 text-[11px] font-bold text-slate-600"><i data-lucide="' + c.icon + '" class="w-3.5 h-3.5 text-slate-400"></i>' + c.l + '</span><input id="gl_' + c.k + '" type="checkbox" ' + (v ? "checked" : "") + ' class="w-5 h-5 accent-emerald-600 shrink-0"></label>';
        const hd = '<div class="flex items-center justify-between gap-2 mb-1"><span class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"><i data-lucide="' + c.icon + '" class="w-3.5 h-3.5 text-slate-400"></i>' + c.l + "</span>" + (c.t === "range" ? '<span id="glv_' + c.k + '" class="text-[11px] font-mono font-bold text-emerald-700">' + (c.fmt ? c.fmt(v) : v) + "</span>" : "") + "</div>";
        if (c.t === "range") return '<div class="mb-3">' + hd + '<input id="gl_' + c.k + '" type="range" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + v + '" class="w-full accent-emerald-600"></div>';
        if (c.t === "sel") return '<div class="mb-3">' + hd + '<select id="gl_' + c.k + '" ' + INP + ">" + c.opts.map(o => '<option value="' + o[0] + '" ' + (String(v) === String(o[0]) ? "selected" : "") + ">" + o[1] + "</option>").join("") + "</select></div>";
        return '<div class="mb-3">' + hd + '<input id="gl_' + c.k + '" value="' + esc(v) + '" ' + INP + "></div>";
      }).join("") + "</div>";
  }).join("");

  app.innerHTML = head({ title: "Pengaturan Galeri", desc: "Kendalikan galeri Bento pada beranda: jumlah kartu awal, tambahan tiap klik “Lihat”, batas maksimum, tata letak, dan gaya. Tersimpan di data/galeri.json beserta audit log." }) +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' + st("Total Kegiatan", total, "slate", "images") + st("Tampil", tampil, "emerald", "eye") + st("Unggulan", ung, "amber", "star") + st("Kategori", cats.length, "violet", "tags") + "</div>" +
    (!GL.aktif ? '<div class="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 flex gap-2"><i data-lucide="eye-off" class="w-4 h-4 shrink-0 mt-0.5"></i><span>Seksi galeri sedang <b>disembunyikan</b> dari beranda. Aktifkan pada grup Umum agar tampil kembali.</span></div>' : "") +
    '<div class="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-4 items-start">' +
      '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:sticky lg:top-4">' +
        '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="sliders-horizontal" class="w-4 h-4 text-emerald-600"></i><b class="text-sm flex-1">Panel Kontrol Galeri</b><span class="text-[10px] font-bold text-emerald-600">LIVE</span></div>' +
        '<div class="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">' +
          '<label class="block mb-3"><span class="text-[11px] font-bold text-slate-600">Judul seksi</span><input id="gl_judul" value="' + esc(GL.judul) + '" ' + INP + "></label>" +
          '<label class="block mb-3"><span class="text-[11px] font-bold text-slate-600">Subjudul</span><textarea id="gl_subjudul" rows="3" ' + INP + ">" + esc(GL.subjudul) + "</textarea></label>" +
          ctrlHTML +
        "</div>" +
        '<div class="p-3 border-t border-slate-100 grid grid-cols-2 gap-2">' +
          '<button type="button" id="glSave" class="col-span-2 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg"><i data-lucide="check" class="w-4 h-4"></i>Simpan Pengaturan</button>' +
          '<button type="button" id="glReset" ' + BS + '><i data-lucide="rotate-ccw" class="w-4 h-4"></i>Reset</button>' +
          '<button type="button" id="glRandom" ' + BS + '><i data-lucide="shuffle" class="w-4 h-4"></i>Acak</button>' +
          '<button type="button" id="glExport" ' + BS + '><i data-lucide="download" class="w-4 h-4"></i>Ekspor</button>' +
          '<a href="#/kegiatan" ' + BS + '><i data-lucide="pencil" class="w-4 h-4"></i>Isi Kegiatan</a>' +
        "</div>" +
      "</div>" +
      '<div class="space-y-4 min-w-0">' +
        '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">' +
          '<div class="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2"><i data-lucide="monitor-play" class="w-4 h-4 text-emerald-600"></i><b class="text-sm">Pratinjau Beranda</b><span id="glMeta" class="text-[11px] text-slate-500 font-mono"></span><div class="flex-1"></div><a href="index.html#kegiatan" target="_blank" class="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">Buka beranda<i data-lucide="external-link" class="w-3.5 h-3.5"></i></a></div>' +
          '<div class="p-4 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40">' +
            '<div class="flex flex-wrap items-end justify-between gap-3 mb-3"><div class="min-w-0"><div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">School Activities</div><b id="glPvJudul" class="font-extrabold text-lg text-slate-800 block">' + esc(GL.judul) + '</b></div><span id="glPvCount" class="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold"></span></div>' +
            '<div id="glCats" class="flex flex-wrap gap-1.5 mb-3"></div>' +
            '<div id="glScroll" class="max-h-[560px] overflow-y-auto pr-1"><div id="glGrid" class="grid"></div></div>' +
            '<div class="mt-4 bg-white/85 rounded-2xl border border-emerald-200 p-3"><div class="flex flex-wrap items-center gap-3">' +
              '<div class="min-w-[150px] flex-1"><div class="flex justify-between text-[11px] font-bold text-slate-500"><span id="glProgTxt">0 / 0</span><span id="glPct" class="text-emerald-700 font-mono">0%</span></div><div class="mt-1.5 h-2 rounded-full bg-emerald-100 overflow-hidden"><div id="glBar" class="h-full w-0 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-[width] duration-500"></div></div></div>' +
              '<button type="button" id="glMore" ' + BP + '><i data-lucide="layout-grid" class="w-4 h-4"></i><span>Lihat</span></button>' +
              '<button type="button" id="glAutoBtn" ' + BS + '><i data-lucide="' + (glAuto ? "pause" : "play") + '" class="w-4 h-4"></i><span>' + (glAuto ? "Jeda" : "Muat otomatis") + "</span></button>" +
              '<button type="button" id="glCollapse" ' + BS + '><i data-lucide="chevrons-up" class="w-4 h-4"></i>Ringkas</button>' +
            '</div><p id="glDone" class="hidden mt-2 text-[11px] font-bold text-emerald-700">Seluruh kegiatan pada kategori ini telah ditampilkan.</p></div>' +
          "</div>" +
        "</div>" +
        '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">' +
          '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="bookmark" class="w-4 h-4 text-amber-500"></i><b class="text-sm flex-1">Preset Galeri</b><button type="button" id="glPresetSave" class="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-amber-400">+ Simpan preset</button></div>' +
          '<div id="glPresets" class="p-3 flex flex-wrap gap-2"></div>' +
          '<div class="px-4 pb-4 flex flex-wrap gap-2">' + GL_QUICK.map((p, i) => '<button type="button" data-gp="' + i + '" class="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-700">' + p[0] + "</button>").join("") + "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  refreshIcons();
  glWire(); glCats(); glPaintPreview(true); glRenderPresets();
}

function glWire() {
  const live = () => {
    GL_CTRL.forEach(c => {
      const e = el("gl_" + c.k); if (!e) return;
      GL[c.k] = c.t === "tog" ? e.checked : c.t === "range" ? +e.value : e.value;
      const lb = el("glv_" + c.k); if (lb) lb.textContent = c.fmt ? c.fmt(GL[c.k]) : GL[c.k];
    });
    const j = el("gl_judul"), s = el("gl_subjudul");
    if (j) GL.judul = j.value;
    if (s) GL.subjudul = s.value;
    const pj = el("glPvJudul"); if (pj) pj.textContent = GL.judul || GL_DEF.judul;
    glCats(); glPaintPreview(true);
  };
  GL_CTRL.forEach(c => { const e = el("gl_" + c.k); if (e) { e.oninput = live; e.onchange = live; } });
  const j = el("gl_judul"), s = el("gl_subjudul");
  if (j) j.oninput = live;
  if (s) s.oninput = live;

  const more = el("glMore"); if (more) more.onclick = () => glPaintPreview(false);
  const col = el("glCollapse"); if (col) col.onclick = () => { glPaintPreview(true); const sc = el("glScroll"); if (sc) sc.scrollTo({ top: 0, behavior: "smooth" }); };
  const ab = el("glAutoBtn");
  if (ab) ab.onclick = () => {
    glAuto = !glAuto;
    ab.innerHTML = '<i data-lucide="' + (glAuto ? "pause" : "play") + '" class="w-4 h-4"></i><span>' + (glAuto ? "Jeda" : "Muat otomatis") + "</span>";
    refreshIcons(); if (glAuto) glAutoCheck();
  };
  const sc = el("glScroll"); if (sc) sc.onscroll = () => { if (glAuto) glAutoCheck(); };
  if (!glResizeBound) { window.addEventListener("resize", glPreviewCols); glResizeBound = true; }

  const save = el("glSave");
  if (save) save.onclick = async () => {
    const snap = { ...GL };
    const ok = await saveData("galeri.json", GL, "Konten Website", "UPDATE PENGATURAN GALERI", GL.awal + " awal · +" + GL.batch + "/klik · " + GL.mode + " " + GL.kolom + " kolom");
    if (ok) toast("Pengaturan galeri tersimpan & langsung dipakai beranda.", "success");
    else { GL = snap; glRender(); }
  };
  const rs = el("glReset"); if (rs) rs.onclick = () => { const prev = { ...GL }; GL = { ...GL_DEF }; glRender(); glUndo("Pengaturan dikembalikan ke default", () => { GL = prev; glRender(); }); };
  const rd = el("glRandom");
  if (rd) rd.onclick = () => {
    const prev = { ...GL };
    GL.mode = Math.random() < .7 ? "bento" : "grid";
    GL.kolom = 3 + Math.floor(Math.random() * 4);
    GL.awal = GL.batch = [6, 9, 12, 16][Math.floor(Math.random() * 4)];
    GL.tinggiBaris = 140 + Math.floor(Math.random() * 12) * 10;
    GL.gap = 6 + Math.floor(Math.random() * 10) * 2;
    GL.radius = Math.floor(Math.random() * 15) * 2;
    GL.overlay = 55 + Math.floor(Math.random() * 35);
    GL.efekHover = GL_HOVER[Math.floor(Math.random() * GL_HOVER.length)][0];
    glRender(); glUndo("Tampilan galeri diacak", () => { GL = prev; glRender(); });
  };
  const ex = el("glExport"); if (ex) ex.onclick = () => download("galeri.json", JSON.stringify(GL, null, 2));
  const ps = el("glPresetSave");
  if (ps) ps.onclick = () => {
    const n = prompt("Nama preset galeri:", "Galeri " + GL.awal + " · " + GL.mode + " " + GL.kolom + " kolom");
    if (!n) return;
    const p = glPresets(); p.push({ name: n.slice(0, 32), cfg: { ...GL } }); glSetPresets(p); glRenderPresets();
    toast("Preset tersimpan di perangkat ini.", "success");
  };
  app.querySelectorAll("[data-gp]").forEach(b => b.onclick = () => {
    const prev = { ...GL };
    GL = { ...GL, ...GL_QUICK[+b.dataset.gp][1] };
    glRender(); glUndo("Preset cepat diterapkan", () => { GL = prev; glRender(); });
  });
}

function glRenderPresets() {
  const host = el("glPresets"); if (!host) return;
  const p = glPresets();
  host.innerHTML = p.length ? p.map((x, i) =>
    '<span class="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-slate-100 border border-slate-200"><button type="button" data-glp="' + i + '" class="text-[11px] font-bold text-slate-600 hover:text-emerald-700">' + esc(x.name) + '</button><button type="button" data-gld="' + i + '" class="w-5 h-5 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center">×</button></span>').join("")
    : '<span class="text-[11px] text-slate-400">Belum ada preset tersimpan.</span>';
  host.querySelectorAll("[data-glp]").forEach(b => b.onclick = () => {
    const prev = { ...GL };
    GL = { ...GL_DEF, ...glPresets()[+b.dataset.glp].cfg };
    glRender(); glUndo("Preset diterapkan", () => { GL = prev; glRender(); });
  });
  host.querySelectorAll("[data-gld]").forEach(b => b.onclick = () => {
    const p = glPresets(), rm = p.splice(+b.dataset.gld, 1)[0];
    glSetPresets(p); glRenderPresets();
    glUndo('Preset "' + rm.name + '" dihapus', () => { const q = glPresets(); q.push(rm); glSetPresets(q); glRenderPresets(); });
  });
}

function glUndo(label, restore) {
  let bar = el("glUndoBar");
  if (!bar) { bar = document.createElement("div"); bar.id = "glUndoBar"; document.body.appendChild(bar); }
  bar.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-sm";
  bar.innerHTML = '<i data-lucide="undo-2" class="w-4 h-4 text-amber-400"></i><span>' + esc(label) + '</span><button type="button" id="glUndoBtn" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-900">Urungkan</button>';
  refreshIcons();
  const btn = el("glUndoBtn");
  if (btn) btn.onclick = () => { restore(); const b = el("glUndoBar"); if (b) b.remove(); toast("Perubahan diurungkan.", "success"); };
  clearTimeout(glUndoT);
  glUndoT = setTimeout(() => { const b = el("glUndoBar"); if (b) b.remove(); }, 9000);
}

if (typeof MOD !== "undefined") {
  MOD.galeri = { title: "Pengaturan Galeri", desc: "Galeri Bento bertahap beranda", render: renderGaleri };
}

(function glNav() {
  const nav = el("nav");
  if (!nav || nav.querySelector('[data-nav="galeri"]')) return;
  const anchor = nav.querySelector('[data-nav="kegiatan"]') || nav.querySelector('[data-nav="slider"]') || nav.querySelector('[data-nav="biaya"]');
  const html = '<a href="#/galeri" data-nav="galeri" class="navlink flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800"><i data-lucide="layout-grid" class="w-4 h-4"></i>Pengaturan Galeri</a>';
  if (anchor) anchor.insertAdjacentHTML("afterend", html);
  else {
    const g = document.createElement("div");
    g.innerHTML = '<div class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Konten Website</div>' + html;
    const sistem = [...nav.children].find(c => c.textContent.trim().startsWith("Sistem"));
    nav.insertBefore(g, sistem || null);
  }
  refreshIcons();
})();

window.addEventListener("hashchange", () => {
  if (location.hash.replace("#/", "") !== "galeri") {
    glAuto = false;
    if (glAnimRaf) { cancelAnimationFrame(glAnimRaf); glAnimRaf = 0; }
  }
});

if (location.hash.replace("#/", "") === "galeri" && typeof route === "function") route();
})();
