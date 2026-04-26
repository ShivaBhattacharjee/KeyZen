"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface WordItemProps {
  word: string;
  /** Live `typed` for the active word; finalized input for past; "" for future. */
  displayInput: string;
  isActive: boolean;
  isPast: boolean;
  /** True when a completed word was typed with any error → red underline. */
  hasError: boolean;
  elemRef?: React.RefObject<HTMLDivElement | null>;
  /** When true, the word fades nearly invisible (ghost mode for upcoming words). */
  dimmed?: boolean;
  /** When true, render cursor on the right side (RTL languages). */
  isRTL?: boolean;
  /** Per-character syntax highlight colors (hex) for un-typed chars (code mode). */
  tokenColors?: (string | undefined)[];
}

export const WordItem = memo(function WordItem({
  word,
  displayInput,
  isActive,
  isPast,
  hasError,
  elemRef,
  dimmed = false,
  isRTL = false,
  tokenColors,
}: WordItemProps) {
  const cursorAtEnd = isActive && displayInput.length >= word.length;

  return (
    <div
      ref={isActive ? elemRef : undefined}
      className={cn(
        "relative whitespace-nowrap",
        isPast && hasError && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-destructive/50",
      )}
      style={dimmed ? { opacity: 0.05 } : undefined}
    >
      {word.split("").map((char, cIdx) => {
        const tokenHex = tokenColors?.[cIdx];
        const defaultColor = tokenHex ? undefined : "text-muted-foreground/40";
        let color = defaultColor;
        let inlineColor = tokenHex;
        if (isPast || isActive) {
          if (cIdx < displayInput.length) {
            color = displayInput[cIdx] === char ? "text-foreground" : "text-destructive";
            inlineColor = undefined;
          } else {
            color = defaultColor;
            inlineColor = tokenHex;
          }
        }
        const isLastChar = cIdx === word.length - 1;

        return (
          <span key={cIdx} className={cn("relative", isRTL ? "inline" : "inline-block")}>
            {/* Cursor before this char. Stable layoutId → Framer Motion FLIP-animates
                the cursor smoothly when wordIndex changes (spacebar press). */}
            {isActive && cIdx === displayInput.length && (
              <motion.span
                layoutId="cursor-active"
                className={cn(
                  "typing-cursor absolute top-0.5 h-[1.2em] w-0.5 rounded-full bg-primary",
                  isRTL ? "-right-px" : "-left-px",
                )}
                transition={{ type: "spring", stiffness: 700, damping: 38, mass: 0.6 }}
              />
            )}
            {isActive && isLastChar && cursorAtEnd && (
              <motion.span
                layoutId="cursor-active"
                className={cn(
                  "typing-cursor absolute top-0.5 h-[1.2em] w-0.5 rounded-full bg-primary",
                  isRTL ? "-left-px" : "-right-px",
                )}
                transition={{ type: "spring", stiffness: 700, damping: 38, mass: 0.6 }}
              />
            )}
            <span
              className={cn("transition-colors duration-60", color)}
              style={inlineColor ? { color: inlineColor } : undefined}
            >
              {char}
            </span>
          </span>
        );
      })}

      {(isActive || isPast) &&
        displayInput.length > word.length &&
        displayInput.slice(word.length).split("").map((char, eIdx) => (
          <span key={`extra-${eIdx}`} className="text-destructive/60">
            {char}
          </span>
        ))}
    </div>
  );
});
