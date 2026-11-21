// ============================================================
// cbt.js — Mesin ujian CBT (tanpa token; hasil diunduh siswa,
// lalu diimpor guru ke nilai.json via panel admin).
// ============================================================
let UJIAN = [], SOAL = [], SISWA = [], GURU = [], KELAS = [], ST = {};
let EX = null;
const $ = id => document.getElementById(id);
const show = id => { ["scrPick", "scrExam", "scrHasil"].forEach(s => $(s).classList.toggle("hidden", s !== id)); };
(async () => {
  try {
    [UJIAN, SOAL, SISWA, GURU, KELAS, ST] = await Promise.all([
      fetchJSON("ujian.json"), fetchJSON("soal.json"), fetchJSON("siswa.json"),
      fetchJSON("guru.json").catch(() => []), fetchJSON("kelas.json").catch(() => []), fetchJSON("settings.json").catch(() => ({}))
    ]);
    const aktif = UJIAN.filter(u => u.status === "Aktif");
    $("uList").innerHTML = aktif.map(u =>
      // FIXED: u.durasi & u.id (dari ujian.json publik) masuk HTML/atribut tanpa esc(); kini di-esc().
      '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><div class="text-xs font-bold text-emerald-700">' + esc(u.mapel) + " • Kelas " + esc(u.kelas) + '</div><b class="block mt-1">' + esc(u.judul) + '</b><div class="text-xs text-slate-500 mt-1">' + (u.soal_ids || []).length + " soal • " + esc(u.durasi) + " menit • " + fmtTgl(u.tanggal) + '</div><button data-join="' + esc(u.id) + '" class="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700">Ikuti Ujian</button></div>'
    ).join("") || '<p class="text-sm text-slate-400">Belum ada ujian berstatus Aktif.</p>';
    document.querySelectorAll("[data-join]").forEach(b => b.onclick = () => {
      const u = UJIAN.find(x => x.id === b.dataset.join);
      $("jTitle").textContent = u.judul;
      $("jModal").classList.remove("hidden");
      $("jForm").onsubmit = e => {
        e.preventDefault();
        const o = Object.fromEntries(new FormData(e.target).entries());
        const s = SISWA.find(x => x.nis === o.nis.trim());
        if (!s) return toast("NIS tidak ditemukan pada data siswa.", "error");
        if (o.token.trim().toUpperCase() !== String(u.token).toUpperCase()) return toast("Token ujian salah.", "error");
        const doneKey = "cbtdone:" + u.id + ":" + s.nis;
        if (!o.latihan && localStorage.getItem(doneKey)) return toast("Anda sudah mengerjakan ujian ini. Centang Mode latihan untuk mengulang.", "info");
        mulai(u, s, !!o.latihan);
      };
    });
  } catch (e) { toast(e.message, "error"); }
  refreshIcons();
})();
$("jCancel").onclick = () => $("jModal").classList.add("hidden");
function mulai(u, s, latihan) {
  let soal = (u.soal_ids || []).map(id => SOAL.find(x => x.id === id)).filter(Boolean);
  if (!soal.length) soal = SOAL.filter(x => x.mapel === u.mapel);
  if (!soal.length) return toast("Ujian ini belum memiliki soal.", "error");
  soal = [...soal].sort(() => Math.random() - 0.5);
  EX = { ujian: u, soal, idx: 0, jawaban: {}, sisa: u.durasi * 60, timer: null, siswa: s, latihan };
  $("jModal").classList.add("hidden");
  $("exJudul").textContent = u.judul + (latihan ? " (Latihan)" : "");
  $("exPeserta").textContent = s.nama + " • NIS " + s.nis + " • " + s.kelas;
  $("cbtTimer").classList.remove("hidden");
  show("scrExam");
  EX.timer = setInterval(() => {
    EX.sisa--;
    const m = String(Math.floor(EX.sisa / 60)).padStart(2, "0"), d = String(EX.sisa % 60).padStart(2, "0");
    $("cbtTimer").textContent = m + ":" + d;
    $("cbtTimer").classList.toggle("animate-pulse", EX.sisa <= 60);
    if (EX.sisa <= 0) { toast("Waktu habis — jawaban dikumpulkan otomatis.", "info"); selesai(true); }
  }, 1000);
  gambarSoal();
}
function gambarSoal() {
  const q = EX.soal[EX.idx];
  const opts = ["A", "B", "C", "D", "E"].filter(k => q[k.toLowerCase()]);
  $("exNav").innerHTML = EX.soal.map((s, i) =>
    '<button data-nav="' + i + '" class="w-8 h-8 rounded-lg text-xs font-bold ' + (i === EX.idx ? "bg-slate-900 text-white" : EX.jawaban[s.id] ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 border border-slate-200") + '">' + (i + 1) + "</button>").join("");
  $("exSoal").innerHTML = '<div class="text-xs font-bold text-slate-400">Soal ' + (EX.idx + 1) + " dari " + EX.soal.length + '</div><p class="mt-2 font-semibold">' + esc(q.pertanyaan) + '</p><div class="mt-4 space-y-2">' +
    opts.map(k => '<label class="flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer text-sm ' + (EX.jawaban[q.id] === k ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50") + '"><input type="radio" name="jwb" value="' + k + '" ' + (EX.jawaban[q.id] === k ? "checked" : "") + ' class="mt-0.5 accent-emerald-600"><span><b>' + k + ".</b> " + esc(q[k.toLowerCase()]) + "</span></label>").join("") + "</div>";
  $("exPrev").disabled = EX.idx === 0; $("exPrev").classList.toggle("opacity-40", EX.idx === 0);
  const last = EX.idx === EX.soal.length - 1;
  $("exNext").classList.toggle("hidden", last); $("exDone").classList.toggle("hidden", !last);
  document.querySelectorAll('input[name="jwb"]').forEach(r => r.onchange = () => { EX.jawaban[q.id] = r.value; gambarSoal(); });
  document.querySelectorAll("[data-nav]").forEach(b => b.onclick = () => { EX.idx = +b.dataset.nav; gambarSoal(); });
  refreshIcons();
}
$("exPrev").onclick = () => { if (EX.idx > 0) { EX.idx--; gambarSoal(); } };
$("exNext").onclick = () => { if (EX.idx < EX.soal.length - 1) { EX.idx++; gambarSoal(); } };
$("exDone").onclick = () => selesai(false);
function selesai(auto) {
  const kosong = EX.soal.length - Object.keys(EX.jawaban).length;
  if (!auto && kosong > 0 && !confirm(kosong + " soal belum dijawab. Tetap kumpulkan?")) return;
  clearInterval(EX.timer); $("cbtTimer").classList.add("hidden");
  const benar = EX.soal.filter(q => EX.jawaban[q.id] === q.kunci).length;
  const nilai = Math.round(benar / EX.soal.length * 100);
  const hasil = { ujian_id: EX.ujian.id, ujian_judul: EX.ujian.judul, mapel: EX.ujian.mapel, nis: EX.siswa.nis, nama: EX.siswa.nama, kelas: EX.siswa.kelas, benar, salah: EX.soal.length - benar, total_soal: EX.soal.length, nilai, latihan: EX.latihan, waktu_selesai: new Date().toISOString(), jawaban: EX.jawaban };
  if (!EX.latihan) localStorage.setItem("cbtdone:" + EX.ujian.id + ":" + EX.siswa.nis, "1");
  try { const hs = JSON.parse(localStorage.getItem("cbt_hasil") || "[]"); hs.push(hasil); localStorage.setItem("cbt_hasil", JSON.stringify(hs)); } catch (e) {}
  const k = KELAS.find(x => x.nama === EX.siswa.kelas);
  const wali = k && GURU.find(g => g.id === k.wali_kelas);
  const wa = "https://wa.me/" + ((wali && wali.no_hp) || ST.wa_admin || "").replace(/^0/, "62") + "?text=" + encodeURIComponent("Hasil CBT " + EX.ujian.judul + ": " + EX.siswa.nama + " (NIS " + EX.siswa.nis + ") — nilai " + nilai + " (" + benar + "/" + EX.soal.length + " benar). Berkas JSON hasil terlampir.");
  $("scrHasil").innerHTML = '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">' +
    '<div class="text-xs font-bold text-slate-400 uppercase">Hasil Ujian' + (EX.latihan ? " (Latihan)" : "") + '</div><div class="text-6xl font-extrabold mt-2 ' + (nilai >= (ST.kkm || 75) ? "text-emerald-600" : "text-rose-600") + '">' + nilai + '</div>' +
    '<p class="text-sm text-slate-500 mt-2">' + esc(EX.siswa.nama) + " • " + esc(EX.ujian.judul) + '<br><b class="text-emerald-700">' + benar + ' benar</b> • <b class="text-rose-600">' + (EX.soal.length - benar) + " salah</b> dari " + EX.soal.length + " soal</p>" +
    '<div class="mt-6 flex flex-wrap justify-center gap-3"><button id="hUnduh" class="inline-flex items-center gap-1.5 border border-slate-300 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-slate-50"><i data-lucide="download" class="w-4 h-4"></i>Unduh Hasil (JSON)</button><a target="_blank" href="' + wa + '" class="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl"><i data-lucide="send" class="w-4 h-4"></i>Lapor Guru via WA</a><button onclick="location.reload()" class="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm">Kembali</button></div>' +
    '<p class="text-xs text-slate-500 mt-4">Unduh berkas JSON lalu kirim ke guru. Guru mengimpornya di Admin → Ujian Online → Impor Hasil CBT, dan nilai otomatis masuk e-Rapor.</p></div>' +
    '<div class="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><b class="text-sm">Pembahasan</b><div class="mt-3 space-y-3">' +
    EX.soal.map((q, i) => { const ok = EX.jawaban[q.id] === q.kunci; return '<div class="border rounded-xl p-3 text-sm ' + (ok ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50") + '"><b>' + (i + 1) + ". " + esc(q.pertanyaan) + '</b><div class="text-xs mt-1">Jawaban Anda: <b>' + esc(EX.jawaban[q.id] || "-") + "</b> • Kunci: <b>" + esc(q.kunci) + "</b> " + (ok ? "✓" : "✗") + "</div>" + (q.pembahasan ? '<div class="text-xs text-slate-500 mt-1">' + esc(q.pembahasan) + "</div>" : "") + "</div>"; }).join("") + "</div></div>";
  $("hUnduh").onclick = () => download("hasil-cbt-" + EX.ujian.id + "-" + EX.siswa.nis + ".json", JSON.stringify(hasil, null, 2));
  show("scrHasil"); refreshIcons(); window.scrollTo(0, 0);
}
