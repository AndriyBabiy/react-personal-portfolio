const GH_API = "https://api.github.com";
const REPO = "AndriyBabiy/react-personal-portfolio";
const BRANCH = "main";

async function ghFetch(path, token, options = {}) {
  const res = await fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Commit multiple files to the repo directly from the browser.
 *
 * @param {string} token - GitHub OAuth token
 * @param {Array<{path: string, content: string, encoding?: string}>} files
 * @param {string} message - Commit message
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise<{sha: string, url: string} | {noChanges: true, message: string}>}
 */
export async function commitFiles(token, files, message, onProgress) {
  const progress = onProgress || (() => {});

  // 1. Get current ref
  progress("Getting current branch...");
  const ref = await ghFetch(`/repos/${REPO}/git/ref/heads/${BRANCH}`, token);
  const parentSha = ref.object.sha;

  // 2. Get current commit's tree
  const parentCommit = await ghFetch(`/repos/${REPO}/git/commits/${parentSha}`, token);
  const baseTreeSha = parentCommit.tree.sha;

  // 3. Create blobs for each file
  const treeEntries = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progress(`Uploading file ${i + 1} of ${files.length}: ${file.path.split("/").pop()}`);

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
  progress("Creating commit...");
  const tree = await ghFetch(`/repos/${REPO}/git/trees`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  // 5. Check if tree is identical (no actual changes)
  if (tree.sha === baseTreeSha) {
    return { noChanges: true, message: "Content is already up to date." };
  }

  // 6. Create commit
  const commit = await ghFetch(`/repos/${REPO}/git/commits`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [parentSha],
    }),
  });

  // 7. Update ref
  progress("Updating branch...");
  await ghFetch(`/repos/${REPO}/git/refs/heads/${BRANCH}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: commit.sha }),
  });

  return { sha: commit.sha, url: commit.html_url };
}

/**
 * Read a File as base64 string (without data URL prefix)
 */
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Max file size for GitHub blob API (practical limit ~50MB)
 */
export const MAX_BLOB_SIZE = 50 * 1024 * 1024;
