import { motion } from 'framer-motion';
import { Heart, Clock, AlertTriangle, CheckCircle, AlertCircle, Loader2, Zap, PartyPopper, PauseCircle, Star, Target, ShieldCheck, Stethoscope, Lightbulb, ThumbsUp, MapPin, ArrowRight, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Pastikan Tabs ada
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { useAuth } from '@/provider/AuthProvider';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '@/hooks/api/dashboard';

// --- [UPDATED] TYPE DEFINITIONS FOR FULL DATA ---
interface ProgramOverviewData {
	is_active: boolean;
	slug: string;
	title: string;
	description: string;
	status: 'active' | 'completed' | 'paused';
	start_date: string;
	end_date: string;
	progress: {
		current_week: number;
		total_weeks: number;
		current_day_in_program: number;
		total_days_in_program: number;
	};
}

interface RiskSummary {
	riskCategory: { code: string; title: string };
	riskPercentage: number;
	positiveFactors: string[];
	executiveSummary: string;
	primaryContributors: { title: string; severity: string; description: string }[];
	contextualRiskExplanation: string;
}

interface ActionPlan {
	impactSimulation: { message: string; timeEstimation: string; riskAfterChange: number };
	medicalConsultation: {
		suggestedTests: { title: string; description: string }[];
		recommendationLevel: { code: string; description: string };
	};
	priorityLifestyleActions: { rank: number; title: string; target: string; description: string; estimatedImpact: string }[];
}

interface PersonalizedEducation {
	mythVsFact: { fact: string; myth: string }[];
	keyHealthMetrics: { code: string; title: string; yourValue: string; idealRange: string; description: string }[];
}

interface ClosingStatement {
	firstStepAction: string;
	localContextTip: string;
	motivationalMessage: string;
}

interface LatestAssessmentDetails {
	riskSummary: RiskSummary;
	actionPlan: ActionPlan;
	personalizedEducation: PersonalizedEducation;
	closingStatement: ClosingStatement;
}

interface DashboardData {
	program_overview: ProgramOverviewData | null;
	summary: {
		total_assessments: number;
		last_assessment_date_human: string;
		latest_status: { category_code: string; category_title: string; description: string };
		health_trend: { direction: 'improving' | 'worsening' | 'stable'; change_value: number; text: string };
	};
	graph_data_30_days: { labels: string[]; values: number[] };
	latest_assessment_details: LatestAssessmentDetails | null;
}

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

// --- [UNCHANGED] UTILITY & REUSABLE COMPONENTS ---
const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
				<p className="text-sm font-medium text-slate-800">{data.date}</p>
				<p className="text-sm text-red-600">
					<span className="font-semibold">Risiko: {payload[0].value}%</span>
				</p>
			</div>
		);
	}
	return null;
};

