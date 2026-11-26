// ============================================================
// admin-gaji.js — Penggajian Guru (#/gaji).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

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

MOD.gaji = { title: "Penggajian Guru", desc: "Generate slip gaji bulanan dari data pegawai, tandai dibayar, cetak slip.", render: "renderGaji" };
