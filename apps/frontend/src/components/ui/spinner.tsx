export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-4 w-4 rounded-full border border-border-strong border-t-accent animate-spin-slow ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="atmosphere flex min-h-screen items-center justify-center">
      <Spinner className="h-5 w-5" />
    </div>
  );
}
