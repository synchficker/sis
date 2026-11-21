// ============================================================
// portal.js — Portal Orang Tua (baca saja, tanpa token GitHub)
// TOKEN TIDAK BOLEH DI-HARDCODE (portal tidak memakai PAT)
// ============================================================
let P = { siswa: null, st: {}, wali: null, tab: "ringkasan" };
const pBody = () => document.getElementById("pBody");
const pc = inner => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">' + inner + "</div>";
const pbadge = v => '<span class="px-2 py-0.5 rounded-full text-xs font-medium ' + (["Lunas", "Hadir"].includes(v) ? "bg-emerald-100 text-emerald-700" : ["Sakit", "Izin"].includes(v) ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700") + '">' + esc(v) + "</span>";
const predikat = n => n >= 81 ? "Mahir" : n >= 71 ? "Cakap" : n >= 61 ? "Dasar" : "Perlu Bimbingan";
document.getElementById("fPortal").onsubmit = async e => {
  e.preventDefault();
  const o = Object.fromEntries(new FormData(e.target).entries());
  showLoading("Memeriksa data siswa…");
  try {
    const siswa = await fetchJSON("siswa.json");
    const s = siswa.find(x => x.nis === o.nis.trim() && x.tanggal_lahir === o.ttl);
    if (!s) throw new Error("NIS / tanggal lahir tidak cocok dengan data sekolah.");
    sessionStorage.setItem("portal_nis", s.nis);
    await masukPortal(s.nis);
  } catch (err) { toast(err.message, "error"); }
  finally { hideLoading(); }
};
document.getElementById("pLogout").onclick = () => { sessionStorage.removeItem("portal_nis"); location.reload(); };
async function masukPortal(nis) {
  const [siswa, st, kelas, guru] = await Promise.all([fetchJSON("siswa.json"), fetchJSON("settings.json"), fetchJSON("kelas.json"), fetchJSON("guru.json")]);
  P.siswa = siswa.find(x => x.nis === nis); P.st = st;
  const k = kelas.find(x => x.nama === P.siswa.kelas);
  P.wali = k ? guru.find(g => g.id === k.wali_kelas) : null;
  document.getElementById("pSchool").textContent = st.nama_sekolah;
  document.getElementById("pLogin").classList.add("hidden");
  document.getElementById("pApp").classList.remove("hidden");
  document.getElementById("pLogout").classList.remove("hidden");
  document.getElementById("pHero").innerHTML = '<div class="flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-extrabold">' + esc(P.siswa.nama.charAt(0)) + '</div><div class="flex-1"><b class="text-lg">' + esc(P.siswa.nama) + '</b><div class="text-sm text-slate-500">NIS ' + esc(P.siswa.nis) + " • Kelas " + esc(P.siswa.kelas) + " • Wali Kelas: <b>" + esc(P.wali ? P.wali.nama : "-") + '</b></div></div><a href="belajar.html" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"><i data-lucide="book-open" class="w-4 h-4"></i>E-Learning</a></div>';
  const tabs = { ringkasan: "Ringkasan", nilai: "Nilai", absensi: "Absensi", spp: "Tagihan SPP", chat: "Chat Wali Kelas", info: "Notifikasi" };
  document.getElementById("pTabs").innerHTML = Object.entries(tabs).map(([k2, v]) =>
    '<button data-t="' + k2 + '" class="px-4 py-2 rounded-lg whitespace-nowrap ' + (P.tab === k2 ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-600") + '">' + v + "</button>").join("");
  document.querySelectorAll("#pTabs [data-t]").forEach(b => b.onclick = () => { P.tab = b.dataset.t; masukPortal(nis); });
  if (P.tab === "ringkasan") await tabRingkasan();
  if (P.tab === "nilai") await tabNilai();
  if (P.tab === "absensi") await tabAbsensi();
  if (P.tab === "spp") await tabSPP();
  if (P.tab === "chat") await tabChat();
  if (P.tab === "info") await tabInfo();
  refreshIcons();
}
async function tabRingkasan() {
  const [nilai, abs, spp] = await Promise.all([fetchJSON("nilai.json"), fetchJSON("absensi.json").catch(() => []), fetchJSON("spp.json")]);
  const nv = nilai.filter(n => n.nis === P.siswa.nis);
  const avg = nv.length ? Math.round(nv.reduce((a, b) => a + b.nilai, 0) / nv.length) : 0;
  const ab = abs.filter(a => a.nis === P.siswa.nis);
  const hadir = ab.length ? Math.round(ab.filter(a => a.status === "Hadir").length / ab.length * 100) : 0;
  const belum = spp.filter(s => s.nis === P.siswa.nis && s.status === "Belum");
  const c = (l, v, ket) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><div class="text-xs font-bold text-slate-500">' + l + '</div><div class="text-2xl font-extrabold mt-1">' + v + '</div><div class="text-xs text-slate-400 mt-1">' + ket + "</div></div>";
  pBody().innerHTML = '<div class="grid sm:grid-cols-3 gap-4">' +
    c("Rata-rata Nilai", avg, predikat(avg) + " • " + nv.length + " penilaian") +
    c("Kehadiran", hadir + "%", ab.filter(a => a.status === "Hadir").length + " hadir dari " + ab.length + " hari tercatat") +
    c("Tagihan Belum Dibayar", fmtRp(belum.reduce((a, b) => a + b.nominal, 0)), belum.length + " bulan menunggak") + "</div>" +
    (P.st.pengumuman ? '<div class="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm flex gap-2"><i data-lucide="bell" class="w-4 h-4 mt-0.5 shrink-0"></i>' + esc(P.st.pengumuman) + "</div>" : "");
}
async function tabNilai() {
  const nilai = (await fetchJSON("nilai.json")).filter(n => n.nis === P.siswa.nis);
  pBody().innerHTML = pc('<b class="text-sm">Rekap Nilai — Semester ' + esc(P.st.semester) + " " + esc(P.st.tahun_ajaran) + '</b><div class="overflow-x-auto mt-3"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Mapel", "Jenis", "TP / KD", "Nilai", "Predikat"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" +
    // FIXED: n.nilai dicetak mentah ke HTML; kini di-esc() (nilai dari JSON publik, bisa berisi markup).
    (nilai.map(n => '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-sm font-semibold">' + esc(n.mapel) + '</td><td class="px-3 py-2 text-sm">' + esc(n.jenis) + '</td><td class="px-3 py-2 text-sm">' + esc(n.tp) + '</td><td class="px-3 py-2 text-sm font-bold">' + esc(n.nilai) + '</td><td class="px-3 py-2 text-sm">' + predikat(n.nilai) + "</td></tr>").join("") || '<tr><td colspan="5" class="px-3 py-8 text-center text-sm text-slate-400">Belum ada nilai.</td></tr>') +
    "</tbody></table></div>");
}
async function tabAbsensi() {
  const abs = (await fetchJSON("absensi.json").catch(() => [])).filter(a => a.nis === P.siswa.nis).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const bln = today().slice(0, 7);
  const draw = m => {
    const rows = abs.filter(a => a.tanggal.startsWith(m));
    document.getElementById("pAbsTb").innerHTML = rows.map(a => '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-sm">' + fmtTgl(a.tanggal) + '</td><td class="px-3 py-2 text-sm">' + esc(a.jam) + "</td><td class='px-3 py-2'>" + pbadge(a.status) + '</td><td class="px-3 py-2 text-sm">' + esc(a.metode) + "</td></tr>").join("") || '<tr><td colspan="4" class="px-3 py-8 text-center text-sm text-slate-400">Tidak ada catatan bulan ini.</td></tr>';
  };
  pBody().innerHTML = pc('<div class="flex items-center gap-3 mb-3"><b class="text-sm flex-1">Riwayat Absensi</b><input id="pAbsBln" type="month" value="' + bln + '" class="rounded-lg border border-slate-300 px-3 py-2 text-sm"></div><div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Tanggal", "Jam", "Status", "Metode"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody id='pAbsTb'></tbody></table></div>");
  draw(bln);
  document.getElementById("pAbsBln").onchange = e => draw(e.target.value);
}
async function tabSPP() {
  const spp = (await fetchJSON("spp.json")).filter(s => s.nis === P.siswa.nis).sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan);
  pBody().innerHTML = pc('<b class="text-sm">Tagihan SPP Ananda</b><p class="text-xs text-slate-500 mb-3">Bayar via transfer VA atau scan QRIS (demo). Setelah membayar, kirim konfirmasi via WhatsApp — bendahara akan menandai lunas.</p><div class="space-y-3">' +
    (spp.map(s => {
      const waText = "Konfirmasi pembayaran SPP ananda " + P.siswa.nama + " (NIS " + P.siswa.nis + ") bulan " + BULAN[s.bulan - 1] + " " + s.tahun + " sebesar " + fmtRp(s.nominal) + " ke VA " + s.va + ". Mohon diverifikasi. Terima kasih.";
      return '<div class="border border-slate-200 rounded-xl p-4 ' + (s.status === "Belum" ? "bg-amber-50/50" : "") + '"><div class="flex flex-wrap items-center gap-2"><b class="text-sm flex-1">' + BULAN[s.bulan - 1] + " " + s.tahun + '</b><span class="font-extrabold text-sm">' + fmtRp(s.nominal) + "</span>" + pbadge(s.status) + "</div>" +
        (s.status === "Belum"
          ? '<details class="mt-2"><summary class="text-xs font-bold text-emerald-700 cursor-pointer">Lihat VA / QRIS & Konfirmasi</summary><div class="mt-3 grid sm:grid-cols-2 gap-4"><div><div class="text-[11px] font-bold text-slate-500">Virtual Account ' + esc(P.st.bank.nama) + '</div><div class="font-mono font-extrabold bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">' + esc(s.va) + '</div><a target="_blank" href="https://wa.me/' + esc((P.st.wa_admin || "").replace(/^0/, "62")) + "?text=" + encodeURIComponent(waText) + '" class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-emerald-600 text-white"><i data-lucide="send" class="w-4 h-4"></i>Konfirmasi via WA</a></div><div class="text-center"><div class="text-[11px] font-bold text-slate-500 mb-1">QRIS (demo)</div><div id="pq-' + s.id + '" class="inline-block bg-white p-2 border border-slate-200 rounded-lg"></div></div></div></details>'
          : '<div class="text-xs text-slate-500 mt-1">Dibayar ' + fmtTgl(s.tanggal_bayar) + " via " + esc(s.metode) + "</div>") + "</div>";
    }).join("") || '<p class="text-sm text-slate-400">Belum ada tagihan.</p>') + "</div>");
  spp.filter(s => s.status === "Belum").forEach(s => {
    const el = document.getElementById("pq-" + s.id);
    if (el) new QRCode(el, { text: "QRIS-DEMO:" + P.st.npsn + ":" + s.nis + ":" + s.bulan + "/" + s.tahun + ":" + s.nominal, width: 110, height: 110 });
  });
}
async function tabChat() {
  const chat = (await fetchJSON("chat.json").catch(() => [])).filter(c => c.nis === P.siswa.nis);
  let lokal = []; try { lokal = JSON.parse(localStorage.getItem("pchat:" + P.siswa.nis)) || []; } catch (e) {}
  const msgs = [...chat, ...lokal.map(l => ({ ...l, dari: "ortu-lokal" }))].sort((a, b) => (a.waktu || "").localeCompare(b.waktu || ""));
  const waWali = P.wali && P.wali.no_hp ? P.wali.no_hp.replace(/^0/, "62") : (P.st.wa_admin || "").replace(/^0/, "62");
  pBody().innerHTML = '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">' +
    '<div class="px-4 py-3 border-b border-slate-100 text-sm"><b>Chat dengan Wali Kelas: ' + esc(P.wali ? P.wali.nama : "Sekolah") + '</b><div class="text-[11px] text-slate-500">Pesan sekolah tampil di sini. Balasan Anda terkirim melalui WhatsApp wali kelas (statis, tanpa server).</div></div>' +
    '<div class="p-4 space-y-2 bg-slate-50 max-h-[45vh] overflow-y-auto">' + (msgs.map(m =>
      '<div class="flex ' + (m.dari === "sekolah" ? "justify-start" : "justify-end") + '"><div class="max-w-[80%] px-3 py-2 rounded-2xl text-sm ' + (m.dari === "sekolah" ? "bg-white border border-slate-200 rounded-bl-sm" : "bg-emerald-600 text-white rounded-br-sm") + '">' + esc(m.pesan) + '<div class="text-[10px] mt-1 ' + (m.dari === "sekolah" ? "text-slate-400" : "text-emerald-100") + '">' + (m.dari === "sekolah" ? "Wali Kelas" : "Anda (via WA)") + " • " + fmtWaktu(m.waktu) + "</div></div></div>"
    ).join("") || '<p class="text-center text-sm text-slate-400 py-8">Belum ada pesan.</p>') + "</div>" +
    '<form id="pChatF" class="p-3 border-t border-slate-100 flex gap-2"><input name="pesan" required placeholder="Tulis balasan… (terkirim via WhatsApp)" class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"><button class="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg"><i data-lucide="send" class="w-4 h-4"></i>Kirim WA</button></form></div>';
  document.getElementById("pChatF").onsubmit = e => {
    e.preventDefault();
    const pesan = e.target.pesan.value.trim(); if (!pesan) return;
    const text = "Pesan Orang Tua " + P.siswa.nama + " (NIS " + P.siswa.nis + ", kelas " + P.siswa.kelas + "):\n" + pesan;
    lokal.push({ pesan, waktu: new Date().toISOString() });
    localStorage.setItem("pchat:" + P.siswa.nis, JSON.stringify(lokal));
    window.open("https://wa.me/" + waWali + "?text=" + encodeURIComponent(text), "_blank");
    tabChat().then(refreshIcons);
  };
}
async function tabInfo() {
  const not = (await fetchJSON("notifikasi.json").catch(() => [])).filter(n => n.nis === P.siswa.nis);
  pBody().innerHTML = pc('<b class="text-sm">Notifikasi dari Sekolah</b><div class="mt-3 space-y-2">' +
    (not.map(n => '<div class="border border-slate-200 rounded-xl p-3"><div class="flex items-center gap-2 text-xs text-slate-500"><span class="font-bold text-emerald-700">' + esc(n.jenis) + "</span>• " + fmtWaktu(n.waktu) + "</div><p class='text-sm mt-1'>" + esc(n.pesan) + "</p></div>").join("") || '<p class="text-sm text-slate-400">Belum ada notifikasi.</p>') + "</div>");
}
(async () => {
  const nis = sessionStorage.getItem("portal_nis");
  if (nis) { try { await masukPortal(nis); } catch (e) { sessionStorage.removeItem("portal_nis"); } }
  refreshIcons();
})();
