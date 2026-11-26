// ============================================================
// admin-konten.js — CMS "Biaya Pendidikan" (settings.biaya) dan
// "Kalender Akademik" (kalender.json). CRUD lengkap: cari, filter,
// sort, drawer, hapus+undo, pilih massal, saved views, ekspor.
// ============================================================
const KN_JEN = ["SD", "SMP", "SMA", "SMK"];
const KN_FIELDS = [
  ["uang_pangkal", "Uang Pangkal (satu kali)"], ["spp", "SPP / bulan"], ["uang_media", "Uang Media / bulan"],
  ["uang_kegiatan", "Uang Kegiatan / bulan"], ["seragam", "Seragam"], ["buku", "Buku Tahunan"],
  ["kegiatan_tahunan", "Kegiatan Tahunan"], ["daftar_ulang", "Daftar Ulang"], ["praktikum", "Praktikum"], ["pkl", "PKL (SMK)"]
];
const KN_KAT = ["Akademik", "Asesmen", "Kegiatan", "PPDB", "Keagamaan", "Rapat Orang Tua", "Libur Nasional", "Libur Semester"];
const KN_COLOR = { "Akademik": "emerald", "Asesmen": "violet", "Kegiatan": "sky", "PPDB": "amber", "Keagamaan": "indigo", "Rapat Orang Tua": "teal", "Libur Nasional": "rose", "Libur Semester": "orange" };
const KN_VKEY = "kn_kal_views";

let knSet = {}, knJen = "SMP", knUndoFee = null;
let knRows = [], knView = { q: "", kat: "", sem: "", status: "", sort: "asc" }, knSel = new Set(), knUndo = null, knUndoT = null, knEditId = null, knPreviewM = "";

