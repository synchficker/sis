// ============================================================
// admin-ui.js — CMS "Antarmuka Halaman Muka" (data/ui.json)
// Header • Body • Footer • Tema • FAB, dengan pratinjau langsung
// iframe index.html yang menerapkan draf via postMessage.
// ============================================================
(() => {
"use strict";
const el = id => document.getElementById(id);
const U = window.LSUI;
const BP = 'class="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg"';
const BS = 'class="inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-sm font-bold px-4 py-2 rounded-lg"';
const INP = (typeof inp !== "undefined") ? inp : 'class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"';
const PKEY = "ui_presets";
let C = U ? U.norm({}) : {}, device = "desktop", undoT = null, ready = false, focusSec = "";

const presets = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || []; } catch (e) { return []; } };
const setPresets = v => localStorage.setItem(PKEY, JSON.stringify(v));
const get = p => p.split(".").reduce((o, k) => (o == null ? o : o[k]), C);
const set = (p, v) => { const k = p.split("."); let o = C; for (let i = 0; i < k.length - 1; i++) { if (o[k[i]] == null) o[k[i]] = {}; o = o[k[i]]; } o[k[k.length - 1]] = v; };
const opt = a => a.map(x => Array.isArray(x) ? x : [x, x]);

const S = [
  ["Tema","tema.preset","sel","Palet dasar","palette",opt(Object.keys(U.THEMES).map(k=>[k,U.THEMES[k].label]))],
  ["Tema","tema.primary","color","Warna dominan","pipette"],
  ["Tema","tema.accent","color","Aksen hangat","pipette"],
  ["Tema","tema.accent2","color","Aksen sejuk","pipette"],
  ["Tema","tema.success","color","Semantik sukses","circle-check"],
  ["Tema","tema.warning","color","Semantik peringatan","triangle-alert"],
  ["Tema","tema.danger","color","Semantik bahaya","octagon-alert"],
  ["Tema","tema.info","color","Semantik informasi","info"],
  ["Tema","tema.ink","color","Tinta / teks","type"],
  ["Tema","tema.surface","color","Permukaan","square"],
  ["Tema","tema.muted","color","Teks sekunder","align-left"],
  ["Tema","tema.line","color","Garis & batas","minus"],
  ["Tema","tema.track","color","Track scrollbar","scroll-text"],
  ["Tema","tema.fontDisplay","sel","Font judul","heading",opt(U.FONTS)],
  ["Tema","tema.fontBody","sel","Font isi","text",opt(U.FONTS)],
  ["Tema","tema.radius","range","Lengkung sudut","squircle",0,40,1,v=>v+"px"],
  ["Tema","tema.skala","range","Skala antarmuka","scaling",0.85,1.2,0.01,v=>Math.round(v*100)+"%"],
  ["Tema","tema.lebar","range","Lebar konten","move-horizontal",960,1680,20,v=>v+"px"],
  ["Tema","tema.ritme","range","Jarak antar seksi","rows-3",24,140,4,v=>v+"px"],
  ["Tema","tema.latar","sel","Latar halaman","image",opt([["mesh","Mesh gradient"],["grid","Grid teknis"],["polos","Polos"]])],
  ["Tema","tema.aurora","tog","Cahaya aurora","sun"],
  ["Tema","tema.auroraSpeed","range","Kecepatan aurora","gauge",6,90,1,v=>v+"s"],
  ["Tema","tema.blur","range","Blur cahaya","droplet",0,60,1,v=>v+"px"],
  ["Tema","tema.grain","tog","Tekstur grain","grip"],
  ["Tema","tema.grainInt","range","Intensitas grain","sliders-horizontal",0,20,1,v=>v+"%"],
  ["Tema","tema.scrollbar","sel","Scrollbar","scroll-text",opt([["palet","Warna palet"],["netral","Netral"]])],
  ["Tema","tema.animasi","tog","Animasi global","sparkles"],
  ["Tema","tema.reveal","tog","Reveal saat digulir","eye"],

  ["Header","header.aktif","tog","Tampilkan header","panel-top"],
  ["Header","header.sticky","tog","Melekat saat digulir","pin"],
  ["Header","header.tinggi","range","Tinggi header","move-vertical",56,110,1,v=>v+"px"],
  ["Header","header.lebar","range","Lebar header","move-horizontal",960,1680,20,v=>v+"px"],
  ["Header","header.blur","range","Blur kaca","droplet",0,30,1,v=>v+"px"],
  ["Header","header.transparan","range","Opasitas latar","contrast",40,100,1,v=>v+"%"],
  ["Header","header.border","tog","Garis bawah","minus"],
  ["Header","header.bayangan","tog","Bayangan saat digulir","cloud"],
  ["Header","header.logoIkon","sel","Ikon logo","shapes",opt(["school","graduation-cap","shield-check","book-open","building-2","sparkles","landmark","atom"])],
  ["Header","header.logoGambar","txt","URL gambar logo (opsional)","link"],
  ["Header","header.logoBentuk","sel","Bentuk logo","square",opt([["kotak","Kotak"],["bulat","Bulat"],["bebas","Tanpa bingkai"]])],
  ["Header","header.logoUkuran","range","Ukuran logo","scaling",28,56,1,v=>v+"px"],
  ["Header","header.tampilkanNama","tog","Tampilkan nama sekolah","type"],
  ["Header","header.tampilkanNpsn","tog","Tampilkan NPSN / sub","hash"],
  ["Header","header.namaOverride","txt","Nama override","pencil"],
  ["Header","header.subOverride","txt","Sub override","pencil"],
  ["Header","header.navGaya","sel","Gaya nav aktif","underline",opt([["garis","Garis bawah"],["pil","Pil latar"],["tanpa","Tanpa penanda"]])],
  ["Header","header.scrollspy","tog","Sorot seksi aktif","crosshair"],
  ["Header","header.sembunyiSaatTurun","tog","Sembunyi saat turun","arrow-down"],
  ["Header","header.menuAnimasi","tog","Animasi menu mobile","menu"],
  ["Header","header.topbarAktif","tog","Bar pengumuman","megaphone"],
  ["Header","header.topbarTeks","txt","Teks pengumuman","text"],
  ["Header","header.topbarLabel","txt","Label tautan","tag"],
  ["Header","header.topbarHref","txt","Tujuan tautan","link"],
  ["Header","header.topbarWarna","sel","Warna bar","paintbrush",opt([["amber","Aksen"],["primary","Dominan"],["gelap","Gelap"]])],
  ["Header","header.topbarTinggi","range","Tinggi bar","move-vertical",26,52,1,v=>v+"px"],
  ["Header","header.ctaAktif","tog","Tombol utama","mouse-pointer-click"],
  ["Header","header.ctaLabel","txt","Label tombol utama","type"],
  ["Header","header.ctaHref","txt","Tujuan tombol utama","link"],
  ["Header","header.ctaIkon","sel","Ikon tombol","shapes",opt(["user-plus","arrow-right","log-in","sparkles","send"])],
  ["Header","header.ctaWarna","sel","Warna tombol","paintbrush",opt([["amber","Aksen"],["primary","Dominan"],["gelap","Gelap"]])],
  ["Header","header.cta2Aktif","tog","Tombol sekunder","link"],
  ["Header","header.cta2Label","txt","Label tombol sekunder","type"],
  ["Header","header.cta2Href","txt","Tujuan tombol sekunder","link"],

  ["Body","body.progresBaca","tog","Bar progres baca","activity"],
  ["Body","body.keAtas","tog","Tombol ke atas","arrow-up"],
  ["Body","body.seksi.beranda.aktif","tog","Seksi Hero Slider","gallery-horizontal-end"],
  ["Body","body.seksi.statistik.aktif","tog","Seksi Statistik","chart-column"],
  ["Body","body.seksi.statistik.overlap","tog","Kartu menumpang hero","layers"],
  ["Body","body.seksi.statistik.animasiAngka","tog","Animasi angka","hash"],
  ["Body","body.seksi.statistik.kolom","range","Kolom statistik","columns-3",2,4,1,v=>v+" kolom"],
  ["Body","body.seksi.berita.aktif","tog","Seksi Berita","newspaper"],
  ["Body","body.seksi.berita.latar","sel","Latar berita","paintbrush",opt(U.BGVAR)],
  ["Body","body.seksi.berita.judul","txt","Judul berita","heading"],
  ["Body","body.seksi.berita.sub","area","Subjudul berita","align-left"],
  ["Body","body.seksi.berita.jumlah","range","Jumlah kartu berita","hash",1,12,1,v=>v+" kartu"],
  ["Body","body.seksi.berita.kolom","range","Kolom berita","columns-3",2,4,1,v=>v+" kolom"],
  ["Body","body.seksi.berita.tautanLabel","txt","Label tautan berita","tag"],
  ["Body","body.seksi.berita.tautanHref","txt","Tujuan tautan berita","link"],
  ["Body","body.seksi.profil.aktif","tog","Seksi Profil","school"],
  ["Body","body.seksi.profil.latar","sel","Latar profil","paintbrush",opt(U.BGVAR)],
  ["Body","body.seksi.profil.eyebrow","txt","Eyebrow profil","badge"],
  ["Body","body.seksi.profil.judul","txt","Judul profil","heading"],
  ["Body","body.seksi.profil.foto","txt","URL foto profil","image"],
  ["Body","body.seksi.profil.kepsekKartu","tog","Kartu Founder / Kepala Sekolah","id-card"],
  ["Body","body.seksi.profil.brosurAktif","tog","Tombol e-brochure","download"],
  ["Body","body.seksi.profil.brosurLabel","txt","Label e-brochure","tag"],
  ["Body","body.seksi.profil.brosurIkon","sel","Ikon Lucide tombol e-brochure","shapes",opt(["download","file-down","file-text","book-open","arrow-down-to-line","send","sparkles","mail"])],
  ["Body","body.seksi.profil.sosialLabel","txt","Label sosial","users"],
  ["Body","body.seksi.program.aktif","tog","Seksi Program","layout-grid"],
  ["Body","body.seksi.program.latar","sel","Latar program","paintbrush",opt(U.BGVAR)],
  ["Body","body.seksi.program.eyebrow","txt","Eyebrow program","badge"],
  ["Body","body.seksi.program.judul","txt","Judul program","heading"],
  ["Body","body.seksi.program.sub","area","Subjudul program","align-left"],
  ["Body","body.seksi.program.kolom","range","Kolom program","columns-3",2,4,1,v=>v+" kolom"],
  ["Body","body.seksi.program.tandaiJenjang","tog","Tandai jenjang sekolah","star"],
  ["Body","body.seksi.program.detailLabel","txt","Label tombol detail","tag"],
  ["Body","body.seksi.kegiatan.aktif","tog","Seksi Galeri Kegiatan","images"],
  ["Body","body.seksi.kegiatan.latar","sel","Latar galeri","paintbrush",opt(U.BGVAR)],
  ["Body","body.seksi.kegiatan.eyebrow","txt","Eyebrow galeri","badge"],
  ["Body","body.seksi.akademik.aktif","tog","Seksi Agenda","calendar-days"],
  ["Body","body.seksi.akademik.latar","sel","Latar agenda","paintbrush",opt(U.BGVAR)],
  ["Body","body.seksi.akademik.eyebrow","txt","Eyebrow agenda","badge"],
  ["Body","body.seksi.akademik.judul","txt","Judul agenda","heading"],
  ["Body","body.seksi.akademik.jumlah","range","Jumlah agenda","hash",2,12,1,v=>v+" baris"],
  ["Body","body.seksi.akademik.tautanLabel","txt","Label tautan agenda","tag"],
  ["Body","body.seksi.akademik.tautanHref","txt","Tujuan tautan agenda","link"],
  ["Body","body.seksi.akademik.kalenderTautan","tog","Tautan kalender penuh","calendar"],
  ["Body","body.seksi.fasilitas.aktif","tog","Seksi Fasilitas","building-2"],
  ["Body","body.seksi.fasilitas.latar","sel","Latar fasilitas","paintbrush",opt(U.BGVAR)],
  ["Body","body.seksi.fasilitas.eyebrow","txt","Eyebrow fasilitas","badge"],
  ["Body","body.seksi.fasilitas.judul","txt","Judul fasilitas","heading"],
  ["Body","body.seksi.fasilitas.kolom","range","Kolom fasilitas","columns-3",2,4,1,v=>v+" kolom"],
  ["Body","body.seksi.fasilitas.turAktif","tog","Tombol virtual tour","play-circle"],
  ["Body","body.seksi.fasilitas.turLabel","txt","Label virtual tour","tag"],
  ["Body","body.seksi.fasilitas.turVideo","txt","URL video tour","video"],
  ["Body","body.seksi.kontak.aktif","tog","Seksi Kontak","map-pin"],
  ["Body","body.seksi.kontak.latar","sel","Latar kontak","paintbrush",opt(U.BGVAR)],
  ["Body","body.seksi.kontak.eyebrow","txt","Eyebrow kontak","badge"],
  ["Body","body.seksi.kontak.judul","txt","Judul kontak","heading"],
  ["Body","body.seksi.kontak.petaAktif","tog","Tampilkan peta","map"],
  ["Body","body.seksi.kontak.petaZoom","range","Zoom peta","zoom-in",10,20,1,v=>"z"+v],
  ["Body","body.seksi.kontak.petaTinggi","range","Tinggi peta","move-vertical",220,560,10,v=>v+"px"],
  ["Body","body.seksi.kontak.jamJudul","txt","Judul jam layanan","clock"],
  ["Body","body.seksi.kontak.jamTeks","area","Teks jam layanan","align-left"],

  ["Footer","footer.aktif","tog","Tampilkan footer","panel-bottom"],
  ["Footer","footer.latar","color","Latar footer","paintbrush"],
  ["Footer","footer.teks","color","Warna teks","type"],
  ["Footer","footer.garis","color","Warna garis","minus"],
  ["Footer","footer.kolom","range","Jumlah kolom","columns-3",2,6,1,v=>v+" kolom"],
  ["Footer","footer.brandAktif","tog","Blok brand","school"],
  ["Footer","footer.brandLogo","tog","Logo di footer","shapes"],
  ["Footer","footer.brandTeks","area","Teks tambahan brand","align-left"],
  ["Footer","footer.copyright","txt","Teks copyright ({sekolah})","copyright"],
  ["Footer","footer.catatan","txt","Catatan kanan","info"],
  ["Footer","footer.gateAktif","tog","Gerbang admin (gembok)","lock"],
  ["Footer","footer.gateOpasitas","range","Opasitas gembok","contrast",0,100,5,v=>v+"%"],
  ["Footer","footer.gatePosisi","sel","Posisi gembok","move-horizontal",opt([["kiri","Kiri"],["tengah","Tengah"],["kanan","Kanan"]])],
  ["Footer","footer.gateHref","txt","Tujuan gembok","link"],
  ["Footer","footer.gateLabel","txt","Tooltip gembok","tag"],

  ["FAB","fab.waAktif","tog","Tombol WhatsApp mengambang","message-circle"],
  ["FAB","fab.waPosisi","sel","Posisi","move",opt([["kanan-bawah","Kanan bawah"],["kiri-bawah","Kiri bawah"],["kanan-tengah","Kanan tengah"]])],
  ["FAB","fab.waUkuran","range","Ukuran","scaling",40,76,2,v=>v+"px"],
  ["FAB","fab.waWarna","sel","Warna","paintbrush",opt([["primary","Dominan"],["amber","Aksen"],["gelap","Gelap"]])],
  ["FAB","fab.waPulse","tog","Denyut perhatian","radio"],
  ["FAB","fab.waTooltip","txt","Tooltip","tag"],
  ["FAB","fab.waPesan","area","Pesan awal WhatsApp","text"]
];
const GROUPS = ["Tema","Header","Body","Footer","FAB"];

