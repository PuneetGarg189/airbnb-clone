"use client";

import React from "react";
import { X, Mail, Apple } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    toast.success("Successfully logged in!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div
        className="w-full max-w-[568px] rounded-2xl bg-white dark:bg-[#222222] shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-gray-200 dark:border-zinc-700 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition -ml-2"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="flex-1 text-center font-bold text-gray-900 dark:text-gray-100">Log in or sign up</h2>
          <div className="w-9" />
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Welcome to Airbnb</h3>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="rounded-xl border border-gray-400 overflow-hidden">
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full px-4 py-3 outline-hidden border-b border-gray-400 bg-transparent text-gray-900 dark:text-white"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full px-4 py-3 outline-hidden bg-transparent text-gray-900 dark:text-white"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              We'll call or text you to confirm your number. Standard message and data rates apply. Privacy Policy
            </p>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-[#FF385C] via-[#E00B41] to-[#D70466] py-3.5 text-center text-sm font-bold text-white shadow-md hover:brightness-105 transition cursor-pointer"
            >
              Continue
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-gray-300 dark:bg-zinc-700"></div>
            <span className="text-xs text-gray-500 font-medium">or</span>
            <div className="h-px flex-1 bg-gray-300 dark:bg-zinc-700"></div>
          </div>

          <div className="space-y-4">
            <button className="flex w-full items-center justify-between rounded-xl border border-gray-800 dark:border-gray-300 px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer">
              <Mail className="w-5 h-5" />
              <span className="font-semibold flex-1">Continue with Email</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-xl border border-gray-800 dark:border-gray-300 px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer">
              <Apple className="w-5 h-5" />
              <span className="font-semibold flex-1">Continue with Apple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
