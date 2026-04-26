"use client";

import { useEffect, useRef, useState } from "react";
import type { HighlighterCore } from "shiki";

const LANG_MAP: Record<string, string> = {
  javascript: "javascript",
  go: "go",
  dart: "dart",
  lua: "lua",
  shell: "shellscript",
  python: "python",
  typescript: "typescript",
  rust: "rust",
  c: "c",
};

let highlighterPromise: Promise<HighlighterCore> | null = null;
const loadedLangs = new Set<string>();

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((m) =>
      m.createHighlighter({ themes: ["vitesse-dark", "vitesse-light"], langs: [] }),
    );
  }
  return highlighterPromise;
}

async function ensureLang(lang: string) {
  const shikiLang = LANG_MAP[lang];
  if (!shikiLang || loadedLangs.has(shikiLang)) return;
  const h = await getHighlighter();
  await h.loadLanguage(shikiLang as Parameters<typeof h.loadLanguage>[0]);
  loadedLangs.add(shikiLang);
}

/** Returns shiki-highlighted HTML for a full code string. */
export function useHighlightedHtml(
  code: string,
  lang: string,
  enabled: boolean,
  theme: string,
): string {
  const [html, setHtml] = useState<string>("");
  const prevKey = useRef("");

  useEffect(() => {
    if (!enabled || !code || !lang) {
      prevKey.current = "";
      setHtml("");
      return;
    }

    const key = `${lang}:${theme}:${code}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    let cancelled = false;
    (async () => {
      await ensureLang(lang);
      const h = await getHighlighter();
      const shikiLang = LANG_MAP[lang] ?? "text";
      const shikiTheme = theme === "dark" ? "vitesse-dark" : "vitesse-light";
      const result = h.codeToHtml(code, { lang: shikiLang, theme: shikiTheme });
      if (!cancelled) setHtml(result);
    })();

    return () => { cancelled = true; };
  }, [code, lang, enabled, theme]);

  return html;
}

/** Tokenizes words and returns per-word arrays of per-character hex colors.
 *  Pass `rawCode` (the original source) for accurate context-aware highlighting.
 *  Falls back to joining words with newlines if rawCode is not provided.
 */
export function useShikiTokens(
  words: string[],
  lang: string,
  enabled: boolean,
  theme: string,
  rawCode?: string,
): (string | undefined)[][] {
  const [colorMap, setColorMap] = useState<(string | undefined)[][]>([]);
  const prevKey = useRef("");

  useEffect(() => {
    if (!enabled || words.length === 0 || !lang) {
      prevKey.current = "";
      setColorMap([]);
      return;
    }

    const codeToHighlight = rawCode ?? words.join("\n");
    const wordsKey = words.join("|");
    const key = `${lang}:${theme}:${codeToHighlight}:${wordsKey}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    let cancelled = false;
    (async () => {
      await ensureLang(lang);
      const h = await getHighlighter();
      const shikiLang = LANG_MAP[lang] ?? "text";
      const shikiTheme = theme === "dark" ? "vitesse-dark" : "vitesse-light";

      const { tokens } = h.codeToTokens(codeToHighlight, { lang: shikiLang, theme: shikiTheme });

      // Build a flat char→color array from the full source
      const charColors: (string | undefined)[] = [];
      for (const line of tokens) {
        for (const token of line) {
          for (const ch of token.content) {
            charColors.push(ch === "\n" ? undefined : token.color);
          }
        }
        // newline between lines
        charColors.push(undefined);
      }

      if (rawCode) {
        // Map each word back to its position in the raw source by scanning for it
        const result: (string | undefined)[][] = [];
        let searchFrom = 0;
        for (const word of words) {
          const colors: (string | undefined)[] = [];
          // Find this word's start position in the raw source
          const idx = rawCode.indexOf(word, searchFrom);
          if (idx === -1) {
            // Fallback: push undefined colors
            for (let i = 0; i < word.length; i++) colors.push(undefined);
          } else {
            for (let i = 0; i < word.length; i++) {
              colors.push(charColors[idx + i] ?? undefined);
            }
            searchFrom = idx + word.length;
          }
          result.push(colors);
        }
        if (!cancelled) setColorMap(result);
      } else {
        // Original word-per-line mapping
        let pos = 0;
        const result: (string | undefined)[][] = [];
        for (const word of words) {
          const colors: (string | undefined)[] = [];
          for (let i = 0; i < word.length; i++) {
            colors.push(charColors[pos] ?? undefined);
            pos++;
          }
          result.push(colors);
          if (pos < charColors.length && charColors[pos] === undefined) pos++;
        }
        if (!cancelled) setColorMap(result);
      }
    })();

    return () => { cancelled = true; };
  }, [words, lang, enabled, theme, rawCode]);

  return colorMap;
}
