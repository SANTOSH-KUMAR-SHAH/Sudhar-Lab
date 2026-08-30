"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaPlus, FaTools, FaHistory } from "react-icons/fa";

const API_BASE = process.env.NEXT_PUBLIC_IS_PROD === "true" ? "https://localhelp-hu2d.onrender.com" : "http://localhost:4040";

export default function AppliancesPage() {
  const router = useRouter();
  const [appliances, setAppliances] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ type: "", brand: "", model: "", serialNumber: "", purchaseDate: "", warrantyInfo: "" });
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(true);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
  const load = async () => {
    try { const res = await axios.get(`${API_BASE}/api/appliances`, { headers: headers() }); setAppliances(res.data.appliances || []); }
    catch (e) { toast.error(e.response?.data?.message || "Please log in to manage appliances"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  async function addAppliance(e) {
    e.preventDefault();
    try { await axios.post(`${API_BASE}/api/appliances`, form, { headers: { ...headers(), "Content-Type": "application/json" } }); toast.success("Appliance added"); setForm({ type: "", brand: "", model: "", serialNumber: "", purchaseDate: "", warrantyInfo: "" }); setShowAdd(false); load(); }
    catch (e) { toast.error(e.response?.data?.message || "Could not add appliance"); }
  }
  async function createRequest(e) {
    e.preventDefault();
    try { await axios.post(`${API_BASE}/api/service-requests`, { applianceId: selected.id, problem }, { headers: { ...headers(), "Content-Type": "application/json" } }); toast.success("Service request submitted to our operations team"); setSelected(null); setProblem(""); load(); }
    catch (e) { toast.error(e.response?.data?.message || "Could not create request"); }
  }
  const input = (name, label, required = false) => <label className="block text-sm font-medium text-[#112E40]">{label}<input required={required} name={name} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#127373]" /></label>;

  return <main className="min-h-screen bg-[#F4F5F0] px-4 py-8 text-[#112E40]"><div className="mx-auto max-w-5xl">
    <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-[#127373]"><FaArrowLeft /> Back</button>
    <div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-[#127373]">Service centre</p><h1 className="text-3xl font-bold">My Appliances</h1><p className="mt-2 text-gray-600">Keep your appliances together and follow every repair from request to closure.</p></div><button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 rounded-xl bg-[#127373] px-4 py-3 font-semibold text-white"><FaPlus /> Add appliance</button></div>
    {showAdd && <form onSubmit={addAppliance} className="mb-8 rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-bold">Register an appliance</h2><div className="grid gap-4 md:grid-cols-2">{input("type", "Appliance type", true)}{input("brand", "Brand", true)}{input("model", "Model")}{input("serialNumber", "Serial number")}{input("purchaseDate", "Purchase date")}<label className="block text-sm font-medium">Warranty notes<input name="warrantyInfo" value={form.warrantyInfo} onChange={e => setForm({ ...form, warrantyInfo: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-3" placeholder="Optional" /></label></div><button className="mt-5 rounded-lg bg-[#112E40] px-5 py-3 font-semibold text-white">Save appliance</button></form>}
    {loading ? <p className="rounded-xl bg-white p-8 text-center">Loading appliances…</p> : appliances.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center shadow-sm"><FaTools className="mx-auto mb-4 text-4xl text-[#127373]" /><h2 className="text-xl font-bold">No appliances registered yet</h2><p className="mt-2 text-gray-600">Add an appliance first so our team can keep its repair history connected.</p></div> : <div className="grid gap-5 md:grid-cols-2">{appliances.map(a => <article key={a.id} className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-[#127373]">{a.type}</p><h2 className="text-xl font-bold">{a.brand} {a.model}</h2>{a.serialNumber && <p className="mt-1 text-sm text-gray-500">Serial: {a.serialNumber}</p>}</div><FaTools className="text-2xl text-[#127373]" /></div><div className="mt-5 flex items-center justify-between border-t pt-4"><span className="flex items-center gap-2 text-sm text-gray-600"><FaHistory /> {a.serviceRequests?.length || 0} recent request(s)</span><button onClick={() => setSelected(a)} className="rounded-lg bg-[#127373] px-4 py-2 text-sm font-semibold text-white">Request service</button></div></article>)}</div>}
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={createRequest} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-bold">Request service</h2><p className="mt-1 text-sm text-gray-600">{selected.brand} {selected.model || selected.type}</p><label className="mt-5 block text-sm font-semibold">What is wrong?<textarea required minLength={10} value={problem} onChange={e => setProblem(e.target.value)} className="mt-2 h-32 w-full rounded-lg border border-gray-300 p-3" placeholder="Describe the problem clearly…" /></label><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2">Cancel</button><button className="rounded-lg bg-[#127373] px-4 py-2 font-semibold text-white">Submit request</button></div></form></div>}
  </div></main>;
}
