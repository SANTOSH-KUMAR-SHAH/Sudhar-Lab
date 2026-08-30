import { FaSpinner } from "react-icons/fa";
export default function Loading({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#F4F5F0] z-[9999] fixed top-0 left-0">
      <div className="relative w-16 h-16">
        <FaSpinner className="animate-spin text-[#127373] text-4xl" />
      </div>
      {message && (
        <p className="mt-6 text-[#112E40] font-mono text-sm tracking-wide animate-pulse text-center max-w-md px-4">
          {message}
        </p>
      )}
      {!message && (
        <p className="mt-4 text-[#112E40] font-mono text-xs opacity-70">
          Loading...
        </p>
      )}
    </div>
  );
}
