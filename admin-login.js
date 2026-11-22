// ============================================================
// admin-login.js — CMS "Pengaturan Form Login" (data/login.json)
// Panel kontrol permanen + pratinjau langsung memakai renderer
// yang sama dengan login.html, sehingga hasil admin === publik.
// ============================================================
(() => {
"use strict";
const el = id => document.getElementById(id);

/* ---- penjaga sesi: berlaku di setiap halaman admin ---- */
(function guard(){
  const exp = Number(sessionStorage.getItem("gh_token_exp") || 0);
  if (exp && Date.now() > exp) {
    ["gh_token","gh_user","gh_avatar","gh_token_exp"].forEach(k => sessionStorage.removeItem(k));
    location.replace(window.siteUrl ? siteUrl("login") : "login/"); return;
  }
  let cfg = { sesi_menit: 120, sesi_geser: true };
  fetchJSON("login.json").then(c => { cfg = { ...cfg, ...(c||{}) }; }).catch(()=>{});
  const bump = () => {
    if (!cfg.sesi_geser || !sessionStorage.getItem("gh_token")) return;
    sessionStorage.setItem("gh_token_exp", String(Date.now() + (Number(cfg.sesi_menit)||120)*60000));
  };
  ["click","keydown"].forEach(ev => window.addEventListener(ev, () => { clearTimeout(guard._t); guard._t = setTimeout(bump, 1200); }, { passive:true }));
})();

const LV = window.LoginView;
const BP = 'class="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg"';
const BS = 'class="inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-sm font-bold px-4 py-2 rounded-lg"';
const INP = (typeof inp !== "undefined") ? inp : 'class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"';
const PKEY = "lg_presets";
const REDIR = [["admin.html","Panel Admin"],["seed.html","Seeder Data"],["index.html","Beranda"]];
const LATAR = [["mesh","Mesh gradient"],["aurora","Aurora"],["grid","Grid teknis"],["foto","Foto + scrim"],["polos","Polos"]];
const LAYOUT = [["split","Dua kolom"],["terpusat","Terpusat"],["lebar","Kartu lebar"]];
const DENS = [["lapang","Lapang"],["normal","Normal"],["padat","Padat"]];

let C = { ...LV.DEF }, SCHOOL = "", VIEW = null, device = "desktop", undoT = null, mounted = false;

const presets = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || []; } catch(e){ return []; } };
const setPresets = v => localStorage.setItem(PKEY, JSON.stringify(v));

