// ═══════════════════════════════════════════════════════════════
//  DELETE CONFIRMATION — TYPE "DELETE" TO CONFIRM
//  CRITICAL: Store target in a closure variable, NOT global deleteTarget
// ═══════════════════════════════════════════════════════════════
let _pendingDeleteTarget = null;

function confirmDeleteProfile() {
  const cnt = cases.filter(c => c.profileId === selProfile.id).length;
  _pendingDeleteTarget = { type: "profile", id: selProfile.id, name: selProfile.name, caseCount: cnt };

  document.getElementById("del-title").textContent = "Delete Attorney Profile?";
  document.getElementById("del-body").innerHTML = 
    `You are about to permanently remove <strong style="color:var(--text)">${selProfile.name}</strong> and all ${cnt} associated case(s).<br>This action <strong>cannot</strong> be undone.`;

  openDeleteModal();
}

function confirmDeleteCase() {
  _pendingDeleteTarget = { type: "case", id: selCase.id, title: selCase.title };

  document.getElementById("del-title").textContent = "Delete Case?";
  document.getElementById("del-body").innerHTML = 
    `You are about to permanently remove <strong style="color:var(--text)">${selCase.title}</strong>.<br>This action <strong>cannot</strong> be undone.`;

  openDeleteModal();
}

function openDeleteModal() {
  const modal = document.getElementById("delete-modal");
  const input = document.getElementById("del-confirm-input");
  const btn = document.getElementById("del-confirm-btn");
  const err = document.getElementById("del-input-err");

  // Reset state
  input.value = "";
  btn.disabled = true;
  btn.style.opacity = "0.5";
  err.classList.add("hidden");

  // Remove old listeners to prevent stacking
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  // Input validation
  input.oninput = () => {
    const val = input.value.trim().toUpperCase();
    if (val === "DELETE") {
      newBtn.disabled = false;
      newBtn.style.opacity = "1";
      err.classList.add("hidden");
    } else {
      newBtn.disabled = true;
      newBtn.style.opacity = "0.5";
    }
  };

  input.onkeydown = (e) => {
    if (e.key === "Enter" && !newBtn.disabled) {
      executeDelete();
    }
  };

  // Confirm button handler
  newBtn.onclick = () => executeDelete();

  modal.classList.remove("hidden");
  setTimeout(() => input.focus(), 50);
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.add("hidden");
  _pendingDeleteTarget = null;
}

async function executeDelete() {
  const target = _pendingDeleteTarget;
  if (!target) {
    console.error("No pending delete target");
    return;
  }

  closeDeleteModal();

  try {
    if (target.type === "case") {
      await dbDeleteCase(target.id);
      // Remove from local array immediately for responsive UI
      cases = cases.filter(c => c.id !== target.id);
      selCase = null;
      showToast("Case deleted successfully", "error");
      showView("profileDetail");
      renderProfileDetail();

    } else if (target.type === "profile") {
      // Delete all associated cases first
      const toDelete = cases.filter(c => c.profileId === target.id);
      for (const c of toDelete) {
        await dbDeleteCase(c.id);
      }
      // Remove from local arrays immediately
      cases = cases.filter(c => c.profileId !== target.id);

      await dbDeleteProfile(target.id);
      profiles = profiles.filter(p => p.id !== target.id);

      selProfile = null;
      selCase = null;
      showToast(`Profile "${target.name}" and ${toDelete.length} case(s) deleted`, "error");
      navTo("profiles");
      renderQuickAccess();
    }

    // Refresh dashboard stats if visible
    if (currentView === "dashboard") renderDashboard();

  } catch (err) {
    console.error("executeDelete error:", err);
    showToast("Delete failed: " + (err.message || "Unknown error"), "error");
  }
}

// ═══════════════════════════════════════════════════════════════
//  USER PROFILE / ACCOUNT PAGE
// ═══════════════════════════════════════════════════════════════

function renderUserProfile() {
  const user = window._currentUser || (window._auth && window._auth.currentUser);
  if (!user) return;

  document.getElementById("up-name").value = user.displayName || "";
  document.getElementById("up-email").value = user.email || "";

  // Clear any previous messages
  document.getElementById("up-msg").textContent = "";
  document.getElementById("up-msg").className = "form-msg";
  document.getElementById("up-pw-msg").textContent = "";
  document.getElementById("up-pw-msg").className = "form-msg";
  clearUserProfileErrors();
}

function clearUserProfileErrors() {
  ["up-old-pw-err", "up-new-pw-err", "up-confirm-pw-err"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  ["up-old-pw", "up-new-pw", "up-confirm-pw"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("err");
  });
}

