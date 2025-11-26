"use client";
import { useEffect, useState } from "react";
import { FiMapPin, FiChevronDown, FiMenu, FiX } from "react-icons/fi";

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return null;
  }
}

export default function Navbar() {
  const [role, setRole] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = parseJwt(token);
        setRole(decoded?.role || null);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-white fixed w-full z-20 top-0 border-b border-gray-200 text-black">
        <div className="max-w-screen flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <img src="/navlogo.png" alt="LocalHelp Logo" className="h-10 w-auto" />
            <span className="text-xl font-semibold text-black">LocalHelp</span>
          </a>

          {/* Desktop Menu */}
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
                href="/profile"
                className="px-4 py-2 bg-[#672410] text-white rounded-lg shadow hover:bg-rose-800 transition"
              >
                Profile
              </a>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <FiMenu
              className="text-3xl cursor-pointer text-black"
              onClick={() => setOpenSidebar(true)}
            />
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      {openSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setOpenSidebar(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          openSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b text-[#4a2e21]">
          <h2 className="text-lg font-semibold">Menu</h2>
          <FiX
            className="text-2xl cursor-pointer"
            onClick={() => setOpenSidebar(false)}
          />
        </div>

        <div className="flex flex-col p-4 gap-6">

          {/* Location */}
          <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
            <FiMapPin className="text-gray-500 text-xl" />
            <span className="text-gray-700">Sonipat</span>
            <FiChevronDown className="text-gray-600 text-xl ml-auto" />
          </div>

          {/* Buttons */}
          {role === "PROVIDER" ? (
            <a
              href="/provider/dashboard"
              className="px-4 py-2 bg-[#672410] text-white rounded-lg shadow hover:bg-rose-800 transition text-center"
            >
              Dashboard
            </a>
          ) : (
            <a
              href="/profile"
              className="px-4 py-2 bg-[#672410] text-white rounded-lg shadow hover:bg-rose-800 transition text-center"
            >
              Profile
            </a>
          )}
        </div>
      </div>
    </>
  );
}
