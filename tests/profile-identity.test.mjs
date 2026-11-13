import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
function loadModule(relativePath, overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const evaluatedModule = { exports: {} };
    cache.set(file, evaluatedModule);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    });
    const localRequire = name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name === "server-only") return {};
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file), name);
        return load(base + (fs.existsSync(base + ".ts") ? ".ts" : ".tsx"));
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(localRequire, evaluatedModule, evaluatedModule.exports);
    return evaluatedModule.exports;
  }
  return load(path.resolve(relativePath));
}

const helpers = loadModule("lib/account/profile-identity.ts");
const owner = "11111111-1111-4111-8111-111111111111";
const origin = "https://example.supabase.co";
const google = "https://lh3.googleusercontent.com/example-photo";
const user = { id: owner, email: "customer@example.com", user_metadata: { full_name: "Google Name", avatar_url: google }, identities: [] };
const custom = `${origin}/storage/v1/object/public/profile-avatars/${owner}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp`;

test("stored name/photo win over Google; metadata supports both provider photo fields", () => {
  assert.deepEqual(helpers.profileIdentity(user, { full_name: "  Saved Name  ", avatar_url: custom }), { name: "Saved Name", avatarUrl: custom });
  assert.equal(helpers.profileIdentity(user, {}).avatarUrl, google);
  assert.equal(helpers.profileIdentity({ ...user, user_metadata: { picture: google } }).avatarUrl, google);
  assert.equal(helpers.profileIdentity({ ...user, user_metadata: {}, identities: [{ provider: "google", identity_data: { picture: google } }] }).avatarUrl, google);
  assert.deepEqual(helpers.profileIdentity({ email: "guest@example.com", user_metadata: {} }), { name: "guest", avatarUrl: null });
});

test("unsafe avatar URLs are rejected and cleanup is limited to the owner's bucket path", () => {
  for (const value of ["javascript:alert(1)", "data:image/svg+xml,bad", "http://example.com/a", "https://user:secret@example.com/a", "bad"]) assert.equal(helpers.safeAvatarUrl(value), null);
  assert.equal(helpers.ownedAvatarPath(custom, origin, owner), `${owner}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp`);
  for (const value of [google, custom.replace(owner, "other-owner"), custom.replace("profile-avatars", "product-images"), custom.replace("example.supabase.co", "evil.example.com"), custom.replace("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp", "..%2Fsecret.webp")]) assert.equal(helpers.ownedAvatarPath(value, origin, owner), null);
});

function database({ missing = false, blocked = false, denied = false, uploadDenied = false, corruptUpload = false, downloadDenied = false } = {}) {
  const calls = [];
  let update;
  let stored;
  const previous = { id: owner, full_name: "Old Name", avatar_url: custom, is_blocked: blocked };
  const bucket = {
    upload: async (key, bytes, options) => { stored = bytes; calls.push(["upload", key, bytes, options]); return { error: uploadDenied ? { message: "denied" } : null }; },
    download: async key => {
      calls.push(["download", key]);
      return { data: corruptUpload ? new Blob(["broken image"]) : stored, error: downloadDenied ? { message: "denied" } : null };
    },
    getPublicUrl: key => ({ data: { publicUrl: `${origin}/storage/v1/object/public/profile-avatars/${key}` } }),
    remove: async keys => { calls.push(["remove", keys]); return { error: null }; },
  };
  const query = {
    select: fields => { calls.push(["select", fields]); return query; },
    eq: (...args) => { calls.push(["eq", ...args]); return query; },
    or: predicate => { calls.push(["or", predicate]); return query; },
    maybeSingle: async () => ({ data: missing ? null : previous, error: null }),
    update: payload => { update = payload; calls.push(["update", payload]); return query; },
    single: async () => ({ data: denied ? null : { id: owner, ...update }, error: denied ? { message: "denied" } : null }),
  };
  const client = {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from: table => { assert.equal(table, "profiles"); return query; },
    storage: { from: name => { assert.equal(name, "profile-avatars"); return bucket; } },
  };
  return { client, calls };
}

