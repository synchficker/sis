# Laporan QA Final — SIS (Tahap 1–3)

Pengujian otomatis: browser headless (Chromium), server tiruan GitHub Pages (path hilang → 404.html berstatus 404 asli),
GitHub Contents API tiruan (GET/PUT/DELETE), gambar uji asli (JPEG 504 KB, PNG 4,91 MB, GIF).
Belum diuji terhadap repo GitHub sungguhan.

## 1. Route admin — 36/36 PASS (0 galat JS)
dashboard, ppdb, siswa, kelas, mutasi, absensi, absensi-guru, jurnal, nilai, rapor, ujian, soal, laporan, materi, video, tugas,
spp, bos, gaji, guru, kinerja, inventaris, buku, peminjaman, media, slider, galeri, kegiatan, biaya, kalender, tampilan, chat,
notifikasi, audit, pengaturan, login. Setiap route: tetap di /admin/, tidak ada "Gagal memuat modul", menu aktif & breadcrumb benar.

## 2. URL — baru 14/14 PASS (status 200); lama 14/14 sampai ke halaman benar
| URL lama | Status awal | Akhir |
|---|---|---|
| / | 200 | / |
| /admin/ | 200 | /admin/ |
| /login/ | 404* | /admin/login.html (200) |
| /ppdb/ /portal/ /cbt/ /belajar/ /kalender/ /sd/ /smp/ /sma/ /smk/ /tuition/ /seed/ | 404* | /pages/<nama>/ (200) |
\* GitHub Pages memberi status 404 pada path tanpa berkas fisik; halaman tetap tampil dan dialihkan (Opsi A disetujui).
Sub-path `user.github.io/repo/`: 22/22 PASS.

## 3. Upload / Media Library — 34/34 PASS
504 KB → WebP 1600×1067 437 KB tersimpan di assets/uploads/; 4,91 MB ditolak (toast jelas); GIF ditolak; metadata media.json sesuai
spesifikasi; pilih dari library ke Slider; slider.json tak berubah strukturnya; tampil di beranda; upload langsung dari form Kegiatan;
UI/Tampilan (logo, foto profil, foto fasilitas) & Form Login (latar) tersimpan dan tampil di publik; hapus dengan peringatan pemakaian.

## 4. Template modul seragam — 15/15 PASS
Warna tombol, modal konfirmasi (Esc/OK), audit tercatat, empty state, paginasi 50 baris, kolom cari modul kustom, askBox, 0 dialog bawaan browser.

## 5. Keamanan — XSS dinamis
Mode 1 (25.646 nilai) dan mode agresif (64.360 nilai): 36 route admin, form Edit, 13 halaman publik, semua tab Portal → 0 temuan setelah perbaikan.
Temuan yang diperbaiki: fmtWaktu/fmtTgl (Audit, WA, Chat, Dashboard) dan nilai warna footer/tema di norm().

## 6. Mobile 360px — 36 route
Tanpa overflow halaman; 27 tabel semuanya bisa digulir horizontal di wadahnya; sidebar tertutup default dan tidak menutupi konten.

## 7. Integritas
310 nama global tanpa duplikat; tanpa console.log/token hardcode; tanpa syntax error; 74 <script> memakai ?v=20261129 dan file ada;
data/ identik dengan sumber (+ media.json baru).

## 8. Sengaja tidak diubah
data/*.json (struktur & nama), logika SPP/nilai/rapor/PPDB/CBT, nama route hash, struktur slider.json & kegiatan.json,
confirm() di assets/js/cbt.js (kumpul ujian siswa) dan assets/js/seed.js (alat pengembang).
