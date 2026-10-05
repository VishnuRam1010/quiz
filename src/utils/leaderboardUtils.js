import { evaluate } from './quizUtils';
import { load, save } from './storage';
import { questions, answerKey } from '../data/questions';

const USERS_KEY = 'users';

const AVATAR_GRADIENTS = [
  'from-blue-600 to-cyan-500',
  'from-emerald-500 to-teal-400',
  'from-purple-600 to-indigo-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-fuchsia-600 to-violet-500',
  'from-cyan-600 to-blue-500',
  'from-teal-600 to-emerald-500',
];

export function getAvatarGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (!parts.length || !parts[0]) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Load all registered users, auto-merging any users discovered in history */
export function loadUsers(history = []) {
  const stored = load(USERS_KEY, {});
  const users = { ...stored };

  // Ensure any user in history is registered
  if (Array.isArray(history)) {
    history.forEach((h) => {
      const uName = (h.name || '').trim();
      if (uName && !users[uName]) {
        users[uName] = {
          name: uName,
          createdAt: h.date || new Date().toISOString(),
          lastActive: h.date || new Date().toISOString(),
          color: getAvatarGradient(uName),
        };
      } else if (uName && users[uName]) {
        if (h.date && (!users[uName].lastActive || new Date(h.date) > new Date(users[uName].lastActive))) {
          users[uName].lastActive = h.date;
        }
      }
    });
  }

  return users;
}

export function saveUsers(users) {
  save(USERS_KEY, users);
}

export function registerUser(name, existingUsers = {}) {
  const trimmed = (name || '').trim();
  if (!trimmed) return existingUsers;

  const users = { ...existingUsers };
  if (!users[trimmed]) {
    users[trimmed] = {
      name: trimmed,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      color: getAvatarGradient(trimmed),
    };
  } else {
    users[trimmed].lastActive = new Date().toISOString();
  }
  saveUsers(users);
  return users;
}

export function deleteUser(name, users = {}, history = []) {
  const nextUsers = { ...users };
  delete nextUsers[name];
  saveUsers(nextUsers);

  const nextHistory = history.filter((h) => (h.name || '').trim().toLowerCase() !== name.trim().toLowerCase());
  save('history', nextHistory);

  return { users: nextUsers, history: nextHistory };
}

