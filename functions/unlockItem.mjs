const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const DEFAULT_STATE = { 1:false, 2:false, 3:false, 4:true, 5:false, 6:false };

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const PATH   = process.env.FILE_PATH || "unlocks.json";
const BRANCH = process.env.BRANCH || "main";
const TOKEN  = process.env.GITHUB_TOKEN;

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: "Method Not Allowed" };

  try {
    const { id } = JSON.parse(event.body || "{}");
    if (!id) return { statusCode: 400, headers: CORS, body: "Missing id" };

    // 1) 先读当前文件，拿到现有状态和 sha
    const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}?ref=${encodeURIComponent(BRANCH)}`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${TOKEN}`, "User-Agent": "netlify-fn" }
    });

    let current = DEFAULT_STATE;
    let sha = undefined;

    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
      const jsonStr = Buffer.from(data.content, data.encoding || "base64").toString("utf8");
      current = JSON.parse(jsonStr);
    } else if (getRes.status !== 404) {
      const text = await getRes.text();
      return { statusCode: getRes.status, headers: CORS, body: JSON.stringify({ error: text }) };
    }

    // 2) 更新状态
    current[id] = true;

    // 3) 通过 PUT 提交新内容（需要 base64）
    const newContentB64 = Buffer.from(JSON.stringify(current, null, 2), "utf8").toString("base64");
    const putUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}`;
    const payload = {
      message: `chore(unlock): set ${id} = true`,
      content: newContentB64,
      branch: BRANCH,
      sha // 若文件不存在则不带 sha，GitHub 会创建新文件
    };

    const putRes = await fetch(putUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "User-Agent": "netlify-fn",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!putRes.ok) {
      const text = await putRes.text();
      return { statusCode: putRes.status, headers: CORS, body: JSON.stringify({ error: text }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) };
  }
}
