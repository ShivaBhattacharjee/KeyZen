"use client";

import { useMemo, useEffect, useRef, useState, type ReactNode } from "react";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { isInvalidTestResult } from "@/lib/validate-result";
import { saveIfPersonalBest } from "@/lib/personal-best";
import { getLanguageManifest } from "@/lib/languages";
import { motion } from "motion/react";
import { IconInfoCircle, IconRefresh, IconArrowRight, IconDownload } from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CornerBrackets } from "@/components/corner-brackets";
import { ScreenshotButton } from "@/components/shareable-result-card";

export interface WpmSnapshot {
  second: number;
  wpm: number;
  raw: number;
  errors: number;
}

export interface ResultStats {
  wpm: number;
  accuracy: number;
  raw: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  consistency: number;
  elapsedSeconds: number;
  correctedErrors: number;
  mode: string;
  modeDetail: string;
  language: string;
  wpmHistory: WpmSnapshot[];
}

interface ResultsScreenProps {
  stats: ResultStats;
  onRestart: () => void;
  onNext: () => void;
}

function ResultsBracketButton({
  onClick,
  label,
  icon,
  spinOnClick = false,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
  spinOnClick?: boolean;
}) {
  const [spinning, setSpinning] = useState(false);

  function handleClick() {
    if (spinOnClick) {
      setSpinning(true);
      setTimeout(() => setSpinning(false), 600);
    }
    onClick();
  }

  return (
    <CornerBrackets className="inline-flex">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
      >
        <span
          style={{
            display: "inline-flex",
            transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
            transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
          }}
        >
          {icon}
        </span>
        {label}
      </button>
    </CornerBrackets>
  );
}

const chartConfig: ChartConfig = {
  wpm: {
    label: "WPM",
    color: "var(--color-primary)",
  },
  raw: {
    label: "Raw",
    color: "hsl(var(--muted-foreground))",
  },
};

function WpmChart({
  history,
  personalBest,
}: {
  history: WpmSnapshot[];
  personalBest?: number;
}) {
  const burst = useMemo(
    () => Math.max(...history.map((d) => d.wpm), 0),
    [history],
  );

  const data = useMemo(
    () =>
      history.map((d) => ({
        second: d.second,
        wpm: d.wpm,
        raw: d.raw,
        errors: d.errors,
      })),
    [history],
  );

  const maxVal = Math.max(...history.map((d) => d.raw), personalBest ?? 0, 10);

  const { secondTicks, minSecond, maxSecond } = useMemo(() => {
    const seconds = history.map((d) => Math.round(d.second));
    const lo = seconds.length ? Math.max(1, Math.min(...seconds)) : 1;
    const hi = seconds.length ? Math.max(lo, Math.max(...seconds)) : 1;
    const span = hi - lo;
    const step = Math.max(1, Math.ceil((span || 1) / 8));
    const ticks: number[] = [];
    for (let t = lo; t <= hi; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] !== hi) ticks.push(hi);
    return { secondTicks: ticks, minSecond: lo, maxSecond: hi };
  }, [history]);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 20 }}>
        <CartesianGrid
          vertical={false}
          stroke="currentColor"
          strokeOpacity={0.06}
        />
        <XAxis
          dataKey="second"
          type="number"
          domain={[minSecond, maxSecond]}
          ticks={secondTicks}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.35 }}
          tickFormatter={(v: number) => `${Math.round(v)}`}
        />
        <YAxis
          domain={[0, Math.ceil(maxVal * 1.2)]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.35 }}
          width={36}
          label={{
            value: "WPM",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            style: { fontSize: 10, fill: "currentColor", opacity: 0.25 },
          }}
        />
        <ChartTooltip
          cursor={{ stroke: "currentColor", strokeOpacity: 0.15, strokeWidth: 1 }}
          content={({ active, payload, label }) => (
            <ChartHoverCard
              active={active}
              payload={payload}
              label={label}
              burst={burst}
              personalBest={personalBest}
            />
          )}
        />
        {/* Raw line */}
        <Line
          dataKey="raw"
          type="monotone"
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
          isAnimationActive={false}
        />
        {/* WPM line */}
        <Line
          dataKey="wpm"
          type="monotone"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </LineChart>
    </ChartContainer>
  );
}


