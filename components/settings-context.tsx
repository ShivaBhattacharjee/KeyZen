"use client";

import { createContext, useContext, useState, type ReactNode, } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { syncKeyZenFavicon } from "@/lib/favicon-client";

export type SoundPack = | "default" | "cherrymx-black-pbt" | "cherrymx-blue-pbt" | "cherrymx-brown-pbt" | "cherrymx-red-pbt" | "mx-speed-silver" | "eg-oreo" | "topre-purple";

export interface SoundPackOption {
  id: SoundPack;
  label: string;
  url: string;
  /** Optional mechvibes-style config.json with per-key offsets. Omit for the built-in default pack. */
  configUrl?: string;
}

export const SOUND_PACKS: SoundPackOption[] = [
  { id: "default",           label: "Classic",                url: "/sounds/sound.ogg" },
  { id: "cherrymx-black-pbt", label: "Cherry MX Black", url: "/sounds/cherrymx-black-pbt/sound.ogg", configUrl: "/sounds/cherrymx-black-pbt/config.json" },
  { id: "cherrymx-blue-pbt",  label: "Cherry MX Blue",  url: "/sounds/cherrymx-blue-pbt/sound.ogg",  configUrl: "/sounds/cherrymx-blue-pbt/config.json" },
  { id: "cherrymx-brown-pbt", label: "Cherry MX Brown ", url: "/sounds/cherrymx-brown-pbt/sound.ogg", configUrl: "/sounds/cherrymx-brown-pbt/config.json" },
  { id: "cherrymx-red-pbt",   label: "Cherry MX Red",   url: "/sounds/cherrymx-red-pbt/sound.ogg",   configUrl: "/sounds/cherrymx-red-pbt/config.json" },
  { id: "mx-speed-silver",    label: "MX Speed Silver", url: "/sounds/mx-speed-silver/mx-speed-silver-1.wav", configUrl: "/sounds/mx-speed-silver/config.json" },
  { id: "eg-oreo",            label: "EG Oreo",         url: "/sounds/eg-oreo/oreo.ogg",                      configUrl: "/sounds/eg-oreo/config.json" },
  { id: "topre-purple",       label: "Topre Purple",    url: "/sounds/topre-purple-hybrid-pbt/sound.ogg",      configUrl: "/sounds/topre-purple-hybrid-pbt/config.json" },
];

export type AccentColor = | "teal" | "red" | "amber" | "purple" | "green" | "rose" | "blue" | "orange" | "cyan" | "pink" | "indigo" | "lime" | "violet" | "lightgreen" | "sky" | "coral" | "mint" | "gold" | "lavender";
export type TypingFont =
  // Mono
  | "geist-mono" | "jetbrains-mono" | "fira-code" | "source-code-pro" | "ibm-plex-mono" | "roboto-mono" | "space-mono" | "inconsolata" | "cascadia-code" | "0xproto" | "overpass-mono" | "ubuntu-mono" | "oxygen-mono" | "courier-prime"
  // Display / Sans / Serif
  | "atkinson-hyperlegible" | "comfortaa" | "coming-soon" | "geist-sans" | "ibm-plex-sans" | "inter-tight" | "itim" | "kanit" | "lalezar" | "lato" | "lexend-deca" | "montserrat" | "nunito" | "oxygen" | "parkinsans" | "roboto" | "sarabun" | "space-grotesk" | "titillium-web" | "ubuntu" | "georgia" | "helvetica";

export interface FontOption {
  id: TypingFont;
  label: string;
  googleFamily: string | null; // null = already loaded / system font
  cssFamily: string;
  tag?: "mono" | "display";
}

