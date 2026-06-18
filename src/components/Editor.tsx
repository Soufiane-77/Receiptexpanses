"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Receipt } from "@/lib/types";
import { CURRENCIES, localeForCurrency } from "@/lib/currencies";
import { newId } from "@/lib/id";
import { TEMPLATES, getTemplate } from "@/templates/registry";
import { presetFor } from "@/lib/samples";
import { applyTemplateCustomization, templateName } from "@/lib/templateCustomize";
import { saveDraft, addSaved } from "@/lib/storage";
import { exportPDF, exportPNG, printReceipt } from "@/lib/export";
import { useCurrentUser } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";
import ReceiptPreview from "./ReceiptPreview";
import { Field, Section, Toggle, inputCls } from "./fields";
import { Button } from "./Button";
import Logo from "./Logo";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  XIcon,
  PlusIcon,
  SaveIcon,
  PrinterIcon,
  ImageIcon,
  DownloadIcon,
} from "./icons";

export default function Editor({ initial }: { initial: Receipt }) {
  const { register, control, watch, setValue, getValues, reset } = useForm<Receipt>({
    defaultValues: initial,
    mode: "onChange",
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const receipt = watch();
  const previewRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "png" | "pdf">(null);
  const templateDef = getTemplate(receipt.templateId);
  const user = useCurrentUser();
  const isPro = useIsPro();
  const router = useRouter();

  // Preview is free; downloading, printing and saving require an active
  // subscription. Non-subscribers are routed to checkout (or signup first).
  const requireSubscription = useCallback((): boolean => {
    if (isPro) return true;
    router.push(user ? "/pricing" : "/signup?next=/pricing");
    return false;
  }, [isPro, user, router]);

  // Persist draft to localStorage on every change (debounced).
  useEffect(() => {
    const t = setTimeout(() => saveDraft(receipt), 300);
    return () => clearTimeout(t);
  }, [receipt]);

  const switchTemplate = useCallback(
    (id: string) => {
      // Keep the user's data; swap the templateId and overlay this template's
      // admin branding (logo/accent/business defaults) if any is configured.
      const current = getValues();
      reset(applyTemplateCustomization({ ...current, templateId: id }, id));
    },
    [getValues, reset],
  );

  const loadPreset = useCallback(
    (id: string) => {
      reset(applyTemplateCustomization(presetFor(id), id));
    },
    [reset],
  );

  const onLogo = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setValue("business.logoDataUrl", String(reader.result));
      reader.readAsDataURL(file);
    },
    [setValue],
  );

  const handleExport = useCallback(
    async (kind: "png" | "pdf") => {
      if (!requireSubscription()) return;
      if (!previewRef.current) return;
      setBusy(kind);
      try {
        const no = getValues("meta.receiptNo");
        if (kind === "png") await exportPNG(previewRef.current, no);
        else await exportPDF(previewRef.current, no);
      } finally {
        setBusy(null);
      }
    },
    [getValues, requireSubscription],
  );

  const saveNamed = useCallback(() => {
    if (!requireSubscription()) return;
    const current = getValues();
    const name = window.prompt("Name this receipt", current.business.name || current.meta.receiptNo);
    if (!name) return;
    addSaved({
      id: newId(),
      name,
      savedAt: new Date().toISOString(),
      receipt: current,
    });
    window.alert(
      user ? "Saved. View it on your dashboard." : "Saved to this browser. Sign in to see it on your dashboard.",
    );
  }, [getValues, requireSubscription, user]);

  const isFuel = receipt.templateId === "fuel";
  const isTaxi = receipt.templateId === "taxi";
  const isParking = receipt.templateId === "parking";
  const isRestaurant = receipt.templateId === "restaurant";
  const isThermal = receipt.templateId === "thermal";
  const isAirbnb = receipt.templateId === "airbnb";
  const isWalmart = receipt.templateId === "walmart";
  const isAmazon = receipt.templateId === "amazon";
  const isUber = receipt.templateId === "uber";
  const isStarbucks = receipt.templateId === "starbucks";
  const isNike = receipt.templateId === "nike";
  const isAdidas = receipt.templateId === "adidas";
  const isApple = receipt.templateId === "apple";
  const isJordan = receipt.templateId === "jordan";
  const usesLineItems = !isFuel && !isTaxi && !isParking && !isUber;

  const currencyOptions = useMemo(() => CURRENCIES, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top bar */}
      <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="group rounded-lg" aria-label="ReceiptExpenses home">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <select
              value={receipt.templateId}
              onChange={(e) => switchTemplate(e.target.value)}
              className={`${inputCls} cursor-pointer`}
              aria-label="Template"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {templateName(t.id, t.name)}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" size="sm" onClick={() => loadPreset(receipt.templateId)}>
              Reset sample
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
        {/* FORM */}
        <form className="no-print flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <Section title="Business">
            <Field label="Business name">
              <input className={inputCls} {...register("business.name")} />
            </Field>
            <Field label="Address">
              <textarea className={inputCls} rows={2} {...register("business.address")} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} {...register("business.phone")} />
            </Field>
            <Field label="Logo" hint="Stored locally in your browser — never uploaded.">
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(e) => onLogo(e.target.files?.[0])}
              />
            </Field>
            {receipt.business.logoDataUrl ? (
              <button
                type="button"
                className="self-start text-xs text-red-500 underline"
                onClick={() => setValue("business.logoDataUrl", undefined)}
              >
                Remove logo
              </button>
            ) : null}
          </Section>

          <Section title="Receipt details">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Receipt #">
                <input className={inputCls} {...register("meta.receiptNo")} />
              </Field>
              <Field label="Cashier / Staff">
                <input className={inputCls} {...register("meta.cashier")} />
              </Field>
              <Field label="Date">
                <input type="date" className={inputCls} {...register("meta.date")} />
              </Field>
              <Field label="Time">
                <input type="time" className={inputCls} {...register("meta.time")} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency">
                <select
                  className={inputCls}
                  value={receipt.currency}
                  onChange={(e) => {
                    setValue("currency", e.target.value);
                    setValue("locale", localeForCurrency(e.target.value));
                  }}
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tax rate (%)">
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  {...register("taxRatePct", { valueAsNumber: true })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment method">
                <select className={inputCls} {...register("paymentMethod")}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              {receipt.paymentMethod === "card" ? (
                <Field label="Card last 4">
                  <input className={inputCls} maxLength={4} {...register("cardLast4")} />
                </Field>
              ) : null}
            </div>
          </Section>

          {/* Restaurant-specific */}
          {isRestaurant ? (
            <Section title="Restaurant">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Server">
                  <input className={inputCls} {...register("extras.serverName")} />
                </Field>
                <Field label="Table">
                  <input className={inputCls} {...register("extras.tableNo")} />
                </Field>
              </div>
            </Section>
          ) : null}

          {/* Thermal-specific */}
          {isThermal ? (
            <Section title="Barcode">
              <Field label="Barcode value">
                <input className={inputCls} {...register("extras.barcodeValue")} />
              </Field>
            </Section>
          ) : null}

          {/* Fuel-specific */}
          {isFuel ? (
            <Section title="Fuel">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fuel grade">
                  <input className={inputCls} {...register("extras.fuelGrade")} />
                </Field>
                <Field label="Pump #">
                  <input className={inputCls} {...register("extras.pumpNo")} />
                </Field>
                <Field label="Unit label" hint="gal or L">
                  <input className={inputCls} {...register("extras.unitLabel")} />
                </Field>
                <Field label="Quantity">
                  <input
                    type="number"
                    step="0.001"
                    className={inputCls}
                    {...register("extras.unitsDispensed", { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Price / unit">
                  <input
                    type="number"
                    step="0.001"
                    className={inputCls}
                    {...register("extras.pricePerUnit", { valueAsNumber: true })}
                  />
                </Field>
              </div>
            </Section>
          ) : null}

          {/* Taxi-specific */}
          {isTaxi ? (
            <Section title="Trip">
              <Field label="Pickup">
                <input className={inputCls} {...register("extras.pickup")} />
              </Field>
              <Field label="Dropoff">
                <input className={inputCls} {...register("extras.dropoff")} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Distance">
                  <input
                    type="number"
                    step="0.1"
                    className={inputCls}
                    {...register("extras.distance", { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Unit" hint="km or mi">
                  <input className={inputCls} {...register("extras.distanceUnit")} />
                </Field>
                <Field label="Fare">
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    {...register("extras.fare", { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Surcharge">
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    {...register("extras.surcharge", { valueAsNumber: true })}
                  />
                </Field>
              </div>
            </Section>
          ) : null}

          {/* Parking-specific */}
          {isParking ? (
            <Section title="Parking">
              <Field label="Lot name">
                <input className={inputCls} {...register("extras.lotName")} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Entry">
                  <input type="time" className={inputCls} {...register("extras.entryTime")} />
                </Field>
                <Field label="Exit">
                  <input type="time" className={inputCls} {...register("extras.exitTime")} />
                </Field>
                <Field label="Rate / hr">
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    {...register("extras.ratePerHour", { valueAsNumber: true })}
                  />
                </Field>
              </div>
            </Section>
          ) : null}

          {isAirbnb ? (
            <Section title="Airbnb Reservation">
              <Field label="Listing name">
                <input className={inputCls} {...register("extras.airbnbListingName")} />
              </Field>
              <Field label="Host name">
                <input className={inputCls} {...register("extras.airbnbHostName")} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Check-in">
                  <input type="date" className={inputCls} {...register("extras.airbnbCheckIn")} />
                </Field>
                <Field label="Check-out">
                  <input type="date" className={inputCls} {...register("extras.airbnbCheckOut")} />
                </Field>
                <Field label="Nights">
                  <input
                    type="number"
                    min="1"
                    className={inputCls}
                    {...register("extras.airbnbNights", { valueAsNumber: true })}
                  />
                </Field>
              </div>
            </Section>
          ) : null}

          {isWalmart ? (
            <Section title="Walmart Store Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Store #">
                  <input className={inputCls} {...register("extras.walmartStoreNo")} />
                </Field>
                <Field label="Terminal #">
                  <input className={inputCls} {...register("extras.walmartTerminalNo")} />
                </Field>
                <Field label="Transaction #">
                  <input className={inputCls} {...register("extras.walmartTransactionNo")} />
                </Field>
                <Field label="TC # (Transaction Code)">
                  <input className={inputCls} {...register("extras.walmartTcNo")} />
                </Field>
              </div>
            </Section>
          ) : null}

          {isAmazon ? (
            <Section title="Amazon Order Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Order ID">
                  <input className={inputCls} {...register("extras.amazonOrderNo")} />
                </Field>
                <Field label="Shipment ID">
                  <input className={inputCls} {...register("extras.amazonShipmentNo")} />
                </Field>
              </div>
            </Section>
          ) : null}

          {isNike ? (
            <Section title="Nike Order Details">
              <Field label="Order Number">
                <input className={inputCls} {...register("extras.nikeOrderNo")} />
              </Field>
            </Section>
          ) : null}

          {isAdidas ? (
            <Section title="Adidas Order Details">
              <Field label="Order Number">
                <input className={inputCls} {...register("extras.adidasOrderNo")} />
              </Field>
            </Section>
          ) : null}

          {isApple ? (
            <Section title="Apple Order Details">
              <Field label="Order Number">
                <input className={inputCls} {...register("extras.appleOrderNo")} />
              </Field>
            </Section>
          ) : null}

          {isJordan ? (
            <Section title="Jordan Order Details">
              <Field label="Order Number">
                <input className={inputCls} {...register("extras.jordanOrderNo")} />
              </Field>
            </Section>
          ) : null}

          {isUber ? (
            <Section title="Uber Ride Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Driver name">
                  <input className={inputCls} {...register("extras.uberDriverName")} />
                </Field>
                <Field label="Vehicle info">
                  <input className={inputCls} {...register("extras.uberVehicleInfo")} />
                </Field>
                <Field label="Trip duration">
                  <input className={inputCls} {...register("extras.uberTripDuration")} />
                </Field>
                <Field label="Distance">
                  <input
                    type="number"
                    step="0.1"
                    className={inputCls}
                    {...register("extras.distance", { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Distance unit" hint="mi or km">
                  <input className={inputCls} {...register("extras.distanceUnit")} />
                </Field>
                <Field label="Fare (Subtotal)">
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    {...register("extras.fare", { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Surcharge / Tolls">
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    {...register("extras.surcharge", { valueAsNumber: true })}
                  />
                </Field>
              </div>
              <Field label="Pickup address">
                <input className={inputCls} {...register("extras.pickup")} />
              </Field>
              <Field label="Dropoff address">
                <input className={inputCls} {...register("extras.dropoff")} />
              </Field>
            </Section>
          ) : null}

          {isStarbucks ? (
            <Section title="Starbucks Ticket Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check #">
                  <input className={inputCls} {...register("extras.starbucksCheckNo")} />
                </Field>
                <Field label="Stars earned">
                  <input className={inputCls} {...register("extras.starbucksStarsEarned")} />
                </Field>
              </div>
            </Section>
          ) : null}

          {/* Line items */}
          {usesLineItems ? (
            <Section title="Items">
              <div className="flex flex-col gap-2">
                {fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <input
                      placeholder="Item name"
                      className={`${inputCls} flex-1`}
                      {...register(`items.${i}.name` as const)}
                    />
                    <input
                      type="number"
                      step="1"
                      min="0"
                      aria-label="Quantity"
                      className={`${inputCls} w-16`}
                      {...register(`items.${i}.qty` as const, { valueAsNumber: true })}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      aria-label="Unit price"
                      className={`${inputCls} w-24`}
                      {...register(`items.${i}.unitPrice` as const, { valueAsNumber: true })}
                    />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        aria-label="Move item up"
                        disabled={i === 0}
                        onClick={() => move(i, i - 1)}
                        className="cursor-pointer rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move item down"
                        disabled={i === fields.length - 1}
                        onClick={() => move(i, i + 1)}
                        className="cursor-pointer rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => remove(i)}
                      className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => append({ id: newId(), qty: 1, name: "", unitPrice: 0 })}
                className="inline-flex cursor-pointer items-center gap-1 self-start rounded-md text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                <PlusIcon className="h-4 w-4" />
                Add item
              </button>
            </Section>
          ) : null}

          {/* Appearance + toggles */}
          <Section title="Appearance & options">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Accent color">
                <input
                  type="color"
                  className="h-10 w-full cursor-pointer rounded-md border border-slate-300"
                  {...register("accentColor")}
                />
              </Field>
              <Field label="Font size">
                <select className={inputCls} {...register("fontSize")}>
                  <option value="sm">Small</option>
                  <option value="base">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </Field>
            </div>
            <Toggle label="Show tax" checked={receipt.showTax} onChange={(v) => setValue("showTax", v)} />
            <Toggle label="Show tip" checked={receipt.showTip} onChange={(v) => setValue("showTip", v)} />
            {receipt.showTip ? (
              <Field label="Tip amount">
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  {...register("tipAmount", { valueAsNumber: true })}
                />
              </Field>
            ) : null}
            <Toggle
              label="Show signature line"
              checked={!!receipt.showSignatureLine}
              onChange={(v) => setValue("showSignatureLine", v)}
            />
            <Toggle
              label="Show barcode"
              checked={!!receipt.showBarcode}
              onChange={(v) => setValue("showBarcode", v)}
            />
            <Toggle
              label="Show footer note"
              checked={receipt.showFooter}
              onChange={(v) => setValue("showFooter", v)}
            />
            {receipt.showFooter ? (
              <Field label="Footer note">
                <input className={inputCls} {...register("footerNote")} />
              </Field>
            ) : null}
          </Section>
        </form>

        {/* PREVIEW */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Live preview — {templateDef.name}
          </div>
          <div className="flex justify-center overflow-auto rounded-xl bg-slate-200 p-4">
            <div id="print-area" className="shadow-lg">
              <ReceiptPreview ref={previewRef} receipt={receipt} watermark={!isPro} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky export bar */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2 px-4 py-3">
          {!isPro ? (
            <p className="mr-auto text-xs text-slate-500">
              Preview is free —{" "}
              <Link href="/pricing" className="font-medium text-brand-600 hover:underline">
                subscribe to download, print &amp; save
              </Link>
              .
            </p>
          ) : null}
          <Button type="button" variant="secondary" onClick={saveNamed}>
            <SaveIcon className="h-4 w-4" />
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (requireSubscription()) printReceipt();
            }}
          >
            <PrinterIcon className="h-4 w-4" />
            Print
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => handleExport("png")}
          >
            <ImageIcon className="h-4 w-4" />
            {busy === "png" ? "Rendering…" : "PNG"}
          </Button>
          <Button type="button" disabled={busy !== null} onClick={() => handleExport("pdf")}>
            <DownloadIcon className="h-4 w-4" />
            {busy === "pdf" ? "Rendering…" : "Download PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
