// ============================================================
// admin-kinerja.js — Penilaian Kinerja (#/kinerja).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.kinerja = [
    { k: "guru_id", l: "Pegawai Dinilai", t: "select", optsFn: optGuru, req: true },
    { k: "periode", l: "Periode", ph: "2026 Ganjil" },
    { k: "pedagogik", l: "Pedagogik (0–100)", t: "number" },
    { k: "profesional", l: "Profesional (0–100)", t: "number" },
    { k: "sosial", l: "Sosial (0–100)", t: "number" },
    { k: "kepribadian", l: "Kepribadian (0–100)", t: "number" },
    { k: "penilai", l: "Penilai", def: "Kepala Sekolah" },
    { k: "catatan", l: "Catatan / Rekomendasi", t: "textarea", full: true, req: false }
  ];

MOD.kinerja = { title: "Penilaian Kinerja", desc: "4 kompetensi: pedagogik, profesional, sosial, kepribadian.", file: "kinerja.json", fields: F.kinerja, cols: ["guru_id", "periode", "pedagogik", "profesional", "sosial", "kepribadian"], preload: ["guru.json"], fmts: { guru_id: namaGuru } };
