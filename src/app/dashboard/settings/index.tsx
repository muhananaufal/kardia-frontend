/* eslint-disable no-useless-escape */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Palette, Globe, Save, Edit3, Sun, Moon, Laptop, KeyRound, Loader2, AlertTriangle, EyeOff, Eye, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/provider/AuthProvider';
import { regionMap } from '@/lib/data';
import { formatCountryName, formatGroupLabel } from '@/lib/utils';
import { deleteAccount, resetPassword, updateProfile } from '@/hooks/api/auth';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// --- ANIMATION VARIANTS ---
const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// --- ZOD SCHEMA FOR PASSWORD VALIDATION ---
const getPasswordStrength = (password: string) => {
	const checks = [
		{ label: 'Minimal 8 karakter', test: password.length >= 8 },
		{ label: 'Satu huruf kapital', test: /[A-Z]/.test(password) },
		{ label: 'Satu huruf kecil', test: /[a-z]/.test(password) },
		{ label: 'Satu angka', test: /[0-9]/.test(password) },
		{ label: 'Satu simbol', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
	];

	const passedChecks = checks.filter((check) => check.test).length;
	return { checks, strength: passedChecks };
};

const changePasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password harus minimal 8 karakter' })
			.regex(/[A-Z]/, { message: 'Password harus memiliki setidaknya satu huruf kapital' })
			.regex(/[a-z]/, { message: 'Password harus memiliki setidaknya satu huruf kecil' })
			.regex(/[0-9]/, { message: 'Password harus memiliki setidaknya satu angka' })
			.regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
				message: 'Password harus memiliki setidaknya satu simbol',
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Konfirmasi password tidak cocok',
		path: ['confirmPassword'],
	});

type PasswordFormValues = z.infer<typeof changePasswordSchema>;