const CTRL = [
  { g:"Identitas", k:"brand_nama", t:"txt", l:"Nama brand (kosong = nama sekolah)", i:"school" },
  { g:"Identitas", k:"brand_sub", t:"txt", l:"Sub-brand", i:"tag" },
  { g:"Identitas", k:"logo_ikon", t:"sel", l:"Ikon logo", i:"shapes", opts:LV.ICONS.map(x=>[x,x]) },
  { g:"Identitas", k:"eyebrow", t:"txt", l:"Label atas", i:"badge" },
  { g:"Identitas", k:"headline", t:"txt", l:"Judul utama", i:"heading" },
  { g:"Identitas", k:"headline_highlight", t:"txt", l:"Kata bergradasi", i:"sparkles" },
  { g:"Identitas", k:"tagline", t:"area", l:"Paragraf pengantar", i:"align-left" },
  { g:"Identitas", k:"footer_teks", t:"txt", l:"Teks kaki panel", i:"copyright" },

  { g:"Formulir", k:"judul_form", t:"txt", l:"Judul kartu", i:"panel-top" },
  { g:"Formulir", k:"subjudul_form", t:"area", l:"Subjudul kartu", i:"text" },
  { g:"Formulir", k:"label_token", t:"txt", l:"Label input", i:"type" },
  { g:"Formulir", k:"placeholder_token", t:"txt", l:"Placeholder", i:"text-cursor-input" },
  { g:"Formulir", k:"tombol_label", t:"txt", l:"Teks tombol", i:"mouse-pointer-click" },
  { g:"Formulir", k:"tombol_ikon", t:"sel", l:"Ikon tombol", i:"arrow-right", opts:[["arrow-right","arrow-right"],["log-in","log-in"],["unlock","unlock"],["chevron-right","chevron-right"]] },
  { g:"Formulir", k:"mode_input", t:"sel", l:"Mode input", i:"eye", opts:[["password","Tersembunyi"],["text","Terbuka"]] },
  { g:"Formulir", k:"mata", t:"tog", l:"Tombol lihat token", i:"eye" },
  { g:"Formulir", k:"info_repo", t:"tog", l:"Tampilkan target repo", i:"git-branch" },
  { g:"Formulir", k:"catatan_aktif", t:"tog", l:"Tampilkan catatan keamanan", i:"shield-check" },
  { g:"Formulir", k:"bantuan_aktif", t:"tog", l:"Tampilkan bantuan (FAQ)", i:"circle-help" },
  { g:"Formulir", k:"back_label", t:"txt", l:"Teks tautan kembali", i:"arrow-left" },
  { g:"Formulir", k:"back_href", t:"txt", l:"Tujuan tautan kembali", i:"link" },

  { g:"Perilaku", k:"redirect", t:"sel", l:"Tujuan setelah login", i:"corner-down-right", opts:REDIR },
  { g:"Perilaku", k:"min_panjang", t:"range", l:"Panjang minimum token", i:"ruler", min:8, max:120, step:1, fmt:v=>v+" karakter" },
  { g:"Perilaku", k:"batas_percobaan", t:"range", l:"Batas gagal sebelum kunci", i:"shield-alert", min:0, max:10, step:1, fmt:v=>v===0?"nonaktif":v+" kali" },
  { g:"Perilaku", k:"kunci_detik", t:"range", l:"Durasi kunci", i:"timer", min:10, max:600, step:10, fmt:v=>v+" detik" },
  { g:"Perilaku", k:"sesi_menit", t:"range", l:"Masa berlaku sesi", i:"clock", min:5, max:1440, step:5, fmt:v=>v>=60?(v/60).toFixed(v%60?1:0)+" jam":v+" menit" },
  { g:"Perilaku", k:"sesi_geser", t:"tog", l:"Perpanjang sesi saat aktif", i:"refresh-cw" },
  { g:"Perilaku", k:"prefiks_wajib", t:"tog", l:"Wajib prefiks PAT valid", i:"fingerprint" },
  { g:"Perilaku", k:"izinkan_classic", t:"tog", l:"Izinkan token classic (ghp_)", i:"key-round" },
  { g:"Perilaku", k:"validasi_izin_tulis", t:"tog", l:"Verifikasi izin tulis repo", i:"git-commit-horizontal" },
  { g:"Perilaku", k:"avatar", t:"tog", l:"Simpan avatar pengguna", i:"circle-user" },

  { g:"Tema", k:"tema", t:"sel", l:"Palet dasar", i:"palette", opts:Object.keys(LV.THEMES).map(k=>[k,LV.THEMES[k].label]) },
  { g:"Tema", k:"aksen", t:"color", l:"Aksen utama (kosong = palet)", i:"pipette" },
  { g:"Tema", k:"aksen2", t:"color", l:"Aksen kedua", i:"pipette" },
  { g:"Tema", k:"latar", t:"sel", l:"Jenis latar", i:"image", opts:LATAR },
  { g:"Tema", k:"gambar_latar", t:"txt", l:"URL foto latar", i:"link" },
  { g:"Tema", k:"overlay", t:"range", l:"Kegelapan scrim", i:"contrast", min:0, max:95, step:1, fmt:v=>v+"%" },
  { g:"Tema", k:"aurora", t:"tog", l:"Cahaya aurora", i:"sun" },
  { g:"Tema", k:"aurora_kecepatan", t:"range", l:"Kecepatan aurora", i:"gauge", min:6, max:80, step:1, fmt:v=>v+"s / siklus" },
  { g:"Tema", k:"grain", t:"tog", l:"Tekstur grain", i:"grip" },
  { g:"Tema", k:"grain_intensitas", t:"range", l:"Intensitas grain", i:"sliders-horizontal", min:0, max:20, step:1, fmt:v=>v+"%" },
  { g:"Tema", k:"blur", t:"range", l:"Blur cahaya", i:"droplet", min:0, max:40, step:1, fmt:v=>v+"px" },
  { g:"Tema", k:"radius", t:"range", l:"Lengkung kartu", i:"square", min:0, max:40, step:1, fmt:v=>v+"px" },
  { g:"Tema", k:"animasi", t:"tog", l:"Animasi masuk", i:"sparkles" },

  { g:"Tata Letak", k:"tata_letak", t:"sel", l:"Susunan", i:"layout-template", opts:LAYOUT },
  { g:"Tata Letak", k:"panel_posisi", t:"sel", l:"Posisi panel cerita", i:"move-horizontal", opts:[["kiri","Kiri"],["kanan","Kanan"]] },
  { g:"Tata Letak", k:"panel_aktif", t:"tog", l:"Tampilkan panel cerita", i:"panel-left" },
  { g:"Tata Letak", k:"segel", t:"tog", l:"Segel keamanan SVG", i:"shield" },
  { g:"Tata Letak", k:"statistik", t:"tog", l:"Meta repo & sesi", i:"info" },
  { g:"Tata Letak", k:"kepadatan", t:"sel", l:"Kepadatan", i:"rows-3", opts:DENS },
  { g:"Tata Letak", k:"lebar_kartu", t:"range", l:"Lebar kartu", i:"move-horizontal", min:340, max:620, step:10, fmt:v=>v+"px" }
];
const GROUPS = ["Identitas","Formulir","Perilaku","Tema","Tata Letak"];

