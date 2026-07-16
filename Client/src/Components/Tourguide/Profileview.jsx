import React from "react";
import { BadgeCheck, MapPin, Star, CheckCircle } from "lucide-react";
import { DEFAULT_AVATAR } from "../../services/Guideapi";

const ProfileView = ({ profile }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
      <div className="relative w-28 h-28 mx-auto">
        <img
          src={profile.avatarUrl || DEFAULT_AVATAR}
          alt="Guide Avatar"
          className="w-full h-full object-cover rounded-full border-4 border-slate-50 shadow-md"
        />
        <span className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-1.5">
          {profile.name}
          {profile.verified && (
            <BadgeCheck
              className="w-4 h-4 text-blue-500 fill-blue-100"
              title="Verified by admin"
            />
          )}
        </h2>

        <p className="text-xs font-bold text-orange-600 mt-0.5 inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {profile.city}
        </p>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= Math.round(profile.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}

          <span className="text-sm font-semibold text-slate-700 ml-1">
            {profile.rating}
          </span>

          <span className="text-xs text-slate-500">
            ({profile.reviews} reviews)
          </span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100/80">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Bio Presentation
        </span>
        <p className="text-xs text-slate-600 leading-relaxed">
          {profile.bio}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-50">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
            Languages
          </span>
          <span className="text-xs font-bold text-slate-700 line-clamp-1">
            {Array.isArray(profile.languages) ? profile.languages.join(", ") : ""}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
            Day Rate
          </span>
          <span className="text-xs font-extrabold text-slate-900">
            ${profile.rate} / day
          </span>
        </div>
      </div>

      {/* Read-only application stats — completed trips + verification, set by the system/admin */}
      <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-50">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
            Completed Trips
          </span>
          <span className="text-xs font-extrabold text-slate-900">
            {profile.completedTrips}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
            Verification
          </span>
          <span
            className={`text-xs font-extrabold inline-flex items-center gap-1 ${
              profile.verified ? "text-green-600" : "text-slate-400"
            }`}
          >
            <CheckCircle className="w-3 h-3" />{" "}
            {profile.verified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;