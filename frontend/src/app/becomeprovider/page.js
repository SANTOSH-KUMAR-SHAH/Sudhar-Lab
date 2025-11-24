"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BecomeProviderPage() {
  const router = useRouter();

  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.loading("Upgrading your account…", { id: "loading" });

      const response = await axios.post(
        `https://localhelpbackendv2.onrender.com/api/become-provider`,
        { bio, experience },
        { withCredentials: true }
      );

      toast.success("You're now a provider! 🎉", { id: "loading" });

 
      setTimeout(() => {
        router.push("/provider/dashboard");
      }, 1000);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong!",
        { id: "loading" }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7EED3] px-4">
      <div className="bg-white shadow-xl p-8 rounded-2xl max-w-lg w-full border border-[#D3C7AA]">
        <h1 className="text-3xl font-bold text-[#6F4E37] mb-4 text-center">
          Become a Service Provider
        </h1>
        <p className="text-[#8C6E53] text-center mb-6">
          Tell us a little about your skills to upgrade your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#6F4E37] font-medium mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-[#C8B69E] text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-[#FFFDF6]"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-[#6F4E37] font-medium mb-1">
              Experience (in years)
            </label>
            <input
              type="number"
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full p-3 border border-[#C8B69E] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-[#FFFDF6]"
              placeholder="e.g., 3"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#6F4E37] text-white py-3 rounded-xl hover:bg-[#5A3F2E] transition-all shadow-md"
          >
            Upgrade to Provider
          </button>
        </form>
      </div>
    </div>
  );
}
