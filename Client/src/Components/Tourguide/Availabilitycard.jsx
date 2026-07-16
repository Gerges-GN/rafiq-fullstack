import React from "react";
import { Circle } from "lucide-react";

const AvailabilityCard = ({ isAvailable, onToggle }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
        Availability Status
      </h3>
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
        <span className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5">
          {isAvailable ? (
            <>
              <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />{" "}
              Active on App
            </>
          ) : (
            <>
              <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500" />{" "}
              Hidden Profile
            </>
          )}
        </span>
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-4 h-4 accent-orange-500 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default AvailabilityCard;