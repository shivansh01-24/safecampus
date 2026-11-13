const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

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

const FLOOR_OPTIONS = [
  "Ground Floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
  "5th Floor or above",
  "Basement / Parking",
  "Outdoor / Open Area",
];
const LANDMARK_MAX_LENGTH = 80;

const DATA_DIR = path.join(__dirname, "data");
const ACTIVE_FILE = path.join(DATA_DIR, "active_requests.json");
const RESOLVED_FILE = path.join(DATA_DIR, "resolved_history.json");
const GUARDS_FILE = path.join(DATA_DIR, "guards.json");

const ensureDatabase = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ACTIVE_FILE)) {
    const initialActive = [
      {
        id: "REQ-1001",
        studentName: "Aman Verma",
        phoneNumber: "9876543210",
        category: "Medical",
        description: "Student fainted near chemistry lab, needs first-aid stretcher immediately.",
        location: {
          zone: "Academic Block B (Sciences)",
          floor: "2nd Floor",
          landmark: "Near Chemistry Lab 204",
        },
        campusLocation: "Academic Block B (Sciences)",
        status: "Pending",
        createdAt: "11:20 AM",
      },
      {
        id: "REQ-1002",
        studentName: "Pooja Singh",
        phoneNumber: "9812345678",
        category: "Hostel",
        description: "Electrical spark issue in corridor switchboard.",
        location: {
          zone: "Girls Hostel Complex",
          floor: "1st Floor",
          landmark: "Wing B Corridor",
        },
        campusLocation: "Girls Hostel Complex",
        status: "Dispatched",
        createdAt: "11:05 AM",
      },
    ];
    fs.writeFileSync(ACTIVE_FILE, JSON.stringify(initialActive, null, 2), "utf8");
  }

  if (!fs.existsSync(RESOLVED_FILE)) {
    fs.writeFileSync(RESOLVED_FILE, JSON.stringify([], null, 2), "utf8");
  }

  if (!fs.existsSync(GUARDS_FILE)) {
    const initialGuards = [
      {
        id: "G-1",
        name: "Officer Sharma",
        email: "guard@campus.edu",
        password: "guard123",
        badgeId: "SEC-01",
      },
    ];
    fs.writeFileSync(GUARDS_FILE, JSON.stringify(initialGuards, null, 2), "utf8");
  }
};

const readData = (filePath) => {
  try {
    ensureDatabase();
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    ensureDatabase();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
  }
};

ensureDatabase();

app.get("/", (req, res) => {
  res.send("CampusShield Emergency API is running!");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CampusShield Backend is healthy.",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/locations", (req, res) => {
  res.status(200).json({
    success: true,
    data: CAMPUS_LOCATIONS,
  });
});

app.post("/api/requests", (req, res) => {
  const { studentName, phoneNumber, category, description, location, campusLocation } = req.body;
  const cleanPhone = (phoneNumber || "").toString().trim().replace(/\D/g, "");

  if (!studentName || !category || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide studentName, category, and description.",
    });
  }

  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: "A valid 10-digit phone number is required.",
    });
  }

  const resolvedZone =
    (typeof location === "object" && location?.zone) ||
    (typeof location === "string" && location) ||
    campusLocation;

  if (!CAMPUS_LOCATIONS.includes(resolvedZone)) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid campus building.",
    });
  }

  const rawFloor = typeof location === "object" ? location?.floor : undefined;
  const resolvedFloor = FLOOR_OPTIONS.includes(rawFloor) ? rawFloor : "Ground Floor";

  const rawLandmark = typeof location === "object" ? location?.landmark : "";
  const resolvedLandmark =
    typeof rawLandmark === "string"
      ? rawLandmark.replace(/\s+/g, " ").trim().slice(0, LANDMARK_MAX_LENGTH)
      : "";

  const newRequest = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    studentName: studentName.trim(),
    phoneNumber: cleanPhone,
    category: category,
    description: description.trim(),
    location: {
      zone: resolvedZone,
      floor: resolvedFloor,
      landmark: resolvedLandmark || "General campus premises",
    },
    campusLocation: resolvedZone,
    status: "Pending",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const active = readData(ACTIVE_FILE);
  active.unshift(newRequest);
  writeData(ACTIVE_FILE, active);
  console.log("New Emergency Request Received:", newRequest);

  res.status(201).json({
    success: true,
    message: "Emergency request submitted successfully.",
    data: newRequest,
  });
});