function styleOnce(){
  if (el("lgAdminStyle")) return;
  const s = document.createElement("style"); s.id = "lgAdminStyle";
  s.textContent = `
#lgPv{border-radius:18px;overflow:hidden;border:1px solid #cbd5e1;background:#04120e;transition:max-width .35s cubic-bezier(.2,.7,.3,1)}
#lgPvWrap{overflow:auto;max-height:74vh;scrollbar-color:#16a34a #e2e8f0;scrollbar-width:thin}
#lgPvWrap::-webkit-scrollbar{width:10px;height:10px}
#lgPvWrap::-webkit-scrollbar-track{background:#e2e8f0;border-radius:99px}
#lgPvWrap::-webkit-scrollbar-thumb{background:linear-gradient(#16a34a,#0d9488);border-radius:99px;border:2px solid #e2e8f0}
#lgCtrls{scrollbar-color:#a78bfa #eef2f7;scrollbar-width:thin}
#lgCtrls::-webkit-scrollbar{width:10px}
#lgCtrls::-webkit-scrollbar-track{background:#eef2f7}
#lgCtrls::-webkit-scrollbar-thumb{background:linear-gradient(#a78bfa,#f472b6);border-radius:99px;border:2px solid #eef2f7}
#lgPv .lgv{min-height:640px}
.lg-dev[data-on="1"]{background:#059669;color:#fff;border-color:#059669}
.lg-state[data-on="1"]{background:#0f172a;color:#fff;border-color:#0f172a}`;
  document.head.appendChild(s);
}

function listEditor(kind, items){
  const isNote = kind === "catatan", isHelp = kind === "bantuan";
  const rows = items.map((it, i) => {
    const a = isNote ? esc(it.ikon||"") : esc(it.q||"");
    const b = isNote ? esc(it.teks||"") : esc(it.a||"");
    return '<div class="rounded-xl border border-slate-200 p-2 mb-2 bg-white">' +
      '<div class="flex gap-1.5 mb-1.5">' +
        '<input data-lf="'+kind+'" data-li="'+i+'" data-lk="'+(isNote?"ikon":"q")+'" value="'+a+'" placeholder="'+(isNote?"ikon lucide":"pertanyaan")+'" class="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]">' +
        '<button type="button" data-lup="'+kind+'" data-li="'+i+'" class="w-7 h-7 rounded-lg border border-slate-200 text-[11px]">↑</button>' +
        '<button type="button" data-ldn="'+kind+'" data-li="'+i+'" class="w-7 h-7 rounded-lg border border-slate-200 text-[11px]">↓</button>' +
        '<button type="button" data-lrm="'+kind+'" data-li="'+i+'" class="w-7 h-7 rounded-lg border border-rose-200 text-rose-500 text-[11px]">×</button>' +
      '</div>' +
      '<textarea data-lf="'+kind+'" data-li="'+i+'" data-lk="'+(isNote?"teks":"a")+'" rows="2" placeholder="'+(isNote?"isi catatan":"jawaban")+'" class="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]">'+b+'</textarea></div>';
  }).join("");
  return '<div class="mb-3"><div class="flex items-center justify-between mb-1.5"><span class="text-[11px] font-bold text-slate-600">'+(isNote?"Catatan keamanan":"Bantuan / FAQ")+'</span><button type="button" data-ladd="'+kind+'" class="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-400">+ Tambah</button></div>'+(rows||'<p class="text-[11px] text-slate-400 mb-2">Belum ada butir.</p>')+'</div>';
}
function chipEditor(items){
  return '<div class="mb-3"><div class="flex items-center justify-between mb-1.5"><span class="text-[11px] font-bold text-slate-600">Chip keunggulan</span><button type="button" data-ladd="features" class="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-400">+ Tambah</button></div>' +
    (items.map((f,i)=>'<div class="flex gap-1.5 mb-1.5"><input data-lf="features" data-li="'+i+'" value="'+esc(f)+'" class="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]"><button type="button" data-lrm="features" data-li="'+i+'" class="w-7 h-7 rounded-lg border border-rose-200 text-rose-500 text-[11px]">×</button></div>').join("") || '<p class="text-[11px] text-slate-400 mb-2">Belum ada chip.</p>') + '</div>';
}

