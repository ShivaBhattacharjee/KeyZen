"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
    IconBrightnessDown,
    IconBrightnessUp,
    IconCaretRightFilled,
    IconCaretUpFilled,
    IconChevronUp,
    IconMicrophone,
    IconMoon,
    IconPlayerSkipForward,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
    IconTable,
    IconVolume,
    IconVolume2,
    IconVolume3,
    IconSearch,
    IconWorld,
    IconCommand,
    IconCaretLeftFilled,
    IconCaretDownFilled,
} from "@tabler/icons-react";
import { getKeyboardLayout, QWERTY_LAYOUT, type KeyboardLayout } from "@/lib/keyboard-layouts";
import { toast } from "sonner";
import { flushSync } from "react-dom";
import { useWebHaptics } from "web-haptics/react";

// -----------------------------------------------------------------------------
// Types & Defaults
// -----------------------------------------------------------------------------

export type KeyboardEventSource = "physical" | "pointer";
export type KeyboardEventPhase = "down" | "up";

export interface KeyboardInteractionEvent {
    code: string;
    phase: KeyboardEventPhase;
    source: KeyboardEventSource;
}

export interface KeyboardProps {
    className?: string;
    enableHaptics?: boolean;
    enableSound?: boolean;
    soundUrl?: string;
    /** Optional mechvibes-style config.json URL; when present, its defines override the built-in offsets */
    soundConfigUrl?: string;
    onKeyEvent?: (event: KeyboardInteractionEvent) => void;
    /** Keep key-event listeners active even when the keyboard is not intersecting the viewport */
    forceActive?: boolean;
    /** When false, physical key presses are ignored (use when the typing area is not focused) */
    physicalKeysEnabled?: boolean;
    /** Language code to determine key labels (e.g. "english", "french", "russian") */
    language?: string;
    /** Callback fired when audio files start or stop loading */
    onAudioLoadingChange?: (isLoading: boolean) => void;
    showPreview?: boolean;
}

// Sound sprite definitions from keyboard.tsx for /sounds/sound.ogg
const MAGIC_SOUND_DEFINES_DOWN: Record<string, [number, number]> = {
    Escape: [9069, 115],
    F1: [2754, 104],
    F2: [3155, 99],
    F3: [3545, 103],
    F4: [3913, 100],
    F5: [4305, 96],
    F6: [4666, 103],
    F7: [5034, 110],
    F8: [5433, 103],
    F9: [7795, 109],
    F10: [6146, 105],
    F11: [7322, 97],
    F12: [7699, 98],
    F13: [2754, 104],
    F14: [3155, 99],
    Backquote: [9069, 115],
    Digit1: [2280, 109],
    Digit2: [9444, 102],
    Digit3: [9833, 103],
    Digit4: [10185, 107],
    Digit5: [10551, 108],
    Digit6: [10899, 107],
    Digit7: [11282, 99],
    Digit8: [11623, 103],
    Digit9: [11976, 110],
    Digit0: [12337, 108],
    Minus: [12667, 107],
    Equal: [13058, 105],
    Backspace: [13765, 101],
    Tab: [15916, 97],
    KeyQ: [16284, 83],
    KeyW: [16637, 97],
    KeyE: [16964, 105],
    KeyR: [17275, 102],
    KeyT: [17613, 108],
    KeyY: [17957, 95],
    KeyU: [18301, 105],
    KeyI: [18643, 110],
    KeyO: [18994, 98],
    KeyP: [19331, 108],
    BracketLeft: [19671, 94],
    BracketRight: [20020, 96],
    Backslash: [20387, 97],
    CapsLock: [22560, 100],
    KeyA: [22869, 109],
    KeyS: [23237, 98],
    KeyD: [23586, 103],
    KeyF: [23898, 98],
    KeyG: [24237, 102],
    KeyH: [24550, 106],
    KeyJ: [24917, 103],
    KeyK: [25274, 102],
    KeyL: [25625, 101],
    Semicolon: [25989, 100],
    Quote: [26335, 99],
    Enter: [26703, 100],
    ShiftLeft: [28109, 99],
    KeyZ: [28550, 92],
    KeyX: [28855, 101],
    KeyC: [29557, 112],
    KeyV: [29557, 112],
    KeyB: [29909, 98],
    KeyN: [30252, 112],
    KeyM: [30605, 101],
    Comma: [30965, 117],
    Period: [31315, 97],
    Slash: [31659, 96],
    ShiftRight: [28109, 99],
    Fn: [8036, 92],
    ControlLeft: [8036, 92],
    AltLeft: [34551, 96],
    MetaLeft: [34551, 96],
    Space: [33857, 100],
    MetaRight: [34181, 97],
    AltRight: [35878, 90],
    ArrowUp: [32429, 96],
    ArrowLeft: [36907, 90],
    ArrowDown: [37267, 94],
    ArrowRight: [37586, 88],
};

