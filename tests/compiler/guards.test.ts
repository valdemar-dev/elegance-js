import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformJSX } from "../../src/processing/tsx";
import { transformBundle, generateLayoutBundle } from "../../src/processing/oxc";

const FIXTURES_DIR = fileURLToPath(new URL("fixtures", import.meta.url));

function layoutBundle(name: string): string {
    const filePath = `layouts/${name}.tsx`;
    const src = readFileSync(join(FIXTURES_DIR, `${name}.tsx`), "utf8");
    const { preClientCode } = transformBundle(transformJSX(src, filePath), filePath);
    return generateLayoutBundle(preClientCode, filePath);
}

test("!no-bundle guard throws for reachable server-only declarations", () => {
    assert.throws(() => layoutBundle("guard-no-bundle"), /Server Only Error/);
});

test("!allow-bundling guard throws for reachable unmarked imports", () => {
    assert.throws(() => layoutBundle("guard-allow-bundling"), /Missing allow/);
});
