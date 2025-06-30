import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Shield,
    Palette,
    Globe,
    HelpCircle,
    LogOut,
    Save,
    Edit3,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/provider/AuthProvider";
import { regionMap } from "@/lib/data";
import { formatCountryName, formatGroupLabel } from "@/lib/utils";
import { updateProfile } from "@/hooks/api/auth";

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

export default function SettingsPage() {
    const auth = useAuth();
    const token = auth?.token;
    const user = auth?.user;

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<User>(
        user || {
            age: 0,
            country_of_residence: "",
            date_of_birth: "",
            email: "",
            first_name: "",
            language: "",
            last_name: "",
            risk_region: "",
            sex: "",
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
        language: "id",
        theme: "light",
        timezone: "Asia/Jakarta",
    });

    const handleSaveProfile = async () => {
        try {
            if (token) {
                const response = await updateProfile(token, profileData);
                console.log("Profile updated successfully:", response);
            } else {
                console.error("Token is missing. Cannot update profile.");
            }
            console.log("Profile updated successfully", profileData);
            setIsEditing(false);
            auth?.refreshUserProfile(); // Refresh user profile after update
        } catch (error) {
            console.error("Failed to update profile:", error);
            // Optionally, you can show an error message to the user
        }
    };

    // const handleNotificationChange = (key: string, value: boolean) => {
    //     setNotifications((prev) => ({ ...prev, [key]: value }));
    // };

    const handlePreferenceChange = (key: string, value: string) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
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

    console.log(
        new Date(profileData.date_of_birth)
            .toLocaleDateString()
            .split("/")
            .reverse()
            .join("-")
    );

    return (
        <div className="min-h-screen bg-white">
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="max-w-4xl md:max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="space-y-2"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Pengaturan
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        Kelola profil dan preferensi akun Anda
                    </p>
                </motion.div>

                {/* Profile Section */}
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                >
                    <Card className="gap-3 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="h-6 w-6 text-rose-500" />
                                    <div>
                                        <CardTitle className="text-base md:text-lg font-bold text-gray-900">
                                            Profil Pengguna
                                        </CardTitle>
                                        <CardDescription className="text-sm md:text-base text-gray-600">
                                            Informasi dasar akun Anda
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsEditing(!isEditing)}
                                    variant="outline"
                                    className="bg-white text-rose-500 border border-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium uppercase tracking-wide"
                                >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    {isEditing ? "Batal" : "Edit"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage
                                        src="/placeholder.svg?height=80&width=80"
                                        alt="Profile"
                                    />
                                    <AvatarFallback className="bg-rose-500 text-white text-xl font-bold">
                                        {profileData.first_name?.charAt(0) ||
                                            "U"}
                                        {profileData.last_name?.charAt(0) || ""}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                                        {`${profileData?.first_name} ${profileData?.last_name}` ||
                                            "Nama tidak tersedia"}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600">
                                        {profileData.email}
                                    </p>
                                    <Badge className="bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 text-xs font-medium uppercase tracking-wide mt-2">
                                        Pengguna Aktif
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium text-gray-700"
                                    >
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
                                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium text-gray-700"
                                    >
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
                                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium text-gray-700"
                                    >
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
                                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="date_of_birth"
                                        className="text-sm font-medium text-gray-700"
                                    >
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
                                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base"
                                    />
                                </div>

                                <div className="space-y-2 w-full">
                                    {/* gender */}
                                    <Label
                                        htmlFor="sex"
                                        className="text-sm font-medium text-gray-700"
                                    >
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
                                        <SelectTrigger className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">
                                                Laki-laki
                                            </SelectItem>
                                            <SelectItem value="female">
                                                Perempuan
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tempat tinggal berdasarkan region Mapping dengan grouping select */}
                                <div className="space-y-2 w-full">
                                    <Label
                                        htmlFor="country_of_residence"
                                        className="text-sm font-medium text-gray-700"
                                    >
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
                                        <SelectTrigger className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                                            <SelectValue placeholder="Pilih negara" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* --- MULAI PERUBAHAN --- */}
                                            {Object.entries(regionMap).map(
                                                ([groupKey, countries]) => (
                                                    <SelectGroup key={groupKey}>
                                                        <SelectLabel>
                                                            {/* Menggunakan fungsi helper untuk format label */}
                                                            {formatGroupLabel(
                                                                groupKey
                                                            )}
                                                        </SelectLabel>
                                                        {countries.map(
                                                            (country) => (
                                                                <SelectItem
                                                                    key={
                                                                        country
                                                                    }
                                                                    value={
                                                                        country
                                                                    }
                                                                >
                                                                    {/* Menggunakan fungsi helper untuk format nama negara */}
                                                                    {formatCountryName(
                                                                        country
                                                                    )}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectGroup>
                                                )
                                            )}
                                            {/* --- AKHIR PERUBAHAN --- */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-end"
                                >
                                    <Button
                                        onClick={handleSaveProfile}
                                        className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium uppercase tracking-wide"
                                    >
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
                    <Card className="rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
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
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.4 }}
                >
                    <Card className="gap-3 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Palette className="h-6 w-6 text-rose-500" />
                                <div>
                                    <CardTitle className="text-base md:text-lg font-bold text-gray-900">
                                        Preferensi
                                    </CardTitle>
                                    <CardDescription className="text-sm md:text-base text-gray-600">
                                        Sesuaikan pengalaman aplikasi Anda
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Bahasa
                                    </Label>
                                    <Select
                                        value={preferences.language}
                                        onValueChange={(value) =>
                                            handlePreferenceChange(
                                                "language",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 w-full">
                                            <Globe className="h-4 w-4 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="id">
                                                Bahasa Indonesia
                                            </SelectItem>
                                            <SelectItem value="en">
                                                English
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
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
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Security & Privacy Section */}
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.5 }}
                >
                    <Card className="gap-3 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-rose-500" />
                                <div>
                                    <CardTitle className="text-base md:text-lg font-bold text-gray-900">
                                        Keamanan & Privasi
                                    </CardTitle>
                                    <CardDescription className="text-sm md:text-base text-gray-600">
                                        Kelola keamanan akun Anda
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Ubah Password
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
                            >
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Kebijakan Privasi
                            </Button>

                            <Separator />

                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 border border-red-300 hover:bg-red-50 rounded-lg text-sm font-medium"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Keluar dari Akun
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
