// ============================================================
// admin-media.js — Media Library (#/media)
//   • Upload gambar (JPG/PNG/WebP, maks 2 MB/file) + drag & drop + pratinjau sebelum simpan
//   • Kompres di browser (Canvas): lebar maks 1600px, WebP/JPEG kualitas 0.8
//   • Simpan ke repo lewat GitHub Contents API -> assets/uploads/<nama-unik>.webp  (pushBinary di app.js, token dari sessionStorage)
//   • Metadata -> data/media.json: { id, nama, file, url, ukuran, dipakai_di, tanggal_upload }
//   • Pemilih gambar (openMediaPicker) + widget isian gambar (imageFieldHTML/imageFieldBind) untuk form Slider & Kegiatan.
// Kolom gambar di slider.json / kegiatan.json TETAP berupa string URL; hanya cara mengisinya yang bertambah.
// ============================================================

const MEDIA_MAX_BYTES = 2 * 1024 * 1024;                       // 2 MB per file (sebelum kompres)
const MEDIA_TYPES = { "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WebP" };
const MEDIA_MAX_W = 1600, MEDIA_QUALITY = 0.8;
const mediaLocal = {};                                          // url -> blob: URL (pratinjau instan sebelum GitHub Pages selesai publish)
let mediaQueue = [];                                            // antrean upload halaman Media Library
let mediaQ = "", mediaFilter = "", mediaShown = PAGE_N;

const mediaSize = b => b >= 1048576 ? (b / 1048576).toFixed(2) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
const mediaSrc = url => mediaLocal[url] || url;
const mediaAbs = url => { try { return new URL(url, (window.SITE && SITE.root) || location.href).href; } catch (e) { return url; } };
async function mediaLoad() { try { const d = await fetchJSON("media.json"); return Array.isArray(d) ? d : []; } catch (e) { return []; } }

// ---------- Validasi ----------
function mediaCheck(file) {
  if (!MEDIA_TYPES[file.type]) return { ok: false, err: "\"" + file.name + "\" ditolak: format tidak didukung. Hanya JPG, PNG, atau WebP." };
  if (file.size > MEDIA_MAX_BYTES) return { ok: false, err: "\"" + file.name + "\" ditolak: ukuran " + mediaSize(file.size) + " melebihi batas 2 MB. Kecilkan gambar lalu coba lagi." };
  if (file.size === 0) return { ok: false, err: "\"" + file.name + "\" ditolak: berkas kosong." };
  return { ok: true };
}

// ---------- Kompres di browser ----------
async function mediaDecode(file) {
  if (window.createImageBitmap) { try { return await createImageBitmap(file); } catch (e) { /* jatuh ke <img> */ } }
  return await new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error("Gambar rusak / tidak dapat dibaca.")); }; im.src = u; });
}
async function mediaCompress(file) {
  const bmp = await mediaDecode(file);
  const sw = bmp.width, sh = bmp.height;
  let w = sw, h = sh; if (w > MEDIA_MAX_W) { h = Math.round(sh * MEDIA_MAX_W / sw); w = MEDIA_MAX_W; }
  const draw = flat => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); if (flat) { x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); } x.drawImage(bmp, 0, 0, w, h); return c; };
  const toBlob = (c, t) => new Promise(r => c.toBlob(r, t, MEDIA_QUALITY));
  let blob = await toBlob(draw(false), "image/webp"), ext = "webp";
  if (!blob || blob.type !== "image/webp") { blob = await toBlob(draw(true), "image/jpeg"); ext = "jpg"; }   // browser tanpa encoder WebP
  if (!blob) throw new Error("Gagal mengompres gambar.");
  // Berkas asli yang sudah kecil & tidak perlu diperkecil dipakai apa adanya bila hasil kompres justru lebih besar.
  if (blob.size >= file.size && w === sw && (file.type === "image/webp" || file.type === "image/jpeg")) { blob = file; ext = file.type === "image/webp" ? "webp" : "jpg"; }
  if (bmp.close) try { bmp.close(); } catch (e) { /* abaikan */ }
  return { blob, w, h, ext };
}
const mediaSlug = n => (String(n).replace(/\.[^.]+$/, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)) || "gambar";
const mediaUniqueName = (orig, ext) => mediaSlug(orig) + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) + "." + ext;
const blobToB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = () => rej(new Error("Gagal membaca berkas.")); r.readAsDataURL(blob); });

