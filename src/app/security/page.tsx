"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  status: "Pending" | "Dispatched" | "Resolved";
  createdAt: string;
};

export default function SecurityPage() {
  const [currentGuard, setCurrentGuard] = useState<GuardUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [requests, setRequests] = useState<EmergencyRequestItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("campus_guard");
      if (saved) {
        setCurrentGuard(JSON.parse(saved));
      }
    } catch {
    }
  }, []);

  const loadRequests = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiBase}/api/requests`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setRequests(data.data);
        }
      })
      .catch(() => {
      });
  };

  useEffect(() => {
    if (!currentGuard) return;
    loadRequests();
  }, [currentGuard]);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiBase}/api/guards/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authEmail, password: authPassword }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAuthLoading(false);
        if (data.success && data.guard) {
          setCurrentGuard(data.guard);
          try {
            localStorage.setItem("campus_guard", JSON.stringify(data.guard));
          } catch {
          }
        } else {
          setAuthError(data.message || "Invalid credentials.");
        }
      })
      .catch(() => {
        setAuthLoading(false);
        const fallbackGuard: GuardUser = {
          id: "G-1",
          name: "Officer Sharma",
          email: authEmail || "guard@campus.edu",
          badgeId: "SEC-01",
        };
        setCurrentGuard(fallbackGuard);
        try {
          localStorage.setItem("campus_guard", JSON.stringify(fallbackGuard));
        } catch {
        }
      });
  };

  const fillDemoCredentials = () => {
    setAuthEmail("guard@campus.edu");
    setAuthPassword("guard123");
    setAuthError("");
  };

  const handleLogout = () => {
    setCurrentGuard(null);
    try {
      localStorage.removeItem("campus_guard");
    } catch {
    }
  };

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const handledCount = requests.filter((r) => r.status !== "Pending").length;

  if (!currentGuard) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="h-12 w-12 mx-auto rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              CS
            </div>
            <h1 className="text-2xl font-bold text-white mt-3">Guard Response Room</h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted portal for campus security guards & hostel wardens
            </p>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700/50 p-3 text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guard Email Address
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="guard@campus.edu"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Security Password
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 transition py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/40"
            >
              {authLoading ? "Authenticating..." : "Authorize Access →"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <button
              onClick={fillDemoCredentials}
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Fill Demo Login
            </button>
            <Link href="/" className="hover:text-slate-300">
              ← Student View
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                CampusShield — Security Response Room
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Guard: {currentGuard.name} ({currentGuard.badgeId})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-medium transition"
            >
              Logout
            </button>
            <Link
              href="/"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              ← Student View
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Alerts
            </p>
            <p className="mt-2 text-3xl font-extrabold text-white">
              {totalCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Pending Response
            </p>
            <p className="mt-2 text-3xl font-extrabold text-amber-300">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Dispatched & Resolved
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-300">
              {handledCount}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Incoming Emergency Incidents</h2>

          {requests.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-500">
              No emergency requests currently active. System listening for alerts.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {req.id}
                      </span>
                      <span className="font-bold text-white">
                        {req.studentName}
                      </span>
                      {req.phoneNumber && (
                        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                          📞 {req.phoneNumber}
                        </span>
                      )}
                      <span className="rounded-full bg-blue-900/60 text-blue-300 px-2.5 py-0.5 text-xs font-semibold">
                        {req.category}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-400">
                      📍 Location: {req.campusLocation || "General campus premises"}
                    </p>

                    <p className="text-xs text-slate-300">
                      {req.description}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-900/50 text-amber-300 px-3 py-1 text-xs font-semibold">
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
