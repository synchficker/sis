// ============================================================
// admin-rapor.js — e-Rapor Merdeka/K13 (#/rapor).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

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

MOD.rapor = { title: "e-Rapor", desc: "Kurikulum Merdeka (rata-rata + predikat KKTP) & K13 (angka + predikat). Cetak PDF via dialog print.", render: "renderRapor" };
