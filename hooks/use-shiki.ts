"use client";

import { useEffect, useRef, useState } from "react";
import type { HighlighterCore } from "shiki";

const LANG_MAP: Record<string, string> = {
  javascript: "javascript",
  go: "go",
  dart: "dart",
  lua: "lua",
  shell: "shellscript",
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

/** Tokenizes words and returns per-word arrays of per-character hex colors. */
export function useShikiTokens(
  words: string[],
  lang: string,
  enabled: boolean,
  theme: string,
): (string | undefined)[][] {
  const [colorMap, setColorMap] = useState<(string | undefined)[][]>([]);
  const prevKey = useRef("");

  useEffect(() => {
    if (!enabled || words.length === 0 || !lang) {
      setColorMap([]);
      return;
    }

    const code = words.join(" ");
    const key = `${lang}:${theme}:${code}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    let cancelled = false;
    (async () => {
      await ensureLang(lang);
      const h = await getHighlighter();
      const shikiLang = LANG_MAP[lang] ?? "text";
      const shikiTheme = theme === "dark" ? "vitesse-dark" : "vitesse-light";

      const codeWithNewlines = words.join("\n");
      const { tokens } = h.codeToTokens(codeWithNewlines, { lang: shikiLang, theme: shikiTheme });

      const charColors: (string | undefined)[] = [];
      for (const line of tokens) {
        for (const token of line) {
          for (const char of token.content) {
            charColors.push(char === "\n" ? undefined : token.color);
          }
        }
      }

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
    })();

    return () => { cancelled = true; };
  }, [words, lang, enabled, theme]);

  return colorMap;
}
