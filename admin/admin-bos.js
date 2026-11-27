// ============================================================
// admin-bos.js — Laporan BOS (#/bos).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.bos = [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "jenis", l: "Jenis", t: "select", opts: ["Penerimaan", "Pengeluaran"], req: true },
    { k: "kategori", l: "Kategori (Juknis BOS)", t: "select", opts: ["BOS Reguler", "Perpustakaan", "Kegiatan Pembelajaran", "Administrasi Sekolah", "Pemeliharaan Sarpras", "Honor Guru Non-ASN", "Pengembangan Profesi", "Langganan Daya & Jasa", "Lainnya"] },
    { k: "uraian", l: "Uraian", req: true },
    { k: "jumlah", l: "Jumlah (Rp)", t: "number", fmt: fmtRp },
    { k: "triwulan", l: "Triwulan", t: "select", opts: ["I", "II", "III", "IV"] },
    { k: "tahun", l: "Tahun", t: "number", def: 2026 }
  ];

MOD.bos = { title: "Laporan BOS", desc: "Buku kas umum BOS: penerimaan & pengeluaran per kategori juknis.", file: "bos.json", fields: F.bos, cols: ["tanggal", "jenis", "kategori", "uraian", "jumlah", "triwulan"], fmts: { tanggal: fmtTgl } };
