import { cn } from "../../lib/cn"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md"
  loading?: boolean
}

export default function Button({
  className,
  variant = "secondary",
  size = "md",
  loading,
  disabled,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"

  const variants: Record<string, string> = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-slate-950",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    danger: "bg-rose-600 hover:bg-rose-500 text-slate-950",
    ghost: "bg-transparent hover:bg-slate-900 text-slate-100 border border-slate-800",
  }

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-pulse">...</span> : null}
      <span>{props.children}</span>
    </button>
  )
}
