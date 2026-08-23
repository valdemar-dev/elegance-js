import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformJSX } from "../../src/processing/tsx";
import { transformBundle } from "../../src/processing/oxc";
import { expectSnapshot } from "../snapshot-helper";

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
