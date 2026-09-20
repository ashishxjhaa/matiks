import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
  /** Show wordmark next to the mark. Default true. */
  withWordmark?: boolean;
};

export function Logo({
  className = "",
  href = "/",
  withWordmark = true,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <Image
        src="/matiks-logo.svg"
        alt="Matiks"
        width={28}
        height={28}
        priority
        className="h-7 w-7 shrink-0"
      />
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-[-0.022em] text-foreground transition-colors group-hover:text-muted-strong">
          Matiks
        </span>
      )}
    </Link>
  );
}
