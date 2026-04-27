"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { generateWords, generateWordsFromPool, type Difficulty } from "@/lib/words";
import { getQuote, type QuoteLength } from "@/lib/quotes";
import { fetchLanguageWords, isRTLLanguage, stripArabicDiacritics } from "@/lib/languages";
import { useSettings } from "@/components/settings-context";
import { accuracyFromCounts, countWpm, wpmNumeratorFromCounts, } from "@/lib/wpm-count";
import type { ResultStats, WpmSnapshot } from "@/components/results-screen";
import { CODE_MANIFEST, getCodeContent } from "@/lib/code";
import { type TestMode, type TimeOption, type WordOption, TEST_MODE_STORAGE_KEY, TIME_OPTION_STORAGE_KEY, WORD_OPTION_STORAGE_KEY, QUOTE_LENGTH_STORAGE_KEY, PUNCTUATION_STORAGE_KEY, NUMBERS_STORAGE_KEY, DIFFICULTY_STORAGE_KEY, CUSTOM_TEXT_STORAGE_KEY, DEFAULT_CUSTOM_TEXT, CODE_LANGUAGE_STORAGE_KEY, CODE_CHAPTER_STORAGE_KEY, CUSTOM_CODE_LANGUAGE_STORAGE_KEY, readStoredTestMode, readStoredTimeOption, readStoredWordOption, readStoredQuoteLength, readStoredBool, readStoredDifficulty, readStoredCustomText, readStoredCodeLanguage, readStoredCodeChapter, readStoredCustomCodeLanguage, } from "@/lib/test-storage";

function customTextToWords(text: string): string[] {
  return text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}


function parseCodeContent(content: string): { words: string[]; lineLengths: number[]; lineIndents: number[] } {
  const lines = content.split("\n");
  const lineLengths: number[] = [];
  const lineIndents: number[] = [];
  const allWords: string[] = [];
  for (const line of lines) {

    const leadingSpaces = line.match(/^(\s*)/)?.[1] ?? "";
    const tabCount = (leadingSpaces.match(/\t/g) ?? []).length;
    const spaceCount = leadingSpaces.replace(/\t/g, "").length;
    const indent = tabCount + Math.floor(spaceCount / 2);
    const lineWords = line.split(/\s+/).filter(w => w.length > 0);
    lineLengths.push(lineWords.length);
    lineIndents.push(indent);
    allWords.push(...lineWords);
  }
  return { words: allWords.filter(w => w.length > 0), lineLengths, lineIndents };
}

const getCommentPrefix = (lang: string): string =>
  lang === "shell" || lang === "bash" ? "#" : lang === "lua" ? "--" : "//";

type ResetOverrides = Partial<{
  mode: TestMode; quoteLength: QuoteLength; wordOption: WordOption;
  timeOption: TimeOption; punctuation: boolean; numbers: boolean;
  difficulty: Difficulty | undefined; language: string; showDiacritics: boolean;
  customText: string; customCodeLanguage: string;
  codeLanguage: string; codeChapter: string;
}>;

interface UseTypingTestProps {
  onKeyHighlight?: (key: string | null) => void;
  onFinished?: (finished: boolean) => void;
  onTypingActiveChange?: (active: boolean) => void;
  onFocusChange?: (focused: boolean) => void;
  onWrongKey?: () => void;
  pauseTypingInputRefocus?: boolean;
}