async function saveUserProfile() {
  const name = document.getElementById("up-name").value.trim();
  const msgEl = document.getElementById("up-msg");
  const btn = document.getElementById("up-save-btn");

  if (!name) {
    msgEl.textContent = "Name cannot be empty";
    msgEl.className = "form-msg error";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Updating...";

  try {
    const user = window._auth.currentUser;
    if (!user) throw new Error("Not signed in");

    // Update Firebase Auth profile
    await window._fbUpdateProfile(user, { displayName: name });

    // Update sidebar display
    const nameEl = document.getElementById("auth-user-display");
    const avatarEl = document.getElementById("auth-avatar");
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.textContent = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

    // Update current user reference
    window._currentUser = user;

    msgEl.textContent = "✓ Profile updated";
    msgEl.className = "form-msg success";
    showToast("Profile updated successfully");
  } catch (err) {
    console.error("saveUserProfile error:", err);
    msgEl.textContent = "Failed: " + (err.message || "Unknown error");
    msgEl.className = "form-msg error";
  } finally {
    btn.disabled = false;
    btn.textContent = "Update Profile";
  }
}

function togglePwField(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

async function changeUserPassword() {
  const oldPw = document.getElementById("up-old-pw").value;
  const newPw = document.getElementById("up-new-pw").value;
  const confirmPw = document.getElementById("up-confirm-pw").value;
  const msgEl = document.getElementById("up-pw-msg");
  const btn = document.getElementById("up-pw-btn");

  clearUserProfileErrors();

  let valid = true;
  if (!oldPw) {
    document.getElementById("up-old-pw-err").classList.remove("hidden");
    document.getElementById("up-old-pw").classList.add("err");
    valid = false;
  }
  if (!newPw || newPw.length < 8) {
    document.getElementById("up-new-pw-err").classList.remove("hidden");
    document.getElementById("up-new-pw").classList.add("err");
    valid = false;
  }
  if (newPw !== confirmPw) {
    document.getElementById("up-confirm-pw-err").classList.remove("hidden");
    document.getElementById("up-confirm-pw").classList.add("err");
    valid = false;
  }
  if (!valid) return;

  btn.disabled = true;
  btn.textContent = "Changing...";

  try {
    const user = window._auth.currentUser;
    if (!user || !user.email) throw new Error("Not signed in");

    // Import EmailAuthProvider for reauthentication
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
    );

    // Reauthenticate with old password
    const credential = EmailAuthProvider.credential(user.email, oldPw);
    await reauthenticateWithCredential(user, credential);

    // Change password
    await updatePassword(user, newPw);

    // Clear fields
    document.getElementById("up-old-pw").value = "";
    document.getElementById("up-new-pw").value = "";
    document.getElementById("up-confirm-pw").value = "";

    msgEl.textContent = "✓ Password changed successfully";
    msgEl.className = "form-msg success";
    showToast("Password changed successfully");
  } catch (err) {
    console.error("changeUserPassword error:", err);
    let errMsg = "Failed to change password";
    const code = err.code || "";
    if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
      errMsg = "Current password is incorrect";
      document.getElementById("up-old-pw").classList.add("err");
    } else if (code === "auth/weak-password") {
      errMsg = "New password is too weak";
      document.getElementById("up-new-pw").classList.add("err");
    } else if (code === "auth/requires-recent-login") {
      errMsg = "Please sign out and sign back in, then try again";
    } else {
      errMsg = err.message || errMsg;
    }
    msgEl.textContent = errMsg;
    msgEl.className = "form-msg error";
  } finally {
    btn.disabled = false;
    btn.textContent = "Change Password";
  }
}

// ═══════════════════════════════════════════════════════════════
//  PROFILE FORM — DRIVE AUTH RECOMMENDED (BUT OPTIONAL)
// ═══════════════════════════════════════════════════════════════
let pfDriveConnected = false;

function openAddProfile() {
  profFormMode="add";
  pfColor=AVATAR_COLORS[0];
  pfDriveConnected = false;
  pfPhotoDataUrl = null;

  // Reset form
  document.getElementById("pf-title").textContent="New Attorney Profile";
  document.getElementById("pf-name").value="";
  document.getElementById("pf-role").value="";
  document.getElementById("pf-contact").value="";
  document.getElementById("pf-email").value="";
  document.getElementById("pf-cancel-btn").onclick=()=>navTo("profiles");
  document.getElementById("pf-back-btn").onclick=()=>navTo("profiles");

  // Reset Drive auth UI
  resetDriveAuthUI();

  // Keep inputs accessible even without connecting Drive first
  setDetailsEnabled(true);

  // Enable save button immediately for the optional onboarding flow
  const saveBtn = document.getElementById("pf-save-btn");
  saveBtn.disabled = false;
  saveBtn.style.opacity = "1";
  saveBtn.style.cursor = "pointer";
  document.getElementById("pf-save-btn-text").textContent = "Create Profile";

  const reqBadge = document.getElementById("pf-drive-required");
  if (reqBadge) {
    reqBadge.textContent = "RECOMMENDED";
    reqBadge.style.color = "var(--amber)";
    reqBadge.style.background = "rgba(251,191,36,0.1)";
  }

  clearProfileErrors();
  resetPhotoUpload();
  updateAvatarPreview();
  showView("profileForm");
}

function openEditProfile() {
  const p=selProfile;
  profFormMode="edit";
  pfColor=p.avatarColor || AVATAR_COLORS[0];
  pfPhotoDataUrl = p.photoUrl || null;  // use Drive URL for preview
  pfDriveConnected = true; // Already has drive folder or can skip

  document.getElementById("pf-title").textContent="Edit Profile";
  document.getElementById("pf-name").value=p.name;
  document.getElementById("pf-role").value=p.role;
  document.getElementById("pf-contact").value=p.contact||"";
  document.getElementById("pf-email").value=p.email||"";
  document.getElementById("pf-cancel-btn").onclick=()=>{ showView("profileDetail"); renderProfileDetail(); };
  document.getElementById("pf-back-btn").onclick=()=>{ showView("profileDetail"); renderProfileDetail(); };

  // For edit, hide the drive auth requirement (already connected)
  const driveSection = document.getElementById("pf-drive-section");
  if (driveSection) driveSection.style.display = "none";

  setDetailsEnabled(true);
  document.getElementById("pf-save-btn").disabled = false;
  document.getElementById("pf-save-btn").style.opacity = "1";
  document.getElementById("pf-save-btn").style.cursor = "pointer";
  document.getElementById("pf-save-btn-text").textContent = "Save Changes";

  clearProfileErrors();
  resetPhotoUpload();
  // If they already have a photo, show it
  if (pfPhotoDataUrl) {
    showPhotoPreview(pfPhotoDataUrl);
  }
  updateAvatarPreview();
  showView("profileForm");
}

