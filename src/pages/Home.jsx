import { ArrowRight, Layers, Sigma, Database, Table2, LineChart, Network, Trophy } from 'lucide-react';
import { units } from '../data/questions';

const ICONS = [Network, Database, Sigma, Table2, LineChart];

function HeroVisual() {
  const bars = [38, 62, 48, 80, 66, 92];
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-md" aria-hidden="true">
      <div className="absolute inset-0 rounded-3xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-navy-900/60" />
      <div className="animate-floaty absolute left-4 top-6 w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-navy-800">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Accuracy by unit</div>
        <div className="mt-3 flex h-24 items-end gap-2">
          {bars.map((h, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-cyan-400" style={{ height: `${h}%` }} />)}
        </div>
      </div>
      <div className="animate-floaty absolute right-4 top-24 w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-navy-800" style={{ animationDelay: '-2s' }}>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Trend</div>
        <svg viewBox="0 0 160 60" className="mt-2 w-full">
          <path d="M0 50 L30 38 L55 44 L85 22 L115 28 L160 6" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300" className="animate-draw" />
          {[[30, 38], [85, 22], [160, 6]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill="#3b82f6" />)}
        </svg>
      </div>
      <div className="animate-floaty absolute bottom-6 left-10 flex gap-2" style={{ animationDelay: '-4s' }}>
        {['Python', 'NumPy', 'Pandas', 'ML'].map((t) => <span key={t} className="rounded-full border border-cyan-400/40 bg-navy-900 px-3 py-1 font-mono text-xs text-cyan-300 shadow">{t}</span>)}
      </div>
      <div className="absolute bottom-16 right-8 flex gap-3">
        {[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 animate-pulse rounded-full bg-blue-500" style={{ animationDelay: `${i * 0.4}s` }} />)}
      </div>
    </div>
  );
}

export default function Home({ onStart, onUnit, onLeaderboard, cloudSyncInfo }) {
  return (
    <div className="animate-rise">
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-cyan-400/40 text-blue-700 dark:text-cyan-300">DATA SCIENCE • CLASSROOM ASSESSMENT</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Class Room: #{cloudSyncInfo?.room || 'datascience-class-2025'}
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">DATA SCIENCE<br /><span className="text-blue-600 dark:text-cyan-400">CLASSROOM QUIZ</span></h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">Test your understanding of Data Science, Big Data, NumPy, Pandas, Data Manipulation, and Visualization.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn btn-primary !px-6 !py-3.5" onClick={() => onStart()}>START QUIZ <ArrowRight size={16} /></button>
              <button className="btn btn-ghost !px-6 !py-3.5" onClick={onLeaderboard}><Trophy size={16} className="text-amber-500" /> LEADERBOARD</button>
              <button className="btn btn-ghost !px-6 !py-3.5" onClick={() => document.getElementById('units')?.scrollIntoView({ behavior: 'smooth' })}>EXPLORE UNITS</button>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[['50', 'Questions'], ['5', 'Units'], ['10', 'Questions / Unit'], ['MCQ', 'Format']].map(([n, l]) => (
                <div key={l} className="card px-3 py-3"><dt className="sr-only">{l}</dt><dd className="font-mono text-2xl font-bold">{n}</dd><div className="text-xs text-slate-500">{l}</div></div>
              ))}
            </dl>
          </div>
          <HeroVisual />
        </div>
      </section>
      <section id="units" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6">
        <p className="eyebrow">Explore units</p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Five units, ten questions each</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((u, i) => {
            const Icon = ICONS[i];
            return (
              <button key={u.id} onClick={() => onUnit(u.id)} className="card group p-5 text-left transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg dark:hover:border-cyan-400/50">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-cyan-400"><Icon size={19} /></span>
                <div className="eyebrow mt-4">{u.id.toUpperCase()}</div>
                <div className="mt-1 text-lg font-semibold">{u.title}</div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500"><span>10 Questions</span><ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
              </button>
            );
          })}
          <button onClick={() => onUnit('all')} className="card flex flex-col justify-between border-dashed p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white dark:bg-cyan-400 dark:text-navy-950"><Layers size={19} /></span>
            <div><div className="eyebrow mt-4">ALL UNITS</div><div className="mt-1 text-lg font-semibold">Full 50-question quiz</div></div>
          </button>
        </div>
      </section>
    </div>
  );
}
