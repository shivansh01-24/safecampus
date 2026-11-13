# Module 2: Location Communication

Part of the CampusShield project (P22 - Help at 2 A.M.: Campus Emergency Assistance).

This module lets a student tell the system exactly where they are, using the
predefined campus building list instead of free text, so the request carries a
location that security staff can act on.

> Simulation only. This project does not dispatch real emergency help and makes
> no claim of guaranteed response.

## What it covers

- Building / block selection from the 64 predefined campus locations, grouped by
  type (gate and health services, academic schools, administration, library and
  labs, auditoriums and sports, boys hostels, girls hostels).
- Floor / wing level (ground floor up to 5th floor or above, basement / parking,
  outdoor / open area).
- Room or nearby landmark, up to 80 characters (for example "Lab 204").
- A live summary line so the student can see the exact location that will be sent.

## Files

| File | Purpose |
| --- | --- |
| `src/lib/campusLocations.ts` | Zone list, groups, floor options, `LocationData` type and helpers (`cleanLocation`, `isValidLocation`, `formatLocation`) |
| `src/components/LocationPicker.tsx` | Controlled picker component (`value` and `onChange`) |
| `src/app/page.tsx` | Uses the picker in the request form and shows the full location in recent requests |
| `backend/server.js` | Validates building and floor, trims the landmark, stores `location` on the request |

## Data shape

```json
{
  "location": {
    "zone": "34 - School of Computer Science & Engineering",
    "floor": "2nd Floor",
    "landmark": "Lab 204"
  },
  "campusLocation": "34 - School of Computer Science & Engineering"
}
```

`campusLocation` is still sent (zone only) so older code that reads it keeps working.

## Behaviour notes

- No building is selected by default. The student has to choose one, so a wrong
  default (like the main gate) is never sent by mistake.
- The backend returns `400` if the building is not in the list.
- An unknown floor falls back to "Ground Floor". An empty landmark is stored as
  "General campus premises".
- The building list exists in two places, `src/lib/campusLocations.ts` and
  `backend/server.js`. If a block is added or renamed, update both.

## Integration with other modules

Student request (Module 1) -> location from this module -> security dashboard
(Module 3) reads `request.location.zone`, `.floor` and `.landmark` from
`GET /api/requests/active`.

## How to test

1. Start the backend: `cd backend && npm install && node server.js` (port 5000).
2. Start the frontend: `npm install && npm run dev`.
3. Open the home page and try to submit without choosing a building. The form
   should not submit.
4. Choose a building, floor and landmark, fill the other fields and submit.
   The request should appear under "Recent Submitted Requests" with the full
   location, and `GET http://localhost:5000/api/requests/active` should return the
   same `location` object.
