// ============================================================
// admin-absensi.js — Absensi Siswa (QR) & Absensi Guru/TU (#/absensi, #/absensi-guru).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F["absensi-guru"] = [
    { k: "tanggal", l: "Tanggal", t: "date", def: today() },
    { k: "guru_id", l: "Pegawai", t: "select", optsFn: optGuru, req: true },
    { k: "jam_masuk", l: "Jam Masuk", t: "time", def: "07:00" },
    { k: "jam_pulang", l: "Jam Pulang", t: "time", def: "14:00" },
    { k: "status", l: "Status", t: "select", opts: ["Hadir", "Sakit", "Izin", "Dinas Luar", "Alfa"], def: "Hadir" },
    { k: "catatan", l: "Catatan", req: false }
  ];

let absTab = "rekap", scanner = null, scanLock = 0;

function stopScanner() { if (scanner) { try { scanner.stop().then(() => scanner.clear()).catch(() => {}); } catch (e) {} scanner = null; } }

async function renderAbsensi() {
  const m = MOD.absensi;
  const tabs = { rekap: "Rekap Harian", manual: "Input Manual", scan: "Scan QR", qr: "Kartu QR Siswa" };
  app.innerHTML = pageHead(m) + '<div class="flex flex-wrap gap-2 mb-4">' + Object.keys(tabs).map(t =>
    '<button type="button" data-tab="' + t + '" class="px-4 py-2 rounded-lg text-sm font-bold ' + (absTab === t ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50") + '">' + tabs[t] + "</button>").join("") + '</div><div id="absBody"></div>';
  app.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { stopScanner(); absTab = b.dataset.tab; renderAbsensi(); });
  const B = document.getElementById("absBody");
  if (absTab === "rekap") await absRekap(B);
  if (absTab === "manual") await absManual(B);
  if (absTab === "scan") absScan(B);
  if (absTab === "qr") await absQR(B);
  refreshIcons();
}

async function absRekap(B, tgl = today()) {
  const [abs, siswa] = await Promise.all([fetchJSON("absensi.json"), fetchJSON("siswa.json")]);
  const rows = abs.filter(a => a.tanggal === tgl);
  const cnt = s => rows.filter(r => r.status === s).length;
  B.innerHTML = card('<div class="flex flex-wrap items-end gap-3 mb-4"><label class="block">' + lbl("Tanggal") + '<input id="aTgl" type="date" value="' + tgl + '" ' + inp + "></label>" +
    ["Hadir", "Sakit", "Izin", "Alfa"].map(s => '<span class="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold">' + s + ": " + cnt(s) + "</span>").join("") +
    '<span class="text-sm text-slate-500">dari ' + siswa.filter(s => s.status === "Aktif").length + " siswa aktif</span></div>" +
    '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Jam", "NIS", "Nama", "Kelas", "Status", "Metode", ""].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" +
    (rows.map(r => '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-sm">' + esc(r.jam) + '</td><td class="px-3 py-2 text-sm font-mono">' + esc(r.nis) + '</td><td class="px-3 py-2 text-sm font-semibold">' + esc(r.nama) + '</td><td class="px-3 py-2 text-sm">' + esc(r.kelas) + "</td><td class='px-3 py-2'>" + badge(r.status) + '</td><td class="px-3 py-2 text-sm">' + esc(r.metode) + '</td><td class="px-3 py-2 text-right"><button type="button" data-del="' + r.id + '" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>').join("") || emptyRow) +
    "</tbody></table></div>");
  refreshIcons();
  document.getElementById("aTgl").onchange = e => absRekap(B, e.target.value);
  B.onclick = async e => {
    const b = e.target.closest("button[data-del]"); if (!b) return;
    if (!(await confirmBox({ title: "Hapus catatan absensi", message: "Hapus catatan absensi ini?", danger: true, okLabel: "Hapus" }))) return;
    const all = await fetchJSON("absensi.json");
    if (await saveData("absensi.json", all.filter(x => x.id !== b.dataset.del), "Absensi", "HAPUS ABSENSI", tgl)) absRekap(B, tgl);
  };
}

async function absManual(B) {
  const siswa = await fetchJSON("siswa.json");
  B.innerHTML = card('<form id="fAbs" class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">' +
    '<label class="block lg:col-span-2">' + lbl("Siswa *") + '<select name="nis" ' + inp + ' required><option value="">— pilih —</option>' + siswa.map(s => '<option value="' + esc(s.nis) + '">' + esc(s.nis + " — " + s.nama + " (" + s.kelas + ")") + "</option>").join("") + "</select></label>" +
    '<label class="block">' + lbl("Tanggal") + '<input name="tanggal" type="date" value="' + today() + '" ' + inp + "></label>" +
    '<label class="block">' + lbl("Status") + '<select name="status" ' + inp + ">" + ["Hadir", "Sakit", "Izin", "Alfa"].map(s => "<option>" + s + "</option>").join("") + "</select></label>" +
    '<button ' + btnP + '><i data-lucide="check" class="w-4 h-4"></i>Catat</button></form>');
  refreshIcons();
  document.getElementById("fAbs").onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target).entries());
    const s = siswa.find(x => x.nis === o.nis);
    const abs = await fetchJSON("absensi.json");
    if (abs.some(a => a.nis === o.nis && a.tanggal === o.tanggal)) return toast("Siswa sudah tercatat pada tanggal itu.", "info");
    abs.unshift({ id: uid(), tanggal: o.tanggal, nis: s.nis, nama: s.nama, kelas: s.kelas, status: o.status, metode: "Manual", jam: nowTime() });
    if (await saveData("absensi.json", abs, "Absensi", "INPUT ABSENSI", s.nama + " " + o.status + " " + o.tanggal)) absManual(B);
  };
}

