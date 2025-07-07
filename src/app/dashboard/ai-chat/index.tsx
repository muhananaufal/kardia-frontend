import { Suspense, useEffect, useRef, useState } from "react";
import {
    User,
    Send,
    Loader2,
    History,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Clock,
    Search,
    EllipsisVertical,
    CircleChevronLeft,
    Edit,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
    continueConversation,
    deleteConversation,
    fetchChatHistory,
    fetchConversation,
    newConversation,
    updateConversationTitle,
} from "@/hooks/api/ai-chat";
import { useAuth } from "@/provider/AuthProvider";
import ReplyRenderer from "@/components/fragments/reply-renderer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AIChatPage = () => {
    const auth = useAuth();
    const token = auth?.token;
    const [messages, setMessages] = useState<
        {
            id: string;
            role: "user" | "assistant";
            content: string | { reply_components: any };
        }[]
    >([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<
        { id: string; title: string; lastMessage: string; timestamp: string }[]
    >([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [searchHistory, setSearchHistory] = useState("");
    const [refreshHistory, setRefreshHistory] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingChat, setEditingChat] = useState<{ id: string; title: string } | null>(null)
    const [deletingChat, setDeletingChat] = useState<{ id: string; title: string } | null>(null)
    const [editTitle, setEditTitle] = useState("")

    console.log(chatHistory);

    // Auto scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }
                const res = await fetchChatHistory(token);
                const chats: ChatHistoryItem[] = res.data;
                setChatHistory(
                    chats.map((chat) => ({
                        id: chat.slug,
                        title: chat.title,
                        lastMessage: chat.last_message_snippet,
                        timestamp: chat.last_updated_human,
                    }))
                );
            } catch (err) {
                console.error("Error loading history:", err);
            }
        };

        loadChatHistory();
    }, [refreshHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            role: "user" as const,
            content: input,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            if (!token) {
                console.error("No authentication token found");
                return;
            }

            let res: any;
            if (!currentChatId) {
                res = await newConversation(token, { message: input });
                setCurrentChatId(res.conversation.slug);
                setRefreshHistory((prev) => prev + 1);
            } else {
                res = await continueConversation(token, currentChatId, input);
            }

            const assistantMessage = {
                id: Date.now().toString() + "ai",
                role: "assistant" as const,
                content: {
                    reply_components: res.reply.reply_components,
                },
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueChat = async (chatId: string) => {
        setCurrentChatId(chatId);
        setIsLoading(true);

        try {
            if (!token) {
                console.error("No authentication token found");
                return;
            }
            const { data }: { data: ChatConversationDetail } =
                await fetchConversation(token, chatId);
            const formattedMessages = data.messages.map((msg) => ({
                id: msg.id.toString(),
                role:
                    msg.role === "model"
                        ? ("assistant" as const)
                        : ("user" as const),
                content: msg.content, // tetap pakai original (string atau object reply_components)
            }));
            setMessages(formattedMessages);
        } catch (err) {
            console.error("Failed to load conversation:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        setInput("");
    };

    const handleEditClick = (chatId: string, currentTitle: string) => {
        setEditingChat({ id: chatId, title: currentTitle })
        setEditTitle(currentTitle)
        setIsEditModalOpen(true)
    }

    const handleDeleteClick = (chatId: string, title: string) => {
        setDeletingChat({ id: chatId, title })
        setIsDeleteModalOpen(true)
    }

    const handleSaveEdit = () => {
        if (!editingChat || !editTitle.trim()) return;

        try {
            if(!token) {
                console.error("No authentication token found");
                return;
            }

            const response = updateConversationTitle(token, editTitle, editingChat.id);
            response.then((res) => {
                setChatHistory((prev) =>
                    prev.map((chat) =>
                        chat.id === editingChat.id
                            ? { ...chat, title: editTitle }
                            : chat
                    )
                );
                
                setIsEditModalOpen(false);
                setEditingChat(null);
                setEditTitle("");
            }).catch((error) => {
                console.error("Failed to update chat title:", error);
            });
        } catch (error) {
            console.error("Error saving edit:", error);
        }
    }

    const handleConfirmDelete = () => {
        if (!deletingChat) return;

        try {
            if(!token) {
                console.error("No authentication token found");
                return;
            }

            const response = deleteConversation(token, deletingChat.id);
            response.then(() => {
                setChatHistory((prev) =>
                    prev.filter((chat) => chat.id !== deletingChat.id)
                );
                setIsDeleteModalOpen(false);
                setDeletingChat(null);
                setCurrentChatId(null);
                setMessages([]);
                setInput("");
            }).catch((error) => {
                console.error("Failed to delete chat:", error);
            });
        } catch (error) {
            console.error("Error confirming delete:", error);
        }
    }

    const handleCancelEdit = () => {
        setIsEditModalOpen(false)
        setEditingChat(null)
        setEditTitle("")
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
        setDeletingChat(null)
    }

    const filteredHistory = chatHistory.filter(
        (chat) =>
            chat.title.toLowerCase().includes(searchHistory.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchHistory.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <div className="flex">
                {/* Main Chat Area */}
                <div
                    className={`flex-1 flex flex-col transition-all duration-300 ${
                        isSidebarOpen ? "mr-80" : "mr-0"
                    }`}
                >
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-100 rounded-lg">
                                    <MessageSquare className="h-6 w-6 text-rose-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {currentChatId
                                            ? chatHistory.find(
                                                  (c) => c.id === currentChatId
                                              )?.title
                                            : "AI Health Assistant"}
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        {currentChatId
                                            ? "Melanjutkan percakapan"
                                            : "Konsultasi kesehatan dengan AI"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNewChat}
                                    className="text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat Baru
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setIsSidebarOpen(!isSidebarOpen)
                                    }
                                    className="text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                    {isSidebarOpen ? (
                                        <ChevronRight className="h-4 w-4" />
                                    ) : (
                                        <>
                                            <History className="h-4 w-4 mr-2" />
                                            <ChevronLeft className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <ScrollArea className="flex-1 p-6 mb-28">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {messages.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-center py-12"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            delay: 0.2,
                                            type: "spring",
                                            stiffness: 200,
                                        }}
                                        className="p-4 bg-rose-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                                    >
                                        <MessageSquare className="h-8 w-8 text-rose-600" />
                                    </motion.div>
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-lg font-semibold text-gray-900 mb-2"
                                    >
                                        {currentChatId
                                            ? "Lanjutkan Percakapan"
                                            : "Mulai Konsultasi"}
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-gray-600 mb-6"
                                    >
                                        {currentChatId
                                            ? "Anda dapat melanjutkan percakapan sebelumnya atau memulai topik baru"
                                            : "Tanyakan apa saja tentang kesehatan Anda kepada AI assistant"}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.6,
                                            staggerChildren: 0.1,
                                        }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto"
                                    >
                                        {[
                                            "Bagaimana cara menjaga kesehatan jantung?",
                                            "Apa saja gejala diabetes yang perlu diwaspadai?",
                                            "Rekomendasi olahraga untuk pemula",
                                            "Tips diet sehat untuk menurunkan berat badan",
                                        ].map((suggestion, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.7 + index * 0.1,
                                                }}
                                                whileHover={{
                                                    scale: 1.02,
                                                    y: -2,
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="p-4 h-auto text-left justify-start hover:bg-rose-50 hover:border-rose-200 w-full transition-all duration-200 cursor-pointer"
                                                    onClick={() =>
                                                        setInput(suggestion)
                                                    }
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-3 text-rose-500 flex-shrink-0" />
                                                    <span className="text-sm">
                                                        {suggestion}
                                                    </span>
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{
                                                opacity: 0,
                                                y: 50,
                                                scale: 0.8,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -50,
                                                scale: 0.8,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 20,
                                                delay: index * 0.1,
                                            }}
                                            className={`flex gap-4 ${
                                                message.role === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            {message.role === "assistant" && (
                                                <motion.div
                                                    initial={{
                                                        scale: 0,
                                                        rotate: -180,
                                                    }}
                                                    animate={{
                                                        scale: 1,
                                                        rotate: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index * 0.1 + 0.2,
                                                        type: "spring",
                                                    }}
                                                    className="p-2 bg-rose-100 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0"
                                                >
                                                    <MessageSquare className="h-5 w-5 text-rose-600" />
                                                </motion.div>
                                            )}
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                transition={{
                                                    delay: index * 0.1 + 0.3,
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                className={`max-w-3xl p-4 rounded-2xl ${
                                                    message.role === "user"
                                                        ? "bg-rose-500 text-white"
                                                        : "bg-white border border-gray-200 shadow-sm"
                                                }`}
                                            >
                                                {typeof message.content ===
                                                "string" ? (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{
                                                            delay:
                                                                index * 0.1 +
                                                                0.4,
                                                        }}
                                                        className="text-sm leading-relaxed whitespace-pre-wrap"
                                                    >
                                                        {message.content}
                                                    </motion.p>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{
                                                            delay:
                                                                index * 0.1 +
                                                                0.4,
                                                        }}
                                                        className="text-sm leading-relaxed"
                                                    >
                                                        <ReplyRenderer
                                                            components={
                                                                message.content
                                                                    .reply_components
                                                            }
                                                        />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                            {message.role === "user" && (
                                                <motion.div
                                                    initial={{
                                                        scale: 0,
                                                        rotate: 180,
                                                    }}
                                                    animate={{
                                                        scale: 1,
                                                        rotate: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index * 0.1 + 0.2,
                                                        type: "spring",
                                                    }}
                                                    className="p-2 bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0"
                                                >
                                                    <User className="h-5 w-5 text-gray-600" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                            <AnimatePresence>
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                        }}
                                        className="flex gap-4 justify-start"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 2,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "linear",
                                            }}
                                            className="p-2 bg-rose-100 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0"
                                        >
                                            <MessageSquare className="h-5 w-5 text-rose-600" />
                                        </motion.div>
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            className="max-w-3xl p-4 rounded-2xl bg-white border border-gray-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "linear",
                                                    }}
                                                >
                                                    <Loader2 className="h-4 w-4 text-rose-500" />
                                                </motion.div>
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{
                                                        opacity: [0, 1, 0],
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                    }}
                                                    className="text-sm text-gray-600"
                                                >
                                                    AI sedang mengetik...
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </AnimatePresence>
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border-t border-gray-200 p-6 fixed bottom-0 left-60 right-0 shadow-lg"
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="max-w-4xl mx-auto"
                        >
                            <motion.div
                                whileFocus={{ scale: 1.02 }}
                                className="flex gap-4"
                            >
                                <div className="flex-1 relative">
                                    <motion.div
                                        whileFocus={{
                                            boxShadow:
                                                "0 0 0 3px rgba(244, 63, 94, 0.1)",
                                        }}
                                        className="rounded-lg"
                                    >
                                        <Input
                                            value={input}
                                            onChange={(e) =>
                                                setInput(e.target.value)
                                            }
                                            onFocus={() =>
                                                setIsSidebarOpen(false)
                                            }
                                            placeholder="Ketik pertanyaan kesehatan Anda..."
                                            className="pr-12 h-12 text-base transition-all duration-200"
                                            disabled={isLoading}
                                        />
                                    </motion.div>
                                    <motion.div
                                    // whileHover={{ scale: 1.1 }}
                                    // whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={
                                                !input.trim() || isLoading
                                            }
                                            className="absolute right-2 top-2 h-8 w-8 p-0 bg-rose-500 hover:bg-rose-600 transition-all duration-200 cursor-pointer"
                                        >
                                            <motion.div
                                                animate={
                                                    isLoading
                                                        ? { rotate: 360 }
                                                        : { rotate: 0 }
                                                }
                                                transition={{ duration: 0.5 }}
                                            >
                                                <Send className="h-4 w-4" />
                                            </motion.div>
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xs text-gray-500 mt-2 text-center"
                            >
                                AI dapat membuat kesalahan. Selalu konsultasikan
                                dengan dokter untuk masalah kesehatan serius.
                            </motion.p>
                        </form>
                    </motion.div>
                </div>

                {/* Chat History Sidebar */}
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: isSidebarOpen ? 0 : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed right-0 top-16 h-full bg-white border-l border-gray-200 w-80 z-10 shadow-xl"
                >
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-4 border-b border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="font-semibold text-gray-900 flex items-center gap-2"
                                >
                                    <History className="h-5 w-5 text-rose-500" />
                                    Riwayat Chat
                                </motion.h2>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="h-8 w-8 p-0 cursor-pointer"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Search */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="relative"
                            >
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari riwayat chat..."
                                    value={searchHistory}
                                    onChange={(e) =>
                                        setSearchHistory(e.target.value)
                                    }
                                    className="pl-10 h-9 text-sm"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Chat History List */}
                        <Suspense
                            fallback={
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                                </div>
                            }
                        >
                            <ScrollArea className="flex-1 overflow-y-auto">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="p-2"
                                >
                                    <AnimatePresence>
                                        {filteredHistory.map((chat, index) => (
                                            <motion.div
                                                key={chat.id}
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -50 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                }}
                                                whileHover={{
                                                    scale: 1.02,
                                                    x: 4,
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                                                    currentChatId === chat.id
                                                        ? "bg-rose-50 border border-rose-200 shadow-sm"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <motion.h3
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{
                                                            delay:
                                                                index * 0.1 +
                                                                0.1,
                                                        }}
                                                        className="font-medium text-sm text-gray-900 line-clamp-1 flex-1 cursor-pointer"
                                                        onClick={() =>
                                                            handleContinueChat(
                                                                chat.id
                                                            )
                                                        }
                                                    >
                                                        {chat.title}
                                                    </motion.h3>
                                                    <div className="flex items-center gap-1 ml-3">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <EllipsisVertical className="h-3 w-3 cursor-pointer" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-40"
                                                            >
                                                                <DropdownMenuItem
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick(
                                                                            chat.id,
                                                                            chat.title
                                                                        );
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Judul
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(
                                                                            chat.id,
                                                                            chat.title
                                                                        );
                                                                    }}
                                                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Hapus Chat
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        delay:
                                                            index * 0.1 + 0.2,
                                                    }}
                                                    className="text-xs text-gray-600 line-clamp-2 mb-2 cursor-pointer"
                                                    onClick={() =>
                                                        handleContinueChat(
                                                            chat.id
                                                        )
                                                    }
                                                >
                                                    {chat.lastMessage}
                                                </motion.p>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        delay:
                                                            index * 0.1 + 0.3,
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer"
                                                    onClick={() =>
                                                        handleContinueChat(
                                                            chat.id
                                                        )
                                                    }
                                                >
                                                    <Clock className="h-3 w-3" />
                                                    {chat.timestamp}
                                                </motion.div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </ScrollArea>
                        </Suspense>

                        {/* Sidebar Footer */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="p-4 border-t border-gray-200"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNewChat}
                                    className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Mulai Chat Baru
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Edit Title Modal */}
                        <Dialog
                            open={isEditModalOpen}
                            onOpenChange={setIsEditModalOpen}
                        >
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Edit className="h-5 w-5 text-rose-500" />
                                        Edit Judul Chat
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-title">
                                            Judul Chat
                                        </Label>
                                        <Input
                                            id="edit-title"
                                            value={editTitle}
                                            onChange={(e) =>
                                                setEditTitle(e.target.value)
                                            }
                                            placeholder="Masukkan judul chat baru"
                                            className="w-full"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSaveEdit();
                                                } else if (e.key === "Escape") {
                                                    handleCancelEdit();
                                                }
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleSaveEdit}
                                        disabled={!editTitle.trim()}
                                        className="bg-rose-500 hover:bg-rose-600"
                                    >
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Delete Confirmation Modal */}
                        <Dialog
                            open={isDeleteModalOpen}
                            onOpenChange={setIsDeleteModalOpen}
                        >
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Trash2 className="h-5 w-5 text-red-500" />
                                        Hapus Chat
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <p className="text-sm text-gray-600">
                                        Apakah Anda yakin ingin menghapus chat{" "}
                                        <span className="font-semibold text-gray-900">
                                            "{deletingChat?.title}"
                                        </span>
                                        ?
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>
                                <DialogFooter className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelDelete}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleConfirmDelete}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Hapus
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AIChatPage;
