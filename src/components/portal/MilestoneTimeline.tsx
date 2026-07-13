import { MilestoneRow, type MilestoneRowData } from "./MilestoneRow";

interface MilestoneTimelineProps {
  milestones: MilestoneRowData[];
  claimingId: string | null;
  onClaim: (milestoneId: string) => void;
}

export function MilestoneTimeline({ milestones, claimingId, onClaim }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <p className="text-[12px] text-gray-400 text-center py-12">
        Your milestones journey will appear here once set up by the team.
      </p>
    );
  }

  return (
    <div>
      {milestones.map((m, i) => (
        <MilestoneRow
          key={m.id}
          milestone={m}
          order={i + 1}
          isLast={i === milestones.length - 1}
          claiming={claimingId === m.id}
          onClaim={onClaim}
        />
      ))}
    </div>
  );
}
