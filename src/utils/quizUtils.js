import { questions, answerKey, units } from '../data/questions';

export const LETTERS = ['A', 'B', 'C', 'D'];
const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
export const getQuestion = (id) => byId[id];

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Every option carries its ORIGINAL letter (`orig`), so shuffling never affects scoring. */
export function buildQuiz({ unit, randomQ, randomO }) {
  let pool = questions.filter((q) => unit === 'all' || q.unit === unit);
  if (randomQ) pool = shuffle(pool);
  return pool.map((q) => {
    let opts = q.options.map((text, i) => ({ text, orig: LETTERS[i] }));
    if (randomO) opts = shuffle(opts);
    return { id: q.id, unit: q.unit, unitTitle: q.unitTitle, question: q.question, opts };
  });
}

export const optionText = (id, orig) => byId[id]?.options[LETTERS.indexOf(orig)] ?? '—';
export const shownLetter = (item, orig) => LETTERS[item.order.indexOf(orig)] ?? '?';

/** items: [{ id, order: ['B','A',...], picked: 'B' | null }] -> results using ONLY answerKey. */
export function evaluate(items) {
  const rows = items.map((it) => {
    const q = byId[it.id];
    const correct = answerKey[it.id];
    const status = !it.picked ? 'unanswered' : it.picked === correct ? 'correct' : 'incorrect';
    return { ...it, unit: q?.unit, question: q?.question, correctOrig: correct, status };
  });
  const count = (s) => rows.filter((r) => r.status === s).length;
  const total = rows.length;
  const correct = count('correct');
  const unitStats = units
    .map((u) => {
      const r = rows.filter((x) => x.unit === u.id);
      const c = r.filter((x) => x.status === 'correct').length;
      return { unit: u.id, title: u.title, correct: c, total: r.length, pct: r.length ? Math.round((c / r.length) * 100) : 0 };
    })
    .filter((u) => u.total > 0);
  return { rows, total, correct, incorrect: count('incorrect'), unanswered: count('unanswered'), pct: total ? Math.round((correct / total) * 100) : 0, unitStats };
}

export const itemsFromSession = (quiz, answers) =>
  quiz.map((q) => ({ id: q.id, order: q.opts.map((o) => o.orig), picked: answers[q.id] || null }));

export const fmtTime = (sec) => {
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
export const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return ''; }
};
