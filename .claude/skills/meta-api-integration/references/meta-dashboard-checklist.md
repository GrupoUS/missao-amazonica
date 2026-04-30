# Meta Developer App Configuration Checklist

Minimum required configuration for production (`neondash.com.br` + staging):

1. **App Mode:** `Live` for end users (`Development` = only Roles/Testers).

2. **Products:** `Facebook Login`, `Instagram Graph API`, `Marketing API`.

3. **Facebook Login > Settings:**
   - Client OAuth Login: `ON`
   - Web OAuth Login: `ON`
   - Enforce HTTPS: `ON`
   - Login with JavaScript SDK: `ON`
   - Strict mode for redirect URI: `ON`

4. **Allowed Domains for JavaScript SDK:**
   - `https://neondash.com.br`
   - `https://staging.neondash.com.br`
   - `http://localhost:5173`
   - `http://localhost:3000`

5. **Valid OAuth Redirect URIs:**
   - `https://neondash.com.br/api/instagram/callback`
   - `https://neondash.com.br/api/facebook-ads/callback`
   - `https://staging.neondash.com.br/api/instagram/callback`
   - `https://staging.neondash.com.br/api/facebook-ads/callback`
   - `https://neondash.com.br/configuracoes/integrations/instagram`
   - `https://staging.neondash.com.br/configuracoes/integrations/instagram`

6. **App Domains (Settings > Basic):**
   - `neondash.com.br`, `staging.neondash.com.br`, `localhost`

7. **Website > Site URL:** `https://neondash.com.br`

8. **Instagram Graph API:** IG account must be `Business`/`Creator` and linked to a Facebook Page.
