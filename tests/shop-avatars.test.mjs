import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, overrides = {}) {
  const evaluatedModule = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(name => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    throw new Error(`Unexpected dependency: ${name}`);
  }, evaluatedModule, evaluatedModule.exports);
  return evaluatedModule.exports;
}

const identity = load("lib/account/profile-identity.ts");
const shopIdentity = load("lib/shops/shop-identity.ts");
const shopPhoto = load("lib/shops/shop-photo.ts", { "@/lib/account/profile-identity": identity });
const origin = "https://example.supabase.co";
const owner = "7802fb3c-5e19-403d-b6b6-c290c03db64f";
const shop = { id: owner, name: "YL Mart", is_favourite: false };
const publicUrl = path => `${origin}/storage/v1/object/public/profile-avatars/${path}`;

function service(shops, rows = [], error = null) {
  const calls = [];
  const client = {
    rpc: async (name, args) => {
      calls.push([name, args]);
      return name === "find_marketplace_shops" ? { data: shops, error: null } : { data: rows, error };
    },
    storage: { from: bucket => {
      assert.equal(bucket, "profile-avatars");
      return { getPublicUrl: path => ({ data: { publicUrl: publicUrl(path) } }) };
    } },
  };
  return { calls, api: load("lib/shops/shop-service.ts", {
    "server-only": {},
    "@/lib/products/group-catalog-products": {},
    "@/lib/account/profile-identity": identity,
    "@/lib/products/product-columns": {},
    "@/lib/products/product-mapper": {},
    "@/lib/supabase/public": { publicSupabase: client },
    "./shop-identity": shopIdentity,
    "./shop-photo": shopPhoto,
  }) };
}

test("seller card and shop page use the current uploaded account photo", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = origin;
  for (const filename of ["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp", "profile_123.jpg", "shop-logo.PNG"]) {
    const path = `${owner}/${filename}`;
    const { api } = service([shop], [{ id: owner, object_path: path }]);
    assert.equal((await api.findHomeShops())[0].avatarUrl, publicUrl(path));
    assert.equal((await api.findShopProfile(owner)).avatarUrl, publicUrl(path));
  }
});

test("photo display rejects other owners, foreign origins and unsafe file paths", () => {
  const path = `${owner}/logo.png`;
  assert.equal(identity.publicProfileAvatarPath(publicUrl(path), origin, owner), path);
  for (const url of [
    publicUrl(`other-owner/logo.png`), publicUrl(`${owner}/logo.svg`),
    publicUrl(`${owner}/subdir/logo.png`), publicUrl(`${owner}/..%2Flogo.png`),
    publicUrl(path).replace("example.supabase.co", "other.supabase.co"),
    publicUrl(path).replace("https://", "https://user:password@"),
    publicUrl(path).replace("https://", "http://"),
  ]) assert.equal(identity.publicProfileAvatarPath(url, origin, owner), null);
  assert.equal(identity.ownedAvatarPath(publicUrl(path), origin, owner), null, "public JPG/PNG display must not broaden deletion permissions");
});

test("unrequested sellers and cross-owner paths cannot supply a shop photo", async () => {
  const { api } = service([shop], [
    { id: "11111111-1111-4111-8111-111111111111", object_path: `${owner}/logo.png` },
    { id: owner, object_path: "11111111-1111-4111-8111-111111111111/logo.png" },
  ]);
  assert.equal((await api.findHomeShops())[0].avatarUrl, null);
});

test("official store needs no account upload and missing photos keep the initials fallback", async () => {
  const { api, calls } = service([{ id: shopIdentity.OFFICIAL_SHOP_ID, name: "AthiMart Official Store", is_favourite: false }]);
  assert.equal((await api.findHomeShops())[0].avatarUrl, null);
  assert.equal(calls.length, 1);
  assert.equal((await service([shop]).api.findHomeShops())[0].avatarUrl, null);
});

test("missing database lookup is reported without breaking the shop list", async () => {
  const { api } = service([shop], null, { code: "PGRST202" });
  const original = console.warn;
  const messages = [];
  console.warn = (...args) => messages.push(args);
  try {
    assert.equal((await api.findHomeShops())[0].avatarUrl, null);
    assert.equal(messages[0][1].code, "PGRST202");
  } finally { console.warn = original; }
});
