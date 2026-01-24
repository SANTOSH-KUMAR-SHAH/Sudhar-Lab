"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import {
  FaUserCircle,
  FaPlus,
  FaTimes,
  FaClock,
  FaTrash,
  FaEdit,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaChevronLeft,
  FaSignOutAlt,
  FaBriefcase,
  FaUser,
  FaHome,
  FaCheckCircle,
  FaStar,
  FaExclamationTriangle
} from "react-icons/fa";
import Loading from "@/components/loading";


function BecomeProviderForm({ onSuccess }) {
  const [aadharNumber, setAadharNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserName(res.data.user.name);

        setUserEmail(res.data.user.email);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadharNumber || aadharNumber.length < 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${API_BASE}/api/become-provider`,
        { aadharNumber },
        { withCredentials: true, headers }
      );

      toast.success("Application Submitted!");
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Application failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-[#f7f3eb] p-4 rounded-xl border border-[#e5dcc7] mb-6">
        <h3 className="font-semibold text-[#4a2e21] mb-2">Join our Provider Network</h3>
        <p className="text-sm text-gray-600">
          Offer your services to thousands of customers. Apply now by verifying your identity.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[#6F4E37] font-medium mb-1">
            User Name:
          </label>
          <input type="text" value={userName} readOnly className="w-full p-3 border border-[#C8B69E] text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-[#FFFDF6] tracking-widest" />
          <label className="block text-[#6F4E37] font-medium mb-1">
            User Email:
          </label>
          <input type="text" value={userEmail} readOnly className="w-full p-3 border border-[#C8B69E] text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-[#FFFDF6] tracking-widest" />
          <label className="block text-[#6F4E37] font-medium mb-1">
            Aadhaar Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={aadharNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 12);
              setAadharNumber(val);
            }}
            className="w-full p-3 border border-[#C8B69E] text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-[#FFFDF6] tracking-widest"
            placeholder="XXXX XXXX XXXX"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your ID will be verified by our admin team securely.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6F4E37] text-white py-3 rounded-xl hover:bg-[#5A3F2E] transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}
const AVATAR_URL =
  "sandbox:/mnt/data/Screenshot 2025-11-25 at 18.47.51 (2).png";

const API_BASE =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";

const COFFEE = {
  dark: "#6F4E37",
  mid: "#7a5c49",
  light: "#f1dfc9",
  accent: "#A97155",
  text: "#4a2e21",
  cardBg: "#fdfcfa",
};

export default function CustomerDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsPage, setBookingsPage] = useState(1);
  const BOOKINGS_PAGE_SIZE = 6;

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrForm, setAddrForm] = useState({
    id: null,
    street: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    type: "HOME",
  });


  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ bookingId: null, rating: 0, comment: "" });


  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ bookingId: null, issueType: "Provider did not arrive", description: "" });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchAddresses();

  }, []);

  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_BASE}/api/customers/me`, {
        headers: authHeaders(),
        validateStatus: () => true,
      });
      if (res.status === 200) {
        setProfile(res.data.user);
        setProfileForm({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
        });
      } else {
        console.error("fetchProfile error", res.status, res.data);
      }
    } catch (err) {
      console.error("fetchProfile error", err);
    }
  }

  function onProfileChange(e) {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
  }

  async function saveProfile() {
    try {
      const res = await axios.patch(
        `${API_BASE}/api/customers/update`,
        {
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
        },
        {
          headers: { "Content-Type": "application/json", ...authHeaders() },
          validateStatus: () => true,
        }
      );

      if (res.status === 200) {
        toast.success("Profile updated", {
          style: { background: "#e6f7ec", color: "#034d22" },
        });
        setEditingProfile(false);
        fetchProfile();
      } else {
        throw new Error(res.data?.message || "Failed to update");
      }
    } catch (err) {
      toast.error(err.message || "Error updating profile", {
        style: { background: "#ffe8e8" },
      });
      console.error(err);
    }
  }

  async function fetchBookings() {
    setLoadingBookings(true);
    try {
      const res = await axios.get(`${API_BASE}/api/customers/bookings`, {
        headers: authHeaders(),
        validateStatus: () => true,
      });
      if (res.status === 200) {
        setBookings(res.data.bookings || []);
      } else {
        console.error("fetchBookings", res.status, res.data);
      }
    } catch (err) {
      console.error("fetchBookings err", err);
    }
    setLoadingBookings(false);
  }

  async function cancelBooking(bookingId) {
    try {
      const res = await axios.patch(
        `${API_BASE}/api/bookings/${bookingId}/status`,
        { action: "cancel" },
        {
          headers: { "Content-Type": "application/json", ...authHeaders() },
          validateStatus: () => true,
        }
      );
      if (res.status === 200) {
        toast.success("Booking cancelled");
        fetchBookings();
      } else {
        throw new Error(res.data?.message || "Failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel");
    }
  }

  async function fetchAddresses() {
    setLoadingAddresses(true);
    try {
      const res = await axios.get(`${API_BASE}/api/customers/addresses`, {
        headers: authHeaders(),
        validateStatus: () => true,
      });
      if (res.status === 200) {
        setAddresses(res.data.addresses || []);
      } else {
        console.error("fetchAddresses", res.status, res.data);
      }
    } catch (err) {
      console.log(err);
      console.error("fetchAddresses err", err);
    }
    setLoadingAddresses(false);
  }

  function openAddAddress() {
    setAddrForm({
      id: null,
      street: "",
      city: "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: "",
      type: "HOME",
    });
    setAddrModalOpen(true);
  }

  function openEditAddress(a) {
    setAddrForm({
      id: a.id,
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
      latitude: a.latitude ?? "",
      longitude: a.longitude ?? "",
      type: a.type || "HOME",
    });
    setAddrModalOpen(true);
  }

  function onAddrChange(e) {
    const { name, value } = e.target;
    setAddrForm((p) => ({ ...p, [name]: value }));
  }

  async function saveAddress() {
    try {
      if (
        !addrForm.street ||
        !addrForm.city ||
        !addrForm.state ||
        !addrForm.pincode
      ) {
        toast.error("Street, city, state and pincode are required");
        return;
      }

      if (addrForm.id) {
        const res = await axios.put(
          `${API_BASE}/api/customers/addresses/${addrForm.id}`,
          addrForm,
          {
            headers: { "Content-Type": "application/json", ...authHeaders() },
            validateStatus: () => true,
          }
        );
        if (res.status === 200) {
          toast.success("Address updated");
          setAddrModalOpen(false);
          fetchAddresses();
        } else {
          throw new Error(res.data?.message || "Failed");
        }
      } else {
        const res = await axios.post(
          `${API_BASE}/api/customers/addresses`,
          addrForm,
          {
            headers: { "Content-Type": "application/json", ...authHeaders() },
            validateStatus: () => true,
          }
        );
        if (res.status === 201) {
          toast.success("Address added");
          setAddrModalOpen(false);
          fetchAddresses();
        } else {
          throw new Error(res.data?.message || "Failed");
        }
      }
    } catch (err) {
      toast.error(err.message || "Address save failed");
      console.error(err);
    }
  }

  async function deleteAddress(id) {
    try {
      if (!confirm("Delete this address?")) return;
      const res = await axios.delete(
        `${API_BASE}/api/customers/addresses/${id}`,
        {
          headers: authHeaders(),
          validateStatus: () => true,
        }
      );
      if (res.status === 200) {
        toast.success("Address deleted");
        fetchAddresses();
      } else {
        throw new Error(res.data?.message || "Failed");
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }



  function openFeedback(bookingId) {
    setFeedbackForm({ bookingId, rating: 0, comment: "" });
    setFeedbackModalOpen(true);
  }

  async function submitFeedback() {
    try {
      if (feedbackForm.rating === 0) return toast.error("Please select a star rating");

      const res = await axios.post(`${API_BASE}/api/feedback/reviews`, feedbackForm, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
      });

      if (res.status === 200) {
        toast.success("Feedback submitted!");
        setFeedbackModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    }
  }

  function openReport(bookingId) {
    setReportForm({ bookingId, issueType: "Provider did not arrive", description: "" });
    setReportModalOpen(true);
  }

  async function submitReport() {
    try {
      if (!reportForm.description) return toast.error("Please provide a description");

      const res = await axios.post(`${API_BASE}/api/feedback/reports`, reportForm, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
      });

      if (res.status === 200) {
        toast.success("Report submitted. We will investigate.");
        setReportModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    Cookies.remove("token");
    router.replace("/login");
  }

  function goBecomeProvider() {
    router.push("/becomeprovider");
  }

  function statusLabel(status) {
    if (status === "PENDING") {
      return { text: "Pending", className: "text-[#A97155]" };
    }
    if (status === "ACCEPTED" || status === "CONFIRMED") {
      return { text: "Confirmed", className: "text-[#2b7a0b]" };
    }
    if (status === "CANCELLED") {
      return { text: "Cancelled", className: "text-[#7a0a0a]" };
    }
    return { text: status, className: "text-gray-700" };
  }

  return (
    <div className="min-h-screen bg-[#ece9d8]">

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/landingpage")}
            className="text-[#6F4E37] hover:text-[#4a2e21]"
          >
            <FaChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#6F4E37]">My Profile</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#6F4E37] hover:text-[#4a2e21]"
        >
          <FaTimes size={24} />
        </button>
      </div>

      <div className="lg:flex gap-6 max-w-7xl mx-auto px-4 lg:px-6 pt-20 lg:pt-6 pb-12">

        <aside
          className={`fixed lg:sticky top-0 left-0 h-full lg:h-[calc(100vh-3rem)] lg:top-6 w-72 bg-white p-6 rounded-none lg:rounded-2xl shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          <div className="mb-8 text-center mt-8 lg:mt-0">
            <div
              className="mx-auto w-28 h-28 rounded-full justify-center items-center flex overflow-hidden border-4"
              style={{ borderColor: COFFEE.mid }}
            >
              <FaUserCircle size={100} className="text-[#4a2e21]" />
            </div>
            <p
              className="mt-4 font-semibold text-lg"
              style={{ color: COFFEE.text }}
            >
              {profile?.name || "Customer"}
            </p>
            <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveTab("profile");
                setSidebarOpen(false);
              }}
              className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "profile"
                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaUser size={18} />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("addresses");
                setSidebarOpen(false);
              }}
              className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "addresses"
                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaMapMarkerAlt size={18} />
              <span>Addresses</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("bookings");
                setSidebarOpen(false);
              }}
              className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "bookings"
                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaClock size={18} />
              <span>My Bookings</span>
            </button>

            <div className="my-2 border-t border-gray-200"></div>

            <button
              onClick={() => {
                setActiveTab("become-provider");
                setSidebarOpen(false);
              }}
              className={`text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "become-provider"
                ? "bg-[#f1dfc9] text-[#4a2e21] font-semibold"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaBriefcase size={18} />
              <span>Become a Provider</span>
            </button>
            <button
              onClick={() => router.push("/landingpage")}
              className="text-left flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f1dfc9] hover:text-[#4a2e21] transition-colors"
            >
              <FaHome size={18} />
              Home Page
            </button>
            <button
              onClick={handleLogout}
              className="text-left flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
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


          {activeTab === "become-provider" && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2
                className="text-2xl font-semibold flex items-center gap-3 mb-6"
                style={{ color: COFFEE.text }}
              >
                <FaBriefcase size={24} />
                <span>Become a Provider</span>
              </h2>



              {(!profile?.providerProfile || profile.providerProfile.applicationStatus === 'NOT_APPLIED') ? (
                <BecomeProviderForm onSuccess={() => { fetchProfile(); }} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#e5dcc7] rounded-xl bg-[#fdfcfa]">

                  {profile.providerProfile.applicationStatus === "PENDING" && (
                    <>
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <FaClock className="text-yellow-600 text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-[#4a2e21]">Application Pending</h3>
                      <p className="text-gray-600 max-w-md mt-2">
                        Your application is currently under review by our admin team. This process usually takes 24-48 hours.
                      </p>
                    </>
                  )}


                  {profile.providerProfile.applicationStatus === "REJECTED" && (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <FaTimes className="text-red-600 text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-[#4a2e21]">Application Rejected</h3>
                      <p className="text-gray-600 max-w-md mt-2">
                        Unfortunately, your application was not approved at this time.
                      </p>

                    </>
                  )}


                  {profile.providerProfile.applicationStatus === "APPROVED" && (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <FaCheckCircle className="text-green-600 text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-[#4a2e21]">You are a Partner!</h3>
                      <p className="text-gray-600 max-w-md mt-2 mb-6">
                        Congratulations! Your provider account is active.
                      </p>
                      <button
                        onClick={() => router.push('/provider/dashboard')}
                        className="px-6 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5a3f2c] transition"
                      >
                        Go to Provider Dashboard
                      </button>
                    </>
                  )}


                  {profile.providerProfile.applicationStatus === "SUSPENDED" && (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <FaTimes className="text-red-600 text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-[#4a2e21]">Account Suspended</h3>
                      <p className="text-gray-600 max-w-md mt-2">
                        Your provider account has been suspended. Please contact support.
                      </p>
                    </>
                  )}

                </div>
              )}
            </div>
          )}


          {activeTab === "profile" && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2
                    className="text-2xl font-semibold"
                    style={{ color: COFFEE.text }}
                  >
                    My Profile
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage your account details
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!editingProfile ? (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f1dfc9] border border-[#f1dfc9] text-[#4a2e21] hover:bg-gray-50 transition-colors"
                    >
                      <FaEdit size={16} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 rounded-lg  bg-[#f1dfc9] border border-[#f1dfc9] hover:bg-[#e2b8a0] text-[#4a2e21] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        className="px-4 py-2 rounded-lg bg-[#6F4E37] text-white hover:bg-[#4a2e21] transition-colors"
                      >
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!editingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-[#fdfcfa] rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Name
                    </p>
                    <p className="font-semibold text-lg text-[#6F4E37]">
                      {profile?.name || "—"}
                    </p>
                  </div>
                  <div className="p-5 bg-[#fdfcfa] rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Email
                    </p>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" size={16} />
                      <p
                        className="font-semibold text-lg"
                        style={{ color: COFFEE.text }}
                      >
                        {profile?.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 bg-[#fdfcfa] rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Phone
                    </p>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" size={16} />
                      <p
                        className="font-semibold text-lg"
                        style={{ color: COFFEE.text }}
                      >
                        {profile?.phone || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      name="name"
                      value={profileForm.name}
                      onChange={onProfileChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      value={profileForm.email}
                      onChange={onProfileChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={profileForm.phone}
                      onChange={onProfileChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}


          {activeTab === "addresses" && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2
                  className="text-2xl font-semibold flex items-center gap-3"
                  style={{ color: COFFEE.text }}
                >
                  <FaMapMarkerAlt size={24} />
                  <span>Saved Addresses</span>
                </h2>
                <button
                  onClick={openAddAddress}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6F4E37] text-white hover:bg-[#4a2e21] transition-colors"
                >
                  <FaPlus size={16} />
                  <span>Add Address</span>
                </button>
              </div>

              {loadingAddresses ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12">
                  <FaMapMarkerAlt
                    size={48}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <p className="text-gray-600">
                    No saved addresses. Add one to make booking faster.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="p-5 border border-gray-200 rounded-lg bg-[#fdfcfa] hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#f1dfc9]"
                          style={{ color: COFFEE.text }}
                        >
                          {a.type || "HOME"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditAddress(a)}
                            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <FaEdit size={14} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteAddress(a.id)}
                            className="p-2 rounded-md border border-gray-300 hover:bg-red-50 transition-colors"
                          >
                            <FaTrash size={14} className="text-[#4a2e21]" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-[#4a2e21] mb-1">
                          {a.street}
                        </p>
                        <p className="text-sm text-gray-600">
                          {a.city}, {a.state}
                        </p>
                        <p className="text-sm text-gray-600">
                          PIN: {a.pincode}
                        </p>
                        {a.latitude && a.longitude && (
                          <p className="text-xs text-gray-400 mt-2">
                            Coords: {a.latitude}, {a.longitude}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {activeTab === "bookings" && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="mb-6">
                <h2
                  className="text-2xl font-semibold flex items-center gap-3"
                  style={{ color: COFFEE.text }}
                >
                  <FaClock size={24} />
                  <span>My Bookings</span>
                </h2>
              </div>

              {loadingBookings ? (
                <div className="text-center py-12">
                  <Loading />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <FaClock size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">
                    No bookings yet. Book a service to get started.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {bookings.slice((bookingsPage - 1) * BOOKINGS_PAGE_SIZE, bookingsPage * BOOKINGS_PAGE_SIZE).map((b) => {
                      const st = statusLabel(b.status);
                      return (
                        <div
                          key={b.id}
                          className="p-5 border border-gray-200 rounded-lg bg-[#fdfcfa] hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-1">
                                {b.service.category?.name} •{" "}
                                {b.service.subcategory?.name}
                              </p>
                              <h3 className="font-semibold text-lg text-[#4a2e21] mb-2">
                                {b.service.subcategory?.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Provider:{" "}
                                <span className="font-semibold">
                                  {b.provider?.name || "Provider"}
                                </span>
                              </p>
                            </div>
                            <div
                              className={`font-semibold text-sm ${st.className}`}
                            >
                              {st.text}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 py-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaRegCalendarAlt size={14} />
                              <span>
                                {new Date(b.bookingStart).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-[#4a2e21]">
                                ₹{b.service.price?.toLocaleString() ?? b.amount}
                              </span>
                              <span className="text-xs text-gray-400">
                                • {b.service.duration} min
                              </span>
                            </div>
                          </div>


                          {(b.status === "PENDING" || b.status === "ACCEPTED") && (
                            <div className="mt-3 bg-[#f1dfc9] border border-[#A97155] p-2 rounded text-xs text-[#A97155] flex items-start gap-2">
                              <span className="font-bold">Note:</span>
                              Booking fee (₹500) will be refunded automatically after service completion.
                            </div>
                          )}
                          {b.status === "CANCELLED" && (
                            <div className="mt-3 bg-orange-50 border border-orange-100 p-2 rounded text-xs text-orange-700 flex items-start gap-2">
                              <span className="font-bold">Refund:</span>
                              Refund of ₹500 is in progress (usually takes 3-5 days).
                            </div>
                          )}

                          <div className="flex justify-end gap-2 mt-3">
                            {b.status === "PENDING" && (
                              <button
                                onClick={() => cancelBooking(b.id)}
                                className="px-4 py-2 rounded-lg bg-[#A97155] text-white hover:bg-[#8a5944] transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                            )}
                            {b.status === "ACCEPTED" && (
                              <div className="px-4 py-2 rounded-lg border-2 border-[#6F4E37] text-[#4a2e21] font-semibold text-sm">
                                Upcoming
                              </div>
                            )}
                            {b.status === "CANCELLED" && (
                              <div className="px-4 py-2 rounded-lg border-2 border-red-600 text-red-700 font-semibold text-sm">
                                Cancelled
                              </div>
                            )}


                            <div className="flex gap-2">

                              {(b.status === "ACCEPTED" || b.status === "CONFIRMED" || b.status === "COMPLETED") && (
                                <button
                                  onClick={() => openReport(b.id)}
                                  className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm flex items-center gap-1"
                                >
                                  <FaExclamationTriangle size={12} /> Report
                                </button>
                              )}


                              {b.status === "COMPLETED" && (
                                <button
                                  onClick={() => !b.review && openFeedback(b.id)}
                                  disabled={!!b.review}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${b.review
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-[#f1dfc9] text-[#4a2e21] hover:bg-[#e2b8a0]"
                                    }`}
                                >
                                  <FaStar size={12} /> {b.review ? "Rated" : "Rate"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>


                  {bookings.length > BOOKINGS_PAGE_SIZE && (
                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                      <button
                        disabled={bookingsPage === 1}
                        onClick={() => setBookingsPage((p) => p - 1)}
                        className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-500">
                        Page {bookingsPage} of {Math.ceil(bookings.length / BOOKINGS_PAGE_SIZE)}
                      </span>
                      <button
                        disabled={bookingsPage === Math.ceil(bookings.length / BOOKINGS_PAGE_SIZE)}
                        onClick={() => setBookingsPage((p) => p + 1)}
                        className="px-4 py-2 rounded border text-[#4a2e21] hover:bg-[#4a2e21] hover:text-white disabled:opacity-40 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>


      {addrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAddrModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#4a2e21]">
                {addrForm.id ? "Edit Address" : "Add Address"}
              </h3>
              <button
                onClick={() => setAddrModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street
                </label>
                <input
                  name="street"
                  value={addrForm.street}
                  onChange={onAddrChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  name="city"
                  value={addrForm.city}
                  onChange={onAddrChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  name="state"
                  value={addrForm.state}
                  onChange={onAddrChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  name="pincode"
                  value={addrForm.pincode}
                  onChange={onAddrChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none   text-[#4a2e21]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  name="latitude"
                  value={addrForm.latitude}
                  onChange={onAddrChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  name="longitude"
                  value={addrForm.longitude}
                  onChange={onAddrChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={addrForm.type}
                  onChange={onAddrChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A97155] focus:border-transparent outline-none text-[#4a2e21]"
                >
                  <option value="HOME">HOME</option>
                  <option value="WORK">WORK</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddrModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                className="px-4 py-2 rounded-lg bg-[#6F4E37] text-white hover:bg-[#4a2e21] transition-colors"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        form={feedbackForm}
        setForm={setFeedbackForm}
        onSubmit={submitFeedback}
      />


      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        form={reportForm}
        setForm={setReportForm}
        onSubmit={submitReport}
      />
    </div>
  );
}

function FeedbackModal({ isOpen, onClose, form, setForm, onSubmit }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FaTimes size={20} />
        </button>

        <h3 className="text-xl font-bold text-[#4a2e21] mb-6 text-center">Rate Service</h3>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setForm({ ...form, rating: star })}
              className={`text-3xl transition-transform hover:scale-110 ${form.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
            >
              <FaStar />
            </button>
          ))}
        </div>

        <textarea
          className="w-full p-3 border border-gray-200 rounded-lg mb-4 h-32 text-gray-700 outline-none focus:ring-2 focus:ring-[#6F4E37]"
          placeholder="Tell us about your experience..."
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        ></textarea>

        <button
          onClick={onSubmit}
          className="w-full py-3 bg-[#6F4E37] text-white rounded-lg font-semibold hover:bg-[#5a3f2c] transition shadow-md"
        >
          Submit Review
        </button>
      </div>
    </div>
  )
}

function ReportModal({ isOpen, onClose, form, setForm, onSubmit }) {
  if (!isOpen) return null;
  const issues = ["Provider did not arrive", "Provider was rude/unprofessional", "Service quality unexpected", "Overcharging", "Other"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FaTimes size={20} />
        </button>

        <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2 justify-center">
          <FaExclamationTriangle /> Report Issue
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
          <select
            className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-red-200"
            value={form.issueType}
            onChange={(e) => setForm({ ...form, issueType: e.target.value })}
          >
            {issues.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg h-32 text-gray-700 outline-none focus:ring-2 focus:ring-red-200"
            placeholder="Please describe what went wrong..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          ></textarea>
        </div>

        <button
          onClick={onSubmit}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
        >
          Submit Report
        </button>
      </div>
    </div>
  )
}