// --- [NEW] PROGRAM OVERVIEW COMPONENT ---
const ProgramOverviewCard = ({ program }: { program: ProgramOverviewData | null }) => {
	if (!program || !program.slug) {
		// Tampilan jika tidak ada program aktif/data program
		return (
			<motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
				<Card className="rounded-2xl shadow-sm border bg-white overflow-hidden">
					<CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
						<div className="p-3 rounded-full bg-rose-100">
							<Heart className="h-8 w-8 text-rose-500" />
						</div>
						<div className="flex-1 text-center md:text-left">
							<h3 className="text-lg font-bold text-slate-800">Mulai Perjalanan Sehat Anda</h3>
							<p className="text-slate-600 text-sm mt-1">Jelajahi program kesehatan terpandu yang dirancang khusus untuk Anda.</p>
						</div>
						<Link to="/dashboard/programs" className="w-full md:w-auto">
							<Button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer">Jelajahi Program</Button>
						</Link>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	const { status, title, progress, slug } = program;
	const progressValue = (Math.max(0, progress.current_day_in_program * -1 + 1) / progress.total_days_in_program) * 100;
	// Konfigurasi untuk setiap status
	const statusConfig = {
		active: {
			icon: <Zap className="h-7 w-7 text-violet-600" />,
			bgColor: 'bg-violet-100/60 ',
			borderColor: 'border-violet-200',
			titleColor: 'text-violet-800',
			ctaText: 'Lanjutkan Program',
			ctaColor: 'bg-violet-500 hover:bg-violet-600',
		},
		completed: {
			icon: <PartyPopper className="h-7 w-7 text-sky-600" />,
			bgColor: 'bg-gradient-to-br from-sky-50 to-sky-100', // Paling meriah!
			borderColor: 'border-sky-200',
			titleColor: 'text-sky-800',
			ctaText: 'Lihat Ringkasan',
			ctaColor: 'bg-sky-500 hover:bg-sky-600',
		},
		paused: {
			icon: <PauseCircle className="h-7 w-7 text-amber-600" />,
			bgColor: 'bg-amber-100/60',
			borderColor: 'border-amber-200',
			titleColor: 'text-amber-800',
			ctaText: 'Lanjutkan Kembali',
			ctaColor: 'bg-amber-500 hover:bg-amber-600',
		},
	};

	const currentConfig = statusConfig[status];

	// console.log(progress.current_week);

	return (
		<motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
			<Card className={`rounded-2xl shadow-sm border ${currentConfig.bgColor} ${currentConfig.borderColor} overflow-hidden transition-all duration-300`}>
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
						{/* Icon & Title */}
						<div className="flex items-center gap-4 flex-1">
							<div className="p-2 rounded-full bg-white">{currentConfig.icon}</div>
							<div>
								<h3 className={`text-lg font-bold ${currentConfig.titleColor}`}>{title}</h3>
								{status === 'completed' && <p className="text-sm font-medium text-sky-700">Selamat! Program telah selesai.</p>}
								{status === 'paused' && <p className="text-sm font-medium text-amber-700">Program sedang dijeda.</p>}
								{/* {status === 'active' && <p className="text-sm font-medium text-violet-700">{`Minggu ${progress.current_week} dari ${progress.total_weeks} sedang berjalan`}</p>} */}
								{status === 'active' && <p className="text-sm font-medium text-violet-700">{`Minggu ${Math.max(1, progress.current_week + 1)} dari ${progress.total_weeks} sedang berjalan`}</p>}
							</div>
						</div>

						{/* Progress Bar & CTA */}
						<div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-4 md:mt-0">
							{status === 'active' && (
								<div className="w-full md:w-48">
									<div className="flex justify-between mb-1">
										<span className="text-xs font-semibold text-violet-700">Progress Hari</span>
										<span className="text-xs font-semibold text-violet-700">
											Ke-{Math.max(0, progress.current_day_in_program * -1 + 1)} / {progress.total_days_in_program}
										</span>
									</div>
									<Progress value={progressValue} className="h-2 [&>div]:bg-violet-500" />
								</div>
							)}
							{status === 'completed' && (
								<Badge className="bg-sky-200 text-sky-800 text-sm py-1 px-3 border border-sky-300">
									<Star className="h-4 w-4 mr-2" /> Graduasi
								</Badge>
							)}
							<Link to={`/dashboard/program/${slug}`} className="w-full md:w-auto">
								<Button className={`w-full text-white font-semibold cursor-pointer ${currentConfig.ctaColor}`}>{currentConfig.ctaText}</Button>
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

// --- [NEW] HEALTH METRIC CARD COMPONENT ---
const HealthMetricCard = ({ metric }: { metric: PersonalizedEducation['keyHealthMetrics'][0] }) => {
	const statusConfig = {
		GOOD: { barColor: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
		FAIR: { barColor: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
		POOR: { barColor: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
	};
	const config = statusConfig[metric.code as keyof typeof statusConfig] || statusConfig.FAIR;

	return (
		<div className={`p-4 rounded-xl border ${config.bgColor}`}>
			<div className="flex justify-between items-start">
				<h4 className="font-bold text-slate-800">{metric.title}</h4>
				<Badge className={`${config.bgColor} ${config.textColor} border ${config.textColor}/20`}>{metric.code}</Badge>
			</div>
			<div className="flex items-end gap-2 mt-1">
				<p className="text-2xl font-bold text-slate-900">{metric.yourValue}</p>
				<p className="text-sm text-slate-600 pb-1">/ ideal: {metric.idealRange}</p>
			</div>
			{/* <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
				<div className={`h-1.5 rounded-full ${config.barColor}`} style={{ width: '100%' }}></div>
			</div> */}
			<p className="text-xs text-slate-600 mt-2 leading-relaxed">{metric.description}</p>
		</div>
	);
};

export default function DashboardPage() {
	const auth = useAuth();
	const token = auth?.token;
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				if (!token) return setLoading(false);
				const response = await fetchDashboard(token);
				setDashboardData(response.data);
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchDashboardData();
	}, [token]);

	// --- [ENHANCED] HEALTH TREND RENDERER ---
	const renderTrend = () => {
		if (!dashboardData?.summary.health_trend) return null;
		const { direction, change_value } = dashboardData.summary.health_trend;

		if (dashboardData.summary.total_assessments <= 1) {
			return { icon: <Star className="h-5 w-5" />, text: 'Analisis Pertama', value: 'Tidak Ada Trend', color: 'text-sky-600' };
		}

		switch (direction) {
			case 'improving':
				return { icon: <ArrowDown className="h-5 w-5" />, text: `Membaik`, value: `${change_value}%`, color: 'text-green-600' };
			case 'worsening':
				return { icon: <ArrowUp className="h-5 w-5" />, text: `Memburuk`, value: `${change_value}%`, color: 'text-red-600' };
			default:
				return { icon: <Minus className="h-5 w-5" />, text: 'Stabil', value: 'Tidak Berubah', color: 'text-slate-600' };
		}
	};

	const trend = renderTrend();

	const heartRiskData = dashboardData?.graph_data_30_days
		? Object.keys(dashboardData.graph_data_30_days.labels)
				// 1. Mengambil dan menyusun data mentah
				.map((key) => ({
					date: dashboardData.graph_data_30_days.labels[key as any],
					risk: dashboardData.graph_data_30_days.values[key as any],
				}))
				// 2. Mengurutkan berdasarkan tanggal ISO (ini sudah akurat)
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
				// 3. [BARU] Memformat ulang tanggal untuk tampilan yang cantik
				.map((item) => ({
					...item,
					date: new Intl.DateTimeFormat('id-ID', {
						day: 'numeric',
						month: 'short',
					}).format(new Date(item.date)),
				}))
		: [];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2 className="animate-spin h-8 w-8 text-rose-500" />
			</div>
		);
	}

	if (!dashboardData || !dashboardData.latest_assessment_details) {
		return (
			<div className="flex flex-col items-center justify-center h-screen text-center p-6">
				<Heart className="h-16 w-16 text-rose-200 mb-4" />
				<h2 className="text-2xl font-bold text-slate-800">Selamat Datang!</h2>
				<p className="text-slate-600 max-w-md mt-2 mb-6">Sepertinya Anda belum melakukan analisis kesehatan. Mulailah perjalanan Anda untuk memahami kesehatan jantung Anda lebih baik.</p>
				<Link to="/dashboard/analysis">
					<Button className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-sm transition-all duration-300 cursor-pointer">
						<CheckCircle className="h-5 w-5 mr-2" />
						Lakukan Analisis Pertama Sekarang
					</Button>
				</Link>
			</div>
		);
	}

	const { summary, latest_assessment_details: details } = dashboardData;

	// --- [BARU] Logika untuk konfigurasi status risiko ---
	const riskCategoryConfig = {
		LOW_MODERATE: { text: 'Risiko Rendah - Sedang', color: 'text-green-600' },
		HIGH: { text: 'Risiko Tinggi', color: 'text-yellow-600' },
		VERY_HIGH: { text: 'Risiko Sangat Tinggi', color: 'text-red-600' },
	};

	const riskCode = details.riskSummary.riskCategory.code as keyof typeof riskCategoryConfig;
	const currentRiskConfig = riskCategoryConfig[riskCode] || { text: 'Status Tidak Diketahui', color: 'text-slate-600' };

	return (
		<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="px-4 md:px-8 py-8 md:py-12 space-y-8 bg-slate-50 min-h-screen">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-2">
				<div className="flex items-center gap-3 justify-center">
					{/* <ChartColumn className="w-8 h-8 text-rose-500" /> */}
					<div className="justify-items-center items-center mb-5">
						<h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-[15px]">Dashboard Kesehatan</h1>
						<p className="text-md md:text-lg text-gray-600 text-center">Ringkasan, wawasan, dan rencana aksi personal untuk Anda.</p>
					</div>
				</div>
			</motion.div>

			<ProgramOverviewCard program={dashboardData.program_overview} />

			{/* --- [ENHANCED] SMART STATS CARDS --- */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<motion.div variants={cardVariants}>
					<Card className="rounded-xl shadow-sm h-full">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">Status Risiko</CardTitle>
							<ShieldCheck className="h-5 w-5 text-slate-400" />
						</CardHeader>
						<CardContent>
							{/* [DIUBAH] Warna persentase sekarang dinamis */}
							<div className={`text-3xl font-bold ${currentRiskConfig.color}`}>{details.riskSummary.riskPercentage}%</div>
							{/* [DIUBAH] Teks status mengambil dari konfigurasi */}
							<p className="text-xs text-slate-500 mt-1">{currentRiskConfig.text}</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={cardVariants}>
					<Card className="rounded-xl shadow-sm h-full">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">Analisis Terakhir</CardTitle>
							<Clock className="h-5 w-5 text-slate-400" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-slate-800">{summary.last_assessment_date_human}</div>
							<p className="text-xs text-slate-500 mt-1">Total {summary.total_assessments} kali analisis</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={cardVariants}>
					<Card className="rounded-xl shadow-sm h-full">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">Tren Kesehatan</CardTitle>
							<div className={trend?.color}>{trend?.icon}</div>
						</CardHeader>
						<CardContent>
							<div className={`text-3xl font-bold ${trend?.color}`}>{trend?.value}</div>
							<p className="text-xs text-slate-500 mt-1">{trend?.text}</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Main Chart */}
			<motion.div variants={cardVariants}>
				<Card className="rounded-xl bg-white border shadow-sm">
					<CardHeader className="mb-3">
						<CardTitle className="flex items-center gap-2">
							<Heart className="h-5 w-5 text-red-500" />
							Histori Risiko 30 Hari Terakhir
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-60 w-full">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={heartRiskData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
									<XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
									<YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={([dataMin, dataMax]) => [Math.max(0, dataMin - 1), dataMax + 1]} tickFormatter={(value) => `${Math.round(value as number)}%`} />
									<Tooltip content={<CustomTooltip />} />
									<Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* --- [MAJOR ENHANCEMENT] PERSONAL ACTION & INSIGHTS CENTER --- */}
			<motion.div variants={cardVariants}>
				<Tabs defaultValue="summary" className="w-full">
					<TabsList className="grid w-full grid-cols-3 bg-slate-200/80">
						{/* Tab 1: Ringkasan */}
						<TabsTrigger value="summary" className="cursor-pointer">
							<Lightbulb className="h-5 w-5 md:mr-2" />
							<span className="hidden md:inline">Ringkasan</span>
						</TabsTrigger>

						{/* Tab 2: Rencana Aksi */}
						<TabsTrigger className="cursor-pointer" value="action-plan">
							<Target className="h-5 w-5 md:mr-2" />
							<span className="hidden md:inline">Rencana Aksi</span>
						</TabsTrigger>

						{/* Tab 3: Wawasan */}
						<TabsTrigger className="cursor-pointer" value="insights">
							<Stethoscope className="h-5 w-5 md:mr-2" />
							<span className="hidden md:inline">Wawasan</span>
						</TabsTrigger>
					</TabsList>

					{/* TAB 1: SUMMARY */}
					<TabsContent value="summary" className="mt-4">
						<Card className="rounded-xl shadow-sm">
							<CardHeader>
								<CardTitle>Ringkasan Eksekutif</CardTitle>
								<CardDescription>Analisis personal berdasarkan data kesehatan Anda.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<p className="text-slate-700 leading-relaxed bg-slate-100 p-4 rounded-lg border border-slate-200">"{details.riskSummary.executiveSummary}"</p>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<h4 className="font-semibold text-green-700 flex items-center mb-2">
											<ThumbsUp className="w-5 h-5 mr-2" />
											Faktor Positif
										</h4>
										<ul className="space-y-2">
											{details.riskSummary.positiveFactors.map((factor, i) => (
												<li key={i} className="flex items-start text-sm">
													<CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
													<span className="text-slate-600">{factor}</span>
												</li>
											))}
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-yellow-700 flex items-center mb-2">
											<AlertTriangle className="w-5 h-5 mr-2" />
											Kontributor Utama Risiko
										</h4>
										<ul className="space-y-2">
											{details.riskSummary.primaryContributors.map((item, i) => (
												<li key={i} className="flex items-start text-sm">
													<AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
													<span className="text-slate-600">
														<strong>{item.title}:</strong> {item.description}
													</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* TAB 2: ACTION PLAN */}
					<TabsContent value="action-plan" className="mt-4 space-y-6">
						<Card className="rounded-xl shadow-sm">
							<CardHeader>
								<CardTitle>Rencana Aksi Gaya Hidup</CardTitle>
								<CardDescription>Langkah prioritas untuk menjaga dan meningkatkan kesehatan Anda.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{details.actionPlan.priorityLifestyleActions.map((action) => (
									<div key={action.rank} className="p-4 border rounded-lg flex items-start gap-4">
										<div className="text-2xl font-bold text-rose-500 bg-rose-100/70 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">{action.rank}</div>
										<div>
											<h4 className="font-bold text-slate-800">{action.title}</h4>
											<p className="text-sm text-slate-600 mt-1">{action.description}</p>
											<p className="text-xs text-sky-700 font-semibold mt-2 bg-sky-100/80 px-2 py-1 rounded-md inline-block">Dampak: {action.estimatedImpact}</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						<Card className="rounded-xl shadow-sm">
							<CardHeader>
								<CardTitle>Rekomendasi Medis</CardTitle>
							</CardHeader>
							<CardContent className="grid md:grid-cols-2 gap-6">
								<div>
									<h4 className="font-semibold text-slate-800 mb-2">Saran Konsultasi</h4>
									<p className="text-sm text-slate-600 p-3 bg-slate-100 rounded-lg border">{details.actionPlan.medicalConsultation.recommendationLevel.description}</p>
								</div>
								<div>
									<h4 className="font-semibold text-slate-800 mb-2">Tes yang Disarankan</h4>
									<ul className="space-y-2">
										{details.actionPlan.medicalConsultation.suggestedTests.map((test, i) => (
											<li key={i} className="text-sm text-slate-600">
												<strong className="text-slate-700">• {test.title}</strong>
											</li>
										))}
									</ul>
								</div>
							</CardContent>
						</Card>

						<div className="bg-gradient-to-r from-sky-100 to-blue-100 p-5 rounded-xl border border-sky-200 text-center">
							<h4 className="text-lg font-bold text-sky-800">Simulasi Dampak Positif</h4>
							<p className="text-sm text-sky-700 mt-1 mb-3 max-w-2xl mx-auto">{details.actionPlan.impactSimulation.message}</p>
							<div className="flex items-center justify-center gap-4">
								<div className="text-center">
									<p className="text-xs text-slate-600">Risiko Saat Ini</p>
									<p className="text-2xl font-bold text-rose-600">{details.riskSummary.riskPercentage}%</p>
								</div>
								<ArrowRight className="text-sky-500 mt-4" />
								<div className="text-center">
									<p className="text-xs text-green-700">Potensi Risiko Baru</p>
									<p className="text-2xl font-bold text-green-600">{details.actionPlan.impactSimulation.riskAfterChange}%</p>
								</div>
							</div>
						</div>
					</TabsContent>

					{/* TAB 3: INSIGHTS */}
					<TabsContent value="insights" className="mt-4 space-y-6">
						<Card className="rounded-xl shadow-sm">
							<CardHeader>
								<CardTitle>Metrik Kesehatan Kunci</CardTitle>
								<CardDescription>Perbandingan nilai Anda dengan rentang ideal.</CardDescription>
							</CardHeader>
							<CardContent className="grid md:grid-cols-3 gap-4">
								{details.personalizedEducation.keyHealthMetrics.map((metric) => (
									<HealthMetricCard key={metric.title} metric={metric} />
								))}
							</CardContent>
						</Card>
						<Card className="rounded-xl shadow-sm">
							<CardHeader>
								<CardTitle>Mitos vs. Fakta</CardTitle>
								<CardDescription>Memahami kesehatan jantung dengan benar.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{details.personalizedEducation.mythVsFact.map((item, i) => (
									<div key={i} className="p-4 border bg-slate-50 rounded-lg">
										<p className="text-sm text-slate-500 line-through">Mitos: {item.myth}</p>
										<p className="text-base font-semibold text-green-700 mt-2">Fakta: {item.fact}</p>
									</div>
								))}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>

			{/* --- [NEW] FINAL MOTIVATIONAL CARD --- */}
			<motion.div variants={cardVariants}>
				<div className="bg-rose-50 border-2 border-dashed border-rose-200 p-6 rounded-2xl text-center space-y-4">
					<Star className="mx-auto h-8 w-8 text-rose-400" />
					<p className="text-md font-bold text-rose-800 max-w-3xl mx-auto">"{details.closingStatement.motivationalMessage}"</p>
					<div>
						<p className="text-sm font-semibold text-slate-700">Langkah Pertama Anda:</p>
						<p className="text-sm text-slate-600">{details.closingStatement.firstStepAction}</p>
					</div>
					{details.closingStatement.localContextTip && (
						<p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
							<MapPin className="h-3 w-3" />
							{details.closingStatement.localContextTip}
						</p>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
}
