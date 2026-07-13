import Link from "next/link";
import { Flag, Check, Compass } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface JourneyMilestone {
  id: string;
  title: string;
  icon: string | null;
  points: number;
  status: "APPROVED" | "PENDING" | "REJECTED" | "NOT_STARTED";
}

interface JourneyStepsProps {
  milestones: JourneyMilestone[];
}

const STATUS_LABEL: Record<JourneyMilestone["status"], string> = {
  APPROVED: "Completed",
  PENDING: "In Progress",
  REJECTED: "Pending",
  NOT_STARTED: "Pending",
};

const STATUS_PILL_CLS: Record<JourneyMilestone["status"], string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-brand-surface text-brand",
  REJECTED: "bg-gray-100 text-gray-500",
  NOT_STARTED: "bg-gray-100 text-gray-500",
};

const ICON_CLS: Record<JourneyMilestone["status"], string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-brand-surface text-brand",
  REJECTED: "bg-gray-100 text-gray-400",
  NOT_STARTED: "bg-gray-100 text-gray-400",
};

const CONNECTOR_CLS: Record<JourneyMilestone["status"], string> = {
  APPROVED: "border-solid border-green-400",
  PENDING: "border-dashed border-brand",
  REJECTED: "border-solid border-gray-200",
  NOT_STARTED: "border-solid border-gray-200",
};

export function JourneySteps({ milestones }: JourneyStepsProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-gray-800">My Journey</p>
          <p className="text-sm text-gray-600">Track your progress and earn points at each milestone</p>
        </div>
        <Link href="/portal/milestones" className="text-[11px] font-semibold text-brand hover:underline shrink-0">View All</Link>
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Your journey begins soon"
          subtitle="Milestones will appear here as your study abroad journey progresses."
        />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex items-start min-w-max px-1">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex items-start">
                <div className="flex flex-col items-center w-[104px] shrink-0 text-center">
                  <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-[15px] shrink-0 ${ICON_CLS[m.status]}`}>
                    {m.icon || <Flag size={16} />}
                    {m.status === "APPROVED" && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-[#111] mt-2 leading-tight line-clamp-2">{m.title}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1.5 ${STATUS_PILL_CLS[m.status]}`}>
                    {STATUS_LABEL[m.status]}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{m.points} pts</p>
                </div>
                {i < milestones.length - 1 && (
                  <div className={`mt-[22px] w-8 shrink-0 border-t-2 ${CONNECTOR_CLS[m.status]}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
