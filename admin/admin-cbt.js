// ============================================================
// admin-cbt.js — Ujian Online CBT (#/ujian).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

async function renderUjian() {
  const [ujian, soal, st, kelas] = await Promise.all([fetchJSON("ujian.json"), fetchJSON("soal.json"), fetchJSON("settings.json"), fetchJSON("kelas.json")]);
  mem["ujian.json"] = ujian;
  const rows = ujian.map(u => '<tr class="border-b border-slate-100 hover:bg-slate-50"><td class="px-3 py-2 text-sm font-semibold">' + esc(u.judul) + '</td><td class="px-3 py-2 text-sm">' + esc(u.mapel) + '</td><td class="px-3 py-2 text-sm">' + esc(u.kelas) + '</td><td class="px-3 py-2 text-sm">' + u.durasi + ' mnt</td><td class="px-3 py-2 text-sm font-mono">' + esc(u.token) + '</td><td class="px-3 py-2 text-sm">' + (u.soal_ids || []).length + ' soal</td><td class="px-3 py-2">' + badge(u.status) + '</td><td class="px-3 py-2 text-right whitespace-nowrap"><a href="cbt.html" target="_blank" title="Buka halaman CBT" class="inline-block p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><i data-lucide="arrow-right" class="w-4 h-4"></i></a><button type="button" data-edit="' + u.id + '" class="p-1.5 text-sky-600 hover:bg-slate-100 rounded-lg"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button><button type="button" data-del="' + u.id + '" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td></tr>').join("") || emptyRow;
  app.innerHTML = pageHead(MOD.ujian) + '<div class="bg-white rounded-2xl shadow-sm border border-slate-200"><div class="p-4 flex flex-wrap gap-2 border-b border-slate-100">' +
    '<button type="button" id="uAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Buat Ujian</button>' +
    '<label class="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-sm font-bold px-4 py-2 rounded-lg cursor-pointer"><i data-lucide="upload" class="w-4 h-4"></i>Impor Hasil CBT (JSON)<input id="uImp" type="file" accept=".json" class="hidden"></label>' +
    '<span class="text-xs text-slate-500 self-center">Siswa mengunduh file hasil dari cbt.html → guru impor di sini → otomatis masuk nilai (jenis CBT).</span></div>' +
    '<div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50"><tr>' + ["Judul", "Mapel", "Kelas", "Durasi", "Token", "Jumlah", "Status", "Aksi"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody>" + rows + "</tbody></table></div></div>";
  refreshIcons();
  function formUjian(u) {
    const checked = new Set(u ? u.soal_ids || [] : []);
    const body = '<div class="grid sm:grid-cols-2 gap-3">' +
      '<label class="block sm:col-span-2">' + lbl("Judul Ujian *") + '<input name="judul" value="' + esc(u ? u.judul : "") + '" ' + inp + ' required></label>' +
      '<label class="block">' + lbl("Mapel *") + '<select name="mapel" id="uMapel" ' + inp + ' required><option value="">— pilih —</option>' + st.mapel.map(m => '<option ' + (u && u.mapel === m ? "selected" : "") + ">" + esc(m) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Kelas *") + '<select name="kelas" ' + inp + ' required><option value="">— pilih —</option>' + kelas.map(k => '<option ' + (u && u.kelas === k.nama ? "selected" : "") + ">" + esc(k.nama) + "</option>").join("") + "</select></label>" +
      '<label class="block">' + lbl("Durasi (menit)") + '<input name="durasi" type="number" min="1" value="' + (u ? u.durasi : 30) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Token Ujian *") + '<input name="token" value="' + esc(u ? u.token : "") + '" ' + inp + ' required placeholder="mis. MTK7A"></label>' +
      '<label class="block">' + lbl("Tanggal") + '<input name="tanggal" type="date" value="' + (u ? u.tanggal : today()) + '" ' + inp + "></label>" +
      '<label class="block">' + lbl("Status") + '<select name="status" ' + inp + ">" + ["Draft", "Aktif", "Selesai"].map(s => '<option ' + (u && u.status === s ? "selected" : "") + ">" + s + "</option>").join("") + "</select></label></div>" +
      '<div class="mt-4">' + lbl("Pilih Soal dari Bank Soal (minimal 1)") + '<div id="soalBox" class="mt-1 border border-slate-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-slate-100"></div></div>';
    openModal((u ? "Edit" : "Buat") + " Ujian CBT", body, async (obj, form) => {
      const ids = [...form.querySelectorAll('input[name="soal"]:checked')].map(i => i.value);
      if (!ids.length) { toast("Pilih minimal 1 soal.", "error"); return false; }
      const data = { id: u ? u.id : uid(), judul: obj.judul, mapel: obj.mapel, kelas: obj.kelas, durasi: Number(obj.durasi) || 30, token: obj.token.trim(), tanggal: obj.tanggal, status: obj.status, soal_ids: ids };
      const arr = [...ujian];
      if (u) arr[arr.findIndex(x => x.id === u.id)] = data; else arr.unshift(data);
      const ok = await saveData("ujian.json", arr, "LMS/CBT", u ? "EDIT UJIAN" : "BUAT UJIAN", data.judul);
      if (ok) route();
      return ok;
    });
    const draw = () => {
      const mp = document.getElementById("uMapel").value;
      const list = soal.filter(s => !mp || s.mapel === mp);
      document.getElementById("soalBox").innerHTML = list.map(s =>
        '<label class="flex items-start gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"><input type="checkbox" name="soal" value="' + s.id + '" ' + (checked.has(s.id) ? "checked" : "") + ' class="mt-1 accent-emerald-600"><span><b>[' + esc(s.mapel) + "]</b> " + esc(trunc(s.pertanyaan, 90)) + ' <span class="text-xs text-slate-400">(kunci ' + esc(s.kunci) + ")</span></span></label>"
      ).join("") || '<div class="px-3 py-4 text-sm text-slate-400">Tidak ada soal untuk mapel ini. Tambah di Bank Soal.</div>';
      document.querySelectorAll('input[name="soal"]').forEach(i => i.onchange = () => i.checked ? checked.add(i.value) : checked.delete(i.value));
    };
    document.getElementById("uMapel").onchange = draw; draw();
  }
  document.getElementById("uAdd").onclick = () => formUjian(null);
  app.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.edit) formUjian(ujian.find(x => x.id === b.dataset.edit));
    else if (b.dataset.del && confirm("Hapus ujian ini?")) {
      if (await saveData("ujian.json", ujian.filter(x => x.id !== b.dataset.del), "LMS/CBT", "HAPUS UJIAN", b.dataset.del)) route();
    }
  };
  document.getElementById("uImp").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      let hs = JSON.parse(await f.text()); if (!Array.isArray(hs)) hs = [hs];
      const nilai = await fetchJSON("nilai.json"); const siswa = await fetchJSON("siswa.json");
      let n = 0;
      for (const h of hs) {
        const u = ujian.find(x => x.id === h.ujian_id); const s = siswa.find(x => x.nis === h.nis);
        if (!u || !s || h.nilai === undefined) continue;
        nilai.unshift({ id: uid(), nis: h.nis, mapel: u.mapel, jenis: "CBT", tp: u.judul, nilai: Number(h.nilai), semester: st.semester, tahun_ajaran: st.tahun_ajaran });
        n++;
      }
      if (!n) return toast("Tidak ada hasil valid pada file (perlu ujian_id, nis, nilai).", "error");
      if (await saveData("nilai.json", nilai, "LMS/CBT", "IMPOR HASIL CBT", n + " hasil dari " + f.name)) route();
    } catch (err) { toast("File tidak valid: " + err.message, "error"); }
    e.target.value = "";
  };
}

MOD.ujian = { title: "Ujian Online (CBT)", desc: "Paket ujian dari bank soal + token. Siswa mengerjakan di cbt.html; impor file hasilnya ke nilai.", render: "renderUjian" };
