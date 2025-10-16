import esbuild from "esbuild";

export function packModule<T>({
    path,
    globalName,
}: {
    path: string,
    globalName: string,
}) {
    try {
        const result = esbuild.buildSync({
            entryPoints: [path],
            write: false,
            platform: "browser",
            format: "iife",
            bundle: true,
            globalName,
            keepNames: true,
        });
        
        globalThis.__SERVER_PAGE_DATA_BANNER__ += result.outputFiles[0].text;
        
        const errorProxy = new Proxy({}, {
            get() {
                throw new Error("You cannot use client modules in the server.");
            }
        });
        
        return errorProxy as Awaited<T>
    } catch(e) {
        throw `Failed to pack a module. Module: ${path}. Error: ${e}`;
    }
}