"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  IconUpload,
  IconRotate,
  IconSparkles,
  IconFileText,
  IconCode,
} from "@tabler/icons-react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CornerBrackets } from "@/components/corner-brackets";
import { DEFAULT_CUSTOM_TEXT } from "@/lib/test-storage";
import type { CodeManifest } from "@/lib/code";
import { getCodeContent } from "@/lib/code";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const MONACO_LANG_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  go: "go",
  rust: "rust",
  c: "c",
  lua: "lua",
  shell: "shell",
  dart: "dart",
};

// Map file extensions → our language codes
const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  go: "go",
  rs: "rust",
  c: "c",
  h: "c",
  lua: "lua",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  dart: "dart",
};

const MAX_CHARS = 20000;
const DIALOG_CODE_MODE_KEY = "tc-dialog-code-mode";
const DIALOG_CODE_LANG_KEY = "tc-dialog-code-lang";

interface CustomTextDialogProps {
  value: string;
  onSave: (next: string, codeLanguage?: string) => void;
  trigger: React.ReactNode;
  codeManifest: CodeManifest;
}

export function CustomTextDialog({
  value,
  onSave,
  trigger,
  codeManifest,
}: CustomTextDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState("");
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (open) {
      setDraft(value);
      try {
        const savedCodeMode = localStorage.getItem(DIALOG_CODE_MODE_KEY) === "true";
        const savedLang = localStorage.getItem(DIALOG_CODE_LANG_KEY) ?? "";
        setIsCodeMode(savedCodeMode);
        setSelectedLang(savedCodeMode ? savedLang : "");
      } catch {
        setIsCodeMode(false);
        setSelectedLang("");
      }
    }
  }, [open, value]);

  const words = draft.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = draft.length;
  const overLimit = charCount > MAX_CHARS;

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (file.size > MAX_CHARS * 4) {
      toast.error("file is too large");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (isCodeMode) {
      const lang = EXT_TO_LANG[ext];
      if (!lang) {
        toast.error(`unsupported file type: .${ext}`);
        return;
      }
      try {
        const text = await file.text();
        setDraft(text);
        setSelectedLang(lang);
        localStorage.setItem(DIALOG_CODE_LANG_KEY, lang);
        toast.success(`loaded ${file.name} as ${lang}`);
      } catch {
        toast.error("could not read file");
      }
    } else {
      const detectedLang = EXT_TO_LANG[ext];
      if (detectedLang) {
        // Code file uploaded while in text mode — ask user to switch
        try {
          const text = await file.text();
          toast(`${file.name} looks like ${detectedLang} code`, {
            description: "Switch to code mode to get syntax highlighting and line numbers.",
            duration: 8000,
            action: {
              label: "Enable code mode",
              onClick: () => {
                setDraft(text);
                setIsCodeMode(true);
                setSelectedLang(detectedLang);
                localStorage.setItem(DIALOG_CODE_MODE_KEY, "true");
                localStorage.setItem(DIALOG_CODE_LANG_KEY, detectedLang);
              },
            },
          });
          // Also load the text as-is so they can still use it in text mode
          setDraft(text);
        } catch {
          toast.error("could not read file");
        }
        return;
      }
      if (ext !== "txt" && file.type !== "text/plain") {
        toast.error("only .txt files are supported");
        return;
      }
      try {
        const text = await file.text();
        setDraft(text);
        toast.success(`loaded ${file.name}`);
      } catch {
        toast.error("could not read file");
      }
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    void handleFile(f);
  }

  function handleSave() {
    const cleaned = draft.trim();
    if (!cleaned) {
      toast.error("text cannot be empty");
      return;
    }
    if (overLimit) {
      toast.error(`text too long (${charCount}/${MAX_CHARS})`);
      return;
    }
    if (isCodeMode && !selectedLang) {
      toast.error("select a language for code mode");
      return;
    }
    onSave(cleaned, isCodeMode ? selectedLang : undefined);
    toast.success("custom text saved");
    setOpen(false);
  }

  function resetToDefault() {
    if (isCodeMode && selectedLang && codeManifest[selectedLang]) {
      const chapters = codeManifest[selectedLang].chapters;
      const chapter = chapters[Math.floor(Math.random() * chapters.length)];
      const content = getCodeContent(selectedLang, chapter);
      if (content) { setDraft(content); return; }
    }
    setDraft(DEFAULT_CUSTOM_TEXT);
  }

  function clearAll() {
    setDraft("");
  }

  const dirty = draft !== value;
  const selectedLangEntry = selectedLang ? codeManifest[selectedLang] : undefined;
  const monacoLang = MONACO_LANG_MAP[selectedLang] ?? "plaintext";
  const monacoTheme = resolvedTheme === "light" ? "light" : "vs-dark";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[860px] w-[min(860px,calc(100vw-2rem))] h-[min(75dvh,560px)] p-0 overflow-hidden",
          "duration-300 ease-out",
          "data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-2",
          "data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-bottom-2",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full md:grid md:grid-cols-[1.6fr_1fr]">
          {/* Left column: editor — fills full height */}
          <div className="flex flex-col gap-3 border-b border-border p-5 md:border-r md:border-b-0 min-h-0 overflow-hidden">
            <DialogHeader className="gap-1">
              <DialogTitle className="font-(family-name:--font-doto) text-2xl font-bold tracking-wide">
                {isCodeMode ? "Custom Code" : "Custom Text"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isCodeMode
                  ? "Edit code below. Line breaks create new lines with indentation."
                  : "Paste anything. Words split on whitespace. Test ends on the last word."}
              </DialogDescription>
            </DialogHeader>

            {isCodeMode && selectedLang ? (
              /* Monaco editor — flex-1 fills remaining column height */
              <div className="flex-1 min-h-0 overflow-hidden rounded-md border border-border">
                <MonacoEditor
                  height="100%"
                  language={monacoLang}
                  theme={monacoTheme}
                  value={draft}
                  onChange={(v) => setDraft(v ?? "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    overviewRulerLanes: 0,
                    scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                    padding: { top: 10, bottom: 10 },
                    renderLineHighlight: "none",
                    folding: false,
                    contextmenu: false,
                  }}
                />
              </div>
            ) : (
              /* Plain textarea — flex-1 fills remaining column height */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative flex-1 min-h-0"
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  spellCheck={false}
                  placeholder="Paste your text here…"
                  className={cn(
                    "font-mono block h-full w-full resize-none rounded-md border border-border bg-background/40 p-3 text-sm leading-relaxed text-foreground",
                    "placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
                    overLimit && "border-destructive focus-visible:ring-destructive/40",
                  )}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute right-3 bottom-2 font-mono text-[10px] uppercase tracking-widest",
                    overLimit ? "text-destructive" : "text-muted-foreground/50",
                  )}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/60">
              <span>
                <span className="text-primary tabular-nums">{wordCount}</span> words
              </span>
              <span className="opacity-40">·</span>
              <span>
                <span className="text-primary tabular-nums">{charCount}</span> chars
              </span>
              {dirty && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="text-primary">unsaved</span>
                </>
              )}
            </div>
          </div>

          {/* Right column: actions */}
          <div className="flex flex-col gap-4 p-5 overflow-y-auto">
            <section className="flex flex-col gap-2">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Source
              </h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex items-center gap-3 rounded-md border border-dashed border-border px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                <IconUpload size={16} stroke={1.5} className="shrink-0" />
                <span className="flex flex-col leading-tight">
                  <span className="font-medium text-foreground">
                    {isCodeMode ? "Upload code file" : "Upload .txt"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {isCodeMode
                      ? ".js .ts .py .go .rs .c .lua .sh .dart"
                      : "or drop one onto the editor"}
                  </span>
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={isCodeMode
                  ? Object.keys(EXT_TO_LANG).map((e) => `.${e}`).join(",")
                  : ".txt,text/plain"}
                onChange={(e) => {
                  void handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </section>

            <div className="h-px bg-border" />

            {/* Code mode toggle */}
            <section className="flex flex-col gap-3">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Code
              </h3>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                  <IconCode size={12} />
                  Code mode
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCodeMode;
                    setIsCodeMode(next);
                    localStorage.setItem(DIALOG_CODE_MODE_KEY, String(next));
                    if (!next) { setSelectedLang(""); localStorage.removeItem(DIALOG_CODE_LANG_KEY); }
                  }}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer",
                    isCodeMode ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform duration-200",
                      isCodeMode && "translate-x-4"
                    )}
                  />
                </button>
              </div>

              <Popover open={isCodeMode && langPickerOpen} onOpenChange={(v) => isCodeMode && setLangPickerOpen(v)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={!isCodeMode}
                    aria-expanded={langPickerOpen}
                    className={cn(
                      "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-xs transition-colors outline-none",
                      isCodeMode
                        ? "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 cursor-pointer"
                        : "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <span className="min-w-0 truncate text-muted-foreground">
                      {selectedLangEntry ? selectedLangEntry.name : "Select language…"}
                    </span>
                    <CaretDownIcon
                      className="size-4 shrink-0 text-muted-foreground"
                      weight="bold"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="gap-0 p-0"
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {Object.values(codeManifest).map((lang) => (
                          <CommandItem
                            key={lang.code}
                            value={lang.code}
                            keywords={[lang.name]}
                            data-checked={selectedLang === lang.code ? true : undefined}
                            onSelect={() => {
                              setSelectedLang(lang.code);
                              localStorage.setItem(DIALOG_CODE_LANG_KEY, lang.code);
                              setLangPickerOpen(false);
                            }}
                          >
                            {lang.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </section>

            <div className="h-px bg-border" />

            <section className="flex flex-col gap-2">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Tools
              </h3>
              <button
                type="button"
                onClick={resetToDefault}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconSparkles size={14} stroke={1.5} />
                {isCodeMode && selectedLang ? "Load random sample" : "Load sample pangram"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconRotate size={14} stroke={1.5} />
                Clear editor
              </button>
            </section>

            <div className="h-px bg-border" />

            <section className="hidden md:flex flex-col gap-2 text-[10px] leading-relaxed text-muted-foreground/60">
              <h3 className="font-(family-name:--font-doto) text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Tips
              </h3>
              <p className="flex items-start gap-1.5">
                <IconFileText size={11} className="mt-[1px] shrink-0 opacity-60" />
                Punctuation and casing are preserved.
              </p>
              <p className="flex items-start gap-1.5">
                <IconFileText size={11} className="mt-[1px] shrink-0 opacity-60" />
                {isCodeMode
                  ? "Line breaks create new code lines with indentation."
                  : "Line breaks are collapsed into spaces."}
              </p>
            </section>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <CornerBrackets className="inline-flex">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={overLimit || draft.trim().length === 0 || (isCodeMode && !selectedLang)}
                  className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm bg-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save and Start
                </button>
              </CornerBrackets>
              <CornerBrackets className="w-full flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-1 text-center text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </CornerBrackets>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
