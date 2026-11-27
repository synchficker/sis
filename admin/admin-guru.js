// ============================================================
// admin-guru.js — Data Guru / TU (#/guru).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.guru = [
    { k: "nip", l: "NIP / NUPTK", req: false }, { k: "nama", l: "Nama Lengkap", req: true },
    { k: "jk", l: "Jenis Kelamin", t: "select", opts: ["L", "P"] },
    { k: "jabatan", l: "Jabatan", t: "select", opts: ["Guru Mapel", "Wali Kelas", "TU", "Kepala Sekolah", "Operator"] },
    { k: "mapel", l: "Mapel Diampu", req: false },
    { k: "status", l: "Status Kepegawaian", t: "select", opts: ["PNS", "PPPK", "Honorer"] },
    { k: "pendidikan", l: "Pendidikan Terakhir", ph: "S1 Pendidikan…" },
    { k: "no_hp", l: "No. HP (WA)", t: "tel" }, { k: "email", l: "Email", t: "email", req: false },
    { k: "gaji_pokok", l: "Gaji Pokok (Rp)", t: "number", fmt: fmtRp },
    { k: "tanggal_masuk", l: "TMT / Tanggal Masuk", t: "date", req: false }
  ];

MOD.guru = { title: "Data Guru / TU", desc: "Data pokok SDM kepegawaian.", file: "guru.json", fields: F.guru, cols: ["nip", "nama", "jabatan", "mapel", "status", "gaji_pokok"] };
