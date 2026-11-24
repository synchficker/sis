/* ============================================================
   seed.js — Generator 500 record/koleksi dengan relasi konsisten
   VanillaJS. Memakai app.js (esc, fmtRp, pushJSON, toast, dll).
   ============================================================ */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const DEF = {
  count: 500, seed: 20261120, ta: "2026/2027", nisYear: 2026, jenjang: "SMP",
  mix: "merata", kapasitas: 32, lunas: 72, draft: 12, absDays: 30,
  spp: 150000, vaPrefix: "88088", wa: "6281234567890",
  incSettings: true, incSlider: true, autoDots: true, deterministik: true, soalPerUjian: 10
};
let O = { ...DEF };
let DB = {}, ORDER = [], SEL = new Set(), CHECKS = [];
let PV = { set: "siswa.json", q: "", filter: "", sort: "", dir: 1, page: 1, size: 25 };
let PUSHING = false, CANCEL = false, undoState = null, undoTimer = null, genTimer = null;

/* ---------- RNG deterministik ---------- */
let R = null;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rf = (a, b) => a + R() * (b - a);
const ri = (a, b) => Math.floor(rf(a, b + 1));
const pick = arr => arr[Math.floor(R() * arr.length)];
const chance = p => R() * 100 < p;
const pad = (n, l) => String(n).padStart(l, "0");
const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1, 2) + "-" + pad(d.getDate(), 2);
const addD = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
const NOW = new Date();
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
const rp = n => Math.round(n / 1000) * 1000;

/* ---------- Bank data ---------- */
const NM_M = ["Ahmad","Budi","Candra","Dimas","Eko","Fajar","Galih","Hendra","Irfan","Joko","Krisna","Lukman","Muhammad","Naufal","Oscar","Putra","Qori","Rizki","Satria","Teguh","Umar","Vino","Wahyu","Yoga","Zaki","Arif","Bayu","Dedi","Fikri","Gilang","Hafiz","Ilham","Jamal","Kurnia","Lutfi","Maulana","Nanda","Okta","Prasetyo","Rangga","Surya","Taufik","Usman","Vicky","Wira","Yusuf","Zulfikar","Aditya","Bima","Daffa"];
const NM_F = ["Ayu","Bunga","Citra","Dewi","Eka","Fitri","Gita","Hana","Indah","Jasmine","Kirana","Lestari","Melati","Nadia","Olivia","Putri","Qonita","Rani","Salsabila","Tiara","Ulfa","Vina","Wulan","Yuni","Zahra","Anisa","Bella","Cantika","Dinda","Elsa","Farah","Gadis","Hasna","Intan","Jihan","Kayla","Laras","Mawar","Nabila","Octavia","Puspita","Rahma","Sinta","Tasya","Umi","Vania","Widya","Yolanda","Zaskia","Aulia"];
const NM_L = ["Santoso","Wijaya","Pratama","Nugroho","Saputra","Hidayat","Ramadhan","Setiawan","Kurniawan","Maulana","Firmansyah","Halim","Susanto","Wibowo","Permana","Anggara","Baskoro","Cahyadi","Darmawan","Effendi","Fauzi","Gunawan","Hartono","Iskandar","Junaidi","Kusuma","Laksana","Mahendra","Nurdin","Octaviano","Purnama","Rahardian","Salim","Tirtayasa","Utomo","Virgiawan","Wicaksono","Yudhoyono","Zamroni","Abdillah"];
const KOTA = ["Bandung","Cimahi","Garut","Tasikmalaya","Bogor","Depok","Bekasi","Cirebon","Sukabumi","Karawang","Sumedang","Purwakarta","Subang","Indramayu","Majalengka","Kuningan","Banjar","Pangandaran"];
const JALAN = ["Melati","Kenanga","Anggrek","Cempaka","Dahlia","Flamboyan","Mawar","Teratai","Bougenville","Sakura","Cendana","Meranti","Akasia","Ketapang","Rambutan"];
const AGAMA = ["Islam","Islam","Islam","Islam","Kristen","Katolik","Hindu","Buddha","Konghucu"];
const MAPEL = ["Matematika","IPA","IPS","Bahasa Indonesia","Bahasa Inggris","Pendidikan Pancasila","Informatika","PJOK","Seni Budaya","PAI","Prakarya","Ekonomi"];
const JUR_SMK = ["TKJ","RPL","DKV","TKR","Akuntansi","Pemasaran"];
const PENERBIT = ["Erlangga","Gramedia","Bentang Pustaka","Mizan","Republika","Yudhistira","Bumi Aksara","Pusat Perbukuan","Andi Offset","Deepublish"];
const PENULIS = ["Andrea Hirata","Dee Lestari","Tere Liye","Pramoedya Ananta Toer","Sapardi Djoko Damono","Ahmad Fuadi","Habiburrahman El Shirazy","Leila S. Chudori","Eka Kurniawan","Ayu Utami","Nh. Dini","Chairil Anwar","Tim Kemdikbud","Tim Penyusun","Dewi Sartika Press"];
const BUKU_JUDUL = ["Matematika Dasar","Fisika Terapan","Kimia Analitik","Biologi Sel","Sejarah Nusantara","Geografi Regional","Ekonomi Mikro","Sosiologi Modern","Algoritma & Pemrograman","Jaringan Komputer","Desain Grafis","Akuntansi Dasar","Pemasaran Digital","Bahasa Indonesia Ragam Ilmiah","English for Academic Purposes","Pendidikan Pancasila","Seni Rupa Terapan","Olahraga & Kesehatan","Prakarya Kewirausahaan","Al-Qur'an & Hadis","Laskar Pelangi","Bumi Manusia","Negeri 5 Menara","Pulang","Hujan","Rantau 1 Muara","Gadis Kretek","Cantik Itu Luka","Saman","Pergi","Anak Bajang Menggiring Angin","Bulan","Bintang","Ceros & Batozar","Komet","Matahari"];
const BARANG = ["Laptop Chromebook","Meja Siswa","Kursi Siswa","Proyektor LCD","Papan Tulis Whiteboard","Printer Laser","Scanner Dokumen","Router WiFi","Switch 24 Port","Kipas Angin","AC Split 1PK","Lemari Arsip","Rak Buku Perpustakaan","Bola Futsal","Bola Basket","Net Voli","Raket Badminton","Matras Olahraga","Mikroskop","Alat Peraga IPA","Timbangan Digital","Gitar Akustik","Keyboard Musik","Sound System","Microphone Wireless","Kamera Dokumentasi","Tripod","Toolkit Komputer","Kabel UTP Cat6","Stop Kontak","Lampu LED","Gorden Kelas","Tempat Sampah Terpilah","Alat Pemadam Api","P3K Kotak","Tensimeter","Alat Ukur Tinggi Badan","Mesin Absensi QR","Tablet Pembelajaran","Headset Lab Bahasa","Server Mini"];
const LOKASI = ["Ruang 7A","Ruang 8A","Ruang 9A","Ruang 10 IPA","Ruang 11 IPS","Lab Komputer 1","Lab Komputer 2","Lab IPA","Perpustakaan","Aula Serbaguna","Ruang Guru","Ruang TU","Ruang Kepala Sekolah","Gudang Sarpras","Lapangan Utama","GOR","Masjid Sekolah","Kantin","Ruang BK","Pos Keamanan"];
const KAT_KEG = ["Akademik","Olahraga","Seni & Budaya","Keagamaan","Sosial & Lingkungan","Literasi","Teknologi","Pramuka","Kewirausahaan"];
const KEG_JUDUL = ["Pentas Seni & Gelar Karya","Class Meeting Antar Kelas","Workshop Robotik & Coding","Festival Literasi & Pojok Baca","Pesantren Kilat & Khataman","Gerakan Sekolah Bersih","Persami Pramuka","Market Day Projek P5","Asesmen Nasional Berbasis Komputer","Lomba Cerdas Cermat","Edutrip Museum Sains","Seminar Karier & Kampus","Pelatihan Kepemimpinan OSIS","Bakti Sosial Desa Binaan","Tanam 100 Pohon","Lomba Pidato Kebangsaan","Gelar Budaya Nusantara","Turnamen Futsal Piala Kepala Sekolah","Pameran Karya Ilmiah Remaja","Pelatihan Jurnalistik Sekolah","Kelas Menulis Kreatif","Simulasi Tanggap Bencana","Pekan Bahasa Asing","Lomba Desain Poster Digital","Bazar Buku Murah"];
const KAT_KAL = ["Akademik","Asesmen","Kegiatan","PPDB","Keagamaan","Rapat Orang Tua","Libur Nasional","Libur Semester"];
const FOTO = ["photo-1509062522246-3755977927d7","photo-1523240795612-9a054b0db644","photo-1516321318423-f06f85e504b3","photo-1493225457124-a3eb161ffa5f","photo-1521587760476-6c12a4b040da","photo-1503676260728-1c00da094a0b","photo-1523050854058-8df90110c9f1","photo-1461896836934-ffe607ba8211","photo-1416879595882-3373a0480b5b","photo-1504280390367-361c6d9f38f4","photo-1488459716781-31db52582fe9","photo-1518770660439-4636190af475","photo-1580582932707-520aed937b7b","photo-1497633762265-9d179a990aa6"];
const fotoUrl = i => "https://images.unsplash.com/" + FOTO[i % FOTO.length] + "?auto=format&fit=crop&w=1200&q=60";

/* ---------- Definisi koleksi & dependensi ---------- */
const SETS = [
  { f: "settings.json", label: "Pengaturan Sekolah", icon: "settings", dep: [], kind: "obj", cols: ["nama_sekolah","jenjang","npsn","tahun_ajaran","semester","kurikulum"] },
  { f: "guru.json", label: "Guru & Tendik", icon: "briefcase", dep: [], cols: ["id","nip","nama","jabatan","mapel","status","gaji_pokok"] },
  { f: "kelas.json", label: "Rombel / Kelas", icon: "school", dep: ["guru.json"], cols: ["id","nama","tingkat","jurusan","wali_kelas","kapasitas"] },
  { f: "buku.json", label: "Katalog Buku", icon: "library", dep: [], cols: ["id","isbn","judul","pengarang","kategori","rak","stok"] },
  { f: "soal.json", label: "Bank Soal", icon: "list-checks", dep: [], cols: ["id","mapel","kelas","pertanyaan","kunci"] },
  { f: "siswa.json", label: "Data Induk Siswa", icon: "users", dep: ["kelas.json"], cols: ["nis","nisn","nama","jk","kelas","status","no_hp_ortu"] },
  { f: "inventaris.json", label: "Inventaris Sarpras", icon: "boxes", dep: [], cols: ["kode_barang","nama","kategori","jumlah","kondisi","lokasi"] },
  { f: "mutasi.json", label: "Mutasi Siswa", icon: "arrow-left-right", dep: ["siswa.json"], cols: ["tanggal","nis","jenis","tujuan_asal"] },
  { f: "absensi.json", label: "Absensi Siswa", icon: "qr-code", dep: ["siswa.json"], cols: ["tanggal","jam","nis","nama","kelas","status","metode"] },
  { f: "nilai.json", label: "Nilai & e-Rapor", icon: "clipboard-list", dep: ["siswa.json","settings.json"], cols: ["nis","mapel","jenis","tp","nilai","semester"] },
  { f: "ppdb.json", label: "PPDB Online", icon: "user-plus", dep: ["siswa.json","kelas.json"], cols: ["nomor_daftar","nama","asal_sekolah","pilihan_kelas","status"] },
  { f: "materi.json", label: "E-Learning / Materi", icon: "book-open", dep: ["kelas.json","settings.json"], cols: ["judul","mapel","kelas","tipe","tanggal"] },
  { f: "tugas.json", label: "Tugas", icon: "clipboard-check", dep: ["kelas.json","settings.json"], cols: ["judul","mapel","kelas","deadline"] },
  { f: "ujian.json", label: "Ujian CBT", icon: "timer", dep: ["soal.json","kelas.json"], cols: ["judul","mapel","kelas","durasi","token","status"] },
  { f: "spp.json", label: "Tagihan SPP", icon: "wallet", dep: ["siswa.json","settings.json"], cols: ["nis","nama","bulan","tahun","nominal","status","va"] },
  { f: "bos.json", label: "Dana BOS", icon: "landmark", dep: [], cols: ["tanggal","jenis","kategori","uraian","jumlah","triwulan"] },
  { f: "gaji.json", label: "Penggajian", icon: "banknote", dep: ["guru.json"], cols: ["nama","bulan","tahun","pokok","tunjangan","total","status"] },
  { f: "absensi-guru.json", label: "Absensi Guru", icon: "calendar-check", dep: ["guru.json"], cols: ["tanggal","guru_id","jam_masuk","jam_pulang","status"] },
  { f: "jurnal.json", label: "Jurnal Mengajar", icon: "pen-line", dep: ["guru.json","kelas.json"], cols: ["tanggal","guru_id","kelas","mapel","jam_ke"] },
  { f: "kinerja.json", label: "Penilaian Kinerja", icon: "award", dep: ["guru.json"], cols: ["guru_id","periode","pedagogik","profesional","sosial","kepribadian"] },
  { f: "chat.json", label: "Chat Wali Kelas", icon: "message-circle", dep: ["siswa.json"], cols: ["nis","dari","pesan","waktu"] },
  { f: "notifikasi.json", label: "Notifikasi WA", icon: "bell", dep: ["siswa.json","spp.json"], cols: ["nis","nama","no_hp","jenis","status"] },
  { f: "peminjaman.json", label: "Peminjaman Buku", icon: "repeat", dep: ["buku.json","siswa.json"], cols: ["buku_id","nis","tanggal_pinjam","tanggal_jatuh_tempo","status","denda"] },
  { f: "kegiatan.json", label: "Kegiatan Sekolah", icon: "layout-grid", dep: [], cols: ["urutan","judul","kategori","tanggal","lokasi","status"] },
  { f: "kalender.json", label: "Kalender Akademik", icon: "calendar-days", dep: ["settings.json"], cols: ["mulai","selesai","judul","kategori","semester","status"] },
  { f: "slider.json", label: "Hero Slider", icon: "gallery-horizontal-end", dep: [], kind: "obj", cols: ["urutan","judul","highlight","accent","durasi","status"] },
  { f: "audit.json", label: "Audit Log", icon: "shield-check", dep: ["siswa.json","guru.json"], cols: ["waktu","aktor","modul","aksi","detail"] }
];
const rowsOf = f => f === "slider.json" ? (DB[f] ? DB[f].slides : []) : (DB[f] || []);
const meta = f => SETS.find(s => s.f === f);

