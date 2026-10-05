import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { fmtTime } from '../utils/quizUtils';

export default function QuizTimer({ endAt, onExpire }) {
  const [left, setLeft] = useState(() => (endAt ? Math.ceil((endAt - Date.now()) / 1000) : null));
  const fired = useRef(false);
  const cb = useRef(onExpire);
  cb.current = onExpire;
  useEffect(() => {
    if (!endAt) return;
    const t = setInterval(() => {
      const s = Math.ceil((endAt - Date.now()) / 1000);
      setLeft(Math.max(0, s));
      if (s <= 0 && !fired.current) { fired.current = true; cb.current(); }
    }, 500);
    return () => clearInterval(t);
  }, [endAt]);
  if (!endAt) return <div className="chip"><Clock size={13} /> Untimed</div>;
  const tone = left < 60 ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-300' : left < 300 ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-white/10';
  return (
    <div className={`rounded-xl border px-4 py-2 transition-colors ${tone}`} role="timer" aria-label={`Time remaining ${fmtTime(left)}`}>
      <div className="text-[10px] font-semibold uppercase tracking-widest opacity-70">Time remaining{left < 60 ? ' · hurry' : left < 300 ? ' · under 5 min' : ''}</div>
      <div className="font-mono text-2xl font-bold tabular-nums">{fmtTime(left)}</div>
    </div>
  );
}
