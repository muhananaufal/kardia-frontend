import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Eye, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RiwayatDetailModal } from '@/components/fragments/riwayat-detail-modal';
import { useAuth } from '@/provider/AuthProvider';
import { fetchDashboard } from '@/hooks/api/dashboard';

const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

const cardVariants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: { opacity: 1, scale: 1 },
	transition: { duration: 0.3 },
};

export default function RiwayatPage() {
	const auth = useAuth();
	const token = auth?.token;
	const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRisk, setFilterRisk] = useState<string>('all');
	const [analysisHistory, setAnalysisHistory] = useState<AnalysisRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);

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
				return <Badge className="bg-green-100 text-green-700 hover:bg-rose-200">{title}</Badge>;
			case 'HIGH':
				return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-rose-200">{title}</Badge>;
			case 'VERY_HIGH':
				return <Badge className="bg-red-100 text-red-800 hover:bg-rose-200">{title}</Badge>;
			default:
				return <Badge className="bg-slate-100 text-slate-700 hover:bg-rose-200">{title}</Badge>;
		}
	};

	const filteredHistory = analysisHistory
		.filter((record) => {
			const matchesSearch = record.result_details?.riskSummary?.executiveSummary.toLowerCase().includes(searchTerm.toLowerCase()) || record.date.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesFilter = filterRisk === 'all' || getRiskLevel(record.result_details?.riskSummary?.riskCategory?.code) === filterRisk;
			return matchesSearch && matchesFilter;
		})
		.sort((a, b) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return dateB.getTime() - dateA.getTime(); // Sort by date descending
		});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-white">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }} className="max-w-full mx-auto px-6 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Riwayat Analisis</h1>
					<p className="text-base md:text-lg text-gray-600 leading-relaxed">Pantau perkembangan kesehatan jantung Anda dari waktu ke waktu</p>
				</motion.div>

				{/* Summary Stats */}
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
							<p className="text-2xl md:text-3xl font-bold text-gray-900">{(analysisHistory.reduce((acc, record) => acc + (record?.risk_percentage || 0), 0) / 30).toFixed(2)}%</p>{' '}
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
						<SelectTrigger className="w-full md:w-48 rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-50 focus:border-rose-50 h-10 md:h-12">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="Filter Risiko" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua Risiko</SelectItem>
							<SelectItem value="rendah-sedang">Risiko Rendah-Sedang</SelectItem>
							<SelectItem value="tinggi">Risiko Tinggi</SelectItem>
							<SelectItem value="sangat tinggi">Risiko Sangat Tinggi</SelectItem>
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
							<motion.div key={record?.slug} variants={cardVariants} initial="initial" animate="animate" transition={{ delay: index * 0.1 }}>
								<Card
									className="rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
									onClick={() => {
										setSelectedRecord(null);
										setTimeout(() => {
											setSelectedRecord(record);
										}, 100); // Delay to allow card click animation
									}}
								>
									<CardHeader className="border-b border-gray-200">
										<CardTitle className="text-lg md:text-xl font-bold text-gray-900">Analisis Resiko</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
											<div className="flex-1 space-y-3 max-w-4xl">
												<div className="flex items-center gap-3">
													<Calendar className="h-5 w-5 text-rose-500" />
													<div>
														<p className="font-bold text-gray-900 text-sm md:text-base">{record?.date}</p>
														{/* <p className="text-xs md:text-sm text-gray-600">{record.time} WIB</p> */}
													</div>
												</div>

												<div className="flex items-center gap-3">
													{formatResikoBadge(record?.result_details?.riskSummary?.riskCategory?.code, record?.result_details?.riskSummary?.riskCategory?.title || 'Tidak diketahui')}
													<div className="flex items-center gap-2">
														<span className="text-xl md:text-2xl font-bold text-gray-900">{(record?.risk_percentage || 0).toFixed(1)}%</span> {/* {getTrendIcon(record.trend)} */}
													</div>
												</div>

												<p className="text-sm md:text-base text-gray-600 leading-relaxed">{record?.result_details.riskSummary.executiveSummary}</p>
											</div>

											<div className="flex items-center gap-3">
												<Button
													onClick={(e) => {
														e.stopPropagation(); // Prevent card click event
														setSelectedRecord(null);
														setTimeout(() => {
															setSelectedRecord(record);
														}, 100); // Delay to allow card click animation
													}}
													className="bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-sm font-medium uppercase tracking-wide h-10 md:h-12 transition-all duration-300"
												>
													<Eye className="h-4 w-4 mr-2" />
													Detail
												</Button>
											</div>
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
		</div>
	);
}