// Salinan dalam dari obj dengan URL upload yang belum terpublish diganti blob: lokal — dipakai pratinjau langsung (UI/Tampilan, Form Login).
function mediaPreviewCfg(obj) { return JSON.parse(JSON.stringify(obj, (k, v) => (typeof v === "string" && mediaLocal[v]) ? mediaLocal[v] : v)); }

// ---------- Pemakaian gambar (untuk peringatan hapus & dipakai_di) ----------
async function mediaUsageMap() {
  const map = {}; const add = (url, label) => { if (!url) return; (map[url] = map[url] || []).push(label); };
  const sl = await fetchJSON("slider.json").catch(() => null);
  if (sl && Array.isArray(sl.slides)) sl.slides.forEach(s => add(s.gambar, "Slider: " + (s.judul || s.id) + (s.halaman ? " (" + s.halaman + ")" : "")));
  const kg = await fetchJSON("kegiatan.json").catch(() => []);
  const kgBy = {}; (Array.isArray(kg) ? kg : []).forEach(k => { if (k.foto) (kgBy[k.foto] = kgBy[k.foto] || []).push(k.judul || k.id); });
  Object.keys(kgBy).forEach(u => add(u, "Kegiatan: " + kgBy[u][0] + (kgBy[u].length > 1 ? " +" + (kgBy[u].length - 1) + " lainnya" : "")));
  // Label pemakaian dibuat spesifik agar admin tahu persis di mana gambar dipakai.
  const nice = (lab, path, parent) => {
    if (path === "header.logoGambar") return lab + ": logo header";
    if (path === "body.seksi.profil.foto") return lab + ": foto profil (About Us)";
    if (/fasilitas\.items\[\d+\]\.foto$/.test(path)) return lab + ": foto fasilitas \u00ab" + ((parent && parent.nama) || "?") + "\u00bb";
    if (path === "gambar_latar") return lab + ": foto latar";
    return lab + ": " + path;
  };
  for (const [f, lab] of [["ui.json", "Tampilan"], ["login.json", "Form Login"], ["settings.json", "Pengaturan"], ["galeri.json", "Galeri"]]) {
    const d = await fetchJSON(f).catch(() => null); if (!d) continue;
    const walk = (v, path, parent) => {
      if (typeof v === "string") { if (v.indexOf(UPLOAD_DIR) === 0) add(v, nice(lab, path, parent)); }
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, path + "[" + i + "]", v[i]));
      else if (v && typeof v === "object") Object.keys(v).forEach(k => walk(v[k], path ? path + "." + k : k, v));
    };
    walk(d, "", null);
  }
  return map;
}

// ---------- Upload (berurutan; satu commit metadata di akhir) ----------
// items: [{ file, compressed:{blob,w,h,ext} }]. Mengembalikan array meta yang berhasil.
async function mediaUploadBatch(items) {
  const done = [], errs = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    showLoading("Mengunggah " + (i + 1) + "/" + items.length + ": " + it.file.name + "…");   // showLoading/hideLoading berpasangan per berkas (counter bertingkat)
    try {
      const c = it.compressed || await mediaCompress(it.file);
      const name = mediaUniqueName(it.file.name, c.ext);
      await pushBinary(UPLOAD_DIR + name, await blobToB64(c.blob), "Upload media: " + name);
      const url = UPLOAD_DIR + name; mediaLocal[url] = URL.createObjectURL(c.blob);
      done.push({ id: uid(), nama: it.file.name, file: name, url, ukuran: c.blob.size, dipakai_di: [], tanggal_upload: new Date().toISOString() });
    } catch (e) { errs.push(it.file.name + ": " + e.message); }
    finally { hideLoading(); }
  }
  if (done.length) {
    try {
      const list = await mediaLoad();
      const usage = await mediaUsageMap();
      const next = [...done, ...list].map(m => ({ ...m, dipakai_di: usage[m.url] || [] }));
      showLoading("Menyimpan metadata…");
      await saveData("media.json", next, "Media Library", "UPLOAD", done.map(d => d.file).join(", "));
      hideLoading();
    } catch (e) { hideLoading(); errs.push("Metadata media.json gagal disimpan: " + e.message); }
  }
  errs.forEach(m => toast(m, "error"));
  return done;
}

