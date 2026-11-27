// ============================================================
// admin-laporan.js — Pelaporan Dinas: Dapodik, ANBK, BOS (#/laporan).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

async function renderLaporan() {
  const st = await fetchJSON("settings.json");
  const item = (id, icon, judul, ket, label) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3"><i data-lucide="' + icon + '" class="w-5 h-5"></i></div><b class="text-sm">' + judul + '</b><p class="text-xs text-slate-500 mt-1 mb-3">' + ket + '</p><button type="button" id="' + id + '" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>' + label + "</button></div>";
  app.innerHTML = pageHead(MOD.laporan) +
    '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
    item("expDapodik", "users", "Export Dapodik — Siswa", "CSV kolom selaras template Dapodik: NISN, identitas, TTL, agama, nama ortu, rombel.", "Unduh CSV") +
    item("expDapodikJ", "users", "Export Dapodik — JSON", "Seluruh field siswa.json mentah untuk mapping aplikasi Dapodik.", "Unduh JSON") +
    item("expAnbk", "clipboard-list", "Peserta ANBK", "CSV peserta ANBK (kelas 5 SD / 8 SMP / 11 SMA-SMK) + nama ibu kandung utk verifikasi.", "Unduh CSV") +
    item("expBos", "landmark", "Laporan BOS — BKU CSV", "Buku Kas Umum BOS: seluruh penerimaan & pengeluaran.", "Unduh CSV") +
    item("printBos", "printer", "Laporan BOS — Cetak", "BKU + rekap per kategori juknis + saldo, siap tanda tangan bendahara.", "Cetak PDF") +
    item("expAbs", "calendar-check", "Rekap Absensi Siswa", "CSV seluruh catatan absensi (QR & manual) untuk lampiran laporan dinas.", "Unduh CSV") +
    item("expNilai", "clipboard-list", "Rekap Nilai", "CSV seluruh nilai (formatif, sumatif, CBT) per semester.", "Unduh CSV") +
    item("expInv", "boxes", "Inventaris (KIB)", "CSV daftar barang: kode, kondisi, lokasi, sumber dana.", "Unduh CSV") +
    "</div>" +
    '<p class="text-xs text-slate-500 mt-4">Catatan: file CSV mengikuti struktur kolom umum Dapodik/ANBK/BOS. Sesuaikan header dengan template resmi terbaru dari dinas/kemendikbud sebelum unggah.</p>';
  refreshIcons();
  const colsDapodik = [{ k: "nisn", l: "nisn" }, { k: "nama", l: "nama_lengkap" }, { k: "jk", l: "jenis_kelamin" }, { k: "nis", l: "nis" }, { k: "tempat_lahir", l: "tempat_lahir" }, { k: "tanggal_lahir", l: "tanggal_lahir" }, { k: "agama", l: "agama" }, { k: "nama_ayah", l: "nama_ayah" }, { k: "nama_ibu", l: "nama_ibu" }, { k: "alamat", l: "alamat" }, { k: "kelas", l: "rombel" }, { k: "status", l: "status" }, { k: "tanggal_masuk", l: "tanggal_masuk" }];
  document.getElementById("expDapodik").onclick = async () => download("dapodik-siswa-" + st.npsn + ".csv", toCSV(await fetchJSON("siswa.json"), colsDapodik), "text/csv");
  document.getElementById("expDapodikJ").onclick = async () => download("dapodik-siswa-" + st.npsn + ".json", JSON.stringify(await fetchJSON("siswa.json"), null, 2));
  document.getElementById("expAnbk").onclick = async () => {
    const [siswa, kelas] = await Promise.all([fetchJSON("siswa.json"), fetchJSON("kelas.json")]);
    const eligible = siswa.filter(s => { const k = kelas.find(x => x.nama === s.kelas); return k && ["5", "8", "11"].includes(String(k.tingkat)) && s.status === "Aktif"; });
    if (!eligible.length) toast("Tidak ada siswa kelas 5/8/11 (kelas penarikan ANBK). File berisi header saja.", "info");
    download("anbk-peserta-" + st.npsn + ".csv", toCSV(eligible, [{ k: "nisn", l: "nisn" }, { k: "nama", l: "nama_peserta" }, { k: "jk", l: "jenis_kelamin" }, { k: "tempat_lahir", l: "tempat_lahir" }, { k: "tanggal_lahir", l: "tanggal_lahir" }, { k: "kelas", l: "rombel" }, { k: "nama_ibu", l: "nama_ibu_kandung" }]), "text/csv");
  };
  document.getElementById("expBos").onclick = async () => download("bos-bku-" + st.npsn + ".csv", toCSV(await fetchJSON("bos.json"), [{ k: "tanggal", l: "tanggal" }, { k: "jenis", l: "jenis" }, { k: "kategori", l: "kategori" }, { k: "uraian", l: "uraian" }, { k: "jumlah", l: "jumlah_rp" }, { k: "triwulan", l: "triwulan" }, { k: "tahun", l: "tahun" }]), "text/csv");
  document.getElementById("printBos").onclick = async () => {
    const bos = (await fetchJSON("bos.json")).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const masuk = bos.filter(b => b.jenis === "Penerimaan").reduce((a, b) => a + b.jumlah, 0);
    const keluar = bos.filter(b => b.jenis === "Pengeluaran").reduce((a, b) => a + b.jumlah, 0);
    const kat = {};
    bos.filter(b => b.jenis === "Pengeluaran").forEach(b => { kat[b.kategori] = (kat[b.kategori] || 0) + b.jumlah; });
    printHTML("Laporan BOS", "<div class='center'><h2>LAPORAN PENGGUNAAN DANA BOS</h2><div class='muted'>" + esc(st.nama_sekolah) + " • NPSN " + esc(st.npsn) + " • TA " + esc(st.tahun_ajaran) + "</div></div>" +
      "<h3>Buku Kas Umum</h3><table><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Uraian</th><th>Jumlah</th></tr>" +
      bos.map(b => "<tr><td>" + fmtTgl(b.tanggal) + "</td><td>" + esc(b.jenis) + "</td><td>" + esc(b.kategori) + "</td><td>" + esc(b.uraian) + "</td><td class='right'>" + fmtRp(b.jumlah) + "</td></tr>").join("") +
      "<tr><th colspan='4' class='right'>Total Penerimaan</th><th class='right'>" + fmtRp(masuk) + "</th></tr><tr><th colspan='4' class='right'>Total Pengeluaran</th><th class='right'>" + fmtRp(keluar) + "</th></tr><tr><th colspan='4' class='right'>SALDO</th><th class='right'>" + fmtRp(masuk - keluar) + "</th></tr></table>" +
      "<h3>Rekap Pengeluaran per Kategori</h3><table><tr><th>Kategori</th><th>Jumlah</th></tr>" + Object.entries(kat).map(([k, v]) => "<tr><td>" + esc(k) + "</td><td class='right'>" + fmtRp(v) + "</td></tr>").join("") + "</table>" +
      "<div class='ttd'><div>Bendahara BOS<br><br><br>(........................)</div><div>Mengetahui,<br>Kepala Sekolah<br><br><br><b>" + esc(st.kepala_sekolah) + "</b></div></div>");
  };
  document.getElementById("expAbs").onclick = async () => download("absensi-siswa.csv", toCSV(await fetchJSON("absensi.json"), [{ k: "tanggal", l: "tanggal" }, { k: "jam", l: "jam" }, { k: "nis", l: "nis" }, { k: "nama", l: "nama" }, { k: "kelas", l: "kelas" }, { k: "status", l: "status" }, { k: "metode", l: "metode" }]), "text/csv");
  document.getElementById("expNilai").onclick = async () => download("rekap-nilai.csv", toCSV(await fetchJSON("nilai.json"), [{ k: "nis", l: "nis" }, { k: "mapel", l: "mapel" }, { k: "jenis", l: "jenis" }, { k: "tp", l: "tp_kd" }, { k: "nilai", l: "nilai" }, { k: "semester", l: "semester" }, { k: "tahun_ajaran", l: "tahun_ajaran" }]), "text/csv");
  document.getElementById("expInv").onclick = async () => download("inventaris-kib.csv", toCSV(await fetchJSON("inventaris.json"), [{ k: "kode_barang", l: "kode_barang" }, { k: "nama", l: "nama_barang" }, { k: "kategori", l: "kategori" }, { k: "jumlah", l: "jumlah" }, { k: "kondisi", l: "kondisi" }, { k: "lokasi", l: "lokasi" }, { k: "sumber_dana", l: "sumber_dana" }, { k: "tanggal_perolehan", l: "tanggal_perolehan" }]), "text/csv");
}

MOD.laporan = { title: "Pelaporan Dinas", desc: "Export CSV/JSON format Dapodik, daftar peserta ANBK, dan laporan BOS (BKU).", render: "renderLaporan" };
