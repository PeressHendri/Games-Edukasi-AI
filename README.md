# Literasi Digital — AI Awareness Game

Game edukasi interaktif berbasis web untuk meningkatkan kesadaran penggunaan AI yang kritis dan bertanggung jawab di kalangan mahasiswa.

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-pink)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-teal)

---

## Deskripsi Proyek

Game ini dirancang sebagai media edukasi interaktif untuk membantu mahasiswa memahami cara menggunakan AI secara kritis dan bertanggung jawab. Terdiri dari 2 mini-game yang dimainkan secara individu dalam satu sesi 5 menit, dengan sistem poin dan leaderboard yang ditampilkan di akhir sesi.

---

## Target Audiens

Mahasiswa yang aktif menggunakan AI dalam kegiatan akademik.

---

## Sistem Game

### Timer & Nyawa
![1779344012675](image/README/1779344012675.png)
| Komponen | Nilai | Keterangan |
|---|---|---|
| Timer global | 5 menit | Countdown untuk seluruh sesi, tidak reset antar game |
| Nyawa | 3 ❤️ | Hanya berlaku di game True or False |
| Penalti puzzle | -10 detik | Setiap salah susun urutan di Puzzle Drag & Drop |
| Game over | — | Skor dikunci jika waktu habis atau nyawa habis |

### Sistem Poin

| Aksi | Poin |
|---|---|
| Puzzle selesai dengan urutan benar | +50 |
| Speed bonus puzzle (selesai < 1 menit) | +20 |
| True/False jawaban benar | +10 per soal |
| Streak benar 3x berturut-turut | +15 bonus |
| Salah jawab True/False | -5 poin & -1 nyawa |
| Salah susun urutan puzzle | -10 detik dari timer global |

### Flow Game

```
Mulai
  → [Game 1: Puzzle Drag & Drop]
      → Selesai / Waktu habis
  → [Game 2: True or False]
      → Selesai / Waktu habis / Nyawa habis
  → Rekap Skor
  → Leaderboard
```

---

## Game 1 — Puzzle Drag & Drop

Pemain harus menyusun 6 potongan kartu menjadi urutan berpikir kritis yang benar sebelum menggunakan AI.

### Urutan yang Benar
```
1. Menentukan tujuan
2. Mencari sumber
3. Membuat prompt
4. Mengecek jawaban AI
5. Revisi hasil
6. Membuat opini sendiri
```

### Urutan yang Salah
```
1. Langsung copy jawaban AI
2. Skip mencari sumber
3. Membuat prompt terlalu umum
4. Langsung submit tugas
5. Tidak membaca hasil AI
6. Menggunakan jawaban pertama AI tanpa revisi  
```

### Penjelasan Tiap Langkah

**1. Menentukan tujuan**
Tujuan adalah kompas. Tanpa tujuan yang jelas, langkah berikutnya menjadi tidak terarah — sumber yang dicari tidak relevan, prompt yang dibuat kurang tepat, dan sulit menilai apakah jawaban AI sesuai kebutuhan atau tidak.

**2. Mencari sumber**
Sebelum bertanya ke AI, kamu perlu punya gambaran dan konteks dasar tentang topik yang dibahas. Dengan mencari sumber terlebih dahulu, kamu bisa menilai apakah jawaban AI akurat, relevan, atau keliru. Melewatkan langkah ini memicu ketergantungan buta pada AI.

**3. Membuat prompt**
Prompt yang baik lahir dari tujuan yang jelas dan pengetahuan dasar yang sudah dimiliki. Prompt adalah jembatan antara pikiranmu dan kemampuan AI. Semakin spesifik dan kontekstual promptmu, semakin relevan jawaban yang kamu dapatkan.

**4. Mengecek jawaban AI**
AI bisa saja salah, bias, atau memberikan informasi yang terlihat meyakinkan padahal tidak akurat. Mengecek jawaban AI bukan tanda tidak percaya, melainkan tanda berpikir kritis. Cocokkan dengan sumber yang sudah kamu baca sebelumnya.

**5. Revisi hasil**
Hasil AI adalah bahan mentah, bukan produk akhir. Sesuaikan konteks, tambah informasi yang kurang, potong bagian yang tidak perlu, dan susun ulang agar sesuai kebutuhanmu. Kamu yang paling tahu tujuan dan konteks pekerjaanmu.

**6. Membuat opini sendiri**
Ini tahap paling penting. Setelah melalui semua proses di atas, kamu punya bekal untuk membentuk opinimu sendiri — bukan sekadar mengulang jawaban AI, tapi hasil pemikiran yang didukung data dan pemahamanmu sendiri.

