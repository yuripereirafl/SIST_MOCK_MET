import type { Status } from "@/lib/mock-data";

export function ProgressBar({ value, status = "green", className = "" }: { value: number; status?: Status; className?: string }) {
  const colorVar =
    status === "green" ? "var(--color-success)" :
    status === "yellow" ? "var(--color-warning)" :
    "var(--color-danger)";
  return (
    <div className={`h-1.5 w-full rounded-full bg-secondary overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: colorVar }}
      />
    </div>
  );
}
