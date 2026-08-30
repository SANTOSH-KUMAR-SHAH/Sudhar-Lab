"use client";
import { useEffect, useState } from "react";
import { FiMapPin, FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import NotificationBell from "./NotificationBell";

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

      <nav className="bg-white fixed w-full z-20 top-0 border-b border-[#DDE3E0] text-black shadow-sm">
        <div className="max-w-screen flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <img src="/sudhar-lab-logo.png" alt="Sudhar Lab Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-[#112E40] tracking-tight">sudhar lab</span>
          </a>


          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl bg-white shadow-sm cursor-pointer hover:border-gray-400 transition">
              <FiMapPin className="text-gray-500 text-lg" />
              <span className="text-gray-700 truncate">Kathmandu</span>
              <FiChevronDown className="text-gray-600 text-lg" />
            </div>

            <NotificationBell />

            {role === "PROVIDER" ? (
              <a
                href="/provider/dashboard"
                className="px-4 py-2 bg-[#127373] text-white rounded-lg shadow hover:bg-[#0E6363] transition"
              >
                Dashboard
              </a>
            ) : role === "ADMIN" ? (
              <a
                href="/admin/dashboard"
                className="px-4 py-2 bg-[#127373] text-white rounded-lg shadow hover:bg-[#0E6363] transition"
              >
                Admin Panel
              </a>
            ) : (
              <a
                href="/profile"
                className="px-4 py-2 bg-[#127373] text-white rounded-lg shadow hover:bg-[#0E6363] transition"
              >
                Profile
              </a>
            )}
          </div>


          <div className="md:hidden">
            <FiMenu
              className="text-3xl cursor-pointer text-black"
              onClick={() => setOpenSidebar(true)}
            />
          </div>
        </div>
      </nav>


      {openSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setOpenSidebar(false)}
        ></div>
      )}


      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ${openSidebar ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b text-[#112E40]">
          <h2 className="text-lg font-semibold">Menu</h2>
          <FiX
            className="text-2xl cursor-pointer"
            onClick={() => setOpenSidebar(false)}
          />
        </div>

        <div className="flex flex-col p-4 gap-6">


          <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 text-[#112E40] font-medium">
            <span>Home</span>
          </a>


          <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
            <FiMapPin className="text-gray-500 text-xl" />
            <span className="text-gray-700">Kathmandu</span>
            <FiChevronDown className="text-gray-600 text-xl ml-auto" />
          </div>


          {role === "PROVIDER" ? (
            <a
              href="/provider/dashboard"
              className="px-4 py-2 bg-[#127373] text-white rounded-lg shadow hover:bg-rose-800 transition text-center"
            >
              Dashboard
            </a>
          ) : (
            <a
              href="/profile"
              className="px-4 py-2 bg-[#127373] text-white rounded-lg shadow hover:bg-rose-800 transition text-center"
            >
              Profile
            </a>
          )}
        </div>
      </div>
    </>
  );
}
