# Google Ads OAuth Flow

Google Ads OAuth is **separate** from Meta OAuth.

---

## Google Cloud Console Setup

1. Create a dedicated Google Cloud Console project
2. Enable the `Google Ads API` in the API Library
3. Create OAuth 2.0 credentials:
   - Application type: `Web application`
   - Add authorized redirect URI: `/api/google-ads/callback` (all valid domains — production, staging, localhost)
4. Copy `Client ID` and `Client Secret` to environment variables

**Required environment variables:**

| Variable | Description |
|----------|-------------|
| `GOOGLE_ADS_CLIENT_ID` | OAuth 2.0 client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | OAuth 2.0 client secret |
| `GOOGLE_ADS_REDIRECT_URI` | Callback URL (must match Cloud Console exactly) |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API developer token |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Manager account (MCC) customer ID |

---

## Scope

```
https://www.googleapis.com/auth/adwords
```

---

## Token Exchange Endpoint

```
POST https://oauth2.googleapis.com/token
```

---

## Server-Side Token Refresh

```typescript
const response = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    refresh_token,
    grant_type: "refresh_token",
  }),
});
```

---

## API Data Endpoint

```
https://googleads.googleapis.com/{version}/...
```

Version is controlled by `GOOGLE_ADS_API_VERSION` env var (separate cadence from Meta's Graph API version).

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `origin_mismatch` | JS origins not registered in Google Cloud | Align Authorized JS origins exactly in Google Cloud Console |
| `redirect_uri_mismatch` | Callback URL not registered | Add exact redirect URI to Google Cloud OAuth client settings |
| `No accessible Google Ads customer` | OAuth missing Ads account access or invalid developer token | Validate Google Ads account permissions and developer token |
