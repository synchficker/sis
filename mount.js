// ============================================================
// mount.js — Pemuat halaman untuk URL bersih (/admin/, /login/, …)
// Menampilkan layar siap yang dirancang, lalu memasang halaman
// asli dengan <base> benar sehingga seluruh aset & skrip berjalan
// identik. Tanpa iframe, tanpa redirect, URL tetap bersih.
// ============================================================
(function () {
  "use strict";
  var S = document.currentScript;
  var ROOT = (S && S.src ? S.src : location.href).replace(/mount\.js(\?.*)?$/i, "");
  var PAGE = ((S && S.dataset.page) || "").toLowerCase();
  var TITLE = (S && S.dataset.title) || "Halaman";
  var FILE = location.protocol === "file:";

  window.__LS_MOUNTED__ = 1;
  window.__LS_PAGE__ = PAGE;

  if (FILE) { location.replace(ROOT + PAGE + ".html" + location.search + location.hash); return; }

  var P = { ink: "#04120e", sf: "#0a2019", ln: "#1d4a3b", p: "#10b981", pd: "#047857", a: "#fbbf24", a2: "#22d3ee", tx: "#e8f5ee", mu: "#8fb6a6", bad: "#fb7185" };

  var st = document.createElement("style");
  st.textContent =
    ":root{--ink:" + P.ink + ";--sf:" + P.sf + ";--ln:" + P.ln + ";--p:" + P.p + ";--a:" + P.a + ";--a2:" + P.a2 + ";--tx:" + P.tx + ";--mu:" + P.mu + ";--bad:" + P.bad + "}" +
    "*{box-sizing:border-box}html,body{margin:0;height:100%;overflow-x:clip;background:var(--ink);color:var(--tx);font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}" +
    "html{scrollbar-color:var(--p) var(--ink);scrollbar-width:thin}::-webkit-scrollbar{width:11px;height:11px}::-webkit-scrollbar-track{background:var(--ink)}::-webkit-scrollbar-thumb{background:linear-gradient(var(--p),var(--a2));border-radius:99px;border:2px solid var(--ink)}::-webkit-scrollbar-thumb:hover{background:var(--p)}" +
    "#mt{position:relative;min-height:100vh;display:grid;place-items:center;padding:24px;isolation:isolate;overflow:hidden}" +
    "#mt .bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(48% 44% at 14% 12%,rgba(16,185,129,.34),transparent 62%),radial-gradient(42% 40% at 86% 8%,rgba(34,211,238,.26),transparent 64%),radial-gradient(46% 44% at 72% 92%,rgba(251,191,36,.22),transparent 66%),linear-gradient(150deg,var(--ink),#071b15 55%,var(--ink))}" +
    "#mt .gr{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")}" +
    "#mt .gd{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.3;background-image:linear-gradient(rgba(29,74,59,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(29,74,59,.5) 1px,transparent 1px);background-size:54px 54px;mask-image:radial-gradient(66% 58% at 50% 42%,#000,transparent 86%)}" +
    "#mt .card{position:relative;z-index:2;width:100%;max-width:430px;background:rgba(10,32,25,.86);border:1px solid var(--ln);border-radius:22px;padding:26px;backdrop-filter:blur(12px);box-shadow:0 44px 90px -46px rgba(0,0,0,.9);text-align:center;animation:rise .5s cubic-bezier(.2,.7,.3,1) both}" +
    "@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    "#mt .seal{width:104px;height:104px;margin:0 auto 16px;position:relative}" +
    "#mt .seal svg{width:100%;height:100%;overflow:visible}" +
    "#mt .r1{transform-origin:50% 50%;animation:spin 9s linear infinite}" +
    "#mt .r2{transform-origin:50% 50%;animation:spin 5.5s linear infinite reverse}" +
    "@keyframes spin{to{transform:rotate(360deg)}}" +
    "#mt .eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:10.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--a);background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.34);padding:5px 12px;border-radius:99px}" +
    "#mt h1{font-size:20px;margin:12px 0 6px;font-weight:800;letter-spacing:-.01em}" +
    "#mt p{margin:0;font-size:12.5px;color:var(--mu);line-height:1.6}" +
    "#mt .bar{height:5px;border-radius:99px;background:rgba(29,74,59,.85);overflow:hidden;margin:18px 0 10px}" +
    "#mt .bar i{display:block;height:100%;width:34%;border-radius:99px;background:linear-gradient(90deg,var(--p),var(--a2),var(--a));animation:sweep 1.15s cubic-bezier(.5,0,.5,1) infinite}" +
    "@keyframes sweep{0%{transform:translateX(-110%)}100%{transform:translateX(330%)}}" +
    "#mt .steps{display:flex;justify-content:center;gap:14px;font-size:10.5px;color:var(--mu);font-family:'JetBrains Mono',ui-monospace,monospace}" +
    "#mt .steps b{color:var(--p);font-weight:700}" +
    "#mt .err{display:none;margin-top:16px;padding:14px;border-radius:14px;background:rgba(251,113,133,.1);border:1px solid rgba(251,113,133,.34);text-align:left}" +
    "#mt.is-err .bar{display:none}#mt.is-err .steps{display:none}#mt.is-err .err{display:block}" +
    "#mt .err b{color:var(--bad);font-size:12.5px;display:block;margin-bottom:5px}" +
    "#mt .acts{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}" +
    "#mt .acts a,#mt .acts button{flex:1;min-width:120px;padding:10px 14px;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;text-decoration:none;text-align:center;border:1px solid var(--ln);background:transparent;color:var(--tx);font-family:inherit}" +
    "#mt .acts .pri{background:linear-gradient(120deg,var(--p),var(--pd));border:0;color:#04120e}" +
    "#mt .acts a:hover,#mt .acts button:hover{filter:brightness(1.1)}" +
    "#mt .sk{position:relative;z-index:2;width:100%;max-width:430px;margin-top:14px;display:grid;gap:8px}" +
    "#mt .sk i{display:block;height:11px;border-radius:99px;background:linear-gradient(90deg,rgba(29,74,59,.5),rgba(29,74,59,.9),rgba(29,74,59,.5));background-size:220% 100%;animation:sh 1.3s linear infinite}" +
    "#mt .sk i:nth-child(2){width:78%}#mt .sk i:nth-child(3){width:56%}" +
    "@keyframes sh{to{background-position:-220% 0}}" +
    "@media (max-width:520px){#mt .card{padding:20px;border-radius:18px}#mt h1{font-size:18px}#mt .seal{width:88px;height:88px}}" +
    "@media (prefers-reduced-motion:reduce){#mt *{animation:none!important}}";
  document.head.appendChild(st);

  var seal =
    '<svg viewBox="0 0 120 120" aria-hidden="true"><defs>' +
    '<linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:' + P.p + '"/><stop offset=".55" style="stop-color:' + P.a2 + '"/><stop offset="1" style="stop-color:' + P.a + '"/></linearGradient>' +
    '<radialGradient id="mr"><stop offset="0" style="stop-color:rgba(16,185,129,.32)"/><stop offset="1" style="stop-color:rgba(16,185,129,0)"/></radialGradient></defs>' +
    '<circle cx="60" cy="60" r="56" fill="url(#mr)"/>' +
    '<circle class="r1" cx="60" cy="60" r="52" fill="none" stroke="url(#mg)" stroke-width="1.6" stroke-dasharray="9 13"/>' +
    '<circle class="r2" cx="60" cy="60" r="40" fill="none" stroke="rgba(34,211,238,.5)" stroke-width="1" stroke-dasharray="3 8"/>' +
    '<circle cx="60" cy="60" r="30" fill="rgba(10,32,25,.9)" stroke="' + P.ln + '"/>' +
    '<path d="M60 38l16 6v13c0 11-7 18-16 22-9-4-16-11-16-22V44z" fill="none" stroke="url(#mg)" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<rect x="54" y="59" width="12" height="10" rx="3" fill="' + P.p + '"/>' +
    '<path d="M56.5 59v-3.5a3.5 3.5 0 017 0V59" fill="none" stroke="' + P.p + '" stroke-width="2"/>' +
    '</svg>';

  var wrap = document.createElement("div");
  wrap.id = "mt";
  wrap.innerHTML =
    '<div class="bg"></div><div class="gd"></div><div class="gr"></div>' +
    '<div><div class="card">' +
      '<div class="seal">' + seal + '</div>' +
      '<span class="eyebrow">Menyiapkan halaman</span>' +
      '<h1>' + TITLE + '</h1>' +
      '<p id="mtMsg">Mengambil berkas halaman dari repositori dan memasang asetnya.</p>' +
      '<div class="bar"><i></i></div>' +
      '<div class="steps"><span><b>1</b> root</span><span><b>2</b> halaman</span><span><b>3</b> siap</span></div>' +
      '<div class="err"><b id="mtErr">Gagal memuat halaman.</b><span id="mtErrD" style="font-size:11.5px;color:var(--mu)"></span>' +
        '<div class="acts"><button type="button" class="pri" id="mtRetry">Coba lagi</button><a id="mtDirect" href="#">Buka berkas langsung</a><a href="' + ROOT + '">Beranda</a></div>' +
      '</div>' +
    '</div><div class="sk"><i></i><i></i><i></i></div></div>';
  document.body.appendChild(wrap);

  var direct = ROOT + PAGE + ".html" + location.search + location.hash;
  document.getElementById("mtDirect").href = direct;

  function fail(msg, detail) {
    wrap.classList.add("is-err");
    document.getElementById("mtErr").textContent = msg;
    document.getElementById("mtErrD").textContent = detail || "";
    document.getElementById("mtMsg").textContent = "Halaman belum bisa dipasang otomatis.";
  }

  function install(html) {
    var out = /<head[^>]*>/i.test(html)
      ? html.replace(/<head([^>]*)>/i, '<head$1><base href="' + ROOT + '">')
      : '<base href="' + ROOT + '">' + html;
    try {
      document.open(); document.write(out); document.close();
    } catch (e) {
      location.replace(direct);
    }
  }

  var slow = setTimeout(function () {
    var m = document.getElementById("mtMsg");
    if (m && !wrap.classList.contains("is-err")) m.textContent = "Koneksi terasa lambat — masih menunggu berkas halaman…";
  }, 6000);

  function load() {
    wrap.classList.remove("is-err");
    document.getElementById("mtMsg").textContent = "Mengambil berkas halaman dari repositori dan memasang asetnya.";
    fetch(ROOT + PAGE + ".html?t=" + Date.now(), { cache: "no-store", credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " untuk " + PAGE + ".html");
        return r.text();
      })
      .then(function (html) {
        clearTimeout(slow);
        if (!/<html|<body|<script/i.test(html)) throw new Error("Berkas halaman tidak berisi HTML yang sah.");
        install(html);
      })
      .catch(function (e) {
        clearTimeout(slow);
        fail("Gagal memuat " + PAGE + ".html", e.message + " — periksa berkas ada di root repositori dan situs sudah ter-deploy.");
      });
  }
  document.getElementById("mtRetry").onclick = load;
  load();
})();