const MAGIC_SOUND_DEFINES_UP: Record<string, [number, number]> = {
    Escape: [9069 + 115, 94],
    F1: [2754 + 104, 85],
    F2: [3155 + 99, 81],
    F3: [3545 + 103, 84],
    F4: [3913 + 100, 83],
    F5: [4305 + 96, 78],
    F6: [4666 + 103, 84],
    F7: [5034 + 110, 90],
    F8: [5433 + 103, 84],
    F9: [7795 + 109, 89],
    F10: [6146 + 105, 86],
    F11: [7322 + 97, 80],
    F12: [7699 + 98, 80],
    F13: [2754 + 104, 85],
    F14: [3155 + 99, 81],
    Backquote: [9069 + 115, 94],
    Digit1: [2280 + 109, 90],
    Digit2: [9444 + 102, 83],
    Digit3: [9833 + 103, 84],
    Digit4: [10185 + 107, 87],
    Digit5: [10551 + 108, 88],
    Digit6: [10899 + 107, 87],
    Digit7: [11282 + 99, 81],
    Digit8: [11623 + 103, 85],
    Digit9: [11976 + 110, 90],
    Digit0: [12337 + 108, 89],
    Minus: [12667 + 107, 87],
    Equal: [13058 + 105, 86],
    Backspace: [13765 + 101, 83],
    Tab: [15916 + 97, 79],
    KeyQ: [16284 + 83, 67],
    KeyW: [16637 + 97, 79],
    KeyE: [16964 + 105, 85],
    KeyR: [17275 + 102, 83],
    KeyT: [17613 + 108, 88],
    KeyY: [17957 + 95, 78],
    KeyU: [18301 + 105, 85],
    KeyI: [18643 + 110, 90],
    KeyO: [18994 + 98, 80],
    KeyP: [19331 + 108, 89],
    BracketLeft: [19671 + 94, 77],
    BracketRight: [20020 + 96, 79],
    Backslash: [20387 + 97, 79],
    CapsLock: [22560 + 100, 81],
    KeyA: [22869 + 109, 89],
    KeyS: [23237 + 98, 80],
    KeyD: [23586 + 103, 84],
    KeyF: [23898 + 98, 81],
    KeyG: [24237 + 102, 83],
    KeyH: [24550 + 106, 86],
    KeyJ: [24917 + 103, 85],
    KeyK: [25274 + 102, 83],
    KeyL: [25625 + 101, 82],
    Semicolon: [25989 + 100, 82],
    Quote: [26335 + 99, 81],
    Enter: [26703 + 100, 81],
    ShiftLeft: [28109 + 99, 81],
    KeyZ: [28550 + 92, 75],
    KeyX: [28855 + 101, 83],
    KeyC: [29557 + 112, 92],
    KeyV: [29557 + 112, 92],
    KeyB: [29909 + 98, 81],
    KeyN: [30252 + 112, 91],
    KeyM: [30605 + 101, 83],
    Comma: [30965 + 117, 95],
    Period: [31315 + 97, 79],
    Slash: [31659 + 96, 79],
    ShiftRight: [28109 + 99, 81],
    Fn: [8036 + 92, 76],
    ControlLeft: [8036 + 92, 76],
    AltLeft: [34551 + 96, 79],
    MetaLeft: [34551 + 96, 79],
    Space: [33857 + 100, 82],
    MetaRight: [34181 + 97, 80],
    AltRight: [35878 + 90, 74],
    ArrowUp: [32429 + 96, 78],
    ArrowLeft: [36907 + 90, 73],
    ArrowDown: [37267 + 94, 76],
    ArrowRight: [37586 + 88, 72],
};

