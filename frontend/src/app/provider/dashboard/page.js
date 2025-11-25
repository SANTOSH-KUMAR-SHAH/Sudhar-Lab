"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
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
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? "https://localhelpbackendv2.onrender.com"
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


  const [form, setForm] = useState({
    id: "",
    categoryId: "",
    subcategoryId: "",
    price: "",
    description: "",
    duration: "",
    selectedDays: [],
  });

  const [stats] = useState({
    completedServices: 47,
    pendingBookings: 5,
    totalRevenue: 23450,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchCategories();
    fetchServices();
    fetchRequests();
  }, []);

  async function fetchCategories() {
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      const data = res.data;
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
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
    const res = await axios.get(`${API_BASE}/api/providers/bookings`, { headers });
    setRequests(res.data.bookings || []);
  } catch (err) {
    console.error(err);
  }
  setLoadingRequests(false);
}
async function handleAction(bookingId, action) {
  try {
    const headers = token ? { Authorization: "Bearer " + token } : {};
    await axios.patch(
      `${API_BASE}/api/bookings/${bookingId}/status`,
      { action },
      { headers }
    );

    toast.success(`Booking ${action}ed`, {
      style: { background: "#e6ffed", color: "#03543f" },
    });

    fetchRequests();
  } catch (err) {
    toast.error("Action failed");
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
      const res = await axios.get(`${API_BASE}/api/categories/${id}`);
      const data = res.data;
      setSubcats(data.category?.subcategories || []);
    } catch (err) {
      console.error(err);
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
      selectedDays: [], // NEW
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
      const res = await axios.get(`${API_BASE}/api/categories/${catId}`);
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
            ${
              sidebarOpen
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

            <div className="mb-6 text-center mt-8 lg:mt-0">
              <FaUserCircle className="text-6xl mx-auto text-[#7a5c49]" />
              <p className="mt-2 font-semibold text-[#4a2e21]">Provider</p>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveTab("services");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "services"
                    ? "bg-[#f1dfc9] text-[#4a2e21] font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaRegListAlt /> Services
              </button>

              <button
                onClick={() => {
                  setActiveTab("profile");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "profile"
                    ? "bg-[#f1dfc9] text-[#4a2e21] font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaUserCircle /> Profile
              </button>
              <button
                onClick={() => {
                  setActiveTab("requests");
                  setSidebarOpen(false);
                }}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "requests"
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
                        <p className="text-2xl font-bold text-[#4a2e21]">
                          ₹{stats.totalRevenue.toLocaleString()}
                        </p>
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

                {/* Request Loader */}
                {loadingRequests ? (
                  <Loading />
                ) : requests.length === 0 ? (
                  <p className="text-gray-600">No current booking requests.</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 border border-gray-200 rounded-lg bg-[#fdfcfa]"
                      >
                        <p className="font-medium text-[#4a2e21]">
                          {r.service.subcategory?.name || "Service"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(r.bookingStart).toLocaleString()}
                        </p>

                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => handleAction(r.id, "accept")}
                            className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(r.id, "cancel")}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-[#4a2e21] mb-4">
                  Profile
                </h2>
                <p className="text-gray-700">
                  This is a static profile page. You can edit it later.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
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
          ${
            form.selectedDays?.includes(day)
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
      )}
    </>
  );
}
