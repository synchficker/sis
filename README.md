# 🏫 SIS — Sistem Informasi Sekolah (CMS Statis, GitHub Pages)

CMS coupled (bukan headless) 100% statis untuk SD / SMP / SMA / SMK.
HTML5 + Tailwind CDN + VanillaJS + Lucide CDN. Database = file `data/*.json`.
Operasi TULIS memakai GitHub Contents API (GET SHA → PUT base64, commit "Update {file}").
Login admin memakai GitHub Personal Access Token (PAT).

## Isi Bundle
Halaman : index.html, login.html, admin.html, portal.html, ppdb.html, belajar.html, cbt.html
JS inti : config.js, app.js, portal.js, cbt.js
JS admin: admin.js + admin-mods.js + admin-mods2.js + admin-mods3.js + admin-mods4.js
          (admin.js = inti/skema/CRUD/PPDB; mods = Absensi QR, e-Rapor, CBT;
           mods2 = SPP, Gaji, Audit, Chat; mods3 = WA Gateway, Perpustakaan;
           mods4 = Laporan Dinas, Pengaturan, Dashboard, Router. admin.html memuat kelimanya berurutan.)
Data    : folder data/ berisi 24 file JSON (database lokal).

## Modul (7 wajib)
A. Akademik: PPDB Online, Data Induk (Dapodik), Rombel, Mutasi, Absensi QR, e-Rapor Merdeka & K13
B. LMS: Materi, Video, Tugas, Ujian CBT + Bank Soal
C. Keuangan: SPP (VA/QRIS demo), Tunggakan, BOS, Penggajian, Audit Log otomatis
D. SDM: Guru/TU, Absensi Guru, Jurnal Mengajar, Penilaian Kinerja
E. Komunikasi Ortu: Portal (nilai/absensi/SPP/chat wali), Notifikasi WA (wa.me / Fonnte)
F. Sarpras & Perpustakaan: Inventaris KIB, Katalog & Peminjaman Buku (denda otomatis)
G. Pelaporan Dinas: Export CSV/JSON Dapodik, Peserta ANBK (kls 5/8/11), BKU BOS + cetak

## Setup (5 langkah)
1. Buat repo GitHub (mis. `sis-sekolah`), upload SEMUA isi folder ini (pertahankan folder `data/`).
2. Edit `config.js`: isi `GITHUB_USERNAME`, `GITHUB_REPO`, `GITHUB_BRANCH`
   (boleh dibiarkan jika URL Pages sudah `username.github.io/repo` — terdeteksi otomatis).
3. Repo → Settings → Pages → Source: branch `main`, folder `/ (root)` → Save. Tunggu situs aktif.
4. Buat PAT: GitHub → Settings → Developer settings → Fine-grained tokens →
   Repository access: hanya repo ini → Permissions: Contents: Read and write → Generate.
5. Buka `https://USERNAME.github.io/REPO/login.html` → tempel PAT → Masuk.

## Alur penting
- PPDB: ortu isi ppdb.html → unduh JSON + kirim WA panitia → Admin → PPDB → Impor JSON →
  tombol ✓ Terima → siswa + NIS otomatis dibuat.
- CBT: Admin buat ujian (pilih soal + token) → siswa buka cbt.html (NIS + token) →
  nilai otomatis → unduh JSON hasil → Admin → Ujian → Impor Hasil CBT → masuk nilai/e-Rapor.
- Absensi QR: Admin → Absensi → Kartu QR Siswa → cetak → tab Scan QR (kamera, wajib HTTPS).
- SPP: generate tagihan massal per bulan/kelas → bayar (VA/QRIS/Tunai) → audit tercatat.
- Portal Ortu: login NIS + tanggal lahir (demo: 2026001 / 2013-05-10). Token CBT demo: MTK7A.

## Keamanan — WAJIB DIBACA
- `// TOKEN TIDAK BOLEH DI-HARDCODE` — PAT hanya di sessionStorage (hilang saat tab ditutup),
  tidak pernah ditulis ke file/repo. Gunakan fine-grained PAT izin minimum (Contents RW, 1 repo).
