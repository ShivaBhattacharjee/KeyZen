"use client"

import { AnimatePresence, motion, LayoutGroup } from "motion/react"
import { useCallback, useRef, useState, useEffect } from "react"
import { IconLock, IconPointer, IconRefresh } from "@tabler/icons-react"
import { ResultsScreen } from "@/components/results-screen"
import { TestControls, type CodeManifest } from "@/components/test-controls"
import { WordItem } from "@/components/word-item"
import { useTypingTest } from "@/hooks/use-typing-test"
import { useSettings } from "@/components/settings-context"
import { cn } from "@/lib/utils"
import { useShikiTokens } from "@/hooks/use-shiki";
import { CODE_MANIFEST } from "@/lib/code";
import { useTheme } from "next-themes"

interface TypingTestProps {
  onKeyHighlight?: (key: string | null) => void
  onFinished?: (finished: boolean) => void
  onTypingActiveChange?: (active: boolean) => void
  onFocusChange?: (focused: boolean) => void
  pauseTypingInputRefocus?: boolean
}

export function TypingTest(props: TypingTestProps) {
  const { realtimeWpm, faahMode, ghostMode, shakeMode, fontSize, syntaxHighlighting } = useSettings()
  const { resolvedTheme } = useTheme()
  const fontSizeRem = { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "1.875rem", xl: "2.25rem" }[fontSize]
  const faahAudioRef = useRef<HTMLAudioElement | null>(null)
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [codeManifest] = useState<CodeManifest>(() => CODE_MANIFEST);

  const onWrongKey = useCallback(() => {
    if (faahMode) {
      if (!faahAudioRef.current) {
        faahAudioRef.current = new Audio("/sounds/fahhhhh.mp3")
      }
      faahAudioRef.current.currentTime = 0
      void faahAudioRef.current.play()
    }
    if (shakeMode && typeof document !== "undefined") {
      const body = document.body
      body.classList.remove("screen-shake")
      // Force reflow so the animation can restart on rapid repeats.
      void body.offsetWidth
      body.classList.add("screen-shake")
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current)
      shakeTimeoutRef.current = setTimeout(() => {
        body.classList.remove("screen-shake")
      }, 320)
    }
  }, [faahMode, shakeMode])

  const {
    mode,
    timeOption,
    wordOption,
    quoteLength,
    punctuation,
    numbers,
    difficulty,
    customText,
    codeLanguage,
    codeChapter,
    codeLoading,
    words,
    typed,
    wordIndex,
    started,
    rowOffset,
    timeLeft,
    wordInputs,
    isFocused,
    resetting,
    isActivelyTyping,
    screenFade,
    wpm,
    accuracy,
    isRTL,
    capsLock,
    controlsVisible,
    showResults,
    frozenStats,
    inputRef,
    wordsContainerRef,
    activeWordRef,
    handleKeyDown,
    handleFocus,
    handleInputBlur,
    handleInputFocus,
    handleMouseMove,
    handleResultsRestart,
    handleResultsNext,
    onModeChange,
    onTimeOptionChange,
    onWordOptionChange,
    onQuoteLengthChange,
    onPunctuationToggle,
    onNumbersToggle,
    onDifficultyToggle,
    onCustomTextChange,
    onCodeLanguageChange,
    onCodeChapterChange,
    onRestart,
  } = useTypingTest({ ...props, onWrongKey })

  const shikiColors = useShikiTokens(
    words,
    codeLanguage,
    mode === "code" && syntaxHighlighting,
    resolvedTheme ?? "dark",
  )

  if (showResults) {
    return (
      <div
        className="w-full transition-all duration-150 ease-out"
        style={{
          opacity: screenFade,
          filter: screenFade < 1 ? "blur(4px)" : "none",
        }}
      >
        <ResultsScreen
          stats={frozenStats!}
          onRestart={handleResultsRestart}
          onNext={handleResultsNext}
        />
      </div>
    )
  }

  return (
    <div
      className="flex w-full max-w-5xl flex-col items-center gap-3 transition-all duration-150 ease-out"
      style={{
        opacity: screenFade,
        filter: screenFade < 1 ? "blur(4px)" : "none",
      }}
      onClick={handleFocus}
      onMouseMove={handleMouseMove}
    >
      {/* Controls toolbar */}
      <TestControls
        mode={mode}
        timeOption={timeOption}
        wordOption={wordOption}
        quoteLength={quoteLength}
        punctuation={punctuation}
        numbers={numbers}
        difficulty={difficulty}
        customText={customText}
        codeLanguage={codeLanguage}
        codeChapter={codeChapter}
        codeManifest={codeManifest}
        controlsVisible={controlsVisible}
        onModeChange={onModeChange}
        onTimeOptionChange={onTimeOptionChange}
        onWordOptionChange={onWordOptionChange}
        onQuoteLengthChange={onQuoteLengthChange}
        onPunctuationToggle={onPunctuationToggle}
        onNumbersToggle={onNumbersToggle}
        onDifficultyToggle={onDifficultyToggle}
        onCustomTextChange={onCustomTextChange}
        onCodeLanguageChange={onCodeLanguageChange}
        onCodeChapterChange={onCodeChapterChange}
        onRestart={onRestart}
      />

      {/* Words display */}
      <div className="relative w-full">
        {/* Caps Lock indicator */}
        <div className="pointer-events-none absolute top-3 right-0 left-0 z-30 flex items-center justify-center">
          <AnimatePresence>
            {capsLock && (
              <motion.span
                key="caps-lock"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 rounded border border-border bg-background/95 px-2 py-0.5 font-mono text-[10px] text-primary shadow-sm backdrop-blur"
              >
                <IconLock size={10} />
                caps lock
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Timer / progress — always reserves space */}
        <motion.div
          className="mb-3 flex min-h-8 items-center gap-5"
          animate={{ opacity: resetting ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex min-w-0 items-center gap-5">
            {mode === "time" && (
              <span
                className={cn(
                  "font-mono text-2xl font-bold text-primary tabular-nums transition-opacity duration-200",
                  started ? "opacity-100" : "opacity-0"
                )}
              >
                {timeLeft}
              </span>
            )}
            {mode === "words" && (
              <span
                className={cn(
                  "font-mono text-2xl font-bold text-primary tabular-nums transition-opacity duration-200",
                  started ? "opacity-100" : "opacity-0"
                )}
              >
                {wordIndex}/{wordOption}
              </span>
            )}
            <div
              className={cn(
                "flex items-center gap-5 font-mono text-lg text-muted-foreground transition-opacity duration-200",
                realtimeWpm && started ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="tabular-nums">
                {wpm} <span className="text-sm opacity-60">wpm</span>
              </span>
              <span className="tabular-nums">
                {accuracy}% <span className="text-sm opacity-60">acc</span>
              </span>
            </div>
          </div>
        </motion.div>

        {codeLoading && (
          <div className="flex items-center justify-center h-8">
            <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 0.8, ease: "linear" }}
              />
            </div>
          </div>
        )}

        <div
          ref={wordsContainerRef}
          className={cn(
            "relative h-[7.8rem] w-full overflow-hidden leading-relaxed",
            isActivelyTyping && "is-typing"
          )}
          style={{ fontFamily: "var(--typing-font)", fontSize: fontSizeRem }}
        >
          <input
            ref={inputRef}
            className="absolute opacity-0"
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            value={typed}
            onChange={() => {}}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />

          {rowOffset > 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background to-transparent" />
          )}

          <LayoutGroup id="words">
            <motion.div
              className="flex flex-wrap gap-x-2.5 gap-y-1"
              dir={isRTL ? "rtl" : undefined}
              animate={{
                y: -rowOffset,
                opacity: resetting ? 0 : isFocused ? 1 : 0.15,
                filter: resetting ? "blur(4px)" : "blur(0px)",
              }}
              transition={
                resetting
                  ? { duration: 0.15, ease: "easeOut" }
                  : { type: "spring", stiffness: 300, damping: 30, mass: 0.8 }
              }
            >
              {words.map((word, wIdx) => {
                const isActive = wIdx === wordIndex
                const isPast = wIdx < wordIndex
                const isFuture = !isActive && !isPast
                const displayInput = isActive
                  ? typed
                  : isPast
                    ? (wordInputs[wIdx] ?? "")
                    : ""
                const hasError = isPast && wordInputs[wIdx] !== word
                const currentWordDone =
                  typed.length >= (words[wordIndex]?.length ?? 0)
                const isNextWord = wIdx === wordIndex + 1
                const dimmed =
                  ghostMode &&
                  isFocused &&
                  isFuture &&
                  !(currentWordDone && isNextWord)

                return (
                  <WordItem
                    key={`${word}-${wIdx}`}
                    word={word}
                    displayInput={displayInput}
                    isActive={isActive}
                    isPast={isPast}
                    hasError={hasError}
                    elemRef={isActive ? activeWordRef : undefined}
                    dimmed={dimmed}
                    isRTL={isRTL}
                    tokenColors={mode === "code" && syntaxHighlighting ? shikiColors[wIdx] : undefined}
                  />
                )
              })}
            </motion.div>
          </LayoutGroup>

          <AnimatePresence>
            {!isFocused && (
              <motion.div
                key="focus-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center"
                onClick={() => inputRef.current?.focus()}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  <IconPointer size={16} />
                  Click here or press any key to focus
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Restart button */}
      <RestartButton controlsVisible={controlsVisible} onRestart={onRestart} />

      {/* Keyboard shortcuts hint */}
      <motion.div
        animate={{
          opacity: mode === "zen" && started ? 1 : controlsVisible ? 1 : 0,
        }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 text-xs text-muted-foreground"
      >
        {mode === "zen" && started ? (
          <span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              shift
            </kbd>
            {" + "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              enter
            </kbd>{" "}
            - end test
          </span>
        ) : (
          <span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              tab
            </kbd>
            {" + "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              enter
            </kbd>{" "}
            - restart test
          </span>
        )}
      </motion.div>
    </div>
  )
}

function RestartButton({
  controlsVisible,
  onRestart,
}: {
  controlsVisible: boolean
  onRestart: () => void
}) {
  const [spinning, setSpinning] = useState(false)

  function handleClick() {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)
    onRestart()
  }

  return (
    <motion.button
      animate={{ opacity: controlsVisible ? 1 : 0.15 }}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      className={cn(
        "rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground",
        !controlsVisible && "pointer-events-none"
      )}
      title="Restart test"
    >
      <span
        style={{
          display: "inline-flex",
          transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
        }}
      >
        <IconRefresh size={18} />
      </span>
    </motion.button>
  )
}
