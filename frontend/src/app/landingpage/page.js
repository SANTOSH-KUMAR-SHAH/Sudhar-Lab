"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Loading from "@/components/loading";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";

  const URL = isProd
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";

  const iconMap = {
    FaTools,
    FaBroom,
    FaDog,
    FaChalkboardTeacher,
    FaUtensils,
    FaTruckMoving,
    FaRegLightbulb,
    FaLaptopCode,
  };

  useEffect(() => {
    async function initPage() {
      try {
        // Require a valid /me on the landing page. If there is no token
        // or the token is invalid/expired, redirect the user to /login.
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // token invalid or expired -> force user to login
          router.push("/login");
          return;
        }

        // At this point user is verified — fetch categories and render page.
        try {
          const res2 = await fetch(`${URL}/api/categories`);
          const data = await res2.json();
          setCategories((data.categories || []).slice(0, 5));
        } catch (err) {
          console.error("Category fetch error", err);
        }

        setLoading(false);
      } catch (err) {
        // On any unexpected error, send the user to login to re-authenticate.
        console.error("Landing page init error", err);
        router.push("/login");
      }
    }

    initPage();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 bg-[#ece9d8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
 
            <div className="flex-1 space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-[#4a2e21] leading-tight mb-4">
                  All your needs,
                  <br /> solved in a click
                </h1>
                <p className="text-lg text-gray-600">
                  Connect with verified professionals for any service you need
                </p>
              </div>

 
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-[#4a2e21] mb-6">
                  What are you looking for?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((cat) => {
                    const Icon = iconMap[cat.icon] || FaTools;
                    return (
                      <div
                        key={cat.id}
                        className="flex flex-col items-center text-center p-4 bg-[#f7f3eb] rounded-xl hover:shadow-md hover:scale-105 transition-all cursor-pointer border border-[#e5dcc7]"
                      >
                        <Icon className="text-4xl text-[#7a5c49] mb-3" />
                        <span className="text-sm font-medium text-[#4a2e21]">
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
                </div>


                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => router.push("/service")}
                    className="px-6 py-2 bg-[#4a2e21] text-white rounded-lg hover:bg-[#6a4b39] transition"
                  >
                    View All Categories
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-around bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#4a2e21]">1 Cr+</p>
                  <p className="text-sm text-gray-600 mt-1">Happy Customers</p>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#4a2e21]">5000+</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Verified Providers
                  </p>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#4a2e21]">4.8★</p>
                  <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg h-[600px] rounded-2xl border border-gray-200 bg-[#f5f2ea] shadow-xl overflow-hidden">
                <img
                  src="/services.png"
                  alt="Collage of Services"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

 
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <h2 className="text-3xl font-bold text-[#4a2e21] text-center mb-12">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: FaCheckCircle,
                  title: "Verified Professionals",
                  description:
                    "All service providers are background checked and verified for your safety",
                },
                {
                  icon: FaStar,
                  title: "Quality Guaranteed",
                  description:
                    "99% customer satisfaction with our quality assurance program",
                },
                {
                  icon: FaHeadset,
                  title: "24/7 Support",
                  description:
                    "Round-the-clock customer support to help with any concerns",
                },
              ].map((feature, idx) => (
                <div key={idx} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f7f3eb] rounded-full mb-4">
                    <feature.icon className="text-3xl text-[#7a5c49]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#4a2e21] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
