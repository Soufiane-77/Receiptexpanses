"use client";

import type { ReactNode } from "react";

/**
 * Admin UI primitives — a small Polaris-inspired system so every admin screen
 * shares one visual language (Shopify-admin look: neutral canvas, white cards,
 * hairline borders, restrained type scale).
 *
 * Tokens (kept literal here so the marketing-site theme can evolve separately):
 *   canvas   #f1f1f1   surface  #ffffff   border #e3e3e3
 *   text     #303030   subdued  #616161
 */

export const ADMIN_TOKENS = {
  canvas: "#f1f1f1",
  surface: "#ffffff",
  border: "#e3e3e3",
  text: "#303030",
  subdued: "#616161",
  topbar: "#1a1a1a",
} as const;

/* ---------------------------------- Card --------------------------------- */

export function Card({
  title,
  description,
  actions,
  padding = true,
  children,
  className = "",
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  padding?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[#e3e3e3] bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.04)] ${className}`}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#ebebeb] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#303030]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-[#616161]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={padding ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/* ------------------------------- Page header ------------------------------ */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-[#303030]">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#616161]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* -------------------------------- Stat tile ------------------------------- */

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e3e3e3] bg-white p-4 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
      <div className="text-[13px] font-medium text-[#616161]">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-[#303030]">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-[#8a8a8a]">{hint}</div> : null}
    </div>
  );
}

/* ---------------------------------- Badge --------------------------------- */

type Tone = "neutral" | "success" | "info" | "warning" | "critical";

const TONE: Record<Tone, string> = {
  neutral: "bg-[#f1f1f1] text-[#4a4a4a]",
  success: "bg-[#e0f5ed] text-[#0c5c43]",
  info: "bg-[#e6effd] text-[#1f3d7a]",
  warning: "bg-[#fdf0d9] text-[#7a5a12]",
  critical: "bg-[#fdeaea] text-[#8e1f1f]",
};

/** Status pill. Always carries a text label — never colour alone. */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}

/* --------------------------------- Banner --------------------------------- */

const BANNER: Record<Tone, string> = {
  neutral: "border-[#e3e3e3] bg-[#fafafa] text-[#4a4a4a]",
  success: "border-[#a7ddc8] bg-[#f0faf6] text-[#0c5c43]",
  info: "border-[#b9cdf5] bg-[#f2f6fe] text-[#1f3d7a]",
  warning: "border-[#f0d08a] bg-[#fdf8ef] text-[#7a5a12]",
  critical: "border-[#f2b3b3] bg-[#fdf4f4] text-[#8e1f1f]",
};

export function Banner({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${BANNER[tone]}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-1" : ""}>{children}</div> : null}
    </div>
  );
}

/* ---------------------------------- Table --------------------------------- */

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#ebebeb] bg-[#fafafa]">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#616161]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f0f0]">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  strong,
  numeric,
  className = "",
}: {
  children: ReactNode;
  strong?: boolean;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-5 py-3 align-middle ${
        strong ? "font-medium text-[#303030]" : "text-[#616161]"
      } ${numeric ? "tabular-nums" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-[#fafafa]">{children}</tr>;
}

/* ------------------------------- Empty state ------------------------------ */

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-sm font-semibold text-[#303030]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm text-[#616161]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* --------------------------------- Buttons -------------------------------- */

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "default" | "critical";
  type?: "button" | "submit";
  size?: "sm" | "md";
  className?: string;
};

const BTN_TONE = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]",
  default:
    "bg-white text-[#303030] border border-[#c9c9c9] hover:bg-[#fafafa] disabled:text-[#a0a0a0] shadow-[0_1px_0_0_rgba(0,0,0,0.04)]",
  critical: "bg-[#c9231f] text-white hover:bg-[#a81c19] disabled:bg-[#e08e8c]",
} as const;

/** Admin button — 44px min height at md so it clears the touch-target rule. */
export function AdminButton({
  children,
  onClick,
  disabled,
  tone = "default",
  type = "button",
  size = "md",
  className = "",
}: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
        size === "sm" ? "px-3 py-1.5 text-[13px]" : "min-h-[36px] px-4 py-2 text-sm"
      } ${BTN_TONE[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Field --------------------------------- */

export const adminInputCls =
  "w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm text-[#303030] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#a0a0a0] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function AdminField({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-[#303030]">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-[#616161]">{hint}</p> : null}
    </div>
  );
}
