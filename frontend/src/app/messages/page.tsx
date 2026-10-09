"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, ChevronLeft, CheckCircle2, Clock, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface MessageItem {
  sender: string;
  text: string;
  time: string;
  isHost: boolean;
  status?: string;
}

interface Conversation {
  id: number;
  hostName: string;
  hostAvatar: string;
  listing: string;
  lastMessage: string;
  time: string;
  responseTime: string;
  messages: MessageItem[];
}

export default function MessagesPage() {
  const { user, isHost } = useAuth();
  const [activeConversation, setActiveConversation] = useState(0);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      hostName: "Elena Rostova",
      hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      listing: "Cliffside Santorini Caldera Villa",
      lastMessage: "Looking forward to hosting you in Oia! Let me know if you need airport transfer.",
      time: "2h ago",
      responseTime: "Generally replies in an hour",
      messages: [
        { sender: "Elena Rostova", text: "Hello! Thank you for booking our Caldera Villa.", time: "10:30 AM", isHost: true },
        { sender: "Alex Rivera", text: "Hi Elena! What is the check-in process like?", time: "10:45 AM", isHost: false },
        { sender: "Elena Rostova", text: "Looking forward to hosting you in Oia! Let me know if you need airport transfer.", time: "11:00 AM", isHost: true },
      ],
    },
    {
      id: 2,
      hostName: "Liam Vance",
      hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      listing: "Modern Glass Cabin in Redwood Sanctuary",
      lastMessage: "The hot tub is heated and ready for your arrival this weekend!",
      time: "1d ago",
      responseTime: "Generally replies in an hour",
      messages: [
        { sender: "Liam Vance", text: "Welcome to Big Sur! The redwood trails are beautiful right now.", time: "Yesterday", isHost: true },
        { sender: "Liam Vance", text: "The hot tub is heated and ready for your arrival this weekend!", time: "Yesterday", isHost: true },
      ],
    },
  ]);

  const current = conversations[activeConversation];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [current.messages]);

  const handleSelectConversation = (idx: number) => {
    setActiveConversation(idx);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const newMsg: MessageItem = {
      sender: user.name,
      text,
      time: "Just now",
      isHost: isHost,
      status: "Delivered",
    };

    setConversations((prev) =>
      prev.map((c, idx) => {
        if (idx === activeConversation) {
          return {
            ...c,
            lastMessage: text,
            time: "Just now",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText("");
    toast.success("Message sent");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black mb-4 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Messages</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct communication between guest and host
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hosts generally reply in an hour</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden min-h-[550px]">
          {/* Conversation List */}
          <div className="md:col-span-4 border-r border-gray-200 divide-y divide-gray-100">
            <div className="p-4 border-b bg-gray-50/50">
              <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                All Conversations
              </span>
            </div>
            {conversations.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(idx)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3 ${
                  activeConversation === idx ? "bg-pink-50/40 border-l-4 border-l-[#FF385C]" : ""
                }`}
              >
                <img
                  src={conv.hostAvatar}
                  alt={conv.hostName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{conv.hostName}</h4>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">{conv.time}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#FF385C] truncate mt-0.5">
                    {conv.listing}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Active Chat Thread */}
          <div className="md:col-span-8 flex flex-col h-[550px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <img
                  src={current.hostAvatar}
                  alt={current.hostName}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    {current.hostName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full">
                      Superhost
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700 truncate max-w-[180px] sm:max-w-none">
                      {current.listing}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      Generally replies in an hour
                    </span>
                  </div>
                </div>
              </div>

              {/* Response Rate Metric Badge */}
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Generally replies in an hour
                </span>
                <span className="text-[11px] text-gray-400 mt-1 font-medium">Response rate: 100%</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
              {current.messages.map((msg, i) => {
                const isSentByMe = isHost ? msg.isHost : !msg.isHost;
                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-sm shadow-xs break-words overflow-hidden ${
                        isSentByMe
                          ? "bg-[#FF385C] text-white rounded-tr-xs"
                          : "bg-white text-gray-800 border border-gray-200 rounded-tl-xs"
                      }`}
                    >
                      <p className="break-all whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                      <span>{msg.time}</span>
                      {isSentByMe && (
                        <span className="inline-flex items-center gap-0.5 text-gray-400">
                          · Delivered <Check className="w-2.5 h-2.5 inline" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex gap-2">
              <input
                type="text"
                placeholder={`Message ${current.hostName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-black outline-hidden"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="rounded-xl bg-[#FF385C] px-5 py-2.5 text-white font-bold text-xs hover:bg-[#E00B41] transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}