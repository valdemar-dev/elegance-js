import { join } from "node:path";
import { getConfig } from "./config";

export type OutputOptions = {
    outputDirectory?: string,
    pagesDirectory?: string,
    publicDirectory?: string,
};

export let OUT_DIR: string;
export let DIST_DIR: string;
export let CACHE_DIR: string;
export let PAGES_DIR: string;

export async function loadPaths() {
    const config = await getConfig();

    OUT_DIR = config.output.outputDirectory!;
    DIST_DIR = join(OUT_DIR, "dist");
    CACHE_DIR = join(OUT_DIR, "cache");

    PAGES_DIR = config.output.pagesDirectory!;
}