import type { QuoteLength } from "@/lib/quotes"
import type { Difficulty } from "@/lib/words"

export type TestMode = "time" | "words" | "quote" | "zen" | "code" | "custom"
export type TimeOption = 15 | 30 | 60 | 120
export type WordOption = 10 | 25 | 50 | 100

export const TEST_MODE_STORAGE_KEY = "tc-test-mode"
export const TIME_OPTION_STORAGE_KEY = "tc-time-option"
export const WORD_OPTION_STORAGE_KEY = "tc-word-option"
export const QUOTE_LENGTH_STORAGE_KEY = "tc-quote-length"
export const PUNCTUATION_STORAGE_KEY = "tc-punctuation"
export const NUMBERS_STORAGE_KEY = "tc-numbers"
export const DIFFICULTY_STORAGE_KEY = "tc-difficulty"
export const CUSTOM_TEXT_STORAGE_KEY = "tc-custom-text"
export const CODE_LANGUAGE_STORAGE_KEY = "tc-code-language"
export const CODE_CHAPTER_STORAGE_KEY = "tc-code-chapter"
export const CODE_EXT_STORAGE_KEY = "tc-code-ext"

export const DEFAULT_CUSTOM_TEXT =
  "Never gonna give you up, never gonna let you down Never gonna run around and desert you Never gonna make you cry, never gonna say goodbye Never gonna tell a lie and hurt you"

const VALID_TEST_MODES: readonly TestMode[] = [ "time", "words", "quote", "zen", "custom", "code", ]
const VALID_TIME_OPTIONS: readonly TimeOption[] = [15, 30, 60, 120]
const VALID_WORD_OPTIONS: readonly WordOption[] = [10, 25, 50, 100]
const VALID_QUOTE_LENGTHS: readonly QuoteLength[] = ["short", "medium", "long"]
const VALID_DIFFICULTIES: readonly Difficulty[] = ["easy", "hard"]

function isBrowser() {
  return typeof window !== "undefined"
}

export function readStoredTestMode(): TestMode | undefined {
  if (!isBrowser()) return undefined
  const raw = localStorage.getItem(TEST_MODE_STORAGE_KEY)
  if (!raw || !(VALID_TEST_MODES as readonly string[]).includes(raw))
    return undefined
  return raw as TestMode
}

export function readStoredTimeOption(): TimeOption | undefined {
  if (!isBrowser()) return undefined
  const raw = localStorage.getItem(TIME_OPTION_STORAGE_KEY)
  if (raw === null) return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || !VALID_TIME_OPTIONS.includes(n as TimeOption))
    return undefined
  return n as TimeOption
}

export function readStoredWordOption(): WordOption | undefined {
  if (!isBrowser()) return undefined
  const raw = localStorage.getItem(WORD_OPTION_STORAGE_KEY)
  if (raw === null) return undefined
  const n = Number(raw)
  if (
    !Number.isFinite(n) ||
    !(VALID_WORD_OPTIONS as readonly number[]).includes(n)
  )
    return undefined
  return n as WordOption
}

export function readStoredQuoteLength(): QuoteLength | undefined {
  if (!isBrowser()) return undefined
  const raw = localStorage.getItem(QUOTE_LENGTH_STORAGE_KEY)
  if (!raw || !(VALID_QUOTE_LENGTHS as readonly string[]).includes(raw))
    return undefined
  return raw as QuoteLength
}

export function readStoredBool(key: string): boolean | undefined {
  if (!isBrowser()) return undefined
  const raw = localStorage.getItem(key)
  if (raw === "true") return true
  if (raw === "false") return false
  return undefined
}

export function readStoredCustomText(): string | undefined {
  if (!isBrowser()) return undefined
  const raw = localStorage.getItem(CUSTOM_TEXT_STORAGE_KEY)
  if (raw === null) return undefined
  return raw
}

export function readStoredDifficulty(): Difficulty | undefined {
  if (!isBrowser()) return undefined
  const raw = localStorage.getItem(DIFFICULTY_STORAGE_KEY)
  if (!raw || !(VALID_DIFFICULTIES as readonly string[]).includes(raw))
    return undefined
  return raw as Difficulty
}

export function readStoredCodeLanguage(): string | undefined {
  if (!isBrowser()) return undefined
  return localStorage.getItem(CODE_LANGUAGE_STORAGE_KEY) || undefined
}

export function readStoredCodeChapter(): string | undefined {
  if (!isBrowser()) return undefined
  return localStorage.getItem(CODE_CHAPTER_STORAGE_KEY) || undefined
}

export function readStoredCodeExt(): string | undefined {
  if (!isBrowser()) return undefined
  return localStorage.getItem(CODE_EXT_STORAGE_KEY) || undefined
}
