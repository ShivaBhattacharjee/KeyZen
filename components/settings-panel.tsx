"use client"

import { useEffect, useRef, useState } from "react"
import { IconX, IconLoader2, IconChevronDown } from "@tabler/icons-react"
import type { SoundPack } from "@/components/settings-context"
import { CaretDownIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { useSettings, ACCENT_COLORS, FONT_OPTIONS, FONT_SIZES, SOUND_PACKS } from "@/components/settings-context"
import { NextThemeSwitcher } from "@/components/kibo-ui/theme-switcher"


import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Language } from "@/lib/languages"
import { getLanguageManifest, isRTLLanguage } from "@/lib/languages"
import type { ThemeOption } from "@/app/api/themes/route"

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    accent, setAccent, font, setFont, showKeyboard, setShowKeyboard, keyboardStyle, setKeyboardStyle, soundEnabled, setSoundEnabled, clickSoundEnabled, setClickSoundEnabled, realtimeWpm, setRealtimeWpm, faahMode, setFaahMode, ghostMode, setGhostMode, shakeMode, setShakeMode, soundPack, setSoundPack, language, setLanguage, showDiacritics, setShowDiacritics, fontSize, setFontSize, syntaxHighlighting, setSyntaxHighlighting, autoPair, setAutoPair, showLineNumbers, setShowLineNumbers, soundPackLoading, colorTheme, setColorTheme,
  } = useSettings()
  const isRTL = isRTLLanguage(language)
  const [isMobile, setIsMobile] = useState(false)
  const [fontPickerOpen, setFontPickerOpen] = useState(false)
  const [fontSearch, setFontSearch] = useState("")
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const [themeSearch, setThemeSearch] = useState("")
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [langSearch, setLangSearch] = useState("")
  const [languages, setLanguages] = useState<Language[]>([])
  const [themes, setThemes] = useState<ThemeOption[]>([])
  const [cacheInfo, setCacheInfo] = useState<string | null>(null)
  const [showAllAccents, setShowAllAccents] = useState(false)

  const clearSWCache = async () => {
    if (!("caches" in window)) {
      setCacheInfo("Cache API not available")
      return
    }
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
    setCacheInfo(`Cleared ${keys.length} cache${keys.length !== 1 ? "s" : ""}`)
    setTimeout(() => setCacheInfo(null), 3000)
  }

  const selectedFont = FONT_OPTIONS.find((f) => f.id === font)
  const selectedLang = languages.find((l) => l.code === language)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (open && languages.length === 0) {
      getLanguageManifest().then(setLanguages)
    }
    if (open && themes.length === 0) {
      fetch("/api/themes").then((r) => r.json()).then(setThemes).catch(() => { })
    }
  }, [open, languages.length, themes.length])

  const swatchRef = useRef<HTMLDivElement>(null)

  const panelContent = (
    <div className="flex-1 space-y-7 overflow-y-auto px-4 py-5">
      <section className="flex items-center justify-between">
        <SectionLabel>Theme</SectionLabel>
        <NextThemeSwitcher />
      </section>

      {/* Color Theme Picker */}
      <section>
        <SectionLabel>Color Theme</SectionLabel>
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => { setThemePickerOpen((v) => !v); setThemeSearch("") }}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-xs transition-colors outline-none",
              "hover:bg-muted/50"
            )}
          >
            <span className="flex min-w-0 items-center gap-2 truncate">
              {/* Swatch for the selected theme */}
              {(() => {
                const active = themes.find((t) => t.id === colorTheme)
                const swatchColor = active?.primaryColor ?? `var(--primary)`
                return (
                  <span
                    className="size-3 shrink-0 rounded-full border border-black/10"
                    style={{ background: swatchColor }}
                  />
                )
              })()}
              {themes.find((t) => t.id === colorTheme)?.label ?? (
                colorTheme.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
              )}
            </span>
            <CaretDownIcon
              className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", themePickerOpen && "rotate-180")}
              weight="bold"
            />
          </button>
          <AnimatePresence initial={false}>
            {themePickerOpen && (
              <motion.div
                key="theme-list"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute top-[calc(100%+4px)] left-0 w-full z-50 overflow-hidden shadow-xl rounded-lg border border-border bg-background"
              >
                <div className="border-b border-border px-2 py-1.5">
                  <input
                    type="text"
                    placeholder="Search themes..."
                    value={themeSearch}
                    onChange={(e) => setThemeSearch(e.target.value)}
                    className="w-full bg-transparent text-[16px] md:text-xs outline-none placeholder:text-muted-foreground"
                    autoFocus={false}
                  />
                </div>
                <div className="flex flex-col p-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const q = themeSearch.trim().toLowerCase()
                    const filtered = q
                      ? themes.filter((t) => t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
                      : themes
                    return filtered.length > 0 ? (
                      filtered.map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => { setColorTheme(t.id, t.url, t.fontSans, t.fontMono); setThemePickerOpen(false); setThemeSearch("") }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors text-left",
                            colorTheme === t.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {/* Color swatch */}
                          <span
                            className="size-3 shrink-0 rounded-full border border-black/10"
                            style={{
                              background: t.primaryColor ?? `var(--primary)`,
                            }}
                          />
                          <span style={t.fontSans ? { fontFamily: t.fontSans } : undefined}>
                            {t.label}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-muted-foreground">No themes found</p>
                    )
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>


      <section>
        <SectionLabel>Accent</SectionLabel>
        <div ref={swatchRef} className="mt-3">
          <TooltipProvider delayDuration={300}>
            <div className="grid grid-cols-8 gap-1.5">
              {ACCENT_COLORS.slice(0, 7).map((c) => (
                <Tooltip key={c.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setAccent(c.id)}
                      className={cn(
                        "h-7 w-full rounded-sm transition-all duration-150",
                        accent === c.id
                          ? "opacity-100 outline outline-2 outline-offset-[-2px] outline-white/50"
                          : "opacity-40 hover:opacity-80"
                      )}
                      style={{ background: c.swatch }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{c.label}</TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowAllAccents((v) => !v)}
                    className="flex h-7 w-full items-center justify-center rounded-sm bg-blue-500/80 text-white opacity-80 transition-all duration-150 hover:opacity-100"
                  >
                    <motion.span
                      animate={{ rotate: showAllAccents ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="flex items-center justify-center"
                    >
                      <IconChevronDown size={13} />
                    </motion.span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{showAllAccents ? "Show less" : "Show more"}</TooltipContent>
              </Tooltip>
            </div>
            <AnimatePresence initial={false}>
              {showAllAccents && (
                <motion.div
                  key="extra-accents"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-visible"
                >
                  <div className="mt-1.5 grid grid-cols-8 gap-1.5">
                    {ACCENT_COLORS.slice(7).map((c) => (
                      <Tooltip key={c.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setAccent(c.id)}
                            className={cn(
                              "h-7 w-full rounded-sm transition-all duration-150",
                              accent === c.id
                                ? "opacity-100 outline outline-2 outline-offset-[-2px] outline-white/50"
                                : "opacity-40 hover:opacity-80"
                            )}
                            style={{ background: c.swatch }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{c.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TooltipProvider>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Sound"
          description="Audio feedback when typing"
        />
        <ToggleRow
          label="Keyboard sound"
          description="Play sounds as you type each key"
          enabled={soundEnabled}
          onToggle={() => setSoundEnabled(!soundEnabled)}
          disabledReason="keyboard not available on mobile"
        />
        <ToggleRow
          label="Click sound"
          description="Play a click sound on each keypress"
          enabled={clickSoundEnabled}
          onToggle={() => setClickSoundEnabled(!clickSoundEnabled)}
        />
      </section>

      {showKeyboard && !isMobile && (
        <section>
          <SectionHeader
            title="Keyboard Style"
            description="Choose between mechanical or flat Apple style"
          />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(["normal", "magic"] as const).map((style) => {
              const selected = keyboardStyle === style
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => setKeyboardStyle(style)}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-w-0 flex-col cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 text-center transition-colors outline-none",
                    "hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-input bg-background text-muted-foreground"
                  )}
                >
                  <div className="relative flex items-center justify-center h-8">
                    {style === "normal" ? (
                      <KeyboardStyleNormalIcon selected={selected} />
                    ) : (
                      <KeyboardStyleMagicIcon selected={selected} />
                    )}
                  </div>
                  <span className="w-full text-[10px] leading-tight font-medium wrap-break-word">
                    {style === "normal" ? "Mechanical" : "Magic"}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {soundEnabled && !isMobile && (
        <section>
          <SectionHeader
            title="Sound Pack"
            description="Choose the sound your keyboard makes when you type"
          />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {SOUND_PACKS.map((s) => {
              const selected = soundPack === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSoundPack(s.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-w-0 flex-col cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 text-center transition-colors outline-none",
                    "hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-input bg-background text-muted-foreground"
                  )}
                >
                  <div className="relative flex items-center justify-center">
                    <SwitchIcon pack={s.id} selected={selected} />
                    {selected && soundPackLoading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded bg-background/50 backdrop-blur-[1px]">
                        <IconLoader2 className="animate-spin text-primary" size={18} />
                      </div>
                    )}
                  </div>
                  <span className="w-full text-[10px] leading-tight font-medium wrap-break-word">
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Language — kept near top so users don't have to scroll far */}
      <section>
        <SectionLabel>Language</SectionLabel>
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => { setLangPickerOpen((v) => !v); setLangSearch("") }}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-xs transition-colors outline-none",
              "hover:bg-muted/50"
            )}
          >
            <span className="min-w-0 truncate">{selectedLang?.name ?? language}</span>
            <CaretDownIcon
              className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", langPickerOpen && "rotate-180")}
              weight="bold"
            />
          </button>
          <AnimatePresence initial={false}>
            {langPickerOpen && (
              <motion.div
                key="lang-list"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute top-[calc(100%+4px)] left-0 w-full z-50 overflow-hidden shadow-xl rounded-lg border border-border bg-background"
              >
                <div className="border-b border-border px-2 py-1.5">
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full bg-transparent text-[16px] md:text-xs outline-none placeholder:text-muted-foreground"
                    autoFocus={false}
                  />
                </div>
                <div className="flex flex-col p-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const q = langSearch.trim().toLowerCase()
                    const filtered = q
                      ? languages.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q))
                      : languages
                    return filtered.length > 0 ? (
                      filtered.map((l) => (
                        <button
                          type="button"
                          key={l.code}
                          onClick={() => { setLanguage(l.code); setLangPickerOpen(false); setLangSearch("") }}
                          className={cn(
                            "flex w-full items-center rounded-md px-2 py-1.5 text-xs text-left transition-colors",
                            language === l.code
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {l.name}
                        </button>
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-muted-foreground">No languages found</p>
                    )
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Font + Font Size side by side */}
      <section>
        <div className="grid grid-cols-[1.7fr_2fr] gap-4">
          <div>
            <SectionLabel>Font</SectionLabel>
            <div className="relative mt-3">
              <button
                type="button"
                onClick={() => { setFontPickerOpen((v) => !v); setFontSearch("") }}
                className={cn(
                  "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-xs transition-colors outline-none",
                  "hover:bg-muted/50"
                )}
              >
                <span className="min-w-0 truncate" style={{ fontFamily: selectedFont?.cssFamily }}>
                  {selectedFont?.label ?? font}
                </span>
                <CaretDownIcon
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", fontPickerOpen && "rotate-180")}
                  weight="bold"
                />
              </button>
              <AnimatePresence initial={false}>
                {fontPickerOpen && (
                  <motion.div
                    key="font-list"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute top-[calc(100%+4px)] left-0 w-full z-50 overflow-hidden shadow-xl rounded-lg border border-border bg-background"
                  >
                    <div className="border-b border-border px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="Search fonts..."
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                        className="w-full bg-transparent text-[16px] md:text-xs outline-none placeholder:text-muted-foreground"
                        autoFocus={false}
                      />
                    </div>
                    <div className="flex flex-col p-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {(() => {
                        const q = fontSearch.trim().toLowerCase()
                        const filtered = q
                          ? FONT_OPTIONS.filter((f) => f.label.toLowerCase().includes(q) || (f.tag ?? "").toLowerCase().includes(q))
                          : null

                        const renderItem = (f: (typeof FONT_OPTIONS)[number]) => (
                          <button
                            type="button"
                            key={f.id}
                            onClick={() => { setFont(f.id); setFontPickerOpen(false); setFontSearch("") }}
                            className={cn(
                              "flex w-full items-center rounded-md px-2 py-1.5 text-xs transition-colors text-left",
                              font === f.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <span style={{ fontFamily: f.cssFamily }}>{f.label}</span>
                          </button>
                        )

                        if (filtered) {
                          return filtered.length > 0 ? filtered.map(renderItem) : (
                            <p className="py-4 text-center text-xs text-muted-foreground">No fonts found</p>
                          )
                        }

                        return (
                          <>
                            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Mono</p>
                            {FONT_OPTIONS.filter((f) => f.tag === "mono").map(renderItem)}
                            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Display</p>
                            {FONT_OPTIONS.filter((f) => f.tag === "display").map(renderItem)}
                            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Serif</p>
                            {FONT_OPTIONS.filter((f) => f.tag === "serif").map(renderItem)}
                            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Handwriting</p>
                            {FONT_OPTIONS.filter((f) => f.tag === "handwriting").map(renderItem)}
                          </>
                        )
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <SectionLabel>Font Size</SectionLabel>
            <div className="mt-3 grid grid-cols-5 gap-1">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFontSize(s.id)}
                  aria-pressed={fontSize === s.id}
                  className={cn(
                    "flex items-center justify-center rounded-lg border py-1.5 text-[10px] font-semibold transition-colors outline-none",
                    "hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    fontSize === s.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-input bg-background text-muted-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Interface"
          description="Customize the typing test layout and display"
        />
        <ToggleRow
          label="Show keyboard"
          description="Display a keyboard at the bottom of the screen"
          enabled={showKeyboard}
          onToggle={() => setShowKeyboard(!showKeyboard)}
          disabledReason="keyboard not available on mobile"
        />

        <ToggleRow
          label="Realtime stats"
          description="Show WPM and accuracy while typing"
          enabled={realtimeWpm}
          onToggle={() => setRealtimeWpm(!realtimeWpm)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Code"
          description="Editor features for code snippets"
        />
        <ToggleRow
          label="Syntax highlighting"
          description="Colorize code keywords and strings"
          enabled={syntaxHighlighting}
          onToggle={() => setSyntaxHighlighting(!syntaxHighlighting)}
        />
        <ToggleRow
          label="Auto pair"
          description="Automatically close brackets and quotes"
          enabled={autoPair}
          onToggle={() => setAutoPair(!autoPair)}
        />
        <ToggleRow
          label="Line numbers"
          description="Show line numbers alongside code"
          enabled={showLineNumbers}
          onToggle={() => setShowLineNumbers(!showLineNumbers)}
        />
        {isRTL && (
          <ToggleRow
            label="Diacritics"
            description="Show accent marks on characters"
            enabled={showDiacritics}
            onToggle={() => setShowDiacritics(!showDiacritics)}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Modes"
          description="Fun visual effects and challenges"
        />
        <ToggleRow
          label="Shake mode"
          description="Screen shakes when you press a wrong key"
          enabled={shakeMode}
          onToggle={() => setShakeMode(!shakeMode)}
        />
        <ToggleRow
          label="Faah mode"
          description="Words must be typed twice to be completed"
          enabled={faahMode}
          onToggle={() => setFaahMode(!faahMode)}
        />
        <ToggleRow
          label="Ghost mode"
          description="Next word stays hidden until current one is typed"
          enabled={ghostMode}
          onToggle={() => setGhostMode(!ghostMode)}
        />
      </section>

      <section>
        <SectionLabel>Cache</SectionLabel>
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={() => void clearSWCache()}
            className="flex h-8 w-full items-center justify-center rounded-lg border border-input bg-background px-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            Clear SW Cache
          </button>
          <AnimatePresence>
            {cacheInfo && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[10px] text-primary"
              >
                {cacheInfo}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => { if (!v) onClose() }}>
        <DrawerContent className="max-h-[90dvh]">
          <DrawerTitle className="sr-only">Settings</DrawerTitle>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Settings
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconX size={14} />
            </button>
          </div>
          {panelContent}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed top-0 right-0 z-50 flex h-full w-[440px] flex-col border-l border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Settings
              </span>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconX size={14} />
              </button>
            </div>
            {panelContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

const SWITCH_STEM_COLORS: Record<SoundPack, string> = {
  "default": "var(--color-primary)",
  "cherrymx-black-pbt": "#2b2b2b",
  "cherrymx-blue-pbt": "#2f6fe0",
  "cherrymx-brown-pbt": "#8a5a2b",
  "cherrymx-red-pbt": "#d7373f",
  "mx-speed-silver": "#c4ccd4",
  "eg-oreo": "#1a1a2e",
  "topre-purple": "#8b5cf6",
  "creams": "#f0d9c6",
  "banana-split-lubed": "#ffe135",
}

function SwitchIcon({ pack, selected }: { pack: SoundPack; selected: boolean }) {
  const stem = SWITCH_STEM_COLORS[pack]
  const isBlack = pack === "cherrymx-black-pbt" || pack === "eg-oreo"

  return (
    <svg
      viewBox="0 0 48 48"
      width={32}
      height={32}
      aria-hidden
      className={cn("shrink-0 transition-opacity", !selected && "opacity-80")}
    >
      {/* Outer housing — bottom base with slight shadow lip */}
      <rect
        x="4"
        y="10"
        width="40"
        height="34"
        rx="4"
        className="fill-muted-foreground/30"
      />
      {/* Top plate */}
      <rect
        x="6"
        y="7"
        width="36"
        height="33"
        rx="3.5"
        className="fill-muted-foreground/15 stroke-muted-foreground/40"
        strokeWidth="0.75"
      />
      {/* Inner recess where the stem sits */}
      <rect
        x="11"
        y="11"
        width="26"
        height="25"
        rx="2"
        className="fill-background/70"
      />
      {/* Cruciform stem — the Cherry MX signature */}
      <g transform="translate(24 23)">
        <rect
          x="-10"
          y="-3.25"
          width="20"
          height="6.5"
          rx="1.25"
          fill={stem}
          stroke={isBlack ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}
          strokeWidth="0.5"
        />
        <rect
          x="-3.25"
          y="-10"
          width="6.5"
          height="20"
          rx="1.25"
          fill={stem}
          stroke={isBlack ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}
          strokeWidth="0.5"
        />
        {/* Subtle top-left highlight on the stem for a hint of depth */}
        <rect
          x="-9"
          y="-2.5"
          width="18"
          height="1"
          rx="0.5"
          fill="rgba(255,255,255,0.22)"
        />
      </g>
    </svg>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </p>
      <p className="text-[10px] text-muted-foreground/60 leading-snug">{description}</p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  disabledReason,
}: {
  label: string
  description?: string
  enabled: boolean
  onToggle: () => void
  disabledReason?: string
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024
  const isDisabled = !!disabledReason && isMobile

  return (
    <div
      className="flex items-center justify-between"
      title={isDisabled ? disabledReason : undefined}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "text-[11px] font-semibold tracking-widest uppercase",
            isDisabled ? "text-muted-foreground/40" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-muted-foreground/50 leading-snug">
            {description}
          </span>
        )}
      </div>
      <button
        onClick={isDisabled ? undefined : onToggle}
        disabled={isDisabled}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors duration-200",
          isDisabled
            ? "cursor-not-allowed bg-muted opacity-40"
            : enabled
              ? "cursor-pointer bg-primary"
              : "cursor-pointer bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform duration-200",
            !isDisabled && enabled && "translate-x-4"
          )}
        />
      </button>
    </div>
  )
}

function KeyboardStyleNormalIcon({ selected }: { selected: boolean }) {
  return (
    <svg viewBox="0 0 48 48" width={32} height={32} className={cn("shrink-0 transition-opacity", !selected && "opacity-80")}>
      <rect x="6" y="6" width="36" height="36" rx="4" className="fill-muted-foreground/30" />
      <rect x="10" y="8" width="28" height="24" rx="3" className="fill-muted-foreground/50" />
    </svg>
  )
}

function KeyboardStyleMagicIcon({ selected }: { selected: boolean }) {
  return (
    <svg viewBox="0 0 48 48" width={32} height={32} className={cn("shrink-0 transition-opacity", !selected && "opacity-80")}>
      <rect x="4" y="16" width="40" height="16" rx="2" className="fill-muted-foreground/20 stroke-muted-foreground/40" strokeWidth="1" />
      <rect x="6" y="18" width="36" height="12" rx="1" className="fill-muted-foreground/40" />
    </svg>
  )
}
