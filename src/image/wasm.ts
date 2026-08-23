import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface WasmExports {
    optimize: (
        inPtr: number,
        inLen: number,
        outPtr: number,
        outCap: number,
        destWidth: number,
        format: number,
        quality: number,
    ) => number;

    malloc: (size: number) => number;
    free: (ptr: number) => void;

    memory: WebAssembly.Memory;
}

let instance: Promise<WasmExports> | null = null;

export function loadWasm(): Promise<WasmExports> {
    if (!instance) instance = load();
    return instance;
}

async function load(): Promise<WasmExports> {
    const bytes = await readFile(join(import.meta.dirname, "opt.wasm"));

    const { instance: wasm } = await WebAssembly.instantiate(bytes, {});

    return wasm.exports as unknown as WasmExports;
}