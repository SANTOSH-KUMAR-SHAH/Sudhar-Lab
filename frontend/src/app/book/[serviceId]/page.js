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
  FaMoneyBillWave,
  FaQrcode,
  FaLandmark,
  FaWallet,
  FaCheckCircle,
  FaLock,
  FaMobileAlt,
  FaInfoCircle
} from "react-icons/fa";
import Loading from "@/components/loading";

const API_BASE =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? "https://localhelp-hu2d.onrender.com"
    : "http://localhost:4040";

function formatDateYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookServicePage() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const serviceId = params?.serviceId;
  const providerUserId = search?.get("provider") || "";

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [date, setDate] = useState(formatDateYMD(new Date()));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(false);

  const [bookingStep, setBookingStep] = useState("slot-selection");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [errors, setErrors] = useState({});
  const [qrTimer, setQrTimer] = useState(300);

  const BOOKING_FEE = 500;
  const PLATFORM_FEE = 49;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!serviceId || !providerUserId) return;
    fetchServiceAndSlots();
  }, [serviceId, providerUserId, date]);

  useEffect(() => {
    let interval;
    if (bookingStep === "payment" && paymentMethod === "QR" && qrTimer > 0) {
      interval = setInterval(() => setQrTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [bookingStep, paymentMethod, qrTimer]);

  async function fetchServiceAndSlots() {
    setLoading(true);
    try {
      let s;
      try {
        const headers = token ? { Authorization: "Bearer " + token } : {};
        const resp = await axios.get(`${API_BASE}/api/services/${serviceId}`, { headers });
        s = resp.data.service || resp.data;
      } catch (e) {
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
      const normalized = (data.slots || []).map((s) => ({
        time: s.time,
        label: formatSlotLabel(s.time, s.start, s.end),
        available: !s.booked,
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

  function formatSlotLabel(rawTime, start, end) {
    if (!start || !end) return rawTime;
    const to12h = (t) => {
      const [h, m] = t.split(":");
      const hours = parseInt(h, 10);
      const suffix = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${h12}:${m} ${suffix}`;
    };
    return `${to12h(start)} - ${to12h(end)}`;
  }

  function handleInitiatePayment() {
    if (!token) {
      toast.error("Please login to proceed with booking");
      router.push("/login");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    setBookingStep("redirecting");
    setTimeout(() => {
      setBookingStep("payment");
    }, 1500);
  }

  function handlePaymentFieldChange(field, value) {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }

  function validatePayment() {
    const errs = {};
    if (paymentMethod === "UPI") {
      if (!paymentDetails.vpa || !paymentDetails.vpa.includes("@")) errs.vpa = "Invalid UPI ID";
    }
    if (paymentMethod === "CARD") {
      if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 16) errs.cardNumber = "Invalid Card Number";
      if (!paymentDetails.expiry) errs.expiry = "Required";
      if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) errs.cvv = "Invalid CVV";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleConfirmPayment() {
    if (!validatePayment()) return;

    setCreatingBooking(true);
    await new Promise(r => setTimeout(r, 2000));
    await createBooking();
  }

  async function createBooking() {
    try {
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const payload = {
        serviceId,
        providerUserId,
        slot: `${date}T${selectedSlot.time}:00`,
        address: "",
      };

      const res = await axios.post(`${API_BASE}/api/bookings`, payload, {
        headers,
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        toast.dismiss();
        toast.success("Payment Successful! Booking Confirmed.", { duration: 5000 });
        router.push("/thankyou/" + res.data.booking.id);
      } else if (res.status === 401) {
        toast.error("Please login to book");
        router.push("/login");
      } else {
        toast.error(res.data?.message || "Booking failed");
        setCreatingBooking(false);
      }
    } catch (err) {
      console.error("createBooking error:", err);
      toast.error("Booking failed");
      setCreatingBooking(false);
    }
  }


  if (loading) return <Loading />;

  if (bookingStep === "redirecting") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#127373] mb-4"></div>
        <h2 className="text-xl font-semibold text-[#112E40]">Redirecting to secure payment gateway...</h2>
        <p className="text-gray-500 mt-2 text-sm">Do not refresh the page</p>
      </div>
    );
  }

  if (bookingStep === "payment") {
    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
      <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 flex items-center justify-center">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="bg-[#F4F5F0] px-6 py-4 border-b border-[#DDE3E0] flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-[#112E40] flex items-center gap-2">
                  <FaLock className="text-[#E8A324]" size={14} /> Secure Payment — Trusted & Encrypted
                </h2>
                <span className="text-xs text-gray-500 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>

              <div className="flex flex-col md:flex-row flex-1">

                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 shrink-0">
                  {[
                    { id: "UPI", label: "UPI", icon: <FaMobileAlt /> },
                    { id: "CARD", label: "Cards", icon: <FaCreditCard /> },
                    { id: "NET_BANKING", label: "Net Banking", icon: <FaLandmark /> },
                    { id: "WALLET", label: "Wallets", icon: <FaWallet /> },
                    { id: "QR", label: "QR Code", icon: <FaQrcode /> },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setPaymentMethod(opt.id); setErrors({}); }}
                      className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors border-b border-gray-100 md:border-b-0 ${paymentMethod === opt.id
                        ? "bg-white text-[#127373] font-semibold border-l-4 border-[#127373] shadow-sm"
                        : "text-gray-600 hover:bg-white hover:text-gray-800"
                        }`}
                    >
                      <span className="text-lg opacity-80">{opt.icon}</span>
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>


                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  {paymentMethod === "UPI" && (
                    <div className="max-w-sm w-full mx-auto">
                      <h3 className="font-semibold text-gray-800 mb-6 text-center">Pay via UPI</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">UPI ID / VPA</label>
                          <input
                            type="text"
                            placeholder="username@upi"
                            className={`w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-[#127373] outline-none ${errors.vpa ? 'border-red-500' : 'border-gray-300 placeholder:text-gray-400'}`}
                            onChange={(e) => handlePaymentFieldChange('vpa', e.target.value)}
                          />
                          {errors.vpa && <p className="text-red-500 text-xs mt-1">{errors.vpa}</p>}
                        </div>
                        <div className="flex justify-center gap-4 pt-2 opacity-60 grayscale hover:grayscale-0 transition-all">

                          <p className="text-xs text-gray-400 text-center">Supported: GPay, PhonePe, Paytm,BHIM</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "CARD" && (
                    <div className="max-w-md w-full mx-auto">
                      <h3 className="font-semibold text-gray-800 mb-6 text-center">Enter Card Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className={`w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-[#127373] outline-none ${errors.cardNumber ? 'border-red-500' : 'border-gray-300 placeholder:text-gray-400'}`}
                            onChange={(e) => handlePaymentFieldChange('cardNumber', e.target.value)}
                          />
                          {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Valid Thru</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              className={`w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-[#127373] outline-none ${errors.expiry ? 'border-red-500' : 'border-gray-300 placeholder:text-gray-400'}`}
                              onChange={(e) => handlePaymentFieldChange('expiry', e.target.value)}
                            />
                          </div>
                          <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                            <input
                              type="password"
                              placeholder="123"
                              maxLength={3}
                              className={`w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-[#127373] outline-none ${errors.cvv ? 'border-red-500' : 'border-gray-300 placeholder:text-gray-400'}`}
                              onChange={(e) => handlePaymentFieldChange('cvv', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "NET_BANKING" && (
                    <div className="w-full">
                      <h3 className="font-semibold text-gray-800 mb-6 text-center">Select your Bank</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto">
                        {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                          <button key={bank} className="py-3 px-3 border border-gray-200 rounded-lg hover:border-[#127373] hover:bg-[#f6efe1] text-sm text-gray-600 transition-all font-medium">
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "QR" && (
                    <div className="flex flex-col items-center justify-center">
                      <h3 className="font-semibold text-gray-800 mb-2">Scan QR to Pay</h3>
                      <p className="text-xl text-[#112E40] font-bold mb-6">Rs. {BOOKING_FEE.toFixed(2)}</p>

                      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-inner relative overflow-hidden group">

                        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg relative z-10">
                          <FaQrcode size={120} className="text-gray-800" />
                        </div>

                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/50 shadow-[0_0_10px_rgba(255,0,0,0.5)] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>
                      </div>

                      <div className="mt-6 flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full animate-pulse border border-red-100">
                        <FaClock size={12} />
                        <span className="font-mono font-medium">Expires in {formatTime(qrTimer)}</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "WALLET" && (
                    <div className="max-w-md w-full mx-auto">
                      <h3 className="font-semibold text-gray-800 mb-6 text-center">Select Wallet</h3>
                      <div className="space-y-3">
                        {['Paytm', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik'].map(w => (
                          <label key={w} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input type="radio" name="wallet" className="w-4 h-4 accent-[#127373]" />
                            <span className="text-base text-gray-700 font-medium">{w}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                <div className="text-xs text-gray-500 hidden md:block">
                  By paying you agree to our Terms & Conditions
                </div>
                <button
                  onClick={handleConfirmPayment}
                  disabled={creatingBooking}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#127373] text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-[#0E6363] transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                  {creatingBooking ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <>Pay Rs. {BOOKING_FEE}</>
                  )}
                </button>
              </div>
            </div>

            <button onClick={() => setBookingStep("slot-selection")} className="mt-6 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 transition-colors">
              <FaArrowLeft /> Cancel transaction
            </button>
          </div>


          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
              <h3 className="font-bold text-[#112E40] mb-6 pb-4 border-b border-gray-100">Order Summary</h3>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Service</span>
                  <span className="font-medium text-gray-900 truncate max-w-[120px]">{service?.subcategory?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider</span>
                  <span className="font-medium text-gray-900">{service?.provider?.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time</span>
                  <span className="font-medium text-gray-900">{selectedSlot?.time} | {date}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Service Estimate</span>
                  <span>Rs. {service?.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Platform Fee</span>
                  <span>Rs. {PLATFORM_FEE}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#112E40] pt-2 border-t border-dashed border-gray-200 mt-2">
                  <span>Booking Fee (Refundable)</span>
                  <span>Rs. {BOOKING_FEE}</span>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 p-3 rounded-lg flex gap-3">
                <FaInfoCircle className="text-blue-500 shrink-0 mt-1" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  The <strong className="font-semibold">Rs. 500 booking fee</strong> is fully refundable if you cancel 24h before the slot. For completed services, this amount is adjusted/refunded per policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F0] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f6efe1] border border-transparent hover:bg-[#E8F2EE] transition-colors"
          >
            <FaArrowLeft className="text-[#127373]" />
            <span className="text-sm text-[#112E40]">Back</span>
          </button>

          <h1 className="text-2xl font-bold text-[#112E40] truncate">
            {service?.subcategory?.name || service?.description || "Book Service"}
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="md:flex md:items-start gap-6">
            <div className="md:w-1/2">

              <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#DDE3E0]">
                <p className="text-sm text-gray-600">Provider</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="p-2 bg-white rounded-full border border-[#DDE3E0]">
                    <FaUserAlt className="text-xl text-[#127373]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#112E40] text-lg">
                      {service?.provider?.user?.name || "Provider"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {service?.category?.name}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-end border-t border-[#DDE3E0] pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Service Cost</p>
                    <p className="text-xl font-bold text-[#112E40]">Rs. {service?.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-sm text-[#112E40] font-medium">{service?.duration} mins</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg border border-[#DDE3E0] bg-white">
                <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2 font-medium">
                  <FaCalendarAlt className="text-[#127373]" /> Choose date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#127373]"
                />
              </div>
            </div>

            <div className="md:flex-1 mt-6 md:mt-0">
              <h3 className="text-sm font-semibold text-[#112E40] mb-3 flex items-center gap-2">
                <FaClock className="text-[#127373]" /> Available slots
              </h3>

              {slotsLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#127373]"></div>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p>No slots available for this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      onClick={() => s.available && setSelectedSlot(s)}
                      disabled={!s.available}
                      className={`px-3 py-3 rounded-lg text-xs sm:text-sm border transition-all flex flex-col items-center justify-center gap-1 ${s.available
                        ? selectedSlot?.time === s.time
                          ? "bg-[#127373] text-white border-[#0E6363] shadow-md transform scale-105"
                          : "bg-white text-[#112E40] border-[#DDE3E0] hover:bg-[#f6efe1]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                    >
                      <div className="font-semibold">{s.label}</div>
                      {!s.available && <div className="text-[10px] uppercase font-bold">Booked</div>}
                    </button>
                  ))}
                </div>
              )}


              <div className="mt-6 bg-[#fcfbf9] p-5 rounded-xl border border-[#DDE3E0]">
                <h4 className="font-semibold text-[#112E40] mb-4 flex items-center gap-2">
                  <FaMoneyBillWave /> Payment Breakdown
                </h4>

                {selectedSlot ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Service Cost</span>
                      <span>Rs. {service?.price}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Platform Fee</span>
                      <span>Rs. {PLATFORM_FEE}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-300 my-2"></div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-base font-bold text-[#112E40] block">To Pay Now</span>
                        <span className="text-[10px] text-[#8A6E00] bg-[#FFF8E1] px-2 py-0.5 rounded-full border border-[#E8A324]/30 font-bold tracking-wide">✓ Refundable & Trusted</span>
                      </div>
                      <span className="text-xl font-bold text-[#112E40]">Rs. {BOOKING_FEE}</span>
                    </div>

                    <button
                      onClick={handleInitiatePayment}
                      className="w-full mt-4 bg-[#127373] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#0E6363] transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Pay</span>
                      <FaArrowLeft className="rotate-180" size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Select a slot to view breakdown</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