const knColor = k => KN_COLOR[k] || "slate";
const knBadge = s => '<span class="px-2 py-0.5 rounded-full text-xs font-medium ' + (s === "Tampil" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700") + '">' + esc(s || "Draft") + "</span>";
const knMonthly = f => (+f.spp || 0) + (+f.uang_media || 0) + (+f.uang_kegiatan || 0);
const knYearly = f => (+f.seragam || 0) + (+f.buku || 0) + (+f.kegiatan_tahunan || 0) + (+f.daftar_ulang || 0) + (+f.praktikum || 0) + (+f.pkl || 0);
const knYear1 = f => (+f.uang_pangkal || 0) + knMonthly(f) * 12 + knYearly(f);
const knViews = () => { try { return JSON.parse(localStorage.getItem(KN_VKEY)) || []; } catch (e) { return []; } };
const knSetViews = v => localStorage.setItem(KN_VKEY, JSON.stringify(v));
const knEnd = e => e.selesai || e.mulai;
const knDays = e => Math.max(1, Math.round((new Date(knEnd(e)) - new Date(e.mulai)) / 864e5) + 1);
const knRange = e => knDays(e) > 1 ? fmtTgl(e.mulai) + " – " + fmtTgl(knEnd(e)) : fmtTgl(e.mulai);

function knFiltered() {
  let r = knRows.slice();
  if (knView.kat) r = r.filter(x => x.kategori === knView.kat);
  if (knView.sem) r = r.filter(x => x.semester === knView.sem);
  if (knView.status) r = r.filter(x => (x.status || "Draft") === knView.status);
  if (knView.q) { const q = knView.q.toLowerCase(); r = r.filter(x => JSON.stringify(x).toLowerCase().includes(q)); }
  r.sort((a, b) => knView.sort === "desc" ? String(b.mulai).localeCompare(String(a.mulai)) : knView.sort === "judul" ? String(a.judul).localeCompare(String(b.judul)) : knView.sort === "kategori" ? String(a.kategori).localeCompare(String(b.kategori)) : String(a.mulai).localeCompare(String(b.mulai)));
  return r;
}

/* ---------------- MODUL: BIAYA PENDIDIKAN ---------------- */
async function renderBiaya() {
  knSet = await fetchJSON("settings.json");
  if (!knSet.biaya) knSet.biaya = {};
  KN_JEN.forEach(j => { if (!knSet.biaya[j]) knSet.biaya[j] = Object.fromEntries(KN_FIELDS.map(f => [f[0], 0])); });
  if (!knSet.kebijakan) knSet.kebijakan = { diskon_saudara_persen: 10, cicilan_pangkal_opsi: [1, 3, 6, 12], denda_terlambat_persen: 2, jatuh_tempo_tanggal: 10, beasiswa_maks_persen: 50 };
  knJen = KN_JEN.includes(knSet.jenjang) ? knSet.jenjang : knJen;
  knRenderBiaya();
}

function knRenderBiaya() {
  const p = knSet.kebijakan;
  const cards = KN_JEN.map(j => {
    const f = knSet.biaya[j];
    return '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">' +
      '<div class="px-5 py-3 border-b border-slate-100 flex items-center gap-2"><b class="font-extrabold">' + j + "</b>" + (knSet.jenjang === j ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Jenjang Sekolah</span>' : "") +
      '<button type="button" data-fee="' + j + '" class="ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-sky-600" title="Kelola rincian"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>' +
      '<button type="button" data-copy="' + j + '" class="p-1.5 rounded-lg hover:bg-slate-100 text-violet-600" title="Salin ke jenjang lain"><i data-lucide="copy" class="w-4 h-4 pointer-events-none"></i></button></div>' +
      '<div class="p-5 space-y-1.5 text-sm">' +
        '<div class="flex justify-between"><span class="text-slate-500">Uang pangkal</span><b>' + fmtRp(f.uang_pangkal) + "</b></div>" +
        '<div class="flex justify-between"><span class="text-slate-500">Bulanan</span><b>' + fmtRp(knMonthly(f)) + "</b></div>" +
        '<div class="flex justify-between"><span class="text-slate-500">Tahunan</span><b>' + fmtRp(knYearly(f)) + "</b></div>" +
        '<div class="flex justify-between pt-2 mt-2 border-t border-slate-100"><span class="font-bold">Tahun ke-1</span><b class="text-emerald-700">' + fmtRp(knYear1(f)) + "</b></div>" +
      "</div></div>";
  }).join("");

  app.innerHTML = pageHead({ title: "Biaya Pendidikan", desc: "Rincian biaya per jenjang yang ditampilkan pada halaman publik tuition.html. Tersimpan di settings.json (kunci biaya & kebijakan) beserta audit log." }) +
    '<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">' + cards + "</div>" +
    '<div class="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div class="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2"><b class="text-sm flex-1">Perbandingan Antar Jenjang</b><button type="button" id="knFeeCsv" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>Ekspor CSV</button><button type="button" id="knFeePrint" ' + btnS + '><i data-lucide="printer" class="w-4 h-4"></i>Cetak</button></div>' +
    '<div class="overflow-x-auto"><table class="w-full text-sm text-left min-w-[640px]"><thead class="bg-slate-50"><tr><th class="px-4 py-2 text-xs uppercase text-slate-500">Jenjang</th><th class="px-4 py-2 text-xs uppercase text-slate-500 text-right">Pangkal</th><th class="px-4 py-2 text-xs uppercase text-slate-500 text-right">Bulanan</th><th class="px-4 py-2 text-xs uppercase text-slate-500 text-right">Tahunan</th><th class="px-4 py-2 text-xs uppercase text-slate-500 text-right">Total Tahun 1</th></tr></thead><tbody>' +
    KN_JEN.map(j => { const f = knSet.biaya[j]; return '<tr class="border-t border-slate-100"><td class="px-4 py-2 font-bold">' + j + '</td><td class="px-4 py-2 text-right">' + fmtRp(f.uang_pangkal) + '</td><td class="px-4 py-2 text-right">' + fmtRp(knMonthly(f)) + '</td><td class="px-4 py-2 text-right">' + fmtRp(knYearly(f)) + '</td><td class="px-4 py-2 text-right font-extrabold text-emerald-700">' + fmtRp(knYear1(f)) + "</td></tr>"; }).join("") +
    "</tbody></table></div></div>" +
    '<div class="mt-6">' + card('<b class="text-sm block mb-3">Kebijakan Pembayaran</b><form id="knPol" class="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">' +
      '<label class="block">' + lbl("Diskon Saudara (%)") + '<input name="diskon_saudara_persen" type="number" min="0" max="100" value="' + p.diskon_saudara_persen + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Beasiswa Maks (%)") + '<input name="beasiswa_maks_persen" type="number" min="0" max="100" value="' + p.beasiswa_maks_persen + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Denda Telat (%)") + '<input name="denda_terlambat_persen" type="number" min="0" max="100" value="' + p.denda_terlambat_persen + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Jatuh Tempo (tgl)") + '<input name="jatuh_tempo_tanggal" type="number" min="1" max="28" value="' + p.jatuh_tempo_tanggal + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Opsi Cicilan (koma)") + '<input name="cicilan" value="' + (p.cicilan_pangkal_opsi || []).join(",") + '" ' + inp + "></label>" +
      '<div class="sm:col-span-3 lg:col-span-5"><button ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Simpan Kebijakan</button></div></form>') + "</div>";
  refreshIcons();

  app.querySelectorAll("[data-fee]").forEach(b => b.onclick = () => knFeeDrawer(b.dataset.fee));
  app.querySelectorAll("[data-copy]").forEach(b => b.onclick = async () => {
    const src = b.dataset.copy, target = prompt("Salin struktur biaya " + src + " ke jenjang mana? (SD/SMP/SMA/SMK)", KN_JEN.find(j => j !== src));
    if (!target || !KN_JEN.includes(target.toUpperCase()) || target.toUpperCase() === src) return;
    const t = target.toUpperCase(), snap = JSON.parse(JSON.stringify(knSet));
    knSet.biaya[t] = { ...knSet.biaya[src] }; knRenderBiaya();
    if (!await saveData("settings.json", knSet, "Konten Website", "SALIN BIAYA", src + " → " + t)) { knSet = snap; knRenderBiaya(); }
  });
  document.getElementById("knFeeCsv").onclick = () => {
    const rows = KN_JEN.map(j => ({ jenjang: j, ...knSet.biaya[j], bulanan: knMonthly(knSet.biaya[j]), tahunan: knYearly(knSet.biaya[j]), total_tahun1: knYear1(knSet.biaya[j]) }));
    download("biaya-pendidikan.csv", toCSV(rows, [{ k: "jenjang", l: "jenjang" }].concat(KN_FIELDS.map(f => ({ k: f[0], l: f[0] }))).concat([{ k: "bulanan", l: "total_bulanan" }, { k: "tahunan", l: "total_tahunan" }, { k: "total_tahun1", l: "total_tahun1" }])), "text/csv");
  };
  document.getElementById("knFeePrint").onclick = () => printHTML("Biaya Pendidikan", "<div class='center'><h2>RINCIAN BIAYA PENDIDIKAN</h2><div class='muted'>" + esc(knSet.nama_sekolah) + " • TA " + esc(knSet.tahun_ajaran) + "</div></div>" +
    KN_JEN.map(j => { const f = knSet.biaya[j]; return "<h3>" + j + "</h3><table>" + KN_FIELDS.map(x => "<tr><th>" + x[1] + "</th><td class='right'>" + fmtRp(f[x[0]]) + "</td></tr>").join("") + "<tr><th>TOTAL TAHUN PERTAMA</th><td class='right'><b>" + fmtRp(knYear1(f)) + "</b></td></tr></table>"; }).join(""));
  document.getElementById("knPol").onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target).entries());
    const snap = JSON.parse(JSON.stringify(knSet));
    knSet.kebijakan = { diskon_saudara_persen: +o.diskon_saudara_persen || 0, beasiswa_maks_persen: +o.beasiswa_maks_persen || 0, denda_terlambat_persen: +o.denda_terlambat_persen || 0, jatuh_tempo_tanggal: +o.jatuh_tempo_tanggal || 10, cicilan_pangkal_opsi: String(o.cicilan).split(",").map(x => parseInt(x.trim(), 10)).filter(n => n > 0) };
    knRenderBiaya();
    if (!await saveData("settings.json", knSet, "Konten Website", "UPDATE KEBIJAKAN BIAYA", "Diskon " + knSet.kebijakan.diskon_saudara_persen + "%")) { knSet = snap; knRenderBiaya(); }
  };
}

