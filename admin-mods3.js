
// ---------- E. Notifikasi WA Gateway ----------
async function renderWA() {
  const [not, siswa, spp, st, kelas] = await Promise.all([fetchJSON("notifikasi.json"), fetchJSON("siswa.json"), fetchJSON("spp.json"), fetchJSON("settings.json"), fetchJSON("kelas.json")]);
  const tagihanMsg = s => {
    const b = spp.filter(x => x.nis === s.nis && x.status === "Belum");
    const tot = b.reduce((a, x) => a + x.nominal, 0);
    return "Yth. Orang Tua " + s.nama + ", tagihan SPP ananda yang belum dibayar: " + (b.map(x => BULAN[x.bulan - 1]).join(", ") || "-") + ". Total " + fmtRp(tot) + ". Pembayaran via VA/QRIS di Portal Ortu. Terima kasih. — " + st.nama_sekolah;
  };
  app.innerHTML = pageHead(MOD.notifikasi) +
    card('<div class="flex flex-wrap items-end gap-3">' +
      '<label class="block flex-1 min-w-[220px]">' + lbl("Token Fonnte Gateway (opsional, disimpan di sessionStorage)") + '<input id="waKey" type="password" value="' + esc(sessionStorage.getItem("wa_key") || "") + '" placeholder="Kosongkan → kirim manual via wa.me" ' + inp + "></label>" +
      '<button type="button" id="waKeySave" ' + btnS + ">Simpan Token</button></div>" +
      '<p class="text-[11px] text-slate-500 mt-2">Tanpa gateway: setiap tombol Kirim membuka WhatsApp Web dengan pesan siap kirim. Dengan gateway Fonnte: terkirim otomatis via API.</p>') +
    '<div class="mt-4">' + card('<div class="grid sm:grid-cols-3 gap-3 items-end">' +
      '<label class="block">' + lbl("Target") + '<select id="wTarget" ' + inp + '><option value="ALL">Semua Siswa Aktif</option>' + kelas.map(k => '<option value="K:' + esc(k.nama) + '">Kelas ' + esc(k.nama) + "</option>").join("") + siswa.map(s => '<option value="S:' + esc(s.nis) + '">' + esc(s.nama) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Jenis") + '<select id="wJenis" ' + inp + "><option>Pengumuman</option><option>Tagihan</option><option>Absensi</option><option>Nilai</option></select></label>" +
      '<button type="button" id="wQueue" ' + btnP + '><i data-lucide="bell" class="w-4 h-4"></i>Masukkan Antrean</button>' +
      '<label class="block sm:col-span-3">' + lbl("Isi Pesan (jenis Tagihan diisi otomatis per siswa)") + '<textarea id="wPesan" rows="3" ' + inp + ">" + esc(st.pengumuman || "Assalamualaikum, berikut informasi dari sekolah.") + "</textarea></label></div>") + "</div>" +
    '<div class="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200"><div class="p-4 flex flex-wrap gap-2 items-center border-b border-slate-100"><b class="text-sm flex-1">Antrean Notifikasi (' + not.filter(n => n.status === "Antrean").length + ' antre)</b><button type="button" id="wAll" ' + btnP + '><i data-lucide="send" class="w-4 h-4"></i>Kirim Semua Antrean</button></div>' +
    '<div class="overflow-x-auto max-h-[50vh] overflow-y-auto"><table class="w-full text-left"><thead class="bg-slate-50 sticky top-0"><tr>' + ["Waktu", "Siswa", "No. HP", "Jenis", "Pesan", "Status", "Aksi"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" +
    (not.map(n => '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-xs whitespace-nowrap">' + fmtWaktu(n.waktu) + '</td><td class="px-3 py-2 text-sm font-semibold">' + esc(n.nama) + '</td><td class="px-3 py-2 text-xs font-mono">' + esc(n.no_hp) + '</td><td class="px-3 py-2 text-sm">' + esc(n.jenis) + '</td><td class="px-3 py-2 text-sm">' + esc(trunc(n.pesan, 70)) + "</td><td class='px-3 py-2'>" + badge(n.status) + '</td><td class="px-3 py-2 text-right whitespace-nowrap"><button type="button" data-kirim="' + n.id + '" title="Kirim WA" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><i data-lucide="send" class="w-4 h-4 pointer-events-none"></i></button><button type="button" data-del="' + n.id + '" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>').join("") || emptyRow) +
    "</tbody></table></div></div>";
  refreshIcons();
  document.getElementById("waKeySave").onclick = () => {
    // TOKEN TIDAK BOLEH DI-HARDCODE — token gateway hanya di sessionStorage
    const v = document.getElementById("waKey").value.trim();
    if (v) sessionStorage.setItem("wa_key", v); else sessionStorage.removeItem("wa_key");
    toast("Token gateway disimpan di sesi ini saja.", "success");
  };
  document.getElementById("wQueue").onclick = async () => {
    const t = document.getElementById("wTarget").value, jenis = document.getElementById("wJenis").value;
    const pesan = document.getElementById("wPesan").value.trim();
    let targets = siswa.filter(s => s.status === "Aktif");
    if (t.startsWith("K:")) targets = targets.filter(s => s.kelas === t.slice(2));
    if (t.startsWith("S:")) targets = targets.filter(s => s.nis === t.slice(2));
    if (!targets.length) return toast("Tidak ada target.", "error");
    const arr = await fetchJSON("notifikasi.json");
    const baru = targets.map(s => ({ id: uid(), nis: s.nis, nama: s.nama, no_hp: s.no_hp_ortu || "", jenis, pesan: jenis === "Tagihan" ? tagihanMsg(s) : pesan, status: "Antrean", waktu: new Date().toISOString() }));
    if (await saveData("notifikasi.json", [...baru, ...arr], "Komunikasi", "ANTRE NOTIFIKASI", baru.length + " pesan " + jenis)) route();
  };
  async function kirimSatu(n) {
    const hp = (n.no_hp || "").replace(/^0/, "62");
    if (!hp) { toast("Nomor HP " + n.nama + " kosong.", "error"); return false; }
    const key = sessionStorage.getItem("wa_key");
    if (key) {
      try {
        const fd = new FormData(); fd.append("target", hp); fd.append("message", n.pesan);
        const r = await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: key }, body: fd });
        const j = await r.json();
        if (j.status) return true;
        throw new Error(j.reason || "ditolak gateway");
      } catch (e) { toast("Gateway gagal (" + e.message + ") → beralih ke wa.me manual.", "info"); }
    }
    window.open("https://wa.me/" + hp + "?text=" + encodeURIComponent(n.pesan), "_blank");
    return true;
  }
  document.getElementById("wAll").onclick = async () => {
    const arr = await fetchJSON("notifikasi.json");
    const antre = arr.filter(n => n.status === "Antrean");
    if (!antre.length) return toast("Antrean kosong.", "info");
    showLoading("Mengirim " + antre.length + " notifikasi…");
    let ok = 0;
    for (const n of antre) { if (await kirimSatu(n)) { n.status = "Terkirim"; ok++; } await new Promise(r => setTimeout(r, 600)); }
    hideLoading();
    if (await saveData("notifikasi.json", arr, "Komunikasi", "KIRIM NOTIFIKASI", ok + " pesan WA terkirim")) route();
  };
  app.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.kirim) {
      const arr = await fetchJSON("notifikasi.json"); const n = arr.find(x => x.id === b.dataset.kirim);
      if (await kirimSatu(n)) { n.status = "Terkirim"; if (await saveData("notifikasi.json", arr, "Komunikasi", "KIRIM NOTIFIKASI", n.nama + " " + n.jenis)) route(); }
    } else if (b.dataset.del && confirm("Hapus notifikasi ini?")) {
      if (await saveData("notifikasi.json", not.filter(x => x.id !== b.dataset.del), "Komunikasi", "HAPUS NOTIFIKASI", b.dataset.del)) route();
    }
  };
}
// ---------- F. Peminjaman ----------
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
    (pm.map(p => '<tr class="border-b border-slate-100 hover:bg-slate-50"><td class="px-3 py-2 text-sm font-semibold">' + esc(jb(p.buku_id)) + '</td><td class="px-3 py-2 text-sm">' + esc(js(p.nis)) + '</td><td class="px-3 py-2 text-sm">' + fmtTgl(p.tanggal_pinjam) + '</td><td class="px-3 py-2 text-sm">' + fmtTgl(p.tanggal_jatuh_tempo) + '</td><td class="px-3 py-2 text-sm">' + (p.tanggal_kembali ? fmtTgl(p.tanggal_kembali) : "-") + "</td><td class='px-3 py-2'>" + badge(p.status) + '</td><td class="px-3 py-2 text-sm font-bold ' + (p.denda ? "text-rose-600" : "") + '">' + fmtRp(p.denda) + '</td><td class="px-3 py-2 text-right">' + (p.status === "Dipinjam" ? '<button type="button" data-back="' + p.id + '" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Kembalikan</button>' : "") + "</td></tr>").join("") || emptyRow) +
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
    if (!confirm("Kembalikan \"" + jb(p.buku_id) + "\"?" + (late ? " Terlambat " + late + " hari → denda " + fmtRp(denda) + "." : " Tepat waktu."))) return;
    const arr = await fetchJSON("peminjaman.json"); const x = arr.find(y => y.id === p.id);
    Object.assign(x, { status: "Dikembalikan", tanggal_kembali: today(), denda });
    if (!await saveData("peminjaman.json", arr, "Perpustakaan", "PENGEMBALIAN", js(p.nis) + " → " + jb(p.buku_id) + (denda ? " denda " + fmtRp(denda) : ""))) return;
    const b = buku.find(y => y.id === p.buku_id);
    if (b) { b.stok++; try { await pushJSON("buku.json", buku); } catch (err) { toast("Stok gagal diperbarui: " + err.message, "error"); } }
    route();
  };
}
