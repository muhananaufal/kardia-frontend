// src/components/fragments/graduation-dialog-content.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Calendar } from "lucide-react";
import Confetti from "react-confetti";
import { ScrollArea } from "@/components/ui/scroll-area";

// Tipe data untuk props, sesuai dengan respons API Anda
interface GraduationDetails {
    stats: {
        total_days: number;
        best_streak: string;
        achieved_days: number;
        main_missions: string;
        bonus_challenges: string;
    };
    narrative: {
        final_quote: string;
        certificate_title: string;
        summary_of_journey: string;
        greatest_achievement: string;
    };
    user_name: string;
    program_name: string;
    champion_title: string;
    program_period: string;
}

interface GraduationDialogProps {
    details: GraduationDetails;
}

export function GraduationDialogContent({ details }: GraduationDialogProps) {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 6000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* Animasi Confetti akan muncul di atas dialog */}
            {showConfetti && (
                <Confetti
                    width={window.outerWidth}
                    height={window.outerHeight}
                    recycle={true}
                    numberOfPieces={450}
                    gravity={0.2}
                    className="!fixed top-0 left-0 z-[100] w-full" // Pastikan confetti di atas segalanya
                />
            )}

            <ScrollArea className="max-h-[70vh] w-full">
                <div className="text-center">
                    <Card className="border-0 shadow-none bg-transparent">
                        <CardContent className="p-2">
                            {/* Header Sertifikat */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="mb-6"
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                        <Medal className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                    {details.narrative.certificate_title}
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
                            </motion.div>

                            {/* Isi Sertifikat */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="space-y-5"
                            >
                                <p className="text-md text-slate-700">
                                    Sertifikat ini diberikan kepada
                                </p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {details.user_name}
                                </h3>
                                <p className="text-md text-slate-700">
                                    yang telah berhasil menyelesaikan
                                </p>
                                <h4 className="text-xl font-bold text-rose-600">
                                    {details.program_name}
                                </h4>
                                <div className="flex items-center justify-center gap-2 text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-md">
                                        {details.program_period}
                                    </span>
                                </div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatDelay: 3,
                                    }}
                                    className="flex justify-center"
                                >
                                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-md px-4 py-2 rounded-xl shadow-lg border-0">
                                        <Trophy className="w-4 h-4 mr-2" />
                                        {details.champion_title}
                                    </Badge>
                                </motion.div>
                            </motion.div>

                            {/* Ringkasan Perjalanan */}
                            <div className="text-left mt-8 pt-6 border-t border-slate-200 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">
                                        Ringkasan Perjalanan
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {details.narrative.summary_of_journey}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">
                                        Pencapaian Terbesar
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {details.narrative.greatest_achievement}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">
                                        Quote Final
                                    </h3>
                                    <p className="text-sm font-style: italic text-slate-600">
                                        "{details.narrative.final_quote}"
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </>
    );
}
