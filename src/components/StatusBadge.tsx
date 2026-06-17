import type { Status } from "@/lib/mock-data";

const map: Record<Status, { label: string; cls: string; dot: string }> = {
  green:  { label: "Acima da meta", cls: "bg-success/10 text-success border-success/30", dot: "bg-success" },
  yellow: { label: "Em risco",      cls: "bg-warning/15 text-warning-foreground border-warning/40", dot: "bg-warning" },
  red:    { label: "Abaixo da meta", cls: "bg-danger/10 text-danger border-danger/30", dot: "bg-danger" },
};

export function StatusBadge({ status, compact = false }: { status: Status; compact?: boolean }) {
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {!compact && s.label}
    </span>
  );
}
