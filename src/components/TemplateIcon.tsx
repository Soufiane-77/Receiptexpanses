import type { ComponentType, SVGProps } from "react";
import {
  ShoppingBagIcon,
  UtensilsIcon,
  PrinterIcon,
  FuelIcon,
  CarIcon,
  ParkingIcon,
  ReceiptIcon,
  CoffeeIcon,
  CartIcon,
  BedIcon,
  BriefcaseIcon,
  HomeIcon,
  StoreIcon,
  PillIcon,
  MonitorIcon,
  PackageIcon,
  AirbnbLogoIcon,
  WalmartLogoIcon,
  AmazonLogoIcon,
  UberLogoIcon,
  StarbucksLogoIcon,
} from "./icons";

const MAP: Record<string, ComponentType<SVGProps<SVGSVGElement> & { className?: string }>> = {
  generic: ShoppingBagIcon,
  service: BriefcaseIcon,
  restaurant: UtensilsIcon,
  cafe: CoffeeIcon,
  thermal: PrinterIcon,
  grocery: CartIcon,
  fuel: FuelIcon,
  taxi: CarIcon,
  parking: ParkingIcon,
  hotel: BedIcon,
  "vacation-rental": HomeIcon,
  bigbox: StoreIcon,
  pharmacy: PillIcon,
  electronics: MonitorIcon,
  marketplace: PackageIcon,
  airbnb: AirbnbLogoIcon,
  walmart: WalmartLogoIcon,
  amazon: AmazonLogoIcon,
  uber: UberLogoIcon,
  starbucks: StarbucksLogoIcon,
};

/** Renders the SVG icon registered for a template id (falls back to a receipt). */
export default function TemplateIcon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const Icon = MAP[id] ?? ReceiptIcon;
  return <Icon className={className} />;
}
