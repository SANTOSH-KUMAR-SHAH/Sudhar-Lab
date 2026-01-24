import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <div className="bg-[#4a2e21] text-[#ece9d8] py-12 border-t border-[#6a4b39]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Brand */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[#ece9d8]">LocalHelp</h3>
          <p className="text-sm text-[#d4cbb8] leading-relaxed">
            Your one-stop solution for all local services. Connecting you with verified professionals instantly.
          </p>
        </div>

        {/* Column 2: Quick Links */}
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

        {/* Column 3: Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
          <ul className="space-y-2 text-[#d4cbb8]">
            <li>123 Market Street, India</li>
            <li>support@localhelp.com</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>

        {/* Column 4: Socials */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
          <div className="flex space-x-4">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
              <div key={idx} className="w-10 h-10 rounded-full bg-[#6a4b39] flex items-center justify-center hover:bg-[#ece9d8] hover:text-[#4a2e21] transition cursor-pointer">
                <Icon />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#6a4b39] mt-10 pt-6 text-center text-[#d4cbb8] text-sm">
        <p>© {new Date().getFullYear()} LocalHelp. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Footer;
