import codeData from "./data.json";

export type CodeManifestEntry = {
  code: string;
  name: string;
  ext: string;
  chapters: string[];
};

export type CodeManifest = Record<string, CodeManifestEntry>;

export const CODE_MANIFEST: CodeManifest = codeData.manifest as CodeManifest;
export const CODE_FILES: Record<string, string> = codeData.codeFiles;

export function getCodeContent(lang: string, chapter: string): string | undefined {
  return CODE_FILES[`${lang}/${chapter}`];
}

export function getFirstChapter(lang: string): string | undefined {
  return CODE_MANIFEST[lang]?.chapters[0];
}