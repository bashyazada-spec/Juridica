// ═══════════════════════════════════════════════════════════════
//  AUTH HELPERS  —  shared across login / app / admin pages
// ═══════════════════════════════════════════════════════════════

// Called by index.html on load — redirect to login if not signed in
function requireAuth() {
  document.addEventListener("firebase-ready", () => {
    if (!window._auth || !window._fbOnAuth) {
      // Firebase unavailable — allow local mode (app.js handles it)
      return;
    }
    window._fbOnAuth(window._auth, user => {
      if (!user) {
        window.location.replace("login.html");
      } else {
        // Store user info globally for display
        window._currentUser = user;
        const el = document.getElementById("auth-user-display");
        if (el) el.textContent = user.displayName || user.email;
      }
    });
  });
}

// Called by login.html
async function doLogin(email, password) {
  if (!window._auth || !window._fbSignIn) throw new Error("Auth not ready");
  const cred = await window._fbSignIn(window._auth, email, password);
  return cred.user;
}

// Called by logout button on index.html
async function doLogout() {
  if (window._auth && window._fbSignOut) {
    await window._fbSignOut(window._auth);
  }
  window.location.replace("login.html");
}

// Called by admin.html — requires the signed-in user to be an admin
async function requireAdmin() {
  return new Promise(resolve => {
    document.addEventListener("firebase-ready", () => {
      if (!window._auth || !window._fbOnAuth) {
        resolve(false);
        return;
      }
      window._fbOnAuth(window._auth, async user => {
        if (!user) { window.location.replace("login.html"); resolve(false); return; }
        // Check admin flag in Firestore allowedUsers collection
        try {
          const snap = await window._fbGetDocs(
            window._fbQuery(
              window._fbCol(window._db, "allowedUsers"),
              window._fbWhere("uid", "==", user.uid)
            )
          );
          if (!snap.empty && snap.docs[0].data().role === "admin") {
            window._currentUser = user;
            const el = document.getElementById("auth-user-display");
            if (el) el.textContent = user.displayName || user.email;
            resolve(true);
          } else {
            alert("Access denied. You do not have admin privileges.");
            window.location.replace("login.html");
            resolve(false);
          }
        } catch(e) {
          console.error("Admin check failed:", e);
          alert("Could not verify admin access.");
          window.location.replace("login.html");
          resolve(false);
        }
      });
    });
  });
}

// Save a user record to the allowedUsers collection in Firestore
async function dbSaveAllowedUser(uid, email, displayName, role) {
  const id = uid;
  await window._fbSet(window._fbDoc(window._db, "allowedUsers", id), {
    uid, email, displayName, role,
    createdAt: new Date().toISOString()
  });
}

// Check if user needs onboarding (has no profiles yet)
async function checkNeedsOnboarding() {
  if (localMode || !window._db || !window._currentUser) {
    return false;
  }
  try {
    const pSnap = await window._fbGetDocs(window._fbQuery(
      window._fbCol(window._db, "profiles"),
      window._fbWhere("ownerUid", "==", window._currentUser.uid)
    ));
    // If no profiles exist, user needs onboarding
    return pSnap.empty;
  } catch(e) {
    console.error("Onboarding check failed:", e);
    return false;
  }
}