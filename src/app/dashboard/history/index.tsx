/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, BookOpen, Calendar, Eye, Filter, Loader2, Play, Search, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

// const cardVariants = {
//     initial: { opacity: 0, scale: 0.95 },
//     animate: { opacity: 1, scale: 1 },
//     transition: { duration: 0.3 },
// };

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
		const loadDashboardData = async () => {
			if (!token) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const responseData = await fetchDashboard(token);

				// PERBAIKAN FINAL: Tambahkan .data di sini
				if (responseData && responseData.data && Array.isArray(responseData.data.assessment_history)) {
					setAnalysisHistory(responseData.data.assessment_history);
				} else {
					console.error("Path 'data.assessment_history' tidak ditemukan atau bukan array:", responseData);
					setAnalysisHistory([]);
				}
			} catch (error) {
				console.error('Gagal mengambil data dashboard:', error);
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

	const formatResikoBadge = (code: string, title: string) => {
		switch (code) {
			case 'LOW_MODERATE':
				return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">{title}</Badge>;
			case 'HIGH':
				return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">{title}</Badge>;
			case 'VERY_HIGH':
				return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{title}</Badge>;
			default:
				return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">{title}</Badge>;
		}
	};

	const filteredHistory = analysisHistory
		.filter((record) => {
			const matchesSearch = record?.result_details?.riskSummary?.executiveSummary.toLowerCase().includes(searchTerm.toLowerCase()) || record.date.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesFilter = filterRisk === 'all' || getRiskLevel(record?.result_details?.riskSummary?.riskCategory?.code) === filterRisk;
			return matchesSearch && matchesFilter;
		})
		.sort((a, b) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return dateB.getTime() - dateA.getTime(); // Sort by date descending
		});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2 className="animate-spin h-8 w-8 text-rose-500" />
			</div>
		);
	}

	const formatRiskPercentage = (value: any): string => {
		const numericValue = parseFloat(String(value || 0));

		if (isNaN(numericValue)) {
			return '0.0';
		}

		return new Intl.NumberFormat('id-ID', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 2,
		}).format(numericValue);
	};

	const handleStartNewProgram = (slug: string) => {
		setShowConfirmModal(true);
		setProgramSlug(slug);
	};

	const handleConfirmNewProgram = () => {
		if (confirmText === 'LANGKAH BARU') {
			setShowConfirmModal(false);
			setProgramDiffModalOpen(true);
			setConfirmText('');
		}
	};

	const handleNewProgram = async (slug: string) => {
		setIsNewProgramLoading(true);

		if (!token) return;

		await startNewProgram(token, slug, programDifficulty)
			.then((_res) => {
				toast.success('Program baru berhasil dimulai!');
				setIsNewProgramLoading(false);
				setTimeout(() => {
					navigate(`/dashboard/program/`);
				}, 1000);
			})
			.catch((err) => {
				console.error('Gagal memulai program baru:', err);
				toast.error('Gagal memulai program baru. Silakan coba lagi.');
			})
			.finally(() => {
				setIsNewProgramLoading(false);
				setProgramSlug(null);
			});
	};

	const handleResumeProgram = async () => {
		setIsNewProgramLoading(true);
		if (!token || !programSlug) return;

		await updateProgramStatus(token, programSlug)
			.then((_res) => {
				toast.success('Program berhasil dilanjutkan!');
				setIsNewProgramLoading(false);
				setTimeout(() => {
					navigate(`/dashboard/program/`);
				}, 1000);
			})
			.catch((err) => {
				console.error('Gagal melanjutkan program:', err);
				toast.error('Gagal melanjutkan program. Silakan coba lagi.');
			})
			.finally(() => {
				setIsNewProgramLoading(false);
				setProgramSlug(null);
			});
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

	// const formatDate = (dateString: string) => {
	//     return new Date(dateString).toLocaleDateString("id-ID", {
	//         year: "numeric",
	//         month: "long",
	//         day: "numeric",
	//     });
	// };

	return (
		<div className="min-h-screen bg-white">
			<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }} className="max-w-full mx-auto px-6 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Riwayat Analisis</h1>
					<p className="text-base md:text-lg text-gray-600 leading-relaxed">Pantau perkembangan kesehatan jantung Anda dari waktu ke waktu</p>
				</motion.div>
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="gap-3 rounded-2xl shadow-sm border border-gray-200 bg-white transition-all duration-300">
						<CardHeader>
							<CardTitle className="text-base md:text-lg font-bold">Total Analisis</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl md:text-3xl font-bold text-gray-900">{analysisHistory.length}</p>
							<p className="text-sm md:text-base text-gray-600">kali pemeriksaan</p>
						</CardContent>
					</Card>

					<Card className="gap-3 rounded-2xl shadow-sm border border-gray-200 bg-white transition-all duration-300">
						<CardHeader>
							<CardTitle className="text-base md:text-lg font-bold">Rata-rata Risiko</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl md:text-3xl font-bold text-gray-900">
								{(() => {
									const monthlyRisks: {
										[key: string]: number[];
									} = {};
									analysisHistory.forEach((record) => {
										const month = new Date(record.date).toLocaleString('default', {
											month: 'long',
											year: 'numeric',
										});
										if (!monthlyRisks[month]) monthlyRisks[month] = [];
										monthlyRisks[month].push(record.risk_percentage || 0);
									});

									const totalMonthlyRisk = Object.values(monthlyRisks).reduce((acc, risks) => acc + risks.reduce((sum, risk) => sum + risk, 0), 0);
									const totalMonthlyCount = Object.values(monthlyRisks).reduce((acc, risks) => acc + risks.length, 0);

									return totalMonthlyCount > 0 ? formatRiskPercentage(totalMonthlyRisk / totalMonthlyCount) : '0.0';
								})()}
								%
							</p>
							<p className="text-sm md:text-base text-gray-600">dalam 1 bulan terakhir</p>
						</CardContent>
					</Card>
				</motion.div>

				{/* Search and Filter */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col md:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Cari berdasarkan tanggal atau ringkasan..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base h-10 md:h-12"
						/>
					</div>
					<Select value={filterRisk} onValueChange={setFilterRisk}>
						<SelectTrigger className="w-full md:w-48 rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-50 focus:border-rose-50 h-[48px] md:h-[48px] cursor-pointer">
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
				{/* Analysis History List */}
				<div className="space-y-4">
					{filteredHistory.length === 0 ? (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
							<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
								<Calendar className="h-8 w-8 text-gray-400" />
							</div>
							<h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Tidak ada hasil yang ditemukan</h3>
							<p className="text-sm md:text-base text-gray-600">Coba ubah kata kunci pencarian atau filter yang digunakan</p>
						</motion.div>
					) : (
						filteredHistory.map((record, index) => (
							<motion.div
								key={record?.slug}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.5,
									delay: index * 0.1,
								}}
							>
								<Card
									className="transition-all duration-300 gap-0 rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md cursor-pointer"
									onClick={() => {
										setSelectedRecord(null);
										setTimeout(() => {
											setSelectedRecord(record);
										}, 100); // Delay to allow card click animation
									}}
								>
									<CardHeader className="!py-2 !pt-0 border-b border-gray-200">
										<div className="flex justify-between gap-4">
											<div>
												<CardTitle className="text-xl font-bold text-slate-900 mb-2">Analisis Resiko</CardTitle>
												<div className="flex items-center gap-2 text-slate-600 text-sm">
													<Calendar className="w-4 h-4" />
													<span>{record?.date}</span>
												</div>
											</div>
											<div className="flex flex-col sm:items-end gap-2">
												{formatResikoBadge(record?.result_details?.riskSummary?.riskCategory?.code, record?.result_details?.riskSummary?.riskCategory?.title || 'Tidak diketahui')}
												{getProgramStatusBadge(record.program_status || 'null')}
											</div>
										</div>
									</CardHeader>

									<CardContent className="mt-4">
										<div className="gap-6 mb-6 flex flex-col-reverse justify-between md:flex-row md:items-start items-center">
											{/* Risk Description */}
											<div className="max-w-3xl">
												<p className="text-slate-600">{record?.result_details?.riskSummary?.executiveSummary}</p>
											</div>

											{/* Risk Score */}
											<div className="text-center md:text-right">
												<h4 className="font-semibold text-slate-900">Persentase Resiko</h4>
												<div className="flex items-center gap-3">
													<p className="text-2xl font-bold text-slate-900">{formatRiskPercentage(record?.risk_percentage)}%</p>
												</div>
											</div>
										</div>

										{/* Action Button */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<Button
												className="bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-sm font-medium uppercase tracking-wide h-10 md:h-12 transition-all duration-300 cursor-pointer w-full"
												onClick={(e) => {
													e.stopPropagation(); // Prevent card click event
													setSelectedRecord(null);
													setTimeout(() => {
														setSelectedRecord(record);
													}, 100); // Delay to allow card click animation
												}}
											>
												<Eye className="h-4 w-4 mr-2" />
												Detail
											</Button>
											{record.program_status === 'active' && (
												<Button
													onClick={() => {
														navigate('/dashboard/program');
													}}
													className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-r-md shadow-lg hover:shadow-xl h-10 md:h-12 transition-all duration-300 cursor-pointer"
												>
													<ArrowRight className="w-4 h-4 mr-2" />
													Lanjutkan Program
												</Button>
											)}

											{record.program_status === 'completed' && (
												<Button
													onClick={() => {
														navigate(`/dashboard/program/${record.program_slug}`);
													}}
													className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-r-md shadow-lg hover:shadow-xl h-10 md:h-12 transition-all duration-300 cursor-pointer"
												>
													<BookOpen className="w-4 h-4 mr-2" />
													Lihat Laporan Program
												</Button>
											)}

											{record.program_status === null && (
												<Button
													onClick={(e) => {
														handleStartNewProgram(record.slug);
														e.stopPropagation(); // Prevent card click event
													}}
													className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-r-md shadow-lg hover:shadow-xl h-10 md:h-12 transition-all duration-300 cursor-pointer"
												>
													<Sparkles className="w-4 h-4 mr-2" />
													Mulai Program Baru
												</Button>
											)}

											{record.program_status === 'paused' && (
												<Button
													onClick={() => {
														navigate(`/dashboard/program/${record.program_slug}`);
													}}
													className="bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-700 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-r-md shadow-lg hover:shadow-xl h-10 md:h-12 transition-all duration-300 cursor-pointer"
												>
													<Play className="w-4 h-4 mr-2" />
													Aktifkan Program
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))
					)}
				</div>
			</motion.div>
			{/* Detail Modal */}
			{selectedRecord && <RiwayatDetailModal key={selectedRecord.slug} record={selectedRecord} isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} />}

			{/* Confirmation Modal */}
			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
							<AlertTriangle className="w-6 h-6 text-orange-500" />
							Konfirmasi Program Baru
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<p className="text-slate-600">Kamu akan memulai program baru. Program aktif saat ini akan dibatalkan. Apakah kamu yakin ingin melanjutkan?</p>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								Jika kamu yakin, ketik <span className="font-semibold text-red-600">LANGKAH BARU</span> untuk mengonfirmasi:
							</label>
							<Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Ketik LANGKAH BARU" className="rounded-md border-slate-300 focus:border-red-500 focus:ring-red-500 mt-5" />
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
								Tetap di Program Saat Ini
							</Button>
							<Button
								onClick={handleConfirmNewProgram}
								disabled={confirmText !== 'LANGKAH BARU'}
								className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								Konfirmasi Program Baru
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Program Difficulty Selection */}
			<Dialog open={programDiffModalOpen} onOpenChange={setProgramDiffModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-slate-900">Pilih Tingkat Kesulitan Program</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<p className="text-slate-600">Pilih tingkat kesulitan program yang sesuai dengan kondisi dan tujuan kesehatan jantungmu.</p>

						<Select value={programDifficulty} onValueChange={(value) => setProgramDifficulty(value as 'Santai & Bertahap' | 'Standar & Konsisten' | 'Intensif & Menantang')}>
							<SelectTrigger className="w-full rounded-md border-slate-300 focus:border-rose-300 focus:ring-rose-300 h-10 md:h-12 cursor-pointer">
								<SelectValue placeholder="Pilih Tingkat Kesulitan" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem className="cursor-pointer" value="Santai & Bertahap">
									Santai & Bertahap
								</SelectItem>
								<SelectItem className="cursor-pointer" value="Standar & Konsisten">
									Standar & Konsisten
								</SelectItem>
								<SelectItem className="cursor-pointer" value="Intensif & Menantang">
									Intensif & Menantang
								</SelectItem>
							</SelectContent>
						</Select>

						<div className="flex justify-end pt-4">
							<Button
								onClick={() => handleNewProgram(programSlug!)}
								className={`bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md transition-all duration-300  ${isNewProgramLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
							>
								{isNewProgramLoading ? (
									<div className="flex items-center gap-2">
										<Loader2 className="animate-spin h-4 w-4" />
										Memulai Program...
									</div>
								) : (
									'Mulai Program Baru'
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Resume Confirmation Modal */}
			<Dialog open={showResumeConfirmModal} onOpenChange={setShowResumeConfirmModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-slate-900">Lanjutkan Program Sebelumnya</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<p className="text-slate-600">Kamu memiliki program yang belum selesai. Apakah kamu ingin melanjutkan program tersebut?</p>

						<div className="flex justify-end pt-4">
							<Button variant="outline" onClick={() => setShowResumeConfirmModal(false)} className="mr-2">
								Tidak, Batalkan
							</Button>
							<Button onClick={handleResumeProgram} className={`bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md transition-all duration-300 ${isNewProgramLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
								{isNewProgramLoading ? (
									<div className="flex items-center gap-2">
										<Loader2 className="animate-spin h-4 w-4" />
										Melanjutkan Program...
									</div>
								) : (
									'Ya, Lanjutkan Program'
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
