// Persistent dictionary of all-time problem words (mistyped + slow), accumulated
// across every completed test. Words graduate out once typed cleanly enough.
const STORAGE_KEY = "kz-mistakes";
const HISTORY_KEY = "kz-mistakes-history";
const HISTORY_MAX = 60; // mastery snapshots kept for the trend chart
const WINDOW = 8; // rolling outcomes kept per word
const GRADUATE_AFTER = 5; // consecutive clean hits → drop from dict

export interface MistakeEntry {
  word: string;
  attempts: number; // times reached
  misses: number; // lifetime problem count
  outcomes: number[]; // last WINDOW: 1 = problem, 0 = clean (newest last)
  lastSeen: string; // ISO
}

export interface MasterySnapshot {
  t: string; // ISO timestamp
  mastery: number; // 0–100
  count: number; // tracked words at that point
}

export interface MistakeStats {
  count: number;
  mastery: number;
  attempts: number;
  misses: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(): Record<string, MistakeEntry> {
  if (!isBrowser()) return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, MistakeEntry>) : {};
  } catch {
    return {};
  }
}

function write(entries: Record<string, MistakeEntry>): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function readHistory(): MasterySnapshot[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MasterySnapshot[]) : [];
  } catch {
    return [];
  }
}

function computeStats(entries: MistakeEntry[]): MistakeStats {
  if (entries.length === 0) return { count: 0, mastery: 100, attempts: 0, misses: 0 };
  let clean = 0;
  let total = 0;
  let attempts = 0;
  let misses = 0;
  for (const entry of entries) {
    total += entry.outcomes.length;
    clean += entry.outcomes.filter((o) => o === 0).length;
    attempts += entry.attempts;
    misses += entry.misses;
  }
  const mastery = total === 0 ? 100 : Math.round((clean / total) * 100);
  return { count: entries.length, mastery, attempts, misses };
}

function recentProblems(entry: MistakeEntry): number {
  return entry.outcomes.reduce((sum, o) => sum + o, 0);
}

function hasGraduated(entry: MistakeEntry): boolean {
  if (entry.outcomes.length < GRADUATE_AFTER) return false;
  return entry.outcomes.slice(-GRADUATE_AFTER).every((o) => o === 0);
}

// Modes whose "words" are syntax tokens rather than real words — excluded from
// the dictionary so code symbols (const, =>, });) don't pollute practice.
const EXCLUDED_MODES = new Set<string>(["code"]);

export function recordTestMistakes(
  targetWords: string[],
  wordInputs: string[],
  wordTimingsMs: number[],
  mode: string,
): void {
  if (!isBrowser() || targetWords.length === 0 || EXCLUDED_MODES.has(mode)) return;

  // Slow threshold: 75th-percentile of this test's word timings.
  let p75 = Infinity;
  if (wordTimingsMs.length > 1) {
    const sorted = [...wordTimingsMs].sort((a, b) => a - b);
    p75 = sorted[Math.floor(sorted.length * 0.75)];
  }

  const entries = read();
  const now = new Date().toISOString();

  targetWords.forEach((target, i) => {
    if (!target) return;
    const typed = wordInputs[i];
    if (typed === undefined) return; // not reached

    const slow = wordTimingsMs[i] !== undefined && wordTimingsMs[i] > p75;
    const problem = typed !== target || slow;

    const existing = entries[target];
    // Don't start tracking words that were never a problem.
    if (!problem && !existing) return;

    const entry: MistakeEntry = existing ?? {
      word: target,
      attempts: 0,
      misses: 0,
      outcomes: [],
      lastSeen: now,
    };

    entry.attempts += 1;
    entry.misses += problem ? 1 : 0;
    entry.outcomes.push(problem ? 1 : 0);
    if (entry.outcomes.length > WINDOW) entry.outcomes = entry.outcomes.slice(-WINDOW);
    entry.lastSeen = now;

    if (hasGraduated(entry)) {
      delete entries[target];
    } else {
      entries[target] = entry;
    }
  });

  write(entries);

  // Append a mastery snapshot for the trend chart. Skip the noisy empty-state
  // (no tracked words and no prior history), but keep capturing the descent to 0.
  const stats = computeStats(Object.values(entries));
  const history = readHistory();
  if (stats.count > 0 || history.length > 0) {
    history.push({ t: now, mastery: stats.mastery, count: stats.count });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_MAX)));
  }
}

export function getProblemWords(): MistakeEntry[] {
  return Object.values(read()).sort((a, b) => {
    const ra = recentProblems(a);
    const rb = recentProblems(b);
    if (rb !== ra) return rb - ra;
    if (b.misses !== a.misses) return b.misses - a.misses;
    return b.lastSeen.localeCompare(a.lastSeen);
  });
}

export function getMistakeStats(): MistakeStats {
  return computeStats(Object.values(read()));
}

export function getMistakeHistory(): MasterySnapshot[] {
  return readHistory();
}

export function buildHistoryPracticeWords(limit = 15): string[] {
  const words = getProblemWords()
    .slice(0, limit)
    .map((e) => e.word);
  if (words.length === 0) return [];
  return Array.from({ length: Math.max(1, Math.ceil(20 / words.length)) })
    .flatMap(() => [...words])
    .slice(0, Math.max(words.length * 3, 20));
}

export function clearMistakes(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
}
