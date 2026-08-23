import { test } from "node:test";
import assert from "node:assert/strict";
import { serializePropValue } from "../../src/processing/oxc";

test("serialize: primitives", () => {
    assert.equal(serializePropValue(null), "null");
    assert.equal(serializePropValue(undefined), "undefined");
    assert.equal(serializePropValue(true), "true");
    assert.equal(serializePropValue(42), "42");
    assert.equal(serializePropValue("hi"), '"hi"');
    assert.equal(serializePropValue("</div>"), '"\\u003c/div>"');
});

test("serialize: non-finite numbers become undefined", () => {
    assert.equal(serializePropValue(NaN), "undefined");
    assert.equal(serializePropValue(Infinity), "undefined");
});

test("serialize: arrays and objects", () => {
    assert.equal(serializePropValue([1, "a"]), '[1, "a"]');
    assert.equal(serializePropValue({ a: 1, b: null }), '{ "a": 1, "b": null }');
});

test("serialize: functions serialize by name", () => {
    assert.equal(serializePropValue(() => null), "undefined");
    function named() {}
    assert.equal(serializePropValue(named), "named");
});

test("serialize: atoms serialize as _getAtom calls", () => {
    assert.equal(serializePropValue({ id: "abc", value: 5 }), '_getAtom("abc", 5)');
});
