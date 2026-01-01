"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

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
} from "react-icons/fa";

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  if (loading)
    return (
      <Loading />
    );

  return (
    <div className="min-h-screen bg-[#ece9d8] pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8 relative">
          <a
            href="/landingpage"
            className="self-start md:absolute md:left-0 md:top-2 px-6 py-2 rounded-full text-white bg-[#6F4E37] hover:bg-[#5A3F2E] transition-all shadow-md text-sm mb-4 md:mb-0"
          >
            Home
          </a>
          <h1 className="text-3xl md:text-4xl font-bold text-[#4a2e21] text-center">
            All Service Categories
          </h1>
        </div>

        <div className="max-w-md mx-auto mb-10">
          <input
            type="text"
            placeholder="Search categories..."
            onChange={(e) => {
              const term = e.target.value.toLowerCase();
              const all = document.querySelectorAll("[data-cat-name]");
              all.forEach((el) => {
                const name = el.getAttribute("data-cat-name").toLowerCase();
                el.style.display = name.includes(term) ? "flex" : "none";
              });
            }}
            className="w-full px-4 py-3 rounded-full border border-[#e5dcc7] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-white text-[#4a2e21]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || FaTools;

            return (
              <div
                key={cat.id}
                data-cat-name={cat.name}
                onClick={() => router.push(`/categories/${cat.id}`)}
                className="cursor-pointer bg-white p-6 rounded-xl shadow-md border border-[#e5dcc7] 
                           hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center"
              >
                <Icon className="text-4xl text-[#7a5c49] mb-3" />
                <p className="text-sm font-medium text-[#4a2e21] text-center">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {cat._count?.subcategories || 0} subcategories
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
