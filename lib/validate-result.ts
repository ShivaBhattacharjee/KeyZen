import type { ResultStats, WpmSnapshot } from "@/components/results-screen"

/**
 * Reasons a test result can be flagged as invalid.
 */
export type InvalidReason =
  | "no_keystrokes"        // nothing was typed
  | "invalid_numbers"      // NaN / Infinity in core stats
  | "invalid_accuracy"     // accuracy outside [0, 100]
  | "zero_time"            // elapsed time ≤ 0
  | "too_short"            // test lasted < 2 s (not enough signal)
  | "impossible_wpm"       // WPM above human ceiling (~300)
  | "impossible_raw"       // raw WPM above human ceiling (~350)
  | "impossible_cps"       // chars-per-second exceeds physical limit
  | "impossible_burst"     // a single second exceeds ~600 WPM (auto-typer spike)
  | "flat_wpm_history"     // all per-second WPMs are identical — bot pattern
  | "perfect_consistency"  // σ ≈ 0 at high WPM with enough data — bot pattern
  | "afk_detected"         // > 3 consecutive 0-raw seconds mid-test

export interface ValidationResult {
  valid: boolean
  reason?: InvalidReason
}

// ─── Thresholds ──────────────────────────────────────────────────────────────
// World record (sustained): ~212 WPM. We give generous headroom for shorter
// bursts but anything above these values is physically implausible.
const MAX_WPM = 300
const MAX_RAW_WPM = 350
// 300 WPM ≈ 25 chars/sec; 350 raw ≈ 29 chars/sec — cap at 30 for safety
const MAX_CHARS_PER_SEC = 30
const MAX_BURST_WPM = 600
// Min test duration before we can draw conclusions
const MIN_ELAPSED_SECONDS = 5
// How many consecutive 0-raw seconds mid-test triggers an AFK flag
const MAX_CONSECUTIVE_ZERO_SECONDS = 3
// Minimum history length before statistical checks kick in (avoid false positives on short tests)
const MIN_HISTORY_FOR_STATS = 4
// WPM floor below which consistency / flat-history checks don't apply (slow legit typing can be consistent)
const MIN_WPM_FOR_BOT_CHECKS = 80

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isFlatHistory(history: WpmSnapshot[], wpm: number): boolean {
  if (history.length < MIN_HISTORY_FOR_STATS || wpm < MIN_WPM_FOR_BOT_CHECKS) return false
  const values = history.map((s) => s.wpm)
  const spread = Math.max(...values) - Math.min(...values)
  // All per-second WPMs within 1 WPM of each other over 4+ seconds → bot
  return spread <= 1
}

function hasPerfectConsistency(stats: ResultStats): boolean {
  if (
    stats.wpmHistory.length < MIN_HISTORY_FOR_STATS ||
    stats.wpm < MIN_WPM_FOR_BOT_CHECKS
  )
    return false
  // consistency = 100 − (σ/μ × 100). ≥ 99 means σ/μ ≤ 0.01 — inhuman steadiness.
  return stats.consistency >= 99
}

function hasImpossibleBurst(history: WpmSnapshot[]): boolean {
  return history.some((s) => s.wpm > MAX_BURST_WPM)
}

function detectAfk(history: WpmSnapshot[]): boolean {
  // Ignore the very first and very last second (warmup / final keystroke)
  const inner = history.slice(1, -1)
  let consecutive = 0
  for (const snap of inner) {
    if (snap.raw === 0) {
      consecutive++
      if (consecutive > MAX_CONSECUTIVE_ZERO_SECONDS) return true
    } else {
      consecutive = 0
    }
  }
  return false
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Returns `{ valid: true }` for a legitimate result or
 * `{ valid: false, reason }` with the first failing check.
 *
 * Checks are ordered from cheapest / most obvious to most expensive.
 */
export function validateResult(stats: ResultStats): ValidationResult {
  const {
    wpm,
    raw,
    accuracy,
    correctChars,
    incorrectChars,
    extraChars,
    elapsedSeconds,
    wpmHistory,
  } = stats

  const keystrokes = correctChars + incorrectChars + extraChars

  // 1. Nothing typed
  if (keystrokes === 0)
    return { valid: false, reason: "no_keystrokes" }

  // 2. Core stats must be finite numbers
  if (!Number.isFinite(wpm) || !Number.isFinite(raw) || !Number.isFinite(accuracy))
    return { valid: false, reason: "invalid_numbers" }

  // 3. Accuracy must be in [0, 100]
  if (accuracy < 0 || accuracy > 100)
    return { valid: false, reason: "invalid_accuracy" }

  // 4. Time sanity
  if (elapsedSeconds <= 0)
    return { valid: false, reason: "zero_time" }

  if (elapsedSeconds < MIN_ELAPSED_SECONDS)
    return { valid: false, reason: "too_short" }

  // 5. Impossible speed — human ceiling
  if (wpm > MAX_WPM)
    return { valid: false, reason: "impossible_wpm" }

  if (raw > MAX_RAW_WPM)
    return { valid: false, reason: "impossible_raw" }

  // 6. Chars-per-second cross-check (catches auto-typers that inflate wpm via short words)
  const cps = keystrokes / elapsedSeconds
  if (cps > MAX_CHARS_PER_SEC)
    return { valid: false, reason: "impossible_cps" }

  // 7. Per-second history checks (only when we have a history)
  if (wpmHistory.length > 0) {
    // Single-second burst spike — hallmark of macro injection
    if (hasImpossibleBurst(wpmHistory))
      return { valid: false, reason: "impossible_burst" }

    // AFK / tab-away mid-test
    if (wpmHistory.length > MIN_HISTORY_FOR_STATS + 2 && detectAfk(wpmHistory))
      return { valid: false, reason: "afk_detected" }

    // Bot-like flat WPM line
    if (isFlatHistory(wpmHistory, wpm))
      return { valid: false, reason: "flat_wpm_history" }

    // Inhuman consistency at speed
    if (hasPerfectConsistency(stats))
      return { valid: false, reason: "perfect_consistency" }
  }

  return { valid: true }
}

/** Convenience boolean wrapper — drop-in replacement for the old helper. */
export function isInvalidTestResult(stats: ResultStats): boolean {
  return !validateResult(stats).valid
}