function styleOnce(){
  if (el("uiAdmStyle")) return;
  const s = document.createElement("style"); s.id = "uiAdmStyle";
  s.textContent = `
#uiCtrls,#uiPvWrap{scrollbar-width:thin}
#uiCtrls{scrollbar-color:#a78bfa #eef2f7}
#uiCtrls::-webkit-scrollbar{width:10px}#uiCtrls::-webkit-scrollbar-track{background:#eef2f7}
#uiCtrls::-webkit-scrollbar-thumb{background:linear-gradient(#a78bfa,#f472b6);border-radius:99px;border:2px solid #eef2f7}
#uiPvWrap{scrollbar-color:#16a34a #e2e8f0}
#uiPvWrap::-webkit-scrollbar{width:11px;height:11px}#uiPvWrap::-webkit-scrollbar-track{background:#e2e8f0}
#uiPvWrap::-webkit-scrollbar-thumb{background:linear-gradient(#16a34a,#0d9488);border-radius:99px;border:2px solid #e2e8f0}
#uiFrame{border:0;background:#fff;border-radius:16px;box-shadow:0 24px 60px -34px rgba(15,23,42,.6);transition:width .35s cubic-bezier(.2,.7,.3,1);display:block;margin:0 auto}
.ui-dev[data-on="1"],.ui-sec[data-on="1"]{background:#059669;color:#fff;border-color:#059669}
.ui-chip{cursor:grab}.ui-chip.drag{opacity:.4}.ui-chip.over{box-shadow:inset 0 0 0 2px #34d399}`;
  document.head.appendChild(s);
}
function push(){
  const f = el("uiFrame"); if (!f || !f.contentWindow) return;
  try { f.contentWindow.postMessage({ lsui:"cfg", cfg:C }, "*"); } catch (e) {}
}
function pushScroll(id){
  const f = el("uiFrame"); if (!f || !f.contentWindow) return;
  try { f.contentWindow.postMessage({ lsui:"scroll", id }, "*"); } catch (e) {}
}