/* ============================================================
   GENERATOR
   ============================================================ */
function build() {
  R = rng(O.deterministik ? O.seed : (Date.now() % 2147483647));
  const N = O.count, db = {};
  const taStart = +O.ta.slice(0, 4), taEnd = +O.ta.slice(-4);
  const AWAL = new Date(taStart, 6, 13), AKHIR = new Date(taEnd, 5, 26);
  const spanDays = Math.max(30, Math.round((AKHIR - AWAL) / 864e5));
  const taDate = () => iso(addD(AWAL, ri(0, spanDays)));
  const semOf = d => d <= iso(new Date(taStart, 11, 19)) ? "Ganjil" : "Genap";
  const triw = d => { const m = +d.slice(5, 7); return m <= 3 ? "I" : m <= 6 ? "II" : m <= 9 ? "III" : "IV"; };

  /* --- settings --- */
  const kepsek = "Drs. H. " + pick(NM_M) + " " + pick(NM_L) + ", M.Pd";
  db["settings.json"] = {
    nama_sekolah: "SIN School Nusantara", jenjang: O.jenjang, npsn: "20" + pad(ri(100000, 999999), 6),
    alamat: "Jl. " + pick(JALAN) + " No. " + ri(1, 120) + ", Kec. Cerdas, Kota " + pick(KOTA) + ", Jawa Barat",
    telepon: "022-" + ri(100000, 999999), email: "info@sinschool.sch.id",
    kepala_sekolah: kepsek, nip_kepsek: "1968" + pad(ri(1, 12), 2) + pad(ri(1, 28), 2) + "1994031007",
    // About Us (beranda & halaman SD/SMP/SMA/SMK) — dapat diubah di Panel Admin -> Pengaturan Sekolah. {sekolah} = nama sekolah otomatis.
    founder: {"nama": "H. Ahmad Fauzi, S.E., M.M.", "jabatan": "Founder & Ketua Yayasan", "sambutan": "Selamat datang di {sekolah}. Kami mendirikan sekolah ini dengan keyakinan bahwa setiap anak adalah pribadi istimewa yang layak tumbuh dalam lingkungan belajar yang aman, hangat, dan menginspirasi.\nBersama para guru dan orang tua, kami berkomitmen menyiapkan generasi yang berilmu, berakhlak mulia, kreatif, dan siap menghadapi masa depan. Terima kasih atas kepercayaan Bapak/Ibu, mari tumbuh dan berkarya bersama kami."},
    kepsek_jenjang: {"SD": {"nama": "Drs. H. Wira Hartono, M.Pd", "nip": "196807231994031007", "sambutan": "Selamat datang di jenjang SD {sekolah}. Di usia emas ini, kami menanamkan fondasi literasi, numerasi, dan karakter melalui pembelajaran yang menyenangkan dan penuh keteladanan.\nKami bekerja sama erat dengan orang tua agar setiap anak tumbuh percaya diri, mandiri, dan gemar belajar. Kami menanti Bapak/Ibu bergabung dalam keluarga besar {sekolah}."}, "SMP": {"nama": "Hj. Rina Kusumawati, S.Pd., M.Pd", "nip": "197205141998032004", "sambutan": "Selamat datang di jenjang SMP {sekolah}. Masa remaja awal adalah saat terbaik untuk menemukan minat, bakat, dan jati diri; kami mendampinginya dengan pembelajaran berbasis projek, praktikum, dan pembinaan karakter.\nMelalui bimbingan guru yang peduli dan beragam kegiatan pengembangan diri, kami menyiapkan siswa agar mandiri, berpikir kritis, dan siap melangkah ke jenjang berikutnya."}, "SMA": {"nama": "Dr. H. Bambang Prasetyo, M.Si", "nip": "196911201995031002", "sambutan": "Selamat datang di jenjang SMA {sekolah}. Kami menyiapkan siswa menuju perguruan tinggi dan dunia kerja melalui pendalaman akademik, riset, kepemimpinan, dan literasi digital.\nDengan bimbingan karier serta lingkungan belajar yang suportif, kami ingin setiap lulusan tumbuh menjadi pribadi tangguh, berintegritas, dan berdaya saing."}, "SMK": {"nama": "Ir. Dedi Supriyadi, M.T", "nip": "197008171996031005", "sambutan": "Selamat datang di jenjang SMK {sekolah}. Kami membekali siswa dengan kompetensi keahlian yang relevan dengan kebutuhan industri melalui Teaching Factory, praktik kerja lapangan, dan uji kompetensi bersertifikat.\nLulusan kami disiapkan untuk siap kerja, melanjutkan studi, maupun berwirausaha dengan etos kerja dan karakter yang kuat."}},
    tahun_ajaran: O.ta, semester: "Ganjil", kurikulum: chance(70) ? "Merdeka" : "K13", kkm: 75,
    spp_nominal: O.spp, denda_per_hari: 500, wa_admin: O.wa,
    bank: { nama: "Bank BJB", va_prefix: O.vaPrefix, atas_nama: "SIN School Nusantara" },
    qris: { merchant: "SIN SCHOOL NUSANTARA", nmid: "ID1026" + pad(ri(10000, 99999), 5) },
    mapel: MAPEL.slice(),
    pengumuman: "Asesmen sumatif semester " + "Ganjil" + " TA " + O.ta + " berlangsung sesuai kalender akademik. Peserta CBT wajib membawa kartu QR absensi dan token ujian dari wali kelas.",
    kebijakan: { diskon_saudara_persen: 10, cicilan_pangkal_opsi: [1, 3, 6, 12], denda_terlambat_persen: 2, jatuh_tempo_tanggal: 10, beasiswa_maks_persen: 50 },
    kalender: { awal_ganjil: iso(AWAL), akhir_ganjil: iso(new Date(taStart, 11, 19)), awal_genap: iso(new Date(taEnd, 0, 5)), akhir_genap: iso(AKHIR) },
    biaya: {
      SD: { uang_pangkal: 3500000, spp: O.spp, uang_media: 25000, uang_kegiatan: 20000, seragam: 600000, buku: 450000, kegiatan_tahunan: 500000, daftar_ulang: 250000, praktikum: 0, pkl: 0 },
      SMP: { uang_pangkal: 4500000, spp: O.spp, uang_media: 35000, uang_kegiatan: 25000, seragam: 750000, buku: 600000, kegiatan_tahunan: 650000, daftar_ulang: 300000, praktikum: 200000, pkl: 0 },
      SMA: { uang_pangkal: 5500000, spp: O.spp + 50000, uang_media: 45000, uang_kegiatan: 30000, seragam: 900000, buku: 800000, kegiatan_tahunan: 850000, daftar_ulang: 350000, praktikum: 400000, pkl: 0 },
      SMK: { uang_pangkal: 6500000, spp: O.spp + 100000, uang_media: 50000, uang_kegiatan: 35000, seragam: 1000000, buku: 850000, kegiatan_tahunan: 900000, daftar_ulang: 400000, praktikum: 750000, pkl: 1200000 }
    }
  };
  const ST = db["settings.json"];

  /* --- guru --- */
  const guru = [];
  for (let i = 0; i < N; i++) {
    const jk = chance(52) ? "L" : "P";
    const nama = (jk === "L" ? pick(NM_M) : pick(NM_F)) + " " + pick(NM_L) + (chance(45) ? ", S.Pd" : chance(20) ? ", S.Kom" : "");
    const jab = i === 0 ? "Kepala Sekolah" : i <= 10 ? (i <= 7 ? "TU" : "Operator") : chance(45) ? "Wali Kelas" : "Guru Mapel";
    const stat = jab === "TU" || jab === "Operator" ? pick(["Honorer", "PPPK"]) : pick(["PNS", "PNS", "PPPK", "Honorer"]);
    guru.push({
      id: "G" + pad(i + 1, 4),
      nip: stat === "Honorer" ? "-" : "19" + ri(70, 95) + pad(ri(1, 12), 2) + pad(ri(1, 28), 2) + (stat === "PNS" ? "20" + ri(10, 20) : "2022") + pad(ri(1, 2), 1) + pad(i + 1, 4),
      nama: i === 0 ? kepsek : nama, jk, jabatan: jab,
      mapel: jab === "TU" || jab === "Operator" || jab === "Kepala Sekolah" ? "-" : pick(MAPEL),
      status: stat, pendidikan: pick(["S1 Pendidikan", "S1 " + pick(MAPEL), "S2 Pendidikan", "D3 Administrasi"]),
      no_hp: "62811" + pad(1000000 + i * 7, 7), email: slug(i === 0 ? kepsek.split(",")[0] : nama.split(",")[0]) + (i + 1) + "@sinschool.sch.id",
      gaji_pokok: stat === "PNS" ? rp(ri(3200, 5200) * 1000) : stat === "PPPK" ? rp(ri(2800, 4200) * 1000) : rp(ri(1800, 3000) * 1000),
      tanggal_masuk: iso(new Date(ri(2005, 2024), ri(0, 11), ri(1, 28)))
    });
  }
  db["guru.json"] = guru;
  const pengajar = guru.filter(g => g.mapel !== "-");

  /* --- kelas (nama unik) --- */
  const mixMap = { merata: { SD: 1, SMP: 1, SMA: 1, SMK: 1 }, sd: { SD: 4, SMP: 1, SMA: 1, SMK: 1 }, smp: { SD: 1, SMP: 4, SMA: 1, SMK: 1 }, sma: { SD: 1, SMP: 1, SMA: 4, SMK: 1 }, smk: { SD: 1, SMP: 1, SMA: 1, SMK: 4 } };
  const w = mixMap[O.mix] || mixMap.merata;
  const pool = []; Object.keys(w).forEach(k => { for (let i = 0; i < w[k]; i++) pool.push(k); });
  const tingkatOf = { SD: [1, 2, 3, 4, 5, 6], SMP: [7, 8, 9], SMA: [10, 11, 12], SMK: [10, 11, 12] };
  const kelas = [], used = new Set(); const sec = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < N; i++) {
    const jen = pool[i % pool.length];
    const tk = pick(tingkatOf[jen]);
    const jur = jen === "SMK" ? pick(JUR_SMK) : jen === "SMA" ? pick(["IPA", "IPS"]) : "-";
    let nama, guard = 0;
    do {
      const s = sec[Math.floor(guard / 26) % 26] + sec[guard % 26];
      nama = jen === "SD" || jen === "SMP" ? tk + s : tk + " " + jur + " " + s;
      guard++;
    } while (used.has(nama) && guard < 4000);
    if (used.has(nama)) nama = nama + "-" + (i + 1);
    used.add(nama);
    kelas.push({ id: "K" + pad(i + 1, 4), nama, tingkat: String(tk), jurusan: jur, wali_kelas: pengajar[i % pengajar.length].id, kapasitas: O.kapasitas, tahun_ajaran: O.ta, jenjang: jen });
  }
  db["kelas.json"] = kelas;

  /* --- siswa --- */
  const siswa = [];
  for (let i = 0; i < N; i++) {
    const k = kelas[i % kelas.length];
    const jk = chance(51) ? "L" : "P";
    const nama = (jk === "L" ? pick(NM_M) : pick(NM_F)) + " " + pick(NM_L) + (chance(30) ? " " + pick(NM_M).slice(0, 1) + "." : "");
    const th = +k.tingkat <= 6 ? ri(2014, 2019) : +k.tingkat <= 9 ? ri(2011, 2013) : ri(2008, 2010);
    siswa.push({
      id: "S" + pad(i + 1, 4), nis: String(O.nisYear) + pad(i + 1, 4), nisn: pad(3120000000 + i * 13 + ri(1, 9), 10),
      nama, jk, tempat_lahir: pick(KOTA), tanggal_lahir: th + "-" + pad(ri(1, 12), 2) + "-" + pad(ri(1, 28), 2),
      agama: pick(AGAMA), kelas: k.nama, nama_ayah: pick(NM_M) + " " + pick(NM_L), nama_ibu: pick(NM_F) + " " + pick(NM_L),
      no_hp_ortu: "62851" + pad(2000000 + i * 11, 7), alamat: "Jl. " + pick(JALAN) + " No. " + ri(1, 99) + ", " + pick(KOTA),
      status: chance(95) ? "Aktif" : pick(["Lulus", "Pindah", "Keluar"]), tanggal_masuk: iso(new Date(O.nisYear, 6, ri(10, 20)))
    });
  }
  db["siswa.json"] = siswa;
  const aktif = siswa.filter(s => s.status === "Aktif");
  const byNis = Object.fromEntries(siswa.map(s => [s.nis, s]));
  const kelasByName = Object.fromEntries(kelas.map(k => [k.nama, k]));

  /* --- buku --- */
  const buku = [];
  for (let i = 0; i < N; i++) {
    buku.push({
      id: "B" + pad(i + 1, 4), isbn: "978-" + pad(ri(100, 999), 3) + "-" + pad(ri(1000, 9999), 4) + "-" + pad(ri(10, 99), 2) + "-" + pad(i % 10, 1),
      judul: pick(BUKU_JUDUL) + (chance(40) ? " Jilid " + ri(1, 6) : ""), pengarang: pick(PENULIS), penerbit: pick(PENERBIT),
      tahun: ri(2005, 2025), kategori: pick(["Pelajaran", "Pelajaran", "Fiksi", "Nonfiksi", "Referensi", "Anak"]),
      rak: pick("ABCDEF") + ri(1, 9), stok: ri(2, 40)
    });
  }
  db["buku.json"] = buku;

  /* --- soal (kunci jawaban benar secara faktual) --- */
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const BANK = {
    "IPA": [["Satuan gaya dalam SI adalah …", ["Joule","Watt","Newton","Pascal"], 2, "Gaya satuannya Newton (N) = kg·m/s²."],
            ["Organel tempat respirasi sel adalah …", ["Ribosom","Mitokondria","Lisosom","Vakuola"], 1, "Mitokondria menghasilkan ATP melalui respirasi sel."],
            ["Perubahan wujud padat ke gas disebut …", ["Mencair","Menguap","Menyublim","Mengembun"], 2, "Menyublim: padat langsung menjadi gas."],
            ["Alat ukur kuat arus listrik adalah …", ["Voltmeter","Amperemeter","Ohmmeter","Barometer"], 1, "Amperemeter dipasang seri untuk mengukur arus."],
            ["Fotosintesis menghasilkan …", ["CO₂ dan air","Glukosa dan O₂","Nitrogen","Asam laktat"], 1, "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂."]],
    "Bahasa Indonesia": [["Gagasan utama paragraf disebut …", ["Kalimat penjelas","Ide pokok","Konjungsi","Tesis"], 1, "Ide pokok adalah gagasan utama yang dikembangkan."],
            ["Teks yang berisi langkah-langkah disebut …", ["Deskripsi","Narasi","Prosedur","Eksposisi"], 2, "Teks prosedur memuat tahapan melakukan sesuatu."],
            ["Kata baku dari 'analisa' adalah …", ["Analisa","Analisis","Analis","Analisir"], 1, "Bentuk baku menurut KBBI: analisis."],
            ["Kalimat efektif harus …", ["Bertele-tele","Hemat dan logis","Tanpa subjek","Selalu pasif"], 1, "Kalimat efektif hemat, logis, dan tidak ambigu."]],
    "Bahasa Inggris": [["Choose the correct sentence.", ["She go to school","She goes to school","She going school","She gone school"], 1, "Simple present, subjek orang ketiga tunggal memakai verb+s."],
            ["The antonym of 'increase' is …", ["Rise","Grow","Decrease","Expand"], 2, "Increase berarti naik; lawannya decrease."],
            ["'I have lived here ___ 2010.'", ["for","since","from","at"], 1, "Since dipakai untuk titik awal waktu."],
            ["Past tense of 'write' is …", ["Writed","Wrote","Written","Writing"], 1, "write – wrote – written."]],
    "IPS": [["Ibu kota Provinsi Jawa Barat adalah …", ["Semarang","Bandung","Surabaya","Medan"], 1, "Bandung adalah ibu kota Jawa Barat."],
            ["Kegiatan menghasilkan barang disebut …", ["Distribusi","Konsumsi","Produksi","Investasi"], 2, "Produksi menciptakan/menambah nilai guna barang."],
            ["Lembaga pengawas keuangan negara adalah …", ["BPK","DPR","MA","KPU"], 0, "BPK memeriksa pengelolaan keuangan negara."],
            ["Proklamasi kemerdekaan RI dibacakan pada …", ["17 Agustus 1945","28 Oktober 1928","1 Juni 1945","20 Mei 1908"], 0, "17 Agustus 1945 di Jakarta."]],
    "Pendidikan Pancasila": [["Dasar negara Indonesia adalah …", ["UUD 1945","Pancasila","Bhinneka Tunggal Ika","NKRI"], 1, "Pancasila adalah dasar negara."],
            ["Sila ke-3 berbunyi …", ["Ketuhanan Yang Maha Esa","Kemanusiaan yang adil","Persatuan Indonesia","Keadilan sosial"], 2, "Sila ketiga: Persatuan Indonesia."],
            ["Musyawarah mencerminkan sila ke- …", ["2","3","4","5"], 2, "Sila keempat menekankan musyawarah/perwakilan."]],
    "Informatika": [["Bilangan biner 1010 bernilai desimal …", ["8","10","12","14"], 1, "1·8 + 0·4 + 1·2 + 0·1 = 10."],
            ["Struktur data LIFO adalah …", ["Queue","Stack","Array","Tree"], 1, "Stack: Last In First Out."],
            ["Perangkat lunak sumber terbuka disebut …", ["Freeware","Open source","Shareware","Malware"], 1, "Open source membuka kode sumbernya."],
            ["Protokol web aman adalah …", ["HTTP","FTP","HTTPS","SMTP"], 2, "HTTPS mengenkripsi dengan TLS."]],
    "PAI": [["Rukun Islam berjumlah …", ["3","4","5","6"], 2, "Ada lima rukun Islam."],
            ["Kitab suci umat Islam adalah …", ["Taurat","Injil","Al-Qur'an","Weda"], 2, "Al-Qur'an adalah kitab suci umat Islam."],
            ["Salat wajib sehari semalam …", ["3 waktu","4 waktu","5 waktu","6 waktu"], 2, "Lima waktu salat wajib."]],
    "Seni Budaya": [["Tari Saman berasal dari …", ["Bali","Aceh","Papua","Jawa Tengah"], 1, "Tari Saman berasal dari Aceh."],
            ["Warna primer adalah …", ["Hijau, ungu, oranye","Merah, kuning, biru","Hitam, putih, abu","Coklat, pink, emas"], 1, "Primer: merah, kuning, biru."],
            ["Angklung dimainkan dengan cara …", ["Dipukul","Digoyangkan","Ditiup","Dipetik"], 1, "Angklung digoyangkan hingga membunyi."]],
    "PJOK": [["Jumlah pemain futsal per tim …", ["5","6","7","11"], 0, "Futsal dimainkan 5 pemain termasuk kiper."],
            ["Induk organisasi sepak bola Indonesia …", ["PBSI","PSSI","PERBASI","PASI"], 1, "PSSI adalah induk sepak bola nasional."],
            ["Pemanasan bertujuan …", ["Menambah lelah","Mencegah cedera","Mengurangi fokus","Menurunkan suhu"], 1, "Pemanasan menyiapkan otot dan mencegah cedera."]],
    "Prakarya": [["Bahan lunak alami contohnya …", ["Plastisin","Tanah liat","Lilin","Sabun"], 1, "Tanah liat adalah bahan lunak alami."],
            ["Kewirausahaan menekankan …", ["Konsumsi","Inovasi dan risiko","Pengawasan","Pengarsipan"], 1, "Wirausaha mengelola inovasi dan risiko."]],
    "Ekonomi": [["Hukum permintaan: harga naik maka …", ["Permintaan naik","Permintaan turun","Penawaran turun","Tetap"], 1, "Harga dan jumlah diminta berbanding terbalik."],
            ["Biaya peluang adalah …", ["Biaya tetap","Nilai alternatif terbaik yang dikorbankan","Biaya variabel","Laba bersih"], 1, "Opportunity cost = nilai pilihan terbaik yang dilepas."]]
  };
  const soal = [];
  for (let i = 0; i < N; i++) {
    const mp = pick(MAPEL), k = pick(kelas);
    let q, opts, keyIdx, why;
    if (mp === "Matematika" || chance(18)) {
      const t = ri(0, 3);
      if (t === 0) { const a = ri(2, 9), x = ri(1, 12), b = ri(1, 20), c = a * x + b; q = "Jika " + a + "x + " + b + " = " + c + ", maka nilai x adalah …"; opts = [x, x + 1, x - 1, x + 2].map(String); keyIdx = 0; why = a + "x = " + c + " − " + b + " = " + (c - b) + ", maka x = " + x + "."; }
      else if (t === 1) { const a = ri(6, 24), b = ri(6, 30), l = a * b / gcd(a, b); q = "KPK dari " + a + " dan " + b + " adalah …"; opts = [l, l * 2, a * b, l / 2].map(v => String(Math.round(v))); keyIdx = 0; why = "KPK = hasil kali dibagi FPB (" + gcd(a, b) + ") = " + l + "."; }
      else if (t === 2) { const g = ri(3, 12), a = g * ri(2, 6), b = g * ri(2, 7); const gg = gcd(a, b); q = "FPB dari " + a + " dan " + b + " adalah …"; opts = [gg, gg * 2, a, b].map(String); keyIdx = 0; why = "Faktor persekutuan terbesar adalah " + gg + "."; }
      else { const a = ri(12, 60), b = ri(3, 12), c = ri(2, 9), v = a + b * c; q = "Hasil dari " + a + " + " + b + " × " + c + " adalah …"; opts = [v, (a + b) * c, v + c, v - b].map(String); keyIdx = 0; why = "Perkalian didahulukan: " + b + "×" + c + "=" + b * c + ", lalu +" + a + " = " + v + "."; }
    } else {
      const b = BANK[mp] || BANK["IPS"]; const item = pick(b);
      q = item[0]; opts = item[1].slice(); keyIdx = item[2]; why = item[3];
    }
    const order = [0, 1, 2, 3].sort(() => R() - .5);
    const shuffled = order.map(o => opts[o]);
    const key = "ABCD"[order.indexOf(keyIdx)];
    soal.push({ id: "Q" + pad(i + 1, 4), mapel: mp === "Matematika" || !BANK[mp] && chance(0) ? "Matematika" : mp, kelas: k.nama, pertanyaan: q, a: shuffled[0], b: shuffled[1], c: shuffled[2], d: shuffled[3], e: "", kunci: key, pembahasan: why });
  }
  db["soal.json"] = soal;

  /* --- ujian --- */
  const ujian = [];
  for (let i = 0; i < N; i++) {
    const mp = pick(MAPEL), k = pick(kelas);
    let cand = soal.filter(s => s.mapel === mp && s.kelas === k.nama);
    if (cand.length < 3) cand = soal.filter(s => s.mapel === mp);
    if (cand.length < 3) cand = soal;
    const n = Math.min(O.soalPerUjian, cand.length);
    const ids = cand.slice().sort(() => R() - .5).slice(0, n).map(s => s.id);
    const tgl = taDate();
    ujian.push({ id: "U" + pad(i + 1, 4), judul: pick(["Sumatif", "Formatif", "PTS", "PAS", "Latihan"]) + " " + mp + " — " + k.nama + " #" + (i + 1), mapel: mp, kelas: k.nama, durasi: pick([30, 45, 60, 90]), token: (mp.slice(0, 3) + k.nama.replace(/\s/g, "") + pad(i + 1, 3)).toUpperCase(), tanggal: tgl, status: chance(20) ? "Aktif" : chance(70) ? "Selesai" : "Draft", soal_ids: ids });
  }
  db["ujian.json"] = ujian;

  /* --- absensi siswa --- */
  const absensi = [];
  for (let i = 0; i < N; i++) {
    const s = siswa[i]; const st = chance(88) ? "Hadir" : chance(45) ? "Sakit" : chance(55) ? "Izin" : "Alfa";
    absensi.push({ id: "A" + pad(i + 1, 4), tanggal: iso(addD(NOW, -ri(0, O.absDays))), nis: s.nis, nama: s.nama, kelas: s.kelas, status: st, metode: chance(72) ? "QR" : "Manual", jam: pad(ri(6, 7), 2) + ":" + pad(ri(0, 59), 2) });
  }
  db["absensi.json"] = absensi;

  /* --- nilai --- */
  const nilai = [];
  for (let i = 0; i < N; i++) {
    const s = siswa[i], mp = pick(MAPEL), jenis = pick(["Formatif", "Formatif", "Sumatif", "UH", "PTS", "PAS", "CBT"]);
    nilai.push({ id: "N" + pad(i + 1, 4), nis: s.nis, mapel: mp, jenis, tp: (ST.kurikulum === "Merdeka" ? "TP " : "KD ") + ri(1, 4) + "." + ri(1, 6) + " " + mp, nilai: Math.min(100, Math.max(45, Math.round(rf(58, 99)))), semester: chance(75) ? "Ganjil" : "Genap", tahun_ajaran: O.ta });
  }
  db["nilai.json"] = nilai;

  /* --- spp --- */
  const spp = [];
  for (let i = 0; i < N; i++) {
    const s = siswa[i], k = kelasByName[s.kelas];
    const jen = (k && k.jenjang) || O.jenjang;
    const nom = (ST.biaya[jen] || ST.biaya.SMP).spp;
    const bl = ri(1, 12), th = bl >= 7 ? taStart : taEnd;
    const lunas = chance(O.lunas);
    spp.push({ id: "SP" + pad(i + 1, 4), nis: s.nis, nama: s.nama, kelas: s.kelas, bulan: bl, tahun: th, nominal: nom, status: lunas ? "Lunas" : "Belum", metode: lunas ? pick(["Transfer VA", "QRIS", "Tunai"]) : "", tanggal_bayar: lunas ? iso(new Date(th, bl - 1, ri(3, 25))) : "", va: O.vaPrefix + s.nis + pad(bl, 2) + String(th).slice(2) });
  }
  db["spp.json"] = spp;

  /* --- mutasi --- */
  const mutasi = [];
  for (let i = 0; i < N; i++) {
    const s = siswa[i], jenis = pick(["Masuk", "Masuk", "Pindah Kelas", "Keluar", "Pindah Sekolah"]);
    mutasi.push({ id: "M" + pad(i + 1, 4), tanggal: taDate(), nis: s.nis, jenis, tujuan_asal: pick(["SD Negeri ", "SMP Negeri ", "SMA Negeri ", "SMK Negeri "]) + ri(1, 40) + " " + pick(KOTA), keterangan: pick(["Pindah domisili orang tua.", "Mengikuti orang tua bertugas.", "Penyesuaian minat dan bakat.", "Melanjutkan pendidikan di luar daerah.", "Dokumen mutasi lengkap dan terverifikasi."]) });
  }
  db["mutasi.json"] = mutasi;

  /* --- ppdb --- */
  const ppdb = [];
  for (let i = 0; i < N; i++) {
    const jk = chance(50) ? "L" : "P";
    const nama = (jk === "L" ? pick(NM_M) : pick(NM_F)) + " " + pick(NM_L);
    const st = chance(55) ? "Menunggu" : chance(66) ? "Diterima" : "Ditolak";
    const linked = st === "Diterima" ? siswa[i % siswa.length] : null;
    ppdb.push({ id: "P" + pad(i + 1, 4), nomor_daftar: "PPDB-" + taStart + "-" + pad(i + 1, 4), tanggal_daftar: iso(addD(AWAL, ri(-40, 40))), nama: linked ? linked.nama : nama, nisn: linked ? linked.nisn : pad(4120000000 + i * 17, 10), jk: linked ? linked.jk : jk, tempat_lahir: pick(KOTA), tanggal_lahir: (linked ? linked.tanggal_lahir : ri(2008, 2015) + "-" + pad(ri(1, 12), 2) + "-" + pad(ri(1, 28), 2)), agama: pick(AGAMA), asal_sekolah: pick(["SD Negeri ", "SMP Negeri ", "MTs ", "SD Islam "]) + ri(1, 60) + " " + pick(KOTA), nama_ortu: pick(NM_M) + " " + pick(NM_L), no_hp: "62857" + pad(3000000 + i * 13, 7), alamat: "Jl. " + pick(JALAN) + " No. " + ri(1, 99) + ", " + pick(KOTA), pilihan_kelas: pick(kelas).nama, status: st, nis_baru: linked ? linked.nis : "" });
  }
  db["ppdb.json"] = ppdb;

  /* --- materi & tugas --- */
  const materi = [], tugas = [];
  for (let i = 0; i < N; i++) {
    const mp = pick(MAPEL), k = pick(kelas), tipe = pick(["Materi", "Materi", "Video", "Artikel", "Link"]);
    materi.push({ id: "MR" + pad(i + 1, 4), judul: mp + " — " + pick(["Konsep Dasar", "Pendalaman", "Latihan Terbimbing", "Projek Mini", "Rangkuman", "Studi Kasus"]) + " " + ri(1, 12), mapel: mp, kelas: k.nama, tipe, url: tipe === "Video" ? "https://www.youtube.com/watch?v=aqz-KE-bpKQ" : "https://drive.google.com/file/d/DEMO" + pad(i + 1, 4) + "/view", tanggal: taDate(), deskripsi: "Bahan ajar " + mp + " untuk " + k.nama + ": tujuan pembelajaran, contoh terapan, dan latihan mandiri terstruktur." });
    tugas.push({ id: "T" + pad(i + 1, 4), judul: "Tugas " + mp + " #" + (i + 1) + " — " + pick(["Latihan Halaman", "Analisis Teks", "Laporan Praktikum", "Poster Digital", "Video Presentasi"]), mapel: mp, kelas: k.nama, deskripsi: "Kerjakan sesuai instruksi, dokumentasikan hasil, dan kumpulkan sebelum tenggat melalui kanal yang ditentukan guru.", deadline: iso(addD(NOW, ri(-30, 45))), lampiran: chance(35) ? "https://drive.google.com/file/d/TGS" + pad(i + 1, 4) + "/view" : "" });
  }
  db["materi.json"] = materi; db["tugas.json"] = tugas;

  /* --- bos --- */
  const bos = [];
  const katOut = ["Perpustakaan", "Kegiatan Pembelajaran", "Administrasi Sekolah", "Pemeliharaan Sarpras", "Honor Guru Non-ASN", "Pengembangan Profesi", "Langganan Daya & Jasa", "Lainnya"];
  for (let i = 0; i < N; i++) {
    const tgl = taDate(), jenis = chance(14) ? "Penerimaan" : "Pengeluaran";
    bos.push({ id: "BS" + pad(i + 1, 4), tanggal: tgl, jenis, kategori: jenis === "Penerimaan" ? "BOS Reguler" : pick(katOut), uraian: jenis === "Penerimaan" ? "Pencairan BOS Reguler tahap " + ri(1, 2) : pick(["Pengadaan buku teks", "Honor guru non-ASN bulan berjalan", "Pemeliharaan ruang kelas", "Langganan listrik & internet", "Pelatihan guru", "Alat peraga laboratorium", "ATK dan administrasi"]) + " #" + (i + 1), jumlah: jenis === "Penerimaan" ? rp(ri(20000, 60000) * 1000) : rp(ri(150, 6000) * 1000), triwulan: triw(tgl), tahun: +tgl.slice(0, 4) });
  }
  db["bos.json"] = bos;

  /* --- gaji, absensi guru, jurnal, kinerja --- */
  const gaji = [], aguru = [], jurnal = [], kinerja = [];
  for (let i = 0; i < N; i++) {
    const g = guru[i], bl = ri(1, 12), th = bl >= 7 ? taStart : taEnd;
    const tunj = rp(ri(0, 900) * 1000), pot = rp(ri(0, 250) * 1000);
    const dibayar = chance(72);
    gaji.push({ id: "GJ" + pad(i + 1, 4), guru_id: g.id, nama: g.nama, bulan: bl, tahun: th, pokok: g.gaji_pokok, tunjangan: tunj, potongan: pot, total: g.gaji_pokok + tunj - pot, status: dibayar ? "Dibayar" : "Belum", tanggal_bayar: dibayar ? iso(new Date(th, bl - 1, ri(25, 28))) : "" });
    const stg = chance(90) ? "Hadir" : pick(["Sakit", "Izin", "Dinas Luar", "Alfa"]);
    aguru.push({ id: "AG" + pad(i + 1, 4), tanggal: iso(addD(NOW, -ri(0, O.absDays))), guru_id: g.id, jam_masuk: pad(ri(6, 7), 2) + ":" + pad(ri(0, 59), 2), jam_pulang: pad(ri(13, 15), 2) + ":" + pad(ri(0, 59), 2), status: stg, catatan: stg === "Hadir" ? "" : "Terverifikasi oleh bagian kepegawaian." });
    const t = pengajar[i % pengajar.length], kk = pick(kelas);
    jurnal.push({ id: "J" + pad(i + 1, 4), tanggal: iso(addD(NOW, -ri(1, 60))), guru_id: t.id, kelas: kk.nama, mapel: t.mapel, jam_ke: ri(1, 6) + "-" + ri(7, 8), materi: "Pembelajaran " + t.mapel + ": " + pick(["apersepsi & tujuan", "eksplorasi konsep", "diskusi kelompok", "praktik terbimbing", "presentasi karya", "refleksi & asesmen"]), catatan: pick(["Kelas kondusif.", "Perlu pendampingan 2 siswa.", "Media digital meningkatkan partisipasi.", "Tugas lanjutan diberikan."]) });
    kinerja.push({ id: "KN" + pad(i + 1, 4), guru_id: g.id, periode: O.ta + " Ganjil", pedagogik: ri(68, 96), profesional: ri(68, 96), sosial: ri(70, 98), kepribadian: ri(72, 99), penilai: ST.kepala_sekolah, catatan: pick(["Kinerja baik, tingkatkan pemanfaatan media digital.", "Perlu penguatan asesmen formatif.", "Aktif dalam pengembangan profesi.", "Kolaborasi dengan orang tua sangat baik."]) });
  }
  db["gaji.json"] = gaji; db["absensi-guru.json"] = aguru; db["jurnal.json"] = jurnal; db["kinerja.json"] = kinerja;

  /* --- chat & notifikasi --- */
  const chat = [], notif = [];
  const pesanSek = ["Menginformasikan tagihan SPP bulan berjalan belum dibayar. Mohon cek Portal Orang Tua.", "Ananda menunjukkan kemajuan pada asesmen formatif pekan ini.", "Mohon hadir pada rapat orang tua sesuai kalender akademik.", "Kegiatan besok memerlukan perlengkapan tambahan, detail di grup kelas.", "Absensi ananda tercatat alfa, mohon konfirmasi ke wali kelas."];
  const pesanOrtu = ["Terima kasih informasinya, akan segera kami tindak lanjuti.", "Baik Pak/Bu, pembayaran kami lakukan pekan ini via QRIS.", "Mohon izin ananda sakit, surat dokter menyusul.", "Kami siap hadir pada rapat orang tua.", "Terima kasih atas pendampingannya di kelas."];
  for (let i = 0; i < N; i++) {
    const s = siswa[i], dari = chance(50) ? "sekolah" : "ortu";
    const wkt = new Date(NOW.getTime() - ri(0, 45) * 864e5 - ri(0, 86399) * 1000);
    chat.push({ id: "C" + pad(i + 1, 4), nis: s.nis, dari, pesan: dari === "sekolah" ? pick(pesanSek) : pick(pesanOrtu), waktu: wkt.toISOString() });
    const tag = spp[i], jenis = pick(["Tagihan", "Absensi", "Nilai", "Pengumuman"]);
    const pesan = jenis === "Tagihan" ? "Yth. Orang Tua " + s.nama + ", tagihan SPP " + BULAN[tag.bulan - 1] + " " + tag.tahun + " sebesar " + fmtRp(tag.nominal) + " belum dibayar. Pembayaran via VA " + tag.va + ". — " + ST.nama_sekolah
      : jenis === "Absensi" ? "Kehadiran " + s.nama + " pada " + fmtTgl(absensi[i].tanggal) + " tercatat " + absensi[i].status + "."
      : jenis === "Nilai" ? "Nilai " + nilai[i].mapel + " (" + nilai[i].jenis + ") ananda " + s.nama + ": " + nilai[i].nilai + "."
      : ST.pengumuman;
    notif.push({ id: "NT" + pad(i + 1, 4), nis: s.nis, nama: s.nama, no_hp: s.no_hp_ortu, jenis, pesan, status: chance(70) ? "Terkirim" : "Antrean", waktu: wkt.toISOString() });
  }
  db["chat.json"] = chat; db["notifikasi.json"] = notif;

  /* --- inventaris --- */
  const inv = [];
  for (let i = 0; i < N; i++) {
    inv.push({ id: "IV" + pad(i + 1, 4), kode_barang: "BRG-" + pad(i + 1, 4), nama: pick(BARANG), kategori: pick(["Elektronik", "Mebel", "Alat Peraga", "Olahraga", "ATK", "Lainnya"]), jumlah: ri(1, 60), kondisi: chance(80) ? "Baik" : chance(65) ? "Rusak Ringan" : "Rusak Berat", lokasi: pick(LOKASI), sumber_dana: pick(["BOS", "BOS", "APBD", "Hibah", "Komite"]), tanggal_perolehan: iso(new Date(ri(2018, 2025), ri(0, 11), ri(1, 28))) });
  }
  db["inventaris.json"] = inv;

  /* --- peminjaman (stok buku disesuaikan) --- */
  const pinjam = [];
  for (let i = 0; i < N; i++) {
    const b = buku[i], s = siswa[i];
    const tp = addD(NOW, -ri(1, 60)), jt = addD(tp, pick([7, 14]));
    const kembali = chance(62);
    const tk = kembali ? addD(tp, ri(1, 20)) : null;
    const late = tk ? Math.max(0, Math.round((tk - jt) / 864e5)) : 0;
    pinjam.push({ id: "PM" + pad(i + 1, 4), buku_id: b.id, nis: s.nis, tanggal_pinjam: iso(tp), tanggal_jatuh_tempo: iso(jt), tanggal_kembali: tk ? iso(tk) : "", status: kembali ? "Dikembalikan" : "Dipinjam", denda: late * ST.denda_per_hari });
    if (!kembali) b.stok = Math.max(0, b.stok - 1);
  }
  db["peminjaman.json"] = pinjam;

  /* --- kegiatan --- */
  const keg = [];
  for (let i = 0; i < N; i++) {
    const kat = KAT_KEG[i % KAT_KEG.length], base = pick(KEG_JUDUL);
    keg.push({ id: "KG" + pad(i + 1, 4), urutan: i + 1, judul: base + " — Angkatan " + (Math.floor(i / KAT_KEG.length) + 1), kategori: kat, tanggal: taDate(), lokasi: pick(LOKASI), peserta: pick(["Seluruh siswa", "Perwakilan rombel", "Kelas 7–9", "Kelas 10–12", "Anggota ekstrakurikuler", "Siswa & orang tua"]), penyelenggara: pick(["Bidang Kesiswaan", "OSIS", "Guru Mapel", "Tim Literasi", "Pembina Pramuka", "Koordinator P5", "Komite Sekolah"]), ringkasan: base + " dengan kategori " + kat + " yang melibatkan warga sekolah secara aktif dan terdokumentasi.", deskripsi: base + " diselenggarakan sebagai bagian dari program " + kat + " sekolah. Kegiatan dirancang dengan tujuan pembelajaran yang jelas, pembagian peran panitia, serta rubrik penilaian. Peserta bekerja dalam kelompok, mendokumentasikan proses, dan mempresentasikan hasil. Refleksi dilakukan di akhir kegiatan untuk menindaklanjuti perbaikan pada penyelenggaraan berikutnya.", foto: fotoUrl(i), status: chance(O.draft) ? "Draft" : "Tampil", unggulan: chance(8) });
  }
  db["kegiatan.json"] = keg;

  /* --- kalender --- */
  const kal = [];
  const kalJudul = { "Akademik": ["Awal Semester", "Pembagian Rapor", "Batas Akhir Semester", "Orientasi Siswa Baru"], "Asesmen": ["Sumatif Tengah Semester", "Sumatif Akhir Semester", "Asesmen Diagnostik", "ANBK"], "Kegiatan": ["Pentas Seni", "Class Meeting", "Edutrip", "Market Day", "Workshop Robotik"], "PPDB": ["PPDB Gelombang Dibuka", "Verifikasi Berkas PPDB", "Pengumuman Kelulusan PPDB"], "Keagamaan": ["Pesantren Kilat", "Khataman Al-Qur'an", "Peringatan Hari Besar Keagamaan"], "Rapat Orang Tua": ["Rapat Awal Semester", "Rapat Komite", "Konferensi Wali Kelas"], "Libur Nasional": ["Hari Kemerdekaan RI", "Hari Raya Idul Fitri", "Hari Raya Natal", "Tahun Baru Masehi", "Maulid Nabi", "Isra Mi'raj", "Hari Pendidikan Nasional"], "Libur Semester": ["Libur Semester Ganjil", "Libur Kenaikan Kelas", "Libur Sekitar Idul Fitri"] };
  for (let i = 0; i < N; i++) {
    const kat = KAT_KAL[i % KAT_KAL.length], mulai = taDate();
    const dur = kat.startsWith("Libur") ? ri(1, 14) : kat === "Asesmen" ? ri(3, 6) : ri(0, 2);
    const selesai = dur > 0 ? iso(addD(new Date(mulai), dur)) : "";
    kal.push({ id: "KD" + pad(i + 1, 4), judul: pick(kalJudul[kat]) + " #" + (Math.floor(i / KAT_KAL.length) + 1), kategori: kat, mulai, selesai, semester: semOf(mulai), lokasi: pick(LOKASI), keterangan: "Agenda " + kat + " pada tahun ajaran " + O.ta + ". Pelaksanaan dikoordinasikan oleh bidang terkait dan diumumkan melalui Portal Orang Tua.", penting: chance(16), status: chance(O.draft) ? "Draft" : "Tampil" });
  }
  db["kalender.json"] = kal;

  /* --- slider (config menyesuaikan jumlah) --- */
  const ACC = ["emerald", "amber", "sky", "violet", "rose", "teal"];
  const slides = [];
  const SLJ = [["Selamat Datang di Sekolah Kami", "Bahagia Belajar"], ["Penerimaan Peserta Didik Baru", "Telah Dibuka"], ["Belajar Aktif & Berkarya", "Berpikir Kritis"], ["Gelar Karya & Pentas Seni", "Siswa Berprestasi"], ["Pantau Nilai, Absensi & SPP", "Kapan Saja"], ["Kurikulum Merdeka", "Projek Nyata"], ["Fasilitas Lengkap", "Belajar Nyaman"], ["Ekstrakurikuler Pilihan", "Bakat Terarah"]];
  for (let i = 0; i < N; i++) {
    const j = SLJ[i % SLJ.length];
    slides.push({ id: "SL" + pad(i + 1, 4), urutan: i + 1, eyebrow: pick(["Selamat Datang", "PPDB " + O.ta, "Active Learning", "Projek Penguatan Profil Pelajar", "Portal Orang Tua", "Fasilitas Sekolah"]) + " #" + (i + 1), judul: j[0], highlight: j[1], subjudul: "Dwibahasa • Berkarakter • Active Learning", deskripsi: "Lingkungan belajar yang hangat dan aman, tempat setiap anak dikenali potensinya, dihargai prosesnya, dan dirayakan pencapaiannya.", gambar: fotoUrl(i + 3), accent: ACC[i % ACC.length], overlay: ri(64, 78), align: chance(78) ? "left" : "center", cta1_label: pick(["Register Now", "Daftar Online", "Mulai Belajar", "Lihat Kegiatan", "Masuk Portal"]), cta1_href: pick(["ppdb.html", "belajar.html", "portal.html", "#kegiatan", "tuition.html"]), cta2_label: pick(["Virtual Tour", "Lihat Biaya", "Kalender Akademik", "Program Jenjang"]), cta2_href: pick(["#tour", "tuition.html", "kalender.html", "#program"]), meta: [ST.jenjang, "Kurikulum " + ST.kurikulum, "TA " + O.ta], durasi: ri(5, 9) * 1000, status: chance(O.draft) ? "Draft" : "Tampil" });
  }
  const tampilSlides = slides.filter(s => s.status === "Tampil").length;
  db["slider.json"] = { config: { autoplay: true, durasi: 7000, efek: pick(["slide", "slide", "fade"]), tinggi: "full", dots: O.autoDots ? tampilSlides <= 12 : true, panah: true, pause_on_hover: true, kenburns: true }, slides };

  /* --- audit --- */
  const audit = [];
  const mods = ["Akademik", "Keuangan", "LMS/CBT", "Kepegawaian", "Komunikasi", "Perpustakaan", "Konten Website", "Sistem"];
  const aksi = ["TAMBAH", "EDIT", "HAPUS", "IMPOR", "PUBLIKASI", "URUTKAN", "BAYAR SPP", "SCAN QR"];
  for (let i = 0; i < N; i++) {
    const s = siswa[i % siswa.length], g = guru[i % guru.length];
    audit.push({ id: "AU" + pad(i + 1, 4), waktu: new Date(NOW.getTime() - i * ri(60, 900) * 1000).toISOString(), aktor: pick(["admin", "operator", "bendahara", "kurikulum", "seeder"]), modul: pick(mods), aksi: pick(aksi), detail: pick(["Siswa " + s.nama + " (" + s.nis + ")", "Pegawai " + g.nama + " (" + g.id + ")", "Kelas " + s.kelas, "Tagihan SPP " + BULAN[spp[i % spp.length].bulan - 1], "Buku " + buku[i % buku.length].judul]) });
  }
  audit.unshift({ id: "AU-SEED", waktu: new Date().toISOString(), aktor: (sessionStorage.getItem("gh_user") || "seeder"), modul: "Sistem", aksi: "SEED DATA", detail: "Generate " + N + " record/koleksi • seed " + O.seed + " • TA " + O.ta });
  db["audit.json"] = audit.slice(0, N);

  if (!O.incSettings) delete db["settings.json"];
  if (!O.incSlider) delete db["slider.json"];
  return db;
}

