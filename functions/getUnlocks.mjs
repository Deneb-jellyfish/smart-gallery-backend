const CORS = { "Access-Control-Allow-Origin": "*" };

// 你的前端希望的默认状态
const DEFAULT_STATE = { 1:false, 2:false, 3:false, 4:true, 5:false, 6:false };

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const PATH   = process.env.FILE_PATH || "unlocks.json";
const BRANCH = process.env.BRANCH || "main";
const TOKEN  = process.env.GITHUB_TOKEN;

export async function handler() {
  try {
    // 用 GitHub Contents API 读取文件（会返回 base64）
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}?ref=${encodeURIComponent(BRANCH)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}`, "User-Agent": "netlify-fn" }
    });

    if (res.status === 404) {
      // 文件还不存在，就返回默认值
      return { statusCode: 200, headers: CORS, body: JSON.stringify(DEFAULT_STATE) };
    }
    if (!res.ok) {
      const text = await res.text();
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ error: text }) };
    }

    const data = await res.json(); // { content, encoding, sha, ... }
    const jsonStr = Buffer.from(data.content, data.encoding || "base64").toString("utf8");
    const obj = JSON.parse(jsonStr);

    return { statusCode: 200, headers: CORS, body: JSON.stringify(obj) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) };
  }
}
