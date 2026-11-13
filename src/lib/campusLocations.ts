// Campus location data used by the Location Communication module (Module 2).
// Keep this list in sync with CAMPUS_LOCATIONS in backend/server.js.

export type LocationData = {
  zone: string;
  floor: string;
  landmark: string;
};

export const CAMPUS_ZONES: string[] = [
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

export const FLOOR_OPTIONS: string[] = [
  "Ground Floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
  "5th Floor or above",
  "Basement / Parking",
  "Outdoor / Open Area",
];

export const LANDMARK_MAX_LENGTH = 80;

export const DEFAULT_LOCATION: LocationData = {
  zone: CAMPUS_ZONES[0],
  floor: FLOOR_OPTIONS[0],
  landmark: "",
};

// trims extra spaces and cuts the landmark to the allowed length
export function cleanLocation(loc: LocationData): LocationData {
  return {
    zone: loc.zone,
    floor: loc.floor,
    landmark: loc.landmark.replace(/\s+/g, " ").trim().slice(0, LANDMARK_MAX_LENGTH),
  };
}

export function isValidLocation(loc: LocationData): boolean {
  return CAMPUS_ZONES.includes(loc.zone) && FLOOR_OPTIONS.includes(loc.floor);
}

// one line text for a responder, e.g. "34 - School of CSE | 2nd Floor | Lab 204"
export function formatLocation(loc: LocationData): string {
  const parts = [loc.zone, loc.floor];
  if (loc.landmark.trim()) parts.push(loc.landmark.trim());
  return parts.join(" | ");
}
