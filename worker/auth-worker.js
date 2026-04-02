const ALLOWED_USER = "AndriyBabiy";
const ALLOWED_ORIGIN = "https://andriybabiy.com";
const REPO = "AndriyBabiy/react-personal-portfolio";
const GH_API = "https://api.github.com";
const UA = "Portfolio-Auth-Worker";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function ghFetch(path, token, options = {}) {
  const res = await fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": UA,
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
  return res.json();
}

async function verifyUser(token) {
  const user = await ghFetch("/user", token);
  if (user.login !== ALLOWED_USER) throw new Error("Access denied");
  return user;
}

async function handleExchange(request, env, origin) {
  const { code } = await request.json();
  if (!code) {
    return Response.json({ error: "Missing code" }, { status: 400, headers: corsHeaders(origin) });
  }

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

  const user = await verifyUser(tokenData.access_token);

  return Response.json(
    { login: user.login, avatar_url: user.avatar_url, token: tokenData.access_token },
    { headers: corsHeaders(origin) }
  );
}

async function handleCommit(request, origin) {
  const { token, files, message } = await request.json();
  if (!token || !files || !files.length) {
    return Response.json({ error: "Missing token or files" }, { status: 400, headers: corsHeaders(origin) });
  }

  // Verify user
  await verifyUser(token);

  // 1. Get current commit SHA on main
  const ref = await ghFetch(`/repos/${REPO}/git/ref/heads/main`, token);
  const parentSha = ref.object.sha;

  // 2. Get the current tree
  const parentCommit = await ghFetch(`/repos/${REPO}/git/commits/${parentSha}`, token);
  const baseTreeSha = parentCommit.tree.sha;

  // 3. Create blobs for each file and build tree entries
  const treeEntries = [];
  for (const file of files) {
    const blob = await ghFetch(`/repos/${REPO}/git/blobs`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: file.content,
        encoding: file.encoding || "utf-8",
      }),
    });
    treeEntries.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  // 4. Create new tree
  const tree = await ghFetch(`/repos/${REPO}/git/trees`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  // 5. Create commit
  const commit = await ghFetch(`/repos/${REPO}/git/commits`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message || "Update content via CMS",
      tree: tree.sha,
      parents: [parentSha],
    }),
  });

  // 6. Update ref to point to new commit
  await ghFetch(`/repos/${REPO}/git/refs/heads/main`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: commit.sha }),
  });

  return Response.json(
    { sha: commit.sha, url: commit.html_url, message: "Committed and deploying..." },
    { headers: corsHeaders(origin) }
  );
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

    try {
      if (url.pathname === "/api/auth/exchange") {
        return await handleExchange(request, env, origin);
      }
      if (url.pathname === "/api/auth/commit") {
        return await handleCommit(request, origin);
      }
      return new Response("Not found", { status: 404 });
    } catch (err) {
      return Response.json(
        { error: err.message || "Internal error" },
        { status: err.message === "Access denied" ? 403 : 500, headers: corsHeaders(origin) }
      );
    }
  },
};
