// ============================================================
// admin.js — Inti CMS: helper UI, penyimpanan (saveData), mesin CRUD generik, paginasi 50 baris.
// Modul tiap menu ada di admin-<modul>.js (mendaftar ke F & MOD); routing & sidebar di admin-router.js.
// Semua operasi tulis -> saveData() -> pushJSON() + audit log.
// TOKEN TIDAK BOLEH DI-HARDCODE
// ============================================================
requireAuth();
const app = document.getElementById("app");
const mem = {};
const optSiswa = async () => (await fetchJSON("siswa.json")).map(s => [s.nis, s.nis + " — " + s.nama + " (" + s.kelas + ")"]);
const optKelas = async () => (await fetchJSON("kelas.json")).map(k => [k.nama, k.nama]);
const optGuru = async () => (await fetchJSON("guru.json")).map(g => [g.id, g.nama + " — " + g.jabatan]);
const optMapel = async () => (await fetchJSON("settings.json")).mapel.map(m => [m, m]);
const namaSiswa = v => { const s = (mem["siswa.json"] || []).find(x => x.nis === v); return esc(s ? s.nama : v); };
const namaGuru = v => { const g = (mem["guru.json"] || []).find(x => x.id === v); return esc(g ? g.nama : v); };
const F = {};     // skema field per modul (diisi tiap admin-<modul>.js)
const MOD = {};   // registri modul: title, desc, file, fields, cols / render (diisi tiap admin-<modul>.js)
const badgeKeys = ["status", "jenis", "kondisi", "metode"];
const badgeColors = { Aktif: "emerald", Lunas: "emerald", Diterima: "emerald", Hadir: "emerald", Baik: "emerald", Dibayar: "emerald", Terkirim: "emerald", Dikembalikan: "emerald", Selesai: "emerald", Penerimaan: "emerald", Menunggu: "amber", Belum: "amber", Dipinjam: "amber", Draft: "amber", Izin: "amber", Antrean: "amber", "Rusak Ringan": "amber", Sakit: "sky", "Dinas Luar": "sky", Lulus: "sky", Alfa: "red", Ditolak: "red", Keluar: "red", Pindah: "red", "Rusak Berat": "red", Pengeluaran: "red" };
const badge = v => { const c = badgeColors[v] || "slate"; return '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-' + c + "-100 text-" + c + '-700">' + esc(v ?? "-") + "</span>"; };
const pageHead = m => '<div class="mb-5"><h1 class="text-xl md:text-2xl font-extrabold text-slate-800">' + esc(m.title) + "</h1>" + (m.desc ? '<p class="text-sm text-slate-500 mt-1 max-w-3xl">' + esc(m.desc) + "</p>" : "") + "</div>";
const card = inner => '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5">' + inner + "</div>";
const inp = 'class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"';
// ============================================================
// UI KIT — template seragam semua modul (Tahap 2)
// Susunan: Header Modul (pageHead) > Toolbar (cari + filter + Tambah) > Tabel (50 baris + "Muat 50 lagi") > Empty State > Modal Form.
// Warna tombol: Tambah/Simpan = emerald, Edit = amber, Hapus = merah. Dialog hapus = confirmBox() (tanpa confirm() bawaan browser),
// isian singkat = askBox() (tanpa prompt()), pemberitahuan = toast().
// ============================================================
const BTN_ADD = "inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg";
const BTN_EDIT = "inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-lg";
const BTN_DEL = "inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg";
const ICO_EDIT = "p-1.5 rounded-lg hover:bg-amber-50 text-amber-600";   // ikon pensil di baris tabel
const ICO_DEL = "p-1.5 rounded-lg hover:bg-red-50 text-red-600";       // ikon tempat sampah di baris tabel
const btnP = 'class="' + BTN_ADD + '"';
const btnE = 'class="' + BTN_EDIT + '"';
const btnD = 'class="' + BTN_DEL + '"';
const btnS = 'class="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-sm font-bold px-4 py-2 rounded-lg"';
const lbl = t => '<span class="text-xs font-semibold text-slate-600">' + t + "</span>";
// Empty state seragam. o = { icon, title, hint, html(tombol aksi, opsional/terpercaya) }
function emptyState(o) {
  o = o || {};
  return '<div class="py-12 px-4 text-center"><div class="inline-flex flex-col items-center gap-2"><div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center"><i data-lucide="' + (o.icon || "inbox") + '" class="w-6 h-6"></i></div>' +
    '<div class="text-sm font-bold text-slate-600">' + esc(o.title || "Belum ada data") + "</div>" +
    (o.hint ? '<div class="text-xs text-slate-400 max-w-xs">' + esc(o.hint) + "</div>" : "") + (o.html || "") + "</div></div>";
}
const emptyRowOf = o => '<tr class="lsq-empty"><td colspan="99">' + emptyState(o) + "</td></tr>";
const emptyRow = emptyRowOf({ title: "Belum ada data", hint: "Klik Tambah untuk menambahkan data pertama." });

