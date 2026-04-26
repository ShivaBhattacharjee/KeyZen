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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>("teal");
  const [font, setFontState] = useState<TypingFont>("geist-mono");
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

  useMountEffect(() => {
    const savedAccent = localStorage.getItem("tc-accent") as AccentColor | null;
    const savedFont = localStorage.getItem("tc-font") as TypingFont | null;
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
