// ============================================================
// slider.js — Mesin Hero Slider bersama (beranda + halaman SD/SMP/SMA/SMK)
// Data: data/slider.json  → { config, configs:{<halaman>:{...}}, slides:[{halaman,...}] }
// Pemakaian:  const prep = LSSlider.prepare(data, "sd");   // {cfg, list}
//             if (prep.list.length) LSSlider.mount(hostEl, prep, { down: "#konten" });
// Hanya transform/opacity yang dianimasikan; tidak ada blend-mode/backdrop-filter di atas slide.
// ============================================================
(function () {
  "use strict";
  var PAGES = ["beranda", "sd", "smp", "sma", "smk"];
  var CSS = `    /* ===== FULL SLIDER (dioptimalkan: hanya transform/opacity, tanpa blend-mode & backdrop-filter) ===== */
    #slider{touch-action:pan-y;contain:layout paint}
    .sld{position:absolute;inset:0;visibility:hidden;backface-visibility:hidden;transition:transform .8s cubic-bezier(.76,0,.24,1),opacity .7s ease}
    .sld.vis{visibility:visible;will-change:transform,opacity}
    .sld-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.04);backface-visibility:hidden}
    #slider:not(.no-kb) .sld.on .sld-img{will-change:transform;animation:kb var(--kb,9s) ease-out forwards}
    /* slide yang sedang keluar menahan posisi akhir Ken Burns -> tidak ada "loncatan" skala saat bergeser */
    #slider:not(.no-kb) .sld.out .sld-img{transform:scale(1.16) translate3d(-1.5%,-1%,0)}
    @keyframes kb{from{transform:scale(1.04) translate3d(0,0,0)}to{transform:scale(1.16) translate3d(-1.5%,-1%,0)}}
    .sld-anim{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1)}
    .sld.on .sld-anim{opacity:1;transform:none}
    .dot{position:relative;height:10px;width:10px;border-radius:99px;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.5);overflow:hidden;transition:width .45s cubic-bezier(.2,.7,.3,1),background .3s}
    .dot:hover{background:rgba(255,255,255,.6)}
    .dot.on{width:52px;background:rgba(255,255,255,.28)}
    .dot .fill{position:absolute;inset:0;width:100%;transform:scaleX(0);transform-origin:0 50%;border-radius:99px;background:linear-gradient(90deg,#fbbf24,#fff)}
    #slProg{transform:scaleX(0);transform-origin:0 50%}
    .sl-arrow{transition:background .25s,opacity .25s}

`;
  if (!document.getElementById("lsSliderCss")) { var st = document.createElement("style"); st.id = "lsSliderCss"; st.textContent = CSS + "@media (prefers-reduced-motion:reduce){.sld{transition:opacity .2s linear!important}#slider .sld .sld-img{animation:none!important}.sld-anim{opacity:1;transform:none;transition:none}}"; document.head.appendChild(st); }
  var MARKUP = `<div id="slider" role="region" aria-roledescription="carousel" aria-label="Sorotan sekolah" tabindex="0"
         class="relative w-full overflow-hidden bg-slate-950 outline-none focus-visible:ring-4 focus-visible:ring-brand-400"
         style="height:calc(100vh - 72px);min-height:540px;max-height:920px">
      <div id="slTrack" class="absolute inset-0"></div>
      <div class="absolute top-0 inset-x-0 h-[3px] bg-white/15 z-30"><div id="slProg" class="h-full w-full bg-gradient-to-r from-amber-400 via-white to-brand-400"></div></div>
      <button id="slPrev" aria-label="Slide sebelumnya" class="sl-arrow hidden md:flex absolute left-4 lg:left-7 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 border border-white/30 text-white items-center justify-center hover:bg-white/25"><i data-lucide="chevron-left" class="w-6 h-6"></i></button>
      <button id="slNext" aria-label="Slide berikutnya" class="sl-arrow hidden md:flex absolute right-4 lg:right-7 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 border border-white/30 text-white items-center justify-center hover:bg-white/25"><i data-lucide="chevron-right" class="w-6 h-6"></i></button>
      <div class="absolute bottom-0 inset-x-0 z-30 px-4 md:px-8 pb-12 md:pb-14">
        <div class="relative max-w-7xl mx-auto flex items-end justify-between gap-4">
          <div id="slCounter" class="hidden sm:block text-white/85 font-mono text-xs tracking-widest"></div>
          <div id="slDots" role="tablist" aria-label="Navigasi slide" class="absolute left-1/2 -translate-x-1/2 bottom-1 flex items-center gap-2"></div>
          <div class="flex items-center gap-2 ml-auto">
            <button id="slPlay" aria-label="Jeda putar otomatis" class="w-10 h-10 rounded-full bg-black/30 border border-white/30 text-white flex items-center justify-center hover:bg-white/25"><i data-lucide="pause" class="w-4 h-4"></i></button>
            <a id="slDown" href="#profil" aria-label="Gulir ke konten" class="hidden sm:flex w-10 h-10 rounded-full bg-black/30 border border-white/30 text-white items-center justify-center hover:bg-white/25"><i data-lucide="arrow-down" class="w-4 h-4"></i></a>
          </div>
        </div>
      </div>
      <p id="slLive" class="sr-only" aria-live="polite"></p>
    </div>`;
  var $ = function (id) { return document.getElementById(id); };
  // esc & refreshIcons milik app.js; dipanggil lewat pencarian saat dipakai (urutan muat skrip tidak masalah)
  var _esc = function (x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var esc = function (x) { return typeof window.esc === "function" ? window.esc(x) : _esc(x); };
  var refreshIcons = function () { if (typeof window.__lsRefreshIcons === "function") window.__lsRefreshIcons(); else if (window.lucide) window.lucide.createIcons(); };
    const ACC = {
      emerald:{hex:"#10b981",glow:"16,185,129",pill:"bg-emerald-400/90 text-emerald-950",btn:"bg-emerald-400 hover:bg-emerald-300 text-emerald-950"},
      amber:{hex:"#f59e0b",glow:"245,158,11",pill:"bg-amber-400/90 text-amber-950",btn:"bg-amber-400 hover:bg-amber-300 text-amber-950"},
      sky:{hex:"#0ea5e9",glow:"14,165,233",pill:"bg-sky-400/90 text-sky-950",btn:"bg-sky-400 hover:bg-sky-300 text-sky-950"},
      violet:{hex:"#8b5cf6",glow:"139,92,246",pill:"bg-violet-400/90 text-violet-950",btn:"bg-violet-400 hover:bg-violet-300 text-violet-950"},
      rose:{hex:"#f43f5e",glow:"244,63,94",pill:"bg-rose-400/90 text-rose-950",btn:"bg-rose-400 hover:bg-rose-300 text-rose-950"},
      teal:{hex:"#14b8a6",glow:"20,184,166",pill:"bg-teal-400/90 text-teal-950",btn:"bg-teal-400 hover:bg-teal-300 text-teal-950"}
    };
    const accOf = a => ACC[a] || ACC.emerald;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SL = { cfg:{autoplay:true,durasi:7000,efek:"slide",tinggi:"full",dots:true,panah:true,pause_on_hover:true,kenburns:true}, list:[], i:0, playing:true, hover:false, focus:false, inView:true, busy:false, elapsed:0, last:0, lp:-1, raf:0, drag:null, els:null, fill:null, prog:null, cleanT:0 };

    function slHeight(){ const t=SL.cfg.tinggi, el=$("slider");
      if(t==="compact") el.style.cssText="height:520px;min-height:420px";
      else if(t==="medium") el.style.cssText="height:70vh;min-height:480px;max-height:760px";
      else el.style.cssText="height:calc(100vh - 72px);min-height:540px;max-height:920px"; }

    const slIdle = fn => window.requestIdleCallback ? requestIdleCallback(fn,{timeout:2500}) : setTimeout(fn,300);

    function slBuild(){
      slHeight();
      SL.els=null;
      $("slider").classList.toggle("no-kb", !SL.cfg.kenburns || reduceMotion);
      const track=$("slTrack");
      track.innerHTML = SL.list.map((s,i)=>{
        const a=accOf(s.accent), ov=Math.max(20,Math.min(92,+s.overlay||70))/100, center=s.align==="center";
        const scrim = center
          ? "linear-gradient(to top, rgba(2,6,23,"+ov+") 0%, rgba(2,6,23,"+(ov*.82).toFixed(2)+") 48%, rgba(2,6,23,"+(ov*.5).toFixed(2)+") 100%)"
          : "linear-gradient(100deg, rgba(2,6,23,"+ov+") 0%, rgba(2,6,23,"+(ov*.78).toFixed(2)+") 46%, rgba(2,6,23,"+(ov*.22).toFixed(2)+") 100%)";
        const meta = Array.isArray(s.meta)?s.meta:String(s.meta||"").split(",").map(x=>x.trim()).filter(Boolean);
        const cta=(l,h,p)=>!l||!h?"":'<a href="'+esc(h)+'" data-cta="'+esc(h)+'" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition '+(p?a.btn+" shadow-lg":"bg-white/15 border border-white/35 text-white hover:bg-white/25")+'">'+esc(l)+'<i data-lucide="'+(p?"arrow-right":"chevron-right")+'" class="w-4 h-4"></i></a>';
        // Gambar pertama dimuat segera (prioritas tinggi). Sisanya dimuat setelah halaman idle (slWarm)
        // dan di-decode lebih dulu, supaya saat slide bergeser tidak ada kotak kosong / frame tersendat.
        const imgAttr = i===0 ? 'src="'+esc(s.gambar)+'" fetchpriority="high" decoding="async"' : 'data-src="'+esc(s.gambar)+'" decoding="async"';
        return '<article class="sld" data-i="'+i+'" aria-hidden="true" style="--kb:'+((+s.durasi||SL.cfg.durasi)+1200)+'ms">'+
          '<div class="absolute inset-0" style="background:linear-gradient(135deg,'+a.hex+',#0f172a)"></div>'+
          '<img class="sld-img" '+imgAttr+' alt="'+esc(s.judul)+'" onerror="this.style.display=\'none\'">'+
          '<div class="absolute inset-0" style="background:'+scrim+'"></div>'+
          '<div class="absolute inset-0 opacity-60" style="background:radial-gradient(60% 55% at 18% 28%, rgba('+a.glow+',.42), transparent 62%),radial-gradient(45% 45% at 84% 76%, rgba('+a.glow+',.28), transparent 66%)"></div>'+
          '<div class="relative h-full max-w-7xl mx-auto px-5 md:px-8 flex '+(center?"items-center justify-center text-center":"items-center")+'">'+
            '<div class="'+(center?"max-w-3xl":"max-w-2xl")+' pb-28 md:pb-32">'+
              (s.eyebrow?'<span class="sld-anim inline-flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full '+a.pill+'" style="transition-delay:.05s"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i>'+esc(s.eyebrow)+'</span>':'')+
              '<h1 class="sld-anim font-display font-extrabold text-white text-3xl sm:text-4xl md:text-6xl leading-[1.08] mt-4" style="transition-delay:.14s">'+esc(s.judul)+(s.highlight?' <span style="color:'+a.hex+'">'+esc(s.highlight)+'</span>':'')+'</h1>'+
              (s.subjudul?'<p class="sld-anim text-white/90 font-semibold text-sm md:text-lg mt-3" style="transition-delay:.22s">'+esc(s.subjudul)+'</p>':'')+
              (s.deskripsi?'<p class="sld-anim text-white/75 text-sm md:text-base mt-3 leading-relaxed '+(center?"mx-auto":"")+' max-w-xl" style="transition-delay:.3s">'+esc(s.deskripsi)+'</p>':'')+
              '<div class="sld-anim mt-7 flex flex-wrap gap-3 '+(center?"justify-center":"")+'" style="transition-delay:.38s">'+cta(s.cta1_label,s.cta1_href,true)+cta(s.cta2_label,s.cta2_href,false)+'</div>'+
              (meta.length?'<div class="sld-anim mt-7 flex flex-wrap gap-2 '+(center?"justify-center":"")+'" style="transition-delay:.46s">'+meta.map(m=>'<span class="text-[11px] md:text-xs font-semibold text-white/90 px-3 py-1.5 rounded-full bg-black/25 border border-white/20">'+esc(m)+'</span>').join("")+'</div>':'')+
            '</div></div></article>';
      }).join("");
      $("slDots").innerHTML = SL.cfg.dots ? SL.list.map((s,i)=>'<button class="dot" role="tab" data-dot="'+i+'" aria-label="Slide '+(i+1)+': '+esc(s.judul)+'" aria-selected="false"><span class="fill"></span></button>').join("") : "";
      $("slDots").querySelectorAll("[data-dot]").forEach(b=>b.onclick=()=>slGo(+b.dataset.dot,true));
      $("slPrev").style.display = SL.cfg.panah?"":"none";
      $("slNext").style.display = SL.cfg.panah?"":"none";
      $("slPlay").style.display = SL.list.length>1?"":"none";
      track.querySelectorAll("[data-cta]").forEach(a=>a.addEventListener("click",ev=>{ if(a.dataset.cta==="#tour"&&typeof window.openTour==="function"){ev.preventDefault();window.openTour();} }));
      slApply(-1,1); refreshIcons();
    }

    // Posisi slide per efek. st: "start" (siap masuk) | "center" (tampil) | "end" (keluar). d: arah (+1 maju, -1 mundur)
    function slPlace(el,st,d){
      const eff=SL.cfg.efek;
      if(eff==="slide"){ el.style.opacity="1"; el.style.transform="translate3d("+(st==="start"?d*100:st==="end"?-d*100:0)+"%,0,0)"; }
      else if(eff==="zoom"){ el.style.opacity=st==="center"?"1":"0"; el.style.transform=st==="center"?"scale(1)":"scale(1.08)"; }
      else { el.style.opacity=st==="center"?"1":"0"; el.style.transform="none"; }
    }
    // Hanya DUA slide yang dianimasikan (keluar + masuk). Slide lain "diparkir" (visibility:hidden, tanpa transisi),
    // sehingga tidak ada slide yang melintas 3-4 layar saat loop dari slide terakhir ke pertama.
    function slApply(prev,dir){
      const els = SL.els || (SL.els=[...$("slTrack").querySelectorAll(".sld")]);
      const cur = els[SL.i], out = (prev>=0 && prev!==SL.i) ? els[prev] : null;
      clearTimeout(SL.cleanT);
      els.forEach((el,i)=>{
        const on = i===SL.i;
        el.setAttribute("aria-hidden",on?"false":"true"); el.style.pointerEvents=on?"auto":"none"; el.style.zIndex=on?"2":"1";
        if(el===cur||el===out) return;
        el.classList.remove("on","vis","out"); el.style.transition="none"; slPlace(el,"start",dir);
      });
      if(!cur) return;
      if(out){
        cur.style.transition="none"; slPlace(cur,"start",dir); cur.classList.remove("out"); cur.classList.add("vis");
        void cur.offsetWidth;                      // satu reflow saja agar posisi awal tercatat sebelum transisi
        cur.style.transition=""; slPlace(cur,"center",dir); cur.classList.add("on");
        out.classList.remove("on"); out.classList.add("out","vis"); out.style.transition=""; slPlace(out,"end",dir);
        SL.cleanT=setTimeout(()=>{ out.classList.remove("vis","out"); out.style.transition="none"; },900);
      } else {
        cur.style.transition="none"; slPlace(cur,"center",dir); cur.classList.remove("out"); cur.classList.add("vis","on");
      }
      const dots=$("slDots").querySelectorAll(".dot");
      dots.forEach((d,i)=>{d.classList.toggle("on",i===SL.i);d.setAttribute("aria-selected",i===SL.i?"true":"false");d.querySelector(".fill").style.transform="scaleX(0)";});
      SL.fill = dots[SL.i] ? dots[SL.i].querySelector(".fill") : null; SL.lp=-1;
      const pad=n=>String(n).padStart(2,"0");
      $("slCounter").textContent=pad(SL.i+1)+" / "+pad(SL.list.length);
      $("slLive").textContent="Slide "+(SL.i+1)+" dari "+SL.list.length+": "+(SL.list[SL.i]?SL.list[SL.i].judul:"");
    }
    function slGo(i,user,dir){
      if(!SL.list.length)return;
      const n=SL.list.length, next=(i+n)%n;
      if(next===SL.i) return;
      if(user && SL.busy) return;                  // abaikan klik beruntun saat transisi masih berjalan
      const prev=SL.i; SL.i=next; SL.elapsed=0; SL.last=0;
      SL.busy=true; setTimeout(()=>{SL.busy=false;},820);
      slApply(prev, dir || (next>prev?1:-1));
      if(user&&SL.playing)slStart();
    }
    const slNext=u=>slGo(SL.i+1,u,1), slPrev=u=>slGo(SL.i-1,u,-1);
    function slDur(){ return Math.max(2500,+((SL.list[SL.i]||{}).durasi)||+SL.cfg.durasi||7000); }
    function slStop(){ if(SL.raf)cancelAnimationFrame(SL.raf); SL.raf=0; SL.last=0; }
    function slStart(){
      slStop();
      if(!SL.playing||SL.list.length<2||reduceMotion||!SL.inView){slPaint(0);return;}
      const step=ts=>{
        if(!SL.last)SL.last=ts;
        const dt=Math.min(ts-SL.last,100); SL.last=ts;
        if(!(document.hidden||(SL.cfg.pause_on_hover&&SL.hover)||SL.focus)) SL.elapsed+=dt;
        const p=Math.min(1,SL.elapsed/slDur()); slPaint(p);
        if(p>=1){SL.elapsed=0;SL.last=0;slNext(false);}
        SL.raf=requestAnimationFrame(step);
      };
      SL.raf=requestAnimationFrame(step);
    }
    // Progres memakai transform (bukan width) -> tidak memicu layout di setiap frame
    function slPaint(p){
      const q=Math.round(p*400)/400; if(q===SL.lp) return; SL.lp=q;
      SL.prog.style.transform="scaleX("+q+")"; if(SL.fill) SL.fill.style.transform="scaleX("+q+")";
    }
    function slToggle(){
      SL.playing=!SL.playing;
      $("slPlay").innerHTML='<i data-lucide="'+(SL.playing?"pause":"play")+'" class="w-4 h-4"></i>';
      $("slPlay").setAttribute("aria-label",SL.playing?"Jeda putar otomatis":"Putar otomatis");
      refreshIcons(); if(SL.playing)slStart(); else {slStop();slPaint(0);}
    }
    // Muat gambar slide 2..n setelah gambar pertama tampil, satu per satu, lalu decode di luar frame animasi
    function slWarm(){
      const q=[...$("slTrack").querySelectorAll("img[data-src]")];
      const next=()=>{ const im=q.shift(); if(!im) return;
        const done=()=>setTimeout(next,60);
        im.addEventListener("load",()=>{ (im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(done); },{once:true});
        im.addEventListener("error",done,{once:true});
        im.src=im.dataset.src; im.removeAttribute("data-src"); };
      next();
    }
    // prep = hasil LSSlider.prepare(): { cfg, list } -> slide aktif milik halaman ini
    function slInit(prep, opt){
      SL.cfg={...SL.cfg,...(prep.cfg||{})};
      SL.list=prep.list;
      if(reduceMotion){SL.cfg.autoplay=false;SL.cfg.kenburns=false;}
      SL.playing=!!SL.cfg.autoplay; SL.i=0; SL.inView=true; SL.prog=$("slProg");
      slBuild();
      $("slPlay").innerHTML='<i data-lucide="'+(SL.playing?"pause":"play")+'" class="w-4 h-4"></i>';
      $("slPrev").onclick=()=>slPrev(true); $("slNext").onclick=()=>slNext(true); $("slPlay").onclick=slToggle;
      const box=$("slider");
      box.addEventListener("mouseenter",()=>SL.hover=true);
      box.addEventListener("mouseleave",()=>SL.hover=false);
      // Jeda autoplay hanya untuk fokus KEYBOARD (focus-visible); klik mouse pada panah tidak lagi menghentikan autoplay
      box.addEventListener("focusin",e=>{ SL.focus = e.target!==box && !!(e.target.matches && e.target.matches(":focus-visible")); });
      box.addEventListener("focusout",()=>{ SL.focus=false; });
      box.addEventListener("pointerdown",e=>{if(e.target.closest("a,button"))return;SL.drag={x:e.clientX,t:Date.now()};});
      box.addEventListener("pointerup",e=>{ if(!SL.drag)return; const dx=e.clientX-SL.drag.x,dt=Date.now()-SL.drag.t; SL.drag=null; if(Math.abs(dx)>45&&dt<900)dx<0?slNext(true):slPrev(true); });
      box.addEventListener("pointercancel",()=>SL.drag=null);
      document.addEventListener("visibilitychange",()=>{SL.last=0;});
      // Hentikan loop rAF saat hero tidak terlihat (pengunjung menggulir ke bawah)
      if("IntersectionObserver" in window) new IntersectionObserver(en=>{ SL.inView=en[0].isIntersecting; if(SL.inView&&SL.playing)slStart(); else slStop(); },{threshold:.05}).observe(box);
      refreshIcons(); slStart();
      const first=$("slTrack").querySelector("img");
      const warm=()=>slIdle(slWarm);
      if(!first||first.complete) warm(); else { first.addEventListener("load",warm,{once:true}); first.addEventListener("error",warm,{once:true}); }
    }


    // Pilih slide & konfigurasi milik satu halaman. Slide lama tanpa field "halaman" = beranda.
    function prepare(data, page) {
      var raw = Array.isArray(data) ? { slides: data } : (data || {});
      page = PAGES.indexOf(page) >= 0 ? page : "beranda";
      var cfg = Object.assign({}, raw.config || {}, (raw.configs && raw.configs[page]) || {});
      var list = (raw.slides || []).filter(function (s) { return (s.halaman || "beranda") === page && s.status !== "Draft"; })
        .sort(function (a, b) { return (a.urutan || 99) - (b.urutan || 99); });
      return { page: page, cfg: cfg, list: list };
    }
    function mount(host, prep, opt) {
      opt = opt || {};
      host.innerHTML = MARKUP;
      if (opt.down) $("slDown").setAttribute("href", opt.down);
      Object.assign(SL, { i: 0, els: null, fill: null, prog: null, cleanT: 0, raf: 0, lp: -1, elapsed: 0, last: 0, busy: false, hover: false, focus: false, inView: true, drag: null });
      slInit(prep, opt);
    }
    window.LSSlider = { prepare: prepare, mount: mount, pages: PAGES };
})();
