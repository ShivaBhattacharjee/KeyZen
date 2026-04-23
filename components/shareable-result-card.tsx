"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toBlob, toPng } from "html-to-image"
import { IconCamera, IconCopy, IconDownload } from "@tabler/icons-react"

function IconX({ size = 16 }: { size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
    >
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
    </svg>
  )
}
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { CornerBrackets } from "@/components/corner-brackets"

interface ShareableStats {
  wpm: number
  accuracy: number
  raw: number
  correctChars: number
  incorrectChars: number
  extraChars: number
  missedChars: number
  consistency: number
  elapsedSeconds: number
  correctedErrors: number
  mode: string
  modeDetail: string
  language: string
  wpmHistory: Array<{
    second: number
    wpm: number
    raw: number
    errors: number
  }>
}

type PbInfo = {
  isNewPb: boolean
  previous?: { wpm: number; accuracy: number; date: string } | null
} | null

interface ScreenshotButtonProps {
  stats: ShareableStats
  pb?: PbInfo
}

interface ThemeColors {
  bg: string
  foreground: string
  primary: string
  muted: string
  mutedFg: string
  border: string
}

const DEFAULT_THEME: ThemeColors = {
  bg: "#0a0a0a",
  foreground: "#fafafa",
  primary: "#ec4899",
  muted: "#27272a",
  mutedFg: "#a1a1aa",
  border: "#27272a",
}

function formatShareDate(d: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const day = String(d.getDate()).padStart(2, "0")
  const mon = months[d.getMonth()]
  const year = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${day} ${mon} ${year} ${hh}:${mm}`
}

function resolveCssColor(value: string, fallback: string): string {
  if (typeof document === "undefined") return fallback
  try {
    const ctx = document.createElement("canvas").getContext("2d")
    if (!ctx) return fallback
    ctx.fillStyle = "#000"
    ctx.fillStyle = value
    const resolved = ctx.fillStyle as string
    return resolved || fallback
  } catch {
    return fallback
  }
}

function readTheme(): ThemeColors {
  if (typeof window === "undefined") return DEFAULT_THEME
  const root = getComputedStyle(document.documentElement)
  const read = (name: string, fb: string) => {
    const raw = root.getPropertyValue(name).trim()
    if (!raw) return fb
    return resolveCssColor(raw, fb)
  }
  return {
    bg: read("--background", DEFAULT_THEME.bg),
    foreground: read("--foreground", DEFAULT_THEME.foreground),
    primary: read("--primary", DEFAULT_THEME.primary),
    muted: read("--muted", DEFAULT_THEME.muted),
    mutedFg: read("--muted-foreground", DEFAULT_THEME.mutedFg),
    border: read("--border", DEFAULT_THEME.border),
  }
}

export function ScreenshotButton({ stats, pb }: ScreenshotButtonProps) {
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<null | "copy" | "download" | "tweet">(null)
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME)

  useEffect(() => {
    if (open) setTheme(readTheme())
  }, [open])

  const renderOptions = {
    pixelRatio: 2,
    backgroundColor: theme.bg,
    cacheBust: true,
    skipFonts: true,
  } as const

  const getBlob = useCallback(async () => {
    if (!cardRef.current) throw new Error("card not ready")
    const blob = await toBlob(cardRef.current, renderOptions)
    if (!blob) throw new Error("render returned no blob")
    return blob
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.bg])

  const getDataUrl = useCallback(async () => {
    if (!cardRef.current) throw new Error("card not ready")
    return toPng(cardRef.current, renderOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.bg])

  const handleDownload = useCallback(async () => {
    try {
      setBusy("download")
      const dataUrl = await getDataUrl()
      const link = document.createElement("a")
      link.download = `keyzen-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      toast.success("image downloaded")
    } catch (err) {
      console.error(err)
      toast.error("download failed")
    } finally {
      setBusy(null)
    }
  }, [getDataUrl])

  const handleCopy = useCallback(async () => {
    try {
      setBusy("copy")
      const blob = await getBlob()
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ])
      toast.success("image copied to clipboard")
    } catch (err) {
      console.error(err)
      toast.error("copy failed")
    } finally {
      setBusy(null)
    }
  }, [getBlob])

  const handleTweet = useCallback(async () => {
    try {
      setBusy("tweet")
      try {
        const blob = await getBlob()
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ])
        toast.success("image copied — paste it into your post")
      } catch {
        // clipboard may not be permitted
      }
      const text = `Just hit ${stats.wpm} WPM with ${stats.accuracy}% accuracy in a ${stats.elapsedSeconds} sec test.\n\nThink you can beat me? Try KeyZen, a minimal distraction-free typing test.\n\nhttps://keyzen.theshiva.xyz`
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      console.error(err)
      toast.error("could not open post")
    } finally {
      setBusy(null)
    }
  }, [getBlob, stats.wpm, stats.accuracy, stats.elapsedSeconds])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CornerBrackets className="inline-flex">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-0 focus-visible:outline-none"
          >
            <IconCamera size={16} stroke={1.5} aria-hidden />
            Screenshot
          </button>
        </CornerBrackets>
      </DialogTrigger>
      <DialogContent
        className="max-w-[min(calc(100%-2rem),1000px)]! sm:max-w-[700px]!"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Share your result</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-2">
          <ScaledCardPreview>
            <div ref={cardRef}>
              <ShareableResultCard stats={stats} pb={pb} theme={theme} />
            </div>
          </ScaledCardPreview>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2">
          <CornerBrackets className="inline-flex">
            <button
              type="button"
              onClick={handleCopy}
              disabled={busy !== null}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-0 focus-visible:outline-none disabled:opacity-50"
            >
              <IconCopy size={16} stroke={1.5} aria-hidden />
              {busy === "copy" ? "Copying..." : "Copy"}
            </button>
          </CornerBrackets>
          <CornerBrackets className="inline-flex">
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy !== null}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-0 focus-visible:outline-none disabled:opacity-50"
            >
              <IconDownload size={16} stroke={1.5} aria-hidden />
              {busy === "download" ? "Downloading..." : "Download"}
            </button>
          </CornerBrackets>
          <CornerBrackets className="inline-flex">
            <button
              type="button"
              onClick={handleTweet}
              disabled={busy !== null}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-0 focus-visible:outline-none disabled:opacity-50"
            >
              <IconX size={14} />
              {busy === "tweet" ? "Posting..." : "Post"}
            </button>
          </CornerBrackets>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const CARD_WIDTH = 720

