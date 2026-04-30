# Instagram Connection Failure Runbook

> Use this runbook **before changing code** when the Instagram/Meta connection is "implemented but failing".

---

## 1. Capture Exact Evidence (Frontend + Backend)

- Browser console error (full message, error code/type, failing domain)
- Network entries for:
  - `https://connect.facebook.net/.../sdk.js`
  - Facebook popup/login requests
  - tRPC call to `instagram.saveToken`
- Backend logs for `instagram-router` / `instagram-service` (`save_token_failed`, token exchange failures)
- Meta error payload (`error.code`, `error_subcode`, `fbtrace_id`) if present

---

## 2. Determine Which Auth Flow Is Active (Critical)

NeonDash currently has **two Instagram auth flows**:

1. **JS SDK flow (frontend-first)**
   `apps/web/src/components/instagram/*` → `use-facebook-sdk.ts` → `trpc.instagram.saveToken`
2. **Server OAuth callback flow (redirect-based)**
   `instagramService.getAuthUrl()` → `/api/instagram/callback` → `mentorados.instagramCallback`

> If debugging a "JavaScript connection failure", prioritize the **JS SDK flow** first. Do not apply redirect-only fixes until you confirm the JS SDK is not the failing path.

---

## 3. High-Probability Root Causes in NeonDash (Ranked)

> **Before assuming dashboard misconfiguration:** Verify the Meta Developer Dashboard
> settings first (App Domains, Allowed JS SDK Domains, Valid OAuth Redirect URIs).
> `status === "unknown"` from `FB.login()` does NOT exclusively mean "domain not authorized"
> — it fires for multiple unrelated reasons. See #1 below.

### 1. `status === "unknown"` — Misleading Error, Multiple Real Causes

- `FB.login()` returns `status === "unknown"` for: popup blocked by browser, third-party cookies blocked (Chrome v120+ default), user not logged into Facebook in current browser
- **The error message "Domínio não autorizado" is WRONG for this status** — it only applies when the domain is genuinely missing from the dashboard
- Fix: check dashboard first; if correct, use `directAuthUrl` server-side OAuth fallback

### 2. Bug: `directAuthUrl` Fallback Unreachable After `status === "unknown"`

- Symptom: user gets "domain" error even though dashboard is correct; fallback never activates
- Root cause: early `return` inside `if (status === "unknown")` block fires before `if (directAuthUrl)` check
- Fix: move `directAuthUrl` check BEFORE the `status === "unknown"` early return:

```typescript
if (!accessToken) {
  if (loginResponse.status === "not_authorized") { /* ... */ return; }

  // ✅ Redirect fallback FIRST — covers popup-blocked and cookie issues
  if (directAuthUrl) {
    window.location.assign(directAuthUrl);
    return;
  }

  if (loginResponse.status === "unknown") {
    // Show accurate error: popup blocked / not logged into Facebook
    return;
  }
}
```

### 3. JSSDK Host Domain Not Whitelisted (Only if Error Is Confirmed as Domain Issue)

- Symptom: `JSSDK Unknown Host domain` in browser console
- Fix: add all real hosts to "Allowed Domains for JavaScript SDK" and "App Domains":
  - `localhost`
  - staging host
  - production host

### 4. HTTPS Requirement Not Met

- Symptom: popup/login blocked or silent failure in HTTP environments
- Meta requires HTTPS for JS SDK auth actions on real domains.

### 5. Frontend/Backend Graph API Version Drift

- Backend reads `META_GRAPH_API_VERSION`; frontend hook hardcodes `v24.0`.
- Upgrade one side only → inconsistent behavior.

### 6. Redirect URI Mismatch (Only If Redirect Flow Is Used)

- Check `INSTAGRAM_REDIRECT_URI` vs Meta "Valid OAuth Redirect URIs".
- Watch trailing slash and host mismatch (`staging` vs `production`).

### 7. Token Exchange Succeeds but Account Discovery Fails

- Frontend currently reads only the **first** page from `/me/accounts`.
- If the first page has no linked Instagram Business account, UI reports failure even when another page is valid.

---

## 4. Hardening Tasks After Root Cause Is Fixed

- Add structured error logging for SDK login, `/me/accounts`, and `saveToken`
- Normalize and reuse a single Instagram auth flow (preferred: choose one flow and deprecate the other)
- Align JS SDK version with backend Graph version via shared env/config
- Validate `saveToken` authorization (ensure user can only connect allowed `mentoradoId`)
- Keep token refresh path tested (`exchangeForLongLivedToken` + `refreshAccessToken`)

---

## 5. NeonDash-Specific Env Guidance (Vite + Hono)

- **Frontend public vars:** `VITE_*` (for example `VITE_META_APP_ID`)
- **Server secrets:** no `VITE_` prefix (`META_APP_SECRET`, `INSTAGRAM_APP_SECRET`, etc.)
- Never expose App Secret in frontend bundle
- `INSTAGRAM_REDIRECT_URI` is required for redirect-based flow and must match Meta dashboard exactly
