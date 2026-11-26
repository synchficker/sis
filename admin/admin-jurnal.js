// ============================================================
// admin-jurnal.js — Jurnal Mengajar (#/jurnal).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.jurnal = [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "guru_id", l: "Guru", t: "select", optsFn: optGuru, req: true },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel },
    { k: "jam_ke", l: "Jam Ke-", ph: "1-2" },
    { k: "materi", l: "Materi / Kegiatan Pembelajaran", t: "textarea", full: true },
    { k: "catatan", l: "Catatan Kelas", t: "textarea", full: true, req: false }
  ];

MOD.jurnal = { title: "Jurnal Mengajar", file: "jurnal.json", fields: F.jurnal, cols: ["tanggal", "guru_id", "kelas", "mapel", "jam_ke", "materi"], preload: ["guru.json"], fmts: { tanggal: fmtTgl, guru_id: namaGuru } };
