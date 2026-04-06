# Katalog Komputer Next.js

Migrasi dari Google Apps Script + sheet sample ke Next.js (App Router), siap deploy ke Vercel, dengan localStorage dan mode HOT EDIT.

## Run

```bash
npm install
npm run dev
```

## HOT EDIT

- Tombol floating `HOT EDIT` ada di kanan atas.
- Saat ON, setiap card menampilkan tombol `Edit`.
- Semua perubahan tersimpan ke localStorage.
- Setiap card juga punya tombol `Pesan Sekarang` (WhatsApp) dengan popup konfirmasi.

## Image Strategy

Urutan sumber gambar per item:

1. URL dari `FotoURL`
2. `/public/img/{ProductID}.webp`
3. `/public/img/{ProductID}.jpg`
4. `/public/img/{ProductID}.png`
5. Placeholder otomatis

## Filename Reference dari `excel.txt`

- `LAP-001` → `public/img/LAP-001.jpg` (atau .webp/.png)
- `LAP-002` → `public/img/LAP-002.jpg`
- `LAP-003` → `public/img/LAP-003.jpg`
- `PC-001` → `public/img/PC-001.jpg`
- `PC-002` → `public/img/PC-002.jpg`
- `ACC-001` → `public/img/ACC-001.jpg`
- `ACC-002` → `public/img/ACC-002.jpg`

## WhatsApp Order Flow

- Tombol `Pesan Sekarang` membuka popup data pemesan.
- Tombol lanjut akan redirect ke `https://wa.me/628123123123` dengan pesan otomatis berisi detail produk.
