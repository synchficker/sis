// ============================================================
// program.js — Halaman detail jenjang (SD/SMP/SMA/SMK)
// Struktur: Hero → Mata Pelajaran → Hari & Jam Belajar →
// Ekstrakurikuler → Afternoon Class → Berita → Galeri → Footer.
// Tetap memakai config.js + app.js + data/*.json (tanpa token).
// ============================================================
(() => {
  const LEVEL = (window.PROGRAM_LEVEL || "SD").toUpperCase();
  const $ = id => document.getElementById(id);
  const root = () => $("root");

  const LEVELS = {
    SD: {
      full: "Sekolah Dasar", grades: "Kelas 1–6", age: "Usia 6–12 tahun", duration: "6 Tahun",
      tingkat: ["1", "2", "3", "4", "5", "6"],
      grad: "from-brand-700 via-brand-600 to-teal-600", chip: "bg-brand-100 text-brand-700",
      soft: "bg-brand-50", border: "border-brand-200", text: "text-brand-700", btn: "bg-brand-600 hover:bg-brand-700",
      hero: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=60",
      desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SD dengan kurikulum inovatif dan berbagai kegiatan ekstrakurikuler.",
      about: [
        "Jenjang SD berfokus pada penguatan fondasi literasi, numerasi, dan karakter. Pembelajaran dikemas secara tematik-integratif dengan metode Active Learning agar anak belajar sambil mengalami, bertanya, dan berkarya.",
        "Setiap siswa didampingi wali kelas yang memantau perkembangan akademik, sosial, dan emosional, serta berkomunikasi rutin dengan orang tua melalui Portal Orang Tua."
      ],
      unggul: [["book-open", "Literasi & Numerasi Kuat"], ["heart-handshake", "Pendidikan Karakter"], ["palette", "Kreativitas & Seni"]],
      subjects: ["Matematika", "Bahasa Indonesia", "IPA", "IPS", "Bahasa Inggris", "PAI & Budi Pekerti", "PPKn", "Seni Budaya", "PJOK", "Informatika", "Muatan Lokal"],
      schedule: [
        { group: "Kelas 1–2", rows: [["Senin", "07:45", "13:30"], ["Selasa", "07:45", "13:30"], ["Rabu", "07:45", "11:30"], ["Kamis", "07:45", "13:30"], ["Jumat", "07:45", "13:30"]] },
        { group: "Kelas 3–6", rows: [["Senin", "07:45", "14:30"], ["Selasa", "07:45", "14:30"], ["Rabu", "07:45", "12:30"], ["Kamis", "07:45", "14:30"], ["Jumat", "07:45", "14:30"]] }
      ],
      ekskul: ["Pramuka", "Futsal", "Mini Soccer", "Badminton", "Basket", "Math Club", "Science Club", "Menjahit", "Bimbel Kelas 6", "Teater", "Paduan Suara", "Iqro / BTQ"],
      afternoon: ["Gitar", "Keyboard", "Tari Tradisional", "Tari Modern", "Paduan Suara", "Karate", "Pencak Silat", "Renang", "Robotik", "Panahan", "Seni & Kriya", "Menggambar", "Melukis", "Junior Chef", "English Club"],
      gallery: [
        ["Workshop Display Kelas SD", "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=60", "Akademik", "Siswa menata dan mempresentasikan karya kelas dalam workshop display."],
        ["Upacara Hari Besar Nasional", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60", "Karakter", "Upacara dan peringatan hari besar menumbuhkan cinta tanah air sejak dini."],
        ["Pramuka & Outbound", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60", "Kepramukaan", "Kegiatan alam terbuka melatih kemandirian, kerja sama, dan keberanian."],
        ["Pekan Literasi & Mendongeng", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=60", "Literasi", "Membaca, mendongeng, dan berbagi cerita untuk menumbuhkan minat baca."],
        ["Praktik Sains Sederhana", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=60", "Sains", "Eksperimen sederhana yang membuat siswa belajar sambil mengamati dan mencoba."],
        ["Kelas Seni & Kreasi", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=60", "Seni", "Menggambar, melukis, dan berkreasi untuk mengasah imajinasi siswa."],
        ["Fun Sport Day", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60", "Olahraga", "Perlombaan olahraga yang menyenangkan dan menanamkan sportivitas."],
        ["Market Day Wirausaha Cilik", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=60", "Kewirausahaan", "Siswa belajar berjualan, menghitung, dan berkomunikasi lewat pasar mini."],
        ["Pentas Seni Akhir Semester", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=60", "Seni", "Panggung apresiasi bagi bakat siswa dalam tari, musik, dan teater."]
      ]
    },
    SMP: {
      full: "Sekolah Menengah Pertama", grades: "Kelas 7–9", age: "Usia 12–15 tahun", duration: "3 Tahun",
      tingkat: ["7", "8", "9"],
      grad: "from-sky-700 via-sky-600 to-blue-600", chip: "bg-sky-100 text-sky-700",
      soft: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", btn: "bg-sky-600 hover:bg-sky-700",
      hero: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=60",
      desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SMP dengan kurikulum inovatif dan berbagai kegiatan ekstrakurikuler.",
      about: [
        "Jenjang SMP menguatkan kompetensi akademik sekaligus minat dan bakat siswa. Pembelajaran berbasis projek dan Active Learning mendorong siswa berpikir kritis, kolaboratif, dan mandiri.",
        "Persiapan Asesmen Nasional (ANBK) dan pendalaman mata pelajaran inti dilakukan terstruktur, didampingi guru mapel berpengalaman dan wali kelas yang responsif."
      ],
      unggul: [["flask-conical", "Praktikum IPA"], ["laptop", "Informatika & Coding"], ["users", "Kepemimpinan & Organisasi"]],
      subjects: ["Matematika", "IPA", "IPS", "Bahasa Indonesia", "Bahasa Inggris", "PAI & Al-Qur'an", "PPKn", "Informatika", "Seni Budaya", "PJOK", "Prakarya"],
      schedule: [
        { group: "Kelas 7–9", rows: [["Senin", "07:30", "15:00"], ["Selasa", "07:30", "15:00"], ["Rabu", "07:30", "13:00"], ["Kamis", "07:30", "15:00"], ["Jumat", "07:30", "15:00"]] }
      ],
      ekskul: ["Futsal", "Badminton", "Band", "Science Club", "Catur", "Basket", "Tenis Meja", "Paskibra", "BTQ", "Pramuka", "PMR"],
      afternoon: ["Gitar", "Karate", "Pencak Silat", "Science Club", "Digital Music", "Sinematografi", "Panahan", "Desain Seni", "Robotik", "Coding", "Animasi 2D", "E-Sport"],
      gallery: [
        ["Manasik Haji SMP", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=60", "Keagamaan", "Simulasi manasik haji sebagai pembelajaran praktik ibadah."],
        ["Edutrip SMP", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=60", "Edutrip", "Kunjungan edukatif ke tempat belajar di luar kelas."],
        ["Praktikum IPA di Laboratorium", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=60", "Sains", "Praktik langsung di laboratorium untuk memahami konsep IPA."],
        ["Lomba Sains & Olimpiade", "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=60", "Akademik", "Pembinaan dan kompetisi sains untuk siswa berprestasi."],
        ["Latihan Pramuka & Kepemimpinan", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60", "Kepramukaan", "Latihan kepemimpinan dan kerja sama tim di alam terbuka."],
        ["Class Meeting Antar Kelas", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60", "Olahraga", "Pertandingan persahabatan antar kelas yang penuh semangat."],
        ["Pentas Seni & Budaya", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=60", "Seni", "Pertunjukan seni dan budaya hasil kreativitas siswa."],
        ["Workshop Coding Dasar", "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=60", "Teknologi", "Mengenal logika pemrograman lewat praktik langsung."],
        ["Bakti Sosial & Kunjungan Sosial", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=60", "Sosial", "Berbagi dan peduli sesama melalui kegiatan sosial sekolah."]
      ]
    },
    SMA: {
      full: "Sekolah Menengah Atas", grades: "Kelas 10–12", age: "Usia 15–18 tahun", duration: "3 Tahun",
      tingkat: ["10", "11", "12"],
      grad: "from-violet-700 via-violet-600 to-purple-600", chip: "bg-violet-100 text-violet-700",
      soft: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", btn: "bg-violet-600 hover:bg-violet-700",
      hero: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=60",
      desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SMA dengan kurikulum inovatif dan berbagai kegiatan ekstrakurikuler.",
      about: [
        "Jenjang SMA mempersiapkan siswa menuju perguruan tinggi dan karier. Tersedia peminatan MIPA dan IPS dengan pendalaman mata pelajaran pilihan serta Projek Penguatan Profil Pelajar Pancasila.",
        "Program Smart Class & Entrepreneur Class membekali siswa dengan keterampilan abad 21: riset, presentasi, kewirausahaan, dan literasi digital."
      ],
      unggul: [["graduation-cap", "Persiapan PTN"], ["microscope", "Riset & Karya Ilmiah"], ["briefcase", "Entrepreneur Class"]],
      subjects: ["Matematika", "Fisika", "Kimia", "Biologi", "Ekonomi", "Sosiologi", "Geografi", "Sejarah", "Bahasa Indonesia", "Bahasa Inggris", "PPKn", "PAI & Al-Qur'an/Hadis", "Informatika", "Seni Budaya", "PJOK", "Entrepreneur Class"],
      schedule: [
        { group: "Kelas 10–12", rows: [["Senin", "07:30", "14:45"], ["Selasa", "07:30", "14:45"], ["Rabu", "07:30", "13:00"], ["Kamis", "07:30", "14:45"], ["Jumat", "07:30", "14:45"]] }
      ],
      ekskul: ["Futsal", "Band", "Tenis Meja", "Badminton", "Paskibra", "Science Club", "BTQ", "PMR", "Tari", "Pramuka"],
      afternoon: ["Karate", "Pencak Silat", "Panahan", "Digital Music", "Sinematografi", "Basket Putra & Putri"],
      gallery: [
        ["Manasik Haji SMA", "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=60", "Keagamaan", "Pembelajaran praktik ibadah haji bagi siswa SMA."],
        ["Edutrip & Studi Banding", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=60", "Edutrip", "Studi banding ke institusi pendidikan dan industri."],
        ["Presentasi Projek Profil Pelajar", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=60", "Akademik", "Siswa mempresentasikan hasil projek penguatan profil pelajar."],
        ["Seminar Karier & Kampus", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60", "Akademik", "Pengenalan jurusan, kampus, dan jalur masuk perguruan tinggi."],
        ["Turnamen Futsal Antar Kelas", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60", "Olahraga", "Kompetisi futsal yang mempererat solidaritas antar angkatan."],
        ["Riset & Karya Ilmiah Remaja", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60", "Sains", "Pembimbingan riset dan penulisan karya ilmiah siswa."],
        ["Entrepreneur Day", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=60", "Kewirausahaan", "Siswa merancang produk dan memasarkannya dalam bazar wirausaha."],
        ["Pentas Seni & Festival Band", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60", "Seni", "Panggung musik dan seni yang menampilkan bakat siswa."],
        ["Pelantikan Pengurus OSIS", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=60", "Organisasi", "Pelantikan pengurus OSIS dan pembinaan kepemimpinan siswa."]
      ]
    },
    SMK: {
      full: "Sekolah Menengah Kejuruan", grades: "Kelas 10–12", age: "Usia 15–18 tahun", duration: "3–4 Tahun",
      tingkat: ["10", "11", "12", "13"],
      grad: "from-amber-600 via-orange-500 to-amber-500", chip: "bg-amber-100 text-amber-700",
      soft: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", btn: "bg-amber-500 hover:bg-amber-400",
      hero: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=60",
      desc: "Dengan fasilitas modern dan pengajar berpengalaman, kami menyiapkan jenjang SMK dengan kurikulum inovatif, kompetensi keahlian, dan berbagai kegiatan ekstrakurikuler.",
      about: [
        "Jenjang SMK membekali siswa dengan kompetensi keahlian siap kerja melalui Teaching Factory, Praktik Kerja Lapangan (PKL) di industri, dan Uji Kompetensi Keahlian bersertifikat.",
        "Kurikulum memadukan mata pelajaran umum dan kejuruan, diperkuat Projek Kreatif & Kewirausahaan agar lulusan siap bekerja, melanjutkan studi, atau berwirausaha."
      ],
      unggul: [["wrench", "Teaching Factory"], ["factory", "PKL Industri"], ["award", "Sertifikasi Kompetensi"]],
      jurusan: ["Teknik Komputer & Jaringan (TKJ)", "Rekayasa Perangkat Lunak (RPL)", "Desain Komunikasi Visual (DKV)", "Teknik Kendaraan Ringan (TKR)", "Akuntansi", "Pemasaran"],
      subjects: ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "PPKn", "PAI", "Informatika", "IPA/IPS Dasar", "Projek Kreatif & Kewirausahaan", "Mata Pelajaran Kejuruan", "Praktik Kerja Lapangan (PKL)"],
      schedule: [
        { group: "Kelas 10–12", rows: [["Senin", "07:30", "15:30"], ["Selasa", "07:30", "15:30"], ["Rabu", "07:30", "13:00"], ["Kamis", "07:30", "15:30"], ["Jumat", "07:30", "15:30"]] }
      ],
      ekskul: ["Futsal", "Basket", "Band", "Robotik", "Coding", "E-Sport", "Paskibra", "PMR", "Pramuka", "Science Club"],
      afternoon: ["Coding", "Robotik", "Desain Grafis", "Sinematografi", "Animasi 2D", "Digital Music", "Karate", "Pencak Silat", "Panahan", "E-Sport"],
      gallery: [
        ["Praktik di Teaching Factory", "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=60", "Praktik", "Siswa mengerjakan produk dan jasa nyata dalam lingkungan industri sekolah."],
        ["PKL di Industri", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=60", "Industri", "Praktik kerja lapangan membangun etos dan kompetensi kerja."],
        ["Uji Kompetensi Keahlian", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60", "Sertifikasi", "Asesmen kompetensi bersertifikat untuk kesiapan kerja."],
        ["Kunjungan Industri", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=60", "Industri", "Mengenal proses produksi dan budaya kerja di dunia usaha."],
        ["Workshop Coding & Jaringan", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60", "Teknologi", "Pelatihan pemrograman dan jaringan bersama praktisi."],
        ["Job Fair & Rekrutmen Alumni", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60", "Karier", "Pertemuan siswa dan alumni dengan mitra industri."],
        ["Pameran Karya Siswa", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=60", "Pameran", "Produk dan karya kompetensi keahlian dipamerkan kepada publik."],
        ["Lomba Kompetensi Siswa", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60", "Kompetisi", "Pembinaan dan kompetisi keahlian tingkat sekolah hingga daerah."],
        ["Pelatihan Kewirausahaan", "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=60", "Kewirausahaan", "Membekali siswa merintis usaha dari ide hingga pemasaran."]
      ]
    }
  };

  const L = LEVELS[LEVEL] || LEVELS.SD;
  const img = (url, alt) => '<div class="w-full h-full" style="background:linear-gradient(135deg,#16a34a,#0d9488)"><img src="' + url + '" alt="' + esc(alt) + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"></div>';
  const chips = arr => arr.map(x => '<span class="px-3 py-1.5 rounded-full text-sm font-semibold ' + L.chip + '">' + esc(x) + "</span>").join("");
  // ----- Galeri Bento: pola & gaya identik dengan galeri beranda (4 kolom, 9 kartu: 2x2, 1, 1, 2, 1, 1, 2, 2, 2) -----
  const GAL_SPAN = ["col-span-2 row-span-2", "", "", "col-span-2", "", "", "col-span-2", "col-span-2", "col-span-2"];
  const galCard = (g, i) => {
    const big = i % 9 === 0;
    return '<button type="button" data-gal="' + i + '" data-d="' + (i % 9) + '" class="pbento group ring-1 ring-brand-900/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400 ' + GAL_SPAN[i % 9] + '">' +
      '<div class="absolute inset-0" style="background:linear-gradient(135deg,#16a34a,#0d9488)"><img src="' + esc(g[1]) + '" alt="' + esc(g[0]) + '" loading="lazy" class="w-full h-full object-cover" onerror="this.style.display=\'none\'"></div>' +
      '<div class="absolute inset-0" style="background:linear-gradient(to top, rgba(2,6,23,.78), rgba(2,6,23,.33) 55%, rgba(2,6,23,.06))"></div>' +
      '<div class="absolute top-3 left-3"><span class="px-2.5 py-1 rounded-full bg-white/90 text-brand-800 text-[10px] font-bold uppercase tracking-wide">' + esc(g[2] || "Kegiatan") + '</span></div>' +
      '<span class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i data-lucide="maximize-2" class="w-3.5 h-3.5"></i></span>' +
      '<div class="absolute inset-x-0 bottom-0 p-3.5 ' + (big ? "md:p-6" : "") + ' text-white">' +
        '<h3 class="font-display font-bold leading-snug ' + (big ? "text-lg md:text-2xl" : "text-sm md:text-base line-clamp-2") + '">' + esc(g[0]) + '</h3>' +
        '<p class="pexcerpt text-[11px] md:text-xs text-white/80 mt-1.5 overflow-hidden ' + (big ? "line-clamp-3" : "line-clamp-2") + '">' + esc(g[3] || "") + '</p>' +
        (big ? '<span class="inline-flex items-center gap-1 text-xs font-bold text-amber-300 mt-2">Lihat detail <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></span>' : "") +
      '</div></button>';
  };
  if (!document.getElementById("progGalCss")) {
    const st = document.createElement("style"); st.id = "progGalCss";
    st.textContent = '#progGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;grid-auto-rows:150px;grid-auto-flow:dense}' +
      '@media (min-width:1024px){#progGrid{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:190px}}' +
      '.pbento{position:relative;overflow:hidden;text-align:left;border-radius:24px;opacity:0;transform:translateY(20px) scale(.985);transition:opacity .6s cubic-bezier(.2,.7,.3,1),transform .6s cubic-bezier(.2,.7,.3,1),box-shadow .35s}' +
      '.pbento.in{opacity:1;transform:none}' +
      '.pbento img{transition:transform .9s cubic-bezier(.2,.7,.3,1)}.pbento:hover img{transform:scale(1.09)}' +
      '.pbento:hover{box-shadow:0 24px 50px -18px rgba(22,101,52,.55)}' +
      '.pbento .pexcerpt{max-height:0;opacity:0;transition:max-height .45s ease,opacity .35s ease}' +
      '.pbento:hover .pexcerpt,.pbento:focus-visible .pexcerpt{max-height:6rem;opacity:1}' +
      '@media (prefers-reduced-motion:reduce){.pbento{opacity:1;transform:none;transition:none}}';
    document.head.appendChild(st);
  }
  const navlink = (h, t) => '<a href="' + h + '" class="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-700">' + t + "</a>";

  (async () => {
    root().innerHTML = '<div class="min-h-screen flex items-center justify-center text-slate-400 gap-3"><div class="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>Memuat program…</div>';
    try {
      let ST = {}, siswa = [], kelas = [], guru = [], materi = [], ppdb = [];
      // Hero Slider jenjang (data/slider.json, slide ber-"halaman" = jenjang ini) — diambil paralel dengan settings
      const sliderP = fetchJSON("slider.json").catch(() => null);
      try { ST = await fetchJSON("settings.json"); } catch (e) {}
      let slPrep = null;
      try { const sd = await sliderP; if (window.LSSlider && sd) { const pr = LSSlider.prepare(sd, LEVEL.toLowerCase()); if (pr.list.length) slPrep = pr; } } catch (e) {}
      try {
        [siswa, kelas, guru, materi, ppdb] = await Promise.all([
          fetchJSON("siswa.json").catch(() => []),
          fetchJSON("kelas.json").catch(() => []),
          fetchJSON("guru.json").catch(() => []),
          fetchJSON("materi.json").catch(() => []),
          fetchJSON("ppdb.json").catch(() => [])
        ]);
      } catch (e) {}

      const nama = ST.nama_sekolah || "Nama Sekolah";
      const wa = "https://wa.me/" + (ST.wa_admin || "").replace(/^0/, "62");
      const tel = "tel:" + (ST.telepon || "").replace(/[^0-9+]/g, "");
      const kLevel = kelas.filter(k => L.tingkat.includes(String(k.tingkat)));
      const namaK = kLevel.map(k => k.nama);
      const siswaLevel = siswa.filter(s => namaK.includes(s.kelas) && s.status === "Aktif");
      const waliIds = [...new Set(kLevel.map(k => k.wali_kelas).filter(Boolean))];
      const waliGuru = guru.filter(g => waliIds.includes(g.id));

      const news = [];
      if (ST.pengumuman) news.push(["Pengumuman Sekolah", ST.pengumuman, "index.html#berita", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=60"]);
      if (ppdb.length) news.push(["Open Admission PPDB Dibuka", "Penerimaan Peserta Didik Baru resmi dibuka. Daftarkan putra-putri Anda melalui PPDB Online.", "ppdb.html", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=60"]);
      materi.slice(0, 2).forEach(m => news.push([m.judul, m.deskripsi || "Materi pembelajaran terbaru.", "belajar.html", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=60"]));

      // FIXED: dulu #progHero memakai pt-[72px] yang dibuat program.js SETELAH app.js membersihkan kelas itu saat boot, padahal <body> sudah
      // memberi padding-top setinggi header -> terbentuk celah kosong ±72px antara menu navigasi dan Hero Slider saat render pertama.
      // Celah dihapus; sebagai gantinya dipasang breadcrumb ramping (Beranda / Program / jenjang) di antara header dan slider.
      const CRUMB_H = 44;
      if (!document.getElementById("progCrumbCss")) {
        const st = document.createElement("style"); st.id = "progCrumbCss";
        // slider mode "penuh" dikurangi tinggi header + breadcrumb agar semuanya pas satu layar
        st.textContent = '#progHero{--sl-off:' + (72 + CRUMB_H + 1) + 'px}';   // dipakai slider.js: calc(100vh - var(--sl-off,72px))
        document.head.appendChild(st);
      }
      const crumb = '<nav id="progCrumb" aria-label="Breadcrumb" class="bg-white border-b border-slate-100"><ol class="max-w-7xl mx-auto px-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500 whitespace-nowrap overflow-x-auto" style="height:' + CRUMB_H + 'px">' +
        '<li class="flex items-center gap-1.5"><a href="index.html" class="inline-flex items-center gap-1 hover:text-brand-700"><i data-lucide="house" class="w-3.5 h-3.5"></i>Beranda</a></li>' +
        '<li class="flex items-center gap-1.5" aria-hidden="true"><i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-300"></i></li>' +
        '<li class="flex items-center gap-1.5"><a href="index.html#program" class="hover:text-brand-700">Program</a></li>' +
        '<li class="flex items-center gap-1.5" aria-hidden="true"><i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-300"></i></li>' +
        '<li class="flex items-center gap-1.5"><span aria-current="page" class="font-bold ' + L.text + '">' + esc(L.full) + ' (' + esc(LEVEL) + ')</span></li></ol></nav>';

      // Hero statis lama — hanya dipakai bila tidak ada slide aktif untuk jenjang ini (atur di Admin → Hero Slider)
      const heroStatic = `
      <section class="relative overflow-hidden bg-gradient-to-br ${L.grad} text-white">
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
              <span class="inline-flex items-center gap-1.5"><i data-lucide="calendar" class="w-4 h-4 text-amber-300"></i>${esc(L.age)}</span>
              <span class="inline-flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4 text-amber-300"></i>Masa studi ${esc(L.duration)}</span>
            </div>
          </div>
          <div class="rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 aspect-[4/3]">${img(L.hero, "Program " + LEVEL)}</div>
        </div>
      </section>
      `;

      // ===== About Us (Kepala Sekolah jenjang) — konten & gaya disamakan dengan About Us di beranda =====
      // Data: Panel Admin -> Pengaturan Sekolah (settings.json: kepsek_jenjang). Foto, label tombol & tautan sosial mengikuti pengaturan beranda (ui.json).
      // Konfigurasi About Us (ikon Lucide sosial, ikon & label e-brochure, foto) dibaca langsung dari data/ui.json agar SELALU mengikuti Panel Admin
      // (dulu memakai LSUI.get() yang bisa masih berisi nilai bawaan karena ui.json dimuat paralel). fetchJSON berbagi permintaan yang sama dengan app.js.
      let prof = {};
      try { const ui = await fetchJSON("ui.json"); prof = (window.LSUI && LSUI.norm ? LSUI.norm(ui || {}) : (ui || {})).body.seksi.profil || {}; } catch (e) {
        prof = (window.LSUI && LSUI.get && LSUI.get().body && LSUI.get().body.seksi && LSUI.get().body.seksi.profil) || {};
      }
      const aboutFoto = prof.foto || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=60";
      const socList = (prof.sosial && prof.sosial.length ? prof.sosial : [{ ikon: "message-circle", href: "wa" }, { ikon: "mail", href: "mail" }, { ikon: "instagram", href: "#kontak" }, { ikon: "youtube", href: "#kontak" }]).filter(x => x.aktif !== false);
      const socHref = h => h === "wa" ? wa : h === "mail" ? "mailto:" + (ST.email || "") : (window.LSUI ? LSUI.resolve(h) : h);
      const socHtml = socList.map(x => '<a href="' + esc(socHref(x.href)) + '"' + (x.href === "wa" || x.href === "mail" ? ' target="_blank" rel="noopener"' : "") + ' class="w-9 h-9 rounded-full ' + L.chip + ' flex items-center justify-center hover:opacity-80" title="' + esc(x.ikon) + '"><i data-lucide="' + esc(x.ikon) + '" class="w-4 h-4"></i></a>').join("");
      const aboutSec = `
      <section id="progAbout" class="bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div class="relative">
            <div class="rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">${img(aboutFoto, "Lingkungan sekolah")}</div>
            <div id="aboutCard" class="absolute -bottom-6 right-6 bg-white rounded-2xl shadow-xl p-5 max-w-[240px]">
              <div id="aboutRole" class="text-xs font-bold text-slate-400 uppercase">Kepala Sekolah ${esc(LEVEL)}</div>
              <div id="aboutPerson" class="font-display font-bold ${L.text} mt-1">—</div>
              <div id="aboutNip" class="text-xs text-slate-500"></div>
            </div>
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wider ${L.text}">${esc(prof.eyebrow || "About Us")}</span>
            <h2 class="font-display font-extrabold text-3xl text-slate-800 mt-2">${esc(prof.judul || "Tentang")} <span id="aboutNama">${esc(nama)}</span></h2>
            <div id="aboutText" class="text-slate-600 mt-4 leading-relaxed space-y-3"></div>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              ${prof.brosurAktif === false ? "" : '<button id="progBrochure" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl ' + L.btn + ' ' + (LEVEL === "SMK" ? "text-amber-950" : "text-white") + ' font-bold shadow"><i data-lucide="' + esc(prof.brosurIkon || "download") + '" class="w-4 h-4"></i>' + esc(prof.brosurLabel || "Download E-Brochure") + '</button>'}
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-500 mr-1">${esc(prof.sosialLabel || "Stay Connected:")}</span>${socHtml}
              </div>
            </div>
          </div>
        </div>
      </section>
`;

      root().innerHTML = `
      <!-- Header & footer situs dipasang oleh app.js (LiveSite) agar sama persis dengan beranda -->

      ${slPrep ? crumb + '<section id="progHero"><div id="slHost"></div></section>' : heroStatic}

      <section id="konten" class="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${[["users", "Siswa " + LEVEL, siswaLevel.length], ["school", "Rombel", kLevel.length], ["briefcase", "Wali Kelas", waliGuru.length], ["book-open", "Mata Pelajaran", L.subjects.length]].map(s =>
            '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center"><div class="w-10 h-10 mx-auto rounded-xl ' + L.chip + ' flex items-center justify-center mb-2"><i data-lucide="' + s[0] + '" class="w-5 h-5"></i></div><div class="text-2xl font-extrabold font-display">' + s[2] + '</div><div class="text-xs text-slate-500 font-semibold">' + s[1] + '</div></div>').join("")}
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 py-14">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <span class="text-xs font-bold uppercase tracking-wider ${L.text}">Tentang Program</span>
            <h2 class="font-display font-extrabold text-3xl text-slate-800 mt-2">Program ${esc(L.full)}</h2>
            ${L.about.map(p => '<p class="text-slate-600 mt-4 leading-relaxed">' + esc(p) + '</p>').join("")}
            <p class="text-sm text-slate-500 mt-4">Kurikulum: <b>${esc(ST.kurikulum || "Merdeka")}</b> • Tahun Ajaran <b>${esc(ST.tahun_ajaran || "—")}</b></p>
          </div>
          <div class="space-y-3">
            ${L.unggul.map(u => '<div class="flex items-center gap-3 ' + L.soft + ' border ' + L.border + ' rounded-2xl p-4"><div class="w-10 h-10 rounded-xl ' + L.chip + ' flex items-center justify-center shrink-0"><i data-lucide="' + u[0] + '" class="w-5 h-5"></i></div><b class="text-sm text-slate-700">' + esc(u[1]) + '</b></div>').join("")}
            ${L.jurusan ? '<div class="' + L.soft + ' border ' + L.border + ' rounded-2xl p-4"><b class="text-sm text-slate-700 block mb-2">Kompetensi Keahlian</b><div class="flex flex-wrap gap-2">' + chips(L.jurusan) + '</div></div>' : ""}
          </div>
        </div>
      </section>

      ${aboutSec}

      <section class="${L.soft} border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-4 py-14">
          <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Mata Pelajaran</h2>
          <p class="text-slate-500 text-center mt-2">Struktur kurikulum jenjang ${esc(LEVEL)}.</p>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            ${L.subjects.map(s => '<div class="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4"><div class="w-9 h-9 rounded-lg ' + L.chip + ' flex items-center justify-center shrink-0"><i data-lucide="book-open" class="w-4 h-4"></i></div><b class="text-sm text-slate-700">' + esc(s) + '</b></div>').join("")}
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 py-14">
        <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Hari &amp; Jam Belajar</h2>
        <div class="grid ${L.schedule.length > 1 ? 'md:grid-cols-2' : ''} gap-6 mt-8 max-w-4xl mx-auto">
          ${L.schedule.map(sc => '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div class="' + L.chip + ' px-5 py-3 font-display font-bold">' + esc(sc.group) + '</div><table class="w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-4 py-2 text-left text-xs uppercase text-slate-500">Hari</th><th class="px-4 py-2 text-left text-xs uppercase text-slate-500">Masuk</th><th class="px-4 py-2 text-left text-xs uppercase text-slate-500">Pulang</th></tr></thead><tbody>' + sc.rows.map(r => '<tr class="border-t border-slate-100"><td class="px-4 py-2 font-semibold">' + r[0] + '</td><td class="px-4 py-2">' + r[1] + '</td><td class="px-4 py-2">' + r[2] + '</td></tr>').join("") + '</tbody></table></div>').join("")}
        </div>
      </section>

      <section class="${L.soft} border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-4 py-14">
          <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Ekstrakurikuler</h2>
          <div class="flex flex-wrap justify-center gap-2.5 mt-8">${chips(L.ekskul)}</div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 py-14">
        <h2 class="font-display font-extrabold text-3xl text-slate-800 text-center">Afternoon Class</h2>
        <p class="text-slate-500 text-center mt-2">Kelas pengembangan diri sepulang sekolah.</p>
        <div class="flex flex-wrap justify-center gap-2.5 mt-8">${chips(L.afternoon)}</div>
      </section>

      <section class="bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-4 py-14">
          <div class="flex items-end justify-between gap-4 mb-8">
            <div><h2 class="font-display font-extrabold text-3xl text-brand-800">What's going on?</h2><p class="text-slate-500 mt-1">Kabar terbaru seputar kegiatan dan pembelajaran.</p></div>
            <a href="index.html#berita" class="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">More Articles <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${news.slice(0, 3).map(n => '<article class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"><div class="h-40">' + img(n[3], n[0]) + '</div><div class="p-5"><h3 class="font-display font-bold leading-snug">' + esc(n[0]) + '</h3><p class="text-sm text-slate-500 mt-2 line-clamp-3">' + esc(n[1]) + '</p><a href="' + n[2] + '" class="inline-flex items-center gap-1 text-sm font-bold text-brand-700 mt-3">Read More <i data-lucide="arrow-right" class="w-4 h-4"></i></a></div></article>').join("") || '<p class="text-slate-400">Belum ada kabar.</p>'}
          </div>
        </div>
      </section>

      <section id="progGaleri" class="relative bg-gradient-to-b from-brand-50/70 via-white to-brand-50/40 border-y border-brand-100">
        <div class="max-w-7xl mx-auto px-4 py-14">
          <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div class="min-w-0">
              <span class="text-xs font-bold uppercase tracking-wider ${L.text}">School Activities</span>
              <h2 class="font-display font-extrabold text-3xl md:text-4xl text-slate-800 mt-2">Galeri ${esc(LEVEL)}</h2>
              <p class="text-slate-500 mt-2 max-w-2xl">Aktivitas, dokumentasi, dan kegiatan para siswa ${esc(LEVEL)}. Klik kartu untuk melihat foto lebih besar.</p>
            </div>
            <span class="px-3 py-1.5 rounded-full bg-brand-600 text-white font-bold text-sm whitespace-nowrap">${L.gallery.length} foto</span>
          </div>
          <div id="progGrid">${L.gallery.map(galCard).join("")}</div>
        </div>
      </section>

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



      <div id="galModal" class="hidden fixed inset-0 z-[60] bg-slate-900/85 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Foto galeri">
        <div class="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative">
          <button id="galClose" class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60" aria-label="Tutup"><i data-lucide="x" class="w-5 h-5"></i></button>
          <div class="aspect-[16/10] bg-slate-100"><img id="galImg" class="w-full h-full object-cover" alt=""></div>
          <div class="p-5">
            <span id="galKat" class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${L.chip}"></span>
            <h3 id="galJudul" class="font-display font-bold text-xl text-slate-800 mt-2"></h3>
            <p id="galDesk" class="text-slate-600 text-sm mt-1.5 leading-relaxed"></p>
            <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button id="galPrev" class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"><i data-lucide="arrow-left" class="w-4 h-4"></i>Sebelumnya</button>
              <span id="galPos" class="text-xs text-slate-400 font-semibold"></span>
              <button id="galNext" class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white ${L.btn}">Berikutnya<i data-lucide="arrow-right" class="w-4 h-4"></i></button>
            </div>
          </div>
        </div>
      </div>`;

      // ===== About Us: isi dari Pengaturan Sekolah + E-Brochure =====
      fillAbout(ST, LEVEL);
      const broBtn = $("progBrochure");
      if (broBtn) broBtn.onclick = () => {
        const ab = aboutData(ST, LEVEL);
        printHTML("E-Brochure " + nama + " " + LEVEL,
          "<div class='center'><h1>" + esc(nama) + "</h1><div class='muted'>NPSN " + esc(ST.npsn || "") + " • " + esc(L.full) + " (" + esc(LEVEL) + ") • Kurikulum " + esc(ST.kurikulum || "") + "</div></div><hr>" +
          "<h3>Profil Singkat</h3><p>" + esc(nama) + " menyelenggarakan pendidikan " + esc(L.full) + " dengan Kurikulum " + esc(ST.kurikulum || "") + " tahun ajaran " + esc(ST.tahun_ajaran || "") + ". " + esc(ab.peran) + ": " + esc(ab.nama) + (ab.nip ? " (NIP. " + esc(ab.nip) + ")" : "") + ".</p>" +
          ab.paragraf.map(x => "<p>" + esc(x) + "</p>").join("") +
          "<h3>Data Ringkas</h3><table><tr><th>Siswa Aktif</th><td>" + siswaLevel.length + "</td><th>Wali Kelas</th><td>" + waliGuru.length + "</td><th>Rombel</th><td>" + kLevel.length + "</td></tr></table>" +
          "<h3>Kontak</h3><p>" + esc(ST.alamat || "") + "<br>Telp. " + esc(ST.telepon || "") + " • Email " + esc(ST.email || "") + "</p>");
      };

      // ===== Galeri Bento (9 foto, 4 kolom — sama dengan galeri beranda) + lightbox =====
      const galList = L.gallery; let galI = -1;
      const galOpen = i => {
        galI = (i + galList.length) % galList.length; const g = galList[galI];
        $("galImg").src = g[1]; $("galImg").alt = g[0];
        $("galKat").textContent = g[2] || "Kegiatan"; $("galJudul").textContent = g[0]; $("galDesk").textContent = g[3] || "";
        $("galPos").textContent = (galI + 1) + " / " + galList.length;
        $("galModal").classList.remove("hidden"); document.body.style.overflow = "hidden"; refreshIcons();
      };
      const galClose = () => { $("galModal").classList.add("hidden"); document.body.style.overflow = ""; galI = -1; };
      document.querySelectorAll("#progGrid [data-gal]").forEach(b => b.onclick = () => galOpen(Number(b.dataset.gal)));
      $("galClose").onclick = galClose;
      $("galPrev").onclick = () => galOpen(galI - 1);
      $("galNext").onclick = () => galOpen(galI + 1);
      $("galModal").onclick = e => { if (e.target === $("galModal")) galClose(); };
      document.addEventListener("keydown", e => { if (galI < 0) return; if (e.key === "Escape") galClose(); if (e.key === "ArrowLeft") galOpen(galI - 1); if (e.key === "ArrowRight") galOpen(galI + 1); });
      // animasi muncul bertahap saat kartu masuk layar (menghormati "kurangi animasi")
      (() => {
        const cards = document.querySelectorAll("#progGrid .pbento"), rm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (rm || !("IntersectionObserver" in window)) { cards.forEach(c => c.classList.add("in")); return; }
        const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { setTimeout(() => x.target.classList.add("in"), Number(x.target.dataset.d || 0) * 55); io.unobserve(x.target); } }), { threshold: .08, rootMargin: "0px 0px -30px 0px" });
        cards.forEach(c => io.observe(c));
      })();
      document.title = "Program " + LEVEL + " — " + nama;
      if (slPrep) LSSlider.mount($("slHost"), slPrep, { down: "#konten" });
      refreshIcons();
    } catch (err) {
      console.error(err);
      const msg = String((err && err.message) || err);
      root().innerHTML = '<div class="min-h-screen flex items-center justify-center p-6"><div class="max-w-md bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-sm"><b>Gagal memuat halaman program.</b><p class="mt-2">' + msg.replace(/[&<>]/g, "") + '</p><a href="index.html" class="inline-block mt-4 font-bold underline">← Kembali ke Beranda</a><p class="mt-2 text-rose-500">Buka Console (F12) untuk detail teknis.</p></div></div>';
    }
  })();
})();
