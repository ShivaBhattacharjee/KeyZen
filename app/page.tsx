"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { cn } from "@/lib/utils"
import { useAppChrome } from "@/components/app-chrome"
import { Keyboard } from "@/components/ui/keyboard"
import { Keyboard as MagicKeyboard } from "@/components/ui/magic-keyboard"
import { TypingTest } from "@/components/typing-test"
import { useSettings, SOUND_PACKS } from "@/components/settings-context"
import { Loading } from "@/components/ui/loader"

export default function Page() {
    const { settingsOpen, testSettingsOpen, setTypingActive, homeLogoHandlerRef } = useAppChrome()
    const [isFinished, setIsFinished] = useState(false)
    const [typingFocused, setTypingFocused] = useState(true)
    const [restartKey, setRestartKey] = useState(0)
    const [mode, setMode] = useState<string>("time")
    const { showKeyboard, keyboardStyle, soundEnabled, soundPack, language, setSoundPackLoading, settingsLoaded } = useSettings()
    const soundPackOption = SOUND_PACKS.find((s) => s.id === soundPack)
    const soundUrl = soundPackOption?.url ?? "/sounds/sound.ogg"
    const soundConfigUrl = soundPackOption?.configUrl

    useMountEffect(() => {
        homeLogoHandlerRef.current = () => {
            setIsFinished(false)
            setRestartKey((k) => k + 1)
        }
        return () => {
            homeLogoHandlerRef.current = null
        }
    })

    const typingActiveRef = useRef(false)
    const handleTypingActiveChange = useCallback(
        (active: boolean) => {
            if (typingActiveRef.current === active) return
            typingActiveRef.current = active
            setTypingActive(active)
        },
        [setTypingActive],
    )

    const finishedRef = useRef(isFinished)
 
    useEffect(() => {
        finishedRef.current = isFinished
    }, [isFinished])

    const handleFinished = useCallback((finished: boolean) => {
        if (finishedRef.current === finished) return
        finishedRef.current = finished
        setIsFinished(finished)
    }, [])

    const focusedRef = useRef(typingFocused)
    const handleFocusChange = useCallback((focused: boolean) => {
        if (focusedRef.current === focused) return
        focusedRef.current = focused
        setTypingFocused(focused)
    }, [])

    const modeRef = useRef(mode)
    const handleModeChange = useCallback((m: string) => {
        if (modeRef.current === m) return
        modeRef.current = m
        setMode(m)
    }, [])

    const showFooter = !isFinished && showKeyboard

    return (
        <>
            {/* Full-screen settings-hydration loader */}
            <AnimatePresence>
                {!settingsLoaded && (
                    <motion.div
                        key="settings-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex flex-col items-center gap-5"
                        >

                            <Loading className="h-6 w-6" />
                            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase select-none">
                                Loading Your Settings <span className="animate-pulse">...</span>
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-1 flex-col overflow-hidden">
                <main
                    className={cn(
                        "flex flex-col px-6",
                        isFinished
                            ? "flex-1 justify-center px-10 py-2"
                            : showFooter
                                ? "flex-1 items-center justify-center lg:justify-end lg:pb-8"
                                : "flex-1 items-center justify-center",
                    )}
                >
                    <TypingTest
                        key={restartKey}
                        onFinished={handleFinished}
                        onTypingActiveChange={handleTypingActiveChange}
                        onFocusChange={handleFocusChange}
                        onModeChange={handleModeChange}
                        pauseTypingInputRefocus={settingsOpen || testSettingsOpen}
                    />
                </main>

                {!isFinished && (
                    <footer
                        className={cn(
                            "hidden items-center justify-center border-t border-border lg:flex",
                            showKeyboard
                                ? "flex-1 flex-col"
                                : "invisible h-0 overflow-hidden border-0",
                        )}
                    >
                        <div className="[zoom:0.85]">
                            {keyboardStyle === "magic" ? (
                                <MagicKeyboard
                                    enableHaptics
                                    enableSound={soundEnabled}
                                    soundUrl={soundUrl}
                                    soundConfigUrl={soundConfigUrl}
                                    forceActive={soundEnabled && !showKeyboard}
                                    physicalKeysEnabled={typingFocused}
                                    language={language}
                                    onAudioLoadingChange={setSoundPackLoading}
                                />
                            ) : (
                                <Keyboard
                                    theme="classic"
                                    enableHaptics
                                    enableSound={soundEnabled}
                                    soundUrl={soundUrl}
                                    soundConfigUrl={soundConfigUrl}
                                    forceActive={soundEnabled && !showKeyboard}
                                    physicalKeysEnabled={typingFocused}
                                    language={language}
                                    onAudioLoadingChange={setSoundPackLoading}
                                />
                            )}
                        </div>
                    </footer>
                )}
            </div>
        </>
    )
}