function resetDriveAuthUI() {
  const driveSection = document.getElementById("pf-drive-section");
  if (driveSection) driveSection.style.display = "block";

  const statusEl = document.getElementById("pf-drive-status");
  const btn = document.getElementById("pf-connect-drive-btn");
  const btnText = document.getElementById("pf-connect-drive-text");
  const errorEl = document.getElementById("pf-drive-error");

  if (statusEl) {
    statusEl.className = "drive-status-chip disconnected";
    statusEl.textContent = "● Not Connected";
  }
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
    btn.classList.remove("connected");
  }
  if (btnText) btnText.textContent = "Connect Google Drive Account";
  if (errorEl) errorEl.classList.add("hidden");
}

function setDetailsEnabled(enabled) {
  const section = document.getElementById("pf-details-section");
  const inputs = section.querySelectorAll("input, select, textarea");

  if (enabled) {
    section.style.opacity = "1";
    section.style.pointerEvents = "all";
    section.style.filter = "none";
    inputs.forEach(inp => inp.disabled = false);
  } else {
    section.style.opacity = "0.4";
    section.style.pointerEvents = "none";
    section.style.filter = "grayscale(0.5)";
    inputs.forEach(inp => inp.disabled = true);
  }
}

// ── DRIVE AUTH HANDLER ──
async function connectDriveForProfile() {
  const btn = document.getElementById("pf-connect-drive-btn");
  const btnText = document.getElementById("pf-connect-drive-text");
  const errorEl = document.getElementById("pf-drive-error");

  btn.disabled = true;
  btnText.textContent = "Connecting...";
  errorEl.classList.add("hidden");

  try {
    // Wait up to 8s for GIS to initialize
    await waitForGoogleDriveReady();

    await promptDriveAuth();

    // Success!
    pfDriveConnected = true;

    // Update UI
    const statusEl = document.getElementById("pf-drive-status");
    statusEl.className = "drive-status-chip connected";
    statusEl.textContent = "● Connected";

    btn.classList.add("connected");
    btnText.textContent = "✓ Google Drive Connected";

    // Enable details section
    setDetailsEnabled(true);

    // Enable save button
    const saveBtn = document.getElementById("pf-save-btn");
    saveBtn.disabled = false;
    saveBtn.style.opacity = "1";
    saveBtn.style.cursor = "pointer";
    document.getElementById("pf-save-btn-text").textContent = profFormMode === "add" ? "Create Profile" : "Save Changes";

    showToast("Google Drive connected successfully");

  } catch (err) {
    console.error("Drive auth failed:", err);
    btn.disabled = false;
    btnText.textContent = "Connect Google Drive Account";

    // Output helpful instructions directly targeting origin errors inside the error box
    const currentOrigin = window.location.origin;
    errorEl.innerHTML = `Connection failed.<br><br>
      <span style="color:var(--text); font-weight:600;">Configuration Notice:</span><br>
      Ensure the following domain is added to <strong>Authorized JavaScript Origins</strong> in your <a href="https://console.cloud.google.com/" target="_blank" style="color:var(--gold);text-decoration:underline;">Google Cloud Console</a> credential settings:<br>
      <strong style="color:var(--gold); font-family:monospace; background:rgba(0,0,0,0.25); padding:4px 8px; border-radius:4px; display:inline-block; margin:6px 0;">${currentOrigin}</strong>`;
    errorEl.classList.remove("hidden");
    showToast("Drive connection failed", "error");
  }
}

// ── PHOTO UPLOAD ──
let pfPhotoDataUrl = null;

function resetPhotoUpload() {
  pfPhotoDataUrl = null;
  const input = document.getElementById("pf-photo-input");
  if (input) input.value = "";
  const dropzone = document.getElementById("pf-photo-dropzone");
  const previewWrap = document.getElementById("pf-photo-preview-wrap");
  const initialsWrap = document.getElementById("pf-photo-initials-wrap");
  if (dropzone) dropzone.style.display = "block";
  if (previewWrap) previewWrap.style.display = "none";
  if (initialsWrap) initialsWrap.style.display = "flex";
}

