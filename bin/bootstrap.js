#!/usr/bin/env node

import { execSync } from "child_process";
import { cpSync, existsSync } from "fs";
import { join } from "path";
const __dirname = import.meta.dirname;

function bootstrap() {
    if (existsSync("elegance.config.ts") || existsSync("pages")) {
        console.error("The current directory already contains an Elegance project.");
        return;
    }

    cpSync(join(__dirname, "./template_project"), process.cwd(), { recursive: true, })
    execSync("npm install esbuild ts-arc")
}

bootstrap();