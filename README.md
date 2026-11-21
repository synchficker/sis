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
