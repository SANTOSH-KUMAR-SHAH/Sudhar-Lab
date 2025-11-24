"use client";
import { useEffect, useState } from "react";
import { FiMapPin, FiChevronDown } from "react-icons/fi";

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return null;
  }
}

function Navbar() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = parseJwt(token);
        setRole(decoded?.role || null);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <nav className="bg-white fixed w-full z-20 top-0 border-b border-gray-200 text-black">
      <div className="max-w-screen flex items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/navlogo.png"
            alt="LocalHelp Logo"
            className="h-10 w-auto"
          />
          <span className="text-xl font-semibold text-black">LocalHelp</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl bg-white shadow-sm cursor-pointer hover:border-gray-400 transition">
            <FiMapPin className="text-gray-500 text-lg" />
            <span className="text-gray-700 truncate">Sonipat</span>
            <FiChevronDown className="text-gray-600 text-lg" />
          </div>

          {role === "PROVIDER" ? (
            <a
              href="/provider/dashboard"
              className="px-4 py-2 bg-[#672410] text-white rounded-lg shadow hover:bg-rose-800 transition"
            >
              Dashboard
            </a>
          ) : (
            <a
              href="/becomeprovider"
              className="px-4 py-2 bg-[#672410] text-white rounded-lg shadow hover:bg-rose-800 transition"
            >
              Become Provider
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
