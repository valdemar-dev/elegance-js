#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, "./dev.js");

spawnSync("npx", ["ts-arc", target], { stdio: "inherit" });