// ---- Dialog modal (menggantikan confirm()/prompt() bawaan browser) ----
function _dlgOpen(inner, onKey) {
  const old = document.getElementById("dlgOv"); if (old) old.remove();
  const ov = document.createElement("div"); ov.id = "dlgOv";
  ov.className = "fixed inset-0 z-[90] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4";
  ov.innerHTML = '<div role="alertdialog" aria-modal="true" class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">' + inner + "</div>";
  document.body.appendChild(ov);
  const kh = e => onKey(e); document.addEventListener("keydown", kh, true);
  const close = () => { document.removeEventListener("keydown", kh, true); ov.remove(); };
  refreshIcons();
  return { ov, close };
}
// confirmBox({ title, message, html?, danger?, okLabel?, cancelLabel? }) -> Promise<boolean>
function confirmBox(o) {
  o = o || {};
  return new Promise(res => {
    const danger = !!o.danger;
    let d = null; const done = v => { if (d) d.close(); res(v); };
    d = _dlgOpen(
      '<div class="p-5 flex gap-4"><div class="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ' + (danger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600") + '"><i data-lucide="' + (danger ? "triangle-alert" : "circle-help") + '" class="w-5 h-5"></i></div>' +
      '<div class="min-w-0"><h3 class="font-extrabold text-slate-800">' + esc(o.title || "Konfirmasi") + '</h3><p class="text-sm text-slate-600 mt-1 whitespace-pre-line break-words">' + esc(o.message || "") + "</p>" + (o.html || "") + "</div></div>" +
      '<div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2"><button type="button" data-d="no" class="px-4 py-2 text-sm font-bold rounded-lg border border-slate-300 hover:bg-white">' + esc(o.cancelLabel || "Batal") + '</button>' +
      '<button type="button" data-d="ok" class="' + (danger ? BTN_DEL : BTN_ADD) + '">' + esc(o.okLabel || "Ya, lanjutkan") + "</button></div>",
      e => { if (e.key === "Escape") { e.stopPropagation(); done(false); } else if (e.key === "Enter" && !(document.activeElement && document.activeElement.dataset && document.activeElement.dataset.d === "no")) { e.preventDefault(); e.stopPropagation(); done(true); } });
    d.ov.addEventListener("click", e => { if (e.target === d.ov) done(false); const b = e.target.closest("[data-d]"); if (b) done(b.dataset.d === "ok"); });
    const f = d.ov.querySelector(danger ? '[data-d="no"]' : '[data-d="ok"]'); if (f) f.focus();
  });
}
// askBox({ title, label, value?, placeholder?, okLabel? }) -> Promise<string|null>  (null = dibatalkan)
function askBox(o) {
  o = o || {};
  return new Promise(res => {
    let d = null; const done = v => { if (d) d.close(); res(v); };
    d = _dlgOpen(
      '<div class="p-5"><h3 class="font-extrabold text-slate-800">' + esc(o.title || "Isi data") + '</h3><label class="block mt-3"><span class="text-xs font-semibold text-slate-600">' + esc(o.label || "") + '</span><input id="dlgInput" type="text" value="' + esc(o.value || "") + '" placeholder="' + esc(o.placeholder || "") + '" ' + inp + "></label></div>" +
      '<div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2"><button type="button" data-d="no" class="px-4 py-2 text-sm font-bold rounded-lg border border-slate-300 hover:bg-white">Batal</button><button type="button" data-d="ok" class="' + BTN_ADD + '">' + esc(o.okLabel || "Simpan") + "</button></div>",
      e => { if (e.key === "Escape") { e.stopPropagation(); done(null); } else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); done(document.getElementById("dlgInput").value); } });
    d.ov.addEventListener("click", e => { if (e.target === d.ov) done(null); const b = e.target.closest("[data-d]"); if (b) done(b.dataset.d === "ok" ? document.getElementById("dlgInput").value : null); });
    const i = document.getElementById("dlgInput"); if (i) { i.focus(); i.select(); }
  });
}
function openModal(title, body, onSubmit, label = "Simpan") {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = body;
  const save = document.getElementById("modalSave");
  save.textContent = label; save.classList.toggle("hidden", !onSubmit);
  const form = document.getElementById("modalForm");
  form.onsubmit = async e => {
    e.preventDefault(); if (!onSubmit) return;
    const ok = await onSubmit(Object.fromEntries(new FormData(form).entries()), form);
    if (ok !== false) closeModal();
  };
  document.getElementById("modal").classList.remove("hidden");
  refreshIcons();
}
function closeModal() { document.getElementById("modal").classList.add("hidden"); }
function fieldHTML(f, val) {
  const req = f.req === false ? "" : "required";
  const v = val ?? f.def ?? "";
  const wrap = inner => '<label class="block ' + (f.full ? "sm:col-span-2" : "") + '">' + lbl(f.l + (f.req === false ? "" : " *")) + inner + "</label>";
  if (f.t === "select") return wrap('<select name="' + f.k + '" ' + inp + " " + req + '><option value="">— pilih —</option>' + (f.opts || []).map(o => { const [vv, ll] = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(vv) + '" ' + (String(v) === String(vv) ? "selected" : "") + ">" + esc(ll) + "</option>"; }).join("") + "</select>");
  if (f.t === "textarea") return wrap('<textarea name="' + f.k + '" rows="3" ' + inp + " " + req + ">" + esc(v) + "</textarea>");
  return wrap('<input type="' + (f.t || "text") + '" name="' + f.k + '" value="' + esc(v) + '" ' + inp + " " + req + (f.t === "number" ? ' step="any" min="0"' : "") + ' placeholder="' + esc(f.ph || "") + '">');
}
async function dynOpts(fields) { const out = []; for (const f of fields) { const g = { ...f }; if (f.optsFn) g.opts = await f.optsFn(); out.push(g); } return out; }
async function openForm(m, row) {
  const fields = await dynOpts(m.fields);
  const body = '<div class="grid sm:grid-cols-2 gap-3">' + fields.map(f => fieldHTML(f, row ? row[f.k] : (m.preset && m.preset[f.k] !== undefined ? m.preset[f.k] : f.def))).join("") + "</div>";
  openModal((row ? "Edit " : "Tambah ") + m.title, body, async obj => {
    m.fields.forEach(f => { if (f.t === "number") obj[f.k] = Number(obj[f.k] || 0); });
    let full = [...(mem[m.file] || await fetchJSON(m.file))];
    // FIXED (bug 10): bila baris sudah dihapus pihak lain, findIndex = -1 dan sebelumnya menulis properti sampah full[-1]; kini ditolak dengan pesan jelas.
    if (row) { const i = full.findIndex(x => x.id === row.id); if (i < 0) { toast("Data ini sudah tidak ada (dihapus dari tab/perangkat lain). Muat ulang halaman.", "error"); return false; } full[i] = { ...full[i], ...obj }; }
    else full.unshift({ id: uid(), ...(m.preset || {}), ...obj });
    const ok = await saveData(m.file, full, m.title, row ? "EDIT" : "TAMBAH", m.label ? m.label(obj) : (obj.nama || obj.judul || obj.nis || obj.id));
    if (ok) route();
    return ok;
  });
}
const PAGE_N = 50;
async function renderCRUD(key) {
  const m = MOD[key];
  const full = await fetchJSON(m.file); mem[m.file] = full;
  if (m.preload) for (const f of m.preload) mem[f] = await fetchJSON(f).catch(() => []);
  const data = m.filter ? full.filter(m.filter) : full;
  const cols = m.cols || m.fields.slice(0, 6).map(f => f.k);
  const labels = Object.fromEntries(m.fields.map(f => [f.k, f.l]));
  const fmts = { ...Object.fromEntries(m.fields.filter(f => f.fmt).map(f => [f.k, f.fmt])), ...(m.fmts || {}) };
  const rowsHTML = rows => rows.map(r =>
    '<tr class="border-b border-slate-100 hover:bg-slate-50">' + cols.map(c => {
      const v = r[c];
      const out = fmts[c] ? fmts[c](v, r) : (badgeKeys.includes(c) ? badge(v) : esc(trunc(v)));
      return '<td class="px-3 py-2 text-sm">' + out + "</td>";
    }).join("") +
    '<td class="px-3 py-2 text-right whitespace-nowrap">' +
    // FIXED: r.id & a.title masuk atribut HTML tanpa esc() -> potensi XSS/atribut pecah bila id di JSON berisi tanda kutip; kini di-esc (data-id/data-edit/data-del).
    (m.rowActions || []).map((a, i) => '<button type="button" data-x="' + i + '" data-id="' + esc(r.id) + '" title="' + esc(a.title) + '" class="p-1.5 rounded-lg hover:bg-slate-100 ' + (a.cls || "text-slate-500") + '"><i data-lucide="' + a.icon + '" class="w-4 h-4 pointer-events-none"></i></button>').join("") +
    '<button type="button" data-edit="' + esc(r.id) + '" title="Edit" class="' + ICO_EDIT + '"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>' +
    '<button type="button" data-del="' + esc(r.id) + '" title="Hapus" class="' + ICO_DEL + '"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>'
  ).join("") || emptyRow;
  app.innerHTML = pageHead(m) +
    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200">' +
    '<div class="p-4 flex flex-wrap gap-2 items-center border-b border-slate-100">' +
    '<div class="relative flex-1 min-w-[200px]"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input id="q" placeholder="Cari…" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"></div>' +
    (m.toolbar || "") +
    '<button type="button" id="btnAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Tambah</button></div>' +
    '<div class="overflow-x-auto max-h-[62vh] overflow-y-auto"><table class="w-full text-left"><thead class="bg-slate-50 sticky top-0"><tr>' +
    cols.map(c => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + esc(labels[c] || c) + "</th>").join("") +
    '<th class="px-3 py-2 text-xs text-right text-slate-500">Aksi</th></tr></thead><tbody id="tb">' + rowsHTML(data.slice(0, PAGE_N)) + "</tbody></table></div>" +
    '<div class="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1"><span id="tbInfo"></span><button type="button" id="btnMore" class="hidden px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">Muat 50 baris lagi</button><span>• sumber: data/' + m.file + " • setiap Simpan/Hapus = commit GitHub + audit log</span></div></div>";
  // PERF: tabel dirender bertahap (50 baris). Dulu semua baris (±500 x 2 ikon) dirender sekaligus dan ulang di setiap ketukan pencarian.
  let shown = PAGE_N, view = data, curQ = "";
  const paint = () => {
    document.getElementById("tb").innerHTML = view.length ? rowsHTML(view.slice(0, shown)) : (curQ ? emptyRowOf({ icon: "search-x", title: "Tidak ada hasil", hint: "Tidak ada data yang cocok dengan \"" + curQ + "\"." }) : emptyRow);
    document.getElementById("tbInfo").textContent = Math.min(shown, view.length) + " dari " + view.length + " baris";
    document.getElementById("btnMore").classList.toggle("hidden", shown >= view.length);
    refreshIcons();
  };
  paint();
  if (m.onToolbar) m.onToolbar();
  let _qT = 0;
  document.getElementById("q").oninput = e => {
    const s = e.target.value.toLowerCase();
    clearTimeout(_qT);
    _qT = setTimeout(() => { curQ = s; view = s ? data.filter(r => JSON.stringify(r).toLowerCase().includes(s)) : data; shown = PAGE_N; paint(); }, 200);
  };
  document.getElementById("btnMore").onclick = () => { shown += PAGE_N; paint(); };
  document.getElementById("btnAdd").onclick = () => openForm(m, null);
  app.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    // FIXED (bug 10): mem dikosongkan setelah konflik; baca ulang (segar) dan jangan crash/!tambah-baru bila baris sudah tidak ada.
    const fullNow = mem[m.file] || (mem[m.file] = await fetchJSON(m.file));
    const gone = id => { toast("Data ini sudah tidak ada atau berubah. Memuat ulang…", "error"); route(); };
    if (b.dataset.edit) { const rr = fullNow.find(r => r.id === b.dataset.edit); if (!rr) return gone(); openForm(m, rr); }
    else if (b.dataset.del) {
      const r = fullNow.find(x => x.id === b.dataset.del);
      if (!r) return gone();
      if (await confirmBox({ title: "Hapus data", message: "Hapus \"" + (r.nama || r.judul || r.nis || r.id) + "\"? Tindakan ini ter-commit ke GitHub dan tidak dapat dibatalkan dari sini.", danger: true, okLabel: "Hapus" })) {
        if (await saveData(m.file, fullNow.filter(x => x.id !== r.id), m.title, "HAPUS", r.nama || r.judul || r.id)) route();
      }
    } else if (b.dataset.x !== undefined) {
      const r = data.find(x => x.id === b.dataset.id);
      m.rowActions[+b.dataset.x].fn(r);
    }
  };
}

