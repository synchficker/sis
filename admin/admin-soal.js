// ============================================================
// admin-soal.js — Bank Soal (#/soal).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.soal = [
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel, req: true },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "pertanyaan", l: "Pertanyaan", t: "textarea", full: true, req: true },
    { k: "a", l: "Pilihan A", req: true }, { k: "b", l: "Pilihan B", req: true },
    { k: "c", l: "Pilihan C", req: true }, { k: "d", l: "Pilihan D", req: true },
    { k: "e", l: "Pilihan E (opsional, SMA/SMK)", req: false },
    { k: "kunci", l: "Kunci Jawaban", t: "select", opts: ["A", "B", "C", "D", "E"], req: true },
    { k: "pembahasan", l: "Pembahasan", t: "textarea", full: true, req: false }
  ];

MOD.soal = { title: "Bank Soal", desc: "Bank soal pilihan ganda A–E dengan kunci & pembahasan untuk CBT.", file: "soal.json", fields: F.soal, cols: ["mapel", "kelas", "pertanyaan", "kunci"] };
