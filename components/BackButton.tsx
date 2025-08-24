"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-full hover:bg-gray-200 transition"
      aria-label="Back"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-8 h-8 text-gray-500" />
    </button>
  );
} 