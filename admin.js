// ============================================================
// admin.js — Inti CMS (bagian 1/3): helper, skema, mesin CRUD, PPDB.
// Modul kustom: admin-mods.js & admin-mods2.js (dimuat berurutan).
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
const F = {
  siswa: [
    { k: "nis", l: "NIS", req: true }, { k: "nisn", l: "NISN (Dapodik)" },
    { k: "nama", l: "Nama Lengkap", req: true }, { k: "jk", l: "Jenis Kelamin", t: "select", opts: ["L", "P"] },
    { k: "tempat_lahir", l: "Tempat Lahir" }, { k: "tanggal_lahir", l: "Tanggal Lahir", t: "date" },
    { k: "agama", l: "Agama", t: "select", opts: ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"] },
    { k: "kelas", l: "Kelas / Rombel", t: "select", optsFn: optKelas, req: true },
    { k: "nama_ayah", l: "Nama Ayah" }, { k: "nama_ibu", l: "Nama Ibu" },
    { k: "no_hp_ortu", l: "No. HP Orang Tua (WA)", t: "tel", ph: "628xxx" },
    { k: "status", l: "Status", t: "select", opts: ["Aktif", "Lulus", "Pindah", "Keluar"], def: "Aktif" },
    { k: "tanggal_masuk", l: "Tanggal Masuk", t: "date", def: today() },
    { k: "alamat", l: "Alamat", t: "textarea", full: true }
  ],
  kelas: [
    { k: "nama", l: "Nama Rombel", ph: "7A / X IPA 1", req: true },
    { k: "tingkat", l: "Tingkat", t: "select", opts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] },
    { k: "jurusan", l: "Jurusan (SMA/SMK)", ph: "IPA / TKJ / -" },
    { k: "wali_kelas", l: "Wali Kelas", t: "select", optsFn: optGuru },
    { k: "kapasitas", l: "Kapasitas", t: "number", def: 32 },
    { k: "tahun_ajaran", l: "Tahun Ajaran", def: "2026/2027" }
  ],
  mutasi: [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "nis", l: "Siswa", t: "select", optsFn: optSiswa, req: true },
    { k: "jenis", l: "Jenis Mutasi", t: "select", opts: ["Masuk", "Keluar", "Pindah Kelas", "Pindah Sekolah"] },
    { k: "tujuan_asal", l: "Sekolah Asal / Tujuan" },
    { k: "keterangan", l: "Keterangan / Alasan", t: "textarea", full: true }
  ],
  nilai: [
    { k: "nis", l: "Siswa", t: "select", optsFn: optSiswa, req: true },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel, req: true },
    { k: "jenis", l: "Jenis Penilaian", t: "select", opts: ["Formatif", "Sumatif", "UH", "PTS", "PAS", "UAS", "CBT"], def: "Formatif" },
    { k: "tp", l: "Tujuan Pembelajaran / KD", ph: "TP 1.1 / KD 3.1" },
    { k: "nilai", l: "Nilai (0–100)", t: "number", req: true },
    { k: "semester", l: "Semester", t: "select", opts: ["Ganjil", "Genap"], def: "Ganjil" },
    { k: "tahun_ajaran", l: "Tahun Ajaran", def: "2026/2027" }
  ],
  ppdb: [
    { k: "nomor_daftar", l: "No. Pendaftaran", req: false },
    { k: "tanggal_daftar", l: "Tanggal Daftar", t: "date", def: today() },
    { k: "nama", l: "Nama Calon Siswa", req: true }, { k: "nisn", l: "NISN" },
    { k: "jk", l: "Jenis Kelamin", t: "select", opts: ["L", "P"] },
    { k: "tempat_lahir", l: "Tempat Lahir" }, { k: "tanggal_lahir", l: "Tanggal Lahir", t: "date" },
    { k: "agama", l: "Agama", t: "select", opts: ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"], req: false },
    { k: "asal_sekolah", l: "Asal Sekolah" }, { k: "nama_ortu", l: "Nama Orang Tua/Wali" },
    { k: "no_hp", l: "No. HP (WA)", t: "tel" },
    { k: "pilihan_kelas", l: "Pilihan Kelas", t: "select", optsFn: optKelas, req: false },
    { k: "status", l: "Status", t: "select", opts: ["Menunggu", "Diterima", "Ditolak"], def: "Menunggu" },
    { k: "alamat", l: "Alamat", t: "textarea", full: true }
  ],
  materi: [
    { k: "judul", l: "Judul", req: true },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "tipe", l: "Tipe", t: "select", opts: ["Materi", "Video", "Artikel", "Link"], def: "Materi" },
    { k: "url", l: "URL (YouTube / PDF / Drive)", ph: "https://…" },
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "deskripsi", l: "Deskripsi", t: "textarea", full: true }
  ],
  tugas: [
    { k: "judul", l: "Judul Tugas", req: true },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "deadline", l: "Deadline", t: "date" },
    { k: "lampiran", l: "URL Lampiran", req: false },
    { k: "deskripsi", l: "Instruksi Tugas", t: "textarea", full: true }
  ],
  soal: [
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel, req: true },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "pertanyaan", l: "Pertanyaan", t: "textarea", full: true, req: true },
    { k: "a", l: "Pilihan A", req: true }, { k: "b", l: "Pilihan B", req: true },
    { k: "c", l: "Pilihan C", req: true }, { k: "d", l: "Pilihan D", req: true },
    { k: "e", l: "Pilihan E (opsional, SMA/SMK)", req: false },
    { k: "kunci", l: "Kunci Jawaban", t: "select", opts: ["A", "B", "C", "D", "E"], req: true },
    { k: "pembahasan", l: "Pembahasan", t: "textarea", full: true, req: false }
  ],
  guru: [
    { k: "nip", l: "NIP / NUPTK", req: false }, { k: "nama", l: "Nama Lengkap", req: true },
    { k: "jk", l: "Jenis Kelamin", t: "select", opts: ["L", "P"] },
    { k: "jabatan", l: "Jabatan", t: "select", opts: ["Guru Mapel", "Wali Kelas", "TU", "Kepala Sekolah", "Operator"] },
    { k: "mapel", l: "Mapel Diampu", req: false },
    { k: "status", l: "Status Kepegawaian", t: "select", opts: ["PNS", "PPPK", "Honorer"] },
    { k: "pendidikan", l: "Pendidikan Terakhir", ph: "S1 Pendidikan…" },
    { k: "no_hp", l: "No. HP (WA)", t: "tel" }, { k: "email", l: "Email", t: "email", req: false },
    { k: "gaji_pokok", l: "Gaji Pokok (Rp)", t: "number", fmt: fmtRp },
    { k: "tanggal_masuk", l: "TMT / Tanggal Masuk", t: "date", req: false }
  ],
  "absensi-guru": [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "guru_id", l: "Pegawai", t: "select", optsFn: optGuru, req: true },
    { k: "jam_masuk", l: "Jam Masuk", t: "time", def: "07:00" },
    { k: "jam_pulang", l: "Jam Pulang", t: "time", def: "14:00" },
    { k: "status", l: "Status", t: "select", opts: ["Hadir", "Sakit", "Izin", "Dinas Luar", "Alfa"], def: "Hadir" },
    { k: "catatan", l: "Catatan", req: false }
  ],
  jurnal: [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "guru_id", l: "Guru", t: "select", optsFn: optGuru, req: true },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel },
    { k: "jam_ke", l: "Jam Ke-", ph: "1-2" },
    { k: "materi", l: "Materi / Kegiatan Pembelajaran", t: "textarea", full: true },
    { k: "catatan", l: "Catatan Kelas", t: "textarea", full: true, req: false }
  ],
  kinerja: [
    { k: "guru_id", l: "Pegawai Dinilai", t: "select", optsFn: optGuru, req: true },
    { k: "periode", l: "Periode", ph: "2026 Ganjil" },
    { k: "pedagogik", l: "Pedagogik (0–100)", t: "number" },
    { k: "profesional", l: "Profesional (0–100)", t: "number" },
    { k: "sosial", l: "Sosial (0–100)", t: "number" },
    { k: "kepribadian", l: "Kepribadian (0–100)", t: "number" },
    { k: "penilai", l: "Penilai", def: "Kepala Sekolah" },
    { k: "catatan", l: "Catatan / Rekomendasi", t: "textarea", full: true, req: false }
  ],
  bos: [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "jenis", l: "Jenis", t: "select", opts: ["Penerimaan", "Pengeluaran"], req: true },
    { k: "kategori", l: "Kategori (Juknis BOS)", t: "select", opts: ["BOS Reguler", "Perpustakaan", "Kegiatan Pembelajaran", "Administrasi Sekolah", "Pemeliharaan Sarpras", "Honor Guru Non-ASN", "Pengembangan Profesi", "Langganan Daya & Jasa", "Lainnya"] },
    { k: "uraian", l: "Uraian", req: true },
    { k: "jumlah", l: "Jumlah (Rp)", t: "number", fmt: fmtRp },
    { k: "triwulan", l: "Triwulan", t: "select", opts: ["I", "II", "III", "IV"] },
    { k: "tahun", l: "Tahun", t: "number", def: 2026 }
  ],
  inventaris: [
    { k: "kode_barang", l: "Kode Barang (KIB)", ph: "BRG-001", req: true },
    { k: "nama", l: "Nama Barang", req: true },
    { k: "kategori", l: "Kategori", t: "select", opts: ["Elektronik", "Mebel", "Alat Peraga", "Olahraga", "ATK", "Lainnya"] },
    { k: "jumlah", l: "Jumlah", t: "number", def: 1 },
    { k: "kondisi", l: "Kondisi", t: "select", opts: ["Baik", "Rusak Ringan", "Rusak Berat"], def: "Baik" },
    { k: "lokasi", l: "Lokasi / Ruang" },
    { k: "sumber_dana", l: "Sumber Dana", t: "select", opts: ["BOS", "APBD", "Hibah", "Komite"] },
    { k: "tanggal_perolehan", l: "Tanggal Perolehan", t: "date", req: false }
  ],
  buku: [
    { k: "isbn", l: "ISBN", req: false }, { k: "judul", l: "Judul Buku", req: true },
    { k: "pengarang", l: "Pengarang" }, { k: "penerbit", l: "Penerbit" },
    { k: "tahun", l: "Tahun Terbit", t: "number" },
    { k: "kategori", l: "Kategori", t: "select", opts: ["Pelajaran", "Fiksi", "Nonfiksi", "Referensi", "Anak"] },
    { k: "rak", l: "Lokasi Rak", ph: "A1" }, { k: "stok", l: "Stok", t: "number", def: 1 }
  ]
};
// render modul kustom = NAMA FUNGSI (string); route() di admin-mods2.js
// menyelesaikannya via window[nama] sehingga aman lintas-file.
const MOD = {
  dashboard: { title: "Dashboard", render: "renderDashboard" },
  siswa: { title: "Data Induk Siswa", desc: "Format field selaras Dapodik (NISN, TTL, agama, nama ortu, rombel).", file: "siswa.json", fields: F.siswa, cols: ["nis", "nisn", "nama", "jk", "kelas", "status"] },
  kelas: { title: "Rombel / Kelas", desc: "Pembagian rombongan belajar & wali kelas.", file: "kelas.json", fields: F.kelas, cols: ["nama", "tingkat", "jurusan", "wali_kelas", "kapasitas", "tahun_ajaran"], preload: ["guru.json"], fmts: { wali_kelas: namaGuru } },
  mutasi: { title: "Mutasi Siswa", desc: "Siswa masuk, keluar, pindah kelas/sekolah.", file: "mutasi.json", fields: F.mutasi, cols: ["tanggal", "nis", "jenis", "tujuan_asal"], preload: ["siswa.json"], fmts: { tanggal: fmtTgl, nis: namaSiswa } },
  nilai: { title: "Input Nilai", desc: "Nilai formatif/sumatif (Merdeka) & UH/PTS/PAS (K13) — sumber e-Rapor.", file: "nilai.json", fields: F.nilai, cols: ["nis", "mapel", "jenis", "tp", "nilai", "semester"], preload: ["siswa.json"], fmts: { nis: namaSiswa } },
  ppdb: {
    title: "PPDB Online", desc: "Impor berkas JSON dari halaman ppdb.html, lalu Terima untuk otomatis membuat data siswa + NIS baru.", file: "ppdb.json", fields: F.ppdb,
    cols: ["nomor_daftar", "nama", "asal_sekolah", "pilihan_kelas", "no_hp", "status"],
    toolbar: '<label class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"><i data-lucide="upload" class="w-4 h-4"></i>Impor JSON<input id="impPPDB" type="file" accept=".json" class="hidden"></label>',
    onToolbar: () => { document.getElementById("impPPDB").onchange = imporPPDB; },
    rowActions: [
      { icon: "check", title: "Terima → jadikan siswa", cls: "text-emerald-600", fn: terimaPPDB },
      { icon: "x", title: "Tolak", cls: "text-rose-500", fn: tolakPPDB }
    ]
  },
  absensi: { title: "Absensi Siswa (QR Code)", desc: "Scan kartu QR siswa via kamera, input manual, rekap harian, cetak kartu QR.", render: "renderAbsensi" },
  rapor: { title: "e-Rapor", desc: "Kurikulum Merdeka (rata-rata + predikat KKTP) & K13 (angka + predikat). Cetak PDF via dialog print.", render: "renderRapor" },
  materi: { title: "E-Learning / Materi", desc: "Materi ajar, artikel, dan tautan (PDF/Drive/YouTube). Tampil di belajar.html.", file: "materi.json", fields: F.materi, cols: ["judul", "mapel", "kelas", "tipe", "url", "tanggal"], fmts: { tanggal: fmtTgl } },
  video: {
    title: "Video Belajar", desc: "Subset materi bertipe Video — diputar langsung (embed YouTube).", file: "materi.json", fields: F.materi,
    filter: r => r.tipe === "Video", preset: { tipe: "Video" }, cols: ["judul", "mapel", "kelas", "url"],
    rowActions: [{ icon: "video", title: "Putar video", cls: "text-sky-600", fn: r => openModal("Putar: " + r.judul, '<div class="aspect-video rounded-xl overflow-hidden bg-black"><iframe src="' + esc(ytEmbed(r.url)) + '" class="w-full h-full" allowfullscreen></iframe></div>', null) }]
  },
  tugas: { title: "Tugas", desc: "Penugasan dengan deadline. Pengumpulan siswa via WhatsApp / lampiran (statis).", file: "tugas.json", fields: F.tugas, cols: ["judul", "mapel", "kelas", "deadline", "lampiran"], fmts: { deadline: fmtTgl } },
  soal: { title: "Bank Soal", desc: "Bank soal pilihan ganda A–E dengan kunci & pembahasan untuk CBT.", file: "soal.json", fields: F.soal, cols: ["mapel", "kelas", "pertanyaan", "kunci"] },
  ujian: { title: "Ujian Online (CBT)", desc: "Paket ujian dari bank soal + token. Siswa mengerjakan di cbt.html; impor file hasilnya ke nilai.", render: "renderUjian" },
  spp: { title: "SPP • VA & QRIS", desc: "Generate tagihan massal, pembayaran VA/QRIS/Tunai (demo), dan pantauan tunggakan.", render: "renderSPP" },
  bos: { title: "Laporan BOS", desc: "Buku kas umum BOS: penerimaan & pengeluaran per kategori juknis.", file: "bos.json", fields: F.bos, cols: ["tanggal", "jenis", "kategori", "uraian", "jumlah", "triwulan"], fmts: { tanggal: fmtTgl } },
  gaji: { title: "Penggajian Guru", desc: "Generate slip gaji bulanan dari data pegawai, tandai dibayar, cetak slip.", render: "renderGaji" },
  audit: { title: "Audit Log", desc: "Tercatat OTOMATIS untuk setiap operasi tulis ke GitHub (siapa, kapan, apa).", render: "renderAudit" },
  guru: { title: "Data Guru / TU", desc: "Data pokok SDM kepegawaian.", file: "guru.json", fields: F.guru, cols: ["nip", "nama", "jabatan", "mapel", "status", "gaji_pokok"] },
  "absensi-guru": { title: "Absensi Guru & TU", file: "absensi-guru.json", fields: F["absensi-guru"], cols: ["tanggal", "guru_id", "jam_masuk", "jam_pulang", "status"], preload: ["guru.json"], fmts: { tanggal: fmtTgl, guru_id: namaGuru } },
  jurnal: { title: "Jurnal Mengajar", file: "jurnal.json", fields: F.jurnal, cols: ["tanggal", "guru_id", "kelas", "mapel", "jam_ke", "materi"], preload: ["guru.json"], fmts: { tanggal: fmtTgl, guru_id: namaGuru } },
  kinerja: { title: "Penilaian Kinerja", desc: "4 kompetensi: pedagogik, profesional, sosial, kepribadian.", file: "kinerja.json", fields: F.kinerja, cols: ["guru_id", "periode", "pedagogik", "profesional", "sosial", "kepribadian"], preload: ["guru.json"], fmts: { guru_id: namaGuru } },
  chat: { title: "Chat Wali Kelas ↔ Orang Tua", desc: "Pesan sekolah tersimpan di chat.json (dibaca portal ortu). Balasan ortu masuk via WA.", render: "renderChat" },
  notifikasi: { title: "Notifikasi WA Gateway", desc: "Antrean pesan WA: kirim massal via link wa.me atau API Fonnte (token gateway opsional).", render: "renderWA" },
  inventaris: { title: "Inventaris Barang", desc: "KIB sarpras: kode, kondisi, lokasi, sumber dana.", file: "inventaris.json", fields: F.inventaris, cols: ["kode_barang", "nama", "kategori", "jumlah", "kondisi", "lokasi"] },
  buku: { title: "Katalog Buku", desc: "Koleksi perpustakaan & stok.", file: "buku.json", fields: F.buku, cols: ["isbn", "judul", "pengarang", "kategori", "rak", "stok"] },
  peminjaman: { title: "Peminjaman Buku", desc: "Sirkulasi perpustakaan: pinjam, kembali, denda otomatis per hari.", render: "renderPeminjaman" },
  laporan: { title: "Pelaporan Dinas", desc: "Export CSV/JSON format Dapodik, daftar peserta ANBK, dan laporan BOS (BKU).", render: "renderLaporan" },
  pengaturan: { title: "Pengaturan Sekolah", desc: "Identitas, kurikulum, nominal SPP, denda, prefix VA, merchant QRIS, mapel.", render: "renderSettings" }
};
const badgeKeys = ["status", "jenis", "kondisi", "metode"];
const badgeColors = { Aktif: "emerald", Lunas: "emerald", Diterima: "emerald", Hadir: "emerald", Baik: "emerald", Dibayar: "emerald", Terkirim: "emerald", Dikembalikan: "emerald", Selesai: "emerald", Penerimaan: "emerald", Menunggu: "amber", Belum: "amber", Dipinjam: "amber", Draft: "amber", Izin: "amber", Antrean: "amber", "Rusak Ringan": "amber", Sakit: "sky", "Dinas Luar": "sky", Lulus: "sky", Alfa: "rose", Ditolak: "rose", Keluar: "rose", Pindah: "rose", "Rusak Berat": "rose", Pengeluaran: "rose" };
const badge = v => { const c = badgeColors[v] || "slate"; return '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-' + c + "-100 text-" + c + '-700">' + esc(v ?? "-") + "</span>"; };
const pageHead = m => '<div class="mb-5"><h1 class="text-xl md:text-2xl font-extrabold text-slate-800">' + esc(m.title) + "</h1>" + (m.desc ? '<p class="text-sm text-slate-500 mt-1 max-w-3xl">' + esc(m.desc) + "</p>" : "") + "</div>";
const card = inner => '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5">' + inner + "</div>";
const inp = 'class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"';
const btnP = 'class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg"';
const btnS = 'class="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-sm font-bold px-4 py-2 rounded-lg"';
const lbl = t => '<span class="text-xs font-semibold text-slate-600">' + t + "</span>";
const emptyRow = '<tr><td colspan="99" class="px-3 py-8 text-center text-sm text-slate-400">Tidak ada data.</td></tr>';
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
    '<button type="button" data-edit="' + esc(r.id) + '" title="Edit" class="p-1.5 rounded-lg hover:bg-slate-100 text-sky-600"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>' +
    '<button type="button" data-del="' + esc(r.id) + '" title="Hapus" class="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>'
  ).join("") || emptyRow;
  app.innerHTML = pageHead(m) +
    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200">' +
    '<div class="p-4 flex flex-wrap gap-2 items-center border-b border-slate-100">' +
    '<div class="relative flex-1 min-w-[200px]"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input id="q" placeholder="Cari…" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"></div>' +
    (m.toolbar || "") +
    '<button type="button" id="btnAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Tambah</button></div>' +
    '<div class="overflow-x-auto max-h-[62vh] overflow-y-auto"><table class="w-full text-left"><thead class="bg-slate-50 sticky top-0"><tr>' +
    cols.map(c => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + esc(labels[c] || c) + "</th>").join("") +
    '<th class="px-3 py-2 text-xs text-right text-slate-500">Aksi</th></tr></thead><tbody id="tb">' + rowsHTML(data) + "</tbody></table></div>" +
    '<div class="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">' + data.length + " baris • sumber: data/" + m.file + " • setiap Simpan/Hapus = commit GitHub + audit log</div></div>";
  refreshIcons();
  if (m.onToolbar) m.onToolbar();
  document.getElementById("q").oninput = e => {
    const s = e.target.value.toLowerCase();
    document.getElementById("tb").innerHTML = rowsHTML(data.filter(r => JSON.stringify(r).toLowerCase().includes(s)));
    refreshIcons();
  };
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
      if (confirm("Hapus \"" + (r.nama || r.judul || r.nis || r.id) + "\"? Tindakan ini ter-commit ke GitHub.")) {
        if (await saveData(m.file, fullNow.filter(x => x.id !== r.id), m.title, "HAPUS", r.nama || r.judul || r.id)) route();
      }
    } else if (b.dataset.x !== undefined) {
      const r = data.find(x => x.id === b.dataset.id);
      m.rowActions[+b.dataset.x].fn(r);
    }
  };
}
async function imporPPDB(e) {
  const f = e.target.files[0]; if (!f) return;
  try {
    let obj = JSON.parse(await f.text());
    if (!Array.isArray(obj)) obj = [obj];
    const arr = await fetchJSON("ppdb.json");
    let n = 0;
    for (const o of obj) {
      if (!o.nama) continue;
      arr.unshift({ status: "Menunggu", tanggal_daftar: today(), ...o, id: uid(), nomor_daftar: o.nomor_daftar || ("PPDB-" + new Date().getFullYear() + "-" + String(arr.length + 1).padStart(4, "0")) });
      n++;
    }
    if (await saveData("ppdb.json", arr, "PPDB", "IMPOR PENDAFTAR", n + " berkas dari " + f.name)) route();
  } catch (err) { toast("File JSON tidak valid: " + err.message, "error"); }
  e.target.value = "";
}
async function terimaPPDB(r) {
  if (r.status === "Diterima") return toast("Pendaftar sudah diterima.", "info");
  if (!confirm("Terima " + r.nama + " dan buat data siswa baru otomatis?")) return;
  const siswa = await fetchJSON("siswa.json");
  const th = String(new Date().getFullYear());
  let seq = siswa.length + 1, nis;
  do { nis = th + String(seq++).padStart(3, "0"); } while (siswa.some(s => s.nis === nis));
  siswa.unshift({ id: uid(), nis, nisn: r.nisn || "", nama: r.nama, jk: r.jk || "", tempat_lahir: r.tempat_lahir || "", tanggal_lahir: r.tanggal_lahir || "", agama: r.agama || "Islam", kelas: r.pilihan_kelas || "", nama_ayah: r.nama_ortu || "", nama_ibu: "", no_hp_ortu: r.no_hp || "", alamat: r.alamat || "", status: "Aktif", tanggal_masuk: today() });
  if (!await saveData("siswa.json", siswa, "PPDB", "TERIMA PPDB", r.nama + " → NIS " + nis)) return;
  const ppdb = await fetchJSON("ppdb.json");
  const row = ppdb.find(x => x.id === r.id); row.status = "Diterima"; row.nis_baru = nis;
  await saveData("ppdb.json", ppdb, "PPDB", "STATUS PPDB", r.nama + " Diterima");
  route();
}
async function tolakPPDB(r) {
  if (!confirm("Tolak pendaftar " + r.nama + "?")) return;
  const ppdb = await fetchJSON("ppdb.json");
  ppdb.find(x => x.id === r.id).status = "Ditolak";
  if (await saveData("ppdb.json", ppdb, "PPDB", "STATUS PPDB", r.nama + " Ditolak")) route();
}