/* ============================================================
   INTEGRITAS
   ============================================================ */
function verify() {
  const out = [];
  const add = (label, ok, note) => out.push({ label, ok, note });
  const uniq = (arr, key) => { const s = new Set(); let d = 0; arr.forEach(x => { const v = x[key]; if (s.has(v)) d++; s.add(v); }); return d; };
  const S = DB["siswa.json"] || [], G = DB["guru.json"] || [], K = DB["kelas.json"] || [], B = DB["buku.json"] || [], Q = DB["soal.json"] || [];
  const nisSet = new Set(S.map(x => x.nis)), gSet = new Set(G.map(x => x.id)), kSet = new Set(K.map(x => x.nama)), bSet = new Set(B.map(x => x.id)), qSet = new Set(Q.map(x => x.id));
  const st = DB["settings.json"], mpSet = new Set(st ? st.mapel : MAPEL);

  add("NIS siswa unik", uniq(S, "nis") === 0, uniq(S, "nis") + " duplikat");
  add("NISN siswa unik", uniq(S, "nisn") === 0, uniq(S, "nisn") + " duplikat");
  add("ID guru unik", uniq(G, "id") === 0, uniq(G, "id") + " duplikat");
  add("Nama rombel unik", uniq(K, "nama") === 0, uniq(K, "nama") + " duplikat");
  add("ISBN buku unik", uniq(B, "isbn") === 0, uniq(B, "isbn") + " duplikat");
  add("Token ujian unik", uniq(DB["ujian.json"] || [], "token") === 0, uniq(DB["ujian.json"] || [], "token") + " duplikat");
  add("Kode barang unik", uniq(DB["inventaris.json"] || [], "kode_barang") === 0, "");
  add("No. pendaftaran PPDB unik", uniq(DB["ppdb.json"] || [], "nomor_daftar") === 0, "");

  const fk = (file, key, set, label) => { const a = DB[file] || []; const bad = a.filter(x => x[key] && !set.has(x[key])).length; add(label, bad === 0, bad + " rujukan gagal"); };
  fk("siswa.json", "kelas", kSet, "siswa.kelas → kelas.nama");
  fk("kelas.json", "wali_kelas", gSet, "kelas.wali_kelas → guru.id");
  fk("mutasi.json", "nis", nisSet, "mutasi.nis → siswa.nis");
  fk("absensi.json", "nis", nisSet, "absensi.nis → siswa.nis");
  fk("nilai.json", "nis", nisSet, "nilai.nis → siswa.nis");
  fk("nilai.json", "mapel", mpSet, "nilai.mapel → settings.mapel");
  fk("spp.json", "nis", nisSet, "spp.nis → siswa.nis");
  fk("gaji.json", "guru_id", gSet, "gaji.guru_id → guru.id");
  fk("absensi-guru.json", "guru_id", gSet, "absensi-guru.guru_id → guru.id");
  fk("jurnal.json", "guru_id", gSet, "jurnal.guru_id → guru.id");
  fk("jurnal.json", "kelas", kSet, "jurnal.kelas → kelas.nama");
  fk("kinerja.json", "guru_id", gSet, "kinerja.guru_id → guru.id");
  fk("chat.json", "nis", nisSet, "chat.nis → siswa.nis");
  fk("notifikasi.json", "nis", nisSet, "notifikasi.nis → siswa.nis");
  fk("peminjaman.json", "buku_id", bSet, "peminjaman.buku_id → buku.id");
  fk("peminjaman.json", "nis", nisSet, "peminjaman.nis → siswa.nis");
  fk("materi.json", "kelas", kSet, "materi.kelas → kelas.nama");
  fk("tugas.json", "kelas", kSet, "tugas.kelas → kelas.nama");
  fk("ujian.json", "kelas", kSet, "ujian.kelas → kelas.nama");
  fk("soal.json", "kelas", kSet, "soal.kelas → kelas.nama");
  fk("ppdb.json", "pilihan_kelas", kSet, "ppdb.pilihan_kelas → kelas.nama");

  const uBad = (DB["ujian.json"] || []).filter(u => (u.soal_ids || []).some(id => !qSet.has(id))).length;
  add("ujian.soal_ids → soal.id", uBad === 0, uBad + " ujian rusak");
  const uEmpty = (DB["ujian.json"] || []).filter(u => !(u.soal_ids || []).length).length;
  add("Ujian memiliki soal", uEmpty === 0, uEmpty + " ujian kosong");

  const byNis = Object.fromEntries(S.map(s => [s.nis, s]));
  const denAbs = (DB["absensi.json"] || []).filter(a => byNis[a.nis] && (byNis[a.nis].nama !== a.nama || byNis[a.nis].kelas !== a.kelas)).length;
  add("Denormalisasi absensi cocok", denAbs === 0, denAbs + " tidak cocok");
  const denSpp = (DB["spp.json"] || []).filter(a => byNis[a.nis] && (byNis[a.nis].nama !== a.nama || byNis[a.nis].kelas !== a.kelas)).length;
  add("Denormalisasi SPP cocok", denSpp === 0, denSpp + " tidak cocok");
  const byG = Object.fromEntries(G.map(g => [g.id, g]));
  const denGaji = (DB["gaji.json"] || []).filter(a => byG[a.guru_id] && (byG[a.guru_id].nama !== a.nama || byG[a.guru_id].gaji_pokok !== a.pokok)).length;
  add("gaji.pokok = guru.gaji_pokok", denGaji === 0, denGaji + " tidak cocok");
  const totBad = (DB["gaji.json"] || []).filter(g => g.total !== g.pokok + g.tunjangan - g.potongan).length;
  add("Aritmetika total gaji", totBad === 0, totBad + " salah hitung");
  const nBad = (DB["nilai.json"] || []).filter(n => n.nilai < 0 || n.nilai > 100).length;
  add("Rentang nilai 0–100", nBad === 0, nBad + " di luar rentang");
  const kBad = (DB["soal.json"] || []).filter(s => !["A","B","C","D","E"].includes(s.kunci) || !s[String(s.kunci).toLowerCase()]).length;
  add("Kunci soal menunjuk opsi terisi", kBad === 0, kBad + " soal invalid");
  const pBad = (DB["peminjaman.json"] || []).filter(p => p.tanggal_jatuh_tempo < p.tanggal_pinjam || (p.tanggal_kembali && p.tanggal_kembali < p.tanggal_pinjam)).length;
  add("Urutan tanggal peminjaman", pBad === 0, pBad + " salah urutan");
  const kBad2 = (DB["kalender.json"] || []).filter(k => k.selesai && k.selesai < k.mulai).length;
  add("Urutan tanggal kalender", kBad2 === 0, kBad2 + " salah urutan");
  const stokBad = B.filter(b => b.stok < 0).length;
  add("Stok buku tidak negatif", stokBad === 0, stokBad + " negatif");
  const vaBad = (DB["spp.json"] || []).filter(s => !String(s.va).startsWith(st ? st.bank.va_prefix : O.vaPrefix)).length;
  add("Format VA sesuai prefix", vaBad === 0, vaBad + " menyimpang");
  if (DB["slider.json"]) { const c = DB["slider.json"].config, n = DB["slider.json"].slides.filter(s => s.status === "Tampil").length; add("Dot slider aman (" + n + " aktif)", !c.dots || n <= 12, c.dots ? "dot aktif" : "dot dimatikan otomatis"); }
  return out;
}