function knShell(id, title, icon) {
  let d = document.getElementById(id);
  if (d) return d;
  d = document.createElement("div"); d.id = id; d.className = "hidden fixed inset-0 z-[80]";
  d.innerHTML = '<div data-scrim class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div><aside class="absolute right-0 inset-y-0 w-full max-w-xl bg-white shadow-2xl flex flex-col">' +
    '<div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><i data-lucide="' + icon + '" class="w-5 h-5"></i></div><b data-title class="flex-1 font-extrabold text-slate-800">' + title + '</b><button type="button" data-close class="p-2 rounded-lg hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button></div>' +
    '<form data-form class="flex-1 overflow-y-auto p-5 space-y-4"></form>' +
    '<div class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2"><button type="button" data-close class="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 hover:bg-slate-50">Batal</button><button type="submit" data-submit class="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Simpan</button></div></aside>';
  document.body.appendChild(d);
  d.querySelectorAll("[data-close]").forEach(b => b.onclick = () => d.classList.add("hidden"));
  d.querySelector("[data-scrim]").onclick = () => d.classList.add("hidden");
  d.querySelector("[data-submit]").onclick = () => d.querySelector("[data-form]").requestSubmit();
  refreshIcons();
  return d;
}

function knFeeDrawer(j) {
  const d = knShell("knFeeD", "Rincian Biaya — " + j, "wallet");
  d.querySelector("[data-title]").textContent = "Rincian Biaya — " + j;
  const f = knSet.biaya[j], form = d.querySelector("[data-form]");
  form.innerHTML = '<div class="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-5"><div class="text-xs font-bold uppercase text-emerald-100">Estimasi Tahun Pertama</div><div id="knFt" class="font-extrabold text-3xl mt-1">' + fmtRp(knYear1(f)) + '</div><div id="knFs" class="text-xs text-emerald-50/90 mt-1"></div></div>' +
    '<div class="grid sm:grid-cols-2 gap-3">' + KN_FIELDS.map(x => '<label class="block">' + lbl(x[1] + " (Rp)") + '<input name="' + x[0] + '" type="number" min="0" step="1000" value="' + (f[x[0]] || 0) + '" ' + inp + "></label>").join("") + "</div>" +
    '<div class="flex flex-wrap gap-2 pt-2"><button type="button" id="knFzero" ' + btnS + ">Nolkan komponen tahunan</button><button type=\"button\" id=\"knFscale\" " + btnS + ">Naikkan 10% semua</button></div>";
  const sync = () => {
    const o = Object.fromEntries(new FormData(form).entries()); const n = {}; KN_FIELDS.forEach(x => n[x[0]] = +o[x[0]] || 0);
    document.getElementById("knFt").textContent = fmtRp(knYear1(n));
    document.getElementById("knFs").textContent = "Bulanan " + fmtRp(knMonthly(n)) + " • Tahunan " + fmtRp(knYearly(n));
  };
  form.querySelectorAll("input").forEach(i => i.oninput = sync); sync();
  refreshIcons();
  document.getElementById("knFzero").onclick = () => { ["seragam", "buku", "kegiatan_tahunan", "daftar_ulang", "praktikum", "pkl"].forEach(k => form[k].value = 0); sync(); };
  document.getElementById("knFscale").onclick = () => { KN_FIELDS.forEach(x => form[x[0]].value = Math.round((+form[x[0]].value || 0) * 1.1 / 1000) * 1000); sync(); };
  form.onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(form).entries());
    const snap = JSON.parse(JSON.stringify(knSet));
    KN_FIELDS.forEach(x => knSet.biaya[j][x[0]] = +o[x[0]] || 0);
    if (j === knSet.jenjang) knSet.spp_nominal = knSet.biaya[j].spp;
    d.classList.add("hidden"); knRenderBiaya();
    if (!await saveData("settings.json", knSet, "Konten Website", "UPDATE BIAYA", j + " • total tahun 1 " + fmtRp(knYear1(knSet.biaya[j])))) { knSet = snap; knRenderBiaya(); }
  };
  d.classList.remove("hidden");
}

