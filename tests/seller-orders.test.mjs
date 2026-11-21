import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(relative, overrides) {
  const cache = new Map();
  function read(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    new Function("exports", "require", outputText)(exports, name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name === "server-only") return {};
      if (name.startsWith("@/")) return read(path.resolve(name.slice(2) + ".ts"));
      return require(name);
    });
    return exports;
  }
  return read(path.resolve(relative));
}

const fulfillment = "11111111-1111-4111-8111-111111111111";
function fixture({ denied = false, error = null } = {}) {
  const calls = [], refreshed = [];
  const overrides = {
    "@/lib/auth/seller": { getCurrentSeller: async () => {
      if (denied) throw new Error("Access denied");
      return { user: { id: "verified-seller" } };
    } },
    "@/lib/supabase/server": { createClient: async () => ({ rpc: async (name, payload) => {
      calls.push({ name, payload }); return { data: [], error };
    } }) },
    "next/cache": { revalidatePath: value => refreshed.push(value) },
  };
  return { calls, refreshed, overrides };
}
function form(status = "pending", id = fulfillment) {
  const data = new FormData();
  data.set("fulfillmentId", id); data.set("expectedStatus", status);
  data.set("sellerId", "forged-seller"); data.set("status", "delivered");
  return data;
}

test("seller order reads and mutations require the approved seller gate", async () => {
  const f = fixture({ denied: true });
  const { getSellerOrders } = load("lib/orders/seller-orders.ts", f.overrides);
  const { progressSellerOrder } = load("app/(seller)/seller/orders/actions.ts", f.overrides);
  await assert.rejects(() => getSellerOrders(), /Access denied/);
  await assert.rejects(() => progressSellerOrder({}, form()), /Access denied/);
  assert.deepEqual(f.calls, []);
});

test("order updates ignore forged seller and target status and request one allowed transition", async () => {
  const f = fixture();
  const { progressSellerOrder } = load("app/(seller)/seller/orders/actions.ts", f.overrides);
  const result = await progressSellerOrder({}, form());
  assert.equal(result.success, true);
  assert.deepEqual(f.calls, [{ name: "web_progress_seller_order", payload: {
    p_fulfillment_id: fulfillment, p_expected_status: "pending", p_status: "accepted",
  } }]);
  assert.deepEqual(f.refreshed, ["/seller/orders", "/seller", "/orders"]);
});

test("invalid identifiers and terminal statuses never reach the database", async () => {
  const f = fixture();
  const { progressSellerOrder } = load("app/(seller)/seller/orders/actions.ts", f.overrides);
  for (const data of [form("delivered"), form("pending", "invalid"), form("rejected"), form("constructor")]) {
    assert.equal((await progressSellerOrder({}, data)).success, false);
  }
  assert.deepEqual(f.calls, []);
});

test("stale or denied writes do not report success or refresh customer data", async () => {
  const f = fixture({ error: { code: "22023", message: "private error" } });
  const { progressSellerOrder } = load("app/(seller)/seller/orders/actions.ts", f.overrides);
  const result = await progressSellerOrder({}, form());
  assert.equal(result.success, false);
  assert(!result.message.includes("private error"));
  assert.deepEqual(f.refreshed, []);
});

test("a missing order inbox is shown as unavailable, separately from an empty inbox", async () => {
  const f = fixture({ error: { code: "PGRST202" } });
  const { getSellerOrders } = load("lib/orders/seller-orders.ts", f.overrides);
  assert.deepEqual(await getSellerOrders(), { orders: [], unavailable: true });
  assert.deepEqual(f.calls, [{ name: "web_seller_orders", payload: { p_offset: 0 } }]);
});