// Modul CRUD (#tb) sudah memakai paginasi sendiri di renderCRUD. Untuk modul khusus (Ujian, SPP, Gaji, Audit, Chat,
// Notifikasi, Peminjaman, Kegiatan, Kalender, dst.) setiap tabel / daftar berulang yang berisi > 50 item hanya menampilkan
// 50 pertama + tombol "Muat 50 baris lagi". Aman terhadap render ulang modul (filter/cari) lewat MutationObserver.
const _lsPg = new WeakMap();

let _lsPgBusy = false, _lsPgT = 0, _lsPgMO = null;

function _lsPgAttach(host, items, after) {
  let st = _lsPg.get(host);
  if (!st) { st = { shown: PAGE_N, count: -1, pager: null }; _lsPg.set(host, st); }
  if (items.length !== st.count) { st.count = items.length; st.shown = PAGE_N; }   // data berubah (filter/cari) -> kembali ke 50 pertama
  if (items.length <= PAGE_N) {
    items.forEach(el => el.removeAttribute("data-pg"));
    if (st.pager) { st.pager.remove(); st.pager = null; }
    return;
  }
  items.forEach((el, i) => { if (i < st.shown) el.removeAttribute("data-pg"); else el.setAttribute("data-pg", "1"); });
  if (!st.pager || !st.pager.isConnected) {
    const p = document.createElement("div");
    p.className = "lspager px-4 py-2 text-xs text-slate-500 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1";
    p.innerHTML = '<span class="pgInfo"></span><button type="button" class="pgMore px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">Muat 50 baris lagi</button>';
    p.querySelector(".pgMore").onclick = () => { st.shown += PAGE_N; _lsPgRun(); };
    after.after(p); st.pager = p;
  }
  st.pager.querySelector(".pgInfo").textContent = Math.min(st.shown, items.length) + " dari " + items.length + " baris";
  st.pager.querySelector(".pgMore").classList.toggle("hidden", st.shown >= items.length);
}

