"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildQueue,
  clearQueue,
  defaultConfig,
  loadConfig,
  loadQueue,
  parseKeywords,
  processDueJobs,
  saveConfig,
  type AutomationConfig,
  type QueueJob,
} from "@/lib/automation";
import { Field, Section, inputCls } from "@/components/fields";
import { Button } from "@/components/Button";

function toLocalInput(iso: string): string {
  // yyyy-MM-ddThh:mm for <input type="datetime-local">
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

export default function AdminAutomation() {
  const [config, setConfig] = useState<AutomationConfig>(() => defaultConfig());
  const [keywordsText, setKeywordsText] = useState("");
  const [queue, setQueue] = useState<QueueJob[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string>("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted state on mount.
  useEffect(() => {
    const c = loadConfig();
    setConfig(c);
    setKeywordsText(c.keywords.join("\n"));
    setQueue(loadQueue());
    setRunning(c.running);
  }, []);

  // Scheduler: while "running", poll for due jobs every 15s (and once immediately).
  useEffect(() => {
    if (!running) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    const tick = () => {
      const published = processDueJobs();
      if (published.length) {
        setQueue(loadQueue());
        setLastRun(`Published ${published.length} post(s) at ${new Date().toLocaleTimeString()}`);
      }
    };
    tick();
    timer.current = setInterval(tick, 15_000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const persist = (patch: Partial<AutomationConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    saveConfig(next);
  };

  const pending = queue.filter((j) => j.status === "pending").length;
  const publishedCount = queue.filter((j) => j.status === "published").length;

  const schedule = () => {
    const keywords = parseKeywords(keywordsText);
    if (keywords.length === 0) {
      window.alert("Add at least one keyword.");
      return;
    }
    const next = { ...config, keywords };
    saveConfig(next);
    setConfig(next);
    buildQueue(next);
    setQueue(loadQueue());
  };

  const toggleRun = () => {
    const next = !running;
    setRunning(next);
    persist({ running: next });
  };

  const runNow = () => {
    const published = processDueJobs();
    setQueue(loadQueue());
    setLastRun(
      published.length
        ? `Published ${published.length} post(s) now.`
        : "Nothing was due yet.",
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">How this works (and its limits)</p>
        <p className="mt-1">
          The scheduler runs only while <strong>this admin tab is open</strong> — there’s no server
          cron, so it can’t publish after you close the tab. Articles are generated from a built-in
          template (not a live AI model). To run truly unattended with real AI generation, connect a
          backend cron + an LLM API — the generator is a single function (<code className="rounded bg-amber-100 px-1">generateArticle</code>)
          built to swap out.
        </p>
      </div>

      <Section title="Keywords">
        <Field
          label="Keywords (one per line, or comma-separated)"
          hint="The queue cycles through these to fill the requested quantity."
        >
          <textarea
            className={`${inputCls} min-h-[120px]`}
            placeholder={"restaurant receipt template\nhow to make a fuel receipt\nparking receipt for expenses"}
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Schedule">
        <div className="grid grid-cols-2 gap-3">
          <Field label="How many posts">
            <input
              type="number"
              min={1}
              max={200}
              className={inputCls}
              value={config.quantity}
              onChange={(e) => persist({ quantity: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>
          <Field label="Every (minutes)">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={config.intervalMinutes}
              onChange={(e) => persist({ intervalMinutes: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>
          <Field label="Start at">
            <input
              type="datetime-local"
              className={inputCls}
              value={toLocalInput(config.startAt)}
              onChange={(e) => persist({ startAt: new Date(e.target.value).toISOString() })}
            />
          </Field>
          <Field label="Author">
            <input
              className={inputCls}
              value={config.author}
              onChange={(e) => persist({ author: e.target.value })}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={schedule}>Schedule batch</Button>
          <Button variant="secondary" onClick={runNow}>
            Run due now
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm("Clear the entire queue?")) {
                clearQueue();
                setQueue([]);
              }
            }}
          >
            Clear queue
          </Button>
        </div>
      </Section>

      <Section title="Scheduler">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${
                running ? "animate-pulse bg-emerald-500" : "bg-slate-300"
              }`}
            />
            {running ? "Running — publishing due posts" : "Paused"}
            <div className="text-xs text-slate-400">
              {pending} pending · {publishedCount} published{lastRun ? ` · ${lastRun}` : ""}
            </div>
          </div>
          <Button onClick={toggleRun} variant={running ? "secondary" : "primary"}>
            {running ? "Pause" : "Start scheduler"}
          </Button>
        </div>
      </Section>

      {queue.length > 0 ? (
        <Section title={`Queue (${queue.length})`}>
          <div className="flex flex-col divide-y divide-slate-100">
            {queue
              .slice()
              .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
              .map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-800">{job.keyword}</span>
                    <span className="ml-2 text-xs text-slate-400">
                      {new Date(job.scheduledAt).toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      job.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