function showPhotoPreview(dataUrl) {
  const dropzone = document.getElementById("pf-photo-dropzone");
  const previewWrap = document.getElementById("pf-photo-preview-wrap");
  const initialsWrap = document.getElementById("pf-photo-initials-wrap");
  const img = document.getElementById("pf-photo-preview-img");
  if (dropzone) dropzone.style.display = "none";
  if (previewWrap) { previewWrap.style.display = "flex"; }
  if (initialsWrap) initialsWrap.style.display = "none";
  if (img) img.src = dataUrl;
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast("Photo must be under 2MB", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    pfPhotoDataUrl = e.target.result;
    showPhotoPreview(pfPhotoDataUrl);
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  pfPhotoDataUrl = null;
  const input = document.getElementById("pf-photo-input");
  if (input) input.value = "";
  resetPhotoUpload();
  updateAvatarPreview();
}

function updateAvatarPreview() {
  const name=document.getElementById("pf-name")?.value||"Preview";
  const role=document.getElementById("pf-role")?.value||"Role";

  // Update initials preview
  const av=document.getElementById("pf-avatar-preview");
  if (av) av.textContent=initials(name);

  const namePreviewInitials = document.getElementById("pf-name-preview-initials");
  const rolePreviewInitials = document.getElementById("pf-role-preview-initials");
  if (namePreviewInitials) namePreviewInitials.textContent=name==="Preview"?"Attorney Name":name;
  if (rolePreviewInitials) rolePreviewInitials.textContent=role==="Role"?"Role":role;

  // Also update name/role in the photo preview if visible
  const namePreview = document.getElementById("pf-name-preview");
  const rolePreview = document.getElementById("pf-role-preview");
  if (namePreview) namePreview.textContent=name==="Preview"?"Attorney Name":name;
  if (rolePreview) rolePreview.textContent=role==="Role"?"Role":role;
}

// Bind input listeners (only once)
function bindProfileInputs() {
  const nameInp = document.getElementById("pf-name");
  const roleInp = document.getElementById("pf-role");
  if (nameInp && !nameInp._bound) {
    nameInp.oninput = updateAvatarPreview;
    nameInp._bound = true;
  }
  if (roleInp && !roleInp._bound) {
    roleInp.oninput = updateAvatarPreview;
    roleInp._bound = true;
  }
}

function clearProfileErrors() {
  ["pf-name-err","pf-role-err","pf-drive-error"].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  ["pf-name","pf-role"].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.classList.remove("err");
  });
}

async function saveProfile() {
  // Validate Drive connection for new profiles - fully optional to bypass domain changes
  if (profFormMode === "add" && !pfDriveConnected) {
    const proceed = confirm(
      "Google Drive is not connected.\n\nYou can still create this profile, but folder creation and automated document uploading features will be disabled for this attorney.\n\nDo you want to proceed without Google Drive?"
    );
    if (!proceed) return;
  }

  const name=document.getElementById("pf-name").value.trim();
  const role=document.getElementById("pf-role").value.trim();
  let valid=true;
  if(!name){document.getElementById("pf-name-err").classList.remove("hidden");document.getElementById("pf-name").classList.add("err");valid=false;}
  if(!role){document.getElementById("pf-role-err").classList.remove("hidden");document.getElementById("pf-role").classList.add("err");valid=false;}
  if(!valid) return;

  const data={
    name, role,
    contact: document.getElementById("pf-contact").value.trim(),
    email: document.getElementById("pf-email").value.trim(),
    avatarColor: pfColor,
    photoDataUrl: null  // never store base64 in Firestore
  };

  try {
    if(profFormMode==="add"){
      data.createdAt = new Date().toISOString(); // full ISO for Firestore orderBy
      const np = await dbAddProfile(data);
      selProfile = np;

      // Refresh profiles view to hide New Attorney button
      renderProfiles();

      // Auto-create Drive folder now if connected
      if (pfDriveConnected) {
        showToast("Creating Drive folder...");
        const folderId = await createDriveFolder(`Simando Law — ${np.name}`, DRIVE_FOLDER_ID || null);
        if (folderId) {
          await dbUpdateProfile(np.id, { driveFolderId: folderId });
          np.driveFolderId = folderId;
          showToast("Drive folder created!");
        }

        // Upload profile photo to Drive if provided
        if (pfPhotoDataUrl && np.driveFolderId) {
          try {
            showToast("Uploading profile photo...");
            const { fileId, thumbnailUrl } = await uploadProfilePhotoToDrive(pfPhotoDataUrl, np.driveFolderId, np.name);
            await dbUpdateProfile(np.id, { photoFileId: fileId, photoUrl: thumbnailUrl });
            np.photoFileId = fileId;
            np.photoUrl = thumbnailUrl;
            showToast("Profile photo saved!");
          } catch (photoErr) {
            console.error("Photo upload error:", photoErr);
            showToast("Profile created, but photo upload failed: " + photoErr.message, "error");
          }
        }
      }

      showToast("Profile created successfully!");
      renderProfiles();
      navTo("profiles");
    } else {
      // Edit mode — handle photo changes
      if (pfPhotoDataUrl && pfPhotoDataUrl.startsWith("data:")) {
        // New photo selected — upload it
        try {
          showToast("Uploading profile photo...");
          const folderId = selProfile.driveFolderId;
          // Delete old photo from Drive if exists
          if (selProfile.photoFileId && hasValidToken()) {
            await deleteDriveFile(selProfile.photoFileId).catch(() => {});
          }
          const { fileId, thumbnailUrl } = await uploadProfilePhotoToDrive(pfPhotoDataUrl, folderId, name);
          data.photoFileId = fileId;
          data.photoUrl = thumbnailUrl;
          showToast("Profile photo updated!");
        } catch (photoErr) {
          console.error("Photo upload error:", photoErr);
          showToast("Photo upload failed: " + photoErr.message, "error");
        }
      } else if (!pfPhotoDataUrl && selProfile.photoFileId) {
        // Photo was removed
        if (hasValidToken()) await deleteDriveFile(selProfile.photoFileId).catch(() => {});
        data.photoFileId = null;
        data.photoUrl = null;
      } else {
        // Photo unchanged — keep existing
        data.photoFileId = selProfile.photoFileId || null;
        data.photoUrl = selProfile.photoUrl || null;
      }

      await dbUpdateProfile(selProfile.id, data);
      selProfile = {...selProfile, ...data};
      showToast("Profile updated!");
      showView("profileDetail");
      renderProfileDetail();
    }
    renderQuickAccess();
  } catch (err) {
    console.error("saveProfile error:", err);
    showToast("Failed to save profile: " + (err.message || "Unknown error"), "error");
  }
}

