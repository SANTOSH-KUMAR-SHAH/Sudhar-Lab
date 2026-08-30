"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Loading from "@/components/loading";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  FaChalkboardTeacher,
  FaBroom,
  FaDog,
  FaLaptopCode,
  FaTools,
  FaTruckMoving,
  FaUtensils,
  FaRegLightbulb,
  FaStar,
  FaCheckCircle,
  FaHeadset,
} from "react-icons/fa";
import {
  FaPaintRoller,
  FaShieldAlt,
  FaEllipsisH,
  FaCar,
  FaPumpSoap
} from "react-icons/fa";


export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [allCustomer, setAllCustomers] = useState(0);
  const [allProviders, setAllProviders] = useState(0);

  const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";

  const URL = isProd
    ? "https://localhelp-hu2d.onrender.com"
    : "http://localhost:4040";

  const iconMap = {
    cleaning: FaBroom,
    electric: FaRegLightbulb,
    plumbing: FaTools,
    handyman: FaTools,
    appliances: FaUtensils,
    computer: FaLaptopCode,
    beauty: FaStar,
    painting: FaPaintRoller,
    moving: FaTruckMoving,
    security: FaShieldAlt,
    tutor: FaChalkboardTeacher,
    pet: FaDog,
    event: FaStar,
    automobile: FaCar,
    misc: FaEllipsisH,
  };

  const getAllCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${URL}/api/customers/all-customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllCustomers(res.data.count);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const getAllProviders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${URL}/api/customers/all-providers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllProviders(res.data.count);
    } catch (err) {
      console.error("Failed to fetch providers", err);
    }
  };

  useEffect(() => {
    async function initPage() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await axios.get(`${URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: () => true,
        });

        if (res.status !== 200) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        try {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res2 = await axios.get(`${URL}/api/categories`, {
            withCredentials: true,
            headers,
          });

          const data = res2.data;
          setCategories((data.categories || []).slice(0, 8));
        } catch (err) {
          console.error("Category fetch error", err);
        }

        setLoading(false);
      } catch (err) {
        console.error("Landing page init error", err);
        router.push("/login");
      }
    }

    initPage();
    getAllCustomers();
    getAllProviders();
  }, []);

  if (loading) return (
    <Loading message="Please wait, the server takes time to load sometimes.Thanks for your patience..." />
  );


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 bg-[#F4F5F0]">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div
              className="flex-1 space-y-8"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="text-5xl lg:text-6xl font-extrabold text-[#112E40] leading-tight mb-6">
                  Expert Help, <br /> Just a <span className="text-[#112E40] underline decoration-4 underline-offset-4">Click</span> Away
                </h1>
                <p className="text-xl text-gray-700 max-w-lg">
                  Connect with verified professionals for home services, tutoring, repairs, and more.
                </p>
              </div>

              <motion.div
                className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-2xl font-semibold text-[#112E40] mb-6">
                  Explore Services
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((cat) => {
                    const Icon = iconMap[cat.icon] || FaTools;
                    return (
                      <motion.div
                        key={cat.id}
                        variants={itemVariants}
                        onClick={() => router.push("/service")}
                        className="flex flex-col items-center text-center p-4 bg-[#F4F5F0] rounded-xl hover:shadow-lg hover:bg-[#E8F2EE] cursor-pointer transition-all border border-[#DDE3E0] group"
                      >
                        <Icon className="text-3xl text-[#127373] mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-[#112E40]">
                          {cat.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => router.push("/service")}
                    className="px-8 py-3 bg-[#112E40] text-white font-medium rounded-full hover:bg-[#112E40] hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    View All Categories
                  </button>
                </div>
              </motion.div>


              <div className="flex items-center justify-around bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#112E40]">{allCustomer}</p>
                  <p className="text-xs text-gray-600 font-medium tracking-wide uppercase mt-1">Customers</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#112E40]">{allProviders}</p>
                  <p className="text-xs text-gray-600 font-medium tracking-wide uppercase mt-1">Providers</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#112E40]">4.9</p>
                  <p className="text-xs text-gray-600 font-medium tracking-wide uppercase mt-1">Rating</p>
                </div>
              </div>
            </motion.div>


            <div
              className="flex-1 flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg h-[600px] rounded-3xl border-4 border-white shadow-2xl overflow-hidden  hover:rotate-0 transition-all duration-500">
                <img
                  src="/services.png"
                  alt="Service Collage"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>


        <div className="bg-white py-24 relative overflow-hidden">

          <div className="absolute top-0 left-0 w-64 h-64 bg-[#E8F2EE] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <motion.h2
              className="text-4xl font-bold text-[#112E40] text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose LocalHelp?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: FaCheckCircle,
                  title: "Verified & Vetted",
                  description:
                    "Every professional goes through a strict background check and skills assessment.",
                },
                {
                  icon: FaStar,
                  title: "Top Quality Work",
                  description:
                    "We guarantee high-quality service. If you're not satisfied, we make it right.",
                },
                {
                  icon: FaHeadset,
                  title: "24/7 Support",
                  description:
                    "Our dedicated support team is always here to help you with any queries.",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="text-center p-8 bg-white rounded-2xl hover:shadow-xl transition-all border border-[#DDE3E0] hover:border-[#E8A324]/30"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-inner bg-[#E8A324] text-white shadow-[0_4px_12px_rgba(232,163,36,0.3)]">
                    <feature.icon className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold text-[#112E40] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
