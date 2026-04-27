"use client";

import { memo, useEffect, useState } from "react";
import { useAppChrome } from "@/components/app-chrome";
import { motion, AnimatePresence } from "motion/react";
import { IconAt, IconClock, IconLetterA, IconQuote, IconMountain, IconNumber, IconFeather, IconFlame, IconTool, IconPencil, IconAdjustments, IconX, IconCode, } from "@tabler/icons-react";
import { CustomTextDialog } from "@/components/custom-text-dialog";
import { CustomTimeDialog } from "@/components/custom-time-dialog";
import type { QuoteLength } from "@/lib/quotes";
import type { Difficulty } from "@/lib/words";
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, } from "@/components/animate-ui/components/animate/tabs";
import type { TestMode, TimeOption, WordOption } from "@/lib/test-storage";
import { Drawer, DrawerContent, DrawerTitle, } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle, } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";

import { CaretDownIcon } from "@phosphor-icons/react";

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

export const TestControls = memo(function TestControls({
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
  // Desktop-bar Popovers
  const [desktopLangOpen, setDesktopLangOpen] = useState(false);
  const [desktopChapterOpen, setDesktopChapterOpen] = useState(false);
  // Mobile/tablet drawer accordions
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [customVal, setCustomVal] = useState("");
  const [wordPopoverOpen, setWordPopoverOpen] = useState(false);
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
    "flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors border cursor-pointer",
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
      <Popover open={desktopLangOpen} onOpenChange={setDesktopLangOpen}>
        <PopoverTrigger asChild>
          <button className={codeSelectTriggerClass} data-state={codeLanguage ? "active" : "inactive"}>
            {Object.keys(codeManifest).length === 0 ? "Loading..." : codeLanguage && codeManifest[codeLanguage] ? codeManifest[codeLanguage].name : "Language"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5 bg-zinc-100 dark:bg-zinc-800 border-border rounded-lg flex flex-col shadow-sm" align="center" sideOffset={8}>
          <div className="px-1 pb-1.5 pt-1">
            <input
              type="text"
              placeholder="Search language..."
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              className="w-full bg-zinc-200/50 dark:bg-zinc-700/50 text-foreground px-2.5 py-1.5 rounded min-w-[140px] text-xs outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/70"
              autoFocus
            />
          </div>
          <div className="flex flex-col max-h-[300px] overflow-y-auto overflow-x-hidden pr-0.5 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
            {Object.values(codeManifest)
              .filter(lang =>
                !langSearch ||
                lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                lang.ext.toLowerCase().includes(langSearch.toLowerCase()) ||
                lang.code.toLowerCase().includes(langSearch.toLowerCase())
              )
              .map(lang => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => {
                    onCodeLanguageChange(lang.code);
                    setDesktopLangOpen(false);
                  }}
                  className={renderDropdownOptionClass(codeLanguage === lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            {Object.values(codeManifest).filter(lang =>
              !langSearch ||
              lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
              lang.ext.toLowerCase().includes(langSearch.toLowerCase()) ||
              lang.code.toLowerCase().includes(langSearch.toLowerCase())
            ).length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground w-[140px]">No results</p>
              )}
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={desktopChapterOpen} onOpenChange={setDesktopChapterOpen}>
        <PopoverTrigger asChild>
          <button
            className={codeSelectTriggerClass}
            data-state={codeChapter ? "active" : "inactive"}
            disabled={!codeLanguage || !codeManifest[codeLanguage]}
          >
            {codeChapter ? codeChapter.replace(/_/g, " ") : "Chapter"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5 bg-zinc-100 dark:bg-zinc-800 border-border rounded-lg flex flex-col shadow-sm max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar" align="center" sideOffset={8} style={{ scrollbarWidth: "thin" }}>
          {codeLanguage && codeManifest[codeLanguage]?.chapters.map(chap => (
            <button
              type="button"
              key={chap}
              onClick={() => {
                onCodeChapterChange(chap);
                setDesktopChapterOpen(false);
              }}
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
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">


      {/* Mode group */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Mode</span>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: "time", icon: IconClock, label: "time" },
            { value: "words", icon: IconLetterA, label: "words" },
            { value: "quote", icon: IconQuote, label: "quote" },
            { value: "zen", icon: IconMountain, label: "zen" },
            { value: "code", icon: IconCode, label: "code" },
            { value: "custom", icon: IconTool, label: "custom" },
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
                <div className="grid grid-cols-5 gap-2">
                  {[10, 25, 50, 100].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => onWordOptionChange(w)}
                      className={drawerBtnClass(wordOption === w)}
                    >
                      <span className="text-base font-semibold">{w}</span>
                    </button>
                  ))}
                  <Popover open={wordPopoverOpen} onOpenChange={setWordPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={drawerBtnClass(![10, 25, 50, 100].includes(wordOption))}
                      >
                        <IconTool size={18} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2" side="top" align="center">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Words</span>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          defaultValue={wordOption}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              const val = parseInt(e.currentTarget.value);
                              if (val > 0) {
                                onWordOptionChange(val);
                                setWordPopoverOpen(false);
                              }
                            }
                          }}
                          className="w-full rounded bg-muted px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
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
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-zinc-100 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground dark:bg-zinc-800 cursor-pointer"
                  >
                    <IconPencil size={15} />
                    change text
                  </button>
                }
              />
            ) : mode === "code" ? (
              <div className="grid grid-cols-2 gap-2 items-start">
                <div className="flex flex-col gap-2 w-full relative">
                  {/* Language picker — inline accordion (Popover portals are intercepted by vaul on mobile) */}
                  <button
                    type="button"
                    onClick={() => { setLangPickerOpen((v) => !v); setLangSearch(""); }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground cursor-pointer"
                  >
                    <span className="truncate">
                      {codeLanguage && codeManifest[codeLanguage] ? codeManifest[codeLanguage].name : "Select language"}
                    </span>
                    <CaretDownIcon
                      className={cn("size-4 shrink-0 transition-transform duration-200", langPickerOpen && "rotate-180")}
                      weight="bold"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {langPickerOpen && (
                      <motion.div
                        key="lang-accordion"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute top-[calc(100%+4px)] left-0 w-full z-50 overflow-hidden shadow-xl rounded-lg border border-border bg-zinc-100 dark:bg-zinc-800 flex flex-col max-h-40 md:max-h-56"
                      >
                        <div className="px-2 py-1.5 border-b border-border shrink-0">
                          <input
                            type="text"
                            placeholder="Search language..."
                            value={langSearch}
                            onChange={(e) => setLangSearch(e.target.value)}
                            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
                            autoFocus={false}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 p-1.5 overflow-y-auto custom-scrollbar flex-1">
                          {(() => {
                            const filtered = Object.values(codeManifest).filter(lang =>
                              !langSearch ||
                              lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                              lang.ext.toLowerCase().includes(langSearch.toLowerCase()) ||
                              lang.code.toLowerCase().includes(langSearch.toLowerCase())
                            )
                            return filtered.length > 0 ? (
                              filtered.map((lang) => (
                                <button
                                  type="button"
                                  key={lang.code}
                                  onClick={() => { onCodeLanguageChange(lang.code); setLangPickerOpen(false); setLangSearch(""); }}
                                  className={renderDropdownOptionClass(codeLanguage === lang.code)}
                                >
                                  {lang.name}
                                </button>
                              ))
                            ) : (
                              <p className="py-3 text-center text-xs text-muted-foreground">No results</p>
                            )
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2 w-full relative">
                  {/* Chapter picker — inline accordion */}
                  <button
                    type="button"
                    disabled={!codeLanguage || !codeManifest[codeLanguage]}
                    onClick={() => setChapterPickerOpen((v) => !v)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">
                      {codeChapter ? codeChapter.replace(/_/g, " ") : "Select chapter"}
                    </span>
                    <CaretDownIcon
                      className={cn("size-4 shrink-0 transition-transform duration-200", chapterPickerOpen && "rotate-180")}
                      weight="bold"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {chapterPickerOpen && codeLanguage && codeManifest[codeLanguage] && (
                      <motion.div
                        key="chapter-accordion"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute top-[calc(100%+4px)] left-0 w-full z-50 overflow-hidden shadow-xl rounded-lg border border-border bg-zinc-100 dark:bg-zinc-800 flex flex-col max-h-40 md:max-h-56"
                      >
                        <div className="flex flex-col gap-0.5 p-1.5 overflow-y-auto custom-scrollbar flex-1">
                          {codeManifest[codeLanguage].chapters.map((chap) => (
                            <button
                              type="button"
                              key={chap}
                              onClick={() => { onCodeChapterChange(chap); setChapterPickerOpen(false); }}
                              className={renderDropdownOptionClass(codeChapter === chap)}
                            >
                              {chap.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
                <div className="grid grid-cols-5 gap-2">
                  {[15, 30, 60, 120].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onTimeOptionChange(t)}
                      className={drawerBtnClass(timeOption === t)}
                    >
                      <span className="text-base font-semibold">{t}</span>
                    </button>
                  ))}
                  <CustomTimeDialog
                    timeOption={timeOption}
                    onSave={onTimeOptionChange}
                    trigger={
                      <button
                        type="button"
                        className={drawerBtnClass(![15, 30, 60, 120].includes(timeOption))}
                      >
                        <IconTool size={18} />
                      </button>
                    }
                  />
                </div>
            )}
          </div>
        </>
      )}

      <div className="h-px w-full bg-border" />

      {/* Toggles + Difficulty — always visible, disabled in quote / code / custom mode */}
      {(() => {
        const disabled = mode === "quote" || mode === "code" || mode === "custom";
        const tip = mode === "quote" ? "Not available in quote mode" : mode === "code" ? "Not available in code mode" : "Not available in custom mode";
        return (
          <TooltipProvider delayDuration={200}>
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Difficulty</span>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "easy", icon: IconFeather, label: "easy", active: difficulty === "easy", d: "easy" as const },
                    { key: "hard", icon: IconFlame, label: "hard", active: difficulty === "hard", d: "hard" as const },
                  ] as const).map(({ key, icon: Icon, label, active, d }) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={disabled ? undefined : () => onDifficultyToggle(d)}
                          className={cn(drawerBtnClass(active), disabled && "opacity-35 cursor-not-allowed")}
                        >
                          <Icon size={18} />
                          <span>{label}</span>
                        </button>
                      </TooltipTrigger>
                      {disabled && <TooltipContent side="bottom">{tip}</TooltipContent>}
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Toggles</span>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "punctuation", icon: IconAt, label: "punctuation", active: punctuation, onClick: onPunctuationToggle },
                    { key: "numbers", icon: IconNumber, label: "numbers", active: numbers, onClick: onNumbersToggle },
                  ] as const).map(({ key, icon: Icon, label, active, onClick }) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={disabled ? undefined : onClick}
                          className={cn(drawerBtnClass(active), disabled && "opacity-35 cursor-not-allowed")}
                        >
                          <Icon size={18} />
                          <span>{label}</span>
                        </button>
                      </TooltipTrigger>
                      {disabled && <TooltipContent side="bottom">{tip}</TooltipContent>}
                    </Tooltip>
                  ))}
                </div>
              </div>
            </>
          </TooltipProvider>
        );
      })()}
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
          {/* Toggles: punctuation / numbers / difficulty — disabled in quote / code / custom mode */}
          {(() => {
            const disabled = mode === "quote" || mode === "code" || mode === "custom";
            const tip = mode === "quote" ? "Not available in quote mode" : mode === "code" ? "Not available in code mode" : mode === "custom" ? "Not available in custom mode" : "";
            return (
              <>
                <TooltipProvider delayDuration={200}>
                  <div className="flex flex-row items-center justify-center gap-1 rounded-lg p-1 bg-zinc-100 dark:bg-zinc-800">
                    {([
                      { key: "punctuation", icon: IconAt, label: "punctuation", active: punctuation, onClick: onPunctuationToggle },
                      { key: "numbers", icon: IconNumber, label: "numbers", active: numbers, onClick: onNumbersToggle },
                    ] as const).map(({ key, icon: Icon, label, active, onClick }) => (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={disabled ? undefined : onClick}
                            className={cn(btnClass(active), disabled && "opacity-35 cursor-not-allowed")}
                          >
                            <Icon size={14} />
                            {label}
                          </button>
                        </TooltipTrigger>
                        {disabled && <TooltipContent side="bottom">{tip}</TooltipContent>}
                      </Tooltip>
                    ))}
                    <div className="h-4 w-px shrink-0 bg-border" />
                    {([
                      { key: "easy", icon: IconFeather, label: "easy", active: difficulty === "easy", d: "easy" as const },
                      { key: "hard", icon: IconFlame, label: "hard", active: difficulty === "hard", d: "hard" as const },
                    ] as const).map(({ key, icon: Icon, label, active, d }) => (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={disabled ? undefined : () => onDifficultyToggle(d)}
                            className={cn(btnClass(active), disabled && "opacity-35 cursor-not-allowed")}
                          >
                            <Icon size={14} />
                            {label}
                          </button>
                        </TooltipTrigger>
                        {disabled && <TooltipContent side="bottom">{tip}</TooltipContent>}
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
                <div className="hidden h-4 w-px shrink-0 bg-border sm:block" />
              </>
            );
          })()}

          {/* Mode tabs */}
          <Tabs value={mode} onValueChange={(v) => onModeChange(v as TestMode)} className="flex items-center">
            <TabsList>
              {([
                { value: "time", icon: IconClock, label: "time" },
                { value: "words", icon: IconLetterA, label: "words" },
                { value: "quote", icon: IconQuote, label: "quote" },
                { value: "zen", icon: IconMountain, label: "zen" },
                { value: "code", icon: IconCode, label: "code" },
                { value: "custom", icon: IconTool, label: "custom" },
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
                <Tabs value={![10, 25, 50, 100].includes(wordOption) ? "custom" : String(wordOption)} onValueChange={(v) => { if (v !== "custom") onWordOptionChange(Number(v)) }} className="flex items-center">
                  <TabsList>
                    {[10, 25, 50, 100].map((w) => (
                      <TabsTrigger key={w} value={String(w)} className="px-3 text-xs cursor-pointer">{w}</TabsTrigger>
                    ))}
                    <Popover open={wordPopoverOpen} onOpenChange={setWordPopoverOpen}>
                      <PopoverTrigger asChild>
                        <TabsTrigger value="custom" className="px-3 text-xs cursor-pointer">
                          <IconTool size={13} className={cn(![10, 25, 50, 100].includes(wordOption) && "text-primary")} />
                        </TabsTrigger>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" sideOffset={12} align="center">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Words</span>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            defaultValue={wordOption}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === "Enter") {
                                const val = parseInt(e.currentTarget.value);
                                if (val > 0) {
                                  onWordOptionChange(val);
                                  setWordPopoverOpen(false);
                                }
                              }
                            }}
                            className="w-full rounded bg-muted px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
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
                <Tabs value={![15, 30, 60, 120].includes(timeOption) ? "custom" : String(timeOption)} onValueChange={(v) => { if (v !== "custom") onTimeOptionChange(Number(v)) }} className="flex items-center">
                  <TabsList>
                    {[15, 30, 60, 120].map((t) => (
                      <TabsTrigger key={t} value={String(t)} className="px-3 text-xs cursor-pointer">{t}</TabsTrigger>
                    ))}
                    <CustomTimeDialog
                      timeOption={timeOption}
                      onSave={onTimeOptionChange}
                      trigger={
                        <TabsTrigger value="custom" className="px-3 text-xs cursor-pointer">
                          <IconTool size={13} className={cn(![15, 30, 60, 120].includes(timeOption) && "text-primary")} />
                        </TabsTrigger>
                      }
                    />
                  </TabsList>
                </Tabs>
              )}


            </>
          )}
        </div>

        {/* Mobile / tablet button */}
        <div className="flex fixed z-50 left-0 right-0 lg:hidden items-center justify-center mb-5">
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
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ touchAction: "pan-y" }}
            >
              {settingsContent}
            </div>
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
});
