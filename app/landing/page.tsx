"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import {
  Timer,
  ChartBar,
  MinusCircle,
  Code,
  ArrowRight,
  GithubLogo,
  TwitterLogo,
  Lightning,
} from "@phosphor-icons/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070b] text-slate-200 overflow-x-hidden font-sans relative">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#00d8d6]/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[500px] left-[10%] w-[300px] h-[300px] bg-[#00d8d6]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="relative pt-20 pb-10 flex flex-col items-center text-center z-10 overflow-hidden px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00d8d6]/20 bg-[#00d8d6]/5 text-[#00d8d6] text-xs font-semibold mb-8 backdrop-blur-xl">
          <Lightning size={12} weight="fill" />
          <span>Free</span>
          <span className="w-1 h-1 rounded-full bg-[#00d8d6]"></span>
          <span>Open Source</span>
          <span className="w-1 h-1 rounded-full bg-[#00d8d6]"></span>
          <span>No Sign Up</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05] max-w-5xl">
          The calmest place to <span className="text-[#00d8d6]">train typing</span>.
          <br />
          Built for daily improvement.
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mt-6 mb-10 leading-relaxed font-light">
          Minimal distractions, deep performance tracking, and a beautifully fluid typing experience that keeps you in flow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-14">
          <button className="px-8 py-4 rounded-xl bg-[#00d8d6] text-[#041014] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_35px_rgba(0,216,214,0.22)]">
            Start Typing Now <ArrowRight size={18} weight="bold" />
          </button>
          <button className="px-8 py-4 rounded-xl border border-slate-800 bg-[#0b1017]/70 text-slate-300 font-semibold hover:border-[#00d8d6]/30 transition-all">
            View on GitHub
          </button>
        </div>

          <div className="relative w-full flex justify-center -mt-2 px-2 sm:px-4 md:px-0 overflow-hidden">
          <Image
            src="/hero.webp"
            alt="KeyZen Hero"
            width={1600}
            height={950}
            priority
            className="w-full max-w-[1280px] sm:max-w-[1150px] md:max-w-[1280px] h-auto object-contain drop-shadow-[0_30px_70px_rgba(0,216,214,0.10)]"
          />
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard icon={<Timer className="text-[#00d8d6]" size={22} weight="bold" />} title="Multiple Modes" description="Time, words, quote, zen, code, and custom tests tailored to your style." />
          <FeatureCard icon={<ChartBar className="text-[#00d8d6]" size={22} weight="bold" />} title="Live Analytics" description="Track WPM, raw speed, consistency, and typing accuracy in real time." />
          <FeatureCard icon={<MinusCircle className="text-[#00d8d6]" size={22} weight="bold" />} title="Distraction Free" description="A quiet interface designed to keep your mind focused on rhythm and flow." />
          <FeatureCard icon={<Code className="text-[#00d8d6]" size={22} weight="bold" />} title="Open Source" description="Community driven and fully transparent for anyone to contribute or fork." />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Performance that actually compounds</h2>
          <p className="text-slate-400">Built to make improvement measurable, motivating, and addictive.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Average Speed" value="98" suffix="WPM" sub="Sustainably fast" />
          <StatCard label="Accuracy" value="97" suffix="%" sub="Fewer mistakes" />
          <StatCard label="Consistency" value="A+" suffix="" sub="Daily momentum" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-slate-900">
        <h2 className="text-4xl font-bold text-center text-white mb-16">Simple process. Visible progress.</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Step number="1" title="Choose Mode" desc="Select your preferred challenge format." />
          <Step number="2" title="Type in Flow" desc="Stay focused in a clean and responsive environment." />
          <Step number="3" title="Review Stats" desc="Understand your speed, mistakes, and rhythm." />
          <Step number="4" title="Beat Yourself" desc="Come back daily and crush your previous records." />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10 mb-24">
        <div className="rounded-3xl border border-slate-800 bg-[#0b1017]/80 p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute right-[-80px] bottom-[-80px] w-[260px] h-[260px] bg-[#00d8d6]/10 blur-[120px] rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-3">Ready to sharpen your typing?</h2>
            <p className="text-slate-400 text-lg">Train daily, stay in rhythm, and watch your speed climb.</p>
          </div>
          <button className="relative z-10 px-8 py-4 rounded-xl bg-[#00d8d6] text-[#041014] font-bold whitespace-nowrap shadow-[0_0_35px_rgba(0,216,214,0.22)]">
            Launch Test
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-900 pt-16 pb-10 px-6 bg-[#04060a] relative overflow-hidden">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-[500px] h-[250px] bg-[#00d8d6]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative z-10">
          <div>
            <h3 className="text-[#00d8d6] text-3xl font-bold mb-3 font-(family-name:--font-doto)">KeyZen</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-5">A premium open-source typing test crafted for focus, rhythm, speed, and measurable long-term consistency.</p>
            <div className="flex gap-3">
              <a href="#" className="w-11 h-11 rounded-full bg-[#0b1017] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#00d8d6] hover:border-[#00d8d6]/30 transition-all"><GithubLogo size={20} /></a>
              <a href="#" className="w-11 h-11 rounded-full bg-[#0b1017] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#00d8d6] hover:border-[#00d8d6]/30 transition-all"><TwitterLogo size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Navigation</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-[#00d8d6] transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-[#00d8d6] transition-colors">Performance Stats</a></li>
              <li><a href="#" className="hover:text-[#00d8d6] transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-[#00d8d6] transition-colors">Launch Test</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support the Project</h4>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">Enjoying KeyZen? Star the repository and help the project grow in the open-source community.</p>
            <GitHubStarButton />
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 relative z-10">
          <p>© 2026 KeyZen. Released under Apache-2.0 License.</p>
          <p>Built for typists who chase perfection.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="rounded-2xl border border-slate-900 bg-[#0a0e14]/70 p-6 hover:border-[#00d8d6]/20 transition-all"> <div className="w-11 h-11 rounded-xl bg-[#0f141d] border border-slate-800 flex items-center justify-center mb-4">{icon}</div><h3 className="text-white font-semibold mb-2">{title}</h3><p className="text-slate-400 text-sm leading-relaxed">{description}</p></div>;
}

function StatCard({ label, value, suffix, sub }: any) {
  return <div className="rounded-3xl border border-slate-900 bg-[#0a0e14]/70 p-8 text-center"><p className="text-slate-500 text-sm mb-4">{label}</p><div className="text-6xl font-black text-[#00d8d6]">{value}<span className="text-2xl ml-1">{suffix}</span></div><p className="text-slate-500 text-sm mt-4">{sub}</p></div>;
}

function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/shivabhattacharjee/KeyZen')
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(null));
  }, []);

  return (
    <a
      href="https://github.com/shivabhattacharjee/KeyZen"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#00d8d6] text-[#041014] font-bold hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(0,216,214,0.18)]"
    >
      <GithubLogo size={18} weight="fill" />
      Star on GitHub
      {stars !== null && (
        <span className="px-2.5 py-1 rounded-md bg-white/20 text-sm font-semibold">
          {stars.toLocaleString()}
        </span>
      )}
    </a>
  );
}

function Step({ number, title, desc }: any) {
  return <div className="text-center rounded-2xl border border-slate-900 bg-[#0a0e14]/60 p-8"><div className="w-12 h-12 rounded-full mx-auto bg-[#00d8d6]/10 border border-[#00d8d6]/20 text-[#00d8d6] flex items-center justify-center font-bold mb-5">{number}</div><h4 className="text-white font-semibold mb-2">{title}</h4><p className="text-slate-400 text-sm">{desc}</p></div>;
}
