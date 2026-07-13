import { Compass } from "lucide-react";
import { MilestoneRow, type MilestoneRowData } from "./MilestoneRow";
import { EmptyState } from "./EmptyState";

interface MilestoneTimelineProps {
  milestones: MilestoneRowData[];
  claimingId: string | null;
  onClaim: (milestoneId: string) => void;
}

export function MilestoneTimeline({ milestones, claimingId, onClaim }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="Your journey begins soon"
        subtitle="Milestones will appear here as your study abroad journey progresses."
      />
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