function ctrlHTML(){
  return GROUPS.map(g => {
    const rowHTML = s => {
      const [, p, t, l, i, a, b, c, fmt] = s, v = get(p);
      if (t === "tog") return '<label class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-emerald-400 mb-2"><span class="flex items-center gap-2 text-[11px] font-bold text-slate-600"><i data-lucide="'+i+'" class="w-3.5 h-3.5 text-slate-400"></i>'+l+'</span><input data-ui="'+p+'" type="checkbox" '+(v?"checked":"")+' class="w-5 h-5 accent-emerald-600 shrink-0"></label>';
      const head = '<div class="flex items-center justify-between gap-2 mb-1"><span class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"><i data-lucide="'+i+'" class="w-3.5 h-3.5 text-slate-400"></i>'+l+'</span>'+(t==="range"?'<span data-lbl="'+p+'" class="text-[11px] font-mono font-bold text-emerald-700">'+(fmt?fmt(v):v)+'</span>':"")+'</div>';
      if (t === "range") return '<div class="mb-3">'+head+'<input data-ui="'+p+'" type="range" min="'+a+'" max="'+b+'" step="'+c+'" value="'+v+'" class="w-full accent-emerald-600"></div>';
      if (t === "sel") return '<div class="mb-3">'+head+'<select data-ui="'+p+'" '+INP+'>'+a.map(o=>'<option value="'+esc(o[0])+'" '+(String(v)===String(o[0])?"selected":"")+'>'+esc(o[1])+'</option>').join("")+'</select></div>';
      if (t === "color") return '<div class="mb-3">'+head+'<div class="flex gap-2"><input data-ui="'+p+'" type="color" value="'+esc(v||"#000000")+'" class="h-9 w-14 rounded-lg border border-slate-300 cursor-pointer"><input data-uit="'+p+'" value="'+esc(v||"")+'" class="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] font-mono"></div></div>';
      if (t === "area") return '<div class="mb-3">'+head+'<textarea data-ui="'+p+'" rows="3" '+INP+'>'+esc(v)+'</textarea></div>';
      return '<div class="mb-3">'+head+'<input data-ui="'+p+'" value="'+esc(v)+'" '+INP+'></div>';
    };
    // Editor ikon Lucide "About Us" (Stay Connected) diletakkan LANGSUNG di bawah pengaturan About Us — komponen yang sama dengan "Ikon sosial footer".
    const rows = S.filter(s => s[0] === g).map(s => rowHTML(s) + (s[1] === "body.seksi.profil.sosialLabel" ? socialEd("body.seksi.profil.sosial", "Ikon Lucide About Us (Stay Connected)", true) : "")).join("");
    let extra = "";
    if (g === "Header") extra = listEd("header.nav", [["label","Label"],["href","Tujuan"]], "Item navigasi");
    if (g === "Body") extra = orderEd() +
      listEd("body.seksi.statistik.items", [["ikon","Ikon"],["label","Label"],["sumber","Sumber"],["warna","Warna"]], "Kartu statistik") +
      listEd("body.seksi.program.kartu", [["kode","Kode"],["nama","Nama"],["desk","Deskripsi"],["ikon","Ikon"],["href","Tautan"],["warna","Warna"]], "Kartu program") +
      listEd("body.seksi.fasilitas.items", [["nama","Nama"],["ikon","Ikon"],["ket","Keterangan"],["foto","URL foto"]], "Kartu fasilitas") +
      listEd("body.seksi.kontak.tombol", [["label","Label"],["href","Tujuan"],["ikon","Ikon"],["gaya","Gaya"]], "Tombol kontak");
    if (g === "Footer") extra = socialEd("footer.sosial", "Ikon sosial footer") + groupEd();
    const secBtn = g === "Body" ? '<div class="flex flex-wrap gap-1.5 mb-3">'+U.SECTIONS.map(s=>'<button type="button" data-sec="'+s[0]+'" class="ui-sec px-2.5 py-1 rounded-lg border border-slate-200 text-[10.5px] font-bold" data-on="'+(focusSec===s[0]?1:0)+'">'+s[1]+'</button>').join("")+'</div>' : "";
    return '<div class="mb-1"><div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3 mb-2">'+g+'</div>'+secBtn+rows+extra+'</div>';
  }).join("");
}
function listEd(path, fields, title){
  const arr = get(path) || [];
  const rows = arr.map((it, i) => '<div class="rounded-xl border border-slate-200 p-2 mb-2 bg-white">'+
    '<div class="flex flex-wrap gap-1.5 mb-1.5">'+fields.map(f=>'<input data-lp="'+path+'" data-li="'+i+'" data-lk="'+f[0]+'" value="'+esc(it[f[0]]??"")+'" placeholder="'+f[1]+'" class="flex-1 min-w-[90px] rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]">').join("")+'</div>'+
    '<div class="flex gap-1.5 justify-end">'+
      '<button type="button" data-lup="'+path+'" data-li="'+i+'" class="w-7 h-7 rounded-lg border border-slate-200 text-[11px]">↑</button>'+
      '<button type="button" data-ldn="'+path+'" data-li="'+i+'" class="w-7 h-7 rounded-lg border border-slate-200 text-[11px]">↓</button>'+
      '<button type="button" data-ltg="'+path+'" data-li="'+i+'" class="px-2 h-7 rounded-lg border border-slate-200 text-[10px] font-bold">'+(it.aktif===false?"Nonaktif":"Aktif")+'</button>'+
      '<button type="button" data-lrm="'+path+'" data-li="'+i+'" class="w-7 h-7 rounded-lg border border-rose-200 text-rose-500 text-[11px]">×</button>'+
    '</div></div>').join("");
  return '<div class="mb-3"><div class="flex items-center justify-between mb-1.5"><span class="text-[11px] font-bold text-slate-600">'+title+'</span><button type="button" data-ladd="'+path+'" data-lf="'+esc(JSON.stringify(fields.map(f=>f[0])))+'" class="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-400">+ Tambah</button></div>'+(rows||'<p class="text-[11px] text-slate-400 mb-2">Belum ada butir.</p>')+'</div>';
}
function socialEd(path, title, both){
  const arr = get(path) || [];
  const hint = '<p class="text-[10.5px] text-slate-400 mb-2 leading-snug">Isi <b>nama ikon Lucide</b> (mis. <code>instagram</code>, <code>youtube</code>, <code>facebook</code>, <code>message-circle</code>, <code>mail</code>). Tujuan: <code>wa</code>, <code>mail</code>, <code>#kontak</code>, atau URL lengkap.'+(both ? " Berlaku di <b>Beranda</b> dan halaman <b>SD, SMP, SMA, SMK</b>." : "")+' Daftar ikon: lucide.dev/icons</p>';
  return '<div class="mb-3"><div class="flex items-center justify-between mb-1.5"><span class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"><i data-lucide="shapes" class="w-3.5 h-3.5 text-slate-400"></i>'+title+'</span><button type="button" data-ladd="'+path+'" data-lf="'+esc(JSON.stringify(["ikon","href"]))+'" class="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-400">+ Tambah</button></div>'+hint+
    arr.map((s,i)=>'<div class="flex gap-1.5 mb-1.5"><input data-lp="'+path+'" data-li="'+i+'" data-lk="ikon" value="'+esc(s.ikon)+'" placeholder="ikon" class="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]"><input data-lp="'+path+'" data-li="'+i+'" data-lk="href" value="'+esc(s.href)+'" placeholder="tujuan" class="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]"><button type="button" data-ltg="'+path+'" data-li="'+i+'" class="px-2 rounded-lg border border-slate-200 text-[10px] font-bold">'+(s.aktif===false?"Off":"On")+'</button><button type="button" data-lrm="'+path+'" data-li="'+i+'" class="w-7 rounded-lg border border-rose-200 text-rose-500 text-[11px]">×</button></div>').join("")+'</div>';
}
function groupEd(){
  return '<div class="mb-3"><div class="flex items-center justify-between mb-1.5"><span class="text-[11px] font-bold text-slate-600">Grup tautan footer</span><button type="button" id="uiGrpAdd" class="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-400">+ Grup</button></div>'+
    C.footer.grup.map((g,gi)=>'<div class="rounded-xl border border-slate-200 p-2 mb-2 bg-white">'+
      '<div class="flex gap-1.5 mb-1.5"><input data-gt="'+gi+'" value="'+esc(g.judul)+'" class="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] font-bold"><button type="button" data-grm="'+gi+'" class="w-7 h-7 rounded-lg border border-rose-200 text-rose-500 text-[11px]">×</button></div>'+
      (g.tautan||[]).map((l,li)=>'<div class="flex gap-1.5 mb-1"><input data-gl="'+gi+'" data-gli="'+li+'" data-glk="label" value="'+esc(l.label)+'" class="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-[10.5px]"><input data-gl="'+gi+'" data-gli="'+li+'" data-glk="href" value="'+esc(l.href)+'" class="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-[10.5px]"><button type="button" data-glt="'+gi+'" data-gli="'+li+'" class="px-1.5 rounded-lg border border-slate-200 text-[9.5px] font-bold">'+(l.aktif===false?"Off":"On")+'</button><button type="button" data-glr="'+gi+'" data-gli="'+li+'" class="w-6 rounded-lg border border-rose-200 text-rose-500 text-[10px]">×</button></div>').join("")+
      '<button type="button" data-gla="'+gi+'" class="mt-1 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-400">+ Tautan</button></div>').join("")+'</div>';
}
function orderEd(){
  const map = Object.fromEntries(U.SECTIONS);
  return '<div class="mb-3"><div class="text-[11px] font-bold text-slate-600 mb-1.5">Urutan seksi (seret untuk menyusun)</div><div id="uiOrder" class="flex flex-wrap gap-1.5">'+
    C.body.urutan.map((id,i)=>'<span draggable="true" data-ord="'+id+'" class="ui-chip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-slate-200 text-[10.5px] font-bold"><i data-lucide="grip-vertical" class="w-3 h-3 text-slate-400"></i>'+(i+1)+". "+esc(map[id]||id)+'</span>').join("")+'</div></div>';
}

