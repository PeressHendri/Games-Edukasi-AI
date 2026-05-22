const CORRECT_ORDER = [
  { id: 1, text: "Menentukan tujuan", icon: "🎯", color: "#FF7043", glow: "rgba(255,112,67,0.4)" },
  { id: 2, text: "Mencari sumber", icon: "📖", color: "#FFA000", glow: "rgba(255,160,0,0.4)" },
  { id: 3, text: "Membuat prompt", icon: "✍️", color: "#26C6DA", glow: "rgba(38,198,218,0.4)" },
  { id: 4, text: "Mengecek jawaban AI", icon: "🔍", color: "#66BB6A", glow: "rgba(102,187,106,0.4)" },
  { id: 5, text: "Revisi hasil", icon: "📝", color: "#AB47BC", glow: "rgba(171,71,188,0.4)" },
  { id: 6, text: "Membuat opini sendiri", icon: "💡", color: "#EC407A", glow: "rgba(236,64,122,0.4)" },
];

const DECOY_CARDS = [
  { id: 7,  text: "Langsung copy jawaban AI",                   icon: "📋", color: "#546E7A", isDecoy: true },
  { id: 8,  text: "Skip mencari sumber",                        icon: "⏭️", color: "#546E7A", isDecoy: true },
  { id: 9,  text: "Membuat prompt terlalu umum",                icon: "🌫️", color: "#546E7A", isDecoy: true },
  { id: 10, text: "Langsung submit tugas",                      icon: "💨", color: "#546E7A", isDecoy: true },
  { id: 11, text: "Tidak membaca hasil AI",                     icon: "🙈", color: "#546E7A", isDecoy: true },
  { id: 12, text: "Menggunakan jawaban pertama AI tanpa revisi",icon: "🤖", color: "#546E7A", isDecoy: true },
];

const STEP_EXPLANATIONS = [
  { step:1, title:"Menentukan tujuan",      icon:"🎯", color:"#FF7043",
    text:"Tujuan adalah kompas. Tanpa tujuan yang jelas, langkah berikutnya menjadi tidak terarah — sumber yang dicari tidak relevan, prompt yang dibuat kurang tepat, dan sulit menilai apakah jawaban AI sesuai kebutuhan atau tidak." },
  { step:2, title:"Mencari sumber",         icon:"📖", color:"#FFA000",
    text:"Sebelum bertanya ke AI, kamu perlu punya gambaran dan konteks dasar tentang topik yang dibahas. Dengan mencari sumber terlebih dahulu, kamu bisa menilai apakah jawaban AI akurat, relevan, atau keliru. Melewatkan langkah ini memicu ketergantungan buta pada AI." },
  { step:3, title:"Membuat prompt",         icon:"✍️", color:"#26C6DA",
    text:"Prompt yang baik lahir dari tujuan yang jelas dan pengetahuan dasar yang sudah dimiliki. Prompt adalah jembatan antara pikiranmu dan kemampuan AI. Semakin spesifik dan kontekstual promptmu, semakin relevan jawaban yang kamu dapatkan." },
  { step:4, title:"Mengecek jawaban AI",    icon:"🔍", color:"#66BB6A",
    text:"AI bisa saja salah, bias, atau memberikan informasi yang terlihat meyakinkan padahal tidak akurat. Mengecek jawaban AI bukan tanda tidak percaya, melainkan tanda berpikir kritis. Cocokkan dengan sumber yang sudah kamu baca sebelumnya." },
  { step:5, title:"Revisi hasil",           icon:"📝", color:"#AB47BC",
    text:"Hasil AI adalah bahan mentah, bukan produk akhir. Sesuaikan konteks, tambah informasi yang kurang, potong bagian yang tidak perlu, dan susun ulang agar sesuai kebutuhanmu. Kamu yang paling tahu tujuan dan konteks pekerjaanmu." },
  { step:6, title:"Membuat opini sendiri",  icon:"💡", color:"#EC407A",
    text:"Ini tahap paling penting. Setelah melalui semua proses di atas, kamu punya bekal untuk membentuk opinimu sendiri — bukan sekadar mengulang jawaban AI, tapi hasil pemikiran yang didukung data dan pemahamanmu sendiri." },
];

// Exact questions from README
const QUESTIONS = [
  { id:1, answer:false,
    text:"Apakah benar bahwa AI dapat digunakan untuk menggantikan proses verifikasi langsung ke database resmi Sinta?",
    explanation:"AI hanya sebagai alat bantu, bukan pengganti verifikasi resmi. Pemeriksaan Sinta pada jurnal lebih akurat dilakukan langsung melalui website resmi Sinta." },
  { id:2, answer:true,
    text:"Apakah benar bahwa AI boleh membantu menerjemahkan atau memperbaiki bahasa tulisan, tetapi tidak boleh menggantikan proses membaca dan memahami literatur?",
    explanation:"Proses membaca dan memahami literatur adalah bagian penting dari proses belajar yang tidak bisa digantikan oleh AI." },
  { id:3, answer:true,
    text:"Apakah benar bahwa AI boleh digunakan untuk membantu menyusun outline atau merangkum materi, asalkan isi akhir tetap dikembangkan oleh mahasiswa sendiri?",
    explanation:"AI adalah alat bantu, bukan pengganti usaha. Verifikasi dan pengembangan isi tetap harus dilakukan secara manual oleh pengguna." },
  { id:4, answer:false,
    text:"Apakah benar bahwa hasil yang diberikan AI selalu akurat dan dapat diterima tanpa diverifikasi?",
    explanation:"AI bukan sumber mutlak. Setiap jawaban AI wajib diverifikasi ulang dengan sumber yang kredibel." },
  { id:5, answer:true,
    text:"Apakah benar bahwa mahasiswa boleh menggunakan AI untuk eksplorasi ide, tetapi tetap berkewajiban untuk memahami dan mempertanggungjawabkan isi yang ditulis?",
    explanation:"AI adalah alat bantu untuk eksplorasi dan pengembangan ide, bukan pengganti kemampuan berpikir, memahami, dan mempertanggungjawabkan isi tulisan." },
  { id:6, answer:false,
    text:"Apakah benar jika kita menggunakan AI versi gratis, kita sama sekali tidak mendapatkan hasil analisis data yang mendalam atau jawaban yang akurat untuk tugas kuliah?",
    explanation:"Keterbatasan fitur memang ada, tetapi AI versi gratis sudah lebih dari cukup jika digunakan secara bijak. Kuncinya ada pada efisiensi prompting, misalnya menjelaskan outline dahulu lalu meminta penjelasan per poin." },
  { id:7, answer:false,
    text:"Apakah benar jika jawaban AI sudah terlihat sangat akademis dan meyakinkan, kita bisa langsung menyetujuinya tanpa ragu?",
    explanation:"Pengguna yang bijak tidak mendewakan AI. AI sering terlihat pintar padahal isinya keliru. Jadikan jawaban AI sebagai hipotesis awal yang wajib diuji menggunakan buku atau jurnal resmi." },
];