export function ResultsScreen({ stats, onRestart, onNext }: ResultsScreenProps) {
  const {
    wpm,
    accuracy,
    raw,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    consistency,
    elapsedSeconds,
    correctedErrors,
    mode,
    modeDetail,
    wpmHistory,
  } = stats

  const confettiRef = useRef<ConfettiRef>(null)
  const invalid = isInvalidTestResult(stats)

  const [pb] = useState(() => invalid ? null : saveIfPersonalBest(mode, modeDetail, wpm, accuracy));
  const chartPersonalBest = wpm;

  const languageName = useMemo(() => {
    if (mode === "custom") return null;
    return stats.language ? stats.language.charAt(0).toUpperCase() + stats.language.slice(1) : null;
  }, [mode, stats.language]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onRestart();
      } else if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        onNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onRestart]);

  useEffect(() => {
    if (!invalid && pb?.isNewPb) {
      const timer = setTimeout(() => {
        confettiRef.current?.fire({
          particleCount: 200,
          spread: 120,
          ticks: 400,
          gravity: 0.6,
          origin: { y: 0.3 },
        })
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [invalid, pb?.isNewPb])

  if (invalid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex w-full flex-col gap-8 md:max-w-5xl md:mx-auto"
      >
        <div className="flex flex-col items-center gap-3 px-2 text-center">
          <p className="font-(family-name:--font-doto) text-3xl font-bold text-muted-foreground md:text-4xl">
            invalid result
          </p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            No keystrokes were recorded, so scores can&apos;t be calculated. This
            often happens if the timer ran out before you typed, you left focus,
            or the test ended right after it started.
          </p>
          <p className="text-xs text-muted-foreground/70">
            {mode} {modeDetail}
            {elapsedSeconds > 0 ? ` · ${elapsedSeconds}s` : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-6 pb-2">
          <ResultsBracketButton
            onClick={onNext}
            label="Next Test"
            icon={<IconArrowRight size={16} aria-hidden />}
          />
          <ResultsBracketButton
            onClick={onRestart}
            label="Restart"
            spinOnClick
            icon={<IconRefresh size={16} aria-hidden />}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full flex-col gap-6 md:max-w-5xl md:mx-auto mt-12 md:mt-0"
    >
      {pb?.isNewPb && (
        <Confetti
          ref={confettiRef}
          manualstart
          className="pointer-events-none fixed inset-0 z-50"
          style={{ width: "100vw", height: "100vh" }}
        />
      )}
      {/* Main block: column on mobile, row from md */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-4">
        {/* WPM + ACC + test type */}
        <div className="flex w-full flex-col gap-1 pt-2 md:w-36 md:shrink-0">
          <StatBig
            label="WPM"
            value={wpm}
            labelAdornment={<CalculationFormulaPopover />}
          />
          <StatBig label="Accuracy" value={`${accuracy}%`} />
          {pb?.isNewPb && (
            <StatBig label="Personal Best" value={`${wpm}`} />
          )}
          {pb?.isNewPb && (
            <span className="text-xs font-medium text-primary animate-in fade-in">
              New Personal Best
            </span>
          )}
          {pb && !pb.isNewPb && pb.previous && (
            <StatBig label="Personal Best" value={pb.previous.wpm} />
          )}
          <div className="mt-4 flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span className="text-[10px] uppercase tracking-widest opacity-50">
              Test Type
            </span>
            <span className="text-primary">
              {modeDetail && modeDetail !== mode ? `${capitalize(mode)} ${modeDetail}` : capitalize(mode)}
            </span>
            {languageName && (
              <span className="opacity-50">{languageName}</span>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className=" h-80 w-full md:flex-1">
          {wpmHistory.length > 1 ? (
            <WpmChart history={wpmHistory} personalBest={chartPersonalBest} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground/50">
              not enough data
            </div>
          )}
        </div>
      </div>

      {/* Stats — single column on mobile, row of 5 from md */}
      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5 md:grid-cols-5 md:gap-6">
        <StatBox label="Raw" value={raw} />
        <StatBox
          label="Characters"
          value={`${correctChars}/${incorrectChars}/${extraChars}/${missedChars}`}
        />
        <StatBox label="Consistency" value={`${consistency}%`} />
        <StatBox label="Time" value={`${elapsedSeconds}s`} />
        <StatBox label="Fixes" value={correctedErrors} hint="Backspaces on wrong chars" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-2">
        <ResultsBracketButton
          onClick={onNext}
          label="Next Test"
          icon={<IconArrowRight size={16} aria-hidden />}
        />
        <ResultsBracketButton
          onClick={onRestart}
          label="Restart"
          spinOnClick
          icon={<IconRefresh size={16} aria-hidden />}
        />
        <ScreenshotButton stats={stats} pb={pb} />
        <DownloadResultsPopover stats={stats} pb={pb} />
      </div>
    </motion.div>
  );
}

function DownloadResultsPopover({ stats, pb }: { stats: ResultStats; pb?: { isNewPb: boolean; previous?: { wpm: number; accuracy: number; date: string } | null } | null }) {
  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `typing-test-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCsv = () => {
    const headers = ["second", "wpm", "raw", "errors"];
    const rows = stats.wpmHistory.map(row =>
      headers.map(header => row[header as keyof WpmSnapshot] ?? 0).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `typing-test-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <CornerBrackets className="inline-flex">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
          >
            <IconDownload size={16} stroke={1.5} aria-hidden />
            Download
          </button>
        </CornerBrackets>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-36 p-1"
      >
        <div className="flex flex-col gap-1">
          <button onClick={downloadJson} className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted text-foreground transition-colors">JSON format</button>
          <button onClick={downloadCsv} className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted text-foreground transition-colors">CSV format</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

function CalculationFormulaPopover() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  };

  const hoverProps = isMobile
    ? {}
    : {
        onMouseEnter: () => {
          cancelClose();
          setOpen(true);
        },
        onMouseLeave: scheduleClose,
      };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="How it's calculated"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
          {...hoverProps}
        >
          <IconInfoCircle size={14} stroke={1.5} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align={isMobile ? "center" : "start"}
        sideOffset={8}
        collisionPadding={16}
        className="max-h-[min(70vh,28rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-4"
        {...hoverProps}
      >
        <CalculationFormulaBody />
      </PopoverContent>
    </Popover>
  );
}

function CalculationFormulaBody() {
  return (
    <>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            How it&apos;s calculated
          </p>
          <dl className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
              <dt className="shrink-0 text-xs font-semibold text-primary sm:w-28">
                WPM
              </dt>
              <dd className="min-w-0">
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  ((correct word chars + correct spaces) ÷ 5) ÷ minutes
                </p>
                <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                  Spaces between correct words count; in time/zen, a correct
                  prefix of the last word counts before you press space.
                </p>
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
              <dt className="shrink-0 text-xs font-semibold text-primary sm:w-28">
                Raw
              </dt>
              <dd className="min-w-0 font-mono text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                (all typed chars ÷ 5) ÷ minutes
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
              <dt className="shrink-0 text-xs font-semibold text-primary sm:w-28">
                Consistency
              </dt>
              <dd className="min-w-0">
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  100 − (σ ÷ μ × 100)
                </p>
                <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                  σ and μ use your WPM at each second of the test: σ is
                  standard deviation, μ is the mean. Higher consistency means
                  steadier pacing.
                </p>
              </dd>
            </div>
          </dl>
    </>
  );
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function StatBig({
  label,
  value,
  labelAdornment,
}: {
  label: string;
  value: string | number;
  labelAdornment?: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {label}
        {labelAdornment}
      </span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-mono text-6xl font-bold leading-none text-primary"
      >
        {value}
      </motion.span>
    </div>
  );
}

function StatBox({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="font-mono text-2xl font-bold text-primary"
      >
        {value}
      </motion.span>
      {hint && <span className="text-[10px] text-muted-foreground opacity-40">{hint}</span>}
    </div>
  );
}

function ChartHoverCard({
  active,
  payload,
  label,
  burst,
  personalBest,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: WpmSnapshot }>;
  label?: string | number;
  burst: number;
  personalBest?: number;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  if (!row) {
    return null;
  }

  return (
    <div className="min-w-[9rem] rounded-md border border-border bg-popover/95 px-2.5 py-2 font-mono text-popover-foreground shadow-lg backdrop-blur">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold leading-none tabular-nums">
          {label}s
        </span>
        {personalBest ? (
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            peak {personalBest}
          </span>
        ) : null}
      </div>
      <div className="grid gap-0.5 text-[11px]">
        <ChartTooltipRow color="var(--destructive)" label="errors" value={row.errors} />
        <ChartTooltipRow color="var(--color-primary)" label="wpm" value={row.wpm} />
        <ChartTooltipRow color="currentColor" label="raw" value={row.raw} dim />
        <ChartTooltipRow color="currentColor" label="burst" value={burst} dim />
      </div>
    </div>
  );
}

function ChartTooltipRow({
  color,
  label,
  value,
  dim = false,
}: {
  color: string;
  label: string;
  value: string | number;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-[1px]"
        style={{ backgroundColor: color, opacity: dim ? 0.35 : 1 }}
      />
      <span className="min-w-[3.5rem] text-muted-foreground">{label}</span>
      <span className="ml-auto text-xs font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
