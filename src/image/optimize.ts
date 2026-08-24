import { loadWasm, type WasmExports } from "./wasm";
import { dimsFromBytes } from "./dims";

export interface OptimizeVariant {
    input: Uint8Array;
    width: number;
    format: "webp" | "png" | "jpeg";
    quality: number;
}

export interface EncodedImage {
    data: Uint8Array;
    width: number;
    height: number;
}

const WASM_FORMAT: Record<OptimizeVariant["format"], number> = { webp: 0, png: 1, jpeg: 2 };

let wasmExports: WasmExports | null = null;

export async function optimize(variant: OptimizeVariant): Promise<EncodedImage | null> {
    wasmExports ??= await loadWasm();

    return optimizeWithWasm(wasmExports, variant);
}

async function optimizeWithWasm(exports: WasmExports, variant: OptimizeVariant): Promise<EncodedImage | null> {
    const memory = exports.memory;

    const inPtr = exports.malloc(variant.input.byteLength);

    const srcDims = dimsFromBytes(variant.input);
    const outCap = srcDims
        ? srcDims.width * srcDims.height * 4 + 64 * 1024
        : variant.input.byteLength * 2 + 1024;
    const outPtr = exports.malloc(outCap);

    try {
        new Uint8Array(memory.buffer, inPtr, variant.input.byteLength).set(variant.input);

        const outLen = exports.optimize(
            inPtr,
            variant.input.byteLength,
            outPtr,
            outCap,
            variant.width,
            WASM_FORMAT[variant.format],
            variant.quality,
        );

        if (outLen <= 0 || outLen > outCap) return null;

        const data = new Uint8Array(memory.buffer.slice(outPtr, outPtr + outLen));
        const dims = dimsFromBytes(data);

        if (!dims || dims.width === 0 || dims.height === 0) return null;

        return { 
            data, 
            width: dims.width, 
            height: dims.height 
        };
    } finally {
        exports.free(inPtr);
        exports.free(outPtr);
    }
}