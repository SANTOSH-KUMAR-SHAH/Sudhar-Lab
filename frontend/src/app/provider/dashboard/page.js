"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { VscVerifiedFilled } from "react-icons/vsc";
import { MdCancel } from "react-icons/md";
import {
  FaPlus,
  FaTimes,
  FaRegListAlt,
  FaUserCircle,
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaBars,
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
  FaComment
} from "react-icons/fa";
import { MdCalendarViewDay } from "react-icons/md";
import { MdDoneAll } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? "https://localhelp-hu2d.onrender.com"
    : "http://localhost:4040";

export default function Dashboard() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [feedbackStats, setFeedbackStats] = useState({ reviews: [], avg: 0, total: 0 });

  const [form, setForm] = useState({
    id: "",
    categoryId: "",
    subcategoryId: "",
    price: "",
    description: "",
    duration: "",
    selectedDays: [],
  });

  const [stats, setStats] = useState({
    completedServices: 0,
    pendingBookings: 0,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
    fetchServices();
    fetchRequests();
    fetchEarnings();
    fetchFeedback();
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await axios.get(`${API_BASE}/api/providers/stats`, { headers });
      setStats(res.data.stats || { completedServices: 0, pendingBookings: 0 });
    } catch (err) {
      console.error("fetchStats error", err);
    }
  }

  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/api/providers/me`, { headers });
      setProfile(res.data.profile);
    } catch (err) {
      console.error("Fetch profile error", err);
    }
  }
  function isPastBooking(b) {
    return new Date(b.bookingEnd) < new Date();
  }

  async function fetchCategories() {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/api/categories`, { headers });
      const data = res.data;
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  }
  async function fetchEarnings() {
    const headers = token ? { Authorization: "Bearer " + token } : {};
    const res = await axios.get(`${API_BASE}/api/providers/earnings`, { headers });
    setEarnings(res.data.earnings || 0);
  }

  async function fetchServices() {
    setLoading(true);
    try {
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await axios.get(`${API_BASE}/api/services`, { headers });
      const data = res.data;
      setServices(data.services || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }
  async function fetchRequests() {
    setLoadingRequests(true);
    try {
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await axios.get(`${API_BASE}/api/bookings/providers/bookings`, { headers });
      const data = res.data.bookings || [];


      const enriched = await Promise.all(
        data.map(async (req) => {
          const subcatId = req.service?.subcategoryId;
          const subcatName = subcatId ? await getSubcatName(subcatId) : "Service";
          return { ...req, subcatName };
        })
      );

      setRequests(enriched);

    } catch (err) {
      console.error(err);
    }
    setLoadingRequests(false);
  }

  async function fetchFeedback() {
    try {
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await axios.get(`${API_BASE}/api/feedback/reviews/provider`, { headers });
      setFeedbackStats(res.data);
    } catch (err) {
      console.error("fetchFeedback error", err);
    }
  }

  async function handleAction(bookingId, action) {
    try {
      const headers = token ? { Authorization: "Bearer " + token } : {};

      if (action === "complete") {
        await axios.patch(
          `${API_BASE}/api/providers/bookings/${bookingId}/complete`,
          {},
          { headers }
        );
      } else {
        await axios.patch(
          `${API_BASE}/api/bookings/${bookingId}/status`,
          { action },
          { headers }
        );
      }

      toast.success(`Booking ${action}ed`, {
        style: { background: "#e6ffed", color: "#03543f" },
      });

      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    }
  }

  async function handleAvailabilityToggle() {
    if (!profile) return;
    const newVal = !profile.isAvailable;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE}/api/providers/availability`, { isAvailable: newVal }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({ ...prev, isAvailable: newVal }));
      toast.success(newVal ? "You are now Online" : "You are now Offline");
    } catch (err) {
      toast.error("Failed to update availability");
    }
  }

  async function handleSaveSchedule(scheduleData) {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE}/api/providers/schedule`, { schedule: scheduleData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({ ...prev, schedule: scheduleData }));
      toast.success("Schedule updated successfully");
    } catch (err) {
      toast.error("Failed to update schedule");
    }
  }

  async function onCategoryChange(e) {
    const id = e.target.value;
    setForm((prev) => ({ ...prev, categoryId: id, subcategoryId: "" }));

    if (!id) {
      setSubcats([]);
      return;
    }

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/api/categories/${id}`, {
        headers,
      });
      const data = res.data;
      setSubcats(data.category?.subcategories || []);
    } catch (err) {
      console.error(err);
    }
  }
  async function getSubcatName(id) {
    try {
      const res = await axios.get(`${API_BASE}/api/categories/subcategory/${id}`);
      return res.data.subcategory?.name || "Unknown";
    } catch (err) {
      return "Unknown";
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    Cookies.remove("token");
    router.replace("/login");
  }

  function openAdd() {
    setIsEditing(false);
    setForm({
      id: "",
      categoryId: "",
      subcategoryId: "",
      price: "",
      description: "",
      duration: "",
      selectedDays: [],
    });
    setShowModal(true);
  }

  function openEdit(service) {
    setIsEditing(true);
    setForm({
      id: service.id,
      categoryId: service.categoryId || "",
      subcategoryId: service.subcategoryId || "",
      price: service.price || "",
      description: service.description || "",
      duration: service.duration || "",
      selectedDays: service.availability
        ? Object.keys(service.availability).filter(
          (d) => service.availability[d]?.length > 0
        )
        : [],
    });

    if (service.categoryId) fetchCategorySubcats(service.categoryId);

    setShowModal(true);
  }

  async function fetchCategorySubcats(catId) {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/api/categories/${catId}`, {
        headers,
      });
      const data = res.data;
      setSubcats(data.category?.subcategories || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function submitService(e) {
    e.preventDefault();
    try {
      if (!form.selectedDays || form.selectedDays.length === 0) {
        toast.error("Please select at least one available day.", {
          style: { background: "#ffe6e6", color: "#7a0a0a" },
        });
        return;
      }
      const body = {
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId || null,
        price: parseFloat(form.price),
        description: form.description,
        duration: form.duration ? parseInt(form.duration) : null,
        selectedDays: form.selectedDays || [],
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = "Bearer " + token;

      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_BASE}/api/services/${form.id}`
        : `${API_BASE}/api/services`;

      const res = await axios({
        method,
        url,
        headers,
        data: body,
        validateStatus: () => true,
      });
      toast.success(isEditing ? "Service updated" : "Service added", {
        style: {
          background: "#e6ffed",
          color: "#03543f",
        },
      });
      if (res.status < 200 || res.status >= 300)
        throw new Error(res.data.message || "Failed");

      setShowModal(false);
      fetchServices();
    } catch (err) {
      alert(err.message || "Error");
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#ece9d8]">
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#6F4E37]">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-2xl text-[#6F4E37]"
          >
            <FaBars />
          </button>
        </div>

        <div className="lg:flex lg:gap-6 max-w-7xl mx-auto px-4 lg:px-6 pt-20 lg:pt-6 pb-6">
          <aside
            className={`
            fixed lg:sticky top-0 left-0 h-full lg:h-[calc(100vh-3rem)] lg:top-6
            w-64 bg-white rounded-none lg:rounded-2xl p-4 shadow-lg lg:shadow
            transform transition-transform duration-300 ease-in-out z-50
            ${sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
              }
          `}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-gray-600"
            >
              <FaTimes />
            </button>

            <div className="mb-6 text-center mt-8 lg:mt-0 flex flex-col items-center">
              <FaUserCircle className="text-6xl mx-auto text-[#7a5c49]" />
              <p className="mt-2 font-semibold text-[#4a2e21]">{profile?.user?.name || "Provider"}</p>


              <div className="mt-3 flex items-center justify-center gap-2">
                <span className={`text-xs font-bold ${profile?.isAvailable ? "text-green-600" : "text-gray-500"}`}>
                  {profile?.isAvailable ? "ONLINE" : "OFFLINE"}
                </span>
                <button
                  onClick={handleAvailabilityToggle}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${profile?.isAvailable ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${profile?.isAvailable ? "translate-x-5" : "translate-x-0"
                    }`}></div>
                </button>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === "profile"
                  ? "bg-[#f1dfc9] text-[#4a2e21] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <FaUserCircle /> Profile
              </button>
              <button
                onClick={() => {
                  setActiveTab("services");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === "services"
                  ? "bg-[#f1dfc9] text-[#4a2e21] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <FaRegListAlt /> Services
              </button>

              <button
                onClick={() => {
                  setActiveTab("slots");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === "slots"
                  ? "bg-[#f1dfc9] text-[#4a2e21] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <MdCalendarViewDay /> Slots
              </button>
              <button
                onClick={() => {
                  setActiveTab("feedback");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === "feedback"
                  ? "bg-[#f1dfc9] text-[#4a2e21] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <FaStar /> Feedback Stats
              </button>

              <button
                onClick={() => {
                  setActiveTab("requests");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === "requests"
                  ? "bg-[#f1dfc9] text-[#4a2e21] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <FaClock /> Requests
              </button>

              <button
                onClick={handleLogout}
                className="text-left flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                <FaTimes /> Log out
              </button>
            </nav>
          </aside>
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <main className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#6F4E37] hidden lg:block">
                My Dashboard
              </h1>
              <button
                onClick={openAdd}
                className="inline-flex items-center justify-center gap-2 bg-[#672410] text-white px-4 py-2.5 rounded-lg hover:bg-[#4d1a0a] transition-colors shadow-md w-full sm:w-auto"
              >
                <FaPlus /> Add Service
              </button>
            </div>

            {activeTab === "services" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#7a5d49]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Live Services
                        </p>
                        <p className="text-2xl font-bold text-[#4a2e21]">
                          {services.length}
                        </p>
                      </div>
                      <div className="bg-[#F3E9D7] p-3 rounded-full">
                        <FaRegListAlt className="text-[#6F4E37] text-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#7a5d49]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-[#4a2e21]">
                          {stats.completedServices}
                        </p>
                      </div>
                      <div className="bg-[#F3E9D7] p-3 rounded-full">
                        <FaCheckCircle className="text-[#6F4E37] text-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#7a5d49]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pending</p>
                        <p className="text-2xl font-bold text-[#4a2e21]">
                          {stats.pendingBookings}
                        </p>
                      </div>
                      <div className="bg-[#F3E9D7] p-3 rounded-full">
                        <FaClock className="text-[#6F4E37] text-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#7a5d49]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-[#4a2e21]">₹{earnings}</p>
                      </div>
                      <div className="bg-[#F3E9D7] p-3 rounded-full">
                        <FaClock className="text-[#6F4E37] text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
                  <h2 className="text-lg lg:text-xl font-semibold text-[#4a2e21] mb-4 flex items-center gap-2">
                    <FaRegListAlt /> Active Services
                  </h2>

                  {loading ? (
                    <Loading />
                  ) : services.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        No services found. Add your first service to get
                        started!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {services.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 border border-gray-200 rounded-lg relative hover:shadow-md transition-shadow bg-[#fdfcfa]"
                          onClick={() => openEdit(s)}
                        >
                          <button
                            onClick={() => openEdit(s)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-[#672410] transition-colors"
                          >
                            <FaEdit className="text-[#6F4E37]" />
                          </button>

                          <h3 className="font-semibold text-[#4a2e21] mb-2 pr-8">
                            {s.subcategory?.name || "Untitled service"}
                          </h3>

                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Price:</span> ₹
                              {s.price}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Category:</span>{" "}
                              {s.category?.name}
                            </p>
                            {s.duration && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span>{" "}
                                {s.duration} min
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {activeTab === "requests" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-[#4a2e21] mb-4 flex items-center gap-2">
                  <FaClock /> Live Requests
                </h2>


                {loadingRequests ? (
                  <Loading />
                ) : requests.length === 0 ? (
                  <p className="text-gray-600">No current booking requests.</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r) => {
                      const start = new Date(r.bookingStart);
                      const end = new Date(r.bookingEnd);
                      const now = new Date();
                      const isPast = end < now;

                      return (
                        <div
                          key={r.id}
                          className="p-4 border border-[#e4d7c5] rounded-xl bg-[#fdfcf8] shadow-sm"
                        >

                          <p className="font-semibold text-lg text-[#4a2e21]">
                            {r.subcatName || "Service"}
                          </p>


                          <p className="text-sm text-[#7a5d49] mt-1 flex items-center gap-1">
                            <FaClock className="text-[#7a5d49]" />
                            {start.toLocaleString()}
                          </p>


                          {r.status === "ACCEPTED" && (
                            <div className="mt-3 bg-[#f7f2ea] p-3 rounded-lg border border-[#e4d7c5]">
                              <p className="font-medium text-[#4a2e21] flex items-center gap-2">
                                <FaUserCircle className="text-[#6F4E37]" />{" "}
                                {r.customer.name}
                              </p>
                              <p className="text-sm text-[#7a5d49] flex items-center gap-2 mt-1">
                                <FaPhone className="text-[#6F4E37]" />{" "}
                                {r.customer.phone}
                              </p>





                            </div>
                          )}


                          <div className="mt-4">

                            {r.status === "PENDING" && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleAction(r.id, "accept")}
                                  className="px-4 py-2 rounded-lg bg-[#6F4E37] text-white 
                  hover:bg-[#5a3f2c] transition"
                                >
                                  Accept
                                </button>

                                <button
                                  onClick={() => handleAction(r.id, "cancel")}
                                  className="px-4 py-2 rounded-lg bg-[#A97155] text-white 
                  hover:bg-[#8a5944] transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}


                            {r.status === "ACCEPTED" && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#4a2e21] font-semibold text-sm">
                                  <VscVerifiedFilled className="text-[#6F4E37] text-xl" />
                                  Confirmed
                                </div>
                                <button
                                  onClick={() => handleAction(r.id, "complete")}
                                  className="px-4 py-2 rounded-lg bg-[#7a5d49] text-white 
                  hover:bg-[#674b3a] transition flex items-center gap-2 justify-center"
                                >
                                  <MdDoneAll className="text-white" />
                                  Mark Completed
                                </button>
                              </div>
                            )}


                            {r.status === "COMPLETED" && (
                              <div className="flex items-center gap-2 text-[#4a2e21] font-semibold">
                                <MdDoneAll className="text-[#6F4E37]" />
                                Completed
                              </div>
                            )}


                            {r.status === "CANCELLED" && (
                              <div className="flex items-center gap-2 text-[#A97155] font-semibold">
                                <MdCancel />
                                Rejected
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-[#4a2e21] mb-6 flex items-center gap-2">
                  <FaUserCircle /> Provider Profile
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <div className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800">
                        {profile?.user?.name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <div className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800">
                        {profile?.user?.email || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                      <div className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800">
                        {profile?.user?.phone || "N/A"}
                      </div>
                    </div>
                  </div>


                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Aadhaar Number</label>
                      <div className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 font-mono tracking-wider">
                        {profile?.aadharNumber || "XXXX-XXXX-XXXX"}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        <VscVerifiedFilled className="inline text-green-500 mr-1" />
                        Verified by Admin
                      </p>
                    </div>

                    <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#e5dcc7] mt-4">
                      <h4 className="font-semibold text-[#6F4E37] mb-2">Account Status</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile?.applicationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {profile?.applicationStatus || "UNKNOWN"}
                        </span>
                        <span className="text-sm text-gray-500">
                          Since {new Date().getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "slots" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-[#4a2e21] mb-6 flex items-center gap-2">
                  <MdCalendarViewDay /> Weekly Schedule / Slots
                </h2>
                <div className="space-y-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                    const schedule = profile?.schedule || {};
                    const s = schedule[day] || {};
                    return (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-100 pb-4 last:border-0">
                        <div className="w-32 font-medium text-[#4a2e21]">{day}</div>


                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">Start:</span>
                          <input
                            type="time"
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#672410] placeholder-gray-500 text-black outline-none"
                            defaultValue={s.start || ""}
                            id={`start-${day}`}
                          />
                          <span className="text-gray-500 text-sm ml-2">End:</span>
                          <input
                            type="time"
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#672410] placeholder-gray-500 text-black outline-none"
                            defaultValue={s.end || ""}
                            id={`end-${day}`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      const newSched = {};
                      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach(day => {
                        const startInput = document.getElementById(`start-${day}`);
                        const endInput = document.getElementById(`end-${day}`);

                        const valStart = startInput ? startInput.value : "";
                        const valEnd = endInput ? endInput.value : "";

                        if (valStart && valEnd) {
                          newSched[day] = { start: valStart, end: valEnd };
                        }
                      });
                      handleSaveSchedule(newSched);
                    }}
                    className="px-6 py-2.5 bg-[#672410] text-white rounded-lg hover:bg-[#4d1a0a] shadow-md transition-colors"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            )}


            {activeTab === "feedback" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-[#4a2e21] mb-6 flex items-center gap-2">
                  <FaStar /> Feedback & Ratings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#fdfcfa] border border-[#e5dcc7] p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Average Rating</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-4xl font-bold text-[#6F4E37]">{feedbackStats.avg.toFixed(1)}</span>
                        <div className="flex text-yellow-400 text-xl">
                          {[1, 2, 3, 4, 5].map(s => (
                            <FaStar key={s} className={s <= Math.round(feedbackStats.avg) ? "opacity-100" : "opacity-30"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-[#f1dfc9] rounded-full flex items-center justify-center text-[#6F4E37] text-xl">
                      <FaStar />
                    </div>
                  </div>

                  <div className="bg-[#fdfcfa] border border-[#e5dcc7] p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Reviews</p>
                      <p className="text-4xl font-bold text-[#6F4E37] mt-2">{feedbackStats.total}</p>
                    </div>
                    <div className="h-12 w-12 bg-[#f1dfc9] rounded-full flex items-center justify-center text-[#6F4E37] text-xl">
                      <FaComment />
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-[#4a2e21] mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {feedbackStats.reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet.</p>
                  ) : feedbackStats.reviews.map(rev => (
                    <div key={rev.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-[#4a2e21]">{rev.reviewer.name}</p>
                        <span className="text-xs text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-yellow-500 text-sm mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < rev.rating ? "opacity-100" : "opacity-20"} />
                        ))}
                      </div>
                      {rev.comment && <p className="text-gray-700 text-sm">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main >
        </div >
      </div >
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <form
            onSubmit={submitService}
            className="relative bg-[#f9f6f0] border border-[#e5dcc7] rounded-2xl p-4 lg:p-6 w-full max-w-xl shadow-lg z-10 text-black max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-semibold text-[#4a2e21]">
                {isEditing ? "Edit Service" : "Add Service"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={onCategoryChange}
                  required
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-[#672410] focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategoryId"
                  value={form.subcategoryId}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-[#672410] focus:border-transparent"
                >
                  <option value="">Select subcategory (optional)</option>
                  {subcats.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (INR) *
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-[#672410] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-[#672410] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Days *
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          selectedDays: prev.selectedDays?.includes(day)
                            ? prev.selectedDays.filter((d) => d !== day)
                            : [...(prev.selectedDays || []), day],
                        }))
                      }
                      className={`
          border px-3 py-2 rounded-lg capitalize text-sm
          ${form.selectedDays?.includes(day)
                          ? "bg-[#672410] text-white border-[#672410]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }
        `}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-[#672410] focus:border-transparent resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 rounded-lg bg-[#672410] text-white hover:bg-[#4d1a0a] transition-colors shadow-md"
                >
                  {isEditing ? "Save changes" : "Make live"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )
      }
    </>
  );
}
