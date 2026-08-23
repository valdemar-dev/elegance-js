import { AssertionError } from "node:assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SNAPSHOT_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "compiler", "__snapshots__");
const UPDATE = process.env.UPDATE_SNAPSHOTS === "1";

export function expectSnapshot(actual: string, name: string): void {
    const file = join(SNAPSHOT_DIR, `${name}.snap`);
    const body = `// snapshot of: ${name}\n\n${actual}`;

    if (!existsSync(file) || UPDATE) {
        mkdirSync(SNAPSHOT_DIR, { recursive: true });
        writeFileSync(file, body);
        return;
    }

    const expected = readFileSync(file, "utf8");
    if (expected === body) return;

    const expectedLines = expected.split("\n");
    const actualLines = body.split("\n");

    let firstDiff = 0;
    while (firstDiff < expectedLines.length && expectedLines[firstDiff] === actualLines[firstDiff]) firstDiff++;

    const context = (lines: string[], start: number) =>
        lines.slice(start, start + 10).map((l, i) => `${start + i + 1} | ${l}`).join("\n");

    throw new AssertionError({
        message:
            `Snapshot mismatch for "${name}" (first diff at line ${firstDiff + 1}).\n` +
            `Run \`npm run test:update\` to regenerate.\n\n` +
            `expected:\n${context(expectedLines, firstDiff)}\n\n` +
            `actual:\n${context(actualLines, firstDiff)}`,
    });
}