/* ============================================================
   UI
   ============================================================ */
const CTRL = [
  { k: "count", t: "range", l: "Jumlah record / koleksi", min: 10, max: 1000, step: 10, icon: "hash", fmt: v => v + " record" },
  { k: "seed", t: "num", l: "Seed acak (reproducible)", min: 1, max: 99999999, icon: "dice-5" },
  { k: "ta", t: "sel", l: "Tahun ajaran", opts: ["2025/2026", "2026/2027", "2027/2028"], icon: "calendar-range" },
  { k: "nisYear", t: "num", l: "Tahun prefix NIS", min: 2020, max: 2035, icon: "fingerprint" },
  { k: "jenjang", t: "sel", l: "Jenjang utama sekolah", opts: ["SD", "SMP", "SMA", "SMK"], icon: "graduation-cap" },
  { k: "mix", t: "sel", l: "Distribusi rombel", opts: [["merata", "Merata 4 jenjang"], ["sd", "Dominan SD"], ["smp", "Dominan SMP"], ["sma", "Dominan SMA"], ["smk", "Dominan SMK"]], icon: "pie-chart" },
  { k: "kapasitas", t: "range", l: "Kapasitas per rombel", min: 20, max: 40, step: 1, icon: "users-round", fmt: v => v + " siswa" },
  { k: "lunas", t: "range", l: "Rasio SPP lunas", min: 0, max: 100, step: 1, icon: "badge-check", fmt: v => v + "%" },
  { k: "draft", t: "range", l: "Rasio draft konten", min: 0, max: 40, step: 1, icon: "eye-off", fmt: v => v + "%" },
  { k: "absDays", t: "range", l: "Rentang tanggal absensi", min: 7, max: 120, step: 1, icon: "calendar-clock", fmt: v => v + " hari" },
  { k: "soalPerUjian", t: "range", l: "Soal per paket ujian", min: 3, max: 25, step: 1, icon: "list-ordered", fmt: v => v + " soal" },
  { k: "spp", t: "num", l: "Nominal SPP dasar (Rp)", min: 0, max: 2000000, icon: "wallet" },
  { k: "vaPrefix", t: "txt", l: "Prefix Virtual Account", icon: "landmark" },
  { k: "wa", t: "txt", l: "No. WA admin sekolah", icon: "message-circle" },
  { k: "incSettings", t: "tog", l: "Sertakan settings.json", icon: "settings" },
  { k: "incSlider", t: "tog", l: "Sertakan slider.json", icon: "gallery-horizontal-end" },
  { k: "autoDots", t: "tog", l: "Matikan dot bila slide > 12", icon: "circle-dot" },
  { k: "deterministik", t: "tog", l: "Kunci seed (deterministik)", icon: "lock" }
];

