"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CustomTimeDialogProps {
  timeOption: number;
  onSave: (next: number) => void;
  trigger: React.ReactNode;
}

export function CustomTimeDialog({ timeOption, onSave, trigger }: CustomTimeDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setValue(timeOption.toString());
    }
  }, [open, timeOption]);

  function handleSave() {
    let seconds = 0;
    const trimmed = value.trim();
    if (!trimmed) return;

    if (trimmed.includes("h") || trimmed.includes("m")) {
      const hMatch = trimmed.match(/(\d+)h/);
      const mMatch = trimmed.match(/(\d+)m/);
      if (hMatch) seconds += parseInt(hMatch[1], 10) * 3600;
      if (mMatch) seconds += parseInt(mMatch[1], 10) * 60;
    } else {
      const parsed = parseInt(trimmed, 10);
      if (!isNaN(parsed)) seconds = parsed;
    }

    if (seconds >= 0) {
      onSave(seconds);
      setOpen(false);
    }
  }

  // Determine subtext based on current value
  let subtext = "";
  if (value === "0") {
    subtext = "infinite";
  } else {
    let s = 0;
    const trimmed = value.trim();
    if (trimmed.includes("h") || trimmed.includes("m")) {
      const hMatch = trimmed.match(/(\d+)h/);
      const mMatch = trimmed.match(/(\d+)m/);
      if (hMatch) s += parseInt(hMatch[1], 10) * 3600;
      if (mMatch) s += parseInt(mMatch[1], 10) * 60;
    } else {
      const parsed = parseInt(trimmed, 10);
      if (!isNaN(parsed)) s = parsed;
    }
    if (s === 1) subtext = "1 second";
    else if (s > 1) subtext = `${s} seconds`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[420px] w-[min(420px,calc(100vw-2rem))]",
          "p-0 overflow-hidden bg-zinc-100 dark:bg-[#111111] border border-border rounded-xl shadow-2xl",
          "duration-300 ease-out",
          "data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-2",
          "data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-bottom-2",
        )}
      >
        <div className="flex flex-col gap-6 p-6">
          <DialogTitle className="font-(family-name:--font-doto) text-[1.35rem] font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
            Test Duration
          </DialogTitle>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
              {subtext || "0 seconds"}
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="w-full bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-primary transition-colors font-mono"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-4 text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
            <p>
              You can use "h" for hours and "m" for minutes, for example "1h30m".
            </p>
            <p>
              You can start an infinite test by inputting 0. Then, to stop the test, use the Bail Out feature: (<kbd className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 px-1 py-0.5 rounded text-[11px]">esc</kbd> or <kbd className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 px-1 py-0.5 rounded text-[11px]">ctrl/cmd</kbd> + <kbd className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 px-1 py-0.5 rounded text-[11px]">shift</kbd> + <kbd className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 px-1 py-0.5 rounded text-[11px]">p</kbd> &gt; Bail Out)
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-900 hover:dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 hover:dark:text-zinc-100 rounded-lg py-2.5 text-sm font-medium transition-colors font-mono cursor-pointer"
          >
            apply
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
