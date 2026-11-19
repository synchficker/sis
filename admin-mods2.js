// ============================================================
// admin-mods2.js — Modul kustom (bagian 3/3): SPP, Gaji, Audit,
// Chat, WA Gateway, Perpustakaan, Laporan Dinas, Pengaturan,
// Dashboard, serta ROUTER & INISIALISASI (dijalankan terakhir).
// TOKEN TIDAK BOLEH DI-HARDCODE
// ============================================================
let sppTab = "tagihan";
async function renderSPP() {
  const [spp, siswa, st, kelas] = await Promise.all([fetchJSON("spp.json"), fetchJSON("siswa.json"), fetchJSON("settings.json"), fetchJSON("kelas.json")]);
  const belum = spp.filter(s => s.status === "Belum");
  const totalTunggakan = belum.reduce((a, b) => a + (b.nominal || 0), 0);
  const lunasBlnIni = spp.filter(s => s.status === "Lunas" && s.bulan === new Date().getMonth() + 1).reduce((a, b) => a + b.nominal, 0);
  const stat = (l, v, c) => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"><div class="text-xs font-bold text-slate-500">' + l + '</div><div class="text-lg font-extrabold text-' + c + '-600 mt-1">' + v + "</div></div>";
  let bodyHtml = "";
  if (sppTab === "tagihan") {
    bodyHtml = card('<div class="grid sm:grid-cols-5 gap-3 items-end mb-4">' +
      '<label class="block">' + lbl("Bulan") + '<select id="gBulan" ' + inp + ">" + BULAN.map((b, i) => '<option value="' + (i + 1) + '" ' + (i === new Date().getMonth() ? "selected" : "") + ">" + b + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Tahun") + '<input id="gTahun" type="number" value="' + new Date().getFullYear() + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Kelas") + '<select id="gKelas" ' + inp + '><option value="ALL">Semua Kelas</option>' + kelas.map(k => "<option>" + esc(k.nama) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Nominal (Rp)") + '<input id="gNom" type="number" value="' + st.spp_nominal + '" ' + inp + "></label>" +
      '<button type="button" id="gGen" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Generate Tagihan</button></div>' +
      '<div class="flex flex-wrap gap-2 mb-3"><select id="fBulan" class="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Semua Bulan</option>' + BULAN.map((b, i) => '<option value="' + (i + 1) + '">' + b + "</option>").join("") + '</select><select id="fStatus" class="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Semua Status</option><option>Belum</option><option>Lunas</option></select></div>' +
      '<div class="overflow-x-auto max-h-[55vh] overflow-y-auto"><table class="w-full text-left"><thead class="bg-slate-50 sticky top-0"><tr>' + ["Siswa", "Kelas", "Bulan", "Nominal", "No. VA", "Status", "Metode", "Aksi"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody id='sppTb'></tbody></table></div>");
  } else {
    const grp = {};
    belum.forEach(b => { const g = grp[b.nis] = grp[b.nis] || { nama: b.nama, kelas: b.kelas, n: 0, total: 0, bln: [] }; g.n++; g.total += b.nominal; g.bln.push(BULAN[b.bulan - 1]); });
    bodyHtml = card('<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Siswa", "Kelas", "Bulan Menunggak", "Total", "Ingatkan via WA"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" +
      (Object.entries(grp).map(([nis, g]) => {
        const s = siswa.find(x => x.nis === nis);
        const pesan = "Yth. Orang Tua " + g.nama + ", kami informasikan tagihan SPP ananda belum dibayar untuk: " + g.bln.join(", ") + ". Total " + fmtRp(g.total) + ". Mohon segera melakukan pembayaran. Terima kasih. — " + st.nama_sekolah;
        return '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-sm font-semibold">' + esc(g.nama) + '</td><td class="px-3 py-2 text-sm">' + esc(g.kelas) + '</td><td class="px-3 py-2 text-sm">' + esc(g.bln.join(", ")) + '</td><td class="px-3 py-2 text-sm font-bold text-rose-600">' + fmtRp(g.total) + '</td><td class="px-3 py-2"><a target="_blank" href="https://wa.me/' + esc((s && s.no_hp_ortu || "").replace(/^0/, "62")) + "?text=" + encodeURIComponent(pesan) + '" class="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg inline-block" title="Kirim pengingat WA"><i data-lucide="send" class="w-4 h-4"></i></a></td></tr>';
      }).join("") || emptyRow) + "</tbody></table></div>");
  }
  app.innerHTML = pageHead(MOD.spp) +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' + stat("Tagihan Aktif", spp.length + " baris", "slate") + stat("Tunggakan", fmtRp(totalTunggakan), "rose") + stat("Siswa Menunggak", new Set(belum.map(b => b.nis)).size + " siswa", "amber") + stat("Diterima Bulan Ini", fmtRp(lunasBlnIni), "emerald") + "</div>" +
    '<div class="flex gap-2 mb-4"><button type="button" data-t="tagihan" class="px-4 py-2 rounded-lg text-sm font-bold ' + (sppTab === "tagihan" ? "bg-emerald-600 text-white" : "bg-white border border-slate-200") + '">Tagihan & Pembayaran</button><button type="button" data-t="tunggakan" class="px-4 py-2 rounded-lg text-sm font-bold ' + (sppTab === "tunggakan" ? "bg-emerald-600 text-white" : "bg-white border border-slate-200") + '">Tunggakan</button></div>' + bodyHtml;
  refreshIcons();
  app.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { sppTab = b.dataset.t; renderSPP(); });
  if (sppTab !== "tagihan") return;
  const drawRows = () => {
    const fb = document.getElementById("fBulan").value, fs = document.getElementById("fStatus").value;
    const rows = spp.filter(s => (!fb || s.bulan === +fb) && (!fs || s.status === fs));
    document.getElementById("sppTb").innerHTML = rows.map(r =>
      '<tr class="border-b border-slate-100 hover:bg-slate-50"><td class="px-3 py-2 text-sm font-semibold">' + esc(r.nama) + '</td><td class="px-3 py-2 text-sm">' + esc(r.kelas) + '</td><td class="px-3 py-2 text-sm">' + BULAN[r.bulan - 1] + " " + r.tahun + '</td><td class="px-3 py-2 text-sm">' + fmtRp(r.nominal) + '</td><td class="px-3 py-2 text-xs font-mono">' + esc(r.va) + "</td><td class='px-3 py-2'>" + badge(r.status) + '</td><td class="px-3 py-2 text-sm">' + esc(r.metode || "-") + '</td><td class="px-3 py-2 text-right whitespace-nowrap">' +
      (r.status === "Belum" ? '<button type="button" data-bayar="' + r.id + '" title="Tandai bayar" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><i data-lucide="check" class="w-4 h-4 pointer-events-none"></i></button>' : "") +
      '<button type="button" data-qr="' + r.id + '" title="VA / QRIS" class="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><i data-lucide="qr-code" class="w-4 h-4 pointer-events-none"></i></button>' +
      '<button type="button" data-del="' + r.id + '" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>'
    ).join("") || emptyRow;
    refreshIcons();
  };
  drawRows();
  document.getElementById("fBulan").onchange = drawRows;
  document.getElementById("fStatus").onchange = drawRows;
  document.getElementById("gGen").onclick = async () => {
    const bl = +document.getElementById("gBulan").value, th = +document.getElementById("gTahun").value;
    const kl = document.getElementById("gKelas").value, nom = +document.getElementById("gNom").value;
    const targets = siswa.filter(s => s.status === "Aktif" && (kl === "ALL" || s.kelas === kl));
    const baru = targets.filter(s => !spp.some(x => x.nis === s.nis && x.bulan === bl && x.tahun === th))
      .map(s => ({ id: uid(), nis: s.nis, nama: s.nama, kelas: s.kelas, bulan: bl, tahun: th, nominal: nom, status: "Belum", metode: "", tanggal_bayar: "", va: st.bank.va_prefix + s.nis + String(bl).padStart(2, "0") + String(th).slice(2) }));
    if (!baru.length) return toast("Semua siswa target sudah punya tagihan bulan itu.", "info");
    if (await saveData("spp.json", [...baru, ...spp], "Keuangan", "GENERATE SPP", baru.length + " tagihan " + BULAN[bl - 1] + " " + th)) route();
  };
  app.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    const r = spp.find(x => x.id === (b.dataset.bayar || b.dataset.qr || b.dataset.del));
    if (b.dataset.bayar) {
      openModal("Pembayaran SPP — " + r.nama, '<p class="text-sm text-slate-600 mb-3">' + BULAN[r.bulan - 1] + " " + r.tahun + " • <b>" + fmtRp(r.nominal) + "</b> • VA <code>" + esc(r.va) + "</code></p>" +
        '<div class="grid sm:grid-cols-2 gap-3"><label class="block">' + lbl("Metode") + '<select name="metode" ' + inp + "><option>Transfer VA</option><option>QRIS</option><option>Tunai</option></select></label>" +
        '<label class="block">' + lbl("Tanggal Bayar") + '<input name="tanggal" type="date" value="' + today() + '" ' + inp + "></label></div>",
        async obj => {
          const arr = await fetchJSON("spp.json"); const x = arr.find(y => y.id === r.id);
          Object.assign(x, { status: "Lunas", metode: obj.metode, tanggal_bayar: obj.tanggal });
          const ok = await saveData("spp.json", arr, "Keuangan", "BAYAR SPP", r.nama + " " + BULAN[r.bulan - 1] + " " + fmtRp(r.nominal) + " via " + obj.metode);
          if (ok) route(); return ok;
        }, "Konfirmasi Lunas");
    } else if (b.dataset.qr) {
      openModal("Instrumen Pembayaran — " + r.nama,
        '<div class="grid sm:grid-cols-2 gap-4"><div><div class="text-xs font-bold text-slate-500 mb-1">Virtual Account (' + esc(st.bank.nama) + ')</div><div class="text-xl font-extrabold font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">' + esc(r.va) + '</div><div class="text-xs text-slate-500 mt-1">a.n. ' + esc(st.bank.atas_nama || st.nama_sekolah) + "</div>" +
        '<div class="mt-3 text-xs font-bold text-slate-500">Nominal</div><div class="font-extrabold">' + fmtRp(r.nominal) + "</div></div>" +
        '<div class="text-center"><div class="text-xs font-bold text-slate-500 mb-1">QRIS (' + esc(st.qris.merchant) + ')</div><div id="sppQr" class="inline-block bg-white p-2 border border-slate-200 rounded-xl"></div><div class="text-[11px] text-amber-600 mt-1">QR demo statis. Produksi: hubungkan payment gateway (Midtrans/Xendit/dll).</div></div></div>', null);
      setTimeout(() => new QRCode(document.getElementById("sppQr"), { text: "QRIS-DEMO:" + st.npsn + ":" + r.nis + ":" + r.bulan + "/" + r.tahun + ":" + r.nominal, width: 150, height: 150 }), 60);
    } else if (b.dataset.del && confirm("Hapus tagihan " + r.nama + " " + BULAN[r.bulan - 1] + "?")) {
      if (await saveData("spp.json", spp.filter(x => x.id !== r.id), "Keuangan", "HAPUS TAGIHAN", r.nama + " " + BULAN[r.bulan - 1])) route();
    }
  };
}
async function renderGaji() {
  const [gaji, guru] = await Promise.all([fetchJSON("gaji.json"), fetchJSON("guru.json")]);
  app.innerHTML = pageHead(MOD.gaji) + card('<div class="flex flex-wrap items-end gap-3 mb-4">' +
    '<label class="block">' + lbl("Bulan") + '<select id="pBulan" ' + inp + ">" + BULAN.map((b, i) => '<option value="' + (i + 1) + '" ' + (i === new Date().getMonth() ? "selected" : "") + ">" + b + "</option>").join("") + "</select></label>" +
    '<label class="block">' + lbl("Tahun") + '<input id="pTahun" type="number" value="' + new Date().getFullYear() + '" ' + inp + "></label>" +
    '<button type="button" id="pGen" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Generate Gaji Semua Pegawai</button></div>' +
    '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Pegawai", "Periode", "Pokok", "Tunjangan", "Potongan", "Total", "Status", "Aksi"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" +
    (gaji.map(g => '<tr class="border-b border-slate-100 hover:bg-slate-50"><td class="px-3 py-2 text-sm font-semibold">' + esc(g.nama) + '</td><td class="px-3 py-2 text-sm">' + BULAN[g.bulan - 1] + " " + g.tahun + '</td><td class="px-3 py-2 text-sm">' + fmtRp(g.pokok) + '</td><td class="px-3 py-2 text-sm">' + fmtRp(g.tunjangan) + '</td><td class="px-3 py-2 text-sm">' + fmtRp(g.potongan) + '</td><td class="px-3 py-2 text-sm font-bold">' + fmtRp(g.total) + "</td><td class='px-3 py-2'>" + badge(g.status) + '</td><td class="px-3 py-2 text-right whitespace-nowrap">' +
      '<button type="button" data-edit="' + g.id + '" title="Edit tunjangan/potongan" class="p-1.5 text-sky-600 hover:bg-slate-100 rounded-lg"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>' +
      (g.status !== "Dibayar" ? '<button type="button" data-bayar="' + g.id + '" title="Tandai dibayar" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><i data-lucide="check" class="w-4 h-4 pointer-events-none"></i></button>' : "") +
      '<button type="button" data-slip="' + g.id + '" title="Cetak slip" class="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><i data-lucide="printer" class="w-4 h-4 pointer-events-none"></i></button>' +
      '<button type="button" data-del="' + g.id + '" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>').join("") || emptyRow) +
    "</tbody></table></div>");
  refreshIcons();
  document.getElementById("pGen").onclick = async () => {
    const bl = +document.getElementById("pBulan").value, th = +document.getElementById("pTahun").value;
    const baru = guru.filter(g => !gaji.some(x => x.guru_id === g.id && x.bulan === bl && x.tahun === th))
      .map(g => ({ id: uid(), guru_id: g.id, nama: g.nama, bulan: bl, tahun: th, pokok: g.gaji_pokok || 0, tunjangan: 0, potongan: 0, total: g.gaji_pokok || 0, status: "Belum", tanggal_bayar: "" }));
    if (!baru.length) return toast("Semua pegawai sudah punya slip periode itu.", "info");
    if (await saveData("gaji.json", [...baru, ...gaji], "Keuangan", "GENERATE GAJI", baru.length + " slip " + BULAN[bl - 1] + " " + th)) route();
  };
  app.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    const g = gaji.find(x => x.id === (b.dataset.edit || b.dataset.bayar || b.dataset.slip || b.dataset.del)); if (!g) return;
    if (b.dataset.edit) {
      openModal("Edit Gaji — " + g.nama, '<div class="grid sm:grid-cols-2 gap-3"><label class="block">' + lbl("Tunjangan (Rp)") + '<input name="tunjangan" type="number" min="0" value="' + g.tunjangan + '" ' + inp + '></label><label class="block">' + lbl("Potongan (Rp)") + '<input name="potongan" type="number" min="0" value="' + g.potongan + '" ' + inp + "></label></div>",
        async obj => {
          const arr = await fetchJSON("gaji.json"); const x = arr.find(y => y.id === g.id);
          x.tunjangan = +obj.tunjangan || 0; x.potongan = +obj.potongan || 0; x.total = x.pokok + x.tunjangan - x.potongan;
          const ok = await saveData("gaji.json", arr, "Keuangan", "EDIT GAJI", g.nama + " total " + fmtRp(x.total));
          if (ok) route(); return ok;
        });
    } else if (b.dataset.bayar) {
      if (!confirm("Tandai gaji " + g.nama + " (" + fmtRp(g.total) + ") DIBAYAR?")) return;
      const arr = await fetchJSON("gaji.json"); const x = arr.find(y => y.id === g.id);
      x.status = "Dibayar"; x.tanggal_bayar = today();
      if (await saveData("gaji.json", arr, "Keuangan", "BAYAR GAJI", g.nama + " " + fmtRp(g.total))) route();
    } else if (b.dataset.slip) {
      printHTML("Slip Gaji " + g.nama, "<div class='center'><h2>SLIP GAJI PEGAWAI</h2><div class='muted'>Periode " + BULAN[g.bulan - 1] + " " + g.tahun + "</div></div>" +
        "<table><tr><th>Nama</th><td>" + esc(g.nama) + "</td></tr><tr><th>Gaji Pokok</th><td>" + fmtRp(g.pokok) + "</td></tr><tr><th>Tunjangan</th><td>" + fmtRp(g.tunjangan) + "</td></tr><tr><th>Potongan</th><td>(" + fmtRp(g.potongan) + ")</td></tr><tr><th>TOTAL DITERIMA</th><td><b>" + fmtRp(g.total) + "</b></td></tr><tr><th>Status</th><td>" + esc(g.status) + (g.tanggal_bayar ? " — " + fmtTgl(g.tanggal_bayar) : "") + "</td></tr></table><div class='ttd'><div>Penerima<br><br><br><b>" + esc(g.nama) + "</b></div><div>Bendahara<br><br><br>(........................)</div></div>");
    } else if (b.dataset.del && confirm("Hapus slip " + g.nama + "?")) {
      if (await saveData("gaji.json", gaji.filter(x => x.id !== g.id), "Keuangan", "HAPUS GAJI", g.nama)) route();
    }
  };
}
async function renderAudit() {
  const log = await fetchJSON("audit.json").catch(() => []);
  const moduls = [...new Set(log.map(l => l.modul))];
  const rows = ls => ls.map(l => '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-xs whitespace-nowrap">' + fmtWaktu(l.waktu) + '</td><td class="px-3 py-2 text-sm font-semibold">' + esc(l.aktor) + '</td><td class="px-3 py-2 text-sm">' + esc(l.modul) + '</td><td class="px-3 py-2 text-xs font-bold text-emerald-700">' + esc(l.aksi) + '</td><td class="px-3 py-2 text-sm">' + esc(l.detail) + "</td></tr>").join("") || emptyRow;
  app.innerHTML = pageHead(MOD.audit) + card('<div class="flex flex-wrap gap-2 mb-3"><select id="aF" class="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Semua Modul</option>' + moduls.map(m => "<option>" + esc(m) + "</option>").join("") + '</select><button type="button" id="aCsv" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>Export CSV</button></div>' +
    '<div class="overflow-x-auto max-h-[62vh] overflow-y-auto"><table class="w-full text-left"><thead class="bg-slate-50 sticky top-0"><tr>' + ["Waktu", "Aktor (GitHub)", "Modul", "Aksi", "Detail"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody id='aTb'>" + rows(log) + "</tbody></table></div>");
  refreshIcons();
  document.getElementById("aF").onchange = e => { document.getElementById("aTb").innerHTML = rows(log.filter(l => !e.target.value || l.modul === e.target.value)); };
  document.getElementById("aCsv").onclick = () => download("audit-log.csv", toCSV(log, [{ k: "waktu", l: "waktu" }, { k: "aktor", l: "aktor" }, { k: "modul", l: "modul" }, { k: "aksi", l: "aksi" }, { k: "detail", l: "detail" }]), "text/csv");
}
let chatNis = null;
async function renderChat() {
  const [chat, siswa, kelas, guru] = await Promise.all([fetchJSON("chat.json"), fetchJSON("siswa.json"), fetchJSON("kelas.json"), fetchJSON("guru.json")]);
  const threads = [...new Set(chat.map(c => c.nis))];
  if (!chatNis || !siswa.some(s => s.nis === chatNis)) chatNis = threads[0] || (siswa[0] && siswa[0].nis) || null;
  const s = siswa.find(x => x.nis === chatNis);
  const k = s && kelas.find(x => x.nama === s.kelas);
  const wali = k && guru.find(g => g.id === k.wali_kelas);
  const msgs = chat.filter(c => c.nis === chatNis).sort((a, b) => (a.waktu || "").localeCompare(b.waktu || ""));
  app.innerHTML = pageHead(MOD.chat) + '<div class="grid lg:grid-cols-3 gap-4">' +
    card('<label class="block mb-3">' + lbl("Buka percakapan dengan ortu siswa") + '<select id="cPick" ' + inp + ">" + siswa.map(x => '<option value="' + esc(x.nis) + '" ' + (x.nis === chatNis ? "selected" : "") + ">" + esc(x.nama + " (" + x.kelas + ")") + "</option>").join("") + "</select></label>" +
      '<div class="space-y-1">' + threads.map(n => { const x = siswa.find(y => y.nis === n); const last = chat.filter(c => c.nis === n).slice(-1)[0]; return '<button type="button" data-nis="' + esc(n) + '" class="w-full text-left px-3 py-2 rounded-lg text-sm ' + (n === chatNis ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-50") + '"><b>' + esc(x ? x.nama : n) + '</b><div class="text-xs text-slate-500 truncate">' + esc(last ? last.pesan : "") + "</div></button>"; }).join("") || '<p class="text-sm text-slate-400">Belum ada percakapan.</p></div>') +
    '<div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">' +
    '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="message-circle" class="w-5 h-5 text-emerald-600"></i><div class="flex-1"><b class="text-sm">' + esc(s ? "Ortu " + s.nama : "-") + '</b><div class="text-xs text-slate-500">Wali kelas: ' + esc(wali ? wali.nama : "-") + '</div></div>' +
    (s && s.no_hp_ortu ? '<a target="_blank" href="https://wa.me/' + esc(s.no_hp_ortu.replace(/^0/, "62")) + '" class="text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg" title="Buka WhatsApp ortu"><i data-lucide="send" class="w-4 h-4"></i></a>' : "") + "</div>" +
    '<div class="flex-1 p-4 space-y-2 overflow-y-auto max-h-[45vh] bg-slate-50">' + (msgs.map(mm =>
      '<div class="flex ' + (mm.dari === "sekolah" ? "justify-end" : "justify-start") + '"><div class="max-w-[80%] px-3 py-2 rounded-2xl text-sm ' + (mm.dari === "sekolah" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-200 rounded-bl-sm") + '">' + esc(mm.pesan) + '<div class="text-[10px] mt-1 ' + (mm.dari === "sekolah" ? "text-emerald-100" : "text-slate-400") + '">' + (mm.dari === "sekolah" ? "Sekolah/Wali" : "Orang Tua") + " • " + fmtWaktu(mm.waktu) + "</div></div></div>"
    ).join("") || '<p class="text-center text-sm text-slate-400 py-8">Belum ada pesan. Mulai percakapan di bawah.</p>') + "</div>" +
    '<form id="cForm" class="p-3 border-t border-slate-100 flex gap-2"><input name="pesan" required placeholder="Tulis pesan sebagai wali kelas/sekolah…" class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"><button ' + btnP + '><i data-lucide="send" class="w-4 h-4"></i>Kirim</button></form></div></div>';
  refreshIcons();
  document.getElementById("cPick").onchange = e => { chatNis = e.target.value; renderChat(); };
  app.querySelectorAll("[data-nis]").forEach(b => b.onclick = () => { chatNis = b.dataset.nis; renderChat(); });
  document.getElementById("cForm").onsubmit = async e => {
    e.preventDefault();
    const pesan = e.target.pesan.value.trim(); if (!pesan || !chatNis) return;
    const arr = await fetchJSON("chat.json");
    arr.push({ id: uid(), nis: chatNis, dari: "sekolah", pesan, waktu: new Date().toISOString() });
    if (await saveData("chat.json", arr, "Komunikasi", "KIRIM CHAT", "ke ortu NIS " + chatNis)) renderChat();
  };
}
