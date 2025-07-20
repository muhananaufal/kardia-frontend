import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, Sparkles, Trophy, Pause, Trash2, Loader2, Award, XCircle } from 'lucide-react';
import { WeeklyTimeline } from '@/components/fragments/weekly-timeline';
import { DiscussionHub } from '@/components/fragments/discussion-hub';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/provider/AuthProvider';
import { deleteProgram, getGraduationDetails, getProgramDetails, updateCompletionMissions, updateProgramStatus } from '@/hooks/api/program';
import { fetchDashboard } from '@/hooks/api/dashboard';
import { toast } from 'sonner';
import WarningCard from '@/components/fragments/warning-card';
import { useNavigate, useParams } from 'react-router-dom';
import { GraduationDialogContent } from '@/components/fragments/graduation-report';

interface ProgramData {
	slug: string;
	title: string;
	description: string;
	status: string;
	overall_progress: {
		current_week_number: number;
		overall_completion_percentage: number;
		days_remaining: number;
	};
	weeks: any[];
	threads: any[];
}

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

export default function CoachingDashboard() {
	const auth = useAuth();
	const token = auth?.token;
	const [isLoading, setIsLoading] = useState(true);
	const [activeProgram, setActiveProgram] = useState(true);
	const [isActiveLoading, setIsActiveLoading] = useState(false);
	const [graduationDetails, setGraduationDetails] = useState<GraduationDetails | null>(null);
	const [programData, setProgramData] = useState<ProgramData | null>(null);
	const [showSparkles, setShowSparkles] = useState(false);
	const [showGradReport, setShowGradReport] = useState(true);

	// State untuk minggu yang dipilih, diinisialisasi dengan minggu saat ini dari API
	const [selectedWeek, setSelectedWeek] = useState(programData?.overall_progress?.current_week_number);
	const params = useParams<{ slug: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		const loadProgramDetails = async () => {
			if (!token) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			let programStatus = 'active';
			let programData = [];
			try {
				let slugToFetch = params.slug;

				// Jika tidak ada slug di URL, cari program aktif
				if (!slugToFetch) {
					const programOverview = await fetchDashboard(token).then((data) => data.data?.program_overview);
					slugToFetch = programOverview?.slug;
					programStatus = programOverview?.status;
				}

				// Jika ada slug (dari params atau dari dashboard), ambil detailnya
				if (slugToFetch) {
					const response = await getProgramDetails(slugToFetch, token);
					if (response && response.data) {
						programData = response.data;
						// Set minggu terpilih berdasarkan data yang baru dimuat
						setSelectedWeek(response.data?.overall_progress?.current_week_number);
						setActiveProgram(true);
						programStatus = response.data.status;
					} else {
						setActiveProgram(false);
					}
				} else {
					// Tidak ada slug di params dan tidak ada program aktif
					setActiveProgram(false);
				}

				if (programStatus === 'completed') {
					const graduationResponse = await getGraduationDetails(token, programData?.slug ?? '');
					setGraduationDetails(graduationResponse.data);
					console.log('Graduation Details:', graduationResponse.data);
				}
				setProgramData(programData);
			} catch (error) {
				console.error('Gagal mengambil data program:', error);
				setActiveProgram(false);
				setProgramData(null);
			} finally {
				setIsLoading(false);
			}
		};

		loadProgramDetails();
	}, [token, params.slug, activeProgram]);

	// Dapatkan data minggu yang dipilih dari array 'weeks'
	const currentWeekData = programData?.weeks?.find((week) => Number(week.week_number) == selectedWeek);
	const isProgramInactive = programData?.status !== 'active';
	// const isProgramCompleted = programData?.status === "completed";
	const isProgramPaused = programData?.status === 'paused';
	const isReadOnly = isProgramInactive || (selectedWeek ?? 0) < programData?.overall_progress?.current_week_number;

	// Tentukan minggu yang sudah selesai untuk di-highlight di timeline
	const completedWeeks = programData?.weeks?.filter((week) => week.status === 'completed' || week.completion_percentage == 100).map((week) => week.week_number);

	// Fungsi ini mengubah "20 July 2025" atau "21st July 2025" menjadi "2025-07-20"
	const convertAPIDateToISO = (dateString: any) => {
		if (!dateString) return '';
		// Hapus 'st', 'nd', 'rd', 'th' dari tanggal
		const cleanDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
		const date = new Date(cleanDateString);
		if (isNaN(date.getTime())) {
			// Jika parsing gagal, kembalikan string kosong atau handle error
			return '';
		}

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	};

	// Handler untuk menyelesaikan tugas (mission/task)
	const handleMissionComplete = async (id: string) => {
		if (isReadOnly || !currentWeekData) return;

		if (!token) return;

		const newProgramData = JSON.parse(JSON.stringify(programData));

		const weekToUpdate = newProgramData?.weeks?.find((week: any) => week.week_number == selectedWeek);

		try {
			if (weekToUpdate) {
				weekToUpdate.tasks = weekToUpdate.tasks.map((task: any) => {
					if (task.id == id) {
						setShowSparkles(!task.is_completed);
						return { ...task, is_completed: !task.is_completed };
					}
					return task;
				});

				await updateCompletionMissions(token, id)
					.then(() => {
						toast.success('Sukses update');

						const totalTasks = weekToUpdate?.tasks?.length;
						const completedTasks = weekToUpdate?.tasks?.filter((task: any) => task.is_completed).length;
						const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

						weekToUpdate.completion_percentage = completionPercentage;

						const overallCompletedTasks = newProgramData?.weeks?.reduce((acc: number, week: any) => {
							return acc + week?.tasks?.filter((task: any) => task.is_completed).length;
						}, 0);

						const overallTotalTasks = newProgramData.weeks.reduce((acc: number, week: any) => {
							return acc + week.tasks.length;
						}, 0);

						newProgramData.overall_progress.overall_completion_percentage = Math.round((overallCompletedTasks / overallTotalTasks) * 100);
					})
					.catch(() => {
						toast.error('Gagal Update');
					});
			}
		} catch (error) {
			console.error(error);
		}

		setProgramData(newProgramData);
	};

	const todayDate = new Date();
	todayDate.setHours(0, 0, 0, 0);

	// const today = new Date().toLocaleDateString('en-GB', {
	// 	day: '2-digit',
	// 	month: 'long',
	// 	year: 'numeric',
	// });

	const todayISO = new Date().toISOString().split('T')[0]; // Hasil: "2025-07-20"

	const groupedTasks = useMemo(() => {
		if (!currentWeekData?.tasks) return {};

		// Menggunakan reduce untuk mengelompokkan tugas berdasarkan tanggal
		return currentWeekData.tasks.reduce((acc: any, task: any) => {
			// TERAPKAN FUNGSI DI SINI!
			const isoDate = convertAPIDateToISO(task.task_date);
			if (!isoDate) return acc; // Lewati jika tanggal tidak valid

			if (!acc[isoDate]) {
				acc[isoDate] = [];
			}
			acc[isoDate].push(task);
			return acc;
		}, {});
	}, [currentWeekData]);

	const formatDateForDisplay = (dateStr: string) => {
		const date = new Date(dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1'));
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
		}).format(date);
	};

	const handleUpdateProgramStatus = async (slug: string) => {
		if (!token) return;
		setIsActiveLoading(true);

		try {
			await updateProgramStatus(token, slug);
			toast.success('Sukses update program');
			navigate('/dashboard/program');
			setIsActiveLoading(false);
			setActiveProgram(false);
		} catch (error) {
			toast.error('Error');
			console.error(error);
			setIsActiveLoading(false);
		}
	};

	const handleDeleteProgram = async (slug: string) => {
		if (!token) return;
		setIsActiveLoading(true);

		try {
			await deleteProgram(token, slug);
			toast.success('Sukses menghapus program');
			setIsActiveLoading(false);
			navigate('/dashboard/history');
			setActiveProgram(false);
		} catch (error: any) {
			toast.error(error);
			console.error(error);
			setIsActiveLoading(false);
		}
	};

	const getProgramStatusLabel = (status: string) => {
		switch (status) {
			case 'active':
				return 'Aktif';
			case 'completed':
				return 'Selesai';
			case 'paused':
				return 'Dijeda';
			default:
				return 'Tidak Diketahui';
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2 className="animate-spin h-8 w-8 text-rose-500" />
			</div>
		);
	}

	if (!activeProgram || !programData) {
		return (
			<WarningCard
				title="Tidak Ada Program Aktif"
				description="Saat ini tidak ada program aktif yang tersedia. Silakan mulai program baru atau melanjutkan program sebelumnya melalui riwayat analisis."
				btnText="Ke Riwayat Analisis"
				btnHref="/dashboard/history"
			/>
		);
	}



	
	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 md:px-6 pb-8 mt-[48px]">
				{/* Header */}
				<div className="">
					<div>
						<h1 className="text-2xl md:text-4xl font-bold text-slate-900 text-center">{programData.title}</h1>
						<div className="flex items-center justify-center gap-2 my-4">
							<Badge variant="outline" className="flex items-center gap-1">
								<div className="w-2 h-2 bg-rose-500 rounded-full"></div>
								<span className="text-sm font-medium">Program {getProgramStatusLabel(programData.status)}</span>
							</Badge>
						</div>
					</div>
				</div>

				{/* Program Progress Card */}
				<Card className="mb-6 mt-15 border border-slate-200 shadow-sm bg-white ">
					<CardHeader>
						<CardTitle className="text-lg font-semibold text-slate-900">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-slate-900">Progress Program</h3>
								<Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
									Minggu ke-{programData?.overall_progress?.current_week_number} dari {programData.weeks.length}
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-slate-600">Total Penyelesaian</span>
								<span className="font-medium text-slate-900">{programData.overall_progress.overall_completion_percentage}%</span>
							</div>
							<Progress value={programData.overall_progress.overall_completion_percentage} className="h-4" />
							<p className="text-sm text-slate-600">{programData.overall_progress.days_remaining} hari tersisa. Kamu Hebat!</p>
						</div>
					</CardContent>
				</Card>

				{/* Interactive Weekly Timeline */}
				<WeeklyTimeline currentWeek={programData?.overall_progress?.current_week_number} onWeekSelect={setSelectedWeek} completedWeeks={completedWeeks ?? []} />

				{/* This Week's Focus Card */}
				<Card className="mt-8 border border-slate-200 shadow-sm bg-white">
					<CardHeader>
						<CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
							<Target className="w-5 h-5 text-rose-500" />
							Fokus Minggu ke-{selectedWeek}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<h3 className="font-semibold text-slate-900 mb-2">{currentWeekData?.title}</h3>
						<p className="text-slate-600">{currentWeekData?.description}</p>
					</CardContent>
				</Card>

				{/* Today's Mission Card */}
				<Card className="my-8 border border-slate-200 shadow-sm overflow-hidden">
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-slate-900 mb-3">{programData.status === 'active' ? 'Misi Hari Ini' : 'Misi Minggu Ini'}</h3>
							</div>
						</div>

						{programData.status === 'active' ? (
							// Tampilan untuk program AKTIF (hanya tugas hari ini)
							<>
								{/* Gunakan `todayISO` sebagai kunci untuk mencari tugas hari ini */}
								{groupedTasks[todayISO] && groupedTasks[todayISO].length > 0 ? (
									groupedTasks[todayISO].map((mission: any) => {
										// Konversi tanggal misi ke format ISO sekali saja untuk semua perbandingan
										const missionISO = convertAPIDateToISO(mission.task_date);
										// Tentukan apakah misi terlewat (missed)
										const isMissed = missionISO < todayISO && !mission.is_completed;

										return (
											<div key={mission.id}>
												<div
													className={`${mission.is_completed ? 'bg-green-50 border-green-200' : isMissed ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'} rounded-lg border p-6 mb-4 transition-all duration-300 hover:shadow-sm`}
												>
													<div className="flex items-start gap-4">
														<div className="flex-shrink-0 hidden md:inline">
															{mission.is_completed ? (
																<CheckCircle2 className="w-6 h-6 text-green-600" />
															) : isMissed ? (
																<XCircle className="w-6 h-6 text-red-600" />
															) : mission.task_type === 'main_mission' ? (
																<Target className="w-6 h-6 text-blue-600" />
															) : (
																<Sparkles className="w-6 h-6 text-yellow-600" />
															)}
														</div>
														<div className="flex-1">
															<div className="flex items-start justify-between gap-3 mb-2">
																<div className="flex flex-col-reverse md:flex-row items-start gap-3">
																	<h4 className={`font-semibold text-slate-900 ${mission.is_completed ? 'line-through text-green-600' : isMissed ? 'text-red-600 line-through' : ''}`}>
																		{mission.title}
																		<div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
																			<span>{mission.task_date}</span>
																		</div>
																	</h4>
																	<Badge variant="outline" className={`text-[10px] mt-1 ${mission.task_type === 'main_mission' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
																		{mission.task_type === 'main_mission' ? 'Utama' : 'Bonus'}
																	</Badge>
																</div>
																<div className="flex-shrink-0">
																	<motion.button
																		className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
																			mission.is_completed ? 'bg-green-600 border-green-600 hover:bg-green-700' : 'bg-white border-slate-300'
																		} ${isReadOnly || isMissed ? 'cursor-not-allowed opacity-50' : ' cursor-pointer hover:border-green-500 hover:bg-green-50'}`}
																		onClick={() => handleMissionComplete(mission.id)}
																		whileHover={isReadOnly || isMissed ? {} : { scale: 1.05 }}
																		whileTap={isReadOnly || isMissed ? {} : { scale: 0.95 }}
																		disabled={isReadOnly || isMissed}
																	>
																		{mission.is_completed && <CheckCircle2 className="w-6 h-6 text-white" />}
																	</motion.button>
																</div>
															</div>
															<p className="text-slate-400 text-sm">{mission.description}</p>
														</div>
													</div>
												</div>

												{/* Bagian notifikasi setelah div utama misi */}
												{mission.is_completed && (
													<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-[-1rem] mb-4 p-4 bg-green-50 border border-green-200 rounded-b-xl">
														<div className="flex items-center gap-2">
															<Trophy className="w-5 h-5 text-green-600" />
															<span className="font-semibold text-green-700">Misi ini telah selesai!</span>
															{showSparkles && <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />}
														</div>
														<p className="text-green-600 text-sm mt-1">Keren! Kamu telah menyelesaikan misi ini. Terus semangat!</p>
													</motion.div>
												)}

												{isMissed && (
													<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-[-1rem] mb-4 p-4 bg-red-50 border border-red-200 rounded-b-xl">
														<div className="flex items-center gap-2">
															<XCircle className="w-5 h-5 text-red-600" />
															<span className="font-semibold text-red-700">Misi Terlewat</span>
														</div>
														<p className="text-red-600 text-sm mt-1">Sayang sekali, kamu belum menyelesaikan misi ini. Jangan khawatir, masih ada misi lain!</p>
													</motion.div>
												)}
											</div>
										);
									})
								) : (
									<div className="text-center py-8 px-4 border border-dashed rounded-lg">
										<p className="text-slate-500">Tidak ada tugas untuk hari ini. Selamat beristirahat! 🌴</p>
									</div>
								)}
							</>
						) : (
							<>
								{Object.keys(groupedTasks).length > 0 ? (
									Object.entries(groupedTasks).map(([date, missions]) => (
										<div key={date} className="mb-6 border rounded-lg p-6">
											<h4 className="font-semibold pb-2 mb-3">{formatDateForDisplay(date)}</h4>
											<div className="space-y-4">
												{(missions as any[]).map((mission: any) => (
													<div
														className={`${
															mission.is_completed
																? 'bg-green-50 border-green-200'
																: new Date(mission.task_date.replace(/(\d+)(st|nd|rd|th)/, '$1')) > todayDate && !mission.is_completed
																? 'bg-red-50 border-red-200'
																: 'bg-white border-slate-200'
														} rounded-lg border p-6 mb-4 transition-all duration-300 hover:shadow-sm`}
													>
														<div key={mission.id} className="flex items-start gap-4">
															<div className="flex-shrink-0 hidden md:inline">
																{mission.is_completed ? (
																	<CheckCircle2 className="w-6 h-6 text-green-600" />
																) : new Date(mission.task_date.replace(/(\d+)(st|nd|rd|th)/, '$1')) > todayDate && !mission.is_completed ? (
																	<XCircle className="w-6 h-6 text-red-600" />
																) : mission.task_type === 'main_mission' ? (
																	<Target className="w-6 h-6 text-blue-600" />
																) : (
																	<Sparkles className="w-6 h-6 text-yellow-600" />
																)}
															</div>
															<div className="flex-1">
																<div className="flex items-start justify-between gap-3 mb-2">
																	<div className="flex flex-col-reverse md:flex-row items-start gap-3">
																		<div>
																			<h4
																				className={`font-semibold text-slate-900 ${
																					mission.is_completed ? 'line-through text-green-600' : new Date(mission.task_date.replace(/(\d+)(st|nd|rd|th)/, '$1')) > todayDate && !mission.is_completed ? 'text-red-600 line-through' : ''
																				}`}
																			>
																				{mission.title}
																			</h4>
																			<div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
																				<span>{mission.task_date}</span>
																			</div>
																		</div>

																		<Badge variant="outline" className={`text-[10px] mt-1 ${mission.task_type === 'main_mission' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
																			{mission.task_type === 'main_mission' ? 'Utama' : 'Bonus'}
																		</Badge>
																	</div>
																	<div className="flex-shrink-0">
																		<motion.button
																			className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
																				mission.is_completed ? 'bg-green-600 border-green-600 hover:bg-green-700' : 'bg-white border-slate-300'
																			} ${isReadOnly ? 'cursor-not-allowed opacity-50' : ' cursor-pointer hover:border-green-500 hover:bg-green-50'}`}
																			onClick={() => handleMissionComplete(mission.id)}
																			whileHover={
																				isReadOnly
																					? {}
																					: {
																							scale: 1.05,
																					  }
																			}
																			whileTap={
																				isReadOnly
																					? {}
																					: {
																							scale: 0.95,
																					  }
																			}
																			disabled={isReadOnly}
																		>
																			{mission.is_completed && <CheckCircle2 className="w-6 h-6 text-white" />}
																		</motion.button>
																	</div>
																</div>
																<p className="text-slate-400 text-sm">{mission.description}</p>
															</div>
														</div>

														{mission.is_completed && (
															<motion.div
																initial={{
																	opacity: 0,
																	y: 10,
																}}
																animate={{
																	opacity: 1,
																	y: 0,
																}}
																className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl"
															>
																<div className="flex items-center gap-2">
																	<Trophy className="w-5 h-5 text-green-600" />
																	<span className="font-semibold text-green-700">Misi ini telah selesai!</span>
																	{showSparkles && <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />}
																</div>
																<p className="text-green-600 text-sm mt-1">Keren! Kamu telah menyelesaikan misi ini. Terus semangat!</p>
															</motion.div>
														)}

														{new Date(mission.task_date.replace(/(\d+)(st|nd|rd|th)/, '$1')) > todayDate && !mission.is_completed && (
															<motion.div
																initial={{
																	opacity: 0,
																	y: 10,
																}}
																animate={{
																	opacity: 1,
																	y: 0,
																}}
																className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
															>
																<div className="flex items-center gap-2">
																	<XCircle className="w-5 h-5 text-red-600" />
																	<span className="font-semibold text-red-700">Misi Terlewat</span>
																</div>
																<p className="text-red-600 text-sm mt-1">Sayang sekali, kamu belum menyelesaikan misi ini. Jangan khawatir, masih ada misi lain yang bisa kamu kerjakan!</p>
															</motion.div>
														)}
													</div>
												))}
											</div>
										</div>
									))
								) : (
									<p className="text-slate-500">Tidak ada tugas.</p>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{/* Pause & Cancel Program Section */}
				{programData.status === 'completed' ? (
					// Kartu Laporan Kelulusan (dengan Dialog)
					<Card className="mb-8 border-sky-200 shadow-lg bg-sky-50">
						<CardHeader>
							<CardTitle className="text-lg font-semibold text-sky-800 flex items-center gap-2">
								<Trophy className="w-5 h-5 text-sky-500" />
								Selamat, Program Telah Selesai!
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col items-center gap-4">
								<p className="text-center text-sky-700">Anda telah berhasil menyelesaikan program ini. Lihat laporan kelulusan Anda untuk melihat ringkasan pencapaian.</p>
								<Dialog open={showGradReport} onOpenChange={setShowGradReport}>
									<DialogTrigger asChild>
										<Button className="bg-sky-600 hover:bg-sky-700 w-full h-[48px] cursor-pointer" disabled={!graduationDetails}>
											{graduationDetails ? (
												<>
													<Award className="w-4 h-4 mr-2" />
													Lihat Laporan Kelulusan
												</>
											) : (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Memuat Laporan...
												</>
											)}
										</Button>
									</DialogTrigger>
									{/* Pastikan hanya render konten jika data sudah ada */}
									{graduationDetails && (
										<DialogContent className="min-w-[1000px] w-full">
											<GraduationDialogContent details={graduationDetails} />
										</DialogContent>
									)}
								</Dialog>
							</div>
						</CardContent>
					</Card>
				) : (
					<Card className="mb-8 border border-slate-200 shadow-sm bg-white">
						<CardHeader>
							<CardTitle className="text-lg font-semibold text-slate-900">Aksi Program</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col items-center gap-4">
								<Dialog>
									<DialogTrigger asChild className="justify-start w-full h-[40px] text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium cursor-pointer">
										<Button variant="outline" size="sm" disabled={!isProgramPaused && isProgramInactive} className="h-[48px]">
											<Pause className="w-4 h-4 mr-2" />
											{isProgramPaused ? 'Lanjutkan Program' : 'Jeda Program'}
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>{isProgramPaused ? 'Lanjutkan Program' : 'Jeda Program'}</DialogTitle>
											<DialogDescription>Yakin ingin menjeda program Kamu? Kamu bisa melanjutkannya nanti.</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<DialogClose asChild>
												<Button variant="secondary" className="cursor-pointer">
													Batal
												</Button>
											</DialogClose>
											<Button variant="destructive" onClick={() => handleUpdateProgramStatus(programData.slug)} className={`${isActiveLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
												{isActiveLoading ? (
													<div className="flex items-center gap-2">
														<Loader2 className="animate-spin h-4 w-4" />
														{isProgramPaused ? 'Melanjutkan Program' : 'Menjeda Program'}
													</div>
												) : (
													<p>{isProgramPaused ? 'Lanjutkan Program' : 'Jeda Program'}</p>
												)}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>

								<Dialog>
									<DialogTrigger asChild className="justify-start w-full h-[40px] text-red-600 border border-red-300 hover:bg-red-50 rounded-lg text-sm font-medium cursor-pointer">
										<Button variant="outline" size="sm" disabled={!isProgramPaused && isProgramInactive} className="h-[48px]">
											<Trash2 className="w-4 h-4 mr-2" />
											Batalkan Program
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Cancel Program</DialogTitle>
											<DialogDescription>Apakah Anda yakin ingin membatalkan program Kamu? Jika dibatalkan maka tidak dapat dipulihkan.</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<DialogClose asChild>
												<Button variant="secondary" className="cursor-pointer">
													Batal
												</Button>
											</DialogClose>
											<Button
												variant="destructive"
												onClick={() => {
													handleDeleteProgram(programData.slug);
												}}
												className={`${isActiveLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
											>
												{isActiveLoading ? (
													<div className="flex items-center gap-2">
														<Loader2 className="animate-spin h-4 w-4" />
														Menghapus Program
													</div>
												) : (
													'Hapus Program'
												)}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Weekly Tasks Section */}

				<DiscussionHub
					programSlug={programData.slug}
					discussions={programData.threads}
					onEditTitle={() => {}} // Sesuaikan dengan logika Anda
					onDeleteThread={() => {}} // Sesuaikan dengan logika Anda
					isReadOnly={isProgramInactive}
				/>
			</div>
		</div>
	);
}