function renderControls() {
  $("controls").innerHTML = CTRL.map(c => {
    const v = O[c.k];
    const head = '<div class="flex items-center justify-between gap-2 mb-1.5"><span class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400"><i data-lucide="' + c.icon + '" class="w-3.5 h-3.5 text-slate-500"></i>' + c.l + "</span>" + (c.t === "range" ? '<span id="cv_' + c.k + '" class="text-[11px] font-mono font-bold text-jade-400">' + (c.fmt ? c.fmt(v) : v) + "</span>" : "") + "</div>";
    if (c.t === "range") return '<div>' + head + '<input id="c_' + c.k + '" type="range" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + v + '" class="w-full"></div>';
    if (c.t === "tog") return '<label class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-ink-600 bg-ink-900/60 cursor-pointer chip hover:border-jade-500"><span class="flex items-center gap-1.5 text-[11px] font-bold text-slate-300"><i data-lucide="' + c.icon + '" class="w-3.5 h-3.5 text-slate-500"></i>' + c.l + '</span><input id="c_' + c.k + '" type="checkbox" ' + (v ? "checked" : "") + ' class="w-4.5 h-4.5 w-5 h-5 accent-jade-500 shrink-0"></label>';
    if (c.t === "sel") return '<div>' + head + '<select id="c_' + c.k + '" class="fld">' + c.opts.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return '<option value="' + val + '" ' + (String(v) === String(val) ? "selected" : "") + ">" + lab + "</option>"; }).join("") + "</select></div>";
    return '<div>' + head + '<input id="c_' + c.k + '" type="' + (c.t === "num" ? "number" : "text") + '" ' + (c.t === "num" ? 'min="' + c.min + '" max="' + c.max + '"' : "") + ' value="' + esc(v) + '" class="fld font-mono"></div>';
  }).join("");
  CTRL.forEach(c => {
    const el = $("c_" + c.k); if (!el) return;
    const h = () => {
      O[c.k] = c.t === "tog" ? el.checked : c.t === "num" || c.t === "range" ? +el.value : el.value;
      const lbl = $("cv_" + c.k); if (lbl) lbl.textContent = c.fmt ? c.fmt(O[c.k]) : O[c.k];
      schedule();
    };
    el.oninput = h; el.onchange = h;
  });
  refreshIcons();
}

