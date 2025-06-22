import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart, Activity, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useNavigate } from "react-router-dom"

// Types
interface FormData {
  age: string
  gender: string
  smokingStatus: string
  riskRegion: string
  diabetesHistory: string
  diabetesAge: string
  healthProfile: {
    sbp: HealthParameter
    totalCholesterol: HealthParameter
    hdlCholesterol: HealthParameter
    hba1c?: HealthParameter
    serumCreatinine?: HealthParameter
  }
}

interface HealthParameter {
  method: "manual" | "estimate" | ""
  manualValue: string
  proxyAnswers: Record<string, any>
  completed: boolean
}

const initialFormData: FormData = {
  age: "",
  gender: "",
  smokingStatus: "",
  riskRegion: "",
  diabetesHistory: "",
  diabetesAge: "",
  healthProfile: {
    sbp: { method: "", manualValue: "", proxyAnswers: {}, completed: false },
    totalCholesterol: { method: "", manualValue: "", proxyAnswers: {}, completed: false },
    hdlCholesterol: { method: "", manualValue: "", proxyAnswers: {}, completed: false },
  },
}

const pageVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function AnalisisPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("")

  const loadingTexts = [
    "Menganalisis profil gaya hidup Anda...",
    "Menjalankan kalkulasi risiko klinis...",
    "Menghubungkan dengan AI 'Kardia' untuk personalisasi...",
    "Membangun laporan akhir Anda... Hampir selesai!",
  ]

  // Cycle through loading texts
  useEffect(() => {
    if (isLoading) {
      let index = 0
      setLoadingText(loadingTexts[0])
      const interval = setInterval(() => {
        index = (index + 1) % loadingTexts.length
        setLoadingText(loadingTexts[index])
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Add diabetes-specific fields when diabetes history is "Ya"
  useEffect(() => {
    if (formData.diabetesHistory === "Ya") {
      setFormData((prev) => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          hba1c: { method: "", manualValue: "", proxyAnswers: {}, completed: false },
          serumCreatinine: { method: "", manualValue: "", proxyAnswers: {}, completed: false },
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        healthProfile: {
          sbp: prev.healthProfile.sbp,
          totalCholesterol: prev.healthProfile.totalCholesterol,
          hdlCholesterol: prev.healthProfile.hdlCholesterol,
        },
      }))
    }
  }, [formData.diabetesHistory])

  const isStep1Complete = () => {
    const required = ["age", "gender", "smokingStatus", "riskRegion", "diabetesHistory"]
    const basicComplete = required.every((field) => formData[field as keyof FormData])

    if (formData.diabetesHistory === "Ya") {
      return basicComplete && formData.diabetesAge
    }
    return basicComplete
  }

  const isStep2Complete = () => {
    const requiredParams = ["sbp", "totalCholesterol", "hdlCholesterol"]
    let allComplete = requiredParams.every(
      (param) => formData.healthProfile[param as keyof typeof formData.healthProfile]?.completed,
    )

    if (formData.diabetesHistory === "Ya") {
      allComplete =
        allComplete &&
        (formData.healthProfile.hba1c?.completed ?? false) &&
        (formData.healthProfile.serumCreatinine?.completed ?? false)
    }

    return allComplete
  }

  const handleNext = () => {
    if (currentStep === 1 && isStep1Complete()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && isStep2Complete()) {
      setCurrentStep(3)
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 12000))

    setIsLoading(false)
    navigate("/dashboard")
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateHealthParameter = (param: string, updates: Partial<HealthParameter>) => {
    setFormData((prev) => ({
      ...prev,
      healthProfile: {
        ...prev.healthProfile,
        [param]: {
          ...prev.healthProfile[param as keyof typeof prev.healthProfile],
          ...updates,
        },
      },
    }))
  }

  if (currentStep === 3) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8"
      >
        <Card className="max-w-md w-full bg-white shadow-md rounded-2xl border border-gray-200">
          <CardContent className="p-4 md:p-6 lg:p-8 text-center space-y-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center"
            >
              <Heart className="h-10 w-10 text-white" fill="currentColor" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-800">Memproses Analisis Anda</h2>
              <motion.p
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-slate-600"
              >
                {loadingText}
              </motion.p>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 12, ease: "easeInOut" }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white px-6 md:px-8"
    >
      <div className="max-w-full mx-auto space-y-6 md:space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Langkah {currentStep} dari 3: {currentStep === 1 ? "Informasi Dasar Anda" : "Profil Kesehatan Anda"}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {currentStep === 1
              ? "Informasi ini penting untuk personalisasi dan pemilihan model analisis yang paling sesuai untuk Anda."
              : 'Silakan masukkan angkanya jika Anda tahu. Jika tidak, pilih "Bantu Estimasi" dan kami akan memandunya.'}
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center space-x-4"
        >
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step <= currentStep ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? "bg-gradient-to-r from-blue-500 to-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1Form
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              isComplete={isStep1Complete()}
            />
          )}
          {currentStep === 2 && (
            <Step2Form
              formData={formData}
              updateHealthParameter={updateHealthParameter}
              onNext={handleNext}
              onBack={handleBack}
              isComplete={isStep2Complete()}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Step 1 Component
function Step1Form({ formData, updateFormData, onNext, onBack, isComplete }: any) {
  return (
    <motion.div
      key="step1"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-gray-200">
        <CardContent className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Age */}
          <div className="space-y-3">
            <Label htmlFor="age" className="text-sm font-medium text-gray-700">
              Usia Anda
            </Label>
            <div className="relative">
              <Input
                id="age"
                type="number"
                min="40"
                max="100"
                value={formData.age}
                onChange={(e) => updateFormData("age", e.target.value)}
                className="rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 h-10 md:h-12 text-base"
                placeholder="Masukkan usia"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">tahun</span>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Jenis Kelamin Biologis</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => updateFormData("gender", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Laki-laki" id="male" />
                <Label htmlFor="male" className="cursor-pointer text-sm font-medium text-gray-700">
                  Laki-laki
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Perempuan" id="female" />
                <Label htmlFor="female" className="cursor-pointer text-sm font-medium text-gray-700">
                  Perempuan
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Smoking Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Status Merokok Anda Saat Ini</Label>
            <RadioGroup
              value={formData.smokingStatus}
              onValueChange={(value) => updateFormData("smokingStatus", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Perokok aktif" id="smoker" />
                <Label htmlFor="smoker" className="cursor-pointer text-sm font-medium text-gray-700">
                  Perokok aktif (termasuk vape)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Bukan perokok" id="nonsmoker" />
                <Label htmlFor="nonsmoker" className="cursor-pointer text-sm font-medium text-gray-700">
                  Bukan perokok saat ini
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Risk Region */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Wilayah Risiko Geografis Anda</Label>
            <Select value={formData.riskRegion} onValueChange={(value) => updateFormData("riskRegion", value)}>
              <SelectTrigger className="rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 h-10 md:h-12 text-base">
                <SelectValue placeholder="Pilih wilayah risiko" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Risiko Rendah">Risiko Rendah</SelectItem>
                <SelectItem value="Risiko Sedang">Risiko Sedang</SelectItem>
                <SelectItem value="Risiko Tinggi">Risiko Tinggi</SelectItem>
                <SelectItem value="Risiko Sangat Tinggi">Risiko Sangat Tinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Diabetes History */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Apakah Anda memiliki riwayat Diabetes?</Label>
            <RadioGroup
              value={formData.diabetesHistory}
              onValueChange={(value) => updateFormData("diabetesHistory", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Ya" id="diabetes-yes" />
                <Label htmlFor="diabetes-yes" className="cursor-pointer text-sm font-medium text-gray-700">
                  Ya
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Tidak" id="diabetes-no" />
                <Label htmlFor="diabetes-no" className="cursor-pointer text-sm font-medium text-gray-700">
                  Tidak
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Diabetes Age */}
          <AnimatePresence>
            {formData.diabetesHistory === "Ya" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <Label htmlFor="diabetesAge" className="text-sm font-medium text-gray-700">
                  Pada usia berapa Anda didiagnosis?
                </Label>
                <div className="relative">
                  <Input
                    id="diabetesAge"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.diabetesAge}
                    onChange={(e) => updateFormData("diabetesAge", e.target.value)}
                    className="rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 h-10 md:h-12 text-base"
                    placeholder="Masukkan usia diagnosis"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">tahun</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={true}
              className="bg-white text-blue-500 border border-blue-500 hover:bg-blue-50 font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide opacity-50 cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            <Button
              onClick={onNext}
              disabled={!isComplete}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide disabled:opacity-50"
            >
              Lanjut
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Step 2 Component
function Step2Form({ formData, updateHealthParameter, onNext, onBack, isComplete }: any) {
  const healthParameters = [
    {
      key: "sbp",
      title: "1. Tekanan Darah Sistolik (SBP)",
      unit: "mmHg",
      proxyQuestions: [
        {
          key: "familyHistory",
          label: "Riwayat hipertensi keluarga?",
          type: "radio",
          options: ["Ya", "Tidak", "Tidak Tahu"],
        },
        {
          key: "sleepPattern",
          label: "Pola tidur?",
          type: "radio",
          options: ["Nyenyak", "Tidak Nyenyak", "Insomnia"],
        },
        {
          key: "foodConsumption",
          label: "Konsumsi makanan sering?",
          type: "checkbox",
          options: ["Mie instan", "Daging olahan", "Camilan asin"],
        },
        {
          key: "stressResponse",
          label: "Respons saat stres?",
          type: "radio",
          options: ["Jantung berdebar", "Sakit kepala", "Tidak ada"],
        },
        {
          key: "bodyShape",
          label: "Bentuk tubuh?",
          type: "radio",
          options: ["Perut buncit", "Gemuk merata", "Ideal"],
        },
        {
          key: "exerciseFreq",
          label: "Frekuensi olahraga?",
          type: "radio",
          options: ["Rutin & Intens", "Rutin ringan", "Jarang"],
        },
      ],
    },
    {
      key: "totalCholesterol",
      title: "2. Kolesterol Total",
      unit: "mmol/L",
      proxyQuestions: [
        {
          key: "familyHistory",
          label: "Riwayat kolesterol / penyakit jantung keluarga?",
          type: "radio",
          options: ["Ya", "Tidak", "Tidak Tahu"],
        },
        {
          key: "cookingOil",
          label: "Minyak masak yang dominan?",
          type: "radio",
          options: ["Sawit", "Jagung", "Zaitun"],
        },
        {
          key: "exerciseType",
          label: "Jenis olahraga dominan?",
          type: "radio",
          options: ["Angkat beban", "Lari", "Jalan kaki", "Tidak pernah"],
        },
        {
          key: "fishConsumption",
          label: "Konsumsi ikan laut berlemak?",
          type: "radio",
          options: ["Sering", "Kadang", "Jarang"],
        },
        {
          key: "xanthelasma",
          label: "Xanthelasma?",
          type: "radio",
          options: ["Ya", "Tidak", "Tidak yakin"],
        },
      ],
    },
    {
      key: "hdlCholesterol",
      title: "3. HDL Kolesterol",
      unit: "mmol/L",
      proxyQuestions: [
        {
          key: "familyHistory",
          label: "Riwayat kolesterol / penyakit jantung keluarga?",
          type: "radio",
          options: ["Ya", "Tidak", "Tidak Tahu"],
        },
        {
          key: "cookingOil",
          label: "Minyak masak yang dominan?",
          type: "radio",
          options: ["Sawit", "Jagung", "Zaitun"],
        },
        {
          key: "exerciseType",
          label: "Jenis olahraga dominan?",
          type: "radio",
          options: ["Angkat beban", "Lari", "Jalan kaki", "Tidak pernah"],
        },
        {
          key: "fishConsumption",
          label: "Konsumsi ikan laut berlemak?",
          type: "radio",
          options: ["Sering", "Kadang", "Jarang"],
        },
      ],
    },
  ]

  // Add diabetes-specific parameters
  if (formData.diabetesHistory === "Ya") {
    healthParameters.push(
      {
        key: "hba1c",
        title: "4. HbA1c",
        unit: "%",
        proxyQuestions: [
          {
            key: "bloodSugarCheck",
            label: "Frekuensi cek gula darah?",
            type: "radio",
            options: ["Sesuai target", "Di atas target", "Jarang", "Tidak pernah"],
          },
          {
            key: "medicationCompliance",
            label: "Kepatuhan obat & diet?",
            type: "radio",
            options: ["Disiplin keduanya", "Disiplin obat saja", "Lupa obat", "Kurang disiplin keduanya"],
          },
        ],
      },
      {
        key: "serumCreatinine",
        title: "5. Serum Creatinine",
        unit: "μmol/L",
        proxyQuestions: [
          {
            key: "bodyType",
            label: "Tipe tubuh?",
            type: "radio",
            options: ["Sangat berotot", "Atletis", "Rata-rata", "Kurus"],
          },
          {
            key: "diabetesComplications",
            label: "Komplikasi diabetes (mata/syaraf)?",
            type: "radio",
            options: ["Ya", "Tidak", "Tidak tahu"],
          },
          {
            key: "foamyUrine",
            label: "Urine berbusa?",
            type: "radio",
            options: ["Sering", "Kadang", "Tidak"],
          },
          {
            key: "swelling",
            label: "Pembengkakan di mata/kaki?",
            type: "radio",
            options: ["Sering", "Kadang", "Tidak"],
          },
          {
            key: "painMedication",
            label: "Konsumsi obat nyeri non-paracetamol?",
            type: "radio",
            options: ["Sering", "Cukup", "Jarang"],
          },
        ],
      },
    )
  }

  return (
    <motion.div
      key="step2"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {healthParameters.map((param, index) => (
        <HealthParameterCard
          key={param.key}
          parameter={param}
          data={formData.healthProfile[param.key as keyof typeof formData.healthProfile]}
          onUpdate={(updates: Partial<HealthParameter>) => updateHealthParameter(param.key, updates)}
          index={index}
          total={healthParameters.length}
        />
      ))}

      {/* Navigation */}
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-gray-200">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white text-blue-500 border border-blue-500 hover:bg-blue-50 font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            <Button
              onClick={onNext}
              disabled={!isComplete}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide disabled:opacity-50"
            >
              Selesai & Lihat Hasil Analisis Saya
              <Activity className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Health Parameter Card Component
function HealthParameterCard({ parameter, data, onUpdate, index, total }: any) {
  const handleMethodChange = (method: "manual" | "estimate") => {
    onUpdate({
      method,
      manualValue: "",
      proxyAnswers: {},
      completed: false,
    })
  }

  const handleManualValueChange = (value: string) => {
    onUpdate({
      manualValue: value,
      completed: value.trim() !== "",
    })
  }

  const handleProxyAnswerChange = (questionKey: string, value: any) => {
    const newProxyAnswers = { ...data.proxyAnswers, [questionKey]: value }
    const allAnswered = parameter.proxyQuestions.every(
      (q: any) => newProxyAnswers[q.key] !== undefined && newProxyAnswers[q.key] !== "",
    )

    onUpdate({
      proxyAnswers: newProxyAnswers,
      completed: allAnswered,
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-800">{parameter.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {index + 1}/{total}
              </Badge>
              {data.completed && <CheckCircle className="h-5 w-5 text-emerald-500" />}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Method Selection */}
          <div className="flex gap-4">
            <Button
              variant={data.method === "manual" ? "default" : "outline"}
              onClick={() => handleMethodChange("manual")}
              className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 h-10 md:h-12 px-6 text-sm uppercase tracking-wide"
            >
              Saya Tahu Angkanya
            </Button>
            <Button
              variant={data.method === "estimate" ? "default" : "outline"}
              onClick={() => handleMethodChange("estimate")}
              className="flex-1 rounded-lg bg-white text-blue-500 border border-blue-500 hover:bg-blue-50 font-medium shadow-md hover:shadow-lg transition-all duration-300 h-10 md:h-12 px-6 text-sm uppercase tracking-wide"
            >
              Bantu Estimasi
            </Button>
          </div>

          {/* Manual Input */}
          <AnimatePresence>
            {data.method === "manual" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <Label className="text-sm font-medium text-gray-700">
                  Masukkan nilai {parameter.title.split(".")[1]}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={data.manualValue}
                    onChange={(e) => handleManualValueChange(e.target.value)}
                    className="rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 h-10 md:h-12 text-base"
                    placeholder="Masukkan nilai"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    {parameter.unit}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Proxy Questions */}
          <AnimatePresence>
            {data.method === "estimate" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {parameter.proxyQuestions.map((question: any, qIndex: number) => (
                  <motion.div
                    key={question.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: qIndex * 0.1 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm font-medium text-gray-700">{question.label}</Label>

                    {question.type === "radio" && (
                      <RadioGroup
                        value={data.proxyAnswers[question.key] || ""}
                        onValueChange={(value) => handleProxyAnswerChange(question.key, value)}
                        className="space-y-2"
                      >
                        {question.options.map((option: string) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${parameter.key}-${question.key}-${option}`} />
                            <Label
                              htmlFor={`${parameter.key}-${question.key}-${option}`}
                              className="cursor-pointer text-sm"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "checkbox" && (
                      <div className="space-y-2">
                        {question.options.map((option: string) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${parameter.key}-${question.key}-${option}`}
                              checked={(data.proxyAnswers[question.key] || []).includes(option)}
                              onCheckedChange={(checked) => {
                                const currentValues = data.proxyAnswers[question.key] || []
                                const newValues = checked
                                  ? [...currentValues, option]
                                  : currentValues.filter((v: string) => v !== option)
                                handleProxyAnswerChange(question.key, newValues)
                              }}
                            />
                            <Label
                              htmlFor={`${parameter.key}-${question.key}-${option}`}
                              className="cursor-pointer text-sm"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}