function render(){
  styleOnce();
  app.innerHTML = pageHead({ title:"Antarmuka Halaman Muka", desc:"Kendalikan seluruh elemen index.html — Header, Body (sembilan seksi), Footer, tema global, dan tombol mengambang. Pratinjau di kanan adalah halaman muka asli yang menerapkan draf secara langsung." }) +
  '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">'+
    [["palette","Palet",(U.THEMES[C.tema.preset]||{}).label||"—","violet"],["panel-top","Item navigasi",C.header.nav.filter(n=>n.aktif!==false).length,"sky"],["layout-grid","Seksi aktif",C.body.urutan.filter(id=>C.body.seksi[id]&&C.body.seksi[id].aktif!==false).length+"/9","emerald"],["panel-bottom","Grup footer",C.footer.grup.length,"amber"]]
      .map(s=>'<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"><div class="flex items-center gap-2 text-xs font-bold text-slate-500"><i data-lucide="'+s[0]+'" class="w-4 h-4 text-'+s[3]+'-600"></i>'+s[1]+'</div><div class="text-lg font-extrabold text-'+s[3]+'-600 mt-1 truncate">'+esc(s[2])+'</div></div>').join("")+
  '</div>'+
  '<div class="grid xl:grid-cols-[360px_minmax(0,1fr)] gap-4 items-start">'+
    '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden xl:sticky xl:top-4">'+
      '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="sliders-horizontal" class="w-4 h-4 text-emerald-600"></i><b class="text-sm flex-1">Panel Kontrol Antarmuka</b><span class="text-[10px] font-bold text-emerald-600">LIVE</span></div>'+
      '<div id="uiCtrls" class="p-4 max-h-[calc(100vh-268px)] overflow-y-auto">'+ctrlHTML()+'</div>'+
      '<div class="p-3 border-t border-slate-100 grid grid-cols-2 gap-2">'+
        '<button type="button" id="uiSave" class="col-span-2 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg"><i data-lucide="check" class="w-4 h-4"></i>Simpan Antarmuka</button>'+
        '<button type="button" id="uiReset" '+BS+'><i data-lucide="rotate-ccw" class="w-4 h-4"></i>Reset</button>'+
        '<button type="button" id="uiRandom" '+BS+'><i data-lucide="shuffle" class="w-4 h-4"></i>Acak</button>'+
        '<button type="button" id="uiExport" '+BS+'><i data-lucide="download" class="w-4 h-4"></i>Ekspor</button>'+
        '<label '+BS+' class="cursor-pointer"><i data-lucide="upload" class="w-4 h-4"></i>Impor<input id="uiImport" type="file" accept=".json" class="hidden"></label>'+
      '</div>'+
    '</div>'+
    '<div class="space-y-4 min-w-0">'+
      '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">'+
        '<div class="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">'+
          '<i data-lucide="monitor-play" class="w-4 h-4 text-emerald-600"></i><b class="text-sm">Pratinjau Halaman Muka</b>'+
          '<span id="uiStat" class="text-[11px] font-mono text-slate-400">menghubungkan…</span>'+
          '<div class="flex gap-1 ml-2">'+[["desktop","monitor","Desktop"],["tablet","tablet","Tablet"],["mobile","smartphone","Ponsel"]].map(d=>'<button type="button" data-dev="'+d[0]+'" class="ui-dev px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold inline-flex items-center gap-1" data-on="'+(device===d[0]?1:0)+'"><i data-lucide="'+d[1]+'" class="w-3.5 h-3.5"></i>'+d[2]+'</button>').join("")+'</div>'+
          '<div class="flex-1"></div>'+
          '<button type="button" id="uiReload" '+BS+' class="!px-2.5 !py-1.5 !text-[11px]"><i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>Muat ulang</button>'+
          '<a href="index.html" target="_blank" class="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">Buka asli<i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>'+
        '</div>'+
        '<div id="uiPvWrap" class="p-4 bg-slate-100 overflow-auto max-h-[78vh]"><iframe id="uiFrame" title="Pratinjau halaman muka" style="width:100%;height:1100px"></iframe></div>'+
      '</div>'+
      '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">'+
        '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="bookmark" class="w-4 h-4 text-amber-500"></i><b class="text-sm flex-1">Preset Antarmuka</b><button type="button" id="uiPresetSave" class="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-amber-400">+ Simpan preset</button></div>'+
        '<div id="uiPresets" class="p-3 flex flex-wrap gap-2"></div>'+
        '<div class="px-4 pb-4 flex flex-wrap gap-2">'+
          [["Zamrud Klasik",{tema:{preset:"zamrud"}}],["Nila Akademik",{tema:{preset:"nila",latar:"grid"}}],["Laut Nusantara",{tema:{preset:"laut",radius:16}}],["Ambar Ceria",{tema:{preset:"ambar",radius:28,ritme:80}}],["Kuarsa Modern",{tema:{preset:"kuarsa",latar:"mesh",radius:32}}],["Hutan Tenang",{tema:{preset:"hutan",ritme:96,lebar:1180}}]]
            .map((p,i)=>'<button type="button" data-qp="'+i+'" class="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-700">'+p[0]+'</button>').join("")+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
  refreshIcons();
  const f = el("uiFrame");
  f.src = siteUrl("index", "?uipreview=1&t=" + Date.now());
  f.onload = () => { ready = true; el("uiStat").textContent = "pratinjau aktif"; sizeFrame(); push(); if (focusSec) pushScroll(focusSec); };
  wire();
  renderPresets();
}
function sizeFrame(){
  const f = el("uiFrame"); if (!f) return;
  f.style.width = device === "mobile" ? "390px" : device === "tablet" ? "820px" : "100%";
  f.style.height = device === "mobile" ? "760px" : device === "tablet" ? "980px" : "1100px";
}
function live(){
  S.forEach(s => {
    const [, p, t, , , , , , fmt] = s;
    const e = document.querySelector('[data-ui="' + p + '"]'); if (!e) return;
    let v = t === "tog" ? e.checked : t === "range" ? +e.value : e.value;
    if (t === "color") { const tx = document.querySelector('[data-uit="' + p + '"]'); if (tx && tx.value.trim()) v = tx.value.trim(); }
    set(p, v);
    const lb = document.querySelector('[data-lbl="' + p + '"]'); if (lb) lb.textContent = fmt ? fmt(v) : v;
  });
  C = U.norm(C); push();
}
function wire(){
  document.querySelectorAll("[data-ui]").forEach(e => { e.oninput = live; e.onchange = live; });
  document.querySelectorAll("[data-uit]").forEach(e => { e.oninput = () => { const c = document.querySelector('[data-ui="' + e.dataset.uit + '"]'); if (c && /^#[0-9a-f]{6}$/i.test(e.value.trim())) c.value = e.value.trim(); live(); }; });

  document.querySelectorAll("[data-lp]").forEach(f => f.oninput = () => { get(f.dataset.lp)[+f.dataset.li][f.dataset.lk] = f.value; C = U.norm(C); push(); });
  document.querySelectorAll("[data-ladd]").forEach(b => b.onclick = () => {
    const p = b.dataset.ladd, keys = JSON.parse(b.dataset.lf), o = {};
    keys.forEach(k => o[k] = k === "aktif" ? true : k === "warna" ? "brand" : k === "gaya" ? "outline" : k === "sumber" ? "siswa" : k === "ikon" ? "star" : "");
    const arr = get(p) || []; arr.push(o); set(p, arr); render();
  });
  document.querySelectorAll("[data-lrm]").forEach(b => b.onclick = () => {
    const p = b.dataset.lrm, i = +b.dataset.li, prev = JSON.parse(JSON.stringify(get(p)));
    get(p).splice(i, 1); render(); undo("Butir dihapus", () => { set(p, prev); render(); });
  });
  document.querySelectorAll("[data-lup]").forEach(b => b.onclick = () => { const a = get(b.dataset.lup), i = +b.dataset.li; if (i > 0) { [a[i-1], a[i]] = [a[i], a[i-1]]; render(); } });
  document.querySelectorAll("[data-ldn]").forEach(b => b.onclick = () => { const a = get(b.dataset.ldn), i = +b.dataset.li; if (i < a.length-1) { [a[i+1], a[i]] = [a[i], a[i+1]]; render(); } });
  document.querySelectorAll("[data-ltg]").forEach(b => b.onclick = () => { const it = get(b.dataset.ltg)[+b.dataset.li]; it.aktif = it.aktif === false; render(); });

  document.querySelectorAll("[data-gt]").forEach(e => e.oninput = () => { C.footer.grup[+e.dataset.gt].judul = e.value; push(); });
  document.querySelectorAll("[data-gl]").forEach(e => e.oninput = () => { C.footer.grup[+e.dataset.gl].tautan[+e.dataset.gli][e.dataset.glk] = e.value; push(); });
  document.querySelectorAll("[data-glt]").forEach(b => b.onclick = () => { const l = C.footer.grup[+b.dataset.glt].tautan[+b.dataset.gli]; l.aktif = l.aktif === false; render(); });
  document.querySelectorAll("[data-glr]").forEach(b => b.onclick = () => {
    const gi = +b.dataset.glr, prev = JSON.parse(JSON.stringify(C.footer.grup[gi].tautan));
    C.footer.grup[gi].tautan.splice(+b.dataset.gli, 1); render();
    undo("Tautan dihapus", () => { C.footer.grup[gi].tautan = prev; render(); });
  });
  document.querySelectorAll("[data-gla]").forEach(b => b.onclick = () => { C.footer.grup[+b.dataset.gla].tautan.push({ label:"Tautan baru", href:"#beranda", aktif:true }); render(); });
  const ga = el("uiGrpAdd"); if (ga) ga.onclick = () => { C.footer.grup.push({ judul:"Grup Baru", tautan:[{ label:"Tautan", href:"#beranda", aktif:true }] }); render(); };
  document.querySelectorAll("[data-grm]").forEach(b => b.onclick = () => {
    const prev = JSON.parse(JSON.stringify(C.footer.grup));
    C.footer.grup.splice(+b.dataset.grm, 1); render();
    undo("Grup footer dihapus", () => { C.footer.grup = prev; render(); });
  });

  let dragId = null;
  document.querySelectorAll("[data-ord]").forEach(c => {
    c.ondragstart = e => { dragId = c.dataset.ord; c.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", dragId); } catch (x) {} };
    c.ondragend = () => { c.classList.remove("drag"); document.querySelectorAll("[data-ord]").forEach(x => x.classList.remove("over")); };
    c.ondragover = e => { e.preventDefault(); c.classList.add("over"); };
    c.ondragleave = () => c.classList.remove("over");
    c.ondrop = e => {
      e.preventDefault(); const t = c.dataset.ord; if (!dragId || dragId === t) return;
      const a = C.body.urutan.slice(), f = a.indexOf(dragId), to = a.indexOf(t);
      a.splice(f, 1); a.splice(to, 0, dragId); C.body.urutan = a; dragId = null; render();
      toast("Urutan seksi diperbarui.", "info");
    };
  });
  document.querySelectorAll("[data-sec]").forEach(b => b.onclick = () => {
    focusSec = b.dataset.sec;
    document.querySelectorAll("[data-sec]").forEach(x => x.dataset.on = x.dataset.sec === focusSec ? 1 : 0);
    pushScroll(focusSec);
  });
  document.querySelectorAll("[data-dev]").forEach(b => b.onclick = () => {
    device = b.dataset.dev;
    document.querySelectorAll("[data-dev]").forEach(x => x.dataset.on = x.dataset.dev === device ? 1 : 0);
    sizeFrame(); setTimeout(push, 60);
  });
  el("uiReload").onclick = () => { ready = false; el("uiStat").textContent = "memuat…"; el("uiFrame").src = siteUrl("index", "?uipreview=1&t=" + Date.now()); };
  el("uiSave").onclick = async () => {
    const snap = JSON.parse(JSON.stringify(C));
    const ok = await saveData("ui.json", C, "Konten Website", "UPDATE ANTARMUKA BERANDA", C.tema.preset + " · " + C.header.nav.length + " nav · " + C.footer.grup.length + " grup footer");
    if (ok) toast("Antarmuka tersimpan. Semua halaman memakai header & footer baru.", "success");
    else { C = snap; render(); }
  };
  el("uiReset").onclick = () => { const prev = JSON.parse(JSON.stringify(C)); C = U.norm({}); render(); undo("Antarmuka direset ke default", () => { C = prev; render(); }); };
  el("uiRandom").onclick = () => {
    const prev = JSON.parse(JSON.stringify(C));
    const keys = Object.keys(U.THEMES), pick = a => a[Math.floor(Math.random()*a.length)];
    C.tema.preset = pick(keys); C.tema.primary = C.tema.accent = C.tema.accent2 = "";
    C.tema.radius = Math.floor(Math.random()*17)*2; C.tema.ritme = 40 + Math.floor(Math.random()*20)*4;
    C.tema.lebar = 1100 + Math.floor(Math.random()*12)*20; C.tema.latar = pick(["mesh","grid","polos"]);
    C.tema.fontDisplay = pick(U.FONTS); C.tema.grainInt = Math.floor(Math.random()*14);
    C.tema.auroraSpeed = 12 + Math.floor(Math.random()*50); C.header.navGaya = pick(["garis","pil","tanpa"]);
    C.header.topbarAktif = Math.random() < .5; C.footer.kolom = 3 + Math.floor(Math.random()*3);
    C = U.norm(C); render(); undo("Antarmuka diacak", () => { C = prev; render(); });
  };
  el("uiExport").onclick = () => download("ui.json", JSON.stringify(C, null, 2));
  el("uiImport").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const o = JSON.parse(await f.text()), prev = JSON.parse(JSON.stringify(C)); C = U.norm(o); render(); undo("Konfigurasi diimpor", () => { C = prev; render(); }); toast("Konfigurasi dimuat ke pratinjau — klik Simpan untuk menerapkan.", "info"); }
    catch (err) { toast("File JSON tidak valid: " + err.message, "error"); }
    e.target.value = "";
  };
  el("uiPresetSave").onclick = () => {
    const n = prompt("Nama preset antarmuka:", "Antarmuka " + (U.THEMES[C.tema.preset]||{}).label);
    if (!n) return;
    const p = presets(); p.push({ name:n.slice(0,32), cfg:JSON.parse(JSON.stringify(C)) }); setPresets(p); renderPresets();
    toast("Preset tersimpan di perangkat ini.", "success");
  };
  const Q = [{tema:{preset:"zamrud"}},{tema:{preset:"nila",latar:"grid"}},{tema:{preset:"laut",radius:16}},{tema:{preset:"ambar",radius:28,ritme:80}},{tema:{preset:"kuarsa",latar:"mesh",radius:32}},{tema:{preset:"hutan",ritme:96,lebar:1180}}];
  document.querySelectorAll("[data-qp]").forEach(b => b.onclick = () => {
    const prev = JSON.parse(JSON.stringify(C));
    C = U.norm(Object.assign({}, C, { tema:Object.assign({}, C.tema, Q[+b.dataset.qp].tema, { primary:"", accent:"", accent2:"" }) }));
    render(); undo("Preset cepat diterapkan", () => { C = prev; render(); });
  });
}
function renderPresets(){
  const host = el("uiPresets"); if (!host) return;
  const p = presets();
  host.innerHTML = p.length ? p.map((x,i)=>'<span class="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-slate-100 border border-slate-200"><button type="button" data-up="'+i+'" class="text-[11px] font-bold text-slate-600 hover:text-emerald-700">'+esc(x.name)+'</button><button type="button" data-ud="'+i+'" class="w-5 h-5 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center">×</button></span>').join("")
    : '<span class="text-[11px] text-slate-400">Belum ada preset tersimpan.</span>';
  host.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { const prev = JSON.parse(JSON.stringify(C)); C = U.norm(presets()[+b.dataset.up].cfg); render(); undo("Preset diterapkan", () => { C = prev; render(); }); });
  host.querySelectorAll("[data-ud]").forEach(b => b.onclick = () => { const p = presets(), rm = p.splice(+b.dataset.ud,1)[0]; setPresets(p); renderPresets(); undo('Preset "'+rm.name+'" dihapus', () => { const q = presets(); q.push(rm); setPresets(q); renderPresets(); }); });
}
function undo(label, restore){
  let bar = el("uiUndoBar");
  if (!bar) { bar = document.createElement("div"); bar.id = "uiUndoBar"; document.body.appendChild(bar); }
  bar.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-sm";
  bar.innerHTML = '<i data-lucide="undo-2" class="w-4 h-4 text-amber-400"></i><span>' + esc(label) + '</span><button type="button" id="uiUndoBtn" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-900">Urungkan</button>';
  refreshIcons();
  el("uiUndoBtn").onclick = () => { restore(); const b = el("uiUndoBar"); if (b) b.remove(); toast("Perubahan diurungkan.", "success"); };
  clearTimeout(undoT); undoT = setTimeout(() => { const b = el("uiUndoBar"); if (b) b.remove(); }, 9000);
}

async function renderTampilan(){
  if (!window.LSUI) { app.innerHTML = '<div class="p-6 text-sm text-rose-600">app.js versi terbaru belum dimuat (LSUI tidak tersedia).</div>'; return; }
  let saved = {}; try { saved = await fetchJSON("ui.json"); } catch (e) {}
  C = U.norm(saved); device = "desktop"; focusSec = "";
  render();
}
window.addEventListener("message", e => {
  const d = e.data || {};
  if (d.lsui === "ready") { ready = true; const s = el("uiStat"); if (s) s.textContent = "pratinjau aktif"; push(); }
  if (d.lsui === "applied") { const s = el("uiStat"); if (s) s.textContent = "draf diterapkan"; }
});
if (typeof MOD !== "undefined") MOD.tampilan = { title:"Antarmuka Halaman Muka", desc:"Header • Body • Footer", render: renderTampilan };
// (Menu sidebar kini dirender terpusat oleh admin-router.js — tidak ada lagi injeksi menu per modul.)
})();