// ============================================================
// app.js — Library inti + Kerangka Antarmuka Terkonfigurasi
// Header, Body (index.html), Footer, tema, FAB, progres baca.
// Sumber kebenaran: data/ui.json (dikelola admin-ui.js).
// TOKEN TIDAK BOLEH DI-HARDCODE
// ============================================================
if (typeof window.$ !== "function") window.$ = id => document.getElementById(id);
if (typeof window.$$ !== "function") window.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));

function repoCfg() {
  const c = window.APP_CONFIG || {};
  let owner = (c.GITHUB_USERNAME || "").trim(), repo = (c.GITHUB_REPO || "").trim();
  const branch = (c.GITHUB_BRANCH || "main").trim();
  if (owner.startsWith("GANTI")) owner = "";
  if (repo.startsWith("GANTI")) repo = "";
  const h = location.hostname;
  if (h.endsWith(".github.io")) {
    if (!owner) owner = h.split(".")[0];
    if (!repo) { const s = location.pathname.split("/").filter(Boolean); repo = (s.length && !s[0].endsWith(".html")) ? s[0] : owner + ".github.io"; }
  }
  return { owner, repo, branch };
}
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const trunc = (v, n = 60) => { const s = String(v ?? ""); return s.length > n ? s.slice(0, n) + "…" : s; };
const fmtRp = v => new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", minimumFractionDigits:0 }).format(Number(v) || 0);
const fmtTgl = v => { if (!v) return "-"; const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" }); };
const fmtWaktu = v => { if (!v) return "-"; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString("id-ID", { dateStyle:"medium", timeStyle:"short" }); };
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
const nowTime = () => { const d = new Date(); return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0"); };
const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
// PERF: di beranda, banyak render memanggil refreshIcons() berturut-turut. Setiap panggilan memindai
// seluruh DOM. Digabung menjadi satu pemindaian per ~16 ms agar thread utama (slider) tidak tersendat.
let _riT = 0;
const _homePage = () => !window.__LS_PAGE__ && /\/(index\.html)?$/i.test(location.pathname);
const refreshIcons = () => {
  if (!window.lucide) return;
  if (!_homePage()) { lucide.createIcons(); return; }
  if (_riT) return;
  _riT = setTimeout(() => { _riT = 0; try { lucide.createIcons(); } catch (e) {} }, 16);
};
window.__lsRefreshIcons = refreshIcons;
function b64enc(str){ const b=new TextEncoder().encode(str); let s=""; for(let i=0;i<b.length;i++) s+=String.fromCharCode(b[i]); return btoa(s); }
function download(name, text, mime="application/json"){ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:mime+";charset=utf-8"})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
function toCSV(rows, cols){ const q=v=>'"'+String(v??"").replace(/"/g,'""')+'"'; return [cols.map(c=>q(c.l)).join(","),...rows.map(r=>cols.map(c=>q(r[c.k])).join(","))].join("\r\n"); }
const PRINT_CSS = "body{font-family:Arial,sans-serif;color:#0f172a;padding:24px;font-size:13px}h1,h2,h3{margin:0 0 4px}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #94a3b8;padding:6px 8px;text-align:left}th{background:#f1f5f9}.muted{color:#64748b}.center{text-align:center}.right{text-align:right}.grid{display:flex;flex-wrap:wrap;gap:12px}.card{border:1px solid #94a3b8;border-radius:8px;padding:10px;width:150px;text-align:center}.ttd{display:flex;justify-content:space-between;margin-top:32px}.ttd div{width:220px;text-align:center}";
// FIXED: window.open() mengembalikan null bila pop-up diblokir browser -> dulu "Cannot read properties of null (reading 'document')"
function openPrintWindow(html){
  const w=window.open("","_blank");
  if(!w){ const m="Jendela cetak diblokir browser. Izinkan pop-up untuk situs ini lalu coba lagi."; if(typeof toast==="function") toast(m,"error"); else alert(m); return null; }
  w.document.write(html); w.document.close(); setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} },400); return w;
}
function printHTML(title, body){ return openPrintWindow('<!DOCTYPE html><html><head><title>'+esc(title)+'</title><style>'+PRINT_CSS+'</style></head><body>'+body+'</body></html>'); }
function ytEmbed(u){ try{ const x=new URL(u); if(x.hostname.includes("youtu.be")) return "https://www.youtube.com/embed/"+x.pathname.slice(1); if(x.searchParams.get("v")) return "https://www.youtube.com/embed/"+x.searchParams.get("v"); }catch(e){} return u; }
let _lc = 0;
function showLoading(t="Memproses…"){ _lc++; let e=document.getElementById("loading"); if(!e){ e=document.createElement("div"); e.id="loading"; e.className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center"; e.innerHTML='<div class="bg-white rounded-2xl shadow-xl px-6 py-5 flex items-center gap-3"><div class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div><span id="loadingTxt" class="text-sm font-semibold text-slate-700"></span></div>'; document.body.appendChild(e);} document.getElementById("loadingTxt").textContent=t; e.classList.remove("hidden"); }
function hideLoading(){ _lc=Math.max(0,_lc-1); if(!_lc){ const e=document.getElementById("loading"); if(e) e.classList.add("hidden"); } }
function toast(msg, type="info"){
  let w=document.getElementById("toasts");
  if(!w){ w=document.createElement("div"); w.id="toasts"; w.className="fixed bottom-4 right-4 z-[100] space-y-2"; document.body.appendChild(w); }
  const c={success:"bg-emerald-600",error:"bg-rose-600",info:"bg-slate-800"}[type]||"bg-slate-800";
  const i={success:"circle-check",error:"triangle-alert",info:"info"}[type]||"info";
  const e=document.createElement("div"); e.className=c+" text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-start gap-2";
  e.innerHTML='<i data-lucide="'+i+'" class="w-4 h-4 mt-0.5 shrink-0"></i><span>'+esc(msg)+"</span>";
  w.appendChild(e); refreshIcons(); setTimeout(()=>e.remove(),4500);
}
// FIXED (bug 10 — lost update): SHA file dilacak sejak DIBACA. Sebelumnya pushJSON() mengambil SHA terbaru tepat sebelum PUT,
// sehingga data basi dari cache (10 menit) / CDN Pages menimpa perubahan admin atau tab lain tanpa error.
// Kini: sesi admin (ada token) membaca lewat Contents API (otomatis segar, tanpa lag CDN) dan menyimpan SHA;
// PUT memakai SHA itu, dan bila file sudah berubah GitHub menjawab 409 -> ditolak dengan pesan jelas, bukan ditimpa.
const SHA_MEM = {};
const b64dec = b64 => { const bin = atob(String(b64).replace(/\s/g, "")); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); };
async function fetchViaAPI(file){
  // Hanya untuk sesi admin. Mengembalikan {d, sha} atau null (lalu jatuh ke jalur publik lama).
  const token = sessionStorage.getItem("gh_token"); if(!token) return null;
  const {owner,repo,branch}=repoCfg(); if(!owner||!repo) return null;
  try{
    const r = await fetch("https://api.github.com/repos/"+owner+"/"+repo+"/contents/data/"+encodeURIComponent(file)+"?ref="+encodeURIComponent(branch)+"&t="+Date.now(),
      {headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json"},cache:"no-store"});
    if(!r.ok) return null;
    const j = await r.json();
    if(!j || !j.sha || j.encoding!=="base64" || !j.content) return null; // file >1MB: content kosong -> jalur lama
    return { d: JSON.parse(b64dec(j.content)), sha: j.sha };
  }catch(e){ return null; }
}
// FIXED: pengaturan identitas sekolah & tampilan (settings/ui) memakai cache sesi singkat (1 menit, bukan 10 menit)
// dan cache-buster per menit, agar perubahan dari Panel Admin cepat terlihat di halaman publik.
const SHORT_TTL = /^(settings|ui)\.json$/;
const _INFLIGHT = {};
const _idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 200));
function fetchJSON(file, force=false){
  // PERF: permintaan yang sama dari beberapa modul dipakai bersama (tidak diunduh ganda)
  const key = file + (force ? "|f" : "");
  if (_INFLIGHT[key]) return _INFLIGHT[key];
  const pr = _fetchJSON(file, force).finally(() => { delete _INFLIGHT[key]; });
  _INFLIGHT[key] = pr;
  return pr;
}
async function _fetchJSON(file, force=false){
  const k="sicache:"+file;
  if(!force){ try{ const c=JSON.parse(sessionStorage.getItem(k)); if(c&&Date.now()-c.t<(SHORT_TTL.test(file)?60000:600000)){ if(c.s) SHA_MEM[file]=c.s; else delete SHA_MEM[file]; return c.d; } }catch(e){} }
  let d=null, sha=null;
  // PERF: ?t= per 5 menit (bukan per milidetik) -> cache HTTP browser bisa dipakai, tetap cukup segar
  const bust = force ? Date.now() : Math.floor(Date.now()/(SHORT_TTL.test(file)?60000:300000));
  const api = await fetchViaAPI(file);          // FIXED: sumber otoritatif untuk admin (+ SHA)
  if(api){ d=api.d; sha=api.sha; }
  if(d===null){ try{ const r=await fetch("data/"+file+"?t="+bust); if(r.ok) d=await r.json(); }catch(e){} }
  if(d===null){ const {owner,repo,branch}=repoCfg(); if(!owner||!repo) throw new Error("Gagal memuat "+file+". Isi config.js atau jalankan dari GitHub Pages.");
    const r2=await fetch("https://raw.githubusercontent.com/"+owner+"/"+repo+"/"+branch+"/data/"+file+"?t="+bust);
    if(!r2.ok) throw new Error("Gagal memuat "+file+" ("+r2.status+")"); d=await r2.json(); }
  if(sha) SHA_MEM[file]=sha; else delete SHA_MEM[file];
  const t=Date.now();
  // PERF: JSON.stringify + sessionStorage.setItem bersifat sinkron; tunda ke saat idle
  _idle(()=>{ try{ sessionStorage.setItem(k,JSON.stringify({t,d,s:sha})); }catch(e){} });
  return d;
}
function clearDataCache(){ Object.keys(sessionStorage).filter(k=>k.startsWith("sicache:")).forEach(k=>sessionStorage.removeItem(k)); Object.keys(SHA_MEM).forEach(k=>delete SHA_MEM[k]); /* FIXED: SHA ikut dibersihkan */ }
async function pushJSON(file, data, retry=false){
  // TOKEN TIDAK BOLEH DI-HARDCODE
  const token=sessionStorage.getItem("gh_token");
  if(!token) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const {owner,repo,branch}=repoCfg();
  if(!owner||!repo) throw new Error("Konfigurasi repo belum diisi (config.js).");
  const url="https://api.github.com/repos/"+owner+"/"+repo+"/contents/data/"+file;
  // FIXED: Content-Type pada GET membuat browser mengirim preflight CORS tambahan; header itu kini hanya dipakai di PUT.
  const H={Authorization:"Bearer "+token,Accept:"application/vnd.github+json"};
  // FIXED (bug 10): bila SHA hasil baca tersedia, pakai itu (deteksi konflik). Hanya bila tidak ada (mis. seeder / file baru) ambil SHA terkini seperti dulu.
  const tracked = !retry && SHA_MEM[file] ? SHA_MEM[file] : null;
  let sha = tracked;
  if(!sha){
    const g=await fetch(url+"?ref="+branch+"&t="+Date.now(),{headers:H});
    if(g.ok) sha=(await g.json()).sha;
    else if(g.status===401) throw new Error("Token tidak valid / kedaluwarsa. Login ulang.");
    // FIXED: 403 (izin token kurang / rate limit) kini dijelaskan terpisah dari galat umum agar mudah didiagnosis.
    else if(g.status===403) throw new Error("Akses ditolak (403). Pastikan token punya izin Contents: Read and write untuk repo ini, atau tunggu jika kena rate limit GitHub.");
    else if(g.status!==404) throw new Error("GET SHA gagal ("+g.status+"). Cek izin token & nama repo.");
  }
  const body={message:"Update "+file,content:b64enc(JSON.stringify(data,null,2)),branch};
  if(sha) body.sha=sha;
  // FIXED: Content-Type ditambahkan di sini saja (hanya PUT yang punya body JSON).
  const p=await fetch(url,{method:"PUT",headers:{...H,"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(p.ok){ const j=await p.json(); const ns=j&&j.content&&j.content.sha; if(ns) SHA_MEM[file]=ns; else delete SHA_MEM[file];
    try{ sessionStorage.setItem("sicache:"+file,JSON.stringify({t:Date.now(),d:data,s:ns||null})); }catch(e){} return j; }
  if(tracked && (p.status===409||p.status===422)){
    // FIXED (bug 10): file sudah diubah pihak lain sejak dibaca -> JANGAN timpa. Bersihkan cache & salinan memori agar percobaan berikutnya memakai data terbaru.
    clearDataCache();
    try{ if(typeof mem!=="undefined") Object.keys(mem).forEach(x=>delete mem[x]); }catch(e){}
    throw new Error("Konflik: "+file+" sudah diubah dari tab/perangkat lain. Data telah dimuat ulang — periksa lalu simpan lagi (isian form Anda masih ada).");
  }
  if((p.status===409||p.status===422)&&!retry) return pushJSON(file,data,true);
  throw new Error("PUT gagal ("+p.status+"): "+trunc(await p.text(),160));
}
async function saveData(file, data, modul, aksi, detail){
  showLoading("Menyimpan ke GitHub…");
  try{
    await pushJSON(file,data);
    // FIXED: audit.json dibaca paksa-segar (force=true). Sebelumnya memakai cache sesi hingga 10 menit, sehingga entri log dari tab/admin lain bisa tertimpa saat PUT.
    try{ let log=[]; try{ log=await fetchJSON("audit.json",true); }catch(e){}
      log.unshift({id:uid(),waktu:new Date().toISOString(),aktor:sessionStorage.getItem("gh_user")||"admin",modul,aksi,detail:String(detail||"").slice(0,200)});
      await pushJSON("audit.json",log.slice(0,500));
    }catch(e){ console.warn("Audit gagal:",e); }
    toast("Berhasil: "+aksi+' — commit "Update '+file+'" terkirim.',"success");
    return true;
  }catch(e){ toast(e.message,"error"); return false; }
  finally{ hideLoading(); }
}
// FIXED: sebelumnya hanya cek token ada/tidak; sesi yang sudah lewat gh_token_exp tetap lolos sampai guard di admin-login.js (dimuat belakangan). Sekarang kedaluwarsa dicek langsung di sini.
function requireAuth(){
  const exp = Number(sessionStorage.getItem("gh_token_exp") || 0);
  const expired = exp && Date.now() > exp;
  if (expired) ["gh_token","gh_user","gh_avatar","gh_token_exp"].forEach(k => sessionStorage.removeItem(k));
  if (!sessionStorage.getItem("gh_token")) location.replace(window.siteUrl ? siteUrl("login") : "login/");
}
function logout(){ Object.keys(SHA_MEM).forEach(k=>delete SHA_MEM[k]); /* FIXED: bersihkan SHA saat logout */ Object.keys(sessionStorage).filter(k=>["gh_token","gh_user","gh_avatar","wa_key","gh_token_exp"].includes(k)||k.startsWith("sicache:")).forEach(k=>sessionStorage.removeItem(k)); location.replace("login.html"); }

// ============================================================
// ABOUT US — Founder/Ketua Yayasan (beranda) & Kepala Sekolah per jenjang (SD/SMP/SMA/SMK)
// Sumber data TUNGGAL: data/settings.json (founder, kepsek_jenjang) <- Panel Admin -> Pengaturan Sekolah.
// aboutData() dipakai bersama oleh index.html dan program.js agar isi About Us selalu sama.
// ============================================================
function aboutData(st, level){
  st=st||{}; const nm=st.nama_sekolah||"sekolah kami", L=level?String(level).toUpperCase():"";
  const fill=t=>String(t||"").replace(/\{sekolah\}/gi,nm).trim();
  let o;
  if(!L){
    const f=st.founder||{};
    o={ peran:f.jabatan||"Founder & Ketua Yayasan", nama:f.nama||"—", nip:"",
        sambutan:fill(f.sambutan)||"Selamat datang di "+nm+". Kami berkomitmen menghadirkan lingkungan belajar yang aman, hangat, dan menginspirasi agar setiap anak tumbuh menjadi pribadi yang berilmu, berakhlak mulia, dan kreatif." };
  } else {
    const k=(st.kepsek_jenjang||{})[L]||{};
    o={ peran:"Kepala Sekolah "+L, nama:k.nama||st.kepala_sekolah||"—", nip:k.nip||(k.nama?"":st.nip_kepsek)||"",
        sambutan:fill(k.sambutan)||"Selamat datang di jenjang "+L+" "+nm+". Kami berkomitmen memberikan pembelajaran yang bermakna dan pendampingan terbaik bagi setiap siswa." };
  }
  o.paragraf=o.sambutan.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  return o;
}
function fillAbout(st, level){
  const a=aboutData(st,level), set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  const t=document.getElementById("aboutText");
  if(t) t.innerHTML=a.paragraf.map(x=>"<p>"+esc(x)+"</p>").join("");
  set("aboutRole",a.peran); set("aboutPerson",a.nama);
  const n=document.getElementById("aboutNip"); if(n){ n.textContent=a.nip?"NIP. "+a.nip:""; n.style.display=a.nip?"":"none"; }
}

// ============================================================
// LSUI — mesin antarmuka terkonfigurasi
// ============================================================
const LSUI = (() => {
"use strict";
// FIXED: pada URL bersih (/admin/, /login/, ...) segmen terakhir kosong sehingga dulu dianggap beranda.
const PAGE = (window.__LS_PAGE__ ? window.__LS_PAGE__ + ".html" : (location.pathname.split("/").pop() || "index.html")).toLowerCase();
const HOME = PAGE === "" || PAGE === "index.html";
const APP = /^(admin|seed)\.html$/.test(PAGE);
const AUTH = PAGE === "login.html";
const PREVIEW = new URLSearchParams(location.search).get("uipreview") === "1";
const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const THEMES = {
  zamrud:{label:"Zamrud Sekolah",p:"#16a34a",a:"#fbbf24",a2:"#0d9488",ink:"#0f172a",sf:"#ffffff",mu:"#64748b",ln:"#e2e8f0",tr:"#f0fdf4"},
  nila:{label:"Nila Akademik",p:"#4f46e5",a:"#22d3ee",a2:"#a3e635",ink:"#111827",sf:"#ffffff",mu:"#6b7280",ln:"#e5e7eb",tr:"#eef2ff"},
  laut:{label:"Laut Nusantara",p:"#0284c7",a:"#f59e0b",a2:"#14b8a6",ink:"#0b1a24",sf:"#ffffff",mu:"#5b7383",ln:"#dbe7ee",tr:"#eff8ff"},
  ambar:{label:"Ambar Ceria",p:"#d97706",a:"#e11d48",a2:"#0d9488",ink:"#1c1207",sf:"#fffdf8",mu:"#7c6a52",ln:"#f0e4d0",tr:"#fffbeb"},
  kuarsa:{label:"Kuarsa Modern",p:"#db2777",a:"#8b5cf6",a2:"#06b6d4",ink:"#1a0d16",sf:"#ffffff",mu:"#7a6472",ln:"#f2dcea",tr:"#fdf2f8"},
  hutan:{label:"Hutan Tenang",p:"#047857",a:"#ca8a04",a2:"#0891b2",ink:"#0a1512",sf:"#fbfdfc",mu:"#5f7a70",ln:"#dcece5",tr:"#ecfdf5"}
};
const FONTS = ["Poppins","Inter","Space Grotesk","Plus Jakarta Sans","Sora","Manrope","Outfit","Fraunces","Playfair Display","Nunito"];
const BGVAR = ["putih","mint","abu","gradien","gelap","transparan"];
const WARNA = ["brand","sky","violet","amber","rose","teal","indigo","lime"];
const SECTIONS = [["beranda","Hero Slider"],["statistik","Statistik"],["berita","Berita"],["profil","Profil"],["program","Program"],["kegiatan","Galeri Kegiatan"],["akademik","Agenda Akademik"],["fasilitas","Fasilitas"],["kontak","Kontak"]];

const DEF = {
  versi:1,
  tema:{preset:"zamrud",primary:"",accent:"",accent2:"",success:"#16a34a",warning:"#f59e0b",danger:"#e11d48",info:"#0ea5e9",
    ink:"#0f172a",surface:"#ffffff",muted:"#64748b",line:"#e2e8f0",track:"#f0fdf4",
    fontDisplay:"Poppins",fontBody:"Inter",radius:24,skala:1,lebar:1280,ritme:64,animasi:true,reveal:true,
    latar:"mesh",grain:true,grainInt:6,aurora:true,auroraSpeed:26,blur:30,scrollbar:"palet"},
  header:{aktif:true,sticky:true,tinggi:72,blur:12,transparan:92,border:true,bayangan:true,lebar:1280,
    logoIkon:"school",logoGambar:"",logoBentuk:"kotak",logoUkuran:40,tampilkanNama:true,tampilkanNpsn:true,namaOverride:"",subOverride:"",
    topbarAktif:false,topbarTeks:"Penerimaan Peserta Didik Baru telah dibuka — kuota terbatas.",topbarLabel:"Daftar",topbarHref:"ppdb.html",topbarWarna:"amber",topbarTinggi:34,
    nav:[{label:"Profil",href:"#profil",aktif:true},{label:"Program",href:"#program",aktif:true},{label:"Tuition Fee",href:"tuition.html",aktif:true},{label:"Kalender",href:"kalender.html",aktif:true},{label:"Kegiatan",href:"#kegiatan",aktif:true},{label:"Akademik",href:"#akademik",aktif:true},{label:"Fasilitas",href:"#fasilitas",aktif:true},{label:"Kontak",href:"#kontak",aktif:true}],
    navGaya:"garis",scrollspy:true,sembunyiSaatTurun:false,
    ctaAktif:true,ctaLabel:"Daftar Sekarang",ctaHref:"ppdb.html",ctaIkon:"user-plus",ctaWarna:"amber",
    cta2Aktif:true,cta2Label:"Portal Ortu",cta2Href:"portal.html",menuAnimasi:true},
  body:{urutan:SECTIONS.map(s=>s[0]),progresBaca:true,keAtas:true,seksi:{
    beranda:{aktif:true,latar:"transparan"},
    statistik:{aktif:true,latar:"transparan",overlap:true,animasiAngka:true,kolom:4,items:[
      {ikon:"users",label:"Siswa Aktif",sumber:"siswa",warna:"brand"},{ikon:"briefcase",label:"Guru & Tendik",sumber:"guru",warna:"sky"},
      {ikon:"school",label:"Rombel / Kelas",sumber:"kelas",warna:"violet"},{ikon:"library",label:"Koleksi Buku",sumber:"buku",warna:"amber"}]},
    berita:{aktif:true,latar:"putih",eyebrow:"",judul:"What's going on?",sub:"Kabar terbaru seputar kegiatan belajar, pengumuman, dan agenda sekolah.",jumlah:6,tautanLabel:"More Articles",tautanHref:"belajar.html",kolom:3},
    profil:{aktif:true,latar:"mint",eyebrow:"About Us",judul:"Tentang",teksOverride:"",foto:"",kepsekKartu:true,brosurAktif:true,brosurLabel:"Download E-Brochure",brosurIkon:"download",sosialLabel:"Stay Connected:",
      sosial:[{ikon:"message-circle",href:"wa",aktif:true},{ikon:"mail",href:"mail",aktif:true},{ikon:"instagram",href:"#kontak",aktif:true},{ikon:"youtube",href:"#kontak",aktif:true}]},
    program:{aktif:true,latar:"putih",eyebrow:"What We Have",judul:"Program Sekolah",sub:"Jenjang pendidikan yang kami layani dalam satu ekosistem digital terpadu.",kolom:4,tandaiJenjang:true,detailLabel:"Detail",kartu:[]},
    kegiatan:{aktif:true,latar:"mint",eyebrow:"School Activities"},
    akademik:{aktif:true,latar:"abu",eyebrow:"Kalender Akademik",judul:"Agenda Terdekat",jumlah:6,tautanLabel:"Lihat E-Learning",tautanHref:"belajar.html",kalenderTautan:true},
    fasilitas:{aktif:true,latar:"gelap",eyebrow:"Facilities",judul:"Fasilitas Sekolah",kolom:4,turAktif:true,turLabel:"Virtual Tour",turVideo:"https://www.youtube.com/embed/aqz-KE-bpKQ",items:[]},
    kontak:{aktif:true,latar:"putih",eyebrow:"Find Us Here",judul:"Kunjungi Sekolah Kami",petaAktif:true,petaZoom:15,petaTinggi:340,jamJudul:"Jam Layanan Administrasi",jamTeks:"Senin–Jumat, 07.00–15.00 WIB.",tombol:[]}
  }},
  footer:{aktif:true,latar:"#0f172a",teks:"#cbd5e1",garis:"#1e293b",kolom:5,brandAktif:true,brandTeks:"",brandLogo:true,
    sosial:[{ikon:"message-circle",href:"wa",aktif:true},{ikon:"mail",href:"mail",aktif:true},{ikon:"instagram",href:"#kontak",aktif:true},{ikon:"youtube",href:"#kontak",aktif:true}],
    grup:[{judul:"About Us",tautan:[{label:"Profil Sekolah",href:"#profil",aktif:true},{label:"Program",href:"#program",aktif:true},{label:"Fasilitas",href:"#fasilitas",aktif:true},{label:"Kontak",href:"#kontak",aktif:true}]},
      {judul:"Layanan",tautan:[{label:"PPDB Online",href:"ppdb.html",aktif:true},{label:"Portal Orang Tua",href:"portal.html",aktif:true},{label:"E-Learning",href:"belajar.html",aktif:true},{label:"Ujian CBT",href:"cbt.html",aktif:true}]},
      {judul:"Jelajahi",tautan:[{label:"Kegiatan Sekolah",href:"#kegiatan",aktif:true},{label:"Agenda Akademik",href:"#akademik",aktif:true},{label:"Berita",href:"#berita",aktif:true}]}],
    copyright:"© 2026 {sekolah}. Sistem Informasi Sekolah statis (GitHub Pages).",
    catatan:"Slider & konten dikelola dari Panel Admin • data/*.json",
    gateAktif:true,gateOpasitas:20,gatePosisi:"tengah",gateHref:"login.html",gateLabel:"Area Administrator"},
  fab:{waAktif:true,waPosisi:"kanan-bawah",waUkuran:56,waWarna:"primary",waPulse:true,waTooltip:"Chat WhatsApp",waPesan:"Assalamualaikum, saya ingin bertanya tentang sekolah."}
};

const deep = o => JSON.parse(JSON.stringify(o));
function merge(base, add){
  const out = Array.isArray(base) ? (Array.isArray(add) ? add.slice() : base.slice()) : { ...base };
  if (add && typeof add === "object" && !Array.isArray(add))
    Object.keys(add).forEach(k => { out[k] = (base && typeof base[k] === "object" && base[k] && !Array.isArray(base[k])) ? merge(base[k], add[k]) : add[k]; });
  return out;
}
const clamp = (v,a,b) => Math.max(a, Math.min(b, Number(v)||0));
function norm(c){
  const m = merge(DEF, c || {});
  const t = m.tema, th = THEMES[t.preset] || THEMES.zamrud;
  t.primary = /^#[0-9a-f]{6}$/i.test(t.primary||"") ? t.primary : th.p;
  t.accent = /^#[0-9a-f]{6}$/i.test(t.accent||"") ? t.accent : th.a;
  t.accent2 = /^#[0-9a-f]{6}$/i.test(t.accent2||"") ? t.accent2 : th.a2;
  ["ink","surface","muted","line","track"].forEach((k,i)=>{ if(!/^#[0-9a-f]{6}$/i.test(t[k]||"")) t[k]=[th.ink,th.sf,th.mu,th.ln,th.tr][i]; });
  t.radius=clamp(t.radius,0,40); t.skala=Math.max(.85,Math.min(1.2,Number(t.skala)||1));
  t.lebar=clamp(t.lebar,960,1680); t.ritme=clamp(t.ritme,24,140);
  t.grainInt=clamp(t.grainInt,0,20); t.auroraSpeed=clamp(t.auroraSpeed,6,90); t.blur=clamp(t.blur,0,60);
  const h=m.header; h.tinggi=clamp(h.tinggi,56,110); h.topbarTinggi=clamp(h.topbarTinggi,26,52);
  h.blur=clamp(h.blur,0,30); h.transparan=clamp(h.transparan,40,100); h.lebar=clamp(h.lebar,960,1680); h.logoUkuran=clamp(h.logoUkuran,28,56);
  h.nav=Array.isArray(h.nav)?h.nav:[];
  const f=m.footer; f.kolom=clamp(f.kolom,2,6); f.gateOpasitas=clamp(f.gateOpasitas,0,100);
  f.grup=Array.isArray(f.grup)?f.grup:[]; f.sosial=Array.isArray(f.sosial)?f.sosial:[];
  m.fab.waUkuran=clamp(m.fab.waUkuran,40,76);
  const order=m.body.urutan.filter(x=>SECTIONS.some(s=>s[0]===x));
  SECTIONS.forEach(s=>{ if(!order.includes(s[0])) order.push(s[0]); });
  m.body.urutan=order;
  return m;
}
function hx(h){ const s=String(h||"#000").replace("#",""); const n=s.length===3?s.split("").map(c=>c+c).join(""):s; const v=parseInt(n,16); return [(v>>16)&255,(v>>8)&255,v&255]; }
function sh(h,p){ const [r,g,b]=hx(h); const f=x=>Math.round(Math.max(0,Math.min(255,x+(p/100)*255))); return "#"+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
function al(h,a){ const [r,g,b]=hx(h); return "rgba("+r+","+g+","+b+","+a+")"; }
function lum(h){ const [r,g,b]=hx(h); return (0.2126*r+0.7152*g+0.0722*b)>150 ? "#0b1220" : "#ffffff"; }

let CFG = norm({}), ST = {}, DATA = {}, wired = false, hydrated = false, passes = 0, io = null, moT = 0;

/* ---------- CSS ---------- */
function css(){
  const t=CFG.tema, h=CFG.header, f=CFG.footer;
  const total=(h.aktif?h.tinggi:0)+(h.aktif&&h.topbarAktif?h.topbarTinggi:0);
  const r=t.radius, sc=CFG.tema.scrollbar;
  const th=sc==="palet"?t.primary:"#94a3b8", tr=sc==="palet"?t.track:"#f1f5f9";
  const mesh="radial-gradient(46% 40% at 10% 6%,"+al(t.primary,.16)+",transparent 62%),radial-gradient(40% 36% at 90% 2%,"+al(t.accent2,.14)+",transparent 64%),radial-gradient(44% 40% at 74% 96%,"+al(t.accent,.12)+",transparent 66%)";
  return `
:root{--p:${t.primary};--pd:${sh(t.primary,-16)};--pl:${sh(t.primary,26)};--p050:${sh(t.primary,44)};--p100:${sh(t.primary,36)};
--a:${t.accent};--a050:${sh(t.accent,34)};--a2:${t.accent2};--ok:${t.success};--warn:${t.warning};--bad:${t.danger};--info:${t.info};
--ink:${t.ink};--sf:${t.surface};--mu:${t.muted};--line:${t.line};--ls-max:${t.lebar}px;--hdr-h:${total}px;--ls-r:${r}px;--ls-ritme:${t.ritme}px;
--fd:"${t.fontDisplay}",Poppins,Inter,sans-serif;--fb:"${t.fontBody}",Inter,ui-sans-serif,system-ui,sans-serif}
html{font-size:${16*t.skala}px;overflow-x:clip;-webkit-text-size-adjust:100%;scroll-padding-top:calc(var(--hdr-h) + 14px);scrollbar-color:${th} ${tr};scrollbar-width:thin}
body{overflow-x:clip;width:100%;max-width:100%;position:relative;padding-top:var(--hdr-h);min-height:100vh;background:var(--sf);color:var(--ink);font-family:var(--fb)}
body>div.min-h-screen:first-child{min-height:calc(100vh - var(--hdr-h))}
img,svg,video,canvas,iframe{max-width:100%}iframe{border:0}
pre,code{overflow-wrap:anywhere;word-break:break-word}
.overflow-x-auto,.overflow-auto{max-width:100%;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
[class*="grid"]>*,[class*="flex"]>*{min-width:0}table{max-width:100%}
@media (max-width:640px){[class*="min-w-["]:not(table):not(thead):not(tbody):not(tr):not(th):not(td){min-width:0!important}.max-w-xs,.max-w-sm,.max-w-md{max-width:100%}h1{overflow-wrap:anywhere}}
::-webkit-scrollbar{width:11px;height:11px}::-webkit-scrollbar-track{background:${tr}}
::-webkit-scrollbar-thumb{background:linear-gradient(${th},${t.accent2});border-radius:99px;border:2px solid ${tr}}
::-webkit-scrollbar-thumb:hover{background:${sh(t.primary,-14)}}::-webkit-scrollbar-corner{background:${tr}}
.font-display,h1,h2,h3{font-family:var(--fd)}
.max-w-7xl,.max-w-6xl{max-width:var(--ls-max)!important}
.rounded-3xl{border-radius:var(--ls-r)!important}.rounded-2xl{border-radius:calc(var(--ls-r)*.78)!important}.rounded-xl{border-radius:calc(var(--ls-r)*.55)!important}
.bg-brand-600,.bg-brand-500{background-color:var(--p)!important}.bg-brand-700,.bg-brand-800{background-color:var(--pd)!important}
.bg-brand-100{background-color:var(--p100)!important}.bg-brand-50,.bg-brand-50\\/60,.bg-brand-50\\/70{background-color:var(--p050)!important}
.text-brand-600,.text-brand-700,.text-brand-800{color:var(--pd)!important}.text-brand-400{color:var(--pl)!important}
.border-brand-200,.border-brand-300,.border-brand-100{border-color:${al(t.primary,.28)}!important}
.hover\\:bg-brand-700:hover{background-color:var(--pd)!important}.hover\\:bg-brand-50:hover{background-color:var(--p050)!important}
.hover\\:text-brand-700:hover,.hover\\:text-brand-400:hover{color:var(--pd)!important}
.bg-amber-400{background-color:var(--a)!important}.hover\\:bg-amber-300:hover{background-color:${sh(t.accent,10)}!important}
.text-amber-300{color:${sh(t.accent,18)}!important}.text-amber-950{color:${lum(t.accent)}!important}
.from-brand-600,.from-brand-700,.from-brand-800{--tw-gradient-from:var(--pd)!important}
.to-teal-600,.to-teal-500{--tw-gradient-to:var(--a2)!important}
#lsHeader{transition:transform .32s cubic-bezier(.2,.7,.3,1),box-shadow .3s,background .3s}
#lsHeader.ls-hide{transform:translateY(-102%)}
#lsHeader.ls-scrolled{box-shadow:${h.bayangan?"0 12px 32px -20px rgba(15,23,42,.45)":"none"}}
#lsHeader .ls-link{position:relative}
#lsHeader .ls-link::after{content:"";position:absolute;left:12px;right:12px;bottom:4px;height:2px;border-radius:99px;background:linear-gradient(90deg,var(--p),var(--a2));transform:scaleX(0);transform-origin:left;transition:transform .28s cubic-bezier(.2,.7,.3,1);opacity:${h.navGaya==="garis"?1:0}}
#lsHeader .ls-link:hover::after,#lsHeader .ls-link[aria-current="page"]::after,#lsHeader .ls-link.ls-on::after{transform:scaleX(1)}
#lsHeader .ls-link.ls-btn,#lsHeader .ls-link.ls-btn[aria-current="page"],#lsHeader .ls-link.ls-btn.ls-on{background:var(--p);color:${lum(t.primary)};white-space:nowrap}
#lsHeader .ls-link.ls-btn:hover,#lsHeader .ls-link.ls-btn:focus-visible{background:var(--pd);color:${lum(t.primary)}}
#lsHeader .ls-link.ls-btn::after{display:none}
#lsHeader .ls-link[aria-current="page"],#lsHeader .ls-link.ls-on{color:var(--pd);background:${h.navGaya==="pil"?"var(--p050)":"transparent"}}
#lsMenu{display:grid;grid-template-rows:${h.menuAnimasi&&!reduce?"0fr":"1fr"};transition:grid-template-rows .34s cubic-bezier(.2,.7,.3,1)}
#lsMenu.ls-open{grid-template-rows:1fr}#lsMenu>div{overflow:hidden}
#lsMenu:not(.ls-open){visibility:${h.menuAnimasi&&!reduce?"hidden":"visible"}}
#lsSkip{position:absolute;left:-9999px;top:0;z-index:100}
#lsSkip:focus{left:12px;top:12px;padding:.6rem 1rem;border-radius:.75rem;background:var(--p);color:${lum(t.primary)};font-weight:700}
#lsProgress{position:fixed;top:0;left:0;height:3px;width:100%;transform:scaleX(0);transform-origin:0 50%;will-change:transform;z-index:70;background:linear-gradient(90deg,var(--p),var(--a2),var(--a))}
#lsTop{position:fixed;z-index:60;width:44px;height:44px;border-radius:99px;display:none;place-items:center;border:1px solid ${al(t.primary,.3)};background:${al(t.surface,.92)};color:var(--pd);backdrop-filter:blur(8px);box-shadow:0 14px 30px -16px rgba(15,23,42,.5);cursor:pointer;transition:transform .2s,opacity .25s}
#lsTop.on{display:grid}#lsTop:hover{transform:translateY(-3px)}
#adminGate{opacity:${f.gateOpasitas/100};transition:opacity .3s,color .3s}
#adminGate:hover,#adminGate:focus-visible{opacity:1}
#adminGate .gate-tip{opacity:0;transform:translate(-50%,4px);transition:opacity .2s,transform .2s}
#adminGate:hover .gate-tip,#adminGate:focus-visible .gate-tip{opacity:1;transform:translate(-50%,0)}
#toasts{max-width:min(24rem,calc(100vw - 2rem))!important}
[id$="UndoBar"]{max-width:calc(100vw - 1.5rem);flex-wrap:wrap;justify-content:center;text-align:center}
#lsFab{transition:transform .22s,box-shadow .22s}#lsFab:hover{transform:translateY(-3px) scale(1.04)}
#lsFab.ls-pulse::before{content:"";position:absolute;inset:0;border-radius:99px;border:2px solid currentColor;opacity:.5;animation:lsPulse 2.4s ease-out infinite}
@keyframes lsPulse{to{transform:scale(1.55);opacity:0}}
.ls-aurora{position:fixed;inset:0;z-index:-1;pointer-events:none;contain:strict;display:${t.aurora&&t.latar!=="polos"?"block":"none"}}
.ls-aurora i{position:absolute;display:block;border-radius:999px}
.ls-aurora i:nth-child(1){width:38vw;padding-bottom:38vw;left:-8vw;top:-6vw;background:radial-gradient(circle,${al(t.primary,.3)},transparent 68%)}
.ls-aurora i:nth-child(2){width:32vw;padding-bottom:32vw;right:-6vw;top:14vh;background:radial-gradient(circle,${al(t.accent2,.26)},transparent 68%)}
.ls-aurora i:nth-child(3){width:34vw;padding-bottom:34vw;left:36vw;bottom:-12vw;background:radial-gradient(circle,${al(t.accent,.22)},transparent 70%)}
.ls-mesh{position:fixed;inset:0;z-index:-2;pointer-events:none;background:${t.latar==="polos"?"none":mesh}}
.ls-grain{position:fixed;inset:0;z-index:-1;pointer-events:none;display:${t.grain?"block":"none"};opacity:${t.grain?t.grainInt/100:0};mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.ls-grid{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:${t.latar==="grid"?.5:0};background-image:linear-gradient(${al(t.line,.9)} 1px,transparent 1px),linear-gradient(90deg,${al(t.line,.9)} 1px,transparent 1px);background-size:54px 54px;mask-image:radial-gradient(70% 60% at 50% 30%,#000,transparent 86%)}
section.ls-sec{padding-top:var(--ls-ritme);padding-bottom:var(--ls-ritme)}
section.ls-light [class*="text-white"]{color:var(--ink)!important}
section.ls-light [class*="text-brand-100"]{color:var(--mu)!important}
section.ls-light [class*="bg-white/10"],section.ls-light [class*="bg-white/12"]{background:${al(t.ink,.04)}!important}
section.ls-light [class*="border-white/"]{border-color:var(--line)!important}
section.ls-dark .text-slate-800,section.ls-dark .text-slate-700,section.ls-dark .text-slate-600{color:#f8fafc!important}
section.ls-dark .text-slate-500,section.ls-dark .text-slate-400{color:${al("#ffffff",.72)}!important}
section.ls-dark .bg-white{background:${al("#ffffff",.08)}!important;border-color:${al("#ffffff",.16)}!important}
.ls-reveal{opacity:0;transform:translateY(20px);transition:opacity .6s cubic-bezier(.2,.7,.3,1),transform .6s cubic-bezier(.2,.7,.3,1)}
.ls-reveal.ls-in{opacity:1;transform:none}
html.ls-app{--hdr-h:0px}html.ls-app body{padding-top:0}
html.ls-app #lsHeader{z-index:60}
html.ls-app #sidebar{top:var(--hdr-h)!important;bottom:0;height:auto!important}
html.ls-app header:not(#lsHeader){top:var(--hdr-h)!important}
html.ls-auth body>div.min-h-screen{min-height:calc(100vh - var(--hdr-h))}
@media (prefers-reduced-motion:reduce){*{animation-duration:.001s!important;transition-duration:.001s!important}.ls-reveal{opacity:1;transform:none}}
${CFG.tema.animasi?"":"*{animation:none!important;transition:none!important}.ls-reveal{opacity:1;transform:none}"}
`;
}

/* ---------- markup ---------- */
const resolve = (href, ctx) => {
  const h = String(href || "");
  if (h === "wa") return "https://wa.me/" + String(ST.wa_admin || "").replace(/^0/, "62") + "?text=" + encodeURIComponent(CFG.fab.waPesan || "");
  if (h === "mail") return "mailto:" + (ST.email || "");
  if (h === "maps") return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(ST.alamat || "Indonesia");
  // Tautan selalu bersih (tanpa .html): "#x" di luar beranda -> <root>/#x ; "page.html" -> "page/"
  if (h.startsWith("#")) return HOME ? h : (window.siteUrl ? siteUrl("index", h) : "./" + h);
  return window.cleanUrl ? cleanUrl(h) : h;
};
// Menu "Tuition" tampil sebagai tombol hijau (gaya sama dengan tombol CTA "Daftar Sekarang": px-4 py-2.5 rounded-xl font-bold shadow-sm)
const isTuition = h => /(^|\/)tuition(\.html)?\/?(#.*)?$/i.test(String(h || ""));
const navActive = h => h === "tuition.html" ? PAGE === "tuition.html" : h === "kalender.html" ? PAGE === "kalender.html" : h === "#program" ? /^(sd|smp|sma|smk)\.html$/.test(PAGE) : false;

function headerHTML(){
  const h=CFG.header, t=CFG.tema;
  if(!h.aktif) return '<a id="lsSkip" href="#lsMain">Lewati ke konten</a><header id="lsHeader" data-ls="1" style="display:none"></header>';
  const logo=h.logoGambar
    ? '<img src="'+esc(h.logoGambar)+'" alt="" style="width:'+h.logoUkuran+'px;height:'+h.logoUkuran+'px;object-fit:cover;border-radius:'+(h.logoBentuk==="bulat"?"99px":h.logoBentuk==="bebas"?"0":"12px")+'">'
    : '<div style="width:'+h.logoUkuran+'px;height:'+h.logoUkuran+'px;border-radius:'+(h.logoBentuk==="bulat"?"99px":h.logoBentuk==="bebas"?"0":"12px")+';background:linear-gradient(140deg,var(--p),var(--a2));color:'+lum(t.primary)+'" class="flex items-center justify-center shrink-0 shadow-lg"><i data-lucide="'+esc(h.logoIkon)+'" style="width:'+(h.logoUkuran*.5)+'px;height:'+(h.logoUkuran*.5)+'px"></i></div>';
  const links=h.nav.filter(n=>n.aktif!==false).map(n=>'<a href="'+esc(resolve(n.href))+'" data-ls-nav="'+esc(n.href)+'"'+(navActive(n.href)?' aria-current="page"':"")+(isTuition(n.href)?' class="ls-link ls-btn px-4 py-2.5 rounded-xl font-bold shadow-sm transition mx-1">':' class="ls-link px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition">')+esc(n.label)+"</a>").join("");
  const mob=h.nav.filter(n=>n.aktif!==false).map(n=>'<a href="'+esc(resolve(n.href))+'" class="'+(isTuition(n.href)?'ls-link ls-btn block text-center px-3 py-2.5 rounded-xl font-bold shadow-sm':'ls-link block px-3 py-2.5 rounded-lg hover:bg-brand-50')+'">'+esc(n.label)+"</a>").join("");
  const top=h.topbarAktif?'<div style="height:'+h.topbarTinggi+'px;background:'+(h.topbarWarna==="amber"?"var(--a)":h.topbarWarna==="gelap"?"var(--ink)":"var(--p)")+';color:'+(h.topbarWarna==="amber"?lum(t.accent):h.topbarWarna==="gelap"?"#fff":lum(t.primary))+'" class="flex items-center"><div class="max-w-7xl mx-auto px-4 w-full flex items-center gap-3 text-[11.5px] font-semibold"><i data-lucide="megaphone" class="w-3.5 h-3.5 shrink-0"></i><span class="truncate flex-1">'+esc(h.topbarTeks)+'</span>'+(h.topbarLabel?'<a href="'+esc(resolve(h.topbarHref))+'" class="shrink-0 underline underline-offset-2 font-bold">'+esc(h.topbarLabel)+"</a>":"")+"</div></div>":"";
  const cta2=h.cta2Aktif?'<a href="'+esc(resolve(h.cta2Href))+'" class="text-sm font-bold px-3 py-2 rounded-lg text-brand-700 hover:bg-brand-50 transition">'+esc(h.cta2Label)+"</a>":"";
  const cta=h.ctaAktif?'<a href="'+esc(resolve(h.ctaHref))+'" class="text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-1.5 transition" style="background:'+(h.ctaWarna==="amber"?"var(--a)":h.ctaWarna==="gelap"?"var(--ink)":"var(--p)")+';color:'+(h.ctaWarna==="amber"?lum(t.accent):h.ctaWarna==="gelap"?"#fff":lum(t.primary))+'"><i data-lucide="'+esc(h.ctaIkon)+'" class="w-4 h-4"></i>'+esc(h.ctaLabel)+"</a>":"";
  return '<a id="lsSkip" href="#lsMain">Lewati ke konten utama</a>'+
  '<header id="lsHeader" data-ls="1" class="'+(h.sticky?"fixed":"relative")+' top-0 inset-x-0 z-50" style="background:'+al(t.surface,h.transparan/100)+';backdrop-filter:blur('+h.blur+'px);border-bottom:'+(h.border?"1px solid var(--line)":"0")+'">'+
    top+
    '<div class="max-w-7xl mx-auto px-4 flex items-center gap-3" style="height:'+h.tinggi+'px;max-width:'+h.lebar+'px">'+
      '<a href="'+(HOME?"#beranda":"index.html")+'" class="flex items-center gap-2.5 min-w-0 shrink-0">'+logo+
        '<div class="min-w-0 leading-tight" style="display:'+(h.tampilkanNama||h.tampilkanNpsn?"block":"none")+'">'+
          '<div id="navNama" class="font-display font-bold text-brand-800 truncate max-w-[42vw] sm:max-w-[220px]" style="display:'+(h.tampilkanNama?"block":"none")+'">Nama Sekolah</div>'+
          '<div id="navNpsn" class="text-[11px] text-slate-400 truncate" style="display:'+(h.tampilkanNpsn?"block":"none")+'">NPSN —</div>'+
        "</div></a>"+
      '<nav class="hidden lg:flex items-center gap-0.5 ml-4 text-sm font-semibold text-slate-600" aria-label="Navigasi utama">'+links+"</nav>"+
      '<div class="flex-1"></div>'+
      '<span id="cbtTimer" class="hidden font-mono font-extrabold text-base bg-rose-600 text-white px-3 py-1 rounded-lg shrink-0"></span>'+
      '<div class="hidden md:flex items-center gap-2 shrink-0">'+cta2+cta+"</div>"+
      '<button id="pLogout" class="hidden text-xs font-bold px-3 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 shrink-0">Keluar</button>'+
      '<button id="mBtn" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 shrink-0" aria-label="Buka menu" aria-expanded="false" aria-controls="lsMenu"><i data-lucide="menu" class="w-6 h-6"></i></button>'+
      '<span id="ppdbSchool" class="sr-only"></span><span id="bSchool" class="sr-only"></span><span id="pSchool" class="sr-only"></span>'+
    "</div>"+
    '<div id="lsMenu" class="lg:hidden border-t border-slate-100" style="background:var(--sf)"><div><div id="mMenu" class="px-4 py-3 space-y-1 text-sm font-semibold max-h-[calc(100vh-160px)] overflow-y-auto">'+mob+
      '<a href="belajar.html" class="ls-link block px-3 py-2.5 rounded-lg hover:bg-brand-50">E-Learning</a>'+
      '<a href="cbt.html" class="ls-link block px-3 py-2.5 rounded-lg hover:bg-brand-50">Ujian CBT</a>'+
      '<div class="flex gap-2 pt-2 pb-1"><a href="'+esc(resolve(h.ctaHref))+'" class="flex-1 text-center px-3 py-2.5 rounded-xl font-bold" style="background:var(--a);color:'+lum(t.accent)+'">'+esc(h.ctaLabel)+'</a><a href="'+esc(resolve(h.cta2Href))+'" class="flex-1 text-center px-3 py-2.5 rounded-xl font-bold" style="background:var(--p);color:'+lum(t.primary)+'">'+esc(h.cta2Label)+"</a></div>"+
    "</div></div></div></header>";
}

function footerHTML(){
  const f=CFG.footer, t=CFG.tema;
  if(!f.aktif) return '<footer id="lsFooter" data-ls="1" style="display:none"></footer>';
  const sosial=f.sosial.filter(s=>s.aktif!==false).map(s=>'<a href="'+esc(resolve(s.href))+'" target="'+(String(s.href).startsWith("http")||s.href==="wa"||s.href==="mail"?"_blank":"_self")+'" rel="noopener" class="w-9 h-9 rounded-full flex items-center justify-center transition" style="background:'+al("#ffffff",.07)+';color:'+f.teks+'" title="'+esc(s.ikon)+'"><i data-lucide="'+esc(s.ikon)+'" class="w-4 h-4"></i></a>').join("");
  const groups=f.grup.map(g=>'<div class="min-w-0"><b class="text-sm uppercase tracking-wider" style="color:#fff">'+esc(g.judul)+'</b><ul class="mt-4 space-y-2 text-sm">'+
    (g.tautan||[]).filter(l=>l.aktif!==false).map(l=>'<li><a href="'+esc(resolve(l.href))+'" class="transition hover:opacity-100" style="color:'+f.teks+'">'+esc(l.label)+"</a></li>").join("")+"</ul></div>").join("");
  const brand=f.brandAktif?'<div class="lg:col-span-2 min-w-0">'+
    '<div class="flex items-center gap-2.5">'+(f.brandLogo?'<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:linear-gradient(140deg,var(--p),var(--a2));color:'+lum(t.primary)+'"><i data-lucide="'+esc(CFG.header.logoIkon)+'" class="w-5 h-5"></i></div>':"")+
    '<b id="footNama" class="font-display text-lg truncate" style="color:#fff">Nama Sekolah</b></div>'+
    '<p id="footAlamat" class="text-sm mt-4 max-w-sm" style="color:'+al(f.teks,.78)+'"></p>'+
    '<p id="footTelp" class="text-sm mt-2" style="color:'+al(f.teks,.78)+'"></p>'+
    '<div class="flex flex-wrap gap-2 mt-4">'+sosial+"</div>"+
    (f.brandTeks?'<p class="text-xs mt-4 max-w-sm" style="color:'+al(f.teks,.6)+'">'+esc(f.brandTeks)+"</p>":"")+"</div>":"";
  const gate=f.gateAktif?'<a href="'+esc(f.gateHref)+'" id="adminGate" rel="nofollow" aria-label="Login Administrator" title="Login Administrator" class="relative shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full outline-none focus-visible:ring-2" style="color:'+f.teks+'"><i data-lucide="lock" class="w-3.5 h-3.5"></i><span class="gate-tip pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold" style="background:'+sh(f.latar,8)+';border:1px solid '+f.garis+';color:'+f.teks+'">'+esc(f.gateLabel)+"</span></a>":"";
  const cp='<span class="sm:flex-1 text-center sm:text-left">'+esc(f.copyright).replace("{sekolah}",'<span id="footCopy">Nama Sekolah</span>')+"</span>";
  const note='<span class="sm:flex-1 text-center sm:text-right">'+esc(f.catatan)+"</span>";
  const bottom=f.gatePosisi==="kiri"?gate+cp+note:f.gatePosisi==="kanan"?cp+note+gate:cp+gate+note;
  return '<footer id="lsFooter" data-ls="1" style="background:'+f.latar+';color:'+f.teks+'">'+
    '<div class="max-w-7xl mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-'+f.kolom+' gap-10">'+brand+groups+"</div>"+
    '<div style="border-top:1px solid '+f.garis+'"><div class="max-w-7xl mx-auto px-4 py-5 text-xs flex flex-col sm:flex-row items-center gap-3 sm:gap-4" style="color:'+al(f.teks,.62)+'">'+bottom+"</div></div></footer>";
}

/* ---------- chrome tambahan ---------- */
function chrome(){
  const t=CFG.tema;
  if(!document.getElementById("lsBg")){
    const d=document.createElement("div"); d.id="lsBg";
    d.innerHTML='<div class="ls-mesh"></div><div class="ls-grid"></div><div class="ls-aurora"><i></i><i></i><i></i></div><div class="ls-grain"></div>';
    document.body.prepend(d);
  }
  let pr=document.getElementById("lsProgress");
  if(CFG.body.progresBaca&&!APP){ if(!pr){ pr=document.createElement("div"); pr.id="lsProgress"; document.body.appendChild(pr);} }
  else if(pr) pr.remove();
  let top=document.getElementById("lsTop");
  if(CFG.body.keAtas&&!APP){
    if(!top){ top=document.createElement("button"); top.id="lsTop"; top.type="button"; top.setAttribute("aria-label","Kembali ke atas");
      top.innerHTML='<i data-lucide="arrow-up" class="w-5 h-5"></i>'; top.style.right="20px"; top.style.bottom=(CFG.fab.waAktif?CFG.fab.waUkuran+30:20)+"px";
      top.onclick=()=>window.scrollTo({top:0,behavior:reduce?"auto":"smooth"}); document.body.appendChild(top); }
  } else if(top) top.remove();

  const fabCfg=CFG.fab;
  let fab=document.getElementById("lsFab")||document.getElementById("fabWa");
  if(fabCfg.waAktif&&!APP){
    if(!fab){ fab=document.createElement("a"); fab.target="_blank"; fab.rel="noopener"; document.body.appendChild(fab); }
    fab.id="lsFab"; fab.removeAttribute("data-ls");
    const col=fabCfg.waWarna==="amber"?t.accent:fabCfg.waWarna==="gelap"?t.ink:t.primary;
    const pos={ "kanan-bawah":{right:"20px",bottom:"20px"},"kiri-bawah":{left:"20px",bottom:"20px"},"kanan-tengah":{right:"20px",top:"50%"} }[fabCfg.waPosisi]||{right:"20px",bottom:"20px"};
    fab.style.cssText="position:fixed;z-index:55;display:flex;align-items:center;justify-content:center;border-radius:99px;width:"+fabCfg.waUkuran+"px;height:"+fabCfg.waUkuran+"px;background:"+col+";color:"+lum(col)+";box-shadow:0 18px 34px -16px "+al(col,.9)+";"+Object.entries(pos).map(([k,v])=>k+":"+v).join(";");
    fab.className=fabCfg.waPulse&&!reduce?"ls-pulse":"";
    fab.title=fabCfg.waTooltip; fab.setAttribute("aria-label",fabCfg.waTooltip);
    fab.href="https://wa.me/"+String(ST.wa_admin||"").replace(/^0/,"62")+"?text="+encodeURIComponent(fabCfg.waPesan||"");
    fab.innerHTML='<i data-lucide="message-circle" style="width:'+(fabCfg.waUkuran*.45)+'px;height:'+(fabCfg.waUkuran*.45)+'px"></i>';
  } else if(fab) fab.remove();
}

/* ---------- body index ---------- */
const BGV = (v,t) => ({
  putih:{bg:"var(--sf)",dark:false}, mint:{bg:"linear-gradient(180deg,var(--p050),var(--sf) 55%,var(--p050))",dark:false},
  abu:{bg:"#f8fafc",dark:false}, gradien:{bg:"linear-gradient(135deg,var(--p050),var(--sf) 46%,var(--a050))",dark:false},
  gelap:{bg:"linear-gradient(150deg,"+t.ink+","+sh(t.primary,-34)+")",dark:true}, transparan:{bg:"transparent",dark:false}
}[v] || {bg:"transparent",dark:false});

function secEl(id){
  if(id==="statistik"){ const s=document.getElementById("stats"); const el=s&&s.closest("section"); if(el&&!el.id) el.id="statistik"; return el; }
  return document.getElementById(id);
}
function setTxt(root,sel,val){ if(!root||!val) return; const e=root.querySelector(sel); if(e) e.textContent=val; }
function paint(el,v){
  const b=BGV(v,CFG.tema);
  el.style.background=b.bg;
  el.classList.add("ls-sec"); el.classList.toggle("ls-dark",b.dark); el.classList.toggle("ls-light",!b.dark&&v!=="transparan");
  if(b.dark) el.style.color="#f8fafc"; else el.style.color="";
  el.querySelectorAll("[class*='border-y']").forEach(n=>{ n.style.borderColor=CFG.tema.line; });
}
function countUp(el,n){
  if(!CFG.body.seksi.statistik.animasiAngka||reduce){ el.textContent=Number(n).toLocaleString("id-ID"); return; }
  const t0=performance.now();
  const step=t=>{ const p=Math.min(1,(t-t0)/900); el.textContent=Math.round(n*p).toLocaleString("id-ID"); if(p<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function statVal(src){
  const s=DATA.siswa||[],g=DATA.guru||[],k=DATA.kelas||[],b=DATA.buku||[],ke=DATA.kegiatan||[],iv=DATA.inventaris||[];
  return { siswa:s.filter(x=>x.status==="Aktif").length, guru:g.length, kelas:k.length,
    buku:b.reduce((a,x)=>a+(x.stok||0),0), kegiatan:ke.filter(x=>x.status!=="Draft").length,
    inventaris:iv.reduce((a,x)=>a+(x.jumlah||0),0) }[src] || 0;
}
function imgBox(url,alt){ return '<div class="w-full h-full" style="background:linear-gradient(135deg,var(--p),var(--a2))"><img src="'+esc(url||"")+'" alt="'+esc(alt||"")+'" loading="lazy" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"></div>'; }

function renderStats(){
  const c=CFG.body.seksi.statistik, host=document.getElementById("stats"); if(!host) return;
  host.className="grid grid-cols-2 gap-4"+(c.kolom>=4?" md:grid-cols-4":c.kolom===3?" md:grid-cols-3":"");
  host.innerHTML=c.items.map((s,i)=>'<div class="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 text-center ls-reveal"><div class="w-11 h-11 mx-auto rounded-xl flex items-center justify-center mb-3 bg-'+esc(s.warna)+'-100 text-'+esc(s.warna)+'-700"><i data-lucide="'+esc(s.ikon)+'" class="w-5 h-5"></i></div><div class="text-3xl font-extrabold font-display" data-stat="'+i+'">0</div><div class="text-xs text-slate-500 font-semibold mt-1">'+esc(s.label)+"</div></div>").join("");
  c.items.forEach((s,i)=>{ const e=host.querySelector('[data-stat="'+i+'"]'); if(e) countUp(e,statVal(s.sumber)); });
  const sec=secEl("statistik"); if(sec){ sec.style.marginTop=c.overlap?"-2rem":"0"; sec.style.position="relative"; sec.style.zIndex="20"; sec.classList.remove("ls-sec"); }
}
function renderProgram(){
  const c=CFG.body.seksi.program, host=document.getElementById("programGrid"); if(!host||!c.kartu.length) return;
  host.className="grid sm:grid-cols-2 gap-6"+(c.kolom>=4?" lg:grid-cols-4":c.kolom===3?" lg:grid-cols-3":"");
  host.innerHTML=c.kartu.map(p=>{
    const on=c.tandaiJenjang&&String(ST.jenjang||"").toUpperCase()===String(p.kode).toUpperCase();
    return '<div class="relative bg-white rounded-2xl border '+(on?"border-brand-500 ring-2 ring-brand-200":"border-slate-200")+' shadow-sm p-6 hover:shadow-md transition ls-reveal">'+
      (on?'<span class="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-600 text-white">Jenjang Kami</span>':"")+
      '<div class="w-12 h-12 rounded-xl bg-'+esc(p.warna)+'-100 text-'+esc(p.warna)+'-700 flex items-center justify-center mb-4"><i data-lucide="'+esc(p.ikon)+'" class="w-6 h-6"></i></div>'+
      '<b class="font-display text-lg">'+esc(p.kode)+'</b><div class="text-xs text-slate-400 font-semibold">'+esc(p.nama)+'</div>'+
      '<p class="text-sm text-slate-500 mt-2">'+esc(p.desk)+'</p>'+
      '<a href="'+esc(p.href)+'" class="inline-flex items-center gap-1 text-sm font-bold text-brand-700 mt-4">'+esc(c.detailLabel)+' <i data-lucide="arrow-right" class="w-4 h-4"></i></a></div>';
  }).join("");
}
function renderFasilitas(){
  const c=CFG.body.seksi.fasilitas, host=document.getElementById("facilityGrid"); if(!host||!c.items.length) return;
  const laptop=(DATA.inventaris||[]).filter(x=>/laptop|komputer|chromebook/i.test(x.nama)).reduce((a,x)=>a+(x.jumlah||0),0);
  const rep=s=>String(s||"").replace("{buku}",statVal("buku")).replace("{laptop}",laptop).replace("{kelas}",statVal("kelas")).replace("{siswa}",statVal("siswa"));
  host.className="grid sm:grid-cols-2 gap-6"+(c.kolom>=4?" lg:grid-cols-4":c.kolom===3?" lg:grid-cols-3":"");
  host.innerHTML=c.items.map(f=>'<div class="rounded-2xl overflow-hidden bg-white/10 border border-white/15 ls-reveal"><div class="h-36">'+imgBox(f.foto,f.nama)+'</div><div class="p-4"><div class="flex items-center gap-2 font-display font-bold"><i data-lucide="'+esc(f.ikon)+'" class="w-4 h-4 text-amber-300"></i>'+esc(f.nama)+'</div><div class="text-sm text-brand-100/80 mt-1">'+esc(rep(f.ket))+"</div></div></div>").join("");
  const tb=document.getElementById("tourBtn2");
  if(tb){ tb.style.display=c.turAktif?"":"none"; tb.innerHTML='<i data-lucide="play-circle" class="w-4 h-4"></i>'+esc(c.turLabel);
    tb.onclick=()=>{ const m=document.getElementById("tourModal"), fr=document.getElementById("tourFrame"); if(fr) fr.src=ytEmbed(c.turVideo); if(m) m.classList.remove("hidden"); }; }
}
function renderNews(){
  const c=CFG.body.seksi.berita, host=document.getElementById("newsGrid"); if(!host) return;
  const news=[];
  if(ST.pengumuman) news.push({t:"Pengumuman Sekolah",d:ST.pengumuman,href:"#berita",tag:"Info",img:"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=60"});
  if((DATA.ppdb||[]).length) news.push({t:"Open Admission PPDB Telah Dibuka",d:"Penerimaan Peserta Didik Baru resmi dibuka. Segera daftarkan putra-putri Anda melalui formulir PPDB Online.",href:"ppdb.html",tag:"PPDB",img:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=60"});
  (DATA.materi||[]).slice(0,Math.max(1,c.jumlah)).forEach(m=>news.push({t:m.judul,d:m.deskripsi||"Materi pembelajaran terbaru untuk siswa.",href:"belajar.html",tag:m.tipe||"Materi",img:"https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=60"}));
  host.className="grid sm:grid-cols-2 gap-6"+(c.kolom>=3?" lg:grid-cols-3":"");
  host.innerHTML=news.slice(0,c.jumlah).map(n=>'<article class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col ls-reveal"><div class="h-44">'+imgBox(n.img,n.t)+'</div><div class="p-5 flex flex-col flex-1"><span class="self-start text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">'+esc(n.tag)+'</span><h3 class="font-display font-bold mt-2 leading-snug">'+esc(n.t)+'</h3><p class="text-sm text-slate-500 mt-2 line-clamp-3 flex-1">'+esc(n.d)+'</p><a href="'+esc(resolve(n.href))+'" class="inline-flex items-center gap-1 text-sm font-bold text-brand-700 mt-4">Read More <i data-lucide="arrow-right" class="w-4 h-4"></i></a></div></article>').join("")||'<p class="text-slate-400 col-span-full">Belum ada kabar.</p>';
}
function renderAgenda(){
  const c=CFG.body.seksi.akademik, host=document.getElementById("agendaList"); if(!host) return;
  const rows=[
    ...(DATA.ujian||[]).map(u=>({tgl:u.tanggal,judul:u.judul,ket:"Ujian CBT • "+u.mapel+" • "+u.kelas,href:"cbt.html",icon:"timer"})),
    ...(DATA.tugas||[]).map(t=>({tgl:t.deadline,judul:t.judul,ket:"Tugas • "+t.mapel+" • "+t.kelas,href:"belajar.html",icon:"clipboard-check"})),
    ...(DATA.kegiatan||[]).filter(k=>k.status!=="Draft"&&k.tanggal>=today()).map(k=>({tgl:k.tanggal,judul:k.judul,ket:"Kegiatan • "+k.kategori,href:"#kegiatan",icon:"sparkles"}))
  ].filter(a=>a.tgl).sort((a,b)=>a.tgl.localeCompare(b.tgl)).slice(0,c.jumlah);
  host.innerHTML=rows.map(a=>'<a href="'+esc(resolve(a.href))+'" class="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-brand-300 ls-reveal"><div class="w-14 text-center shrink-0"><div class="text-2xl font-extrabold font-display text-brand-700 leading-none">'+new Date(a.tgl).getDate()+'</div><div class="text-[11px] uppercase text-slate-400 font-bold">'+new Date(a.tgl).toLocaleDateString("id-ID",{month:"short"})+'</div></div><div class="flex-1 min-w-0"><b class="text-sm block truncate">'+esc(a.judul)+'</b><span class="text-xs text-slate-500">'+esc(a.ket)+'</span></div><i data-lucide="'+a.icon+'" class="w-5 h-5 text-brand-600 shrink-0"></i></a>').join("")||'<p class="text-slate-400">Belum ada agenda terdekat.</p>';
  const link=document.querySelector("#akademik a[href='belajar.html'],#akademik a[href='belajar/']");
  if(link){ link.innerHTML=esc(c.tautanLabel)+' <i data-lucide="arrow-right" class="w-4 h-4"></i>'; link.href=resolve(c.tautanHref); }
  const head=link&&link.parentElement;
  if(head){ let full=head.querySelector("a[data-lskal]");
    if(c.kalenderTautan&&!full){ full=document.createElement("a"); full.dataset.lskal="1"; full.href=(window.siteUrl?siteUrl("kalender"):"kalender/"); full.className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-brand-600 text-white ml-2"; full.innerHTML='Kalender Penuh<i data-lucide="calendar-days" class="w-4 h-4"></i>'; head.appendChild(full); head.classList.add("flex","flex-wrap","items-center"); }
    else if(!c.kalenderTautan&&full) full.remove(); }
}
function renderKontak(){
  const c=CFG.body.seksi.kontak, sec=secEl("kontak"); if(!sec) return;
  const map=document.getElementById("mapFrame");
  if(map){ const wrap=map.closest("div");
    if(c.petaAktif){ wrap.style.display=""; wrap.style.minHeight=c.petaTinggi+"px"; map.style.minHeight=c.petaTinggi+"px";
      const mu="https://maps.google.com/maps?q="+encodeURIComponent(ST.alamat||"Indonesia")+"&t=&z="+c.petaZoom+"&ie=UTF8&iwloc=&output=embed";
      if(map.getAttribute("src")!==mu) map.src=mu; /* PERF: menetapkan src yang sama memuat ulang seluruh peta */ }
    else wrap.style.display="none"; }
  const boxes=sec.querySelectorAll(".bg-brand-50");
  const jam=boxes[boxes.length-1];
  if(jam){ const b=jam.querySelector("b"), p=jam.querySelector("p"); if(b) b.textContent=c.jamJudul; if(p) p.textContent=c.jamTeks; }
  const btnHost=document.getElementById("kontakMap")&&document.getElementById("kontakMap").parentElement;
  if(btnHost&&c.tombol.length){
    btnHost.innerHTML=c.tombol.map(t=>{
      const st=t.gaya==="primary"?"background:var(--p);color:"+lum(CFG.tema.primary):t.gaya==="amber"?"background:var(--a);color:"+lum(CFG.tema.accent):"border:1px solid var(--line);color:var(--ink)";
      return '<a href="'+esc(resolve(t.href))+'" target="'+(t.href==="maps"||t.href==="wa"?"_blank":"_self")+'" rel="noopener" class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl" style="'+st+'"><i data-lucide="'+esc(t.ikon)+'" class="w-4 h-4"></i>'+esc(t.label)+"</a>";
    }).join("");
  }
}
function renderProfil(){
  const c=CFG.body.seksi.profil, sec=secEl("profil"); if(!sec) return;
  const img=sec.querySelector("img"); if(img&&c.foto) img.src=c.foto;
  const card=document.getElementById("aboutCard");   // kartu Founder/Ketua Yayasan
  if(card) card.style.display=c.kepsekKartu?"":"none";
  const br=document.getElementById("brochureBtn");
  if(br){ br.style.display=c.brosurAktif?"":"none"; br.innerHTML='<i data-lucide="'+esc(c.brosurIkon||"download")+'" class="w-4 h-4"></i>'+esc(c.brosurLabel); }
  // FIXED: wadah dicari lewat #aboutSocial (ID tetap). Dulu lewat #socWa yang terhapus pada render pertama, sehingga ikon dari Admin tak pernah diterapkan di beranda.
  const soc=document.getElementById("aboutSocial")||(document.getElementById("socWa")&&document.getElementById("socWa").parentElement);
  if(soc){ const lab=soc.querySelector("span"); if(lab) lab.textContent=c.sosialLabel;
    soc.querySelectorAll("a").forEach(a=>a.remove());
    soc.insertAdjacentHTML("beforeend",c.sosial.filter(s=>s.aktif!==false).map(s=>'<a href="'+esc(resolve(s.href))+'" target="'+(s.href==="wa"||s.href==="mail"?"_blank":"_self")+'" rel="noopener" class="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center hover:bg-brand-200" title="'+esc(s.ikon)+'"><i data-lucide="'+esc(s.ikon)+'" class="w-4 h-4"></i></a>').join("")); }
  // Teks About Us kini bersumber dari Pengaturan Sekolah (Founder/Ketua Yayasan) — teksOverride tidak lagi dipakai.
}
function bodyApply(){
  if(!HOME) return;
  const B=CFG.body;
  const parent=(secEl("beranda")||{}).parentElement||document.body;
  B.urutan.forEach(id=>{ const el=secEl(id); if(el&&el.parentElement===parent) parent.appendChild(el); });
  const foot=document.getElementById("lsFooter"); if(foot&&foot.parentElement===parent) parent.appendChild(foot);
  B.urutan.forEach(id=>{
    const el=secEl(id); if(!el) return;
    const c=B.seksi[id]||{};
    el.style.display=c.aktif===false?"none":"";
    if(c.aktif===false) return;
    if(id!=="statistik"&&id!=="beranda") paint(el,c.latar||"putih");
    if(c.eyebrow!==undefined){ const sp=el.querySelector("span.text-xs, span[class*='uppercase']"); if(sp&&c.eyebrow) sp.textContent=c.eyebrow; }
    if(c.judul){ const h=el.querySelector("h2"); if(h){ if(id==="profil"){ const nm=document.getElementById("aboutNama"); h.innerHTML=esc(c.judul)+" "+(nm?'<span id="aboutNama">'+esc(nm.textContent)+"</span>":""); } else h.textContent=c.judul; } }
    if(c.sub){ const p=el.querySelector("h2")&&el.querySelector("h2").parentElement.querySelector("p"); if(p) p.textContent=c.sub; }
  });
  const nb=secEl("berita"), nl=nb&&nb.querySelector("a[href='belajar.html'],a[href='belajar/']");
  if(nl){ nl.innerHTML=esc(B.seksi.berita.tautanLabel)+' <i data-lucide="arrow-right" class="w-4 h-4"></i>'; nl.href=resolve(B.seksi.berita.tautanHref); }
  renderProfil(); renderProgram(); renderKontak();
  if(homeDataReady){ renderStats(); renderNews(); renderAgenda(); renderFasilitas(); }
  reveal();
}
function reveal(){
  const els=document.querySelectorAll(".ls-reveal:not(.ls-in)");
  if(!CFG.tema.reveal||reduce||!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("ls-in")); return; }
  if(!io) io=new IntersectionObserver(en=>en.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add("ls-in"); io.unobserve(x.target); } }),{threshold:.08,rootMargin:"0px 0px -40px 0px"});
  els.forEach(e=>io.observe(e));
}

/* ---------- wiring ---------- */
function wire(){
  const hdr=document.getElementById("lsHeader"), btn=document.getElementById("mBtn"), menu=document.getElementById("lsMenu");
  if(hdr&&btn&&menu){
    const setOpen=o=>{ menu.classList.toggle("ls-open",o); btn.setAttribute("aria-expanded",o?"true":"false"); btn.innerHTML='<i data-lucide="'+(o?"x":"menu")+'" class="w-6 h-6"></i>'; refreshIcons(); };
    btn.onclick=()=>setOpen(!menu.classList.contains("ls-open"));
    menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setOpen(false)));
    if(!wired){
      document.addEventListener("keydown",e=>{ if(e.key==="Escape") setOpen(false); });
      document.addEventListener("click",e=>{ if(!hdr.contains(e.target)) setOpen(false); });
      window.addEventListener("resize",()=>{ if(innerWidth>=1024) setOpen(false); },{passive:true});
      let last=0;
      let _sTick=0;
      const onScroll=()=>{
        if(_sTick) return; _sTick=requestAnimationFrame(()=>{ _sTick=0; onScrollNow(); });
      };
      const onScrollNow=()=>{
        const y=scrollY;
        hdr.classList.toggle("ls-scrolled",y>8);
        if(CFG.header.sembunyiSaatTurun&&!menu.classList.contains("ls-open")) hdr.classList.toggle("ls-hide",y>last&&y>240);
        else hdr.classList.remove("ls-hide");
        last=y;
        const pr=document.getElementById("lsProgress");
        if(pr){ const h=document.documentElement.scrollHeight-innerHeight; pr.style.transform="scaleX("+(h>0?Math.min(1,y/h):0)+")"; }
        const tp=document.getElementById("lsTop"); if(tp) tp.classList.toggle("on",y>520);
      };
      addEventListener("scroll",onScroll,{passive:true}); onScrollNow();
      wired=true;
    }
    if(HOME&&CFG.header.scrollspy&&"IntersectionObserver" in window){
      const links=[...document.querySelectorAll('#lsHeader [data-ls-nav^="#"]')];
      const so=new IntersectionObserver(en=>en.forEach(x=>{ if(x.isIntersecting) links.forEach(l=>l.classList.toggle("ls-on",l.dataset.lsNav==="#"+x.target.id)); }),{rootMargin:"-45% 0px -50% 0px"});
      CFG.header.nav.filter(n=>String(n.href).startsWith("#")).forEach(n=>{ const s=document.getElementById(n.href.slice(1)); if(s) so.observe(s); });
    }
  }
}
// PERF: ±2 MB JSON (siswa, guru, kegiatan, ...) hanya dipakai untuk angka statistik, agenda & berita
// di bagian BAWAH beranda. Dulu semuanya diunduh + diparse sebelum hero tampil. Sekarang dimuat
// setelah halaman selesai dimuat (idle) atau begitu pengunjung mulai menggulir.
let homeDataP = null, homeDataReady = false;
const HOME_FILES = ["siswa","guru","kelas","buku","kegiatan","inventaris","materi","ppdb","ujian","tugas"];
function loadHomeData(){
  if(!HOME) return Promise.resolve();
  if(homeDataP) return homeDataP;
  homeDataP = Promise.all(HOME_FILES.map(f=>fetchJSON(f+".json").catch(()=>[]))).then(res=>{
    HOME_FILES.forEach((f,i)=>DATA[f]=Array.isArray(res[i])?res[i]:[]);
    homeDataReady = true;
    bodyApply(); refreshIcons();
  });
  return homeDataP;
}
function scheduleHomeData(){
  if(!HOME) return;
  const go=()=>{ removeEventListener("scroll",go); removeEventListener("pointerdown",go); loadHomeData(); };
  addEventListener("scroll",go,{passive:true,once:true}); addEventListener("pointerdown",go,{passive:true,once:true});
  const later=()=>_idle(go);
  if(document.readyState==="complete") setTimeout(later,600); else addEventListener("load",()=>setTimeout(later,600),{once:true});
}
let hydrateP = null;
function hydrate(){ return hydrateP || (hydrateP = hydrateNow()); }
// FIXED: identitas sekolah (Nama, NPSN, alamat, telepon) di header/footer dulu hanya diisi SEKALI oleh hydrateNow().
// Setelah itu render() membuang header/footer lama dan memasang yang baru berisi teks bawaan ("Nama Sekolah", "NPSN —"),
// sehingga perubahan di Panel Admin → Pengaturan tak pernah terlihat di beranda, SD/SMP/SMA/SMK, PPDB, dll.
// Kini diisi ulang setiap render() selama data settings sudah dimuat.
function fillIdentity(){
  const nama=CFG.header.namaOverride||ST.nama_sekolah||"Nama Sekolah";
  const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  ["navNama","footNama","footCopy","ppdbSchool","bSchool","pSchool"].forEach(id=>set(id,nama));
  set("navNpsn",CFG.header.subOverride||("NPSN "+(ST.npsn||"—")));
  set("footAlamat",ST.alamat||""); set("footTelp",ST.telepon||"");
  const fw=document.getElementById("footWa"); if(fw) fw.href=resolve("wa");
  const fm=document.getElementById("footMail"); if(fm) fm.href=resolve("mail");
}
async function hydrateNow(){
  try{ ST=await fetchJSON("settings.json"); }catch(e){ ST={}; }
  fillIdentity();
  const nama=CFG.header.namaOverride||ST.nama_sekolah||"Nama Sekolah";
  if(HOME){
    const cn=document.getElementById("kontakNama"); if(cn) cn.textContent=nama;
    const ca=document.getElementById("kontakAlamat"); if(ca){ const s=ca.querySelector("span"); if(s) s.textContent=ST.alamat||"—"; }
    const ct=document.getElementById("kontakTelp"); if(ct) ct.textContent=ST.telepon||"—";
    const ce=document.getElementById("kontakEmail"); if(ce) ce.textContent=ST.email||"—";
    fillAbout(ST);
  }
  hydrated=true;
}

function styleTag(){
  let s=document.getElementById("lsStyle");
  if(!s){ s=document.createElement("style"); s.id="lsStyle"; document.head.appendChild(s); }
  s.textContent=css();
  const fam=[CFG.tema.fontDisplay,CFG.tema.fontBody].filter(Boolean).map(f=>f.trim().replace(/\s+/g,"+")).join("&family=");
  let l=document.getElementById("lsFonts");
  const href="https://fonts.googleapis.com/css2?family="+fam+":wght@400;500;600;700;800&display=swap";
  if(!l){ l=document.createElement("link"); l.id="lsFonts"; l.rel="stylesheet"; document.head.appendChild(l); }
  if(l.href!==href) l.href=href;
}
function render(){
  styleTag();
  document.documentElement.classList.toggle("ls-app",APP);
  document.documentElement.classList.toggle("ls-auth",AUTH);
  const old=document.getElementById("lsHeader"); if(old) old.remove();
  const of=document.getElementById("lsFooter"); if(of) of.remove();
  // FIXED: Panel Admin/Seeder punya bilah atas sendiri. Header & footer SITUS PUBLIK tidak dipasang di sana
  // (dulu tampil di atas admin dan tautannya -Profil, Program, Kontak...- membuka beranda publik).
  if(!APP){
    document.body.insertAdjacentHTML("afterbegin",headerHTML());
    document.body.insertAdjacentHTML("beforeend",footerHTML());
  }
  chrome(); wire(); bodyApply(); if(hydrated) fillIdentity(); refreshIcons();
}
async function apply(next){
  CFG=norm(next||CFG);
  render();
  if(!hydrated){ await hydrate(); render(); }
}
function boot(){
  document.querySelectorAll("header:not(#lsHeader)").forEach(h=>{ if(APP) h.dataset.lsKeep="1"; else h.remove(); });
  document.querySelectorAll("footer:not(#lsFooter)").forEach(f=>f.remove());
  if(!document.getElementById("lsMain")){ const t=document.querySelector("main")||document.querySelector("#root")||document.querySelector("section"); if(t&&!t.id) t.id="lsMain"; }
  document.querySelectorAll('[class*="pt-[72px]"]').forEach(e=>e.classList.remove("pt-[72px]"));
  apply(CFG);
  fetchJSON("ui.json").then(c=>apply(c)).catch(()=>apply({}));
  scheduleHomeData();
  const mo=new MutationObserver(ms=>{
    if(!ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&n.id!=="lsHeader"&&n.id!=="lsFooter"&&(n.tagName==="HEADER"||n.tagName==="FOOTER"||n.querySelector?.("header,footer"))))) return;
    clearTimeout(moT); moT=setTimeout(()=>{
      document.querySelectorAll("header:not(#lsHeader)").forEach(h=>{ if(h.dataset.lsKeep!=="1") h.remove(); });
      document.querySelectorAll("footer:not(#lsFooter)").forEach(f=>f.remove());
      refreshIcons();
    },50);
  });
  mo.observe(document.body,{childList:true,subtree:true});
  addEventListener("message",e=>{
    const d=e.data||{};
    if(d.lsui==="cfg"){ apply(d.cfg).then(()=>{ try{ e.source&&e.source.postMessage({lsui:"applied"},"*"); }catch(x){} }); }
    if(d.lsui==="scroll"&&d.id){ const el=secEl(d.id)||document.getElementById(d.id); if(el) el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"}); }
    if(d.lsui==="ping"){ try{ e.source&&e.source.postMessage({lsui:"ready"},"*"); }catch(x){} }
  });
  try{ parent!==window&&parent.postMessage({lsui:"ready"},"*"); }catch(x){}
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
document.addEventListener("DOMContentLoaded",refreshIcons);
return { THEMES, FONTS, BGVAR, WARNA, SECTIONS, DEF, norm, apply, get:()=>CFG, set:c=>apply(c), resolve };
})();
window.LSUI = LSUI;