function schedule() { clearTimeout(genTimer); genTimer = setTimeout(regen, 140); }

function regen() {
  const t0 = performance.now();
  DB = build();
  ORDER = ORDER.filter(f => DB[f]);
  SETS.forEach(s => { if (DB[s.f] && !ORDER.includes(s.f)) ORDER.push(s.f); });
  SEL = new Set(ORDER.filter(f => SEL.size === 0 || SEL.has(f)));
  if (!SEL.size) SEL = new Set(ORDER);
  CHECKS = verify();
  if (!DB[PV.set]) PV.set = ORDER[0] || "siswa.json";
  PV.page = 1;
  paint(Math.round(performance.now() - t0));
}

function bytesOf(f) { return new Blob([JSON.stringify(DB[f], null, 2)]).size; }
const kb = n => n < 1024 * 1024 ? (n / 1024).toFixed(1) + " KB" : (n / 1048576).toFixed(2) + " MB";

function paint(ms) {
  const totalRecords = ORDER.reduce((a, f) => a + rowsOf(f).length, 0);
  const totalBytes = ORDER.reduce((a, f) => a + bytesOf(f), 0);
  const fails = CHECKS.filter(c => !c.ok).length;
  $("pillRecords").textContent = totalRecords.toLocaleString("id-ID") + " record";
  $("pillBytes").textContent = kb(totalBytes);
  const pi = $("pillIntegrity");
  pi.className = "chip px-3 py-1.5 rounded-full text-xs font-bold border " + (fails ? "bg-rosex-400/12 border-rosex-400/40 text-rosex-400" : "bg-jade-500/12 border-jade-500/40 text-jade-300");
  pi.innerHTML = fails ? "✗ " + fails + " masalah relasi" : "✓ " + CHECKS.length + " pemeriksaan lolos";
  const rc = repoCfg(); $("repoLine").textContent = (rc.owner && rc.repo) ? rc.owner + "/" + rc.repo + " · " + rc.branch : "config.js belum diisi";
  $("heroStats").innerHTML = [
    ["layers", "Koleksi", ORDER.length, "jade"], ["database", "Total Record", totalRecords.toLocaleString("id-ID"), "cyanx"],
    ["hard-drive", "Ukuran JSON", kb(totalBytes), "violetx"], ["gauge", "Waktu Generate", (ms || 0) + " ms", "amberx"]
  ].map(s => '<div class="rounded-2xl border border-ink-600 bg-ink-900/70 px-4 py-3 min-w-[128px]"><div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"><i data-lucide="' + s[0] + '" class="w-3.5 h-3.5 text-' + s[3] + '-400"></i>' + s[1] + '</div><div class="font-display font-bold text-xl text-white mt-1">' + s[2] + "</div></div>").join("");
  renderQueue(); renderIntegrity(); renderPresets(); setupPreview(); renderPreview();
  document.querySelectorAll(".rv").forEach((e, i) => setTimeout(() => e.classList.add("in"), i * 60));
  refreshIcons();
}

