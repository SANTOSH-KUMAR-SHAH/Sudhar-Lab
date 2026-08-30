"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { FaCheckCircle, FaClock, FaUser, FaRupeeSign } from "react-icons/fa";

const API_BASE =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? "https://localhelp-hu2d.onrender.com"
    : "http://localhost:4040";

export default function ThankYouPage({ params }) {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      router.replace("/landingpage");
    }
    const timer = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  async function fetchBookingDetails() {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const headers = token ? { Authorization: "Bearer " + token } : {};

      const res = await axios.get(
        `${API_BASE}/api/bookings/current/${id}`,
        { headers }
      );

      setBooking(res.data.booking);
    } catch (err) {
      console.error("Error fetching booking:", err);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F0] flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6 border border-[#DDE3E0] text-center relative">


        <div className="flex justify-center mb-4">
          <FaCheckCircle className="text-[#127373] text-5xl" />
        </div>

        <h1 className="text-2xl font-bold text-[#112E40] mb-2">
          Thank You for Booking!
        </h1>

        <p className="text-[#7a5d49] mb-6">
          Your service request has been successfully placed.
        </p>


        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#e9dfd2] rounded"></div>
            <div className="h-4 bg-[#e9dfd2] rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-[#e9dfd2] rounded w-1/2 mx-auto"></div>
          </div>
        )}


        {!loading && booking && (
          <div className="bg-[#fdfbf7] border border-[#DDE3E0] rounded-xl p-4 text-left space-y-3 mb-6">
            <div>
              <p className="text-sm text-[#7a5d49]">Service</p>
              <p className="font-semibold text-[#112E40] text-lg">
                {booking.service.subcategory?.name}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[#112E40]">
              <FaClock className="text-[#127373]" />
              {new Date(booking.bookingStart).toLocaleString()}
            </div>

            {booking.provider && (
              <div className="flex items-center gap-2 text-[#112E40]">
                <FaUser className="text-[#127373]" />
                {booking.provider.name}
              </div>
            )}

            <div className="flex items-center gap-2 text-[#112E40]">
              <FaRupeeSign className="text-[#127373]" />
              {booking.service.price}
            </div>

            <div>
              <p className="text-sm text-[#7a5d49]">Status</p>
              <p className="font-medium text-[#112E40]">{booking.status}</p>
            </div>
          </div>
        )}

        <p className="text-[#7a5d49] text-sm">
          Redirecting to homepage in{" "}
          <span className="font-bold text-[#112E40]">{seconds}</span> seconds...
        </p>
      </div>
    </div>
  );
}
