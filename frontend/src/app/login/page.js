"use client";
import { useState } from "react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";

  const URL = isProd
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";
  const [form, setForm] = useState({
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${URL}/api/auth/login`, form, {
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + localStorage.getItem("token"),
        },
        withCredentials: true, // <-- REQUIRED
        validateStatus: () => true,
      });

      const data = response.data || {};
      // Mirror previous behavior: store token even if server responded non-2xx
      if (data.token) localStorage.setItem("token", data.token);

      if (response.status < 200 || response.status >= 300) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success(`Welcome Back, ${data.user.name}`, {
        style: {
          background: "#e6ffed",
          color: "#03543f",
        },
      });

      setTimeout(() => {
        router.push("/landingpage");
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
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    email: "rohan.das@example.com",
                    password: "password123",
                  })
                }
                className="flex-1 py-2 text-sm rounded-lg border border-[#d6c7b4] 
                 bg-[#f6efe1] text-[#4a2e21] hover:bg-[#efe6d6] transition"
              >
                User Demo
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    email: "provider1@example.com",
                    password: "password123",
                  })
                }
                className="flex-1 py-2 text-sm rounded-lg border border-[#d6c7b4] 
                 bg-[#f6efe1] text-[#4a2e21] hover:bg-[#efe6d6] transition"
              >
                Provider Demo
              </button>
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
              Log In
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Want to create an account?
            <a href="/signup" className="ml-1 text-[#672410] hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
