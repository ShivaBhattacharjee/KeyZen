"use client";

import { useEffect, useState } from "react";
import { useAppChrome } from "@/components/app-chrome";
import { motion } from "motion/react";
import { IconAt, IconClock, IconLetterA, IconQuote, IconMountain, IconNumber, IconFeather, IconFlame, IconTool, IconPencil, IconAdjustments, IconX, IconCode, } from "@tabler/icons-react";
import { CustomTextDialog } from "@/components/custom-text-dialog";
import type { QuoteLength } from "@/lib/quotes";
import type { Difficulty } from "@/lib/words";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, } from "@/components/animate-ui/components/animate/tabs";
import type { TestMode, TimeOption, WordOption } from "@/lib/test-storage";
import { Drawer, DrawerContent, DrawerTitle, } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle, } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";

export type CodeManifest = Record<string, { code: string; name: string; ext: string; chapters: string[] }>;

export interface TestControlsProps {
  mode: TestMode;
  timeOption: TimeOption;
  wordOption: WordOption;
  quoteLength: QuoteLength;
  punctuation: boolean;
  numbers: boolean;
  difficulty: Difficulty | undefined;
  customText: string;
  codeLanguage: string;
  codeChapter: string;
  codeManifest: CodeManifest;
  controlsVisible: boolean;
  onModeChange: (next: TestMode) => void;
  onTimeOptionChange: (next: TimeOption) => void;
  onWordOptionChange: (next: WordOption) => void;
  onQuoteLengthChange: (next: QuoteLength) => void;
  onPunctuationToggle: () => void;
  onNumbersToggle: () => void;
  onDifficultyToggle: (d: Difficulty) => void;
  onCustomTextChange: (next: string, codeLanguage?: string) => void;
  onCodeLanguageChange: (lang: string) => void;
  onCodeChapterChange: (chapter: string) => void;
  onRestart: () => void;
}

