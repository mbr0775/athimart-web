import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function createLoader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const evaluatedModule = { exports: {} };
    cache.set(file, evaluatedModule);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    });
    const localRequire = name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file), name);
        return load(base + (fs.existsSync(base + ".ts") ? ".ts" : ".tsx"));
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(localRequire, evaluatedModule, evaluatedModule.exports);
    return evaluatedModule.exports;
  }
  return load;
}

function linkHarness(feedback = true) {
  const anchor = { current: null };
  const calls = [], transitions = [];
  const load = createLoader({
    react: { ...React, useRef: () => anchor },
    "next/link": { __esModule: true, default: "next-link" },
    "next/navigation": { useRouter: () => ({ push: (...args) => calls.push(["push", ...args]), replace: (...args) => calls.push(["replace", ...args]) }) },
    "./navigation-feedback": { useNavigationFeedback: () => feedback ? { startNavigation: action => transitions.push(action) } : null },
  });
  return { Link: load("components/navigation/navigation-link.tsx").default, anchor, calls, transitions };
}

test("a menu link starts a root transition that survives the clicked link unmounting", () => {
  const h = linkHarness();
  const element = h.Link({ href: "/shops?city=Colombo#results", children: "Shops", scroll: false });
  element.props.ref({ href: "https://www.athimart.com/shops?city=Colombo#results" });
  let prevented = 0;
  element.props.onNavigate({ preventDefault: () => prevented++ });
  assert.equal(prevented, 1);
  assert.equal(h.transitions.length, 1);
  // Dropdown removal must not discard the actual destination or navigation.
  element.props.ref(null);
  h.transitions[0]();
  assert.deepEqual(h.calls, [["push", "/shops?city=Colombo#results", { scroll: false }]]);
});

test("cancelled navigation never starts a loader or changes route", () => {
  const h = linkHarness();
  const element = h.Link({ href: "/checkout", onNavigate: event => event.preventDefault() });
  element.props.ref({ href: "https://www.athimart.com/checkout" });
  let prevented = false;
  element.props.onNavigate({ preventDefault: () => { prevented = true; } });
  assert(prevented);
  assert.equal(h.transitions.length, 0);
  assert.deepEqual(h.calls, []);
});

test("object hrefs, replacement, refs and native click options are preserved", () => {
  const h = linkHarness();
  const ref = { current: null };
  const onClick = () => {};
  const href = { pathname: "/shop", query: { brand: "A B" } };
  const element = h.Link({ href, replace: true, scroll: false, ref, onClick, target: "_blank", download: "catalog", prefetch: false });
  assert.equal(element.props.href, href);
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.target, "_blank");
  assert.equal(element.props.download, "catalog");
  assert.equal(element.props.prefetch, false);
  const node = { href: "https://www.athimart.com/shop?brand=A%20B" };
  element.props.ref(node);
  assert.equal(ref.current, node);
  // Next itself skips onNavigate for modified clicks, downloads and targets.
  // When it does call it for a client transition, use the rendered anchor URL.
  element.props.onNavigate({ preventDefault() {} });
  h.transitions[0]();
  assert.deepEqual(h.calls, [["replace", "/shop?brand=A%20B", { scroll: false }]]);
});

test("links without a feedback provider retain Next's default navigation", () => {
  const h = linkHarness(false);
  const element = h.Link({ href: "/shop" });
  element.props.ref({ href: "https://www.athimart.com/shop" });
  element.props.onNavigate({ preventDefault: () => assert.fail("Should keep default navigation") });
  assert.deepEqual(h.calls, []);
});

test("store, mobile, seller, admin and legal account UI render the same saved photo and fallback", () => {
  const load = createLoader({
    "@/components/navigation/navigation-link": { __esModule: true, default: "a" },
    "next/navigation": { usePathname: () => "/seller" },
    "@/lib/fonts": { editorialFont: { variable: "editorial" } },
    "motion/react": { useReducedMotion: () => true, AnimatePresence: ({ children }) => children },
  });
  const { ProfileProvider } = load("components/account/profile-provider.tsx");
  const { SiteHeader } = load("components/layout/site-header.tsx");
  const { MobileBottomNav } = load("components/layout/mobile-bottom-nav.tsx");
  const SellerShell = load("components/seller/seller-shell.tsx").default;
  const AdminShell = load("components/admin/admin-shell/admin-shell.tsx").default;
  const { AccountLink } = load("components/account/account-link.tsx");
  const components = [SiteHeader, MobileBottomNav, SellerShell, AdminShell, AccountLink];
  for (const identity of [
    { name: "Saved Customer", avatarUrl: "https://example.invalid/first.webp" },
    { name: "Updated Customer", avatarUrl: "https://example.invalid/second.webp" },
    { name: "No Photo", avatarUrl: null },
  ]) {
    for (const Component of components) {
      const markup = renderToStaticMarkup(React.createElement(ProfileProvider, { identity }, React.createElement(Component, { displayName: "Stale Name", email: "test@example.invalid" })));
      assert(markup.includes(identity.name), Component.name);
      if (identity.avatarUrl) assert(markup.includes(`src="${identity.avatarUrl}"`), Component.name);
      else assert(markup.includes("NP"), Component.name);
      assert(!markup.includes("first.webp") || identity.avatarUrl?.includes("first.webp"), "Previous photo should not be retained after profile refresh");
    }
  }
  const signedOut = renderToStaticMarkup(React.createElement(ProfileProvider, { identity: null }, React.createElement(SiteHeader)));
  assert(signedOut.includes("Sign in"));
  assert(!signedOut.includes("profile photo"));
  assert.equal(renderToStaticMarkup(React.createElement(ProfileProvider, { identity: null }, React.createElement(AccountLink))), "");
});
