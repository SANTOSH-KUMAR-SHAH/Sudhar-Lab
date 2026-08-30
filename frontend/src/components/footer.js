import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaHome, FaPhone, FaEnvelope } from "react-icons/fa";
function Footer() {
  return (
    <div className="bg-[#112E40] text-[#F4F5F0] py-12 border-t border-[#127373]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/sudhar-lab-logo.png" alt="Sudhar Lab" className="h-8 w-auto bg-white rounded-lg p-1" />
            <h3 className="text-2xl font-bold text-[#F4F5F0] tracking-tight">sudhar lab</h3>
          </div>
          <p className="text-sm text-[#DDE3E0] leading-relaxed">
            Nepal's trusted home-service platform — connecting Kathmandu homes with verified technicians for TV, AC, Washing Machine & more.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="space-y-2 text-[#d4cbb8]">
            {["Home", "Services", "About Us", "Contact"].map((link) => (
              <li key={link} className="hover:text-white transition cursor-pointer">
                {link}
              </li>
            ))}
          </ul>
        </div>


        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
          <ul className="space-y-2 text-[#d4cbb8]">
            <li className="flex items-center gap-2 text-sm">
              <FaHome className="text-[#F4F5F0] text-lg" />
              Kathmandu University, Dhulikhel, Nepal
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-[#F4F5F0] text-lg" />
              hello@sudharlab.com.np
            </li>
            <li className="flex items-center gap-2">
              <FaPhone className="text-[#F4F5F0] text-lg" />
              +977 9800000000
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
          <div className="flex space-x-4">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
              <div key={idx} className="w-10 h-10 rounded-full bg-[#112E40] flex items-center justify-center hover:bg-[#F4F5F0] hover:text-[#112E40] transition cursor-pointer">
                <Icon />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#127373]/30 mt-10 pt-6 text-center text-[#DDE3E0] text-sm">
        <p>© {new Date().getFullYear()} Sudhar Lab. All rights reserved. — Made for Nepal.</p>
        <p className="text-xs mt-1 text-[#8A9A9A]">Home services • Kathmandu • Pokhara • Lalitpur • Biratnagar</p>
      </div>
    </div>
  );
}

export default Footer;
