<img width="1440" height="1080" alt="image" src="https://github.com/user-attachments/assets/f44d3888-3b4e-45fd-9aa6-752ad1b47587" />


# KeyZen

**KeyZen** is a typing-test website: timed and word-count drills, quotes, and a zen mode, with detailed results (WPM, accuracy, consistency, charts). On large screens you can turn on a **virtual keyboard** that highlights keys as you type, plus **key sounds** and optional **haptics** (supported devices).

**Live :** [KeyZen](https://keyzen.theshiva.xyz/)

---

## Features

| Area | What you get |
|------|----------------|
| **Test modes** | Time (e.g. 15s–120s), word count, quotes (length presets), zen |
| **Results** | WPM, raw speed, accuracy, character breakdown, consistency, elapsed time, WPM-over-time chart |
| **Virtual keyboard** | Classic layout; mirrors expected keys while typing (**desktop / `lg+` only** in the UI) |
| **Sound** | Per-key feedback via Web Audio (`public/sounds/sound.ogg`); toggle in Settings |
| **Haptics** | Optional vibration on supported hardware ([web-haptics](https://www.npmjs.com/package/web-haptics)) |
| **Settings** | Theme (light / dark / system), accent color, typography (many Google fonts), show keyboard, sound, realtime WPM |

Settings are stored in `localStorage` in the browser.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 9+ (used in the commands below)

If you use npm or Yarn, run the equivalent of `install` and the scripts from `package.json`.

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shivabhattacharjee/KeyZen.git
   cd KeyZen
   ```

   If your folder name differs (e.g. `keyboard-typing-test`), `cd` into that directory instead.

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   This installs all packages and runs **`postinstall`**, which copies quote text from the `inspirational-quotes` package into:

   `data/quotes.json`

   Quote mode needs that file; if `pnpm install` fails, fix the error first—do not skip install.

3. **Run the development server**

   ```bash
   pnpm dev
   ```

4. **Open the site**

   In your browser go to [http://localhost:3000](http://localhost:3000).

---

## Production build

```bash
pnpm build
pnpm start
```

By default the app listens on port **3000** (`next start`). Use `pnpm start -- -p 4000` (or your host’s process manager) to change the port.

---

## Sound and the browser

Audio uses the **Web Audio API**. Many browsers only unlock audio after a **user gesture** (click, tap, or key press). If sound is enabled in Settings but you hear nothing, interact with the page once (e.g. start typing or click the test area), then try again.

---

## Project scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Optimized production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript (`tsc --noEmit`) |
| `pnpm format` | Format TS/TSX with Prettier |

---

## Tech stack

- [Next.js](https://nextjs.org) (App Router), React 19, TypeScript  
- Styling: Tailwind CSS, shadcn-style UI (Radix primitives, cmdk)  
- Charts: Recharts  
- Motion: [Motion](https://motion.dev)  
- Words / quotes: `random-words`, `inspirational-quotes` (data copied on install)

---

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/shivabhattacharjee/KeyZen). Before contributing, please read the [Contributing guide](CONTRIBUTING.md) for the project rules and workflow.

## Contributors

Thanks to everyone who has contributed to KeyZen!

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ShivaBhattacharjee">
        <img src="https://avatars.githubusercontent.com/u/95211406?v=4" width="80" height="80" style="border-radius:50%" alt="ShivaBhattacharjee" /><br />
        <sub><b>ShivaBhattacharjee</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/priyanshuwq">
        <img src="https://avatars.githubusercontent.com/u/105375708?v=4" width="80" height="80" style="border-radius:50%" alt="priyanshuwq" /><br />
        <sub><b>priyanshuwq</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/RusilKoirala">
        <img src="https://avatars.githubusercontent.com/u/209594643?v=4" width="80" height="80" style="border-radius:50%" alt="RusilKoirala" /><br />
        <sub><b>RusilKoirala</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/saaahilhussain">
        <img src="https://avatars.githubusercontent.com/u/140058338?v=4" width="80" height="80" style="border-radius:50%" alt="saaahilhussain" /><br />
        <sub><b>saaahilhussain</b></sub>
    </td>
  </tr>
</table>


## Star History

<a href="https://www.star-history.com/?repos=ShivaBhattacharjee%2FKeyZen&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ShivaBhattacharjee/KeyZen&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ShivaBhattacharjee/KeyZen&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=ShivaBhattacharjee/KeyZen&type=date&legend=top-left" />
 </picture>
</a>
