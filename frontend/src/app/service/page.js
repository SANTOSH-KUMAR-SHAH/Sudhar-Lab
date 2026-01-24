"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBroom,
  FaBolt,
  FaWrench,
  FaTools,
  FaCogs,
  FaLaptopCode,
  FaSpa,
  FaPaintRoller,
  FaTruckMoving,
  FaShieldAlt,
  FaChalkboardTeacher,
  FaDog,
  FaCalendarCheck,
  FaCarAlt,
  FaQuestionCircle,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";
  const URL = isProd
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";

  const iconMap = {
    cleaning: FaBroom,
    electric: FaBolt,
    plumbing: FaWrench,
    handyman: FaTools,
    appliances: FaCogs,
    computer: FaLaptopCode,
    beauty: FaSpa,
    painting: FaPaintRoller,
    moving: FaTruckMoving,
    security: FaShieldAlt,
    tutor: FaChalkboardTeacher,
    pet: FaDog,
    event: FaCalendarCheck,
    automobile: FaCarAlt,
    misc: FaQuestionCircle,
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(`${URL}/api/categories`, { headers });
        const data = res.data;

        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [URL]);


  const processedCategories = useMemo(() => {
    let result = [...categories];


    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(term)
      );
    }


    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "count") {
        const countA = a.availableProviders || 0;
        const countB = b.availableProviders || 0;
        return countB - countA;
      }
      return 0;
    });

    return result;
  }, [categories, searchQuery, sortBy]);


  const totalPages = Math.ceil(processedCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedCategories.slice(start, start + itemsPerPage);
  }, [processedCategories, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#ece9d8] text-[#4a2e21] font-sans">


      <div className="relative bg-[#4a2e21] text-[#ece9d8] pt-32 pb-20 px-6 rounded-b-[3rem] shadow-xl overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-[#6F4E37] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] bg-[#8B5E3C] rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#6F4E37] px-4 py-1.5 rounded-full text-sm font-semibold mb-4 shadow-sm text-[#ece9d8]/90">
              <FaTools className="text-sm" />
              <span>Expert Services</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight"
            >
              Find the Perfect <br />
              <span className="text-[#d4c5a9]">Help Near You</span>
            </motion.h1>
            <p className="text-lg text-[#ece9d8]/80 max-w-lg mb-8">
              Explore our wide range of professional services tailored to your needs.
              From home repairs to personal care, we've got you covered.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/landingpage")}
              className="bg-[#d4c5a9] text-[#4a2e21] px-8 py-3 rounded-full font-bold shadow-lg hover:bg-white transition-colors"
            >
              Go Home
            </motion.button>
          </div>


          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md bg-[#ece9d8] p-6 rounded-2xl shadow-2xl border-4 border-[#6F4E37]/20"
          >
            <h3 className="text-xl font-bold text-[#4a2e21] mb-4 flex items-center gap-2">
              <FaSearch className="text-[#6F4E37]" /> Search Categories
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Plumbing, Cleaning..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#d4c5a9] focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-[#4a2e21] placeholder-[#4a2e21]/50 shadow-inner"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F4E37]/50" />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-[#6F4E37] whitespace-nowrap">Sort By:</label>
                <div className="relative w-full">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white border border-[#d4c5a9] focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-[#4a2e21] cursor-pointer shadow-sm"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="count">Most Popular</option>
                  </select>
                  <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F4E37]/50 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-16">


        <div className="flex justify-between items-center mb-8 border-b border-[#d4c5a9]/50 pb-4">
          <h2 className="text-2xl font-bold text-[#4a2e21]">
            Help near you....
          </h2>
          <span className="text-sm font-medium text-[#6F4E37] bg-[#d4c5a9]/30 px-3 py-1 rounded-full">
            {processedCategories.length} Categories Found
          </span>
        </div>


        {processedCategories.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <FaSearch className="text-6xl mx-auto mb-4 text-[#6F4E37]/30" />
            <p className="text-xl font-medium">No categories found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-[#6F4E37] underline hover:text-[#4a2e21]"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <AnimatePresence>
              {paginatedCategories.map((cat, index) => {
                const Icon = iconMap[cat.icon] || FaTools;
                return (
                  <motion.div
                    layout
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => router.push(`/categories/${cat.id}`)}
                    className="group cursor-pointer bg-white rounded-2xl p-6 shadow-md border border-[#eee8d5] hover:shadow-xl hover:border-[#6F4E37]/30 transition-all relative overflow-hidden"
                  >

                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#6F4E37]/5 rounded-bl-[100px] group-hover:scale-150 transition-transform duration-500 origin-top-right"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-[#ece9d8] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#6F4E37] transition-colors duration-300 shadow-inner">
                        <Icon className="text-3xl text-[#6F4E37] group-hover:text-[#ece9d8] transition-colors duration-300" />
                      </div>

                      <h3 className="text-lg font-bold text-[#4a2e21] mb-1 line-clamp-1 group-hover:text-[#6F4E37] transition-colors">
                        {cat.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-[#8B5E3C] bg-[#ece9d8]/50 px-3 py-1 rounded-full">
                        <span>{cat.availableProviders || 0} Available</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}


        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-white border border-[#d4c5a9] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#6F4E37] transition-all shadow-sm"
            >
              <FaArrowLeft />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${currentPage === page
                    ? "bg-[#6F4E37] text-white shadow-md scale-110"
                    : "bg-white text-[#4a2e21] border border-[#d4c5a9] hover:bg-[#ece9d8]"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full bg-white border border-[#d4c5a9] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#6F4E37] transition-all shadow-sm"
            >
              <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
