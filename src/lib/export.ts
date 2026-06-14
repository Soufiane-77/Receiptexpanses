"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/** Render a DOM node to a high-resolution canvas. */
async function nodeToCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(node, {
    scale: Math.max(2, window.devicePixelRatio || 1),
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
}

function safeName(base: string, ext: string): string {
  const cleaned = (base || "receipt").replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-");
  return `${cleaned}.${ext}`;
}

function triggerDownload(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Export the given node as a PNG file. */
export async function exportPNG(node: HTMLElement, receiptNo: string): Promise<void> {
  const canvas = await nodeToCanvas(node);
  triggerDownload(canvas.toDataURL("image/png"), safeName(`receipt-${receiptNo}`, "png"));
}

/** Export the given node as a single-page PDF sized to the receipt. */
export async function exportPDF(node: HTMLElement, receiptNo: string): Promise<void> {
  const canvas = await nodeToCanvas(node);
  const imgData = canvas.toDataURL("image/png");

  // Use the canvas pixel size (at 96dpi → px≈pt) to size the PDF page so the
  // output matches the on-screen proportions exactly.
  const pxToPt = 72 / 96;
  const wPt = (canvas.width / (window.devicePixelRatio || 1)) * pxToPt;
  const hPt = (canvas.height / (window.devicePixelRatio || 1)) * pxToPt;

  const pdf = new jsPDF({
    orientation: hPt >= wPt ? "portrait" : "landscape",
    unit: "pt",
    format: [wPt, hPt],
  });
  pdf.addImage(imgData, "PNG", 0, 0, wPt, hPt);
  pdf.save(safeName(`receipt-${receiptNo}`, "pdf"));
}

/** Trigger the browser print dialog (CSS isolates #print-area). */
export function printReceipt(): void {
  window.print();
}
