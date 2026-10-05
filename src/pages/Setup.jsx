import { useState } from 'react';
import { Play, ClipboardList, Layers, BookOpen, Shuffle, Timer, CheckCircle2 } from 'lucide-react';
import { units } from '../data/questions';

const MODES = [['full', 'Full Quiz', ClipboardList, 'All 50 questions, timed.'], ['unit', 'Unit-wise Quiz', Layers, 'Focus on one unit.'], ['practice', 'Practice Mode', BookOpen, 'Check each answer as you go.']];

function Toggle({ on, onChange, label, icon: Icon }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left dark:border-white/10">
      <span className="flex items-center gap-2 text-sm font-medium"><Icon size={16} className="text-blue-600 dark:text-cyan-400" />{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-blue-600 dark:bg-cyan-400' : 'bg-slate-300 dark:bg-white/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all dark:bg-navy-950 ${on ? 'left-[22px] dark:bg-navy-950' : 'left-0.5 dark:bg-white'}`} />
      </span>
      <span className="sr-only">{on ? 'On' : 'Off'}</span>
    </button>
  );
}

export default function Setup({ name, setName, settings, setSettings, onStart, onBack }) {
  const [err, setErr] = useState('');
  const set = (p) => setSettings((s) => ({ ...s, ...p }));
  const chooseMode = (mode) => {
    const unit = mode === 'full' ? 'all' : settings.unit;
    set({ mode, unit, minutes: unit === 'all' ? 30 : 10 });
  };
  const chooseUnit = (unit) => set({ unit, minutes: unit === 'all' ? 30 : 10 });
  const sel = units.find((u) => u.id === settings.unit);
  const count = settings.unit === 'all' ? 50 : 10;
  const go = () => {
    if (!name.trim()) { setErr('Please enter your name to start.'); return; }
    onStart();
  };
  return (
    <div className="mx-auto max-w-4xl animate-rise px-4 py-10 sm:px-6">
      <p className="eyebrow">Quiz setup</p>
      <h1 className="mt-1 text-3xl font-bold">Set up your quiz</h1>
      <div className="card mt-6 p-5 sm:p-6">
        <label htmlFor="name" className="text-sm font-semibold">Enter your name</label>
        <input id="name" className="input mt-2" value={name} maxLength={40} autoComplete="given-name" placeholder="e.g. Vishnu"
          onChange={(e) => { setName(e.target.value); setErr(''); }} aria-invalid={!!err} aria-describedby={err ? 'name-err' : undefined} />
        {err && <p id="name-err" role="alert" className="mt-2 text-sm text-rose-500">{err}</p>}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest text-slate-500">Quiz mode</h2>
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Quiz mode">
        {MODES.map(([k, label, Icon, d]) => (
          <button key={k} role="radio" aria-checked={settings.mode === k} onClick={() => chooseMode(k)}
            className={`card p-4 text-left transition hover:-translate-y-0.5 ${settings.mode === k ? '!border-blue-600 ring-2 ring-blue-600/30 dark:!border-cyan-400 dark:ring-cyan-400/30' : ''}`}>
            <Icon size={20} className="text-blue-600 dark:text-cyan-400" /><div className="mt-2 font-semibold">{label}</div><div className="text-sm text-slate-500">{d}</div>
          </button>
        ))}
      </div>

      {settings.mode !== 'full' && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest text-slate-500">Unit</h2>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Unit">
            {[...units, { id: 'all', title: 'All Units' }].map((u) => (
              <button key={u.id} role="radio" aria-checked={settings.unit === u.id} onClick={() => chooseUnit(u.id)}
                className={`card px-4 py-3 text-left transition ${settings.unit === u.id ? '!border-blue-600 ring-2 ring-blue-600/30 dark:!border-cyan-400 dark:ring-cyan-400/30' : 'hover:border-slate-400'}`}>
                <div className="eyebrow">{u.id === 'all' ? 'ALL UNITS' : u.id.toUpperCase()}</div><div className="font-medium">{u.title}</div>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="card mt-6 flex items-center justify-between p-4" aria-live="polite">
        <div><div className="eyebrow">{sel ? sel.id.toUpperCase() : 'ALL UNITS'}</div><div className="font-semibold">{sel ? sel.title : 'Full quiz'}</div></div>
        <div className="font-mono text-lg font-bold">{count} Questions</div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest text-slate-500">Options</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle on={settings.instantFeedback ?? true} onChange={(v) => set({ instantFeedback: v })} label="Instant Feedback (Show answers as you attend)" icon={CheckCircle2} />
        <Toggle on={settings.randomQ} onChange={(v) => set({ randomQ: v })} label="Randomize Questions" icon={Shuffle} />
        <Toggle on={settings.randomO} onChange={(v) => set({ randomO: v })} label="Randomize Options" icon={Shuffle} />
        {settings.mode !== 'practice' && (
          <>
            <Toggle on={settings.timerOn} onChange={(v) => set({ timerOn: v })} label="Timer" icon={Timer} />
            <label className={`flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm font-medium dark:border-white/10 ${settings.timerOn ? '' : 'opacity-40'}`}>
              Minutes
              <input type="number" min={1} max={180} disabled={!settings.timerOn} value={settings.minutes} aria-label="Timer minutes"
                onChange={(e) => set({ minutes: Math.min(180, Math.max(1, parseInt(e.target.value) || 1)) })} className="input !w-24 !py-1.5 text-center font-mono" />
            </label>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button className="btn btn-primary !px-8 !py-3.5" onClick={go}><Play size={16} /> START QUIZ</button>
        <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}
