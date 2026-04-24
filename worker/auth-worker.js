// Cloudflare Worker: OAuth proxy for Decap/Sveltia CMS
// Routes:
//   GET /api/auth/auth      — initiate GitHub OAuth, issue signed state cookie
//   GET /api/auth/callback  — complete OAuth, verify state, postMessage token to opener
//
// Secrets required (set via `wrangler secret put`):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OAUTH_STATE_SECRET

const ALLOWED_USER = "AndriyBabiy";
const ALLOWED_ORIGIN = "https://andriybabiy.com";
const CALLBACK_URL = "https://andriybabiy.com/api/auth/callback";
const STATE_COOKIE = "__oauth_state";
const STATE_TTL_SECONDS = 600; // 10 minutes

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
};

/* ─── Crypto helpers (HMAC-SHA256 via Web Crypto) ─── */

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signState(nonce, expiry, secret) {
  const key = await hmacKey(secret);
  const payload = `${nonce}.${expiry}`;
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${nonce}.${expiry}.${sigHex}`;
}

async function verifyState(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };
  const [nonce, expiryStr, sigHex] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry)) return { valid: false, reason: "bad-expiry" };
  if (Date.now() > expiry) return { valid: false, reason: "expired" };

  const key = await hmacKey(secret);
  const expectedSig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${nonce}.${expiry}`)
  );
  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison
  if (expectedHex.length !== sigHex.length) return { valid: false, reason: "bad-sig" };
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    diff |= expectedHex.charCodeAt(i) ^ sigHex.charCodeAt(i);
  }
  if (diff !== 0) return { valid: false, reason: "bad-sig" };

  return { valid: true, nonce };
}

function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/* ─── Response helpers ─── */

function errorHtml(message) {
  const safe = message.replace(/[<>&"']/g, "");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Auth Error</title>
<style>body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f7}
.box{text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:400px}
h1{font-size:20px;margin:0 0 12px;color:#1d1d1f}p{color:#6e6e73;margin:0 0 20px}
button{padding:8px 20px;font-size:14px;border-radius:6px;border:none;background:#007AFF;color:white;cursor:pointer}</style></head>
<body><div class="box"><h1>Authentication Failed</h1><p>${safe}</p>
<button onclick="window.close()">Close</button></div></body></html>`;
}

function successHtml(token) {
  // Token is embedded via JSON.stringify (escapes quotes); targetOrigin is strict.
  const payload = JSON.stringify({ token, provider: "github" });
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Auth Success</title></head>
<body><script>
(function(){
  try {
    var msg = 'authorization:github:success:' + ${JSON.stringify(payload)};
    window.opener.postMessage(msg, '${ALLOWED_ORIGIN}');
  } catch (e) { /* noop */ }
  window.close();
})();
</script></body></html>`;
}

/* ─── Route handlers ─── */

async function handleAuth(request, env) {
  if (!env.OAUTH_STATE_SECRET) {
    return new Response(errorHtml("Server misconfigured"), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8", ...NO_STORE_HEADERS },
    });
  }

  const nonce = randomNonce();
  const expiry = Date.now() + STATE_TTL_SECONDS * 1000;
  const stateToken = await signState(nonce, expiry, env.OAUTH_STATE_SECRET);

  const ghUrl = new URL("https://github.com/login/oauth/authorize");
  ghUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  ghUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  ghUrl.searchParams.set("scope", "repo,user");
  ghUrl.searchParams.set("state", stateToken);

  return new Response(null, {
    status: 302,
    headers: {
      "Location": ghUrl.toString(),
      "Set-Cookie": `${STATE_COOKIE}=${encodeURIComponent(stateToken)}; HttpOnly; Secure; SameSite=Lax; Max-Age=${STATE_TTL_SECONDS}; Path=/api/auth`,
      ...NO_STORE_HEADERS,
    },
  });
}

async function handleCallback(request, env) {
  const htmlHeaders = { "Content-Type": "text/html; charset=utf-8", ...NO_STORE_HEADERS };
  const clearCookie = `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/api/auth`;

  if (!env.OAUTH_STATE_SECRET || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response(errorHtml("Server misconfigured"), {
      status: 500,
      headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
    });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response(errorHtml("Missing code or state"), {
      status: 400,
      headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
    });
  }

  // Verify state (CSRF protection)
  const cookieState = parseCookie(request.headers.get("Cookie"), STATE_COOKIE);
  if (!cookieState || cookieState !== state) {
    return new Response(errorHtml("State mismatch (possible CSRF)"), {
      status: 400,
      headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
    });
  }

  const stateCheck = await verifyState(state, env.OAUTH_STATE_SECRET);
  if (!stateCheck.valid) {
    return new Response(errorHtml("Invalid or expired state"), {
      status: 400,
      headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
    });
  }

  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error || !tokenData.access_token) {
    return new Response(errorHtml("Token exchange failed"), {
      status: 400,
      headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
    });
  }

  // Verify user identity
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "Portfolio-Auth-Worker",
    },
  });
  if (!userRes.ok) {
    return new Response(errorHtml("User verification failed"), {
      status: 400,
      headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
    });
  }
  const user = await userRes.json();
  if (user.login !== ALLOWED_USER) {
    return new Response(errorHtml("Access denied: this editor is restricted to the site owner"), {
      status: 403,
      headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
    });
  }

  // Success — postMessage to opener and close popup
  return new Response(successHtml(tokenData.access_token), {
    status: 200,
    headers: { "Set-Cookie": clearCookie, ...htmlHeaders },
  });
}

/* ─── Main entry point ─── */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: NO_STORE_HEADERS,
      });
    }

    if (url.pathname === "/api/auth/auth") {
      return handleAuth(request, env);
    }
    if (url.pathname === "/api/auth/callback") {
      return handleCallback(request, env);
    }

    return new Response("Not found", {
      status: 404,
      headers: NO_STORE_HEADERS,
    });
  },
};
