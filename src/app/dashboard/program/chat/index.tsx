import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatArea from "@/components/fragments/chat-area";
import { createNewThread, getThreadDetails, sendThreadMessage } from "@/hooks/api/program";
import { useAuth } from "@/provider/AuthProvider";

// 1. Tipe data Message disesuaikan dengan struktur API
interface Message {
    id: string;
    role: "user" | "assistant"; // Menggunakan 'role' & 'assistant' agar konsisten dengan contoh
    content: string | { reply_components: any[] }; // Content bisa string atau object
    timestamp?: string; // Timestamp sekarang opsional dan berupa string
}

export default function ChatPage() {
    const auth = useAuth();
    const token = auth?.token;
    const params = useParams<{ threadId: string }>();
    const navigate = useNavigate();

    // State disesuaikan dengan tipe data baru
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatTitle, setChatTitle] = useState("");
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isNewChat = params.threadId === "new";
    const programParam = new URLSearchParams(window.location.search).get("program");
    const readOnly = new URLSearchParams(window.location.search).get("readOnly") === "true";

    useEffect(() => {
        if (isNewChat && !programParam) {
            navigate("/dashboard/program");
        }
    }, [programParam, navigate]);

    useEffect(() => {
        if (isNewChat) {
            setChatTitle("Konsultasi Baru");
            setMessages([]);
            setCurrentChatId(null);
        } else {
            // 2. Simulasi memuat data dari API dan memformatnya
            setIsLoading(true);
            getThreadDetails(params.threadId, token)
                .then((data) => {
                    const formattedMessages: Message[] = data.data.messages.map(
                        (msg: any, index: any) => ({
                            id: index.toString(),
                            role: msg.role,
                            content: msg.content,
                            timestamp: msg.created_at_human,
                        })
                    );
                    setMessages(formattedMessages);
                    setChatTitle(data.data.title);
                    setCurrentChatId(data.data.slug);
                })
                .catch((error) => {
                    console.error("Failed to load chat details:", error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [params.threadId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: "Just now",
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            if (!token) {
                console.error("No authentication token found");
                return;
            }

            if (isNewChat) {
                const res = await createNewThread(programParam,token, input)
                if (res?.thread?.slug) {
                    navigate(`/dashboard/program/chat/${res.thread.slug}`);
                } else {
                    console.error("Thread slug is undefined");
                }
            }

            const res = await sendThreadMessage(token, params.threadId, input);
            console.log("Message sent successfully:", res);
            setCurrentChatId(params.threadId);

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

    const handleNewChat = () => {
        // Fungsi ini akan menavigasi ke halaman chat baru
        navigate("/chat/new");
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <ChatArea
                messages={messages}
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
                chatTitle={chatTitle}
                messagesEndRef={messagesEndRef}
                currentChatId={currentChatId}
                handleNewChat={handleNewChat}
                isReadOnly={readOnly}
            />
        </div>
    );
}
