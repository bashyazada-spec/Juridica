<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Simando Law — Account Management</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet"/>
<script type="module" src="js/firebase-init.js"></script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy:        #0a1520;
    --gold:        #c9a55c;
    --gold-light:  #e0c080;
    --gold-border: rgba(201,165,92,0.28);
    --gold-dim:    rgba(201,165,92,0.09);
    --bg:          #060c13;
    --surface:     #0c1826;
    --surface2:    #091422;
    --surface3:    #10202e;
    --border:      #162033;
    --text:        #d8e4f0;
    --text-muted:  #6b82a0;
    --text-dim:    #344556;
    --green:       #34d399;
    --red:         #f87171;
    --amber:       #fbbf24;
    --violet:      #818cf8;
    --font-display:'Cormorant Garamond', Georgia, serif;
    --font-body:   'DM Sans', system-ui, sans-serif;
    --radius:      10px;
  }
  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 14px; }
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,165,92,0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* Layout */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(6,12,19,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .topbar-left { display: flex; align-items: center; gap: 14px; }
  .topbar-logo { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #f2ede4; letter-spacing: 1px; }
  .topbar-logo span { color: var(--gold); }
  .topbar-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gold);
    background: var(--gold-dim);
    border: 1px solid var(--gold-border);
    border-radius: 20px;
    padding: 3px 10px;
  }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .topbar-user { font-size: 13px; color: var(--text-muted); }
  .btn-sm {
    padding: 7px 14px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    transition: all 0.2s;
  }
  .btn-sm:hover { border-color: var(--gold-border); color: var(--gold); }
  .btn-primary {
    background: linear-gradient(135deg, #c9a55c 0%, #b8903d 100%);
    border-color: transparent;
    color: #0a1520;
    font-weight: 700;
  }
  .btn-primary:hover { opacity: 0.88; color: #0a1520; }
  .btn-danger { border-color: rgba(248,113,113,0.3); color: var(--red); }
  .btn-danger:hover { background: rgba(248,113,113,0.1); border-color: var(--red); color: var(--red); }

  .page { max-width: 860px; margin: 0 auto; padding: 36px 28px 60px; position: relative; z-index: 1; }

  .page-title {
    font-family: var(--font-display);
    font-size: 30px;
    font-weight: 700;
    color: #f2ede4;
    margin-bottom: 4px;
  }
  .page-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 32px; }

  /* Card */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
  }
  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--gold);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Form grid */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width:560px) { .form-grid { grid-template-columns: 1fr; } }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 7px;
  }
  .field-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    padding: 10px 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field-input:focus { border-color: var(--gold-border); box-shadow: 0 0 0 3px rgba(201,165,92,0.09); }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input.err { border-color: var(--red); }
  select.field-input { appearance: none; cursor: pointer; }

  .pw-wrap { position: relative; }
  .pw-wrap .field-input { padding-right: 42px; }
  .pw-eye {
    position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--text-muted);
    font-size: 15px; padding: 3px; transition: color 0.2s;
  }
  .pw-eye:hover { color: var(--gold); }

  .form-actions { display: flex; gap: 10px; margin-top: 20px; align-items: center; }
  .form-msg { font-size: 13px; margin-left: 4px; }
  .form-msg.success { color: var(--green); }
  .form-msg.error   { color: var(--red); }

  /* Accounts table */
  .accounts-list { display: flex; flex-direction: column; gap: 10px; }
  .account-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    transition: border-color 0.2s;
  }
  .account-row:hover { border-color: rgba(201,165,92,0.15); }
  .account-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(201,165,92,0.12);
    border: 1.5px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: var(--gold);
    flex-shrink: 0;
  }
  .account-info { flex: 1; min-width: 0; }
  .account-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .account-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .role-badge {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 3px 9px; border-radius: 20px;
  }
  .role-badge.admin { background: rgba(201,165,92,0.12); border: 1px solid var(--gold-border); color: var(--gold); }
  .role-badge.staff { background: rgba(129,140,248,0.1); border: 1px solid rgba(129,140,248,0.3); color: var(--violet); }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    background: var(--green);
  }
  .status-dot.disabled { background: var(--red); }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-dim);
    font-size: 13px;
    line-height: 2;
  }

  /* Loading screen */
  #admin-loading {
    position: fixed; inset: 0; z-index: 999;
    background: var(--bg);
    display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 14px;
  }
  .spin { width: 28px; height: 28px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  #admin-loading p { font-size: 13px; color: var(--text-muted); }

  /* Toast */
  #toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 20px; font-size: 13px;
    opacity: 0; transition: opacity 0.3s, transform 0.3s; pointer-events: none; z-index: 9999;
    white-space: nowrap;
  }
  #toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  #toast.success { border-color: rgba(52,211,153,0.4); color: var(--green); }
  #toast.error   { border-color: rgba(248,113,113,0.4); color: var(--red); }