/* ---------------- MODUL: KALENDER AKADEMIK ---------------- */
async function renderKalender() {
  const d = await fetchJSON("kalender.json").catch(() => []);
  knRows = Array.isArray(d) ? d.slice() : [];
  knSel.clear();
  knRenderKal();
}

function knMonthPreview() {
  if (!knPreviewM) return "";
  const p = knPreviewM.split("-"), y = +p[0], m = +p[1] - 1;
  const first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const list = knRows.filter(r => r.status === "Tampil");
  let cells = "";
  for (let i = 0; i < Math.ceil((off + dim) / 7) * 7; i++) {
    const dn = i - off + 1;
    if (dn < 1 || dn > dim) { cells += '<div class="bg-slate-50 rounded-lg"></div>'; continue; }
    const ds = iso(new Date(y, m, dn));
    const evs = list.filter(e => e.mulai <= ds && knEnd(e) >= ds);
    cells += '<div class="bg-white border border-slate-200 rounded-lg p-1 min-h-[62px]"><div class="text-[10px] font-bold text-slate-400">' + dn + "</div>" +
      evs.slice(0, 2).map(e => '<div class="text-[9px] font-bold truncate px-1 rounded bg-' + knColor(e.kategori) + '-100 text-' + knColor(e.kategori) + '-700 mt-0.5">' + esc(e.judul) + "</div>").join("") +
      (evs.length > 2 ? '<div class="text-[9px] text-slate-400">+' + (evs.length - 2) + "</div>" : "") + "</div>";
  }
  return '<div class="p-4 border-b border-slate-100"><div class="grid grid-cols-7 gap-1 mb-1">' + ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(h => '<div class="text-center text-[10px] font-bold text-slate-400">' + h + "</div>").join("") + '</div><div class="grid grid-cols-7 gap-1">' + cells + "</div></div>";
}

