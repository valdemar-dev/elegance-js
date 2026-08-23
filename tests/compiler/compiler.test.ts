import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformJSX } from "../../src/processing/tsx";
import { transformBundle, generateSyntheticBundle } from "../../src/processing/oxc";
import { expectSnapshot } from "../snapshot-helper";
import assert from "node:assert";

const FIXTURES_DIR = fileURLToPath(new URL("fixtures", import.meta.url));

for (const fixture of readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".tsx"))) {
    const name = fixture.replace(/\.tsx$/, "");
    const filePath = `pages/${name}.tsx`;
    const src = readFileSync(join(FIXTURES_DIR, fixture), "utf8");

    test(`transformJSX: ${name}`, () => {
        expectSnapshot(transformJSX(src, filePath), `${name}.jsx`);
    });

    test(`transformBundle: ${name}`, () => {
        const jsx = transformJSX(src, filePath);
        const { serverCode, preClientCode } = transformBundle(jsx, filePath);
        expectSnapshot(serverCode, `${name}.server`);
        expectSnapshot(preClientCode, `${name}.client`);
    });
}

test("generateSyntheticBundle: server-actions", () => {
    const src = readFileSync(join(FIXTURES_DIR, "server-actions.tsx"), "utf8");
    const jsx = transformJSX(src, "pages/server-actions.tsx");

    const { preClientCode } = transformBundle(jsx, "pages/server-actions.tsx");

    const bundle = generateSyntheticBundle(preClientCode, "pages/server-actions.tsx", [], []);

    assert.ok(bundle.includes('_action("oNNHTi6"'), "handler should reference _action with id");
    assert.ok(!bundle.includes("serverAction"), "serverAction should be DCE'd from client bundle");
    assert.ok(bundle.includes("export default function __constructor"), "bundle should have a constructor");
});
