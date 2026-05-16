// ─── Firebase Sync Layer ──────────────────────────────────────────────────────
const FireSync = (function () {
  const firebaseConfig = {
    apiKey: "AIzaSyApSa_wWDjkXy7uJYgphyEPAyFUrgumK4o",
    authDomain: "hawk-trackers.firebaseapp.com",
    projectId: "hawk-trackers",
    storageBucket: "hawk-trackers.firebasestorage.app",
    messagingSenderId: "462042907771",
    appId: "1:462042907771:web:243af06cdef6f95967cede"
  };

  const ALL_KEYS = [
    "92club", "england-brewery-tracker",
    "hawkbology", "afl_bets", "afl_bankroll", "afl_staking",
    "afl_maxstake", "afl_edge_threshold", "avant_shows",
    "ibt-countries", "ibt-us-states", "ibt-uk-counties",
    "tubology_visited", "sql_mimo"
  ];

  let app = null, db = null, auth = null, currentUser = null;
  let _ready = false, _readyCallbacks = [];

  function ensureInit() {
    if (app) return;
    if (typeof firebase === "undefined") return;
    app = firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    auth.onAuthStateChanged(function (user) {
      currentUser = user;
      updateAuthUI();
      if (user) {
        _ready = true;
        _readyCallbacks.forEach(function (cb) { cb(); });
        _readyCallbacks = [];
      }
    });
  }

  function updateAuthUI() {
    var btn = document.getElementById("sync-auth-btn");
    var uploadBtn = document.getElementById("sync-upload-btn");
    var downloadBtn = document.getElementById("sync-download-btn");
    var status = document.getElementById("sync-status");
    if (!btn) return;

    if (currentUser) {
      btn.textContent = "Sign Out";
      btn.onclick = function () { auth.signOut(); };
      if (uploadBtn) uploadBtn.style.display = "";
      if (downloadBtn) downloadBtn.style.display = "";
      if (status) {
        status.textContent = "Synced as " + (currentUser.displayName || currentUser.email);
        status.className = "sync-status signed-in";
      }
    } else {
      btn.textContent = "Sign In to Sync";
      btn.onclick = signIn;
      if (uploadBtn) uploadBtn.style.display = "none";
      if (downloadBtn) downloadBtn.style.display = "none";
      if (status) {
        status.textContent = "Local only — sign in to sync across devices";
        status.className = "sync-status signed-out";
      }
    }
  }

  function signIn() {
    ensureInit();
    if (!auth) return;
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function (err) {
      if (err.code === "auth/popup-blocked") auth.signInWithRedirect(provider);
    });
  }

  function docRef(key) {
    if (!db || !currentUser) return null;
    return db.collection("users").doc(currentUser.uid).collection("data").doc(key);
  }

  function save(lsKey, data) {
    var json = JSON.stringify(data);
    localStorage.setItem(lsKey, json);
    var ref = docRef(lsKey);
    if (ref) {
      ref.set({ value: json, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch(function (e) { console.warn("Firestore save failed:", e); });
    }
  }

  function load(lsKey, callback) {
    ensureInit();
    var local = localStorage.getItem(lsKey);
    var localData = null;
    if (local) { try { localData = JSON.parse(local); } catch (e) {} }

    if (currentUser) {
      var ref = docRef(lsKey);
      if (ref) {
        ref.get().then(function (snap) {
          if (snap.exists) {
            try {
              var cloud = JSON.parse(snap.data().value);
              callback(cloud);
              return;
            } catch (e) {}
          }
          if (localData) save(lsKey, localData);
          callback(localData);
        }).catch(function () { callback(localData); });
        return;
      }
    }

    if (!_ready) {
      _readyCallbacks.push(function () {
        load(lsKey, function (d) { if (d) callback(d); });
      });
    }
    callback(localData);
  }

  // ── Upload ALL localStorage to Firestore ────────────────────────────────────
  function uploadAllLocal() {
    if (!currentUser || !db) { alert("Please sign in first."); return; }
    var status = document.getElementById("sync-status");
    if (status) { status.textContent = "Uploading local data…"; status.className = "sync-status uploading"; }

    var batch = db.batch();
    var count = 0;

    ALL_KEYS.forEach(function (key) {
      var raw = localStorage.getItem(key);
      if (raw) {
        var ref = docRef(key);
        if (ref) { batch.set(ref, { value: raw, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }); count++; }
      }
    });

    // Legacy brewery key
    var legacy = localStorage.getItem("london-brewery-tracker");
    if (legacy && !localStorage.getItem("england-brewery-tracker")) {
      var ref = docRef("england-brewery-tracker");
      if (ref) { batch.set(ref, { value: legacy, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }); count++; }
    }

    if (count === 0) {
      if (status) { status.textContent = "No local data found to upload."; setTimeout(updateAuthUI, 3000); }
      return;
    }

    batch.commit().then(function () {
      if (status) { status.textContent = "✅ Uploaded " + count + " data sets to cloud!"; status.className = "sync-status signed-in"; setTimeout(updateAuthUI, 4000); }
    }).catch(function (err) {
      if (status) { status.textContent = "❌ Upload failed: " + err.message; status.className = "sync-status signed-out"; setTimeout(updateAuthUI, 5000); }
    });
  }

  // ── Download ALL cloud data to localStorage ─────────────────────────────────
  function downloadAllCloud() {
    if (!currentUser || !db) { alert("Please sign in first."); return; }
    var status = document.getElementById("sync-status");
    if (status) { status.textContent = "Downloading cloud data…"; status.className = "sync-status uploading"; }

    var colRef = db.collection("users").doc(currentUser.uid).collection("data");
    colRef.get().then(function (snap) {
      var count = 0;
      snap.forEach(function (doc) {
        if (doc.data().value) { localStorage.setItem(doc.id, doc.data().value); count++; }
      });
      if (status) { status.textContent = "✅ Downloaded " + count + " data sets! Reloading…"; status.className = "sync-status signed-in"; }
      setTimeout(function () { location.reload(); }, 1500);
    }).catch(function (err) {
      if (status) { status.textContent = "❌ Download failed: " + err.message; status.className = "sync-status signed-out"; }
    });
  }

  // ── Inject auth bar ─────────────────────────────────────────────────────────
  function injectAuthBar() {
    if (document.getElementById("sync-bar")) return;

    var bar = document.createElement("div");
    bar.id = "sync-bar";
    bar.innerHTML =
      '<span id="sync-status" class="sync-status signed-out">Loading…</span>' +
      '<button id="sync-auth-btn" class="sync-btn">Sign In to Sync</button>' +
      '<button id="sync-upload-btn" class="sync-btn sync-upload" style="display:none">⬆ Upload Local Data</button>' +
      '<button id="sync-download-btn" class="sync-btn sync-download" style="display:none">⬇ Download Cloud Data</button>';
    document.body.appendChild(bar);

    var style = document.createElement("style");
    style.textContent =
      '#sync-bar{position:fixed;bottom:0;left:0;right:0;background:rgba(15,17,23,0.95);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,0.08);padding:8px 16px;display:flex;align-items:center;justify-content:center;gap:10px;z-index:9999;font-family:"Segoe UI",system-ui,sans-serif;flex-wrap:wrap}' +
      '.sync-status{font-size:.78rem;color:rgba(255,255,255,.45)}' +
      '.sync-status.signed-in{color:#4ade80}' +
      '.sync-status.signed-out{color:rgba(255,255,255,.45)}' +
      '.sync-status.uploading{color:#f59e0b}' +
      '.sync-btn{padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);color:#fff;font-size:.75rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;white-space:nowrap}' +
      '.sync-btn:hover{background:rgba(255,255,255,.15)}' +
      '.sync-upload{border-color:rgba(74,222,128,.3);color:#4ade80}' +
      '.sync-upload:hover{background:rgba(74,222,128,.12)}' +
      '.sync-download{border-color:rgba(59,130,246,.3);color:#60a5fa}' +
      '.sync-download:hover{background:rgba(59,130,246,.12)}';
    document.head.appendChild(style);

    ensureInit();
    updateAuthUI();

    document.getElementById("sync-upload-btn").addEventListener("click", uploadAllLocal);
    document.getElementById("sync-download-btn").addEventListener("click", downloadAllCloud);
  }

  // ── Real-time listener ──────────────────────────────────────────────────────
  var _listeners = {}; // track active listeners to avoid duplicates

  function listen(lsKey, callback) {
    ensureInit();

    function startListener() {
      if (_listeners[lsKey]) return; // already listening
      var ref = docRef(lsKey);
      if (!ref) return;
      _listeners[lsKey] = ref.onSnapshot(function (snap) {
        if (snap.exists) {
          try {
            var cloud = JSON.parse(snap.data().value);
            localStorage.setItem(lsKey, snap.data().value);
            callback(cloud);
          } catch (e) { console.warn("FireSync listen parse error:", e); }
        }
      }, function (err) {
        console.warn("FireSync listen error:", err);
      });
    }

    if (currentUser) {
      startListener();
    } else {
      _readyCallbacks.push(startListener);
    }
  }

  return { ensureInit: ensureInit, signIn: signIn, save: save, load: load, listen: listen, uploadAllLocal: uploadAllLocal, downloadAllCloud: downloadAllCloud, injectAuthBar: injectAuthBar };
})();

document.addEventListener("DOMContentLoaded", function () { FireSync.injectAuthBar(); });
