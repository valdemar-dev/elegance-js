#!/usr/bin/env node

import { startEleganceRuntime } from "elegance-js";
import { join, dirname } from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runtimePath = join(__dirname, "elegance_dev.ts");

startEleganceRuntime(runtimePath);