### Kartu Decoy (Jawaban Salah)

Kartu-kartu berikut adalah jebakan yang tidak boleh masuk ke dalam urutan:

- Langsung copy jawaban AI
- Skip mencari sumber
- Membuat prompt terlalu umum
- Langsung submit tugas
- Tidak membaca hasil AI
- Menggunakan jawaban pertama AI tanpa revisi

### Mekanik

- Drag bebas, percobaan ulang tidak terbatas
- Setiap kesalahan menyusun memotong 10 detik dari timer global
- Tidak ada sistem nyawa di game ini
- Setelah urutan benar tersusun, muncul bubble apresiasi (animasi Lottie)
- Dilanjutkan dengan halaman penjelasan tiap langkah secara animatif

---

## Game 2 — True or False

Pemain menjawab 7 pertanyaan dengan dua pilihan: **BENAR** atau **SALAH**. Tujuannya mengingatkan bahwa AI adalah alat bantu, bukan pengganti berpikir kritis.

### Daftar Soal & Jawaban

**Soal 1**
> "Apakah benar bahwa AI dapat digunakan untuk menggantikan proses verifikasi langsung ke database resmi Sinta?"

Jawaban: **SALAH**
Penjelasan: AI hanya sebagai alat bantu, bukan pengganti verifikasi resmi. Pemeriksaan Sinta pada jurnal lebih akurat dilakukan langsung melalui website resmi Sinta.

---

**Soal 2**
> "Apakah benar bahwa AI boleh membantu menerjemahkan atau memperbaiki bahasa tulisan, tetapi tidak boleh menggantikan proses membaca dan memahami literatur?"

Jawaban: **BENAR**
Penjelasan: Proses membaca dan memahami literatur adalah bagian penting dari proses belajar yang tidak bisa digantikan oleh AI.

---

**Soal 3**
> "Apakah benar bahwa AI boleh digunakan untuk membantu menyusun outline atau merangkum materi, asalkan isi akhir tetap dikembangkan oleh mahasiswa sendiri?"

Jawaban: **BENAR**
Penjelasan: AI adalah alat bantu, bukan pengganti usaha. Verifikasi dan pengembangan isi tetap harus dilakukan secara manual oleh pengguna.

---

**Soal 4**
> "Apakah benar bahwa hasil yang diberikan AI selalu akurat dan dapat diterima tanpa diverifikasi?"

Jawaban: **SALAH**
Penjelasan: AI bukan sumber mutlak. Setiap jawaban AI wajib diverifikasi ulang dengan sumber yang kredibel.

---

**Soal 5**
> "Apakah benar bahwa mahasiswa boleh menggunakan AI untuk eksplorasi ide, tetapi tetap berkewajiban untuk memahami dan mempertanggungjawabkan isi yang ditulis?"

Jawaban: **BENAR**
Penjelasan: AI adalah alat bantu untuk eksplorasi dan pengembangan ide, bukan pengganti kemampuan berpikir, memahami, dan mempertanggungjawabkan isi tulisan.

---

**Soal 6**
> "Apakah benar jika kita menggunakan AI versi gratis, kita sama sekali tidak mendapatkan hasil analisis data yang mendalam atau jawaban yang akurat untuk tugas kuliah?"

Jawaban: **SALAH**
Penjelasan: Keterbatasan fitur memang ada, tetapi AI versi gratis sudah lebih dari cukup jika digunakan secara bijak. Kuncinya ada pada efisiensi prompting, misalnya menjelaskan outline dahulu lalu meminta penjelasan per poin.

---

**Soal 7**
> "Apakah benar jika jawaban AI sudah terlihat sangat akademis dan meyakinkan, kita bisa langsung menyetujuinya tanpa ragu?"

Jawaban: **SALAH**
Penjelasan: Pengguna yang bijak tidak mendewakan AI. AI sering terlihat pintar padahal isinya keliru. Jadikan jawaban AI sebagai hipotesis awal yang wajib diuji menggunakan buku atau jurnal resmi.

### Mekanik

- 3 nyawa tersedia dari awal
- Jawaban salah: -5 poin dan -1 nyawa
- Jawaban benar 3x berturut-turut: +15 poin bonus (streak)
- Jika nyawa habis sebelum waktu selesai, skor dikunci dan game berakhir
- Soal diacak setiap sesi

---

## Tech Stack

