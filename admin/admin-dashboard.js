// ============================================================
// admin-dashboard.js — Modul Dashboard (#/dashboard).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

async function renderDashboard() {
  const safe = f => fetchJSON(f).catch(() => []);
  const [siswa, guru, abs, spp, ppdb, buku, audit] = await Promise.all(["siswa.json", "guru.json", "absensi.json", "spp.json", "ppdb.json", "buku.json", "audit.json"].map(safe));
  const st = await fetchJSON("settings.json").catch(() => ({}));
  const belum = spp.filter(x => x.status === "Belum");
  const absToday = abs.filter(a => a.tanggal === today());
  const stat = (icon, l, v, c, href) => '<a href="' + href + '" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-emerald-300 transition"><div class="w-9 h-9 rounded-lg bg-' + c + '-100 text-' + c + '-700 flex items-center justify-center mb-3"><i data-lucide="' + icon + '" class="w-5 h-5"></i></div><div class="text-2xl font-extrabold">' + v + '</div><div class="text-xs font-bold text-slate-500">' + l + "</div></a>";
  app.innerHTML = pageHead({ title: "Dashboard", desc: st.nama_sekolah + " • TA " + (st.tahun_ajaran || "-") + " • Semester " + (st.semester || "-") }) +
    '<div class="mb-4 text-xs bg-sky-50 border border-sky-200 text-sky-800 rounded-xl px-4 py-3 flex gap-2"><i data-lucide="info" class="w-4 h-4 shrink-0 mt-0.5"></i><span>Setiap perubahan langsung ter-commit ke GitHub. GitHub Pages butuh ±1 menit untuk publikasi; panel ini memakai cache sesi sehingga tampilan Anda selalu terbaru. Repo publik = data JSON dapat dibaca siapa saja — gunakan data demo/anonim.</span></div>' +
    '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">' +
    stat("users", "Siswa Aktif", siswa.filter(s => s.status === "Aktif").length, "emerald", "#/siswa") +
    stat("briefcase", "Guru & Tendik", guru.length, "sky", "#/guru") +
    stat("wallet", "Tunggakan SPP", fmtRp(belum.reduce((a, b) => a + b.nominal, 0)), "rose", "#/spp") +
    stat("user-plus", "PPDB Menunggu", ppdb.filter(p => p.status === "Menunggu").length, "amber", "#/ppdb") + "</div>" +
    '<div class="grid lg:grid-cols-2 gap-4 mt-4">' +
    card('<b class="text-sm flex items-center gap-2"><i data-lucide="calendar-check" class="w-4 h-4 text-emerald-600"></i>Absensi Hari Ini (' + fmtTgl(today()) + ')</b><div class="mt-3 flex flex-wrap gap-2">' +
      ["Hadir", "Sakit", "Izin", "Alfa"].map(x => '<span class="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold">' + x + ": " + absToday.filter(a => a.status === x).length + "</span>").join("") +
      '<a href="#/absensi" class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold">Buka Absensi QR →</a></div>' +
      '<div class="mt-4 text-sm text-slate-500">Perpustakaan: <b>' + buku.reduce((a, b) => a + (b.stok || 0), 0) + '</b> eksemplar tersedia.</div>') +
    card('<b class="text-sm flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>Aktivitas Terakhir (Audit)</b><ul class="mt-3 space-y-2 text-sm">' +
      (audit.slice(0, 7).map(l => '<li class="flex gap-2"><span class="text-emerald-600 font-bold text-xs mt-0.5 whitespace-nowrap">' + esc(l.aksi) + '</span><span class="text-slate-600 truncate">' + esc(l.detail) + '</span><span class="ml-auto text-[11px] text-slate-400 whitespace-nowrap">' + fmtWaktu(l.waktu) + "</span></li>").join("") || '<li class="text-slate-400">Belum ada aktivitas.</li>') +
      '</ul><a href="#/audit" class="inline-block mt-3 text-xs font-bold text-emerald-700">Lihat semua audit →</a>') + "</div>";
  refreshIcons();
}

MOD.dashboard = { title: "Dashboard", render: "renderDashboard" };
