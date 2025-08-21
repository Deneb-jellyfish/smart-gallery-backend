import { getStore } from "@netlify/blobs";

const DEFAULT_STATE = { 1:false, 2:false, 3:false, 4:true, 5:false, 6:false };
const CORS = { "Access-Control-Allow-Origin": "*" };

export async function handler() {
  try {
    // 名为 "unlocks" 的 Blob Store；键为 "state"
    const store = getStore("unlocks");
    const current = (await store.get("state", { type: "json" })) || DEFAULT_STATE;
    return { statusCode: 200, headers: CORS, body: JSON.stringify(current) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) };
  }
}
