// ============================================================
// admin-slider.js — CMS "Hero Slider" (data/slider.json)
// Konfigurasi live (8 kontrol) + CRUD slide: cari, filter, sort,
// drawer + pratinjau, drag urutkan, pilih massal, undo, saved views.
// ============================================================
const SL_ACC = {
  emerald: { hex: "#10b981", glow: "16,185,129", label: "Emerald" },
  amber: { hex: "#f59e0b", glow: "245,158,11", label: "Amber" },
  sky: { hex: "#0ea5e9", glow: "14,165,233", label: "Sky" },
  violet: { hex: "#8b5cf6", glow: "139,92,246", label: "Violet" },
  rose: { hex: "#f43f5e", glow: "244,63,94", label: "Rose" },
  teal: { hex: "#14b8a6", glow: "20,184,166", label: "Teal" }
};
const SL_DEF_CFG = { autoplay: true, durasi: 7000, efek: "slide", tinggi: "full", dots: true, panah: true, pause_on_hover: true, kenburns: true };
const SL_VKEY = "sl_saved_views";
const slAcc = a => SL_ACC[a] || SL_ACC.emerald;

// Halaman tujuan slider: beranda + 4 halaman jenjang. Tiap slide punya field "halaman"; konfigurasi per halaman di "configs".
const SL_PAGES = [["beranda", "Beranda", "index"], ["sd", "SD", "sd"], ["smp", "SMP", "smp"], ["sma", "SMA", "sma"], ["smk", "SMK", "smk"]];
const slPageLabel = h => (SL_PAGES.find(p => p[0] === h) || SL_PAGES[0])[1];
let slCfg = { ...SL_DEF_CFG }, slRows = [], slView = { q: "", acc: "", status: "", sort: "urutan", hal: "beranda" };
let slAll = [], slOther = [], slCfgs = {};   // slRows = slide milik halaman terpilih; slOther = slide halaman lain
function slSplit(hal) {
  slView.hal = SL_PAGES.some(p => p[0] === hal) ? hal : "beranda";
  slRows = slAll.filter(r => (r.halaman || "beranda") === slView.hal);
  slOther = slAll.filter(r => (r.halaman || "beranda") !== slView.hal);
  slCfg = { ...SL_DEF_CFG, ...(slCfgs.beranda || {}), ...(slCfgs[slView.hal] || {}) };
}
function slJoin() {
  slRows.forEach(r => { r.halaman = slView.hal; });
  slAll = [...slOther, ...slRows];
  slCfgs[slView.hal] = { ...slCfg };
}
const slPayload = () => { slJoin(); return { config: slCfgs.beranda || { ...SL_DEF_CFG }, configs: slCfgs, slides: slAll }; };
let slSel = new Set(), slUndo = null, slUndoT = null, slDragId = null, slOrderDirty = false, slPvI = 0, slPvT = null;

const slNorm = () => slRows.forEach((r, i) => r.urutan = i + 1);
const slSorted = () => slRows.slice().sort((a, b) => (a.urutan || 99) - (b.urutan || 99));
const slPublished = () => slSorted().filter(r => r.status === "Tampil");
const slViews = () => { try { return JSON.parse(localStorage.getItem(SL_VKEY)) || []; } catch (e) { return []; } };
const slSetViews = v => localStorage.setItem(SL_VKEY, JSON.stringify(v));
const slMeta = m => Array.isArray(m) ? m : String(m || "").split(",").map(x => x.trim()).filter(Boolean);
function slFiltered() {
  let r = slSorted();
  if (slView.acc) r = r.filter(x => x.accent === slView.acc);
  if (slView.status) r = r.filter(x => (x.status || "Draft") === slView.status);
  if (slView.q) { const q = slView.q.toLowerCase(); r = r.filter(x => JSON.stringify(x).toLowerCase().includes(q)); }
  if (slView.sort === "judul") r.sort((a, b) => String(a.judul).localeCompare(String(b.judul)));
  if (slView.sort === "durasi") r.sort((a, b) => (b.durasi || 0) - (a.durasi || 0));
  return r;
}
function slStopPv() { if (slPvT) { clearInterval(slPvT); slPvT = null; } }