function render(){
  styleOnce();
  const rc = repoCfg();
  const groupsHTML = GROUPS.map(g => {
    const items = CTRL.filter(c => c.g === g);
    const body = items.map(c => {
      const v = C[c.k];
      if (c.t === "tog") return '<label class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-emerald-400 mb-2"><span class="flex items-center gap-2 text-[11px] font-bold text-slate-600"><i data-lucide="'+c.i+'" class="w-3.5 h-3.5 text-slate-400"></i>'+c.l+'</span><input id="lg_'+c.k+'" type="checkbox" '+(v?"checked":"")+' class="w-5 h-5 accent-emerald-600 shrink-0"></label>';
      const head = '<div class="flex items-center justify-between gap-2 mb-1"><span class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"><i data-lucide="'+c.i+'" class="w-3.5 h-3.5 text-slate-400"></i>'+c.l+'</span>'+(c.t==="range"?'<span id="lgv_'+c.k+'" class="text-[11px] font-mono font-bold text-emerald-700">'+(c.fmt?c.fmt(v):v)+'</span>':"")+'</div>';
      if (c.t === "range") return '<div class="mb-3">'+head+'<input id="lg_'+c.k+'" type="range" min="'+c.min+'" max="'+c.max+'" step="'+(c.step||1)+'" value="'+v+'" class="w-full accent-emerald-600"></div>';
      if (c.t === "sel") return '<div class="mb-3">'+head+'<select id="lg_'+c.k+'" '+INP+'>'+c.opts.map(o=>'<option value="'+o[0]+'" '+(String(v)===String(o[0])?"selected":"")+'>'+o[1]+'</option>').join("")+'</select></div>';
      if (c.t === "color") return '<div class="mb-3">'+head+'<div class="flex gap-2"><input id="lg_'+c.k+'" type="color" value="'+(/^#[0-9a-f]{6}$/i.test(v||"")?v:"#10b981")+'" class="h-9 w-14 rounded-lg border border-slate-300 cursor-pointer"><input id="lgt_'+c.k+'" value="'+esc(v||"")+'" placeholder="kosong" class="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] font-mono"></div></div>';
      if (c.t === "area") return '<div class="mb-3">'+head+'<textarea id="lg_'+c.k+'" rows="3" '+INP+'>'+esc(v)+'</textarea></div>';
      return '<div class="mb-3">'+head+'<input id="lg_'+c.k+'" value="'+esc(v)+'" '+INP+'></div>';
    }).join("");
    const extra = g === "Identitas" ? chipEditor(C.features) : g === "Formulir" ? listEditor("catatan", C.catatan) + listEditor("bantuan", C.bantuan) : "";
    return '<div class="mb-2"><div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3 mb-2">'+g+'</div>'+body+extra+'</div>';
  }).join("");

  app.innerHTML = pageHead({ title:"Pengaturan Form Login", desc:"Atur tampilan, salinan, dan kebijakan keamanan halaman login.html. Pratinjau memakai renderer yang sama dengan halaman publik, lalu simpan ke data/login.json beserta audit log." }) +
  '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">' +
    [["palette","Palet",LV.THEMES[C.tema]?LV.THEMES[C.tema].label:"—","violet"],["shield-alert","Batas gagal",C.batas_percobaan||"nonaktif","rose"],["clock","Masa sesi",C.sesi_menit+" mnt","emerald"],["layout-template","Tata letak",(LAYOUT.find(x=>x[0]===C.tata_letak)||[])[1]||"—","sky"]]
      .map(s=>'<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"><div class="flex items-center gap-2 text-xs font-bold text-slate-500"><i data-lucide="'+s[0]+'" class="w-4 h-4 text-'+s[3]+'-600"></i>'+s[1]+'</div><div class="text-lg font-extrabold text-'+s[3]+'-600 mt-1 truncate">'+esc(s[2])+'</div></div>').join("") +
  '</div>' +
  '<div class="grid lg:grid-cols-[350px_minmax(0,1fr)] gap-4 items-start">' +
    '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:sticky lg:top-4">' +
      '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="sliders-horizontal" class="w-4 h-4 text-emerald-600"></i><b class="text-sm flex-1">Panel Kontrol Login</b><span class="text-[10px] font-bold text-emerald-600">LIVE</span></div>' +
      '<div id="lgCtrls" class="p-4 max-h-[calc(100vh-260px)] overflow-y-auto">'+groupsHTML+'</div>' +
      '<div class="p-3 border-t border-slate-100 grid grid-cols-2 gap-2">' +
        '<button type="button" id="lgSave" class="col-span-2 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg"><i data-lucide="check" class="w-4 h-4"></i>Simpan Pengaturan</button>' +
        '<button type="button" id="lgReset" '+BS+'><i data-lucide="rotate-ccw" class="w-4 h-4"></i>Reset</button>' +
        '<button type="button" id="lgRandom" '+BS+'><i data-lucide="shuffle" class="w-4 h-4"></i>Acak</button>' +
        '<button type="button" id="lgExport" '+BS+'><i data-lucide="download" class="w-4 h-4"></i>Ekspor</button>' +
        '<label '+BS+' class="cursor-pointer"><i data-lucide="upload" class="w-4 h-4"></i>Impor<input id="lgImport" type="file" accept=".json" class="hidden"></label>' +
      '</div>' +
    '</div>' +
    '<div class="space-y-4 min-w-0">' +
      '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">' +
        '<div class="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">' +
          '<i data-lucide="monitor-play" class="w-4 h-4 text-emerald-600"></i><b class="text-sm">Pratinjau Langsung</b>' +
          '<div class="flex gap-1 ml-2">'+[["desktop","Monitor","monitor"],["tablet","Tablet","tablet"],["mobile","Ponsel","smartphone"]].map(d=>'<button type="button" data-dev="'+d[0]+'" class="lg-dev btn px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold inline-flex items-center gap-1" data-on="'+(device===d[0]?1:0)+'"><i data-lucide="'+d[2]+'" class="w-3.5 h-3.5"></i>'+d[1]+'</button>').join("")+'</div>' +
          '<div class="flex-1"></div>' +
          '<a href="login.html?preview=1" target="_blank" class="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">Pratinjau penuh<i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>' +
        '</div>' +
        '<div class="px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center gap-1.5 bg-slate-50">' +
          '<span class="text-[10px] font-bold uppercase text-slate-400 mr-1">Uji state</span>' +
          [["normal","Normal"],["busy","Sibuk"],["error","Galat"],["lock","Terkunci"],["success","Berhasil"]].map(s=>'<button type="button" data-state="'+s[0]+'" class="lg-state px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold" data-on="'+(s[0]==="normal"?1:0)+'">'+s[1]+'</button>').join("") +
          '<span class="text-[10px] text-slate-400 ml-auto">Pratinjau tidak mengirim token ke mana pun.</span>' +
        '</div>' +
        '<div id="lgPvWrap" class="p-4 bg-slate-100"><div id="lgPv" class="mx-auto" style="max-width:100%"></div></div>' +
      '</div>' +
      '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">' +
        '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="bookmark" class="w-4 h-4 text-amber-500"></i><b class="text-sm flex-1">Preset Tersimpan</b><button type="button" id="lgPresetSave" class="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 hover:border-amber-400">+ Simpan preset</button></div>' +
        '<div id="lgPresets" class="p-3 flex flex-wrap gap-2"></div>' +
        '<div class="px-4 pb-4 flex flex-wrap gap-2">' +
          [["Gerbang Zamrud",{tema:"zamrud",latar:"mesh",tata_letak:"split"}],["Nila Siber",{tema:"nila",latar:"grid",tata_letak:"split",panel_posisi:"kanan"}],["Ambar Terpusat",{tema:"ambar",latar:"aurora",tata_letak:"terpusat",segel:false}],["Kuarsa Padat",{tema:"kuarsa",latar:"mesh",kepadatan:"padat",radius:12}],["Laut Lebar",{tema:"laut",latar:"aurora",tata_letak:"lebar",lebar_kartu:560}]]
            .map((p,i)=>'<button type="button" data-qp="'+i+'" class="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-700">'+p[0]+'</button>').join("") +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
  refreshIcons();
  paintPreview();
  wire(rc);
  renderPresets();
}

function paintPreview(){
  const host = el("lgPv"); if (!host || !window.LoginView) return;
  const rc = repoCfg();
  const w = device === "mobile" ? 390 : device === "tablet" ? 760 : 9999;
  host.style.maxWidth = w === 9999 ? "100%" : w + "px";
  VIEW = LoginView.mount(host, C, { repo: rc, school: SCHOOL, force: device });
  VIEW.onSubmit((tok, api) => {
    api.busy(true, "Memverifikasi…");
    setTimeout(() => { api.busy(false); api.veil("ok","Pratinjau berhasil","Simulasi tampilan sukses. Tidak ada permintaan jaringan.","Tutup"); }, 800);
  });
}

function setState(s){
  app.querySelectorAll("[data-state]").forEach(b => b.dataset.on = b.dataset.state === s ? "1" : "0");
  if (!VIEW) return;
  VIEW.closeVeil(); VIEW.busy(false); VIEW.attempts(0);
  VIEW.refs.hint.className = "lgv-hint"; VIEW.refs.hint.textContent = "Token tidak pernah ditulis ke repositori.";
  if (s === "busy") VIEW.busy(true, "Memvalidasi token…");
  if (s === "error") { VIEW.attempts(Math.min(2, C.batas_percobaan)); VIEW.error("Token ditolak GitHub (401). Periksa nilai dan masa berlaku PAT."); }
  if (s === "lock") { VIEW.attempts(C.batas_percobaan); VIEW.busy(true, "Terkunci " + C.kunci_detik + "s"); VIEW.veil("bad","Terlalu banyak percobaan","Form dikunci sementara selama "+C.kunci_detik+" detik.","Mengerti"); }
  if (s === "success") VIEW.veil("ok","Selamat datang, admin","Izin tulis terverifikasi. Mengalihkan ke "+C.redirect+"…","Masuk sekarang");
}

function wire(rc){
  const live = () => {
    CTRL.forEach(c => {
      const e = el("lg_" + c.k); if (!e) return;
      if (c.t === "color") {
        const t = el("lgt_" + c.k);
        C[c.k] = (t && t.value.trim()) ? t.value.trim() : "";
        if (t && !t.value.trim()) { /* kosong = pakai palet */ }
      } else C[c.k] = c.t === "tog" ? e.checked : c.t === "range" ? +e.value : e.value;
      const lb = el("lgv_" + c.k); if (lb) lb.textContent = c.fmt ? c.fmt(C[c.k]) : C[c.k];
    });
    paintPreview(); setState("normal");
  };
  CTRL.forEach(c => {
    const e = el("lg_" + c.k); if (!e) return;
    e.oninput = () => { if (c.t === "color") { const t = el("lgt_" + c.k); if (t) t.value = e.value; } live(); };
    e.onchange = live;
    if (c.t === "color") { const t = el("lgt_" + c.k); if (t) t.oninput = live; }
  });

  app.querySelectorAll("[data-lf]").forEach(f => f.oninput = () => {
    const kind = f.dataset.lf, i = +f.dataset.li;
    if (kind === "features") C.features[i] = f.value;
    else C[kind][i][f.dataset.lk] = f.value;
    paintPreview(); setState("normal");
  });
  app.querySelectorAll("[data-ladd]").forEach(b => b.onclick = () => {
    const k = b.dataset.ladd;
    if (k === "features") C.features.push("Keunggulan baru");
    else if (k === "catatan") C.catatan.push({ ikon:"shield-check", teks:"Catatan keamanan baru." });
    else C.bantuan.push({ q:"Pertanyaan baru?", a:"Jawaban singkat dan jelas." });
    render();
  });
  app.querySelectorAll("[data-lrm]").forEach(b => b.onclick = () => {
    const k = b.dataset.lrm, i = +b.dataset.li, prev = JSON.parse(JSON.stringify(k === "features" ? C.features : C[k]));
    (k === "features" ? C.features : C[k]).splice(i, 1); render();
    undo("Butir dihapus", () => { if (k === "features") C.features = prev; else C[k] = prev; render(); });
  });
  app.querySelectorAll("[data-lup]").forEach(b => b.onclick = () => { const a = C[b.dataset.lup], i = +b.dataset.li; if (i > 0) { [a[i-1], a[i]] = [a[i], a[i-1]]; render(); } });
  app.querySelectorAll("[data-ldn]").forEach(b => b.onclick = () => { const a = C[b.dataset.ldn], i = +b.dataset.li; if (i < a.length-1) { [a[i+1], a[i]] = [a[i], a[i+1]]; render(); } });

  app.querySelectorAll("[data-dev]").forEach(b => b.onclick = () => {
    device = b.dataset.dev;
    app.querySelectorAll("[data-dev]").forEach(x => x.dataset.on = x.dataset.dev === device ? "1" : "0");
    paintPreview(); setState("normal");
  });
  app.querySelectorAll("[data-state]").forEach(b => b.onclick = () => setState(b.dataset.state));

  el("lgSave").onclick = async () => {
    const snap = JSON.parse(JSON.stringify(C));
    const ok = await saveData("login.json", C, "Konten Website", "UPDATE FORM LOGIN", C.tema + " · " + C.tata_letak + " · sesi " + C.sesi_menit + "m");
    if (ok) toast("Pengaturan login tersimpan. Buka login.html untuk melihat hasilnya.", "success");
    else { C = snap; render(); }
  };
  el("lgReset").onclick = () => { const prev = JSON.parse(JSON.stringify(C)); C = { ...LV.DEF }; render(); undo("Pengaturan login direset", () => { C = prev; render(); }); };
  el("lgRandom").onclick = () => {
    const prev = JSON.parse(JSON.stringify(C));
    const keys = Object.keys(LV.THEMES), pick = a => a[Math.floor(Math.random()*a.length)];
    C.tema = pick(keys); C.latar = pick(LATAR)[0]; C.tata_letak = pick(LAYOUT)[0];
    C.kepadatan = pick(DENS)[0]; C.radius = Math.floor(Math.random()*17)*2; C.blur = 8 + Math.floor(Math.random()*26);
    C.overlay = 45 + Math.floor(Math.random()*45); C.grain_intensitas = Math.floor(Math.random()*14);
    C.aurora_kecepatan = 10 + Math.floor(Math.random()*50); C.panel_posisi = Math.random() < .5 ? "kiri" : "kanan";
    C.aksen = ""; C.aksen2 = "";
    render(); undo("Tampilan login diacak", () => { C = prev; render(); });
  };
  el("lgExport").onclick = () => download("login.json", JSON.stringify(C, null, 2));
  el("lgImport").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const o = JSON.parse(await f.text()); const prev = JSON.parse(JSON.stringify(C));
      C = LoginView.norm(o).cfg; render(); undo("Konfigurasi diimpor", () => { C = prev; render(); });
      toast("Konfigurasi dimuat ke pratinjau — klik Simpan untuk menerapkan.", "info");
    } catch (err) { toast("File JSON tidak valid: " + err.message, "error"); }
    e.target.value = "";
  };
  el("lgPresetSave").onclick = () => {
    const n = prompt("Nama preset login:", "Login " + (LV.THEMES[C.tema]||{}).label);
    if (!n) return;
    const p = presets(); p.push({ name:n.slice(0,32), cfg:JSON.parse(JSON.stringify(C)) }); setPresets(p); renderPresets();
    toast("Preset tersimpan di perangkat ini.", "success");
  };
  const QUICK = [{tema:"zamrud",latar:"mesh",tata_letak:"split"},{tema:"nila",latar:"grid",tata_letak:"split",panel_posisi:"kanan"},{tema:"ambar",latar:"aurora",tata_letak:"terpusat",segel:false},{tema:"kuarsa",latar:"mesh",kepadatan:"padat",radius:12},{tema:"laut",latar:"aurora",tata_letak:"lebar",lebar_kartu:560}];
  app.querySelectorAll("[data-qp]").forEach(b => b.onclick = () => {
    const prev = JSON.parse(JSON.stringify(C));
    C = { ...C, ...QUICK[+b.dataset.qp], aksen:"", aksen2:"" };
    render(); undo("Preset cepat diterapkan", () => { C = prev; render(); });
  });
}

