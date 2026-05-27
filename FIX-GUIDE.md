# Simando Law — Fix Guide

## Issue 1 · You keep having to add Vercel domains

**Root cause:** Firebase Auth and Google OAuth both require your domain to be whitelisted.
You only need to do this ONCE for your permanent domain.

### Step A — Firebase Console
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → your **simando** project
2. Left menu → **Authentication** → **Settings** tab → **Authorized domains**
3. Click **Add domain** → enter: `juridicasimando.vercel.app`
4. Save.

### Step B — Google Cloud Console (for Google Drive / OAuth)
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → your project
2. Left menu → **APIs & Services** → **Credentials**
3. Click your **OAuth 2.0 Client ID**
4. Under **Authorized JavaScript origins**, add: `https://juridicasimando.vercel.app`
5. Under **Authorized redirect URIs**, add: `https://juridicasimando.vercel.app`
6. Click **Save**.

> ⚠️ Do NOT use Vercel **preview** URLs (like `simando-law-git-main-xxx.vercel.app`).
> Always deploy to production so it uses `juridicasimando.vercel.app`.

---

## Issue 2 · Attorney list not showing

**Root cause:** Two possible causes:
1. Firestore `orderBy("createdAt")` fails if any profile is missing `createdAt` — the whole list goes blank.
2. Firestore security rules may be blocking reads.

**Fixes applied in the updated code:**
- `data.js` now falls back to an unordered load if the sorted query fails.
- `createdAt` now saves as a full ISO string (`2024-01-15T10:30:00.000Z`) instead of just a date (`2024-01-15`), which sorts correctly.
- New `firestore.rules` (see below) explicitly allows all logged-in users to read profiles.

---

## Issue 3 · Attorney name not saved after re-login

**Root cause:** Firestore security rules were likely blocking reads on the `profiles` collection
for users who didn't own the profile — so when `dbLoad()` ran after login, it either
failed silently or returned nothing.

**Fix:** Deploy the included `firestore.rules` file.

### How to deploy Firestore rules
**Option A — Firebase Console (easiest):**
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Firestore Database**
2. Click the **Rules** tab
3. Replace all the content with the contents of `firestore.rules`
4. Click **Publish**

**Option B — Firebase CLI:**
```bash
firebase deploy --only firestore:rules
```

---

## Summary of what changed in the code

| File | What changed |
|------|-------------|
| `js/data.js` | `dbLoad()` now has a fallback if `orderBy` fails. `dbAddProfile()` always sets `createdAt` as a full ISO string. |
| `js/app.js` | `saveProfile()` now saves `createdAt` as full ISO string (not just date). |
| `firestore.rules` | **NEW FILE** — proper security rules: all logged-in users can read profiles; only owners can write. |

After deploying the rules and whitelisting your domain once, all three issues should be resolved.
