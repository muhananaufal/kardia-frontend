import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Activity, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/provider/AuthProvider';
import { regionMap } from '@/lib/data';
import { formatCountryName, formatGroupLabel } from '@/lib/utils';
import { newAnalysis, personalizeAnalysis } from '@/hooks/api/analysis';
import WarningCard from '@/components/fragments/warning-card';

// Types

const initialFormData: AnalysisFormData = {
	age: '',
	gender: '',
	smokingStatus: '',
	riskRegion: '',
	region: '',
	diabetesHistory: '',
	diabetesAge: '',
	healthProfile: {
		sbp: {
			inputType: '',
			manualValue: '',
			proxyAnswers: {},
			completed: false,
		},
		totalCholesterol: {
			inputType: '',
			manualValue: '',
			proxyAnswers: {},
			completed: false,
		},
		hdlCholesterol: {
			inputType: '',
			manualValue: '',
			proxyAnswers: {},
			completed: false,
		},
	},
};

const pageVariants = {
	initial: { opacity: 0, x: 100 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -100 },
};

const cardVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

export default function AnalisisPage() {
	const auth = useAuth();
	const token = auth?.token;
	const user = auth?.user;
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState<AnalysisFormData>(initialFormData);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingText, setLoadingText] = useState('');
	const [progress, setProgress] = useState(0);
	const [isProfileCompleted, setIsProfileCompleted] = useState(true);

	useEffect(() => {
		let interval: any;
		if (isLoading && progress < 90) {
			interval = setInterval(() => {
				setProgress((prev) => Math.min(prev + 1, 90));
			}, 600);
		}
		return () => clearInterval(interval);
	}, [isLoading, progress]);

	// initial age and gender and risk region set from user.date_of_birth and user.gender and user.country_of_residence
	useEffect(() => {
		if (user?.date_of_birth) {
			const [day, month, year] = user.date_of_birth.split('/');
			const birthDate = new Date(`${year}-${month}-${day}`);
			const today = new Date();
			const age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
				setFormData((prev) => ({ ...prev, age: (age - 1).toString() }));
			} else {
				setFormData((prev) => ({ ...prev, age: age.toString() }));
			}
		} else {
			setIsProfileCompleted(false);
		}

		if (user?.sex) {
			setFormData((prev) => ({
				...prev,
				gender: user.sex,
			}));
		} else {
			setIsProfileCompleted(false);
		}

		if (user?.country_of_residence) {
			setFormData((prev) => ({
				...prev,
				region: user.country_of_residence.toLowerCase(),
			}));
		} else {
			setIsProfileCompleted(false);
		}

		// categorise in risiko rendah, sedang, tinggi, sangat tinggi didapat dari regionMap
		if (user?.country_of_residence) {
			const region = Object.keys(regionMap).find((key) => regionMap[key as keyof typeof regionMap].includes(user.country_of_residence.toLowerCase()));

			if (region === 'very_high') {
				setFormData((prev) => ({
					...prev,
					riskRegion: 'Risiko Sangat Tinggi',
				}));
			} else if (region === 'high') {
				setFormData((prev) => ({
					...prev,
					riskRegion: 'Risiko Tinggi',
				}));
			} else if (region === 'moderate') {
				setFormData((prev) => ({
					...prev,
					riskRegion: 'Risiko Sedang',
				}));
			} else {
				setFormData((prev) => ({
					...prev,
					riskRegion: 'Risiko Rendah',
				}));
			}
		} else {
			setIsProfileCompleted(false);
		}
	}, [user]);

	useEffect(() => {
		if (formData.diabetesHistory === 'Ya') {
			setFormData((prev) => ({
				...prev,
				diabetesAge: prev.diabetesAge ?? '', // Jaga-jaga kalau belum diset
				healthProfile: {
					...prev.healthProfile,
					hba1c: {
						inputType: '',
						manualValue: '',
						proxyAnswers: {},
						completed: false,
					},
					serumCreatinine: {
						inputType: '',
						manualValue: '',
						proxyAnswers: {},
						completed: false,
					},
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				diabetesAge: '',
				healthProfile: {
					sbp: prev.healthProfile.sbp,
					totalCholesterol: prev.healthProfile.totalCholesterol,
					hdlCholesterol: prev.healthProfile.hdlCholesterol,
				},
			}));
		}
	}, [formData.diabetesHistory]);

	const proxyKeyMap: Record<string, string> = {
		// SBP
		familyHistory: 'q_fam_htn',
		sleepPattern: 'q_sleep_pattern',
		foodConsumption: 'q_salt_diet',
		stressResponse: 'q_stress_response',
		bodyShape: 'q_body_shape',
		exerciseFreq: 'q_exercise',

		// Total Cholesterol
		cookingOil: 'q_cooking_oil',
		exerciseType: 'q_exercise_type',
		fishConsumption: 'q_fish_intake',
		xanthelasma: 'q_xanthoma',

		// HDL Cholesterol
		healthyFatIntake: 'q_healthy_fat_intake',
		alcohol: 'q_alcohol',

		// HbA1c
		bloodSugarCheck: 'q_smbg_monitoring',
		medicationCompliance: 'q_adherence',

		// Serum Creatinine
		bodyType: 'q_body_type_for_scr',
		diabetesComplications: 'q_retinopathy_neuropathy',
		foamyUrine: 'q_foamy_urine',
		swelling: 'q_swelling',
		painMedication: 'q_nsaid_use',
	};

	const buildPayload = () => {
		const payload: any = {
			has_diabetes: formData.diabetesHistory === 'Ya',
			smoking_status: formData.smokingStatus,
		};

		if (formData.diabetesHistory === 'Ya') {
			payload.age_at_diabetes_diagnosis = parseInt(formData?.diabetesAge ?? '0');
		}

		const mapParam = (key: string, apiKey: string) => {
			const param = formData.healthProfile[key as keyof typeof formData.healthProfile];
			if (!param) return;

			payload[`${apiKey}_input_type`] = param.inputType;

			if (param.inputType === 'manual') {
				payload[`${apiKey}_value`] = parseFloat(param.manualValue ?? '0');
			} else if (param.inputType === 'proxy') {
				payload[`${apiKey}_proxy_answers`] = transformProxyAnswers(param.proxyAnswers ?? {});
			}
		};

		const transformProxyAnswers = (answers: Record<string, any>) => {
			const mapped: Record<string, any> = {};
			for (const key in answers) {
				const apiKey = proxyKeyMap[key];
				if (apiKey) {
					mapped[apiKey] = answers[key];
				}
			}
			return mapped;
		};

		mapParam('sbp', 'sbp');
		mapParam('totalCholesterol', 'tchol');
		mapParam('hdlCholesterol', 'hdl');

		if (formData.diabetesHistory === 'Ya') {
			mapParam('hba1c', 'hba1c');
			mapParam('serumCreatinine', 'scr');
		}

		return payload;
	};

	const isStep1Complete = () => {
		const required = ['age', 'gender', 'smokingStatus', 'riskRegion', 'diabetesHistory'];
		const basicComplete = required.every((field) => formData[field as keyof AnalysisFormData]);

		if (formData.diabetesHistory === 'Ya') {
			return basicComplete && formData.diabetesAge;
		}
		return basicComplete;
	};

	const isStep2Complete = () => {
		const requiredParams = ['sbp', 'totalCholesterol', 'hdlCholesterol'];
		let allComplete = requiredParams.every((param) => formData.healthProfile[param as keyof typeof formData.healthProfile]?.completed);

		if (formData.diabetesHistory === 'Ya') {
			allComplete = allComplete && (formData.healthProfile.hba1c?.completed ?? false) && (formData.healthProfile.serumCreatinine?.completed ?? false);
		}

		return allComplete;
	};

	const handleNext = () => {
		if (currentStep === 1 && isStep1Complete()) {
			setCurrentStep(2);
		} else if (currentStep === 2 && isStep2Complete()) {
			setCurrentStep(3);
			handleSubmit();
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setProgress(10);
		setLoadingText('Mempersiapkan analisis...');

		const payload = buildPayload();
		setProgress(20);
		setLoadingText('Mempersiapkan data untuk dikirim...');

		try {
			if (!token) {
				throw new Error('Token is required for this operation.');
			}

			const response = await newAnalysis(token, payload);

			setProgress(30);
			setLoadingText('Mengirim analisis Anda...');
			if (response) {
				setProgress(40);
				setLoadingText('Analisis berhasil dikirim. Menyiapkan personalisasi...');
				const personalize = await personalizeAnalysis(token, response.assessment_slug);

				if (personalize) {
					setProgress(90);
					setLoadingText('Analisis berhasil dipersonalisasi. Anda akan diarahkan ke halaman riwayat.');
					setProgress(100);
					setTimeout(() => {
						navigate('/dashboard/history');
					}, 2000);
				} else {
					setLoadingText('Personalisasi gagal. Silakan coba lagi.');
					setIsLoading(false);
				}
			} else {
				setLoadingText('Analisis gagal dikirim. Silakan coba lagi.');
				setIsLoading(false);
			}
		} catch (error) {
			setLoadingText('Gagal mengirim analisis. Silakan coba lagi.');
			console.error('Error submitting analysis:', error);
			// Optionally, you can show an error message to the user
		}
	};

	const updateFormData = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

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
		}));
	};

	if (isProfileCompleted === false) {
		return (
			<WarningCard
				title="Lengkapi Profil Anda"
				description="Untuk mendapatkan rekomendasi kesehatan yang lebih akurat, silakan lengkapi profil Anda. Ini akan membantu kami memahami kebutuhan kesehatan Anda dengan lebih baik."
				btnText="Lengkapi Profil"
				btnHref="/dashboard/profile"
			/>
		)
	}

	if (currentStep === 3) {
		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8">
				<Card className="max-w-md w-full bg-white shadow-sm rounded-2xl border border-gray-200">
					<CardContent className="p-4 md:p-6 lg:p-8 text-center space-y-6">
						<motion.div
							animate={{
								scale: [1, 1.1, 1],
								rotate: [0, 5, -5, 0],
							}}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'easeInOut',
							}}
							className="w-20 h-20 mx-auto bg-rose-100 rounded-full flex items-center justify-center"
						>
							<Heart className="h-10 w-10 text-rose-500" fill="currentColor" />
						</motion.div>

						<div className="space-y-2">
							<h2 className="text-xl font-semibold text-slate-800">Memproses Analisis Anda</h2>
							<motion.p key={loadingText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-slate-600">
								{loadingText}
							</motion.p>
						</div>

						<div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
							<motion.div
								className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
								animate={{ width: `${progress}%` }}
								transition={{
									duration: 0.6,
									ease: 'easeInOut',
								}}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	return (
		<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }} className="min-h-screen bg-white px-6 md:px-8 mt-[48px]">
			<div className="max-w-full mx-auto space-y-6 md:space-y-10">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-center space-y-4">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
						Langkah {currentStep} dari 3: {currentStep === 1 ? 'Informasi Dasar Anda' : 'Profil Kesehatan Anda'}
					</h1>
					<p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
						{currentStep === 1
							? 'Informasi ini penting untuk personalisasi dan pemilihan model analisis yang paling sesuai untuk Anda.'
							: 'Silakan masukkan angkanya jika Anda tahu. Jika tidak, pilih "Bantu Estimasi" dan kami akan memandunya.'}
					</p>
				</motion.div>

				{/* Progress Indicator */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center">
					{[1, 2, 3].map((step) => (
						<div key={step} className="flex items-center">
							<div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step <= currentStep ? 'bg-rose-500 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
								{step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
							</div>
							{step < 3 && <div className={`w-25 h-1 mx-2 transition-all duration-300 ${step < currentStep ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-slate-200'}`} />}
						</div>
					))}
				</motion.div>

				{/* Form Content */}
				<AnimatePresence mode="wait">
					{currentStep === 1 && <Step1Form formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} isComplete={isStep1Complete()} />}
					{currentStep === 2 && <Step2Form formData={formData} updateHealthParameter={updateHealthParameter} onNext={handleNext} onBack={handleBack} isComplete={isStep2Complete()} />}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}

