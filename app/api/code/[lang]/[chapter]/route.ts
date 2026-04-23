import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string; chapter: string }> }
) {
  const { lang, chapter } = await params;
  
  // Safe directory paths
  const dataDir = path.join(process.cwd(), "data");
  const langDir = path.join(dataDir, lang);
  
  try {
    // Validate that lang is a directory inside data
    const langStat = await fs.stat(langDir);
    if (!langStat.isDirectory()) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }
    
    // Find the file that matches the chapter name (ignoring extension for lookup)
    const files = await fs.readdir(langDir);
    const chapterFile = files.find(f => path.basename(f, path.extname(f)) === chapter);
    
    if (!chapterFile) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }
    
    const filePath = path.join(langDir, chapterFile);
    let content = await fs.readFile(filePath, "utf-8");
    
    // Strip comments based on language
    if (["go", "javascript", "dart"].includes(lang)) {
      content = content.replace(/\/\*[\s\S]*?\*\//g, "");
      content = content.replace(/\/\/.*$/gm, "");
    } else if (lang === "shell") {
      content = content.replace(/#.*$/gm, "");
    } else if (lang === "lua") {
      content = content.replace(/--\[\[[\s\S]*?\]\]/g, "");
      content = content.replace(/--.*$/gm, "");
    }

    return NextResponse.json({
      content: content.trim(),
    });
  } catch (error) {
    console.error("Failed to read chapter", error);
    return NextResponse.json({ error: "Failed to read chapter" }, { status: 500 });
  }
}
