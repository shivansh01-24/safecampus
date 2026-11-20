# Module 2: Location Communication

Part of CampusShield (P22 - Help at 2 A.M.: Campus Emergency Assistance).

This module lets a student say exactly where they are, using the predefined
campus building list instead of free text, so the request reaches the security
guard with a location that can be acted on.

> Simulation only. This project does not dispatch real emergency help and makes
> no claim of guaranteed response.

## What it does

- **Building**: choose one of the 64 campus blocks, grouped in 7 types (gate and
  health services, academic schools, administration, library and labs,
  auditoriums and sports, boys hostels, girls hostels). No building is selected
  by default, so the student must choose one.
- **Search**: type a word or a block code (for example `library`, `hostel`, `34`)
  to narrow the building list. All typed words must match; upper or lower case
  does not matter.
- **Floor**: 8 options, from Ground Floor to 5th Floor or above, plus Basement /
  Parking and Outdoor / Open Area.
- **Landmark**: room or nearby place, up to 80 characters, with a counter.
- **Quick pick**: 8 one-tap landmarks (Main entrance, Reception, Staircase, Lift,
  Canteen, Washroom, Parking, Playground). A tapped landmark is added to what the
  student already typed, never repeated, and never goes over 80 characters.
- **Live summary**: a line that shows exactly what will be sent.

## Files

| File | Purpose |
| --- | --- |
| `src/lib/campusLocations.ts` | Building list, groups, floors, landmark rules, `LocationData` type and helpers (`cleanLocation`, `isValidLocation`, `formatLocation`, `filterZoneGroups`) |
| `src/components/LocationPicker.tsx` | The picker component. It is controlled: the parent passes `value` and `onChange` |
| `src/app/page.tsx` (location part) | Uses the picker in the request form, checks it before sending, shows the full location in recent requests |
| `backend/server.js` (location part) | Validates the building and floor, cleans the landmark, stores the location |
| `tests/module2/*.test.mjs` | 29 automatic tests for the helpers, the search, the groups and the suggestions |

## Data

The browser sends:

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

The backend stores the same `location` object and also builds one readable line
for the guard portal:

```
34 - School of Computer Science & Engineering | 2nd Floor | Lab 204
```

## Validation rules

| Case | Browser | Backend |
| --- | --- | --- |
| No building chosen | Form is blocked (field is required) | HTTP 400, "Please select a valid campus building." |
| Building not in the 64-block list | Cannot be chosen | HTTP 400 |
| Floor not in the allowed list | Cannot be chosen | Stored as "Ground Floor" |
| Landmark with extra spaces | Cleaned before sending | Cleaned again |
| Landmark longer than 80 characters | Input is limited | Cut to 80 characters |
| Landmark empty | Allowed | Stored as "General campus premises" |
| Older request with only `campusLocation` | - | Accepted (building only, Ground Floor) |

## Tests

From the project folder:

```
node --test "tests/module2/*.test.mjs"
```

The tests cover: the 64 unique blocks, the 7 groups (every block in exactly one
group), the cleaning of the landmark (spaces, tabs, 80 character limit), the
validity of buildings and floors, the one-line format, the search (empty search,
`library`, `hostel`, a block code, case, word order, no match) and the landmark
suggestions. They need Node.js 22.6 or newer and no extra packages.

## Manual check

1. Start the backend (`cd backend && npm install && node server.js`) and the
   frontend (`npm install && npm run dev`).
2. Try to submit without a building. The form must not submit.
3. Type `hostel` in the search box. 14 buildings should be listed. Press Enter:
   the form must not submit.
4. Choose a building and a floor, tap a quick-pick landmark, fill the other
   fields and submit.
5. The request should show the full location under "Recent Submitted Requests",
   and the same line should appear in the guard portal (`/security`).

## Integration

Student request (Module 1) -> location from this module -> security response
(Module 3). The guard portal shows the one-line location of every incident.

## Notes and limits

- The building list is in two places: `src/lib/campusLocations.ts` and
  `backend/server.js`. If a block is added or renamed, update both.
- The student chooses the location. GPS or a map is not used, because GPS is not
  reliable inside buildings.
- The same floor list is offered for every building.
