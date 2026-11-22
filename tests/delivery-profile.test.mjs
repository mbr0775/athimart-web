import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import * as React from "react";

const runtimeRequire = createRequire(import.meta.url);

// Exercise the real TypeScript modules with an isolated authenticated database
// double. No customer records or orders are created by this suite.
function loadModule(relativePath, overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const evaluatedModule = { exports: {} };
    cache.set(file, evaluatedModule);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    });
    function localRequire(name) {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name === "server-only") return {};
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file), name);
        return load(base + (fs.existsSync(base + ".ts") ? ".ts" : ".tsx"));
      }
      return runtimeRequire(name);
    }
    vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(localRequire, evaluatedModule, evaluatedModule.exports);
    return evaluatedModule.exports;
  }
  return load(path.resolve(relativePath));
}

const details = {
  shippingName: "Example Customer", shippingPhone: "+94771234567", shippingAddressLine1: "10 Example Street",
  shippingAddressLine2: "", shippingCity: "Colombo", shippingState: "Western", shippingPostalCode: "00100", shippingCountry: "Sri Lanka",
};
const owner = "11111111-1111-4111-8111-111111111111";
const order = { orderId: "test-order", orderNumber: "TEST-42", status: "Pending", itemsCount: 1, subtotal: 100, deliveryFee: 20, total: 120, countryCode: "LK", currencyCode: "LKR" };

function database({ signedIn = true, failSave = false, rowMissing = false, profile = {} } = {}) {
  const calls = [];
  const row = { full_name: "Example Customer", phone: "+94771234567", address_line1: "10 Example Street", address_line2: null, city: "Colombo", state: "Western", postal_code: "00100", country: "Sri Lanka", ...profile };
  const client = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: owner, user_metadata: {} } : null }, error: null }) },
    from(table) {
      calls.push(["from", table]);
      let update;
      const query = {
        update(value) { update = value; calls.push(["update", value]); return query; },
        select(value) { calls.push(["select", value]); return query; },
        eq(...args) { calls.push(["eq", ...args]); return query; },
        or(value) { calls.push(["or", value]); return query; },
        maybeSingle: async () => ({ data: rowMissing ? null : row, error: null }),
        single: async () => {
          if (failSave || rowMissing) return { data: null, error: { code: "42501", message: "Denied" } };
          Object.assign(row, update);
          return { data: row, error: null };
        },
      };
      return query;
    },
    rpc: async (name, payload) => { calls.push(["rpc", name, payload]); return { data: order, error: null }; },
  };
  const revalidated = [];
  const overrides = { "@/lib/supabase/server": { createClient: async () => client }, "next/cache": { revalidatePath: value => revalidated.push(value) } };
  return { client, calls, row, revalidated, overrides };
}

test("validation trims details, preserves optional clearing, and rejects invalid fields", () => {
  const { validateDeliveryDetails, deliveryDetailsFromProfile } = loadModule("lib/account/delivery-details.ts");
  const result = validateDeliveryDetails({ ...details, shippingName: "  Example Customer  ", role: "admin", id: "another-customer" });
  assert(result.valid);
  assert.equal(result.details.shippingName, "Example Customer");
  assert.equal(result.details.role, undefined);
  assert.equal(result.details.id, undefined);
  for (const value of [null, [], {}, { ...details, shippingPhone: "12" }, { ...details, shippingAddressLine1: "A" }, { ...details, shippingCity: "X" }, { ...details, shippingName: " ".repeat(4) }, { ...details, shippingPostalCode: "X".repeat(31) }]) assert(!validateDeliveryDetails(value).valid);
  assert.equal(deliveryDetailsFromProfile(null).shippingCountry, "Sri Lanka");
});

test("profile writes use the verified owner and a contact/address-only payload", async () => {
  const db = database();
  const { saveDeliveryDetails } = loadModule("app/(store)/account/profile-actions.ts", db.overrides);
  const result = await saveDeliveryDetails({ ...details, id: "another-customer", role: "admin", is_blocked: false, seller_approval_status: "approved" });
  assert(result.success);
  assert(db.calls.some(call => call[0] === "eq" && call[1] === "id" && call[2] === owner));
  assert(db.calls.some(call => call[0] === "or" && call[1] === "is_blocked.is.null,is_blocked.eq.false"));
  const update = db.calls.find(call => call[0] === "update")[1];
  assert.deepEqual(Object.keys(update).sort(), ["full_name", "phone", "address_line1", "address_line2", "city", "state", "postal_code", "country", "updated_at"].sort());
  assert.equal(update.address_line2, null);
  assert.equal(result.details.shippingCity, "Colombo");
  assert.deepEqual(db.revalidated, ["/", "/account", "/checkout"]);
});

