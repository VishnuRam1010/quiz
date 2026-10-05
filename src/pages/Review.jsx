import { Check, X, Flag, HelpCircle, Send } from 'lucide-react';
import QuestionNavigator from '../components/QuestionNavigator';
import { answerKey } from '../data/questions';

export default function Review({ session, onJump, onSubmit, onBack }) {
  const { quiz, answers, marked, checked = {} } = session;
  const answered = Object.keys(answers).length;
  const markedCount = quiz.filter((q) => marked[q.id]).length;
  const stat = (q) => (checked[q.id] ? (answers[q.id] === answerKey[q.id] ? 'correct' : 'incorrect') : answers[q.id] ? 'answered' : 'unanswered');
  return (
    <div className="mx-auto max-w-4xl animate-rise px-4 py-10 sm:px-6">
      <p className="eyebrow">Before you submit</p>
      <h1 className="mt-1 text-3xl font-bold">Quiz Summary</h1>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[['Answered', answered], ['Unanswered', quiz.length - answered], ['Marked for Review', markedCount]].map(([l, v]) => (
          <div key={l} className="card p-4"><div className="font-mono text-3xl font-bold">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
        ))}
      </div>
      <div className="card mt-6 p-5">
        <QuestionNavigator items={quiz} current={session.idx} statusOf={stat} marked={marked} onJump={onJump} />
      </div>
      <ul className="card mt-6 divide-y divide-slate-200 dark:divide-white/10">
        {quiz.map((q, i) => {
          const isChecked = checked[q.id];
          const isRight = answers[q.id] === answerKey[q.id];
          return (
            <li key={q.id}>
              <button onClick={() => onJump(i)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-white/5">
                <span className="w-8 font-mono font-bold">{i + 1}</span>
                {isChecked ? (
                  isRight ? (
                    <Check size={16} className="text-emerald-600 dark:text-emerald-400" aria-label="Correct" />
                  ) : (
                    <X size={16} className="text-rose-600 dark:text-rose-400" aria-label="Incorrect" />
                  )
                ) : answers[q.id] ? (
                  <Check size={16} className="text-blue-600 dark:text-cyan-400" aria-label="Answered" />
                ) : (
                  <HelpCircle size={16} className="text-slate-400" aria-label="Unanswered" />
                )}
                {marked[q.id] && <Flag size={14} className="fill-amber-400 text-amber-500" aria-label="Marked for review" />}
                <span className="truncate text-slate-600 dark:text-slate-300">{q.question}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn btn-primary !px-8" onClick={() => onSubmit(session)}><Send size={15} /> SUBMIT QUIZ</button>
        <button className="btn btn-ghost" onClick={onBack}>Back to quiz</button>
      </div>
    </div>
  );
}
