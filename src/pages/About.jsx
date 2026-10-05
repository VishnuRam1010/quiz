import { units } from '../data/questions';
export default function About() {
  return (
    <div className="mx-auto max-w-3xl animate-rise px-4 py-10 sm:px-6">
      <p className="eyebrow">About</p>
      <h1 className="mt-1 text-3xl font-bold">Quiz information</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">This interactive quiz is based on the provided Data Science Classroom Quiz PDF: 50 multiple-choice questions across five units, 10 questions per unit. Scoring uses the instructor-supplied answer key.</p>
      <h2 className="mt-8 text-lg font-semibold">Topics covered</h2>
      <ul className="card mt-3 divide-y divide-slate-200 dark:divide-white/10">
        {units.map((u) => <li key={u.id} className="flex justify-between px-4 py-3"><span><span className="eyebrow mr-3">{u.id.toUpperCase()}</span>{u.title}</span><span className="font-mono text-sm text-slate-500">10 Q</span></li>)}
      </ul>
      <h2 className="mt-8 text-lg font-semibold">Good to know</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
        <li>Your name, settings, theme and history are stored only in this browser (LocalStorage).</li>
        <li>Feedback shown in Practice Mode is auto-generated and is not part of the PDF.</li>
        <li>Randomizing options never affects scoring; each option keeps track of its original letter.</li>
      </ul>
    </div>
  );
}
