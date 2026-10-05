import { useState } from 'react';
import { Trash2, Eye, Trophy, BarChart3, Hash } from 'lucide-react';
import { Modal } from '../components/ui';
import { evaluate, fmtDate, fmtTime } from '../utils/quizUtils';

export default function History({ history, onView, onClear, onStart }) {
  const [confirm, setConfirm] = useState(false);
  const rows = history.map((h) => ({ h, ev: evaluate(h.items) }));
  const best = rows.length ? Math.max(...rows.map((r) => r.ev.pct)) : 0;
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.ev.pct, 0) / rows.length) : 0;
  return (
    <div className="mx-auto max-w-4xl animate-rise px-4 py-10 sm:px-6">
      <p className="eyebrow">Your progress</p>
      <h1 className="mt-1 text-3xl font-bold">QUIZ HISTORY</h1>
      {rows.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <BarChart3 className="mx-auto text-slate-400" size={36} />
          <h2 className="mt-3 text-lg font-semibold">No quiz history yet.</h2>
          <p className="mt-1 text-sm text-slate-500">Your completed quizzes will appear here.</p>
          <button className="btn btn-primary mt-5" onClick={onStart}>START YOUR FIRST QUIZ</button>
        </div>
      ) : (
        <>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[['Best Score', `${best}%`, Trophy], ['Average Score', `${avg}%`, BarChart3], ['Attempts', rows.length, Hash]].map(([l, v, Icon]) => (
              <div key={l} className="card p-4"><Icon size={16} className="text-blue-600 dark:text-cyan-400" /><dd className="mt-1 font-mono text-2xl font-bold">{v}</dd><dt className="text-xs text-slate-500">{l}</dt></div>
            ))}
          </dl>
          <ul className="mt-6 space-y-3">
            {rows.map(({ h, ev }) => (
              <li key={h.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div><div className="font-semibold">{h.name || 'Student'}</div><div className="text-xs text-slate-500">{fmtDate(h.date)} · {h.mode === 'practice' ? 'Practice' : h.unit === 'all' ? 'All units' : h.unit}</div></div>
                <div className="flex items-center gap-5 font-mono text-sm"><span className="text-lg font-bold">{ev.pct}%</span><span>{ev.correct}/{ev.total}</span><span className="text-slate-500">{fmtTime(h.seconds)}</span></div>
                <button className="btn btn-ghost !py-2" onClick={() => onView(h)}><Eye size={15} /> VIEW RESULT</button>
              </li>
            ))}
          </ul>
          <button className="btn btn-ghost mt-6 text-rose-600 dark:text-rose-400" onClick={() => setConfirm(true)}><Trash2 size={15} /> CLEAR HISTORY</button>
        </>
      )}
      {confirm && (
        <Modal title="Clear history?" onClose={() => setConfirm(false)}>
          <p className="mt-2 text-sm text-slate-500">This permanently removes all {rows.length} saved attempts from this browser.</p>
          <div className="mt-6 flex gap-3"><button className="btn btn-ghost flex-1" onClick={() => setConfirm(false)}>Cancel</button><button className="btn btn-danger flex-1" onClick={() => { onClear(); setConfirm(false); }}>Clear history</button></div>
        </Modal>
      )}
    </div>
  );
}
