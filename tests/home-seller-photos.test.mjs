import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

const require = createRequire(import.meta.url);
function loadModule(relativePath, overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const evaluated = { exports: {} };
    cache.set(file, evaluated);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    });
    const localRequire = name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name === "server-only") return {};
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file), name);
        return load(base + ".ts");
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(localRequire, evaluated, evaluated.exports);
    return evaluated.exports;
  }
  return load(path.resolve(relativePath));
}

const sellerA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const sellerB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const blocked = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const pending = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const customer = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const origin = "https://example.supabase.co";
const objectPath = `${sellerA}/1234-abcd.webp`;
const upload = `${origin}/storage/v1/object/public/profile-avatars/${objectPath}`;
const google = "https://lh3.googleusercontent.com/seller-photo=s256-c";
const migration = fs.readFileSync(new URL("../supabase/migrations/20261121064620_public_seller_profile_photos.sql", import.meta.url), "utf8");

async function database() {
  const db = await PGlite.create();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb);
    create table public.profiles(id uuid primary key, avatar_url text, role text, seller_approval_status text, is_blocked boolean, email text);
    create table storage.buckets(id text primary key, public boolean);
    create table storage.objects(bucket_id text, name text, unique(bucket_id,name));
    alter table public.profiles enable row level security;
    alter table auth.users enable row level security;
    insert into storage.buckets values ('profile-avatars',true);
  `);
  for (const [id, role, approval, isBlocked, photo] of [
    [sellerA,"seller","approved",false,upload], [sellerB,"vendor","approved",false,null],
    [blocked,"seller","approved",true,google], [pending,"seller","pending",false,google],
    [customer,"customer","approved",false,google],
  ]) {
    await db.query("insert into public.profiles values ($1,$2,$3,$4,$5,'private@example.com')", [id,photo,role,approval,isBlocked]);
    await db.query("insert into auth.users values ($1,$2::jsonb)", [id,JSON.stringify({ picture: google, email: "private@example.com", phone: "private-number" })]);
  }
  await db.query("insert into storage.objects values ('profile-avatars',$1)", [objectPath]);
  await db.exec(migration);
  return db;
}

async function publicPhotos(db, ids, role = "anon") {
  return db.transaction(async tx => {
    await tx.exec(`set local role ${role}`);
    return (await tx.query("select * from public.find_marketplace_shop_photos($1::uuid[]) order by id", [ids])).rows;
  });
}

test("anonymous home visitors receive uploaded and Google seller photos without private account fields", async () => {
  const db = await database();
  try {
    const photos = await publicPhotos(db, [sellerA,sellerB]);
    assert.deepEqual(photos, [
      { id: sellerA, object_path: objectPath, avatar_url: null },
      { id: sellerB, object_path: null, avatar_url: google },
    ]);
    assert.deepEqual(await publicPhotos(db, [sellerA,sellerB], "authenticated"), photos);
    assert(!JSON.stringify(photos).includes("private"));
    for (const table of ["public.profiles","auth.users","storage.objects"]) {
      await assert.rejects(db.transaction(async tx => {
        await tx.exec("set local role anon");
        return tx.query(`select * from ${table}`);
      }), error => error.code === "42501");
    }
    const wrapper = await db.query("select prosecdef from pg_proc where oid='public.find_marketplace_shop_photos(uuid[])'::regprocedure");
    assert.equal(wrapper.rows[0].prosecdef, false);
  } finally { await db.close(); }
});

test("public projection excludes blocked, unapproved and customer accounts and bounds requests", async () => {
  const db = await database();
  try {
    assert.deepEqual((await publicPhotos(db,[sellerA,blocked,pending,customer])).map(row=>row.id),[sellerA]);
    assert.deepEqual(await publicPhotos(db,[]),[]);
    assert.deepEqual(await publicPhotos(db,null),[]);
    assert.deepEqual(await publicPhotos(db,Array(10).fill(sellerA)),[]);
  } finally { await db.close(); }
});

test("public photos follow saved changes and reject unavailable, foreign or nonpublic uploads", async () => {
  const db = await database();
  try {
    const updated = "https://lh3.googleusercontent.com/updated-photo";
    await db.query("update public.profiles set avatar_url=$1 where id=$2",[updated,sellerA]);
    assert.equal((await publicPhotos(db,[sellerA]))[0].avatar_url,updated);
    await db.query("update public.profiles set avatar_url=$1 where id=$2",[upload,sellerA]);
    await db.exec("update storage.buckets set public=false");
    assert.deepEqual((await publicPhotos(db,[sellerA]))[0],{id:sellerA,object_path:null,avatar_url:google});
    await db.exec("update storage.buckets set public=true; delete from storage.objects");
    assert.equal((await publicPhotos(db,[sellerA]))[0].object_path,null);
    await db.query("insert into storage.objects values ('profile-avatars',$1)",[objectPath]);
    await db.query("update public.profiles set avatar_url=$1 where id=$2",[upload,sellerB]);
    assert.equal((await publicPhotos(db,[sellerB]))[0].object_path,null,"Another seller's upload must not be attributed to this seller");
    await db.query("update auth.users set raw_user_meta_data='{}'::jsonb where id=$1",[sellerB]);
    for (const unsafe of ["https://googleusercontent.com.evil.example/photo","https://user@lh3.googleusercontent.com/photo","http://lh3.googleusercontent.com/photo"]) {
      await db.query("update public.profiles set avatar_url=$1 where id=$2",[unsafe,sellerB]);
      assert.equal((await publicPhotos(db,[sellerB]))[0].avatar_url,null);
    }
  } finally { await db.close(); }
});

test("public avatar URLs stay on the project or trusted Google image hosts", () => {
  const { shopPhotoUrl } = loadModule("lib/shops/shop-photo.ts");
  assert.equal(shopPhotoUrl({id:sellerA,object_path:objectPath},origin),upload);
  assert.equal(shopPhotoUrl({id:sellerB,avatar_url:google},origin),google);
  for (const object_path of [`${sellerB}/1234-abcd.webp`,`${sellerA}/../secret.webp`,`${sellerA}/1234-abcd.webp?x=1`,`${sellerA}/%2e%2e/secret.webp`]) {
    assert.equal(shopPhotoUrl({id:sellerA,object_path},origin),null);
  }
  for (const avatar_url of ["https://googleusercontent.com.evil.example/a","https://evilgoogleusercontent.com/a","http://lh3.googleusercontent.com/a","https://user:pass@lh3.googleusercontent.com/a",upload]) {
    assert.equal(shopPhotoUrl({id:sellerA,avatar_url},origin),null);
  }
});

test("home service supplies actual photos for different sellers without a viewer session", async () => {
  const { findHomeShops } = loadModule("lib/shops/shop-service.ts", {
    "@/lib/products/group-catalog-products": {}, "@/lib/products/product-columns": {}, "@/lib/products/product-mapper": {},
    "@/lib/supabase/public": { publicSupabase: null },
  });
  const previousOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL = origin;
  let photos = [{id:sellerA,object_path:objectPath},{id:sellerB,avatar_url:google}];
  const calls = [];
  const client = { rpc: async (name,args) => {
    calls.push([name,args]);
    if (name === "find_marketplace_shops") return {data:[{id:sellerA,name:"Seller A"},{id:sellerB,name:"Seller B"}],error:null};
    assert.equal(name,"find_marketplace_shop_photos");
    assert.deepEqual(args.shop_ids,[sellerA,sellerB]);
    return {data:photos,error:null};
  } };
  try {
    assert.deepEqual((await findHomeShops(client)).map(shop=>shop.avatarUrl),[upload,google]);
    photos = [{id:sellerA,avatar_url:google}];
    assert.deepEqual((await findHomeShops(client)).map(shop=>shop.avatarUrl),[google,null]);
    assert.equal(calls.filter(([name])=>name === "find_marketplace_shop_photos").length,2);
  } finally {
    if (previousOrigin === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousOrigin;
  }
});
