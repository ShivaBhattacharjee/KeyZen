"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useMountEffect } from "@/hooks/use-mount-effect"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "motion/react"
import { IconInfoCircle, IconNotes, IconSettings } from "@tabler/icons-react"
import { GithubLogo } from "@phosphor-icons/react"

import { CornerBrackets } from "@/components/corner-brackets"
import { DynamicFavicon } from "@/components/dynamic-favicon"
import { SettingsPanel } from "@/components/settings-panel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useClickSound } from "@/hooks/use-click-sound"

interface AppChromeContextValue {
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  testSettingsOpen: boolean
  setTestSettingsOpen: (open: boolean) => void
  typingActive: boolean
  setTypingActive: (active: boolean) => void
  homeLogoHandlerRef: React.MutableRefObject<(() => void) | null>
}

const AppChromeContext = createContext<AppChromeContextValue | null>(null)

export function useAppChrome() {
  const ctx = useContext(AppChromeContext)
  if (!ctx)
    throw new Error("useAppChrome must be used within AppChrome")
  return ctx
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === "/landing"
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [testSettingsOpen, setTestSettingsOpen] = useState(false)
  const [typingActive, setTypingActive] = useState(false)
  const [keyboardInset, setKeyboardInset] = useState(0)
  const [isMobile, setIsMobile] = useState(true)
  const homeLogoHandlerRef = useRef<(() => void) | null>(null)
  useClickSound()

  useEffect(() => {
    if (typeof window === "undefined") return

    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Modern VirtualKeyboard API (Chrome/Edge/Android)
    // @ts-ignore
    if ("virtualKeyboard" in navigator) {
      // @ts-ignore
      navigator.virtualKeyboard.overlaysContent = true
      const onGeometryChange = (e: any) => {
        const { height } = e.target.boundingRect
        setKeyboardInset(height)
      }
      // @ts-ignore
      navigator.virtualKeyboard.addEventListener("geometrychange", onGeometryChange)

      return () => {
        window.removeEventListener("resize", checkMobile)
        // @ts-ignore
        navigator.virtualKeyboard.removeEventListener("geometrychange", onGeometryChange)
      }
    }

    // Fallback for iOS Safari (which doesn't support virtualKeyboard API yet)
    const vv = window.visualViewport
    if (!vv) {
      return () => window.removeEventListener("resize", checkMobile)
    }

    const onResize = () => {
      // On iOS, when keyboard opens, visualViewport.height shrinks.
      const delta = window.innerHeight - vv.height
      if (delta > 100) {
        setKeyboardInset(delta)
      } else {
        setKeyboardInset(0)
      }
    }

    vv.addEventListener("resize", onResize)
    return () => {
      vv.removeEventListener("resize", onResize)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useMountEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => { })
    }
  })

  const value = useMemo(
    () => ({
      settingsOpen,
      setSettingsOpen,
      testSettingsOpen,
      setTestSettingsOpen,
      typingActive,
      setTypingActive,
      homeLogoHandlerRef,
    }),
    [settingsOpen, testSettingsOpen, typingActive],
  )

  const keyboardOpen = keyboardInset > 0

  return (
    <AppChromeContext.Provider value={value}>
      <DynamicFavicon />
      <motion.div
        initial={false}
        animate={{
          height: (isMobile && keyboardOpen) ? `calc(100dvh - ${keyboardInset}px)` : "100dvh",
          opacity: keyboardOpen ? [0.9, 1] : 1,
          y: keyboardOpen ? [14, 0] : 0,
        }}
        transition={{
          height: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
        }}
        className="flex w-full flex-col bg-background"
        style={{ minHeight: (isMobile && keyboardOpen) ? 0 : "100dvh" }}
      >
        {!isLanding && <SiteHeader />}
        {children}
      </motion.div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </AppChromeContext.Provider>
  )
}

function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { setSettingsOpen, typingActive, homeLogoHandlerRef } =
    useAppChrome()

  const isHome = pathname === "/"
  const dimHeader = isHome && typingActive


  const [mouseHeaderVisible, setMouseHeaderVisible] = useState(false)
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  const headerVisible = !isHome || !typingActive || (isHome && typingActive && mouseHeaderVisible)

  const handleHeaderMouseMove = useCallback(() => {
    if (!isHome || !typingActive) return
    setMouseHeaderVisible(true)
    if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
    headerTimerRef.current = setTimeout(() => setMouseHeaderVisible(false), 2500)
  }, [isHome, typingActive])


  useMountEffect(() => {
    return () => {
      if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
    }
  })

  function handleLogoClick() {
    if (isHome && homeLogoHandlerRef.current) {
      homeLogoHandlerRef.current()
      return
    }
    router.push("/")
  }

  const iconButtonClass =
    "rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

  return (
    <motion.header
      animate={{ opacity: dimHeader ? (headerVisible ? 1 : 0.1) : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      onMouseMove={handleHeaderMouseMove}
      className="flex shrink-0 justify-center border-b border-border px-6 py-3"
    >
      <div className="flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          {isHome ? (
            <button
              type="button"
              onClick={handleLogoClick}
              className="cursor-pointer font-(family-name:--font-doto) text-4xl font-bold text-primary"
            >
              KeyZen
            </button>
          ) : (
            <Link
              href="/"
              className="font-(family-name:--font-doto) text-4xl font-bold text-primary"
            >
              KeyZen
            </Link>
          )}
          <div className="flex items-center gap-0.5">
            <Link
              href="/about"
              prefetch
              className={cn(
                iconButtonClass,
                pathname === "/about" && "text-foreground",
              )}
              aria-current={pathname === "/about" ? "page" : undefined}
              aria-label="About KeyZen"
            >
              <IconInfoCircle size={16} stroke={1.5} aria-hidden />
            </Link>
            <Link
              href="/changelog"
              prefetch
              className={cn(
                iconButtonClass,
                pathname === "/changelog" && "text-foreground",
              )}
              aria-current={pathname === "/changelog" ? "page" : undefined}
              aria-label="Changelog"
            >
              <IconNotes size={16} stroke={1.5} aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className={cn(iconButtonClass, "cursor-pointer")}
              aria-label="Settings"
            >
              <IconSettings size={16} />
            </button>
          </div>
        </div>
        <CornerBrackets>
          <Button variant="noborderradius" asChild>
            <a
              href="https://github.com/shivabhattacharjee/KeyZen"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <GithubLogo />
              <span className="hidden md:block">Open Source</span>
            </a>
          </Button>
        </CornerBrackets>
      </div>
    </motion.header>
  )
}
