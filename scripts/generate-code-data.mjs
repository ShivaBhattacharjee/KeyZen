import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const outputPath = path.join(process.cwd(), "lib/code/data.json");

const manifest = {};
const codeFiles = {};

const PRIORITY_LANGS = ["javascript", "go", "python", "typescript", "rust", "cpp", "c", "java"];

const LANG_NAMES = {
  javascript: "JavaScript",
  go: "Go",
  dart: "Dart",
  lua: "Lua",
  shell: "Shell",
  python: "Python",
  typescript: "TypeScript",
  rust: "Rust",
  cpp: "C++",
  c: "C",
  java: "Java",
};

const LANG_EXT = {
  javascript: "js",
  go: "go",
  dart: "dart",
  lua: "lua",
  shell: "sh",
  python: "py",
  typescript: "ts",
  rust: "rs",
  cpp: "cpp",
  c: "c",
  java: "java",
};

async function main() {
  const entries = await fs.promises.readdir(dataDir, { withFileTypes: true });

  const sortedEntries = entries.sort((a, b) => {
    const aIdx = PRIORITY_LANGS.indexOf(a.name.toLowerCase());
    const bIdx = PRIORITY_LANGS.indexOf(b.name.toLowerCase());
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of sortedEntries) {
    if (!entry.isDirectory()) continue;
    const langCode = entry.name;
    const langName = LANG_NAMES[langCode] || langCode.charAt(0).toUpperCase() + langCode.slice(1);
    const ext = LANG_EXT[langCode] || "txt";

    try {
      const langDir = path.join(dataDir, langCode);
      const files = await fs.promises.readdir(langDir);

      const chapters = files
        .filter((f) => !f.startsWith("."))
        .map((f) => path.basename(f, path.extname(f)))
        .sort((a, b) => {
          const numA = parseInt(a.split("_")[0], 10);
          const numB = parseInt(b.split("_")[0], 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });

      if (chapters.length > 0) {
        manifest[langCode] = { code: langCode, name: langName, ext, chapters };

        for (const chap of chapters) {
          const filePath = path.join(langDir, `${chap}.${ext}`);
          const content = await fs.promises.readFile(filePath, "utf-8");
          codeFiles[`${langCode}/${chap}`] = content;
        }
      }
    } catch (err) {
      console.error(`Failed to read ${langCode}`, err);
    }
  }

  const output = { manifest, codeFiles };
  await fs.promises.writeFile(outputPath, JSON.stringify(output));
  console.log("Generated lib/code/data.json");
}

main().catch(console.error);