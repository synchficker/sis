// ============================================================
// admin-spp.js — SPP • VA & QRIS, termasuk tab Tunggakan (#/spp). Satu-satunya tempat logika SPP.
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
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
        return '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-sm font-semibold">' + esc(g.nama) + '</td><td class="px-3 py-2 text-sm">' + esc(g.kelas) + '</td><td class="px-3 py-2 text-sm">' + esc(g.bln.join(", ")) + '</td><td class="px-3 py-2 text-sm font-bold text-red-600">' + fmtRp(g.total) + '</td><td class="px-3 py-2"><a target="_blank" href="https://wa.me/' + esc((s && s.no_hp_ortu || "").replace(/^0/, "62")) + "?text=" + encodeURIComponent(pesan) + '" class="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg inline-block" title="Kirim pengingat WA"><i data-lucide="send" class="w-4 h-4"></i></a></td></tr>';
      }).join("") || emptyRow) + "</tbody></table></div>");
  }
  app.innerHTML = pageHead(MOD.spp) +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' + stat("Tagihan Aktif", spp.length + " baris", "slate") + stat("Tunggakan", fmtRp(totalTunggakan), "red") + stat("Siswa Menunggak", new Set(belum.map(b => b.nis)).size + " siswa", "amber") + stat("Diterima Bulan Ini", fmtRp(lunasBlnIni), "emerald") + "</div>" +
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
      '<button type="button" data-del="' + r.id + '" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>'
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
    } else if (b.dataset.del && await confirmBox({ title: "Hapus tagihan", message: "Hapus tagihan " + r.nama + " " + BULAN[r.bulan - 1] + "?", danger: true, okLabel: "Hapus" })) {
      if (await saveData("spp.json", spp.filter(x => x.id !== r.id), "Keuangan", "HAPUS TAGIHAN", r.nama + " " + BULAN[r.bulan - 1])) route();
    }
  };
}

MOD.spp = { title: "SPP • VA & QRIS", desc: "Generate tagihan massal, pembayaran VA/QRIS/Tunai (demo), dan pantauan tunggakan.", render: "renderSPP" };
