import type { SVGProps } from "react";

/**
 * Brand mark: a gradient rounded tile holding a receipt with an upward
 * expense-trend line — "receipt" + "expenses" in one glyph.
 */
export function LogoMark({ className = "h-8 w-8", ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="ReceiptExpenses"
      {...rest}
    >
      <defs>
        <linearGradient id="re-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#re-logo-grad)" />
      {/* receipt body with torn bottom edge */}
      <path
        d="M9 7h13a1 1 0 0 1 1 1v16l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3V8a1 1 0 0 1 1-1z"
        fill="#ffffff"
      />
      {/* item lines */}
      <rect x="11.3" y="10.4" width="8.4" height="1.5" rx="0.75" fill="#c7d2fe" />
      <rect x="11.3" y="13.3" width="8.4" height="1.5" rx="0.75" fill="#c7d2fe" />
      {/* upward expense-trend line + arrowhead */}
      <path
        d="M11.6 20.2 14.2 17.4 16.2 19.2 19.8 15"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6 15h2.4v2.4"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SIZES = {
  sm: { mark: "h-7 w-7", text: "text-base" },
  md: { mark: "h-8 w-8", text: "text-xl" },
  lg: { mark: "h-10 w-10", text: "text-2xl" },
} as const;

/**
 * Full logo lockup: animated mark + two-tone wordmark. Presentational only —
 * wrap in a <Link> at the call site. Add `group` to the link for the hover lift.
 */
export default function Logo({
  size = "md",
  withWordmark = true,
}: {
  size?: keyof typeof SIZES;
  withWordmark?: boolean;
}) {
  const s = SIZES[size];
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark
        className={`${s.mark} drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
      />
      {withWordmark ? (
        <span className={`font-display font-bold tracking-tight ${s.text}`}>
          <span className="text-slate-900">Receipt</span>
          <span className="text-brand-600">Expenses</span>
        </span>
      ) : null}
    </span>
  );
}
