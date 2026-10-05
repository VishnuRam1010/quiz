import { questions, answerKey, units } from '../src/data/questions.js';
// Answers printed in the PDF's own (partial) key, used as a cross-check against the instructor-supplied key.
const pdfKey = '3B 4B 5B 6C 7A 8C 13A 14B 15A 16B 17A 18A 23A 24A 25A 26B 27A 28B 33A 34A 35A 36A 37A 38A 43A 44A 45A 46A 47A 48A'.split(' ');
let fail = 0;
const check = (ok, msg) => { console.log((ok ? '✓ ' : '✗ ') + msg); if (!ok) fail++; };
check(questions.length === 50, '50 questions');
check(Object.keys(answerKey).length === 50, 'answer key has 50 entries');
check(questions.every((q, i) => q.id === i + 1), 'IDs 1–50 exist exactly once, in order');
check(questions.every((q) => q.options.length === 4 && q.options.every((o) => o && o.trim())), 'every question has exactly 4 non-empty options');
check(questions.every((q) => 'ABCD'.includes(answerKey[q.id] || 'x') && q.correctAnswer >= 0 && q.correctAnswer <= 3), 'every answer is A/B/C/D and maps to an option');
check(units.every((u) => questions.filter((q) => q.unit === u.id).length === 10), '10 questions per unit (5 units)');
check(pdfKey.every((s) => answerKey[+s.slice(0, -1)] === s.slice(-1)), 'instructor key agrees with all 30 answers printed in the PDF');
check(questions.every((q) => q.question && !/lorem|goes here/i.test(q.question)), 'no placeholder text');
process.exit(fail ? 1 : 0);
