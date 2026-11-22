import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const migration = fs.readFileSync(new URL("../supabase/migrations/20261121043718_seller_order_inbox.sql", import.meta.url), "utf8");
const buyer = "11111111-1111-4111-8111-111111111111";
const otherBuyer = "22222222-2222-4222-8222-222222222222";
const sellerA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const sellerB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const pendingSeller = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const productA = "00000000-0000-4000-8000-000000000001";
const productB = "00000000-0000-4000-8000-000000000002";
const official = "00000000-0000-4000-8000-000000000003";
const orderId = "00000000-0000-4000-8000-000000000004";

async function database() {
  const db = await PGlite.create();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated,anon;
    create table public.profiles(id uuid primary key,role text,seller_approval_status text,is_blocked boolean default false);
    create table public.products(id uuid primary key,vendor_id uuid references public.profiles(id),name text,seller_name text,stock integer);
    create table public.orders(id uuid primary key default gen_random_uuid(),user_id uuid,order_number text default 'ORDER',status text default 'Pending',
      shipping_name text default 'Test Buyer',shipping_phone text default '+94771234567',shipping_address_line1 text default 'Example delivery address',
      shipping_address_line2 text,shipping_city text default 'Colombo',shipping_state text,shipping_postal_code text,shipping_country text default 'Sri Lanka',
      currency_code text default 'LKR',payment_method text default 'Cash on Delivery',total numeric default 9999);
    create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid references public.orders(id),product_id uuid references public.products(id),
      product_name text,quantity integer,unit_price numeric,line_total numeric);
    alter table public.orders enable row level security;
    create policy customer_orders on public.orders for select to authenticated using (user_id=(select auth.uid()));
    grant select on public.orders,public.profiles,public.products to authenticated;
    insert into public.profiles(id,role,seller_approval_status) values
      ('${buyer}','customer',null),('${otherBuyer}','customer',null),('${sellerA}','seller','approved'),('${sellerB}','vendor','approved'),('${pendingSeller}','seller','pending');
    insert into public.products(id,vendor_id,name,seller_name,stock) values
      ('${productA}','${sellerA}','Product A','Shop A',10),('${productB}','${sellerB}','Product B','Shop B',10),('${official}',null,'Official item','AthiMart',10);
  `);
  await db.exec(migration);
  return db;
}

async function asUser(db, id, action) {
  return db.transaction(async tx => {
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
    await tx.exec("set local role authenticated");
    return action(tx);
  });
}
async function placeOrder(db) {
  await db.exec(`insert into public.orders(id,user_id) values ('${orderId}','${buyer}');
    insert into public.order_items(order_id,product_id,product_name,quantity,unit_price,line_total) values
      ('${orderId}','${productA}','Purchased A',2,100,200),('${orderId}','${productB}','Purchased B',1,50,50),('${orderId}','${official}','Official item',1,20,20);`);
}
async function inbox(db, actor, status = "all", page = 1) {
  return asUser(db, actor, async tx => (await tx.query("select public.seller_order_inbox($1,$2) as inbox", [status,page])).rows[0].inbox);
}
async function advance(db, actor, id, from, to) {
  return asUser(db, actor, async tx => (await tx.query("select public.advance_seller_order($1,$2,$3) as result", [id,from,to])).rows[0].result);
}

test("checkout transaction routes each seller only their purchased items, leaving official dispatch intact", async () => {
  const db = await database();
  try {
    await placeOrder(db);
    const a = await inbox(db,sellerA), b = await inbox(db,sellerB);
    assert.equal(a.total,1); assert.equal(b.total,1);
    assert.equal(a.orders[0].subtotal,200); assert.equal(b.orders[0].subtotal,50);
    assert.equal(a.orders[0].seller_order_lines.length,1);
    assert.equal(a.orders[0].seller_order_lines[0].product_name,"Purchased A");
    assert.equal(a.orders[0].customer_name,"Test Buyer");
    assert.equal(a.orders[0].total,undefined,"The seller must not receive other sellers' grand totals");
    assert(!JSON.stringify(a).includes("Purchased B"));
    assert.equal((await db.query("select count(*)::int as count from public.seller_order_fulfillments")).rows[0].count,2);
    assert.equal((await asUser(db,sellerA,tx=>tx.query("select * from public.orders"))).rows.length,0,"Seller inbox must not require broad base-order access");
    assert.equal((await asUser(db,buyer,tx=>tx.query("select * from public.seller_order_fulfillments"))).rows.length,2);
    assert.equal((await asUser(db,buyer,tx=>tx.query("select * from public.seller_order_lines"))).rows.length,2);
    assert.equal((await asUser(db,otherBuyer,tx=>tx.query("select * from public.seller_order_fulfillments"))).rows.length,0);
    assert.equal((await asUser(db,sellerA,tx=>tx.query("select * from public.seller_order_lines"))).rows.length,1);
  } finally { await db.close(); }
});

test("order ownership, prices and names remain purchase snapshots after a product is renamed or reassigned", async () => {
  const db = await database();
  try {
    await placeOrder(db);
    await db.query("update public.products set vendor_id=$1,name='Renamed',seller_name='Changed shop' where id=$2",[sellerB,productA]);
    const a = await inbox(db,sellerA), b = await inbox(db,sellerB);
    assert.equal(a.orders[0].seller_name,"Shop A");
    assert.equal(a.orders[0].seller_order_lines[0].product_name,"Purchased A");
    assert.equal(a.orders[0].subtotal,200);
    assert.equal(b.orders[0].seller_order_lines.length,1);
  } finally { await db.close(); }
});

test("only the owning approved seller can advance statuses, with stale-write protection and retry safety", async () => {
  const db = await database();
  try {
    await placeOrder(db);
    const id=(await inbox(db,sellerA)).orders[0].id;
    await assert.rejects(advance(db,sellerB,id,"new","accepted"),error=>error.code==="42501");
    await assert.rejects(advance(db,buyer,id,"new","accepted"),error=>error.code==="42501");
    await assert.rejects(advance(db,pendingSeller,id,"new","accepted"),error=>error.code==="42501");
    await assert.rejects(advance(db,sellerA,id,"new","ready"),error=>error.code==="22023");
    assert.equal((await advance(db,sellerA,id,"new","accepted")).status,"accepted");
    assert.equal((await advance(db,sellerA,id,"new","accepted")).status,"accepted");
    assert.equal((await advance(db,sellerA,id,"accepted","preparing")).status,"preparing");
    await assert.rejects(advance(db,sellerA,id,"new","accepted"),error=>error.code==="40001");
    assert.equal((await advance(db,sellerA,id,"preparing","ready")).status,"ready");
    const own=(await asUser(db,buyer,tx=>tx.query("select status from public.seller_order_fulfillments where id=$1",[id]))).rows[0];
    assert.equal(own.status,"ready");
    await assert.rejects(asUser(db,sellerA,tx=>tx.query("update public.seller_order_fulfillments set status='new' where id=$1",[id])),error=>error.code==="42501");
    await assert.rejects(asUser(db,buyer,tx=>tx.query("update public.seller_order_lines set unit_price=0")),error=>error.code==="42501");
  } finally { await db.close(); }
});

test("closed orders and blocked sellers cannot prepare or mutate incoming orders", async () => {
  const db=await database();
  try {
    await placeOrder(db);
    const id=(await inbox(db,sellerA)).orders[0].id;
    await db.query("update public.orders set status='Cancelled' where id=$1",[orderId]);
    await assert.rejects(advance(db,sellerA,id,"new","accepted"),error=>error.code==="22023");
    await db.query("update public.profiles set is_blocked=true where id=$1",[sellerA]);
    await assert.rejects(inbox(db,sellerA),error=>error.code==="42501");
    assert.equal((await asUser(db,sellerA,tx=>tx.query("select * from public.seller_order_fulfillments"))).rows.length,0);
    assert.equal((await db.query("select status from public.seller_order_fulfillments where id=$1",[id])).rows[0].status,"new");
  } finally { await db.close(); }
});

test("a failed checkout transaction rolls back stock, order rows and seller routing together", async () => {
  const db=await database();
  try {
    await assert.rejects(db.transaction(async tx=>{
      await tx.query("update public.products set stock=stock-2 where id=$1",[productA]);
      await tx.query("insert into public.orders(id,user_id) values ($1,$2)",[orderId,buyer]);
      await tx.query("insert into public.order_items(order_id,product_id,quantity,unit_price,line_total) values ($1,$2,2,100,200)",[orderId,productA]);
      await tx.query("insert into public.order_items(order_id,product_id,quantity,unit_price) values ($1,$2,1,null)",[orderId,productB]);
    }));
    assert.equal((await db.query("select stock from public.products where id=$1",[productA])).rows[0].stock,10);
    for(const table of ['orders','order_items','seller_order_fulfillments','seller_order_lines']) assert.equal((await db.query(`select count(*)::int as count from public.${table}`)).rows[0].count,0,table);
  } finally { await db.close(); }
});

test("inbox filters and pagination are bounded and anonymous access is denied", async()=>{
  const db=await database();
  try {
    for(let n=0;n<21;n++) {
      const id=(await db.query("insert into public.orders(user_id) values ($1) returning id",[buyer])).rows[0].id;
      await db.query("insert into public.order_items(order_id,product_id,quantity,unit_price) values ($1,$2,1,100)",[id,productA]);
    }
    assert.equal((await inbox(db,sellerA)).orders.length,20);
    const page2=await inbox(db,sellerA,"new",2);
    assert.equal(page2.total,21); assert.equal(page2.orders.length,1); assert.equal(page2.summary.new,21);
    assert.equal((await inbox(db,sellerA,"ready")).orders.length,0);
    await assert.rejects(inbox(db,sellerA,"all",0),error=>error.code==="22023");
    await assert.rejects(db.transaction(async tx=>{ await tx.exec("set local role anon"); return tx.query("select public.seller_order_inbox()"); }),error=>error.code==="42501");
    const rls=await db.query("select relrowsecurity from pg_class where relname in ('seller_order_fulfillments','seller_order_lines')");
    assert(rls.rows.every(row=>row.relrowsecurity));
    const wrappers=await db.query("select prosecdef from pg_proc where pronamespace='public'::regnamespace and proname in ('seller_order_inbox','advance_seller_order')");
    assert(wrappers.rows.every(row=>!row.prosecdef));
  } finally { await db.close(); }
});

test("the migration refuses an unrelated database instead of changing its order tables",async()=>{
  const db=await PGlite.create();
  try {
    await db.exec("create table orders(id uuid,restaurant_id uuid); create table order_items(id uuid,menu_item_id uuid);");
    await assert.rejects(db.exec(migration),/AthiMart checkout schema is required/);
    await db.exec("rollback");
    assert.equal((await db.query("select to_regclass('public.seller_order_fulfillments') as relation")).rows[0].relation,null);
    assert.equal((await db.query("select count(*)::int as count from information_schema.columns where table_name='orders'")).rows[0].count,2);
  } finally { await db.close(); }
});
