"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaCheckCircle, FaSpinner, FaServer, FaExclamationCircle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [steps, setSteps] = useState([
    { id: 1, label: "Connecting to server...", status: "pending" },
    { id: 2, label: "Verifying API availability...", status: "pending" },
    { id: 3, label: "Preparing application...", status: "pending" },
  ]);
  const [error, setError] = useState(null);

  const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";
  const URL = isProd
    ? "https://localhelpbackendv2.onrender.com"
    : "http://localhost:4040";

  useEffect(() => {
    startChecks();
  }, []);

  const updateStep = (id, status) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const startChecks = async () => {
    try {
      setError(null);
      updateStep(1, "loading");

      const start = Date.now();
      try {
        await axios.get(`${URL}/api/categories`);
      } catch (e) {
        if (!e.response) throw e;
      }
      const duration = Date.now() - start;

      updateStep(1, "success");
      updateStep(2, "loading");
      await new Promise((r) => setTimeout(r, duration > 1000 ? 1000 : 500));
      updateStep(2, "success");
      updateStep(3, "loading");
      await new Promise((r) => setTimeout(r, 600));
      updateStep(3, "success");

      router.push("/login");
    } catch (err) {
      console.error(err);
      updateStep(1, "error");
      setError("Server is unresponsive. It might be waking up or down.");
    }
  };

  const handleRetry = () => {
    setSteps([
      { id: 1, label: "Connecting to server...", status: "pending" },
      { id: 2, label: "Verifying API availability...", status: "pending" },
      { id: 3, label: "Preparing application...", status: "pending" },
    ]);
    startChecks();
  };

  return (
    <div className="min-h-screen bg-[#ece9d8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#e5dcc7] p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#f1dfc9] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaServer className="text-2xl text-[#6F4E37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4a2e21]">System Check</h1>
          <p className="text-gray-500 text-sm mt-1">
            Establishing secure connection...
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center p-3 rounded-lg border transition-colors ${step.status === "pending"
                ? "border-transparent text-gray-400"
                : step.status === "loading"
                  ? "border-[#f1dfc9] bg-[#fffbf5] text-[#4a2e21]"
                  : step.status === "success"
                    ? "border-green-100 bg-green-50 text-green-800"
                    : "border-red-100 bg-red-50 text-red-800"
                }`}
            >
              <div className="flex-shrink-0 w-8">
                {step.status === "loading" && (
                  <FaSpinner className="animate-spin" />
                )}
                {step.status === "success" && <FaCheckCircle />}
                {step.status === "error" && <FaExclamationCircle />}
                {step.status === "pending" && (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                )}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-6 text-center">
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5a3f2c] transition shadow-md"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
