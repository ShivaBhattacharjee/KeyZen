import { GoogleAnalytics } from "@next/third-parties/google"
import { Doto, Geist_Mono, Space_Grotesk } from "next/font/google"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { AppChrome } from "@/components/app-chrome"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/components/settings-context"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"
import { MultiplayerProvider } from "@/components/multiplayer-context"

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'})

const doto = Doto({ subsets: ['latin'], variable: '--font-doto' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: `${siteConfig.name} — Typing Speed Test`,
  description: siteConfig.description,
  keywords: [
    "typing test",
    "typing speed",
    "wpm test",
    "words per minute",
    "typing practice",
    "typing trainer",
    "KeyZen",
    "monkeytype alternative",
  ],
  authors: [{ name: siteConfig.name }],
  creator: "Shiva Bhattacharjee",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://KeyZen.theshiva.xyz",
    title: `${siteConfig.name} — Typing Speed Test`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/opengraph.png",
        width: 1440,
        height: 1080,
        alt: "KeyZen — typing practice with on-screen keyboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Typing Speed Test`,
    description:
      "A clean, minimal typing test. Track your WPM and accuracy in real-time.",
    creator: `@${siteConfig.name}`,
    images: ["/opengraph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", spaceGrotesk.variable, doto.variable)}
    >  
     <GoogleAnalytics gaId="G-CF6Q22DV51" />   
      <body>
        <Toaster/>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W5HG68WM"
            height={0}
            width={0}
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <ThemeProvider>
          <SettingsProvider>
            <MultiplayerProvider>
              <AppChrome>{children}</AppChrome>
            </MultiplayerProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
