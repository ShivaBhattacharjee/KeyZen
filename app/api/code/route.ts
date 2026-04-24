import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// NOTE: This cache persists for the lifetime of the server process.
// If data/ directory contents change, restart the server to reflect updates.
let cachedManifest: Record<string, { code: string; name: string; chapters: string[] }> | null = null;

export async function GET() {
  if (cachedManifest) return NextResponse.json(cachedManifest);

  const dataDir = path.join(process.cwd(), "data");
  
  try {
    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    
    const manifest: Record<string, { code: string; name: string; chapters: string[] }> = {};
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const langCode = entry.name;
        let langName = langCode.charAt(0).toUpperCase() + langCode.slice(1);
        if (langCode === "javascript") langName = "JavaScript";
        if (langCode === "go") langName = "Go";
        
        try {
          const langDir = path.join(dataDir, langCode);
          const files = await fs.readdir(langDir);
          
          const chapters = files
            .filter((f) => !f.startsWith("."))
            .map((f) => path.basename(f, path.extname(f))) // return name without extension
            .sort(); // Sorting by chapter number "00_basics" etc.
            
          if (chapters.length > 0) {
            manifest[langCode] = {
              code: langCode,
              name: langName,
              chapters,
            };
          }
        } catch (err) {
          console.error(`Failed to read directory ${langCode}`, err);
        }
      }
    }
    cachedManifest = manifest;
    return NextResponse.json(manifest);
  } catch (error) {
    console.error("Failed to read data directory", error);
    return NextResponse.json({ error: "Failed to read data directory" }, { status: 500 });
  }
}