function slSlideHTML(s, mini) {
  const a = slAcc(s.accent), ov = Math.max(20, Math.min(92, +s.overlay || 70)) / 100;
  const center = s.align === "center";
  const scrim = center
    ? "linear-gradient(to top, rgba(2,6,23," + ov + ") 0%, rgba(2,6,23," + (ov * .82).toFixed(2) + ") 48%, rgba(2,6,23," + (ov * .5).toFixed(2) + ") 100%)"
    : "linear-gradient(100deg, rgba(2,6,23," + ov + ") 0%, rgba(2,6,23," + (ov * .78).toFixed(2) + ") 46%, rgba(2,6,23," + (ov * .22).toFixed(2) + ") 100%)";
  const meta = slMeta(s.meta);
  const T = mini ? { eye: "text-[9px] px-2 py-0.5", h: "text-base md:text-xl", sub: "text-[11px]", desc: "text-[10px] line-clamp-2", btn: "text-[10px] px-3 py-1.5", chip: "text-[9px] px-2 py-0.5", pad: "p-4 pb-8" }
                 : { eye: "text-[11px] px-3 py-1", h: "text-2xl md:text-4xl", sub: "text-sm", desc: "text-xs md:text-sm line-clamp-3", btn: "text-xs px-4 py-2", chip: "text-[10px] px-2.5 py-1", pad: "p-6 pb-12" };
  const cta = (l, h, p) => !l || !h ? "" : '<span class="inline-flex items-center gap-1.5 rounded-lg font-bold ' + T.btn + " " + (p ? "text-slate-900" : "bg-white/15 border border-white/35 text-white") + '" ' + (p ? 'style="background:' + a.hex + '"' : "") + ">" + esc(l) + (p ? " →" : " ›") + "</span>";
  return '<div class="absolute inset-0" style="background:linear-gradient(135deg,' + a.hex + ',#0f172a)"></div>' +
    '<img src="' + esc(s.gambar || "") + '" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display=\'none\'" alt="">' +
    '<div class="absolute inset-0" style="background:' + scrim + '"></div>' +
    '<div class="absolute inset-0 opacity-60" style="background:radial-gradient(60% 55% at 18% 28%, rgba(' + a.glow + ',.42), transparent 62%),radial-gradient(45% 45% at 84% 76%, rgba(' + a.glow + ',.28), transparent 66%)"></div>' +
    '<div class="relative h-full flex ' + (center ? "items-center justify-center text-center" : "items-center") + ' ' + T.pad + '">' +
      '<div class="' + (center ? "max-w-2xl" : "max-w-xl") + '">' +
        (s.eyebrow ? '<span class="inline-block rounded-full font-bold uppercase tracking-wider text-slate-900 ' + T.eye + '" style="background:' + a.hex + '">' + esc(s.eyebrow) + "</span>" : "") +
        '<h3 class="font-extrabold text-white leading-tight mt-2 ' + T.h + '">' + esc(s.judul || "Judul slide") + (s.highlight ? ' <span style="color:' + a.hex + '">' + esc(s.highlight) + "</span>" : "") + "</h3>" +
        (s.subjudul ? '<p class="text-white/90 font-semibold mt-1.5 ' + T.sub + '">' + esc(s.subjudul) + "</p>" : "") +
        (s.deskripsi ? '<p class="text-white/75 mt-1.5 ' + T.desc + '">' + esc(s.deskripsi) + "</p>" : "") +
        '<div class="mt-3 flex flex-wrap gap-2 ' + (center ? "justify-center" : "") + '">' + cta(s.cta1_label, s.cta1_href, true) + cta(s.cta2_label, s.cta2_href, false) + "</div>" +
        (meta.length ? '<div class="mt-3 flex flex-wrap gap-1.5 ' + (center ? "justify-center" : "") + '">' + meta.map(m => '<span class="rounded-full bg-white/10 border border-white/20 text-white/85 font-semibold ' + T.chip + '">' + esc(m) + "</span>").join("") + "</div>" : "") +
      "</div></div>";
}

async function renderSlider() {
  slStopPv();
  const raw = await fetchJSON("slider.json").catch(() => ({}));
  const obj = Array.isArray(raw) ? { config: {}, slides: raw } : (raw || {});
  slAll = (Array.isArray(obj.slides) ? obj.slides.slice() : []).map(r => ({ ...r, halaman: r.halaman || "beranda" }));
  slCfgs = { ...(obj.configs || {}) };
  slCfgs.beranda = { ...SL_DEF_CFG, ...(obj.config || {}), ...(slCfgs.beranda || {}) };
  slSplit(slView.hal || "beranda");
  slNorm(); slSel.clear(); slOrderDirty = false; slPvI = 0;
  mem["slider.json"] = slPayload();
  slRender();
}

async function slPersist(aksi, detail, snapCfg, snapRows) {
  const ok = await saveData("slider.json", slPayload(), "Konten Website", aksi + " [" + slPageLabel(slView.hal) + "]", detail);
  if (!ok) { if (snapCfg) slCfg = snapCfg; if (snapRows) slRows = snapRows; slRender(); }
  return ok;
}