async function createProfileFolderManual() {
  if (!selProfile) return;
  if (!selProfile.driveFolderId && accessToken) {
    showToast("Creating Drive folder...");
    const folderId = await createDriveFolder(`Simando Law — ${selProfile.name}`, DRIVE_FOLDER_ID || null);
    if (folderId) {
      await dbUpdateProfile(selProfile.id, { driveFolderId: folderId });
      selProfile.driveFolderId = folderId;
      showToast("Drive folder created!");
      renderProfileDetail();
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// ── Category → Party labels ──
function updatePartyLabels() {
  const cat = (document.getElementById("cf-category")?.value || "").toLowerCase();
  const labels = getPartyLabels(cat);
  const ll = document.getElementById("cf-label-left");
  const lr = document.getElementById("cf-label-right");
  if (ll) ll.textContent = labels.left + "s";
  if (lr) lr.textContent = labels.right + "s";
  // Update error message
  const errEl = document.getElementById("cf-parties-err");
  if (errEl) errEl.textContent = `Add at least one ${labels.left} and one ${labels.right}`;
  // Update placeholder text on inputs
  const pi = document.getElementById("cf-petitioner-input");
  const ri = document.getElementById("cf-respondent-input");
  if (pi) pi.placeholder = labels.left + " name…";
  if (ri) ri.placeholder = labels.right + " name…";
}

function onCategoryChange() {
  updatePartyLabels();
}

// ── Case Type autocomplete ──
let _caseTypeSuggestActive = -1;

function onCaseTypeInput(input) {
  const val = input.value.trim().toLowerCase();
  const box = document.getElementById("cf-type-suggestions");
  if (!val) { box.style.display="none"; return; }
  const matches = caseTypesList.filter(t => t.toLowerCase().includes(val));
  if (!matches.length) { box.style.display="none"; return; }
  _caseTypeSuggestActive = -1;
  box.innerHTML = matches.map((t,i) =>
    `<div class="ct-suggestion" data-idx="${i}" data-val="${t}"
      style="padding:10px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border);transition:background 0.1s"
      onmousedown="selectCaseTypeSuggestion('${t.replace(/'/g,"&#39;")}')"
      onmouseover="this.style.background='var(--surface2)'"
      onmouseout="this.style.background=''">${t}</div>`
  ).join("");
  box.style.display = "block";
}

function selectCaseTypeSuggestion(val) {
  document.getElementById("cf-type-input").value = val;
  document.getElementById("cf-type-suggestions").style.display = "none";
}

function hideCaseTypeSuggestions() {
  setTimeout(()=>{ const b=document.getElementById("cf-type-suggestions"); if(b) b.style.display="none"; }, 150);
}

function onCaseTypeKeydown(e) {
  const box = document.getElementById("cf-type-suggestions");
  const items = box ? box.querySelectorAll(".ct-suggestion") : [];
  if (!items.length || box.style.display==="none") return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    _caseTypeSuggestActive = Math.min(_caseTypeSuggestActive+1, items.length-1);
    items.forEach((el,i)=>{ el.style.background = i===_caseTypeSuggestActive ? "var(--surface2)" : ""; });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    _caseTypeSuggestActive = Math.max(_caseTypeSuggestActive-1, 0);
    items.forEach((el,i)=>{ el.style.background = i===_caseTypeSuggestActive ? "var(--surface2)" : ""; });
  } else if (e.key === "Enter" && _caseTypeSuggestActive >= 0) {
    e.preventDefault();
    selectCaseTypeSuggestion(items[_caseTypeSuggestActive].dataset.val);
  } else if (e.key === "Escape") {
    box.style.display = "none";
  }
}

//  CASE FORM
// ═══════════════════════════════════════════════════════════════

// ── Party Builder state ──
let cfPetitioners = [];
let cfRespondents = [];

function addParty(role) {
  const inputId = role === "petitioner" ? "cf-petitioner-input" : "cf-respondent-input";
  const input = document.getElementById(inputId);
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  if (role === "petitioner") { cfPetitioners.push(name); }
  else                       { cfRespondents.push(name); }
  input.value = "";
  input.focus();
  renderPartyLists();
  serializeParties();
}

function removeParty(role, idx) {
  if (role === "petitioner") cfPetitioners.splice(idx, 1);
  else                       cfRespondents.splice(idx, 1);
  renderPartyLists();
  serializeParties();
}

function renderPartyLists() {
  const chipStyle = (color, bg) =>
    `display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:500;background:${bg};border:1px solid ${color};color:${color};margin-bottom:6px;margin-right:4px`;
  const removeBtn = (role, i) =>
    `<button type="button" onclick="removeParty('${role}',${i})" style="background:none;border:none;cursor:pointer;padding:0;line-height:1;font-size:14px;opacity:0.6" title="Remove">×</button>`;

  document.getElementById("cf-petitioners-list").innerHTML =
    cfPetitioners.length === 0
      ? `<div style="font-size:12px;color:var(--text-dim);font-style:italic;padding:2px 0">None added yet</div>`
      : cfPetitioners.map((n,i) => `<span style="${chipStyle("var(--gold)","rgba(201,165,92,0.1)")}">${n} ${removeBtn("petitioner",i)}</span>`).join("");

  document.getElementById("cf-respondents-list").innerHTML =
    cfRespondents.length === 0
      ? `<div style="font-size:12px;color:var(--text-dim);font-style:italic;padding:2px 0">None added yet</div>`
      : cfRespondents.map((n,i) => `<span style="${chipStyle("var(--violet)","rgba(129,140,248,0.1)")}">${n} ${removeBtn("respondent",i)}</span>`).join("");
}

function serializeParties() {
  // Build the parties string using the current party labels
  const cat = document.getElementById("cf-category")?.value || "";
  const labels = getPartyLabels(cat.toLowerCase());
  const parts = [];
  if (cfPetitioners.length) parts.push(labels.left + ": " + cfPetitioners.join(", "));
  if (cfRespondents.length) parts.push(labels.right + ": " + cfRespondents.join(", "));
  document.getElementById("cf-parties").value = parts.join(" | ");
}

function parsePartiesString(str) {
  // Parse stored string back into arrays — handles all label variants
  cfPetitioners = [];
  cfRespondents = [];
  if (!str) return;
  const leftLabels = ["petitioner", "plaintiff", "private complainant"];
  const rightLabels = ["respondent", "defendant", "accused"];
  str.split("|").forEach(seg => {
    seg = seg.trim();
    const lower = seg.toLowerCase();
    const colonIdx = seg.indexOf(":");
    if (colonIdx < 0) { cfRespondents = [seg]; return; }
    const label = lower.slice(0, colonIdx).trim();
    const names = seg.slice(colonIdx+1).split(",").map(s=>s.trim()).filter(Boolean);
    if (leftLabels.some(l => label.startsWith(l))) {
      cfPetitioners = names;
    } else if (rightLabels.some(l => label.startsWith(l))) {
      cfRespondents = names;
    } else {
      cfRespondents = names; // fallback
    }
  });
}

// ── Venue helpers ──
function onVenueChange(sel) {
  const manual = document.getElementById("cf-venue-manual");
  if (sel.value === "Other (specify)") {
    manual.style.display = "block";
    manual.required = true;
    manual.focus();
  } else {
    manual.style.display = "none";
    manual.required = false;
    manual.value = "";
  }
}

function getVenueValue() {
  const sel = document.getElementById("cf-venue");
  if (sel.value === "Other (specify)") {
    return document.getElementById("cf-venue-manual").value.trim() || "Other";
  }
  return sel.value;
}

function setVenueValue(val) {
  const sel = document.getElementById("cf-venue");
  const manual = document.getElementById("cf-venue-manual");
  const match = VENUES.find(v => v === val);
  if (match) {
    sel.value = match;
    manual.style.display = "none";
  } else if (val) {
    sel.value = "Other (specify)";
    manual.style.display = "block";
    manual.value = val;
  }
}

function populateCaseSelects() {
  document.getElementById("cf-category").innerHTML=CASE_CATEGORIES.map(t=>`<option>${t}</option>`).join("");
  document.getElementById("cf-status").innerHTML=STATUS_OPTIONS.map(t=>`<option>${t}</option>`).join("");
  document.getElementById("cf-venue").innerHTML=VENUES.map(v=>`<option>${v}</option>`).join("");
  updatePartyLabels();
}

function openAddCase() {
  if (!selProfile) return;
  caseFormMode="add";
  pendingDocs=[];
  cfPetitioners = selProfile.name ? [selProfile.name] : [];
  cfRespondents = [];
  populateCaseSelects();
  document.getElementById("cf-title").textContent="New Case";
  document.getElementById("cf-save-btn").textContent="Add Case";
  document.getElementById("cf-case-title").value="";
  document.getElementById("cf-narrative").value="";
  document.getElementById("cf-due").value="";
  document.getElementById("cf-category").value=CASE_CATEGORIES[0];
  document.getElementById("cf-type-input").value="";
  document.getElementById("cf-status").value=STATUS_OPTIONS[0];
  setVenueValue(VENUES[0]);
  document.getElementById("drive-status").textContent="";
  document.getElementById("cf-back-btn").onclick=()=>{ showView("profileDetail"); renderProfileDetail(); };
  document.getElementById("cf-cancel-btn").onclick=()=>{ showView("profileDetail"); renderProfileDetail(); };
  renderPartyLists();
  serializeParties();
  renderPendingDocs();
  clearCaseErrors();
  updateCfChip();
  updateDriveFolderChip();
  showView("caseForm");
}

function openEditCase() {
  const c=selCase;
  caseFormMode="edit";
  pendingDocs=[...(c.documents||[])];
  parsePartiesString(c.parties);
  populateCaseSelects();
  document.getElementById("cf-title").textContent="Edit Case";
  document.getElementById("cf-save-btn").textContent="Save Changes";
  document.getElementById("cf-case-title").value=c.title;
  document.getElementById("cf-narrative").value=c.narrative;
  document.getElementById("cf-due").value=c.dueDate;
  document.getElementById("cf-category").value=c.category||CASE_CATEGORIES[0];
  document.getElementById("cf-type-input").value=c.caseType||c.type||"";
  document.getElementById("cf-status").value=c.status;
  updatePartyLabels(); // refresh labels after category is set
  setVenueValue(c.venue);
  document.getElementById("drive-status").textContent=pendingDocs.length?`${pendingDocs.length} file(s)`:"";
  document.getElementById("cf-back-btn").onclick=()=>{ showView("caseDetail"); renderCaseDetail(); };
  document.getElementById("cf-cancel-btn").onclick=()=>{ showView("caseDetail"); renderCaseDetail(); };
  renderPartyLists();
  serializeParties();
  renderPendingDocs();
  clearCaseErrors();
  updateCfChip();
  updateDriveFolderChip();
  showView("caseForm");
}

function updateCfChip() {
  const chip=document.getElementById("cf-profile-chip");
  if(selProfile){
    chip.innerHTML=`${avatarDiv(selProfile.name,selProfile.avatarColor,24,selProfile.photoUrl)}<span style="font-size:13px;color:var(--text-muted)">${selProfile.name}</span>`;
    chip.style.display="flex";
  } else chip.style.display="none";
}

function clearCaseErrors() {
  ["cf-title-err","cf-due-err","cf-parties-err","cf-narrative-err"].forEach(id=>{document.getElementById(id).classList.add("hidden");});
  ["cf-case-title","cf-due","cf-narrative"].forEach(id=>{document.getElementById(id).classList.remove("err");});
}

async function saveCase() {
  serializeParties(); // make sure hidden field is current
  const title=document.getElementById("cf-case-title").value.trim();
  const due=document.getElementById("cf-due").value;
  const parties=document.getElementById("cf-parties").value.trim();
  const narrative=document.getElementById("cf-narrative").value.trim();
  let valid=true;
  if(!title){document.getElementById("cf-title-err").classList.remove("hidden");document.getElementById("cf-case-title").classList.add("err");valid=false;}
  if(!due){document.getElementById("cf-due-err").classList.remove("hidden");document.getElementById("cf-due").classList.add("err");valid=false;}
  if(cfPetitioners.length===0||cfRespondents.length===0){document.getElementById("cf-parties-err").classList.remove("hidden");valid=false;}
  if(!narrative){document.getElementById("cf-narrative-err").classList.remove("hidden");document.getElementById("cf-narrative").classList.add("err");valid=false;}
  if(!valid) return;

  const data={
    title,dueDate:due,parties,narrative,
    category:document.getElementById("cf-category").value,
    caseType:document.getElementById("cf-type-input").value.trim(),
    type:document.getElementById("cf-category").value, // keep legacy field in sync for Drive folder logic
    status:document.getElementById("cf-status").value,
    venue:getVenueValue(),
    documents:pendingDocs,
  };
  const ct = document.getElementById("cf-type-input").value.trim();
  if (ct) dbAddCaseType(ct);
  try {
    const caseType = data.category;
    const profileFolderId = selProfile?.driveFolderId || null;
    const hadLocalFiles = pendingDocs.some(d => d._localTempId);
    if (typeof syncPendingFilesToDrive === "function") {
      const syncedDocs = await syncPendingFilesToDrive(caseType, profileFolderId);
      data.documents = syncedDocs.map(d => {
        const clean = {...d};
        delete clean._localTempId; // don't persist temp markers
        return clean;
      });
      const stillLocal = data.documents.some(d => !d.driveFileId && d.name);
      if (hadLocalFiles && stillLocal) {
        showToast("Case saved — Drive session expired. Re-connect Drive to upload files.", "error");
      }
    }
    if(caseFormMode==="add"){
      data.profileId=selProfile.id;
      data.createdAt=new Date().toISOString(); // full ISO for Firestore orderBy
      await dbAddCase(data);
      showToast("Case added!");
      showView("profileDetail");
      renderProfileDetail();
    } else {
      await dbUpdateCase(selCase.id,data);
      selCase={...selCase,...data};
      showToast("Case updated!");
      showView("caseDetail");
      renderCaseDetail();
    }
    pendingDocs=[];
  } catch (err) {
    console.error("saveCase error:", err);
    showToast("Failed to save case: " + (err.message || "Unknown error"), "error");
  }
}

// ═══════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════
async function doLogout() {
  if (window._auth && window._fbSignOut) await window._fbSignOut(window._auth);
  window.location.replace("login.html");
}

function enterLocalMode(reason) {
  localMode = true;
  const banner = document.getElementById("config-banner");
  if (banner) {
    banner.textContent = "⚠️ " + (reason || "Firebase not connected. Data is stored in memory only and will be lost on refresh.");
    banner.classList.add("show");
  }
  showToast("Running in local mode — data will not persist", "error");
}

function initAppUI() {
  const loader = document.getElementById("loading-screen");
  if (loader) loader.style.display = "none";
  initTheme();
  bindProfileInputs();
  showView("dashboard");
  renderDashboard();
  if (window._auth && window._fbOnAuth) {
    window._fbOnAuth(window._auth, async user => {
      if (!user) { window.location.replace("login.html"); return; }
      const nameEl   = document.getElementById("auth-user-display");
      const avatarEl = document.getElementById("auth-avatar");
      const name = user.displayName || user.email || "";
      if (nameEl)   nameEl.textContent = name;
      if (avatarEl) avatarEl.textContent = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "U";
      try {
        if (window._db) {
          const snap = await window._fbGetDocs(
            window._fbQuery(window._fbCol(window._db,"allowedUsers"), window._fbWhere("uid","==",user.uid))
          );
          if (!snap.empty && snap.docs[0].data().role === "admin") {
            const al = document.getElementById("admin-link");
            if (al) al.style.display = "block";
          }
        }
      } catch(e) { /* non-critical */ }
    });
  }
}

async function connectDatabase() {
  if (typeof window._fbReady !== "undefined" && window._fbReady && window._db) {
    localMode = false;
    const banner = document.getElementById("config-banner");
    if (banner) banner.classList.remove("show");
    try {
      // Wait for Firebase Auth to resolve before loading data.
      // This fixes the "No current user UID available" race condition.
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Auth timeout")), 10000);
        const unsub = window._fbOnAuth(window._auth, user => {
          clearTimeout(timeout);
          unsub();
          if (user) {
            window._currentUser = user;
            const el = document.getElementById("auth-user-display");
            if (el) el.textContent = user.displayName || user.email;
            resolve(user);
          } else {
            window.location.replace("login.html");
            reject(new Error("Not authenticated"));
          }
        });
      });
      await dbLoad();
      await showOnboardingIfNeeded();
    } catch (err) {
      if (err.message === "Not authenticated") return;
      console.error("Database load failed:", err);
      enterLocalMode("Database connection failed.");
    }
  } else {
    enterLocalMode("Firebase initialization failed.");
  }
}