// Step 1 Component
function Step1Form({ formData, updateFormData, onNext, onBack, isComplete }: any) {
	return (
		<motion.div key="step1" variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
			<Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-gray-200">
				<CardContent className="p-4 md:p-6 lg:p-8 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Age */}
						<div className="space-y-3">
							<Label htmlFor="age" className="text-sm font-medium text-gray-700">
								Usia Anda
							</Label>
							<div className="relative h-10 md:h-12">
								<Input
									id="age"
									type="number"
									disabled
									min="40"
									max="100"
									value={formData.age}
									onChange={(e) => updateFormData('age', e.target.value)}
									className="rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 h-10 md:h-12 text-base cursor-not-allowed"
									placeholder="Masukkan usia"
								/>
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">tahun</span>
							</div>
						</div>
						{/* Gender */}
						<div className="space-y-3">
							<Label className="text-sm font-medium text-gray-700">Jenis Kelamin</Label>
							{/* select and disabled */}
							<Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)} disabled>
								<SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 h-10 md:h-12 text-base">
									<SelectValue placeholder="Pilih jenis kelamin" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="male">Laki-laki</SelectItem>
									<SelectItem value="female">Perempuan</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Region */}
						<div className="space-y-3 col-span-1 md:col-span-2 mx-auto">
							{/* image risk map */}
							<img src="/images/risk_map.jpeg" alt="Peta Risiko Geografis" className="rounded-lg shadow-sm mb-4" />
						</div>
						<div className="space-y-3 w-full">
							<Label htmlFor="country_of_residence" className="text-sm font-medium text-gray-700">
								Negara Tempat Tinggal
							</Label>
							<Select value={formData.region} onValueChange={(value) => updateFormData('region', value)} disabled>
								<SelectTrigger className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
									<SelectValue placeholder="Pilih negara" />
								</SelectTrigger>
								<SelectContent>
									{/* --- MULAI PERUBAHAN --- */}
									{Object.entries(regionMap).map(([groupKey, countries]) => (
										<SelectGroup key={groupKey}>
											<SelectLabel>
												{/* Menggunakan fungsi helper untuk format label */}
												{formatGroupLabel(groupKey)}
											</SelectLabel>
											{countries.map((country) => (
												<SelectItem key={country} value={country}>
													{/* Menggunakan fungsi helper untuk format nama negara */}
													{formatCountryName(country)}
												</SelectItem>
											))}
										</SelectGroup>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Risk Region */}
						<div className="space-y-3">
							<Label className="text-sm font-medium text-gray-700">Wilayah Risiko Geografis Anda</Label>
							<Select value={formData.riskRegion} onValueChange={(value) => updateFormData('riskRegion', value)} disabled>
								<SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 h-10 md:h-12 text-base">
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
					</div>

					{/* Smoking Status */}
					<div className="space-y-3">
						<Label className="text-sm font-medium text-gray-700">Status Merokok Anda Saat Ini</Label>
						<RadioGroup value={formData.smokingStatus} onValueChange={(value) => updateFormData('smokingStatus', value)} className="space-y-3">
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Perokok aktif" id="smoker" className="cursor-pointer" />
								<Label htmlFor="smoker" className="cursor-pointer text-sm font-medium text-gray-700">
									Perokok aktif (termasuk vape)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Bukan perokok saat ini" id="nonsmoker" className="cursor-pointer" />
								<Label htmlFor="nonsmoker" className="cursor-pointer text-sm font-medium text-gray-700">
									Bukan perokok saat ini
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Diabetes History */}
					<div className="space-y-3">
						<Label className="text-sm font-medium text-gray-700">Apakah Anda memiliki riwayat Diabetes?</Label>
						<RadioGroup value={formData.diabetesHistory} onValueChange={(value) => updateFormData('diabetesHistory', value)} className="flex gap-6">
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Ya" id="diabetes-yes" className="cursor-pointer" />
								<Label htmlFor="diabetes-yes" className="cursor-pointer text-sm font-medium text-gray-700">
									Ya
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Tidak" id="diabetes-no" className="cursor-pointer" />
								<Label htmlFor="diabetes-no" className="cursor-pointer text-sm font-medium text-gray-700">
									Tidak
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Conditional Diabetes Age */}
					<AnimatePresence>
						{formData.diabetesHistory === 'Ya' && (
							<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
								<Label htmlFor="diabetesAge" className="text-sm font-medium text-gray-700">
									Pada usia berapa Anda didiagnosis?
								</Label>
								<div className="relative">
									<Input
										id="diabetesAge"
										type="number"
										min="1"
										max={formData.age}
										value={formData.diabetesAge}
										onChange={(e) => updateFormData('diabetesAge', e.target.value)}
										className="rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 h-10 md:h-12 text-base"
										placeholder="Masukkan usia diagnosis"
									/>
									<span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">tahun</span>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Navigation */}
					<div className="flex flex-col md:flex-row gap-3 justify-between pt-6">
						<Button
							variant="outline"
							onClick={onBack}
							disabled={true}
							className="bg-white text-rose-500 border border-rose-500 hover:bg-rose-50 font-medium shadow-sm hover:shadow-md transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide opacity-50 cursor-not-allowed"
						>
							<ChevronLeft className="h-4 w-4 mr-2" />
							Sebelumnya
						</Button>

						<Button
							onClick={onNext}
							disabled={!isComplete}
							className="bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide disabled:opacity-50 cursor-pointer"
						>
							Lanjut
							<ChevronRight className="h-4 w-4 ml-2" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// Step 2 Component
function Step2Form({ formData, updateHealthParameter, onNext, onBack, isComplete }: any) {
	const healthParameters = [
		{
			key: 'sbp',
			title: '1. Tekanan Darah Sistolik (SBP)',
			unit: 'mmHg',
			proxyQuestions: [
				{
					key: 'familyHistory',
					label: 'Riwayat hipertensi keluarga?',
					type: 'radio',
					options: ['Ya', 'Tidak', 'Tidak Tahu'],
				},
				{
					key: 'sleepPattern',
					label: 'Pola tidur?',
					type: 'radio',
					options: ['Nyenyak', 'Tidak Nyenyak', 'Insomnia'],
				},
				{
					key: 'foodConsumption',
					label: 'Konsumsi makanan sering?',
					type: 'checkbox',
					options: ['Mie instan', 'Daging olahan', 'Camilan asin'],
				},
				{
					key: 'stressResponse',
					label: 'Respons saat stres?',
					type: 'radio',
					options: ['Jantung berdebar', 'Sakit kepala', 'Tidak ada'],
				},
				{
					key: 'bodyShape',
					label: 'Bentuk tubuh?',
					type: 'radio',
					options: ['Perut buncit', 'Gemuk merata', 'Ideal'],
				},
				{
					key: 'exerciseFreq',
					label: 'Frekuensi olahraga?',
					type: 'radio',
					options: ['Rutin & Intens', 'Rutin ringan', 'Jarang'],
				},
			],
		},
		{
			key: 'totalCholesterol',
			title: '2. Kolesterol Total',
			unit: 'mmol/L',
			proxyQuestions: [
				{
					key: 'familyHistory',
					label: 'Riwayat kolesterol / penyakit jantung keluarga?',
					type: 'radio',
					options: ['Ya', 'Tidak', 'Tidak Tahu'],
				},
				{
					key: 'cookingOil',
					label: 'Minyak masak yang dominan?',
					type: 'radio',
					options: ['Sawit', 'Jagung', 'Zaitun'],
				},
				{
					key: 'exerciseType',
					label: 'Jenis olahraga dominan?',
					type: 'radio',
					options: ['Angkat beban', 'Lari', 'Jalan kaki', 'Tidak pernah'],
				},
				{
					key: 'fishConsumption',
					label: 'Konsumsi ikan laut berlemak?',
					type: 'radio',
					options: ['Sering', 'Kadang', 'Jarang'],
				},
				{
					key: 'xanthelasma',
					label: 'Xanthelasma?',
					type: 'radio',
					options: ['Ya', 'Tidak', 'Tidak yakin'],
				},
			],
		},
		{
			key: 'hdlCholesterol',
			title: '3. HDL Kolesterol',
			unit: 'mmol/L',
			proxyQuestions: [
				{
					key: 'familyHistory',
					label: 'Riwayat kolesterol / penyakit jantung keluarga?',
					type: 'radio',
					options: ['Ya', 'Tidak', 'Tidak Tahu'],
				},
				{
					key: 'cookingOil',
					label: 'Minyak masak yang dominan?',
					type: 'radio',
					options: ['Sawit', 'Jagung', 'Zaitun'],
				},
				{
					key: 'exerciseType',
					label: 'Jenis olahraga dominan?',
					type: 'radio',
					options: ['Angkat beban', 'Lari', 'Jalan kaki', 'Tidak pernah'],
				},
				{
					key: 'fishConsumption',
					label: 'Konsumsi ikan laut berlemak?',
					type: 'radio',
					options: ['Sering', 'Kadang', 'Jarang'],
				},
			],
		},
	];

	// Add diabetes-specific parameters
	if (formData.diabetesHistory === 'Ya') {
		healthParameters.push(
			{
				key: 'hba1c',
				title: '4. HbA1c',
				unit: '%',
				proxyQuestions: [
					{
						key: 'bloodSugarCheck',
						label: 'Frekuensi cek gula darah?',
						type: 'radio',
						options: ['Sesuai target', 'Di atas target', 'Jarang', 'Tidak pernah'],
					},
					{
						key: 'medicationCompliance',
						label: 'Kepatuhan obat & diet?',
						type: 'radio',
						options: ['Disiplin keduanya', 'Disiplin obat saja', 'Lupa obat', 'Kurang disiplin keduanya'],
					},
				],
			},
			{
				key: 'serumCreatinine',
				title: '5. Serum Creatinine',
				unit: 'μmol/L',
				proxyQuestions: [
					{
						key: 'bodyType',
						label: 'Tipe tubuh?',
						type: 'radio',
						options: ['Sangat berotot', 'Atletis', 'Rata-rata', 'Kurus'],
					},
					{
						key: 'diabetesComplications',
						label: 'Komplikasi diabetes (mata/syaraf)?',
						type: 'radio',
						options: ['Ya', 'Tidak', 'Tidak tahu'],
					},
					{
						key: 'foamyUrine',
						label: 'Urine berbusa?',
						type: 'radio',
						options: ['Sering', 'Kadang', 'Tidak'],
					},
					{
						key: 'swelling',
						label: 'Pembengkakan di mata/kaki?',
						type: 'radio',
						options: ['Sering', 'Kadang', 'Tidak'],
					},
					{
						key: 'painMedication',
						label: 'Konsumsi obat nyeri non-paracetamol?',
						type: 'radio',
						options: ['Sering', 'Cukup', 'Jarang'],
					},
				],
			}
		);
	}

	const handleParamUpdate = (paramKey: string, updates: Partial<HealthParameter>) => {
		updateHealthParameter(paramKey, updates);

		const keysToSync = ['familyHistory', 'cookingOil', 'exerciseType', 'fishConsumption'];
		const isSyncableParam = paramKey === 'totalCholesterol' || paramKey === 'hdlCholesterol';

		if (isSyncableParam && updates.proxyAnswers) {
			const oldAnswers = formData.healthProfile[paramKey as keyof typeof formData.healthProfile]?.proxyAnswers || {};
			const newAnswers = updates.proxyAnswers;

			const allKeys = new Set([...Object.keys(oldAnswers), ...Object.keys(newAnswers)]);
			let changedKey: string | null = null;
			for (const key of allKeys) {
				if (JSON.stringify(oldAnswers[key]) !== JSON.stringify(newAnswers[key])) {
					changedKey = key;
					break;
				}
			}

			if (changedKey && keysToSync.includes(changedKey)) {
				const targetParamKey = paramKey === 'totalCholesterol' ? 'hdlCholesterol' : 'totalCholesterol';
				const valueToSync = newAnswers[changedKey as keyof typeof newAnswers];

				const targetParamData = formData.healthProfile[targetParamKey as keyof typeof formData.healthProfile];

				if (targetParamData && targetParamData.inputType === 'proxy') {
					const newTargetProxyAnswers = {
						...targetParamData.proxyAnswers,
						[changedKey]: valueToSync,
					};

					const targetParamDefinition = healthParameters.find((p) => p.key === targetParamKey);
					const allAnswered =
						targetParamDefinition?.proxyQuestions.every(
							(q: any) => newTargetProxyAnswers[q.key] !== undefined && newTargetProxyAnswers[q.key] !== '' && (Array.isArray(newTargetProxyAnswers[q.key]) ? newTargetProxyAnswers[q.key].length > 0 : true)
						) ?? false;

					updateHealthParameter(targetParamKey, {
						proxyAnswers: newTargetProxyAnswers,
						completed: allAnswered,
					});
				}
			}
		}
	};

	return (
		<motion.div key="step2" variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
			{healthParameters.map((param, index) => (
				<HealthParameterCard
					key={param.key}
					parameter={param}
					data={formData.healthProfile[param.key as keyof typeof formData.healthProfile]}
					onUpdate={(updates: Partial<HealthParameter>) => handleParamUpdate(param.key, updates)}
					index={index}
					total={healthParameters.length}
				/>
			))}

			{/* Navigation */}
			<Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-gray-200">
				<CardContent className="p-4 md:p-6 lg:p-8">
					<div className="flex flex-col md:flex-row gap-3 justify-between">
						<Button
							variant="outline"
							onClick={onBack}
							className="bg-white text-rose-500 border border-rose-500 hover:bg-rose-50 font-medium shadow-sm hover:shadow-md transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide cursor-pointer"
						>
							<ChevronLeft className="h-4 w-4 mr-2" />
							Sebelumnya
						</Button>

						<Button
							onClick={onNext}
							disabled={!isComplete}
							className="bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-300 rounded-lg h-10 md:h-12 px-6 text-sm uppercase tracking-wide disabled:opacity-50 cursor-pointer"
						>
							Selesai & Lihat Hasil Analisis Saya
							<Activity className="h-4 w-4 ml-2" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// Health Parameter Card Component
function HealthParameterCard({ parameter, data, onUpdate, index, total }: any) {
	const handleMethodChange = (inputType: 'manual' | 'proxy') => {
		onUpdate({
			inputType,
			manualValue: '',
			proxyAnswers: {},
			completed: false,
		});
	};

	const handleManualValueChange = (value: string) => {
		onUpdate({
			manualValue: value,
			completed: value.trim() !== '',
		});
	};

	const handleProxyAnswerChange = (questionKey: string, value: any) => {
		const newProxyAnswers = { ...data.proxyAnswers, [questionKey]: value };

		const allAnswered = parameter.proxyQuestions.every((q: any) => newProxyAnswers[q.key] !== undefined && newProxyAnswers[q.key] !== '');

		onUpdate({
			proxyAnswers: newProxyAnswers,
			completed: allAnswered,
		});
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
			<Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-gray-200 overflow-hidden">
				<CardHeader className="border-b border-slate-200/50">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg text-slate-800">
							{parameter.title}
							<Badge variant="outline" className="text-xs capitalize ml-2">
								{data.inputType || 'Belum dipilih'}
							</Badge>
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="text-xs">
								{index + 1}/{total}
							</Badge>
							{data.completed && <CheckCircle className="h-5 w-5 text-rose-500" />}
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-4 md:p-6 lg:p-8 space-y-6">
					{/* Method Selection */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button
							onClick={() => handleMethodChange('manual')}
							className={`flex-1 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 h-10 md:h-12 px-6 text-sm uppercase tracking-wide cursor-pointer
                                ${data.inputType === 'manual' ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-white text-rose-500 border border-rose-500 hover:bg-rose-50'}`}
						>
							Saya Tahu Angkanya
						</Button>

						<Button
							onClick={() => handleMethodChange('proxy')}
							className={`flex-1 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 h-10 md:h-12 px-6 text-sm uppercase tracking-wide cursor-pointer
                                ${data.inputType === 'proxy' ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-white text-rose-500 border border-rose-500 hover:bg-rose-50'}`}
						>
							Bantu Estimasi
						</Button>
					</div>

					{/* Manual Input */}
					<AnimatePresence>
						{data.inputType === 'manual' && (
							<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
								<Label className="text-sm font-medium text-gray-700">Masukkan nilai {parameter.title.split('.')[1]}</Label>
								<div className="relative">
									<Input
										type="number"
										step="0.1"
										value={data.manualValue}
										onChange={(e) => handleManualValueChange(e.target.value)}
										className="rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 h-10 md:h-12 text-base"
										placeholder={(() => {
											switch (parameter.key) {
												case 'sbp':
													return '50 - 300 (mmHg)';
												case 'totalCholesterol':
													return '1 - 20 (mmol/L)';
												case 'hdlCholesterol':
													return '0.1 - 5 (mmol/L)';
												case 'hba1c':
													return '20 - 200 (mmol/mol)';
												case 'serumCreatinine':
													return '0.1 - 15 (mg/dL)';
												default:
													return 'Masukkan nilai';
											}
										})()}
									/>
									<span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{parameter.unit}</span>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Proxy Questions */}
					<AnimatePresence>
						{data.inputType === 'proxy' && (
							<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
								{parameter.proxyQuestions.map((question: any, qIndex: number) => (
									<motion.div key={question.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: qIndex * 0.1 }} className="space-y-3">
										<Label className="text-sm font-medium text-gray-700">{question.label}</Label>

										{question.type === 'radio' && (
											<RadioGroup value={data.proxyAnswers[question.key] || ''} onValueChange={(value) => handleProxyAnswerChange(question.key, value)} className="space-y-2">
												{question.options.map((option: string) => (
													<div key={option} className="flex items-center space-x-2">
														<RadioGroupItem value={option} id={`${parameter.key}-${question.key}-${option}`} className="cursor-pointer" />
														<Label htmlFor={`${parameter.key}-${question.key}-${option}`} className="cursor-pointer text-sm">
															{option}
														</Label>
													</div>
												))}
											</RadioGroup>
										)}

										{question.type === 'checkbox' && (
											<div className="space-y-2">
												{question.options.map((option: string) => (
													<div key={option} className="flex items-center space-x-2">
														<Checkbox
															id={`${parameter.key}-${question.key}-${option}`}
															checked={(data.proxyAnswers[question.key] || []).includes(option)}
															onCheckedChange={(checked) => {
																const currentValues = data.proxyAnswers[question.key] || [];
																const newValues = checked ? [...currentValues, option] : currentValues.filter((v: string) => v !== option);
																handleProxyAnswerChange(question.key, newValues);
															}}
														/>
														<Label htmlFor={`${parameter.key}-${question.key}-${option}`} className="cursor-pointer text-sm">
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
	);
}
