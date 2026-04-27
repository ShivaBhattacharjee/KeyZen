"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { syncKeyZenFavicon } from "@/lib/favicon-client";
import {
  FONT_OPTIONS,
  type AccentColor,
  type FontSize,
  type SoundPack,
  type TypingFont,
} from "@/lib/settings-data";

export type {
  AccentColor,
  FontOption,
  FontSize,
  SoundPack,
  SoundPackOption,
  TypingFont,
} from "@/lib/settings-data";

export {
  ACCENT_COLORS,
  FONT_OPTIONS,
  FONT_SIZES,
  SOUND_PACKS,
} from "@/lib/settings-data";

interface SettingsContextType {
  accent: AccentColor;
  setAccent: (c: AccentColor) => void;
  font: TypingFont;
  setFont: (f: TypingFont) => void;
  fontCssFamily: string;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  colorTheme: string;
  themeLoading: boolean;
  setColorTheme: (t: string, url: string | null, fontSans?: string | null, fontMono?: string | null) => void;
  showKeyboard: boolean;
  setShowKeyboard: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  clickSoundEnabled: boolean;
  setClickSoundEnabled: (v: boolean) => void;
  realtimeWpm: boolean;
  setRealtimeWpm: (v: boolean) => void;
  faahMode: boolean;
  setFaahMode: (v: boolean) => void;
  ghostMode: boolean;
  setGhostMode: (v: boolean) => void;
  shakeMode: boolean;
  setShakeMode: (v: boolean) => void;
  soundPack: SoundPack;
  setSoundPack: (p: SoundPack) => void;
  language: string;
  setLanguage: (l: string) => void;
  showDiacritics: boolean;
  setShowDiacritics: (v: boolean) => void;
  syntaxHighlighting: boolean;
  setSyntaxHighlighting: (v: boolean) => void;
  autoPair: boolean;
  setAutoPair: (v: boolean) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (v: boolean) => void;
  soundPackLoading: boolean;
  setSoundPackLoading: (v: boolean) => void;
  settingsLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

function loadGoogleFont(family: string) {
  const id = `gf-${family}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  document.head.appendChild(link);
}

function applyAccentToDom(accent: AccentColor) {
  document.documentElement.setAttribute("data-accent", accent);
  queueMicrotask(() => syncKeyZenFavicon());
}

function applyFontToDom(fontId: TypingFont) {
  const option = FONT_OPTIONS.find((f) => f.id === fontId);
  if (!option) return;
  if (option.googleFamily) loadGoogleFont(option.googleFamily);
  document.documentElement.style.setProperty("--typing-font", option.cssFamily);
}

const THEME_LINK_ID = "kz-color-theme";

/** System font keywords that don't need to be loaded from Google Fonts */
const SYSTEM_FONT_PREFIXES = ["ui-", "system-ui", "-apple-", "BlinkMacSystemFont"];

function isSystemFont(name: string): boolean {
  const n = name.replace(/['"/]/g, "").trim();
  return SYSTEM_FONT_PREFIXES.some((p) => n === p || n.startsWith(p));
}

/**
 * Load a Google Font by its display name (e.g. "Outfit", "Plus Jakarta Sans").
 * Constructs a canonical Google Fonts v2 URL. No-ops for system fonts.
 */
function loadThemeGoogleFont(fontStack: string) {
  const firstName = fontStack.split(",")[0].replace(/['"/]/g, "").trim();
  if (!firstName || isSystemFont(firstName)) return;
  const encoded = firstName.replace(/\s+/g, "+");
  const id = `gf-theme-${encoded}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;700&display=swap`;
  document.head.appendChild(link);
}

/**
 * Override the --font-sans / --font-mono inline styles that Next.js injects
 * on <html> with the values from the theme CSS. Loads Google Fonts as needed.
 */
function applyThemeFontsToDom(fontSans: string | null, fontMono: string | null) {
  if (fontSans) {
    loadThemeGoogleFont(fontSans);
    document.documentElement.style.setProperty("--font-sans", fontSans);
  }
  if (fontMono) {
    loadThemeGoogleFont(fontMono);
    document.documentElement.style.setProperty("--font-mono", fontMono);
  }
}

/** Remove theme font overrides so Next.js CSS vars take effect again. */
function revertThemeFontsToDom() {
  document.documentElement.style.removeProperty("--font-sans");
  document.documentElement.style.removeProperty("--font-mono");
}

/**
 * Inject / swap the theme stylesheet. When url is null (default theme),
 * the sheet is removed. In both cases, the accent is always preserved
 * on data-accent so the user can still override theme colours.
 */
function applyColorThemeToDom(url: string | null, currentAccent: AccentColor, onLoad?: () => void) {
  const existing = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;

  document.documentElement.setAttribute("data-accent", currentAccent);

  if (!url) {
    existing?.remove();
    queueMicrotask(() => { syncKeyZenFavicon(); onLoad?.(); });
    return;
  }

  // Safety fallback in case the browser hangs on invalid @imports in raw CSS files
  let handled = false;
  const finish = () => {
    if (handled) return;
    handled = true;
    syncKeyZenFavicon();
    onLoad?.();
  };

  const timeoutId = setTimeout(finish, 2000);

  if (existing) {
    existing.onload = () => { clearTimeout(timeoutId); finish(); };
    existing.onerror = () => { clearTimeout(timeoutId); finish(); };
    existing.href = url;
  } else {
    const link = document.createElement("link");
    link.id = THEME_LINK_ID;
    link.rel = "stylesheet";
    link.onload = () => { clearTimeout(timeoutId); finish(); };
    link.onerror = () => { clearTimeout(timeoutId); finish(); };
    link.href = url;
    document.head.appendChild(link);
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>("teal");
  const [font, setFontState] = useState<TypingFont>("geist-mono");
  const [colorTheme, setColorThemeState] = useState<string>("default");
  const [themeLoading, setThemeLoading] = useState(false);
  const [showKeyboard, setShowKeyboardState] = useState(true);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [clickSoundEnabled, setClickSoundEnabledState] = useState(true);
  const [realtimeWpm, setRealtimeWpmState] = useState(false);
  const [faahMode, setFaahModeState] = useState(false);
  const [ghostMode, setGhostModeState] = useState(false);
  const [shakeMode, setShakeModeState] = useState(false);
  const [soundPack, setSoundPackState] = useState<SoundPack>("default");
  const [language, setLanguageState] = useState("english");
  const [showDiacritics, setShowDiacriticsState] = useState(true);
  const [fontSize, setFontSizeState] = useState<FontSize>("md");
  const [syntaxHighlighting, setSyntaxHighlightingState] = useState(true);
  const [autoPair, setAutoPairState] = useState(true);
  const [showLineNumbers, setShowLineNumbersState] = useState(true);
  const [soundPackLoading, setSoundPackLoading] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useMountEffect(() => {
    const savedAccent = localStorage.getItem("tc-accent") as AccentColor | null;
    const savedFont = localStorage.getItem("tc-font") as TypingFont | null;
    const savedColorTheme = localStorage.getItem("tc-color-theme");
    const savedColorThemeUrl = localStorage.getItem("tc-color-theme-url");
    const savedShowKeyboard = localStorage.getItem("tc-show-keyboard");
    const savedSoundEnabled = localStorage.getItem("tc-sound-enabled");
    const savedClickSoundEnabled = localStorage.getItem("tc-click-sound-enabled");
    const savedRealtimeWpm = localStorage.getItem("tc-realtime-wpm");
    const savedFaahMode = localStorage.getItem("tc-faah-mode");
    const savedGhostMode = localStorage.getItem("tc-ghost-mode");
    const savedShakeMode = localStorage.getItem("tc-shake-mode");
    const savedSoundPack = localStorage.getItem("tc-sound-pack") as SoundPack | null;
    const savedLanguage = localStorage.getItem("tc-language");
    const savedShowDiacritics = localStorage.getItem("tc-show-diacritics");
    const savedFontSize = localStorage.getItem("tc-font-size") as FontSize | null;
    const savedSyntaxHighlighting = localStorage.getItem("tc-syntax-highlighting");
    const savedAutoPair = localStorage.getItem("tc-auto-pair");
    const savedShowLineNumbers = localStorage.getItem("tc-show-line-numbers");

    const initialAccent = savedAccent ?? "teal";
    setAccentState(initialAccent);
    applyAccentToDom(initialAccent);

    if (savedFont) { setFontState(savedFont); applyFontToDom(savedFont); }
    if (savedColorTheme) {
      const savedFontSans = localStorage.getItem("tc-color-theme-font-sans");
      const savedFontMono = localStorage.getItem("tc-color-theme-font-mono");
      setColorThemeState(savedColorTheme);
      // Pass initialAccent so applyColorThemeToDom can restore data-accent if needed
      applyColorThemeToDom(savedColorThemeUrl ?? null, initialAccent);
      applyThemeFontsToDom(savedFontSans, savedFontMono);
    }
    if (savedShowKeyboard !== null) setShowKeyboardState(savedShowKeyboard !== "false");
    if (savedSoundEnabled !== null) setSoundEnabledState(savedSoundEnabled !== "false");
    if (savedClickSoundEnabled !== null) setClickSoundEnabledState(savedClickSoundEnabled !== "false");
    if (savedRealtimeWpm !== null) setRealtimeWpmState(savedRealtimeWpm === "true");
    if (savedFaahMode !== null) setFaahModeState(savedFaahMode === "true");
    if (savedGhostMode !== null) setGhostModeState(savedGhostMode === "true");
    if (savedShakeMode !== null) setShakeModeState(savedShakeMode === "true");
    if (savedSoundPack) setSoundPackState(savedSoundPack);
    if (savedLanguage) setLanguageState(savedLanguage);
    if (savedShowDiacritics !== null) setShowDiacriticsState(savedShowDiacritics !== "false");
    if (savedFontSize) setFontSizeState(savedFontSize);
    if (savedSyntaxHighlighting !== null) setSyntaxHighlightingState(savedSyntaxHighlighting !== "false");
    if (savedAutoPair !== null) setAutoPairState(savedAutoPair !== "false");
    if (savedShowLineNumbers !== null) setShowLineNumbersState(savedShowLineNumbers !== "false");
    setSettingsLoaded(true);
  });

  const setAccent = (c: AccentColor) => {
    setAccentState(c);
    applyAccentToDom(c);
    localStorage.setItem("tc-accent", c);
  };

  const setFont = (f: TypingFont) => {
    setFontState(f);
    applyFontToDom(f);
    localStorage.setItem("tc-font", f);
  };

  const setColorTheme = (t: string, url: string | null, fontSans?: string | null, fontMono?: string | null) => {
    setColorThemeState(t);
    setThemeLoading(true);
    
    // When changing a theme, automatically sync the accent to match the theme
    // (the user can still override it later via the accent picker)
    const newAccent = (t !== "default" ? t : "teal") as AccentColor;
    setAccentState(newAccent);
    localStorage.setItem("tc-accent", newAccent);

    // Auto-sync font if the theme specifies it
    if (fontMono) {
      const firstFont = fontMono.split(",")[0].replace(/['"/]/g, "").trim();
      const newFont = firstFont.toLowerCase().replace(/\s+/g, "-") as TypingFont;
      setFontState(newFont);
      applyFontToDom(newFont);
      localStorage.setItem("tc-font", newFont);
    } else if (t === "default") {
      // Revert to default font
      setFontState("geist-mono");
      applyFontToDom("geist-mono");
      localStorage.setItem("tc-font", "geist-mono");
    }

    applyColorThemeToDom(url, newAccent, () => setThemeLoading(false));
    if (url) {
      // Apply and persist font overrides
      applyThemeFontsToDom(fontSans ?? null, fontMono ?? null);
      localStorage.setItem("tc-color-theme-url", url);
      if (fontSans) localStorage.setItem("tc-color-theme-font-sans", fontSans);
      else localStorage.removeItem("tc-color-theme-font-sans");
      if (fontMono) localStorage.setItem("tc-color-theme-font-mono", fontMono);
      else localStorage.removeItem("tc-color-theme-font-mono");
    } else {
      // Revert fonts back to Next.js defaults
      revertThemeFontsToDom();
      localStorage.removeItem("tc-color-theme-url");
      localStorage.removeItem("tc-color-theme-font-sans");
      localStorage.removeItem("tc-color-theme-font-mono");
    }
    localStorage.setItem("tc-color-theme", t);
  };

  const setShowKeyboard = (v: boolean) => {
    setShowKeyboardState(v);
    localStorage.setItem("tc-show-keyboard", String(v));
  };

  const setSoundEnabled = (v: boolean) => {
    setSoundEnabledState(v);
    localStorage.setItem("tc-sound-enabled", String(v));
  };

  const setClickSoundEnabled = (v: boolean) => {
    setClickSoundEnabledState(v);
    localStorage.setItem("tc-click-sound-enabled", String(v));
  };

  const setRealtimeWpm = (v: boolean) => {
    setRealtimeWpmState(v);
    localStorage.setItem("tc-realtime-wpm", String(v));
  };

  const setFaahMode = (v: boolean) => {
    setFaahModeState(v);
    localStorage.setItem("tc-faah-mode", String(v));
  };

  const setGhostMode = (v: boolean) => {
    setGhostModeState(v);
    localStorage.setItem("tc-ghost-mode", String(v));
  };

  const setShakeMode = (v: boolean) => {
    setShakeModeState(v);
    localStorage.setItem("tc-shake-mode", String(v));
  };

  const setSoundPack = (p: SoundPack) => {
    setSoundPackState(p);
    localStorage.setItem("tc-sound-pack", p);
  };

  const setLanguage = (l: string) => {
    setLanguageState(l);
    localStorage.setItem("tc-language", l);
  };

  const setShowDiacritics = (v: boolean) => {
    setShowDiacriticsState(v);
    localStorage.setItem("tc-show-diacritics", String(v));
  };

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    localStorage.setItem("tc-font-size", s);
  };

  const setSyntaxHighlighting = (v: boolean) => {
    setSyntaxHighlightingState(v);
    localStorage.setItem("tc-syntax-highlighting", String(v));
  };

  const setAutoPair = (v: boolean) => {
    setAutoPairState(v);
    localStorage.setItem("tc-auto-pair", String(v));
  };

  const setShowLineNumbers = (v: boolean) => {
    setShowLineNumbersState(v);
    localStorage.setItem("tc-show-line-numbers", String(v));
  };

  const fontCssFamily =
    FONT_OPTIONS.find((f) => f.id === font)?.cssFamily ?? "var(--font-mono)";

  return (
    <SettingsContext.Provider
      value={{
        accent, setAccent,
        font, setFont, fontCssFamily,
        fontSize, setFontSize,
        colorTheme, setColorTheme, themeLoading,
        showKeyboard, setShowKeyboard,
        soundEnabled, setSoundEnabled,
        clickSoundEnabled, setClickSoundEnabled,
        realtimeWpm, setRealtimeWpm,
        faahMode, setFaahMode,
        ghostMode, setGhostMode,
        shakeMode, setShakeMode,
        soundPack, setSoundPack,
        language, setLanguage,
        showDiacritics, setShowDiacritics,
        syntaxHighlighting, setSyntaxHighlighting,
        autoPair, setAutoPair,
        showLineNumbers, setShowLineNumbers,
        soundPackLoading, setSoundPackLoading,
        settingsLoaded,
      }}
    >
      {children}
      {themeLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Applying Theme...</p>
        </div>
      )}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
