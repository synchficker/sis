// ============================================================
// login-view.js — Renderer bersama halaman Login.
// Dipakai login.html (asli) dan admin-login.js (pratinjau langsung)
// sehingga tampilan admin === tampilan publik, tanpa duplikasi.
// ============================================================
(() => {
"use strict";

const THEMES = {
  zamrud: { label:"Zamrud Malam", bg:"#04120e", sf:"#0a2019", ln:"#1d4a3b", primary:"#10b981", deep:"#047857", accent:"#fbbf24", accent2:"#22d3ee", ok:"#a3e635", warn:"#f59e0b", bad:"#fb7185", info:"#818cf8", tx:"#e8f5ee", mu:"#8fb6a6" },
  nila:   { label:"Nila Siber",   bg:"#070b1c", sf:"#111834", ln:"#2b3566", primary:"#6366f1", deep:"#4338ca", accent:"#22d3ee", accent2:"#a3e635", ok:"#34d399", warn:"#fbbf24", bad:"#fb7185", info:"#38bdf8", tx:"#e9ecfb", mu:"#98a1c8" },
  ambar:  { label:"Ambar Senja",  bg:"#170d05", sf:"#241608", ln:"#5a3a14", primary:"#f59e0b", deep:"#b45309", accent:"#fb7185", accent2:"#2dd4bf", ok:"#a3e635", warn:"#fcd34d", bad:"#f43f5e", info:"#38bdf8", tx:"#fdf3e3", mu:"#c8ab84" },
  kuarsa: { label:"Rose Kuarsa",  bg:"#16060f", sf:"#230d1a", ln:"#5c1f3c", primary:"#f43f5e", deep:"#be123c", accent:"#e879f9", accent2:"#22d3ee", ok:"#a3e635", warn:"#fbbf24", bad:"#ff6b81", info:"#818cf8", tx:"#fdeaf1", mu:"#c99aad" },
  laut:   { label:"Laut Dalam",   bg:"#03121a", sf:"#082230", ln:"#164a63", primary:"#0ea5e9", deep:"#0369a1", accent:"#fbbf24", accent2:"#2dd4bf", ok:"#a3e635", warn:"#f59e0b", bad:"#fb7185", info:"#a78bfa", tx:"#e6f4fb", mu:"#8fb4c6" }
};

const DEF = {
  versi:1, brand_nama:"", brand_sub:"Panel Administrator", logo_ikon:"shield-check",
  eyebrow:"Gerbang Administrator", headline:"Masuk ke pusat kendali", headline_highlight:"sekolah digital",
  tagline:"Satu token untuk mengelola akademik, keuangan, kepegawaian, dan konten website.",
  features:["Tanpa server","Audit otomatis","GitHub Pages","Token sesi saja"],
  footer_teks:"© 2026 — Sistem Informasi Sekolah statis.",
  judul_form:"Login Administrator", subjudul_form:"Gunakan GitHub Personal Access Token (PAT).",
  label_token:"Personal Access Token", placeholder_token:"github_pat_… atau ghp_…",
  tombol_label:"Masuk Sekarang", tombol_ikon:"arrow-right", mode_input:"password",
  mata:true, info_repo:true, catatan_aktif:true,
  catatan:[{ikon:"shield-check",teks:"Token hanya di sessionStorage, hilang saat tab ditutup."}],
  bantuan_aktif:true, bantuan:[{q:"Di mana membuat PAT?",a:"GitHub → Settings → Developer settings → Fine-grained tokens."}],
  back_label:"Kembali ke halaman publik", back_href:"index.html", redirect:"admin.html",
  min_panjang:20, prefiks_wajib:true, izinkan_classic:true, validasi_izin_tulis:true,
  batas_percobaan:5, kunci_detik:60, sesi_menit:120, sesi_geser:true,
  avatar:true, statistik:true, segel:true, panel_aktif:true, panel_posisi:"kiri",
  tata_letak:"split", lebar_kartu:460, kepadatan:"normal", radius:22, blur:18,
  tema:"zamrud", aksen:"", aksen2:"", latar:"mesh", gambar_latar:"", overlay:72,
  grain:true, grain_intensitas:7, aurora:true, aurora_kecepatan:26, animasi:true
};

const DENS = { lapang:{pad:36,gap:22,fs:46,cp:30}, normal:{pad:26,gap:16,fs:38,cp:24}, padat:{pad:18,gap:11,fs:31,cp:18} };
const ICONS = ["shield-check","key-round","lock","school","graduation-cap","fingerprint","scan-face","database-zap","git-branch","sparkles"];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const clamp = (v,a,b) => Math.max(a, Math.min(b, Number(v)||0));

function hex2rgb(h){ const s=String(h||"").replace("#",""); const n=s.length===3?s.split("").map(c=>c+c).join(""):s; const v=parseInt(n||"000000",16); return [(v>>16)&255,(v>>8)&255,v&255]; }
function shade(h,p){ const [r,g,b]=hex2rgb(h); const f=x=>Math.round(Math.max(0,Math.min(255,x+(p/100)*255))); return "#"+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
function readable(h){ const [r,g,b]=hex2rgb(h); return (0.2126*r+0.7152*g+0.0722*b)>150 ? "#06120f" : "#ffffff"; }
function rgba(h,a){ const [r,g,b]=hex2rgb(h); return "rgba("+r+","+g+","+b+","+a+")"; }

function norm(c){
  const cfg = { ...DEF, ...(c||{}) };
  cfg.features = Array.isArray(cfg.features) ? cfg.features.filter(Boolean) : [];
  cfg.catatan = Array.isArray(cfg.catatan) ? cfg.catatan : [];
  cfg.bantuan = Array.isArray(cfg.bantuan) ? cfg.bantuan : [];
  cfg.radius = clamp(cfg.radius,0,40); cfg.blur = clamp(cfg.blur,0,40);
  cfg.overlay = clamp(cfg.overlay,0,95); cfg.grain_intensitas = clamp(cfg.grain_intensitas,0,20);
  cfg.aurora_kecepatan = clamp(cfg.aurora_kecepatan,6,80);
  cfg.lebar_kartu = clamp(cfg.lebar_kartu,340,620);
  cfg.min_panjang = clamp(cfg.min_panjang,8,120);
  cfg.batas_percobaan = clamp(cfg.batas_percobaan,0,10);
  cfg.kunci_detik = clamp(cfg.kunci_detik,10,600);
  cfg.sesi_menit = clamp(cfg.sesi_menit,5,1440);
  const th = { ...(THEMES[cfg.tema] || THEMES.zamrud) };
  if (/^#[0-9a-f]{6}$/i.test(cfg.aksen||"")) { th.primary = cfg.aksen; th.deep = shade(cfg.aksen,-24); }
  if (/^#[0-9a-f]{6}$/i.test(cfg.aksen2||"")) th.accent = cfg.aksen2;
  return { cfg, th };
}

function css(cfg, th, S, kf, force){
  const d = DENS[cfg.kepadatan] || DENS.normal;
  const btnTx = readable(th.primary);
  const split = cfg.tata_letak === "split";
  const wide = cfg.tata_letak === "lebar";
  const cols = split ? "1.04fr .96fr" : "1fr";
  const storyOrder = cfg.panel_posisi === "kanan" ? 2 : 1;
  const mesh = "radial-gradient(58% 52% at 12% 14%,"+rgba(th.primary,.42)+",transparent 62%),"+
               "radial-gradient(46% 44% at 86% 8%,"+rgba(th.accent2,.34)+",transparent 64%),"+
               "radial-gradient(52% 48% at 74% 92%,"+rgba(th.accent,.28)+",transparent 66%),"+
               "radial-gradient(40% 38% at 26% 88%,"+rgba(th.info,.24)+",transparent 68%),"+
               "linear-gradient(150deg,"+th.bg+","+shade(th.bg,6)+" 55%,"+th.bg+")";
  const photo = cfg.gambar_latar ? 'url("'+String(cfg.gambar_latar).replace(/"/g,'')+'")' : "none";
  const anim = cfg.animasi ? "" : "animation:none!important;transition:none!important;";
  const forced = force === "mobile"
    ? S+" .lgv-wrap{grid-template-columns:1fr!important;padding:18px!important}"+S+" .lgv-story{order:1!important}"+S+" .lgv-panel{order:2!important}"+S+" .lgv-title{font-size:29px!important}"+S+" .lgv-seal{width:132px!important}"+S+" .lgv-meta{grid-template-columns:1fr!important}"+S+" .lgv-card{max-width:none!important}"
    : force === "tablet"
    ? S+" .lgv-wrap{grid-template-columns:1fr!important;max-width:720px!important}"+S+" .lgv-title{font-size:34px!important}"+S+" .lgv-seal{width:158px!important}"
    : force === "desktop"
    ? S+" .lgv-wrap{grid-template-columns:"+cols+"!important;max-width:1240px!important}"+S+" .lgv-story{order:"+storyOrder+"!important}"+S+" .lgv-title{font-size:"+d.fs+"px!important}"
    : "";
  return `
${S}{--p:${th.primary};--pd:${th.deep};--a:${th.accent};--a2:${th.accent2};--ok:${th.ok};--warn:${th.warn};--bad:${th.bad};--info:${th.info};--bg:${th.bg};--sf:${th.sf};--ln:${th.ln};--tx:${th.tx};--mu:${th.mu};--r:${cfg.radius}px;--pad:${d.pad}px;--gap:${d.gap}px;--fs:${d.fs}px;--cp:${d.cp}px;--blur:${cfg.blur}px;--cw:${cfg.lebar_kartu}px;--btnTx:${btnTx};
position:relative;isolation:isolate;overflow:hidden;background:var(--bg);color:var(--tx);min-height:calc(100vh - var(--hdr-h,72px));display:block;font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
${S} *{box-sizing:border-box;min-width:0}
${S} .lgv-bg{position:absolute;inset:0;z-index:0;pointer-events:none}
${S} .lgv-mesh{position:absolute;inset:-10%;background:${mesh};opacity:${cfg.latar==="polos"?0:1}}
${S} .lgv-photo{position:absolute;inset:0;background-image:${photo};background-size:cover;background-position:center;opacity:${cfg.latar==="foto"&&cfg.gambar_latar?1:0}}
${S} .lgv-scrim{position:absolute;inset:0;background:linear-gradient(105deg,${rgba(th.bg,cfg.overlay/100)},${rgba(th.bg,(cfg.overlay/100)*.55)} 55%,${rgba(th.bg,(cfg.overlay/100)*.25)});opacity:${cfg.latar==="foto"?1:.35}}
${S} .lgv-grid{position:absolute;inset:0;background-image:linear-gradient(${rgba(th.ln,.5)} 1px,transparent 1px),linear-gradient(90deg,${rgba(th.ln,.5)} 1px,transparent 1px);background-size:56px 56px;opacity:${cfg.latar==="grid"?.85:.28};mask-image:radial-gradient(72% 62% at 50% 34%,#000,transparent 86%)}
${S} .lgv-aurora{position:absolute;inset:0;filter:blur(var(--blur));opacity:${cfg.aurora&&cfg.latar!=="polos"?1:0}}
${S} .lgv-aurora i{position:absolute;display:block;border-radius:999px;mix-blend-mode:screen;animation:${kf}-drift ${cfg.aurora_kecepatan}s ease-in-out infinite alternate}
${S} .lgv-aurora i:nth-child(1){width:44%;padding-bottom:44%;left:-8%;top:-12%;background:radial-gradient(circle,${rgba(th.primary,.55)},transparent 68%)}
${S} .lgv-aurora i:nth-child(2){width:38%;padding-bottom:38%;right:-6%;top:6%;background:radial-gradient(circle,${rgba(th.accent2,.5)},transparent 68%);animation-delay:-8s}
${S} .lgv-aurora i:nth-child(3){width:42%;padding-bottom:42%;left:34%;bottom:-18%;background:radial-gradient(circle,${rgba(th.accent,.42)},transparent 70%);animation-delay:-15s}
${S} .lgv-grain{position:absolute;inset:0;opacity:${cfg.grain?cfg.grain_intensitas/100:0};mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
${S} .lgv-wrap{position:relative;z-index:10;width:100%;max-width:${wide?1100:1240}px;margin:0 auto;padding:var(--pad);display:grid;grid-template-columns:${cols};gap:calc(var(--gap)*1.7);align-items:center;min-height:calc(100vh - var(--hdr-h,72px))}
${S} .lgv-story{order:${storyOrder};display:${cfg.panel_aktif?"block":"none"}}
${S} .lgv-panel{order:${storyOrder===1?2:1};display:flex;flex-direction:column;align-items:center;gap:12px}
${S} .lgv-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:7px 14px;border-radius:999px;color:var(--a);background:${rgba(th.accent,.12)};border:1px solid ${rgba(th.accent,.36)}}
${S} .lgv-title{font-family:"Space Grotesk",Poppins,Inter,sans-serif;font-weight:700;font-size:var(--fs);line-height:1.06;margin:18px 0 0;letter-spacing:-.02em;overflow-wrap:anywhere}
${S} .lgv-title em{font-style:normal;background:linear-gradient(96deg,var(--a),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
${S} .lgv-tag{margin:14px 0 0;color:var(--mu);font-size:15px;line-height:1.65;max-width:46ch}
${S} .lgv-chips{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0;padding:0}
${S} .lgv-chips li{font-size:11.5px;font-weight:700;padding:6px 12px;border-radius:999px;color:var(--tx);background:${rgba(th.sf,.7)};border:1px solid var(--ln)}
${S} .lgv-seal{width:186px;aspect-ratio:1;margin:26px 0 0;display:${cfg.segel?"block":"none"}}
${S} .lgv-seal svg{width:100%;height:100%;overflow:visible}
${S} .lgv-ring{transform-origin:50% 50%;animation:${kf}-spin 26s linear infinite}
${S} .lgv-ring2{transform-origin:50% 50%;animation:${kf}-spin 17s linear infinite reverse}
${S} .lgv-orb{transform-origin:50% 50%;animation:${kf}-spin 12s linear infinite}
${S} .lgv-meta{display:${cfg.statistik?"grid":"none"};grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:24px 0 0}
${S} .lgv-meta div{background:${rgba(th.sf,.66)};border:1px solid var(--ln);border-radius:14px;padding:10px 12px}
${S} .lgv-meta dt{font-size:9.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}
${S} .lgv-meta dd{margin:4px 0 0;font-size:12.5px;font-weight:700;font-family:"JetBrains Mono",ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${S} .lgv-foot{margin:22px 0 0;font-size:11px;color:${rgba(th.mu,.8)}}
${S} .lgv-card{width:100%;max-width:var(--cw);background:${rgba(th.sf,.9)};border:1px solid var(--ln);border-radius:var(--r);padding:var(--cp);backdrop-filter:blur(14px);box-shadow:0 40px 80px -40px ${rgba("#000",.85)},0 0 0 1px ${rgba(th.primary,.08)} inset;position:relative;overflow:hidden}
${S} .lgv-card::before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,var(--p),var(--a2),var(--a))}
${S} .lgv-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}
${S} .lgv-badge{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;flex:none;color:var(--btnTx);background:linear-gradient(140deg,var(--p),var(--pd));box-shadow:0 12px 26px -12px ${rgba(th.primary,.9)}}
${S} .lgv-h{font-family:"Space Grotesk",Poppins,sans-serif;font-weight:700;font-size:20px;line-height:1.2;margin:0}
${S} .lgv-sub{margin:5px 0 0;font-size:12.5px;color:var(--mu);line-height:1.55}
${S} .lgv-repo{display:${cfg.info_repo?"flex":"none"};align-items:center;gap:9px;font-size:11.5px;font-family:"JetBrains Mono",ui-monospace,monospace;padding:9px 12px;border-radius:12px;background:${rgba(th.bg,.6)};border:1px solid var(--ln);margin-bottom:16px;overflow:hidden}
${S} .lgv-dot{width:8px;height:8px;border-radius:99px;flex:none;background:var(--ok);box-shadow:0 0 0 4px ${rgba(th.ok,.18)}}
${S} .lgv-dot.bad{background:var(--bad);box-shadow:0 0 0 4px ${rgba(th.bad,.18)}}
${S} .lgv-repo span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${S} label.lgv-lb{display:block;font-size:11.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--mu);margin-bottom:7px}
${S} .lgv-field{position:relative;display:flex;align-items:center}
${S} .lgv-field>svg,${S} .lgv-field .lgv-lead{position:absolute;left:13px;width:17px;height:17px;color:var(--mu);pointer-events:none}
${S} .lgv-input{width:100%;padding:14px 46px 14px 40px;border-radius:14px;border:1px solid var(--ln);background:${rgba(th.bg,.72)};color:var(--tx);font-size:14px;font-family:"JetBrains Mono",ui-monospace,monospace;outline:none;transition:border-color .2s,box-shadow .2s,background .2s}
${S} .lgv-input::placeholder{color:${rgba(th.mu,.65)}}
${S} .lgv-input:focus{border-color:var(--p);box-shadow:0 0 0 4px ${rgba(th.primary,.18)};background:${rgba(th.bg,.9)}}
${S} .lgv-eye{position:absolute;right:8px;width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:transparent;border:0;color:var(--mu);cursor:pointer;transition:background .2s,color .2s}
${S} .lgv-eye:hover{background:${rgba(th.primary,.14)};color:var(--tx)}
${S} .lgv-meter{height:5px;border-radius:99px;background:${rgba(th.ln,.7)};overflow:hidden;margin-top:9px}
${S} .lgv-meter i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--bad),var(--warn),var(--ok));transition:width .3s cubic-bezier(.2,.7,.3,1)}
${S} .lgv-hint{margin:8px 0 0;font-size:11.5px;color:var(--mu);min-height:16px;line-height:1.45}
${S} .lgv-hint.bad{color:var(--bad)} ${S} .lgv-hint.ok{color:var(--ok)}
${S} .lgv-tries{display:${cfg.batas_percobaan>0?"flex":"none"};align-items:center;gap:6px;margin-top:12px;font-size:11px;color:var(--mu)}
${S} .lgv-tries b{display:flex;gap:4px}
${S} .lgv-tries i{width:7px;height:7px;border-radius:99px;background:${rgba(th.ln,.9)};display:block}
${S} .lgv-tries i.on{background:var(--bad)}
${S} .lgv-submit{width:100%;margin-top:16px;padding:14px 18px;border:0;border-radius:14px;cursor:pointer;font-weight:800;font-size:14.5px;color:var(--btnTx);background:linear-gradient(120deg,var(--p),var(--pd));display:inline-flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 18px 34px -18px ${rgba(th.primary,.95)};transition:transform .16s,filter .2s,box-shadow .2s}
${S} .lgv-submit:hover{transform:translateY(-2px);filter:brightness(1.07)}
${S} .lgv-submit:active{transform:translateY(0)}
${S} .lgv-submit[disabled]{opacity:.6;cursor:not-allowed;transform:none;filter:grayscale(.3)}
${S} .lgv-spin{width:16px;height:16px;border-radius:99px;border:2px solid currentColor;border-top-color:transparent;animation:${kf}-spin .8s linear infinite}
${S} .lgv-notes{list-style:none;margin:18px 0 0;padding:16px 0 0;border-top:1px solid var(--ln);display:${cfg.catatan_aktif?"grid":"none"};gap:9px}
${S} .lgv-notes li{display:flex;gap:9px;font-size:11.5px;color:var(--mu);line-height:1.5}
${S} .lgv-notes svg{width:15px;height:15px;flex:none;color:var(--p);margin-top:1px}
${S} .lgv-help{margin-top:14px;display:${cfg.bantuan_aktif?"grid":"none"};gap:6px}
${S} .lgv-help details{border:1px solid var(--ln);border-radius:12px;background:${rgba(th.bg,.45)};overflow:hidden}
${S} .lgv-help summary{cursor:pointer;list-style:none;padding:10px 12px;font-size:12px;font-weight:700;display:flex;align-items:center;gap:8px}
${S} .lgv-help summary::-webkit-details-marker{display:none}
${S} .lgv-help summary svg{width:14px;height:14px;color:var(--a);transition:transform .25s}
${S} .lgv-help details[open] summary svg{transform:rotate(90deg)}
${S} .lgv-help p{margin:0;padding:0 12px 11px 34px;font-size:11.5px;color:var(--mu);line-height:1.6}
${S} .lgv-back{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--mu);text-decoration:none;margin-top:4px}
${S} .lgv-back:hover{color:var(--a)}
${S} .lgv-legal{font-size:10.5px;color:${rgba(th.mu,.75)};text-align:center;max-width:var(--cw);line-height:1.5}
${S} .lgv-veil{position:absolute;inset:0;z-index:30;display:none;place-items:center;padding:20px;background:${rgba(th.bg,.86)};backdrop-filter:blur(8px)}
${S} .lgv-veil.on{display:grid}
${S} .lgv-veil-in{max-width:340px;text-align:center}
${S} .lgv-veil-ic{width:66px;height:66px;border-radius:99px;display:grid;place-items:center;margin:0 auto 14px}
${S} .lgv-veil h3{font-family:"Space Grotesk",Poppins,sans-serif;font-size:19px;margin:0 0 6px}
${S} .lgv-veil p{margin:0;font-size:12.5px;color:var(--mu);line-height:1.6}
${S} .lgv-veil button{margin-top:16px;padding:10px 18px;border-radius:12px;border:1px solid var(--ln);background:transparent;color:var(--tx);font-weight:700;font-size:12.5px;cursor:pointer}
${S} .lgv-shake{animation:${kf}-shake .42s}
${S} .lgv-in{opacity:0;transform:translateY(16px);animation:${kf}-rise .62s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes ${kf}-drift{to{transform:translate3d(4%,-3%,0) scale(1.12)}}
@keyframes ${kf}-spin{to{transform:rotate(360deg)}}
@keyframes ${kf}-rise{to{opacity:1;transform:none}}
@keyframes ${kf}-shake{10%,90%{transform:translateX(-2px)}30%,70%{transform:translateX(4px)}50%{transform:translateX(-5px)}}
@media (max-width:1023px){${S} .lgv-wrap{grid-template-columns:1fr;max-width:640px}${S} .lgv-story{order:1}${S} .lgv-panel{order:2}${S} .lgv-title{font-size:32px}${S} .lgv-seal{width:150px}}
@media (max-width:640px){${S} .lgv-wrap{padding:18px;gap:20px}${S} .lgv-title{font-size:27px}${S} .lgv-tag{font-size:13.5px}${S} .lgv-seal{width:124px;margin-top:18px}${S} .lgv-meta{grid-template-columns:1fr}${S} .lgv-card{max-width:none}${S} .lgv-h{font-size:18px}}
${forced}
${S} ${anim ? "*{"+anim+"}" : ""}
@media (prefers-reduced-motion:reduce){${S} *{animation:none!important;transition:none!important}${S} .lgv-in{opacity:1;transform:none}}
`;
}

function seal(th, uid){
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Segel keamanan token">
  <defs>
    <linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:${th.primary}"/><stop offset=".55" style="stop-color:${th.accent2}"/><stop offset="1" style="stop-color:${th.accent}"/></linearGradient>
    <radialGradient id="r${uid}"><stop offset="0" style="stop-color:${rgba(th.primary,.34)}"/><stop offset="1" style="stop-color:${rgba(th.primary,0)}"/></radialGradient>
  </defs>
  <circle cx="100" cy="100" r="92" fill="url(#r${uid})"/>
  <circle class="lgv-ring" cx="100" cy="100" r="86" fill="none" stroke="url(#g${uid})" stroke-width="1.4" stroke-dasharray="10 14" opacity=".85"/>
  <circle class="lgv-ring2" cx="100" cy="100" r="68" fill="none" stroke="${rgba(th.accent2,.5)}" stroke-width="1" stroke-dasharray="3 9"/>
  <circle cx="100" cy="100" r="52" fill="${rgba(th.sf,.85)}" stroke="${th.ln}"/>
  <g class="lgv-orb"><circle cx="100" cy="14" r="4" fill="${th.accent}"/><circle cx="186" cy="100" r="3" fill="${th.accent2}"/><circle cx="100" cy="186" r="2.6" fill="${th.primary}"/></g>
  <path d="M100 62l26 10v22c0 18-11 30-26 36-15-6-26-18-26-36V72z" fill="none" stroke="url(#g${uid})" stroke-width="2.4" stroke-linejoin="round"/>
  <rect x="90" y="98" width="20" height="17" rx="4" fill="${th.primary}"/>
  <path d="M94 98v-6a6 6 0 0112 0v6" fill="none" stroke="${th.primary}" stroke-width="2.4"/>
  <circle cx="100" cy="106" r="2.2" fill="${readable(th.primary)}"/>
  <text x="100" y="150" text-anchor="middle" font-size="9" font-family="JetBrains Mono,monospace" fill="${th.mu}" letter-spacing="2">CONTENTS · RW</text>
</svg>`;
}

function html(cfg, th, ctx, uid){
  const repo = ctx.repo || {};
  const ok = !!(repo.owner && repo.repo);
  const brand = cfg.brand_nama || ctx.school || "Nama Sekolah";
  const chips = cfg.features.map(f => "<li>"+esc(f)+"</li>").join("");
  const notes = cfg.catatan.map(n => '<li><i data-lucide="'+esc(n.ikon||"check")+'"></i><span>'+esc(n.teks||"")+"</span></li>").join("");
  const help = cfg.bantuan.map(b => '<details><summary><i data-lucide="chevron-right"></i>'+esc(b.q||"")+"</summary><p>"+esc(b.a||"")+"</p></details>").join("");
  const tries = cfg.batas_percobaan>0 ? '<div class="lgv-tries"><span>Percobaan</span><b data-tries>' + Array.from({length:cfg.batas_percobaan},()=>"<i></i>").join("") + "</b><span data-tries-txt></span></div>" : "";
  const delay = i => cfg.animasi ? ' class="lgv-in" style="animation-delay:'+i+'ms"' : "";
  return `<div class="lgv" data-lgv="${uid}">
  <div class="lgv-bg"><div class="lgv-mesh"></div><div class="lgv-photo"></div><div class="lgv-scrim"></div><div class="lgv-grid"></div><div class="lgv-aurora"><i></i><i></i><i></i></div><div class="lgv-grain"></div></div>
  <div class="lgv-wrap">
    <section class="lgv-story">
      <span${delay(60)} class="lgv-eyebrow${cfg.animasi?" lgv-in":""}"><i data-lucide="shield-check" style="width:13px;height:13px"></i>${esc(cfg.eyebrow)}</span>
      <h1 class="lgv-title${cfg.animasi?" lgv-in":""}"${cfg.animasi?' style="animation-delay:140ms"':""}>${esc(cfg.headline)} ${cfg.headline_highlight?"<em>"+esc(cfg.headline_highlight)+"</em>":""}</h1>
      <p class="lgv-tag${cfg.animasi?" lgv-in":""}"${cfg.animasi?' style="animation-delay:220ms"':""}>${esc(cfg.tagline)}</p>
      <ul class="lgv-chips${cfg.animasi?" lgv-in":""}"${cfg.animasi?' style="animation-delay:300ms"':""}>${chips}</ul>
      <div class="lgv-seal">${seal(th,uid)}</div>
      <dl class="lgv-meta">
        <div><dt>Repositori</dt><dd data-meta-repo>${esc(ok?repo.owner+"/"+repo.repo:"belum diatur")}</dd></div>
        <div><dt>Branch</dt><dd>${esc(repo.branch||"main")}</dd></div>
        <div><dt>Sesi</dt><dd>${cfg.sesi_menit} menit</dd></div>
      </dl>
      <p class="lgv-foot">${esc(cfg.footer_teks)}</p>
    </section>
    <section class="lgv-panel">
      <div class="lgv-card${cfg.animasi?" lgv-in":""}"${cfg.animasi?' style="animation-delay:180ms"':""} data-card>
        <div class="lgv-head">
          <div class="lgv-badge"><i data-lucide="${esc(cfg.logo_ikon)}" style="width:22px;height:22px"></i></div>
          <div style="min-width:0"><h2 class="lgv-h">${esc(cfg.judul_form)}</h2><p class="lgv-sub">${esc(cfg.subjudul_form)}</p>
          <div style="font-size:11px;color:var(--mu);margin-top:4px;font-weight:700">${esc(brand)} · ${esc(cfg.brand_sub)}</div></div>
        </div>
        <div class="lgv-repo"><span class="lgv-dot${ok?"":" bad"}" data-dot></span><span data-repo>${esc(ok?repo.owner+"/"+repo.repo+" @ "+repo.branch:"config.js belum diisi — lengkapi username & repo")}</span></div>
        <form data-form novalidate>
          <label class="lgv-lb" for="lgvTok${uid}">${esc(cfg.label_token)}</label>
          <div class="lgv-field">
            <i data-lucide="key-round" class="lgv-lead"></i>
            <input id="lgvTok${uid}" data-token class="lgv-input" type="${cfg.mode_input==="text"?"text":"password"}" autocomplete="off" spellcheck="false" placeholder="${esc(cfg.placeholder_token)}" aria-describedby="lgvHint${uid}">
            ${cfg.mata?'<button type="button" class="lgv-eye" data-eye aria-label="Tampilkan token"><i data-lucide="eye" style="width:17px;height:17px"></i></button>':""}
          </div>
          <div class="lgv-meter"><i data-meter></i></div>
          <p class="lgv-hint" id="lgvHint${uid}" data-hint aria-live="polite">Token tidak pernah ditulis ke repositori.</p>
          ${tries}
          <button class="lgv-submit" data-submit type="submit"><span data-btn-label>${esc(cfg.tombol_label)}</span><i data-lucide="${esc(cfg.tombol_ikon)}" style="width:17px;height:17px"></i></button>
        </form>
        <ul class="lgv-notes">${notes}</ul>
        <div class="lgv-help">${help}</div>
        <div class="lgv-veil" data-veil><div class="lgv-veil-in">
          <div class="lgv-veil-ic" data-veil-ic><i data-lucide="check" style="width:30px;height:30px"></i></div>
          <h3 data-veil-h>Berhasil</h3><p data-veil-p></p>
          <button type="button" data-veil-btn>Tutup</button>
        </div></div>
      </div>
      <a class="lgv-back" href="${esc(cfg.back_href)}"><i data-lucide="arrow-left" style="width:14px;height:14px"></i>${esc(cfg.back_label)}</a>
      <p class="lgv-legal">Token disimpan sementara di sessionStorage peramban dan tidak pernah di-hardcode maupun dikirim ke selain api.github.com.</p>
    </section>
  </div>
</div>`;
}

function score(tok, cfg){
  const t = String(tok||"").trim();
  if (!t) return { pct:0, msg:"Token tidak pernah ditulis ke repositori.", tone:"" };
  const fine = t.startsWith("github_pat_"), classic = t.startsWith("ghp_");
  if (cfg.prefiks_wajib && !fine && !classic) return { pct:18, msg:"Format tidak dikenal. Gunakan PAT berawalan github_pat_ atau ghp_.", tone:"bad" };
  if (classic && !cfg.izinkan_classic) return { pct:24, msg:"Token classic (ghp_) dinonaktifkan. Gunakan Fine-grained PAT.", tone:"bad" };
  if (t.length < cfg.min_panjang) return { pct:Math.max(30, Math.round(t.length/cfg.min_panjang*70)), msg:"Panjang "+t.length+"/"+cfg.min_panjang+" karakter — belum memenuhi minimum.", tone:"bad" };
  return { pct:100, msg:(fine?"Fine-grained PAT":"Classic PAT")+" terdeteksi · "+t.length+" karakter · siap diverifikasi.", tone:"ok" };
}

function mount(host, raw, ctx){
  const { cfg, th } = norm(raw);
  const uid = Math.random().toString(36).slice(2,8);
  const scope = ".lgv-"+uid;
  host.innerHTML = "<style>"+css(cfg,th,scope,"kf"+uid,ctx.force||"")+"</style>"+html(cfg,th,ctx,uid);
  const root = host.querySelector(".lgv");
  root.classList.add("lgv-"+uid);
  const q = s => root.querySelector(s);
  const refs = { root, cfg, th, form:q("[data-form]"), token:q("[data-token]"), eye:q("[data-eye]"), meter:q("[data-meter]"),
    hint:q("[data-hint]"), submit:q("[data-submit]"), btnLabel:q("[data-btn-label]"), card:q("[data-card]"),
    tries:q("[data-tries]"), triesTxt:q("[data-tries-txt]"), veil:q("[data-veil]"), veilIc:q("[data-veil-ic]"),
    veilH:q("[data-veil-h]"), veilP:q("[data-veil-p]"), veilBtn:q("[data-veil-btn]"), repo:q("[data-repo]"), dot:q("[data-dot]") };

  let busy = false, handler = null, veilTimer = null;

  function paintMeter(){
    const s = score(refs.token.value, cfg);
    refs.meter.style.width = s.pct+"%";
    refs.hint.textContent = s.msg;
    refs.hint.className = "lgv-hint"+(s.tone?" "+s.tone:"");
    return s;
  }
  refs.token.addEventListener("input", paintMeter);
  if (refs.eye) refs.eye.onclick = () => {
    const show = refs.token.type === "password";
    refs.token.type = show ? "text" : "password";
    refs.eye.innerHTML = '<i data-lucide="'+(show?"eye-off":"eye")+'" style="width:17px;height:17px"></i>';
    refs.eye.setAttribute("aria-label", show?"Sembunyikan token":"Tampilkan token");
    if (window.lucide) lucide.createIcons();
    refs.token.focus();
  };

  const api = {
    refs, cfg, th,
    onSubmit(fn){ handler = fn; },
    busy(on, label){
      busy = !!on;
      refs.submit.disabled = !!on;
      refs.btnLabel.textContent = on ? (label||"Memverifikasi…") : cfg.tombol_label;
      const ic = refs.submit.querySelector("svg,i");
      if (on) { if (ic) ic.remove(); const s=document.createElement("span"); s.className="lgv-spin"; refs.submit.appendChild(s); }
      else { const s=refs.submit.querySelector(".lgv-spin"); if (s) s.remove(); if (!refs.submit.querySelector("svg")) { const i=document.createElement("i"); i.setAttribute("data-lucide",cfg.tombol_ikon); i.style.width="17px"; i.style.height="17px"; refs.submit.appendChild(i); if (window.lucide) lucide.createIcons(); } }
    },
    error(msg){
      refs.hint.textContent = msg; refs.hint.className = "lgv-hint bad";
      refs.card.classList.remove("lgv-shake"); void refs.card.offsetWidth; refs.card.classList.add("lgv-shake");
    },
    attempts(n){
      if (!refs.tries) return;
      [...refs.tries.children].forEach((d,i)=>d.classList.toggle("on", i<n));
      refs.triesTxt.textContent = n>0 ? (Math.max(0,cfg.batas_percobaan-n)+" tersisa") : "";
    },
    veil(kind, title, text, btnLabel){
      const map = { ok:[th.ok,"circle-check"], bad:[th.bad,"lock"], info:[th.info,"info"] };
      const [col,ic] = map[kind] || map.info;
      refs.veilIc.style.background = rgba(col,.16); refs.veilIc.style.color = col;
      refs.veilIc.innerHTML = '<i data-lucide="'+ic+'" style="width:30px;height:30px"></i>';
      refs.veilH.textContent = title; refs.veilP.textContent = text;
      refs.veilBtn.textContent = btnLabel || "Tutup";
      refs.veil.classList.add("on");
      if (window.lucide) lucide.createIcons();
    },
    closeVeil(){ refs.veil.classList.remove("on"); clearTimeout(veilTimer); },
    setRepo(owner, repo, branch){
      const ok = !!(owner && repo);
      refs.repo.textContent = ok ? owner+"/"+repo+" @ "+branch : "config.js belum diisi — lengkapi username & repo";
      refs.dot.classList.toggle("bad", !ok);
      const m = root.querySelector("[data-meta-repo]"); if (m) m.textContent = ok ? owner+"/"+repo : "belum diatur";
    },
    meter: paintMeter,
    focus(){ refs.token.focus(); }
  };
  refs.veilBtn.onclick = () => api.closeVeil();
  refs.form.addEventListener("submit", e => {
    e.preventDefault();
    if (busy) return;
    const s = paintMeter();
    if (s.tone === "bad") { api.error(s.msg); return; }
    if (handler) handler(refs.token.value.trim(), api);
  });
  paintMeter();
  if (window.lucide) lucide.createIcons();
  return api;
}

window.LoginView = { THEMES, DEF, ICONS, norm, mount, score, esc };
})();