function renderQueue() {
  const depIndex = Object.fromEntries(ORDER.map((f, i) => [f, i]));
  $("queueInfo").textContent = SEL.size + "/" + ORDER.length + " dipilih · " + kb(ORDER.filter(f => SEL.has(f)).reduce((a, f) => a + bytesOf(f), 0));
  $("queue").innerHTML = ORDER.map((f, i) => {
    const m = meta(f), n = rowsOf(f).length, bad = (m.dep || []).some(d => DB[d] && depIndex[d] > i);
    return '<div draggable="true" data-q="' + f + '" class="qrow flex items-center gap-2.5 px-3 py-2.5 border-l-2 ' + (bad ? "border-amberx-400" : "border-transparent") + ' ' + (SEL.has(f) ? "" : "opacity-45") + '">' +
      '<i data-lucide="grip-vertical" class="w-3.5 h-3.5 text-slate-600 cursor-grab shrink-0"></i>' +
      '<input type="checkbox" data-qsel="' + f + '" ' + (SEL.has(f) ? "checked" : "") + ' class="w-4 h-4 accent-jade-500 shrink-0">' +
      '<span class="w-7 h-7 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0"><i data-lucide="' + m.icon + '" class="w-3.5 h-3.5 text-cyanx-400"></i></span>' +
      '<button data-qopen="' + f + '" class="min-w-0 flex-1 text-left"><b class="block text-xs text-slate-200 truncate">' + m.label + '</b><span class="text-[10px] font-mono text-slate-500">' + f + (bad ? ' · <span class="text-amberx-400">dependensi belum di atas</span>' : "") + "</span></button>" +
      '<span class="text-[10px] font-mono font-bold text-jade-400 shrink-0">' + (m.kind === "obj" && f === "settings.json" ? "objek" : n) + "</span>" +
      '<span class="text-[10px] font-mono text-slate-500 shrink-0 w-16 text-right">' + kb(bytesOf(f)) + "</span>" +
      '<button data-qdl="' + f + '" class="btn w-7 h-7 rounded-lg border border-ink-600 flex items-center justify-center hover:border-jade-500 shrink-0" title="Unduh berkas ini"><i data-lucide="download" class="w-3.5 h-3.5 pointer-events-none"></i></button>' +
      "</div>";
  }).join("");
  $("queue").querySelectorAll("[data-qsel]").forEach(c => c.onchange = () => { c.checked ? SEL.add(c.dataset.qsel) : SEL.delete(c.dataset.qsel); renderQueue(); refreshIcons(); });
  $("queue").querySelectorAll("[data-qopen]").forEach(b => b.onclick = () => { PV.set = b.dataset.qopen; PV.page = 1; PV.q = ""; PV.filter = ""; $("pvQ").value = ""; setupPreview(); renderPreview(); $("pvSet").scrollIntoView({ behavior: "smooth", block: "center" }); });
  $("queue").querySelectorAll("[data-qdl]").forEach(b => b.onclick = () => download(b.dataset.qdl, JSON.stringify(DB[b.dataset.qdl], null, 2)));
  let dragF = null;
  $("queue").querySelectorAll("[data-q]").forEach(row => {
    row.ondragstart = e => { dragF = row.dataset.q; row.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", dragF); } catch (x) {} };
    row.ondragend = () => { row.classList.remove("drag"); $("queue").querySelectorAll("[data-q]").forEach(r => r.classList.remove("over")); };
    row.ondragover = e => { e.preventDefault(); row.classList.add("over"); };
    row.ondragleave = () => row.classList.remove("over");
    row.ondrop = e => {
      e.preventDefault(); const t = row.dataset.q; if (!dragF || dragF === t) return;
      const a = ORDER.slice(), from = a.indexOf(dragF), to = a.indexOf(t);
      a.splice(from, 1); a.splice(to, 0, dragF); ORDER = a; dragF = null; renderQueue(); refreshIcons();
      toast("Urutan berkas diubah — memengaruhi urutan pengiriman.", "info");
    };
  });
}

function renderIntegrity() {
  $("integrity").innerHTML = CHECKS.map(c =>
    '<div class="flex items-start gap-2 px-2.5 py-2 rounded-lg ' + (c.ok ? "bg-jade-500/6 border border-jade-500/20" : "bg-rosex-400/8 border border-rosex-400/30") + '">' +
    '<i data-lucide="' + (c.ok ? "check" : "x") + '" class="w-3.5 h-3.5 mt-0.5 shrink-0 ' + (c.ok ? "text-jade-400" : "text-rosex-400") + '"></i>' +
    '<span class="min-w-0"><b class="block text-[11px] ' + (c.ok ? "text-slate-300" : "text-rosex-400") + '">' + c.label + "</b>" +
    (c.note && !c.ok ? '<span class="text-[10px] font-mono text-rosex-400/80">' + c.note + "</span>" : "") + "</span></div>").join("");
  refreshIcons();
}

/* ---------- preview ---------- */
function setupPreview() {
  $("pvSet").innerHTML = ORDER.map(f => '<option value="' + f + '" ' + (PV.set === f ? "selected" : "") + ">" + meta(f).label + "</option>").join("");
  const rows = rowsOf(PV.set), m = meta(PV.set);
  const filterField = ["status", "kategori", "jenis", "kelas", "mapel", "tipe", "semester", "kondisi", "dari", "accent"].find(k => rows.length && rows[0][k] !== undefined);
  const vals = filterField ? [...new Set(rows.map(r => r[filterField]))].filter(Boolean).sort() : [];
  $("pvFilter").innerHTML = '<option value="">' + (filterField ? "Semua " + filterField : "Tanpa filter") + "</option>" + vals.map(v => '<option ' + (PV.filter === v ? "selected" : "") + ">" + esc(v) + "</option>").join("");
  $("pvFilter").dataset.field = filterField || "";
  const cols = m.cols.filter(c => rows.length && rows[0][c] !== undefined);
  $("pvSort").innerHTML = '<option value="">Urutan asli</option>' + cols.map(c => '<option value="' + c + '" ' + (PV.sort === c ? "selected" : "") + ">" + c + "</option>").join("");
}
function pvRows() {
  let r = rowsOf(PV.set).slice();
  const ff = $("pvFilter").dataset.field;
  if (PV.filter && ff) r = r.filter(x => String(x[ff]) === PV.filter);
  if (PV.q) { const q = PV.q.toLowerCase(); r = r.filter(x => JSON.stringify(x).toLowerCase().includes(q)); }
  if (PV.sort) r.sort((a, b) => { const x = a[PV.sort], y = b[PV.sort]; return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * PV.dir; });
  return r;
}
function renderPreview() {
  const m = meta(PV.set), rows = pvRows(), all = rowsOf(PV.set);
  const cols = m.cols.filter(c => all.length && all[0][c] !== undefined);
  const size = +$("pvSize").value; PV.size = size;
  const pages = Math.max(1, Math.ceil(rows.length / size));
  PV.page = Math.min(PV.page, pages);
  const slice = rows.slice((PV.page - 1) * size, PV.page * size);
  $("pvHead").innerHTML = '<tr><th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-10">#</th>' +
    cols.map(c => '<th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">' + c + "</th>").join("") +
    '<th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Detail</th></tr>';
  $("pvBody").innerHTML = slice.map((r, i) =>
    '<tr class="trow border-t border-ink-700/60">' +
    '<td class="px-3 py-2 font-mono text-slate-600">' + ((PV.page - 1) * size + i + 1) + "</td>" +
    cols.map(c => {
      let v = r[c];
      if (typeof v === "boolean") v = v ? "✓" : "—";
      if (Array.isArray(v)) v = v.length + " item";
      if (typeof v === "number" && /nominal|pokok|total|jumlah|gaji|tunjangan|potongan|denda/.test(c)) v = fmtRp(v);
      const badge = /^(status|jenis|kondisi|dari|tipe|accent)$/.test(c);
      return '<td class="px-3 py-2 whitespace-nowrap max-w-[240px] truncate ' + (badge ? "" : "text-slate-300") + '">' +
        (badge ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + toneOf(String(v)) + '">' + esc(trunc(v, 22)) + "</span>" : esc(trunc(v, 42))) + "</td>";
    }).join("") +
    '<td class="px-3 py-2 text-right"><button data-row="' + ((PV.page - 1) * size + i) + '" class="btn w-7 h-7 rounded-lg border border-ink-600 inline-flex items-center justify-center hover:border-violetx-400"><i data-lucide="panel-right-open" class="w-3.5 h-3.5 pointer-events-none"></i></button></td></tr>'
  ).join("") || '<tr><td colspan="' + (cols.length + 2) + '" class="px-3 py-10 text-center text-slate-500">Tidak ada record yang cocok.</td></tr>';
  $("pvInfo").textContent = rows.length.toLocaleString("id-ID") + " cocok / " + all.length.toLocaleString("id-ID") + " total · " + kb(bytesOf(PV.set));
  $("pvPage").textContent = PV.page + " / " + pages;
  $("pvBody").querySelectorAll("[data-row]").forEach(b => b.onclick = () => openDrawer(rows[+b.dataset.row]));
  refreshIcons();
}
function toneOf(v) {
  if (/^(Aktif|Lunas|Diterima|Hadir|Baik|Dibayar|Terkirim|Dikembalikan|Selesai|Tampil|Penerimaan|sekolah)$/.test(v)) return "bg-jade-500/15 text-jade-300 border border-jade-500/30";
  if (/^(Belum|Menunggu|Dipinjam|Draft|Izin|Antrean|Rusak Ringan)$/.test(v)) return "bg-amberx-400/15 text-amberx-400 border border-amberx-400/30";
  if (/^(Alfa|Ditolak|Keluar|Rusak Berat|Pengeluaran)$/.test(v)) return "bg-rosex-400/15 text-rosex-400 border border-rosex-400/30";
  if (/^(Sakit|Pindah|Lulus|Dinas Luar|ortu)$/.test(v)) return "bg-cyanx-400/15 text-cyanx-400 border border-cyanx-400/30";
  return "bg-violetx-400/15 text-violetx-400 border border-violetx-400/30";
}

/* ---------- drawer ---------- */
let drawerRec = null;
function openDrawer(rec) {
  drawerRec = rec;
  $("drawerTitle").textContent = rec.nama || rec.judul || rec.nis || rec.id || "Record";
  $("drawerSub").textContent = PV.set + " · " + (rec.id || rec.nis || rec.kode_barang || "—");
  $("drawerBody").textContent = JSON.stringify(rec, null, 2);
  const rel = [];
  const push = (f, key, val, label) => { if (val && DB[f]) rel.push({ f, key, val, label }); };
  push("siswa.json", "nis", rec.nis, "Siswa");
  push("kelas.json", "nama", rec.kelas, "Rombel");
  push("guru.json", "id", rec.guru_id || rec.wali_kelas, "Pegawai");
  push("buku.json", "id", rec.buku_id, "Buku");
  push("nilai.json", "nis", rec.nis, "Nilai");
  push("spp.json", "nis", rec.nis, "Tagihan SPP");
  push("absensi.json", "nis", rec.nis, "Absensi");
  push("peminjaman.json", "nis", rec.nis, "Peminjaman");
  push("soal.json", "id", (rec.soal_ids || [])[0], "Soal ujian");
  $("drawerRel").innerHTML = rel.length ? rel.map((r, i) => '<button data-rel="' + i + '" class="btn chip px-2.5 py-1 rounded-full bg-ink-800 border border-ink-600 text-[10px] font-bold text-cyanx-400 hover:border-cyanx-400">' + r.label + " →</button>").join("") : '<span class="text-[11px] text-slate-600">Tidak ada relasi langsung.</span>';
  $("drawerRel").querySelectorAll("[data-rel]").forEach(b => b.onclick = () => {
    const r = rel[+b.dataset.rel];
    PV.set = r.f; PV.q = String(r.val); PV.filter = ""; PV.page = 1; $("pvQ").value = PV.q;
    setupPreview(); renderPreview(); closeDrawer();
    toast("Pratinjau diarahkan ke " + r.f + " untuk kunci " + r.val, "info");
  });
  $("drawer").classList.remove("hidden");
  requestAnimationFrame(() => $("drawerPanel").classList.remove("translate-x-full"));
  refreshIcons();
}
function closeDrawer() { $("drawerPanel").classList.add("translate-x-full"); setTimeout(() => $("drawer").classList.add("hidden"), 340); }

/* ---------- undo ---------- */
function showUndo(label, restore) {
  undoState = restore;
  $("undoHost").innerHTML = '<div class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] glass rounded-2xl px-5 py-3 flex items-center gap-4 text-sm shadow-2xl"><i data-lucide="undo-2" class="w-4 h-4 text-amberx-400"></i><span class="text-slate-300">' + label + '</span><button id="undoBtn" class="btn px-3 py-1.5 rounded-lg bg-jade-500 text-ink-950 font-bold">Urungkan</button></div>';
  refreshIcons();
  $("undoBtn").onclick = () => { undoState && undoState(); undoState = null; $("undoHost").innerHTML = ""; toast("Perubahan diurungkan.", "success"); };
  clearTimeout(undoTimer); undoTimer = setTimeout(() => { $("undoHost").innerHTML = ""; undoState = null; }, 9000);
}

/* ---------- preset ---------- */
const PKEY = "sd_presets";
const presets = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || []; } catch (e) { return []; } };
const setPresets = v => localStorage.setItem(PKEY, JSON.stringify(v));
function renderPresets() {
  const p = presets();
  $("presets").innerHTML = p.length ? p.map((x, i) =>
    '<div class="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-ink-900/70 border border-ink-600"><i data-lucide="bookmark" class="w-3.5 h-3.5 text-amberx-400 shrink-0"></i><button data-p="' + i + '" class="min-w-0 flex-1 text-left"><b class="block text-[11px] text-slate-200 truncate">' + esc(x.name) + '</b><span class="text-[10px] font-mono text-slate-500">' + x.opts.count + " rec · seed " + x.opts.seed + '</span></button><button data-pd="' + i + '" class="btn w-6 h-6 rounded-md hover:bg-rosex-400/15 text-rosex-400 flex items-center justify-center shrink-0"><i data-lucide="x" class="w-3 h-3 pointer-events-none"></i></button></div>').join("")
    : '<div class="text-[11px] text-slate-600 px-1">Belum ada preset. Simpan konfigurasi yang sering dipakai.</div>';
  $("presets").querySelectorAll("[data-p]").forEach(b => b.onclick = () => {
    const x = presets()[+b.dataset.p]; const prev = { ...O }, prevSel = new Set(SEL), prevOrder = ORDER.slice();
    O = { ...DEF, ...x.opts }; ORDER = x.order || []; SEL = new Set(x.sel || []);
    renderControls(); regen();
    showUndo("Preset \"" + x.name + "\" diterapkan", () => { O = prev; SEL = prevSel; ORDER = prevOrder; renderControls(); regen(); });
  });
  $("presets").querySelectorAll("[data-pd]").forEach(b => b.onclick = () => { const p = presets(); const rm = p.splice(+b.dataset.pd, 1)[0]; setPresets(p); renderPresets(); showUndo("Preset \"" + rm.name + "\" dihapus", () => { const q = presets(); q.push(rm); setPresets(q); renderPresets(); }); });
  refreshIcons();
}

