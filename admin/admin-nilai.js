// ============================================================
// admin-nilai.js — Input Nilai (#/nilai).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.nilai = [
    { k: "nis", l: "Siswa", t: "select", optsFn: optSiswa, req: true },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel, req: true },
    { k: "jenis", l: "Jenis Penilaian", t: "select", opts: ["Formatif", "Sumatif", "UH", "PTS", "PAS", "UAS", "CBT"], def: "Formatif" },
    { k: "tp", l: "Tujuan Pembelajaran / KD", ph: "TP 1.1 / KD 3.1" },
    { k: "nilai", l: "Nilai (0–100)", t: "number", req: true },
    { k: "semester", l: "Semester", t: "select", opts: ["Ganjil", "Genap"], def: "Ganjil" },
    { k: "tahun_ajaran", l: "Tahun Ajaran", def: "2026/2027" }
  ];

MOD.nilai = { title: "Input Nilai", desc: "Nilai formatif/sumatif (Merdeka) & UH/PTS/PAS (K13) — sumber e-Rapor.", file: "nilai.json", fields: F.nilai, cols: ["nis", "mapel", "jenis", "tp", "nilai", "semester"], preload: ["siswa.json"], fmts: { nis: namaSiswa } };
