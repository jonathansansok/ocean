import { cn } from "../../lib/cn"

export default function StatusBadge({ status }: { status: "saved" | "closed" }) {
  const klass =
    status === "closed" ? "badge badge-green" : "badge badge-yellow"

  const label = status === "closed" ? "Closed" : "Saved"

  return <span className={cn(klass)}>{label}</span>
}
