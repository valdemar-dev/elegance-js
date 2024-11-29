import esbuild from "esbuild";
declare const generateHTMLTemplate: (metadata: () => BuildableElement<ElementTags>, pageSriptSrc: string) => string;
declare function compile({ pageDirectory, minify, suppressConsole }: {
    pageDirectory: string;
    minify: boolean;
    suppressConsole: boolean;
}): Promise<{
    browserFiles: esbuild.BuildContext<{
        entryPoints: string[];
        bundle: true;
        minify: boolean;
        platform: "browser";
        outdir: string;
        drop: "console"[] | undefined;
        format: "esm";
        loader: {
            ".js": "js";
            ".ts": "ts";
        };
    }>;
    serverFiles: esbuild.BuildContext<{
        entryPoints: string[];
        bundle: false;
        outdir: string;
        drop: "console"[] | undefined;
        platform: "node";
        format: "esm";
    }>;
}>;
export { compile, generateHTMLTemplate };
