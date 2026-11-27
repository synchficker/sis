// ============================================================
// admin-tugas.js — Tugas (#/tugas).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.tugas = [
    { k: "judul", l: "Judul Tugas", req: true },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "deadline", l: "Deadline", t: "date" },
    { k: "lampiran", l: "URL Lampiran", req: false },
    { k: "deskripsi", l: "Instruksi Tugas", t: "textarea", full: true }
  ];

MOD.tugas = { title: "Tugas", desc: "Penugasan dengan deadline. Pengumpulan siswa via WhatsApp / lampiran (statis).", file: "tugas.json", fields: F.tugas, cols: ["judul", "mapel", "kelas", "deadline", "lampiran"], fmts: { deadline: fmtTgl } };