let uiBooted = false;
let dbConnected = false;

// ═══════════════════════════════════════════════════════════════
//  ONBOARDING FLOW
// ═══════════════════════════════════════════════════════════════
let onbColor = AVATAR_COLORS[0];
let onbDriveConnected = false;

function selectOnboardColor(color) {
  onbColor = color;
  document.querySelectorAll('[id^="onb-color-"]').forEach(btn => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = 'none';
  });
  const selectedIdx = AVATAR_COLORS.indexOf(color);
  if (selectedIdx >= 0) {
    const selectedBtn = document.getElementById(`onb-color-${selectedIdx}`);
    if (selectedBtn) {
      selectedBtn.style.transform = 'scale(1.1)';
      selectedBtn.style.boxShadow = `0 0 0 3px rgba(201,165,92,0.4)`;
    }
  }
}

async function connectDriveForOnboarding() {
  const btn = document.getElementById("onb-drive-btn");
  const statusEl = document.getElementById("onb-drive-status");
  const errorEl = document.getElementById("onb-drive-err");

  btn.disabled = true;
  btn.textContent = "Connecting...";
  errorEl.classList.add("hidden");

  try {
    await waitForGoogleDriveReady();
    await promptDriveAuth();

    onbDriveConnected = true;
    statusEl.className = "drive-status-chip connected";
    statusEl.textContent = "● Connected";
    btn.textContent = "✓ Google Drive Connected";
    btn.disabled = true;
    btn.style.opacity = "0.7";

  } catch(e) {
    console.error("Drive connection failed:", e);
    onbDriveConnected = false;
    btn.disabled = false;
    btn.textContent = "Connect Google Drive";
    errorEl.textContent = "Failed to connect. Please try again.";
    errorEl.classList.remove("hidden");
  }
}