| Library | Versi | Fungsi |
|---|---|---|
| React | ^18 | Framework utama |
| Vite | ^5 | Build tool & dev server |
| Framer Motion | ^11 | Animasi drag, spring, bounce, transisi antar game |
| Lottie React | ^2 | Bubble apresiasi setelah puzzle selesai |
| canvas-confetti | ^1 | Efek confetti saat leaderboard reveal |
| Tailwind CSS | ^3 | Styling dan layout |
| Zustand | ^4 | State management (skor, nyawa, timer, progress) |

---

## Animasi per Halaman

| Halaman | Animasi | Library |
|---|---|---|
| Puzzle Drag & Drop | Drag bouncy, rotate saat drag, snap ke slot | Framer Motion Reorder |
| Bubble apresiasi | Animasi karakter/ikon setelah puzzle selesai | Lottie React |
| Penjelasan urutan | Slide masuk tiap poin satu per satu | Framer Motion AnimatePresence |
| True or False | Flip card soal, shake merah kalau salah | Framer Motion |
| Nyawa habis | Heartbreak + fade out | Framer Motion + CSS |
| Timer < 30 detik | Pulse merah pada angka timer | CSS keyframes |
| Leaderboard reveal | Nama muncul stagger bawah ke atas + confetti | Framer Motion + canvas-confetti |

---

## Struktur Folder

```
src/
├── components/
│   ├── Timer.jsx                  ← countdown global
│   ├── LivesDisplay.jsx           ← tampilan nyawa
│   └── Leaderboard.jsx            ← reveal di akhir sesi
├── games/
│   ├── PuzzleDragDrop/
│   │   ├── index.jsx              ← main game component
│   │   ├── DraggableCard.jsx      ← kartu draggable
│   │   ├── ExplanationPage.jsx    ← penjelasan tiap langkah
│   │   └── data.js                ← data kartu benar & decoy
│   └── TrueOrFalse/
│       ├── index.jsx
│       ├── QuestionCard.jsx
│       └── questions.js           ← data soal, jawaban & penjelasan
├── store/
│   └── gameStore.js               ← zustand: skor, nyawa, timer, progress
├── assets/
│   └── animations/
│       └── appreciation.json      ← file lottie dari lottiefiles.com
└── App.jsx                        ← routing antar game & leaderboard
```

---

## Format Data Soal

```js
// src/games/TrueOrFalse/questions.js
export const questions = [
  {
    id: 1,
    text: "AI dapat digunakan untuk menggantikan proses verifikasi langsung ke database resmi Sinta?",
    answer: false,
    explanation: "AI hanya sebagai alat bantu, bukan pengganti verifikasi resmi."
  },
  {
    id: 2,
    text: "AI boleh membantu menerjemahkan tulisan, tetapi tidak boleh menggantikan proses membaca literatur?",
    answer: true,
    explanation: "Proses membaca dan memahami literatur adalah bagian penting dari proses belajar."
  },
  // ...
]
```

---

## Format Data Puzzle

```js
// src/games/PuzzleDragDrop/data.js
export const correctOrder = [
  { id: 1, text: "Menentukan tujuan" },
  { id: 2, text: "Mencari sumber" },
  { id: 3, text: "Membuat prompt" },
  { id: 4, text: "Mengecek jawaban AI" },
  { id: 5, text: "Revisi hasil" },
  { id: 6, text: "Membuat opini sendiri" },
]

export const decoyCards = [
  { id: 7, text: "Langsung copy jawaban AI" },
  { id: 8, text: "Skip mencari sumber" },
  { id: 9, text: "Membuat prompt terlalu umum" },
  { id: 10, text: "Langsung submit tugas" },
  { id: 11, text: "Tidak membaca hasil AI" },
  { id: 12, text: "Menggunakan jawaban pertama AI tanpa revisi" },
]
```

---

## Instalasi

```bash
git clone https://github.com/username/literasi-digital-game
cd literasi-digital-game
npm install
npm run dev
```

### Install dependencies manual

```bash
npm install framer-motion lottie-react canvas-confetti zustand
npm install -D tailwindcss @tailwindcss/vite
```

---

## Build & Deployment

```bash
npm run build     # output ke folder /dist
npm run preview   # preview build secara lokal
```

Deploy ke **Vercel** atau **Netlify** cukup dengan menghubungkan GitHub repository atau drag-and-drop folder `/dist`.

Tidak memerlukan backend. Semua state berjalan di sisi client (localStorage).

> Jika event membutuhkan leaderboard multi-device secara real-time, tambahkan integrasi **Firebase Realtime Database** atau **Supabase** pada `gameStore.js`.

---

## Lisensi

MIT License — bebas digunakan dan dimodifikasi untuk keperluan edukasi.
```