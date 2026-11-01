"use client";
import Link from "next/link";
import { useState } from "react";

type EmergencyService = {
  title: string;
  description: string;
  icon: string;
};
type EmergencyRequest = {
  studentName: string;
  category: string;
  description: string;
};

const emergencyServices: EmergencyService[] = [
  {
    title: "campus security",
    description: "for campus saftey",
    icon: "campus",
  },

  {
    title: "medical assistance",
    description: "for medical concerns and supports.",
    icon: "mediass",
  },
  {
    title: "hostel warden",
    description: "for hostel saftey",
    icon: "hostel",
  },
];

export default function Home() {
  const [studentName, setStudentName] = useState("");
  const [category, setCategory] = useState("Medical");
  const [description, setDescription] = useState("");
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Campus<span className="text-blue-700">Shield</span>
          </Link>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Simulation Demo
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Request Emergency Assistance</h2>

          <p className="mt-2 text-slate-600">
            Submit your details to request campus support.
          </p>

          <form className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block font-medium">Student Name</label>

              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium">
                Emergency Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              >
                <option value="Medical">Medical Assistance</option>
                <option value="Security">Campus Security</option>
                <option value="Hostel">Hostel Assistance</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block font-medium">
                Describe Your Emergency
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what assistance you need..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Submit Assistance Request
            </button>
          </form>
        </section>
        <h1 className="text-3xl font-bold tracking-tight">
          Campus Emergency Assistance
        </h1>

        <p className="mt-2 text-slate-600">
          Find campus support options in one place.
        </p>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {emergencyServices.map((service) => (
            <article
              key={service.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold">{service.title}</h2>

              <p className="mt-3 leading-6 text-slate-600">
                {service.description}
              </p>
            </article>
          ))}
        </section>

        <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-semibold text-amber-900">
            Simulation-only notice
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            This student project does not contact real emergency services and
            cannot guarantee a response. Verify official contact details before
            any real-world deployment.
          </p>
        </aside>
      </div>
    </main>
  );
}