const DOM_CODE_TO_SCANCODES: Record<string, number[]> = {
    Escape: [1],
    Digit1: [2], Digit2: [3], Digit3: [4], Digit4: [5], Digit5: [6],
    Digit6: [7], Digit7: [8], Digit8: [9], Digit9: [10], Digit0: [11],
    Minus: [12], Equal: [13], Backspace: [14],
    Tab: [15],
    KeyQ: [16], KeyW: [17], KeyE: [18], KeyR: [19], KeyT: [20],
    KeyY: [21], KeyU: [22], KeyI: [23], KeyO: [24], KeyP: [25],
    BracketLeft: [26], BracketRight: [27],
    Enter: [28],
    ControlLeft: [29],
    KeyA: [30], KeyS: [31], KeyD: [32], KeyF: [33], KeyG: [34],
    KeyH: [35], KeyJ: [36], KeyK: [37], KeyL: [38],
    Semicolon: [39], Quote: [40], Backquote: [41],
    ShiftLeft: [42], Backslash: [43],
    KeyZ: [44], KeyX: [45], KeyC: [46], KeyV: [47], KeyB: [48],
    KeyN: [49], KeyM: [50],
    Comma: [51], Period: [52], Slash: [53],
    ShiftRight: [54],
    AltLeft: [56], Space: [57], CapsLock: [58],
    F1: [59], F2: [60], F3: [61], F4: [62], F5: [63],
    F6: [64], F7: [65], F8: [66], F9: [67], F10: [68],
    F11: [87], F12: [88],
    F13: [100, 88], F14: [101, 88],
    Fn: [29],
    ControlRight: [57373, 3613],
    AltRight: [57400, 3640],
    ArrowUp: [57416],
    ArrowLeft: [57419],
    ArrowRight: [57421],
    ArrowDown: [57424],
    MetaLeft: [57435, 3675],
    MetaRight: [57436, 3676],
};

// Map key codes to display labels
const KEY_DISPLAY_LABELS: Record<string, string> = {
    Escape: "esc",
    Backspace: "delete",
    Tab: "tab",
    Enter: "return",
    ShiftLeft: "shift",
    ShiftRight: "shift",
    ControlLeft: "control",
    ControlRight: "control",
    AltLeft: "option",
    AltRight: "option",
    MetaLeft: "command",
    MetaRight: "command",
    Space: "space",
    CapsLock: "caps",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    Backquote: "`",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
};

const getKeyDisplayLabel = (keyCode: string): string => {
    if (KEY_DISPLAY_LABELS[keyCode]) return KEY_DISPLAY_LABELS[keyCode];
    if (keyCode.startsWith("Key")) return keyCode.slice(3);
    if (keyCode.startsWith("Digit")) return keyCode.slice(5);
    if (keyCode.startsWith("F") && keyCode.length <= 3) return keyCode;
    return keyCode;
};

// -----------------------------------------------------------------------------
// Sound Processing
// -----------------------------------------------------------------------------

type PackKeyDef =
    | { kind: "slice"; start: number; duration: number }
    | { kind: "sample"; buffer: AudioBuffer };

interface ResolvedSoundPack {
    /** When true, release phase should be silent (pack has no per-key release sound). */
    singleSoundPerKey: boolean;
    defines: Record<string, PackKeyDef | null>;
}

const rawBufferCache = new Map<string, ArrayBuffer>();
const rawConfigCache = new Map<string, unknown>();

async function buildResolvedPack(
    audioContext: AudioContext,
    raw: { key_define_type?: "single" | "multi"; defines?: Record<string, unknown> },
    configUrl: string,
): Promise<ResolvedSoundPack> {
    const rawDefines = raw.defines ?? {};
    const baseUrl = configUrl.slice(0, configUrl.lastIndexOf("/") + 1);

    const uniqueFilenames = new Set<string>();
    for (const value of Object.values(rawDefines)) {
        if (typeof value === "string" && value.length > 0) {
            uniqueFilenames.add(value);
        }
    }

    const samplesEntries = await Promise.all(
        Array.from(uniqueFilenames).map(async (filename) => {
            try {
                const response = await fetch(baseUrl + filename);
                if (!response.ok) return [filename, null] as const;
                const arrayBuffer = await response.arrayBuffer();
                const buffer = await audioContext.decodeAudioData(arrayBuffer);
                return [filename, buffer] as const;
            } catch {
                return [filename, null] as const;
            }
        }),
    );
    const sampleBuffers = new Map<string, AudioBuffer | null>(samplesEntries);

    const defines: Record<string, PackKeyDef | null> = {};
    for (const [scancode, value] of Object.entries(rawDefines)) {
        if (Array.isArray(value) && value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
            defines[scancode] = { kind: "slice", start: value[0], duration: value[1] };
        } else if (typeof value === "string") {
            const buffer = sampleBuffers.get(value);
            defines[scancode] = buffer ? { kind: "sample", buffer } : null;
        } else {
            defines[scancode] = null;
        }
    }

    return { singleSoundPerKey: true, defines };
}

