import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  HelpCircle,
  Search,
  User,
  BarChart3,
  History,
  CreditCard,
  MessageSquare,
  Shield,
  ChevronDown,
  Mail,
  Phone,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const faqCategories = [
  {
    id: "account",
    title: "Akun & Profil",
    description: "Pengaturan akun, profil, dan keamanan",
    icon: User,
    color: "emerald",
  },
  {
    id: "analysis",
    title: "Analisis Kesehatan",
    description: "Cara melakukan dan memahami analisis",
    icon: BarChart3,
    color: "blue",
  },
  {
    id: "history",
    title: "Riwayat",
    description: "Melihat dan mengelola riwayat analisis",
    icon: History,
    color: "purple",
  },
  {
    id: "subscription",
    title: "Langganan",
    description: "Paket berlangganan dan pembayaran",
    icon: CreditCard,
    color: "amber",
  },
  {
    id: "chat",
    title: "AI Chat",
    description: "Menggunakan fitur chat dengan AI",
    icon: MessageSquare,
    color: "green",
  },
  {
    id: "security",
    title: "Keamanan Data",
    description: "Privasi dan keamanan informasi",
    icon: Shield,
    color: "red",
  },
]

const topFaqs = [
  {
    id: 1,
    question: "Bagaimana cara melakukan analisis kesehatan?",
    answer:
      "Untuk melakukan analisis kesehatan, klik menu 'Analisis Baru' di sidebar. Anda akan diminta mengisi formulir 3 langkah dengan total 15 pertanyaan tentang kondisi kesehatan Anda. Setelah selesai, AI akan menganalisis data dan memberikan hasil dalam beberapa menit.",
  },
  {
    id: 2,
    question: "Apakah data kesehatan saya aman?",
    answer:
      "Ya, keamanan data Anda adalah prioritas utama kami. Semua data dienkripsi end-to-end dan disimpan di server yang memenuhi standar HIPAA. Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan eksplisit.",
  },
  {
    id: 3,
    question: "Bagaimana cara meningkatkan langganan ke Premium?",
    answer:
      "Anda dapat upgrade ke Premium melalui halaman Settings. Klik tombol 'Tingkatkan Plan Anda' dan pilih paket yang sesuai. Premium memberikan akses unlimited analisis, chat AI tanpa batas, dan fitur laporan detail.",
  },
  {
    id: 4,
    question: "Berapa lama hasil analisis akan tersedia?",
    answer:
      "Hasil analisis biasanya tersedia dalam 2-5 menit setelah Anda mengirimkan data. Anda akan menerima notifikasi dan dapat melihat hasilnya di halaman Riwayat. Untuk analisis yang lebih kompleks, prosesnya mungkin memakan waktu hingga 10 menit.",
  },
  {
    id: 5,
    question: "Bisakah saya berkonsultasi dengan dokter sungguhan?",
    answer:
      "Ya! Kami menyediakan fitur 'Hubungi Ahli' di mana Anda dapat menjadwalkan konsultasi online dengan dokter berlisensi. Tersedia berbagai spesialisasi seperti dokter umum, jantung, psikolog, dan ahli gizi.",
  },
  {
    id: 6,
    question: "Bagaimana cara menggunakan fitur Chat AI?",
    answer:
      "Fitur Chat AI dapat diakses melalui menu 'Chat AI' di sidebar. Anda dapat menanyakan pertanyaan tentang kesehatan, mendiskusikan hasil analisis, atau meminta saran gaya hidup sehat. AI akan memberikan respons berdasarkan data kesehatan Anda.",
  },
]

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaqId, setOpenFaqId] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  const filteredFaqs = topFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="p-6 space-y-12"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100"
          >
            <HelpCircle className="h-12 w-12 text-blue-600" />
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Pusat Bantuan
        </h1>
        <p className="text-lg text-slate-600">
          Temukan jawaban atas pertanyaan umum atau hubungi kami jika butuh bantuan lebih lanjut
        </p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-md mx-auto"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Cari bantuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-slate-200 focus:border-blue-500"
          />
        </motion.div>
      </motion.div>

      {/* FAQ Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kategori Bantuan</h2>
          <p className="text-slate-600">Pilih kategori yang sesuai dengan pertanyaan Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="rounded-2xl shadow-md border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center p-6">
                  <div
                    className={`mx-auto p-3 rounded-xl bg-${category.color}-100 mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <category.icon className={`h-8 w-8 text-${category.color}-600`} />
                  </div>
                  <CardTitle className="text-lg text-slate-800">{category.title}</CardTitle>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-slate-600">Jawaban untuk pertanyaan paling umum dari pengguna kami</p>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="rounded-2xl shadow-md border-0 hover:shadow-lg transition-all duration-300">
                <CardHeader
                  className={`cursor-pointer transition-colors rounded-t-2xl p-6 ${
                    openFaqId === faq.id ? "bg-blue-50/50" : "hover:bg-slate-50/50"
                  }`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className={`text-left text-lg transition-colors ${
                        openFaqId === faq.id ? "text-blue-700" : "text-slate-800"
                      }`}
                    >
                      {faq.question}
                    </CardTitle>
                    <motion.div
                      animate={{ rotate: openFaqId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    </motion.div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {openFaqId === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <CardContent className="pt-0 p-6 bg-blue-50/20">
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="text-slate-700 leading-relaxed"
                        >
                          {faq.answer}
                        </motion.p>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && searchQuery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-slate-500">Tidak ada hasil yang ditemukan untuk "{searchQuery}"</p>
          </motion.div>
        )}
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-r from-blue-50 to-emerald-50">
          <CardHeader className="text-center p-6">
            <CardTitle className="text-2xl text-slate-800 mb-2">Masih Butuh Bantuan?</CardTitle>
            <CardDescription className="text-lg">
              Tim support kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="rounded-xl border-0 bg-white/80 hover:bg-white transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-blue-100 w-fit mx-auto mb-4">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Email Support</h3>
                    <p className="text-sm text-slate-600 mb-4">support@healthai.com</p>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 rounded-xl">
                      Kirim Email
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="rounded-xl border-0 bg-white/80 hover:bg-white transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-emerald-100 w-fit mx-auto mb-4">
                      <Phone className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Live Chat</h3>
                    <p className="text-sm text-slate-600 mb-4">Respons dalam 5 menit</p>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl">
                      Mulai Chat
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/60 border border-white/80">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>
                  <strong>Jam Operasional:</strong> Senin - Jumat: 08:00 - 22:00 WIB | Sabtu - Minggu: 09:00 - 18:00 WIB
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}