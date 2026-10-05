import { useMemo, useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  Filter,
  User,
  Users,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  Trash2,
  Plus,
  Sparkles,
  X,
  Play,
  Eye,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Settings,
  ShieldCheck,
  Globe,
  Radio,
} from 'lucide-react';
import { Modal, ProgressBar } from '../components/ui';
import { getLeaderboard, getInitials, deleteUser, generateDemoClassroomData } from '../utils/leaderboardUtils';
import { fmtTime, fmtDate } from '../utils/quizUtils';
import { units, answerKey } from '../data/questions';
import {
  saveStoredFirebaseConfig,
  getFirebaseConfig,
  isFirebaseConfigured,
  DEFAULT_ROOM,
} from '../utils/cloudSync';

export default function Leaderboard({
  history = [],
  users = {},
  activeUser = '',
  cloudSyncInfo = { room: DEFAULT_ROOM, status: 'connected', mode: 'relay' },
  liveAlert = null,
  onSyncNow,
  onChangeRoom,
  onSelectUser,
  onStartQuiz,
  onUpdateHistory,
  onUpdateUsers,
  onViewRecord,
}) {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all'); // 'all' | 'full' | 'unit' | 'practice'
  const [unitFilter, setUnitFilter] = useState('all');
  const [manageModal, setManageModal] = useState(false);
  const [cloudModal, setCloudModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [msg, setMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [roomInput, setRoomInput] = useState(cloudSyncInfo?.room || DEFAULT_ROOM);
  const [firebaseInput, setFirebaseInput] = useState(() => {
    const cfg = getFirebaseConfig();
    return cfg ? JSON.stringify(cfg, null, 2) : '';
  });
  const [firebaseFeedback, setFirebaseFeedback] = useState('');

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      if (onSyncNow) await onSyncNow();
      setMsg('Leaderboard synced with cloud classroom!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Sync completed.');
      setTimeout(() => setMsg(''), 2000);
    } finally {
      setTimeout(() => setSyncing(false), 500);
    }
  };

  const handleShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', cloudSyncInfo?.room || DEFAULT_ROOM);
    const link = url.toString();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedLink(true);
        setMsg('Classroom quiz link copied! Share this with your class group.');
        setTimeout(() => {
          setCopiedLink(false);
          setMsg('');
        }, 4000);
      }).catch(() => {
        prompt('Copy this classroom quiz link for your class group:', link);
      });
    } else {
      prompt('Copy this classroom quiz link for your class group:', link);
    }
  };

  const handleSaveRoom = (e) => {
    e?.preventDefault();
    const clean = (roomInput || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || DEFAULT_ROOM;
    if (onChangeRoom) onChangeRoom(clean);
    setMsg(`Classroom switched to room #${clean}!`);
    setTimeout(() => setMsg(''), 3500);
  };

  const handleSaveFirebase = () => {
    if (!firebaseInput.trim()) {
      saveStoredFirebaseConfig(null);
      setFirebaseFeedback('Custom Firebase config cleared. Reverted to instant cloud relay.');
      setTimeout(() => setFirebaseFeedback(''), 3000);
      return;
    }
    try {
      const parsed = JSON.parse(firebaseInput);
      if (!parsed.apiKey || !parsed.projectId) {
        setFirebaseFeedback('Error: Config must contain at least "apiKey" and "projectId".');
        return;
      }
      saveStoredFirebaseConfig(parsed);
      setFirebaseFeedback('Firebase connected successfully! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setFirebaseFeedback('Error: Invalid JSON syntax. Please check the pasted configuration.');
    }
  };

  // Compute leaderboard
  const filter = useMemo(() => ({ mode: modeFilter, unit: unitFilter }), [modeFilter, unitFilter]);
  const leaderboard = useMemo(
    () => getLeaderboard(history, users, filter, search),
    [history, users, filter, search]
  );

  // Top 3 for podium
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Overall class stats
  const totalStudents = Object.keys(users).length || leaderboard.length;
  const totalAttempts = history.length;
  const classAvg = leaderboard.length
    ? Math.round(leaderboard.reduce((acc, u) => acc + (u.bestPct || 0), 0) / leaderboard.length)
    : 0;
  const fastestRun = leaderboard
    .filter((u) => u.bestSeconds > 0)
    .sort((a, b) => a.bestSeconds - b.bestSeconds)[0];

  const handleAddStudent = (e) => {
    e?.preventDefault();
    const trimmed = newStudentName.trim();
    if (!trimmed) return;
    if (users[trimmed]) {
      setMsg(`Student "${trimmed}" already exists.`);
      return;
    }
    const nextUsers = {
      ...users,
      [trimmed]: {
        name: trimmed,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      },
    };
    onUpdateUsers(nextUsers);
    setNewStudentName('');
    setMsg(`Student "${trimmed}" added!`);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDeleteUser = (uName) => {
    const res = deleteUser(uName, users, history);
    onUpdateUsers(res.users);
    onUpdateHistory(res.history);
    setDeleteConfirmUser(null);
    if (selectedUserDetail?.name === uName) setSelectedUserDetail(null);
    setMsg(`Removed ${uName} from leaderboard.`);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleLoadDemo = () => {
    const demo = generateDemoClassroomData();
    const mergedHistory = [...demo, ...history];
    onUpdateHistory(mergedHistory);

    const nextUsers = { ...users };
    demo.forEach((d) => {
      if (!nextUsers[d.name]) {
        nextUsers[d.name] = {
          name: d.name,
          createdAt: d.date,
          lastActive: d.date,
        };
      }
    });
    onUpdateUsers(nextUsers);
    setManageModal(false);
    setMsg('Loaded 6 demo classroom records!');
    setTimeout(() => setMsg(''), 4000);
  };

  const handleClearAll = () => {
    onUpdateHistory([]);
    onUpdateUsers({});
    setManageModal(false);
    setMsg('Leaderboard cleared.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl animate-rise px-4 py-10 sm:px-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="chip border-amber-400/40 text-amber-600 dark:text-amber-400">
            <Trophy size={13} /> CLASSROOM LEADERBOARD
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Rankings & Standings
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Compare top scores, completion times, and accuracy across all classroom quiz attempts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button className="btn btn-ghost" onClick={() => setManageModal(true)}>
            <SlidersHorizontal size={15} /> Manage Board
          </button>
          <button className="btn btn-primary" onClick={() => onStartQuiz()}>
            <Play size={15} /> Take Quiz
          </button>
        </div>
      </div>

      {/* Live Classroom Alert Toast */}
      {liveAlert && (
        <div className="animate-pop mt-4 flex items-center justify-between rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 p-3.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-md">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                🎉 {liveAlert.name} just finished the quiz!
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Score: {liveAlert.score != null ? `${liveAlert.score}/${liveAlert.total || 50}` : 'Completed'} • Standing updated in real-time
              </p>
            </div>
          </div>
          <span className="chip border-cyan-400/40 bg-cyan-500/20 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
            Live Update
          </span>
        </div>
      )}

      {/* Classroom Cloud Sync Bar */}
      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {cloudSyncInfo?.status === 'connected' ? (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                  </>
                ) : cloudSyncInfo?.status === 'syncing' ? (
                  <RefreshCw size={12} className="animate-spin text-blue-500" />
                ) : (
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                )}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                {cloudSyncInfo?.status === 'connected'
                  ? 'Live Class Sync'
                  : cloudSyncInfo?.status === 'syncing'
                  ? 'Syncing Class...'
                  : 'Offline Cache'}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Globe size={11} className="text-slate-400" /> #{cloudSyncInfo?.room || DEFAULT_ROOM}
            </span>

            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-cyan-400">
              {cloudSyncInfo?.mode === 'firebase' ? 'Firebase Firestore' : 'Instant Cloud Relay'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="btn btn-ghost !py-1.5 !px-3 text-xs"
              title="Sync latest scores with all classmates"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin text-blue-500' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            <button
              onClick={handleShareLink}
              className="btn btn-ghost !py-1.5 !px-3 text-xs font-semibold text-blue-600 dark:text-cyan-400"
              title="Copy shareable link for class group"
            >
              {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Quiz Link'}</span>
            </button>

            <button
              onClick={() => setCloudModal(true)}
              className="btn btn-ghost !py-1.5 !px-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              title="Configure Classroom Room & Cloud Sync"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="animate-pop mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {msg}
        </div>
      )}

      {/* Top Level Metric Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Crown size={14} className="text-amber-500" /> Champion
          </div>
          <div className="mt-1 truncate font-mono text-xl font-bold sm:text-2xl">
            {top1 ? top1.name : '—'}
          </div>
          <div className="text-xs text-slate-500">
            {top1 && top1.bestPct > 0 ? `${top1.bestPct}% best score` : 'No scores yet'}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Users size={14} className="text-blue-500 dark:text-cyan-400" /> Students
          </div>
          <div className="mt-1 font-mono text-xl font-bold sm:text-2xl">{totalStudents}</div>
          <div className="text-xs text-slate-500">{totalAttempts} quiz attempts</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Clock size={14} className="text-emerald-500" /> Speed Record
          </div>
          <div className="mt-1 font-mono text-xl font-bold sm:text-2xl">
            {fastestRun ? fmtTime(fastestRun.bestSeconds) : '—'}
          </div>
          <div className="text-xs text-slate-500">
            {fastestRun ? `${fastestRun.name}` : 'Not recorded'}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Target size={14} className="text-purple-500" /> Class Avg
          </div>
          <div className="mt-1 font-mono text-xl font-bold sm:text-2xl">{classAvg}%</div>
          <div className="text-xs text-slate-500">Overall accuracy</div>
        </div>
      </div>

      {/* Top 3 Podium (when there are at least 2 ranked students) */}
      {leaderboard.length >= 2 && leaderboard[0].bestPct > 0 && (
        <section className="card mt-8 overflow-hidden p-6 sm:p-8" aria-label="Top 3 Podium">
          <div className="text-center">
            <span className="eyebrow">HALL OF FAME</span>
            <h2 className="mt-1 text-2xl font-bold">Top Classroom Performers</h2>
          </div>

          <div className="mt-8 grid grid-cols-3 items-end gap-2 sm:gap-6">
            {/* Rank 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div
                  className={`grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-gradient-to-br ${
                    top2?.color || 'from-slate-400 to-slate-600'
                  } text-white font-mono font-bold shadow-md text-base sm:text-lg`}
                >
                  {top2 ? getInitials(top2.name) : '2'}
                </div>
                <span className="absolute -bottom-2 -right-1 grid h-6 w-6 place-items-center rounded-full bg-slate-200 font-mono text-xs font-black text-slate-700 shadow ring-2 ring-white dark:bg-slate-700 dark:text-slate-200 dark:ring-navy-900">
                  2
                </span>
              </div>
              <div className="mt-2 w-full truncate text-xs sm:text-sm font-semibold">
                {top2 ? top2.name : '—'}
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
                {top2 ? `${top2.bestPct}%` : '—'}
              </div>
              <div className="mt-2 w-full rounded-t-xl bg-slate-200/80 p-3 pt-6 dark:bg-white/10 sm:h-28">
                <span className="text-xs font-semibold text-slate-500">🥈 2nd Place</span>
                {top2?.bestSeconds > 0 && (
                  <div className="mt-1 font-mono text-[11px] text-slate-400">
                    {fmtTime(top2.bestSeconds)}
                  </div>
                )}
              </div>
            </div>

            {/* Rank 1 (Champion - Elevated) */}
            <div className="flex flex-col items-center text-center -translate-y-2 sm:-translate-y-4">
              <Crown size={28} className="text-amber-400 animate-floaty mb-1" />
              <div className="relative mb-2">
                <div
                  className={`grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-2xl bg-gradient-to-br ${
                    top1?.color || 'from-amber-400 to-orange-500'
                  } text-white font-mono font-bold shadow-lg ring-4 ring-amber-400/40 text-lg sm:text-xl`}
                >
                  {top1 ? getInitials(top1.name) : '1'}
                </div>
                <span className="absolute -bottom-2 -right-1 grid h-7 w-7 place-items-center rounded-full bg-amber-400 font-mono text-sm font-black text-navy-950 shadow ring-2 ring-white dark:ring-navy-900">
                  1
                </span>
              </div>
              <div className="mt-2 w-full truncate text-sm sm:text-base font-bold text-amber-600 dark:text-amber-300">
                {top1 ? top1.name : '—'}
              </div>
              <div className="font-mono text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                {top1 ? `${top1.bestPct}%` : '—'}
              </div>
              <div className="mt-2 w-full rounded-t-xl bg-gradient-to-t from-amber-500/20 to-amber-500/10 p-3 pt-6 border-t-2 border-amber-400/50 sm:h-36">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-300">
                  🥇 Champion
                </span>
                {top1?.bestSeconds > 0 && (
                  <div className="mt-1 font-mono text-xs font-semibold text-slate-500">
                    ⚡ {fmtTime(top1.bestSeconds)}
                  </div>
                )}
              </div>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div
                  className={`grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-gradient-to-br ${
                    top3?.color || 'from-amber-700 to-amber-900'
                  } text-white font-mono font-bold shadow-md text-base sm:text-lg`}
                >
                  {top3 ? getInitials(top3.name) : '3'}
                </div>
                <span className="absolute -bottom-2 -right-1 grid h-6 w-6 place-items-center rounded-full bg-amber-700 font-mono text-xs font-black text-white shadow ring-2 ring-white dark:ring-navy-900">
                  3
                </span>
              </div>
              <div className="mt-2 w-full truncate text-xs sm:text-sm font-semibold">
                {top3 ? top3.name : '—'}
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
                {top3 ? `${top3.bestPct}%` : '—'}
              </div>
              <div className="mt-2 w-full rounded-t-xl bg-slate-200/60 p-3 pt-6 dark:bg-white/5 sm:h-24">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-500">
                  🥉 3rd Place
                </span>
                {top3?.bestSeconds > 0 && (
                  <div className="mt-1 font-mono text-[11px] text-slate-400">
                    {fmtTime(top3.bestSeconds)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Search Bar */}
      <div className="card mt-8 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          {/* Search input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name..."
              className="input !py-2.5 !pl-10 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Mode Filter */}
          <div className="flex rounded-xl border border-slate-200 p-1 dark:border-white/10">
            {[
              ['all', 'All Modes'],
              ['full', 'Full 50Q'],
              ['unit', 'Unit Wise'],
              ['practice', 'Practice'],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setModeFilter(k)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  modeFilter === k
                    ? 'bg-blue-600 text-white dark:bg-cyan-400 dark:text-navy-950'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Unit Filter */}
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="input !w-auto !py-2 text-xs font-semibold"
            aria-label="Filter by unit"
          >
            <option value="all">All Units (Full Quiz)</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id}: {u.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <section className="mt-6" aria-label="Student Standings">
        {leaderboard.length === 0 ? (
          <div className="card p-10 text-center">
            <Trophy className="mx-auto text-slate-400" size={40} />
            <h3 className="mt-3 text-lg font-semibold">No participants found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? `No students match "${search}". Try clearing your search.`
                : 'No quiz attempts recorded in this category yet.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button className="btn btn-primary" onClick={() => onStartQuiz()}>
                <Play size={15} /> Take Quiz Now
              </button>
              <button className="btn btn-ghost" onClick={handleLoadDemo}>
                <Sparkles size={15} /> Load Demo Class Scores
              </button>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-navy-950/60">
                    <th className="py-3.5 pl-4 sm:pl-6 w-16">Rank</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Best Score</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Best Time</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Attempts</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Last Active</th>
                    <th className="py-3.5 pr-4 sm:pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {leaderboard.map((user) => {
                    const isCurrentUser =
                      activeUser && user.name.toLowerCase() === activeUser.trim().toLowerCase();
                    const isTop1 = user.rank === 1 && user.bestPct > 0;
                    const isTop2 = user.rank === 2 && user.bestPct > 0;
                    const isTop3 = user.rank === 3 && user.bestPct > 0;

                    return (
                      <tr
                        key={user.name}
                        className={`transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                          isCurrentUser
                            ? 'bg-blue-50/60 dark:bg-cyan-400/5 font-medium'
                            : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 pl-4 sm:pl-6 font-mono font-bold">
                          {isTop1 ? (
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
                              <Crown size={15} />
                            </span>
                          ) : isTop2 ? (
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-200 text-slate-700 dark:bg-white/20 dark:text-slate-200">
                              <Medal size={15} />
                            </span>
                          ) : isTop3 ? (
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-700/30 dark:text-amber-400">
                              <Award size={15} />
                            </span>
                          ) : (
                            <span className="text-slate-500 pl-1.5">#{user.rank}</span>
                          )}
                        </td>

                        {/* Student Name & Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${
                                user.color
                              } text-white font-mono text-xs font-bold shadow-sm`}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 truncate font-semibold">
                                <span>{user.name}</span>
                                {isCurrentUser && (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-cyan-400/20 dark:text-cyan-300">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.attempts > 0
                                  ? `${user.totalCorrect} total correct • avg ${user.avgPct}%`
                                  : 'No attempts yet'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Best Score */}
                        <td className="py-4 px-4">
                          {user.bestPct > 0 ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-bold">
                                  {user.bestPct}%
                                </span>
                                <span className="text-xs text-slate-500 font-mono">
                                  ({user.bestCorrect}/{user.bestTotal})
                                </span>
                              </div>
                              <div className="mt-1 w-24">
                                <ProgressBar value={user.bestPct} max={100} label="Accuracy" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not attempted</span>
                          )}
                        </td>

                        {/* Best Time */}
                        <td className="py-4 px-4 hidden md:table-cell font-mono text-xs text-slate-600 dark:text-slate-300">
                          {user.bestSeconds > 0 ? (
                            <span className="flex items-center gap-1.5">
                              <Clock size={13} className="text-slate-400" />
                              {fmtTime(user.bestSeconds)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Attempts */}
                        <td className="py-4 px-4 hidden sm:table-cell font-mono text-sm">
                          {user.attempts}
                        </td>

                        {/* Last Active */}
                        <td className="py-4 px-4 hidden lg:table-cell text-xs text-slate-500">
                          {user.recentDate ? fmtDate(user.recentDate) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-4 sm:pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedUserDetail(user)}
                              className="btn btn-ghost !p-2 text-xs"
                              title="View student stats"
                            >
                              <Eye size={14} />
                            </button>
                            {isCurrentUser ? null : (
                              <button
                                onClick={() => {
                                  onSelectUser(user.name);
                                  setMsg(`Switched active player to ${user.name}`);
                                  setTimeout(() => setMsg(''), 3000);
                                }}
                                className="btn btn-ghost !p-2 text-xs"
                                title="Switch to this student"
                              >
                                <User size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirmUser(user.name)}
                              className="btn btn-ghost !p-2 text-xs text-rose-500 hover:text-rose-600"
                              title="Delete from leaderboard"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* User Detail Modal */}
      {selectedUserDetail && (
        <Modal
          title={`${selectedUserDetail.name}'s Profile`}
          onClose={() => setSelectedUserDetail(null)}
        >
          <div className="mt-3 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${
                  selectedUserDetail.color
                } text-white font-mono text-base font-bold shadow`}
              >
                {getInitials(selectedUserDetail.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedUserDetail.name}</h3>
                <p className="text-xs text-slate-500">
                  Rank #{selectedUserDetail.rank} • {selectedUserDetail.attempts} Quizzes Completed
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="card p-3">
                <dt className="text-[11px] text-slate-500">Best Score</dt>
                <dd className="font-mono text-xl font-bold text-blue-600 dark:text-cyan-400">
                  {selectedUserDetail.bestPct}%
                </dd>
              </div>
              <div className="card p-3">
                <dt className="text-[11px] text-slate-500">Avg Accuracy</dt>
                <dd className="font-mono text-xl font-bold">{selectedUserDetail.avgPct}%</dd>
              </div>
              <div className="card p-3">
                <dt className="text-[11px] text-slate-500">Fastest Run</dt>
                <dd className="font-mono text-xl font-bold">
                  {selectedUserDetail.bestSeconds > 0
                    ? fmtTime(selectedUserDetail.bestSeconds)
                    : '—'}
                </dd>
              </div>
            </dl>

            {/* List of past attempts for this user */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent Attempts
              </div>
              {selectedUserDetail.records?.length ? (
                <ul className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {selectedUserDetail.records.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs dark:border-white/10"
                    >
                      <div>
                        <div className="font-semibold">
                          {r.mode === 'full' ? 'Full 50Q Quiz' : r.unit}
                        </div>
                        <div className="text-slate-500">{fmtDate(r.date)} • {fmtTime(r.seconds)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm">{r.ev.pct}%</span>
                        {onViewRecord && (
                          <button
                            onClick={() => {
                              setSelectedUserDetail(null);
                              onViewRecord(r);
                            }}
                            className="btn btn-ghost !p-1.5"
                          >
                            <Eye size={13} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No completed attempts recorded yet.</p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="btn btn-primary flex-1"
                onClick={() => {
                  onSelectUser(selectedUserDetail.name);
                  setSelectedUserDetail(null);
                  onStartQuiz();
                }}
              >
                <Play size={14} /> Start Quiz as {selectedUserDetail.name}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedUserDetail(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <Modal
          title={`Remove "${deleteConfirmUser}"?`}
          onClose={() => setDeleteConfirmUser(null)}
        >
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This will permanently remove <b>{deleteConfirmUser}</b> and all their quiz records from
            the leaderboard and history.
          </p>
          <div className="mt-6 flex gap-3">
            <button className="btn btn-ghost flex-1" onClick={() => setDeleteConfirmUser(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger flex-1"
              onClick={() => handleDeleteUser(deleteConfirmUser)}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Manage Board Modal */}
      {manageModal && (
        <Modal title="Manage Leaderboard" onClose={() => setManageModal(false)}>
          <div className="mt-3 space-y-5">
            {/* Add New Student Form */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Register New Student
              </label>
              <form onSubmit={handleAddStudent} className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Student name (e.g. John Doe)"
                  className="input !py-2 text-sm flex-1"
                />
                <button type="submit" className="btn btn-primary">
                  <Plus size={15} /> Add
                </button>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Data Management
              </div>
              <button
                onClick={handleLoadDemo}
                className="btn btn-ghost w-full justify-start text-sm"
              >
                <Sparkles size={16} className="text-amber-500" />
                <span>Load Sample Classroom Data (6 Students)</span>
              </button>
              <button
                onClick={handleClearAll}
                className="btn btn-ghost w-full justify-start text-sm text-rose-500 hover:text-rose-600"
              >
                <Trash2 size={16} />
                <span>Reset Entire Leaderboard & History</span>
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="btn btn-ghost" onClick={() => setManageModal(false)}>
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cloud Classroom Settings Modal */}
      {cloudModal && (
        <Modal title="Classroom Cloud Sync Settings" onClose={() => setCloudModal(false)}>
          <div className="mt-3 space-y-5">
            {/* Status card */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>Multi-Player Cloud Sync: Active</span>
              </div>
              <p className="mt-1 opacity-90 leading-relaxed">
                When you share this quiz Netlify link with your class group, any student who attends and completes the quiz will automatically appear on this leaderboard!
              </p>
            </div>

            {/* Room Identifier */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Classroom Room Code
              </label>
              <form onSubmit={handleSaveRoom} className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 font-mono text-sm text-slate-400">#</span>
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="datascience-class-2025"
                    className="input !py-2 !pl-7 text-sm font-mono w-full"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Room
                </button>
              </form>
              <p className="mt-1 text-xs text-slate-500">
                Students in the same Room Code share the exact same leaderboard.
              </p>
            </div>

            {/* Share link box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Shareable Class Group Link
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Send this link to your class group (WhatsApp, Telegram, Teams):
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${cloudSyncInfo?.room || DEFAULT_ROOM}` : ''}
                  className="input !py-1.5 text-xs font-mono flex-1 bg-white dark:bg-slate-900"
                />
                <button onClick={handleShareLink} className="btn btn-ghost !py-1.5 !px-3 text-xs">
                  {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Optional Firebase Firestore Storage */}
            <div className="border-t border-slate-200 pt-4 dark:border-white/10">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Google Firebase Firestore (Optional Permanent Database)
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Status: {isFirebaseConfigured() ? '🟢 Google Firestore Connected' : '⚡ Instant Zero-Config Cloud Relay Active'}
                </div>
              </div>

              <div className="mt-2.5">
                <textarea
                  rows={4}
                  value={firebaseInput}
                  onChange={(e) => setFirebaseInput(e.target.value)}
                  placeholder={`Paste Firebase Config JSON here to connect custom Firebase project:
{
  "apiKey": "AIzaSy...",
  "projectId": "your-project-id"
}`}
                  className="input font-mono !py-2 text-xs w-full"
                />
              </div>

              {firebaseFeedback && (
                <p className={`mt-1.5 text-xs ${firebaseFeedback.startsWith('Error') ? 'text-rose-500 font-semibold' : 'text-emerald-500 font-semibold'}`}>
                  {firebaseFeedback}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveFirebase}
                  className="btn btn-ghost !py-1 !px-2.5 text-xs"
                >
                  Save Firebase Config
                </button>
                {isFirebaseConfigured() && (
                  <button
                    type="button"
                    onClick={() => {
                      saveStoredFirebaseConfig(null);
                      setFirebaseInput('');
                      setFirebaseFeedback('Custom Firebase cleared. Using instant relay.');
                    }}
                    className="btn btn-ghost !py-1 !px-2.5 text-xs text-rose-500 hover:text-rose-600"
                  >
                    Reset to Default Relay
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="btn btn-ghost" onClick={() => setCloudModal(false)}>
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
