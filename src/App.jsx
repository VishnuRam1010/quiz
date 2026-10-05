import { useCallback, useEffect, useState } from 'react';
import { Header, Footer } from './components/ui';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Quiz from './pages/Quiz';
import Review from './pages/Review';
import Results from './pages/Results';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';
import { load, save, remove } from './utils/storage';
import { buildQuiz, itemsFromSession } from './utils/quizUtils';
import { loadUsers, saveUsers, registerUser } from './utils/leaderboardUtils';

const DEFAULTS = { mode: 'full', unit: 'all', randomQ: false, randomO: false, timerOn: true, minutes: 30, instantFeedback: true };

export default function App() {
  const [view, setView] = useState('home');
  const [name, setName] = useState(() => load('name', ''));
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...load('settings', {}) }));
  const [theme, setTheme] = useState(() => (load('theme', 'dark') === 'light' ? 'light' : 'dark'));
  const [history, setHistory] = useState(() => { const h = load('history', []); return Array.isArray(h) ? h : []; });
  const [users, setUsers] = useState(() => loadUsers(load('history', [])));
  const [result, setResult] = useState(() => load('last', null));
  const [session, setSession] = useState(null);

  useEffect(() => { save('name', name); }, [name]);
  useEffect(() => { save('settings', settings); }, [settings]);
  useEffect(() => { save('history', history); }, [history]);
  useEffect(() => { saveUsers(users); }, [users]);
  useEffect(() => { save('theme', theme); document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const go = useCallback((v) => { setView(v); window.scrollTo({ top: 0 }); }, []);

  const nav = (k) => {
    if (k === 'units') { go('home'); setTimeout(() => document.getElementById('units')?.scrollIntoView({ behavior: 'smooth' }), 60); return; }
    if (session && k !== 'home' && view === 'quiz') { /* leaving quiz via header keeps the attempt alive */ }
    go(k);
  };

  const openSetup = (patch = {}) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      if (patch.unit) { next.mode = next.mode === 'full' && patch.unit !== 'all' ? 'unit' : patch.unit === 'all' && next.mode === 'unit' ? 'full' : next.mode; next.minutes = patch.unit === 'all' ? 30 : 10; }
      return next;
    });
    go('setup');
  };

  const start = (s = settings) => {
    const quiz = buildQuiz({ unit: s.mode === 'full' ? 'all' : s.unit, randomQ: s.randomQ, randomO: s.randomO });
    if (!quiz.length) return;
    const practice = s.mode === 'practice';
    const instantFeedback = s.instantFeedback ?? true;
    const now = Date.now();
    const studentName = name.trim() || 'Student';
    setUsers((prev) => registerUser(studentName, prev));
    setSession({
      quiz,
      answers: {},
      marked: {},
      checked: {},
      idx: 0,
      practice,
      instantFeedback,
      startedAt: now,
      endAt: s.timerOn && !practice ? now + s.minutes * 60000 : null,
      mode: s.mode,
      unit: s.mode === 'full' ? 'all' : s.unit
    });
    go('quiz');
  };

  const submit = useCallback((s) => {
    if (!s) return;
    const studentName = name.trim() || 'Student';
    const rec = { id: `${Date.now()}`, name: studentName, date: new Date().toISOString(), mode: s.mode, unit: s.unit, seconds: Math.round((Date.now() - s.startedAt) / 1000), items: itemsFromSession(s.quiz, s.answers) };
    setHistory((h) => [rec, ...h].slice(0, 100));
    setUsers((prev) => registerUser(studentName, prev));
    setResult(rec);
    save('last', rec);
    setSession(null);
    go('results');
  }, [name, go]);

  const retake = (rec) => {
    const s = { ...settings, mode: rec?.mode || settings.mode, unit: rec?.unit || settings.unit };
    s.minutes = s.unit === 'all' ? 30 : 10;
    setSettings(s);
    start(s);
  };

  const clearHistory = () => { setHistory([]); remove('last'); setResult(null); };

  let page;
  if (view === 'quiz' && session) page = <Quiz session={session} setSession={setSession} name={name} onSubmit={submit} onReview={() => go('review')} onExit={() => { setSession(null); go('home'); }} />;
  else if (view === 'review' && session) page = <Review session={session} onJump={(i) => { setSession((s) => ({ ...s, idx: i })); go('quiz'); }} onSubmit={submit} onBack={() => go('quiz')} />;
  else if (view === 'results' && result) page = <Results key={result.id} record={result} onRetake={retake} onHistory={() => go('history')} onLeaderboard={() => go('leaderboard')} />;
  else if (view === 'setup') page = <Setup name={name} setName={setName} users={users} settings={settings} setSettings={setSettings} onStart={() => start()} onBack={() => go('home')} />;
  else if (view === 'leaderboard') page = <Leaderboard history={history} users={users} activeUser={name} onSelectUser={(uName) => setName(uName)} onStartQuiz={() => openSetup()} onUpdateHistory={setHistory} onUpdateUsers={setUsers} onViewRecord={(h) => { setResult(h); go('results'); }} />;
  else if (view === 'history') page = <History history={history} activeUser={name} onStart={() => openSetup()} onClear={clearHistory} onView={(h) => { setResult(h); go('results'); }} />;
  else if (view === 'about') page = <About />;
  else page = <Home onStart={() => openSetup({ mode: 'full', unit: 'all' })} onUnit={(u) => openSetup(u === 'all' ? { mode: 'full', unit: 'all' } : { mode: settings.mode === 'practice' ? 'practice' : 'unit', unit: u })} onLeaderboard={() => go('leaderboard')} />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header view={view === 'home' ? 'home' : view} nav={nav} theme={theme} toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} name={name.trim()} />
      <div className="flex-1">{page}</div>
      <Footer />
    </div>
  );
}
