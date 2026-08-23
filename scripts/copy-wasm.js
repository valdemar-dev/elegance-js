import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const src = join(import.meta.dirname, "..", "src", "image", "opt.wasm");
const dst = join(import.meta.dirname, "..", "dist", "image", "opt.wasm");

if (existsSync(src)) {
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    console.log("Copied opt.wasm to dist/image/");
} else {
    console.log("Skipping opt.wasm copy (not yet built — run scripts/build-wasm.sh)");
}