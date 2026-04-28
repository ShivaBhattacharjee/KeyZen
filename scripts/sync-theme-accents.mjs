import fs from "fs";
import path from "path";

const themesDir = path.join(process.cwd(), "public", "themes");
const settingsDataPath = path.join(process.cwd(), "lib", "settings-data.ts");
const globalsCssPath = path.join(process.cwd(), "app", "globals.css");

function extractVar(css, blockSelector, varName) {
  const escapedSelector = blockSelector.replace(/\./g, "\\.");
  const blockRegex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`);
  const rootBlock = css.match(blockRegex);
  if (!rootBlock) return null;
  const re = new RegExp(`${varName}:\\s*([^;]+);`);
  const match = rootBlock[1].match(re);
  if (!match) return null;
  return match[1].trim();
}

function parseLabel(stem) {
  return stem
    .split("-")
    .map((word) => word === word.toUpperCase() ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function main() {
  let settingsContent = await fs.promises.readFile(settingsDataPath, "utf8");
  let globalsCss = await fs.promises.readFile(globalsCssPath, "utf8");

  const existingIds = new Set();
  const arrayStart = settingsContent.indexOf("export const ACCENT_COLORS");
  const arrayEnd = settingsContent.indexOf("];", arrayStart);
  const arrayContent = settingsContent.substring(arrayStart, arrayEnd);
  
  const idRegex = /id:\s*"([^"]+)"/g;
  let match;
  while ((match = idRegex.exec(arrayContent)) !== null) {
    existingIds.add(match[1]);
  }

  const files = await fs.promises.readdir(themesDir);
  const cssFiles = files.filter((f) => f.endsWith(".css"));

  const newAccents = [];

  for (const file of cssFiles) {
    const css = await fs.promises.readFile(path.join(themesDir, file), "utf8");
    const lightPrimary = extractVar(css, ":root", "--primary");
    const lightRing = extractVar(css, ":root", "--ring") || lightPrimary;
    const darkPrimary = extractVar(css, ".dark", "--primary");
    const darkRing = extractVar(css, ".dark", "--ring") || darkPrimary;

    if (lightPrimary && darkPrimary) {
      const stem = file.replace(/\.css$/, "");
      const id = stem.toLowerCase();
      
      if (!existingIds.has(id)) {
        newAccents.push({
          id,
          label: parseLabel(stem),
          lightPrimary,
          lightRing,
          darkPrimary,
          darkRing,
        });
        existingIds.add(id);
      }
    }
  }

  if (newAccents.length === 0) {
    console.log("No new theme accents to sync.");
    return;
  }

  console.log(`Found ${newAccents.length} new theme accents:`, newAccents.map((a) => a.id).join(", "));

  // Add to AccentColor type
  const typeStartIdx = settingsContent.indexOf("export type AccentColor =");
  const typeEndIdx = settingsContent.indexOf(";", typeStartIdx);
  
  const typeAdditions = newAccents.map((a) => ` | "${a.id}"`).join("");
  settingsContent = 
    settingsContent.slice(0, typeEndIdx) + 
    "\n  // Auto-synced from themes\n " + typeAdditions + 
    settingsContent.slice(typeEndIdx);

  // Add to ACCENT_COLORS array
  const newArrayEnd = settingsContent.indexOf("];", settingsContent.indexOf("export const ACCENT_COLORS"));
  
  const arrayAdditions = newAccents.map((a) => {
    return `  { id: "${a.id}", label: "${a.label}", swatch: "${a.lightPrimary}" },`;
  }).join("\n");

  settingsContent = 
    settingsContent.slice(0, newArrayEnd) + 
    "  // Auto-synced from themes\n" + 
    arrayAdditions + "\n" + 
    settingsContent.slice(newArrayEnd);

  await fs.promises.writeFile(settingsDataPath, settingsContent);
  
  // Update globals.css
  const cssStartMarker = "/* Auto-synced theme accents start */";
  const cssEndMarker = "/* Auto-synced theme accents end */";
  
  const startIdx = globalsCss.indexOf(cssStartMarker);
  const endIdx = globalsCss.indexOf(cssEndMarker);
  
  if (startIdx !== -1 && endIdx !== -1) {
    // We want to insert right after the start marker. 
    // To be safe, we'll replace the block between start and end.
    let cssAdditions = "\n";
    for (const a of newAccents) {
      cssAdditions += `/* ${a.id} */\n`;
      cssAdditions += `:root[data-accent="${a.id}"] {\n`;
      cssAdditions += `  --primary: ${a.lightPrimary};\n`;
      cssAdditions += `  --ring: ${a.lightRing};\n`;
      cssAdditions += `}\n\n`;
      cssAdditions += `:root.dark[data-accent="${a.id}"] {\n`;
      cssAdditions += `  --primary: ${a.darkPrimary};\n`;
      cssAdditions += `  --ring: ${a.darkRing};\n`;
      cssAdditions += `}\n\n`;
    }
    
    // Check if there was already auto-synced content, we don't want to lose it or duplicate.
    // Actually, our script only adds *new* accents. If we overwrite between markers, we lose 
    // previously auto-synced ones if we don't regenerate them all. 
    // Wait, the script currently finds "newAccents" which are NOT in `settings-data.ts`.
    // It should APPEND to globals.css before the end marker, not overwrite!
    
    globalsCss = 
      globalsCss.substring(0, endIdx) + 
      cssAdditions + 
      globalsCss.substring(endIdx);
      
    await fs.promises.writeFile(globalsCssPath, globalsCss);
  }

  console.log("Updated lib/settings-data.ts and app/globals.css successfully.");
}

main().catch(console.error);
