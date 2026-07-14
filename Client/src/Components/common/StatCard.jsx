import React from "react";
import Card from "./Card.jsx";

export default function StatCard({ title, value, trend, icon: Icon }) {
  const trendIsPositive = trend && trend.startsWith("+");
  const trendColor = trendIsPositive
    ? "text-status-success-dark"
    : "text-status-danger-dark";

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-ink-500">{title}</p>
          <p className="text-2xl font-bold text-ink-900">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-brand-50 rounded-lg">
            <Icon className="w-5 h-5 text-brand-500" strokeWidth={2} />
          </div>
        )}
      </div>
      {trend && (
        <p className={`text-xs mt-2 font-semibold ${trendColor}`}>{trend}</p>
      )}
    </Card>
  );
}
