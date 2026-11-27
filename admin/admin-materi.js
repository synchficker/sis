// ============================================================
// admin-materi.js — E-Learning: Materi & Video Belajar (#/materi, #/video).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.materi = [
    { k: "judul", l: "Judul", req: true },
    { k: "mapel", l: "Mata Pelajaran", t: "select", optsFn: optMapel },
    { k: "kelas", l: "Kelas", t: "select", optsFn: optKelas },
    { k: "tipe", l: "Tipe", t: "select", opts: ["Materi", "Video", "Artikel", "Link"], def: "Materi" },
    { k: "url", l: "URL (YouTube / PDF / Drive)", ph: "https://…" },
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "deskripsi", l: "Deskripsi", t: "textarea", full: true }
  ];

MOD.materi = { title: "E-Learning / Materi", desc: "Materi ajar, artikel, dan tautan (PDF/Drive/YouTube). Tampil di belajar.html.", file: "materi.json", fields: F.materi, cols: ["judul", "mapel", "kelas", "tipe", "url", "tanggal"], fmts: { tanggal: fmtTgl } };
MOD.video = {
    title: "Video Belajar", desc: "Subset materi bertipe Video — diputar langsung (embed YouTube).", file: "materi.json", fields: F.materi,
    filter: r => r.tipe === "Video", preset: { tipe: "Video" }, cols: ["judul", "mapel", "kelas", "url"],
    rowActions: [{ icon: "video", title: "Putar video", cls: "text-sky-600", fn: r => openModal("Putar: " + r.judul, '<div class="aspect-video rounded-xl overflow-hidden bg-black"><iframe src="' + esc(ytEmbed(r.url)) + '" class="w-full h-full" allowfullscreen></iframe></div>', null) }]
  };
