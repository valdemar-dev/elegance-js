import { importContext } from "./build/common";
import { DIST_DIR } from "./constants";
import { richError } from "./error";

/** Returns the absolute path of the output directory. */
export function getOutputDirectory(): string {
    return DIST_DIR;
}

/**
 * Runs `callback` before the compilation of *this build instance* of this
 * page — once per rebuild in dev mode, once per build in prod.
 */
export function preBuildHook(callback: () => Promise<void>): void {
    const store = importContext.getStore();
    if (!store) {
        throw richError({
            title: "Illegal Invocation of preBuildHook",
            cause: "preBuildHook was not called within an ImportContext.",
            hint: "Files that require build hooks must be initially ran during the build-step.",
            doShowStack: false,
        });
    }

    store.preBuildHooks.push(callback);
}

/**
 * Runs `callback` after the compilation of *this build instance* of this
 * page — once per rebuild in dev mode, once per build in prod.
 */
export function postBuildHook(callback: () => Promise<void>): void {
    const store = importContext.getStore();
    if (!store) {
        throw richError({
            title: "Illegal Invocation of postBuildHook",
            cause: "postBuildHook was not called within an ImportContext.",
            hint: "Files that require build hooks must be initially ran during the build-step.",
            doShowStack: false,
        });
    }

    store.postBuildHooks.push(callback);
}

/**
 * Runs `callback` exactly once per page.ts file for the lifetime of the
 * process, regardless of how many times the page is rebuilt.
 */
export function buildCallback(callback: () => Promise<void>): void {
    const store = importContext.getStore();
    if (!store) {
        throw richError({
            title: "Illegal Invocation of buildCallback",
            cause: "buildCallback was not called within an ImportContext.",
            hint: "Files that require build hooks must be initially ran during the build-step.",
            doShowStack: false,
        });
    }

    store.buildCallbacks.push(callback);
}

/**
 * Schedules `input` to be copied to `target` (relative to the output
 * directory) as part of the post-build step for this page instance.
 */
export function publishFile(input: string, target: string): void {
    const store = importContext.getStore();
    if (!store) {
        throw richError({
            title: "Illegal Invocation of publishFile",
            cause: "publishFile was not called within an ImportContext.",
            hint: "Files that require build hooks must be initially ran during the build-step.",
            doShowStack: false,
        });
    }

    store.publishFiles.push({ input, target, });
}