function slRender() {
  slStopPv();
  const rows = slFiltered(), pub = slPublished();
  const allChecked = rows.length > 0 && rows.every(r => slSel.has(r.id));
  const views = slViews();
  const st = (l, v, c, i) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"><div class="flex items-center gap-2 text-xs font-bold text-slate-500"><i data-lucide="' + i + '" class="w-4 h-4 text-' + c + '-600"></i>' + l + '</div><div class="text-2xl font-extrabold text-' + c + '-600 mt-1">' + v + "</div></div>";
  const tog = (id, label, on, icon) => '<label class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-emerald-300"><span class="flex items-center gap-2 text-xs font-bold text-slate-600"><i data-lucide="' + icon + '" class="w-4 h-4 text-slate-400"></i>' + label + '</span><input type="checkbox" id="' + id + '" ' + (on ? "checked" : "") + ' class="w-5 h-5 accent-emerald-600"></label>';

  const tabs = '<div class="flex flex-wrap items-center gap-2 mb-4" role="tablist" aria-label="Halaman tujuan slider"><span class="text-xs font-bold text-slate-400 uppercase mr-1">Halaman:</span>' +
    SL_PAGES.map(p => { const n = slAll.filter(r => (r.halaman || "beranda") === p[0]).length, on = p[0] === slView.hal;
      return '<button type="button" role="tab" aria-selected="' + on + '" data-slhal="' + p[0] + '" class="px-4 py-2 rounded-xl text-sm font-bold border transition ' + (on ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300") + '">' + p[1] + ' <span class="ml-1 text-[11px] ' + (on ? "text-emerald-100" : "text-slate-400") + '">' + n + '</span></button>'; }).join("") + "</div>";
  app.innerHTML = pageHead({ title: "Hero Slider — Halaman " + slPageLabel(slView.hal), desc: "Slider layar penuh pada halaman " + (slView.hal === "beranda" ? "Beranda (index)" : slPageLabel(slView.hal)) + ". Pilih halaman pada tab di bawah, lalu atur perilaku putar dan kelola slide-nya — setiap halaman punya slide & konfigurasi sendiri. Perubahan langsung ter-commit ke data/slider.json beserta audit log." }) + tabs +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' + st("Total Slide", slRows.length, "slate", "images") + st("Tampil", pub.length, "emerald", "eye") + st("Draft", slRows.length - pub.length, "amber", "eye-off") + st("Durasi Total", Math.round(pub.reduce((a, b) => a + (+b.durasi || slCfg.durasi), 0) / 1000) + "s", "violet", "timer") + "</div>" +

    '<div class="grid lg:grid-cols-5 gap-4 mb-4">' +
      '<div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">' +
        '<div class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100"><i data-lucide="sliders-horizontal" class="w-4 h-4 text-emerald-600"></i><b class="text-sm flex-1">Konfigurasi Slider</b><span class="text-[10px] font-bold text-emerald-600">LIVE</span></div>' +
        '<div class="space-y-2.5">' +
          tog("scAuto", "Putar otomatis", slCfg.autoplay, "play-circle") +
          '<div class="px-3 py-2.5 rounded-xl border border-slate-200"><div class="flex justify-between text-xs font-bold text-slate-600"><span class="flex items-center gap-2"><i data-lucide="timer" class="w-4 h-4 text-slate-400"></i>Durasi default</span><span id="scDurV" class="text-emerald-700">' + (slCfg.durasi / 1000).toFixed(1) + 's</span></div><input id="scDur" type="range" min="2500" max="15000" step="500" value="' + slCfg.durasi + '" class="w-full mt-2 accent-emerald-600"></div>' +
          '<div class="grid grid-cols-2 gap-2.5">' +
            '<label class="block">' + lbl("Efek transisi") + '<select id="scEfek" ' + inp + '><option value="slide" ' + (slCfg.efek === "slide" ? "selected" : "") + '>Slide</option><option value="fade" ' + (slCfg.efek === "fade" ? "selected" : "") + '>Fade</option><option value="zoom" ' + (slCfg.efek === "zoom" ? "selected" : "") + '>Zoom</option></select></label>' +
            '<label class="block">' + lbl("Tinggi hero") + '<select id="scTinggi" ' + inp + '><option value="full" ' + (slCfg.tinggi === "full" ? "selected" : "") + '>Layar penuh</option><option value="medium" ' + (slCfg.tinggi === "medium" ? "selected" : "") + '>Sedang (70vh)</option><option value="compact" ' + (slCfg.tinggi === "compact" ? "selected" : "") + '>Ringkas (520px)</option></select></label>' +
          "</div>" +
          tog("scDots", "Titik navigasi (dot)", slCfg.dots, "circle-dot") +
          tog("scPanah", "Tombol panah", slCfg.panah, "move-horizontal") +
          tog("scHover", "Jeda saat kursor di atas", slCfg.pause_on_hover, "mouse-pointer-2") +
          tog("scKb", "Efek Ken Burns (zoom foto)", slCfg.kenburns, "zoom-in") +
          '<div class="flex flex-wrap gap-2 pt-2">' +
            '<button type="button" id="scSave" ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Simpan Konfigurasi</button>' +
            '<button type="button" id="scReset" ' + btnS + '><i data-lucide="rotate-ccw" class="w-4 h-4"></i>Reset</button>' +
            '<button type="button" id="scShuffle" ' + btnS + '><i data-lucide="shuffle" class="w-4 h-4"></i>Acak Urutan</button>' +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">' +
        '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="monitor-play" class="w-4 h-4 text-emerald-600"></i><b class="text-sm flex-1">Pratinjau Langsung</b><span class="text-[11px] text-slate-400 font-semibold">' + pub.length + " slide aktif</span></div>" +
        '<div id="slPv" class="relative flex-1 min-h-[300px] md:min-h-[360px] bg-slate-950 overflow-hidden"></div>' +
      "</div>" +
    "</div>" +

    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200">' +
      '<div class="p-4 border-b border-slate-100 space-y-3"><div class="flex flex-wrap gap-2 items-center">' +
        '<div class="relative flex-1 min-w-[190px]"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input id="slQ" value="' + esc(slView.q) + '" placeholder="Cari judul, eyebrow, CTA…" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"></div>' +
        '<select id="slAcc" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Semua Warna</option>' + Object.keys(SL_ACC).map(k => '<option value="' + k + '" ' + (slView.acc === k ? "selected" : "") + ">" + SL_ACC[k].label + "</option>").join("") + "</select>" +
        '<select id="slStatus" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Semua Status</option><option ' + (slView.status === "Tampil" ? "selected" : "") + '>Tampil</option><option ' + (slView.status === "Draft" ? "selected" : "") + ">Draft</option></select>" +
        '<select id="slSort" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="urutan" ' + (slView.sort === "urutan" ? "selected" : "") + ">Urutan Tampil</option><option value=\"judul\" " + (slView.sort === "judul" ? "selected" : "") + ">Judul A–Z</option><option value=\"durasi\" " + (slView.sort === "durasi" ? "selected" : "") + ">Durasi Terlama</option></select>" +
        '<button type="button" id="slCsv" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>CSV</button>' +
        '<button type="button" id="slAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Tambah Slide</button>' +
      "</div>" +
      '<div class="flex flex-wrap items-center gap-2 text-xs"><span class="font-bold text-slate-400 uppercase">Saved views:</span>' +
        views.map((v, i) => '<span class="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-slate-100 border border-slate-200"><button type="button" data-sv="' + i + '" class="font-bold text-slate-600 hover:text-emerald-700">' + esc(v.name) + '</button><button type="button" data-svd="' + i + '" class="w-4 h-4 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center">×</button></span>').join("") +
        '<button type="button" id="slSaveView" class="px-2.5 py-1 rounded-full border border-dashed border-slate-300 font-bold text-slate-500 hover:border-emerald-400 hover:text-emerald-700">+ Simpan filter ini</button>' +
        (slOrderDirty ? '<span class="ml-auto inline-flex items-center gap-2"><span class="text-amber-600 font-bold">Urutan berubah</span><button type="button" id="slSaveOrder" ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Simpan Urutan</button></span>' : "") +
      "</div></div>" +
      (slSel.size ? '<div class="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex flex-wrap items-center gap-2 text-sm"><b class="text-emerald-800">' + slSel.size + ' dipilih</b><button type="button" id="slBOn" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">Tampilkan</button><button type="button" id="slBOff" class="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold">Draft</button><button type="button" id="slBDel" class="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold">Hapus</button><button type="button" id="slBClr" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold">Batal pilih</button></div>' : "") +
      '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' +
        '<th class="px-3 py-2 w-8"><input type="checkbox" id="slAll" ' + (allChecked ? "checked" : "") + ' class="accent-emerald-600"></th><th class="px-2 py-2 w-8"></th>' +
        '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Slide</th><th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Warna</th>' +
        '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">CTA</th><th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Durasi</th>' +
        '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Status</th><th class="px-3 py-2 text-xs font-bold uppercase text-slate-500 text-right">Aksi</th>' +
      "</tr></thead><tbody>" +
      (rows.map(r => '<tr draggable="true" data-srow="' + r.id + '" class="border-b border-slate-100 hover:bg-slate-50 ' + (slSel.has(r.id) ? "bg-emerald-50/60" : "") + '">' +
        '<td class="px-3 py-2"><input type="checkbox" data-ssel="' + r.id + '" ' + (slSel.has(r.id) ? "checked" : "") + ' class="accent-emerald-600"></td>' +
        '<td class="px-2 py-2 cursor-grab text-slate-300" title="Seret untuk urutkan"><i data-lucide="grip-vertical" class="w-4 h-4 pointer-events-none"></i></td>' +
        '<td class="px-3 py-2"><div class="flex items-center gap-3"><div class="w-16 h-10 rounded-lg overflow-hidden shrink-0" style="background:linear-gradient(135deg,' + slAcc(r.accent).hex + ',#0f172a)"><img src="' + esc(r.gambar || "") + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'" alt=""></div><div class="min-w-0"><b class="text-sm block truncate max-w-[240px]">' + esc(r.judul) + " " + esc(r.highlight || "") + '</b><span class="text-[11px] text-slate-500">#' + r.urutan + " • " + esc(trunc(r.eyebrow || "-", 28)) + "</span></div></div></td>" +
        '<td class="px-3 py-2"><span class="inline-flex items-center gap-1.5 text-xs font-bold"><i style="width:12px;height:12px;border-radius:99px;background:' + slAcc(r.accent).hex + ';display:inline-block"></i>' + slAcc(r.accent).label + "</span></td>" +
        '<td class="px-3 py-2 text-xs">' + esc(trunc(r.cta1_label || "-", 18)) + '<div class="text-slate-400">' + esc(trunc(r.cta2_label || "-", 18)) + "</div></td>" +
        '<td class="px-3 py-2 text-sm">' + ((+r.durasi || slCfg.durasi) / 1000).toFixed(1) + "s</td>" +
        '<td class="px-3 py-2"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + (r.status === "Tampil" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700") + '">' + esc(r.status || "Draft") + "</span></td>" +
        '<td class="px-3 py-2 text-right whitespace-nowrap">' +
          '<button type="button" data-sedit="' + r.id + '" class="p-1.5 rounded-lg hover:bg-slate-100 text-sky-600" title="Edit"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>' +
          '<button type="button" data-sdupe="' + r.id + '" class="p-1.5 rounded-lg hover:bg-slate-100 text-violet-600" title="Duplikat"><i data-lucide="copy" class="w-4 h-4 pointer-events-none"></i></button>' +
          '<button type="button" data-sdel="' + r.id + '" class="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>' +
        "</td></tr>").join("") || '<tr><td colspan="8" class="px-3 py-10 text-center text-sm text-slate-400">Belum ada slide. Klik “Tambah Slide”.</td></tr>') +
      "</tbody></table></div>" +
      '<div class="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">' + rows.length + " dari " + slRows.length + " slide • sumber: data/slider.json • urutan menentukan tampilan di beranda</div></div>";
  refreshIcons();
  slWire(rows);
  slPreview();
}

function slPreview() {
  const box = document.getElementById("slPv"); if (!box) return;
  const pub = slPublished();
  if (!pub.length) { box.innerHTML = '<div class="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada slide berstatus Tampil.</div>'; return; }
  slPvI = Math.min(slPvI, pub.length - 1);
  const paint = () => {
    const s = pub[slPvI];
    box.innerHTML = slSlideHTML(s, true) +
      '<div class="absolute top-0 inset-x-0 h-[3px] bg-white/15 z-20"><div id="slPvProg" class="h-full w-0" style="background:' + slAcc(s.accent).hex + '"></div></div>' +
      (slCfg.panah ? '<button type="button" id="slPvPrev" class="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center">‹</button><button type="button" id="slPvNext" class="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center">›</button>' : "") +
      (slCfg.dots ? '<div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">' + pub.map((x, i) => '<button type="button" data-pvd="' + i + '" class="rounded-full transition-all" style="height:8px;width:' + (i === slPvI ? 34 : 8) + 'px;background:' + (i === slPvI ? slAcc(s.accent).hex : "rgba(255,255,255,.4)") + '"></button>').join("") + "</div>" : "") +
      '<span class="absolute top-3 right-3 z-20 text-[10px] font-mono text-white/80 bg-black/30 px-2 py-0.5 rounded-full">' + String(slPvI + 1).padStart(2, "0") + " / " + String(pub.length).padStart(2, "0") + "</span>";
    const pv = document.getElementById("slPvPrev"), nx = document.getElementById("slPvNext");
    if (pv) pv.onclick = () => { slPvI = (slPvI - 1 + pub.length) % pub.length; paint(); };
    if (nx) nx.onclick = () => { slPvI = (slPvI + 1) % pub.length; paint(); };
    box.querySelectorAll("[data-pvd]").forEach(b => b.onclick = () => { slPvI = +b.dataset.pvd; paint(); });
  };
  paint();
  slStopPv();
  if (slCfg.autoplay && pub.length > 1) {
    const dur = Math.max(2500, +pub[slPvI].durasi || slCfg.durasi);
    let el = 0;
    slPvT = setInterval(() => {
      el += 100;
      const bar = document.getElementById("slPvProg");
      const d = Math.max(2500, +pub[slPvI].durasi || slCfg.durasi);
      if (bar) bar.style.width = Math.min(100, el / d * 100) + "%";
      if (el >= d) { el = 0; slPvI = (slPvI + 1) % pub.length; paint(); }
    }, 100);
  }
}

function slWire(rows) {
  const cfgLive = () => {
    slCfg.autoplay = document.getElementById("scAuto").checked;
    slCfg.durasi = +document.getElementById("scDur").value;
    slCfg.efek = document.getElementById("scEfek").value;
    slCfg.tinggi = document.getElementById("scTinggi").value;
    slCfg.dots = document.getElementById("scDots").checked;
    slCfg.panah = document.getElementById("scPanah").checked;
    slCfg.pause_on_hover = document.getElementById("scHover").checked;
    slCfg.kenburns = document.getElementById("scKb").checked;
    document.getElementById("scDurV").textContent = (slCfg.durasi / 1000).toFixed(1) + "s";
    slPreview();
  };
  ["scAuto", "scDur", "scEfek", "scTinggi", "scDots", "scPanah", "scHover", "scKb"].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.oninput = cfgLive; el.onchange = cfgLive;
  });
  document.getElementById("scSave").onclick = async () => { await slPersist("UPDATE KONFIGURASI SLIDER", "Efek " + slCfg.efek + " • durasi " + slCfg.durasi + "ms", null, null); };
  document.getElementById("scReset").onclick = () => { slCfg = { ...SL_DEF_CFG }; slRender(); toast("Konfigurasi dikembalikan ke default — klik Simpan untuk menyimpan.", "info"); };
  document.getElementById("scShuffle").onclick = () => {
    const snap = slRows.map(r => ({ ...r }));
    for (let i = slRows.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = slRows[i]; slRows[i] = slRows[j]; slRows[j] = t; }
    slNorm(); slOrderDirty = true; slView.sort = "urutan"; slRender();
    toast("Urutan diacak — klik Simpan Urutan untuk menyimpan.", "info");
    void snap;
  };
  const so = document.getElementById("slSaveOrder");
  if (so) so.onclick = async () => { const snap = slRows.map(r => ({ ...r })); slOrderDirty = false; slRender(); await slPersist("URUTKAN SLIDER", "Urutan hero slider diperbarui", null, snap); };

  const q = document.getElementById("slQ");
  if (q) q.oninput = e => { slView.q = e.target.value; slRender(); const n = document.getElementById("slQ"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } };
  [["slAcc", "acc"], ["slStatus", "status"], ["slSort", "sort"]].forEach(([id, k]) => { const el = document.getElementById(id); if (el) el.onchange = e => { slView[k] = e.target.value; slRender(); }; });
  document.getElementById("slAdd").onclick = () => slDrawer(null);
  document.getElementById("slCsv").onclick = () => download("hero-slider.csv", toCSV(slSorted(), [{ k: "urutan", l: "urutan" }, { k: "eyebrow", l: "eyebrow" }, { k: "judul", l: "judul" }, { k: "highlight", l: "highlight" }, { k: "subjudul", l: "subjudul" }, { k: "accent", l: "accent" }, { k: "cta1_label", l: "cta1_label" }, { k: "cta1_href", l: "cta1_href" }, { k: "durasi", l: "durasi_ms" }, { k: "status", l: "status" }]), "text/csv");
  const sv = document.getElementById("slSaveView");
  if (sv) sv.onclick = () => { const n = prompt("Nama saved view:", "Slide " + (slView.acc || slView.status || "Semua")); if (!n) return; const v = slViews(); v.push({ name: n.slice(0, 28), view: { ...slView } }); slSetViews(v); slRender(); toast("Saved view tersimpan di perangkat ini.", "success"); };
  app.querySelectorAll("[data-sv]").forEach(b => b.onclick = () => { slView = { ...slViews()[+b.dataset.sv].view, hal: slView.hal }; slRender(); });
  app.querySelectorAll("[data-svd]").forEach(b => b.onclick = () => { const v = slViews(); v.splice(+b.dataset.svd, 1); slSetViews(v); slRender(); });

  const all = document.getElementById("slAll");
  if (all) all.onchange = e => { rows.forEach(r => e.target.checked ? slSel.add(r.id) : slSel.delete(r.id)); slRender(); };
  app.querySelectorAll("[data-ssel]").forEach(c => c.onchange = e => { e.target.checked ? slSel.add(c.dataset.ssel) : slSel.delete(c.dataset.ssel); slRender(); });
  const bulk = async (fn, aksi) => { if (!slSel.size) return; const snap = slRows.map(r => ({ ...r })); const n = slSel.size; slRows.forEach(r => { if (slSel.has(r.id)) fn(r); }); slSel.clear(); slRender(); await slPersist(aksi, n + " slide diperbarui", null, snap); };
  const b1 = document.getElementById("slBOn"); if (b1) b1.onclick = () => bulk(r => r.status = "Tampil", "PUBLIKASI SLIDE");
  const b2 = document.getElementById("slBOff"); if (b2) b2.onclick = () => bulk(r => r.status = "Draft", "DRAFT SLIDE");
  const b3 = document.getElementById("slBClr"); if (b3) b3.onclick = () => { slSel.clear(); slRender(); };
  const b4 = document.getElementById("slBDel");
  if (b4) b4.onclick = () => {
    if (!confirm("Hapus " + slSel.size + " slide terpilih?")) return;
    const rm = slRows.filter(r => slSel.has(r.id)).map(r => ({ ...r }));
    slRows = slRows.filter(r => !slSel.has(r.id)); slNorm(); slSel.clear(); slRender(); slUndoShow(rm);
    slPersist("HAPUS MASSAL SLIDE", rm.length + " slide dihapus", null, null);
  };
  app.querySelectorAll("[data-slhal]").forEach(b => b.onclick = () => {
    if (b.dataset.slhal === slView.hal) return;
    slJoin(); slStopPv(); slSplit(b.dataset.slhal); slNorm(); slSel.clear(); slOrderDirty = false; slPvI = 0; slRender();
  });
  app.querySelectorAll("[data-sedit]").forEach(b => b.onclick = () => slDrawer(slRows.find(r => r.id === b.dataset.sedit)));
  app.querySelectorAll("[data-sdupe]").forEach(b => b.onclick = async () => {
    const s = slRows.find(r => r.id === b.dataset.sdupe); if (!s) return;
    const snap = slRows.map(r => ({ ...r }));
    slRows.splice(slRows.findIndex(r => r.id === s.id) + 1, 0, { ...s, id: uid(), judul: s.judul + " (Salinan)", status: "Draft" });
    slNorm(); slRender(); await slPersist("DUPLIKAT SLIDE", s.judul, null, snap);
  });
  app.querySelectorAll("[data-sdel]").forEach(b => b.onclick = () => {
    const r = slRows.find(x => x.id === b.dataset.sdel); if (!r || !confirm('Hapus slide "' + r.judul + '"?')) return;
    const snap = slRows.map(x => ({ ...x }));
    slRows = slRows.filter(x => x.id !== r.id); slNorm(); slRender(); slUndoShow([{ ...r }]);
    slPersist("HAPUS SLIDE", r.judul, null, snap);
  });
  app.querySelectorAll("[data-srow]").forEach(tr => {
    tr.ondragstart = e => { slDragId = tr.dataset.srow; tr.classList.add("opacity-40"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", slDragId); } catch (err) {} };
    tr.ondragend = () => { tr.classList.remove("opacity-40"); app.querySelectorAll("[data-srow]").forEach(x => x.classList.remove("ring-2", "ring-emerald-400")); };
    tr.ondragover = e => { e.preventDefault(); tr.classList.add("ring-2", "ring-emerald-400"); };
    tr.ondragleave = () => tr.classList.remove("ring-2", "ring-emerald-400");
    tr.ondrop = e => {
      e.preventDefault();
      const t = tr.dataset.srow; if (!slDragId || slDragId === t) return;
      const o = slSorted(), f = o.findIndex(r => r.id === slDragId), to = o.findIndex(r => r.id === t);
      if (f < 0 || to < 0) return;
      const m = o.splice(f, 1)[0]; o.splice(to, 0, m);
      slRows = o; slNorm(); slOrderDirty = true; slDragId = null; slView.sort = "urutan"; slRender();
      toast("Urutan dipindahkan — klik “Simpan Urutan”.", "info");
    };
  });
}

function slUndoShow(items) {
  slUndo = items;
  let bar = document.getElementById("slUndoBar");
  if (!bar) { bar = document.createElement("div"); bar.id = "slUndoBar"; document.body.appendChild(bar); }
  bar.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-sm";
  bar.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 text-rose-400"></i><span>' + items.length + ' slide dihapus</span><button type="button" id="slUndoBtn" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-900">Urungkan</button>';
  refreshIcons();
  document.getElementById("slUndoBtn").onclick = async () => {
    if (!slUndo) return; const back = slUndo; slUndo = null;
    slRows = slRows.concat(back); slNorm(); slRender();
    const b = document.getElementById("slUndoBar"); if (b) b.remove();
    await slPersist("URUNGKAN HAPUS SLIDE", back.length + " slide dipulihkan", null, null);
  };
  clearTimeout(slUndoT);
  slUndoT = setTimeout(() => { const b = document.getElementById("slUndoBar"); if (b) b.remove(); slUndo = null; }, 9000);
}

function slDrawer(row) {
  let d = document.getElementById("slDrawer");
  if (!d) {
    d = document.createElement("div"); d.id = "slDrawer"; d.className = "hidden fixed inset-0 z-[80]";
    d.innerHTML = '<div data-scrim class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div><aside class="absolute right-0 inset-y-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col">' +
      '<div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><i data-lucide="image" class="w-5 h-5"></i></div><b data-title class="flex-1 font-extrabold text-slate-800">Slide</b><button type="button" data-close class="p-2 rounded-lg hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button></div>' +
      '<form data-form class="flex-1 overflow-y-auto p-5 space-y-4"></form>' +
      '<div class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2"><button type="button" data-close class="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 hover:bg-slate-50">Batal</button><button type="button" data-submit class="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Simpan Slide</button></div></aside>';
    document.body.appendChild(d);
    d.querySelectorAll("[data-close]").forEach(b => b.onclick = () => d.classList.add("hidden"));
    d.querySelector("[data-scrim]").onclick = () => d.classList.add("hidden");
    d.querySelector("[data-submit]").onclick = () => d.querySelector("[data-form]").requestSubmit();
    refreshIcons();
  }
  d.querySelector("[data-title]").textContent = row ? "Edit Slide" : "Tambah Slide";
  const v = row || { eyebrow: "", judul: "", highlight: "", subjudul: "", deskripsi: "", gambar: "", accent: "emerald", overlay: 70, align: "left", cta1_label: "Register Now", cta1_href: "ppdb.html", cta2_label: "", cta2_href: "", meta: [], durasi: slCfg.durasi, urutan: slRows.length + 1, status: "Tampil" };
  const f = d.querySelector("[data-form]");
  f.innerHTML = '<div><div class="text-[11px] font-bold text-slate-400 uppercase mb-1">Pratinjau slide</div><div id="slDPv" class="relative h-56 rounded-2xl overflow-hidden bg-slate-950"></div></div>' +
    '<label class="block">' + lbl("Eyebrow / label atas") + '<input name="eyebrow" value="' + esc(v.eyebrow) + '" ' + inp + "></label>" +
    '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block">' + lbl("Judul *") + '<input name="judul" required value="' + esc(v.judul) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Kata berwarna (highlight)") + '<input name="highlight" value="' + esc(v.highlight) + '" ' + inp + "></label>" +
    "</div>" +
    '<label class="block">' + lbl("Subjudul") + '<input name="subjudul" value="' + esc(v.subjudul) + '" ' + inp + "></label>" +
    '<label class="block">' + lbl("Deskripsi") + '<textarea name="deskripsi" rows="3" ' + inp + ">" + esc(v.deskripsi) + "</textarea></label>" +
    '<label class="block">' + lbl("URL Gambar Latar") + '<input name="gambar" value="' + esc(v.gambar) + '" placeholder="https://…" ' + inp + "></label>" +
    '<div class="grid sm:grid-cols-3 gap-3">' +
      '<label class="block">' + lbl("Warna aksen") + '<select name="accent" ' + inp + ">" + Object.keys(SL_ACC).map(k => '<option value="' + k + '" ' + (v.accent === k ? "selected" : "") + ">" + SL_ACC[k].label + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Perataan teks") + '<select name="align" ' + inp + '><option value="left" ' + (v.align !== "center" ? "selected" : "") + '>Kiri</option><option value="center" ' + (v.align === "center" ? "selected" : "") + '>Tengah</option></select></label>' +
      '<label class="block">' + lbl("Status") + '<select name="status" ' + inp + '><option ' + (v.status === "Tampil" ? "selected" : "") + '>Tampil</option><option ' + (v.status === "Draft" ? "selected" : "") + ">Draft</option></select></label>" +
    "</div>" +
    '<div><div class="flex justify-between text-xs font-semibold text-slate-600"><span>Kegelapan overlay</span><span id="slOvV" class="text-emerald-700 font-bold">' + v.overlay + '%</span></div><input name="overlay" type="range" min="20" max="92" value="' + v.overlay + '" class="w-full mt-2 accent-emerald-600"></div>' +
    '<div class="grid sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">' +
      '<label class="block">' + lbl("Tombol 1 — teks") + '<input name="cta1_label" value="' + esc(v.cta1_label) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Tombol 1 — tautan") + '<input name="cta1_href" value="' + esc(v.cta1_href) + '" placeholder="ppdb.html / #kegiatan / #tour" ' + inp + "></label>" +
      '<label class="block">' + lbl("Tombol 2 — teks") + '<input name="cta2_label" value="' + esc(v.cta2_label) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Tombol 2 — tautan") + '<input name="cta2_href" value="' + esc(v.cta2_href) + '" ' + inp + "></label>" +
    "</div>" +
    '<label class="block">' + lbl("Chip info (pisahkan koma)") + '<input name="meta" value="' + esc(slMeta(v.meta).join(", ")) + '" ' + inp + "></label>" +
    '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block">' + lbl("Durasi tampil (ms)") + '<input name="durasi" type="number" min="2500" max="20000" step="500" value="' + (v.durasi || slCfg.durasi) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Urutan") + '<input name="urutan" type="number" min="1" value="' + (v.urutan || 1) + '" ' + inp + "></label>" +
    "</div>" +
    '<p class="text-[11px] text-slate-500">Tautan khusus: <code>#tour</code> membuka modal Virtual Tour; <code>#kegiatan</code>, <code>#program</code>, <code>#profil</code> menggulir ke seksi beranda.</p>';
  const read = () => {
    const o = Object.fromEntries(new FormData(f).entries());
    return { ...o, overlay: +o.overlay, durasi: +o.durasi, meta: slMeta(o.meta) };
  };
  const sync = () => { document.getElementById("slDPv").innerHTML = slSlideHTML(read(), true); document.getElementById("slOvV").textContent = f.overlay.value + "%"; };
  f.querySelectorAll("input,select,textarea").forEach(i => { i.oninput = sync; i.onchange = sync; });
  sync(); refreshIcons();
  f.onsubmit = async e => {
    e.preventDefault();
    const o = read();
    const rec = { id: row ? row.id : uid(), halaman: slView.hal, urutan: +o.urutan || 1, eyebrow: o.eyebrow.trim(), judul: o.judul.trim(), highlight: o.highlight.trim(), subjudul: o.subjudul.trim(), deskripsi: o.deskripsi.trim(), gambar: o.gambar.trim(), accent: o.accent, overlay: o.overlay, align: o.align, cta1_label: o.cta1_label.trim(), cta1_href: o.cta1_href.trim(), cta2_label: o.cta2_label.trim(), cta2_href: o.cta2_href.trim(), meta: o.meta, durasi: Math.max(2500, o.durasi || slCfg.durasi), status: o.status };
    const snap = slRows.map(r => ({ ...r }));
    const ordered = slSorted().filter(r => r.id !== rec.id);
    ordered.splice(Math.max(0, Math.min(ordered.length, rec.urutan - 1)), 0, rec);
    slRows = ordered; slNorm();
    d.classList.add("hidden"); slRender();
    await slPersist(row ? "EDIT SLIDE" : "TAMBAH SLIDE", rec.judul + " " + rec.highlight, null, snap);
  };
  d.classList.remove("hidden");
  setTimeout(() => f.judul.focus(), 60);
}

MOD.slider = { title: "Hero Slider", desc: "Slider layar penuh beranda", render: renderSlider };

(function slNav() {
  const nav = document.getElementById("nav");
  if (!nav || nav.querySelector('[data-nav="slider"]')) return;
  const anchor = nav.querySelector('[data-nav="kegiatan"]') || nav.querySelector('[data-nav="biaya"]');
  const html = '<a href="#/slider" data-nav="slider" class="navlink flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800"><i data-lucide="gallery-horizontal-end" class="w-4 h-4"></i>Hero Slider</a>';
  if (anchor) anchor.insertAdjacentHTML("afterend", html);
  else {
    const g = document.createElement("div");
    g.innerHTML = '<div class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Konten Website</div>' + html;
    const sistem = [...nav.children].find(c => c.textContent.trim().startsWith("Sistem"));
    nav.insertBefore(g, sistem || null);
  }
  refreshIcons();
})();

window.addEventListener("hashchange", () => { if (location.hash.replace("#/", "") !== "slider") slStopPv(); });
if (location.hash.replace("#/", "") === "slider") route();