// ---------- Pemilih gambar (modal grid + search) ----------
async function openMediaPicker(onPick) {
  const old = document.getElementById("mpOv"); if (old) old.remove();
  const list = await mediaLoad();
  const ov = document.createElement("div"); ov.id = "mpOv"; ov.className = "fixed inset-0 z-[95] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3";
  ov.innerHTML = '<div role="dialog" aria-modal="true" aria-label="Pilih dari Media Library" class="w-full max-w-3xl max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">' +
    '<div class="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><i data-lucide="images" class="w-5 h-5"></i></div><div class="flex-1 min-w-0"><div class="font-extrabold text-slate-800">Pilih dari Media Library</div><div class="text-xs text-slate-500">Klik gambar untuk memakainya</div></div><button type="button" data-x class="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Tutup"><i data-lucide="x" class="w-5 h-5"></i></button></div>' +
    '<div class="px-5 py-3 border-b border-slate-100"><div class="relative"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input data-q placeholder="Cari nama gambar…" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"></div></div>' +
    '<div class="flex-1 overflow-y-auto p-4"><div data-grid></div><div data-more class="hidden text-center mt-3"><button type="button" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Muat 50 lagi</button></div></div></div>';
  document.body.appendChild(ov);
  let q = "", shown = PAGE_N;
  const close = () => { document.removeEventListener("keydown", kh, true); ov.remove(); };
  const kh = e => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
  document.addEventListener("keydown", kh, true);
  const grid = ov.querySelector("[data-grid]"), more = ov.querySelector("[data-more]");
  const paint = () => {
    const rows = list.filter(m => !q || (m.nama + " " + m.file).toLowerCase().includes(q));
    grid.innerHTML = rows.length
      ? '<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">' + rows.slice(0, shown).map(m =>
        '<button type="button" data-pick="' + esc(m.url) + '" title="' + esc(m.nama) + '" class="group text-left rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-200 transition bg-white"><div class="aspect-[4/3] bg-slate-100 relative overflow-hidden"><div class="absolute inset-0 flex items-center justify-center text-slate-300"><i data-lucide="image" class="w-6 h-6"></i></div><img src="' + esc(mediaSrc(m.url)) + '" loading="lazy" alt="" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display=\'none\'"></div><div class="px-2 py-1.5"><div class="text-[11px] font-semibold text-slate-700 truncate">' + esc(m.nama) + '</div><div class="text-[10px] text-slate-400">' + mediaSize(m.ukuran) + "</div></div></button>").join("") + "</div>"
      : emptyState({ icon: q ? "search-x" : "images", title: q ? "Tidak ada hasil" : "Media Library masih kosong", hint: q ? "Tidak ada gambar yang cocok dengan pencarian." : "Unggah gambar lebih dulu lewat menu Media Library, atau langsung dari kolom gambar di form." });
    more.classList.toggle("hidden", rows.length <= shown);
    refreshIcons();
  };
  let t = 0; ov.querySelector("[data-q]").oninput = e => { clearTimeout(t); t = setTimeout(() => { q = e.target.value.toLowerCase(); shown = PAGE_N; paint(); }, 150); };
  more.querySelector("button").onclick = () => { shown += PAGE_N; paint(); };
  ov.addEventListener("click", e => {
    if (e.target === ov || e.target.closest("[data-x]")) return close();
    const b = e.target.closest("[data-pick]"); if (b) { const u = b.dataset.pick; close(); onPick(u); }
  });
  paint(); refreshIcons();
  const qi = ov.querySelector("[data-q]"); if (qi) qi.focus();
}