function clearOnboardErrors() {
  document.getElementById("onb-name-err").classList.add("hidden");
  document.getElementById("onb-role-err").classList.add("hidden");
  document.getElementById("onb-drive-err").classList.add("hidden");
}

function showOnboardError(fieldId, msg) {
  const errEl = document.getElementById(fieldId);
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  }
}

async function completeOnboarding() {
  clearOnboardErrors();

  const name = document.getElementById("onb-name").value.trim();
  const role = document.getElementById("onb-role").value.trim();
  const email = document.getElementById("onb-email").value.trim();
  const contact = document.getElementById("onb-contact").value.trim();

  let valid = true;

  if (!name) {
    showOnboardError("onb-name-err", "Attorney name is required");
    valid = false;
  }
  if (!role) {
    showOnboardError("onb-role-err", "Specialization/role is required");
    valid = false;
  }

  if (!valid) return;

  const btn = document.getElementById("onb-complete-btn");
  btn.disabled = true;
  btn.textContent = "Creating...";

  try {
    const profileData = {
      name,
      role,
      email,
      contact,
      avatarColor: onbColor,
      createdAt: new Date().toISOString(),
      ownerUid: window._currentUser?.uid,
      driveFolderId: window._driveRootFolderId || null
    };

    await dbAddProfile(profileData);
    closeOnboardingModal();

    showToast("Profile created successfully!", "success");
    navTo("profiles");
    renderProfiles();

  } catch(e) {
    console.error("Error creating profile:", e);
    btn.disabled = false;
    btn.textContent = "Create Profile";
    showToast("Failed to create profile. Please try again.", "error");
  }
}