export function useTypingTest({
  onKeyHighlight,
  onFinished,
  onTypingActiveChange,
  onFocusChange,
  onWrongKey,
  pauseTypingInputRefocus = false,
}: UseTypingTestProps) {
  const { language, showDiacritics, autoPair } = useSettings();
  const isRTL = isRTLLanguage(language);

  const pauseRefocusRef = useRef(false);
  pauseRefocusRef.current = pauseTypingInputRefocus;


  const [mode, setMode] = useState<TestMode>("time");
  const [timeOption, setTimeOption] = useState<TimeOption>(30);
  const [wordOption, setWordOption] = useState<WordOption>(25);
  const [quoteLength, setQuoteLength] = useState<QuoteLength>("medium");
  const [quoteAuthor, setQuoteAuthor] = useState<string | null>(null);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>("easy");
  const [customText, setCustomText] = useState<string>(DEFAULT_CUSTOM_TEXT);
  const [customCodeLanguage, setCustomCodeLanguage] = useState<string>("");
  const [codeLanguage, setCodeLanguage] = useState<string>("");
  const [codeChapter, setCodeChapter] = useState<string>("");

  const codeContentCache = useRef<Record<string, string>>({});


  const langPoolRef = useRef<{ code: string; hard: boolean; words: string[] } | null>(null);


  const [words, setWords] = useState<string[]>([]);

  const [codeLines, setCodeLines] = useState<number[]>([]);
  const [codeIndents, setCodeIndents] = useState<number[]>([]);
  const [typed, setTyped] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [rowOffset, setRowOffset] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordInputs, setWordInputs] = useState<string[]>([]);
  const [wpmHistory, setWpmHistory] = useState<WpmSnapshot[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [screenFade, setScreenFade] = useState(1);
  const [capsLock, setCapsLock] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  const correctCharsRef = useRef(0);
  const allTypedRef = useRef(0);
  const errorsThisSecondRef = useRef(0);
  const elapsedSecondsRef = useRef(0);
  const correctedErrorsRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabPressedRef = useRef(false);
  const isComposingRef = useRef(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetAnimRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTestRef = useRef<(() => void) | null>(null);


  const mtCounts = useMemo(
    () => countWpm({ targetWords: words, wordInputs, typed, wordIndex, mode, final: finished }),
    [words, wordInputs, typed, wordIndex, mode, finished],
  );
  const wpmNumerator = wpmNumeratorFromCounts(mtCounts);
  const accuracy = accuracyFromCounts(mtCounts);
  correctCharsRef.current = wpmNumerator;


  const wpm = started && startTime && !finished
    ? Math.round(wpmNumerator / 5 / Math.max((Date.now() - startTime) / 1000 / 60, 1 / 60))
    : 0;



  const finishTest = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setFinished(true);
    setShowControls(true);
    onFinished?.(true);
    onTypingActiveChange?.(false);
    setScreenFade(0);
    requestAnimationFrame(() => setScreenFade(1));
  }, [onFinished, onTypingActiveChange]);

  finishTestRef.current = finishTest;

  const buildWords = useCallback(async (
    lang: string, count: number, opts: { punctuation: boolean; numbers: boolean; difficulty: Difficulty | undefined; showDiacritics?: boolean },
  ): Promise<string[]> => {
    const isHard = opts.difficulty === "hard";
  
    if (langPoolRef.current && langPoolRef.current.code === lang && langPoolRef.current.hard === isHard) {
      const result = generateWordsFromPool(langPoolRef.current.words, count, opts);
      return (opts.showDiacritics === false && isRTLLanguage(lang))
        ? result.map(stripArabicDiacritics)
        : result;
    }
    const pool = await fetchLanguageWords(lang, isHard);
    if (pool.length > 0) {
      langPoolRef.current = { code: lang, hard: isHard, words: pool };
      const result = generateWordsFromPool(pool, count, opts);
      return (opts.showDiacritics === false && isRTLLanguage(lang))
        ? result.map(stripArabicDiacritics)
        : result;
    }

    return generateWords(count, opts);
  }, []);


  const resetTestWith = useCallback(async (overrides: ResetOverrides = {}) => {
    const m = overrides.mode ?? mode;
    const ql = overrides.quoteLength ?? quoteLength;
    const wo = overrides.wordOption ?? wordOption;
    const to = overrides.timeOption ?? timeOption;
    const p = overrides.punctuation ?? punctuation;
    const n = overrides.numbers ?? numbers;
    const d = "difficulty" in overrides ? overrides.difficulty : difficulty;
    const lang = overrides.language ?? language;
    const sd = "showDiacritics" in overrides ? overrides.showDiacritics : showDiacritics;
    const ct = overrides.customText ?? customText;
    const ccl = "customCodeLanguage" in overrides ? (overrides.customCodeLanguage ?? "") : customCodeLanguage;
    const cl = overrides.codeLanguage ?? codeLanguage;
    const cc = overrides.codeChapter ?? codeChapter;
    const wc = m === "time" ? 200 : m === "words" ? wo : 100;

    setQuoteAuthor(null);
    if (m === "quote") {
      const { words: newWords, author } = getQuote(ql);
      setWords(newWords);
      setCodeLines([]);
      setCodeIndents([]);
      setQuoteAuthor(author);
    } else if (m === "custom") {
      if (ccl) {
        const parsed = parseCodeContent(ct);
        setWords(parsed.words.length > 0 ? parsed.words : customTextToWords(DEFAULT_CUSTOM_TEXT));
        setCodeLines(parsed.words.length > 0 ? parsed.lineLengths : []);
        setCodeIndents(parsed.words.length > 0 ? parsed.lineIndents : []);
      } else {
        const customWords = customTextToWords(ct);
        setWords(customWords.length > 0 ? customWords : customTextToWords(DEFAULT_CUSTOM_TEXT));
        setCodeLines([]);
        setCodeIndents([]);
      }
    } else if (m === "code") {
      const c = getCommentPrefix(cl);
      if (cl && cc) {
        const content = getCodeContent(cl, cc);
        if (content) {
          const parsed = parseCodeContent(content);
          setWords(parsed.words.length > 0 ? parsed.words : [c, "empty", "file"]);
          setCodeLines(parsed.words.length > 0 ? parsed.lineLengths : [3]);
          setCodeIndents(parsed.words.length > 0 ? parsed.lineIndents : [0]);
        } else {
          setWords([c, "error", "loading", "file"]);
          setCodeLines([4]);
          setCodeIndents([0]);
        }
      } else {
        const missing = !cl && !cc ? ["language", "and", "chapter"] : !cl ? ["language"] : ["chapter"];
        const fallback = [c, "Select", "a", ...missing, "from", "the", "top", "menu", "to", "start"];
        setWords(fallback);
        setCodeLines([fallback.length]);
        setCodeIndents([0]);
      }
    } else {
      const newWords = await buildWords(lang, wc, { punctuation: p, numbers: n, difficulty: d, showDiacritics: sd });
      setWords(newWords);
      setCodeLines([]);
      setCodeIndents([]);
    }
    setTyped("");
    setWordIndex(0);
    setStarted(false);
    setFinished(false);
    setStartTime(null);
    setWordInputs([]);
    setWpmHistory([]);
    correctCharsRef.current = 0;
    allTypedRef.current = 0;
    errorsThisSecondRef.current = 0;
    elapsedSecondsRef.current = 0;
    correctedErrorsRef.current = 0;
    if (m === "time") setTimeLeft(to);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRowOffset(0);
    setShowControls(true);
    setIsActivelyTyping(false);
    onFinished?.(false);
    onTypingActiveChange?.(false);
    inputRef.current?.focus();
  }, [mode, quoteLength, wordOption, timeOption, punctuation, numbers, difficulty, language, showDiacritics, customText, codeLanguage, codeChapter, buildWords, onFinished, onTypingActiveChange]);

  const resetTestImmediate = useCallback(() => resetTestWith(), [resetTestWith]);

  const resetTest = useCallback((overrides: ResetOverrides = {}) => {
    if (resetAnimRef.current) clearTimeout(resetAnimRef.current);
    setResetting(true);
    resetAnimRef.current = setTimeout(() => {
      void resetTestWith(overrides).then(() => {
        setResetting(false);
        resetAnimRef.current = null;
      });
    }, 150);
  }, [resetTestWith]);

  useMountEffect(() => {
    const storedMode = readStoredTestMode();
    const storedTime = readStoredTimeOption();
    const storedWordOption = readStoredWordOption();
    const storedQuoteLength = readStoredQuoteLength();
    const storedPunctuation = readStoredBool(PUNCTUATION_STORAGE_KEY);
    const storedNumbers = readStoredBool(NUMBERS_STORAGE_KEY);
    const storedDifficulty = readStoredDifficulty();
    const storedCustomText = readStoredCustomText();
    const storedCodeLang = readStoredCodeLanguage();
    const storedCodeChap = readStoredCodeChapter();

    const m = storedMode ?? mode;
    const to = storedTime ?? timeOption;
    const wo = storedWordOption ?? wordOption;
    const ql = storedQuoteLength ?? quoteLength;
    const p = storedPunctuation ?? punctuation;
    const n = storedNumbers ?? numbers;
    const d = storedDifficulty !== undefined ? storedDifficulty : difficulty;
    const lang = language;
    
    let activeCodeLang = codeLanguage;
    let activeCodeChap = codeChapter;
    if (storedCodeLang) { activeCodeLang = storedCodeLang; setCodeLanguage(storedCodeLang); }
    else if (m === "code") { activeCodeLang = "javascript"; setCodeLanguage("javascript"); }
    if (storedCodeChap) { activeCodeChap = storedCodeChap; setCodeChapter(storedCodeChap); }
    else if (m === "code") { activeCodeChap = CODE_MANIFEST["javascript"]?.chapters[0] ?? "00_variables"; setCodeChapter(activeCodeChap); }

    if (storedMode !== undefined) setMode(storedMode);
    if (storedTime !== undefined) setTimeOption(storedTime);
    if (storedWordOption !== undefined) setWordOption(storedWordOption);
    if (storedQuoteLength !== undefined) setQuoteLength(storedQuoteLength);
    if (storedPunctuation !== undefined) setPunctuation(storedPunctuation);
    if (storedNumbers !== undefined) setNumbers(storedNumbers);
    if (storedDifficulty !== undefined) setDifficulty(storedDifficulty);
    if (storedCustomText !== undefined) setCustomText(storedCustomText);
    const storedCustomCodeLang = readStoredCustomCodeLanguage();
    if (storedCustomCodeLang) setCustomCodeLanguage(storedCustomCodeLang);

    const ct = storedCustomText ?? customText;
    const activeCCL = storedCustomCodeLang ?? customCodeLanguage;
    const wc = m === "time" ? 200 : m === "words" ? wo : 100;
    if (m === "quote") {
      const { words: initWords, author } = getQuote(ql);
      setWords(initWords);
      setQuoteAuthor(author);
    } else if (m === "custom") {
      if (activeCCL) {
        const parsed = parseCodeContent(ct);
        setWords(parsed.words.length > 0 ? parsed.words : customTextToWords(DEFAULT_CUSTOM_TEXT));
        setCodeLines(parsed.words.length > 0 ? parsed.lineLengths : []);
        setCodeIndents(parsed.words.length > 0 ? parsed.lineIndents : []);
      } else {
        const customWords = customTextToWords(ct);
        setWords(customWords.length > 0 ? customWords : customTextToWords(DEFAULT_CUSTOM_TEXT));
      }
    } else if (m === "code") {
      const c = getCommentPrefix(activeCodeLang);
      if (activeCodeLang && activeCodeChap) {
        const content = getCodeContent(activeCodeLang, activeCodeChap);
        if (content) {
          const parsed = parseCodeContent(content);
          setWords(parsed.words.length > 0 ? parsed.words : [c, "empty", "file"]);
          setCodeLines(parsed.words.length > 0 ? parsed.lineLengths : [3]);
          setCodeIndents(parsed.words.length > 0 ? parsed.lineIndents : [0]);
        } else {
          setWords([c, "error", "loading", "file"]);
          setCodeLines([4]);
          setCodeIndents([0]);
        }
      } else {
        const missing = !activeCodeLang && !activeCodeChap ? ["language", "and", "chapter"] : !activeCodeLang ? ["language"] : ["chapter"];
        const fallback = [c, "Select", "a", ...missing, "from", "the", "top", "menu", "to", "start"];
        setWords(fallback);
        setCodeLines([fallback.length]);
        setCodeIndents([0]);
      }
    } else {
      buildWords(lang, wc, { punctuation: p, numbers: n, difficulty: d, showDiacritics }).then((w) => setWords(w));
    }
    if (m === "time") setTimeLeft(to);
    inputRef.current?.focus();
  });


  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      langPoolRef.current = null; // invalidate cache
      void resetTestWith({ language });
    }
  }, [language, resetTestWith]);

  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => setCapsLock(e.getModifierState("CapsLock"));
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);


  const prevShowDiacriticsRef = useRef(showDiacritics);
  useEffect(() => {
    if (prevShowDiacriticsRef.current !== showDiacritics) {
      prevShowDiacriticsRef.current = showDiacritics;
      void resetTestWith({ showDiacritics });
    }
  }, [showDiacritics, resetTestWith]);


  const markTypingActive = useCallback(() => {
    setIsActivelyTyping(true);
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
    typingIdleRef.current = setTimeout(() => setIsActivelyTyping(false), 1000);
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!started || finished) return;
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 2500);
  }, [started, finished]);

  const recordWordSnapshot = useCallback((
    snapshotWordInputs: string[],
    snapshotTyped: string,
    snapshotWordIndex: number,
  ) => {
    if (!startTime || mode === "time") return;
    const snapCounts = countWpm({
      targetWords: words, wordInputs: snapshotWordInputs,
      typed: snapshotTyped, wordIndex: snapshotWordIndex, mode, final: false,
    });
    const snapNum = wpmNumeratorFromCounts(snapCounts);
    const elapsedSec = (Date.now() - startTime) / 1000;
    elapsedSecondsRef.current = elapsedSec;
    const elapsedMin = elapsedSec / 60 || 1 / 60;
    const snapWpm = Math.round(snapNum / 5 / elapsedMin);
    const snapRaw = Math.max(Math.round(allTypedRef.current / 5 / elapsedMin), snapWpm);
    setWpmHistory((prev) => [
      ...prev,
      { second: Math.round(elapsedSec), wpm: snapWpm, raw: snapRaw, errors: errorsThisSecondRef.current },
    ]);
    errorsThisSecondRef.current = 0;
  }, [startTime, mode, words]);

  const clearWordOrNavigateBack = useCallback(() => {
    if (typed.length > 0) {
      setTyped("");
      const cw = words[wordIndex];
      onKeyHighlight?.(cw && cw.length > 0 ? cw[0] : null);
      return;
    }
    if (wordIndex <= 0) return;
    const prevInput = wordInputs[wordIndex - 1];
    const prevWord = words[wordIndex - 1];
    setWordIndex((prev) => prev - 1);
    setTyped(prevInput);
    setWordInputs((prev) => prev.slice(0, -1));
    if (prevInput.length < prevWord.length) onKeyHighlight?.(prevWord[prevInput.length]);
    else onKeyHighlight?.(" ");
    requestAnimationFrame(() => {
      if (!activeWordRef.current) return;
      const word = activeWordRef.current;
      const lineH = word.offsetHeight + 4;
      const row = Math.round(word.offsetTop / lineH);
      setRowOffset(Math.max(0, row - 1) * lineH);
    });
  }, [typed, wordIndex, wordInputs, words, onKeyHighlight, activeWordRef]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        isComposingRef.current ||
        e.nativeEvent.isComposing ||
        e.key === "Dead" ||
        e.key === "Process"
      ) {
        return;
      }

      const isAltWordDelete = e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey &&
        (e.key === "Backspace" || e.key === "Delete");
      const isCtrlBackspaceWordNav = e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey && e.key === "Backspace";

      if (isAltWordDelete || isCtrlBackspaceWordNav) {
        e.preventDefault();
        if (finished) return;
        if (!started) { setStarted(true); setStartTime(Date.now()); setShowControls(false); onTypingActiveChange?.(true); }
        markTypingActive();
        clearWordOrNavigateBack();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Tab") {
        e.preventDefault();
        tabPressedRef.current = true;
        setTimeout(() => { tabPressedRef.current = false; }, 1000);
        return;
      }
      if (e.key === "Enter" && tabPressedRef.current) {
        e.preventDefault();
        tabPressedRef.current = false;
        resetTest();
        return;
      }
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        if (mode === "zen" && started && !finished) {
          finishTest();
        }
        return;
      }

    
      const isCodeLikeMode = mode === "code" || (mode === "custom" && customCodeLanguage !== "");
      if (e.key === "Enter" && isCodeLikeMode && !e.shiftKey && !tabPressedRef.current) {
        e.preventDefault();
        if (finished) return;
        if (!started) {
          setStarted(true);
          setStartTime(Date.now());
          setShowControls(false);
          onTypingActiveChange?.(true);
        }
        markTypingActive();
 
        let lineStart = 0;
        for (const lineLen of codeLines) {
          const lineEnd = lineStart + lineLen - 1;
          if (wordIndex >= lineStart && wordIndex <= lineEnd) {
            const nextInputs = [...wordInputs];
            for (let i = wordIndex; i <= lineEnd; i++) {
              nextInputs[i] = i === wordIndex ? typed : "";
            }
            const nextIndex = lineEnd + 1;
            if (nextIndex >= words.length) {
              setWordInputs(nextInputs);
              finishTest();
              return;
            }
            setWordInputs(nextInputs);
            setWordIndex(nextIndex);
            setTyped("");
            onKeyHighlight?.(null);
            requestAnimationFrame(() => {
              if (!activeWordRef.current) return;
              const word = activeWordRef.current;
              const lineH = word.offsetHeight + 4;
              const row = Math.round(word.offsetTop / lineH);
              setRowOffset(Math.max(0, row - 1) * lineH);
            });
            return;
          }
          lineStart += lineLen;
        }
        return;
      }

      if (finished) return;

      if (e.key.length > 1 && e.key !== "Backspace") return;


      if (e.key === "Backspace" && !started && typed.length === 0) return;

      if (!started) {
        setStarted(true);
        setStartTime(Date.now());
        setShowControls(false);
        onTypingActiveChange?.(true);

       
        if (mode === "time") {
          let elapsedTicks = 0;
          timerRef.current = setInterval(() => {
            elapsedTicks += 1;
            elapsedSecondsRef.current = elapsedTicks;
            const elapsedMin = elapsedTicks / 60;
            const snapWpm = elapsedMin > 0 ? Math.round(correctCharsRef.current / 5 / elapsedMin) : 0;
            const snapRaw = elapsedMin > 0 ? Math.max(Math.round(allTypedRef.current / 5 / elapsedMin), snapWpm) : 0;
            setWpmHistory((prev) => [
              ...prev,
              { second: elapsedTicks, wpm: snapWpm, raw: snapRaw, errors: errorsThisSecondRef.current },
            ]);
            errorsThisSecondRef.current = 0;
            if (elapsedTicks >= timeOption) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              finishTestRef.current?.();
            } else {
              setTimeLeft(timeOption - elapsedTicks);
            }
          }, 1000);
        }
      }

      markTypingActive();

      const currentWord = words[wordIndex];

      if (e.key === " ") {
        e.preventDefault();
        if (typed.length === 0) return;

        allTypedRef.current += 1; // count the space keystroke so raw >= wpm

        for (let i = 0; i < Math.min(typed.length, currentWord.length); i++) {
          if (typed[i] !== currentWord[i]) errorsThisSecondRef.current++;
        }
        if (typed.length > currentWord.length) errorsThisSecondRef.current++;

        const nextInputs = [...wordInputs, typed];
        const nextIndex = wordIndex + 1;
        recordWordSnapshot(nextInputs, "", nextIndex);

        if (wordIndex + 1 >= words.length) {
          setWordInputs(nextInputs);
          finishTest();
          return;
        }
        setWordInputs(nextInputs);
        setWordIndex(nextIndex);
        setTyped("");
        onKeyHighlight?.(null);

        requestAnimationFrame(() => {
          if (!activeWordRef.current) return;
          const word = activeWordRef.current;
          const lineH = word.offsetHeight + 4;
          const row = Math.round(word.offsetTop / lineH);
          setRowOffset(Math.max(0, row - 1) * lineH);
        });
        return;
      }

      if (e.key === "Backspace") {
        if (typed.length === 0 && wordIndex > 0) {
          const prevInput = wordInputs[wordIndex - 1];
          setWordIndex((prev) => prev - 1);
          setTyped(prevInput);
          setWordInputs((prev) => prev.slice(0, -1));
     
          requestAnimationFrame(() => {
            if (!activeWordRef.current) return;
            const word = activeWordRef.current;
            const lineH = word.offsetHeight + 4;
            const row = Math.round(word.offsetTop / lineH);
            setRowOffset(Math.max(0, row - 1) * lineH);
          });
        } else if (typed.length > 0) {
          const lastIdx = typed.length - 1;
          const isWrong = lastIdx >= currentWord.length || typed[lastIdx] !== currentWord[lastIdx];
          if (isWrong) correctedErrorsRef.current += 1;
          setTyped((prev) => prev.slice(0, -1));
        }
        return;
      }

      if (e.key.length === 1) {
        const PAIR_MAP: Record<string, string> = {
          "(": ")", "{": "}", "[": "]", '"': '"', "'": "'", "`": "`",
        };
        if (autoPair && isCodeLikeMode && PAIR_MAP[e.key]) {
          const closer = PAIR_MAP[e.key];
          const charIndex = typed.length;
         
          if (
            charIndex < currentWord.length &&
            currentWord[charIndex] === e.key &&
            currentWord[charIndex + 1] === closer
          ) {
        
            allTypedRef.current += 1;
            const nextTyped = typed + e.key + closer;
            setTyped(nextTyped);
            const isWrong = e.key !== currentWord[charIndex];
            if (isWrong) onWrongKey?.();
            const nextCharIndex = nextTyped.length;
            onKeyHighlight?.(nextCharIndex < currentWord.length ? currentWord[nextCharIndex] : " ");
            return;
          }
        }

        allTypedRef.current += 1;
        const nextTyped = typed + e.key;
        setTyped(nextTyped);

        const charIndex = typed.length;
        const isWrong = charIndex >= currentWord.length || e.key !== currentWord[charIndex];
        if (isWrong) onWrongKey?.();

        const isLastWord = wordIndex + 1 >= words.length;
        if (isLastWord && nextTyped.length >= currentWord.length && mode !== "time" && mode !== "zen") {
          for (let i = 0; i < Math.min(nextTyped.length, currentWord.length); i++) {
            if (nextTyped[i] !== currentWord[i]) errorsThisSecondRef.current++;
          }
          if (nextTyped.length > currentWord.length) errorsThisSecondRef.current++;
          const nextInputs = [...wordInputs, nextTyped];
          setWordInputs(nextInputs);
          recordWordSnapshot(nextInputs, "", wordIndex + 1);
          finishTest();
          return;
        }

        const nextCharIndex = nextTyped.length;
        onKeyHighlight?.(nextCharIndex < currentWord.length ? currentWord[nextCharIndex] : " ");
      }
    },
    [
      finished, started, words, codeLines, wordIndex, typed, wordInputs,
      mode, customCodeLanguage, timeOption, resetTest, finishTest, onKeyHighlight, autoPair,
      recordWordSnapshot, markTypingActive, onTypingActiveChange, onWrongKey, clearWordOrNavigateBack,
    ],
  );

  const handleFocus = () => {
    if (pauseRefocusRef.current) return;

    const active = document.activeElement;
    if (active && active.closest('[role="dialog"], [data-radix-dialog-content]')) return;
    inputRef.current?.focus();
  };

  const handleInputBlur = useCallback(() => {
    if (pauseRefocusRef.current) return;
    setIsFocused(false);
    onFocusChange?.(false);
  }, [onFocusChange]);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    onFocusChange?.(true);
  }, [onFocusChange]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      const data = e.data;

      if (inputRef.current && inputRef.current.value !== typed) {
        inputRef.current.value = typed;
      }
      if (!data) return;
    
      for (const ch of data) {
        handleKeyDown({
          key: ch,
          altKey: false,
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          preventDefault: () => {},
          nativeEvent: { isComposing: false } as unknown as KeyboardEvent,
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      }
    },
    [handleKeyDown, typed],
  );


  const frozenStatsRef = useRef<ResultStats | null>(null);

  if (finished && !frozenStatsRef.current) {
    const elapsed = startTime ? (Date.now() - startTime) / 1000 : elapsedSecondsRef.current;
    const elapsedMin = elapsed / 60 || 1 / 60;
    const wpmValues = wpmHistory.map((s) => s.wpm).filter((v) => v > 0);
    let consistency = 100;
    if (wpmValues.length > 1) {
      const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
      const variance = wpmValues.reduce((a, b) => a + (b - mean) ** 2, 0) / wpmValues.length;
      consistency = Math.max(0, Math.round(100 - (Math.sqrt(variance) / (mean || 1)) * 100));
    }
    const computedWpm = Math.round(wpmNumerator / 5 / elapsedMin);
    const computedRaw = Math.max(Math.round(allTypedRef.current / 5 / elapsedMin), computedWpm);
    frozenStatsRef.current = {
      wpm: computedWpm,
      accuracy,
      raw: computedRaw,
      correctChars: mtCounts.correctWordChars,
      incorrectChars: mtCounts.incorrectChars,
      extraChars: mtCounts.extraChars,
      missedChars: mtCounts.missedChars,
      consistency,
      elapsedSeconds: Math.round(elapsed),
      correctedErrors: correctedErrorsRef.current,
      mode,
      modeDetail: mode === "time" ? String(timeOption) : mode === "words" ? String(wordOption) : mode === "quote" ? quoteLength : mode === "custom" ? "custom" : "",
      language,
      wpmHistory,
    };
  }
  if (!finished) frozenStatsRef.current = null;


  const resetSameWords = useCallback(() => {
    setTyped("");
    setWordIndex(0);
    setStarted(false);
    setFinished(false);
    setStartTime(null);
    setWordInputs([]);
    setWpmHistory([]);
    correctCharsRef.current = 0;
    allTypedRef.current = 0;
    errorsThisSecondRef.current = 0;
    elapsedSecondsRef.current = 0;
    correctedErrorsRef.current = 0;
    if (mode === "time") setTimeLeft(timeOption);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRowOffset(0);
    setShowControls(true);
    setIsActivelyTyping(false);
    onFinished?.(false);
    onTypingActiveChange?.(false);
    inputRef.current?.focus();
  }, [mode, timeOption, onFinished, onTypingActiveChange]);


  const handleResultsRestart = useCallback(() => {
    setScreenFade(0);
    if (screenFadeRef.current) clearTimeout(screenFadeRef.current);
    screenFadeRef.current = setTimeout(() => {
      setResetting(true);
      resetSameWords();
      setTimeout(() => setResetting(false), 150);
      requestAnimationFrame(() => setScreenFade(1));
      screenFadeRef.current = null;
    }, 150);
  }, [resetSameWords]);

  const handleResultsNext = useCallback(() => {
    setScreenFade(0);
    if (screenFadeRef.current) clearTimeout(screenFadeRef.current);
    screenFadeRef.current = setTimeout(() => {
      if (mode === "code") {
        const chapters = CODE_MANIFEST[codeLanguage]?.chapters ?? [];
        const currentIndex = chapters.indexOf(codeChapter);
        if (currentIndex !== -1 && currentIndex < chapters.length - 1) {
          const nextChapter = chapters[currentIndex + 1];
          setCodeChapter(nextChapter);
          localStorage.setItem(CODE_CHAPTER_STORAGE_KEY, nextChapter);
          void resetTestWith({ codeChapter: nextChapter }).then(() => {
            requestAnimationFrame(() => setScreenFade(1));
            screenFadeRef.current = null;
          });
          return;
        }
      }
      void resetTestImmediate().then(() => {
        requestAnimationFrame(() => setScreenFade(1));
        screenFadeRef.current = null;
      });
    }, 150);
  }, [resetTestImmediate, resetTestWith, mode, codeLanguage, codeChapter]);


  const onModeChange = useCallback((next: TestMode) => {
    setMode(next);
    localStorage.setItem(TEST_MODE_STORAGE_KEY, next);
    if (next === "code" && !codeLanguage) {
      setCodeLanguage("javascript");
      localStorage.setItem(CODE_LANGUAGE_STORAGE_KEY, "javascript");
      setCodeChapter("00_variables");
      localStorage.setItem(CODE_CHAPTER_STORAGE_KEY, "00_variables");
      resetTest({ mode: next, codeLanguage: "javascript", codeChapter: "00_variables" });
    } else {
      resetTest({ mode: next });
    }
  }, [resetTest, codeLanguage]);

  const onTimeOptionChange = useCallback((next: TimeOption) => {
    setTimeOption(next);
    localStorage.setItem(TIME_OPTION_STORAGE_KEY, String(next));
    resetTest({ timeOption: next });
  }, [resetTest]);

  const onWordOptionChange = useCallback((next: WordOption) => {
    setWordOption(next);
    localStorage.setItem(WORD_OPTION_STORAGE_KEY, String(next));
    resetTest({ wordOption: next });
  }, [resetTest]);

  const onQuoteLengthChange = useCallback((next: QuoteLength) => {
    setQuoteLength(next);
    localStorage.setItem(QUOTE_LENGTH_STORAGE_KEY, next);
    resetTest({ quoteLength: next });
  }, [resetTest]);

  const onPunctuationToggle = useCallback(() => {
    const next = !punctuation;
    setPunctuation(next);
    localStorage.setItem(PUNCTUATION_STORAGE_KEY, String(next));
    resetTest({ punctuation: next });
  }, [punctuation, resetTest]);

  const onNumbersToggle = useCallback(() => {
    const next = !numbers;
    setNumbers(next);
    localStorage.setItem(NUMBERS_STORAGE_KEY, String(next));
    resetTest({ numbers: next });
  }, [numbers, resetTest]);

  const onCustomTextChange = useCallback((next: string, codeLang?: string) => {
    setCustomText(next);
    localStorage.setItem(CUSTOM_TEXT_STORAGE_KEY, next);
    setCustomCodeLanguage(codeLang ?? "");
    if (codeLang) localStorage.setItem(CUSTOM_CODE_LANGUAGE_STORAGE_KEY, codeLang);
    else localStorage.removeItem(CUSTOM_CODE_LANGUAGE_STORAGE_KEY);
    resetTest({ customText: next, mode: "custom", customCodeLanguage: codeLang ?? "" });
  }, [resetTest]);

  const onDifficultyToggle = useCallback((d: Difficulty) => {
    const next = difficulty === d ? undefined : d;
    setDifficulty(next);
    if (next) localStorage.setItem(DIFFICULTY_STORAGE_KEY, next);
    else localStorage.removeItem(DIFFICULTY_STORAGE_KEY);
    resetTest({ difficulty: next });
  }, [difficulty, resetTest]);

