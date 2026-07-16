import React from "react";
import { Briefcase, Calendar } from "lucide-react";

const BookingRequests = ({ bookings, onUpdateStatus }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
        Client Booking Requests
      </h3>
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <p className="text-xs font-semibold text-slate-400 py-2">
            No incoming booking requests found.
          </p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 ${
                booking.status === "Confirmed"
                  ? "bg-green-50/40 border-green-100"
                  : booking.status === "Cancelled"
                    ? "bg-red-50/40 border-red-100"
                    : "bg-slate-50/40 border-slate-100"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {booking.touristName}
                  </span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      booking.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "Cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {booking.status || "Pending"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-1 inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Destination:{" "}
                  <span className="text-slate-600 font-bold">
                    {booking.tripTitle || "Custom Itinerary"}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date: {booking.date} (
                  {booking.duration})
                </p>
              </div>

              {(!booking.status || booking.status === "Pending") && (
                <div className="flex items-center gap-2 sm:self-center self-end">
                  <button
                    onClick={() => onUpdateStatus(booking._id, "Rejected")}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking._id, "Confirmed")}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-sm transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingRequests;