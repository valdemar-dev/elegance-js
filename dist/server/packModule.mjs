// src/server/packModule.ts
import esbuild from "esbuild";
function packModule({
  path,
  globalName
}) {
  try {
    const result = esbuild.buildSync({
      entryPoints: [path],
      write: false,
      platform: "browser",
      format: "iife",
      bundle: true,
      globalName,
      keepNames: true
    });
    globalThis.__SERVER_PAGE_DATA_BANNER__ += result.outputFiles[0].text;
    const errorProxy = new Proxy({}, {
      get() {
        throw new Error("You cannot use client modules in the server.");
      }
    });
    return errorProxy;
  } catch (e) {
    throw `Failed to pack a module. Module: ${path}. Error: ${e}`;
  }
}
export {
  packModule
};
