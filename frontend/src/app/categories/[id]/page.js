"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Loading from "@/components/loading";
import { FaUserCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import toast from "react-hot-toast";


const API_BASE =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";

const ITEMS_PER_PAGE = 6;

export default function CategoryServicesPage() {
  const router = useRouter();
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetchCategoryAndServices(id);
  }, [id]);

  async function fetchCategoryAndServices(catId) {
    setLoading(true);
    try {
      // fetch category (name) and providers/services
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [catRes, provRes] = await Promise.all([
        axios.get(`${API_BASE}/api/categories/${catId}`, { headers }),
        axios.get(`${API_BASE}/api/categories/${catId}/providers`, { headers }),
      ]);

      const catJson = catRes.data;
      const provJson = provRes.data;

      setCategory(catJson.category || null);
      setServices(provJson.services || []);
    } catch (err) {
      console.error("Error loading category/services:", err);
      toast.error("Could not load services", {
        style: { background: "#ffe6e6", color: "#7A0A0A" }
      });
    } finally {
      setLoading(false);
    }
  }

  // --- Filtering Logic ---
  const filteredServices = services.filter((s) => {
    // 1. Search (Name or Description)
    const name = s.name || "";
    const desc = s.description || s.longDescription || "";
    const term = searchTerm.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(term) || desc.toLowerCase().includes(term);

    // 2. Price
    const price = s.price || 0;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;

    return matchesSearch && matchesPrice;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, minPrice, maxPrice]);


  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#ece9d8] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/service")}
            className="px-4 py-2 rounded-full text-white bg-[#6F4E37] hover:bg-[#5A3F2E] shadow"
          >
            Back
          </button>
          <h1 className="text-2xl font-bold text-[#4a2e21]">
            {category?.name || "Category"}
          </h1>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* --- Filters Section --- */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 border border-[#e5dcc7]">
          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-black border border-gray-300 focus:outline-none focus:border-[#6F4E37]"
              />
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
                <span className="text-gray-500 text-sm">₹ Min</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-20 outline-none text-sm text-black"
                  placeholder="0"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
                <span className="text-gray-500 text-sm">₹ Max</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-20 outline-none text-sm text-black"
                  placeholder="Any"
                />
              </div>
            </div>

          </div>
        </div>

        {/* --- List --- */}
        {paginatedServices.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600">
              {services.length === 0 ? "No services available in this category yet." : "No services match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paginatedServices.map((s) => (
              <div
                key={s.id}
                className="bg-white p-4 rounded-lg shadow flex items-start gap-4"
              >
                <div className="text-4xl text-gray-400">
                  <FaUserCircle />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#4a2e21]">
                      {category?.subcategories?.find((sub) => sub.id === s.subcategoryId)?.name || "Service"}
                    </h3>
                    <div className="text-sm font-semibold text-[#4a2e21]">
                      ₹{s.price}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Provided by:{" "}
                    <span className="font-medium text-[#4a2e21]">
                      {s.provider?.user?.name || "Provider"}
                    </span>
                  </p>
                  {s.duration ? (
                    <p className="text-sm text-gray-600">
                      Duration: {s.duration} mins
                    </p>
                  ) : null}
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {s.longDescription || s.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() =>
                        router.push(`/book/${s.id}?provider=${s.provider?.user?.id}`)
                      }
                      className="px-4 py-2 rounded-md bg-[#6F4E37] text-white hover:bg-[#5A3F2E] shadow"
                    >
                      Book
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/providers/${s.provider?.user?.id || ""}`)
                      }
                      className="px-3 py-1 rounded-md bg-[#f3f4f6] text-[#4a2e21]"
                    >
                      View provider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-white shadow disabled:opacity-50 hover:bg-gray-50 text-[#6F4E37]"
            >
              <FaChevronLeft />
            </button>
            <span className="flex items-center text-[#4a2e21] font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-white shadow disabled:opacity-50 hover:bg-gray-50 text-[#6F4E37]"
            >
              <FaChevronRight />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