test("signed-out, invalid, missing, or denied saves never report success", async () => {
  for (const options of [{ signedIn: false }, { failSave: true }, { rowMissing: true }]) {
    const db = database(options);
    const { saveDeliveryDetails } = loadModule("app/(store)/account/profile-actions.ts", db.overrides);
    assert.equal((await saveDeliveryDetails(details)).success, false);
    if (options.signedIn === false) assert.equal(db.calls.length, 0);
    assert.equal(db.revalidated.length, 0);
  }
  const db = database();
  const { saveDeliveryDetails } = loadModule("app/(store)/account/profile-actions.ts", db.overrides);
  assert.equal((await saveDeliveryDetails({})).code, "VALIDATION_ERROR");
  assert.equal(db.calls.length, 0);
});

test("checkout prefills the owner's saved profile without leaking profiles to signed-out users", async () => {
  const db = database();
  const service = loadModule("lib/account/delivery-profile-service.ts", db.overrides);
  const result = await service.getSavedDeliveryProfile();
  assert.equal(result.isSignedIn, true);
  assert.deepEqual(result.details, details);
  assert(db.calls.some(call => call[0] === "eq" && call[2] === owner));
  const guest = database({ signedIn: false });
  assert.equal((await loadModule("lib/account/delivery-profile-service.ts", guest.overrides).getSavedDeliveryProfile()).isSignedIn, false);
  assert.equal(guest.calls.length, 0);
  const overseas = database({ profile: { country: "Maldives" } });
  const other = await loadModule("lib/account/delivery-profile-service.ts", overseas.overrides).getSavedDeliveryProfile();
  assert.equal(other.details.shippingName, details.shippingName);
  assert.equal(other.details.shippingAddressLine1, "");
});

test("orders save the validated profile before the RPC and stop if the profile cannot be saved", async () => {
  const submission = { ...details, items: [{ productId: owner, quantity: 1 }], paymentMethod: "Cash on Delivery" };
  const db = database();
  const { createCheckoutOrder } = loadModule("app/(store)/checkout/actions.ts", db.overrides);
  const result = await createCheckoutOrder(submission);
  assert(result.success);
  assert(db.calls.findIndex(call => call[0] === "update") < db.calls.findIndex(call => call[0] === "rpc"));
  const rpc = db.calls.find(call => call[0] === "rpc");
  assert.equal(rpc[1], "create_checkout_order");
  assert.equal(rpc[2].p_shipping_phone, details.shippingPhone);
  assert.deepEqual(rpc[2].p_items, [{ productId: owner, quantity: 1 }]);
  const denied = database({ failSave: true });
  const failure = await loadModule("app/(store)/checkout/actions.ts", denied.overrides).createCheckoutOrder(submission);
  assert.equal(failure.success, false);
  assert(failure.message.includes("has not been placed"));
  assert(!denied.calls.some(call => call[0] === "rpc"));
});

test("queued autosaves preserve the newest edits and deduplicate unchanged details", async () => {
  const states = [], refs = [], effects = [], calls = [], resolvers = [];
  let stateIndex = 0, refIndex = 0;
  const { useDeliveryProfileSave } = loadModule("lib/hooks/use-delivery-profile-save.ts", {
    react: {
      ...React,
      useState(initial) { const index = stateIndex++; if (!(index in states)) states[index] = initial; return [states[index], value => { states[index] = value; }]; },
      useRef(initial) { const index = refIndex++; return refs[index] ?? (refs[index] = { current: initial }); },
      useCallback: callback => callback,
      useEffect: effect => effects.push(effect),
    },
    "@/app/(store)/account/profile-actions": { saveDeliveryDetails(value) { calls.push(value); return new Promise(resolve => resolvers.push(resolve)); } },
  });
  function HookHarness() { stateIndex = 0; refIndex = 0; return useDeliveryProfileSave(details); }
  const hook = HookHarness();
  effects[0]();
  const first = { ...details, shippingCity: "Kandy" }, latest = { ...details, shippingCity: "Galle" };
  const pending1 = hook.save(first), pending2 = hook.save(latest);
  await Promise.resolve();
  assert.equal(calls.length, 1);
  resolvers.shift()({ success: true, details: first });
  await pending1;
  await Promise.resolve();
  assert.equal(calls.length, 2);
  resolvers.shift()({ success: true, details: latest });
  await pending2;
  assert.equal((await hook.waitForPendingSaves()).details.shippingCity, "Galle");
  assert.equal(HookHarness().status, "saved");
  await hook.save(latest);
  assert.equal(calls.length, 2);
});