// ---- Lapisan template seragam untuk tabel modul kustom (Tahap 2): kolom cari + empty state ----
// Berlaku untuk tabel di #app selain CRUD (#tb) dan selain modul yang sudah punya kolom cari sendiri.
const _lsRealRows = tb => [...tb.children].filter(r => r.tagName === "TR" && !r.classList.contains("lsq-empty") && !r.classList.contains("lsq-nores"));
function _lsApplyQ(tb, q) {
  const rows = _lsRealRows(tb); let vis = 0;
  rows.forEach(r => { const hide = !!q && !r.textContent.toLowerCase().includes(q); if (hide) r.setAttribute("data-qh", "1"); else { r.removeAttribute("data-qh"); vis++; } });
  let nr = tb.querySelector(".lsq-nores");
  if (q && !vis) { if (!nr) { tb.insertAdjacentHTML("beforeend", emptyRowOf({ icon: "search-x", title: "Tidak ada hasil", hint: "Tidak ada baris yang cocok dengan pencarian." }).replace('lsq-empty', 'lsq-nores')); } }
  else if (nr) nr.remove();
}
function _lsTemplate(tb, table) {
  const rows = _lsRealRows(tb), emp = tb.querySelector(".lsq-empty");
  if (!rows.length) { if (!emp && !tb.querySelector(".lsq-nores") && !tb.hasAttribute("data-noempty")) tb.insertAdjacentHTML("beforeend", emptyRow); refreshIcons(); return; }
  if (emp) emp.remove();
  const wrap = table.closest(".overflow-x-auto") || table, host = table.closest("div.bg-white") || app;
  let bar = wrap.previousElementSibling && wrap.previousElementSibling.classList.contains("lsq") ? wrap.previousElementSibling : null;
  if (!bar) {
    if (rows.length < 6 || table.closest("[data-nosearch]") || host.querySelector('input[placeholder^="Cari"],input[type="search"]')) return;
    bar = document.createElement("div"); bar.className = "lsq mb-3 relative";
    bar.innerHTML = '<i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input type="search" placeholder="Cari di tabel…" aria-label="Cari di tabel" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500">';
    wrap.before(bar); refreshIcons();
    let t = 0; bar.querySelector("input").oninput = e => { clearTimeout(t); t = setTimeout(() => { bar._q = e.target.value.toLowerCase().trim(); _lsPgBusy = true; try { _lsApplyQ(tb, bar._q); } finally { _lsPgBusy = false; } _lsPgRun(); }, 150); };
  }
  if (bar._q) _lsApplyQ(tb, bar._q);   // modul merender ulang baris -> terapkan lagi kata kunci
}

