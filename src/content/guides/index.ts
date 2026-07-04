import type { Guide } from "@/lib/guides";

/**
 * Registry of cornerstone guide pages. Each guide is a module in this folder;
 * import and list it here. Order controls the /guides index ordering.
 * The [slug] route, sitemap and llms.txt all derive from GUIDES.
 */
import { receiptVsInvoice } from "./receipt-vs-invoice";
import { howToWriteAReceipt } from "./how-to-write-a-receipt";
import { replacementReceiptForTaxes } from "./replacement-receipt-for-taxes";
import { lostUberLyftReceipt } from "./lost-uber-lyft-receipt";
import { rentReceiptRequirementsByState } from "./rent-receipt-requirements-by-state";
import { gigWorker1099Receipts } from "./gig-worker-1099-receipts";
import { whatMakesAReceiptValid } from "./what-makes-a-receipt-valid";
import { isAPhotoOfAReceiptValid } from "./is-a-photo-of-a-receipt-valid";
import { doFreelancersNeedReceipts } from "./do-freelancers-need-receipts";
import { trackTechHardwareExpenses } from "./track-tech-hardware-expenses";

export const GUIDES: Guide[] = [
  howToWriteAReceipt,
  receiptVsInvoice,
  whatMakesAReceiptValid,
  isAPhotoOfAReceiptValid,
  replacementReceiptForTaxes,
  trackTechHardwareExpenses,
  lostUberLyftReceipt,
  gigWorker1099Receipts,
  doFreelancersNeedReceipts,
  rentReceiptRequirementsByState,
];

const BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));

export function getGuide(slug: string): Guide | undefined {
  return BY_SLUG.get(slug);
}
