"use client";
import { useId, useState } from "react";
import {
  FLOOR_OPTIONS,
  LANDMARK_MAX_LENGTH,
  LANDMARK_SUGGESTIONS,
  cleanLocation,
  filterZoneGroups,
  formatLocation,
  type LocationData,
} from "@/lib/campusLocations";

type LocationPickerProps = {
  value: LocationData;
  onChange: (location: LocationData) => void;
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600";

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const id = useId();
  const [query, setQuery] = useState("");

  // when the form resets the building (after submit), clear the search text too
  const [lastZone, setLastZone] = useState(value.zone);
  if (lastZone !== value.zone) {
    setLastZone(value.zone);
    if (value.zone === "") setQuery("");
  }

  const groups = filterZoneGroups(query);
  const matchCount = groups.reduce((total, group) => total + group.zones.length, 0);
  // if the chosen building is filtered out by the search, still show it so the select does not go blank
  const selectedHidden = value.zone !== "" && !groups.some((g) => g.zones.includes(value.zone));

  const update = (changes: Partial<LocationData>) => {
    onChange({ ...value, ...changes });
  };

  // adds the suggestion to the landmark text (keeps what the student already typed)
  const addLandmark = (item: string) => {
    const current = value.landmark.trim();
    if (current.toLowerCase().includes(item.toLowerCase())) return;
    const next = current ? `${current}, ${item}` : item;
    update({ landmark: next.slice(0, LANDMARK_MAX_LENGTH) });
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-800">Campus Location Details</p>

      <div>
        <label
          htmlFor={`${id}-zone`}
          className="mb-1 block text-xs font-medium text-slate-600"
        >
          Campus Building / Area
        </label>
        <input
          id={`${id}-search`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter in the search box should not submit the whole emergency form
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="Search building, e.g. library, 34 or hostel"
          aria-label="Search campus building"
          aria-describedby={`${id}-search-result`}
          className={`${fieldClass} mb-2`}
        />
        <p id={`${id}-search-result`} aria-live="polite" className="mb-1 text-[11px] text-slate-500">
          {query.trim()
            ? matchCount > 0
              ? `${matchCount} building${matchCount === 1 ? "" : "s"} found`
              : "No building found, try another word"
            : ""}
        </p>
        <select
          id={`${id}-zone`}
          value={value.zone}
          onChange={(e) => update({ zone: e.target.value })}
          required
          className={fieldClass}
        >
          <option value="" disabled>
            Select your building
          </option>
          {selectedHidden && <option value={value.zone}>{value.zone}</option>}
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${id}-floor`}
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Floor / Wing Level
          </label>
          <select
            id={`${id}-floor`}
            value={value.floor}
            onChange={(e) => update({ floor: e.target.value })}
            className={fieldClass}
          >
            {FLOOR_OPTIONS.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-landmark`}
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Room / Nearby Landmark
          </label>
          <input
            id={`${id}-landmark`}
            type="text"
            value={value.landmark}
            onChange={(e) => update({ landmark: e.target.value })}
            maxLength={LANDMARK_MAX_LENGTH}
            placeholder="e.g. Lab 204 or Staircase"
            className={fieldClass}
          />
          <p className="mt-1 text-right text-[11px] text-slate-500">
            {value.landmark.length}/{LANDMARK_MAX_LENGTH}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-600">
          Quick pick (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {LANDMARK_SUGGESTIONS.map((item) => {
            const picked = value.landmark.toLowerCase().includes(item.toLowerCase());
            return (
              <button
                key={item}
                type="button"
                aria-pressed={picked}
                onClick={() => addLandmark(item)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  picked
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-600"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <p
        aria-live="polite"
        className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
      >
        {value.zone
          ? `📍 Location sent with your request: ${formatLocation(cleanLocation(value))}`
          : "Select your building so your location can be sent with the request."}
      </p>
    </div>
  );
}
