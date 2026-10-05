import {
  isFirebaseConfigured,
  addAttemptToFirestore,
  subscribeFirestoreAttempts,
  getFirebaseConfig,
  saveStoredFirebaseConfig,
} from './firebase';

const ROOM_STORAGE_KEY = 'classroom_room_id';
export const DEFAULT_ROOM = 'datascience-class-2025';

// Parse ?room= from URL if present
function getInitialRoom() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && roomParam.trim()) {
      const clean = roomParam.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (clean) {
        localStorage.setItem(ROOM_STORAGE_KEY, clean);
        return clean;
      }
    }
  }
  return localStorage.getItem(ROOM_STORAGE_KEY) || DEFAULT_ROOM;
}

let currentRoom = getInitialRoom();
let eventSource = null;
let pollTimer = null;
let firestoreUnsub = null;
let syncStatus = 'connecting'; // 'connected' | 'syncing' | 'error' | 'offline'
let syncMode = 'relay'; // 'firebase' | 'relay'
const listeners = new Set();
const newPlayerAlertListeners = new Set();

/**
 * Get active room ID
 */
export function getRoomId() {
  return currentRoom;
}

/**
 * Change room ID and re-establish connection
 */
export function setRoomId(newRoom) {
  const clean = (newRoom || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || DEFAULT_ROOM;
  if (clean === currentRoom) return;
  currentRoom = clean;
  localStorage.setItem(ROOM_STORAGE_KEY, clean);
  reconnect();
}

/**
 * Get current sync state info
 */
export function getSyncInfo() {
  return {
    room: currentRoom,
    status: syncStatus,
    mode: isFirebaseConfigured() ? 'firebase' : 'relay',
    isFirebase: isFirebaseConfigured(),
  };
}

/**
 * Deduplicate and merge history records
 */
export function mergeRecords(localHistory = [], cloudHistory = []) {
  const map = new Map();

  // First insert cloud history
  cloudHistory.forEach((item) => {
    if (!item || !item.name) return;
    const key = item.id || `${item.name}-${item.date}-${item.seconds}`;
    map.set(key, item);
  });

  // Then merge local history (local takes precedence if matching id)
  localHistory.forEach((item) => {
    if (!item || !item.name) return;
    const key = item.id || `${item.name}-${item.date}-${item.seconds}`;
    map.set(key, item);
  });

  const merged = Array.from(map.values());
  // Sort descending by date
  merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return merged.slice(0, 150);
}

/**
 * Clean compact attempt for cloud network transfer
 */
function cleanAttemptForCloud(rec) {
  return {
    id: rec.id || `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: (rec.name || 'Student').trim(),
    date: rec.date || new Date().toISOString(),
    mode: rec.mode || 'full',
    unit: rec.unit || 'all',
    seconds: Number(rec.seconds) || 0,
    items: Array.isArray(rec.items)
      ? rec.items.map((it) => ({
          id: it.id,
          picked: it.picked || null,
          order: it.order || ['A', 'B', 'C', 'D'],
        }))
      : [],
    room: currentRoom,
  };
}

/**
 * Publish a completed quiz attempt to the cloud so all classmates see it
 */
export async function publishAttemptToCloud(rec) {
  const cleanRec = cleanAttemptForCloud(rec);
  let success = false;

  // 1. Publish to Firebase Firestore if configured
  if (isFirebaseConfigured()) {
    try {
      const fbOk = await addAttemptToFirestore(cleanRec, currentRoom);
      if (fbOk) success = true;
    } catch (e) {
      console.warn('Firebase publish failed:', e);
    }
  }

  // 2. Always publish to Zero-Config Cloud Relay so all players instantly receive it
  try {
    const topicUrl = `https://ntfy.sh/quiz-room-${encodeURIComponent(currentRoom)}`;
    const res = await fetch(topicUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Title: `Quiz Submitted: ${cleanRec.name}`,
        Tags: 'tada,chart_with_upwards_trend',
      },
      body: JSON.stringify({
        type: 'attempt',
        record: cleanRec,
        timestamp: Date.now(),
      }),
    });
    if (res.ok) success = true;
  } catch (err) {
    console.warn('Cloud relay publish failed:', err);
  }

  return success;
}

