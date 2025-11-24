"use client";
import { useState } from "react";
import axios from "axios";
import React from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";

  const URL = isProd
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${URL}/api/auth/signup`, form, { headers: { "Content-Type": "application/json" }, validateStatus: () => true });
      const data = response.data || {};

      if (response.status < 200 || response.status >= 300) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Account created successfully!", {
        style: {
          background: "#e6ffed",
          color: "#03543f",
        },
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Something went wrong", {
        style: {
          background: "#ffe5e5",
          color: "#b30000",
        },
      });
    }
  };
  return (
    <div className="min-h-screen w-full flex bg-neutral-50">
      <div className="hidden lg:flex w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/signupbg.png')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-[#ece9d8]">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           bg-white placeholder-gray-400 focus:outline-none 
                           focus:ring-2 focus:ring-[#f9c588] transition text-black"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           bg-white placeholder-gray-400 focus:outline-none 
                           focus:ring-2 focus:ring-[#f9c588] transition text-black"
              />
            </div>
            <div>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number (optional)"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           bg-white placeholder-gray-400 focus:outline-none 
                           focus:ring-2 focus:ring-[#f9c588] transition text-black"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           bg-white placeholder-gray-400 focus:outline-none 
                           focus:ring-2 focus:ring-[#f9c588] transition text-black"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#672410] text-white rounded-lg 
                         font-semibold hover:bg-[#4d1a0a] transition shadow-sm"
            >
              Sign Up
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Already have an account?
            <a href="/login" className="ml-1 text-[#672410] hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