/** Compute aggregated leaderboard stats from history and user registry */
export function getLeaderboard(history = [], users = {}, filter = { mode: 'all', unit: 'all' }, search = '') {
  const userMap = {};

  // Initialize with all registered users
  Object.values(users).forEach((u) => {
    userMap[u.name] = {
      name: u.name,
      createdAt: u.createdAt,
      lastActive: u.lastActive,
      color: u.color || getAvatarGradient(u.name),
      attempts: 0,
      bestPct: 0,
      bestCorrect: 0,
      bestTotal: 0,
      bestSeconds: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      avgPct: 0,
      recentDate: u.lastActive,
      scores: [],
      records: [],
    };
  });

  // Aggregate user records matching filters
  history.forEach((rec) => {
    const uName = (rec.name || 'Student').trim();
    if (!userMap[uName]) {
      userMap[uName] = {
        name: uName,
        createdAt: rec.date,
        lastActive: rec.date,
        color: getAvatarGradient(uName),
        attempts: 0,
        bestPct: 0,
        bestCorrect: 0,
        bestTotal: 0,
        bestSeconds: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        avgPct: 0,
        recentDate: rec.date,
        scores: [],
        records: [],
      };
    }

    // Apply mode filter
    if (filter.mode && filter.mode !== 'all' && rec.mode !== filter.mode) return;
    // Apply unit filter
    if (filter.unit && filter.unit !== 'all' && rec.unit !== filter.unit) return;

    const ev = evaluate(rec.items);
    const entry = userMap[uName];
    entry.attempts += 1;
    entry.records.push({ ...rec, ev });
    entry.scores.push(ev.pct);
    entry.totalCorrect += ev.correct;
    entry.totalQuestions += ev.total;

    if (!entry.recentDate || new Date(rec.date) > new Date(entry.recentDate)) {
      entry.recentDate = rec.date;
    }

    // Check if new best score
    const isBetterScore = ev.pct > entry.bestPct;
    const isSameScoreBetterTime =
      ev.pct === entry.bestPct && (entry.bestSeconds === 0 || rec.seconds < entry.bestSeconds);

    if (isBetterScore || (isSameScoreBetterTime && ev.correct >= entry.bestCorrect)) {
      entry.bestPct = ev.pct;
      entry.bestCorrect = ev.correct;
      entry.bestTotal = ev.total;
      entry.bestSeconds = rec.seconds;
    }
  });

  // Calculate averages
  Object.values(userMap).forEach((entry) => {
    if (entry.scores.length) {
      entry.avgPct = Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length);
    }
  });

  // Convert to array and filter out users who haven't played if filtering by specific unit/mode
  let list = Object.values(userMap);
  if (filter.mode !== 'all' || filter.unit !== 'all') {
    list = list.filter((u) => u.attempts > 0);
  }

  // Search filter
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(q));
  }

  // Sort by Best Accuracy (desc), then Best Correct (desc), then Speed (asc), then Attempts (desc)
  list.sort((a, b) => {
    if (b.bestPct !== a.bestPct) return b.bestPct - a.bestPct;
    if (b.bestCorrect !== a.bestCorrect) return b.bestCorrect - a.bestCorrect;
    if (a.bestSeconds && b.bestSeconds && a.bestSeconds !== b.bestSeconds) return a.bestSeconds - b.bestSeconds;
    return b.attempts - a.attempts;
  });

  // Assign ranks
  let currentRank = 1;
  return list.map((item, index) => {
    if (index > 0) {
      const prev = list[index - 1];
      const isTie =
        prev.bestPct === item.bestPct &&
        prev.bestCorrect === item.bestCorrect &&
        prev.bestSeconds === item.bestSeconds;
      if (!isTie) currentRank = index + 1;
    }
    return { ...item, rank: currentRank };
  });
}

/** Find user's current rank in leaderboard */
export function getUserRank(userName, leaderboard = []) {
  if (!userName) return null;
  const match = leaderboard.find((item) => item.name.toLowerCase() === userName.trim().toLowerCase());
  return match ? match.rank : null;
}

/** Demo classroom records generator to quickly populate and showcase leaderboard */
export function generateDemoClassroomData() {
  const now = Date.now();
  const demoUsers = [
    { name: 'Vishnu Ram', best: 48, total: 50, sec: 712, agoMin: 15 },
    { name: 'Ananya Sharma', best: 46, total: 50, sec: 830, agoMin: 90 },
    { name: 'Rahul Verma', best: 44, total: 50, sec: 654, agoMin: 240 },
    { name: 'Priya Nair', best: 42, total: 50, sec: 890, agoMin: 360 },
    { name: 'Karthik Raja', best: 39, total: 50, sec: 940, agoMin: 720 },
    { name: 'Siddharth Iyer', best: 35, total: 50, sec: 1100, agoMin: 1440 },
  ];

  const demoHistory = demoUsers.map((u, i) => {
    const items = questions.map((q, qIdx) => {
      const isRight = qIdx < u.best;
      const picked = isRight ? answerKey[q.id] : (answerKey[q.id] === 'A' ? 'B' : 'A');
      return { id: q.id, order: ['A', 'B', 'C', 'D'], picked };
    });
    return {
      id: `${now - u.agoMin * 60000}-${i}`,
      name: u.name,
      date: new Date(now - u.agoMin * 60000).toISOString(),
      mode: 'full',
      unit: 'all',
      seconds: u.sec,
      items,
    };
  });

  return demoHistory;
}