test("name-only saves target the verified owner and preserve the current photo", async () => {
  const db = database();
  const { persistProfileIdentity } = loadModule("lib/account/save-profile.ts");
  const result = await persistProfileIdentity(db.client, owner, "New Name", null);
  assert(result.success);
  assert.deepEqual(db.calls.find(c => c[0] === "update")[1], { full_name: "New Name" });
  assert(db.calls.filter(c => c[0] === "eq").every(c => c[1] === "id" && c[2] === owner));
  assert(db.calls.some(c => c[0] === "or" && c[1] === "is_blocked.is.null,is_blocked.eq.false"));
  assert(!db.calls.some(c => c[0] === "upload" || c[0] === "remove"));
});

test("uploads use unique owner paths and clean up a new file if the profile update fails", async () => {
  const db = database({ denied: true });
  const { persistProfileIdentity } = loadModule("lib/account/save-profile.ts");
  const result = await persistProfileIdentity(db.client, owner, "New Name", { bytes: new Uint8Array([1]), filename: "new-photo.webp" });
  assert(!result.success);
  assert.deepEqual(db.calls.find(c => c[0] === "upload")[3], { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  assert.deepEqual(db.calls.filter(c => c[0] === "remove"), [["remove", [`${owner}/new-photo.webp`]]]);
});

test("upload failures and blocked/missing profiles never update the database", async () => {
  const { persistProfileIdentity } = loadModule("lib/account/save-profile.ts");
  for (const options of [{ uploadDenied: true }, { blocked: true }, { missing: true }]) {
    const db = database(options);
    const result = await persistProfileIdentity(db.client, owner, "New Name", { bytes: new Uint8Array([1]), filename: "new.webp" });
    assert(!result.success);
    assert(!db.calls.some(c => c[0] === "update"));
  }
});

test("corrupted or unreadable uploads never report success or replace the previous photo", async () => {
  const { persistProfileIdentity } = loadModule("lib/account/save-profile.ts");
  for (const options of [{ corruptUpload: true }, { downloadDenied: true }]) {
    const db = database(options);
    const result = await persistProfileIdentity(db.client, owner, "New Name", { bytes: new Uint8Array([0, 255, 128, 1]), filename: "new.webp" });
    assert(!result.success);
    assert(!db.calls.some(c => c[0] === "update"));
    assert.deepEqual(db.calls.filter(c => c[0] === "remove"), [["remove", [`${owner}/new.webp`]]]);
  }
});

test("real Storage SDK sends a binary multipart WebP and verifies an unchanged download", async () => {
  const db = database();
  const pixels = Buffer.alloc(80 * 80 * 3);
  for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 137 + i % 17) % 256;
  const original = await sharp(pixels, { raw: { width: 80, height: 80, channels: 3 } }).webp().toBuffer();
  let uploaded;
  let downloaded = false;
  const storageClient = createClient(origin, "test-public-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      // Serialize and parse the actual HTTP body constructed by the installed
      // Supabase SDK; the earlier tests stopped at a mocked upload method.
      const request = new Request(input, init);
      if (request.method === "POST") {
        assert(request.headers.get("content-type").startsWith("multipart/form-data; boundary="));
        const form = await request.formData();
        assert.equal(form.get("cacheControl"), "31536000");
        const file = form.get("");
        assert(file instanceof Blob);
        assert.equal(file.type, "image/webp");
        uploaded = Buffer.from(await file.arrayBuffer());
        assert.deepEqual(uploaded, original);
        const metadata = await sharp(uploaded).metadata();
        assert.equal(metadata.format, "webp");
        return Response.json({ Id: "test-object", Key: `profile-avatars/${owner}/new.webp` });
      }
      assert.equal(request.method, "GET");
      assert(uploaded);
      downloaded = true;
      return new Response(uploaded, { headers: { "content-type": "image/webp" } });
    } },
  });
  db.client.storage = storageClient.storage;
  const { persistProfileIdentity } = loadModule("lib/account/save-profile.ts");
  assert((await persistProfileIdentity(db.client, owner, "New Name", { bytes: original, filename: "new.webp" })).success);
  assert(downloaded);
  assert(db.calls.some(c => c[0] === "update"));
});

