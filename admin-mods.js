// ============================================================
// admin-mods.js — Modul kustom (bagian 2/3): Absensi QR, e-Rapor,
// Ujian CBT, SPP, Penggajian, Audit Log, Chat Wali Kelas.
// Dimuat SETELAH admin.js. TOKEN TIDAK BOLEH DI-HARDCODE
// ============================================================
let absTab = "rekap", scanner = null, scanLock = 0;
function stopScanner() { if (scanner) { try { scanner.stop().then(() => scanner.clear()).catch(() => {}); } catch (e) {} scanner = null; } }
async function renderAbsensi() {
  const m = MOD.absensi;
  const tabs = { rekap: "Rekap Harian", manual: "Input Manual", scan: "Scan QR", qr: "Kartu QR Siswa" };
  app.innerHTML = pageHead(m) + '<div class="flex flex-wrap gap-2 mb-4">' + Object.keys(tabs).map(t =>
    '<button type="button" data-tab="' + t + '" class="px-4 py-2 rounded-lg text-sm font-bold ' + (absTab === t ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50") + '">' + tabs[t] + "</button>").join("") + '</div><div id="absBody"></div>';
  app.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { stopScanner(); absTab = b.dataset.tab; renderAbsensi(); });
  const B = document.getElementById("absBody");
  if (absTab === "rekap") await absRekap(B);
  if (absTab === "manual") await absManual(B);
  if (absTab === "scan") absScan(B);
  if (absTab === "qr") await absQR(B);
  refreshIcons();
}
async function absRekap(B, tgl = today()) {
  const [abs, siswa] = await Promise.all([fetchJSON("absensi.json"), fetchJSON("siswa.json")]);
  const rows = abs.filter(a => a.tanggal === tgl);
  const cnt = s => rows.filter(r => r.status === s).length;
  B.innerHTML = card('<div class="flex flex-wrap items-end gap-3 mb-4"><label class="block">' + lbl("Tanggal") + '<input id="aTgl" type="date" value="' + tgl + '" ' + inp + "></label>" +
    ["Hadir", "Sakit", "Izin", "Alfa"].map(s => '<span class="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold">' + s + ": " + cnt(s) + "</span>").join("") +
    '<span class="text-sm text-slate-500">dari ' + siswa.filter(s => s.status === "Aktif").length + " siswa aktif</span></div>" +
    '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Jam", "NIS", "Nama", "Kelas", "Status", "Metode", ""].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" +
    (rows.map(r => '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-sm">' + esc(r.jam) + '</td><td class="px-3 py-2 text-sm font-mono">' + esc(r.nis) + '</td><td class="px-3 py-2 text-sm font-semibold">' + esc(r.nama) + '</td><td class="px-3 py-2 text-sm">' + esc(r.kelas) + "</td><td class='px-3 py-2'>" + badge(r.status) + '</td><td class="px-3 py-2 text-sm">' + esc(r.metode) + '</td><td class="px-3 py-2 text-right"><button type="button" data-del="' + r.id + '" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>').join("") || emptyRow) +
    "</tbody></table></div>");
  refreshIcons();
  document.getElementById("aTgl").onchange = e => absRekap(B, e.target.value);
  B.onclick = async e => {
    const b = e.target.closest("button[data-del]"); if (!b) return;
    if (!confirm("Hapus catatan absensi ini?")) return;
    const all = await fetchJSON("absensi.json");
    if (await saveData("absensi.json", all.filter(x => x.id !== b.dataset.del), "Absensi", "HAPUS ABSENSI", tgl)) absRekap(B, tgl);
  };
}
async function absManual(B) {
  const siswa = await fetchJSON("siswa.json");
  B.innerHTML = card('<form id="fAbs" class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">' +
    '<label class="block lg:col-span-2">' + lbl("Siswa *") + '<select name="nis" ' + inp + ' required><option value="">— pilih —</option>' + siswa.map(s => '<option value="' + esc(s.nis) + '">' + esc(s.nis + " — " + s.nama + " (" + s.kelas + ")") + "</option>").join("") + "</select></label>" +
    '<label class="block">' + lbl("Tanggal") + '<input name="tanggal" type="date" value="' + today() + '" ' + inp + "></label>" +
    '<label class="block">' + lbl("Status") + '<select name="status" ' + inp + ">" + ["Hadir", "Sakit", "Izin", "Alfa"].map(s => "<option>" + s + "</option>").join("") + "</select></label>" +
    '<button ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Catat</button></form>');
  refreshIcons();
  document.getElementById("fAbs").onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target).entries());
    const s = siswa.find(x => x.nis === o.nis);
    const abs = await fetchJSON("absensi.json");
    if (abs.some(a => a.nis === o.nis && a.tanggal === o.tanggal)) return toast("Siswa sudah tercatat pada tanggal itu.", "info");
    abs.unshift({ id: uid(), tanggal: o.tanggal, nis: s.nis, nama: s.nama, kelas: s.kelas, status: o.status, metode: "Manual", jam: nowTime() });
    if (await saveData("absensi.json", abs, "Absensi", "INPUT ABSENSI", s.nama + " " + o.status + " " + o.tanggal)) absManual(B);
  };
}
function absScan(B) {
  B.innerHTML = card('<p class="text-sm text-slate-500 mb-3">Arahkan kamera ke kartu QR siswa (isi QR: <code>SIS:NIS</code>). Kamera aktif hanya di <b>HTTPS</b> (GitHub Pages) atau localhost.</p>' +
    '<div class="flex gap-2 mb-3"><button type="button" id="scanOn" ' + btnP + '><i data-lucide="scan-line" class="w-4 h-4"></i>Mulai Scan</button><button type="button" id="scanOff" ' + btnS + ">Stop</button></div>" +
    '<div id="reader" class="w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-slate-900"></div><ul id="scanLog" class="mt-4 space-y-1 text-sm"></ul>');
  refreshIcons();
  document.getElementById("scanOn").onclick = async () => {
    if (scanner) return;
    scanner = new Html5Qrcode("reader");
    try {
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 240, height: 240 } }, async txt => {
        if (Date.now() - scanLock < 2500) return; scanLock = Date.now();
        const nis = txt.startsWith("SIS:") ? txt.slice(4) : txt.trim();
        const siswa = await fetchJSON("siswa.json");
        const s = siswa.find(x => x.nis === nis);
        const log = document.getElementById("scanLog");
        if (!s) { log.innerHTML = '<li class="text-rose-600">✗ QR tidak dikenal: ' + esc(nis) + "</li>" + log.innerHTML; return; }
        const abs = await fetchJSON("absensi.json");
        if (abs.some(a => a.nis === nis && a.tanggal === today())) { toast(s.nama + " sudah absen hari ini.", "info"); return; }
        abs.unshift({ id: uid(), tanggal: today(), nis: s.nis, nama: s.nama, kelas: s.kelas, status: "Hadir", metode: "QR", jam: nowTime() });
        if (await saveData("absensi.json", abs, "Absensi", "SCAN QR", s.nama + " Hadir"))
          log.innerHTML = '<li class="text-emerald-700 font-semibold">✓ ' + esc(s.nama) + " (" + esc(s.kelas) + ") — Hadir " + nowTime() + "</li>" + log.innerHTML;
      }, () => {});
    } catch (e) { toast("Kamera gagal: " + e.message, "error"); scanner = null; }
  };
  document.getElementById("scanOff").onclick = stopScanner;
}
async function absQR(B) {
  const [siswa, kelas] = await Promise.all([fetchJSON("siswa.json"), fetchJSON("kelas.json")]);
  B.innerHTML = card('<div class="flex flex-wrap items-end gap-3 mb-4"><label class="block">' + lbl("Kelas") + '<select id="qrKelas" ' + inp + '><option value="">Semua Kelas</option>' + kelas.map(k => "<option>" + esc(k.nama) + "</option>").join("") + "</select></label>" +
    '<button type="button" id="qrGen" ' + btnP + '><i data-lucide="qr-code" class="w-4 h-4"></i>Buat Kartu QR</button><button type="button" id="qrPrint" ' + btnS + '><i data-lucide="printer" class="w-4 h-4"></i>Cetak</button></div><div id="qrGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"></div>');
  refreshIcons();
  document.getElementById("qrGen").onclick = () => {
    const k = document.getElementById("qrKelas").value;
    const list = siswa.filter(s => s.status === "Aktif" && (!k || s.kelas === k));
    const grid = document.getElementById("qrGrid");
    grid.innerHTML = list.map(s => '<div class="qrc border border-slate-200 rounded-xl p-3 text-center" data-nis="' + esc(s.nis) + '" data-nama="' + esc(s.nama) + '" data-kelas="' + esc(s.kelas) + '"><div class="flex justify-center" id="qr-' + esc(s.nis) + '"></div><div class="mt-2 text-xs font-bold">' + esc(s.nama) + '</div><div class="text-[11px] text-slate-500">' + esc(s.nis) + " • " + esc(s.kelas) + "</div></div>").join("");
    list.forEach(s => new QRCode(document.getElementById("qr-" + s.nis), { text: "SIS:" + s.nis, width: 96, height: 96 }));
  };
  document.getElementById("qrPrint").onclick = () => {
    const cards = [...document.querySelectorAll("#qrGrid .qrc")].map(el => {
      const c = el.querySelector("canvas");
      return { img: c ? c.toDataURL("image/png") : "", nama: el.dataset.nama, kelas: el.dataset.kelas, nis: el.dataset.nis };
    });
    if (!cards.length) return toast("Buat kartu QR terlebih dahulu.", "info");
    printHTML("Kartu QR Absensi", "<h2>Kartu QR Absensi Siswa</h2><p class='muted'>Scan dengan modul Absensi → Scan QR di admin.</p><div class='grid'>" +
      cards.map(c => '<div class="card"><img src="' + c.img + '" width="110"><div><b>' + esc(c.nama) + "</b></div><div class='muted'>" + esc(c.nis) + " • " + esc(c.kelas) + "</div></div>").join("") + "</div>");
  };
}
const predikatKM = n => n >= 81 ? "Mahir" : n >= 71 ? "Cakap" : n >= 61 ? "Dasar" : "Perlu Bimbingan";
const predikatK13 = n => n >= 85 ? "A" : n >= 70 ? "B" : n >= 55 ? "C" : "D";
function raporBody(s, nilai, abs, kur, sem, st, wali) {
  const mapel = {};
  nilai.forEach(n => { (mapel[n.mapel] = mapel[n.mapel] || []).push(Number(n.nilai) || 0); });
  const rows = Object.entries(mapel).map(([mp, arr], i) => {
    const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    return "<tr><td class='center'>" + (i + 1) + "</td><td>" + esc(mp) + "</td><td class='center'>" + avg + "</td><td class='center'>" + (kur === "Merdeka" ? predikatKM(avg) : predikatK13(avg)) + "</td></tr>";
  }).join("") || "<tr><td colspan='4' class='center muted'>Belum ada nilai pada semester ini.</td></tr>";
  const cnt = stt => abs.filter(a => a.nis === s.nis && a.status === stt).length;
  const rata = Object.values(mapel).length ? Math.round(Object.values(mapel).flat().reduce((a, b) => a + b, 0) / Object.values(mapel).flat().length) : 0;
  return "<div class='center'><h2>" + esc(st.nama_sekolah) + "</h2><div class='muted'>NPSN " + esc(st.npsn) + " • " + esc(st.alamat) + "</div><hr><h3>LAPORAN HASIL BELAJAR (e-RAPOR)</h3><div class='muted'>Kurikulum " + (kur === "Merdeka" ? "Merdeka" : "2013") + " • Semester " + esc(sem) + " • Tahun Ajaran " + esc(st.tahun_ajaran) + "</div></div>" +
    "<table><tr><th>Nama Peserta Didik</th><td><b>" + esc(s.nama) + "</b></td><th>NIS / NISN</th><td>" + esc(s.nis) + " / " + esc(s.nisn) + "</td></tr>" +
    "<tr><th>Kelas / Rombel</th><td>" + esc(s.kelas) + "</td><th>Wali Kelas</th><td>" + esc(wali ? wali.nama : "-") + "</td></tr></table>" +
    "<h3>A. Capaian Akademik</h3><table><tr><th style='width:36px'>No</th><th>Mata Pelajaran</th><th>" + (kur === "Merdeka" ? "Rata-rata" : "Nilai Akhir") + "</th><th>Predikat</th></tr>" + rows +
    "<tr><th colspan='2' class='right'>Rata-rata Keseluruhan</th><th class='center'>" + rata + "</th><th class='center'>" + (kur === "Merdeka" ? predikatKM(rata) : predikatK13(rata)) + "</th></tr></table>" +
    (kur === "Merdeka" ? "<p class='muted'>Predikat KKTP: 81–100 Mahir • 71–80 Cakap • 61–70 Dasar • 0–60 Perlu Bimbingan.</p>" : "<p class='muted'>Predikat K13: A (85–100), B (70–84), C (55–69), D (&lt;55). KKM sekolah: " + esc(st.kkm) + ".</p>") +
    "<h3>B. Ketidakhadiran</h3><table><tr><th>Sakit</th><td>" + cnt("Sakit") + " hari</td><th>Izin</th><td>" + cnt("Izin") + " hari</td><th>Tanpa Keterangan</th><td>" + cnt("Alfa") + " hari</td></tr></table>" +
    "<h3>C. Catatan Wali Kelas</h3><p>Terus pertahankan semangat belajar dan tingkatkan kedisiplinan. Terima kasih kepada orang tua atas pendampingannya.</p>" +
    "<div class='ttd'><div>Orang Tua/Wali<br><br><br><br>(........................)</div><div>Wali Kelas<br><br><br><br><b>" + esc(wali ? wali.nama : "........................") + "</b></div><div>" + esc(st.alamat.split(",")[0]) + ", " + fmtTgl(today()) + "<br>Kepala Sekolah<br><br><br><b>" + esc(st.kepala_sekolah) + "</b><br>NIP. " + esc(st.nip_kepsek) + "</div></div>";
}
async function renderRapor() {
  const [siswa, st, kelas, guru] = await Promise.all([fetchJSON("siswa.json"), fetchJSON("settings.json"), fetchJSON("kelas.json"), fetchJSON("guru.json")]);
  app.innerHTML = pageHead(MOD.rapor) + card('<div class="grid sm:grid-cols-4 gap-3 items-end">' +
    '<label class="block">' + lbl("Siswa *") + '<select id="rSiswa" ' + inp + '><option value="">— pilih —</option>' + siswa.map(s => '<option value="' + esc(s.nis) + '">' + esc(s.nama + " (" + s.kelas + ")") + "</option>").join("") + "</select></label>" +
    '<label class="block">' + lbl("Kurikulum") + '<select id="rKur" ' + inp + '><option ' + (st.kurikulum === "Merdeka" ? "selected" : "") + '>Merdeka</option><option ' + (st.kurikulum === "K13" ? "selected" : "") + ">K13</option></select></label>" +
    '<label class="block">' + lbl("Semester") + '<select id="rSem" ' + inp + "><option " + (st.semester === "Ganjil" ? "selected" : "") + ">Ganjil</option><option " + (st.semester === "Genap" ? "selected" : "") + ">Genap</option></select></label>" +
    '<div class="flex gap-2"><button type="button" id="rShow" ' + btnP + '><i data-lucide="eye" class="w-4 h-4"></i>Tampilkan</button><button type="button" id="rPrint" ' + btnS + '><i data-lucide="printer" class="w-4 h-4"></i>Cetak</button></div></div>') +
    '<div id="raporOut" class="mt-4"></div>';
  refreshIcons();
  let lastDoc = "";
  document.getElementById("rShow").onclick = async () => {
    const nis = document.getElementById("rSiswa").value;
    if (!nis) return toast("Pilih siswa dahulu.", "info");
    const s = siswa.find(x => x.nis === nis);
    const sem = document.getElementById("rSem").value, kur = document.getElementById("rKur").value;
    const [nilai, abs] = await Promise.all([fetchJSON("nilai.json"), fetchJSON("absensi.json").catch(() => [])]);
    const k = kelas.find(x => x.nama === s.kelas);
    const wali = guru.find(g => k && g.id === k.wali_kelas);
    const bodyR = raporBody(s, nilai.filter(n => n.nis === nis && n.semester === sem), abs, kur, sem, st, wali);
    lastDoc = "<!DOCTYPE html><html><head><title>Rapor " + esc(s.nama) + "</title><style>" + PRINT_CSS + "</style></head><body>" + bodyR + "</body></html>";
    document.getElementById("raporOut").innerHTML = '<iframe class="w-full h-[75vh] bg-white rounded-2xl border border-slate-200 shadow-sm" srcdoc="' + esc(lastDoc) + '"></iframe>';
  };
  document.getElementById("rPrint").onclick = () => {
    if (!lastDoc) return toast("Klik Tampilkan dahulu.", "info");
    openPrintWindow(lastDoc);
  };
}
async function renderUjian() {
  const [ujian, soal, st, kelas] = await Promise.all([fetchJSON("ujian.json"), fetchJSON("soal.json"), fetchJSON("settings.json"), fetchJSON("kelas.json")]);
  mem["ujian.json"] = ujian;
  const rows = ujian.map(u => '<tr class="border-b border-slate-100 hover:bg-slate-50"><td class="px-3 py-2 text-sm font-semibold">' + esc(u.judul) + '</td><td class="px-3 py-2 text-sm">' + esc(u.mapel) + '</td><td class="px-3 py-2 text-sm">' + esc(u.kelas) + '</td><td class="px-3 py-2 text-sm">' + u.durasi + ' mnt</td><td class="px-3 py-2 text-sm font-mono">' + esc(u.token) + '</td><td class="px-3 py-2 text-sm">' + (u.soal_ids || []).length + ' soal</td><td class="px-3 py-2">' + badge(u.status) + '</td><td class="px-3 py-2 text-right whitespace-nowrap"><a href="cbt.html" target="_blank" title="Buka halaman CBT" class="inline-block p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><i data-lucide="arrow-right" class="w-4 h-4"></i></a><button type="button" data-edit="' + u.id + '" class="p-1.5 text-sky-600 hover:bg-slate-100 rounded-lg"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button><button type="button" data-del="' + u.id + '" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>').join("") || emptyRow;
  app.innerHTML = pageHead(MOD.ujian) + '<div class="bg-white rounded-2xl shadow-sm border border-slate-200"><div class="p-4 flex flex-wrap gap-2 border-b border-slate-100">' +
    '<button type="button" id="uAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Buat Ujian</button>' +
    '<label class="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-sm font-bold px-4 py-2 rounded-lg cursor-pointer"><i data-lucide="upload" class="w-4 h-4"></i>Impor Hasil CBT (JSON)<input id="uImp" type="file" accept=".json" class="hidden"></label>' +
    '<span class="text-xs text-slate-500 self-center">Siswa mengunduh file hasil dari cbt.html → guru impor di sini → otomatis masuk nilai (jenis CBT).</span></div>' +
    '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Judul", "Mapel", "Kelas", "Durasi", "Token", "Jumlah", "Status", "Aksi"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" + rows + "</tbody></table></div></div>";
  refreshIcons();
  function formUjian(u) {
    const checked = new Set(u ? u.soal_ids || [] : []);
    const body = '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block sm:col-span-2">' + lbl("Judul Ujian *") + '<input name="judul" value="' + esc(u ? u.judul : "") + '" ' + inp + ' required></label>' +
      '<label class="block">' + lbl("Mapel *") + '<select name="mapel" id="uMapel" ' + inp + ' required><option value="">— pilih —</option>' + st.mapel.map(m => '<option ' + (u && u.mapel === m ? "selected" : "") + ">" + esc(m) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Kelas *") + '<select name="kelas" ' + inp + ' required><option value="">— pilih —</option>' + kelas.map(k => '<option ' + (u && u.kelas === k.nama ? "selected" : "") + ">" + esc(k.nama) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Durasi (menit)") + '<input name="durasi" type="number" min="1" value="' + (u ? u.durasi : 30) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Token Ujian *") + '<input name="token" value="' + esc(u ? u.token : "") + '" ' + inp + ' required placeholder="mis. MTK7A"></label>' +
      '<label class="block">' + lbl("Tanggal") + '<input name="tanggal" type="date" value="' + (u ? u.tanggal : today()) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Status") + '<select name="status" ' + inp + ">" + ["Draft", "Aktif", "Selesai"].map(s => '<option ' + (u && u.status === s ? "selected" : "") + ">" + s + "</option>").join("") + "</select></label></div>" +
      '<div class="mt-4">' + lbl("Pilih Soal dari Bank Soal (minimal 1)") + '<div id="soalBox" class="mt-1 border border-slate-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-slate-100"></div></div>';
    openModal((u ? "Edit" : "Buat") + " Ujian CBT", body, async (obj, form) => {
      const ids = [...form.querySelectorAll('input[name="soal"]:checked')].map(i => i.value);
      if (!ids.length) { toast("Pilih minimal 1 soal.", "error"); return false; }
      const data = { id: u ? u.id : uid(), judul: obj.judul, mapel: obj.mapel, kelas: obj.kelas, durasi: Number(obj.durasi) || 30, token: obj.token.trim(), tanggal: obj.tanggal, status: obj.status, soal_ids: ids };
      const arr = [...ujian];
      if (u) arr[arr.findIndex(x => x.id === u.id)] = data; else arr.unshift(data);
      const ok = await saveData("ujian.json", arr, "LMS/CBT", u ? "EDIT UJIAN" : "BUAT UJIAN", data.judul);
      if (ok) route();
      return ok;
    });
    const draw = () => {
      const mp = document.getElementById("uMapel").value;
      const list = soal.filter(s => !mp || s.mapel === mp);
      document.getElementById("soalBox").innerHTML = list.map(s =>
        '<label class="flex items-start gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"><input type="checkbox" name="soal" value="' + s.id + '" ' + (checked.has(s.id) ? "checked" : "") + ' class="mt-1 accent-emerald-600"><span><b>[' + esc(s.mapel) + "]</b> " + esc(trunc(s.pertanyaan, 90)) + ' <span class="text-xs text-slate-400">(kunci ' + esc(s.kunci) + ")</span></span></label>"
      ).join("") || '<div class="px-3 py-4 text-sm text-slate-400">Tidak ada soal untuk mapel ini. Tambah di Bank Soal.</div>';
      document.querySelectorAll('input[name="soal"]').forEach(i => i.onchange = () => i.checked ? checked.add(i.value) : checked.delete(i.value));
    };
    document.getElementById("uMapel").onchange = draw; draw();
  }
  document.getElementById("uAdd").onclick = () => formUjian(null);
  app.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.edit) formUjian(ujian.find(x => x.id === b.dataset.edit));
    else if (b.dataset.del && confirm("Hapus ujian ini?")) {
      if (await saveData("ujian.json", ujian.filter(x => x.id !== b.dataset.del), "LMS/CBT", "HAPUS UJIAN", b.dataset.del)) route();
    }
  };
  document.getElementById("uImp").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      let hs = JSON.parse(await f.text()); if (!Array.isArray(hs)) hs = [hs];
      const nilai = await fetchJSON("nilai.json"); const siswa = await fetchJSON("siswa.json");
      let n = 0;
      for (const h of hs) {
        const u = ujian.find(x => x.id === h.ujian_id); const s = siswa.find(x => x.nis === h.nis);
        if (!u || !s || h.nilai === undefined) continue;
        nilai.unshift({ id: uid(), nis: h.nis, mapel: u.mapel, jenis: "CBT", tp: u.judul, nilai: Number(h.nilai), semester: st.semester, tahun_ajaran: st.tahun_ajaran });
        n++;
      }
      if (!n) return toast("Tidak ada hasil valid pada file (perlu ujian_id, nis, nilai).", "error");
      if (await saveData("nilai.json", nilai, "LMS/CBT", "IMPOR HASIL CBT", n + " hasil dari " + f.name)) route();
    } catch (err) { toast("File tidak valid: " + err.message, "error"); }
    e.target.value = "";
  };
}
