"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, Clock, CheckCircle2, Check } from "lucide-react";
import { User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface MessageHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  host?: User;
  listingTitle: string;
}

export default function MessageHostModal({
  isOpen,
  onClose,
  host,
  listingTitle,
}: MessageHostModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<
    { sender: string; text: string; time: string; fromHost?: boolean }[]
  >([
    {
      sender: host?.name || "Host",
      text: `Hello ${user.name}! Thank you for your interest in ${listingTitle}. Feel free to ask any questions about your upcoming stay!`,
      time: "Today, 10:30 AM",
      fromHost: true,
    },
  ]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      sender: user.name,
      text: message.trim(),
      time: "Just now",
      fromHost: false,
    };

    setSentMessages((prev) => [...prev, newMsg]);
    setMessage("");
    toast.success(`Message sent to ${host?.name || "Host"}!`);
  };

  const quickQuestions = [
    "Is early check-in possible?",
    "Is high-speed wifi suitable for video calls?",
    "Are pets allowed with a pet fee?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={host?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"}
              alt={host?.name || "Host"}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                Message {host?.name || "Host"}
                {host?.is_superhost && (
                  <span className="text-[10px] bg-red-100 text-[#FF385C] font-semibold px-1.5 py-0.2 rounded-full">
                    Superhost
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[240px]">{listingTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Response Time Notice Banner */}
        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Generally replies in an hour
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">
            Response rate: 100%
          </span>
        </div>

        {/* Messages Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 min-h-[220px] max-h-[340px] bg-gray-50/50">
          {sentMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.fromHost ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-sm shadow-xs break-words ${
                  msg.fromHost
                    ? "bg-white text-gray-800 border border-gray-200 rounded-tl-xs"
                    : "bg-[#FF385C] text-white rounded-tr-xs"
                }`}
              >
                <p className="break-all whitespace-pre-wrap">{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                <span>{msg.time}</span>
                {!msg.fromHost && (
                  <span className="inline-flex items-center gap-0.5 text-gray-400">
                    · Delivered <Check className="w-2.5 h-2.5 inline" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Question Prompts */}
        <div className="px-6 py-2 border-t border-gray-100 bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Quick questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMessage(q)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-700 hover:border-black transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white">
          <input
            type="text"
            placeholder={`Ask ${host?.name || "the host"} anything...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-black outline-hidden"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="rounded-xl bg-[#FF385C] px-5 py-2.5 text-white font-bold text-xs hover:bg-[#E00B41] transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}