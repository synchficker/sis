// ============================================================
// admin-ppdb.js — PPDB Online: impor, terima, tolak (#/ppdb).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

F.ppdb = [
    { k: "nomor_daftar", l: "No. Pendaftaran", req: false },
    { k: "tanggal_daftar", l: "Tanggal Daftar", t: "date", def: today() },
    { k: "nama", l: "Nama Calon Siswa", req: true }, { k: "nisn", l: "NISN" },
    { k: "jk", l: "Jenis Kelamin", t: "select", opts: ["L", "P"] },
    { k: "tempat_lahir", l: "Tempat Lahir" }, { k: "tanggal_lahir", l: "Tanggal Lahir", t: "date" },
    { k: "agama", l: "Agama", t: "select", opts: ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"], req: false },
    { k: "asal_sekolah", l: "Asal Sekolah" }, { k: "nama_ortu", l: "Nama Orang Tua/Wali" },
    { k: "no_hp", l: "No. HP (WA)", t: "tel" },
    { k: "pilihan_kelas", l: "Pilihan Kelas", t: "select", optsFn: optKelas, req: false },
    { k: "status", l: "Status", t: "select", opts: ["Menunggu", "Diterima", "Ditolak"], def: "Menunggu" },
    { k: "alamat", l: "Alamat", t: "textarea", full: true }
  ];

async function imporPPDB(e) {
  const f = e.target.files[0]; if (!f) return;
  try {
    let obj = JSON.parse(await f.text());
    if (!Array.isArray(obj)) obj = [obj];
    const arr = await fetchJSON("ppdb.json");
    let n = 0;
    for (const o of obj) {
      if (!o.nama) continue;
      arr.unshift({ status: "Menunggu", tanggal_daftar: today(), ...o, id: uid(), nomor_daftar: o.nomor_daftar || ("PPDB-" + new Date().getFullYear() + "-" + String(arr.length + 1).padStart(4, "0")) });
      n++;
    }
    if (await saveData("ppdb.json", arr, "PPDB", "IMPOR PENDAFTAR", n + " berkas dari " + f.name)) route();
  } catch (err) { toast("File JSON tidak valid: " + err.message, "error"); }
  e.target.value = "";
}
async function terimaPPDB(r) {
  if (r.status === "Diterima") return toast("Pendaftar sudah diterima.", "info");
  if (!confirm("Terima " + r.nama + " dan buat data siswa baru otomatis?")) return;
  const siswa = await fetchJSON("siswa.json");
  const th = String(new Date().getFullYear());
  let seq = siswa.length + 1, nis;
  do { nis = th + String(seq++).padStart(3, "0"); } while (siswa.some(s => s.nis === nis));
  siswa.unshift({ id: uid(), nis, nisn: r.nisn || "", nama: r.nama, jk: r.jk || "", tempat_lahir: r.tempat_lahir || "", tanggal_lahir: r.tanggal_lahir || "", agama: r.agama || "Islam", kelas: r.pilihan_kelas || "", nama_ayah: r.nama_ortu || "", nama_ibu: "", no_hp_ortu: r.no_hp || "", alamat: r.alamat || "", status: "Aktif", tanggal_masuk: today() });
  if (!await saveData("siswa.json", siswa, "PPDB", "TERIMA PPDB", r.nama + " → NIS " + nis)) return;
  const ppdb = await fetchJSON("ppdb.json");
  const row = ppdb.find(x => x.id === r.id); row.status = "Diterima"; row.nis_baru = nis;
  await saveData("ppdb.json", ppdb, "PPDB", "STATUS PPDB", r.nama + " Diterima");
  route();
}
async function tolakPPDB(r) {
  if (!confirm("Tolak pendaftar " + r.nama + "?")) return;
  const ppdb = await fetchJSON("ppdb.json");
  ppdb.find(x => x.id === r.id).status = "Ditolak";
  if (await saveData("ppdb.json", ppdb, "PPDB", "STATUS PPDB", r.nama + " Ditolak")) route();
}

MOD.ppdb = {
    title: "PPDB Online", desc: "Impor berkas JSON dari halaman ppdb.html, lalu Terima untuk otomatis membuat data siswa + NIS baru.", file: "ppdb.json", fields: F.ppdb,
    cols: ["nomor_daftar", "nama", "asal_sekolah", "pilihan_kelas", "no_hp", "status"],
    toolbar: '<label class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"><i data-lucide="upload" class="w-4 h-4"></i>Impor JSON<input id="impPPDB" type="file" accept=".json" class="hidden"></label>',
    onToolbar: () => { document.getElementById("impPPDB").onchange = imporPPDB; },
    rowActions: [
      { icon: "check", title: "Terima → jadikan siswa", cls: "text-emerald-600", fn: terimaPPDB },
      { icon: "x", title: "Tolak", cls: "text-rose-500", fn: tolakPPDB }
    ]
  };