function knRenderKal() {
  const rows = knFiltered();
  const tampil = knRows.filter(r => r.status === "Tampil").length;
  const libur = knRows.filter(r => /Libur/.test(r.kategori || "")).length;
  const penting = knRows.filter(r => r.penting).length;
  const allChecked = rows.length > 0 && rows.every(r => knSel.has(r.id));
  const views = knViews();
  const monthsAvail = [...new Set(knRows.map(r => String(r.mulai).slice(0, 7)))].sort();
  const st = (l, v, c, i) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"><div class="flex items-center gap-2 text-xs font-bold text-slate-500"><i data-lucide="' + i + '" class="w-4 h-4 text-' + c + '-600"></i>' + l + '</div><div class="text-2xl font-extrabold text-' + c + '-600 mt-1">' + v + "</div></div>";

  app.innerHTML = pageHead({ title: "Kalender Akademik", desc: "Agenda satu tahun ajaran yang tampil pada kalender.html. Tersimpan di data/kalender.json beserta audit log." }) +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' + st("Total Agenda", knRows.length, "slate", "calendar-days") + st("Tampil", tampil, "emerald", "eye") + st("Hari Libur", libur, "rose", "flag") + st("Agenda Penting", penting, "amber", "star") + "</div>" +
    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200">' +
      '<div class="p-4 border-b border-slate-100 space-y-3"><div class="flex flex-wrap gap-2 items-center">' +
        '<div class="relative flex-1 min-w-[190px]"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input id="knQ" value="' + esc(knView.q) + '" placeholder="Cari agenda, lokasi…" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"></div>' +
        '<select id="knKat" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Semua Kategori</option>' + KN_KAT.map(c => '<option ' + (knView.kat === c ? "selected" : "") + ">" + esc(c) + "</option>").join("") + "</select>" +
        '<select id="knSem" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Semua Semester</option><option ' + (knView.sem === "Ganjil" ? "selected" : "") + '>Ganjil</option><option ' + (knView.sem === "Genap" ? "selected" : "") + ">Genap</option></select>" +
        '<select id="knStatus" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Semua Status</option><option ' + (knView.status === "Tampil" ? "selected" : "") + '>Tampil</option><option ' + (knView.status === "Draft" ? "selected" : "") + ">Draft</option></select>" +
        '<select id="knSort" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="asc" ' + (knView.sort === "asc" ? "selected" : "") + ">Tanggal ↑</option><option value=\"desc\" " + (knView.sort === "desc" ? "selected" : "") + ">Tanggal ↓</option><option value=\"judul\" " + (knView.sort === "judul" ? "selected" : "") + ">Judul A–Z</option><option value=\"kategori\" " + (knView.sort === "kategori" ? "selected" : "") + ">Kategori</option></select>" +
        '<select id="knPv" class="px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">Pratinjau bulan…</option>' + monthsAvail.map(m => '<option value="' + m + '" ' + (knPreviewM === m ? "selected" : "") + ">" + m + "</option>").join("") + "</select>" +
        '<button type="button" id="knCsv" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>CSV</button>' +
        '<button type="button" id="knAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Tambah Agenda</button>' +
      "</div>" +
      '<div class="flex flex-wrap items-center gap-2 text-xs"><span class="font-bold text-slate-400 uppercase">Saved views:</span>' +
        views.map((v, i) => '<span class="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-slate-100 border border-slate-200"><button type="button" data-kv="' + i + '" class="font-bold text-slate-600 hover:text-emerald-700">' + esc(v.name) + '</button><button type="button" data-kvd="' + i + '" class="w-4 h-4 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center">×</button></span>').join("") +
        '<button type="button" id="knSaveView" class="px-2.5 py-1 rounded-full border border-dashed border-slate-300 font-bold text-slate-500 hover:border-emerald-400 hover:text-emerald-700">+ Simpan filter ini</button></div></div>' +
      (knSel.size ? '<div class="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex flex-wrap items-center gap-2 text-sm"><b class="text-emerald-800">' + knSel.size + ' dipilih</b><button type="button" id="knBOn" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">Tampilkan</button><button type="button" id="knBOff" class="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold">Draft</button><button type="button" id="knBStar" class="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold">Tandai Penting</button><button type="button" id="knBDel" class="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold">Hapus</button><button type="button" id="knBClr" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold">Batal pilih</button></div>' : "") +
      knMonthPreview() +
      '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' +
        '<th class="px-3 py-2 w-8"><input type="checkbox" id="knAll" ' + (allChecked ? "checked" : "") + ' class="accent-emerald-600"></th>' +
        '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Tanggal</th><th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Agenda</th>' +
        '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Kategori</th><th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Semester</th>' +
        '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">Status</th><th class="px-3 py-2 text-xs font-bold uppercase text-slate-500 text-center">Penting</th><th class="px-3 py-2 text-xs font-bold uppercase text-slate-500 text-right">Aksi</th>' +
      "</tr></thead><tbody>" +
      (rows.map(r => '<tr class="border-b border-slate-100 hover:bg-slate-50 ' + (knSel.has(r.id) ? "bg-emerald-50/60" : "") + '">' +
        '<td class="px-3 py-2"><input type="checkbox" data-ksel="' + r.id + '" ' + (knSel.has(r.id) ? "checked" : "") + ' class="accent-emerald-600"></td>' +
        '<td class="px-3 py-2 text-xs whitespace-nowrap font-semibold">' + esc(knRange(r)) + '<div class="text-[10px] text-slate-400">' + knDays(r) + " hari</div></td>" +
        '<td class="px-3 py-2"><b class="text-sm block truncate max-w-[260px]">' + esc(r.judul) + '</b><span class="text-[11px] text-slate-500">' + esc(trunc(r.lokasi || "-", 30)) + "</span></td>" +
        '<td class="px-3 py-2"><span class="px-2 py-0.5 rounded-full text-xs font-medium bg-' + knColor(r.kategori) + '-100 text-' + knColor(r.kategori) + '-700">' + esc(r.kategori) + "</span></td>" +
        '<td class="px-3 py-2 text-sm">' + esc(r.semester || "-") + "</td><td class='px-3 py-2'>" + knBadge(r.status) + "</td>" +
        '<td class="px-3 py-2 text-center"><button type="button" data-kstar="' + r.id + '" class="p-1.5 rounded-lg hover:bg-amber-50 ' + (r.penting ? "text-amber-500" : "text-slate-300") + '"><i data-lucide="star" class="w-4 h-4 pointer-events-none"></i></button></td>' +
        '<td class="px-3 py-2 text-right whitespace-nowrap"><button type="button" data-kedit="' + r.id + '" class="p-1.5 rounded-lg hover:bg-slate-100 text-sky-600"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>' +
        '<button type="button" data-kdupe="' + r.id + '" class="p-1.5 rounded-lg hover:bg-slate-100 text-violet-600"><i data-lucide="copy" class="w-4 h-4 pointer-events-none"></i></button>' +
        '<button type="button" data-kdel="' + r.id + '" class="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>').join("") || '<tr><td colspan="8" class="px-3 py-10 text-center text-sm text-slate-400">Belum ada agenda. Klik “Tambah Agenda”.</td></tr>') +
      "</tbody></table></div>" +
      '<div class="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">' + rows.length + " dari " + knRows.length + " agenda • sumber: data/kalender.json</div></div>";
  refreshIcons();
  knWireKal(rows);
}

