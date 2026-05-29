"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { IconTargetArrow, IconTrash } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getMistakeStats,
  getMistakeHistory,
  getProblemWords,
  buildHistoryPracticeWords,
  clearMistakes,
} from "@/lib/mistakes";

const trendConfig: ChartConfig = {
  mastery: { label: "Mastery", color: "var(--color-primary)" },
};
const wordsConfig: ChartConfig = {
  misses: { label: "Misses", color: "var(--color-primary)" },
};

export function PracticeDashboard({
  open,
  onOpenChange,
  onStartPractice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartPractice: (words: string[]) => void;
}) {
  const [version, setVersion] = useState(0);

  const { stats, trend, topWords } = useMemo(() => {
    if (!open) {
      return {
        stats: { count: 0, mastery: 100, attempts: 0, misses: 0 },
        trend: [] as { i: number; mastery: number }[],
        topWords: [] as { word: string; misses: number }[],
      };
    }
    const history = getMistakeHistory();
    return {
      stats: getMistakeStats(),
      trend: history.map((s, i) => ({ i: i + 1, mastery: s.mastery })),
      topWords: getProblemWords()
        .slice(0, 8)
        .map((e) => ({ word: e.word, misses: e.misses })),
    };
  }, [open, version]);

  const hasData = stats.count > 0;

  function handleStart() {
    const words = buildHistoryPracticeWords();
    if (words.length === 0) return;
    onOpenChange(false);
    onStartPractice(words);
  }

  function handleReset() {
    clearMistakes();
    setVersion((v) => v + 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconTargetArrow size={18} stroke={1.5} aria-hidden />
            Practice Dashboard
          </DialogTitle>
        </DialogHeader>

        {!hasData ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm text-muted-foreground">No tracked mistakes yet.</p>
            <p className="max-w-xs text-xs text-muted-foreground/60">
              Finish a few tests and the words you miss or type slowly will show up
              here to practice.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-1">
            {/* Headline stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Mastery" value={`${stats.mastery}%`} />
              <Stat label="Tracked words" value={stats.count} />
              <Stat label="Attempts" value={stats.attempts} />
              <Stat label="Misses" value={stats.misses} />
            </div>

            {/* Mastery trend */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Mastery over time
              </span>
              {trend.length > 1 ? (
                <ChartContainer config={trendConfig} className="h-40 w-full">
                  <LineChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.06} />
                    <XAxis dataKey="i" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.35 }} />
                    <YAxis domain={[0, 100]} width={32} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.35 }} />
                    <ChartTooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-md border border-border bg-popover/95 px-2.5 py-1.5 font-mono text-xs shadow-lg backdrop-blur">
                            {payload[0].value}% mastery
                          </div>
                        ) : null
                      }
                    />
                    <Line
                      dataKey="mastery"
                      type="monotone"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex h-40 items-center justify-center text-xs text-muted-foreground/50">
                  not enough data yet — finish more tests
                </div>
              )}
            </div>

            {/* Top problem words */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Top problem words
              </span>
              <ChartContainer config={wordsConfig} className="h-48 w-full">
                <BarChart data={topWords} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="currentColor" strokeOpacity={0.06} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.35 }} />
                  <YAxis type="category" dataKey="word" width={90} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} />
                  <ChartTooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-md border border-border bg-popover/95 px-2.5 py-1.5 font-mono text-xs shadow-lg backdrop-blur">
                          {payload[0].payload.word} · {payload[0].value} misses
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="misses" fill="var(--color-primary)" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={handleStart}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none"
              >
                <IconTargetArrow size={15} stroke={1.5} />
                Practice these words
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-2.5 text-xs text-muted-foreground/60 transition-colors hover:border-destructive/50 hover:text-destructive focus-visible:outline-none"
                  >
                    <IconTrash size={14} stroke={1.5} />
                    Reset
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset practice data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all tracked mistakes and mastery history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-2xl font-bold text-primary tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">{label}</span>
    </div>
  );
}
