import Link from "next/link";
import type { ReactNode } from "react";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: LinkButtonProps) {
  const variants = {
    primary:
      "bg-accent text-black hover:bg-[#c4ff7a] active:bg-[#a3e855]",
    secondary:
      "border border-border-strong bg-transparent text-foreground hover:border-muted-strong hover:bg-white/[0.03]",
    ghost: "bg-transparent text-muted hover:text-foreground",
  };
  const sizes = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-10 px-4 text-[13px]",
    lg: "h-11 px-5 text-sm",
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-medium tracking-[-0.022em] transition-[background-color,border-color,color] duration-150 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