// ---------- Widget isian gambar (dipakai form Slider & Kegiatan) ----------
// Menjaga SATU <input name="..."> berisi string URL (struktur data tidak berubah). Tab 1: Upload / Pilih dari Library; Tab 2: Tempel Link URL.
// opts.attrs  : atribut mentah untuk <input> URL (mis. 'data-ui="header.logoGambar"'); default name="<name>".
// opts.compact: tampilan ringkas untuk panel kontrol sempit (UI/Tampilan, Form Login).
function imageFieldHTML(name, value, label, opts) {
  opts = opts || {};
  const v = value || "", isUrl = /^https?:\/\//i.test(v), pad = opts.compact ? "p-2.5" : "p-4";
  const attrs = opts.attrs || ('name="' + esc(name) + '"');
  return '<div data-imgf class="block"><div class="flex items-center justify-between gap-2">' + lbl(label) +
    '<div class="inline-flex p-0.5 rounded-lg bg-slate-100 text-[11px] font-bold"><button type="button" data-tab="lib" class="px-2.5 py-1 rounded-md ' + (isUrl ? "text-slate-500" : "bg-white shadow text-emerald-700") + '">Upload / Library</button><button type="button" data-tab="url" class="px-2.5 py-1 rounded-md ' + (isUrl ? "bg-white shadow text-emerald-700" : "text-slate-500") + '">Tempel Link URL</button></div></div>' +
    '<div data-pane="lib" class="mt-2 ' + (isUrl ? "hidden" : "") + '"><div data-drop tabindex="0" role="button" class="border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-xl ' + pad + ' text-center cursor-pointer transition"><i data-lucide="upload-cloud" class="' + (opts.compact ? "w-5 h-5" : "w-6 h-6") + ' mx-auto text-slate-400"></i><div class="' + (opts.compact ? "text-xs" : "text-sm") + ' font-semibold text-slate-600 mt-1">Tarik gambar ke sini atau klik untuk upload</div><div class="text-[11px] text-slate-400">JPG, PNG, WebP · maks 2 MB · dikompres otomatis</div></div>' +
    '<input type="file" accept="image/*" class="hidden" data-file>' +
    '<button type="button" data-pick class="mt-2 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"><i data-lucide="images" class="w-4 h-4"></i>Pilih dari Media Library</button></div>' +
    '<div data-pane="url" class="mt-2 ' + (isUrl ? "" : "hidden") + '"><input ' + attrs + ' data-imgin value="' + esc(v) + '" placeholder="https://…" ' + inp + "></div>" +
    '<div data-prev class="mt-2 flex items-center gap-3 ' + (v ? "" : "hidden") + '"><div class="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative"><img data-thumb alt="" class="w-full h-full object-cover" onerror="this.style.visibility=\'hidden\'"></div><div class="min-w-0 text-[11px] text-slate-500"><div data-curname class="font-semibold text-slate-700 truncate"></div><button type="button" data-clear class="text-red-600 hover:underline font-bold">Hapus gambar</button></div></div></div>';
}
function imageFieldBind(root, name) {
  (root || document).querySelectorAll("[data-imgf]").forEach(w => {
    if (w.dataset.bound) return; w.dataset.bound = "1";
    const input = w.querySelector("[data-imgin]"), file = w.querySelector("[data-file]"), thumb = w.querySelector("[data-thumb]"), prev = w.querySelector("[data-prev]"), curname = w.querySelector("[data-curname]");
    const refresh = () => {
      const v = input.value.trim(); prev.classList.toggle("hidden", !v);
      if (v) { thumb.style.visibility = ""; thumb.src = mediaSrc(v); curname.textContent = v.replace(/^.*\//, "").slice(0, 60); }
    };
    const setValue = v => { input.value = v; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); refresh(); };
    const tab = t => { w.querySelectorAll("[data-pane]").forEach(p => p.classList.toggle("hidden", p.dataset.pane !== t));
      w.querySelectorAll("[data-tab]").forEach(b => { const on = b.dataset.tab === t; b.classList.toggle("bg-white", on); b.classList.toggle("shadow", on); b.classList.toggle("text-emerald-700", on); b.classList.toggle("text-slate-500", !on); }); };
    w.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => tab(b.dataset.tab)));
    const handle = async files => {
      const f = files && files[0]; if (!f) return;
      if (files.length > 1) toast("Kolom ini hanya menerima 1 gambar. Hanya \"" + f.name + "\" yang diproses.", "info");
      const chk = mediaCheck(f); if (!chk.ok) return toast(chk.err, "error");
      try {
        let c; showLoading("Mengompres gambar…");
        try { c = await mediaCompress(f); } finally { hideLoading(); }
        const res = await mediaUploadBatch([{ file: f, compressed: c }]);
        if (res.length) { setValue(res[0].url); toast("Gambar diunggah ke Media Library (" + mediaSize(res[0].ukuran) + ").", "success"); }
      } catch (e) { toast(e.message, "error"); }
    };
    const drop = w.querySelector("[data-drop]");
    drop.addEventListener("click", () => file.click());
    drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } });
    ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("border-emerald-500", "bg-emerald-50"); }));
    ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("border-emerald-500", "bg-emerald-50"); }));
    drop.addEventListener("drop", e => handle(e.dataTransfer && e.dataTransfer.files));
    file.addEventListener("change", () => { handle(file.files); file.value = ""; });
    w.querySelector("[data-pick]").addEventListener("click", () => openMediaPicker(u => { setValue(u); toast("Gambar dipilih dari Media Library.", "success"); }));
    w.querySelector("[data-clear]").addEventListener("click", () => setValue(""));
    input.addEventListener("input", refresh);
    refresh();
  });
}

