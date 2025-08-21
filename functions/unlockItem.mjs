import { getStore } from "@netlify/blobs";

const DEFAULT_STATE = { 1:false, 2:false, 3:false, 4:true, 5:false, 6:false };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export async function handler(event) {
  // 处理预检请求
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: "Method Not Allowed" };
  }

  try {
    const { id } = JSON.parse(event.body || "{}");
    if (!id) {
      return { statusCode: 400, headers: CORS, body: "Missing id" };
    }

    const store = getStore("unlocks");
    const current = (await store.get("state", { type: "json" })) || DEFAULT_STATE;
    current[id] = true;

    await store.setJSON("state", current); // 持久化！

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) };
  }
}
