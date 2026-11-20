// ============================================================
// program.js — Halaman detail jenjang (SD/SMP/SMA/SMK)
// Meniru struktur referensi: Hero → Mata Pelajaran → Hari & Jam
// Belajar → Ekstrakurikuler → Afternoon Class → Berita → Galeri.
// Tetap pakai config.js + app.js + data/*.json (tanpa token).
// ============================================================
const LEVEL = (window.PROGRAM_LEVEL || "SD").toUpperCase();
const $ = id => document.getElementById(id);
const root = () => $("root");

// ---- Konten program per jenjang (keterangan program) ----
const LEVELS = {
  SD: {
    full: "Sekolah Dasar", grades: "Kelas 1–6", age: "Usia 6–12 tahun", duration: "6 Tahun",
    tingkat: ["1","2","3","4","5","6"],
    grad: "from-brand-700 via-brand-600 to-teal-600", chip: "bg-brand-100 text-brand-700",
    soft: "bg-brand-50", border: "border-brand-200", text: "text-brand-700", btn: "bg-brand-600 hover:bg-brand-700",
    hero: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=60",
    desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SD dengan kurikulum inovatif dan berbagai kegiatan ekstrakurikuler.",
    about: [
      "Jenjang SD berfokus pada penguatan fondasi literasi, numerasi, dan karakter. Pembelajaran dikemas secara tematik-integratif dengan metode Active Learning agar anak belajar sambil mengalami, bertanya, dan berkarya.",
      "Setiap siswa didampingi wali kelas yang memantau perkembangan akademik, sosial, dan emosional, serta berkomunikasi rutin dengan orang tua melalui Portal Orang Tua."
    ],
    unggul: [["book-open","Literasi & Numerasi Kuat"],["heart-handshake","Pendidikan Karakter"],["palette","Kreativitas & Seni"]],
    subjects: ["Matematika","Bahasa Indonesia","IPA","IPS","Bahasa Inggris","PAI & Budi Pekerti","PPKn","Seni Budaya","PJOK","Informatika","Muatan Lokal"],
    schedule: [
      { group: "Kelas 1–2", rows: [["Senin","07:45","13:30"],["Selasa","07:45","13:30"],["Rabu","07:45","11:30"],["Kamis","07:45","13:30"],["Jumat","07:45","13:30"]] },
      { group: "Kelas 3–6", rows: [["Senin","07:45","14:30"],["Selasa","07:45","14:30"],["Rabu","07:45","12:30"],["Kamis","07:45","14:30"],["Jumat","07:45","14:30"]] }
    ],
    ekskul: ["Pramuka","Futsal","Mini Soccer","Badminton","Basket","Math Club","Science Club","Menjahit","Bimbel Kelas 6","Teater","Paduan Suara","Iqro / BTQ"],
    afternoon: ["Gitar","Keyboard","Tari Tradisional","Tari Modern","Paduan Suara","Karate","Pencak Silat","Renang","Robotik","Panahan","Seni & Kriya","Menggambar","Melukis","Junior Chef","English Club"],
    gallery: [
      ["Workshop Display Kelas SD","https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=60"],
      ["Upacara Hari Besar Nasional","https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=60"],
      ["Pramuka & Outbound","https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=60"]
    ]
  },
  SMP: {
    full: "Sekolah Menengah Pertama", grades: "Kelas 7–9", age: "Usia 12–15 tahun", duration: "3 Tahun",
    tingkat: ["7","8","9"],
    grad: "from-sky-700 via-sky-600 to-blue-600", chip: "bg-sky-100 text-sky-700",
    soft: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", btn: "bg-sky-600 hover:bg-sky-700",
    hero: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=60",
    desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SMP dengan kurikulum inovatif dan berbagai kegiatan ekstrakurikuler.",
    about: [
      "Jenjang SMP menguatkan kompetensi akademik sekaligus minat dan bakat siswa. Pembelajaran berbasis projek dan Active Learning mendorong siswa berpikir kritis, kolaboratif, dan mandiri.",
      "Persiapan Asesmen Nasional (ANBK) dan pendalaman mata pelajaran inti dilakukan terstruktur, didampingi guru mapel berpengalaman dan wali kelas yang responsif."
    ],
    unggul: [["flask-conical","Praktikum IPA"],["laptop","Informatika & Coding"],["users","Kepemimpinan & Organisasi"]],
    subjects: ["Matematika","IPA","IPS","Bahasa Indonesia","Bahasa Inggris","PAI & Al-Qur'an","PPKn","Informatika","Seni Budaya","PJOK","Prakarya"],
    schedule: [
      { group: "Kelas 7–9", rows: [["Senin","07:30","15:00"],["Selasa","07:30","15:00"],["Rabu","07:30","13:00"],["Kamis","07:30","15:00"],["Jumat","07:30","15:00"]] }
    ],
    ekskul: ["Futsal","Badminton","Band","Science Club","Catur","Basket","Tenis Meja","Paskibra","BTQ","Pramuka","PMR"],
    afternoon: ["Gitar","Karate","Pencak Silat","Science Club","Digital Music","Sinematografi","Panahan","Desain Seni","Robotik","Coding","Animasi 2D","E-Sport"],
    gallery: [
      ["Manasik Haji SMP","https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=60"],
      ["Edutrip SMP","https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=60"],
      ["Praktikum IPA di Laboratorium","https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=60"]
    ]
  },
  SMA: {
    full: "Sekolah Menengah Atas", grades: "Kelas 10–12", age: "Usia 15–18 tahun", duration: "3 Tahun",
    tingkat: ["10","11","12"],
    grad: "from-violet-700 via-violet-600 to-purple-600", chip: "bg-violet-100 text-violet-700",
    soft: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", btn: "bg-violet-600 hover:bg-violet-700",
    hero: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=60",
    desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SMA dengan kurikulum inovatif dan berbagai kegiatan ekstrakurikuler.",
    about: [
      "Jenjang SMA mempersiapkan siswa menuju perguruan tinggi dan karier. Tersedia peminatan MIPA dan IPS dengan pendalaman mata pelajaran pilihan serta Projek Penguatan Profil Pelajar Pancasila.",
      "Program Smart Class & Entrepreneur Class membekali siswa dengan keterampilan abad 21: riset, presentasi, kewirausahaan, dan literasi digital."
    ],
    unggul: [["graduation-cap","Persiapan PTN"],["microscope","Riset & Karya Ilmiah"],["briefcase","Entrepreneur Class"]],
    subjects: ["Matematika","Fisika","Kimia","Biologi","Ekonomi","Sosiologi","Geografi","Sejarah","Bahasa Indonesia","Bahasa Inggris","PPKn","PAI & Al-Qur'an/Hadis","Informatika","Seni Budaya","PJOK","Entrepreneur Class"],
    schedule: [
      { group: "Kelas 10–12", rows: [["Senin","07:30","14:45"],["Selasa","07:30","14:45"],["Rabu","07:30","13:00"],["Kamis","07:30","14:45"],["Jumat","07:30","14:45"]] }
    ],
    ekskul: ["Futsal","Band","Tenis Meja","Badminton","Paskibra","Science Club","BTQ","PMR","Tari","Pramuka"],
    afternoon: ["Karate","Pencak Silat","Panahan","Digital Music","Sinematografi","Basket Putra & Putri"],
    gallery: [
      ["Manasik Haji SMA","https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=60"],
      ["Edutrip & Studi Banding","https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=60"],
      ["Presentasi Projek Profil Pelajar","https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=60"]
    ]
  },
  SMK: {
    full: "Sekolah Menengah Kejuruan", grades: "Kelas 10–12", age: "Usia 15–18 tahun", duration: "3–4 Tahun",
    tingkat: ["10","11","12","13"],
    grad: "from-amber-600 via-orange-500 to-amber-500", chip: "bg-amber-100 text-amber-700",
    soft: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", btn: "bg-amber-500 hover:bg-amber-400",
    hero: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=60",
    desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SMK dengan kurikulum inovatif, kompetensi keahlian, dan berbagai kegiatan ekstrakurikuler.",
    about: [
      "Jenjang SMK membekali siswa dengan kompetensi keahlian siap kerja melalui Teaching Factory, Praktik Kerja Lapangan (PKL) di industri, dan Uji Kompetensi Keahlian bersertifikat.",
      "Kurikulum memadukan mata pelajaran umum dan kejuruan, diperkuat Projek Kreatif & Kewirausahaan agar lulusan siap bekerja, melanjutkan studi, atau berwirausaha."
    ],
    unggul: [["wrench","Teaching Factory"],["factory","PKL Industri"],["award","Sertifikasi Kompetensi"]],
    jurusan: ["Teknik Komputer & Jaringan (TKJ)","Rekayasa Perangkat Lunak (RPL)","Desain Komunikasi Visual (DKV)","Teknik Kendaraan Ringan (TKR)","Akuntansi","Pemasaran"],
    subjects: ["Matematika","Bahasa Indonesia","Bahasa Inggris","PPKn","PAI","Informatika","IPA/IPS Dasar","Projek Kreatif & Kewirausahaan","Mata Pelajaran Kejuruan","Praktik Kerja Lapangan (PKL)"],
    schedule: [
      { group: "Kelas 10–12", rows: [["Senin","07:30","15:30"],["Selasa","07:30","15:30"],["Rabu","07:30","13:00"],["Kamis","07:30","15:30"],["Jumat","07:30","15:30"]] }
    ],
    ekskul: ["Futsal","Basket","Band","Robotik","Coding","E-Sport","Paskibra","PMR","Pramuka","Science Club"],
    afternoon: ["Coding","Robotik","Desain Grafis","Sinematografi","Animasi 2D","Digital Music","Karate","Pencak Silat","Panahan","E-Sport"],
    gallery: [
      ["Praktik di Teaching Factory","https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=60"],
      ["PKL di Industri","https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=60"],
      ["Uji Kompetensi Keahlian","https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=60"]
    ]
  }
};
const L = LEVELS[LEVEL] || LEVELS.SD;
const img = (url, alt) => '<div class="w-full h-full" style="background:linear-gradient(135deg,#16a34a,#0d9488)"><img src="' + url + '" alt="' + esc(alt) + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"></div>';
const chips = arr => arr.map(x => '<span class="px-3 py-1.5 rounded-full text-sm font-semibold ' + L.chip + '">' + esc(x) + "</span>").join("");

