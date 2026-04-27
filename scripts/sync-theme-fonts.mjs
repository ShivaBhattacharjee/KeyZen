import fs from "fs";
import path from "path";

const themesDir = path.join(process.cwd(), "public", "themes");
const settingsDataPath = path.join(process.cwd(), "lib", "settings-data.ts");

const SYSTEM_FONT_PREFIXES = ["ui-", "system-ui", "-apple-", "BlinkMacSystemFont", "var("];

function isSystemFont(name) {
  const n = name.replace(/['"/]/g, "").trim();
  return SYSTEM_FONT_PREFIXES.some((p) => n === p || n.startsWith(p));
}

function extractVar(css, varName) {
  const rootBlock = css.match(/:root\s*\{([^}]+)\}/);
  if (!rootBlock) return null;
  const re = new RegExp(`${varName}:\\s*([^;]+);`);
  const match = rootBlock[1].match(re);
  if (!match) return null;
  const value = match[1].trim();
  if (value.startsWith("var(")) return null;
  const firstFont = value.split(",")[0].replace(/['"/]/g, "").trim();
  if (isSystemFont(firstFont)) return null;
  return firstFont;
}

async function main() {
  let settingsContent = await fs.promises.readFile(settingsDataPath, "utf8");

  // Extract existing font ids
  const existingIds = new Set();
  const idRegex = /id:\s*"([^"]+)"/g;
  let match;
  while ((match = idRegex.exec(settingsContent)) !== null) {
    existingIds.add(match[1]);
  }

  const files = await fs.promises.readdir(themesDir);
  const cssFiles = files.filter((f) => f.endsWith(".css"));

  const newFonts = [];

  for (const file of cssFiles) {
    const css = await fs.promises.readFile(path.join(themesDir, file), "utf8");
    const fontSans = extractVar(css, "--font-sans");
    const fontMono = extractVar(css, "--font-mono");

    if (fontSans) {
      const id = fontSans.toLowerCase().replace(/\s+/g, "-");
      if (!existingIds.has(id)) {
        newFonts.push({ id, label: fontSans, tag: "display" });
        existingIds.add(id);
      }
    }

    if (fontMono) {
      const id = fontMono.toLowerCase().replace(/\s+/g, "-");
      if (!existingIds.has(id)) {
        newFonts.push({ id, label: fontMono, tag: "mono" });
        existingIds.add(id);
      }
    }
  }

  if (newFonts.length === 0) {
    console.log("No new theme fonts to sync.");
    return;
  }

  console.log(`Found ${newFonts.length} new theme fonts:`, newFonts.map((f) => f.id).join(", "));

  // Add to TypingFont type
  const typeEndIdx = settingsContent.indexOf("export interface FontOption");
  const typeDefStr = settingsContent.slice(0, typeEndIdx);
  const lastSemi = typeDefStr.lastIndexOf(";");
  
  const typeAdditions = newFonts.map((f) => `  | "${f.id}"`).join("\n");
  settingsContent = 
    settingsContent.slice(0, lastSemi) + 
    "\n  // Auto-synced from themes\n" + 
    typeAdditions + 
    settingsContent.slice(lastSemi);

  // Add to FONT_OPTIONS array
  const arrayEndIdx = settingsContent.indexOf("];", settingsContent.indexOf("export const FONT_OPTIONS"));
  
  const arrayAdditions = newFonts.map((f) => {
    const gf = `${f.label.replace(/\s+/g, "+")}:wght@400;500;700`;
    return `  { id: "${f.id}", label: "${f.label}", googleFamily: "${gf}", cssFamily: "'${f.label}'", tag: "${f.tag}" },`;
  }).join("\n");

  settingsContent = 
    settingsContent.slice(0, arrayEndIdx) + 
    "  // Auto-synced from themes\n" + 
    arrayAdditions + "\n" + 
    settingsContent.slice(arrayEndIdx);

  await fs.promises.writeFile(settingsDataPath, settingsContent);
  console.log("Updated lib/settings-data.ts successfully.");
}

main().catch(console.error);
