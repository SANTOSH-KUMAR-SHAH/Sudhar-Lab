"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
    FaCheck,
    FaTimes,
    FaUsers,
    FaClipboardList,
    FaSpinner,
    FaBars,
    FaUserShield,
    FaSignOutAlt,
    FaBriefcase,
    FaUserSlash,
    FaRupeeSign,
    FaCalendarCheck,
    FaRunning,
    FaChartBar,
    FaChartLine,
    FaStar,
    FaUser,
    FaExclamationTriangle,
    FaComment
} from "react-icons/fa";
import ConfirmationModal from "@/components/ConfirmationModal";

const COFFEE = {
    dark: "#6F4E37",
    mid: "#7a5c49",
    light: "#f1dfc9",
    accent: "#A97155",
    text: "#4a2e21",
    cardBg: "#fdfcfa",
};

export default function AdminDashboard() {
    const router = useRouter();

    // Stats
    const [stats, setStats] = useState({
        totalProviders: 0,
        totalUsers: 0,
        pendingApplications: 0,
        activeBookings: 0,
        onlineProviders: 0,
        totalServices: 0,
        completedBookings: 0,
        totalRevenue: 0,
    });

    const [chartData, setChartData] = useState({
        bookingsTrend: [],
        revenueByMonth: [],
        providerDistribution: []
    });
    const [pendingApps, setPendingApps] = useState([]);
    const [allProviders, setAllProviders] = useState([]);
    const [usersPage, setUsersPage] = useState(1);
    const [reports, setReports] = useState([]);
    const [adminReviews, setAdminReviews] = useState([]);

    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Pagination
    const [pendingPage, setPendingPage] = useState(1);
    const [providersPage, setProvidersPage] = useState(1);
    const [reportsPage, setReportsPage] = useState(1);
    const [reviewsPage, setReviewsPage] = useState(1);
    const PAGE_SIZE = 8;

    // Modal
    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        isDanger: false,
    });

    const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";
    const URL = isProd
        ? "https://localhelpbackendv2.onrender.com"
        : "http://localhost:4040";

    useEffect(() => {
        fetchDashboardData();
        fetchAllUsers();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, appsRes, providersRes, reportsRes] = await Promise.all([
                axios.get(`${URL}/api/count/admin-stats`, { headers }),
                axios.get(`${URL}/api/admin/applications/pending`, { headers }),
                axios.get(`${URL}/api/admin/providers`, { headers }),
                axios.get(`${URL}/api/feedback/reports/admin`, { headers }),
            ]);

            const s = statsRes.data;

            setStats({
                totalProviders: s.users.providers,
                totalUsers: s.users.total,
                pendingApplications: s.providers.pending,
                activeBookings: s.bookings.active,
                onlineProviders: s.providers.online,
                totalServices: s.services.total,
                completedBookings: s.bookings.completed,
                totalRevenue: s.revenue.total,
            });

            setPendingApps(appsRes.data.applications || []);
            setAllProviders(providersRes.data.providers || []);
            setReports(reportsRes.data.reports || []);
            setAdminReviews(reportsRes.data.reviews || []);
            setTimeout(() => generateChartData(), 100);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load admin dashboard");
            if (err.response?.status === 401 || err.response?.status === 403) {
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmAction = (title, message, action, isDanger = false) => {
        setModal({
            isOpen: true,
            title,
            message,
            onConfirm: action,
            isDanger,
        });
    };

    const handleApprove = (providerId) => {
        confirmAction(
            "Approve Application",
            "Are you sure you want to approve this provider?",
            async () => {
                const token = localStorage.getItem("token");
                await axios.put(
                    `${URL}/api/admin/applications/${providerId}/approve`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Provider approved");
                fetchDashboardData();
            }
        );
    };
    const StatCard = ({ title, value, icon }) => {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-[#f1dfc9]/40 p-5
                hover:shadow-md hover:border-[#A97155]/30 transition-all duration-200">

                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#7a5a4a]/70 uppercase tracking-wide mb-2">
                            {title}
                        </p>
                        <p className="text-2xl font-bold text-[#4a2e21] truncate">
                            {value}
                        </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f1dfc9] to-[#e8d4b8] 
                        flex items-center justify-center text-[#6F4E37] text-xl flex-shrink-0
                        shadow-sm">
                        {icon}
                    </div>
                </div>
            </div>
        );
    };
    const generateChartData = () => {
        const token = localStorage.getItem("token");
        axios.get(`${URL}/api/count/monthly-stats`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                const data = res.data;
                const bookingsTrend = data.map((item) => ({
                    month: item.month,
                    active: item.active,
                    completed: item.completed,
                }));
                const revenueByMonth = data.map((item) => ({
                    month: item.month,
                    revenue: item.revenue,
                }));
                const providerDistribution = [
                    { name: 'Online', value: stats.onlineProviders, color: '#10b981' },
                    { name: 'Offline', value: stats.totalProviders - stats.onlineProviders, color: '#9ca3af' },
                ];
                setChartData({ bookingsTrend, revenueByMonth, providerDistribution });
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch monthly stats");
            });
    }
    const handleReject = (providerId) => {
        confirmAction(
            "Reject Application",
            "Are you sure you want to reject this provider?",
            async () => {
                const token = localStorage.getItem("token");
                await axios.put(
                    `${URL}/api/admin/applications/${providerId}/reject`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Provider rejected");
                fetchDashboardData();
            },
            true
        );
    };
    const fetchAllUsers = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setAllUsers(response.data.users);
    };
    const handleRoleChange = (providerId, newRole) => {
        if (newRole === "CUSTOMER") {
            confirmAction(
                "Demote Provider",
                "This will suspend the provider.",
                async () => {
                    const token = localStorage.getItem("token");
                    await axios.put(
                        `${URL}/api/admin/providers/${providerId}/demote`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("Provider demoted");
                    fetchDashboardData();
                },
                true
            );
        } else {
            confirmAction(
                "Activate Provider",
                "This will re-activate the provider.",
                async () => {
                    const token = localStorage.getItem("token");
                    await axios.put(
                        `${URL}/api/admin/applications/${providerId}/approve`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("Provider activated");
                    fetchDashboardData();
                }
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#ece9d8]">
                <FaSpinner className="animate-spin text-4xl text-[#672410]" />
            </div>
        );
    }

    // Pagination slices
    const pendingTotalPages = Math.ceil(pendingApps.length / PAGE_SIZE);
    const providersTotalPages = Math.ceil(allProviders.length / PAGE_SIZE);
    const usersTotalPages = Math.ceil(allUsers.length / PAGE_SIZE);

    const usersSlice = allUsers.slice(
        (usersPage - 1) * PAGE_SIZE,
        usersPage * PAGE_SIZE
    );


    const pendingSlice = pendingApps.slice(
        (pendingPage - 1) * PAGE_SIZE,
        pendingPage * PAGE_SIZE
    );

    const providersSlice = allProviders.slice(
        (providersPage - 1) * PAGE_SIZE,
        providersPage * PAGE_SIZE
    );

    const reportsTotalPages = Math.ceil(reports.length / PAGE_SIZE);
    const reportsSlice = reports.slice(
        (reportsPage - 1) * PAGE_SIZE,
        reportsPage * PAGE_SIZE
    );

    const reviewsTotalPages = Math.ceil(adminReviews.length / PAGE_SIZE);
    const reviewsSlice = adminReviews.slice(
        (reviewsPage - 1) * PAGE_SIZE,
        reviewsPage * PAGE_SIZE
    );
    const maxActive = Math.max(...chartData.bookingsTrend.map(i => i.active), 1);
    const maxCompleted = Math.max(...chartData.bookingsTrend.map(i => i.completed), 1);
    // const maxRevenue = Math.max(...chartData.revenueByMonth.map(d => d.revenue));

    return (
        <div className="min-h-screen bg-[#ece9d8]">
            <ConfirmationModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onClose={() => setModal((p) => ({ ...p, isOpen: false }))}
                isDanger={modal.isDanger}
            />

            {/* MOBILE HEADER */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-[#6F4E37]">Admin Panel</h1>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-[#6F4E37]"
                >
                    <FaBars size={24} />
                </button>
            </div>

            <div className="lg:flex gap-6 max-w-7xl mx-auto px-4 lg:px-6 pt-20 lg:pt-6 pb-12">
                {/* SIDEBAR */}
                <aside
                    className={`fixed lg:sticky top-0 left-0 h-full lg:h-[calc(100vh-3rem)] lg:top-6 w-72 bg-white p-6 rounded-none lg:rounded-2xl shadow-lg transform transition-transform z-50 ${sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                        }`}
                >
                    <div className="mb-8 text-center mt-8 lg:mt-0">
                        <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center border-4 bg-[#f1dfc9]">
                            <FaUserShield size={50} className="text-[#4a2e21]" />
                        </div>
                        <p className="mt-4 font-bold text-lg text-[#4a2e21]">Administrator</p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                            Super User
                        </p>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <button
                            onClick={() => {
                                setActiveTab("pending");
                                setSidebarOpen(false);
                            }}
                            className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "pending"
                                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <FaClipboardList />
                            Pending Approvals
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab("providers");
                                setSidebarOpen(false);
                            }}
                            className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "providers"
                                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <FaUsers />
                            Providers
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("users");
                                setSidebarOpen(false);
                            }}
                            className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "users"
                                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <FaUsers />
                            Customers
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("stats");
                                setSidebarOpen(false);
                            }}
                            className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "stats"
                                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <FaChartBar />
                            Statistics
                        </button>

                        <div className="my-2 border-t" />

                        <button
                            onClick={handleLogout}
                            className="text-left flex items-center gap-3 px-4 py-3 text-red-700 rounded-lg hover:bg-red-50 hover:text-red-700"
                        >
                            <FaSignOutAlt />
                            Logout
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("reports");
                                setSidebarOpen(false);
                            }}
                            className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "reports"
                                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <FaExclamationTriangle />
                            Reports & Feedback
                        </button>
                    </nav>
                </aside>

                {/* MAIN */}
                <main className="flex-1 w-full">
                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <StatCard title="Providers" value={stats.totalProviders} icon={<FaUsers />} />

                        <StatCard
                            title="Online Now"
                            value={stats.onlineProviders}
                            icon={<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />}
                        />

                        <StatCard title="Services" value={stats.totalServices} icon={<FaBriefcase />} />

                        <StatCard title="Active Bookings" value={stats.activeBookings} icon={<FaRunning />} />

                        <StatCard title="Completed" value={stats.completedBookings} icon={<FaCalendarCheck />} />

                        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<FaRupeeSign />} />
                    </div>


                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden min-h-[500px]">
                        {activeTab === "pending" && (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfa]">
                                    <h3 className="text-lg font-semibold text-[#4a2e21]">
                                        Pending Applications
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        Page {pendingPage} of {pendingTotalPages || 1}
                                    </span>
                                </div>

                                {pendingApps.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-64">
                                        <FaCheck className="text-green-200 text-5xl mb-4" />
                                        <p>All caught up! No pending applications.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#f7f3eb] text-[#6F4E37] text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-3 font-medium">Applicant</th>
                                                        <th className="px-6 py-3 font-medium">Contact</th>
                                                        <th className="px-6 py-3 font-medium">Applied</th>
                                                        <th className="px-6 py-4 font-medium text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {pendingSlice.map((app) => (
                                                        <tr key={app.id} className="hover:bg-gray-50/50 transition">
                                                            <td className="px-6 py-4">
                                                                <p className="font-semibold text-gray-900">
                                                                    {app.user.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    ID: {app.aadharNumber || "N/A"}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-gray-600">{app.user.email}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                                {new Date(app.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleApprove(app.id)}
                                                                        className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition shadow-sm"
                                                                        title="Approve"
                                                                    >
                                                                        <FaCheck size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(app.id)}
                                                                        className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 transition shadow-sm"
                                                                        title="Reject"
                                                                    >
                                                                        <FaTimes size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex justify-between items-center px-6 py-4 border-t">
                                            <button
                                                disabled={pendingPage === 1}
                                                onClick={() => setPendingPage((p) => p - 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                disabled={pendingPage === pendingTotalPages}
                                                onClick={() => setPendingPage((p) => p + 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === "providers" && (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfa]">
                                    <h3 className="text-lg font-semibold text-[#4a2e21]">
                                        All Providers
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        Page {providersPage} of {providersTotalPages || 1}
                                    </span>
                                </div>

                                {allProviders.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No providers found.
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#f7f3eb] text-[#6F4E37] text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-3 font-medium">Name</th>
                                                        <th className="px-6 py-3 font-medium">Email</th>
                                                        <th className="px-6 py-3 font-medium">Status & Role</th>
                                                        <th className="px-6 py-3 font-medium">Availability</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {providersSlice.map((provider) => (
                                                        <tr key={provider.id} className="hover:bg-gray-50/50 transition">
                                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                                {provider.user.name}
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                                                {provider.user.email}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <select
                                                                        className={`text-xs font-semibold px-2 py-1 rounded border outline-none cursor-pointer ${provider.applicationStatus === "APPROVED"
                                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                                            : "bg-red-50 text-red-700 border-red-200"
                                                                            }`}
                                                                        value={
                                                                            provider.applicationStatus === "APPROVED"
                                                                                ? "PROVIDER"
                                                                                : "CUSTOMER"
                                                                        }
                                                                        onChange={(e) =>
                                                                            handleRoleChange(provider.id, e.target.value)
                                                                        }
                                                                    >
                                                                        <option value="PROVIDER">PROVIDER</option>
                                                                        <option value="CUSTOMER">CUSTOMER</option>
                                                                    </select>
                                                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                                        {provider.applicationStatus}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className={`w-2 h-2 rounded-full ${provider.isAvailable
                                                                            ? "bg-green-500"
                                                                            : "bg-gray-300"
                                                                            }`}
                                                                    />
                                                                    <span
                                                                        className={
                                                                            provider.isAvailable
                                                                                ? "text-green-700 font-medium"
                                                                                : "text-gray-500"
                                                                        }
                                                                    >
                                                                        {provider.isAvailable ? "Online" : "Offline"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex justify-between items-center px-6 py-4 border-t">
                                            <button
                                                disabled={providersPage === 1}
                                                onClick={() => setProvidersPage((p) => p - 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                disabled={providersPage === providersTotalPages}
                                                onClick={() => setProvidersPage((p) => p + 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === "reports" && (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfa]">
                                    <h3 className="text-lg font-semibold text-[#4a2e21]">
                                        User Reports & Issues
                                    </h3>
                                </div>
                                {reports.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No reports found.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#f7f3eb] text-[#6F4E37] text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium">Reporter</th>
                                                    <th className="px-6 py-3 font-medium">Against Provider</th>
                                                    <th className="px-6 py-3 font-medium">Issue</th>
                                                    <th className="px-6 py-3 font-medium">Description</th>
                                                    <th className="px-6 py-3 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {reportsSlice.map((r) => (
                                                    <tr key={r.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{r.reporter?.name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{r.provider?.name}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{r.issueType}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={r.description}>
                                                            {r.description}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                                            {new Date(r.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Reports Pagination */}
                                        <div className="flex justify-between items-center px-6 py-4 border-t">
                                            <button
                                                disabled={reportsPage === 1}
                                                onClick={() => setReportsPage((p) => p - 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-500">
                                                Page {reportsPage} of {reportsTotalPages || 1}
                                            </span>
                                            <button
                                                disabled={reportsPage === reportsTotalPages}
                                                onClick={() => setReportsPage((p) => p + 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfa] mt-8">
                                    <h3 className="text-lg font-semibold text-[#4a2e21]">
                                        Recent Service Reviews
                                    </h3>
                                </div>
                                {adminReviews.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No reviews found.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#f7f3eb] text-[#6F4E37] text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium">Customer</th>
                                                    <th className="px-6 py-3 font-medium">Provider</th>
                                                    <th className="px-6 py-3 font-medium">Rating</th>
                                                    <th className="px-6 py-3 font-medium">Comment</th>
                                                    <th className="px-6 py-3 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {reviewsSlice.map((r) => (
                                                    <tr key={r.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{r.reviewer?.name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{r.reviewedUser?.name}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex text-yellow-400">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FaStar key={i} className={i < r.rating ? "opacity-100" : "opacity-20"} />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-500">{r.rating}/5</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={r.comment}>
                                                            {r.comment || "—"}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                                            {new Date(r.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Reviews Pagination */}
                                        <div className="flex justify-between items-center px-6 py-4 border-t">
                                            <button
                                                disabled={reviewsPage === 1}
                                                onClick={() => setReviewsPage((p) => p - 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-500">
                                                Page {reviewsPage} of {reviewsTotalPages || 1}
                                            </span>
                                            <button
                                                disabled={reviewsPage === reviewsTotalPages}
                                                onClick={() => setReviewsPage((p) => p + 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "stats" && (
                            <div className="p-4 sm:p-6 space-y-6 max-w-full overflow-hidden">
                                {/* Overview Cards */}


                                {/* Charts Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">




                                    {/* Provider Status Distribution */}
                                    <div className="bg-[#fdfcfa] rounded-xl border border-[#f1dfc9]/60 p-4 sm:p-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FaUsers className="text-[#A97155]" />
                                            <h3 className="text-base sm:text-lg font-semibold text-[#4a2e21]">Provider Status</h3>
                                        </div>
                                        <div className="flex items-center justify-center h-40 sm:h-48">
                                            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                                                {chartData.providerDistribution.map((item, idx) => {
                                                    // console.log(item);
                                                    const total = chartData.providerDistribution.reduce((sum, d) => sum + d.value, 0);
                                                    if (total === 0) return null;
                                                    const percentage = ((item.value / total) * 100).toFixed(1);
                                                    const prevPercentage = chartData.providerDistribution
                                                        .slice(0, idx)
                                                        .reduce((sum, d) => sum + (d.value / total) * 100, 0);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="absolute inset-0 rounded-full"
                                                            style={{
                                                                background: `conic-gradient(${item.color} ${prevPercentage}% ${prevPercentage + parseFloat(percentage)}%, transparent ${prevPercentage + parseFloat(percentage)}%)`,
                                                            }}
                                                        />
                                                    );
                                                })}
                                                <div className="absolute inset-3 sm:inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                                                    <div className="text-center">
                                                        <p className="text-xl sm:text-2xl font-bold text-[#4a2e21]">{stats.totalProviders}</p>
                                                        <p className="text-[10px] sm:text-xs text-[#7a5c49]">Total</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 sm:mt-6 space-y-2">
                                            <div className="flex items-center justify-between p-2 bg-[#f1dfc9]/20 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-[#01c852]" ></div>
                                                    <span className="text-xs sm:text-sm text-[#7a5c49]">Online</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-semibold text-[#4a2e21]">{stats.onlineProviders}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-[#f1dfc9]/20 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-[#f1dfc9]" ></div>
                                                    <span className="text-xs sm:text-sm text-[#7a5c49]">Offline</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-semibold text-[#4a2e21]">{stats.totalProviders - stats.onlineProviders}</span>
                                            </div>


                                        </div>
                                    </div>

                                    {/* Quick Stats Grid */}
                                    <div className="bg-[#fdfcfa] rounded-xl border border-[#f1dfc9]/60 p-4 sm:p-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FaClipboardList className="text-[#A97155]" />
                                            <h3 className="text-base sm:text-lg font-semibold text-[#4a2e21]">Quick Overview</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-[#f1dfc9]/30 rounded-lg border border-[#f1dfc9]/50 hover:bg-[#f1dfc9]/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#f1dfc9] flex items-center justify-center shrink-0">
                                                        <FaClipboardList className="text-[#6F4E37]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-[#7a5c49] truncate">Pending Applications</p>
                                                        <p className="text-lg sm:text-xl font-bold text-[#4a2e21]">{stats.pendingApplications}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-[#f1dfc9]/30 rounded-lg border border-[#f1dfc9]/50 hover:bg-[#f1dfc9]/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#f1dfc9] flex items-center justify-center shrink-0">
                                                        <FaRunning className="text-[#6F4E37]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-[#7a5c49] truncate">Active Bookings</p>
                                                        <p className="text-lg sm:text-xl font-bold text-[#4a2e21]">{stats.activeBookings}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-[#f1dfc9]/30 rounded-lg border border-[#f1dfc9]/50 hover:bg-[#f1dfc9]/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#f1dfc9] flex items-center justify-center shrink-0">
                                                        <FaCalendarCheck className="text-[#6F4E37]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-[#7a5c49] truncate">Completed Bookings</p>
                                                        <p className="text-lg sm:text-xl font-bold text-[#4a2e21]">{stats.completedBookings}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-[#f1dfc9]/30 rounded-lg border border-[#f1dfc9]/50 hover:bg-[#f1dfc9]/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#f1dfc9] flex items-center justify-center shrink-0">
                                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-[#7a5c49] truncate">Online Providers</p>
                                                        <p className="text-lg sm:text-xl font-bold text-[#4a2e21]">{stats.onlineProviders}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#fdfcfa] rounded-xl border border-[#f1dfc9]/60 p-4 sm:p-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FaChartLine className="text-[#A97155]" />
                                            <h3 className="text-base sm:text-lg font-semibold text-[#4a2e21]">
                                                Bookings Trend
                                            </h3>
                                        </div>

                                        <div className="space-y-5">
                                            {chartData.bookingsTrend.map((item, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    {/* Month */}
                                                    <div className="text-sm font-semibold text-[#7a5c49]">
                                                        {item.month}
                                                    </div>

                                                    {/* Active */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs w-20 text-[#7a5c49]">Active</span>
                                                        <div className="flex-1 h-3 bg-[#f1dfc9]/40 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#A97155] rounded-full transition-all"
                                                                style={{ width: `${Math.min((item.active / maxActive) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs w-8 text-right font-semibold text-[#4a2e21]">
                                                            {item.active}
                                                        </span>
                                                    </div>

                                                    {/* Completed */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs w-20 text-[#7a5c49]">Completed</span>
                                                        <div className="flex-1 h-3 bg-[#f1dfc9]/40 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#6F4E37] rounded-full transition-all"
                                                                style={{ width: `${Math.min((item.completed / maxCompleted) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs w-8 text-right font-semibold text-[#4a2e21]">
                                                            {item.completed}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4 mt-4 justify-center flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-[#A97155] rounded"></div>
                                                <span className="text-xs text-[#7a5c49]">Active</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-[#6F4E37] rounded"></div>
                                                <span className="text-xs text-[#7a5c49]">Completed</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revenue Trend Chart */}
                                    <div className="bg-[#fdfcfa] rounded-xl border border-[#f1dfc9]/60 p-4 sm:p-6 shadow-sm flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FaChartBar className="text-[#A97155]" />
                                            <h3 className="text-base sm:text-lg font-semibold text-[#4a2e21]">Revenue Trend</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-[#f1dfc9]/30 rounded-lg p-3 border border-[#f1dfc9]/50">
                                                <p className="text-[10px] text-[#7a5c49] mb-1">Total Revenue</p>
                                                <p className="text-base sm:text-lg font-bold text-[#4a2e21]">
                                                    ₹{chartData.revenueByMonth.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-[#f1dfc9]/30 rounded-lg p-3 border border-[#f1dfc9]/50">
                                                <p className="text-[10px] text-[#7a5c49] mb-1">Avg/Month</p>
                                                <p className="text-base sm:text-lg font-bold text-[#4a2e21]">
                                                    ₹{Math.round(chartData.revenueByMonth.reduce((sum, item) => sum + item.revenue, 0) / chartData.revenueByMonth.length).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-[#f1dfc9]/30 rounded-lg p-3 border border-[#f1dfc9]/50">
                                                <p className="text-[10px] text-[#7a5c49] mb-1">Peak Month</p>
                                                <p className="text-base sm:text-lg font-bold text-[#4a2e21]">
                                                    {chartData.revenueByMonth.reduce((max, item) => item.revenue > max.revenue ? item : max, chartData.revenueByMonth[0]).month}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full flex items-end justify-between gap-1 sm:gap-2 px-2 mt-auto min-h-[180px]">
                                            {chartData.revenueByMonth.map((item, idx) => {
                                                const maxRevenue = Math.max(...chartData.revenueByMonth.map(d => d.revenue));
                                                const heightPercent = (item.revenue / maxRevenue) * 100;
                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 min-w-[40px] max-w-[70px] h-full justify-end">
                                                        {/* Value label on top */}
                                                        <span className="text-[9px] sm:text-[10px] font-semibold text-[#4a2e21] whitespace-nowrap mb-1">
                                                            ₹{(item.revenue / 1000).toFixed(0)}k
                                                        </span>

                                                        {/* Bar container */}
                                                        <div className="w-full relative flex-1 flex items-end group">
                                                            <div className="w-full bg-[#f1dfc9]/20 rounded-t-lg absolute inset-0 md:group-hover:bg-[#f1dfc9]/30 transition-colors"></div>
                                                            <div
                                                                className="w-full bg-gradient-to-t from-[#6F4E37] to-[#A97155] rounded-t-lg transition-all duration-500 ease-out hover:from-[#7a5c49] hover:to-[#b8846d] relative z-10"
                                                                style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                            />
                                                        </div>

                                                        {/* Month label */}
                                                        <span className="text-[10px] sm:text-xs font-medium text-[#7a5c49] mt-2">{item.month}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "users" && (
                            <>
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfa]">
                                    <h3 className="text-lg font-semibold text-[#4a2e21]">
                                        Customers
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        Page {usersPage} of {usersTotalPages || 1}
                                    </span>
                                </div>

                                {allUsers.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No users found.
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#f7f3eb] text-[#6F4E37] text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-3 font-medium">User</th>
                                                        <th className="px-6 py-3 font-medium">Email</th>
                                                        <th className="px-6 py-3 font-medium">Role</th>
                                                        <th className="px-6 py-3 font-medium">Joined</th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {usersSlice.map((user) => (
                                                        <tr key={user.id} className="hover:bg-gray-50/50 transition">
                                                            {/* User */}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-[#f1dfc9] flex items-center justify-center text-[#4a2e21]">
                                                                        <FaUser />
                                                                    </div>
                                                                    <span className="font-medium text-[#4a2e21]">
                                                                        {user.name}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Email */}
                                                            <td className="px-6 py-4 text-gray-600 text-xs font-mono">
                                                                {user.email}
                                                            </td>

                                                            {/* Role */}
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`text-xs font-semibold px-2 py-1 rounded ${user.role === "ADMIN"
                                                                        ? "bg-purple-100 text-purple-700"
                                                                        : user.role === "PROVIDER"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-[#f1dfc9] text-[#4a2e21]"
                                                                        }`}
                                                                >
                                                                    {user.role}
                                                                </span>
                                                            </td>




                                                            {/* Date */}
                                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex justify-between items-center px-6 py-4 border-t">
                                            <button
                                                disabled={usersPage === 1}
                                                onClick={() => setUsersPage((p) => p - 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                disabled={usersPage === usersTotalPages}
                                                onClick={() => setUsersPage((p) => p + 1)}
                                                className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}


                    </div>
                </main>
            </div>
        </div>
    );
}
