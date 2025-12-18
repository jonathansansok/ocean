import type React from "react";
import { cn } from "../../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "icon" | "iconSm";
  loading?: boolean;
};

export default function Button({
  className,
  variant = "secondary",
  size = "md",
  loading,
  disabled,
  type,
  ...props
}: Props) {
  console.log("[Button] render", { variant, size, loading, disabled, type });

  const base =
    "inline-flex select-none items-center justify-center gap-2 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] [font-feature-settings:'ss01']";

  const shape =
    "rounded-xl border backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]";

  const motion = "hover:-translate-y-[1px] active:translate-y-0";

  const variants: Record<string, string> = {
    secondary:
      "bg-slate-900/40 border-slate-700/60 text-slate-100 hover:bg-slate-900/60",
    ghost:
      "bg-transparent border-slate-800/70 text-slate-100 hover:bg-slate-900/40",

    primary:
      "bg-emerald-500/15 border-emerald-400/25 text-emerald-200 hover:bg-emerald-500/22 shadow-[0_10px_28px_rgba(0,0,0,0.35),0_0_0_1px_rgba(16,185,129,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(16,185,129,0.26)]",

    danger:
      "bg-rose-500/15 border-rose-400/25 text-rose-200 hover:bg-rose-500/22 shadow-[0_10px_28px_rgba(0,0,0,0.35),0_0_0_1px_rgba(244,63,94,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(244,63,94,0.26)]",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    iconSm:
      "h-9 w-9 p-0 text-2xl leading-none rounded-full grid place-items-center",
    icon: "h-10 w-10 p-0 text-[26px] leading-none rounded-full grid place-items-center",
  };

  return (
    <button
      type={type ?? "button"}
      className={cn(
        base,
        shape,
        motion,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-pulse">...</span> : null}
      <span className="leading-none">{props.children}</span>
    </button>
  );
}
