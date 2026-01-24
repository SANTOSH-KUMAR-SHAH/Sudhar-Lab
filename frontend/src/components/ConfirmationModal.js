
import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">


                <div className={`px-6 py-4 flex items-center justify-between border-b border-gray-100 ${isDanger ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                        {isDanger && <FaExclamationTriangle className="text-red-500 text-xl" />}
                        <h3 className={`font-semibold text-lg ${isDanger ? 'text-red-700' : 'text-gray-800'}`}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>


                <div className="p-6">
                    <p className="text-gray-600 leading-relaxed text-[15px]">
                        {message}
                    </p>
                </div>


                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg text-white font-medium text-sm shadow-md transition-all transform active:scale-95 ${isDanger
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                            : 'bg-[#6F4E37] hover:bg-[#5a3f2c] shadow-[#6F4E37]/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
}