async function knPersistKal(aksi, detail, snap) {
  const ok = await saveData("kalender.json", knRows, "Konten Website", aksi, detail);
  if (!ok && snap) { knRows = snap; knRenderKal(); }
  return ok;
}

function knWireKal(rows) {
  const q = document.getElementById("knQ");
  if (q) q.oninput = e => { knView.q = e.target.value; knRenderKal(); const n = document.getElementById("knQ"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } };
  [["knKat", "kat"], ["knSem", "sem"], ["knStatus", "status"], ["knSort", "sort"]].forEach(([id, k]) => { const el = document.getElementById(id); if (el) el.onchange = e => { knView[k] = e.target.value; knRenderKal(); }; });
  const pv = document.getElementById("knPv"); if (pv) pv.onchange = e => { knPreviewM = e.target.value; knRenderKal(); };
  document.getElementById("knAdd").onclick = () => knKalDrawer(null);
  document.getElementById("knCsv").onclick = () => download("kalender-akademik.csv", toCSV(knRows.slice().sort((a, b) => a.mulai.localeCompare(b.mulai)), [{ k: "mulai", l: "mulai" }, { k: "selesai", l: "selesai" }, { k: "judul", l: "judul" }, { k: "kategori", l: "kategori" }, { k: "semester", l: "semester" }, { k: "lokasi", l: "lokasi" }, { k: "penting", l: "penting" }, { k: "status", l: "status" }, { k: "keterangan", l: "keterangan" }]), "text/csv");
  const sv = document.getElementById("knSaveView");
  if (sv) sv.onclick = () => { const n = prompt("Nama saved view:", "Agenda " + (knView.kat || knView.sem || "Semua")); if (!n) return; const v = knViews(); v.push({ name: n.slice(0, 28), view: { ...knView } }); knSetViews(v); knRenderKal(); toast("Saved view tersimpan di perangkat ini.", "success"); };
  app.querySelectorAll("[data-kv]").forEach(b => b.onclick = () => { knView = { ...knViews()[+b.dataset.kv].view }; knRenderKal(); });
  app.querySelectorAll("[data-kvd]").forEach(b => b.onclick = () => { const v = knViews(); v.splice(+b.dataset.kvd, 1); knSetViews(v); knRenderKal(); });
  const all = document.getElementById("knAll");
  if (all) all.onchange = e => { rows.forEach(r => e.target.checked ? knSel.add(r.id) : knSel.delete(r.id)); knRenderKal(); };
  app.querySelectorAll("[data-ksel]").forEach(c => c.onchange = e => { e.target.checked ? knSel.add(c.dataset.ksel) : knSel.delete(c.dataset.ksel); knRenderKal(); });
  const bulk = async (fn, aksi) => { if (!knSel.size) return; const snap = knRows.map(r => ({ ...r })); const n = knSel.size; knRows.forEach(r => { if (knSel.has(r.id)) fn(r); }); knSel.clear(); knRenderKal(); await knPersistKal(aksi, n + " agenda diperbarui", snap); };
  const b1 = document.getElementById("knBOn"); if (b1) b1.onclick = () => bulk(r => r.status = "Tampil", "PUBLIKASI AGENDA");
  const b2 = document.getElementById("knBOff"); if (b2) b2.onclick = () => bulk(r => r.status = "Draft", "DRAFT AGENDA");
  const b3 = document.getElementById("knBStar"); if (b3) b3.onclick = () => bulk(r => r.penting = true, "TANDAI PENTING");
  const b4 = document.getElementById("knBClr"); if (b4) b4.onclick = () => { knSel.clear(); knRenderKal(); };
  const b5 = document.getElementById("knBDel");
  if (b5) b5.onclick = () => {
    if (!confirm("Hapus " + knSel.size + " agenda terpilih?")) return;
    const rm = knRows.filter(r => knSel.has(r.id)).map(r => ({ ...r }));
    knRows = knRows.filter(r => !knSel.has(r.id)); knSel.clear(); knRenderKal(); knUndoShow(rm);
    knPersistKal("HAPUS MASSAL AGENDA", rm.length + " agenda dihapus", null);
  };
  app.querySelectorAll("[data-kedit]").forEach(b => b.onclick = () => knKalDrawer(knRows.find(r => r.id === b.dataset.kedit)));
  app.querySelectorAll("[data-kdupe]").forEach(b => b.onclick = async () => {
    const s = knRows.find(r => r.id === b.dataset.kdupe); if (!s) return;
    const snap = knRows.map(r => ({ ...r }));
    knRows.splice(knRows.findIndex(r => r.id === s.id) + 1, 0, { ...s, id: uid(), judul: s.judul + " (Salinan)", status: "Draft" });
    knRenderKal(); await knPersistKal("DUPLIKAT AGENDA", s.judul, snap);
  });
  app.querySelectorAll("[data-kstar]").forEach(b => b.onclick = async () => {
    const r = knRows.find(x => x.id === b.dataset.kstar); if (!r) return;
    const snap = knRows.map(x => ({ ...x })); r.penting = !r.penting; knRenderKal();
    await knPersistKal("TANDAI AGENDA", r.judul + " → " + (r.penting ? "penting" : "biasa"), snap);
  });
  app.querySelectorAll("[data-kdel]").forEach(b => b.onclick = () => {
    const r = knRows.find(x => x.id === b.dataset.kdel); if (!r || !confirm('Hapus agenda "' + r.judul + '"?')) return;
    const snap = knRows.map(x => ({ ...x }));
    knRows = knRows.filter(x => x.id !== r.id); knRenderKal(); knUndoShow([{ ...r }]);
    knPersistKal("HAPUS AGENDA", r.judul, snap);
  });
}

