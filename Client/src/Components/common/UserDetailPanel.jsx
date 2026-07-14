import React from "react";
import { X, CheckCircle, XCircle, Trash2 } from "lucide-react";
import Avatar from "./Avatar.jsx";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function UserDetailPanel({
  user,
  onClose,
  onAccept,
  onSuspend,
  onDelete,
}) {
  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
      <div className="p-5 border-b border-surface-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-ink-900">User Details</h2>
        <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatarUrl} alt={user.ownerName} size="lg" />
          <div>
            <h3 className="text-xl font-bold text-ink-900">{user.ownerName}</h3>
            <p className="text-ink-500">{user.location}</p>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-ink-500">Status</span>
              <Badge
                label={
                  user.status
                    ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                    : ""
                }
              />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Joined Date</span>
              <span className="font-medium text-ink-700">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-6 border-t border-surface-border">
        <h3 className="text-md font-semibold text-ink-900 mb-4">Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {user.status !== "active" && (
            <Button
              variant="primary"
              icon={<CheckCircle size={16} />}
              onClick={onAccept}
            >
              Accept User
            </Button>
          )}
          {user.status !== "suspicious" && (
            <Button
              variant="outline"
              icon={<XCircle size={16} />}
              onClick={onSuspend}
            >
              Suspend User
            </Button>
          )}
        </div>
        <Button
          variant="danger"
          icon={<Trash2 size={16} />}
          className="w-full mt-3"
          onClick={onDelete}
        >
          Delete User
        </Button>
      </div>
    </div>
  );
}