function absScan(B) {
  B.innerHTML = card('<p class="text-sm text-slate-500 mb-3">Arahkan kamera ke kartu QR siswa (isi QR: <code>SIS:NIS</code>). Kamera aktif hanya di <b>HTTPS</b> (GitHub Pages) atau localhost.</p>' +
    '<div class="flex gap-2 mb-3"><button type="button" id="scanOn" ' + btnP + '><i data-lucide="scan-line" class="w-4 h-4"></i>Mulai Scan</button><button type="button" id="scanOff" ' + btnS + ">Stop</button></div>" +
    '<div id="reader" class="w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-slate-900"></div><ul id="scanLog" class="mt-4 space-y-1 text-sm"></ul>');
  refreshIcons();
  document.getElementById("scanOn").onclick = async () => {
    if (scanner) return;
    scanner = new Html5Qrcode("reader");
    try {
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 240, height: 240 } }, async txt => {
        if (Date.now() - scanLock < 2500) return; scanLock = Date.now();
        const nis = txt.startsWith("SIS:") ? txt.slice(4) : txt.trim();
        const siswa = await fetchJSON("siswa.json");
        const s = siswa.find(x => x.nis === nis);
        const log = document.getElementById("scanLog");
        if (!s) { log.innerHTML = '<li class="text-red-600">✗ QR tidak dikenal: ' + esc(nis) + "</li>" + log.innerHTML; return; }
        const abs = await fetchJSON("absensi.json");
        if (abs.some(a => a.nis === nis && a.tanggal === today())) { toast(s.nama + " sudah absen hari ini.", "info"); return; }
        abs.unshift({ id: uid(), tanggal: today(), nis: s.nis, nama: s.nama, kelas: s.kelas, status: "Hadir", metode: "QR", jam: nowTime() });
        if (await saveData("absensi.json", abs, "Absensi", "SCAN QR", s.nama + " Hadir"))
          log.innerHTML = '<li class="text-emerald-700 font-semibold">✓ ' + esc(s.nama) + " (" + esc(s.kelas) + ") — Hadir " + nowTime() + "</li>" + log.innerHTML;
      }, () => {});
    } catch (e) { toast("Kamera gagal: " + e.message, "error"); scanner = null; }
  };
  document.getElementById("scanOff").onclick = stopScanner;
}

async function absQR(B) {
  const [siswa, kelas] = await Promise.all([fetchJSON("siswa.json"), fetchJSON("kelas.json")]);
  B.innerHTML = card('<div class="flex flex-wrap items-end gap-3 mb-4"><label class="block">' + lbl("Kelas") + '<select id="qrKelas" ' + inp + '><option value="">Semua Kelas</option>' + kelas.map(k => "<option>" + esc(k.nama) + "</option>").join("") + "</select></label>" +
    '<button type="button" id="qrGen" ' + btnP + '><i data-lucide="qr-code" class="w-4 h-4"></i>Buat Kartu QR</button><button type="button" id="qrPrint" ' + btnS + '><i data-lucide="printer" class="w-4 h-4"></i>Cetak</button></div><div id="qrGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"></div>');
  refreshIcons();
  document.getElementById("qrGen").onclick = () => {
    const k = document.getElementById("qrKelas").value;
    const list = siswa.filter(s => s.status === "Aktif" && (!k || s.kelas === k));
    const grid = document.getElementById("qrGrid");
    grid.innerHTML = list.map(s => '<div class="qrc border border-slate-200 rounded-xl p-3 text-center" data-nis="' + esc(s.nis) + '" data-nama="' + esc(s.nama) + '" data-kelas="' + esc(s.kelas) + '"><div class="flex justify-center" id="qr-' + esc(s.nis) + '"></div><div class="mt-2 text-xs font-bold">' + esc(s.nama) + '</div><div class="text-[11px] text-slate-500">' + esc(s.nis) + " • " + esc(s.kelas) + "</div></div>").join("");
    list.forEach(s => new QRCode(document.getElementById("qr-" + s.nis), { text: "SIS:" + s.nis, width: 96, height: 96 }));
  };
  document.getElementById("qrPrint").onclick = () => {
    const cards = [...document.querySelectorAll("#qrGrid .qrc")].map(el => {
      const c = el.querySelector("canvas");
      return { img: c ? c.toDataURL("image/png") : "", nama: el.dataset.nama, kelas: el.dataset.kelas, nis: el.dataset.nis };
    });
    if (!cards.length) return toast("Buat kartu QR terlebih dahulu.", "info");
    printHTML("Kartu QR Absensi", "<h2>Kartu QR Absensi Siswa</h2><p class='muted'>Scan dengan modul Absensi → Scan QR di admin.</p><div class='grid'>" +
      cards.map(c => '<div class="card"><img src="' + c.img + '" width="110"><div><b>' + esc(c.nama) + "</b></div><div class='muted'>" + esc(c.nis) + " • " + esc(c.kelas) + "</div></div>").join("") + "</div>");
  };
}

MOD.absensi = { title: "Absensi Siswa (QR Code)", desc: "Scan kartu QR siswa via kamera, input manual, rekap harian, cetak kartu QR.", render: "renderAbsensi" };
MOD["absensi-guru"] = { title: "Absensi Guru & TU", desc: "Presensi harian guru dan tenaga kependidikan: jam masuk, jam pulang, dan status.", file: "absensi-guru.json", fields: F["absensi-guru"], cols: ["tanggal", "guru_id", "jam_masuk", "jam_pulang", "status"], preload: ["guru.json"], fmts: { tanggal: fmtTgl, guru_id: namaGuru } };
