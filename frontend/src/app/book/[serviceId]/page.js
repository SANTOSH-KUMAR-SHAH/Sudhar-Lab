"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaCreditCard,
  FaUserAlt,
} from "react-icons/fa";
import Loading from "@/components/loading";

const API_BASE =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";

function formatDateYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookServicePage() {
  const router = useRouter();
  const params = useParams(); // { serviceId }
  const search = useSearchParams(); // ?provider=...
  const serviceId = params?.serviceId;
  const providerUserId = search?.get("provider") || "";

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [date, setDate] = useState(formatDateYMD(new Date()));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!serviceId || !providerUserId) return;
    fetchServiceAndSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, providerUserId, date]);

  async function fetchServiceAndSlots() {
    setLoading(true);
    try {
      // Get service details (you may have route /api/services/:id or provider-specific)
      // Try /api/services/:id first, fallback to providerService fetch
      let s;
      try {
        const headers = token ? { Authorization: "Bearer " + token } : {};
        const resp = await axios.get(`${API_BASE}/api/services/${serviceId}`, { headers });
        s = resp.data.service || resp.data;
      } catch (e) {
        // fallback: providerService route
        const headers = token ? { Authorization: "Bearer " + token } : {};
        const resp2 = await axios.get(
          `${API_BASE}/api/providers/services/${serviceId}`,
          { headers }
        );
        s = resp2.data.service || resp2.data;
      }
      setService(s);

      await fetchSlotsForDate(date, providerUserId, serviceId);
    } catch (err) {
      console.error("Failed to load service:", err);
      toast.error("Could not load service");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSlotsForDate(dateYmd, providerId, svcId) {
    if (!dateYmd || !providerId || !svcId) return;
    setSlotsLoading(true);
    try {
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await axios.get(
        `${API_BASE}/api/bookings/providers/${providerId}/services/${svcId}/slots`,
        {
          params: { date: dateYmd },
          headers,
        }
      );
      const data = res.data;
      // normalize times (make string + available flag)
      const normalized = (data.slots || []).map((s) => ({
        time: s.time,
        available: !!s.available,
        start: s.start,
        end: s.end,
      }));
      setSlots(normalized);
    } catch (err) {
      console.error("fetchSlotsForDate:", err);
      toast.error("Failed to fetch slots");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  function onSelectSlot(slot) {
    if (!slot.available) return;
    setSelectedSlot(slot);
  }

  async function onPayMock() {
    if (!selectedSlot) {
      toast.error("Choose a slot first");
      return;
    }
    if (!service) {
      toast.error("Service missing");
      return;
    }

    setIsPaying(true);
    toast.loading("Processing payment...");

    // Simulate network/payment delay
    setTimeout(async () => {
      toast.dismiss();
      toast.success("Payment successful", { style: { background: "#e6ffed", color: "#03543f" }});
      setIsPaying(false);
      // Create booking on server
      await createBooking();
    }, 1300);
  }

  async function createBooking() {
    try {
      setCreatingBooking(true);
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const payload = {
        serviceId,
        providerUserId,
        slot: `${date}T${selectedSlot.time}:00`, // yyyy-mm-ddTHH:MM:SS
        address: "", // let user fill later in profile; you can extend UI to accept address
      };

      const res = await axios.post(`${API_BASE}/api/bookings`, payload, {
        headers,
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        toast.success("Booking created");
        // redirect to bookings or provider/thank-you
        router.push("/bookings"); // adjust to your bookings page
      } else if (res.status === 401) {
        toast.error("Please login to book");
        router.push("/login");
      } else {
        toast.error(res.data?.message || "Booking failed");
      }
    } catch (err) {
      console.error("createBooking error:", err);
      toast.error("Booking failed");
    } finally {
      setCreatingBooking(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#ece9d8] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f6efe1] border border-transparent hover:bg-[#efe6d6]"
          >
            <FaArrowLeft className="text-[#6F4E37]" />
            <span className="text-sm text-[#4a2e21]">Back</span>
          </button>

          <h1 className="text-2xl font-bold text-[#4a2e21]">
            {service?.subcategory?.name || service?.description || "Service"}
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="md:flex md:items-start gap-6">
            <div className="md:w-1/2">
              <div className="bg-[#f9f6f0] p-4 rounded-lg border border-[#e5dcc7]">
                <p className="text-sm text-gray-600">Provider</p>
                <div className="flex items-center gap-3 mt-2">
                  <FaUserAlt className="text-2xl text-[#7a5c49]" />
                  <div>
                    <p className="font-medium text-[#4a2e21]">
                      {service?.provider?.user?.name || "Provider"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {service?.category?.name}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-[#4a2e21]">₹{service?.price}</p>
                </div>

                <div className="mt-3">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-sm text-[#4a2e21]">{service?.duration} mins</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg border border-[#e5dcc7] bg-white">
                <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-[#6F4E37]" /> Choose date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-black"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Select a date to view available time slots.
                </p>
              </div>
            </div>

            <div className="md:flex-1 mt-6 md:mt-0">
              <h3 className="text-sm font-semibold text-[#4a2e21] mb-3 flex items-center gap-2">
                <FaClock className="text-[#6F4E37]" /> Available slots
              </h3>

              {slotsLoading ? (
                <Loading />
              ) : slots.length === 0 ? (
                <div className="py-8 text-center text-gray-600">
                  No slots available for this date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {slots.map((s) => {
                    const isSelected = selectedSlot?.time === s.time;
                    return (
                      <button
                        key={s.time}
                        onClick={() => onSelectSlot(s)}
                        disabled={!s.available}
                        className={`px-3 py-2 rounded-lg text-sm border transition ${
                          s.available
                            ? isSelected
                              ? "bg-[#6F4E37] text-white border-[#5A3F2E] shadow"
                              : "bg-white text-[#4a2e21] border-[#e5dcc7] hover:bg-[#f6efe1]"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <div className="font-medium">{s.time}</div>
                        {!s.available && <div className="text-xs">Booked</div>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Payment & booking */}
              <div className="mt-6 bg-white p-4 rounded-lg border border-[#e5dcc7]">
                <h4 className="font-semibold text-[#4a2e21] mb-2">Booking summary</h4>
                <p className="text-sm text-gray-600">
                  {selectedSlot ? (
                    <>
                      Slot: <span className="font-medium">{selectedSlot.time}</span>
                      <br />
                      Date: <span className="font-medium">{date}</span>
                    </>
                  ) : (
                    "Select a slot to continue"
                  )}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-bold text-[#4a2e21]">₹{service?.price}</p>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        if (!token) {
                          toast.error("Please login to proceed with booking");
                          router.push("/login");
                          return;
                        }
                        if (!selectedSlot) {
                          toast.error("Please select a slot");
                          return;
                        }
                        setIsPaying(true);
                        // show payment UI
                        onPayMock();
                      }}
                      disabled={isPaying || creatingBooking}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6F4E37] text-white hover:bg-[#5A3F2E] shadow disabled:opacity-60"
                    >
                      <FaCreditCard /> {isPaying || creatingBooking ? "Processing..." : `Pay ₹${service?.price}`}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                This page uses a mock payment flow for demonstration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
