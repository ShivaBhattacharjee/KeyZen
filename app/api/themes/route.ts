import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export interface ThemeOption {
  id: string;
  label: string;
  url: string | null;
  /** Value of --primary from the :root block, for display swatch */
  primaryColor: string | null;
  /** Value of --font-sans from the :root block */
  fontSans: string | null;
  /** Value of --font-mono from the :root block */
  fontMono: string | null;
}

/**
 * Convert a filename stem like "shopify-red" → "Shopify Red"
 * Preserves all-caps segments like "DE" in "DE-Swiss-Design"
 */
function parseThemeLabel(stem: string): string {
  return stem
    .split("-")
    .map((word) =>
      // If already uppercase (e.g. "DE") keep as-is; otherwise capitalise first letter
      word === word.toUpperCase()
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

/**
 * Extract the value of --primary from the :root { } block of a CSS string.
 * Returns null if not found.
 */
function extractPrimary(css: string): string | null {
  const rootBlock = css.match(/:root\s*\{([^}]+)\}/);
  if (!rootBlock) return null;
  const match = rootBlock[1].match(/--primary:\s*([^;]+);/);
  return match ? match[1].trim() : null;
}

/**
 * Extract a CSS custom property value from the :root { } block.
 */
function extractVar(css: string, varName: string): string | null {
  const rootBlock = css.match(/:root\s*\{([^}]+)\}/);
  if (!rootBlock) return null;
  const re = new RegExp(`${varName}:\\s*([^;]+);`);
  const match = rootBlock[1].match(re);
  if (!match) return null;
  const value = match[1].trim();
  // Skip self-referential values like "var(--font-sans)" — these come from
  // the @theme inline block in the theme file and are not useful here
  if (value.startsWith("var(")) return null;
  // Skip pure system-font stacks (first token is a ui-* or system-ui keyword)
  const firstFont = value.split(",")[0].replace(/['"/]/g, "").trim();
  const systemKeywords = ["ui-", "system-ui", "-apple-system", "BlinkMacSystemFont"];
  if (systemKeywords.some((kw) => firstFont.startsWith(kw) || firstFont === kw)) return null;
  return value;
}

export async function GET() {
  const themesDir = join(process.cwd(), "public", "themes");

  let files: string[] = [];
  try {
    files = readdirSync(themesDir).filter((f) => f.endsWith(".css"));
  } catch {
    // Directory doesn't exist or unreadable — return only default
  }

  const themes: ThemeOption[] = [
    { id: "default", label: "Default", url: null, primaryColor: null, fontSans: null, fontMono: null },
    ...files.map((file) => {
      const stem = file.replace(/\.css$/, "");
      let primaryColor: string | null = null;
      let fontSans: string | null = null;
      let fontMono: string | null = null;
      try {
        const css = readFileSync(join(themesDir, file), "utf8");
        primaryColor = extractPrimary(css);
        fontSans = extractVar(css, "--font-sans");
        fontMono = extractVar(css, "--font-mono");
      } catch {
        // ignore read errors
      }
      return {
        id: stem,
        label: parseThemeLabel(stem),
        url: `/themes/${file}`,
        primaryColor,
        fontSans,
        fontMono,
      };
    }),
  ];

  return NextResponse.json(themes);
}
