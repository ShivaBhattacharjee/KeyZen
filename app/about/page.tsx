import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — KeyZen",
  description:
    "KeyZen is a hobby open-source typing test inspired by Monkeytype.",
}

export const revalidate = 3600

const REPO_OWNER = "shivabhattacharjee"
const REPO_NAME = "KeyZen"

interface Contributor {
  login: string
  html_url: string
  avatar_url: string
  contributions: number
}

async function fetchContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100`,
      {
        next: { revalidate },
        headers: { Accept: "application/vnd.github+json" },
      }
    )
    if (!res.ok) return []
    return (await res.json()) as Contributor[]
  } catch {
    return []
  }
}

export default async function AboutPage() {
  const contributors = await fetchContributors()

  return (
    <main className="flex flex-1 flex-col px-6 py-10 md:py-16">
      <article className=" w-full mx-auto max-w-5xl space-y-6 text-muted-foreground">
        <h1 className="font-(family-name:--font-doto) text-3xl font-bold text-foreground md:text-4xl">
          About KeyZen
        </h1>
        <p className="text-sm text-muted-foreground/50 -mt-2">
          🚀 Proudly launched on April 13, 2025
        </p>
        <p className="leading-relaxed">
          KeyZen is a small side project: a clean, browser-based typing speed
          test built for practice and fun. It is{" "}
          <a
            href="https://github.com/shivabhattacharjee/KeyZen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            open source
          </a>{" "}
          and free to use or fork.
        </p>
        <p className="leading-relaxed">
          The UI and flow are heavily inspired by{" "}
          <a
            href="https://monkeytype.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Monkeytype
          </a>
          , a benchmark for minimal typing-test design. KeyZen is not affiliated
          with Monkeytype; it is an independent hobby implementation with its own
          stack and features.
        </p>
        <p className="leading-relaxed">
          If you spot a bug or want to improve something,{" "}
          <a
            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            raise an issue or request a feature
          </a>{" "}
          on GitHub.
        </p>

        <h2 className="font-(family-name:--font-doto) text-xl font-semibold text-foreground">
          Privacy & Data Collection
        </h2>
        <p className="leading-relaxed">
          KeyZen uses Google Analytics to collect anonymous usage data such as typing
          speed, accuracy, and feature usage. This helps identify bugs, improve UX, and
          prioritize new features. No personal information is collected. Data is
          processed in accordance with Google&apos;s{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>



        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">Contributors</p>
          {contributors.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Could not load contributors.{" "}
              <a
                href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/graphs/contributors`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                View on GitHub ↗
              </a>
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {contributors.map((c) => (
                <a
                  key={c.login}
                  href={c.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${c.login} — ${c.contributions} commit${c.contributions === 1 ? "" : "s"}`}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-muted/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar_url}
                    alt={c.login}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span>@{c.login}</span>
                  <span className="font-(family-name:--font-mono) text-[11px] text-muted-foreground">
                    {c.contributions}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Shiva Bhattacharjee.
        </p>

        <p>
          <Link
            href="/"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ← Back to typing test
          </Link>
        </p>
      </article>
    </main>
  )
}