export const FONT_OPTIONS: FontOption[] = [
  // ── Mono ──────────────────────────────────────────────────────────────────
  { id: "geist-mono",             label: "Geist Mono",             googleFamily: null,                                  cssFamily: "var(--font-mono)",         tag: "mono" },
  { id: "jetbrains-mono",         label: "JetBrains Mono",         googleFamily: "JetBrains+Mono:wght@400;500;700",     cssFamily: "'JetBrains Mono'",         tag: "mono" },
  { id: "fira-code",              label: "Fira Code",              googleFamily: "Fira+Code:wght@400;500;700",          cssFamily: "'Fira Code'",              tag: "mono" },
  { id: "source-code-pro",        label: "Source Code Pro",        googleFamily: "Source+Code+Pro:wght@400;500;700",    cssFamily: "'Source Code Pro'",        tag: "mono" },
  { id: "ibm-plex-mono",          label: "IBM Plex Mono",          googleFamily: "IBM+Plex+Mono:wght@400;500;700",     cssFamily: "'IBM Plex Mono'",          tag: "mono" },
  { id: "roboto-mono",            label: "Roboto Mono",            googleFamily: "Roboto+Mono:wght@400;500;700",        cssFamily: "'Roboto Mono'",            tag: "mono" },
  { id: "space-mono",             label: "Space Mono",             googleFamily: "Space+Mono:wght@400;700",             cssFamily: "'Space Mono'",             tag: "mono" },
  { id: "inconsolata",            label: "Inconsolata",            googleFamily: "Inconsolata:wght@400;500;700",        cssFamily: "'Inconsolata'",            tag: "mono" },
  { id: "cascadia-code",          label: "Cascadia Code",          googleFamily: "Cascadia+Code:wght@400;700",          cssFamily: "'Cascadia Code'",          tag: "mono" },
  { id: "0xproto",                label: "0xProto",                googleFamily: "0xProto:wght@400;700",                cssFamily: "'0xProto'",                tag: "mono" },
  { id: "overpass-mono",          label: "Overpass Mono",          googleFamily: "Overpass+Mono:wght@400;500;700",      cssFamily: "'Overpass Mono'",          tag: "mono" },
  { id: "ubuntu-mono",            label: "Ubuntu Mono",            googleFamily: "Ubuntu+Mono:wght@400;700",            cssFamily: "'Ubuntu Mono'",            tag: "mono" },
  { id: "oxygen-mono",            label: "Oxygen Mono",            googleFamily: "Oxygen+Mono",                         cssFamily: "'Oxygen Mono'",            tag: "mono" },
  { id: "courier-prime",          label: "Courier Prime",          googleFamily: "Courier+Prime:wght@400;700",          cssFamily: "'Courier Prime'",          tag: "mono" },
  // ── Display / Sans / Serif ────────────────────────────────────────────────
  { id: "atkinson-hyperlegible",  label: "Atkinson Hyperlegible",  googleFamily: "Atkinson+Hyperlegible:wght@400;700",  cssFamily: "'Atkinson Hyperlegible'",  tag: "display" },
  { id: "comfortaa",              label: "Comfortaa",              googleFamily: "Comfortaa:wght@400;500;700",          cssFamily: "'Comfortaa'",              tag: "display" },
  { id: "coming-soon",            label: "Coming Soon",            googleFamily: "Coming+Soon",                         cssFamily: "'Coming Soon'",            tag: "display" },
  { id: "geist-sans",             label: "Geist",                  googleFamily: "Geist:wght@400;500;700",              cssFamily: "'Geist'",                  tag: "display" },
  { id: "ibm-plex-sans",          label: "IBM Plex Sans",          googleFamily: "IBM+Plex+Sans:wght@400;500;700",      cssFamily: "'IBM Plex Sans'",          tag: "display" },
  { id: "inter-tight",            label: "Inter Tight",            googleFamily: "Inter+Tight:wght@400;500;700",        cssFamily: "'Inter Tight'",            tag: "display" },
  { id: "itim",                   label: "Itim",                   googleFamily: "Itim",                                cssFamily: "'Itim'",                   tag: "display" },
  { id: "kanit",                  label: "Kanit",                  googleFamily: "Kanit:wght@400;500;700",              cssFamily: "'Kanit'",                  tag: "display" },
  { id: "lalezar",                label: "Lalezar",                googleFamily: "Lalezar",                             cssFamily: "'Lalezar'",                tag: "display" },
  { id: "lato",                   label: "Lato",                   googleFamily: "Lato:wght@400;700",                   cssFamily: "'Lato'",                   tag: "display" },
  { id: "lexend-deca",            label: "Lexend Deca",            googleFamily: "Lexend+Deca:wght@400;500;700",        cssFamily: "'Lexend Deca'",            tag: "display" },
  { id: "montserrat",             label: "Montserrat",             googleFamily: "Montserrat:wght@400;500;700",         cssFamily: "'Montserrat'",             tag: "display" },
  { id: "nunito",                 label: "Nunito",                 googleFamily: "Nunito:wght@400;500;700",             cssFamily: "'Nunito'",                 tag: "display" },
  { id: "oxygen",                 label: "Oxygen",                 googleFamily: "Oxygen:wght@400;700",                 cssFamily: "'Oxygen'",                 tag: "display" },
  { id: "parkinsans",             label: "Parkinsans",             googleFamily: "Parkinsans:wght@400;500;700",         cssFamily: "'Parkinsans'",             tag: "display" },
  { id: "roboto",                 label: "Roboto",                 googleFamily: "Roboto:wght@400;500;700",             cssFamily: "'Roboto'",                 tag: "display" },
  { id: "sarabun",                label: "Sarabun",                googleFamily: "Sarabun:wght@400;500;700",            cssFamily: "'Sarabun'",                tag: "display" },
  { id: "space-grotesk",          label: "Space Grotesk",          googleFamily: "Space+Grotesk:wght@400;500;700",      cssFamily: "'Space Grotesk'",          tag: "display" },
  { id: "titillium-web",          label: "Titillium Web",          googleFamily: "Titillium+Web:wght@400;600;700",      cssFamily: "'Titillium Web'",          tag: "display" },
  { id: "ubuntu",                 label: "Ubuntu",                 googleFamily: "Ubuntu:wght@400;500;700",             cssFamily: "'Ubuntu'",                 tag: "display" },
  { id: "georgia",                label: "Georgia",                googleFamily: null,                                  cssFamily: "Georgia, serif",           tag: "display" },
  { id: "helvetica",              label: "Helvetica",              googleFamily: null,                                  cssFamily: "Helvetica, Arial, sans-serif", tag: "display" },
];

