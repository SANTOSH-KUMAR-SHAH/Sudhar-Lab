"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { FaPlus, FaTimes, FaRegListAlt, FaUserCircle, FaEdit } from "react-icons/fa";
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

  const [form, setForm] = useState({
    id: "",
    categoryId: "",
    subcategoryId: "",
    price: "",
    description: "",
    duration: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchCategories();
    fetchServices();
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

  // ✅ CORRECT LOGOUT FUNCTION
  function handleLogout() {
    localStorage.removeItem("token");

    // delete cookie
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

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
      const body = {
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId || null,
        price: parseFloat(form.price),
        description: form.description,
        duration: form.duration ? parseInt(form.duration) : null,
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
      <div className="min-h-screen pt-20 bg-[#ece9d8] px-6">
        <div className="max-w-6xl mx-auto flex gap-6">
          {/* SIDEBAR */}
          <aside className="w-64 bg-white rounded-2xl p-4 shadow h-[calc(100vh-5rem)]">
            <div className="mb-6 text-center">
              <FaUserCircle className="text-6xl mx-auto text-[#7a5c49]" />
              <p className="mt-2 font-semibold text-[#4a2e21]">Provider</p>
            </div>

            <nav className="flex flex-col gap-2">
              {/* SERVICES BUTTON */}
              <button
                onClick={() => setActiveTab("services")}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg ${
                  activeTab === "services"
                    ? "bg-[#f1dfc9] text-[#4a2e21]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaRegListAlt /> Services
              </button>

              {/* PROFILE BUTTON */}
              <button
                onClick={() => setActiveTab("profile")}
                className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg ${
                  activeTab === "profile"
                    ? "bg-[#f1dfc9] text-[#4a2e21]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaUserCircle /> Profile
              </button>

              {/* LOGOUT BUTTON — NEVER ACTIVE */}
              <button
                onClick={handleLogout}
                className="text-left flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700"
              >
                <FaTimes /> Log out
              </button>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-[#6F4E37]">My Dashboard</h1>

              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 bg-[#672410] text-white px-4 py-2 rounded-lg hover:bg-[#4d1a0a] transition"
              >
                <FaPlus /> Add Service
              </button>
            </div>

            {activeTab === "services" && (
              <div className="bg-white rounded-2xl p-6 shadow">
                <h2 className="text-xl font-semibold text-[#4a2e21] mb-4 flex items-center gap-2">
                  <FaRegListAlt /> Active Services
                </h2>

                {loading ? (
                  <Loading />
                ) : services.length === 0 ? (
                  <p className="text-gray-600">
                    No services found. Add one using the button above.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 border border-gray-200 rounded-lg relative hover:shadow-md"
                      >
                        <button
                          onClick={() => openEdit(s)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        >
                          <FaEdit />
                        </button>

                        <h3 className="font-semibold text-[#4a2e21]">
                          {s.description || "Untitled service"}
                        </h3>

                        <p className="text-sm text-gray-600">Price: ₹{s.price}</p>
                        <p className="text-sm text-gray-600">
                          Category: {s.category?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Subcategory: {s.subcategory?.name || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl p-6 shadow">
                <h2 className="text-xl font-semibold text-[#4a2e21] mb-4">
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <form
            onSubmit={submitService}
            className="relative bg-[#f9f6f0] border border-[#e5dcc7] rounded-2xl p-6 w-full max-w-xl shadow-lg z-10 text-black"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#4a2e21]">
                {isEditing ? "Edit Service" : "Add Service"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3">
              {/* CATEGORY SELECT */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={onCategoryChange}
                  className="w-full p-2 rounded-lg border bg-white text-black"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUBCATEGORY SELECT */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategoryId"
                  value={form.subcategoryId}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border bg-white text-black"
                >
                  <option value="">Select subcategory (optional)</option>
                  {subcats.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRICE */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Price (INR)
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  type="number"
                  className="w-full p-2 rounded-lg border bg-white text-black"
                />
              </div>

              {/* DURATION */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  type="number"
                  className="w-full p-2 rounded-lg border bg-white text-black"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 rounded-lg border bg-white text-black"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#672410] text-white"
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
