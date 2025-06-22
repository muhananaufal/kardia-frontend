import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RiwayatDetailModal } from "@/components/fragments/riwayat-detail-modal"

const analysisHistory = [
  {
    id: 1,
    date: "2024-01-15",
    time: "14:30",
    status: "Risiko Rendah",
    statusColor: "emerald",
    icon: CheckCircle,
    summary: "Kondisi kesehatan baik, tidak ada indikator risiko tinggi",
    details: {
      heartRisk: "12%",
      bloodPressure: "Normal",
      cholesterol: "Baik",
      recommendations: ["Pertahankan pola makan sehat", "Lanjutkan olahraga rutin", "Kontrol kesehatan berkala"],
    },
  },
  {
    id: 2,
    date: "2024-01-10",
    time: "09:15",
    status: "Risiko Sedang",
    statusColor: "amber",
    icon: AlertTriangle,
    summary: "Beberapa indikator perlu perhatian, terutama tekanan darah",
    details: {
      heartRisk: "28%",
      bloodPressure: "Tinggi",
      cholesterol: "Batas Normal",
      recommendations: ["Kurangi konsumsi garam", "Olahraga kardio 30 menit/hari", "Konsultasi dokter dalam 2 minggu"],
    },
  },
  {
    id: 3,
    date: "2024-01-05",
    time: "16:45",
    status: "Risiko Tinggi",
    statusColor: "red",
    icon: TrendingUp,
    summary: "Perlu perhatian medis segera, beberapa faktor risiko tinggi",
    details: {
      heartRisk: "45%",
      bloodPressure: "Sangat Tinggi",
      cholesterol: "Tinggi",
      recommendations: ["Konsultasi dokter segera", "Mulai pengobatan hipertensi", "Diet rendah kolesterol ketat"],
    },
  },
]

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function HistoryPage() {
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<(typeof analysisHistory)[0] | null>(null)

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const getStatusBadge = (status: string, color: string) => {
    const colorClasses = {
      emerald: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      amber: "bg-amber-100 text-amber-700 hover:bg-amber-200",
      red: "bg-red-100 text-red-700 hover:bg-red-200",
    }

    return <Badge className={colorClasses[color as keyof typeof colorClasses]}>{status}</Badge>
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          Riwayat Analisis
        </h1>
        <p className="text-slate-600">Lihat semua hasil analisis kesehatan Anda sebelumnya</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-700 text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Total Analisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-700">12</p>
              <p className="text-sm text-emerald-600">Analisis selesai</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-700 text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Trend Risiko
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">↓ 15%</p>
              <p className="text-sm text-blue-600">Menurun bulan ini</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Analisis Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700">2</p>
              <p className="text-sm text-purple-600">hari yang lalu</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analysis History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Riwayat Analisis Terbaru</h2>

        <div className="space-y-4">
          {analysisHistory.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Collapsible>
                <Card className="rounded-2xl shadow-md border-0 hover:shadow-lg transition-all duration-300">
                  <CollapsibleTrigger asChild>
                    <CardHeader
                      className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-2xl"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl bg-${analysis.statusColor}-100`}>
                            <analysis.icon className={`h-5 w-5 text-${analysis.statusColor}-600`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-slate-800">Analisis {analysis.date}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {analysis.time} • {analysis.summary}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(analysis.status, analysis.statusColor)}
                          {expandedItems.includes(analysis.id) ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <AnimatePresence>
                    {expandedItems.includes(analysis.id) && (
                      <CollapsibleContent>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <h4 className="font-medium text-slate-800 mb-2">Risiko Jantung</h4>
                                <p className="text-2xl font-bold text-slate-700">{analysis.details.heartRisk}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <h4 className="font-medium text-slate-800 mb-2">Tekanan Darah</h4>
                                <p className="text-lg font-semibold text-slate-700">{analysis.details.bloodPressure}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <h4 className="font-medium text-slate-800 mb-2">Kolesterol</h4>
                                <p className="text-lg font-semibold text-slate-700">{analysis.details.cholesterol}</p>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/50">
                              <h4 className="font-medium text-slate-800 mb-3">Rekomendasi AI</h4>
                              <ul className="space-y-2">
                                {analysis.details.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Card>
              </Collapsible>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <RiwayatDetailModal
        analysis={selectedAnalysis}
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />
    </motion.div>
  )
}