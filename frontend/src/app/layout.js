import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Sudhar Lab — Nepal's Home Service Platform",
  description: "Book verified technicians for TV, AC, Washing Machine, Fridge repair in Kathmandu, Pokhara & across Nepal. Rs. pricing, Citizenship-verified providers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster position="top-right"/>
        {children}
      </body>
    </html>
  );
}