function ScaledCardPreview({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [innerHeight, setInnerHeight] = useState(0)

  useEffect(() => {
    const measure = () => {
      const w = wrapperRef.current?.getBoundingClientRect().width ?? 0

      const h = innerRef.current?.offsetHeight ?? 0
      if (h > 0) setInnerHeight(h)
      if (w > 0 && h > 0) {
        const maxPreviewHeight = Math.max(200, window.innerHeight * 0.55)
        const scaleByWidth = w < CARD_WIDTH ? w / CARD_WIDTH : 1
        const scaleByHeight = h > maxPreviewHeight ? maxPreviewHeight / h : 1
        setScale(Math.min(scaleByWidth, scaleByHeight, 1))
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    if (innerRef.current) ro.observe(innerRef.current)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const scaledWidth = CARD_WIDTH * scale

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden"
      style={{ height: innerHeight * scale }}
    >
      <div
        ref={innerRef}
        style={{
          width: CARD_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: `calc(50% - ${scaledWidth / 2}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

interface ShareableResultCardProps {
  stats: ShareableStats
  pb?: PbInfo
  theme?: ThemeColors
}

export function ShareableResultCard({
  stats,
  pb,
  theme = DEFAULT_THEME,
}: ShareableResultCardProps) {
  const wpmHistory = stats.wpmHistory
  const maxWpm = Math.max(...wpmHistory.map((d) => Math.max(d.wpm, d.raw)), 1)

  // Chart dimensions
  const chartWidth = 440
  const chartHeight = 180
  const padding = { top: 12, right: 8, bottom: 24, left: 32 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const lastSecond = wpmHistory[wpmHistory.length - 1]?.second || 1
  const yMax = Math.ceil(maxWpm * 1.2)

  const toPoint = (d: { second: number; value: number }) => {
    const x = padding.left + (d.second / lastSecond) * graphWidth
    const y = padding.top + graphHeight - (d.value / yMax) * graphHeight
    return `${x},${y}`
  }

  const wpmPoints = wpmHistory.map((d) =>
    toPoint({ second: d.second, value: d.wpm })
  )
  const rawPoints = wpmHistory.map((d) =>
    toPoint({ second: d.second, value: d.raw })
  )

  const yTicks = [0, Math.round(yMax / 2), yMax]

  const cardWidth = 720

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        width: cardWidth,
        backgroundColor: theme.bg,
        color: theme.foreground,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        padding: "28px 32px",
      }}
    >

      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 20 }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 20,
            fontWeight: 700,
            color: theme.primary,
            letterSpacing: "0.02em",
          }}
        >
          KeyZen
        </span>
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            color: theme.mutedFg,
            opacity: 0.6,
          }}
        >
          {formatShareDate(new Date())} | keyzen.theshiva.xyz
        </span>
      </div>

      {/* Main row: stats column + chart */}
      <div className="flex items-start" style={{ gap: 20 }}>
        <div style={{ width: 150, flexShrink: 0 }}>
          <StatBlock label="WPM" value={stats.wpm} theme={theme} />
          <div style={{ height: 14 }} />
          <StatBlock
            label="Accuracy"
            value={`${stats.accuracy}%`}
            theme={theme}
          />
          {pb?.isNewPb && (
            <>
              <div style={{ height: 14 }} />
              <StatBlock
                label="Personal Best"
                value={stats.wpm}
                theme={theme}
              />
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: theme.primary,
                }}
              >
                New Personal Best
              </div>
            </>
          )}
          {pb && !pb.isNewPb && pb.previous && (
            <>
              <div style={{ height: 14 }} />
              <StatBlock
                label="Personal Best"
                value={pb.previous.wpm}
                theme={theme}
              />
            </>
          )}

          <div style={{ marginTop: 20, fontSize: 11, color: theme.mutedFg }}>
            <div
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                opacity: 0.5,
                marginBottom: 2,
              }}
            >
              Test Type
            </div>
            <div style={{ color: theme.primary }}>
              {stats.mode.charAt(0).toUpperCase() + stats.mode.slice(1)} {stats.modeDetail}
            </div>
            <div style={{ opacity: 0.5 }}>English</div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: "100%", height: chartHeight }}
          >
            {yTicks.map((t) => {
              const y = padding.top + graphHeight - (t / yMax) * graphHeight
              return (
                <g key={t}>
                  <line
                    x1={padding.left}
                    x2={chartWidth - padding.right}
                    y1={y}
                    y2={y}
                    stroke={theme.mutedFg}
                    strokeOpacity={0.1}
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize={10}
                    fill={theme.mutedFg}
                    opacity={0.5}
                  >
                    {t}
                  </text>
                </g>
              )
            })}
            {wpmHistory.length > 1 && (
              <>
                <polyline
                  points={rawPoints.join(" ")}
                  fill="none"
                  stroke={theme.mutedFg}
                  strokeOpacity={0.35}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={wpmPoints.join(" ")}
                  fill="none"
                  stroke={theme.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {wpmHistory.map((d, i) => {
                  const [x, y] = wpmPoints[i].split(",")
                  return (
                    <circle
                      key={`${d.second}-${i}`}
                      cx={x}
                      cy={y}
                      r={2.5}
                      fill={theme.primary}
                    />
                  )
                })}
              </>
            )}
            {/* x-axis label */}
            <text
              x={padding.left}
              y={chartHeight - 4}
              fontSize={10}
              fill={theme.mutedFg}
              opacity={0.5}
            >
              1s
            </text>
            <text
              x={chartWidth - padding.right}
              y={chartHeight - 4}
              fontSize={10}
              fill={theme.mutedFg}
              opacity={0.5}
              textAnchor="end"
            >
              {lastSecond}s
            </text>
          </svg>
        </div>
      </div>

      {/* Bottom stats row */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${theme.border}`,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
        }}
      >
        <SmallStat label="Raw" value={stats.raw} theme={theme} />
        <SmallStat
          label="Characters"
          value={`${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`}
          theme={theme}
        />
        <SmallStat
          label="Consistency"
          value={`${stats.consistency}%`}
          theme={theme}
        />
        <SmallStat
          label="Time"
          value={`${stats.elapsedSeconds}s`}
          theme={theme}
        />
        <SmallStat label="Fixes" value={stats.correctedErrors} theme={theme} />
      </div>
    </div>
  )
}

function StatBlock({
  label,
  value,
  theme,
}: {
  label: string
  value: string | number
  theme: ThemeColors
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: theme.mutedFg, marginBottom: 2 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 48,
          fontWeight: 700,
          color: theme.primary,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function SmallStat({
  label,
  value,
  theme,
}: {
  label: string
  value: string | number
  theme: ThemeColors
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10, color: theme.mutedFg, marginBottom: 2 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 18,
          fontWeight: 700,
          color: theme.primary,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  )
}
