// ============================================================
// admin-kegiatan.js — CMS "Kegiatan Sekolah" (Konten Website)
// CRUD penuh: cari, filter, sort, drawer create/edit, hapus + undo,
// pilih massal, drag urutkan, saved views, pratinjau bento, export.
// Semua mutasi -> saveData('kegiatan.json') -> pushJSON + audit log.
// ============================================================
const KG_CATS = ["Akademik", "Olahraga", "Seni & Budaya", "Keagamaan", "Sosial & Lingkungan", "Literasi", "Teknologi", "Pramuka", "Kewirausahaan"];
const KG_SPAN = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-1", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-1", "col-span-2 row-span-1", "col-span-2 row-span-1"];
const KG_VKEY = "kg_saved_views";

let kgRows = [];
let kgView = { q: "", kat: "", status: "", sort: "urutan" };
let kgSel = new Set();
let kgPreview = false;
let kgOrderDirty = false;
let kgUndo = null;
let kgUndoTimer = null;
let kgDragId = null;
let kgEditId = null;

const kgBadge = s => '<span class="px-2 py-0.5 rounded-full text-xs font-medium ' + (s === "Tampil" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700") + '">' + esc(s || "Draft") + "</span>";
const kgNorm = () => { kgRows.forEach((r, i) => r.urutan = i + 1); };
const kgSorted = () => kgRows.slice().sort((a, b) => (a.urutan || 99) - (b.urutan || 99));
const kgFiltered = () => {
  let r = kgSorted();
  if (kgView.kat) r = r.filter(x => x.kategori === kgView.kat);
  if (kgView.status) r = r.filter(x => (x.status || "Draft") === kgView.status);
  if (kgView.q) { const q = kgView.q.toLowerCase(); r = r.filter(x => JSON.stringify(x).toLowerCase().includes(q)); }
  if (kgView.sort === "tanggal") r.sort((a, b) => String(b.tanggal || "").localeCompare(String(a.tanggal || "")));
  if (kgView.sort === "judul") r.sort((a, b) => String(a.judul || "").localeCompare(String(b.judul || "")));
  if (kgView.sort === "kategori") r.sort((a, b) => String(a.kategori || "").localeCompare(String(b.kategori || "")));
  return r;
};
const kgViews = () => { try { return JSON.parse(localStorage.getItem(KG_VKEY)) || []; } catch (e) { return []; } };
const kgSetViews = v => localStorage.setItem(KG_VKEY, JSON.stringify(v));

async function kgPersist(aksi, detail, snapshot) {
  const ok = await saveData("kegiatan.json", kgRows, "Konten Website", aksi, detail);
  if (!ok && snapshot) { kgRows = snapshot; kgRender(); }
  return ok;
}

async function renderKegiatan() {
  const data = await fetchJSON("kegiatan.json").catch(() => []);
  kgRows = Array.isArray(data) ? data.slice() : [];
  kgNorm();
  mem["kegiatan.json"] = kgRows;
  kgSel.clear(); kgOrderDirty = false;
  kgRender();
}

function kgStats() {
  const tampil = kgRows.filter(r => r.status === "Tampil").length;
  const draft = kgRows.length - tampil;
  const ung = kgRows.filter(r => r.unggulan).length;
  const s = (l, v, c, i) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"><div class="flex items-center gap-2 text-xs font-bold text-slate-500"><i data-lucide="' + i + '" class="w-4 h-4 text-' + c + '-600"></i>' + l + '</div><div class="text-2xl font-extrabold text-' + c + '-600 mt-1">' + v + "</div></div>";
  return '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' + s("Total Kegiatan", kgRows.length, "slate", "images") + s("Tampil di Web", tampil, "emerald", "eye") + s("Draft", draft, "amber", "eye-off") + s("Unggulan", ung, "violet", "star") + "</div>";
}

function kgBentoPreview() {
  const list = kgSorted().filter(r => r.status === "Tampil");
  if (!list.length) return '<div class="p-8 text-center text-sm text-slate-400">Belum ada kegiatan berstatus Tampil.</div>';
  return '<div class="grid grid-cols-2 lg:grid-cols-4 auto-rows-[110px] lg:auto-rows-[140px] gap-3 grid-flow-dense">' + list.map((k, i) =>
    '<div class="relative overflow-hidden rounded-2xl ring-1 ring-slate-900/10 ' + (KG_SPAN[i] || "col-span-1 row-span-1") + '">' +
    '<div class="w-full h-full" style="background:linear-gradient(135deg,#16a34a,#0d9488)"><img src="' + esc(k.foto || "") + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'" alt=""></div>' +
    '<div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>' +
    '<span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-emerald-800 text-[9px] font-bold uppercase">' + esc(k.kategori || "") + '</span>' +
    '<div class="absolute bottom-0 inset-x-0 p-2.5 text-white"><div class="text-[9px] text-amber-300 font-semibold">' + esc(fmtTgl(k.tanggal)) + '</div><div class="font-bold leading-snug ' + (i === 0 ? "text-sm" : "text-[11px] line-clamp-2") + '">' + esc(k.judul) + "</div></div></div>"
  ).join("") + "</div>";
}

function kgRender() {
  const rows = kgFiltered();
  const allChecked = rows.length > 0 && rows.every(r => kgSel.has(r.id));
  const views = kgViews();

  app.innerHTML = pageHead({ title: "Kegiatan Sekolah", desc: "Kelola galeri Bento 9 kartu pada halaman publik (index.html → Aktivitas & Kegiatan Sekolah). Setiap perubahan langsung ter-commit ke data/kegiatan.json beserta audit log." }) +
    kgStats() +
    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200">' +
      '<div class="p-4 border-b border-slate-100 space-y-3">' +
        '<div class="flex flex-wrap gap-2 items-center">' +
          '<div class="relative flex-1 min-w-[200px]"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input id="kgQ" value="' + esc(kgView.q) + '" placeholder="Cari judul, kategori, lokasi…" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"></div>' +
          '<select id="kgKat" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Semua Kategori</option>' + KG_CATS.map(c => '<option ' + (kgView.kat === c ? "selected" : "") + ">" + esc(c) + "</option>").join("") + "</select>" +
          '<select id="kgStatus" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Semua Status</option><option ' + (kgView.status === "Tampil" ? "selected" : "") + ">Tampil</option><option " + (kgView.status === "Draft" ? "selected" : "") + ">Draft</option></select>' +
          '<select id="kgSort" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="urutan" ' + (kgView.sort === "urutan" ? "selected" : "") + ">Urutan Bento</option><option value="tanggal" ' + (kgView.sort === "tanggal" ? "selected" : "") + ">Tanggal Terbaru</option><option value="judul" ' + (kgView.sort === "judul" ? "selected" : "") + ">Judul A–Z</option><option value="kategori" ' + (kgView.sort === "kategori" ? "selected" : "") + ">Kategori</option></select>' +
          '<button type="button" id="kgPrev" ' + btnS + '><i data-lucide="' + (kgPreview ? "list" : "layout-grid") + '" class="w-4 h-4"></i>' + (kgPreview ? "Tabel" : "Pratinjau Bento") + "</button>" +
          '<button type="button" id="kgCsv" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>CSV</button>' +
          '<button type="button" id="kgAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Tambah Kegiatan</button>' +
        "</div>" +
        '<div class="flex flex-wrap items-center gap-2 text-xs">' +
          '<span class="font-bold text-slate-400 uppercase">Saved views:</span>' +
          views.map((v, i) => '<span class="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-slate-100 border border-slate-200"><button type="button" data-view="' + i + '" class="font-bold text-slate-600 hover:text-emerald-700">' + esc(v.name) + '</button><button type="button" data-viewdel="' + i + '" class="w-4 h-4 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center">×</button></span>').join("") +
          '<button type="button" id="kgSaveView" class="px-2.5 py-1 rounded-full border border-dashed border-slate-300 font-bold text-slate-500 hover:border-emerald-400 hover:text-emerald-700">+ Simpan filter ini</button>' +
          (kgOrderDirty ? '<span class="ml-auto inline-flex items-center gap-2"><span class="text-amber-600 font-bold">Urutan berubah (belum disimpan)</span><button type="button" id="kgSaveOrder" ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Simpan Urutan</button></span>' : "") +
        "</div>" +
      "</div>" +
      (kgSel.size ? '<div class="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex flex-wrap items-center gap-2 text-sm"><b class="text-emerald-800">' + kgSel.size + ' dipilih</b><button type="button" id="kgBulkOn" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">Tampilkan</button><button type="button" id="kgBulkOff" class="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold">Jadikan Draft</button><button type="button" id="kgBulkDel" class="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold">Hapus</button><button type="button" id="kgBulkClear" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold">Batal pilih</button></div>' : "") +
      (kgPreview
        ? '<div class="p-4">' + kgBentoPreview() + "</div>"
        : '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' +
          '<th class="px-3 py-2 w-8"><input type="checkbox" id="kgAll" ' + (allChecked ? "checked" : "") + ' class="accent-emerald-600"></th>' +
          '<th class="px-2 py-2 w-8"></th>' +
          '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Kegiatan</th>' +
          '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Tanggal</th>' +
          '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Lokasi</th>' +
          '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Status</th>' +
          '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500 text-center">Unggulan</th>' +
          '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500 text-right">Aksi</th>' +
          "</tr></thead><tbody>" +
          (rows.map(r =>
            '<tr draggable="true" data-row="' + r.id + '" class="border-b border-slate-100 hover:bg-slate-50 ' + (kgSel.has(r.id) ? "bg-emerald-50/60" : "") + '">' +
            '<td class="px-3 py-2"><input type="checkbox" data-sel="' + r.id + '" ' + (kgSel.has(r.id) ? "checked" : "") + ' class="accent-emerald-600"></td>' +
            '<td class="px-2 py-2 cursor-grab text-slate-300" title="Seret untuk mengubah urutan"><i data-lucide="grip-vertical" class="w-4 h-4 pointer-events-none"></i></td>' +
            '<td class="px-3 py-2"><div class="flex items-center gap-3"><div class="w-12 h-9 rounded-lg overflow-hidden shrink-0" style="background:linear-gradient(135deg,#16a34a,#0d9488)"><img src="' + esc(r.foto || "") + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'" alt=""></div><div class="min-w-0"><b class="text-sm block truncate max-w-[280px]">' + esc(r.judul) + '</b><span class="text-[11px] text-slate-500">#' + r.urutan + " • " + esc(r.kategori || "-") + "</span></div></div></td>" +
            '<td class="px-3 py-2 text-sm whitespace-nowrap">' + esc(fmtTgl(r.tanggal)) + "</td>" +
            '<td class="px-3 py-2 text-sm">' + esc(trunc(r.lokasi || "-", 24)) + "</td>" +
            '<td class="px-3 py-2">' + kgBadge(r.status) + "</td>" +
            '<td class="px-3 py-2 text-center"><button type="button" data-star="' + r.id + '" class="p-1.5 rounded-lg hover:bg-amber-50 ' + (r.unggulan ? "text-amber-500" : "text-slate-300") + '" title="Tandai unggulan"><i data-lucide="star" class="w-4 h-4 pointer-events-none"></i></button></td>' +
            '<td class="px-3 py-2 text-right whitespace-nowrap">' +
              '<button type="button" data-edit="' + r.id + '" title="Edit" class="p-1.5 rounded-lg hover:bg-slate-100 text-sky-600"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>' +
              '<button type="button" data-dupe="' + r.id + '" title="Duplikat" class="p-1.5 rounded-lg hover:bg-slate-100 text-violet-600"><i data-lucide="copy" class="w-4 h-4 pointer-events-none"></i></button>' +
              '<button type="button" data-del="' + r.id + '" title="Hapus" class="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>' +
            "</td></tr>").join("") || '<tr><td colspan="8" class="px-3 py-10 text-center text-sm text-slate-400">Tidak ada kegiatan. Klik “Tambah Kegiatan”.</td></tr>') +
          "</tbody></table></div>") +
      '<div class="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">' + rows.length + " dari " + kgRows.length + " kegiatan • sumber: data/kegiatan.json • urutan menentukan tata letak Bento di halaman publik</div>" +
    "</div>";

  refreshIcons();
  kgWire(rows);
}

function kgWire(rows) {
  const q = document.getElementById("kgQ");
  if (q) { q.oninput = e => { kgView.q = e.target.value; kgRender(); const n = document.getElementById("kgQ"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }; }
  const bind = (id, key) => { const el = document.getElementById(id); if (el) el.onchange = e => { kgView[key] = e.target.value; kgRender(); }; };
  bind("kgKat", "kat"); bind("kgStatus", "status"); bind("kgSort", "sort");

  document.getElementById("kgAdd").onclick = () => kgDrawer(null);
  document.getElementById("kgPrev").onclick = () => { kgPreview = !kgPreview; kgRender(); };
  document.getElementById("kgCsv").onclick = () => download("kegiatan-sekolah.csv", toCSV(kgSorted(), [
    { k: "urutan", l: "urutan" }, { k: "judul", l: "judul" }, { k: "kategori", l: "kategori" }, { k: "tanggal", l: "tanggal" },
    { k: "lokasi", l: "lokasi" }, { k: "peserta", l: "peserta" }, { k: "penyelenggara", l: "penyelenggara" },
    { k: "status", l: "status" }, { k: "unggulan", l: "unggulan" }, { k: "ringkasan", l: "ringkasan" }
  ]), "text/csv");

  const sv = document.getElementById("kgSaveView");
  if (sv) sv.onclick = () => {
    const name = prompt("Nama tampilan (saved view):", "Kegiatan " + (kgView.kat || kgView.status || "Semua"));
    if (!name) return;
    const v = kgViews(); v.push({ name: name.slice(0, 28), view: { ...kgView } }); kgSetViews(v); kgRender();
    toast("Saved view disimpan di perangkat ini.", "success");
  };
  app.querySelectorAll("[data-view]").forEach(b => b.onclick = () => { kgView = { ...kgViews()[+b.dataset.view].view }; kgRender(); });
  app.querySelectorAll("[data-viewdel]").forEach(b => b.onclick = () => { const v = kgViews(); v.splice(+b.dataset.viewdel, 1); kgSetViews(v); kgRender(); });

  const so = document.getElementById("kgSaveOrder");
  if (so) so.onclick = async () => {
    const snap = kgRows.map(r => ({ ...r }));
    kgOrderDirty = false; kgRender();
    if (await kgPersist("URUTKAN KEGIATAN", "Urutan Bento diperbarui", snap)) toast("Urutan Bento tersimpan.", "success");
    else kgOrderDirty = true;
  };

  const all = document.getElementById("kgAll");
  if (all) all.onchange = e => { rows.forEach(r => e.target.checked ? kgSel.add(r.id) : kgSel.delete(r.id)); kgRender(); };
  app.querySelectorAll("[data-sel]").forEach(c => c.onchange = e => { e.target.checked ? kgSel.add(c.dataset.sel) : kgSel.delete(c.dataset.sel); kgRender(); });

  const bulk = async (fn, aksi) => {
    if (!kgSel.size) return;
    const snap = kgRows.map(r => ({ ...r }));
    const n = kgSel.size;
    kgRows.forEach(r => { if (kgSel.has(r.id)) fn(r); });
    kgSel.clear(); kgRender();
    await kgPersist(aksi, n + " kegiatan diperbarui", snap);
  };
  const bOn = document.getElementById("kgBulkOn"); if (bOn) bOn.onclick = () => bulk(r => r.status = "Tampil", "PUBLIKASI KEGIATAN");
  const bOff = document.getElementById("kgBulkOff"); if (bOff) bOff.onclick = () => bulk(r => r.status = "Draft", "DRAFT KEGIATAN");
  const bClr = document.getElementById("kgBulkClear"); if (bClr) bClr.onclick = () => { kgSel.clear(); kgRender(); };
  const bDel = document.getElementById("kgBulkDel");
  if (bDel) bDel.onclick = () => {
    if (!confirm("Hapus " + kgSel.size + " kegiatan terpilih?")) return;
    const removed = kgRows.filter(r => kgSel.has(r.id)).map(r => ({ ...r }));
    kgRows = kgRows.filter(r => !kgSel.has(r.id)); kgNorm(); kgSel.clear(); kgRender();
    kgShowUndo(removed);
    kgPersist("HAPUS MASSAL KEGIATAN", removed.length + " kegiatan dihapus", null);
  };

  app.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => kgDrawer(kgRows.find(r => r.id === b.dataset.edit)));
  app.querySelectorAll("[data-dupe]").forEach(b => b.onclick = async () => {
    const src = kgRows.find(r => r.id === b.dataset.dupe); if (!src) return;
    const snap = kgRows.map(r => ({ ...r }));
    const copy = { ...src, id: uid(), judul: src.judul + " (Salinan)", status: "Draft", unggulan: false };
    kgRows.splice(kgRows.findIndex(r => r.id === src.id) + 1, 0, copy); kgNorm(); kgRender();
    await kgPersist("DUPLIKAT KEGIATAN", copy.judul, snap);
  });
  app.querySelectorAll("[data-star]").forEach(b => b.onclick = async () => {
    const r = kgRows.find(x => x.id === b.dataset.star); if (!r) return;
    const snap = kgRows.map(x => ({ ...x }));
    r.unggulan = !r.unggulan; kgRender();
    await kgPersist("UNGULAN KEGIATAN", r.judul + " → " + (r.unggulan ? "unggulan" : "biasa"), snap);
  });
  app.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
    const r = kgRows.find(x => x.id === b.dataset.del); if (!r) return;
    if (!confirm('Hapus kegiatan "' + r.judul + '"?')) return;
    const snap = kgRows.map(x => ({ ...x }));
    kgRows = kgRows.filter(x => x.id !== r.id); kgNorm(); kgRender();
    kgShowUndo([{ ...r }]);
    kgPersist("HAPUS KEGIATAN", r.judul, snap);
  });

  app.querySelectorAll("[data-row]").forEach(tr => {
    tr.ondragstart = e => { kgDragId = tr.dataset.row; tr.classList.add("opacity-40"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", kgDragId); } catch (err) {} };
    tr.ondragend = () => { tr.classList.remove("opacity-40"); app.querySelectorAll("[data-row]").forEach(x => x.classList.remove("ring-2", "ring-emerald-400")); };
    tr.ondragover = e => { e.preventDefault(); tr.classList.add("ring-2", "ring-emerald-400"); };
    tr.ondragleave = () => tr.classList.remove("ring-2", "ring-emerald-400");
    tr.ondrop = e => {
      e.preventDefault();
      const targetId = tr.dataset.row;
      if (!kgDragId || kgDragId === targetId) return;
      const ordered = kgSorted();
      const from = ordered.findIndex(r => r.id === kgDragId);
      const to = ordered.findIndex(r => r.id === targetId);
      if (from < 0 || to < 0) return;
      const [moved] = ordered.splice(from, 1);
      ordered.splice(to, 0, moved);
      kgRows = ordered; kgNorm(); kgOrderDirty = true; kgDragId = null;
      kgView.sort = "urutan"; kgRender();
      toast("Urutan dipindahkan — klik “Simpan Urutan” untuk menyimpan.", "info");
    };
  });
}

function kgShowUndo(items) {
  kgUndo = items;
  let bar = document.getElementById("kgUndoBar");
  if (!bar) { bar = document.createElement("div"); bar.id = "kgUndoBar"; document.body.appendChild(bar); }
  bar.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-sm";
  bar.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 text-rose-400"></i><span>' + items.length + ' kegiatan dihapus</span><button type="button" id="kgUndoBtn" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-900">Urungkan</button>';
  refreshIcons();
  document.getElementById("kgUndoBtn").onclick = async () => {
    if (!kgUndo) return;
    const back = kgUndo; kgUndo = null;
    kgRows = kgRows.concat(back); kgNorm(); kgRender(); kgHideUndo();
    await kgPersist("URUNGKAN HAPUS", back.length + " kegiatan dipulihkan", null);
  };
  clearTimeout(kgUndoTimer);
  kgUndoTimer = setTimeout(kgHideUndo, 9000);
}
function kgHideUndo() { const b = document.getElementById("kgUndoBar"); if (b) b.remove(); kgUndo = null; }

function kgDrawerShell() {
  let d = document.getElementById("kgDrawer");
  if (d) return d;
  d = document.createElement("div");
  d.id = "kgDrawer";
  d.className = "hidden fixed inset-0 z-[80]";
  d.innerHTML =
    '<div id="kgScrim" class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>' +
    '<aside class="absolute right-0 inset-y-0 w-full max-w-xl bg-white shadow-2xl flex flex-col">' +
      '<div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><i data-lucide="image" class="w-5 h-5"></i></div><b id="kgDTitle" class="flex-1 font-extrabold text-slate-800">Kegiatan</b><button type="button" id="kgDClose" class="p-2 rounded-lg hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button></div>' +
      '<form id="kgDForm" class="flex-1 overflow-y-auto p-5 space-y-4"></form>' +
      '<div class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2"><button type="button" id="kgDCancel" class="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 hover:bg-slate-50">Batal</button><button type="submit" form="kgDForm" class="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Simpan Kegiatan</button></div>' +
    "</aside>";
  document.body.appendChild(d);
  document.getElementById("kgDClose").onclick = kgCloseDrawer;
  document.getElementById("kgDCancel").onclick = kgCloseDrawer;
  document.getElementById("kgScrim").onclick = kgCloseDrawer;
  refreshIcons();
  return d;
}
function kgCloseDrawer() { const d = document.getElementById("kgDrawer"); if (d) d.classList.add("hidden"); kgEditId = null; }

function kgDrawer(row) {
  kgDrawerShell();
  kgEditId = row ? row.id : null;
  document.getElementById("kgDTitle").textContent = row ? "Edit Kegiatan" : "Tambah Kegiatan";
  const v = row || { judul: "", kategori: KG_CATS[0], tanggal: today(), lokasi: "", peserta: "", penyelenggara: "", ringkasan: "", deskripsi: "", foto: "", status: "Tampil", unggulan: false, urutan: kgRows.length + 1 };
  const f = document.getElementById("kgDForm");
  f.innerHTML =
    '<div class="rounded-2xl overflow-hidden border border-slate-200 h-40 relative" style="background:linear-gradient(135deg,#16a34a,#0d9488)"><img id="kgPvImg" src="' + esc(v.foto) + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'" alt=""><div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent"></div><div class="absolute bottom-0 p-3 text-white"><div id="kgPvKat" class="text-[10px] font-bold text-amber-300 uppercase">' + esc(v.kategori) + '</div><div id="kgPvJudul" class="font-bold leading-snug">' + esc(v.judul || "Judul kegiatan") + '</div></div><span class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-emerald-700">Pratinjau kartu</span></div>' +
    '<label class="block">' + lbl("Judul Kegiatan *") + '<input name="judul" required value="' + esc(v.judul) + '" ' + inp + "></label>" +
    '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block">' + lbl("Kategori *") + '<select name="kategori" ' + inp + ' required>' + KG_CATS.map(c => '<option ' + (v.kategori === c ? "selected" : "") + ">" + esc(c) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Tanggal *") + '<input name="tanggal" type="date" required value="' + esc(v.tanggal) + '" ' + inp + "></label>" +
    "</div>" +
    '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block">' + lbl("Lokasi") + '<input name="lokasi" value="' + esc(v.lokasi) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Peserta") + '<input name="peserta" value="' + esc(v.peserta) + '" ' + inp + "></label>" +
    "</div>" +
    '<label class="block">' + lbl("Penyelenggara") + '<input name="penyelenggara" value="' + esc(v.penyelenggara) + '" ' + inp + "></label>" +
    '<label class="block">' + lbl("URL Foto") + '<input name="foto" value="' + esc(v.foto) + '" placeholder="https://…" ' + inp + '></label>' +
    '<label class="block">' + lbl("Ringkasan (tampil di kartu)") + '<textarea name="ringkasan" rows="2" ' + inp + ">" + esc(v.ringkasan) + "</textarea></label>" +
    '<label class="block">' + lbl("Deskripsi Lengkap") + '<textarea name="deskripsi" rows="6" ' + inp + ">" + esc(v.deskripsi) + "</textarea></label>" +
    '<div class="grid sm:grid-cols-3 gap-3 items-end">' +
      '<label class="block">' + lbl("Status") + '<select name="status" ' + inp + "><option " + (v.status === "Tampil" ? "selected" : "") + ">Tampil</option><option " + (v.status === "Draft" ? "selected" : "") + ">Draft</option></select></label>" +
      '<label class="block">' + lbl("Urutan Bento") + '<input name="urutan" type="number" min="1" value="' + (v.urutan || 1) + '" ' + inp + "></label>" +
      '<label class="flex items-center gap-2 pb-2 text-sm font-semibold text-slate-600"><input type="checkbox" name="unggulan" ' + (v.unggulan ? "checked" : "") + ' class="accent-amber-500 w-4 h-4">Unggulan</label>' +
    "</div>";
  refreshIcons();
  const sync = () => {
    const img = document.getElementById("kgPvImg");
    img.style.display = ""; img.src = f.foto.value;
    document.getElementById("kgPvJudul").textContent = f.judul.value || "Judul kegiatan";
    document.getElementById("kgPvKat").textContent = f.kategori.value;
  };
  ["judul", "kategori", "foto"].forEach(n => f[n].oninput = sync);
  f.kategori.onchange = sync;
  f.onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(f).entries());
    const rec = {
      id: row ? row.id : uid(),
      judul: o.judul.trim(), kategori: o.kategori, tanggal: o.tanggal,
      lokasi: o.lokasi.trim(), peserta: o.peserta.trim(), penyelenggara: o.penyelenggara.trim(),
      ringkasan: o.ringkasan.trim(), deskripsi: o.deskripsi.trim(), foto: o.foto.trim(),
      status: o.status, unggulan: !!o.unggulan, urutan: Number(o.urutan) || 1
    };
    const snap = kgRows.map(r => ({ ...r }));
    if (row) {
      const i = kgRows.findIndex(r => r.id === row.id);
      kgRows[i] = rec;
      const ordered = kgSorted().filter(r => r.id !== rec.id);
      ordered.splice(Math.max(0, Math.min(ordered.length, rec.urutan - 1)), 0, rec);
      kgRows = ordered;
    } else {
      const ordered = kgSorted();
      ordered.splice(Math.max(0, Math.min(ordered.length, rec.urutan - 1)), 0, rec);
      kgRows = ordered;
    }
    kgNorm(); kgCloseDrawer(); kgRender();
    await kgPersist(row ? "EDIT KEGIATAN" : "TAMBAH KEGIATAN", rec.judul, snap);
  };
  document.getElementById("kgDrawer").classList.remove("hidden");
  setTimeout(() => f.judul.focus(), 60);
}

MOD.kegiatan = { title: "Kegiatan Sekolah", desc: "Galeri Bento halaman publik", render: renderKegiatan };

(function kgNav() {
  const nav = document.getElementById("nav");
  if (!nav || nav.querySelector('[data-nav="kegiatan"]')) return;
  const group = document.createElement("div");
  group.innerHTML = '<div class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Konten Website</div>' +
    '<a href="#/kegiatan" data-nav="kegiatan" class="navlink flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800"><i data-lucide="layout-grid" class="w-4 h-4"></i>Kegiatan Sekolah</a>';
  const sistem = [...nav.children].find(c => c.textContent.trim().startsWith("Sistem"));
  nav.insertBefore(group, sistem || null);
  refreshIcons();
})();

if (location.hash.replace("#/", "") === "kegiatan") route();