test("checkout prefills each field, autosaves valid blur changes, and waits for saves before ordering", async () => {
  const oldFormData = global.FormData;
  const mockForm = { values: { ...details }, reportValidity: () => true };
  global.FormData = class { constructor(form) { this.values = form.values; } get(name) { return this.values[name] ?? null; } };
  const fixture = { items: [{ productId: owner, name: "Example product", unitPrice: 100, quantity: 1, currencyCode: "LKR" }] };
  const states = [fixture, true, false, "", null], saved = [], orders = [];
  let index = 0, finishSave;
  const pendingSave = new Promise(resolve => { finishSave = resolve; });
  const styles = { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
  const overrides = {
    react: { ...React, useState: initial => { const cursor = index++; if (!(cursor in states)) states[cursor] = initial; return [states[cursor], value => { states[cursor] = value; }]; }, useRef: () => ({ current: mockForm }), useMemo: fn => fn(), useEffect: () => {} },
    "@/components/navigation/navigation-link": { __esModule: true, default: "a" },
    "motion/react": { useReducedMotion: () => false },
    "@/lib/fonts": { editorialFont: { variable: "editorial" } },
    "@/components/cart/cart-product-image": { __esModule: true, default: () => null },
    "@/app/(store)/checkout/checkout.module.css": styles,
    "@/lib/hooks/use-delivery-profile-save": { useDeliveryProfileSave: () => ({ save: value => { saved.push(value); return Promise.resolve({ success: true, details: value }); }, waitForPendingSaves: () => pendingSave, status: "idle", message: "" }) },
    "@/app/(store)/checkout/actions": { createCheckoutOrder: async value => { orders.push(value); return { success: false, code: "UNAUTHENTICATED", message: "Sign in" }; } },
  };
  const oldWindow = global.window;
  global.window = { location: { assign: () => {} } };
  function flat(element) { return !element || typeof element !== "object" ? [] : [element, ...React.Children.toArray(element.props?.children).flatMap(flat)]; }
  try {
    const Client = loadModule("components/checkout/checkout-client.tsx", overrides).default;
    index = 0;
    let nodes = flat(Client({ initialDeliveryDetails: details, isSignedIn: true, profileError: "" }));
    for (const [key, value] of Object.entries(details)) {
      const input = nodes.find(node => node.type === "input" && node.props.name === key);
      assert(input, key);
      assert.equal(input.props.defaultValue ?? input.props.value, value);
    }
    const form = nodes.find(node => node.type === "form");
    mockForm.values.shippingCity = "Galle";
    form.props.onBlurCapture({ target: { getAttribute: () => "shippingCity" } });
    assert.equal(saved[0].shippingCity, "Galle");
    mockForm.values.shippingPhone = "1";
    form.props.onBlurCapture({ target: { getAttribute: () => "shippingPhone" } });
    assert.equal(saved.length, 1);
    mockForm.values.shippingPhone = details.shippingPhone;
    const pending = form.props.onSubmit({ preventDefault: () => {}, currentTarget: mockForm });
    assert.equal(orders.length, 0);
    finishSave();
    await pending;
    assert.equal(orders.length, 1);
    assert.equal(orders[0].shippingCity, "Galle");
    index = 0;
    nodes = flat(Client({ initialDeliveryDetails: details, isSignedIn: false, profileError: "" }));
    nodes.find(node => node.type === "form").props.onBlurCapture({ target: { getAttribute: () => "shippingCity" } });
    assert.equal(saved.length, 1);
    assert(nodes.some(node => node.type === "a" && node.props.href === "/auth/login?next=%2Fcheckout"));
  } finally {
    global.FormData = oldFormData;
    global.window = oldWindow;
  }
});

test("the profile form shows saved details and refreshes account information after saving", async () => {
  const oldFormData = global.FormData;
  global.FormData = class { constructor(form) { this.values = form.values; } get(name) { return this.values[name] ?? null; } };
  const saved = []; let refreshed = 0;
  try {
    const Form = loadModule("components/account/delivery-details-form.tsx", {
      "next/navigation": { useRouter: () => ({ refresh: () => { refreshed++; } }) },
      "@/lib/fonts": { editorialFont: { variable: "editorial" } },
      "./delivery-details-form.module.css": { __esModule: true, default: {} },
      "@/lib/hooks/use-delivery-profile-save": { useDeliveryProfileSave: () => ({ save: async value => { saved.push(value); return { success: true, details: value }; }, status: "idle", message: "" }) },
    }).default;
    function flat(element) { return !element || typeof element !== "object" ? [] : [element, ...React.Children.toArray(element.props?.children).flatMap(flat)]; }
    const nodes = flat(Form({ initialDetails: details }));
    assert.equal(nodes.filter(node => node.type === "input").length, 8);
    assert.equal(nodes.find(node => node.type === "input" && node.props.name === "shippingCity").props.defaultValue, "Colombo");
    await nodes.find(node => node.type === "form").props.onSubmit({ preventDefault: () => {}, currentTarget: { values: { ...details, shippingPhone: "+94779876543" } } });
    assert.equal(saved[0].shippingPhone, "+94779876543");
    assert.equal(refreshed, 1);
  } finally { global.FormData = oldFormData; }
});

test("the redesigned account preserves customer, seller, administrator, and delivery permissions", async () => {
  const signOutAction = async () => {};
  function flat(element) { return !element || typeof element !== "object" ? [] : [element, ...React.Children.toArray(element.props?.children).flatMap(flat)]; }
  function content(element) { return typeof element === "string" || typeof element === "number" ? String(element) : element && typeof element === "object" ? React.Children.toArray(element.props?.children).map(content).join("") : ""; }
  async function renderAccount({ signedIn = true, blocked = false, seller = null, admin = false, driver = null } = {}) {
    const profile = { id: owner, full_name: "Example Customer", email: "example@example.invalid", phone: details.shippingPhone, role: seller ? "seller" : "customer", seller_approval_status: seller, is_blocked: blocked, address_line1: details.shippingAddressLine1, city: details.shippingCity, country: details.shippingCountry, created_at: "2026-01-01T00:00:00Z" };
    const queries = [];
    const client = {
      auth: { getUser: async () => ({ data: { user: signedIn ? { id: owner, email: profile.email, user_metadata: { role: "admin" } } : null }, error: null }) },
      from(table) {
        const query = { select: () => query, eq(column, value) { queries.push([table, column, value]); return query; }, maybeSingle: async () => ({ data: table === "profiles" ? profile : table === "user_roles" ? { role: admin ? "admin" : "customer" } : driver ? { application_status: driver, availability_status: "online", approved_service_areas: ["Colombo"], rejection_reason: "Example rejection reason", suspension_reason: "Example suspension reason" } : null, error: null }) };
        return query;
      },
    };
    const Page = loadModule("app/(store)/account/page.tsx", {
      "@/lib/supabase/server": { createClient: async () => client },
      "next/navigation": { redirect: url => { throw Error(`REDIRECT:${url}`); } },
      "@/components/navigation/navigation-link": { __esModule: true, default: "a" },
      "@/lib/fonts": { editorialFont: { variable: "editorial" } },
      "./account.module.css": { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) },
      "./actions": { signOut: signOutAction },
      "@/components/account/delivery-details-form": { __esModule: true, default: "saved-delivery-form" },
      "@/components/account/profile-identity-form": { __esModule: true, default: "profile-identity-form" },
    }).default;
    const tree = await Page({ searchParams: Promise.resolve({}) });
    return { nodes: flat(tree), text: content(tree), queries };
  }
  const customer = await renderAccount();
  assert(customer.nodes.some(node => node.type === "a" && node.props.href === "/orders"));
  assert(!customer.nodes.some(node => node.type === "a" && node.props.href === "/admin"));
  assert(customer.nodes.some(node => node.type === "saved-delivery-form" && node.props.initialDetails.shippingCity === "Colombo"));
  assert(customer.nodes.some(node => node.type === "profile-identity-form" && node.props.name === "Example Customer"));
  assert(customer.nodes.some(node => node.type === "form" && node.props.action === signOutAction));
  assert(!customer.nodes.some(node => node.type === "main"));
  assert(customer.queries.every(([, , id]) => id === owner));
  const admin = await renderAccount({ admin: true });
  assert(admin.nodes.some(node => node.type === "a" && node.props.href === "/admin"));
  const approved = await renderAccount({ seller: "approved" });
  assert(approved.nodes.some(node => node.type === "a" && node.props.href === "/seller"));
  const pending = await renderAccount({ seller: "pending" });
  assert(pending.nodes.some(node => node.type === "a" && node.props.href === "/seller-pending"));
  assert(!pending.nodes.some(node => node.type === "a" && node.props.href === "/seller"));
  const driver = await renderAccount({ driver: "approved" });
  assert(driver.nodes.some(node => node.type === "a" && node.props.href === "/delivery-partner/dashboard"));
  assert(driver.text.includes("Driver account"));
  assert(driver.text.includes("Colombo"));
  for (const status of ["draft", "pending", "under_review", "rejected", "suspended"]) {
    const result = await renderAccount({ driver: status });
    assert(!result.nodes.some(node => node.type === "a" && node.props.href === "/delivery-partner/dashboard"));
    if (status === "rejected") assert(result.text.includes("Example rejection reason"));
    if (status === "suspended") assert(result.text.includes("Example suspension reason"));
  }
  await assert.rejects(renderAccount({ signedIn: false }), /REDIRECT:\/auth\/login/);
  await assert.rejects(renderAccount({ blocked: true }), /REDIRECT:\/account-blocked/);
});
