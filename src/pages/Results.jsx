import { useMemo, useState } from 'react';
import { Check, X, Minus, RotateCcw, History as HistoryIcon, Trophy, Target, Clock } from 'lucide-react';
import { Ring } from '../components/ui';
import QuestionNavigator from '../components/QuestionNavigator';
import { evaluate, fmtTime, fmtDate, optionText, shownLetter } from '../utils/quizUtils';

const STATUS = {
  correct: { label: 'CORRECT', Icon: Check, cls: 'border-emerald-600/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300' },
  incorrect: { label: 'INCORRECT', Icon: X, cls: 'border-rose-600/40 bg-rose-500/5 text-rose-700 dark:text-rose-300' },
  unanswered: { label: 'UNANSWERED', Icon: Minus, cls: 'border-slate-300 bg-slate-100/60 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300' },
};

export default function Results({ record, onRetake, onHistory }) {
  const [filter, setFilter] = useState('all');
  const ev = useMemo(() => evaluate(record.items), [record]);
  const high = ev.pct >= 80;
  const stats = [['Correct', ev.correct], ['Incorrect', ev.incorrect], ['Unanswered', ev.unanswered], ['Accuracy', `${ev.pct}%`], ['Time Taken', fmtTime(record.seconds)]];
  const best = [...ev.unitStats].sort((a, b) => b.pct - a.pct)[0];
  const worst = [...ev.unitStats].sort((a, b) => a.pct - b.pct)[0];
  const rows = ev.rows.filter((r) => filter === 'all' || r.status === filter);
  const counts = { all: ev.total, correct: ev.correct, incorrect: ev.incorrect, unanswered: ev.unanswered };

  return (
    <div className="mx-auto max-w-5xl animate-rise px-4 py-10 sm:px-6">
      <section className="card overflow-hidden p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <span className="chip border-emerald-500/40 text-emerald-700 dark:text-emerald-300"><Check size={13} className="animate-pop" /> QUIZ COMPLETED</span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{high ? 'Excellent work' : 'Well done'}, {record.name || 'Student'}!</h1>
            <p className="mt-2 text-slate-500">You've completed the Data Science Classroom Quiz.{' '}{fmtDate(record.date)}</p>
            <div className="mt-6 font-mono text-4xl font-bold">{ev.correct} <span className="text-slate-400">/ {ev.total}</span></div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => onRetake(record)}><RotateCcw size={15} /> RETAKE QUIZ</button>
              <button className="btn btn-ghost" onClick={onHistory}><HistoryIcon size={15} /> Quiz history</button>
            </div>
          </div>
          <Ring pct={ev.pct} sub={`${ev.correct} / ${ev.total} correct`} />
        </div>
      </section>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([l, v]) => <div key={l} className="card p-4"><dd className="font-mono text-2xl font-bold">{v}</dd><dt className="text-xs text-slate-500">{l}</dt></div>)}
      </dl>

      <section className="mt-8" aria-labelledby="perf">
        <p className="eyebrow">Performance analytics</p>
        <h2 id="perf" className="mt-1 text-2xl font-bold">Performance by unit</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="card space-y-4 p-5">
            {ev.unitStats.map((u) => (
              <div key={u.unit}>
                <div className="flex items-baseline justify-between text-sm"><span className="font-semibold">{u.unit} <span className="font-normal text-slate-500">· {u.title}</span></span><span className="font-mono">{u.correct} / {u.total} · {u.pct}%</span></div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-blue-600 transition-all duration-700 dark:bg-cyan-400" style={{ width: `${u.pct}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <div className="flex h-44 items-end gap-3" role="img" aria-label={`Bar chart: ${ev.unitStats.map((u) => `${u.unit} ${u.pct}%`).join(', ')}`}>
              {ev.unitStats.map((u) => (
                <div key={u.unit} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="font-mono text-xs">{u.pct}%</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-700" style={{ height: `${Math.max(u.pct, 2) * 0.8}%` }} />
                  <span className="text-xs text-slate-500">{u.unit.replace('Unit ', 'U')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {best && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="card flex gap-3 p-4"><Trophy className="shrink-0 text-emerald-500" /><div><div className="eyebrow !text-emerald-600 dark:!text-emerald-400">YOUR STRONGEST UNIT</div><div className="font-semibold">{best.unit} — {best.title}</div><div className="text-sm text-slate-500">{best.pct}% ({best.correct}/{best.total})</div></div></div>
            <div className="card flex gap-3 p-4"><Target className="shrink-0 text-amber-500" /><div><div className="eyebrow !text-amber-600 dark:!text-amber-400">NEEDS MORE PRACTICE</div>
              {ev.unitStats.length > 1 ? <><div className="font-semibold">{worst.unit} — {worst.title}</div><div className="text-sm text-slate-500">{worst.pct}% ({worst.correct}/{worst.total})</div></> : <div className="text-sm text-slate-500">Take the full quiz to compare units.</div>}</div></div>
          </div>
        )}
      </section>

      <section className="mt-10" aria-labelledby="rev">
        <p className="eyebrow">Detailed answer review</p>
        <h2 id="rev" className="mt-1 text-2xl font-bold">Question by question</h2>
        <div className="card mt-4 p-4">
          <QuestionNavigator items={ev.rows} current={-1} statusOf={(r) => (r.status === 'unanswered' ? 'unanswered' : r.status)}
            onJump={(i) => { setFilter('all'); setTimeout(() => document.getElementById(`rq-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }} strip />
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter answers">
          {['all', 'correct', 'incorrect', 'unanswered'].map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
              className={`btn !py-2 capitalize ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>{f} <span className="font-mono text-xs opacity-70">{counts[f]}</span></button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {rows.length === 0 && <li className="card p-6 text-center text-sm text-slate-500">No questions in this category.</li>}
          {rows.map((r) => {
            const i = ev.rows.indexOf(r);
            const S = STATUS[r.status];
            return (
              <li key={r.id} id={`rq-${i}`} className={`rounded-2xl border p-4 sm:p-5 ${S.cls}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold">Question {i + 1} <span className="font-normal opacity-60">· {r.unit}</span></span>
                  <span className="flex items-center gap-1 text-xs font-bold tracking-wider"><S.Icon size={14} />{S.label}</span>
                </div>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{r.question}</p>
                <dl className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                  <div><dt className="text-xs font-semibold uppercase tracking-wider opacity-60">Your answer</dt><dd>{r.picked ? <><b>{shownLetter(r, r.picked)}</b> · {optionText(r.id, r.picked)}</> : 'Not answered'}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wider opacity-60">Correct answer</dt><dd><b>{shownLetter(r, r.correctOrig)}</b> · {optionText(r.id, r.correctOrig)}</dd></div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
