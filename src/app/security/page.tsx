"use client";
import Link from "next/link";
import { useState } from "react";

type GuardUser = {
  id: string;
  name: string;
  email: string;
  badgeId: string;
};

type EmergencyRequestItem = {
  id: string;
  studentName: string;
  phoneNumber?: string;
  category: string;
  description: string;
  campusLocation?: string;
  location?: {
    zone: string;
    floor: string;
    landmark: string;
  };
  status: "Pending" | "Dispatched" | "Resolved";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
};

export default function SecurityPage() {
  const [currentGuard, setCurrentGuard] = useState<GuardUser | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                CampusShield — Security Response Room
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live Staff & Warden Incident Dispatch Console
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            ← Student View
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-400">
            Security console initialized. Guard authentication required to access live incident dispatch controls.
          </p>
        </section>
      </div>
    </main>
  );
}
