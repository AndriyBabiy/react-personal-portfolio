const ALLOWED_USER = "AndriyBabiy";
const ALLOWED_ORIGIN = "https://andriybabiy.com";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/api/auth/exchange") {
      return new Response("Not found", { status: 404 });
    }

    try {
      const { code } = await request.json();
      if (!code) {
        return Response.json({ error: "Missing code" }, { status: 400, headers: corsHeaders(origin) });
      }

      // Exchange OAuth code for access token
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
      if (tokenData.error) {
        return Response.json({ error: tokenData.error_description || "Token exchange failed" }, {
          status: 400, headers: corsHeaders(origin),
        });
      }

      // Verify user identity
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "Portfolio-Auth-Worker",
        },
      });
      const user = await userRes.json();

      if (user.login !== ALLOWED_USER) {
        return Response.json({ error: "Access denied" }, { status: 403, headers: corsHeaders(origin) });
      }

      return Response.json(
        { login: user.login, avatar_url: user.avatar_url, token: tokenData.access_token },
        { headers: corsHeaders(origin) }
      );
    } catch (err) {
      return Response.json(
        { error: err.message || "Internal error" },
        { status: 500, headers: corsHeaders(origin) }
      );
    }
  },
};