function resolveSoundDef(
    phase: KeyboardEventPhase,
    keyCode: string,
    pack: ResolvedSoundPack | null,
): PackKeyDef | undefined {
    if (pack) {
        if (phase === "up" && pack.singleSoundPerKey) return undefined;
        const scancodes = DOM_CODE_TO_SCANCODES[keyCode];
        if (!scancodes) return undefined;
        for (const scancode of scancodes) {
            const def = pack.defines[String(scancode)];
            if (def) return def;
        }
        return undefined;
    }
    const builtin = phase === "down" ? MAGIC_SOUND_DEFINES_DOWN[keyCode] : MAGIC_SOUND_DEFINES_UP[keyCode];
    if (!builtin) return undefined;
    return { kind: "slice", start: builtin[0], duration: builtin[1] };
}

// -----------------------------------------------------------------------------
// Keyboard Context
// -----------------------------------------------------------------------------

interface KeyboardContextType {
    layout: KeyboardLayout;
    pressedKeys: Set<string>;
    lastPressedKey: string | null;
    pressKey: (keyCode: string, source: KeyboardEventSource) => boolean;
    releaseKey: (keyCode: string, source: KeyboardEventSource) => void;
    triggerPointerHaptic: () => void;
}

const KeyboardContext = createContext<KeyboardContextType | null>(null);

const useKeyboard = () => {
    const context = useContext(KeyboardContext);
    if (!context) {
        throw new Error("useKeyboard must be used within KeyboardProvider");
    }
    return context;
};

