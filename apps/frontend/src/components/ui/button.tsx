import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-black hover:bg-[#c4ff7a] active:bg-[#a3e855] disabled:bg-accent/40",
  secondary:
    "border border-border-strong bg-transparent text-foreground hover:border-muted-strong hover:bg-white/[0.03] active:bg-white/[0.05]",
  ghost:
    "bg-transparent text-muted hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[13px]",
  lg: "h-11 px-5 text-sm",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-medium tracking-[-0.022em] transition-[background-color,border-color,color,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