export function TestControls({
  mode, timeOption, wordOption, quoteLength,
  punctuation, numbers, difficulty, customText,
  codeLanguage, codeChapter, codeManifest,
  controlsVisible,
  onModeChange, onTimeOptionChange, onWordOptionChange, onQuoteLengthChange,
  onPunctuationToggle, onNumbersToggle, onDifficultyToggle, onCustomTextChange,
  onCodeLanguageChange, onCodeChapterChange, onRestart,
}: TestControlsProps) {
  const [drawerOpen, setDrawerOpenState] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { setTestSettingsOpen } = useAppChrome();

  const setDrawerOpen = (open: boolean) => {
    setDrawerOpenState(open);
    setTestSettingsOpen(open);
  };

  useEffect(() => {
    const check = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const btnClass = (active: boolean) => cn(
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
  );

  const drawerBtnClass = (active: boolean) => cn(
    "flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-colors border cursor-pointer",
    active
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border bg-zinc-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground hover:border-border/80",
  );

  const selectClass = "appearance-none bg-zinc-100 dark:bg-zinc-800 text-xs font-medium px-3 py-1.5 rounded-lg border-r-8 border-transparent outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer";

  const codeSelectTriggerClass = "data-[state=active]:text-primary text-muted-foreground inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors duration-500 ease-in-out hover:text-foreground disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-0 outline-none focus-visible:outline-none";

  const renderDropdownOptionClass = (active: boolean) => cn(
    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer w-full text-left",
    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 hover:text-foreground"
  );

  const codeSelectors = (
    <div className="bg-muted inline-flex h-9 items-center justify-center rounded-lg p-[3px]">
      <Popover>
        <PopoverTrigger asChild>
          <button className={codeSelectTriggerClass} data-state={codeLanguage ? "active" : "inactive"}>
            {Object.keys(codeManifest).length === 0 ? "Loading..." : codeLanguage && codeManifest[codeLanguage] ? codeManifest[codeLanguage].name : "Language"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5 bg-zinc-100 dark:bg-zinc-800 border-border rounded-lg flex flex-col shadow-sm" align="center" sideOffset={8}>
          {Object.values(codeManifest).map(lang => (
            <button
              type="button"
              key={lang.code}
              onClick={() => onCodeLanguageChange(lang.code)}
              className={renderDropdownOptionClass(codeLanguage === lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <button 
            className={codeSelectTriggerClass} 
            data-state={codeChapter ? "active" : "inactive"}
            disabled={!codeLanguage || !codeManifest[codeLanguage]}
          >
            {codeChapter ? codeChapter.replace(/_/g, " ") : "Chapter"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5 bg-zinc-100 dark:bg-zinc-800 border-border rounded-lg flex flex-col shadow-sm max-h-[300px] overflow-y-auto overflow-x-hidden" align="center" sideOffset={8} style={{ scrollbarWidth: "none" }}>
          {codeLanguage && codeManifest[codeLanguage]?.chapters.map(chap => (
            <button
              type="button"
              key={chap}
              onClick={() => onCodeChapterChange(chap)}
              className={renderDropdownOptionClass(codeChapter === chap)}
            >
              {chap.replace(/_/g, " ")}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );

  const settingsContent = (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-2">
      {/* Toggles + Difficulty — hidden in code and custom mode */}
      {mode !== "code" && mode !== "custom" && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Toggles</span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onPunctuationToggle} className={drawerBtnClass(punctuation)}>
                <IconAt size={18} />
                <span>punctuation</span>
              </button>
              <button type="button" onClick={onNumbersToggle} className={drawerBtnClass(numbers)}>
                <IconNumber size={18} />
                <span>numbers</span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Difficulty</span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onDifficultyToggle("easy")} className={drawerBtnClass(difficulty === "easy")}>
                <IconFeather size={18} />
                <span>easy</span>
              </button>
              <button type="button" onClick={() => onDifficultyToggle("hard")} className={drawerBtnClass(difficulty === "hard")}>
                <IconFlame size={18} />
                <span>hard</span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-border" />
        </>
      )}

      {/* Mode group */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Mode</span>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: "time",   icon: IconClock,    label: "time"   },
            { value: "words",  icon: IconLetterA,  label: "words"  },
            { value: "quote",  icon: IconQuote,    label: "quote"  },
            { value: "zen",    icon: IconMountain, label: "zen"    },
            { value: "code",   icon: IconCode,     label: "code"   },
            { value: "custom", icon: IconTool,     label: "custom" },
          ] as const).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onModeChange(value)}
              className={drawerBtnClass(mode === value)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {mode !== "zen" && (
        <>
          <div className="h-px w-full bg-border" />

          {/* Options group */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {mode === "words" ? "Word Count" : mode === "quote" ? "Quote Length" : mode === "custom" ? "Custom Text" : mode === "code" ? "Language / Chapter" : "Time (s)"}
            </span>
            {mode === "words" ? (
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onWordOptionChange(w as WordOption)}
                    className={drawerBtnClass(wordOption === w)}
                  >
                    <span className="text-base font-semibold">{w}</span>
                  </button>
                ))}
              </div>
            ) : mode === "quote" ? (
              <div className="grid grid-cols-3 gap-2">
                {(["short", "medium", "long"] as QuoteLength[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onQuoteLengthChange(q)}
                    className={drawerBtnClass(quoteLength === q)}
                  >
                    <span className="text-base font-semibold">{q}</span>
                  </button>
                ))}
              </div>
            ) : mode === "custom" ? (
              <CustomTextDialog
                value={customText}
                onSave={onCustomTextChange}
                codeManifest={codeManifest}
                trigger={
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-zinc-100 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground dark:bg-zinc-800 cursor-pointer"
                  >
                    <IconPencil size={15} />
                    change text
                  </button>
                }
              />
            ) : mode === "code" ? (
              <div className="flex flex-col gap-2">
                <select
                  value={codeLanguage}
                  onChange={(e) => {
                    const lang = codeManifest[e.target.value];
                    if (lang) onCodeLanguageChange(lang.code);
                  }}
                  className="rounded-xl border border-border bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 text-sm font-medium text-muted-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="" disabled hidden>Select language</option>
                  {Object.values(codeManifest).map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <select
                  value={codeChapter}
                  onChange={(e) => onCodeChapterChange(e.target.value)}
                  disabled={!codeLanguage || !codeManifest[codeLanguage]}
                  className="rounded-xl border border-border bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 text-sm font-medium text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
                >
                  <option value="" disabled hidden>Select chapter</option>
                  {codeLanguage && codeManifest[codeLanguage]?.chapters.map(chap => (
                    <option key={chap} value={chap}>{chap.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 60, 120].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onTimeOptionChange(t as TimeOption)}
                    className={drawerBtnClass(timeOption === t)}
                  >
                    <span className="text-base font-semibold">{t}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <motion.div
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn(
          "w-full",
          !controlsVisible && "pointer-events-none select-none",
        )}
      >
        {/* Desktop / large screen controls */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-6 whitespace-nowrap">
          {/* Toggles: punctuation / numbers / difficulty — hidden in code mode */}
          {mode !== "code" && mode !== "custom" && (
            <>
              <div className="flex flex-row items-center justify-center gap-1 rounded-lg p-1 bg-zinc-100 dark:bg-zinc-800">
                <button type="button" onClick={onPunctuationToggle} className={btnClass(punctuation)}>
                  <IconAt size={14} />
                  punctuation
                </button>
                <button type="button" onClick={onNumbersToggle} className={btnClass(numbers)}>
                  <IconNumber size={14} />
                  numbers
                </button>
                <div className="h-4 w-px shrink-0 bg-border" />
                <button type="button" onClick={() => onDifficultyToggle("easy")} className={btnClass(difficulty === "easy")}>
                  <IconFeather size={14} />
                  easy
                </button>
                <button type="button" onClick={() => onDifficultyToggle("hard")} className={btnClass(difficulty === "hard")}>
                  <IconFlame size={14} />
                  hard
                </button>
              </div>

              <div className="hidden h-4 w-px shrink-0 bg-border sm:block" />
            </>
          )}

          {/* Mode tabs */}
          <Tabs value={mode} onValueChange={(v) => onModeChange(v as TestMode)} className="flex items-center">
            <TabsList>
              {([
                { value: "time",   icon: IconClock,    label: "time"   },
                { value: "words",  icon: IconLetterA,  label: "words"  },
                { value: "quote",  icon: IconQuote,    label: "quote"  },
                { value: "zen",    icon: IconMountain, label: "zen"    },
                { value: "code",   icon: IconCode,     label: "code"   },
                { value: "custom", icon: IconTool,     label: "custom" },
              ] as const).map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value} className="gap-1.5 px-3 text-xs cursor-pointer">
                  <Icon size={13} />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {mode !== "zen" && (
            <>
              <div className="hidden h-4 w-px shrink-0 bg-border sm:block" />

              {mode === "words" ? (
                <Tabs value={String(wordOption)} onValueChange={(v) => onWordOptionChange(Number(v) as WordOption)} className="flex items-center">
                  <TabsList>
                    {[10, 25, 50, 100].map((w) => (
                      <TabsTrigger key={w} value={String(w)} className="px-3 text-xs cursor-pointer">{w}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              ) : mode === "quote" ? (
                <Tabs value={quoteLength} onValueChange={(v) => onQuoteLengthChange(v as QuoteLength)} className="flex items-center">
                  <TabsList>
                    {(["short", "medium", "long"] as QuoteLength[]).map((q) => (
                      <TabsTrigger key={q} value={q} className="px-3 text-xs cursor-pointer">{q}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              ) : mode === "custom" ? (
                <div className="bg-muted inline-flex h-9 items-center justify-center rounded-lg p-[3px]">
                  <CustomTextDialog
                    value={customText}
                    onSave={onCustomTextChange}
                    codeManifest={codeManifest}
                    trigger={
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md px-3 h-full text-xs font-medium text-foreground bg-background dark:bg-input/30 shadow-sm transition-colors focus-visible:outline-none cursor-pointer"
                      >
                        <IconPencil size={13} />
                        change
                      </button>
                    }
                  />
                </div>
              ) : mode === "code" ? (
                codeSelectors
              ) : (
                <Tabs value={String(timeOption)} onValueChange={(v) => onTimeOptionChange(Number(v) as TimeOption)} className="flex items-center">
                  <TabsList>
                    {[15, 30, 60, 120].map((t) => (
                      <TabsTrigger key={t} value={String(t)} className="px-3 text-xs cursor-pointer">{t}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

           
            </>
          )}
        </div>

        {/* Mobile / tablet button */}
        <div className="flex lg:hidden items-center justify-center mb-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              (document.activeElement as HTMLElement | null)?.blur();
              setDrawerOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-zinc-100 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground dark:bg-zinc-800 cursor-pointer"
          >
            <IconAdjustments size={16} />
            Test Settings
          </button>
        </div>
      </motion.div>

      {/* Mobile: bottom drawer */}
      {!isTablet && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent
            className="max-h-[90dvh]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DrawerTitle className="sr-only">Test Settings</DrawerTitle>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Test Settings
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <IconX size={14} />
              </button>
            </div>
            {settingsContent}
          </DrawerContent>
        </Drawer>
      )}

      {/* Tablet: centered dialog */}
      {isTablet && (
        <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogContent
            showCloseButton={false}
            className={cn(
              "max-w-lg sm:max-w-xl p-0 overflow-hidden",
              "duration-300 ease-out",
              "data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-2",
              "data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-bottom-2",
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogTitle className="sr-only">Test Settings</DialogTitle>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Test Settings
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <IconX size={14} />
              </button>
            </div>
            <div className="max-h-[75dvh] overflow-y-auto">
              {settingsContent}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
