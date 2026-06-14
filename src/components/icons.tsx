import type { SVGProps } from "react";

/**
 * Lucide-style stroke icons (24×24, currentColor). Replaces emoji-as-icon usage
 * per the UI/UX pre-delivery checklist. Decorative only → aria-hidden.
 */
type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Base({ className = "h-5 w-5", children, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const DownloadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </Base>
);

export const PrinterIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </Base>
);

export const ImageIcon = (p: IconProps) => (
  <Base {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Base>
);

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </Base>
);

export const ChevronUpIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m18 15-6-6-6 6" />
  </Base>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const XIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);

export const SaveIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </Base>
);

export const SparklesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 15l.7 1.9L21.5 18l-1.8.6L19 21l-.7-2.4L16.5 18l1.8-1.1z" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Base>
);

export const ReceiptIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <path d="M16 8H8" />
    <path d="M16 12H8" />
    <path d="M13 16H8" />
  </Base>
);

export const UserIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Base>
);

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Base>
);

export const LogOutIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Base>
);

export const SlidersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 21v-7" />
    <path d="M4 10V3" />
    <path d="M12 21v-9" />
    <path d="M12 8V3" />
    <path d="M20 21v-5" />
    <path d="M20 12V3" />
    <path d="M2 14h4" />
    <path d="M10 8h4" />
    <path d="M18 16h4" />
  </Base>
);

// --- template-specific icons ---

export const ShoppingBagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Base>
);

export const UtensilsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2" />
    <path d="M5 11v11" />
    <path d="M19 2v20" />
    <path d="M19 12c2 0 3-1.5 3-4s-1-6-3-6" />
  </Base>
);

export const FuelIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 22h12" />
    <path d="M4 9h10" />
    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
  </Base>
);

export const CarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </Base>
);

export const ParkingIcon = (p: IconProps) => (
  <Base {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </Base>
);

export const AlertTriangleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Base>
);

export const FileSearchIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <circle cx="16.5" cy="17.5" r="2.5" />
    <path d="m22 22-1.4-1.4" />
  </Base>
);

export const BarcodeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 5v14" />
    <path d="M8 5v14" />
    <path d="M12 5v14" />
    <path d="M17 5v14" />
    <path d="M21 5v14" />
  </Base>
);

export const CoffeeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 2v2" />
    <path d="M14 2v2" />
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z" />
    <path d="M16 8h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2" />
    <path d="M6 2v2" />
  </Base>
);

export const CartIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </Base>
);

export const BedIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </Base>
);

export const BriefcaseIcon = (p: IconProps) => (
  <Base {...p}>
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Base>
);

export const ZapIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </Base>
);

export const EyeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.94 10.94 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.94 10.94 0 0 1-19.88 0" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
  </Base>
);

export const StoreIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
  </Base>
);

export const PillIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </Base>
);

export const MonitorIcon = (p: IconProps) => (
  <Base {...p}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </Base>
);

export const PackageIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="m7.5 4.27 9 5.15" />
  </Base>
);

export const AirbnbLogoIcon = ({ className = "h-5 w-5", ...p }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 32 32"
    fill="currentColor"
    className={`${className} text-[#FF5A5F]`}
    {...p}
  >
    <path d="M16 1c-2 0-3.7 1.1-4.6 2.8L2.7 20c-.9 1.6-.9 3.6 0 5.2.9 1.6 2.6 2.8 4.6 2.8h17.4c2 0 3.7-1.1 4.6-2.8.9-1.6.9-3.6 0-5.2L20.6 3.8C19.7 2.1 18 1 16 1zm0 4c1 0 1.9.5 2.4 1.3l8.7 16.2c.4.8.4 1.8 0 2.6-.4.8-1.3 1.3-2.4 1.3H7.3c-1.1 0-2-.5-2.4-1.3-.4-.8-.4-1.8 0-2.6L13.6 6.3C14.1 5.5 15 5 16 5zm0 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 2.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z" />
  </svg>
);

export const WalmartLogoIcon = ({ className = "h-5 w-5", ...p }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className}`}
    {...p}
  >
    <path d="M12 2.5a1 1 0 0 1 1 1V9a1 1 0 0 1-2 0V3.5a1 1 0 0 1 1-1zM12 15a1 1 0 0 1 1 1v5.5a1 1 0 0 1-2 0V16a1 1 0 0 1 1-1zM4.77 6.18a1 1 0 0 1 1.41 0L10.8 10.8a1 1 0 0 1-1.41 1.41L4.77 7.59a1 1 0 0 1 0-1.41zM17.82 13.82a1 1 0 0 1 1.41 0l4.62 4.62a1 1 0 0 1-1.41 1.41l-4.62-4.62a1 1 0 0 1 0-1.41zM3.36 17.82a1 1 0 0 1 0-1.41l4.62-4.62a1 1 0 1 1 1.41 1.41l-4.62 4.62a1 1 0 0 1-1.41 0zM17.82 10.18a1 1 0 0 1 0-1.41l4.62-4.62a1 1 0 1 1 1.41 1.41l-4.62 4.62a1 1 0 0 1-1.41 0z" fill="#FFC220" />
  </svg>
);

export const AmazonLogoIcon = ({ className = "h-5 w-5", ...p }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`${className} text-[#FF9900]`}
    {...p}
  >
    <path d="M3 17.5c4.5 2.5 13.5 2.5 18 0-4.5 1.5-13.5 1.5-18 0z" />
    <path d="M19.5 14.5c.2.6.4 1.3.4 2 0 1-.3 1.8-.8 2.5.5-.8 1-1.8 1-2.9 0-.8-.2-1.5-.6-2.1l.6.5z" />
    <path d="M12 4c-3.3 0-6 2.7-6 6 0 2 .8 3.8 2.2 5.1C6.2 13.9 5 11.6 5 9c0-3.9 3.1-7 7-7s7 3.1 7 7c0 2.6-1.2 4.9-3.2 6.1 1.4-1.3 2.2-3.1 2.2-5.1 0-3.3-2.7-6-6-6z" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const UberLogoIcon = ({ className = "h-5 w-5", ...p }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`${className} text-black`}
    {...p}
  >
    <rect width="24" height="24" rx="4" />
    <path d="M6 6h4v6c0 1.1.9 2 2 2s2-.9 2-2V6h4v6c0 3.3-2.7 6-6 6s-6-2.7-6-6V6z" fill="white" />
  </svg>
);

export const StarbucksLogoIcon = ({ className = "h-5 w-5", ...p }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 40 40"
    fill="currentColor"
    className={`${className} text-[#00704A]`}
    {...p}
  >
    <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="20" cy="20" r="15" fill="currentColor" />
    <circle cx="20" cy="18" r="4" fill="white" />
    <path d="M12 28c3-4 6-6 8-6s5 2 8 6" stroke="white" strokeWidth="2" fill="none" />
    <path d="M20 12l1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2-1.5-1.5 2-.5z" fill="white" />
  </svg>
);

