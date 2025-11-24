"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Loading from "@/components/loading";
import { FaUserCircle } from "react-icons/fa";

const API_BASE = process.env.NEXT_PUBLIC_IS_PROD === "true"
  ? "https://localhelpbackendv2.onrender.com"
  : "http://localhost:4040";

export default function CategoryServicesPage() {
  const router = useRouter();
  const { id } = useParams();  

  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchCategoryAndServices(id);
  }, [id]);

  async function fetchCategoryAndServices(catId) {
    setLoading(true);
    try {
      // fetch category (name) and providers/services
      const [catRes, provRes] = await Promise.all([
        axios.get(`${API_BASE}/api/categories/${catId}`),
        axios.get(`${API_BASE}/api/categories/${catId}/providers`),
      ]);

      const catJson = catRes.data;
      const provJson = provRes.data;

      setCategory(catJson.category || null);
      setServices(provJson.services || []);
    } catch (err) {
      console.error("Error loading category/services:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#ece9d8] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/service')} className="px-4 py-2 rounded-full text-white bg-[#6F4E37] hover:bg-[#5A3F2E] shadow">Back</button>
          <h1 className="text-2xl font-bold text-[#4a2e21]">{category?.name || 'Category'}</h1>
          <div />
        </div>

        {services.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600">No services available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-lg shadow flex items-start gap-4">
                <div className="text-4xl text-gray-400"><FaUserCircle /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#4a2e21]">{s.description || 'Service'}</h3>
                    <div className="text-sm font-semibold text-[#4a2e21]">₹{s.price}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Provided by: <span className="font-medium text-[#4a2e21]">{s.provider?.user?.name || 'Provider'}</span></p>
                  {s.duration ? <p className="text-sm text-gray-600">Duration: {s.duration} mins</p> : null}
                  <p className="text-sm text-gray-700 mt-2">{s.longDescription || s.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={() => setSelected(s)} className="px-4 py-2 rounded-md bg-[#10b981] text-white hover:bg-[#059669] shadow">Book</button>
                    <button onClick={() => router.push(`/providers/${s.provider?.id || ''}`)} className="px-3 py-1 rounded-md bg-[#f3f4f6] text-[#4a2e21]">View provider</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Simple modal for selected service */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <div className="bg-white rounded-xl shadow-lg p-6 z-10 max-w-lg w-full">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-[#4a2e21]">{selected.description}</h2>
                <button className="text-gray-500" onClick={() => setSelected(null)}>✕</button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Provider: <span className="font-medium">{selected.provider?.user?.name}</span></p>
              <p className="text-sm text-gray-600">Price: ₹{selected.price}</p>
              {selected.duration && <p className="text-sm text-gray-600">Duration: {selected.duration} mins</p>}
              <p className="mt-4 text-gray-800">{selected.longDescription || selected.description}</p>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { alert('Booking not yet implemented'); }} className="px-5 py-2 rounded-md bg-[#10b981] text-white hover:bg-[#059669]">Book</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