- Repo publik ⇒ SEMUA file data/*.json dapat dibaca publik (sifat GitHub Pages).
  JANGAN isi data pribadi nyata (NIK, alamat lengkap, no. HP asli) di repo publik.
  Untuk data riil: repo privat + GitHub Pages (paket Pro), atau anonymisasi.
- Login portal ortu (NIS+TTL) bersifat demo — situs statis tidak bisa menyimpan rahasia server.
- VA & QRIS adalah instrumen DEMO. Produksi: integrasikan payment gateway resmi
  (Midtrans/Xendit/dll) — butuh layanan eksternal, di luar arsitektur 100% statis.
- WA Gateway: tanpa token → kirim manual via wa.me; dengan token Fonnte → otomatis
  (token gateway juga hanya di sessionStorage).

## Catatan teknis
- fetchJSON() membaca data/*.json?t=Date.now() (bypass cache) + fallback raw.githubusercontent.com.
- GitHub Pages butuh ±1 menit untuk publikasi commit baru; panel admin memakai overlay cache
  sessionStorage sehingga perubahan Anda langsung terlihat; tombol Sinkron membersihkan cache.
- Konflik SHA (dua admin menulis bersamaan) otomatis di-retry 1× oleh pushJSON().
- Setiap tulis = 2 commit (Update {file} + Update audit.json). Rate limit API 5.000 req/jam — aman.
- Audit log dipangkas otomatis ke 500 entri terakhir. Kamera (scan QR) hanya aktif di HTTPS/localhost.

## Catatan Optimasi Performa (Hero Slider & Beranda)
- **Hero Slider**: hanya 2 slide yang dianimasikan (keluar + masuk); progres memakai `transform` (bukan `width`);
  efek `grain` (mix-blend-mode) & `backdrop-blur` di atas hero dihapus; Ken Burns tidak lagi "melompat" saat slide keluar;
  loop slide terakhir → pertama tidak lagi melintasi seluruh slide; gambar slide 2..n dimuat & di-decode saat idle;
  loop animasi berhenti ketika hero tidak terlihat; klik mouse pada panah tidak lagi menghentikan autoplay.
- **Data beranda** (±2 MB: siswa, guru, kegiatan, dst.) kini dimuat SETELAH hero tampil (idle / saat mulai menggulir);
  galeri kegiatan dimuat saat bagian itu mendekati layar. Permintaan yang sama tidak lagi diunduh ganda.
- **Render ganda dihapus**: statistik/program/fasilitas/berita/agenda hanya dirender oleh `app.js` (data/ui.json).
- `data/slider.json`: 500 slide (495 Draft duplikat "#N") dipangkas menjadi 8 (5 tampil + 3 draft unik).
- `data/ui.json`: `aurora` & `grain` dimatikan (lapisan layar-penuh). Bisa dinyalakan lagi dari Admin → Tampilan.
- `app.js`: deteksi halaman memakai `window.__LS_PAGE__` sehingga `/admin/`, `/login/`, dst. tidak lagi dianggap beranda.
- Saran lanjutan: ganti `cdn.tailwindcss.com` (JIT di browser, tidak untuk produksi) dengan CSS hasil build Tailwind CLI,
  dan sematkan versi `lucide` (hindari `@latest`).

## Perbaikan Panel Admin
- `config.js`: ada blok `MANUAL` untuk mengisi `GITHUB_USERNAME`/`GITHUB_REPO` bila situs TIDAK dibuka dari `*.github.io`
  (domain kustom, Netlify, Vercel, localhost). Tanpa ini semua Simpan/Hapus gagal ("Konfigurasi repo belum diisi").
- Rapor, Laporan, dan Biaya tidak lagi error bila pop-up cetak diblokir browser (`openPrintWindow`).
- Tabel modul CRUD (16 modul) tampil bertahap 50 baris + tombol "Muat 50 baris lagi"; pencarian di-debounce 200 ms.
- Parameter cache `?v=` pada skrip dinaikkan ke `20261124` agar browser memuat JS terbaru.
- **Navigasi admin**: klik menu sidebar (`#/siswa`, dst.) sebelumnya membuka BERANDA PUBLIK karena `<base href>` di `config.js`
  meresolusi tautan `#...` ke root situs. Kini tautan hash ditangani di halaman yang sedang dibuka (35/35 modul diuji).
- Header & footer situs publik tidak lagi dipasang di Panel Admin/Seeder (admin punya bilah atas sendiri).

## URL bersih & konsistensi header/footer
- Semua tautan dirender tanpa `.html` (`ppdb.html` → `ppdb/`, `index.html#x` → `/#x`); redirect JavaScript (login/admin/pratinjau)
  memakai `siteUrl()`; mengetik `/ppdb.html` langsung dialihkan ke `/ppdb/`. Diuji dengan 82 klik tautan: tidak ada `.html` yang muncul.
- Footer: tautan "Galeri SD–SMK" (hanya ke SD) diganti 4 tautan: Program SD, SMP, SMA, SMK (sebelumnya SMP/SMA/SMK tidak
  tertaut dari header/footer).
- Halaman SD/SMP/SMA/SMK tidak lagi membuat header/footer sendiri (`program.js`); semua halaman publik memakai header & footer
  dari `app.js` (sumber: data/ui.json) sehingga identik dengan beranda. Header/footer statis lama disembunyikan sejak awal (`config.js`).

## Hero Slider per halaman, Dashboard default, layout admin, batas 50 baris
- **`slider.js`** (baru): mesin Hero Slider bersama untuk Beranda dan halaman SD/SMP/SMA/SMK. `data/slider.json` kini berisi
  `slides[].halaman` (`beranda|sd|smp|sma|smk`) dan `configs{<halaman>}` (pengaturan putar per halaman; `config` = Beranda).
  Slide lama tanpa `halaman` dianggap Beranda. Jenjang tanpa slide aktif otomatis memakai hero statis lama.
- **Admin → Hero Slider**: tab Beranda / SD / SMP / SMA / SMK; tiap halaman punya daftar slide, urutan, pratinjau, dan konfigurasi sendiri.
- **Dashboard** kini modul pertama setelah masuk Panel Admin (`#/dashboard`); route awal dijalankan setelah semua modul terdaftar
  (membuka/refresh `#/slider`, `#/galeri`, dst. tidak lagi memuat modul yang salah).
- **Layout admin terkunci satu layar** (`admin.html`): sidebar punya scrollbar sendiri, konten bergulir di `#scrollArea`.
- **Batas 50 baris di semua modul**: modul CRUD (`renderCRUD`) dan semua tabel/daftar modul khusus (`lsPaginate` di `admin-mods4.js`)
  menampilkan 50 baris pertama + "Muat 50 baris lagi". Catatan: menjalankan Seeder akan membuat ulang `slider.json` tanpa slide jenjang.
