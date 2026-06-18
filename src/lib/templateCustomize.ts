import type { Receipt } from "./types";
import { templateCustomization } from "./adminSettings";

/**
 * Overlay the admin's per-template customization (logo + branding defaults)
 * onto a receipt. Each field falls back to the receipt's own value when the
 * admin hasn't set it, so this is safe to call on any receipt. Template
 * component files are never touched — the logo simply rides in on
 * `business.logoDataUrl`, which every template already renders.
 */
export function applyTemplateCustomization(
  receipt: Receipt,
  templateId: string = receipt.templateId,
): Receipt {
  const c = templateCustomization(templateId);
  return {
    ...receipt,
    accentColor: c.accentColor || receipt.accentColor,
    footerNote: c.footerNote || receipt.footerNote,
    showFooter: c.footerNote ? true : receipt.showFooter,
    business: {
      ...receipt.business,
      name: c.businessName || receipt.business.name,
      address: c.businessAddress || receipt.business.address,
      phone: c.businessPhone || receipt.business.phone,
      logoDataUrl: c.logoDataUrl || receipt.business.logoDataUrl,
    },
  };
}

/** Admin-customized display name for a template, or the registry fallback. */
export function templateName(id: string, fallback: string): string {
  return templateCustomization(id).displayName?.trim() || fallback;
}

/** Admin-customized description for a template, or the registry fallback. */
export function templateDescription(id: string, fallback: string): string {
  return templateCustomization(id).description?.trim() || fallback;
}

/** Admin-uploaded logo for a template's card, if any. */
export function templateLogo(id: string): string | undefined {
  return templateCustomization(id).logoDataUrl;
}
