import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Eraser,
  Check,
  X,
  ListChecks,
  LogOut,
  Send,
  Lightbulb,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import QuestionNavigator from '../components/QuestionNavigator';
import QuizTimer from '../components/QuizTimer';
import { Modal, ProgressBar } from '../components/ui';
import { LETTERS, optionText } from '../utils/quizUtils';
import { answerKey } from '../data/questions';
import { getExplanation } from '../data/explanations';

export default function Quiz({ session, setSession, name, onSubmit, onReview, onExit }) {
  const { quiz, answers, marked, checked = {}, idx, practice, endAt, instantFeedback = true } = session;
  const [modal, setModal] = useState(null); // 'submit' | 'exit'
  const [showAllOptions, setShowAllOptions] = useState(false);
  const q = quiz[idx];
  const set = useCallback((p) => setSession((s) => (s ? { ...s, ...p } : s)), [setSession]);
  const jump = useCallback((i) => { if (i >= 0 && i < quiz.length) set({ idx: i }); }, [quiz.length, set]);

  useEffect(() => {
    setShowAllOptions(false);
  }, [idx]);

  const showFeedback = instantFeedback !== false;
  const done = (showFeedback || practice) && !!checked[q?.id];
  const locked = done;

  const pick = useCallback(
    (orig) => {
      if (!q || locked) return;
      const nextAnswers = { ...answers, [q.id]: orig };
      const patch = { answers: nextAnswers };
      if (showFeedback) {
        patch.checked = { ...checked, [q.id]: true };
      }
      set(patch);
    },
    [q, locked, showFeedback, checked, answers, set]
  );

  const toggleMark = () => set({ marked: { ...marked, [q.id]: !marked[q.id] } });
  const clear = () => {
    if (locked) return;
    const a = { ...answers };
    delete a[q.id];
    set({ answers: a });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (modal || e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || !q) return;
      const k = e.key.toLowerCase();
      const n = 'abcd1234'.indexOf(k);
      if (n >= 0) pick(q.opts[n % 4]?.orig);
      else if (k === 'arrowright' || (done && k === 'enter')) jump(idx + 1);
      else if (k === 'arrowleft') jump(idx - 1);
      else if (k === 'm') toggleMark();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!q) return (
    <div className="mx-auto max-w-md p-10 text-center"><p>This question could not be loaded.</p><button className="btn btn-primary mt-4" onClick={onExit}>Back to home</button></div>
  );

  const answered = Object.keys(answers).length;
  const unanswered = quiz.length - answered;
  const markedCount = quiz.filter((x) => marked[x.id]).length;
  const isLast = idx === quiz.length - 1;
  const right = answers[q.id] === answerKey[q.id];

  const correctCount = quiz.filter((x) => checked[x.id] && answers[x.id] === answerKey[x.id]).length;
  const incorrectCount = quiz.filter((x) => checked[x.id] && answers[x.id] !== answerKey[x.id]).length;
  const attendedCount = correctCount + incorrectCount;
  const accuracyPct = attendedCount ? Math.round((correctCount / attendedCount) * 100) : 0;

  const statusOf = (x) => {
    if (checked[x.id]) {
      return answers[x.id] === answerKey[x.id] ? 'correct' : 'incorrect';
    }
    return answers[x.id] ? 'answered' : 'unanswered';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      {/* top bar */}
      <div className="sticky top-16 z-30 -mx-4 mb-4 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-navy-950/90 sm:-mx-6 sm:px-6 lg:static lg:m-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="eyebrow truncate">{q.unit.toUpperCase()} • {q.unitTitle.toUpperCase()}</div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>Question {idx + 1} of {quiz.length}</span>
              {attendedCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-normal">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">{correctCount} Correct</span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">{incorrectCount} Incorrect</span>
                </span>
              )}
            </div>
          </div>
          <div className="lg:hidden"><QuizTimer endAt={endAt} onExpire={() => onSubmit(session)} /></div>
        </div>
        <div className="mt-2"><ProgressBar value={idx + 1} max={quiz.length} label="Question progress" /></div>
        <div className="mt-3 lg:hidden"><QuestionNavigator strip items={quiz} current={idx} statusOf={statusOf} marked={marked} onJump={jump} /></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        <aside className="card hidden h-fit p-4 lg:block" aria-label="Question navigation">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Questions</div>
          <QuestionNavigator items={quiz} current={idx} statusOf={statusOf} marked={marked} onJump={jump} />
          <div className="mt-4 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="inline-grid h-3.5 w-3.5 place-items-center rounded bg-emerald-600 text-white"><Check size={9} /></span>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-grid h-3.5 w-3.5 place-items-center rounded bg-rose-600 text-white"><X size={9} /></span>
              <span>Incorrect</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3.5 w-3.5 rounded bg-slate-300 dark:bg-white/20" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flag size={10} className="fill-amber-400 text-amber-500" />
              <span>Marked for review</span>
            </div>
          </div>
        </aside>

        <main>
          <section key={q.id} className="card animate-rise p-5 sm:p-8" aria-labelledby="qtext">
            <div className="flex items-center justify-between">
              <span className="chip font-mono">Q{idx + 1}</span>
              {marked[q.id] && <span className="chip border-amber-400/50 text-amber-600 dark:text-amber-300"><Flag size={12} /> Marked for review</span>}
            </div>
            <h1 id="qtext" className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">{q.question}</h1>
            <div className="mt-6 grid gap-3" role="radiogroup" aria-labelledby="qtext">
              {q.opts.map((o, i) => {
                const selected = answers[q.id] === o.orig;
                const isCorrect = o.orig === answerKey[q.id];
                let tone = selected ? 'border-blue-600 bg-blue-50 dark:border-cyan-400 dark:bg-cyan-400/10' : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-400 dark:border-white/10 dark:hover:border-white/30';
                if (done) {
                  if (isCorrect) {
                    tone = 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-100 ring-2 ring-emerald-500/30';
                  } else if (selected) {
                    tone = 'border-rose-600 bg-rose-50 text-rose-950 dark:border-rose-400 dark:bg-rose-500/15 dark:text-rose-100 ring-2 ring-rose-500/30';
                  } else {
                    tone = 'border-slate-200 opacity-60 dark:border-white/10 dark:opacity-40';
                  }
                }
                return (
                  <button key={o.orig} role="radio" aria-checked={selected} disabled={locked} onClick={() => pick(o.orig)}
                    className={`flex min-h-[3.5rem] items-center gap-4 rounded-xl border p-3.5 text-left transition duration-150 active:scale-[.99] disabled:cursor-default ${tone}`}>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-sm font-bold transition ${
                      done && isCorrect
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-navy-950 shadow-sm'
                        : done && selected && !isCorrect
                        ? 'bg-rose-600 text-white dark:bg-rose-500 dark:text-navy-950 shadow-sm'
                        : selected
                        ? 'bg-blue-600 text-white dark:bg-cyan-400 dark:text-navy-950'
                        : 'bg-slate-100 dark:bg-white/10'
                    }`}>
                      {done && isCorrect ? <Check size={16} className="animate-pop" /> : done && selected && !isCorrect ? <X size={16} className="animate-pop" /> : LETTERS[i]}
                    </span>
                    <span className="flex-1 text-[15px] sm:text-base">{o.text}</span>
                    {done && isCorrect && <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"><Check size={14} />Correct</span>}
                    {done && selected && !isCorrect && <span className="flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"><X size={14} />Your answer (Incorrect)</span>}
                  </button>
                );
              })}
            </div>

            {done && (() => {
              const userSelected = answers[q.id];
              const correctKey = answerKey[q.id];
              const explanation = getExplanation(q.id, userSelected, correctKey);
              const selectedOptObj = q.opts.find((o) => o.orig === userSelected);
              const correctOptObj = q.opts.find((o) => o.orig === correctKey);
              const selectedLetter = LETTERS[q.opts.findIndex((o) => o.orig === userSelected)];
              const correctLetter = LETTERS[q.opts.findIndex((o) => o.orig === correctKey)];

              return (
                <div
                  className={`animate-rise mt-5 rounded-2xl border p-5 shadow-sm transition-all ${
                    right
                      ? 'border-emerald-500/40 bg-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                      : 'border-rose-500/40 bg-rose-500/5 dark:border-rose-500/30 dark:bg-rose-500/10'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {/* Status header */}
                  <div className="flex items-center gap-2.5 font-bold text-base">
                    <div
                      className={`grid h-7 w-7 place-items-center rounded-full text-white shadow-sm ${
                        right ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-rose-600 dark:bg-rose-500'
                      }`}
                    >
                      {right ? <Check size={16} className="stroke-[3]" /> : <X size={16} className="stroke-[3]" />}
                    </div>
                    <span className={right ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                      {right ? 'Correct Answer!' : 'Incorrect Answer'}
                    </span>
                  </div>

                  {/* Why your selected option is correct / incorrect */}
                  <div className="mt-4 space-y-3">
                    {right ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm dark:bg-emerald-500/15">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                          <Lightbulb size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Why your choice (Option {selectedLetter}: {selectedOptObj?.text}) is correct:</span>
                        </div>
                        <p className="mt-1.5 text-slate-700 dark:text-slate-200 leading-relaxed text-sm">
                          {explanation.selectedWhy}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm dark:bg-rose-500/15">
                          <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200">
                            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
                            <span>Why your choice (Option {selectedLetter}: {selectedOptObj?.text}) is incorrect:</span>
                          </div>
                          <p className="mt-1.5 text-slate-700 dark:text-slate-200 leading-relaxed text-sm">
                            {explanation.selectedWhy}
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm dark:bg-emerald-500/15">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                            <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Correct Answer: Option {correctLetter} ({correctOptObj?.text})</span>
                          </div>
                          <p className="mt-1.5 text-slate-700 dark:text-slate-200 leading-relaxed text-sm">
                            {explanation.correctWhy}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Core Concept Summary */}
                    {explanation.summary && (
                      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 text-xs dark:border-white/10 dark:bg-navy-900/80">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                          <BookOpen size={14} className="text-blue-600 dark:text-cyan-400" />
                          <span className="uppercase tracking-wider">Concept Summary</span>
                        </div>
                        <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                          {explanation.summary}
                        </p>
                      </div>
                    )}

                    {/* All Options Breakdown Toggle */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllOptions(!showAllOptions)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                      >
                        {showAllOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>{showAllOptions ? 'Hide' : 'Review'} detailed explanation for all 4 options</span>
                      </button>

                      {showAllOptions && (
                        <div className="animate-rise mt-3 space-y-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10 dark:bg-navy-900/50">
                          {q.opts.map((opt, optIndex) => {
                            const optLetter = LETTERS[optIndex];
                            const isOptCorrect = opt.orig === correctKey;
                            const isOptSelected = opt.orig === userSelected;
                            const optExp = explanation.allOptions[opt.orig];

                            return (
                              <div
                                key={opt.orig}
                                className={`rounded-lg p-2.5 ${
                                  isOptCorrect
                                    ? 'border border-emerald-500/40 bg-emerald-500/10'
                                    : isOptSelected
                                    ? 'border border-rose-500/40 bg-rose-500/10'
                                    : 'border border-slate-200/60 bg-slate-50/50 dark:border-white/5 dark:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2 font-semibold">
                                  <span className="font-mono">Option {optLetter}: {opt.text}</span>
                                  {isOptCorrect && (
                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                      Correct
                                    </span>
                                  )}
                                  {isOptSelected && !isOptCorrect && (
                                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                      Your choice
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {optExp}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs text-slate-500 dark:border-white/10">
                    <span>In-depth explanation verified with answer key</span>
                    {!isLast && (
                      <span className="font-medium text-blue-600 dark:text-cyan-400">
                        Click Next or press Enter →
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </section>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className="btn btn-ghost" onClick={toggleMark}><Flag size={15} className={marked[q.id] ? 'fill-amber-400 text-amber-500' : ''} />{marked[q.id] ? 'Unmark' : 'Mark for Review'}</button>
            <button className="btn btn-ghost" onClick={clear} disabled={!answers[q.id] || locked}><Eraser size={15} /> Clear Answer</button>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-navy-950/95 sm:mx-0 sm:rounded-2xl sm:border">
            <button className="btn btn-ghost" onClick={() => jump(idx - 1)} disabled={idx === 0}><ChevronLeft size={16} /> Previous</button>
            <div className="flex items-center gap-2">
              {!done && practice && !showFeedback ? (
                <button className="btn btn-primary" disabled={!answers[q.id]} onClick={() => set({ checked: { ...checked, [q.id]: true } })}>CHECK ANSWER</button>
              ) : isLast ? (
                <button className="btn btn-primary" onClick={() => setModal('submit')}><Send size={15} /> SUBMIT QUIZ</button>
              ) : (
                <button className="btn btn-primary" onClick={() => jump(idx + 1)}>Next <ChevronRight size={16} /></button>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden space-y-4 lg:block" aria-label="Quiz information">
          <QuizTimer endAt={endAt} onExpire={() => onSubmit(session)} />
          <div className="card p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Progress</div>
            <div className="mt-2 font-mono text-2xl font-bold">{answered}<span className="text-slate-400"> / {quiz.length}</span></div>
            <div className="mt-2"><ProgressBar value={answered} max={quiz.length} label="Answered" /></div>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"><Check size={13} /> Correct</dt>
                <dd className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium"><X size={13} /> Incorrect</dt>
                <dd className="font-mono font-bold text-rose-600 dark:text-rose-400">{incorrectCount}</dd>
              </div>
              <div className="flex justify-between"><dt className="text-slate-500">Unanswered</dt><dd className="font-mono">{unanswered}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Marked</dt><dd className="font-mono">{markedCount}</dd></div>
              {attendedCount > 0 && (
                <div className="flex justify-between border-t border-slate-200 pt-1 dark:border-white/10">
                  <dt className="text-slate-500">Accuracy</dt>
                  <dd className="font-mono font-semibold">{accuracyPct}%</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="card p-4 text-sm"><div className="font-semibold">{name || 'Student'}</div><div className="mt-1 text-xs text-slate-500">Keys: A–D select • ←/→ navigate • Enter next • M mark</div></div>
          <button className="btn btn-ghost w-full" onClick={onReview}><ListChecks size={15} /> Review answers</button>
          <button className="btn btn-ghost w-full" onClick={() => setModal('exit')}><LogOut size={15} /> Exit quiz</button>
        </aside>
      </div>

      <div className="mt-4 flex gap-2 lg:hidden">
        <button className="btn btn-ghost flex-1" onClick={onReview}><ListChecks size={15} /> Review</button>
        <button className="btn btn-ghost flex-1" onClick={() => setModal('exit')}><LogOut size={15} /> Exit</button>
      </div>

      {modal === 'submit' && (
        <Modal title="Submit Quiz?" onClose={() => setModal(null)}>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Answered</dt><dd className="font-mono font-bold">{answered} / {quiz.length}</dd></div>
            <div className="flex justify-between"><dt className="text-emerald-600 dark:text-emerald-400 font-medium">Correct</dt><dd className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</dd></div>
            <div className="flex justify-between"><dt className="text-rose-600 dark:text-rose-400 font-medium">Incorrect</dt><dd className="font-mono font-bold text-rose-600 dark:text-rose-400">{incorrectCount}</dd></div>
            <div className="flex justify-between"><dt>Unanswered</dt><dd className="font-mono font-bold">{unanswered}</dd></div>
            <div className="flex justify-between"><dt>Marked for review</dt><dd className="font-mono font-bold">{markedCount}</dd></div>
          </dl>
          <div className="mt-6 flex gap-3"><button className="btn btn-ghost flex-1" onClick={() => setModal(null)}>Continue Quiz</button><button className="btn btn-primary flex-1" onClick={() => onSubmit(session)}>Submit Quiz</button></div>
        </Modal>
      )}
      {modal === 'exit' && (
        <Modal title="Exit quiz?" onClose={() => setModal(null)}>
          <p className="mt-2 text-sm text-slate-500">Your progress in this attempt will be discarded and nothing will be saved to history.</p>
          <div className="mt-6 flex gap-3"><button className="btn btn-ghost flex-1" onClick={() => setModal(null)}>Keep going</button><button className="btn btn-danger flex-1" onClick={onExit}>Exit quiz</button></div>
        </Modal>
      )}
    </div>
  );
}
