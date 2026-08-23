import { test } from "node:test";
import assert from "node:assert/strict";
import { installDomStub } from "./dom-stub";
import { freshClient } from "./client-instance";

installDomStub();

test("atoms: _getAtom returns the same atom for the same id", async () => {
    const client = await freshClient();
    const a = client._getAtom("count", 0);
    assert.equal(client._getAtom("count", 0), a);
});

test("atoms: initial value is used when no IAV payload exists", async () => {
    const client = await freshClient();
    const a = client._getAtom("name", "world");
    assert.equal(a.value, "world");
});

test("atoms: setting a value notifies tracked callbacks", async () => {
    const client = await freshClient();
    const a = client._getAtom("count", 0);
    const seen: any[] = [];
    const cb = (v: any) => seen.push(v);

    client.track(a, cb);
    a.value = 1;
    a.value = 2;
    assert.deepEqual(seen, [1, 2]);

    client.untrack(a, cb);
    a.value = 3;
    assert.deepEqual(seen, [1, 2]);
});

test("atoms: setting the same value does not notify", async () => {
    const client = await freshClient();
    const a = client._getAtom("count", 1);
    const seen: any[] = [];

    client.track(a, (v: any) => seen.push(v));
    a.value = 1;
    assert.deepEqual(seen, []);
});