const KeyboardProvider = ({
    children,
    enableHaptics = false,
    enableSound = false,
    soundUrl,
    soundConfigUrl,
    containerRef,
    onKeyEvent,
    forceActive = false,
    physicalKeysEnabled = true,
    layout,
    onAudioLoadingChange,
}: {
    children: React.ReactNode;
    enableHaptics?: boolean;
    enableSound?: boolean;
    soundUrl?: string;
    soundConfigUrl?: string;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onKeyEvent?: (event: KeyboardInteractionEvent) => void;
    forceActive?: boolean;
    physicalKeysEnabled?: boolean;
    layout: KeyboardLayout;
    onAudioLoadingChange?: (isLoading: boolean) => void;
}) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const soundPackRef = useRef<ResolvedSoundPack | null>(null);
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { trigger } = useWebHaptics();

    useEffect(() => {
        if (!enableSound || !soundUrl) {
            audioBufferRef.current = null;
            soundPackRef.current = null;
            return;
        }

        let cancelled = false;

        const initAudio = async () => {
            onAudioLoadingChange?.(true);
            try {
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;

                const fetchRawBuffer = rawBufferCache.has(soundUrl)
                    ? Promise.resolve(rawBufferCache.get(soundUrl)!)
                    : fetch(soundUrl)
                        .then((r) => (r.ok ? r.arrayBuffer() : null))
                        .then((ab) => { if (ab) rawBufferCache.set(soundUrl, ab); return ab; });

                const fetchConfig = soundConfigUrl
                    ? rawConfigCache.has(soundConfigUrl)
                        ? Promise.resolve(rawConfigCache.get(soundConfigUrl))
                        : fetch(soundConfigUrl)
                            .then((r) => (r.ok ? r.json() : null))
                            .then((cfg) => { if (cfg) rawConfigCache.set(soundConfigUrl, cfg); return cfg; })
                            .catch(() => null)
                    : Promise.resolve(null);

                const spriteBufferPromise = fetchRawBuffer.then((ab) =>
                    ab ? audioContext.decodeAudioData(ab.slice(0)) : null
                );

                const [spriteBuffer, rawConfig] = await Promise.all([spriteBufferPromise, fetchConfig]);
                if (cancelled) {
                    onAudioLoadingChange?.(false);
                    return;
                }

                if (spriteBuffer) audioBufferRef.current = spriteBuffer;

                if (rawConfig) {
                    const pack = await buildResolvedPack(audioContext, rawConfig as any, soundConfigUrl!);
                    if (!cancelled) soundPackRef.current = pack;
                } else {
                    soundPackRef.current = null;
                }
            } catch (error) {
                console.warn("Failed to load sound:", error);
            } finally {
                if (!cancelled) onAudioLoadingChange?.(false);
            }
        };

        initAudio();

        return () => {
            cancelled = true;
            audioContextRef.current?.close();
        };
    }, [enableSound, soundUrl, soundConfigUrl, onAudioLoadingChange]);

    const playSound = useCallback(
        (phase: KeyboardEventPhase, keyCode: string) => {
            if (!enableSound) return;
            const audioContext = audioContextRef.current;
            const audioBuffer = audioBufferRef.current;
            if (!audioContext || !audioBuffer) return;

            const soundDef = resolveSoundDef(phase, keyCode, soundPackRef.current);
            if (!soundDef) return;

            if (audioContext.state === "suspended") audioContext.resume();

            const source = audioContext.createBufferSource();
            if (soundDef.kind === "sample") {
                source.buffer = soundDef.buffer;
                source.connect(audioContext.destination);
                source.start(0);
            } else {
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0, soundDef.start / 1000, soundDef.duration / 1000);
            }
        },
        [enableSound],
    );

    const triggerPointerHaptic = useCallback(() => {
        if (!enableHaptics) return;
        void trigger([{ duration: 25 }], { intensity: 0.7 });
    }, [enableHaptics, trigger]);

    const pressKey = useCallback((keyCode: string, source: KeyboardEventSource) => {
        const apply = () => {
            setPressedKeys((prev) => new Set(prev).add(keyCode));
            setLastPressedKey(keyCode);
            playSound("down", keyCode);
            onKeyEvent?.({ code: keyCode, phase: "down", source });
        };

        if (source === "pointer") {
            flushSync(apply);
        } else {
            apply();
        }
        return true;
    }, [playSound, onKeyEvent]);

    const releaseKey = useCallback((keyCode: string, source: KeyboardEventSource) => {
        const apply = () => {
            setPressedKeys((prev) => {
                const next = new Set(prev);
                next.delete(keyCode);
                return next;
            });
            playSound("up", keyCode);
            onKeyEvent?.({ code: keyCode, phase: "up", source });
        };

        if (source === "pointer") {
            flushSync(apply);
        } else {
            apply();
        }
    }, [playSound, onKeyEvent]);

    // Track visibility with IntersectionObserver
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [containerRef]);

    // Handle physical keyboard events (only when visible)
    useEffect(() => {
        if (!isVisible && !forceActive) return;
        if (!physicalKeysEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            pressKey(e.code, "physical");
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            releaseKey(e.code, "physical");
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [isVisible, forceActive, physicalKeysEnabled, pressKey, releaseKey]);

    return (
        <KeyboardContext.Provider
            value={{
                layout,
                pressedKeys,
                pressKey,
                releaseKey,
                lastPressedKey,
                triggerPointerHaptic,
            }}
        >
            {children}
        </KeyboardContext.Provider>
    );
};

// -----------------------------------------------------------------------------
// Keystroke Preview
// -----------------------------------------------------------------------------

const KeystrokePreview = () => {
    const { lastPressedKey, pressedKeys } = useKeyboard();
    const [displayKey, setDisplayKey] = useState<string | null>(null);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        if (lastPressedKey) {
            // Clear display if space or shift is pressed
            if (
                lastPressedKey === "Space" ||
                lastPressedKey === "ShiftLeft" ||
                lastPressedKey === "ShiftRight"
            ) {
                setDisplayKey(null);
                return;
            }

            setDisplayKey(getKeyDisplayLabel(lastPressedKey));
            setAnimationKey((prev) => prev + 1);
        }
    }, [lastPressedKey]);

    const isPressed = pressedKeys.size > 0;

    return (
        <div className="relative flex h-12 w-full items-center justify-center">
            <AnimatePresence mode="popLayout">
                {displayKey && (
                    <motion.div
                        key={animationKey}
                        layout
                        initial={{ opacity: 0, scale: 0.5, y: 5 }}
                        animate={{
                            opacity: 1,
                            scale: isPressed ? 0.95 : 1,
                            y: 0,
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: -5 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 0.5,
                        }}
                        className="absolute flex items-center justify-center rounded-lg px-4 py-2 font-mono text-2xl font-black text-neutral-700 dark:text-neutral-200"
                    >
                        <motion.span
                            initial={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                            animate={{ opacity: 0.6, scale: 1, filter: "blur(0px)" }}
                            transition={{ duration: 0.05 }}
                            className="text-2xl"
                        >
                            {displayKey}
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// -----------------------------------------------------------------------------
// Keyboard UI
// -----------------------------------------------------------------------------

export const Keyboard = ({
    className,
    enableHaptics = false,
    enableSound = false,
    soundUrl = "/sounds/sound.ogg",
    soundConfigUrl,
    onKeyEvent,
    forceActive = false,
    physicalKeysEnabled = true,
    language = "english",
    onAudioLoadingChange,
    showPreview = false,
}: KeyboardProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const layout = useMemo(() => getKeyboardLayout(language), [language]);

    return (
        <KeyboardProvider
            enableHaptics={enableHaptics}
            enableSound={enableSound}
            soundUrl={soundUrl}
            soundConfigUrl={soundConfigUrl}
            containerRef={containerRef}
            onKeyEvent={onKeyEvent}
            forceActive={forceActive}
            physicalKeysEnabled={physicalKeysEnabled}
            layout={layout}
            onAudioLoadingChange={onAudioLoadingChange}
        >
            <div
                ref={containerRef}
                className={cn(
                    "mx-auto w-fit [zoom:0.75] sm:[zoom:1] md:[zoom:1.2] lg:[zoom:1.4] xl:[zoom:1.8]",
                    className,
                )}
            >
                {showPreview && <KeystrokePreview />}
                <Keypad />
            </div>
        </KeyboardProvider>
    );
};

export const Keypad = () => {
    return (
        <div className="h-full w-fit rounded-xl bg-neutral-200 p-1 shadow-sm ring-1 shadow-black/5 ring-black/5 dark:bg-neutral-800 dark:ring-white/10">
            {/* Function Row */}
            <Row>
                <Key
                    keyCode="Escape"
                    containerClassName="rounded-tl-xl"
                    className="w-10 rounded-tl-lg"
                    childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
                >
                    <span>esc</span>
                </Key>
                <Key keyCode="F1">
                    <IconBrightnessDown className="h-[6px] w-[6px]" />
                    <span className="mt-1">F1</span>
                </Key>
                <Key keyCode="F2">
                    <IconBrightnessUp className="h-[6px] w-[6px]" />
                    <span className="mt-1">F2</span>
                </Key>
                <Key keyCode="F3">
                    <IconTable className="h-[6px] w-[6px]" />
                    <span className="mt-1">F3</span>
                </Key>
                <Key keyCode="F4">
                    <IconSearch className="h-[6px] w-[6px]" />
                    <span className="mt-1">F4</span>
                </Key>
                <Key keyCode="F5">
                    <IconMicrophone className="h-[6px] w-[6px]" />
                    <span className="mt-1">F5</span>
                </Key>
                <Key keyCode="F6">
                    <IconMoon className="h-[6px] w-[6px]" />
                    <span className="mt-1">F6</span>
                </Key>
                <Key keyCode="F7">
                    <IconPlayerTrackPrev className="h-[6px] w-[6px]" />
                    <span className="mt-1">F7</span>
                </Key>
                <Key keyCode="F8">
                    <IconPlayerSkipForward className="h-[6px] w-[6px]" />
                    <span className="mt-1">F8</span>
                </Key>
                <Key keyCode="F9">
                    <IconPlayerTrackNext className="h-[6px] w-[6px]" />
                    <span className="mt-1">F9</span>
                </Key>
                <Key keyCode="F10">
                    <IconVolume3 className="h-[6px] w-[6px]" />
                    <span className="mt-1">F10</span>
                </Key>
                <Key keyCode="F11">
                    <IconVolume2 className="h-[6px] w-[6px]" />
                    <span className="mt-1">F11</span>
                </Key>
                <Key keyCode="F12">
                    <IconVolume className="h-[6px] w-[6px]" />
                    <span className="mt-1">F12</span>
                </Key>
                <Key keyCode="F13" containerClassName="rounded-tr-xl" className="rounded-tr-lg">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-300 p-px dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-600">
                        <div className="h-full w-full rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    </div>
                </Key>
            </Row>

            {/* Number Row */}
            <Row>
                <DualKey keyCode="Backquote" />
                <DualKey keyCode="Digit1" />
                <DualKey keyCode="Digit2" />
                <DualKey keyCode="Digit3" />
                <DualKey keyCode="Digit4" />
                <DualKey keyCode="Digit5" />
                <DualKey keyCode="Digit6" />
                <DualKey keyCode="Digit7" />
                <DualKey keyCode="Digit8" />
                <DualKey keyCode="Digit9" />
                <DualKey keyCode="Digit0" />
                <DualKey keyCode="Minus" />
                <DualKey keyCode="Equal" />
                <Key
                    keyCode="Backspace"
                    className="w-10"
                    childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
                >
                    <span>delete</span>
                </Key>
            </Row>

            {/* QWERTY Row */}
            <Row>
                <Key
                    keyCode="Tab"
                    className="w-10"
                    childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
                >
                    <span>tab</span>
                </Key>
                {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((letter) => (
                    <DualKey key={letter} keyCode={`Key${letter}`} />
                ))}
                <DualKey keyCode="BracketLeft" />
                <DualKey keyCode="BracketRight" />
                <DualKey keyCode="Backslash" />
            </Row>

            {/* Home Row */}
            <Row>
                <Key
                    keyCode="CapsLock"
                    className="w-[2.8rem]"
                    childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
                >
                    <span>caps lock</span>
                </Key>
                {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((letter) => (
                    <DualKey key={letter} keyCode={`Key${letter}`} />
                ))}
                <DualKey keyCode="Semicolon" />
                <DualKey keyCode="Quote" />
                <Key
                    keyCode="Enter"
                    className="w-[2.85rem]"
                    childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
                >
                    <span>return</span>
                </Key>
            </Row>

            {/* Bottom Letter Row */}
            <Row>
                <Key
                    keyCode="ShiftLeft"
                    className="w-[3.65rem]"
                    childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
                >
                    <span>shift</span>
                </Key>
                {["Z", "X", "C", "V", "B", "N", "M"].map((letter) => (
                    <DualKey key={letter} keyCode={`Key${letter}`} />
                ))}
                <DualKey keyCode="Comma" />
                <DualKey keyCode="Period" />
                <DualKey keyCode="Slash" />
                <Key
                    keyCode="ShiftRight"
                    className="w-[3.65rem]"
                    childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
                >
                    <span>shift</span>
                </Key>
            </Row>

            {/* Modifier Row */}
            <Row>
                <ModifierKey
                    keyCode="Fn"
                    containerClassName="rounded-bl-xl"
                    className="rounded-bl-lg"
                >
                    <span>fn</span>
                    <IconWorld className="h-[6px] w-[6px]" />
                </ModifierKey>
                <ModifierKey keyCode="ControlLeft">
                    <IconChevronUp className="h-[6px] w-[6px]" />
                    <span>control</span>
                </ModifierKey>
                <ModifierKey keyCode="AltLeft">
                    <OptionKey className="h-[6px] w-[6px]" />
                    <span>option</span>
                </ModifierKey>
                <ModifierKey keyCode="MetaLeft" className="w-8">
                    <IconCommand className="h-[6px] w-[6px]" />
                    <span>command</span>
                </ModifierKey>
                <Key keyCode="Space" className="w-[8.2rem]" />
                <ModifierKey keyCode="MetaRight" className="w-8">
                    <IconCommand className="h-[6px] w-[6px]" />
                    <span>command</span>
                </ModifierKey>
                <ModifierKey keyCode="AltRight">
                    <OptionKey className="h-[6px] w-[6px]" />
                    <span>option</span>
                </ModifierKey>
                {/* Arrow Keys */}
                <div className="flex h-6 w-[4.9rem] items-center justify-end rounded-[4px] p-[0.5px]">
                    <Key keyCode="ArrowLeft" className="h-6 w-6">
                        <IconCaretLeftFilled className="h-[6px] w-[6px]" />
                    </Key>
                    <div className="flex flex-col">
                        <Key keyCode="ArrowUp" className="h-3 w-6">
                            <IconCaretUpFilled className="h-[6px] w-[6px]" />
                        </Key>
                        <Key keyCode="ArrowDown" className="h-3 w-6">
                            <IconCaretDownFilled className="h-[6px] w-[6px]" />
                        </Key>
                    </div>
                    <Key
                        keyCode="ArrowRight"
                        containerClassName="rounded-br-xl"
                        className="h-6 w-6 rounded-br-lg"
                    >
                        <IconCaretRightFilled className="h-[6px] w-[6px]" />
                    </Key>
                </div>
            </Row>
        </div>
    );
};

const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">{children}</div>
);

const DualKey = ({ keyCode, width }: { keyCode: string; width?: number }) => {
    const { layout } = useKeyboard();
    const labels = layout[keyCode] ?? QWERTY_LAYOUT[keyCode];

    if (!labels) return <Key keyCode={keyCode} className={width ? `w-[${width}px]` : ""} />;

    const [normal, shift] = labels;
    return (
        <Key keyCode={keyCode} className={width ? `w-[${width}px]` : ""}>
            {shift && <span className="mb-0.5">{shift}</span>}
            <span>{normal}</span>
        </Key>
    );
};

const Key = ({
    className,
    childrenClassName,
    containerClassName,
    children,
    keyCode,
}: {
    className?: string;
    childrenClassName?: string;
    containerClassName?: string;
    children?: React.ReactNode;
    keyCode?: string;
}) => {
    const { pressedKeys, pressKey, releaseKey, triggerPointerHaptic } = useKeyboard();
    const isPressed = keyCode ? pressedKeys.has(keyCode) : false;

    const handleMouseDown = () => {
        if (keyCode) {
            triggerPointerHaptic();
            pressKey(keyCode, "pointer");
        }
    };

    const handleMouseUp = () => {
        if (keyCode && isPressed) releaseKey(keyCode, "pointer");
    };

    const handleMouseLeave = () => {
        if (keyCode && isPressed) releaseKey(keyCode, "pointer");
    };

    return (
        <div className={cn("rounded-[4px] p-[0.5px]", containerClassName)}>
            <button
                type="button"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                data-no-click-sound
                className={cn(
                    "flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3.5px] bg-gray-100 transition-all duration-75 active:scale-[0.98] dark:bg-neutral-900 focus:outline-none",
                    "shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_0px_rgba(255,255,255,0.2),0px_1px_1px_0px_rgba(0,0,0,0.5),0px_1px_0px_0px_rgba(255,255,255,0.05)_inset]",
                    isPressed && [
                        "scale-[0.98] bg-gray-100/80 shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(255,255,255,0.5)] dark:bg-neutral-800",
                    ],
                    className,
                )}
            >
                <div
                    className={cn(
                        "flex h-full w-full flex-col items-center justify-center text-[5px] text-neutral-700 transition-colors dark:text-neutral-300",
                        isPressed && "font-bold",
                        childrenClassName,
                    )}
                >
                    {children}
                </div>
            </button>
        </div>
    );
};

const ModifierKey = ({
    className,
    containerClassName,
    children,
    keyCode,
}: {
    className?: string;
    containerClassName?: string;
    children?: React.ReactNode;
    keyCode?: string;
}) => {
    const { pressedKeys, pressKey, releaseKey, triggerPointerHaptic } = useKeyboard();
    const isPressed = keyCode ? pressedKeys.has(keyCode) : false;

    const handleMouseDown = () => {
        if (keyCode) {
            triggerPointerHaptic();
            pressKey(keyCode, "pointer");
        }
    };

    const handleMouseUp = () => {
        if (keyCode && isPressed) releaseKey(keyCode, "pointer");
    };

    const handleMouseLeave = () => {
        if (keyCode && isPressed) releaseKey(keyCode, "pointer");
    };

    return (
        <div className={cn("rounded-[4px] p-[0.5px]", containerClassName)}>
            <button
                type="button"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                data-no-click-sound
                className={cn(
                    "flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3.5px] bg-gray-100 transition-all duration-75 active:scale-[0.98] dark:bg-neutral-900 focus:outline-none",
                    "shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_0px_rgba(255,255,255,0.2),0px_1px_1px_0px_rgba(0,0,0,0.5),0px_1px_0px_0px_rgba(255,255,255,0.05)_inset]",
                    isPressed && [
                        "scale-[0.98] bg-gray-100/80 shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(255,255,255,0.5)] dark:bg-neutral-800",
                    ],
                    className,
                )}
            >
                <div className={cn(
                    "flex h-full w-full flex-col items-start justify-between p-1 text-[5px] text-neutral-700 transition-colors dark:text-neutral-300",
                    isPressed && "font-bold",
                )}>
                    {children}
                </div>
            </button>
        </div>
    );
};

const OptionKey = ({ className }: { className?: string }) => {
    return (
        <svg
            fill="none"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className={className}
        >
            <rect
                stroke="currentColor"
                strokeWidth={2}
                x="18"
                y="5"
                width="10"
                height="2"
            />
            <polygon
                stroke="currentColor"
                strokeWidth={2}
                points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25"
            />
        </svg>
    );
};
