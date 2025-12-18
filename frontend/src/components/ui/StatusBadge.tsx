import { cn } from "../../lib/cn"

export default function StatusBadge({ status }: { status: "saved" | "closed" }) {
  console.log("[StatusBadge] render", { status })

  const label = status === "closed" ? "Closed" : "Saved"

  const klass = cn(
    "badge",
    status === "closed" ? "badge-green" : "badge-yellow"
  )

  return <span className={klass}>{label}</span>
}
