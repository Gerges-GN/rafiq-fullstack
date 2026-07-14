import React from "react";
import {
  X,
  CheckCircle,
  XCircle,
  Star,
  Briefcase,
  Languages,
} from "lucide-react";
import Avatar from "./Avatar.jsx";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function GuideDetailPanel({
  guide,
  onClose,
  onApprove,
  onSuspend,
}) {
  if (!guide) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
      <div className="p-5 border-b border-surface-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-ink-900">Guide Details</h2>
        <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={guide.avatarUrl} alt={guide.name} size="lg" />
          <div>
            <h3 className="text-xl font-bold text-ink-900">{guide.name}</h3>
            <p className="text-ink-500">{guide.location}</p>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-ink-500">Status</span>
              <Badge label={guide.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-500 flex items-center gap-2">
                <Star size={14} /> Rating
              </span>
              <span className="font-medium text-ink-700">
                {guide.rating || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-500 flex items-center gap-2">
                <Briefcase size={14} /> Trips
              </span>
              <span className="font-medium text-ink-700">
                {guide.trips || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-500 flex items-center gap-2">
                <Languages size={14} /> Languages
              </span>
              <span className="font-medium text-ink-700">
                {(guide.languages || []).join(", ")}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-6 border-t border-surface-border">
        <h3 className="text-md font-semibold text-ink-900 mb-4">Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {guide.status !== "Approved" && (
            <Button
              variant="primary"
              icon={<CheckCircle size={16} />}
              onClick={onApprove}
            >
              Approve Guide
            </Button>
          )}
          {guide.status !== "Suspended" && (
            <Button
              variant="outline"
              icon={<XCircle size={16} />}
              onClick={onSuspend}
            >
              Suspend Guide
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
