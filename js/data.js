let profiles     = [];
let cases        = [];
let caseTypesList = []; // system-wide custom case types, persisted in Firestore
let currentView  = "dashboard";
let selProfile   = null;
let selCase      = null;
let caseFormMode = "add";
let profFormMode = "add";
let pfColor      = AVATAR_COLORS[0];
let pendingDocs  = [];
let deleteTarget = null;
let statusFilter = "All";
let pdFilter     = "All";
let dbReady      = false;
let localMode    = false;

const statusColor = s =>
  ({Completed:"#22c55e","On-going":"#f59e0b",Dismissed:"#ef4444",Settled:"#6366f1"}[s]||"#94a3b8");

const initials = name => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

const badge = (label, color) =>
  `<span class="badge" style="background:${color}22;color:${color}">${label}</span>`;

const avatarDiv = (name, color, size=38, photoUrl=null) => {
  const fs = Math.round(size*0.34);
  if (photoUrl) {
    return `<img src="${photoUrl}" alt="${initials(name)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid ${color||'#c9a84c'};flex-shrink:0"/>`;
  }
  const c = color || '#c9a84c';
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${c}33;border:2px solid ${c};font-size:${fs}px;color:${c};flex-shrink:0">${initials(name)}</div>`;
};

const formatDate = d => d ? new Date(d+'T00:00:00').toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"}) : "N/A";

let toastTimer;
function showToast(msg, type="success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.className=""; }, 3000);
}

async function dbLoad() {
  if (localMode || !window._db) return;
  try {
    const db = window._db;
    const pSnap = await window._fbGetDocs(window._fbQuery(window._fbCol(db,"profiles"), window._fbOrderBy("createdAt","desc")));
    profiles = pSnap.docs.map(d=>({id:d.id,...d.data()}));
    const cSnap = await window._fbGetDocs(window._fbQuery(window._fbCol(db,"cases"), window._fbOrderBy("createdAt","desc")));
    cases = cSnap.docs.map(d=>({id:d.id,...d.data()}));
    // Load shared case types list
    const ctSnap = await window._fbGetDocs(window._fbCol(db,"caseTypes"));
    caseTypesList = ctSnap.docs.map(d=>d.data().name).filter(Boolean).sort();
    dbReady = true;
    if (currentView === "dashboard") renderDashboard();
    if (currentView === "profiles")  renderProfiles();
    if (currentView === "allcases")  renderAllCases();
    if (currentView === "profileDetail" && selProfile) renderProfileDetail();
    if (currentView === "caseDetail" && selCase) renderCaseDetail();
    renderQuickAccess();
  } catch(e) {
    console.error("Firestore load error:", e);
    dbReady = false;
    if (e.code === "permission-denied") {
      showToast("Firestore permission denied — check your security rules","error");
    } else {
      showToast("Database connection error — check console","error");
    }
  }
}

async function dbAddProfile(data) {
  if (localMode || !window._db) { data.id = "local_"+Date.now(); profiles.unshift(data); return data; }
  const ref = await window._fbAddDoc(window._fbCol(window._db,"profiles"), data);
  data.id = ref.id;
  profiles.unshift(data);
  return data;
}

async function dbUpdateProfile(id, data) {
  if (!localMode && window._db) await window._fbUpdate(window._fbDoc(window._db,"profiles",id), data);
  const idx = profiles.findIndex(p=>p.id===id);
  if (idx>=0) profiles[idx] = {...profiles[idx],...data};
}

async function dbDeleteProfile(id) {
  if (!localMode && window._db) await window._fbDelete(window._fbDoc(window._db,"profiles",id));
  profiles = profiles.filter(p=>p.id!==id);
}

async function dbAddCase(data) {
  if (localMode || !window._db) { data.id = "local_"+Date.now(); cases.unshift(data); return data; }
  const ref = await window._fbAddDoc(window._fbCol(window._db,"cases"), data);
  data.id = ref.id;
  cases.unshift(data);
  return data;
}

async function dbUpdateCase(id, data) {
  if (!localMode && window._db) await window._fbUpdate(window._fbDoc(window._db,"cases",id), data);
  const idx = cases.findIndex(c=>c.id===id);
  if (idx>=0) cases[idx] = {...cases[idx],...data};
}

async function dbDeleteCase(id) {
  if (!localMode && window._db) await window._fbDelete(window._fbDoc(window._db,"cases",id));
  cases = cases.filter(c=>c.id!==id);
}

// ── Case Types (system-wide persistent list) ──
async function dbAddCaseType(name) {
  const trimmed = name.trim();
  if (!trimmed || caseTypesList.includes(trimmed)) return;
  caseTypesList.push(trimmed);
  caseTypesList.sort();
  if (!localMode && window._db) {
    // Use the name as document ID (slugified) to avoid duplicates
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "_");
    await window._fbSet(window._fbDoc(window._db, "caseTypes", id), { name: trimmed });
  }
}

async function dbLoadCaseTypes() {
  if (localMode || !window._db) return;
  try {
    const snap = await window._fbGetDocs(window._fbCol(window._db, "caseTypes"));
    caseTypesList = snap.docs.map(d => d.data().name).filter(Boolean).sort();
  } catch(e) { console.warn("Could not load caseTypes:", e); }
}
