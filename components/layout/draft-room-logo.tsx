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
        className="h-11 w-11 overflow-hidden rounded-2xl border border-line shadow-soft"
        role="img"
      >
        <rect width="64" height="64" rx="16" fill="#FAF7F2" />
        <path d="M43 8h9a4 4 0 0 1 4 4v9L43 8Z" fill="#5B4B8A" opacity="0.18" />
        <path d="M16 16h28l4 4v28H16V16Z" fill="none" stroke="#5B4B8A" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M43 16v8h8" fill="none" stroke="#5B4B8A" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M23 23v18" stroke="#5B4B8A" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M23 23h8.5c5.1 0 8.5 3 8.5 8s-3.4 8-8.5 8H23" fill="none" stroke="#5B4B8A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 41V23h6.2c4.7 0 7.8 2.7 7.8 6.9 0 3.1-1.7 5.3-4.6 6.3L45 41" fill="none" stroke="#5B4B8A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 47h22" stroke="#5B4B8A" strokeWidth="1.3" opacity="0.32" strokeLinecap="round" />
        <path d="M21 50.5h22" stroke="#5B4B8A" strokeWidth="1.3" opacity="0.32" strokeLinecap="round" />
        <path d="M21 54h22" stroke="#5B4B8A" strokeWidth="1.3" opacity="0.32" strokeLinecap="round" />
        <circle cx="18" cy="18" r="0.4" fill="#5B4B8A" opacity="0.08" />
        <circle cx="28" cy="14" r="0.4" fill="#5B4B8A" opacity="0.08" />
        <circle cx="38" cy="18" r="0.4" fill="#5B4B8A" opacity="0.08" />
        <circle cx="46" cy="28" r="0.4" fill="#5B4B8A" opacity="0.08" />
        <circle cx="19" cy="33" r="0.4" fill="#5B4B8A" opacity="0.08" />
        <circle cx="46" cy="44" r="0.4" fill="#5B4B8A" opacity="0.08" />
      </svg>
      {withWordmark ? (
        <div>
          <p className="text-base font-semibold tracking-tight text-ink">Draft Room</p>
          <p className="text-xs text-ink-soft">Songwriter Archive</p>
        </div>
      ) : null}
    </div>
  );
}