function knUndoShow(items) {
  knUndo = items;
  let bar = document.getElementById("knUndoBar");
  if (!bar) { bar = document.createElement("div"); bar.id = "knUndoBar"; document.body.appendChild(bar); }
  bar.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-sm";
  bar.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 text-rose-400"></i><span>' + items.length + ' agenda dihapus</span><button type="button" id="knUndoBtn" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-900">Urungkan</button>';
  refreshIcons();
  document.getElementById("knUndoBtn").onclick = async () => {
    if (!knUndo) return; const back = knUndo; knUndo = null;
    knRows = knRows.concat(back); knRenderKal();
    const b = document.getElementById("knUndoBar"); if (b) b.remove();
    await knPersistKal("URUNGKAN HAPUS AGENDA", back.length + " agenda dipulihkan", null);
  };
  clearTimeout(knUndoT);
  knUndoT = setTimeout(() => { const b = document.getElementById("knUndoBar"); if (b) b.remove(); knUndo = null; }, 9000);
}

function knKalDrawer(row) {
  const d = knShell("knKalD", "Agenda", "calendar-days");
  d.querySelector("[data-title]").textContent = row ? "Edit Agenda" : "Tambah Agenda";
  knEditId = row ? row.id : null;
  const v = row || { judul: "", kategori: KN_KAT[0], mulai: today(), selesai: "", semester: "Ganjil", lokasi: "", keterangan: "", penting: false, status: "Tampil" };
  const form = d.querySelector("[data-form]");
  form.innerHTML = '<div id="knPv" class="rounded-2xl p-5 text-white" style="background:linear-gradient(135deg,#059669,#0f172a)"><div id="knPvK" class="text-[11px] font-bold uppercase tracking-wider"></div><div id="knPvJ" class="font-extrabold text-xl mt-1"></div><div id="knPvT" class="text-xs text-white/85 mt-1"></div></div>' +
    '<label class="block">' + lbl("Judul Agenda *") + '<input name="judul" required value="' + esc(v.judul) + '" ' + inp + "></label>" +
    '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block">' + lbl("Kategori *") + '<select name="kategori" ' + inp + ">" + KN_KAT.map(c => '<option ' + (v.kategori === c ? "selected" : "") + ">" + esc(c) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Semester") + '<select name="semester" ' + inp + "><option " + (v.semester === "Ganjil" ? "selected" : "") + ">Ganjil</option><option " + (v.semester === "Genap" ? "selected" : "") + ">Genap</option></select></label>" +
    "</div>" +
    '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block">' + lbl("Tanggal Mulai *") + '<input name="mulai" type="date" required value="' + esc(v.mulai) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Tanggal Selesai") + '<input name="selesai" type="date" value="' + esc(v.selesai || "") + '" ' + inp + "></label>" +
    "</div>" +
    '<label class="block">' + lbl("Lokasi") + '<input name="lokasi" value="' + esc(v.lokasi) + '" ' + inp + "></label>" +
    '<label class="block">' + lbl("Keterangan") + '<textarea name="keterangan" rows="4" ' + inp + ">" + esc(v.keterangan) + "</textarea></label>" +
    '<div class="grid sm:grid-cols-2 gap-3 items-end">' +
      '<label class="block">' + lbl("Status") + '<select name="status" ' + inp + "><option " + (v.status === "Tampil" ? "selected" : "") + ">Tampil</option><option " + (v.status === "Draft" ? "selected" : "") + ">Draft</option></select></label>" +
      '<label class="flex items-center gap-2 pb-2 text-sm font-semibold text-slate-600"><input type="checkbox" name="penting" ' + (v.penting ? "checked" : "") + ' class="w-4 h-4 accent-amber-500">Agenda penting</label>' +
    "</div>";
  const COL = { "Akademik": "#059669", "Asesmen": "#7c3aed", "Kegiatan": "#0284c7", "PPDB": "#d97706", "Keagamaan": "#4f46e5", "Rapat Orang Tua": "#0d9488", "Libur Nasional": "#e11d48", "Libur Semester": "#ea580c" };
  const sync = () => {
    document.getElementById("knPv").style.background = "linear-gradient(135deg," + (COL[form.kategori.value] || "#059669") + ",#0f172a)";
    document.getElementById("knPvK").textContent = form.kategori.value + (form.penting.checked ? " • ★ Penting" : "");
    document.getElementById("knPvJ").textContent = form.judul.value || "Judul agenda";
    const a = form.mulai.value, b = form.selesai.value;
    document.getElementById("knPvT").textContent = b && b >= a ? fmtTgl(a) + " – " + fmtTgl(b) : fmtTgl(a);
  };
  form.querySelectorAll("input,select,textarea").forEach(i => { i.oninput = sync; i.onchange = sync; }); sync();
  refreshIcons();
  form.onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(form).entries());
    if (o.selesai && o.selesai < o.mulai) { toast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "error"); return; }
    const rec = { id: row ? row.id : uid(), judul: o.judul.trim(), kategori: o.kategori, mulai: o.mulai, selesai: o.selesai || "", semester: o.semester, lokasi: o.lokasi.trim(), keterangan: o.keterangan.trim(), penting: !!o.penting, status: o.status };
    const snap = knRows.map(r => ({ ...r }));
    if (row) knRows[knRows.findIndex(r => r.id === row.id)] = rec; else knRows.push(rec);
    d.classList.add("hidden"); knRenderKal();
    await knPersistKal(row ? "EDIT AGENDA" : "TAMBAH AGENDA", rec.judul + " (" + rec.mulai + ")", snap);
  };
  d.classList.remove("hidden");
  setTimeout(() => form.judul.focus(), 60);
}

MOD.biaya = { title: "Biaya Pendidikan", desc: "Tuition Fee per jenjang", render: renderBiaya };
MOD.kalender = { title: "Kalender Akademik", desc: "Agenda tahun ajaran", render: renderKalender };

// (Menu sidebar kini dirender terpusat oleh admin-router.js — tidak ada lagi injeksi menu per modul.)
