import { color, motion } from "framer-motion";
import {
    Heart,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/provider/AuthProvider";
import { Link } from "react-router-dom";
import { fetchDashboard } from "@/hooks/api/dashboard";

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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-800">
                    {data.fullDate}
                </p>
                <p className="text-sm text-red-600">
                    <span className="font-semibold">
                        Risiko: {payload[0].value}%
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

const formatResikoBadge = (code: string, title: string) => {
    switch(code) {
        case "LOW_MODERATE" :
            return <Badge className="bg-green-100 text-green-700 hover:bg-rose-200">{title}</Badge>
        case "HIGH" :
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-rose-200">{title}</Badge>
        case "VERY_HIGH" :
            return <Badge className="bg-red-100 text-red-800 hover:bg-rose-200">{title}</Badge>
        default:
            return <Badge className="bg-slate-100 text-slate-700 hover:bg-rose-200">{title}</Badge>;
    }
}

export default function DashboardPage() {
    const auth = useAuth();
    const token = auth?.token;
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(
        null
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const response = await fetchDashboard(token);

                setDashboardData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
    }, []);

    const getTrendStatus = (trend: string) => {
        if (trend === "improving") {
            return { text: "Membaik", color: "text-green-600" };
        } else if (trend === "worsening") {
            return { text: "Memburuk", color: "text-red-600" };
        } else {
            return { text: "Stabil", color: "text-sky-600" };
        }
    };

    const heartRiskData = dashboardData?.graph_data_30_days
        ? Object.keys(dashboardData.graph_data_30_days.labels).map((key) => {
              const date = dashboardData.graph_data_30_days.labels[key];
              const risk = dashboardData.graph_data_30_days.values[key];

              return {
                  date,
                  risk: risk,
                  fullDate: date,
              };
          })
        : [];

    if (loading) {
        // loader spiner
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="p-6 space-y-6"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold">Dashboard Kesehatan</h1>
                <p className="text-slate-600">
                    Pantau kondisi kesehatan Anda dengan analisis AI terdepan
                </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                >
                    <Card className="gap-3 rounded-2xl shadow-sm border h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg text-rose-600">
                                    Status Kesehatan
                                </CardTitle>
                                <CheckCircle className="h-6 w-6 text-rose-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {dashboardData?.summary.latest_status.category_code ? (
                                    formatResikoBadge(
                                        dashboardData?.summary.latest_status.category_code, dashboardData?.summary.latest_status.category_title)
                                    ) : (
                                        <Badge className="bg-gray-100 text-gray-600">
                                            Tidak ada status kesehatan
                                        </Badge>
                                    )}
                                <p className="text-sm">
                                    {
                                        dashboardData?.summary.latest_status
                                            .description ||
                                        "Tidak ada deskripsi status kesehatan."
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.3 }}
                >
                    <Card className="gap-3 rounded-2xl shadow-sm border h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg text-rose-600">
                                    Analisis Terakhir
                                </CardTitle>
                                <Clock className="h-6 w-6 text-rose-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-xl font-bold">
                                    {
                                        dashboardData?.summary
                                            .last_assessment_date_human ||
                                        "Belum ada analisis"
                                    }
                                </p>
                                {/* <p className="text-sm">yang lalu</p> */}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.4 }}
                >
                    <Card className="gap-3 rounded-2xl shadow-sm border h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg text-rose-600">
                                    Trend Kesehatan
                                </CardTitle>
                                <TrendingUp className="h-6 w-6 text-rose-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-2xl font-bold">
                                    {
                                        dashboardData?.summary.health_trend.direction ? (
                                            getTrendStatus(
                                                dashboardData?.summary.health_trend.direction
                                            ).text
                                        ) : (
                                            "Tidak ada data"
                                        )
                                    }
                                </p>
                                <p className="text-sm">
                                    {dashboardData?.summary.health_trend.text || "Tidak ada informasi tren kesehatan."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Chart */}
            <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
            >
                <Card className="rounded-2xl shadow-md border-0 p-6 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-6">
                        <div className="flex items-center gap-3">
                            <Heart className="h-6 w-6 text-red-500" />
                            <div>
                                <CardTitle className="text-xl text-slate-800">
                                    Potensi Serangan Jantung dalam 30 Hari
                                    Terakhir
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Analisis risiko berdasarkan data kesehatan
                                    Anda
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={heartRiskData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 30]}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="risk"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={{
                                            fill: "#ef4444",
                                            strokeWidth: 2,
                                            r: 4,
                                        }}
                                        activeDot={{
                                            r: 6,
                                            stroke: "#ef4444",
                                            strokeWidth: 2,
                                            fill: "#ffffff",
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Last Analysis Summary */}
            {dashboardData?.latest_assessment_details && (
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.6 }}
                >
                    <Card className="rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 bg-white border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-rose-100">
                                    <AlertCircle className="h-6 w-6 text-rose-600" />
                                </div>
                                Ringkasan Analisis Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Time Info */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 border border-rose-200/50">
                                <Clock className="h-5 w-5 text-rose-600" />
                                <div>
                                    <p className="font-medium text-rose-800">
                                        Terakhir melakukan analisis:{" "}
                                    </p>
                                    <p className="text-sm text-rose-700">
                                        {
                                            dashboardData?.summary
                                                .last_assessment_date_human
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Warning Suggestion */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-100/60 border border-yellow-200">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-yellow-800 mb-1">
                                        Rekomendasi Sistem
                                    </p>
                                    <p className="text-sm text-yellow-700 leading-relaxed">
                                        Sudah cukup lama sejak analisis terakhir,
                                        sebaiknya lakukan pengecekan kembali untuk
                                        mengetahui kondisi terkini Anda. Analisis
                                        rutin membantu memantau perubahan kesehatan
                                        secara dini.
                                    </p>
                                </div>
                            </div>

                            {/* Previous Analysis Results */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/60 border border-rose-200/50">
                                    <h4 className="font-medium text-slate-800 mb-2">
                                        Hasil Terakhir
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">
                                                Status Risiko
                                            </span>
                                            {
                                                formatResikoBadge(
                                                    dashboardData?.latest_assessment_details
                                                        .riskSummary.riskCategory
                                                        .code,
                                                    dashboardData?.latest_assessment_details
                                                        .riskSummary.riskCategory
                                                        .title
                                                )
                                            }
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">
                                                Persentase Resiko
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {dashboardData?.latest_assessment_details
                                                    .riskSummary.riskPercentage *
                                                    100}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/60 border border-rose-200/50">
                                    <h4 className="font-medium text-slate-800 mb-2">
                                        Rekomendasi Utama
                                    </h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        {dashboardData?.latest_assessment_details.riskSummary.primaryContributors
                                            .slice(0, 3)
                                            .map((item, i) => (
                                                <li key={i}>• {item.title}</li>
                                            ))}
                                    </ul>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="pt-2"
                            >
                                <Link to="/dashboard/analysis">
                                    <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Lakukan Analisis Sekarang
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Number.POSITIVE_INFINITY,
                                            }}
                                            className="ml-2"
                                        >
                                            →
                                        </motion.div>
                                    </Button>
                                </Link>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
