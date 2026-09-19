import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export function Field({ label, error, className = "", id, ...props }: FieldProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex flex-col gap-2" htmlFor={fieldId}>
      <span className="text-[11px] font-medium tracking-[0.06em] text-muted uppercase">
        {label}
      </span>
      <input
        id={fieldId}
        className={`h-11 rounded-[6px] border border-border bg-input px-3.5 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted/60 focus:border-accent/60 focus:shadow-[0_0_0_3px_var(--accent-dim)] ${
          error ? "border-danger/50" : ""
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-[12px] text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