function renderPresets(){
  const host = el("lgPresets"); if (!host) return;
  const p = presets();
  host.innerHTML = p.length ? p.map((x,i)=>'<span class="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-slate-100 border border-slate-200"><button type="button" data-lp="'+i+'" class="text-[11px] font-bold text-slate-600 hover:text-emerald-700">'+esc(x.name)+'</button><button type="button" data-ld="'+i+'" class="w-5 h-5 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center">×</button></span>').join("")
    : '<span class="text-[11px] text-slate-400">Belum ada preset tersimpan.</span>';
  host.querySelectorAll("[data-lp]").forEach(b => b.onclick = () => { const prev = JSON.parse(JSON.stringify(C)); C = LoginView.norm(presets()[+b.dataset.lp].cfg).cfg; render(); undo("Preset diterapkan", () => { C = prev; render(); }); });
  host.querySelectorAll("[data-ld]").forEach(b => b.onclick = () => { const p = presets(), rm = p.splice(+b.dataset.ld,1)[0]; setPresets(p); renderPresets(); undo('Preset "'+rm.name+'" dihapus', () => { const q = presets(); q.push(rm); setPresets(q); renderPresets(); }); });
}

function undo(label, restore){
  let bar = el("lgUndoBar");
  if (!bar) { bar = document.createElement("div"); bar.id = "lgUndoBar"; document.body.appendChild(bar); }
  bar.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-sm";
  bar.innerHTML = '<i data-lucide="undo-2" class="w-4 h-4 text-amber-400"></i><span>' + esc(label) + '</span><button type="button" id="lgUndoBtn" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-900">Urungkan</button>';
  refreshIcons();
  el("lgUndoBtn").onclick = () => { restore(); const b = el("lgUndoBar"); if (b) b.remove(); toast("Perubahan diurungkan.", "success"); };
  clearTimeout(undoT); undoT = setTimeout(() => { const b = el("lgUndoBar"); if (b) b.remove(); }, 9000);
}

