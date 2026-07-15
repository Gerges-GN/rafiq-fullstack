import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Inbox, LogIn, Clock } from "lucide-react";
import { bookingApi, tripApi } from "../../services/Touristapi";
import { getCurrentTouristId } from "../../utils/currentTourest";
import DealDetailsModal from "../../Components/Tourist/DealDetailsModal";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-600",
  Confirmed: "bg-blue-50 text-blue-600",
  Completed: "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-rose-50 text-rose-600",
};

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${style}`}
    >
      {status}
    </span>
  );
}

function DealRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/60 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-100 rounded" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="h-4 w-24 bg-slate-100 rounded hidden sm:block" />
      <div className="h-6 w-20 bg-slate-100 rounded-full" />
      <div className="h-9 w-28 bg-slate-100 rounded-xl" />
    </div>
  );
}

// Row redesign: was flex-row-with-many-shrink-0-children fighting each
// other for space (name/trip title could get squeezed out entirely on
// mid-size screens, and duration/status/button had no consistent
// baseline). Now it's two clear zones — an identity block that's free
// to truncate, and a fixed-width meta cluster — so nothing collapses
// unpredictably, and it picks up the same orange/slate visual language
// as the rest of the app (TripCard) instead of the earlier gray/blue mix.
function DealRow({ deal, index, onOpenDetails }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-slate-200/60 bg-white hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <img
          src={deal.tourguideimg}
          alt={deal.tourGuideName}
          className="w-14 h-14 rounded-full object-cover border border-orange-100 shrink-0"
        />
        <div className="min-w-0">
          <p className="font-extrabold text-slate-900 truncate">
            {deal.tourGuideName}
          </p>
          <p className="flex items-center gap-1 text-xs font-semibold text-slate-400 truncate mt-0.5">
            <MapPin size={13} className="shrink-0" />
            {deal.tripTitle}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 mt-1">
            <Clock size={13} />
            {deal.duration}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start justify-between sm:justify-end gap-3 shrink-0">
        <StatusBadge status={deal.status} />
        <button
          onClick={() => onOpenDetails(deal)}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}

export default function MyDeals() {
  const [status, setStatus] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);

  const touristId = getCurrentTouristId();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-deals", touristId],
    queryFn: () => bookingApi.getByTourist(touristId),
    enabled: !!touristId,
  });

  // Deals only store a snapshot of the trip (title, duration). The
  // modal needs the full trip — images, location, full description —
  // so we pull the trip list once, the same way loadAll does, and
  // match by tripId when a row is opened.
  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: tripApi.getAll,
    enabled: !!touristId,
  });

  const deals = useMemo(() => {
    const all = data || [];
    return all.filter((deal) => {
      if (status !== "All" && deal.status !== status) return false;
      if (from && new Date(deal.createdAt) < new Date(from)) return false;
      if (to && new Date(deal.createdAt) > new Date(to)) return false;
      return true;
    });
  }, [data, status, from, to]);

  const selectedTrip = useMemo(() => {
    if (!selectedDeal || !trips) return null;
    return trips.find((t) => t._id === selectedDeal.tripId) || null;
  }, [selectedDeal, trips]);

  if (!touristId) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <LogIn size={32} className="text-slate-300" />
          <p className="text-slate-900 font-bold">Sign in to see your deals</p>
          <p className="text-slate-400 text-sm max-w-xs">
            We couldn't find a signed-in session, so there's nothing to show
            yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          My Deals ({deals.length})
        </h1>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-orange-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <DealRowSkeleton key={i} />)}

        {isError && (
          <div className="text-center py-16 text-rose-500 text-sm">
            {error?.message || "Something went wrong loading your deals."}
          </div>
        )}

        {!isLoading && !isError && deals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Inbox size={32} className="text-slate-300" />
            <p className="text-slate-900 font-bold">No deals yet</p>
            <p className="text-slate-400 text-sm max-w-xs">
              Once you book a trip with a tour guide, it'll show up here.
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          deals.map((deal, i) => (
            <DealRow
              key={deal._id}
              deal={deal}
              index={i}
              onOpenDetails={setSelectedDeal}
            />
          ))}
      </div>

      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          trip={selectedTrip}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
