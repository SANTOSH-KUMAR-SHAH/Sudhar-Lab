import { FaSpinner } from "react-icons/fa";
export default function Loading({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#F7EED3] z-[9999] fixed top-0 left-0">
      <div className="relative w-16 h-16">
        <FaSpinner className="animate-spin text-[#A67B5B] text-4xl fill-[#6F4E37]" />
      </div>
      {message && (
        <p className="mt-6 text-[#6F4E37] font-mono text-sm tracking-mid animate-pulse text-center max-w-md px-4">
          {message}
        </p>
      )}
      {!message && (
        <p className="mt-4 text-[#6F4E37] font-mono text-xs opacity-70">
          Loading...
        </p>
      )}
    </div>
  );
}
