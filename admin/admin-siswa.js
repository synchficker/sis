// ============================================================
// admin-siswa.js — Data Induk Siswa, Kelas/Rombel, Mutasi (#/siswa, #/kelas, #/mutasi).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.siswa = [
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
  ];

F.kelas = [
    { k: "nama", l: "Nama Rombel", ph: "7A / X IPA 1", req: true },
    { k: "tingkat", l: "Tingkat", t: "select", opts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] },
    { k: "jurusan", l: "Jurusan (SMA/SMK)", ph: "IPA / TKJ / -" },
    { k: "wali_kelas", l: "Wali Kelas", t: "select", optsFn: optGuru },
    { k: "kapasitas", l: "Kapasitas", t: "number", def: 32 },
    { k: "tahun_ajaran", l: "Tahun Ajaran", def: "2026/2027" }
  ];

F.mutasi = [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "nis", l: "Siswa", t: "select", optsFn: optSiswa, req: true },
    { k: "jenis", l: "Jenis Mutasi", t: "select", opts: ["Masuk", "Keluar", "Pindah Kelas", "Pindah Sekolah"] },
    { k: "tujuan_asal", l: "Sekolah Asal / Tujuan" },
    { k: "keterangan", l: "Keterangan / Alasan", t: "textarea", full: true }
  ];

MOD.siswa = { title: "Data Induk Siswa", desc: "Format field selaras Dapodik (NISN, TTL, agama, nama ortu, rombel).", file: "siswa.json", fields: F.siswa, cols: ["nis", "nisn", "nama", "jk", "kelas", "status"] };
MOD.kelas = { title: "Rombel / Kelas", desc: "Pembagian rombongan belajar & wali kelas.", file: "kelas.json", fields: F.kelas, cols: ["nama", "tingkat", "jurusan", "wali_kelas", "kapasitas", "tahun_ajaran"], preload: ["guru.json"], fmts: { wali_kelas: namaGuru } };
MOD.mutasi = { title: "Mutasi Siswa", desc: "Siswa masuk, keluar, pindah kelas/sekolah.", file: "mutasi.json", fields: F.mutasi, cols: ["tanggal", "nis", "jenis", "tujuan_asal"], preload: ["siswa.json"], fmts: { tanggal: fmtTgl, nis: namaSiswa } };
