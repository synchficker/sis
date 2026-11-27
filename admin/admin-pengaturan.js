// ============================================================
// admin-pengaturan.js — Pengaturan Sekolah termasuk About Us (#/pengaturan).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

// ---- Bagian "About Us" (beranda & halaman SD/SMP/SMA/SMK): Founder/Ketua Yayasan + Kepala Sekolah per jenjang ----
const ABOUT_LV = ["SD", "SMP", "SMA", "SMK"];

const aboutKeys = () => ["founder_nama", "founder_jabatan", "founder_sambutan"].concat(ABOUT_LV.reduce((a, l) => a.concat(["nama", "nip", "sambutan"].map(x => "kepsek_" + l.toLowerCase() + "_" + x)), []));

function aboutFields(s, f) {
  const fo = s.founder || {}, kj = s.kepsek_jenjang || {};
  const head = (t, d) => '<div class="sm:col-span-2 mt-3 pt-4 border-t border-slate-200"><b class="text-sm text-slate-800">' + t + '</b><div class="text-xs text-slate-500 mt-0.5">' + d + "</div></div>";
  const hint = "Gunakan {sekolah} untuk menyisipkan nama sekolah otomatis. Pisahkan paragraf dengan baris baru.";
  let h = head("About Us — Founder / Ketua Yayasan (Beranda)", "Tampil pada section About Us di halaman beranda. Tanpa NIP. " + hint) +
    f("founder_nama", "Nama Founder / Ketua Yayasan", fo.nama || "") + f("founder_jabatan", "Jabatan", fo.jabatan || "Founder & Ketua Yayasan") +
    f("founder_sambutan", "Kalimat Pembuka / Sambutan Founder", fo.sambutan || "", "textarea", true, 5);
  ABOUT_LV.forEach(l => {
    const k = kj[l] || {}, p = "kepsek_" + l.toLowerCase() + "_";
    h += head("About Us — Kepala Sekolah " + l, "Tampil pada section About Us di halaman " + l + ". " + hint) +
      f(p + "nama", "Nama Kepala Sekolah " + l, k.nama || "") + f(p + "nip", "NIP Kepala Sekolah " + l, k.nip || "") +
      f(p + "sambutan", "Kalimat Pembuka / Sambutan Kepala Sekolah " + l, k.sambutan || "", "textarea", true, 5);
  });
  return h;
}

function aboutCollect(o) {
  const t = k => String(o[k] || "").trim();
  const kepsek_jenjang = {};
  ABOUT_LV.forEach(l => { const p = "kepsek_" + l.toLowerCase() + "_"; kepsek_jenjang[l] = { nama: t(p + "nama"), nip: t(p + "nip").replace(/\s+/g, ""), sambutan: t(p + "sambutan") }; });
  return { founder: { nama: t("founder_nama"), jabatan: t("founder_jabatan") || "Founder & Ketua Yayasan", sambutan: t("founder_sambutan") }, kepsek_jenjang };
}

async function renderSettings() {
  const s = await fetchJSON("settings.json");
  const f = (k, l, v, t = "text", full = false, rows = 2) => '<label class="block ' + (full ? "sm:col-span-2" : "") + '">' + lbl(l) + (t === "textarea" ? '<textarea name="' + k + '" rows="' + rows + '" ' + inp + ">" + esc(v) + "</textarea>" : '<input name="' + k + '" type="' + t + '" value="' + esc(v) + '" ' + inp + ">") + "</label>";
  app.innerHTML = pageHead(MOD.pengaturan) + card('<form id="fSet" class="grid sm:grid-cols-2 gap-3">' +
    f("nama_sekolah", "Nama Sekolah", s.nama_sekolah) + f("jenjang", "Jenjang (SD/SMP/SMA/SMK)", s.jenjang) +
    f("npsn", "NPSN", s.npsn) + f("tahun_ajaran", "Tahun Ajaran", s.tahun_ajaran) +
    f("semester", "Semester (Ganjil/Genap)", s.semester) + f("kurikulum", "Kurikulum (Merdeka/K13)", s.kurikulum) +
    f("kepala_sekolah", "Kepala Sekolah (untuk dokumen cetak/TTD)", s.kepala_sekolah) + f("nip_kepsek", "NIP Kepala Sekolah (dokumen cetak)", s.nip_kepsek) +
    f("telepon", "Telepon", s.telepon) + f("email", "Email", s.email, "email") +
    f("spp_nominal", "Nominal SPP (Rp)", s.spp_nominal, "number") + f("denda_per_hari", "Denda Buku / Hari (Rp)", s.denda_per_hari, "number") +
    f("kkm", "KKM (K13)", s.kkm, "number") + f("wa_admin", "No. WA Admin Sekolah", s.wa_admin, "tel") +
    f("bank_nama", "Nama Bank VA", s.bank.nama) + f("bank_va_prefix", "Prefix Virtual Account", s.bank.va_prefix) +
    f("qris_merchant", "Nama Merchant QRIS", s.qris.merchant) + f("bank_atas_nama", "VA Atas Nama", s.bank.atas_nama || "") +
    f("mapel", "Daftar Mapel (pisahkan koma)", (s.mapel || []).join(", "), "textarea", true) +
    f("alamat", "Alamat Sekolah", s.alamat, "textarea", true) +
    f("pengumuman", "Pengumuman Publik", s.pengumuman, "textarea", true) +
    aboutFields(s, f) +
    '<div class="sm:col-span-2"><button ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Simpan Pengaturan</button></div></form>');
  refreshIcons();
  document.getElementById("fSet").onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target).entries());
    const next = { ...s, ...o, spp_nominal: +o.spp_nominal, denda_per_hari: +o.denda_per_hari, kkm: +o.kkm, mapel: o.mapel.split(",").map(x => x.trim()).filter(Boolean), bank: { ...s.bank, nama: o.bank_nama, va_prefix: o.bank_va_prefix, atas_nama: o.bank_atas_nama }, qris: { ...s.qris, merchant: o.qris_merchant }, ...aboutCollect(o) };
    ["bank_nama", "bank_va_prefix", "bank_atas_nama", "qris_merchant"].concat(aboutKeys()).forEach(k => delete next[k]);
    if (await saveData("settings.json", next, "Sistem", "UPDATE PENGATURAN", next.nama_sekolah)) { document.getElementById("schoolName").textContent = next.nama_sekolah; route(); }
  };
}

MOD.pengaturan = { title: "Pengaturan Sekolah", desc: "Identitas, kurikulum, nominal SPP, denda, prefix VA, merchant QRIS, mapel.", render: "renderSettings" };