app.get("/api/requests", (req, res) => {
  const active = readData(ACTIVE_FILE);
  const resolved = readData(RESOLVED_FILE);
  res.status(200).json({
    success: true,
    count: active.length + resolved.length,
    activeCount: active.length,
    resolvedCount: resolved.length,
    data: [...active, ...resolved],
    active,
    resolved,
  });
});

app.get("/api/requests/active", (req, res) => {
  const active = readData(ACTIVE_FILE);
  res.status(200).json({
    success: true,
    count: active.length,
    data: active,
  });
});

app.get("/api/requests/resolved", (req, res) => {
  const resolved = readData(RESOLVED_FILE);
  res.status(200).json({
    success: true,
    count: resolved.length,
    data: resolved,
  });
});

app.patch("/api/requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, guardName, guardBadgeId } = req.body;

  const validStatuses = ["Pending", "Dispatched", "Resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be Pending, Dispatched, or Resolved.",
    });
  }

  const active = readData(ACTIVE_FILE);
  const resolved = readData(RESOLVED_FILE);

  if (status === "Resolved") {
    const activeIndex = active.findIndex((r) => r.id === id);
    if (activeIndex !== -1) {
      const [item] = active.splice(activeIndex, 1);
      item.status = "Resolved";
      item.resolvedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      item.resolvedBy = guardName
        ? `${guardName} (${guardBadgeId || "Staff"})`
        : guardBadgeId || "Campus Security";
      resolved.unshift(item);
      writeData(ACTIVE_FILE, active);
      writeData(RESOLVED_FILE, resolved);
      console.log(`Request ${id} marked Resolved and archived to resolved_history.json`);
      return res.status(200).json({
        success: true,
        message: "Request marked as Resolved and moved to resolved history.",
        data: item,
      });
    }

    const resolvedIndex = resolved.findIndex((r) => r.id === id);
    if (resolvedIndex !== -1) {
      resolved[resolvedIndex].status = "Resolved";
      writeData(RESOLVED_FILE, resolved);
      return res.status(200).json({
        success: true,
        message: "Request status updated in resolved history.",
        data: resolved[resolvedIndex],
      });
    }

    return res.status(404).json({
      success: false,
      message: "Emergency request not found.",
    });
  }

  const activeItem = active.find((r) => r.id === id);
  if (activeItem) {
    activeItem.status = status;
    writeData(ACTIVE_FILE, active);
    console.log(`Request ${id} status updated to: ${status}`);
    return res.status(200).json({
      success: true,
      message: `Request status updated to ${status}.`,
      data: activeItem,
    });
  }

  const resolvedIndex = resolved.findIndex((r) => r.id === id);
  if (resolvedIndex !== -1) {
    const [item] = resolved.splice(resolvedIndex, 1);
    item.status = status;
    active.unshift(item);
    writeData(ACTIVE_FILE, active);
    writeData(RESOLVED_FILE, resolved);
    console.log(`Request ${id} restored from resolved history to active requests with status: ${status}`);
    return res.status(200).json({
      success: true,
      message: `Request status restored to active with ${status}.`,
      data: item,
    });
  }

  return res.status(404).json({
    success: false,
    message: "Emergency request not found.",
  });
});

app.post("/api/guards/register", (req, res) => {
  const { name, email, password, badgeId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and password.",
    });
  }

  const guards = readData(GUARDS_FILE);
  const existing = guards.find(
    (g) => g.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "A guard with this email already exists.",
    });
  }

  const newGuard = {
    id: `G-${guards.length + 1}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    badgeId: badgeId ? badgeId.trim() : `SEC-0${guards.length + 1}`,
  };

  guards.push(newGuard);
  writeData(GUARDS_FILE, guards);
  console.log("New Guard Registered and saved to guards.json:", newGuard.email);

  res.status(201).json({
    success: true,
    message: "Guard account created successfully.",
    guard: {
      id: newGuard.id,
      name: newGuard.name,
      email: newGuard.email,
      badgeId: newGuard.badgeId,
    },
  });
});

app.post("/api/guards/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email and password.",
    });
  }

  const guards = readData(GUARDS_FILE);
  const guard = guards.find(
    (g) =>
      g.email.toLowerCase() === email.trim().toLowerCase() &&
      g.password === password.trim()
  );

  if (!guard) {
    return res.status(401).json({
      success: false,
      message: "Invalid guard email or password.",
    });
  }

  console.log("Guard Logged In:", guard.email);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    guard: {
      id: guard.id,
      name: guard.name,
      email: guard.email,
      badgeId: guard.badgeId,
    },
  });
});

app.listen(PORT, () => {
  console.log(`CampusShield server running on port ${PORT}`);
});
