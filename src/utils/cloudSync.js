import {
  isFirebaseConfigured,
  addAttemptToFirestore,
  subscribeFirestoreAttempts,
  getFirebaseConfig,
  saveStoredFirebaseConfig,
  deleteAttemptFromFirestore,
  deleteUserFromFirestore,
} from './firebase.js';

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
  try {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem(ROOM_STORAGE_KEY) : null) || DEFAULT_ROOM;
  } catch {
    return DEFAULT_ROOM;
  }
}

let currentRoom = getInitialRoom();
let eventSource = null;
let pollTimer = null;
let firestoreUnsub = null;
let syncStatus = 'connecting'; // 'connected' | 'syncing' | 'error' | 'offline'
let syncMode = 'relay'; // 'firebase' | 'relay'
const listeners = new Set();
const newPlayerAlertListeners = new Set();
const adminDeleteListeners = new Set();

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

const DELETED_RECORDS_KEY = 'classroom_deleted_records';
const DELETED_USERS_KEY = 'classroom_deleted_users';
const CLEARED_AT_KEY = 'classroom_cleared_at';

export function getDeletedRecordIds() {
  try {
    const raw = localStorage.getItem(DELETED_RECORDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function getDeletedUsers() {
  try {
    const raw = localStorage.getItem(DELETED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getClearedAt() {
  try {
    return Number(localStorage.getItem(CLEARED_AT_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function markRecordDeleted(recordId) {
  if (!recordId) return;
  const set = getDeletedRecordIds();
  set.add(recordId);
  try {
    localStorage.setItem(DELETED_RECORDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}

  try {
    const rawH = localStorage.getItem('history');
    if (rawH) {
      const hList = JSON.parse(rawH);
      if (Array.isArray(hList)) {
        const filtered = hList.filter((item) => item?.id !== recordId);
        localStorage.setItem('history', JSON.stringify(filtered));
      }
    }
  } catch {}
}

export function markUserDeleted(userName, timestamp = Date.now()) {
  if (!userName) return;
  const clean = userName.trim().toLowerCase();
  const users = getDeletedUsers();
  users[clean] = timestamp;
  try {
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(users));
  } catch {}

  try {
    const rawH = localStorage.getItem('history');
    if (rawH) {
      const hList = JSON.parse(rawH);
      if (Array.isArray(hList)) {
        const filtered = hList.filter((item) => (item?.name || '').trim().toLowerCase() !== clean);
        localStorage.setItem('history', JSON.stringify(filtered));
      }
    }
    const rawU = localStorage.getItem('users');
    if (rawU) {
      const uMap = JSON.parse(rawU);
      if (uMap && typeof uMap === 'object') {
        Object.keys(uMap).forEach((k) => {
          if (k.trim().toLowerCase() === clean) delete uMap[k];
        });
        localStorage.setItem('users', JSON.stringify(uMap));
      }
    }
  } catch {}
}

export function markBoardCleared(timestamp = Date.now()) {
  try {
    localStorage.setItem(CLEARED_AT_KEY, String(timestamp));
    localStorage.setItem('history', JSON.stringify([]));
    localStorage.setItem('users', JSON.stringify({}));
  } catch {}
}

export function isRecordDeleted(rec) {
  if (!rec) return true;
  const deletedIds = getDeletedRecordIds();
  if (rec.id && deletedIds.has(rec.id)) return true;

  const deletedUsers = getDeletedUsers();
  const cleanName = (rec.name || '').trim().toLowerCase();
  if (cleanName && deletedUsers[cleanName]) {
    return true;
  }

  const clearedAt = getClearedAt();
  if (clearedAt > 0) {
    const recTime = rec.date ? new Date(rec.date).getTime() : 0;
    // Allow up to 10 minutes clock drift; anything recorded before or around clear is deleted
    if (!recTime || recTime <= clearedAt + 10 * 60 * 1000) return true;
  }

  return false;
}

/**
 * Deduplicate and merge history records, strictly discarding deleted records
 */
export function mergeRecords(localHistory = [], cloudHistory = []) {
  const map = new Map();

  // First insert cloud history (filtering out any deleted records)
  cloudHistory.forEach((item) => {
    if (!item || !item.name) return;
    if (isRecordDeleted(item)) return;
    const key = item.id || `${item.name}-${item.date}-${item.seconds}`;
    map.set(key, item);
  });

  // Then merge local history (filtering out any deleted records)
  localHistory.forEach((item) => {
    if (!item || !item.name) return;
    if (isRecordDeleted(item)) return;
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
 * Broadcast an admin deletion so all connected classmates' screens immediately purge the record
 */
export async function publishAdminDelete({ userName, recordId, clearAll, timestamp = Date.now() }) {
  let success = false;

  // Immediately record in local tombstone registry so local client never resurrects it
  if (clearAll) {
    markBoardCleared(timestamp);
  }
  if (userName) {
    markUserDeleted(userName, timestamp);
  }
  if (recordId) {
    markRecordDeleted(recordId);
  }

  // Immediately notify local subscribers so current admin UI updates synchronously
  notifyAdminDelete({ userName, recordId, clearAll, timestamp });

  // 1. Delete in Firestore if active
  if (isFirebaseConfigured()) {
    try {
      if (recordId) await deleteAttemptFromFirestore(recordId);
      if (userName) await deleteUserFromFirestore(userName, currentRoom);
      success = true;
    } catch (e) {
      console.warn('Firebase admin delete failed:', e);
    }
  }

  // 2. Broadcast via Zero-Config Relay so all classmates' screens purge the record
  try {
    const topicUrl = `https://ntfy.sh/quiz-room-${encodeURIComponent(currentRoom)}`;
    const res = await fetch(topicUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Title: 'Admin Record Deleted',
        Tags: 'wastebasket',
      },
      body: JSON.stringify({
        type: 'admin_delete',
        userName: userName || null,
        recordId: recordId || null,
        clearAll: !!clearAll,
        timestamp,
      }),
    });
    if (res.ok) success = true;
  } catch (err) {
    console.warn('Cloud relay delete broadcast failed:', err);
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

function notifyAdminDelete(payload) {
  adminDeleteListeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.error('Error notifying admin delete alert:', e);
    }
  });
}

/**
 * Poll cloud relay for all cached attempts, strictly filtering out deleted records
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

    // Pass 1: Parse all admin_delete commands first to update tombstones & notify
    lines.forEach((line) => {
      try {
        const item = JSON.parse(line);
        if (item.event === 'message' && item.message) {
          const payload = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
          if (payload && payload.type === 'admin_delete') {
            const ts = payload.timestamp || Date.now();
            if (payload.clearAll) markBoardCleared(ts);
            if (payload.userName) markUserDeleted(payload.userName, ts);
            if (payload.recordId) markRecordDeleted(payload.recordId);
            notifyAdminDelete(payload);
          }
        }
      } catch (e) {}
    });

    // Pass 2: Filter and collect valid, non-deleted records
    const records = [];
    lines.forEach((line) => {
      try {
        const item = JSON.parse(line);
        if (item.event === 'message' && item.message) {
          const payload = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
          if (!payload || payload.type === 'admin_delete') return; // ignore delete messages in records
          const rec = payload.record && payload.record.name ? payload.record : (payload.name && payload.items ? payload : null);
          if (rec && !isRecordDeleted(rec)) {
            records.push(rec);
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
          const payload = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
          if (payload && payload.type === 'admin_delete') {
            const ts = payload.timestamp || Date.now();
            if (payload.clearAll) markBoardCleared(ts);
            if (payload.userName) markUserDeleted(payload.userName, ts);
            if (payload.recordId) markRecordDeleted(payload.recordId);
            notifyAdminDelete(payload);
            return;
          }
          const rec = payload.record || (payload.name && payload.items ? payload : null);
          if (rec && !isRecordDeleted(rec)) {
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
export function initCloudSync(onUpdate, onNewPlayerAlert, onAdminDelete) {
  if (onUpdate) listeners.add(onUpdate);
  if (onNewPlayerAlert) newPlayerAlertListeners.add(onNewPlayerAlert);
  if (onAdminDelete) adminDeleteListeners.add(onAdminDelete);

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
    if (onAdminDelete) adminDeleteListeners.delete(onAdminDelete);
  };
}

export { getFirebaseConfig, saveStoredFirebaseConfig, isFirebaseConfigured };
