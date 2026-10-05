import { useEffect, useRef, useState } from 'react';
import { BarChart3, Moon, Sun, Menu, X, User } from 'lucide-react';

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 font-bold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 ring-1 ring-cyan-400/40"><BarChart3 size={18} className="text-cyan-400" /></span>
      <span>Data Science <span className="text-blue-600 dark:text-cyan-400">Quiz</span></span>
    </span>
  );
}

const NAV = [['home', 'Home'], ['units', 'Units'], ['history', 'Quiz History'], ['about', 'About']];

export function Header({ view, nav, theme, toggleTheme, name }) {
  const [open, setOpen] = useState(false);
  const go = (k) => { setOpen(false); nav(k); };
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-navy-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button onClick={() => go('home')} aria-label="Data Science Quiz home"><Logo /></button>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map(([k, label]) => (
            <button key={k} onClick={() => go(k)} aria-current={view === k ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${view === k ? 'bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-cyan-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`}>{label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {name && <span className="chip hidden sm:inline-flex"><User size={13} />{name}</span>}
          <button className="btn btn-ghost !p-2.5" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="btn btn-ghost !p-2.5 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">{open ? <X size={17} /> : <Menu size={17} />}</button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="animate-rise border-t border-slate-200 p-3 dark:border-white/10 md:hidden">
          {NAV.map(([k, label]) => <button key={k} onClick={() => go(k)} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5">{label}</button>)}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 py-8 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6">
        <p className="font-semibold tracking-wide text-slate-700 dark:text-slate-200">DATA SCIENCE CLASSROOM QUIZ</p>
        <p className="mt-1">50 Questions • 5 Units</p>
        <p className="mt-1 text-xs">Data Science · Big Data · NumPy · Pandas · Data Manipulation · Visualization</p>
      </div>
    </footer>
  );
}

export function ProgressBar({ value, max, label }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
      <div className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-cyan-400" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4" onClick={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="card animate-pop w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function useCountUp(target, ms = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / ms); setV(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function Ring({ pct, sub }) {
  const v = useCountUp(pct);
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-48 w-48" role="img" aria-label={`Score ${pct} percent. ${sub}`}>
      <svg viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="12" className="stroke-slate-200 dark:stroke-white/10" />
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-blue-600 dark:stroke-cyan-400"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div className="font-mono text-5xl font-bold tabular-nums">{v}%</div>
        <div className="mt-1 text-xs text-slate-500">{sub}</div>
      </div>
    </div>
  );
}
