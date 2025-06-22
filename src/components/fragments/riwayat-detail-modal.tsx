import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Brain, Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AnalysisData {
  id: number
  date: string
  time: string
  status: string
  statusColor: string
  icon: any
  summary: string
  details: {
    heartRisk: string
    bloodPressure: string
    cholesterol: string
    recommendations: string[]
  }
}

interface RiwayatDetailModalProps {
  analysis: AnalysisData | null
  isOpen: boolean
  onClose: () => void
}

const questionsAndAnswers = [
  { label: "Jenis Kelamin", value: "Laki-laki" },
  { label: "Usia", value: "35 tahun" },
  { label: "Berat Badan", value: "75 kg" },
  { label: "Tinggi Badan", value: "175 cm" },
  { label: "Tingkat Aktivitas", value: "Sedang" },
  { label: "Tekanan Darah Sistolik", value: "130 mmHg" },
  { label: "Kolesterol Total", value: "220 mg/dL" },
  { label: "Gula Darah Puasa", value: "95 mg/dL" },
  { label: "Detak Jantung Istirahat", value: "72 bpm" },
  { label: "Status Merokok", value: "Mantan Perokok" },
  { label: "Riwayat Keluarga Penyakit Jantung", value: "Ada" },
  { label: "Riwayat Diabetes", value: "Tidak" },
  { label: "Tingkat Stress", value: "Sedang" },
  { label: "Jam Tidur per Hari", value: "7 jam" },
  { label: "Frekuensi Olahraga per Minggu", value: "3 kali" },
]

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 50 },
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export function RiwayatDetailModal({ analysis, isOpen, onClose }: RiwayatDetailModalProps) {
  if (!analysis) return null

  const getStatusIcon = () => {
    switch (analysis.statusColor) {
      case "emerald":
        return <CheckCircle className="h-6 w-6 text-emerald-600" />
      case "amber":
        return <AlertTriangle className="h-6 w-6 text-amber-600" />
      case "red":
        return <TrendingUp className="h-6 w-6 text-red-600" />
      default:
        return <CheckCircle className="h-6 w-6 text-emerald-600" />
    }
  }

  const getStatusBadge = () => {
    const colorClasses = {
      emerald: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      amber: "bg-amber-100 text-amber-700 hover:bg-amber-200",
      red: "bg-red-100 text-red-700 hover:bg-red-200",
    }

    return <Badge className={colorClasses[analysis.statusColor as keyof typeof colorClasses]}>{analysis.status}</Badge>
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <Card className="rounded-2xl shadow-xl border-0 bg-white">
              {/* Header */}
              <CardHeader className="relative p-6 bg-gradient-to-r from-slate-50 to-blue-50/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-white/80"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-start gap-4 pr-12">
                  <div className={`p-3 rounded-xl bg-${analysis.statusColor}-100`}>{getStatusIcon()}</div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-slate-800 mb-2">Detail Analisis Kesehatan</CardTitle>
                    <div className="flex items-center gap-4 text-slate-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {analysis.date} • {analysis.time}
                        </span>
                      </div>
                      {getStatusBadge()}
                    </div>
                    <CardDescription className="text-slate-700">{analysis.summary}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                {/* Questionnaire Answers */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Data Analisis</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questionsAndAnswers.map((qa, index) => (
                      <motion.div
                        key={qa.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.02 }}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200/60"
                      >
                        <p className="text-sm font-medium text-slate-600 mb-1">{qa.label}</p>
                        <p className="text-slate-800 font-semibold">{qa.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <Separator className="bg-slate-200" />

                {/* AI Analysis Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Analisis AI</h3>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 rounded-lg bg-white/60 border border-white/80">
                        <p className="text-sm text-slate-600 mb-1">Risiko Jantung</p>
                        <p className="text-2xl font-bold text-slate-800">{analysis.details.heartRisk}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-white/60 border border-white/80">
                        <p className="text-sm text-slate-600 mb-1">Tekanan Darah</p>
                        <p className="text-lg font-semibold text-slate-800">{analysis.details.bloodPressure}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-white/60 border border-white/80">
                        <p className="text-sm text-slate-600 mb-1">Kolesterol</p>
                        <p className="text-lg font-semibold text-slate-800">{analysis.details.cholesterol}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/80 border border-white">
                      <h4 className="font-semibold text-slate-800 mb-2">Penjelasan AI</h4>
                      <p className="text-slate-700 leading-relaxed">
                        Berdasarkan data yang Anda berikan, sistem AI mendeteksi beberapa faktor risiko yang perlu
                        diperhatikan. Riwayat keluarga dengan penyakit jantung dan status mantan perokok meningkatkan
                        risiko kardiovaskular. Namun, tingkat aktivitas fisik yang sedang dan jam tidur yang cukup
                        merupakan faktor positif untuk kesehatan jantung Anda.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <Separator className="bg-slate-200" />

                {/* Personalized Recommendations */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Lightbulb className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Rekomendasi Personal</h3>
                  </div>

                  <div className="space-y-4">
                    {analysis.details.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200/50"
                      >
                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700 leading-relaxed">{recommendation}</p>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="p-4 rounded-xl bg-amber-50 border border-amber-200/50"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-1">Peringatan Penting</h4>
                          <p className="text-amber-700 text-sm leading-relaxed">
                            Hasil analisis ini bersifat informatif dan tidak menggantikan konsultasi medis profesional.
                            Segera konsultasikan dengan dokter jika mengalami gejala yang mengkhawatirkan.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
