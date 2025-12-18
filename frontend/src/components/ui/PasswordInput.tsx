import { useMemo, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "../../lib/cn";

type Props = {
  reg: UseFormRegisterReturn;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
};

export default function PasswordInput({
  reg,
  placeholder,
  autoComplete,
  disabled,
  className,
}: Props) {
  const [show, setShow] = useState(false);

  const type = useMemo(() => (show ? "text" : "password"), [show]);

  console.log("[PasswordInput] render", { name: reg?.name, show, type, disabled });

  return (
    <div className="relative">
      <input
        className={cn("input pr-10", className)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        {...reg}
      />

      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg border border-slate-700/60 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60"
        onClick={() => {
          console.log("[PasswordInput] toggle", { name: reg?.name, from: show, to: !show });
          setShow((s) => !s);
        }}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3l18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10.6 10.6A2.5 2.5 0 0 0 12 14.5c1.38 0 2.5-1.12 2.5-2.5 0-.5-.15-.97-.4-1.36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6.2 6.2C3.9 7.9 2 12 2 12s3.5 7 10 7c2.2 0 4.1-.8 5.7-1.9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9.9 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7s-1.1 2.2-3.2 4.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
