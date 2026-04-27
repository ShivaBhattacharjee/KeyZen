export interface Language {
  name: string;
  code: string;
  has1k: boolean;
}

const RTL_LANGUAGE_CODES = new Set(["arabic", "urdu", "persian", "hebrew"]);

export function isRTLLanguage(code: string): boolean {
  return RTL_LANGUAGE_CODES.has(code);
}

/** Strip Arabic diacritics (harakat/tashkeel) from a string. */
export function stripArabicDiacritics(text: string): string {
  // U+0610–U+061A: Arabic extended marks
  // U+064B–U+065F: Arabic diacritics (fathatan … kasra below)
  // U+0670: Arabic letter superscript alef (alef waslah)
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, "");
}

let manifestCache: Language[] | null = null;

export async function getLanguageManifest(): Promise<Language[]> {
  if (manifestCache) return manifestCache;
  const res = await fetch("/languages/_manifest.json");
  manifestCache = (await res.json()) as Language[];
  return manifestCache;
}

const wordCache = new Map<string, string[]>();

export async function fetchLanguageWords(
  code: string,
  hard: boolean,
): Promise<string[]> {
  const fileCode = getLanguageFileCode(code);
  const key = hard ? `${fileCode}_1k` : fileCode;
  if (wordCache.has(key)) return wordCache.get(key)!;

  // Try the requested variant; fall back to base if _1k doesn't exist
  let res = await fetch(`/languages/${key}.json`);
  if (!res.ok && hard) {
    res = await fetch(`/languages/${fileCode}.json`);
  }
  if (!res.ok) {
    // Ultimate fallback: return empty and let caller use random-words
    return [];
  }
  const data = (await res.json()) as { words: string[] };
  wordCache.set(key, data.words);
  return data.words;
}

const LANGUAGE_FILE_MAP: Record<string, string> = {
  chinese_traditional_zhuyin: "chinese_traditional",
  chinese_traditional_cangjie: "chinese_traditional",
  chinese_simplified_wubi: "chinese_simplified",
};

/** Get the canonical file code for a language layout variant. */
export function getLanguageFileCode(code: string): string {
  return LANGUAGE_FILE_MAP[code] ?? code;
}
