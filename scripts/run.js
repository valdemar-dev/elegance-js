import { startEleganceRuntime } from "elegance-js";
import { join } from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runtimePath = join(__dirname, "elegance.ts");

startEleganceRuntime(runtimePath)
