"use client";

import { X } from "lucide-react";
import AuthForm from "./AuthForm";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log in or sign up"
        className="max-h-[90vh] w-full max-w-[568px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-gray-200 px-6 py-4">
          <button onClick={onClose} aria-label="Close" className="-ml-2 rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-700" />
          </button>
          <h2 className="flex-1 text-center font-bold text-gray-900">Log in or sign up</h2>
          <div className="w-9" />
        </div>
        <div className="p-6">
          <h3 className="mb-5 text-xl font-bold text-gray-900">Welcome to Airbnb</h3>
          <AuthForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
