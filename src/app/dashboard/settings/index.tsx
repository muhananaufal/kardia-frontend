import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Palette, Globe, Save, Edit3, LockIcon, UserX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/provider/AuthProvider';
import { regionMap } from '@/lib/data';
import { formatCountryName, formatGroupLabel } from '@/lib/utils';
import { deleteAccount, resetPassword, updateProfile } from '@/hooks/api/auth';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

const passwordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters' })
			.regex(/[A-Z]/, {
				message: 'Password must contain at least one uppercase letter',
			})
			.regex(/[a-z]/, {
				message: 'Password must contain at least one lowercase letter',
			})
			.regex(/[0-9]/, { message: 'Password must contain at least one number' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
	const auth = useAuth();
	const token = auth?.token;
	const user = auth?.user;
	const navigate = useNavigate();

	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState<User>(
		user || {
			age: 0,
			country_of_residence: '',
			date_of_birth: '',
			email: '',
			first_name: '',
			language: '',
			last_name: '',
			risk_region: '',
			sex: '',
		}
	);

	// const [notifications, setNotifications] = useState({
	//     analysisReminder: true,
	//     healthTips: true,
	//     riskAlerts: true,
	//     emailNotifications: false,
	//     pushNotifications: true,
	// });

	const [preferences, setPreferences] = useState({
		language: 'id',
		theme: 'light',
		timezone: 'Asia/Jakarta',
	});

	const [passwordForm, setPasswordForm] = useState<PasswordFormValues>({
		password: '',
		confirmPassword: '',
	});

	const [passwordDeleteForm, setPasswordDeleteForm] = useState('');
	// State untuk menampung error validasi
	const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormValues, string>>>({});
	// State untuk loading saat submit
	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDialogDelete, setIsDialogDelete] = useState(false);

	const handleDeleteAccount = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({}); // Reset error sebelum validasi baru
		setIsLoading(true);

		try {
			if (!token || !user?.email) {
				console.error('Token atau email pengguna tidak tersedia.');
				setIsLoading(false);
				setErrors({ password: 'Token atau email pengguna tidak tersedia.' });
				return;
			}

			await deleteAccount(token, passwordDeleteForm);

			setIsLoading(false);
			setIsDialogDelete(false); // Tutup dialog
			auth?.resetContext();
			navigate('/login'); // Redirect ke halaman login setelah menghapus akun
		} catch (error) {
			console.error('Failed to delete account:', error);
			setIsLoading(false);
			// Optionally, you can set a generic error message
			setErrors({ password: 'Failed to delete account. Please try again later.' });
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({}); // Reset error sebelum validasi baru
		setIsLoading(true);

		// Validasi dengan Zod
		const validationResult = passwordSchema.safeParse(passwordForm);

		if (!validationResult.success) {
			// Jika validasi gagal, format dan set error
			const formattedErrors: Partial<Record<keyof PasswordFormValues, string>> = {};
			validationResult.error.errors.forEach((err) => {
				if (err.path[0]) {
					formattedErrors[err.path[0] as keyof PasswordFormValues] = err.message;
				}
			});
			setErrors(formattedErrors);
			setIsLoading(false);
			return;
		}

		try {
			if (!token || !user?.email) {
				console.error('Token atau email pengguna tidak tersedia.');
				setIsLoading(false);
				setErrors({ password: 'Token atau email pengguna tidak tersedia.' });
				return;
			}

			await resetPassword(token, user?.email, passwordForm.password, passwordForm.confirmPassword);

			setIsLoading(false);
			setIsDialogOpen(false); // Tutup dialog
            setPasswordForm({ password: '', confirmPassword: '' });
            toast.success('Password berhasil direset!');
		} catch {
			setIsLoading(false);
			// Optionally, you can set a generic error message
            setErrors({ password: 'Gagal mereset password. Silakan coba lagi.' });
            toast.error('Gagal mereset password. Silakan coba lagi.');
		}
	};

	const handleSaveProfile = async () => {
		try {
			if (token) {
				const response = await updateProfile(token, profileData);
				console.log('Profile updated successfully:', response);
			} else {
				console.error('Token is missing. Cannot update profile.');
			}
			console.log('Profile updated successfully', profileData);
			setIsEditing(false);
            auth?.refreshUserProfile(); // Refresh user profile after update
            toast.success('Profil berhasil diperbarui!');
		} catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Gagal memperbarui profil. Silakan coba lagi.');
			// Optionally, you can show an error message to the user
		}
	};

	// const handleNotificationChange = (key: string, value: boolean) => {
	//     setNotifications((prev) => ({ ...prev, [key]: value }));
	// };

	const handlePreferenceChange = (key: string, value: string) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
        toast.success(`Preferensi ${key} berhasil diperbarui!`);
	};

	const formatDateForInput = (dateString: any) => {
		if (!dateString) return ''; // Kembalikan string kosong jika tidak ada tanggal

		const date = new Date(dateString);
		if (isNaN(date.getTime())) return ''; // Kembalikan string kosong jika tanggal tidak valid

		const year = date.getFullYear();
		const month = String(date.getDate()).padStart(2, '0'); // padStart untuk menambahkan '0'
		const day = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() 0-indexed, jadi +1 dan padStart

		return `${year}-${month}-${day}`;
	};

	// set language ke profile data ketika preferences berubah
	useEffect(() => {
		setProfileData((prev) => ({
			...prev,
			language: preferences.language,
		}));
	}, [preferences.language]);

	return (
		<div className="min-h-screen bg-white">
			<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }} className="max-w-4xl md:max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pengaturan</h1>
					<p className="text-base md:text-lg text-gray-600 leading-relaxed">Kelola profil dan preferensi akun Anda</p>
				</motion.div>

				{/* Profile Section */}
				<motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
					<Card className="gap-3 rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all duration-300">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<User className="h-6 w-6 text-rose-500" />
									<div>
										<CardTitle className="text-base md:text-lg font-bold text-gray-900">Profil Pengguna</CardTitle>
										<CardDescription className="text-sm md:text-base text-gray-600">Informasi dasar akun Anda</CardDescription>
									</div>
								</div>
								<Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="bg-white text-rose-500 border border-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium uppercase tracking-wide  cursor-pointer">
									<Edit3 className="h-4 w-4 mr-2" />
									{isEditing ? 'Batal' : 'Edit'}
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center gap-6">
								<Avatar className="w-20 h-20">
									<AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
									<AvatarFallback className="bg-rose-500 text-white text-3xl font-semibold">
										{profileData.first_name?.charAt(0).toUpperCase() || 'U'}
										{profileData.last_name?.charAt(0).toUpperCase() || ''}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h3 className="text-base md:text-lg font-bold text-gray-900">{`${profileData?.first_name} ${profileData?.last_name}` || 'Nama tidak tersedia'}</h3>
									<p className="text-sm md:text-base text-gray-600">{profileData.email}</p>
									<Badge className="bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 text-xs font-medium uppercase tracking-wide mt-2">Pengguna Aktif</Badge>
								</div>
							</div>

							<Separator />

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="name" className="text-sm font-medium text-gray-700">
										Nama Depan
									</Label>
									<Input
										id="name"
										value={profileData.first_name}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												first_name: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base h-[48px]"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="name" className="text-sm font-medium text-gray-700">
										Nama Belakang
									</Label>
									<Input
										id="name"
										value={profileData.last_name}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												last_name: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base h-[48px]"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium text-gray-700">
										Email
									</Label>
									<Input
										id="email"
										type="email"
										value={profileData.email}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base h-[48px]"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">
										Tanggal Lahir
									</Label>
									<Input
										id="date_of_birth"
										type="date"
										value={formatDateForInput(profileData.date_of_birth)}
										onChange={(e) =>
											setProfileData((prev) => ({
												...prev,
												date_of_birth: e.target.value,
											}))
										}
										disabled={!isEditing}
										className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base  cursor-pointer h-[48px]"
									/>
								</div>

								<div className="space-y-2 w-full">
									{/* gender */}
									<Label htmlFor="sex" className="text-sm font-medium text-gray-700">
										Jenis Kelamin
									</Label>
									<Select
										value={profileData.sex}
										onValueChange={(value) =>
											setProfileData((prev) => ({
												...prev,
												sex: value,
											}))
										}
										disabled={!isEditing}
									>
										<SelectTrigger className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500  cursor-pointer">
											<SelectValue placeholder="Pilih jenis kelamin" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male" className=" cursor-pointer">
												Laki-laki
											</SelectItem>
											<SelectItem value="female" className=" cursor-pointer">
												Perempuan
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Tempat tinggal berdasarkan region Mapping dengan grouping select */}
								<div className="space-y-2 w-full">
									<Label htmlFor="country_of_residence" className="text-sm font-medium text-gray-700">
										Negara Tempat Tinggal
									</Label>
									<Select
										value={profileData.country_of_residence}
										onValueChange={(value) =>
											setProfileData((prev) => ({
												...prev,
												country_of_residence: value,
											}))
										}
										disabled={!isEditing}
									>
										<SelectTrigger className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500  cursor-pointer">
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
														<SelectItem key={country} value={country} className=" cursor-pointer">
															{/* Menggunakan fungsi helper untuk format nama negara */}
															{formatCountryName(country)}
														</SelectItem>
													))}
												</SelectGroup>
											))}
											{/* --- AKHIR PERUBAHAN --- */}
										</SelectContent>
									</Select>
								</div>
							</div>

							{isEditing && (
								<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
									<Button onClick={handleSaveProfile} className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium uppercase tracking-wide cursor-pointer">
										<Save className="h-4 w-4 mr-2" />
										Simpan Perubahan
									</Button>
								</motion.div>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Notifications Section */}
				{/* <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.3 }}
                >
                    <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <Bell className="h-6 w-6 text-rose-500" />
                                <div>
                                    <CardTitle className="text-base md:text-lg font-bold text-gray-900">
                                        Notifikasi
                                    </CardTitle>
                                    <CardDescription className="text-sm md:text-base text-gray-600">
                                        Atur preferensi notifikasi Anda
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm md:text-base font-medium text-gray-900">
                                            Pengingat Analisis
                                        </Label>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Dapatkan pengingat untuk melakukan
                                            analisis rutin
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.analysisReminder}
                                        onCheckedChange={(value: boolean) =>
                                            handleNotificationChange(
                                                "analysisReminder",
                                                value
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm md:text-base font-medium text-gray-900">
                                            Tips Kesehatan
                                        </Label>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Terima tips kesehatan jantung harian
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.healthTips}
                                        onCheckedChange={(value: boolean) =>
                                            handleNotificationChange(
                                                "healthTips",
                                                value
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm md:text-base font-medium text-gray-900">
                                            Peringatan Risiko
                                        </Label>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Notifikasi jika terdeteksi risiko
                                            tinggi
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.riskAlerts}
                                        onCheckedChange={(value: boolean) =>
                                            handleNotificationChange(
                                                "riskAlerts",
                                                value
                                            )
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm md:text-base font-medium text-gray-900">
                                            Notifikasi Email
                                        </Label>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Terima notifikasi melalui email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={
                                            notifications.emailNotifications
                                        }
                                        onCheckedChange={(value: boolean) =>
                                            handleNotificationChange(
                                                "emailNotifications",
                                                value
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm md:text-base font-medium text-gray-900">
                                            Push Notifications
                                        </Label>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Notifikasi langsung di perangkat
                                        </p>
                                    </div>
                                    <Switch
                                        checked={
                                            notifications.pushNotifications
                                        }
                                        onCheckedChange={(value: boolean) =>
                                            handleNotificationChange(
                                                "pushNotifications",
                                                value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div> */}

				{/* Preferences Section */}
				<motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
					<Card className="gap-3 rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all duration-300">
						<CardHeader>
							<div className="flex items-center gap-3">
								<Palette className="h-6 w-6 text-rose-500" />
								<div>
									<CardTitle className="text-base md:text-lg font-bold text-gray-900">Preferensi</CardTitle>
									<CardDescription className="text-sm md:text-base text-gray-600">Sesuaikan pengalaman aplikasi Anda</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-1">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2 col-span-2">
									<Label className="text-sm font-medium text-gray-700">Bahasa</Label>
									<Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
										<SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 w-full cursor-pointer">
											<Globe className="h-4 w-4 mr-2" />
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="id" className="cursor-pointer">
												Bahasa Indonesia
											</SelectItem>
											<SelectItem value="en" className="cursor-pointer">
												English
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Tema
                                    </Label>
                                    <Select
                                        value={preferences.theme}
                                        onValueChange={(value) =>
                                            handlePreferenceChange(
                                                "theme",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 w-full">
                                            <Palette className="h-4 w-4 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">
                                                Terang
                                            </SelectItem>
                                            <SelectItem value="dark">
                                                Gelap
                                            </SelectItem>
                                            <SelectItem value="auto">
                                                Otomatis
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div> */}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Security & Privacy Section */}
				<motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.5 }}>
					<Card className="gap-3 rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all duration-300">
						<CardHeader>
							<div className="flex items-center gap-3">
								<Shield className="h-6 w-6 text-rose-500" />
								<div>
									<CardTitle className="text-base md:text-lg font-bold text-gray-900">Keamanan & Privasi</CardTitle>
									<CardDescription className="text-sm md:text-base text-gray-600">Kelola keamanan akun Anda</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
								<DialogTrigger asChild>
									<Button variant="outline" className="w-full justify-start bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium cursor-pointer h-[48px]">
										<Shield className="h-4 w-4 mr-2" />
										Ubah Password
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
											<LockIcon className="text-primary h-6 w-6" />
										</div>
										<DialogTitle className="text-center">Ubah Password</DialogTitle>
										<DialogDescription className="text-center">Buat password baru untuk akun Anda</DialogDescription>
									</DialogHeader>
									<form onSubmit={handlePasswordSubmit}>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="password">Password Baru</Label>
												<Input
													id="password"
													name="password"
													type="password"
													value={passwordForm.password}
													onChange={(e) => {
														setPasswordForm((prev) => ({
															...prev,
															password: e.target.value,
														}));
													}}
													className={errors.password ? 'border-red-500' : ''}
												/>
												{errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
											</div>
											<div className="grid gap-2">
												<Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
												<Input
													id="confirmPassword"
													name="confirmPassword"
													type="password"
													value={passwordForm.confirmPassword}
													onChange={(e) => {
														setPasswordForm((prev) => ({
															...prev,
															confirmPassword: e.target.value,
														}));
													}}
													className={errors.confirmPassword ? 'border-red-500' : ''}
												/>
												{errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
											</div>
										</div>
										<DialogFooter>
											<DialogClose asChild>
												<Button type="button" variant="outline" className='cursor-pointer'>
													Batal
												</Button>
											</DialogClose>
											<Button type="submit" disabled={isLoading} className="bg-rose-500 hover:bg-rose-600 cursor-pointer">
												{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>

							{/* <Button variant="outline" className="w-full justify-start bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium">
								<HelpCircle className="h-4 w-4 mr-2" />
								Kebijakan Privasi
							</Button> */}
							<Dialog open={isDialogDelete} onOpenChange={setIsDialogDelete}>
								<DialogTrigger asChild>
									<Button variant="outline" className="w-full justify-start text-red-600 border border-red-300 hover:bg-red-50 rounded-lg text-sm font-medium cursor-pointer h-[48px]">
										<UserX className="h-4 w-4 mr-2" />
										Hapus Akun
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
											<LockIcon className="text-primary h-6 w-6" />
										</div>
										<DialogTitle className="text-center">Hapus Akun</DialogTitle>
										<DialogDescription className="text-center">Ketik password anda untuk mengonfirmasi penghapusan akun Anda. Tindakan ini tidak dapat dibatalkan.</DialogDescription>
									</DialogHeader>
									<form onSubmit={handleDeleteAccount}>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="password">Password</Label>
												<Input
													id="password"
													name="password"
													type="password"
													value={passwordDeleteForm}
													onChange={(e) => {
														setPasswordDeleteForm(e.target.value);
													}}
													className={errors.password ? 'border-red-500' : ''}
												/>
												{errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
											</div>
										</div>
										<DialogFooter>
											<DialogClose asChild>
												<Button type="button" variant="outline">
													Batal
												</Button>
											</DialogClose>
											<Button type="submit" disabled={isLoading} className="bg-rose-500 hover:bg-rose-600">
												{isLoading ? 'Menghapus...' : 'Hapus Akun'}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
                            
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</div>
	);
}
