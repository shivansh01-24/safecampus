"use client";
import { useId } from "react";
import {
  FLOOR_OPTIONS,
  ZONE_GROUPS,
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

  const update = (changes: Partial<LocationData>) => {
    onChange({ ...value, ...changes });
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
          {ZONE_GROUPS.map((group) => (
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
            placeholder="e.g. Lab 204 or Staircase"
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );
}