export const ACCENT_COLORS: { id: AccentColor; label: string; swatch: string }[] =
  [ { id: "teal", label: "Teal", swatch: "oklch(0.55 0.13 200)" }, { id: "red", label: "Red", swatch: "oklch(0.55 0.22 25)" }, { id: "amber", label: "Amber", swatch: "oklch(0.72 0.18 75)" }, { id: "purple", label: "Purple", swatch: "oklch(0.58 0.2 295)" }, { id: "green", label: "Green", swatch: "oklch(0.58 0.17 145)" }, { id: "rose", label: "Rose", swatch: "oklch(0.6 0.2 355)" }, { id: "blue", label: "Blue", swatch: "oklch(0.55 0.2 255)" }, { id: "orange", label: "Orange", swatch: "oklch(0.68 0.2 50)" }, { id: "cyan", label: "Cyan", swatch: "oklch(0.6 0.14 220)" }, { id: "pink", label: "Pink", swatch: "oklch(0.62 0.22 330)" }, { id: "indigo", label: "Indigo", swatch: "oklch(0.55 0.22 270)" }, { id: "lime", label: "Lime", swatch: "oklch(0.72 0.2 125)" }, { id: "violet", label: "Violet", swatch: "oklch(0.58 0.25 308)" }, { id: "lightgreen", label: "Light Green", swatch: "oklch(0.72 0.18 155)" }, { id: "sky", label: "Sky", swatch: "oklch(0.62 0.16 235)" }, { id: "coral", label: "Coral", swatch: "oklch(0.65 0.2 35)" }, { id: "mint", label: "Mint", swatch: "oklch(0.72 0.13 175)" }, { id: "gold", label: "Gold", swatch: "oklch(0.75 0.17 90)" }, { id: "lavender", label: "Lavender", swatch: "oklch(0.65 0.16 285)" }, ];

