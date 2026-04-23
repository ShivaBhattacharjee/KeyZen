"use client"

import { useEffect, useRef, useState } from "react"
import { IconX } from "@tabler/icons-react"
import type { SoundPack } from "@/components/settings-context"
import { CaretDownIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { useSettings, ACCENT_COLORS, FONT_OPTIONS, FONT_SIZES, SOUND_PACKS, } from "@/components/settings-context"
import { NextThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { Command, CommandGroup, CommandItem, CommandList, } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Language } from "@/lib/languages"
import { getLanguageManifest, isRTLLanguage } from "@/lib/languages"

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    accent, setAccent, font, setFont, showKeyboard, setShowKeyboard, soundEnabled, setSoundEnabled, clickSoundEnabled, setClickSoundEnabled, realtimeWpm, setRealtimeWpm, faahMode, setFaahMode, ghostMode, setGhostMode, shakeMode, setShakeMode, soundPack, setSoundPack, language, setLanguage, showDiacritics, setShowDiacritics, fontSize, setFontSize, syntaxHighlighting, setSyntaxHighlighting,
  } = useSettings()
  const isRTL = isRTLLanguage(language)
  const [isMobile, setIsMobile] = useState(false)
  const [fontPickerOpen, setFontPickerOpen] = useState(false)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])
  const [cacheInfo, setCacheInfo] = useState<string | null>(null)

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
  }, [open, languages.length])

  // Drag-to-scroll for color swatches
  const swatchRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ dragging: false, startX: 0, scrollLeft: 0 })

  const onMouseDown = (e: React.MouseEvent) => {
    const el = swatchRef.current
    if (!el) return
    dragState.current = {
      dragging: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    }
    el.style.cursor = "grabbing"
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.dragging || !swatchRef.current) return
    e.preventDefault()
    const x = e.pageX - swatchRef.current.offsetLeft
    const walk = x - dragState.current.startX
    swatchRef.current.scrollLeft = dragState.current.scrollLeft - walk
  }
  const onMouseUp = () => {
    dragState.current.dragging = false
    if (swatchRef.current) swatchRef.current.style.cursor = "grab"
  }

  const panelContent = (
    <div className="flex-1 space-y-7 overflow-y-auto px-4 py-5">
              <section className="flex items-center justify-between">
                <SectionLabel>Theme</SectionLabel>
                <NextThemeSwitcher />
              </section>

              {soundEnabled && !isMobile && (
                <section>
                  <SectionLabel>Keys</SectionLabel>
                  <div className="mt-3 grid grid-cols-3 gap-2">
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
                          <SwitchIcon pack={s.id} selected={selected} />
                          <span className="w-full text-[10px] leading-tight font-medium break-words">
                            {s.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              <section>
                <SectionLabel>Accent</SectionLabel>
                <div
                  ref={swatchRef}
                  className="mt-3 flex gap-2 overflow-x-auto pb-1 select-none"
                  style={{ cursor: "grab", scrollbarWidth: "none" }}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                >
                  <TooltipProvider delayDuration={300}>
                    {ACCENT_COLORS.map((c) => (
                      <Tooltip key={c.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setAccent(c.id)}
                            className={cn(
                              "h-7 w-12 shrink-0 rounded-sm transition-all duration-150",
                              accent === c.id
                                ? "opacity-100"
                                : "opacity-40 hover:opacity-80"
                            )}
                            style={{ background: c.swatch }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{c.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <ToggleRow
                  label="Show keyboard"
                  enabled={showKeyboard}
                  onToggle={() => setShowKeyboard(!showKeyboard)}
                  disabledReason="keyboard not available on mobile"
                />
                <ToggleRow
                  label="Keyboard sound"
                  enabled={soundEnabled}
                  onToggle={() => setSoundEnabled(!soundEnabled)}
                  disabledReason="keyboard not available on mobile"
                />
                <ToggleRow
                  label="Click sound"
                  enabled={clickSoundEnabled}
                  onToggle={() => setClickSoundEnabled(!clickSoundEnabled)}
                />
                <ToggleRow
                  label="Realtime stats"
                  enabled={realtimeWpm}
                  onToggle={() => setRealtimeWpm(!realtimeWpm)}
                />
                <ToggleRow
                  label="Syntax highlighting"
                  enabled={syntaxHighlighting}
                  onToggle={() => setSyntaxHighlighting(!syntaxHighlighting)}
                />
                {isRTL && (
                  <ToggleRow
                    label="Diacritics"
                    enabled={showDiacritics}
                    onToggle={() => setShowDiacritics(!showDiacritics)}
                  />
                )}
              </section>

              <section className="flex flex-col gap-3">
                <SectionLabel>Modes</SectionLabel>
                <ToggleRow
                  label="Shake mode"
                  enabled={shakeMode}
                  onToggle={() => setShakeMode(!shakeMode)}
                />
                <ToggleRow
                  label="Faah mode"
                  enabled={faahMode}
                  onToggle={() => setFaahMode(!faahMode)}
                />
                <ToggleRow
                  label="Ghost mode"
                  enabled={ghostMode}
                  onToggle={() => setGhostMode(!ghostMode)}
                />
              </section>

              <section>
                <SectionLabel>Font</SectionLabel>
                <Popover open={fontPickerOpen} onOpenChange={setFontPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-expanded={fontPickerOpen}
                      className={cn(
                        "mt-3 flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-xs transition-colors outline-none",
                        "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      )}
                    >
                      <span
                        className="min-w-0 truncate"
                        style={{ fontFamily: selectedFont?.cssFamily }}
                      >
                        {selectedFont?.label ?? font}
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
                    <Command shouldFilter={false}>
                      <CommandList>
                        <CommandGroup heading="Mono">
                          {FONT_OPTIONS.filter((f) => f.tag === "mono").map(
                            (f) => (
                              <CommandItem
                                key={f.id}
                                value={f.id}
                                data-checked={font === f.id ? true : undefined}
                                onSelect={() => {
                                  setFont(f.id)
                                  setFontPickerOpen(false)
                                }}
                              >
                                <span style={{ fontFamily: f.cssFamily }}>
                                  {f.label}
                                </span>
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                        <CommandGroup heading="Display">
                          {FONT_OPTIONS.filter((f) => f.tag === "display").map(
                            (f) => (
                              <CommandItem
                                key={f.id}
                                value={f.id}
                                data-checked={font === f.id ? true : undefined}
                                onSelect={() => {
                                  setFont(f.id)
                                  setFontPickerOpen(false)
                                }}
                              >
                                <span style={{ fontFamily: f.cssFamily }}>
                                  {f.label}
                                </span>
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </section>

              <section>
                <SectionLabel>Font Size</SectionLabel>
                <div className="mt-3 flex gap-1.5">
                  {FONT_SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFontSize(s.id)}
                      aria-pressed={fontSize === s.id}
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-lg border py-1.5 text-[11px] font-semibold transition-colors outline-none",
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
              </section>

              <section>
                <SectionLabel>Language</SectionLabel>
                <Popover open={langPickerOpen} onOpenChange={setLangPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-expanded={langPickerOpen}
                      className={cn(
                        "mt-3 flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-xs transition-colors outline-none",
                        "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      )}
                    >
                      <span className="min-w-0 truncate">
                        {selectedLang?.name ?? language}
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
                          {languages.map((l) => (
                            <CommandItem
                              key={l.code}
                              value={l.code}
                              keywords={[l.name]}
                              data-checked={
                                language === l.code ? true : undefined
                              }
                              onSelect={() => {
                                setLanguage(l.code)
                                setLangPickerOpen(false)
                              }}
                            >
                              {l.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
            className="fixed top-0 right-0 z-50 flex h-full w-72 flex-col border-l border-border bg-background shadow-2xl"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function ToggleRow({
  label,
  enabled,
  onToggle,
  disabledReason,
}: {
  label: string
  enabled: boolean
  onToggle: () => void
  disabledReason?: string
}) {
  // Use JS window check to detect mobile (lg = 1024px)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024
  const isDisabled = !!disabledReason && isMobile

  return (
    <div
      className="flex items-center justify-between"
      title={isDisabled ? disabledReason : undefined}
    >
      <span
        className={cn(
          "text-[11px] font-semibold tracking-widest uppercase",
          isDisabled ? "text-muted-foreground/40" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
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
