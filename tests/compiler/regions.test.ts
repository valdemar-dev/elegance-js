import { test } from "node:test";
import assert from "node:assert";
import { generateSyntheticBundle } from "../../src/processing/oxc";

const INLINE_COMPONENT = `
import { readFileSync } from "node:fs";

function incrementCounter() { return 1; }

const Counter = component({ __id: "cnt0001", view() { return __tags.div({}); } });

export default function Page() {
    const html = readFileSync("x.txt");
    return __tags.div({}, Counter({ onIncrement: incrementCounter }, "text"));
}
`;

const REGION = (props: any, children: any[] = []) => [
    [{ __componentId: "cnt0001", props, children }],
];

test("regions: page-owned component is emitted as a call", () => {
    const bundle = generateSyntheticBundle(INLINE_COMPONENT, "pages/counter.tsx",
        REGION({ onIncrement: function incrementCounter() {} }), []);

    assert.ok(bundle.includes("Counter("), "constructor should call the component by its binding name");
    assert.ok(bundle.includes("incrementCounter"), "named fn prop should be referenced");
    assert.ok(!bundle.includes("__cid"), "page-owned regions must not lower to __cid blobs");
    assert.ok(!bundle.includes("readFileSync"), "server-only code referenced by the page fn must not ship");
    assert.ok(!bundle.includes("node:fs"), "fs import must be dropped");
});

test("regions: unrendered component + empty regions drops unused imports", () => {
    const src = `
import { Helper } from "./helper.js";

const Unused = component({ __id: "unused1", view() { return __tags.div({}); } });

export default function Page() {
    return __tags.div({}, Helper());
}
`;
    const bundle = generateSyntheticBundle(src, "pages/unused.tsx", [], []);
    assert.ok(!bundle.includes('"./helper.js"'), "import only used by the dropped page fn must be dropped");
});

test("regions: unresolvable cid throws instead of silently breaking hydration", () => {
    assert.throws(
        () => generateSyntheticBundle(INLINE_COMPONENT, "pages/counter.tsx",
            [[{ __componentId: "missing1", props: {}, children: [] }]], []),
        /Unhydratable Component/,
    );
});

function captureWarn(run: () => void): string {
    let warned = "";
    const orig = console.warn;
    console.warn = (msg?: any) => { warned += String(msg) + "\n"; };
    try { run(); } finally { console.warn = orig; }
    return warned;
}

test("regions: anonymous function prop degrades to undefined with a warning", () => {
    let bundle = "";
    const warned = captureWarn(() => {
        bundle = generateSyntheticBundle(INLINE_COMPONENT, "pages/counter.tsx",
            REGION({ onIncrement: function () {} }), []);
    });
    assert.ok(bundle.includes('"onIncrement": undefined'), "unshippable fn must serialize as undefined");
    assert.match(warned, /Unshippable function prop dropped/);
    assert.match(warned, /function\(\)/);
});

test("regions: function prop with no client binding degrades to undefined with a warning", () => {
    let bundle = "";
    const warned = captureWarn(() => {
        bundle = generateSyntheticBundle(INLINE_COMPONENT, "pages/counter.tsx",
            REGION({ onIncrement: function serverOnlyFn() {} }), []);
    });
    assert.ok(bundle.includes('"onIncrement": undefined'));
    assert.match(warned, /serverOnlyFn/);
});

test("regions: extracted fn closing over a server-only local throws", () => {
    const src = `
import { readFileSync } from "node:fs";

const Counter = component({ __id: "cnt0001", view() { return __tags.div({}); } });

export default function Page() {
    const secret = readFileSync("key.txt");
    const getSecret = () => secret;
    return __tags.div({}, Counter({ getSecret }));
}
`;
    assert.throws(
        () => generateSyntheticBundle(src, "pages/counter.tsx",
            REGION({ getSecret: function getSecret() { return "x"; } }), []),
        /Unshippable Function Closure/,
    );
});

test("regions: nested slot descriptor becomes a nested call, not serialized closures", () => {
    const bundle = generateSyntheticBundle(INLINE_COMPONENT, "pages/counter.tsx",
        REGION({}, [{ __type: "live", __componentId: "cnt0001", props: { step: 2 }, children: ["inner"] }]), []);

    assert.ok((bundle.match(/Counter\(/g) ?? []).length >= 2, "nested descriptor must be emitted as a call");
    assert.ok(!bundle.includes("__definition"), "component machinery must never be serialized");
});

test("regions: nested slot descriptor with unresolvable cid throws", () => {
    assert.throws(
        () => generateSyntheticBundle(INLINE_COMPONENT, "pages/counter.tsx",
            REGION({}, [{ __type: "live", __componentId: "missing2", props: {}, children: [] }]), []),
        /Unhydratable Component/,
    );
});

test("regions: layout-owned cid stays a __cid blob", () => {
    const src = `
const Counter = component({ __id: "cnt0001", view() { return __tags.div({}); } });

export default function Page() {
    return __tags.div({}, Counter({}));
}
`;
    const bundle = generateSyntheticBundle(src, "pages/counter.tsx", [], []);
    assert.ok(!bundle.includes("__cid"));

    const bundle2 = generateSyntheticBundle(src, "pages/counter.tsx", REGION({}), []);
    assert.ok(bundle2.includes("Counter("));
});

test("regions: atoms serialize as _getAtom globals", () => {
    const bundle = generateSyntheticBundle(INLINE_COMPONENT, "pages/counter.tsx",
        REGION({ count: { id: "atom0001", value: 5 } }), []);

    assert.ok(bundle.includes('_getAtom("atom0001"'), "atoms must reference the client runtime global");
});
