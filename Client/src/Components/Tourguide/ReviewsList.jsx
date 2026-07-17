import React from "react";
import { Star, MessageSquareText } from "lucide-react";
import { DEFAULT_AVATAR } from "../../services/Guideapi";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ReviewCard = ({ review }) => (
  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/40 space-y-2">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <img
          src={review.reviewerAvatarUrl || DEFAULT_AVATAR}
          alt={review.reviewerName}
          className="w-9 h-9 rounded-full object-cover border border-slate-200"
        />
        <div>
          <p className="text-sm font-bold text-slate-900">
            {review.reviewerName}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {formatDate(review.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-3.5 h-3.5 ${
              n <= review.rating
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
    </div>

    <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
  </div>
);

const ReviewsList = ({ reviews, averageRating = 0, reviewCount = 0 }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-orange-500" />
          Client Reviews
        </h3>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3.5 h-3.5 ${
                    n <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({reviewCount} review{reviewCount === 1 ? "" : "s"})
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {reviewCount === 0 ? (
          <p className="text-xs font-semibold text-slate-400 py-2">
            No reviews yet — they'll show up here once clients start rating your
            trips.
          </p>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