export type FontSize = "xs" | "sm" | "md" | "lg" | "xl";

export const FONT_SIZES: { id: FontSize; label: string; rem: string }[] = [
  { id: "xs", label: "XS", rem: "1rem" },
  { id: "sm", label: "SM", rem: "1.25rem" },
  { id: "md", label: "MD", rem: "1.5rem" },
  { id: "lg", label: "LG", rem: "1.875rem" },
  { id: "xl", label: "XL", rem: "2.25rem" },
];

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

  // Rule 4: one-time hydration from localStorage on mount, applying DOM side
  // effects inline here instead of in separate reactive useEffects.
  useMountEffect(() => {
    const savedAccent = localStorage.getItem("tc-accent") as AccentColor | null;
    const savedFont = localStorage.getItem("tc-font") as TypingFont | null;
    const savedShowKeyboard = localStorage.getItem("tc-show-keyboard");
    const savedSoundEnabled = localStorage.getItem("tc-sound-enabled");
    const savedRealtimeWpm = localStorage.getItem("tc-realtime-wpm");
    const savedFaahMode = localStorage.getItem("tc-faah-mode");
    const savedGhostMode = localStorage.getItem("tc-ghost-mode");
    const savedShakeMode = localStorage.getItem("tc-shake-mode");

    const initialAccent = savedAccent ?? "teal";
    setAccentState(initialAccent);
    applyAccentToDom(initialAccent);

    if (savedFont) {
      setFontState(savedFont);
      applyFontToDom(savedFont);
    }
    if (savedShowKeyboard !== null) setShowKeyboardState(savedShowKeyboard !== "false");
    if (savedSoundEnabled !== null) setSoundEnabledState(savedSoundEnabled !== "false");

    const savedClickSoundEnabled = localStorage.getItem("tc-click-sound-enabled");
    if (savedClickSoundEnabled !== null) setClickSoundEnabledState(savedClickSoundEnabled !== "false");
    if (savedRealtimeWpm !== null) setRealtimeWpmState(savedRealtimeWpm === "true");
    if (savedFaahMode !== null) setFaahModeState(savedFaahMode === "true");
    if (savedGhostMode !== null) setGhostModeState(savedGhostMode === "true");
    if (savedShakeMode !== null) setShakeModeState(savedShakeMode === "true");

    const savedSoundPack = localStorage.getItem("tc-sound-pack") as SoundPack | null;
    if (savedSoundPack) setSoundPackState(savedSoundPack);

    const savedLanguage = localStorage.getItem("tc-language");
    if (savedLanguage) setLanguageState(savedLanguage);

    const savedShowDiacritics = localStorage.getItem("tc-show-diacritics");
    if (savedShowDiacritics !== null) setShowDiacriticsState(savedShowDiacritics !== "false");

    const savedFontSize = localStorage.getItem("tc-font-size") as FontSize | null;
    if (savedFontSize) setFontSizeState(savedFontSize);

    const savedSyntaxHighlighting = localStorage.getItem("tc-syntax-highlighting");
    if (savedSyntaxHighlighting !== null) setSyntaxHighlightingState(savedSyntaxHighlighting !== "false");

    const savedAutoPair = localStorage.getItem("tc-auto-pair");
    if (savedAutoPair !== null) setAutoPairState(savedAutoPair !== "false");
  });

  // Rule 3: setAccent / setFont are event handlers that apply DOM changes
  // directly instead of relying on a reactive useEffect to "sync" them.
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

  const fontCssFamily =
    FONT_OPTIONS.find((f) => f.id === font)?.cssFamily ?? "var(--font-mono)";

  return (
    <SettingsContext.Provider
      value={{
        accent, setAccent,
        font, setFont, fontCssFamily,
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
        fontSize, setFontSize,
        syntaxHighlighting, setSyntaxHighlighting,
        autoPair, setAutoPair,
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
