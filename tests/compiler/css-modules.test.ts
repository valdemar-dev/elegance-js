import { test } from "node:test";
import assert from "node:assert/strict";
import { scopeCssModule } from "../../src/css/core";

const FILE = "/proj/styles/button.module.css";

test("scopes top-level class selectors and returns the class map", () => {
    const { css, classMap } = scopeCssModule(
        ".button { color: red; }\n.button:hover { color: blue; }\n",
        FILE,
        (name) => `${name}_x1`,
    );

    assert.equal(classMap.button, "button_x1");
    assert.ok(css.includes(".button_x1 { color: red; }"));
    assert.ok(css.includes(".button_x1:hover { color: blue; }"));
    assert.ok(!css.includes(".button {"));
});

test("leaves :global() selectors untouched", () => {
    const { css, classMap } = scopeCssModule(
        ":global(.card) .button { color: red; }\n:global(html) { scroll-behavior: smooth; }\n",
        FILE,
        (name) => `${name}_s`,
    );

    assert.ok(css.includes(":global(.card) .button_s {"));
    assert.ok(css.includes(":global(html) {"));
    assert.equal(classMap.button, "button_s");
});

test("does not scope declarations, strings, or at-rule bodies", () => {
    const { css } = scopeCssModule(
        "@media (min-width: 600px) { .a { content: \".b\"; } }\n" +
        "@keyframes spin { from { transform: rotate(0); } }\n" +
        ".icon { background: url(\"./img.png\"); }\n",
        FILE,
        (name) => `${name}_z`,
    );

    assert.ok(css.includes("@media (min-width: 600px) {"));
    assert.ok(css.includes(".a_z {"));
    assert.ok(css.includes('content: ".b"'));
    assert.ok(css.includes("@keyframes spin {"));
    assert.ok(css.includes('background: url("./img.png")'));
    assert.ok(css.includes(".icon_z {"));
});

test("composite selectors are scoped per class", () => {
    const { css, classMap } = scopeCssModule(
        ".list > .item, .list .item.active { color: red; }\n",
        FILE,
        (name) => `${name}_q`,
    );

    assert.ok(css.includes(".list_q > .item_q, .list_q .item_q.active_q {"));
    assert.equal(classMap.item, "item_q");
    assert.equal(classMap.active, "active_q");
});

test("nested at-rules keep working", () => {
    const { css, classMap } = scopeCssModule(
        "@supports (display: grid) {\n  @media screen {\n    .grid { display: grid; }\n  }\n}\n",
        FILE,
        (name) => `${name}_n`,
    );

    assert.ok(css.includes(".grid_n {"));
    assert.equal(classMap.grid, "grid_n");
});
