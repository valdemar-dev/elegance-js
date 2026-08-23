import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformJSX } from "../../src/processing/tsx";
import { transformBundle, generateLayoutBundle } from "../../src/processing/oxc";
import { expectSnapshot } from "../snapshot-helper";

const FIXTURES_DIR = fileURLToPath(new URL("fixtures", import.meta.url));

for (const fixture of readdirSync(FIXTURES_DIR).filter((f) => f.startsWith("layout") && f.endsWith(".tsx"))) {
    const name = fixture.replace(/\.tsx$/, "");
    const filePath = `layouts/${name}.tsx`;
    const src = readFileSync(join(FIXTURES_DIR, fixture), "utf8");

    test(`generateLayoutBundle: ${name}`, () => {
        const { preClientCode } = transformBundle(transformJSX(src, filePath), filePath);
        expectSnapshot(generateLayoutBundle(preClientCode, filePath), `${name}.layout`);
    });
}
