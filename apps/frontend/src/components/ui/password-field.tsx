"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  error?: string | null;
};

export function PasswordField({
  label = "Password",
  error,
  className = "",
  id,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? props.name ?? "password";

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="text-[11px] font-medium tracking-[0.06em] text-muted uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={`h-11 w-full rounded-control border border-border bg-input py-0 pr-12 pl-3.5 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted/60 focus:border-accent/60 focus:shadow-[0_0_0_3px_var(--accent-dim)] ${
            error ? "border-danger/50" : ""
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded px-1.5 py-1 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <span className="text-[12px] text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
