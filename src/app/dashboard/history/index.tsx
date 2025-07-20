/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
	AlertTriangle,
	ArrowDown,
	Filter,
	Loader2,
	Minus,
	Search,
	Sparkles,
	TrendingUp,
	ShieldCheck,
	PieChart,
	BarChart,
	Star,
	ArrowUp,
	Calendar,
	Eye,
	// Ikon yang dibutuhkan untuk tombol-tombol spesifik Anda
	ArrowRight,
	BookOpen,
	Play,
	Trophy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RiwayatDetailModal } from '@/components/fragments/riwayat-detail-modal';
import { useAuth } from '@/provider/AuthProvider';
import { fetchDashboard } from '@/hooks/api/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { startNewProgram, updateProgramStatus } from '@/hooks/api/program';
import { toast } from 'sonner';

// Tipe data ini digunakan untuk konsistensi di seluruh komponen

const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

export default function RiwayatPage() {
	const auth = useAuth();
	const token = auth?.token;
	const navigate = useNavigate();
	const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRisk, setFilterRisk] = useState<string>('all');
	const [analysisHistory, setAnalysisHistory] = useState<AnalysisRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmText, setConfirmText] = useState('');
	const [programDiffModalOpen, setProgramDiffModalOpen] = useState(false);
	const [programDifficulty, setProgramDifficulty] = useState<'Santai & Bertahap' | 'Standar & Konsisten' | 'Intensif & Menantang'>('Standar & Konsisten');
	const [isNewProgramLoading, setIsNewProgramLoading] = useState(false);
	const [programSlug, setProgramSlug] = useState<string | null>(null);
	const [showResumeConfirmModal, setShowResumeConfirmModal] = useState(false);

	useEffect(() => {
		const defaultResultDetails = {
			riskSummary: {
				riskCategory: { code: 'UNKNOWN', title: 'Tidak Diketahui' },
				executiveSummary: 'Tidak ada detail ringkasan untuk analisis ini.',
			},
		};

		const loadDashboardData = async () => {
			if (!token) return setIsLoading(false);
			setIsLoading(true);
			try {
				const responseData = await fetchDashboard(token);
				if (responseData?.data && Array.isArray(responseData.data.assessment_history)) {
					const sortedHistory = responseData.data.assessment_history.sort((a: AnalysisRecord, b: AnalysisRecord) => new Date(b.date).getTime() - new Date(a.date).getTime());
					const sanitizedHistory = sortedHistory.map((record: any) => ({
						...record,
						risk_percentage: parseFloat(record.risk_percentage) || 0,

						program_slug: record.program_slug || '',
						program_status: record.program_status || null,
						result_details: record.result_details || defaultResultDetails,
					}));
					setAnalysisHistory(sanitizedHistory as AnalysisRecord[]);
				} else {
					setAnalysisHistory([]);
				}
			} catch (error) {
				console.error('Gagal mengambil data riwayat:', error);
				setAnalysisHistory([]);
			} finally {
				setIsLoading(false);
			}
		};
		loadDashboardData();
	}, [token]);

	const getRiskLevel = (code?: string): 'rendah-sedang' | 'tinggi' | 'sangat tinggi' | 'tidak diketahui' => {
		switch (code) {
			case 'LOW_MODERATE':
				return 'rendah-sedang';
			case 'HIGH':
				return 'tinggi';
			case 'VERY_HIGH':
				return 'sangat tinggi';
			default:
				return 'tidak diketahui';
		}
	};

	const getRiskStyling = (code?: string) => {
		switch (code) {
			case 'LOW_MODERATE':
				return { badge: 'bg-green-100 text-green-700', timeline: 'bg-green-500', border: 'border-green-500' };
			case 'HIGH':
				return { badge: 'bg-yellow-100 text-yellow-700', timeline: 'bg-yellow-500', border: 'border-yellow-500' };
			case 'VERY_HIGH':
				return { badge: 'bg-red-100 text-red-700', timeline: 'bg-red-500', border: 'border-red-500' };
			default:
				return { badge: 'bg-slate-100 text-slate-700', timeline: 'bg-slate-400', border: 'border-slate-400' };
		}
	};

	const formatRiskPercentage = (value: number | null | undefined): string => {
		return (value || 0).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	};

	const handleStartNewProgram = (slug: string) => {
		setProgramSlug(slug);
		setShowConfirmModal(true);
	};

	const handleConfirmNewProgram = () => {
		if (confirmText === 'LANGKAH BARU') {
			setShowConfirmModal(false);
			setConfirmText('');
			setProgramDiffModalOpen(true);
		}
	};

	const handleNewProgram = async (slug: string) => {
		if (!token) return;
		setIsNewProgramLoading(true);
		try {
			await startNewProgram(token, slug, programDifficulty);
			toast.success('Program baru berhasil dimulai!');
			setTimeout(() => navigate(`/dashboard/program/`), 1000);
		} catch (err) {
			toast.error('Gagal memulai program baru. Silakan coba lagi.');
		} finally {
			setIsNewProgramLoading(false);
			setProgramSlug(null);
		}
	};

	const handleResumeProgram = async () => {
		if (!token || !programSlug) return;
		setIsNewProgramLoading(true);
		try {
			await updateProgramStatus(token, programSlug);
			toast.success('Program berhasil diaktifkan!');
			setTimeout(() => navigate(`/dashboard/program/`), 1000);
		} catch (err) {
			toast.error('Gagal mengaktifkan program. Silakan coba lagi.');
		} finally {
			setIsNewProgramLoading(false);
			setProgramSlug(null);
		}
	};

	const filteredAndSortedHistory = useMemo(() => {
		return analysisHistory.filter((record) => {
			const summary = record?.result_details?.riskSummary?.executiveSummary || '';
			const date = formatDate(record.date);
			const searchTermLower = searchTerm.toLowerCase();
			const matchesSearch = summary.toLowerCase().includes(searchTermLower) || date.toLowerCase().includes(searchTermLower);
			const matchesFilter = filterRisk === 'all' || getRiskLevel(record?.result_details?.riskSummary?.riskCategory?.code) === filterRisk;
			return matchesSearch && matchesFilter;
		});
	}, [analysisHistory, searchTerm, filterRisk]);

	const summaryStats = useMemo(() => {
		const total = analysisHistory.length;
		if (total === 0) return { total: 0, average: 0, highest: 0, lowest: 0 };
		const risks = analysisHistory.map((r) => r.risk_percentage);
		const average = risks.reduce((sum, risk) => sum + risk, 0) / total;
		const highest = Math.max(...risks);
		const lowest = Math.min(...risks);
		return { total, average, highest, lowest };
	}, [analysisHistory]);

	const TrendIndicator = ({ current, previous }: { current: number; previous: number | null }) => {
		if (previous === null)
			return (
				<span className="text-xs text-slate-500 flex items-center">
					<Star className="w-3 h-3 mr-1" />
					Analisis Pertama
				</span>
			);
		const diff = current - previous;
		if (Math.abs(diff) < 0.1)
			return (
				<span className="text-xs text-slate-500 flex items-center">
					<Minus className="w-3 h-3 mr-1" />
					Stabil
				</span>
			);
		const isImproving = diff < 0;
		return (
			<span className={`text-xs font-semibold flex items-center ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
				{isImproving ? <ArrowDown className="w-3 h-3 mr-1" /> : <ArrowUp className="w-3 h-3 mr-1" />}
				{diff.toFixed(2)}% vs. sebelumnya
			</span>
		);
	};

	const getProgramStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return (
					<Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
						<div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
						Program Aktif
					</Badge>
				);
			case 'completed':
				return (
					<Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
						<Trophy className="w-3 h-3 mr-1" />
						Program Selesai
					</Badge>
				);
			case 'paused':
				return (
					<Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-medium">
						<Play className="w-3 h-3 mr-1" />
						Program Dijeda
					</Badge>
				);
			default:
				return (
					<Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
						<TrendingUp className="w-3 h-3 mr-1" />
						Program Belum Dimulai
					</Badge>
				);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen bg-slate-50">
				<Loader2 className="animate-spin h-8 w-8 text-rose-500" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50">
			<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-2">
					<div className="flex items-center gap-3 justify-center">
						{/* <History className="w-8 h-8 text-rose-500" /> */}
						<div className="justify-items-center items-center mb-5">
							<h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-[15px]">Perjalanan Kesehatan Anda</h1>
							<p className="text-md md:text-lg text-gray-600 text-center">Lihat rekam jejak dan evolusi kesehatan jantung Anda di sini.</p>
						</div>
					</div>
				</motion.div>

				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
					<Card className="rounded-2xl shadow-sm bg-white/80 backdrop-blur-sm border border-gray-200">
						<CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div className="p-2">
								<h3 className="text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
									<BarChart className="w-4 h-4" />
									Total Analisis
								</h3>
								<p className="text-2xl md:text-3xl font-bold text-slate-800">{summaryStats.total}</p>
							</div>
							<div className="p-2">
								<h3 className="text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
									<PieChart className="w-4 h-4" />
									Rata-rata Risiko
								</h3>
								<p className="text-2xl md:text-3xl font-bold text-slate-800">{formatRiskPercentage(summaryStats.average)}%</p>
							</div>
							<div className="p-2">
								<h3 className="text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
									<TrendingUp className="w-4 h-4" />
									Risiko Tertinggi
								</h3>
								<p className="text-2xl md:text-3xl font-bold text-red-600">{formatRiskPercentage(summaryStats.highest)}%</p>
							</div>
							<div className="p-2">
								<h3 className="text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
									<ShieldCheck className="w-4 h-4" />
									Risiko Terendah
								</h3>
								<p className="text-2xl md:text-3xl font-bold text-green-600">{formatRiskPercentage(summaryStats.lowest)}%</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col md:flex-row gap-4 sticky top-4 z-10 bg-slate-50/80 backdrop-blur-sm py-3 rounded-xl">
					<div className="relative flex-1">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<Input
							placeholder="Cari berdasarkan tanggal atau ringkasan..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-12 text-base h-12 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
						/>
					</div>
					<Select value={filterRisk} onValueChange={setFilterRisk}>
						<SelectTrigger className="w-full md:w-56 text-base h-12 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="Filter Risiko" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem className="cursor-pointer" value="all">
								Semua Risiko
							</SelectItem>
							<SelectItem className="cursor-pointer" value="rendah-sedang">
								Risiko Rendah-Sedang
							</SelectItem>
							<SelectItem className="cursor-pointer" value="tinggi">
								Risiko Tinggi
							</SelectItem>
							<SelectItem className="cursor-pointer" value="sangat tinggi">
								Risiko Sangat Tinggi
							</SelectItem>
						</SelectContent>
					</Select>
				</motion.div>

				<div className="relative pl-6 md:pl-8">
					<div className="absolute left-8 md:left-10 top-0 h-full w-0.5 bg-gray-200"></div>
					{filteredAndSortedHistory.length === 0 ? (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
							<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
								<Calendar className="h-10 w-10 text-rose-400" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">Riwayat Anda Masih Kosong</h3>
							<p className="text-base text-gray-600 mb-6">Lakukan analisis pertama Anda untuk memulai perjalanan kesehatan ini.</p>
							<Button onClick={() => navigate('/dashboard/analysis')} className="bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer">
								<Sparkles className="w-4 h-4 mr-2" />
								Lakukan Analisis Sekarang
							</Button>
						</motion.div>
					) : (
						<div className="space-y-10">
							{filteredAndSortedHistory.map((record, index) => {
								const styling = getRiskStyling(record.result_details?.riskSummary?.riskCategory?.code);
								const previousRecordRisk = index < filteredAndSortedHistory.length - 1 ? filteredAndSortedHistory[index + 1].risk_percentage : null;

								return (
									<motion.div key={record.slug} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.15 }} className="relative">
										<div className={`absolute left-[-22px] md:left-[-26px] top-5 w-4 h-4 rounded-full ${styling.timeline} border-4 border-slate-50`}></div>
										<Card className={`transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md border-l-4 ${styling.border} bg-white ml-8 md:ml-12`}>
											<CardContent className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
												<div className="md:col-span-2 space-y-4">
													<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
														{/* Sisi kiri tetap sama */}
														<p className="font-semibold text-slate-800 text-lg">{formatDate(record.date)}</p>

														{/* Sisi kanan sekarang berisi 2 badge */}
														<div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
															{getProgramStatusBadge(record?.program_status || 'Unknown')}
															<Badge className={styling.badge}>{record.result_details?.riskSummary?.riskCategory?.title || 'Tidak Diketahui'}</Badge>
														</div>
													</div>
													<p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{record.result_details?.riskSummary?.executiveSummary}</p>

													{/* ======================= BLOK TOMBOL SESUAI PERMINTAAN ANDA ======================= */}
													<div className="flex flex-col sm:flex-row gap-3 pt-2">
														<Button
															onClick={(e) => {
																e.stopPropagation();
																setSelectedRecord(record);
															}}
															className="flex-1 bg-rose-500 text-white hover:bg-rose-600 rounded-lg h-11 text-sm font-semibold cursor-pointer"
														>
															<Eye className="h-4 w-4 mr-2" />
															Detail
														</Button>

														<>
															{record.program_status === 'active' && (
																<Button
																	onClick={(e) => {
																		e.stopPropagation();
																		navigate('/dashboard/program');
																	}}
																	className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-sm hover:shadow-md h-11 transition-all duration-300 rounded-lg cursor-pointer"
																>
																	<ArrowRight className="w-4 h-4 mr-2" />
																	Lanjutkan Program
																</Button>
															)}
															{record.program_status === 'completed' && (
																<Button
																	onClick={(e) => {
																		e.stopPropagation();
																		navigate(`/dashboard/program/${record.program_slug}`);
																	}}
																	className="flex-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-semibold shadow-sm hover:shadow-md h-11 transition-all duration-300 rounded-lg cursor-pointer"
																>
																	<BookOpen className="w-4 h-4 mr-2" />
																	Lihat Laporan Program
																</Button>
															)}
															{record.program_status === null && (
																<Button
																	onClick={(e) => {
																		e.stopPropagation();
																		handleStartNewProgram(record.slug);
																	}}
																	className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl h-11 transition-all duration-300 rounded-lg cursor-pointer"
																>
																	<Sparkles className="w-4 h-4 mr-2" />
																	Mulai Program Baru
																</Button>
															)}
															{record.program_status === 'paused' && (
																<Button
																	// Menggunakan fungsi yang benar untuk mengaktifkan via API
																	onClick={(e) => {
																		e.stopPropagation();
																		setProgramSlug(record.program_slug);
																		setShowResumeConfirmModal(true);
																	}}
																	className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-700 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl h-11 transition-all duration-300 rounded-lg cursor-pointer"
																>
																	<Play className="w-4 h-4 mr-2" />
																	Aktifkan Program
																</Button>
															)}
														</>
													</div>
													{/* ===================================================================================== */}
												</div>

												<div className="bg-slate-100/70 p-4 rounded-xl flex flex-col justify-center items-center text-center space-y-3">
													<h4 className="font-semibold text-slate-900">Persentase Risiko</h4>
													<p className="text-4xl font-bold text-slate-800">{formatRiskPercentage(record.risk_percentage)}%</p>
													<TrendIndicator current={record.risk_percentage} previous={previousRecordRisk} />
												</div>
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>
					)}
				</div>
			</motion.div>

			{/* --- MODAL-MODAL --- */}
			{selectedRecord && <RiwayatDetailModal key={selectedRecord.slug} record={selectedRecord} isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} />}

			{/* Modal Konfirmasi Program Baru */}
			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
							<AlertTriangle className="w-6 h-6 text-orange-500" />
							Konfirmasi Program Baru
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-slate-600">Anda akan memulai program baru dan program aktif saat ini akan dibatalkan. Yakin ingin melanjutkan?</p>
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								Ketik <span className="font-semibold text-red-600">LANGKAH BARU</span> untuk konfirmasi:
							</label>
							<Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Ketik LANGKAH BARU" className="rounded-md border-slate-300 focus:border-red-500 focus:ring-red-500 mt-1" />
						</div>
						<div className="flex flex-col sm:flex-row gap-3 pt-4">
							<Button
								variant="outline"
								onClick={() => {
									setShowConfirmModal(false);
									setConfirmText('');
								}}
								className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-md cursor-pointer"
							>
								Batal
							</Button>
							<Button onClick={handleConfirmNewProgram} disabled={confirmText !== 'LANGKAH BARU'} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:opacity-50 cursor-pointer">
								Konfirmasi
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Modal Pilih Kesulitan Program */}
			<Dialog open={programDiffModalOpen} onOpenChange={setProgramDiffModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-slate-900">Pilih Tingkat Kesulitan Program</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-slate-600">Pilih tingkat kesulitan yang sesuai dengan kondisi dan tujuan kesehatan Anda.</p>
						<Select value={programDifficulty} onValueChange={(value) => setProgramDifficulty(value as any)}>
							<SelectTrigger className="w-full rounded-md border-slate-300 h-12">
								<SelectValue placeholder="Pilih Tingkat Kesulitan" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Santai & Bertahap">Santai & Bertahap</SelectItem>
								<SelectItem value="Standar & Konsisten">Standar & Konsisten</SelectItem>
								<SelectItem value="Intensif & Menantang">Intensif & Menantang</SelectItem>
							</SelectContent>
						</Select>
						<div className="flex justify-end pt-4">
							<Button onClick={() => handleNewProgram(programSlug!)} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md cursor-pointer" disabled={isNewProgramLoading}>
								{isNewProgramLoading ? (
									<>
										<Loader2 className="animate-spin h-4 w-4 mr-2" /> Memulai Program...
									</>
								) : (
									'Mulai Program Baru'
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Modal Konfirmasi Lanjutkan Program */}
			<Dialog open={showResumeConfirmModal} onOpenChange={setShowResumeConfirmModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-slate-900">Lanjutkan Program Sebelumnya</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-slate-600">Anda memiliki program yang dijeda. Apakah Anda ingin melanjutkannya?</p>
						<div className="flex justify-end pt-4 gap-3">
							<Button variant="outline" onClick={() => setShowResumeConfirmModal(false)}>
								Batal
							</Button>
							<Button onClick={handleResumeProgram} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md" disabled={isNewProgramLoading}>
								{isNewProgramLoading ? (
									<>
										<Loader2 className="animate-spin h-4 w-4 mr-2" /> Melanjutkan...
									</>
								) : (
									'Ya, Lanjutkan'
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
