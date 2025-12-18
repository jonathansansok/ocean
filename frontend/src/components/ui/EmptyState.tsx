export default function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center">
      <div className="text-base font-semibold">{title}</div>
      {description ? <div className="mt-1 text-sm text-slate-400">{description}</div> : null}
    </div>
  )
}