// --- HELPER COMPONENT FOR CONSISTENT SETTINGS ROWS ---
const SettingsRow = ({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) => (
	<div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors">
		<div className="flex items-center gap-4">
			<Icon className="h-5 w-5 text-gray-500" />
			<div>
				<h4 className="font-semibold text-gray-800">{title}</h4>
				<p className="text-sm text-gray-500">{description}</p>
			</div>
		</div>
		<div>{children}</div>
	</div>
);

// --- MAIN SETTINGS PAGE COMPONENT ---
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

	const [preferences, setPreferences] = useState({
		language: user?.language || 'id',
		theme: 'system', // New theme preference
		timezone: 'Asia/Jakarta',
	});

	// const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false); // New 2FA state

	const [passwordForm, setPasswordForm] = useState<PasswordFormValues>({ password: '', confirmPassword: '' });
	const [passwordDelete, setPasswordDelete] = useState('');
	const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormValues, string>>>({});
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);

	// --- BARU: State untuk UI Password ---
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showPasswordStrength, setShowPasswordStrength] = useState(false);

	// --- BARU: Hitung kekuatan password setiap kali berubah ---
	const passwordStrength = getPasswordStrength(passwordForm.password);

	// Sync local state if auth user changes
	useEffect(() => {
		if (user) {
			setProfileData(user);
			setPreferences((prev) => ({ ...prev, language: user.language || 'id' }));
		}
	}, [user]);

	const handleSaveProfile = async () => {
		if (!token) {
			toast.error('Sesi tidak valid. Silakan login kembali.');
			return;
		}
		setIsSavingProfile(true);
		try {
			await updateProfile(token, profileData);
			setIsEditing(false);
			auth?.refreshUserProfile();
			toast.success('Profil berhasil diperbarui!');
		} catch (error) {
			console.error('Failed to update profile:', error);
			toast.error('Gagal memperbarui profil. Silakan coba lagi.');
		} finally {
			setIsSavingProfile(false);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const validation = changePasswordSchema.safeParse(passwordForm);
		if (!validation.success) {
			const formattedErrors: Partial<Record<keyof PasswordFormValues, string>> = {};
			validation.error.errors.forEach((err) => {
				if (err.path[0]) formattedErrors[err.path[0] as keyof PasswordFormValues] = err.message;
			});
			setErrors(formattedErrors);
			return;
		}

		if (!token || !user?.email) {
			toast.error('Sesi tidak valid. Silakan login kembali.');
			return;
		}

		setIsChangingPassword(true);
		try {
			await resetPassword(token, user.email, passwordForm.password, passwordForm.confirmPassword);
			toast.success('Password berhasil diperbarui!');
			(document.getElementById('close-password-dialog') as HTMLButtonElement)?.click();
			setPasswordForm({ password: '', confirmPassword: '' });
			setShowPasswordStrength(false);
		} catch (error) {
			console.error('Failed to reset password:', error);
			toast.error('Gagal memperbarui password. Pastikan password lama benar.');
			setErrors({ password: 'Gagal memperbarui password.' });
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleDeleteAccount = async (e: React.FormEvent) => {
		e.preventDefault();
		setDeleteError(null);
		if (!passwordDelete) {
			setDeleteError('Password diperlukan untuk konfirmasi.');
			return;
		}
		if (!token) {
			toast.error('Sesi tidak valid. Silakan login kembali.');
			return;
		}

		setIsDeletingAccount(true);
		try {
			await deleteAccount(token, passwordDelete);
			toast.success('Akun berhasil dihapus. Anda akan dialihkan.');
			setTimeout(() => {
				auth?.resetContext();
				navigate('/login');
			}, 2000);
		} catch (error) {
			console.error('Failed to delete account:', error);
			toast.error('Gagal menghapus akun. Password salah.');
			setDeleteError('Password yang Anda masukkan salah.');
		} finally {
			setIsDeletingAccount(false);
		}
	};

	const formatDateForInput = (dateString: string | null) => {
		if (!dateString) return '';
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) return '';
			return date.toISOString().split('T')[0];
		} catch {
			return '';
		}
	};

	return (
		<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto px-4 py-10 space-y-10">
			{/* --- HEADER --- */}
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
				<h1 className="text-3xl font-bold text-gray-900">Pengaturan Akun</h1>
				<p className="text-lg text-gray-500 mt-1">Kelola profil, preferensi, dan keamanan akun Anda.</p>
			</motion.div>

			{/* --- PROFILE SECTION --- */}
			<Card className="rounded-xl shadow-sm border-gray-200 overflow-hidden">
				<CardHeader className="bg-slate-50/70 border-b">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<User className="h-6 w-6 text-rose-600" />
							<div>
								<CardTitle className="text-lg font-bold">Profil Pengguna</CardTitle>
								<CardDescription>Informasi ini akan ditampilkan di profil Anda.</CardDescription>
							</div>
						</div>
						<Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="font-semibold cursor-pointer">
							<Edit3 className="h-4 w-4 mr-2" /> {isEditing ? 'Batal' : 'Edit Profil'}
						</Button>
					</div>
				</CardHeader>
				<CardContent className="p-6 space-y-6">
					<div className="flex gap-6 justify-center items-center">
						<div className="relative">
							<Avatar className="w-24 h-24 border-2 border-white shadow-md">
								<AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
								<AvatarFallback className="bg-rose-500 text-white text-4xl font-semibold">
									{user?.first_name?.charAt(0).toUpperCase() || 'U'}
									{user?.last_name?.charAt(0).toUpperCase() || ''}
								</AvatarFallback>
							</Avatar>
							{/* {isEditing && (
								<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-0 right-0 bg-white rounded-full p-1 border shadow-md">
									<Button size="icon" variant="ghost" className="w-8 h-8 rounded-full">
										<Upload className="w-4 h-4 text-gray-600" />
									</Button>
								</motion.div>
							)} */}
						</div>
						<div className="flex-1 mt-2">
							<h3 className="text-2xl font-bold text-gray-800">{`${profileData.first_name} ${profileData.last_name}`}</h3>
							<p className="text-gray-500">{profileData.email}</p>
						</div>
					</div>
					<Separator />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
						{/* First Name */}
						<div>
							<Label htmlFor="first_name" className="font-semibold">
								Nama Depan
							</Label>
							{isEditing ? (
								<Input id="first_name" value={profileData.first_name} onChange={(e) => setProfileData((p) => ({ ...p, first_name: e.target.value }))} className="mt-1 h-[48px]" />
							) : (
								<p className="text-gray-800 mt-2">{profileData.first_name || '-'}</p>
							)}
						</div>
						{/* Last Name */}
						<div>
							<Label htmlFor="last_name" className="font-semibold">
								Nama Belakang
							</Label>
							{isEditing ? (
								<Input id="last_name" value={profileData.last_name} onChange={(e) => setProfileData((p) => ({ ...p, last_name: e.target.value }))} className="mt-1 h-[48px]" />
							) : (
								<p className="text-gray-800 mt-2">{profileData.last_name || '-'}</p>
							)}
						</div>
						{/* Date of Birth */}
						<div>
							<Label htmlFor="date_of_birth" className="font-semibold">
								Tanggal Lahir
							</Label>
							{isEditing ? (
								<Input id="date_of_birth" type="date" value={formatDateForInput(profileData.date_of_birth)} onChange={(e) => setProfileData((p) => ({ ...p, date_of_birth: e.target.value }))} className="mt-1 h-[48px]" />
							) : (
								<p className="text-gray-800 mt-2">
									{profileData.date_of_birth
										? new Date(profileData.date_of_birth.split('/').reverse().join('-')).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'long',
												year: 'numeric',
										  })
										: '-'}
								</p>
							)}
						</div>
						{/* Gender */}
						<div>
							<Label htmlFor="sex" className="font-semibold">
								Jenis Kelamin
							</Label>
							{isEditing ? (
								<Select value={profileData.sex} onValueChange={(v) => setProfileData((p) => ({ ...p, sex: v }))}>
									<SelectTrigger className="w-full mt-1">
										<SelectValue placeholder="Pilih jenis kelamin" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Laki-laki</SelectItem>
										<SelectItem value="female">Perempuan</SelectItem>
									</SelectContent>
								</Select>
							) : (
								<p className="text-gray-800 mt-2">{profileData.sex === 'male' ? 'Laki-laki' : profileData.sex === 'female' ? 'Perempuan' : '-'}</p>
							)}
						</div>
						{/* Country */}
						<div className="md:col-span-2">
							<Label htmlFor="country_of_residence" className="font-semibold">
								Negara Tempat Tinggal
							</Label>
							{isEditing ? (
								<Select value={profileData.country_of_residence} onValueChange={(v) => setProfileData((p) => ({ ...p, country_of_residence: v }))}>
									<SelectTrigger className="w-full mt-1">
										<SelectValue placeholder="Pilih negara" />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(regionMap).map(([groupKey, countries]) => (
											<SelectGroup key={groupKey}>
												<SelectLabel>{formatGroupLabel(groupKey)}</SelectLabel>
												{countries.map((c) => (
													<SelectItem key={c} value={c}>
														{formatCountryName(c)}
													</SelectItem>
												))}
											</SelectGroup>
										))}
									</SelectContent>
								</Select>
							) : (
								<p className="text-gray-800 mt-2">{formatCountryName(profileData.country_of_residence) || '-'}</p>
							)}
						</div>
					</div>

					{isEditing && (
						<div className="flex justify-end pt-4">
							<Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-rose-600 hover:bg-rose-700 font-semibold w-32 cursor-pointer">
								{isSavingProfile ? (
									<Loader2 className="animate-spin" />
								) : (
									<>
										<Save className="h-4 w-4 mr-2" /> Simpan
									</>
								)}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* --- PREFERENCES SECTION --- */}
			<Card className="rounded-xl shadow-sm border-gray-200">
				<CardHeader className="bg-slate-50/70 border-b">
					<div className="flex items-center gap-4">
						<Palette className="h-6 w-6 text-rose-600" />
						<CardTitle className="text-lg font-bold">Preferensi</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="p-2">
					<SettingsRow icon={Globe} title="Bahasa" description="Pilih bahasa tampilan aplikasi.">
						<Select value={preferences.language} onValueChange={(v) => setPreferences((p) => ({ ...p, language: v }))}>
							<SelectTrigger className="w-48 cursor-pointer">
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
					</SettingsRow>
					<Separator className="my-1" />
					<SettingsRow icon={Sun} title="Tema Tampilan" description="Sesuaikan tampilan terang atau gelap.">
						<Select value={preferences.theme} onValueChange={(v) => setPreferences((p) => ({ ...p, theme: v }))}>
							<SelectTrigger className="w-48 cursor-pointer">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="light" className="cursor-pointer">
									<div className="flex items-center gap-2">
										<Sun className="w-4 h-4" />
										Terang
									</div>
								</SelectItem>
								<SelectItem value="dark" className="cursor-pointer">
									<div className="flex items-center gap-2">
										<Moon className="w-4 h-4" />
										Gelap
									</div>
								</SelectItem>
								<SelectItem value="system" className="cursor-pointer">
									<div className="flex items-center gap-2">
										<Laptop className="w-4 h-4" />
										Sistem
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</SettingsRow>
				</CardContent>
			</Card>

			{/* --- SECURITY SECTION --- */}
			<Card className="rounded-xl shadow-sm border-gray-200">
				<CardHeader className="bg-slate-50/70 border-b">
					<div className="flex items-center gap-4">
						<Shield className="h-6 w-6 text-rose-600" />
						<CardTitle className="text-lg font-bold">Keamanan</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="p-2">
					<Dialog onOpenChange={(open) => !open && setShowPasswordStrength(false)}>
						<div className="w-full">
							<SettingsRow icon={KeyRound} title="Ubah Password" description="Ganti password Anda secara berkala.">
								<DialogTrigger asChild>
									<Button variant="outline" className="cursor-pointer w-24">
										Ubah
									</Button>
								</DialogTrigger>
							</SettingsRow>
						</div>
						{/* --- UBAH: Seluruh form di dalam DialogContent --- */}
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Ubah Password</DialogTitle>
								<DialogDescription>Pastikan untuk menggunakan password yang kuat dan unik.</DialogDescription>
							</DialogHeader>
							<form onSubmit={handlePasswordChange} className="space-y-4">
								{/* --- Password Baru Field --- */}
								<div className="space-y-2">
									<Label htmlFor="password">Password Baru</Label>
									<div className="relative">
										<KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<Input
											id="password"
											type={showPassword ? 'text' : 'password'}
											value={passwordForm.password}
											onFocus={() => setShowPasswordStrength(true)}
											onChange={(e) => {
												setPasswordForm((p) => ({ ...p, password: e.target.value }));
												if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
											}}
											className={`pl-10 pr-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 ${errors.password ? 'border-red-500' : ''}`}
											placeholder="Masukkan password baru"
										/>
										<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
									{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
								</div>

								{/* --- Indikator Kekuatan Password --- */}
								{showPasswordStrength && passwordForm.password && (
									<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
										<div className="flex items-center justify-between mb-2">
											<span className="font-medium text-gray-700">Kekuatan Password</span>
											<span className="text-gray-600">{passwordStrength.strength}/5</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2 mb-2">
											<div
												className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength <= 2 ? 'bg-red-500' : passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
												style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
											/>
										</div>
										<div className="space-y-1">
											{passwordStrength.checks.map((check, index) => (
												<div key={index} className="flex items-center gap-2">
													{check.test ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-gray-400" />}
													<span className={`text-xs ${check.test ? 'text-green-700' : 'text-gray-600'}`}>{check.label}</span>
												</div>
											))}
										</div>
									</motion.div>
								)}

								{/* --- Konfirmasi Password Field --- */}
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
									<div className="relative">
										<KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={passwordForm.confirmPassword}
											onChange={(e) => {
												setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }));
												if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
											}}
											className={`pl-10 pr-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
											placeholder="Konfirmasi password Anda"
										/>
										<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
											{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
									{errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
								</div>
								<DialogFooter className="pt-4">
									<DialogClose asChild>
										<Button id="close-password-dialog" type="button" variant="ghost" className="cursor-pointer">
											Batal
										</Button>
									</DialogClose>
									{/* UBAH: Tambahkan validasi kekuatan password */}
									<Button
										type="submit"
										// --- UBAH BARIS INI ---
										disabled={isChangingPassword || passwordStrength.strength < 5 || !passwordForm.confirmPassword || passwordForm.password !== passwordForm.confirmPassword}
										className="bg-rose-600 hover:bg-rose-700 w-32 cursor-pointer"
									>
										{isChangingPassword ? <Loader2 className="animate-spin" /> : 'Simpan'}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>

			{/* --- DANGER ZONE --- */}
			<Card className="rounded-xl border-red-500 bg-red-50/50 shadow-md">
				<CardHeader>
					<div className="flex items-center gap-4">
						<AlertTriangle className="h-6 w-6 text-red-600" />
						<div>
							<CardTitle className="text-red-800 text-lg font-bold">Zona Berbahaya</CardTitle>
							<CardDescription className="text-red-700">Tindakan berikut tidak dapat dibatalkan. Mohon lanjutkan dengan hati-hati.</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
						<div>
							<h4 className="font-bold text-gray-800">Hapus Akun Ini</h4>
							<p className="text-sm text-gray-600">Semua data Anda akan dihapus secara permanen.</p>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="destructive" className="cursor-pointer bg-rose-600 hover:bg-rose-700">
									Hapus Akun
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Apakah Anda Benar-Benar Yakin?</DialogTitle>
									<DialogDescription>Tindakan ini akan menghapus akun dan semua data Anda secara permanen. Untuk melanjutkan, silakan ketik password Anda.</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleDeleteAccount}>
									<div className="py-4">
										<Label htmlFor="delete-password">Password</Label>
										<Input id="delete-password" type="password" value={passwordDelete} onChange={(e) => setPasswordDelete(e.target.value)} className={`mt-1 ${deleteError ? 'border-red-500' : ''}`} />
										{deleteError && <p className="text-red-500 text-xs mt-1">{deleteError}</p>}
									</div>
									<DialogFooter>
										<DialogClose asChild>
											<Button type="button" variant="ghost" className="cursor-pointer">
												Batal
											</Button>
										</DialogClose>
										<Button type="submit" variant="destructive" disabled={isDeletingAccount} className="w-40 cursor-pointer bg-rose-600 hover:bg-rose-700">
											{isDeletingAccount ? <Loader2 className="animate-spin" /> : 'Ya, Hapus Akun Saya'}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