(async () => {
  root().innerHTML = '<div class="min-h-screen flex items-center justify-center text-slate-400 gap-3"><div class="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>Memuat program…</div>';
  let ST = {}, siswa = [], kelas = [], guru = [], materi = [], ppdb = [];
  try { ST = await fetchJSON("settings.json"); } catch (e) {}
  try { [siswa, kelas, guru, materi, ppdb] = await Promise.all([
    fetchJSON("siswa.json").catch(()=>[]), fetchJSON("kelas.json").catch(()=>[]),
    fetchJSON("guru.json").catch(()=>[]), fetchJSON("materi.json").catch(()=>[]), fetchJSON("ppdb.json").catch(()=>[])
  ]); } catch (e) {}

  const nama = ST.nama_sekolah || "Nama Sekolah";
  const wa = "https://wa.me/" + (ST.wa_admin || "").replace(/^0/, "62");
  const tel = "tel:" + (ST.telepon || "").replace(/[^0-9+]/g, "");
  const kLevel = kelas.filter(k => L.tingkat.includes(String(k.tingkat)));
  const namaK = kLevel.map(k => k.nama);
  const siswaLevel = siswa.filter(s => namaK.includes(s.kelas) && s.status === "Aktif");
  const waliIds = [...new Set(kLevel.map(k => k.wali_kelas).filter(Boolean))];
  const waliGuru = guru.filter(g => waliIds.includes(g.id));

  // Berita (dari data yang ada)
  const news = [];
  if (ST.pengumuman) news.push(["Pengumuman Sekolah", ST.pengumuman, "index.html#berita", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=60"]);
  if (ppdb.length) news.push(["Open Admission PPDB Dibuka", "Penerimaan Peserta Didik Baru resmi dibuka. Daftarkan putra-putri Anda melalui PPDB Online.", "ppdb.html", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=60"]);
  materi.slice(0, 2).forEach(m => news.push([m.judul, m.deskripsi || "Materi pembelajaran terbaru.", "belajar.html", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=60"]));

  const navlink = (h, t) => '<a href="' + h + '" class="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-700">' + t + "</a>";

  root().innerHTML = `
  <!-- NAVBAR -->
  <header class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
    <div class="max-w-7xl mx-auto px-4 h-[72px] flex items-center gap-3">
      <a href="index.html" class="flex items-center gap-2.5 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0"><i data-lucide="school" class="w-5 h-5"></i></div>
        <div class="min-w-0 leading-tight"><div class="font-display font-bold text-brand-800 truncate">${esc(nama)}</div><div class="text-[11px] text-slate-400">NPSN ${esc(ST.npsn||"—")}</div></div>
      </a>
      <nav class="hidden lg:flex items-center gap-1 ml-6 text-sm font-semibold text-slate-600">
        ${navlink("index.html#profil","Profil")}${navlink("index.html#program","Program")}${navlink("index.html#fasilitas","Fasilitas")}${navlink("index.html#berita","Berita")}${navlink("index.html#kontak","Kontak")}
      </nav>
      <div class="flex-1"></div>
      <div class="hidden md:flex items-center gap-2">
        <a href="portal.html" class="text-sm font-bold px-3 py-2 rounded-lg text-brand-700 hover:bg-brand-50">Portal Ortu</a>
        <a href="ppdb.html" class="text-sm font-bold px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-sm">Register Now</a>
        <a href="login.html" class="text-sm font-bold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><i data-lucide="key-round" class="w-4 h-4"></i>Login</a>
      </div>
      <button id="mBtn" class="lg:hidden p-2 rounded-lg hover:bg-slate-100"><i data-lucide="menu" class="w-6 h-6"></i></button>
    </div>
    <div id="mMenu" class="hidden lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 text-sm font-semibold">
      <a href="index.html#profil" class="block px-3 py-2 rounded-lg hover:bg-brand-50">Profil</a>
      <a href="index.html#program" class="block px-3 py-2 rounded-lg hover:bg-brand-50">Program</a>
      <a href="index.html#fasilitas" class="block px-3 py-2 rounded-lg hover:bg-brand-50">Fasilitas</a>
      <a href="belajar.html" class="block px-3 py-2 rounded-lg hover:bg-brand-50">E-Learning</a>
      <a href="cbt.html" class="block px-3 py-2 rounded-lg hover:bg-brand-50">Ujian CBT</a>
      <div class="flex gap-2 pt-2">
        <a href="ppdb.html" class="flex-1 text-center px-3 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold">Daftar</a>
        <a href="portal.html" class="flex-1 text-center px-3 py-2.5 rounded-xl bg-brand-600 text-white font-bold">Portal Ortu</a>
      </div>
    </div>
  </header>

  <!-- HERO -->
  <section class="relative overflow-hidden bg-gradient-to-br ${L.grad} text-white pt-[72px]">
    <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <nav class="text-xs text-white/70 font-semibold mb-3"><a href="index.html" class="hover:underline">Beranda</a> <span class="mx-1">/</span> <a href="index.html#program" class="hover:underline">Program</a> <span class="mx-1">/</span> <span class="text-white">${esc(LEVEL)}</span></nav>
        <span class="text-xs font-bold uppercase tracking-wider bg-white/15 border border-white/25 px-3 py-1 rounded-full">Jenjang Pendidikan</span>
        <h1 class="font-display font-extrabold text-4xl md:text-5xl mt-3">${esc(LEVEL)} <span class="text-amber-300">${esc(nama)}</span></h1>
        <p class="mt-4 text-white/90 text-lg max-w-xl">${esc(L.desc)}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="${tel}" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-800 font-bold hover:bg-slate-100 shadow"><i data-lucide="phone" class="w-5 h-5"></i>Call Us</a>
          <a href="ppdb.html" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-300 shadow"><i data-lucide="user-plus" class="w-5 h-5"></i>Register Now</a>
        </div>
        <div class="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
          <span class="inline-flex items-center gap-1.5"><i data-lucide="layers" class="w-4 h-4 text-amber-300"></i>${esc(L.grades)}</span>
          <span class="inline-flex items-center gap-1.5"><i data-lucide="cake" class="w-4 h-4 text-amber-300"></i>${esc(L.age)}</span>
          <span class="inline-flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4 text-amber-300"></i>Masa studi ${esc(L.duration)}</span>
        </div>
      </div>
      <div class="rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 aspect-[4/3]">${img(L.hero, "Program " + LEVEL)}</div>
    </div>
  </section>

  <!-- STATISTIK RINGKAS -->
  <section class="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      ${[["users","Siswa "+LEVEL,siswaLevel.length],["school","Rombel",kLevel.length],["briefcase","Wali Kelas",waliGuru.length],["book-open","Mata Pelajaran",L.subjects.length]].map(s =>
        '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center"><div class="w-10 h-10 mx-auto rounded-xl '+L.chip+' flex items-center justify-center mb-2"><i data-lucide="'+s[0]+'" class="w-5 h-5"></i></div><div class="text-2xl font-extrabold font-display">'+s[2]+'</div><div class="text-xs text-slate-500 font-semibold">'+s[1]+'</div></div>').join("")}
    </div>
  </section>

  <!-- TENTANG PROGRAM -->
  <section class="max-w-7xl mx-auto px-4 py-14">
    <div class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <span class="text-xs font-bold uppercase tracking-wider ${L.text}">Tentang Program</span>
        <h2 class="font-display font-extrabold text-3xl text-slate-800 mt-2">Program ${esc(L.full)}</h2>
        ${L.about.map(p => '<p class="text-slate-600 mt-4 leading-relaxed">'+esc(p)+'</p>').join("")}
        <p class="text-sm text-slate-500 mt-4">Kurikulum: <b>${esc(ST.kurikulum||"Merdeka")}</b> • Tahun Ajaran <b>${esc(ST.tahun_ajaran||"—")}</b></p>
      </div>
      <div class="space-y-3">
        ${L.utungg.map(u => '<div class="flex items-center gap-3 '+L.soft+' border '+L.border+' rounded-2xl p-4"><div class="w-10 h-10 rounded-xl '+L.chip+' flex items-center justify-center shrink-0"><i data-lucide="'+u[0]+'" class="w-5 h-5"></i></div><b class="text-sm text-slate-700">'+esc(u[1])+'</b></div>').join("")}
        ${L.jurusan ? '<div class="'+L.soft+' border '+L.border+' rounded-2xl p-4"><b class="text-sm text-slate-700 block mb-2">Kompetensi Keahlian</b><div class="flex flex-wrap gap-2">'+chips(L.jurusan)+'</div></div>' : ""}
      </div>
    </div>
  </section>

  <!-- MATA PELAJARAN -->
  <section class="${L.soft} border-y border-slate-100">
    <div class="max-w-7xl mx-auto px-4 py-14">
      <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Mata Pelajaran</h2>
      <p class="text-slate-500 text-center mt-2">Struktur kurikulum jenjang ${esc(LEVEL)}.</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
        ${L.subjects.map(s => '<div class="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4"><div class="w-9 h-9 rounded-lg '+L.chip+' flex items-center justify-center shrink-0"><i data-lucide="book-open" class="w-4 h-4"></i></div><b class="text-sm text-slate-700">'+esc(s)+'</b></div>').join("")}
      </div>
    </div>
  </section>

  <!-- HARI & JAM BELAJAR -->
  <section class="max-w-7xl mx-auto px-4 py-14">
    <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Hari &amp; Jam Belajar</h2>
    <div class="grid ${L.schedule.length>1?'md:grid-cols-2':''} gap-6 mt-8 max-w-4xl mx-auto">
      ${L.schedule.map(sc => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div class="'+L.chip+' px-5 py-3 font-display font-bold">'+esc(sc.group)+'</div><table class="w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-4 py-2 text-left text-xs uppercase text-slate-500">Hari</th><th class="px-4 py-2 text-left text-xs uppercase text-slate-500">Masuk</th><th class="px-4 py-2 text-left text-xs uppercase text-slate-500">Pulang</th></tr></thead><tbody>'+sc.rows.map(r=>'<tr class="border-t border-slate-100"><td class="px-4 py-2 font-semibold">'+r[0]+'</td><td class="px-4 py-2">'+r[1]+'</td><td class="px-4 py-2">'+r[2]+'</td></tr>').join("")+'</tbody></table></div>').join("")}
    </div>
  </section>

  <!-- EKSTRAKURIKULER -->
  <section class="${L.soft} border-y border-slate-100">
    <div class="max-w-7xl mx-auto px-4 py-14">
      <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Ekstrakurikuler</h2>
      <div class="flex flex-wrap justify-center gap-2.5 mt-8">${chips(L.ekskul)}</div>
    </div>
  </section>

  <!-- AFTERNOON CLASS -->
  <section class="max-w-7xl mx-auto px-4 py-14">
    <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Afternoon Class</h2>
    <p class="text-slate-500 text-center mt-2">Kelas pengembangan diri sepulang sekolah.</p>
    <div class="flex flex-wrap justify-center gap-2.5 mt-8">${chips(L.afternoon)}</div>
  </section>

  <!-- WHAT'S GOING ON -->
  <section class="bg-slate-50 border-y border-slate-100">
    <div class="max-w-7xl mx-auto px-4 py-14">
      <div class="flex items-end justify-between gap-4 mb-8">
        <div><h2 class="font-display font-extrabold text-3xl text-brand-800">What's going on?</h2><p class="text-slate-500 mt-1">Kabar terbaru seputar kegiatan dan pembelajaran.</p></div>
        <a href="index.html#berita" class="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">More Articles <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${news.slice(0,3).map(n => '<article class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"><div class="h-40">'+img(n[3],n[0])+'</div><div class="p-5"><h3 class="font-display font-bold leading-snug">'+esc(n[0])+'</h3><p class="text-sm text-slate-500 mt-2 line-clamp-3">'+esc(n[1])+'</p><a href="'+n[2]+'" class="inline-flex items-center gap-1 text-sm font-bold text-brand-700 mt-3">Read More <i data-lucide="arrow-right" class="w-4 h-4"></i></a></div></article>').join("") || '<p class="text-slate-400">Belum ada kabar.</p>'}
      </div>
    </div>
  </section>

  <!-- GALERI -->
  <section class="max-w-7xl mx-auto px-4 py-14">
    <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Galeri</h2>
    <p class="text-slate-500 text-center mt-2">Aktivitas, dokumentasi, dan kegiatan para siswa ${esc(LEVEL)}.</p>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      ${L.gallery.map(g => '<button data-gal="'+esc(g[1])+'" class="text-left rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition group"><div class="h-48">'+img(g[1],g[0])+'</div><div class="p-4 flex items-center justify-between"><b class="text-sm text-slate-700">'+esc(g[0])+'</b><span class="text-xs font-bold '+L.text+' inline-flex items-center gap-1">View More <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></span></div></button>').join("")}
    </div>
  </section>

  <!-- CTA PPDB -->
  <section class="bg-gradient-to-br ${L.grad} text-white">
    <div class="max-w-7xl mx-auto px-4 py-14 text-center">
      <h2 class="font-display font-extrabold text-3xl">Siap Bergabung dengan Program ${esc(LEVEL)}?</h2>
      <p class="text-white/85 mt-2 max-w-2xl mx-auto">Daftarkan putra-putri Anda sekarang. Tim kami siap membantu proses pendaftaran dan informasi lengkap.</p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="ppdb.html" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-300 shadow"><i data-lucide="user-plus" class="w-5 h-5"></i>Daftar PPDB Online</a>
        <a href="${wa}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 border border-white/30 font-bold hover:bg-white/25"><i data-lucide="message-circle" class="w-5 h-5"></i>Tanya via WhatsApp</a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-slate-900 text-slate-300">
    <div class="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
      <div><b class="font-display text-white text-lg">${esc(nama)}</b><p class="text-sm text-slate-400 mt-3">${esc(ST.alamat||"")}</p><p class="text-sm text-slate-400 mt-1">${esc(ST.telepon||"")}</p></div>
      <div><b class="text-white text-sm uppercase tracking-wider">Program</b><ul class="mt-3 space-y-2 text-sm"><li><a href="sd.html" class="hover:text-brand-400">SD</a></li><li><a href="smp.html" class="hover:text-brand-400">SMP</a></li><li><a href="sma.html" class="hover:text-brand-400">SMA</a></li><li><a href="smk.html" class="hover:text-brand-400">SMK</a></li></ul></div>
      <div><b class="text-white text-sm uppercase tracking-wider">Layanan</b><ul class="mt-3 space-y-2 text-sm"><li><a href="ppdb.html" class="hover:text-brand-400">PPDB Online</a></li><li><a href="portal.html" class="hover:text-brand-400">Portal Orang Tua</a></li><li><a href="belajar.html" class="hover:text-brand-400">E-Learning</a></li><li><a href="login.html" class="hover:text-brand-400">Login Admin</a></li></ul></div>
    </div>
    <div class="border-t border-slate-800"><div class="max-w-7xl mx-auto px-4 py-5 text-xs text-slate-500">© 2026 ${esc(nama)}. Sistem Informasi Sekolah statis (GitHub Pages).</div></div>
  </footer>

  <!-- Lightbox galeri -->
  <div id="galModal" class="hidden fixed inset-0 z-[60] bg-slate-900/80 flex items-center justify-center p-4">
    <div class="max-w-3xl w-full"><div class="flex justify-end mb-2"><button id="galClose" class="text-white p-2 rounded-lg hover:bg-white/10"><i data-lucide="x" class="w-6 h-6"></i></button></div><img id="galImg" class="w-full rounded-2xl shadow-2xl" alt="Galeri"></div>
  </div>`;

  // ---- Interaksi ----
  $("mBtn").onclick = () => $("mMenu").classList.toggle("hidden");
  document.querySelectorAll("#mMenu a").forEach(a => a.onclick = () => $("mMenu").classList.add("hidden"));
  document.querySelectorAll("[data-gal]").forEach(b => b.onclick = () => { $("galImg").src = b.dataset.gal; $("galModal").classList.remove("hidden"); });
  $("galClose").onclick = () => $("galModal").classList.add("hidden");
  $("galModal").onclick = e => { if (e.target === $("galModal")) $("galModal").classList.add("hidden"); };
  document.title = "Program " + LEVEL + " — " + nama;
  refreshIcons();
})();