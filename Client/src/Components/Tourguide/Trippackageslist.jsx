import React from "react";
import TripCard from "./Tripcard";

const TripPackagesList = ({ trips, onOpenDetails, onDeleteTrip }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
        My Active Trip Packages ({trips.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trips.map((trip) => (
          <TripCard
            key={trip._id}
            trip={trip}
            onOpenDetails={onOpenDetails}
            onDeleteTrip={onDeleteTrip}
          />
        ))}
      </div>
    </div>
  );
};

export default TripPackagesList;
