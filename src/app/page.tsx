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
  phoneNumber?: string;
  category: string;
  campusLocation?: string;
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

const CAMPUS_LOCATIONS = [
  "00 - Main Gate 1",
  "1A - School of Design (Fashion)",
  "1B - School of Design (Fashion)",
  "2A - Uni Auditorium",
  "3 - Uni-Health Center",
  "4 - Lovely Institute of Technology-Pharmacy",
  "5 - Animal House",
  "6 - School of Architecture & Designing",
  "7 - School of Pharmaceutical Science",
  "8 - School of Journalism, Film Production and Creative Arts",
  "13 - Student Welfare Wing",
  "14 - School of Business",
  "15 - Uni Mall",
  "15A - Student Resource Centre",
  "15B - School of Hotel Management and Tourism",
  "16 - Baldev Raj Mittal UniPolis",
  "18 - Lovely School of Education",
  "19 - School of Journalism, Films And Creative Arts - I",
  "20 - School of Law",
  "21 - School of Law",
  "25 - School of AI and Emerging Technology",
  "26 - School of AI and Emerging Technology",
  "27 - School of Computing and Artificial Intelligence",
  "28 - School of Computing and Artificial Intelligence",
  "29 - Administration-I",
  "30 - Central Administrative Office",
  "31 - Admission Block",
  "32 - Administration-II",
  "33 - School of Computer Science & Engineering",
  "34 - School of Computer Science & Engineering",
  "35 - Shanti Devi Mittal Auditorium",
  "36 - School of Electronics and Electrical Engineering",
  "37 - Centre Library",
  "37A - School of Bio Engineering and Bio Sciences",
  "38 - School of Computer Application / Division of Research and Development",
  "39 - Innovation Studio",
  "41-AB - Boys Apartment",
  "41-CD - Staff Residence",
  "47 - Shanti Devi Mittal Indoor Sports Complex",
  "55 - School of Mechanical Engineering / Polytechnic / Chemical Sciences",
  "58 - Mechanical Engineering Workshops",
  "59 - New Polytechnic Block",
  "60 - Workshop",
  "61 - Student Learning Center",
  "BH-1 - Boys Hostel-01",
  "BH-2 - Boys Hostel-02",
  "BH-3 - Boys Hostel-03",
  "BH-4 - Boys Hostel-04",
  "BH-5 - Boys Hostel-05",
  "BH-6 - Boys Hostel-06",
  "BH-7 - Boys Hostel-07",
  "BS-11 - Boys Studios 11",
  "BS-12 - Boys Studios 12",
  "BS-13 - Boys Studios 13",
  "GH-1 - Girls Hostel-01",
  "GH-2 - Girls Hostel-02",
  "GH-3 - Girls Hostel-03",
  "GH-4 - Girls Hostel-04",
  "GH-5 - Girls Hostel-05",
  "GH-6 - Girls Hostel-06",
  "GH-7 - Girls Hostel-07",
  "GS-11 - Girls Studios 11",
  "GS-12 - Girls Studios 12",
  "VET - Vet Clinic",
];

export default function Home() {
  const [studentName, setStudentName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [category, setCategory] = useState("Medical");
  const [campusLocation, setCampusLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [requestsList, setRequestsList] = useState<EmergencyRequest[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPhoneError("");

    const newRequest: EmergencyRequest = {
      studentName,
      phoneNumber: cleanPhone,
      category,
      campusLocation,
      description,
    };
    console.log("Emergency Request Submitted:", newRequest);
    setSuccessMessage(
      "Your assistance request has been submitted successfully.",
    );

    setRequestsList((prev) => [newRequest, ...prev]);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiBase}/api/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRequest),
    })
      .then((res) => res.json())
      .then((data) => {
        try {
          const channel = new BroadcastChannel("campus_shield_emergency");
          channel.postMessage({ type: "NEW_EMERGENCY" });
          channel.close();
        } catch {
        }
        try {
          localStorage.setItem("campus_last_emergency_trigger", Date.now().toString());
        } catch {
        }
      })
      .catch((err) => {
        console.log("Backend offline or connection error:", err);
      });

    setStudentName("");
    setPhoneNumber("");
    setCategory("Medical");
    setCampusLocation(CAMPUS_LOCATIONS[0]);
    setDescription("");
  };
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Campus<span className="text-blue-700">Shield</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Request Emergency Assistance</h2>

          <p className="mt-2 text-slate-600">
            Submit your details to request campus support.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block font-medium">Student Name</label>

              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium">Contact Phone Number (10 Digits Required)</label>

              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                minLength={10}
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhoneNumber(val);
                  if (val.length === 10) {
                    setPhoneError("");
                  }
                }}
                placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                className={`w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600 ${
                  phoneError ? "border-red-500 bg-red-50" : "border-slate-300"
                }`}
              />
              {phoneError && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {phoneError}
                </p>
              )}
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
                Campus Location (Where do you need help?)
              </label>

              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 bg-white"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-medium">
                Describe Your Emergency
              </label>

              <textarea
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what assistance you need..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Submit Assistance Request
            </button>
          </form>
          {successMessage && (
            <p className="mt-4 rounded-lg bg-orange-50 p-3 text-blue-700">
              {successMessage}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Recent Submitted Requests</h2>
          <p className="mt-1 text-sm text-slate-600">
            Emergency requests submitted during this session.
          </p>

          {requestsList.length === 0 ? (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              No emergency requests submitted yet. Fill the form above to submit an assistance request.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {requestsList.map((req, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {req.studentName}
                      </span>
                      {req.phoneNumber && (
                        <span className="text-xs font-mono text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                          📞 {req.phoneNumber}
                        </span>
                      )}
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        {req.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">
                      📍 Location: {req.campusLocation || CAMPUS_LOCATIONS[0]}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {req.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 self-start sm:self-auto">
                    Status: Pending Response
                  </span>
                </div>
              ))}
            </div>
          )}
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

        <aside className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="font-semibold text-blue-900">
            Emergency Guidelines
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            For critical life-threatening situations, also notify the campus central control room or nearest security outpost immediately.
          </p>
        </aside>
      </div>
    </main>
  );
}
