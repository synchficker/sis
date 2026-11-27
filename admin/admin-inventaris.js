// ============================================================
// admin-inventaris.js — Inventaris Barang (#/inventaris).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.inventaris = [
    { k: "kode_barang", l: "Kode Barang (KIB)", ph: "BRG-001", req: true },
    { k: "nama", l: "Nama Barang", req: true },
    { k: "kategori", l: "Kategori", t: "select", opts: ["Elektronik", "Mebel", "Alat Peraga", "Olahraga", "ATK", "Lainnya"] },
    { k: "jumlah", l: "Jumlah", t: "number", def: 1 },
    { k: "kondisi", l: "Kondisi", t: "select", opts: ["Baik", "Rusak Ringan", "Rusak Berat"], def: "Baik" },
    { k: "lokasi", l: "Lokasi / Ruang" },
    { k: "sumber_dana", l: "Sumber Dana", t: "select", opts: ["BOS", "APBD", "Hibah", "Komite"] },
    { k: "tanggal_perolehan", l: "Tanggal Perolehan", t: "date", req: false }
  ];

MOD.inventaris = { title: "Inventaris Barang", desc: "KIB sarpras: kode, kondisi, lokasi, sumber dana.", file: "inventaris.json", fields: F.inventaris, cols: ["kode_barang", "nama", "kategori", "jumlah", "kondisi", "lokasi"] };
