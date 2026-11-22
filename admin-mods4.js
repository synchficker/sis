
// ---------- G. Pelaporan Dinas ----------
async function renderLaporan() {
  const st = await fetchJSON("settings.json");
  const item = (id, icon, judul, ket, label) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3"><i data-lucide="' + icon + '" class="w-5 h-5"></i></div><b class="text-sm">' + judul + '</b><p class="text-xs text-slate-500 mt-1 mb-3">' + ket + '</p><button type="button" id="' + id + '" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>' + label + "</button></div>";
  app.innerHTML = pageHead(MOD.laporan) +
    '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
    item("expDapodik", "users", "Export Dapodik — Siswa", "CSV kolom selaras template Dapodik: NISN, identitas, TTL, agama, nama ortu, rombel.", "Unduh CSV") +
    item("expDapodikJ", "users", "Export Dapodik — JSON", "Seluruh field siswa.json mentah untuk mapping aplikasi Dapodik.", "Unduh JSON") +
    item("expAnbk", "clipboard-list", "Peserta ANBK", "CSV peserta ANBK (kelas 5 SD / 8 SMP / 11 SMA-SMK) + nama ibu kandung utk verifikasi.", "Unduh CSV") +
    item("expBos", "landmark", "Laporan BOS — BKU CSV", "Buku Kas Umum BOS: seluruh penerimaan & pengeluaran.", "Unduh CSV") +
    item("printBos", "printer", "Laporan BOS — Cetak", "BKU + rekap per kategori juknis + saldo, siap tanda tangan bendahara.", "Cetak PDF") +
    item("expAbs", "calendar-check", "Rekap Absensi Siswa", "CSV seluruh catatan absensi (QR & manual) untuk lampiran laporan dinas.", "Unduh CSV") +
    item("expNilai", "clipboard-list", "Rekap Nilai", "CSV seluruh nilai (formatif, sumatif, CBT) per semester.", "Unduh CSV") +
    item("expInv", "boxes", "Inventaris (KIB)", "CSV daftar barang: kode, kondisi, lokasi, sumber dana.", "Unduh CSV") +
    "</div>" +
    '<p class="text-xs text-slate-500 mt-4">Catatan: file CSV mengikuti struktur kolom umum Dapodik/ANBK/BOS. Sesuaikan header dengan template resmi terbaru dari dinas/kemendikbud sebelum unggah.</p>';
  refreshIcons();
  const colsDapodik = [{ k: "nisn", l: "nisn" }, { k: "nama", l: "nama_lengkap" }, { k: "jk", l: "jenis_kelamin" }, { k: "nis", l: "nis" }, { k: "tempat_lahir", l: "tempat_lahir" }, { k: "tanggal_lahir", l: "tanggal_lahir" }, { k: "agama", l: "agama" }, { k: "nama_ayah", l: "nama_ayah" }, { k: "nama_ibu", l: "nama_ibu" }, { k: "alamat", l: "alamat" }, { k: "kelas", l: "rombel" }, { k: "status", l: "status" }, { k: "tanggal_masuk", l: "tanggal_masuk" }];
  document.getElementById("expDapodik").onclick = async () => download("dapodik-siswa-" + st.npsn + ".csv", toCSV(await fetchJSON("siswa.json"), colsDapodik), "text/csv");
  document.getElementById("expDapodikJ").onclick = async () => download("dapodik-siswa-" + st.npsn + ".json", JSON.stringify(await fetchJSON("siswa.json"), null, 2));
  document.getElementById("expAnbk").onclick = async () => {
    const [siswa, kelas] = await Promise.all([fetchJSON("siswa.json"), fetchJSON("kelas.json")]);
    const eligible = siswa.filter(s => { const k = kelas.find(x => x.nama === s.kelas); return k && ["5", "8", "11"].includes(String(k.tingkat)) && s.status === "Aktif"; });
    if (!eligible.length) toast("Tidak ada siswa kelas 5/8/11 (kelas penarikan ANBK). File berisi header saja.", "info");
    download("anbk-peserta-" + st.npsn + ".csv", toCSV(eligible, [{ k: "nisn", l: "nisn" }, { k: "nama", l: "nama_peserta" }, { k: "jk", l: "jenis_kelamin" }, { k: "tempat_lahir", l: "tempat_lahir" }, { k: "tanggal_lahir", l: "tanggal_lahir" }, { k: "kelas", l: "rombel" }, { k: "nama_ibu", l: "nama_ibu_kandung" }]), "text/csv");
  };
  document.getElementById("expBos").onclick = async () => download("bos-bku-" + st.npsn + ".csv", toCSV(await fetchJSON("bos.json"), [{ k: "tanggal", l: "tanggal" }, { k: "jenis", l: "jenis" }, { k: "kategori", l: "kategori" }, { k: "uraian", l: "uraian" }, { k: "jumlah", l: "jumlah_rp" }, { k: "triwulan", l: "triwulan" }, { k: "tahun", l: "tahun" }]), "text/csv");
  document.getElementById("printBos").onclick = async () => {
    const bos = (await fetchJSON("bos.json")).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const masuk = bos.filter(b => b.jenis === "Penerimaan").reduce((a, b) => a + b.jumlah, 0);
    const keluar = bos.filter(b => b.jenis === "Pengeluaran").reduce((a, b) => a + b.jumlah, 0);
    const kat = {};
    bos.filter(b => b.jenis === "Pengeluaran").forEach(b => { kat[b.kategori] = (kat[b.kategori] || 0) + b.jumlah; });
    printHTML("Laporan BOS", "<div class='center'><h2>LAPORAN PENGGUNAAN DANA BOS</h2><div class='muted'>" + esc(st.nama_sekolah) + " • NPSN " + esc(st.npsn) + " • TA " + esc(st.tahun_ajaran) + "</div></div>" +
      "<h3>Buku Kas Umum</h3><table><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Uraian</th><th>Jumlah</th></tr>" +
      bos.map(b => "<tr><td>" + fmtTgl(b.tanggal) + "</td><td>" + esc(b.jenis) + "</td><td>" + esc(b.kategori) + "</td><td>" + esc(b.uraian) + "</td><td class='right'>" + fmtRp(b.jumlah) + "</td></tr>").join("") +
      "<tr><th colspan='4' class='right'>Total Penerimaan</th><th class='right'>" + fmtRp(masuk) + "</th></tr><tr><th colspan='4' class='right'>Total Pengeluaran</th><th class='right'>" + fmtRp(keluar) + "</th></tr><tr><th colspan='4' class='right'>SALDO</th><th class='right'>" + fmtRp(masuk - keluar) + "</th></tr></table>" +
      "<h3>Rekap Pengeluaran per Kategori</h3><table><tr><th>Kategori</th><th>Jumlah</th></tr>" + Object.entries(kat).map(([k, v]) => "<tr><td>" + esc(k) + "</td><td class='right'>" + fmtRp(v) + "</td></tr>").join("") + "</table>" +
      "<div class='ttd'><div>Bendahara BOS<br><br><br>(........................)</div><div>Mengetahui,<br>Kepala Sekolah<br><br><br><b>" + esc(st.kepala_sekolah) + "</b></div></div>");
  };
  document.getElementById("expAbs").onclick = async () => download("absensi-siswa.csv", toCSV(await fetchJSON("absensi.json"), [{ k: "tanggal", l: "tanggal" }, { k: "jam", l: "jam" }, { k: "nis", l: "nis" }, { k: "nama", l: "nama" }, { k: "kelas", l: "kelas" }, { k: "status", l: "status" }, { k: "metode", l: "metode" }]), "text/csv");
  document.getElementById("expNilai").onclick = async () => download("rekap-nilai.csv", toCSV(await fetchJSON("nilai.json"), [{ k: "nis", l: "nis" }, { k: "mapel", l: "mapel" }, { k: "jenis", l: "jenis" }, { k: "tp", l: "tp_kd" }, { k: "nilai", l: "nilai" }, { k: "semester", l: "semester" }, { k: "tahun_ajaran", l: "tahun_ajaran" }]), "text/csv");
  document.getElementById("expInv").onclick = async () => download("inventaris-kib.csv", toCSV(await fetchJSON("inventaris.json"), [{ k: "kode_barang", l: "kode_barang" }, { k: "nama", l: "nama_barang" }, { k: "kategori", l: "kategori" }, { k: "jumlah", l: "jumlah" }, { k: "kondisi", l: "kondisi" }, { k: "lokasi", l: "lokasi" }, { k: "sumber_dana", l: "sumber_dana" }, { k: "tanggal_perolehan", l: "tanggal_perolehan" }]), "text/csv");
}
// ---------- Pengaturan ----------
async function renderSettings() {
  const s = await fetchJSON("settings.json");
  const f = (k, l, v, t = "text", full = false) => '<label class="block ' + (full ? "sm:col-span-2" : "") + '">' + lbl(l) + (t === "textarea" ? '<textarea name="' + k + '" rows="2" ' + inp + ">" + esc(v) + "</textarea>" : '<input name="' + k + '" type="' + t + '" value="' + esc(v) + '" ' + inp + ">") + "</label>";
  app.innerHTML = pageHead(MOD.pengaturan) + card('<form id="fSet" class="grid sm:grid-cols-2 gap-3">' +
    f("nama_sekolah", "Nama Sekolah", s.nama_sekolah) + f("jenjang", "Jenjang (SD/SMP/SMA/SMK)", s.jenjang) +
    f("npsn", "NPSN", s.npsn) + f("tahun_ajaran", "Tahun Ajaran", s.tahun_ajaran) +
    f("semester", "Semester (Ganjil/Genap)", s.semester) + f("kurikulum", "Kurikulum (Merdeka/K13)", s.kurikulum) +
    f("kepala_sekolah", "Kepala Sekolah", s.kepala_sekolah) + f("nip_kepsek", "NIP Kepala Sekolah", s.nip_kepsek) +
    f("telepon", "Telepon", s.telepon) + f("email", "Email", s.email, "email") +
    f("spp_nominal", "Nominal SPP (Rp)", s.spp_nominal, "number") + f("denda_per_hari", "Denda Buku / Hari (Rp)", s.denda_per_hari, "number") +
    f("kkm", "KKM (K13)", s.kkm, "number") + f("wa_admin", "No. WA Admin Sekolah", s.wa_admin, "tel") +
    f("bank_nama", "Nama Bank VA", s.bank.nama) + f("bank_va_prefix", "Prefix Virtual Account", s.bank.va_prefix) +
    f("qris_merchant", "Nama Merchant QRIS", s.qris.merchant) + f("bank_atas_nama", "VA Atas Nama", s.bank.atas_nama || "") +
    f("mapel", "Daftar Mapel (pisahkan koma)", (s.mapel || []).join(", "), "textarea", true) +
    f("alamat", "Alamat Sekolah", s.alamat, "textarea", true) +
    f("pengumuman", "Pengumuman Publik", s.pengumuman, "textarea", true) +
    '<div class="sm:col-span-2"><button ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Simpan Pengaturan</button></div></form>');
  refreshIcons();
  document.getElementById("fSet").onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target).entries());
    const next = { ...s, ...o, spp_nominal: +o.spp_nominal, denda_per_hari: +o.denda_per_hari, kkm: +o.kkm, mapel: o.mapel.split(",").map(x => x.trim()).filter(Boolean), bank: { ...s.bank, nama: o.bank_nama, va_prefix: o.bank_va_prefix, atas_nama: o.bank_atas_nama }, qris: { ...s.qris, merchant: o.qris_merchant } };
    ["bank_nama", "bank_va_prefix", "bank_atas_nama", "qris_merchant"].forEach(k => delete next[k]);
    if (await saveData("settings.json", next, "Sistem", "UPDATE PENGATURAN", next.nama_sekolah)) { document.getElementById("schoolName").textContent = next.nama_sekolah; route(); }
  };
}
// ---------- Dashboard ----------
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
// ---------- Router & inisialisasi ----------
async function route() {
  stopScanner();
  const key = location.hash.replace("#/", "") || "siswa";
  const m = MOD[key] || MOD.siswa;
  document.querySelectorAll("[data-nav]").forEach(a => {
    const on = a.dataset.nav === key;
    a.classList.toggle("bg-emerald-600", on); a.classList.toggle("text-white", on);
  });
  document.getElementById("sidebar").classList.add("-translate-x-full");
  document.getElementById("backdrop").classList.add("hidden");
  app.onclick = null;
  app.innerHTML = '<div class="flex items-center gap-3 text-slate-400 text-sm py-16 justify-center"><div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>Memuat data…</div>';
  try {
    if (m.render) { const fn = typeof m.render === "string" ? window[m.render] : m.render; await fn(key); }
    else await renderCRUD(key);
  } catch (e) {
    app.innerHTML = card('<p class="text-sm text-rose-600 font-semibold">Gagal memuat modul: ' + esc(e.message) + '</p><p class="text-xs text-slate-500 mt-1">Periksa config.js, koneksi, atau klik Sinkron.</p>');
    toast(e.message, "error");
  }
  refreshIcons();
}
document.getElementById("ghUser").textContent = sessionStorage.getItem("gh_user") || "admin";
const av = sessionStorage.getItem("gh_avatar"); if (av) document.getElementById("ghAvatar").src = av;
const rc = repoCfg(); document.getElementById("repoLabel").textContent = rc.owner + "/" + rc.repo + " (" + rc.branch + ")";
fetchJSON("settings.json").then(s => { document.getElementById("schoolName").textContent = s.nama_sekolah; document.title = "Admin — " + s.nama_sekolah; }).catch(() => {});
document.getElementById("btnLogout").onclick = logout;
document.getElementById("btnSync").onclick = () => { clearDataCache(); route(); toast("Cache sesi dibersihkan — data dimuat ulang dari repo.", "info"); };
document.getElementById("btnMenu").onclick = () => { document.getElementById("sidebar").classList.remove("-translate-x-full"); document.getElementById("backdrop").classList.remove("hidden"); };
document.getElementById("backdrop").onclick = () => { document.getElementById("sidebar").classList.add("-translate-x-full"); document.getElementById("backdrop").classList.add("hidden"); };
document.getElementById("modalX").onclick = closeModal;
document.getElementById("modalCancel").onclick = closeModal;
window.addEventListener("hashchange", route);
route();
