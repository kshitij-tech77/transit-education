import { Check, Flag, MoreVertical, Loader2 } from "lucide-react";

export interface MilestoneRowData {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  points: number;
  status: "APPROVED" | "PENDING" | "REJECTED" | "NOT_STARTED";
}

interface MilestoneRowProps {
  milestone: MilestoneRowData;
  order: number;
  isLast: boolean;
  claiming: boolean;
  onClaim: (milestoneId: string) => void;
}

// PENDING here means a claim was already submitted and is awaiting staff
// review — the screenshot's "In Progress" state. It's a distinct state from
// NOT_STARTED/REJECTED ("Pending" — nothing submitted yet).
const STATUS_LABEL: Record<MilestoneRowData["status"], string> = {
  APPROVED: "Completed",
  PENDING: "In Progress",
  REJECTED: "Pending",
  NOT_STARTED: "Pending",
};

const PILL_CLS: Record<MilestoneRowData["status"], string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-brand-surface text-brand",
  REJECTED: "bg-gray-100 text-gray-500",
  NOT_STARTED: "bg-gray-100 text-gray-500",
};

const CIRCLE_CLS: Record<MilestoneRowData["status"], string> = {
  APPROVED: "bg-green-100 text-green-700 border-2 border-green-200",
  PENDING: "bg-white text-brand border-2 border-dashed border-brand",
  REJECTED: "bg-gray-100 text-gray-400 border-2 border-gray-200",
  NOT_STARTED: "bg-gray-100 text-gray-400 border-2 border-gray-200",
};

const CONNECTOR_CLS: Record<MilestoneRowData["status"], string> = {
  APPROVED: "border-solid border-green-300",
  PENDING: "border-dashed border-brand",
  REJECTED: "border-solid border-gray-200",
  NOT_STARTED: "border-solid border-gray-200",
};

// "Mark as Completed" only makes sense when nothing is currently submitted.
// PENDING means a claim is already awaiting staff review — showing the
// button there would just hit the claim endpoint's duplicate-active-claim
// guard (409 "Already claimed"), so it's intentionally hidden for that state
// even though it reads similarly to "not yet done" at a glance.
const CAN_CLAIM: Record<MilestoneRowData["status"], boolean> = {
  APPROVED: false,
  PENDING: false,
  REJECTED: true,
  NOT_STARTED: true,
};

export function MilestoneRow({ milestone, order, isLast, claiming, onClaim }: MilestoneRowProps) {
  const { id, title, description, icon, points, status } = milestone;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-[15px] shrink-0 ${CIRCLE_CLS[status]}`}>
          {icon || <Flag size={15} />}
          {status === "APPROVED" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center">
              <Check size={10} />
            </span>
          )}
        </div>
        {!isLast && <div className={`w-0 flex-1 min-h-[32px] border-l-2 ${CONNECTOR_CLS[status]}`} />}
      </div>

      <div className="flex-1 min-w-0 pb-7">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold text-[#111]">{order}. {title}</p>
            {description && <p className="text-[12px] text-gray-400 mt-0.5">{description}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10.5px] font-bold bg-brand-surface text-brand px-2.5 py-1 rounded-full whitespace-nowrap">+{points} Points</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${PILL_CLS[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            <button className="text-gray-300 hover:text-gray-500 transition-colors" aria-label="More options">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {CAN_CLAIM[status] && (
          <button
            onClick={() => onClaim(id)}
            disabled={claiming}
            className="mt-2.5 text-[11.5px] font-bold bg-brand text-white px-3.5 py-1.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            {claiming ? <Loader2 className="animate-spin" size={12} /> : "Mark as Completed"}
          </button>
        )}
      </div>
    </div>
  );
}
