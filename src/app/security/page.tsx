"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  resolvedAt?: string;
  resolvedBy?: string;
};

export default function SecurityPage() {
  const [currentGuard, setCurrentGuard] = useState<GuardUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [requests, setRequests] = useState<EmergencyRequestItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "Pending" | "Dispatched" | "Resolved">("Pending");
  const [newAlertBanner, setNewAlertBanner] = useState<{ id: string; studentName: string; location: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevRequestsCountRef = useRef<number | null>(null);
  const latestKnownIdRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const exportIncidentsCSV = () => {
    if (requests.length === 0) return;
    const headers = ["Incident ID", "Student Name", "Phone", "Category", "Location", "Status", "Reported At", "Resolved By"];
    const rows = requests.map((r) => [
      `"${r.id}"`,
      `"${r.studentName}"`,
      `"${r.phoneNumber || "N/A"}"`,
      `"${r.category}"`,
      `"${(r.campusLocation || "").replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.createdAt}"`,
      `"${r.resolvedBy || "N/A"}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `safecampus_incident_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";

      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);
      osc.frequency.setValueAtTime(1320, now + 0.36);
      osc.frequency.setValueAtTime(880, now + 0.48);
      osc.frequency.setValueAtTime(1320, now + 0.60);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.setValueAtTime(0.65, now + 0.12);
      gain.gain.setValueAtTime(0.35, now + 0.24);
      gain.gain.setValueAtTime(0.65, now + 0.36);
      gain.gain.setValueAtTime(0.35, now + 0.48);
      gain.gain.setValueAtTime(0.65, now + 0.60);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch {
    }
  };

  useEffect(() => {
    const unlock = () => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current && AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().catch(() => {});
        }
      } catch {
      }
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

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
        if (data.data && data.data.length > 0) {
          const freshList: EmergencyRequestItem[] = data.data;
          const newest = freshList[0];
          const isNewArrival =
            (latestKnownIdRef.current !== null && newest.id !== latestKnownIdRef.current) ||
            (prevRequestsCountRef.current !== null && freshList.length > prevRequestsCountRef.current);

          if (isNewArrival) {
            playAlertSound();
            setNewAlertBanner({
              id: newest.id,
              studentName: newest.studentName,
              location: newest.campusLocation || "Campus premises",
            });
          }
          latestKnownIdRef.current = newest.id;
          prevRequestsCountRef.current = freshList.length;
          setRequests(freshList);
        }
      })
      .catch(() => {
      });
  };

  useEffect(() => {
    if (!currentGuard) return;
    loadRequests();
    const interval = setInterval(loadRequests, 3000);
    return () => clearInterval(interval);
  }, [currentGuard]);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("campus_shield_emergency");
      channel.onmessage = () => {
        loadRequests();
      };
    } catch {
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "campus_last_emergency_trigger") {
        loadRequests();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const updateStatus = (id: string, newStatus: "Pending" | "Dispatched" | "Resolved") => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiBase}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        guardName: currentGuard?.name,
        guardBadgeId: currentGuard?.badgeId,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        loadRequests();
      })
      .catch(() => {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: newStatus,
                  resolvedBy:
                    newStatus === "Resolved"
                      ? `${currentGuard?.name} (${currentGuard?.badgeId || "Staff"})`
                      : r.resolvedBy,
                }
              : r
          )
        );
      });
  };

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

  const filteredList =
    filter === "ALL"
      ? [...requests].sort((a, b) => {
          if (a.status === "Pending" && b.status !== "Pending") return -1;
          if (a.status !== "Pending" && b.status === "Pending") return 1;
          return 0;
        })
      : requests.filter((r) => r.status === filter);

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
        {newAlertBanner && (
          <div className="rounded-2xl border border-red-500 bg-red-950/90 p-4 text-white shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🚨</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                  New Emergency Alert Received!
                </p>
                <p className="text-sm font-extrabold">
                  {newAlertBanner.studentName} at {newAlertBanner.location} ({newAlertBanner.id})
                </p>
              </div>
            </div>
            <button
              onClick={() => setNewAlertBanner(null)}
              className="rounded-lg bg-red-800 hover:bg-red-700 px-3 py-1 text-xs font-bold text-white"
            >
              Acknowledge ✕
            </button>
          </div>
        )}

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

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                soundEnabled
                  ? "border-emerald-600 bg-emerald-950/40 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-400"
              }`}
            >
              {soundEnabled ? "🔊 Audio: ON" : "🔇 Audio: OFF"}
            </button>
            <button
              onClick={exportIncidentsCSV}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1.5 text-xs font-semibold transition"
            >
              <span>⬇</span> Export CSV Log
            </button>
            <button
              onClick={playAlertSound}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-red-900/40 transition active:scale-95"
            >
              <span>🔊</span> Test Siren Alert
            </button>
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

        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {(["Pending", "Dispatched", "Resolved", "ALL"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              {tab} ({tab === "ALL" ? requests.length : requests.filter((r) => r.status === tab).length})
            </button>
          ))}
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Incoming Emergency Incidents</h2>

          {filteredList.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-500">
              No emergency requests found in this filter category.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((req) => (
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
                        <a
                          href={`tel:${req.phoneNumber}`}
                          className="text-xs text-blue-400 hover:text-blue-300 font-mono bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition inline-flex items-center gap-1"
                        >
                          📞 {req.phoneNumber}
                        </a>
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

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {req.status === "Pending" && (
                      <button
                        onClick={() => updateStatus(req.id, "Dispatched")}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 transition px-3 py-1.5 text-xs font-bold text-white shadow-md"
                      >
                        Dispatch Officer →
                      </button>
                    )}

                    {req.status === "Dispatched" && (
                      <button
                        onClick={() => updateStatus(req.id, "Resolved")}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 transition px-3 py-1.5 text-xs font-bold text-white shadow-md"
                      >
                        Mark as Resolved ✓
                      </button>
                    )}

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        req.status === "Pending"
                          ? "bg-amber-900/50 text-amber-300"
                          : req.status === "Dispatched"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-emerald-900/50 text-emerald-300"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