</style>
</head>
<body>

<!-- Loading overlay until auth check completes -->
<div id="admin-loading">
  <div class="spin"></div>
  <p>Verifying access…</p>
</div>

<!-- Toast -->
<div id="toast"></div>

<div id="admin-body" style="display:none">

  <!-- Top bar -->
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-logo">SIMANDO <span>LAW</span></div>
      <span class="topbar-badge">Admin</span>
    </div>
    <div class="topbar-right">
      <span class="topbar-user" id="auth-user-display"></span>
      <a href="index.html" class="btn-sm">← App</a>
      <button class="btn-sm" onclick="doLogout()">Sign Out</button>
    </div>
  </div>

  <div class="page">
    <div class="page-title">Account Management</div>
    <div class="page-sub">Create and manage staff accounts. Only admins can access this page.</div>

    <!-- Create new account -->
    <div class="card">
      <div class="card-title">
        <span style="font-size:18px">➕</span> Create New Account
      </div>
      <div class="form-grid">
        <div>
          <label class="field-label" for="new-name">Full Name *</label>
          <input class="field-input" id="new-name" type="text" placeholder="e.g. Atty. Maria Santos"/>
        </div>
        <div>
          <label class="field-label" for="new-email">Email Address *</label>
          <input class="field-input" id="new-email" type="email" placeholder="staff@simandolaw.com"/>
        </div>
        <div>
          <label class="field-label" for="new-pw">Temporary Password *</label>
          <div class="pw-wrap">
            <input class="field-input" id="new-pw" type="password" placeholder="Min. 8 characters"/>
            <button class="pw-eye" type="button" onclick="toggleNewPw()" id="new-pw-eye">👁</button>
          </div>
        </div>
        <div>
          <label class="field-label" for="new-role">Role *</label>
          <select class="field-input" id="new-role">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-sm btn-primary" id="create-btn" onclick="createAccount()">Create Account</button>
        <span class="form-msg" id="create-msg"></span>
      </div>
      <div style="margin-top:14px;padding:12px 16px;background:rgba(201,165,92,0.05);border:1px solid rgba(201,165,92,0.12);border-radius:10px;font-size:12px;color:var(--text-muted);line-height:1.8">
        ⚠️ <strong style="color:var(--text-muted)">Important:</strong>
        After creating an account, share the temporary password securely with the staff member.
        They can change it from their account settings.
        New accounts are immediately active.
      </div>
    </div>

    <!-- Existing accounts -->
    <div class="card">
      <div class="card-title" style="justify-content:space-between">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">👥</span> Existing Accounts
        </div>
        <button class="btn-sm" onclick="loadAccounts()" title="Refresh list">↻ Refresh</button>
      </div>
      <div id="accounts-list">
        <div class="empty-state">Loading accounts…</div>
      </div>
    </div>

  </div>
</div>

<script src="js/config.js"></script>
<script src="js/data.js"></script>
<script src="js/auth.js"></script>
<script>
// ── Init ──
document.addEventListener("firebase-ready", async () => {
  if (!window._auth || !window._fbOnAuth) {
    document.getElementById("admin-loading").innerHTML =
      '<p style="color:var(--red)">Firebase unavailable. Cannot load admin panel.</p>';
    return;
  }
  window._fbOnAuth(window._auth, async user => {
    if (!user) { window.location.replace("login.html"); return; }

    // Verify admin role
    try {
      const snap = await window._fbGetDocs(
        window._fbQuery(
          window._fbCol(window._db, "allowedUsers"),
          window._fbWhere("uid", "==", user.uid)
        )
      );
      if (snap.empty || snap.docs[0].data().role !== "admin") {
        alert("Access denied. Admins only.");
        window.location.replace("index.html");
        return;
      }
    } catch(e) {
      alert("Could not verify your admin role.");
      window.location.replace("index.html");
      return;
    }

    window._currentUser = user;
    document.getElementById("auth-user-display").textContent = user.displayName || user.email;
    document.getElementById("admin-loading").style.display = "none";
    document.getElementById("admin-body").style.display = "block";
    loadAccounts();
  });
});

// ── Toast ──
let _toastTimer;
function showToast(msg, type="success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + type;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = ""; }, 3200);
}

// ── Password toggle ──
function toggleNewPw() {
  const i = document.getElementById("new-pw");
  const e = document.getElementById("new-pw-eye");
  if (i.type === "password") { i.type = "text"; e.textContent = "🙈"; }
  else { i.type = "password"; e.textContent = "👁"; }
}

