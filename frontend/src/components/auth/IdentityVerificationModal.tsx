"use client";

import React from "react";
import { X, ShieldCheck, CheckCircle2, FileCheck, Camera, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface IdentityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IdentityVerificationModal({
  isOpen,
  onClose,
}: IdentityVerificationModalProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-[#FF385C]" />
            <span>Identity Verification</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Identity Verified
          </span>
          <span className="bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-bold">
            Mocked / Placeholder
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <img
              src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-200"
            />
            <div>
              <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
                {user.name}
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </h4>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Government ID Confirmed
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Verification Checks Completed
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-800">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Government Photo ID</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Verified ✓
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-800">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Biometric Liveness Selfie</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Verified ✓
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <p className="font-semibold text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Identity Verification Notice
            </p>
            <p>
              Real identity verification uses third-party automated biometric scanning (e.g. Stripe Identity or Persona) to verify passport and driver&apos;s licenses. This section is mocked for demonstration per assignment scope.
            </p>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end bg-gray-50">
          <button
            onClick={() => {
              toast.success("Identity is verified!");
              onClose();
            }}
            className="rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}