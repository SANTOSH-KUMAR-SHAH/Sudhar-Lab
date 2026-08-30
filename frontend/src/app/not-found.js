import { FaCoffee } from "react-icons/fa";
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#F4F5F0] text-center px-4">
      <div className="text-[5rem] mb-4">
        <FaCoffee className="text-[#127373]" />
      </div>

      <h1 className="text-5xl font-bold text-[#112E40] mb-2">
        404
      </h1>

      <p className="text-lg text-[#5A6E6E] mb-6">
        Oops… looks like this page got lost. No Worries !!!
      </p>

      <a
        href="/"
        className="px-6 py-3 rounded-full text-white bg-[#127373] hover:bg-[#0E6363] transition-all shadow-md"
      >
        Go Back Home
      </a>
    </div>
  );
}