// ── Create account ──
async function createAccount() {
  const name  = document.getElementById("new-name").value.trim();
  const email = document.getElementById("new-email").value.trim();
  const pw    = document.getElementById("new-pw").value;
  const role  = document.getElementById("new-role").value;
  const msg   = document.getElementById("create-msg");
  const btn   = document.getElementById("create-btn");

  msg.className = "form-msg";
  msg.textContent = "";

  if (!name)  { msg.className = "form-msg error"; msg.textContent = "Name is required."; return; }
  if (!email) { msg.className = "form-msg error"; msg.textContent = "Email is required."; return; }
  if (!pw || pw.length < 8) { msg.className = "form-msg error"; msg.textContent = "Password must be at least 8 characters."; return; }

  btn.disabled = true;
  btn.textContent = "Creating…";

  try {
    // Create the Firebase Auth user
    const cred = await window._fbCreateUser(window._auth, email, pw);
    const uid  = cred.user.uid;

    // Set display name
    await window._fbUpdateProfile(cred.user, { displayName: name });

    // Save to allowedUsers collection
    await dbSaveAllowedUser(uid, email, name, role);

    // Clear form
    document.getElementById("new-name").value  = "";
    document.getElementById("new-email").value = "";
    document.getElementById("new-pw").value    = "";
    document.getElementById("new-role").value  = "staff";

    msg.className = "form-msg success";
    msg.textContent = `✓ Account created for ${name}`;
    showToast(`Account created for ${name}`, "success");
    loadAccounts();

  } catch(err) {
    const code = err.code || "";
    let errText = "Failed to create account.";
    if (code === "auth/email-already-in-use") errText = "This email is already registered.";
    else if (code === "auth/invalid-email")   errText = "Invalid email address.";
    else if (code === "auth/weak-password")   errText = "Password is too weak.";
    else errText = err.message || errText;
    msg.className = "form-msg error";
    msg.textContent = errText;
  } finally {
    btn.disabled = false;
    btn.textContent = "Create Account";
  }
}

// ── Load accounts list ──
async function loadAccounts() {
  const el = document.getElementById("accounts-list");
  el.innerHTML = '<div class="empty-state">Loading…</div>';
  try {
    const snap = await window._fbGetDocs(window._fbCol(window._db, "allowedUsers"));
    const users = snap.docs.map(d => d.data()).sort((a,b) => (a.displayName||"").localeCompare(b.displayName||""));

    if (!users.length) {
      el.innerHTML = '<div class="empty-state">No accounts found.<br>Create the first account above.</div>';
      return;
    }

    el.innerHTML = '<div class="accounts-list">' + users.map(u => {
      const initials = (u.displayName||u.email||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
      const isDisabled = u.disabled === true;
      return `
        <div class="account-row" id="row-${u.uid}">
          <div class="account-avatar">${initials}</div>
          <div class="account-info">
            <div class="account-name">${escHtml(u.displayName || "—")}</div>
            <div class="account-email">${escHtml(u.email)}</div>
          </div>
          <span class="role-badge ${u.role === 'admin' ? 'admin' : 'staff'}">${u.role||"staff"}</span>
          <div class="status-dot ${isDisabled ? 'disabled' : ''}" title="${isDisabled ? 'Disabled' : 'Active'}"></div>
          <div style="display:flex;gap:8px;flex-shrink:0">
            ${u.uid === window._currentUser?.uid
              ? '<span style="font-size:11px;color:var(--text-dim);padding:7px 4px">You</span>'
              : `<button class="btn-sm btn-danger" onclick="deleteAccount('${u.uid}','${escAttr(u.displayName||u.email)}')">Remove</button>`
            }
          </div>
        </div>`;
    }).join("") + '</div>';
  } catch(err) {
    el.innerHTML = `<div class="empty-state" style="color:var(--red)">Failed to load accounts: ${err.message}</div>`;
  }
}

// ── Delete / remove account ──
async function deleteAccount(uid, name) {
  if (!confirm(`Remove ${name}?\n\nThis will delete their access record. The Firebase Auth account will remain but they won't be able to log in.`)) return;
  try {
    await window._fbDelete(window._fbDoc(window._db, "allowedUsers", uid));
    showToast(`${name} removed`, "success");
    loadAccounts();
  } catch(err) {
    showToast("Failed to remove account: " + err.message, "error");
  }
}

// ── Utils ──
function escHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function escAttr(s) { return String(s).replace(/'/g,"&#39;").replace(/"/g,"&quot;"); }

function doLogout() {
  if (window._auth && window._fbSignOut) window._fbSignOut(window._auth);
  window.location.replace("login.html");
}
</script>
</body>
</html>
