import { test } from "node:test";
import assert from "node:assert/strict";
import { installDomStub } from "./dom-stub";
import { freshClient } from "./client-instance";

installDomStub();

test("components: view is an identity function", async () => {
    const client = await freshClient();
    const fn = () => null;
    assert.equal(client.view(fn), fn);
});

test("components: component() without a view logs an error and returns undefined", async () => {
    const client = await freshClient();
    const orig = console.error;
    let logged = "";
    console.error = (msg: string) => { logged = String(msg); };
    try {
        assert.equal(client.component({ __id: "broken" }), undefined);
    } finally {
        console.error = orig;
    }
    assert.match(logged, /did not provide a view/);
});

test("components: component() returns a factory producing live descriptors", async () => {
    const client = await freshClient();
    const Comp = client.component({ __id: "counter", view: client.view(() => null) })!;
    const desc = Comp({ initial: 5 }, ["child"]);

    assert.equal(desc.__type, "live");
    assert.equal(desc.__componentId, "counter");
    assert.equal(desc.props.initial, 5);
    assert.deepEqual(desc.children, ["child"]);
    assert.match(desc.__instanceId, /^counter#\d+$/);
});

test("components: each render gets a fresh instance id", async () => {
    const client = await freshClient();
    const Comp = client.component({ __id: "counter", view: client.view(() => null) })!;
    assert.notEqual(Comp().__instanceId, Comp().__instanceId);
});

test("components: rawHTML marks content", async () => {
    const client = await freshClient();
    assert.deepEqual(client.rawHTML("<b>hi</b>"), { content: "<b>hi</b>", __rawHTML: true });
});
