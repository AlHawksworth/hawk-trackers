// ─── Firebase Sync Layer ──────────────────────────────────────────────────────
// Shared across all apps. Handles Google auth + Firestore sync.
// Each app calls FireSync.init(key, onDataLoaded) on startup,
// and FireSync.save(key, data) whenever data changes.
// localStorage is kept as a fast cache; Firestore is the source of truth.

const FireSync = (function () {
  const firebaseConfig = {
    apiKey: "AIzaSyApSa_wWDjkXy7uJYgphyEPAyFUrgumK4o",
    authDomain: "hawk-trackers.firebaseapp.com",
    projectId: "hawk-trackers",
    storageBucket: "hawk-trackers.firebasestorage.app",
    messagingSenderId: "462042907771",
    appId: "1:462042907771:web:243af06cdef6f95967cede"
  };

  let app = null;
  let db = null;
  let auth = null;
  let currentUser = null;
  let _ready = false;
  let _readyCallbacks = [];

  function ensureInit() {
    if (app) return;
    // Firebase compat SDK loaded via script tags
    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK not loaded");
      return;
    }
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.apps[0];
    }
    db = firebase.firestore();
    auth = firebase.auth();

    auth.onAuthStateChanged((user) => {
      currentUser = user;
      updateAuthUI();
      if (user) {
        _ready = true;
        _readyCallbacks.forEach(cb => cb());
        _readyCallbacks = [];
      }
    });
  }

  // ── Auth UI ─────────────────────────────────────────────────────────────────
  function updateAuthUI() {
    const btn = document.getElementById("sync-auth-btn");
    const status = document.getElementById("sync-status");
    if (!btn) return;

    if (currentUser) {
      btn.textContent = "Sign Out";
      btn.onclick = () => auth.signOut();
      if (status) {
        status.textContent = `Synced as ${currentUser.displayName || currentUser.email}`;
        status.className = "sync-status signed-in";
      }
    } else {
      btn.textContent = "Sign In to Sync";
      btn.onclick = signIn;
      if (status) {
        status.textContent = "Local only — sign in to sync across devices";
        status.className = "sync-status signed-out";
      }
    }
  }

  function signIn() {
    ensureInit();
    if (!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => {
      console.error("Sign-in failed:", err);
      // Fallback for popup blockers
      if (err.code === "auth/popup-blocked") {
        auth.signInWithRedirect(provider);
      }
    });
  }

  // ── Firestore helpers ───────────────────────────────────────────────────────
  function docRef(key) {
    if (!db || !currentUser) return null;
    return db.collection("users").doc(currentUser.uid).collection("data").doc(key);
  }

  // Save data to both localStorage and Firestore
  function save(lsKey, data) {
    // Always save to localStorage (fast, works offline)
    const json = JSON.stringify(data);
    localStorage.setItem(lsKey, json);

    // If signed in, also push to Firestore
    const ref = docRef(lsKey);
    if (ref) {
      ref.set({ value: json, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch(err => console.warn("Firestore save failed:", err));
    }
  }

  // Load from Firestore (if signed in), falling back to localStorage
  function load(lsKey, callback) {
    ensureInit();

    // Immediately return localStorage data so the app renders fast
    const local = localStorage.getItem(lsKey);
    let localData = null;
    if (local) {
      try { localData = JSON.parse(local); } catch (e) {}
    }

    if (currentUser) {
      // Fetch from Firestore
      const ref = docRef(lsKey);
      if (ref) {
        ref.get().then(snap => {
          if (snap.exists) {
            try {
              const cloud = JSON.parse(snap.data().value);
              // Update localStorage cache
              localStorage.setItem(lsKey, snap.data().value);
              callback(cloud);
              return;
            } catch (e) {}
          }
          // No cloud data — push local data up if we have any
          if (localData) {
            save(lsKey, localData);
          }
          callback(localData);
        }).catch(() => {
          callback(localData);
        });
        return;
      }
    }

    // Not signed in yet — use local, but queue a cloud load for when auth resolves
    if (!_ready) {
      _readyCallbacks.push(() => {
        load(lsKey, (cloudData) => {
          if (cloudData) callback(cloudData);
        });
      });
    }
    callback(localData);
  }

  // ── Inject auth UI into any page ────────────────────────────────────────────
  function injectAuthBar() {
    // Don't double-inject
    if (document.getElementById("sync-bar")) return;

    const bar = document.createElement("div");
    bar.id = "sync-bar";
    bar.innerHTML = `
      <span id="sync-status" class="sync-status signed-out">Loading…</span>
      <button id="sync-auth-btn" class="sync-btn">Sign In to Sync</button>
    `;
    document.body.appendChild(bar);

    // Inject styles
    const style = document.createElement("style");
    style.textContent = `
      #sync-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(15,17,23,0.95);
        backdrop-filter: blur(8px);
        border-top: 1px solid rgba(255,255,255,0.08);
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        z-index: 9999;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .sync-status {
        font-size: 0.78rem;
        color: rgba(255,255,255,0.45);
      }
      .sync-status.signed-in { color: #4ade80; }
      .sync-status.signed-out { color: rgba(255,255,255,0.45); }
      .sync-btn {
        padding: 6px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.08);
        color: #fff;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s;
      }
      .sync-btn:hover { background: rgba(255,255,255,0.15); }
    `;
    document.head.appendChild(style);

    ensureInit();
    updateAuthUI();
  }

  return { ensureInit, signIn, save, load, injectAuthBar };
})();

// Auto-inject the auth bar on every page
document.addEventListener("DOMContentLoaded", () => {
  FireSync.injectAuthBar();
});
