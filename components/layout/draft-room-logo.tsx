import { cn } from "@/lib/utils";

export function DraftRoomLogo({
  className,
  withWordmark = false
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 64 64"
        aria-label="Draft Room logo"
        className="h-11 w-11 overflow-hidden rounded-[18px]"
        role="img"
      >
        <rect width="64" height="64" rx="16" fill="#0F4C81" />
        <path d="M18 15h24l6 6v28H18V15Z" fill="#FFFFFF" />
        <path d="M42 15v8h8" fill="#FF6A00" />
        <path d="M24 24h16" stroke="#0F4C81" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 31h16" stroke="#0F4C81" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 38h12" stroke="#0F4C81" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {withWordmark ? (
        <div>
          <p className="text-base font-bold tracking-tight text-ink">Draft Room</p>
          <p className="text-xs text-ink-muted">Songwriter workspace</p>
        </div>
      ) : null}
    </div>
  );
}