// ---------- Halaman Media Library ----------
async function renderMedia() {
  const [list, usage] = await Promise.all([mediaLoad(), mediaUsageMap()]);
  mediaQ = ""; mediaFilter = ""; mediaShown = PAGE_N;
  const paintQueue = () => {
    const host = document.getElementById("mdQueue"); if (!host) return;
    if (!mediaQueue.length) { host.innerHTML = ""; return; }
    const okN = mediaQueue.filter(x => x.ok).length;
    host.innerHTML = '<div class="mt-4 border border-slate-200 rounded-xl overflow-hidden"><div class="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-600">Pratinjau sebelum disimpan (' + mediaQueue.length + " file)</div>" +
      '<div class="divide-y divide-slate-100">' + mediaQueue.map((x, i) =>
        '<div class="flex items-center gap-3 px-4 py-2.5"><div class="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">' + (x.preview ? '<img src="' + x.preview + '" class="w-full h-full object-cover" alt="">' : "") + '</div>' +
        '<div class="min-w-0 flex-1"><div class="text-sm font-semibold text-slate-700 truncate">' + esc(x.file.name) + '</div><div class="text-[11px] ' + (x.ok ? "text-slate-500" : "text-red-600 font-semibold") + '">' + (x.ok ? mediaSize(x.file.size) + " → " + mediaSize(x.c.blob.size) + " · " + x.c.w + "×" + x.c.h + " · " + x.c.ext.toUpperCase() : esc(x.err)) + '</div></div>' +
        '<button type="button" data-qrm="' + i + '" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Buang dari antrean"><i data-lucide="x" class="w-4 h-4 pointer-events-none"></i></button></div>').join("") + "</div>" +
      '<div class="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-2"><button type="button" id="mdUpload" ' + btnP + (okN ? "" : " disabled") + '><i data-lucide="upload" class="w-4 h-4"></i>Upload ' + okN + ' gambar</button><button type="button" id="mdClear" ' + btnS + ">Bersihkan antrean</button></div></div>";
    refreshIcons();
  };
  const addFiles = async files => {
    for (const f of [...files]) {
      const chk = mediaCheck(f);
      if (!chk.ok) { toast(chk.err, "error"); mediaQueue.push({ file: f, ok: false, err: chk.err.replace(/^"[^"]*" ditolak: /, "Ditolak: ") }); continue; }
      try { const c = await mediaCompress(f); mediaQueue.push({ file: f, ok: true, c, preview: URL.createObjectURL(c.blob) }); }
      catch (e) { toast("\"" + f.name + "\": " + e.message, "error"); mediaQueue.push({ file: f, ok: false, err: e.message }); }
    }
    paintQueue();
  };
  const cardHTML = m => {
    const u = usage[m.url] || [];
    return '<div class="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col" data-card="' + esc(m.id) + '"><div class="aspect-[4/3] bg-slate-100 relative overflow-hidden"><div class="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-[10px]"><i data-lucide="image" class="w-6 h-6"></i></div><img src="' + esc(mediaSrc(m.url)) + '" loading="lazy" alt="' + esc(m.nama) + '" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display=\'none\'">' +
      (u.length ? '<span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">Dipakai ' + u.length + "</span>" : "") + '</div>' +
      '<div class="p-2.5 flex-1"><div class="text-xs font-bold text-slate-700 truncate" title="' + esc(m.nama) + '">' + esc(m.nama) + '</div><div class="text-[11px] text-slate-400">' + mediaSize(m.ukuran) + " · " + esc(fmtTgl ? fmtTgl(String(m.tanggal_upload).slice(0, 10)) : String(m.tanggal_upload).slice(0, 10)) + '</div></div>' +
      '<div class="px-2.5 pb-2.5 flex gap-1.5"><button type="button" data-copy="' + esc(m.id) + '" class="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"><i data-lucide="copy" class="w-3.5 h-3.5 pointer-events-none"></i>Copy URL</button><button type="button" data-del="' + esc(m.id) + '" class="inline-flex items-center justify-center text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5 pointer-events-none"></i></button></div></div>';
  };
  let data = list;
  const paintGrid = () => {
    const rows = data.filter(m => (!mediaQ || (m.nama + " " + m.file).toLowerCase().includes(mediaQ)) && (!mediaFilter || (mediaFilter === "used" ? (usage[m.url] || []).length : !(usage[m.url] || []).length)));
    const host = document.getElementById("mdGrid");
    host.innerHTML = rows.length
      ? '<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">' + rows.slice(0, mediaShown).map(cardHTML).join("") + "</div>"
      : emptyState(data.length ? { icon: "search-x", title: "Tidak ada hasil", hint: "Tidak ada gambar yang cocok dengan pencarian/filter." } : { icon: "images", title: "Media Library masih kosong", hint: "Unggah gambar pertama Anda lewat kotak di atas." });
    document.getElementById("mdInfo").textContent = Math.min(mediaShown, rows.length) + " dari " + rows.length + " gambar";
    document.getElementById("mdMore").classList.toggle("hidden", rows.length <= mediaShown);
    refreshIcons();
  };
  app.innerHTML = pageHead(MOD.media) +
    card('<div id="mdDrop" tabindex="0" role="button" class="border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-2xl p-8 text-center cursor-pointer transition"><div class="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><i data-lucide="upload-cloud" class="w-6 h-6"></i></div><div class="font-bold text-slate-700 mt-3">Tarik gambar ke sini atau klik untuk memilih</div><div class="text-xs text-slate-400 mt-1">JPG, PNG, WebP · maks 2 MB per file · bisa banyak sekaligus · otomatis dikompres (lebar maks 1600px, kualitas 80%)</div></div>' +
      '<input type="file" id="mdFile" accept="image/*" multiple class="hidden"><div id="mdQueue"></div>') +
    '<div class="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200"><div class="p-4 flex flex-wrap gap-2 items-center border-b border-slate-100">' +
      '<div class="relative flex-1 min-w-[200px]"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i><input id="mdQ" placeholder="Cari nama gambar…" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"></div>' +
      '<select id="mdF" class="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Semua gambar</option><option value="used">Sedang dipakai</option><option value="free">Belum dipakai</option></select>' +
      '<button type="button" id="mdAdd" ' + btnP + '><i data-lucide="plus" class="w-4 h-4"></i>Upload Gambar</button></div>' +
      '<div class="p-4"><div id="mdGrid"></div></div>' +
      '<div class="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1"><span id="mdInfo"></span><button type="button" id="mdMore" class="hidden px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">Muat 50 lagi</button></div></div>';
  const fileIn = document.getElementById("mdFile"), drop = document.getElementById("mdDrop");
  drop.onclick = () => fileIn.click();
  drop.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileIn.click(); } };
  document.getElementById("mdAdd").onclick = () => fileIn.click();
  fileIn.onchange = () => { addFiles(fileIn.files); fileIn.value = ""; };
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("border-emerald-500", "bg-emerald-50"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("border-emerald-500", "bg-emerald-50"); }));
  drop.addEventListener("drop", e => addFiles(e.dataTransfer.files));
  let t = 0; document.getElementById("mdQ").oninput = e => { clearTimeout(t); t = setTimeout(() => { mediaQ = e.target.value.toLowerCase(); mediaShown = PAGE_N; paintGrid(); }, 150); };
  document.getElementById("mdF").onchange = e => { mediaFilter = e.target.value; mediaShown = PAGE_N; paintGrid(); };
  document.getElementById("mdMore").onclick = () => { mediaShown += PAGE_N; paintGrid(); };
  app.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.id === "mdClear") { mediaQueue.forEach(x => x.preview && URL.revokeObjectURL(x.preview)); mediaQueue = []; paintQueue(); }
    else if (b.dataset.qrm !== undefined) { const x = mediaQueue.splice(+b.dataset.qrm, 1)[0]; if (x && x.preview) URL.revokeObjectURL(x.preview); paintQueue(); }
    else if (b.id === "mdUpload") {
      const items = mediaQueue.filter(x => x.ok).map(x => ({ file: x.file, compressed: x.c }));
      if (!items.length) return;
      const res = await mediaUploadBatch(items);
      if (res.length) { toast(res.length + " gambar berhasil diunggah.", "success"); mediaQueue = mediaQueue.filter(x => !x.ok); route(); }
    } else if (b.dataset.copy) {
      const m = data.find(x => x.id === b.dataset.copy); if (!m) return;
      const abs = mediaAbs(m.url);
      try { await navigator.clipboard.writeText(abs); } catch (err) { const ta = document.createElement("textarea"); ta.value = abs; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e2) { /* abaikan */ } ta.remove(); }
      toast("URL disalin: " + abs, "success");
    } else if (b.dataset.del) {
      const m = data.find(x => x.id === b.dataset.del); if (!m) return;
      const used = usage[m.url] || [];
      const warn = used.length ? '<div class="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"><b>Peringatan: gambar ini masih dipakai di ' + used.length + ' tempat.</b> Bila dihapus, gambar di halaman tersebut akan bolong.<ul class="list-disc pl-4 mt-1.5 space-y-0.5">' + used.slice(0, 6).map(x => "<li>" + esc(x) + "</li>").join("") + (used.length > 6 ? "<li>… dan " + (used.length - 6) + " lainnya</li>" : "") + "</ul></div>" : "";
      if (!(await confirmBox({ title: used.length ? "Hapus gambar yang masih dipakai?" : "Hapus gambar", message: "Hapus \"" + m.nama + "\" dari Media Library dan repo? Tindakan ini tidak dapat dibatalkan dari sini.", html: warn, danger: true, okLabel: used.length ? "Tetap hapus" : "Hapus" }))) return;
      try {
        showLoading("Menghapus gambar…");
        await deleteRepoFile(m.url, "Hapus media: " + m.file);
        const next = (await mediaLoad()).filter(x => x.id !== m.id);
        const u2 = await mediaUsageMap();
        await saveData("media.json", next.map(x => ({ ...x, dipakai_di: u2[x.url] || [] })), "Media Library", "HAPUS", m.file);
        delete mediaLocal[m.url]; hideLoading(); toast("Gambar dihapus.", "success"); route();
      } catch (err) { hideLoading(); toast(err.message, "error"); }
    }
  };
  paintGrid(); paintQueue();
}

MOD.media = { title: "Media Library", desc: "Unggah, kelola, dan pilih gambar untuk Slider & Kegiatan. Gambar dikompres otomatis dan disimpan di repo (assets/uploads/); tersedia setelah GitHub Pages selesai publish (±1 menit).", render: "renderMedia" };