const onCodeLanguageChange = useCallback((next: string) => {
    setCodeLanguage(next);
    const firstChap = CODE_MANIFEST[next]?.chapters[0] ?? "";
    setCodeChapter(firstChap);
    localStorage.setItem(CODE_LANGUAGE_STORAGE_KEY, next);
    if (firstChap) {
      localStorage.setItem(CODE_CHAPTER_STORAGE_KEY, firstChap);
      resetTest({ codeLanguage: next, codeChapter: firstChap });
    } else {
      localStorage.removeItem(CODE_CHAPTER_STORAGE_KEY);
      resetTest({ codeLanguage: next, codeChapter: "" });
    }
  }, [resetTest]);

  const onCodeChapterChange = useCallback((next: string) => {
    setCodeChapter(next);
    localStorage.setItem(CODE_CHAPTER_STORAGE_KEY, next);
    resetTest({ codeChapter: next });
  }, [resetTest]);

  const controlsVisible = !started || showControls;
  const showResults = finished && frozenStatsRef.current;

  return {

    mode, timeOption, wordOption, quoteLength, quoteAuthor,
    punctuation, numbers, difficulty, customText, customCodeLanguage,
    codeLanguage, codeChapter,
    words, codeLines, codeIndents, typed, wordIndex, started, rowOffset, finished,
    timeLeft, wordInputs, showControls, isFocused, resetting, isActivelyTyping,
    screenFade, wpm, accuracy, capsLock, codeLoading,

    isRTL,
    controlsVisible, showResults, frozenStats: frozenStatsRef.current,

    inputRef, wordsContainerRef, activeWordRef,

    handleKeyDown, handleFocus, handleInputBlur, handleInputFocus,
    handleCompositionStart, handleCompositionEnd,
    handleMouseMove, handleResultsRestart, handleResultsNext,
    onModeChange, onTimeOptionChange, onWordOptionChange, onQuoteLengthChange,
    onPunctuationToggle, onNumbersToggle, onDifficultyToggle,
    onCustomTextChange, onCodeLanguageChange, onCodeChapterChange,
    onRestart: () => resetTest(),
  };
}