/* ---------- export ---------- */
function blobDl(name, blob) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }
async function exportZip() {
  const files = ORDER.filter(f => SEL.has(f));
  if (!files.length) return toast("Tidak ada berkas dipilih.", "error");
  showLoading("Mengemas " + files.length + " berkas…");
  try {
    const zip = new JSZip(), root = zip.folder("data");
    files.forEach(f => root.file(f, JSON.stringify(DB[f], null, 2)));
    zip.file("seed-config.json", JSON.stringify({ generated: new Date().toISOString(), options: O, order: ORDER, selected: files, integrity: CHECKS }, null, 2));
    zip.file("README-seed.txt", "Hasil generate Seeder Data — SIN School\nTempatkan seluruh isi folder data/ ke folder data/ pada repositori GitHub Pages Anda.\nTotal koleksi: " + files.length + "\nRecord per koleksi: " + O.count + "\nSeed: " + O.seed + "\nTahun ajaran: " + O.ta + "\nIntegritas: " + (CHECKS.filter(c => !c.ok).length ? "ADA MASALAH" : "SEMUA LOLOS") + "\n");
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, m => { $("topProg").style.width = m.percent.toFixed(0) + "%"; });
    blobDl("data-seed-" + O.count + "x" + files.length + "-" + O.seed + ".zip", blob);
    toast("ZIP berisi " + files.length + " berkas siap diunduh.", "success");
  } catch (e) { toast("Gagal mengemas ZIP: " + e.message, "error"); }
  finally { hideLoading(); setTimeout(() => $("topProg").style.width = "0%", 700); }
}

/* ---------- push ---------- */
function logLine(txt, tone) {
  const c = { ok: "text-jade-400", err: "text-rosex-400", warn: "text-amberx-400", info: "text-cyanx-400" }[tone] || "text-slate-400";
  const el = document.createElement("div"); el.className = c; el.textContent = "› " + txt;
  const host = $("pushLog"); if (host.dataset.clean !== "1") { host.innerHTML = ""; host.dataset.clean = "1"; }
  host.appendChild(el); host.scrollTop = host.scrollHeight;
}
async function pushAll() {
  if (PUSHING) return;
  const token = sessionStorage.getItem("gh_token");
  if (!token) { toast("Belum login. Buka login.html lalu masukkan PAT GitHub.", "error"); logLine("Token tidak ada di sessionStorage — login diperlukan.", "err"); return; }
  const rc = repoCfg();
  if (!rc.owner || !rc.repo) { toast("Isi config.js (username & repo) terlebih dahulu.", "error"); return; }
  const files = ORDER.filter(f => SEL.has(f));
  if (!files.length) return toast("Tidak ada berkas dipilih.", "error");
  const fails = CHECKS.filter(c => !c.ok);
  if (fails.length && !confirm("Ada " + fails.length + " masalah integritas. Tetap kirim " + files.length + " berkas?")) return;
  if (!confirm("Kirim " + files.length + " berkas (" + kb(files.reduce((a, f) => a + bytesOf(f), 0)) + ") ke " + rc.owner + "/" + rc.repo + "?\nSetiap berkas menjadi satu commit \"Update {file}\".")) return;
  PUSHING = true; CANCEL = false; $("btnPushCancel").classList.remove("hidden");
  $("pushLog").dataset.clean = "0";
  logLine("Mulai pengiriman " + files.length + " berkas → " + rc.owner + "/" + rc.repo, "info");
  let ok = 0, fail = 0;
  for (let i = 0; i < files.length; i++) {
    if (CANCEL) { logLine("Dibatalkan oleh pengguna pada berkas ke-" + (i + 1), "warn"); break; }
    const f = files[i];
    $("topProg").style.width = ((i / files.length) * 100).toFixed(1) + "%";
    logLine("(" + (i + 1) + "/" + files.length + ") PUT data/" + f + " · " + kb(bytesOf(f)));
    try {
      await pushJSON(f, DB[f]);
      ok++; logLine("✓ " + f + " ter-commit", "ok");
    } catch (e) {
      fail++; logLine("✗ " + f + " — " + e.message, "err");
      try { await new Promise(r => setTimeout(r, 900)); await pushJSON(f, DB[f]); ok++; fail--; logLine("↻ retry berhasil: " + f, "ok"); }
      catch (e2) { logLine("✗ retry gagal: " + f, "err"); }
    }
    await new Promise(r => setTimeout(r, 220));
  }
  $("topProg").style.width = "100%";
  PUSHING = false; $("btnPushCancel").classList.add("hidden");
  logLine("Selesai — berhasil " + ok + ", gagal " + fail + ".", fail ? "warn" : "ok");
  toast(fail ? ok + " berhasil, " + fail + " gagal." : "Semua " + ok + " berkas berhasil dikirim ke GitHub.", fail ? "error" : "success");
  setTimeout(() => $("topProg").style.width = "0%", 1200);
}

/* ============================================================
   BOOT & WIRING
   ============================================================ */
function boot() {
  renderControls();
  ORDER = SETS.map(s => s.f);
  regen();

  $("btnGen").onclick = () => { regen(); toast("Dataset dibangun ulang (" + O.count + " record/koleksi).", "success"); };
  $("btnZip").onclick = exportZip;
  $("btnPush").onclick = pushAll;
  $("btnPushCancel").onclick = () => { CANCEL = true; logLine("Permintaan batal dikirim…", "warn"); };
  $("btnReset").onclick = () => {
    const prev = { ...O }, prevSel = new Set(SEL), prevOrder = ORDER.slice();
    O = { ...DEF }; ORDER = SETS.map(s => s.f); SEL = new Set();
    renderControls(); regen();
    showUndo("Parameter dikembalikan ke default", () => { O = prev; SEL = prevSel; ORDER = prevOrder; renderControls(); regen(); });
  };
  $("btnRandom").onclick = () => {
    const prev = { ...O };
    O.seed = Math.floor(Math.random() * 99999999) + 1;
    O.mix = pick(["merata", "sd", "smp", "sma", "smk"]);
    O.lunas = ri(45, 95); O.draft = ri(4, 25); O.kapasitas = ri(26, 36); O.soalPerUjian = ri(5, 20);
    renderControls(); regen();
    showUndo("Seed & parameter diacak", () => { O = prev; renderControls(); regen(); });
    toast("Seed baru: " + O.seed, "info");
  };
  $("btnExportCfg").onclick = () => download("seed-config.json", JSON.stringify({ options: O, order: ORDER, selected: [...SEL], integrity: CHECKS }, null, 2));
  $("btnSelAll").onclick = () => { SEL = new Set(ORDER); renderQueue(); refreshIcons(); };
  $("btnSelNone").onclick = () => { const prev = new Set(SEL); SEL = new Set(); renderQueue(); refreshIcons(); showUndo("Pilihan berkas dikosongkan", () => { SEL = prev; renderQueue(); refreshIcons(); }); };
  $("btnOrderFix").onclick = () => {
    const prev = ORDER.slice(), done = new Set(), out = [];
    const visit = f => { if (done.has(f)) return; (meta(f).dep || []).forEach(d => { if (ORDER.includes(d)) visit(d); }); done.add(f); out.push(f); };
    ORDER.forEach(visit); ORDER = out; renderQueue(); refreshIcons();
    showUndo("Urutan dependensi diterapkan", () => { ORDER = prev; renderQueue(); refreshIcons(); });
    toast("Urutan berkas disusun mengikuti dependensi relasi.", "success");
  };
  $("btnRecheck").onclick = () => { CHECKS = verify(); renderIntegrity(); paint(0); toast(CHECKS.every(c => c.ok) ? "Semua " + CHECKS.length + " pemeriksaan lolos." : "Ditemukan " + CHECKS.filter(c => !c.ok).length + " masalah.", CHECKS.every(c => c.ok) ? "success" : "error"); };
  $("btnPresetSave").onclick = () => {
    const name = prompt("Nama preset:", "Seed " + O.count + " · " + O.jenjang + " · " + O.ta);
    if (!name) return;
    const p = presets(); p.push({ name: name.slice(0, 34), opts: { ...O }, order: ORDER.slice(), sel: [...SEL] }); setPresets(p); renderPresets();
    toast("Preset tersimpan di perangkat ini.", "success");
  };

  $("pvSet").onchange = e => { PV.set = e.target.value; PV.page = 1; PV.q = ""; PV.filter = ""; PV.sort = ""; $("pvQ").value = ""; setupPreview(); renderPreview(); };
  $("pvQ").oninput = e => { PV.q = e.target.value; PV.page = 1; renderPreview(); };
  $("pvFilter").onchange = e => { PV.filter = e.target.value; PV.page = 1; renderPreview(); };
  $("pvSort").onchange = e => { PV.sort = e.target.value; PV.page = 1; renderPreview(); };
  $("pvDir").onclick = () => { PV.dir *= -1; $("pvDirTxt").textContent = PV.dir === 1 ? "ASC" : "DESC"; renderPreview(); };
  $("pvSize").onchange = () => { PV.page = 1; renderPreview(); };
  $("pvFirst").onclick = () => { PV.page = 1; renderPreview(); };
  $("pvPrev").onclick = () => { PV.page = Math.max(1, PV.page - 1); renderPreview(); };
  $("pvNext").onclick = () => { PV.page = PV.page + 1; renderPreview(); };
  $("pvLast").onclick = () => { PV.page = 1e9; renderPreview(); };
  $("pvCsv").onclick = () => {
    const rows = pvRows(); if (!rows.length) return toast("Tidak ada baris untuk diekspor.", "error");
    const keys = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => typeof rows[0][k] !== "object");
    download(PV.set.replace(".json", "") + ".csv", toCSV(rows, keys.map(k => ({ k, l: k }))), "text/csv");
  };
  $("pvJson").onclick = () => download(PV.set, JSON.stringify(DB[PV.set], null, 2));

  $("drawerClose").onclick = closeDrawer;
  $("drawerScrim").onclick = closeDrawer;
  $("drawerCopy").onclick = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(drawerRec, null, 2)); toast("Record disalin ke clipboard.", "success"); }
    catch (e) { toast("Clipboard ditolak browser — salin manual dari panel.", "error"); }
  };
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("drawer").classList.contains("hidden")) closeDrawer();
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "ArrowLeft") { PV.page = Math.max(1, PV.page - 1); renderPreview(); }
    if (e.key === "ArrowRight") { PV.page = PV.page + 1; renderPreview(); }
    if (e.key.toLowerCase() === "g") { regen(); toast("Dataset dibangun ulang.", "success"); }
  });
  refreshIcons();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();