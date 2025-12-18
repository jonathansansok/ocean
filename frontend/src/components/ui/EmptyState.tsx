import type React from "react"
import Button from "./Button"

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  console.log("[EmptyState] render", { title, hasDescription: !!description, hasAction: !!actionLabel })

  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-7 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-300" fill="none" aria-hidden="true">
          <path
            d="M12 8v5m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-base font-black">{title}</div>

      {description ? (
        <div className="mt-1 text-sm text-slate-400">{description}</div>
      ) : null}

      {actionLabel && onAction ? (
        <div className="mt-4 flex justify-center">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
