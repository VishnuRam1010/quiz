import { Check, X, Flag } from 'lucide-react';

/** statusOf(question) -> 'answered' | 'unanswered' | 'correct' | 'incorrect'. Color is always paired with an icon/label. */
export default function QuestionNavigator({ items, current, statusOf, marked = {}, onJump, strip = false }) {
  const cls = {
    unanswered: 'border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400',
    answered: 'border-blue-600 bg-blue-600 text-white dark:border-cyan-400 dark:bg-cyan-400 dark:text-navy-950',
    correct: 'border-emerald-600 bg-emerald-600 text-white',
    incorrect: 'border-rose-600 bg-rose-600 text-white',
  };
  return (
    <div className={strip ? 'no-scrollbar flex gap-2 overflow-x-auto px-1 py-1' : 'grid grid-cols-5 gap-2'} role="list" aria-label="Question navigator">
      {items.map((q, i) => {
        const s = statusOf(q);
        return (
          <button key={q.id} role="listitem" onClick={() => onJump(i)} title={`Question ${i + 1}: ${s}${marked[q.id] ? ', marked for review' : ''}`}
            aria-label={`Question ${i + 1}, ${s}${marked[q.id] ? ', marked for review' : ''}`} aria-current={i === current ? 'step' : undefined}
            className={`relative grid h-10 shrink-0 place-items-center rounded-lg border text-sm font-semibold transition hover:-translate-y-0.5 ${strip ? 'w-10' : ''} ${cls[s]} ${i === current ? 'ring-2 ring-offset-2 ring-cyan-500 ring-offset-white dark:ring-offset-navy-900' : ''}`}>
            {s === 'correct' ? <Check size={15} /> : s === 'incorrect' ? <X size={15} /> : i + 1}
            {marked[q.id] && <Flag size={10} className="absolute -right-1 -top-1 fill-amber-400 text-amber-500" />}
          </button>
        );
      })}
    </div>
  );
}