/**
 * Notify all UI subscribers
 */
function notifyListeners(records = null) {
  listeners.forEach((fn) => {
    try {
      fn({
        status: syncStatus,
        room: currentRoom,
        mode: isFirebaseConfigured() ? 'firebase' : 'relay',
        records,
      });
    } catch (e) {
      console.error('Error notifying sync listener:', e);
    }
  });
}

function notifyNewPlayer(record) {
  newPlayerAlertListeners.forEach((fn) => {
    try {
      fn(record);
    } catch (e) {
      console.error('Error notifying new player alert:', e);
    }
  });
}

/**
 * Poll cloud relay for all cached attempts
 */
export async function fetchCloudRelayRecords() {
  try {
    syncStatus = 'syncing';
    notifyListeners();

    const topicUrl = `https://ntfy.sh/quiz-room-${encodeURIComponent(currentRoom)}/json?poll=1&since=all`;
    const res = await fetch(topicUrl);
    if (!res.ok) {
      syncStatus = 'connected';
      notifyListeners();
      return [];
    }

    const text = await res.text();
    const lines = text
      .trim()
      .split('\n')
      .filter(Boolean);

    const records = [];
    lines.forEach((line) => {
      try {
        const item = JSON.parse(line);
        if (item.event === 'message' && item.message) {
          const payload = JSON.parse(item.message);
          if (payload.record && payload.record.name) {
            records.push(payload.record);
          } else if (payload.name && payload.items) {
            // direct record format
            records.push(payload);
          }
        }
      } catch (e) {
        // ignore malformed lines
      }
    });

    syncStatus = 'connected';
    notifyListeners(records);
    return records;
  } catch (err) {
    console.warn('Fetch cloud records error:', err);
    syncStatus = 'offline';
    notifyListeners();
    return [];
  }
}

/**
 * Connect real-time Server-Sent Events (SSE) stream for instant updates
 */
function connectEventSource() {
  if (eventSource) {
    try {
      eventSource.close();
    } catch {}
    eventSource = null;
  }

  try {
    const sseUrl = `https://ntfy.sh/quiz-room-${encodeURIComponent(currentRoom)}/sse`;
    eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      syncStatus = 'connected';
      notifyListeners();
    };

    eventSource.onmessage = (event) => {
      try {
        const item = JSON.parse(event.data);
        if (item.event === 'message' && item.message) {
          const payload = JSON.parse(item.message);
          const rec = payload.record || (payload.name && payload.items ? payload : null);
          if (rec) {
            notifyNewPlayer(rec);
            notifyListeners([rec]);
          }
        }
      } catch (e) {
        console.warn('SSE message parse error:', e);
      }
    };

    eventSource.onerror = () => {
      syncStatus = 'offline';
      notifyListeners();
    };
  } catch (err) {
    console.warn('EventSource initialization error:', err);
  }
}

/**
 * Connect Firebase snapshot listener if configured
 */
function connectFirestore() {
  if (firestoreUnsub) {
    try {
      firestoreUnsub();
    } catch {}
    firestoreUnsub = null;
  }

  if (isFirebaseConfigured()) {
    firestoreUnsub = subscribeFirestoreAttempts(currentRoom, (attempts) => {
      syncStatus = 'connected';
      notifyListeners(attempts);
    });
  }
}

/**
 * Full reconnect sequence
 */
export function reconnect() {
  connectFirestore();
  connectEventSource();
  fetchCloudRelayRecords();
}

/**
 * Initialize cloud sync on app start
 */
export function initCloudSync(onUpdate, onNewPlayerAlert) {
  if (onUpdate) listeners.add(onUpdate);
  if (onNewPlayerAlert) newPlayerAlertListeners.add(onNewPlayerAlert);

  // Initial connection
  reconnect();

  // Background keep-alive polling every 20s
  if (!pollTimer) {
    pollTimer = setInterval(() => {
      fetchCloudRelayRecords();
    }, 20000);
  }

  return () => {
    if (onUpdate) listeners.delete(onUpdate);
    if (onNewPlayerAlert) newPlayerAlertListeners.delete(onNewPlayerAlert);
  };
}

export { getFirebaseConfig, saveStoredFirebaseConfig, isFirebaseConfigured };
