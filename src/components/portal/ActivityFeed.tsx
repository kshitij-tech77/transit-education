import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Activity as ActivityIcon } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface ActivityItem {
  id: string;
  type: "EARN" | "REDEEM";
  title: string;
  points: number;
  timestamp: string;
  status: string | null;
  reason_code: string | null;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-gray-800">Recent Activity</p>
        <Link href="/portal/activity" className="text-[11px] font-semibold text-brand hover:underline">View All</Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          subtitle="Your points history will show up here as you earn and redeem."
        />
      ) : (
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  item.type === "EARN" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  {item.type === "EARN" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-[#111] truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-[11px] font-bold shrink-0 ${item.type === "EARN" ? "text-green-600" : "text-red-500"}`}>
                {item.points > 0 ? "+" : ""}{item.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
