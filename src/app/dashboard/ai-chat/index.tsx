import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Heart, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: 1,
    content:
      "Halo! Saya adalah asisten AI kesehatan Anda. Saya siap membantu menjawab pertanyaan tentang kesehatan, memberikan tips, atau membahas hasil analisis Anda. Ada yang bisa saya bantu hari ini?",
    sender: "ai",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
]

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Terima kasih atas pertanyaan Anda. Berdasarkan data kesehatan terbaru, saya merekomendasikan untuk menjaga pola makan seimbang dan rutin berolahraga.",
        "Saya melihat dari analisis terakhir bahwa kondisi kesehatan Anda cukup baik. Namun, ada beberapa area yang perlu perhatian lebih.",
        "Untuk menjaga kesehatan jantung, penting untuk mengurangi konsumsi garam dan meningkatkan aktivitas fisik. Apakah Anda sudah menerapkan pola hidup sehat?",
        "Berdasarkan riwayat kesehatan Anda, saya sarankan untuk melakukan pemeriksaan rutin setiap 3 bulan. Apakah ada gejala khusus yang ingin Anda konsultasikan?",
      ]

      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="p-6 h-screen flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Chat AI Kesehatan
            </h1>
            <p className="text-slate-600">Konsultasi dengan asisten AI untuk pertanyaan kesehatan Anda</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col"
      >
        <Card className="flex-1 rounded-2xl shadow-md border-0 flex flex-col overflow-hidden">
          {/* Messages */}
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-blue-600">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center gap-1 mt-2 opacity-70">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>

                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 bg-slate-200">
                      <AvatarFallback className="bg-slate-200 text-slate-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-3 justify-start"
                >
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-blue-600">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200/60">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pertanyaan kesehatan Anda..."
                  className="rounded-xl border-slate-200 focus:border-emerald-500 resize-none"
                  disabled={isTyping}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              AI dapat membuat kesalahan. Selalu konsultasikan dengan dokter untuk masalah kesehatan serius.
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}