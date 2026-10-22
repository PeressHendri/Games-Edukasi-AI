// ── Correct step order ──────────────────────────────────────────────
export const CORRECT_ORDER = [
  { id:1, text:'Menentukan tujuan',     icon:'🎯', color:'#4F46E5', glow:'rgba(79,70,229,.45)' },
  { id:2, text:'Mencari sumber',        icon:'📖', color:'#0891B2', glow:'rgba(8,145,178,.45)' },
  { id:3, text:'Membuat prompt',        icon:'✍️', color:'#6366F1', glow:'rgba(99,102,241,.45)' },
  { id:4, text:'Mengecek jawaban AI',   icon:'🔍', color:'#06B6D4', glow:'rgba(6,182,212,.45)' },
  { id:5, text:'Revisi hasil',          icon:'📝', color:'#A54100', glow:'rgba(165,65,0,.45)' },
  { id:6, text:'Membuat opini sendiri', icon:'💡', color:'#C2410C', glow:'rgba(194,65,12,.45)' },
]

// ── Decoy cards (wrong choices) ──────────────────────────────────────
export const DECOY_CARDS = [
  { id:7,  text:'Langsung copy jawaban AI',                    icon:'🚫', color:'#4B5563', isDecoy:true },
  { id:8,  text:'Skip mencari sumber',                         icon:'⏭️', color:'#4B5563', isDecoy:true },
  { id:9,  text:'Membuat prompt terlalu umum',                 icon:'😵', color:'#4B5563', isDecoy:true },
  { id:10, text:'Langsung submit tugas',                       icon:'💨', color:'#4B5563', isDecoy:true },
  { id:11, text:'Tidak membaca hasil AI',                      icon:'🙈', color:'#4B5563', isDecoy:true },
  { id:12, text:'Menggunakan jawaban pertama AI tanpa revisi', icon:'🤖', color:'#4B5563', isDecoy:true },
]

// ── Per-step explanations ─────────────────────────────────────────────
export const STEP_EXPLANATIONS = [
  { step:1, title:'Menentukan tujuan',     icon:'🎯', color:'#4F46E5',
    text:'Tujuan adalah kompas. Tanpa tujuan yang jelas, langkah berikutnya menjadi tidak terarah — sumber yang dicari tidak relevan, prompt yang dibuat kurang tepat, dan sulit menilai apakah jawaban AI sesuai kebutuhan atau tidak.' },
  { step:2, title:'Mencari sumber',        icon:'📖', color:'#0891B2',
    text:'Sebelum bertanya ke AI, kamu perlu punya gambaran dan konteks dasar. Dengan mencari sumber terlebih dahulu, kamu bisa menilai apakah jawaban AI akurat, relevan, atau keliru. Melewatkan langkah ini memicu ketergantungan buta pada AI.' },
  { step:3, title:'Membuat prompt',        icon:'✍️', color:'#6366F1',
    text:'Prompt yang baik lahir dari tujuan yang jelas dan pengetahuan dasar. Prompt adalah jembatan antara pikiranmu dan kemampuan AI. Semakin spesifik dan kontekstual promptmu, semakin relevan jawaban yang kamu dapatkan.' },
  { step:4, title:'Mengecek jawaban AI',   icon:'🔍', color:'#06B6D4',
    text:'AI bisa saja salah, bias, atau memberikan informasi yang terlihat meyakinkan padahal tidak akurat. Mengecek jawaban AI bukan tanda tidak percaya, melainkan tanda berpikir kritis. Cocokkan dengan sumber yang sudah kamu baca sebelumnya.' },
  { step:5, title:'Revisi hasil',          icon:'📝', color:'#A54100',
    text:'Hasil AI adalah bahan mentah, bukan produk akhir. Sesuaikan konteks, tambah informasi yang kurang, potong bagian yang tidak perlu, dan susun ulang agar sesuai kebutuhanmu. Kamu yang paling tahu tujuan dan konteks pekerjaanmu.' },
  { step:6, title:'Membuat opini sendiri', icon:'💡', color:'#C2410C',
    text:'Ini tahap paling penting. Setelah melalui semua proses di atas, kamu punya bekal untuk membentuk opinimu sendiri — bukan sekadar mengulang jawaban AI, tapi hasil pemikiran yang didukung data dan pemahamanmu sendiri.' },
]
