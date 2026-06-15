export function ModelBadge({ label }: { label?: string | null }) {
  return <span className="jl-badge jl-badge-muted">{label || "Platform model"}</span>;
}
