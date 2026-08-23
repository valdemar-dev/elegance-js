import { readFile, open } from "node:fs/promises";

export type SourceFormat = "png" | "jpeg" | "webp" | "gif" | "bmp" | "unknown";

export interface ImageDims {
    width: number;
    height: number;
    format: SourceFormat;
}

const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const JPEG_SIG = Buffer.from([0xff, 0xd8, 0xff]);
const GIF87 = "GIF87a";
const GIF89 = "GIF89a";
const RIFF = Buffer.from("RIFF");
const WEBP = Buffer.from("WEBP");
const BMP = Buffer.from("BM");

export function dimsFromBytes(buf: Uint8Array): ImageDims | null {
    const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);

    return detectDims(b);
}

function detectDims(buf: Buffer): ImageDims | null {
    if (buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIG)) return pngDims(buf);
    if (buf.length >= 3 && buf[0] === JPEG_SIG[0] && buf[1] === JPEG_SIG[1] && buf[2] === JPEG_SIG[2]) return jpegDims(buf);

    if (buf.length >= 10) {
        const sig = buf.subarray(0, 6).toString("latin1");

        if (sig === GIF87 || sig === GIF89) {
            return gifDims(buf);
        }
    }

    if (buf.length >= 12 && buf.subarray(0, 4).equals(RIFF) && buf.subarray(8, 12).equals(WEBP)) {
        return webpDims(buf);
    }

    if (buf.length >= 26 && buf.subarray(0, 2).equals(BMP)) return bmpDims(buf);

    return null;
}

function pngDims(buf: Buffer): ImageDims {
    return { 
        width: buf.readUInt32BE(16), 
        height: buf.readUInt32BE(20), 
        format: "png" 
    };
}

function jpegDims(buf: Buffer): ImageDims | null {
    let i = 2;
    while (i + 4 <= buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }

        const marker = buf[i + 1];
        if (marker === 0xd9 || marker === 0xda) return null;

        const len = buf.readUInt16BE(i + 2);
        if (len < 2) return null;

        const isSof = (marker >= 0xc0 && marker <= 0xc3) ||
            (marker >= 0xc5 && marker <= 0xc7) ||
            (marker >= 0xc9 && marker <= 0xcb) ||
            (marker >= 0xcd && marker <= 0xcf);
        if (isSof) {
            if (i + 9 > buf.length) return null;

            return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), format: "jpeg" };
        }

        i += 2 + len;
    }

    return null;
}

function gifDims(buf: Buffer): ImageDims {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8), format: "gif" };
}

function webpDims(buf: Buffer): ImageDims | null {
    const fourcc = buf.subarray(12, 16).toString("latin1");

    if (fourcc === "VP8 " && buf.length >= 30) {
        return { 
            width: buf.readUInt16LE(26) & 0x3fff, 
            height: buf.readUInt16LE(28) & 0x3fff, 
            format: "webp",
        };
    }

    if (fourcc === "VP8L" && buf.length >= 25) {
        const bits = buf.readUInt32LE(21);

        return { 
            width: (bits & 0x3fff) + 1, 
            height: ((bits >>> 14) & 0x3fff) + 1, 
            format: "webp" 
        };
    }

    if (fourcc === "VP8X" && buf.length >= 30) {
        const width = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1;
        const height = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1;

        return { 
            width, 
            height, 
            format: "webp" 
        };
    }

    return null;
}

function bmpDims(buf: Buffer): ImageDims {
    return { 
        width: Math.abs(buf.readInt32LE(18)), 
        height: Math.abs(buf.readInt32LE(22)), 
        format: "bmp" 
    };
}

export async function readDims(filePath: string): Promise<ImageDims | null> {
    const head = Buffer.alloc(65536);

    let fh;
    try {
        fh = await open(filePath, "r");

        const { bytesRead } = await fh.read(head, 0, head.length, 0);
        const detected = detectDims(head.subarray(0, bytesRead));

        if (detected) {
            return detected;
        }
    } catch {
        return null;
    } finally {
        await fh?.close();
    }

    try {
        const full = await readFile(filePath);

        return detectDims(full);
    } catch {
        return null;
    }
}