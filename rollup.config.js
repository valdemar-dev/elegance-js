import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import inject from '@rollup/plugin-inject';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import { fileURLToPath } from 'url';

import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    input: [
        "./src/components/Link.ts",
        "./src/components/Link.ts",
        "./src/components/Observer.ts",
        "./src/components/ElegancePageRater.ts",
        "./src/helpers/getGlobals.ts",
        "./src/bindElements.ts",
        "./src/build.ts",
        "./src/client.ts",
        "./src/elements.ts",
        "./src/global.ts",
        "./src/index.ts",
        "./src/renderer.ts",
        "./src/router.ts",
        "./src/state.ts",
        "./src/server/render.ts",
        "./src/server/renderer.ts",
    ],
    output: [
        {
            dir: 'dist', 
            format: 'esm',  
            sourcemap: true,  
            entryFileNames: '[name].esm.mjs',
            preserveModules: true,
            preserveModulesRoot: 'src'
        },
    ],
    plugins: [        
        replace({
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        inject({
            "__dirname": __dirname,
        }),
    ],
    external: [],
};