test("using Google writes its photo and only removes the former owned upload after save", async () => {
  const db = database();
  const previousEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL = origin;
  try {
    const { persistProfileIdentity } = loadModule("lib/account/save-profile.ts");
    assert((await persistProfileIdentity(db.client, owner, "New Name", { googleUrl: google })).success);
    assert.deepEqual(db.calls.find(c => c[0] === "update")[1], { full_name: "New Name", avatar_url: google });
    assert.deepEqual(db.calls.find(c => c[0] === "remove")[1], [`${owner}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp`]);
    assert(db.calls.findIndex(c => c[0] === "update") < db.calls.findIndex(c => c[0] === "remove"));
  } finally {
    if (previousEnv === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousEnv;
  }
});

test("server action rejects unauthenticated users, invalid names, forged modes, and invalid images", async () => {
  const db = database();
  let signedIn = false;
  db.client.auth.getUser = async () => ({ data: { user: signedIn ? user : null }, error: null });
  const revalidated = [];
  const { saveProfileIdentity } = loadModule("app/(store)/account/identity-actions.ts", {
    "@/lib/supabase/server": { createClient: async () => db.client },
    "next/cache": { revalidatePath: (...args) => revalidated.push(args) },
  });
  const form = new FormData();
  form.set("fullName", "Customer"); form.set("photoMode", "keep");
  assert(!(await saveProfileIdentity(form)).success);
  signedIn = true;
  form.set("fullName", " "); assert(!(await saveProfileIdentity(form)).success);
  form.set("fullName", "Customer"); form.set("photoMode", "admin"); assert(!(await saveProfileIdentity(form)).success);
  form.set("photoMode", "upload"); form.set("photo", new File(["not an image"], "photo.webp", { type: "image/webp" }));
  assert(!(await saveProfileIdentity(form)).success);
  form.set("photo", new File([new Uint8Array(helpers.MAX_AVATAR_UPLOAD_BYTES + 1)], "big.webp", { type: "image/webp" }));
  assert(!(await saveProfileIdentity(form)).success);
  assert(!db.calls.some(c => c[0] === "update" || c[0] === "upload"));
  assert.deepEqual(revalidated, []);
});

test("server action decodes a real image, writes WebP as owner, ignores client IDs, and refreshes navigation", async () => {
  const db = database();
  const revalidated = [];
  const { saveProfileIdentity } = loadModule("app/(store)/account/identity-actions.ts", {
    "@/lib/supabase/server": { createClient: async () => db.client },
    "next/cache": { revalidatePath: (...args) => revalidated.push(args) },
  });
  const png = await sharp({ create: { width: 30, height: 50, channels: 3, background: "#454d36" } }).png().toBuffer();
  const form = new FormData();
  form.set("fullName", "  Saved Customer  "); form.set("photoMode", "upload");
  form.set("id", "another-user"); form.set("role", "admin");
  form.set("photo", new File([png], "photo.png", { type: "image/png" }));
  assert((await saveProfileIdentity(form)).success);
  const upload = db.calls.find(c => c[0] === "upload");
  assert(upload[1].startsWith(`${owner}/`));
  assert(upload[2] instanceof Blob);
  const metadata = await sharp(Buffer.from(await upload[2].arrayBuffer())).metadata();
  assert.equal(metadata.format, "webp"); assert.equal(metadata.width, 512); assert.equal(metadata.height, 512);
  const saved = db.calls.find(c => c[0] === "update")[1];
  assert.equal(saved.full_name, "Saved Customer");
  assert.deepEqual(Object.keys(saved).sort(), ["avatar_url", "full_name"]);
  assert.deepEqual(revalidated, [["/", "layout"]]);
});