function closeOnboardingModal() {
  const modal = document.getElementById("onboarding-modal");
  if (modal) modal.classList.add("hidden");
}

function logoutOnboardCancel() {
  if (confirm("Skip setup? You can always set up your profile later from the Attorney profiles section.")) {
    closeOnboardingModal();
    showView("dashboard");
  }
}

async function showOnboardingIfNeeded() {
  if (!window._db || !window._currentUser) return;

  try {
    const needsOnboarding = await checkNeedsOnboarding();
    if (needsOnboarding) {
      document.getElementById("onb-name").value = "";
      document.getElementById("onb-role").value = "";
      document.getElementById("onb-email").value = "";
      document.getElementById("onb-contact").value = "";
      onbColor = AVATAR_COLORS[0];
      onbDriveConnected = false;

      const statusEl = document.getElementById("onb-drive-status");
      const btn = document.getElementById("onb-drive-btn");
      statusEl.className = "drive-status-chip disconnected";
      statusEl.textContent = "● Not Connected";
      btn.disabled = false;
      btn.textContent = "Connect Google Drive";
      btn.style.opacity = "1";

      selectOnboardColor(AVATAR_COLORS[0]);

      const modal = document.getElementById("onboarding-modal");
      if (modal) modal.classList.remove("hidden");
    }
  } catch(e) {
    console.error("Error checking onboarding status:", e);
  }
}

document.addEventListener("firebase-ready", () => {
  if (!uiBooted) {
    uiBooted = true;
    initAppUI();
  }
  if (!dbConnected) {
    dbConnected = true;
    connectDatabase();
  }
});

setTimeout(() => {
  if (!uiBooted) {
    uiBooted = true;
    initAppUI();
  }
}, 2000);

setTimeout(() => {
  if (!dbConnected) {
    dbConnected = true;
    enterLocalMode("Firebase failed to load. Check your config and network.");
  }
}, 6000);