function _lsPgRun() {
  const root = document.getElementById("app"); if (!root) return;
  _lsPgBusy = true;
  try {
    root.querySelectorAll("tbody").forEach(tb => {
      if (tb.id === "tb") return;                                   // CRUD: sudah dipaginasi
      const table = tb.closest("table"); if (!table) return;
      _lsTemplate(tb, table);
      _lsPgAttach(tb, _lsRealRows(tb).filter(r => !r.hasAttribute("data-qh")), table.closest(".overflow-x-auto") || table);
    });
    root.querySelectorAll("*").forEach(p => {                       // daftar berulang non-tabel (mis. gelembung Chat)
      if (["TBODY", "TABLE", "THEAD", "SELECT", "TR"].includes(p.tagName) || p.classList.contains("lspager") || p.children.length <= PAGE_N) return;
      const c = [...p.children].filter(x => !x.classList.contains("lspager"));
      const tag = {}; c.forEach(x => { tag[x.tagName] = (tag[x.tagName] || 0) + 1; });
      const top = Object.keys(tag).sort((a, b) => tag[b] - tag[a])[0];
      if (tag[top] > PAGE_N) _lsPgAttach(p, c.filter(x => x.tagName === top), p);
    });
  } finally { _lsPgBusy = false; }
}

function lsPaginate() {
  const root = document.getElementById("app"); if (!root) return;
  if (!_lsPgMO) {
    _lsPgMO = new MutationObserver(() => { if (_lsPgBusy) return; clearTimeout(_lsPgT); _lsPgT = setTimeout(_lsPgRun, 40); });
    _lsPgMO.observe(root, { childList: true, subtree: true });
  }
  _lsPgRun();
}
