import type esbuild from "esbuild";
import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getConfig } from "../config";
import {
    isModulesEnabled,
    scopedNameGenerator,
    scopeCssModule,
    type CssConfig,
    type CssTransformer,
} from "./core";

const STYLE_FILTER = /\.(css|scss|sass|less|styl|stylus|pcss|postcss)$/i;
const MODULE_FILTER = /\.module\.(css|scss|sass|less|styl|stylus|pcss|postcss)$/i;
const VIRTUAL_SUFFIX = "!elegance-css";
const VIRTUAL_NAMESPACE = "elegance-css";

/** scoped css of module stylesheets, keyed by the real file path. */
const scopedCssCache = new Map<string, string>();

async function runTransformers(
    transformers: CssTransformer[],
    source: string,
    file: string,
): Promise<string> {
    let css = source;

    for (const transformer of transformers) {
        if (!transformer.test.test(file)) continue;
        transformer.test.lastIndex = 0;

        css = await transformer.transform(css, file);
    }

    return css;
}

/**
 * this handles stylesheet imports from pages, layouts and their dependencies
 * the plugin runs in both the server and client builds, so class maps are identical on both sides
 */
export const eleganceCssPlugin: esbuild.Plugin = {
    name: "elegance-css",
    setup(build) {
        build.onResolve({ filter: /!elegance-css$/ }, (args) => ({
            path: args.path,
            namespace: VIRTUAL_NAMESPACE,
        }));

        build.onLoad({ filter: /.*/, namespace: VIRTUAL_NAMESPACE }, (args) => {
            const real = args.path.slice(0, -VIRTUAL_SUFFIX.length);
            const css = scopedCssCache.get(real);

            return {
                contents: css ?? "",
                loader: "css",
                resolveDir: dirname(real),
            };
        });

        build.onLoad({ filter: STYLE_FILTER }, async (args): Promise<esbuild.OnLoadResult> => {
            const config = await getConfig();
            const cssConfig = config.css as CssConfig | undefined;

            const source = await readFile(args.path, "utf-8");
            const css = await runTransformers(cssConfig?.transformers ?? [], source, args.path);

            if (MODULE_FILTER.test(args.path) && isModulesEnabled(cssConfig)) {
                const { css: scoped, classMap } = scopeCssModule(
                    css,
                    args.path,
                    scopedNameGenerator(cssConfig),
                );

                scopedCssCache.set(args.path, scoped);

                return {
                    contents: `import ${JSON.stringify(args.path + VIRTUAL_SUFFIX)};\nexport default ${JSON.stringify(classMap)};`,
                    loader: "js",
                    resolveDir: dirname(args.path),
                };
            }

            return {
                contents: css,
                loader: "css",
                resolveDir: dirname(args.path),
            };
        });
    },
};
