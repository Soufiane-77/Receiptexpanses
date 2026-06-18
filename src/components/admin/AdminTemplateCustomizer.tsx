"use client";

import { useMemo, useState } from "react";
import { TEMPLATES } from "@/templates/registry";
import {
  loadSettings,
  saveSettings,
  type AdminSettings,
  type TemplateCustomization,
} from "@/lib/adminSettings";
import { Field, Section, inputCls } from "@/components/fields";
import { Button } from "@/components/Button";
import TemplateIcon from "@/components/TemplateIcon";

/**
 * Admin panel: set a custom logo and default branding per template. Stored in
 * AdminSettings.templates and applied as an overlay when a template is opened
 * (see lib/templateCustomize). No template component files are modified.
 */
export default function AdminTemplateCustomizer() {
  const [settings, setSettings] = useState<AdminSettings>(loadSettings());
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0]!.id);
  const [notice, setNotice] = useState("");

  const def = useMemo(() => TEMPLATES.find((t) => t.id === selectedId)!, [selectedId]);
  const custom: TemplateCustomization = settings.templates?.[selectedId] ?? {};

  const setCustom = (patch: Partial<TemplateCustomization>) => {
    const merged = { ...(settings.templates?.[selectedId] ?? {}), ...patch };
    // Drop empty values so the registry fallbacks apply again.
    (Object.keys(merged) as (keyof TemplateCustomization)[]).forEach((k) => {
      if (!merged[k]) delete merged[k];
    });
    const next: AdminSettings = {
      ...settings,
      templates: { ...settings.templates, [selectedId]: merged },
    };
    setSettings(next);
    saveSettings(next);
  };

  const onLogo = (file?: File) => {
    if (!file) return;
    if (file.size > 1_000_000) {
      setNotice("That image is over 1 MB — please pick a smaller logo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCustom({ logoDataUrl: String(reader.result) });
      setNotice("Logo updated.");
    };
    reader.readAsDataURL(file);
  };

  const resetTemplate = () => {
    const templates = { ...settings.templates };
    delete templates[selectedId];
    const next = { ...settings, templates };
    setSettings(next);
    saveSettings(next);
    setNotice("Reset to defaults.");
  };

  return (
    <Section title="Customize templates">
      <p className="text-xs text-slate-500">
        Set your own logo and default branding for each template — it&apos;s applied when you
        open that template in the editor. Upload only logos you own or are licensed to use;
        impersonating a real business you don&apos;t represent is against the Terms.
      </p>

      <Field label="Template to customize">
        <select
          className={`${inputCls} cursor-pointer`}
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setNotice("");
          }}
        >
          {TEMPLATES.map((t) => {
            const c = settings.templates?.[t.id];
            const dot = c && Object.keys(c).length ? " ●" : "";
            return (
              <option key={t.id} value={t.id}>
                {(c?.displayName || t.name) + dot}
              </option>
            );
          })}
        </select>
      </Field>

      {/* Logo */}
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-3">
        <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 text-brand-600">
          {custom.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={custom.logoDataUrl}
              alt="Template logo"
              className="max-h-16 w-auto object-contain"
            />
          ) : (
            <TemplateIcon id={selectedId} className="h-8 w-8" />
          )}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Logo image</span>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => onLogo(e.target.files?.[0])}
          />
          {custom.logoDataUrl ? (
            <button
              type="button"
              className="self-start text-xs text-red-500 underline"
              onClick={() => {
                setCustom({ logoDataUrl: undefined });
                setNotice("Logo removed.");
              }}
            >
              Remove logo
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Display name" hint={`Default: ${def.name}`}>
          <input
            className={inputCls}
            value={custom.displayName ?? ""}
            placeholder={def.name}
            onChange={(e) => setCustom({ displayName: e.target.value })}
          />
        </Field>
        <Field label="Accent color">
          <input
            type="color"
            className="h-10 w-full cursor-pointer rounded-md border border-slate-300"
            value={custom.accentColor ?? "#4f46e5"}
            onChange={(e) => setCustom({ accentColor: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Description" hint={`Default: ${def.description}`}>
        <input
          className={inputCls}
          value={custom.description ?? ""}
          placeholder={def.description}
          onChange={(e) => setCustom({ description: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Default business name">
          <input
            className={inputCls}
            value={custom.businessName ?? ""}
            onChange={(e) => setCustom({ businessName: e.target.value })}
          />
        </Field>
        <Field label="Default phone">
          <input
            className={inputCls}
            value={custom.businessPhone ?? ""}
            onChange={(e) => setCustom({ businessPhone: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Default address">
        <input
          className={inputCls}
          value={custom.businessAddress ?? ""}
          onChange={(e) => setCustom({ businessAddress: e.target.value })}
        />
      </Field>
      <Field label="Default footer note">
        <input
          className={inputCls}
          value={custom.footerNote ?? ""}
          onChange={(e) => setCustom({ footerNote: e.target.value })}
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        {notice ? (
          <span className="text-xs text-emerald-600">{notice}</span>
        ) : (
          <span className="text-xs text-slate-400">Changes save automatically (this browser).</span>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={resetTemplate}>
          Reset this template
        </Button>
      </div>
    </Section>
  );
}
