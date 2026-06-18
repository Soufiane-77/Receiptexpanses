import Link from "next/link";
import Logo from "./Logo";

const COLS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/create", label: "Create a receipt" },
      { href: "/receipts", label: "Receipt types" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/blogs", label: "Blog" },
      { href: "/faq", label: "FAQ" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund", label: "Refunds" },
      { href: "/cookies", label: "Cookies" },
      { href: "/admin", label: "Admin" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="group inline-block">
            <Logo size="sm" />
          </span>
          <p className="mt-2 text-sm text-slate-500">
            A private online receipt maker. Everything runs in your browser.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-sm font-semibold text-slate-900">{col.heading}</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-500">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-slate-900">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        For generating receipts for your own business or records. © {new Date().getFullYear()}{" "}
        ReceiptExpenses.
      </div>
    </footer>
  );
}
