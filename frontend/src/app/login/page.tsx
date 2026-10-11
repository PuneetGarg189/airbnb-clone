"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[500px] rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">Log in or sign up</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Welcome to Airbnb</p>
        <AuthForm onSuccess={() => router.push("/")} />
      </div>
    </div>
  );
}
