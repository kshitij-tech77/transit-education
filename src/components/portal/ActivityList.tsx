import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { ActivityItem } from "./ActivityFeed";

interface ActivityListProps {
  items: ActivityItem[];
}

// Deliberately a separate component from ActivityFeed rather than a
// "variant" prop on it. ActivityFeed is already used in five sidebars as-is;
// this full-page view needs bigger rows, an inline status label, and no
// "View All" link/header, which would mean threading several conditional
// className branches through a component with other real call sites. A
// dedicated ~30-line component is clearer than variant-driven branching for
// a "compact vs full" difference this small.
export function ActivityList({ items }: ActivityListProps) {
  if (items.length === 0) {
    return <p className="text-[13px] text-gray-400 text-center py-16">No activity yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              item.type === "EARN" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            }`}>
              {item.type === "EARN" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#111] truncate">{item.title}</p>
              <p className="text-[11px] text-gray-400">
                {new Date(item.timestamp).toLocaleDateString()}
                {item.status && item.status !== "FULFILLED" ? ` · ${item.status}` : ""}
              </p>
            </div>
          </div>
          <span className={`text-[13px] font-bold shrink-0 ${item.type === "EARN" ? "text-green-600" : "text-red-500"}`}>
            {item.points > 0 ? "+" : ""}{item.points}
          </span>
        </div>
      ))}
    </div>
  );
}
