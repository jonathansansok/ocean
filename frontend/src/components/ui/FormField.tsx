import { cn } from "../../lib/cn"

type Props = {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export default function FormField({ label, hint, error, children }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-200">{label}</div>
        {hint ? <div className="helper">{hint}</div> : null}
      </div>
      {children}
      {error ? <div className={cn("error")}>{error}</div> : null}
    </div>
  )
}