async function renderLoginCfg(){
  if (!window.LoginView) { app.innerHTML = '<div class="p-6 text-sm text-rose-600">login-view.js belum dimuat. Pastikan berkas ada di root dan dimuat sebelum admin-login.js.</div>'; return; }
  let saved = {}; try { saved = await fetchJSON("login.json"); } catch (e) {}
  C = LoginView.norm(saved).cfg;
  try { const s = await fetchJSON("settings.json"); SCHOOL = s.nama_sekolah || ""; } catch (e) {}
  device = "desktop"; mounted = true;
  render();
}

if (typeof MOD !== "undefined") MOD.login = { title:"Pengaturan Form Login", desc:"Tampilan & keamanan login.html", render: renderLoginCfg };

(function nav(){
  const n = el("nav");
  if (!n || n.querySelector('[data-nav="login"]')) return;
  const anchor = n.querySelector('[data-nav="galeri"]') || n.querySelector('[data-nav="slider"]') || n.querySelector('[data-nav="kegiatan"]');
  const html = '<a href="#/login" data-nav="login" class="navlink flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800"><i data-lucide="shield-check" class="w-4 h-4"></i>Pengaturan Form Login</a>';
  if (anchor) anchor.insertAdjacentHTML("afterend", html);
  else {
    const g = document.createElement("div");
    g.innerHTML = '<div class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Konten Website</div>' + html;
    const sys = [...n.children].find(c => c.textContent.trim().startsWith("Sistem"));
    n.insertBefore(g, sys || null);
  }
  refreshIcons();
})();

window.addEventListener("hashchange", () => { if (location.hash.replace("#/","") !== "login") VIEW = null; });
if (location.hash.replace("#/","") === "login" && typeof route === "function") route();
})();