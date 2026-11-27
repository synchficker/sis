// ============================================================
// admin-perpus.js — Perpustakaan: Katalog Buku & Peminjaman (#/buku, #/peminjaman).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.buku = [
    { k: "isbn", l: "ISBN", req: false }, { k: "judul", l: "Judul Buku", req: true },
    { k: "pengarang", l: "Pengarang" }, { k: "penerbit", l: "Penerbit" },
    { k: "tahun", l: "Tahun Terbit", t: "number" },
    { k: "kategori", l: "Kategori", t: "select", opts: ["Pelajaran", "Fiksi", "Nonfiksi", "Referensi", "Anak"] },
    { k: "rak", l: "Lokasi Rak", ph: "A1" }, { k: "stok", l: "Stok", t: "number", def: 1 }
  ];

async function renderPeminjaman() {
  const [pm, buku, siswa, st] = await Promise.all([fetchJSON("peminjaman.json"), fetchJSON("buku.json"), fetchJSON("siswa.json"), fetchJSON("settings.json")]);
  const jb = id => { const b = buku.find(x => x.id === id); return b ? b.judul : id; };
  const js = nis => { const s = siswa.find(x => x.nis === nis); return s ? s.nama : nis; };
  const jt = new Date(today()); jt.setDate(jt.getDate() + 7);
  const jatuh = jt.toISOString().slice(0, 10);
  app.innerHTML = pageHead(MOD.peminjaman) +
    card('<form id="fPinjam" class="grid sm:grid-cols-5 gap-3 items-end">' +
      '<label class="block sm:col-span-2">' + lbl("Buku (stok > 0) *") + '<select name="buku_id" ' + inp + ' required><option value="">— pilih —</option>' + buku.filter(b => b.stok > 0).map(b => '<option value="' + b.id + '">' + esc(b.judul + " (stok " + b.stok + ")") + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Siswa *") + '<select name="nis" ' + inp + ' required><option value="">— pilih —</option>' + siswa.map(s => '<option value="' + esc(s.nis) + '">' + esc(s.nama) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Jatuh Tempo") + '<input name="jatuh" type="date" value="' + jatuh + '" ' + inp + "></label>" +
      '<button ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Pinjamkan</button></form>' +
      '<p class="text-[11px] text-slate-500 mt-2">Denda keterlambatan: ' + fmtRp(st.denda_per_hari) + "/hari (otomatis saat pengembalian). Stok buku ikut diperbarui.</p>") +
    '<div class="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Buku", "Siswa", "Pinjam", "Jatuh Tempo", "Kembali", "Status", "Denda", "Aksi"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" +
    (pm.map(p => '<tr class="border-b border-slate-100 hover:bg-slate-50"><td class="px-3 py-2 text-sm font-semibold">' + esc(jb(p.buku_id)) + '</td><td class="px-3 py-2 text-sm">' + esc(js(p.nis)) + '</td><td class="px-3 py-2 text-sm">' + fmtTgl(p.tanggal_pinjam) + '</td><td class="px-3 py-2 text-sm">' + fmtTgl(p.tanggal_jatuh_tempo) + '</td><td class="px-3 py-2 text-sm">' + (p.tanggal_kembali ? fmtTgl(p.tanggal_kembali) : "-") + "</td><td class='px-3 py-2'>" + badge(p.status) + '</td><td class="px-3 py-2 text-sm font-bold ' + (p.denda ? "text-red-600" : "") + '">' + fmtRp(p.denda) + '</td><td class="px-3 py-2 text-right">' + (p.status === "Dipinjam" ? '<button type="button" data-back="' + p.id + '" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Kembalikan</button>' : "") + "</td></tr>").join("") || emptyRow) +
    "</tbody></table></div>";
  refreshIcons();
  document.getElementById("fPinjam").onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target).entries());
    const b = buku.find(x => x.id === o.buku_id);
    if (!b || b.stok < 1) return toast("Stok buku habis.", "error");
    const arr = await fetchJSON("peminjaman.json");
    arr.unshift({ id: uid(), buku_id: o.buku_id, nis: o.nis, tanggal_pinjam: today(), tanggal_jatuh_tempo: o.jatuh, tanggal_kembali: "", status: "Dipinjam", denda: 0 });
    if (!await saveData("peminjaman.json", arr, "Perpustakaan", "PEMINJAMAN", js(o.nis) + " ← " + b.judul)) return;
    b.stok--; try { await pushJSON("buku.json", buku); } catch (err) { toast("Stok gagal diperbarui: " + err.message, "error"); }
    route();
  };
  app.onclick = async e => {
    const btn = e.target.closest("button[data-back]"); if (!btn) return;
    const p = pm.find(x => x.id === btn.dataset.back);
    const late = Math.max(0, Math.floor((new Date(today()) - new Date(p.tanggal_jatuh_tempo)) / 864e5));
    const denda = late * (st.denda_per_hari || 0);
    if (!(await confirmBox({ title: "Kembalikan buku", okLabel: "Ya, kembalikan", message: "Kembalikan \"" + jb(p.buku_id) + "\"?" + (late ? " Terlambat " + late + " hari → denda " + fmtRp(denda) + "." : " Tepat waktu.") }))) return;
    const arr = await fetchJSON("peminjaman.json"); const x = arr.find(y => y.id === p.id);
    Object.assign(x, { status: "Dikembalikan", tanggal_kembali: today(), denda });
    if (!await saveData("peminjaman.json", arr, "Perpustakaan", "PENGEMBALIAN", js(p.nis) + " → " + jb(p.buku_id) + (denda ? " denda " + fmtRp(denda) : ""))) return;
    const b = buku.find(y => y.id === p.buku_id);
    if (b) { b.stok++; try { await pushJSON("buku.json", buku); } catch (err) { toast("Stok gagal diperbarui: " + err.message, "error"); } }
    route();
  };
}

MOD.buku = { title: "Katalog Buku", desc: "Koleksi perpustakaan & stok.", file: "buku.json", fields: F.buku, cols: ["isbn", "judul", "pengarang", "kategori", "rak", "stok"] };
MOD.peminjaman = { title: "Peminjaman Buku", desc: "Sirkulasi perpustakaan: pinjam, kembali, denda otomatis per hari.", render: "renderPeminjaman" };
