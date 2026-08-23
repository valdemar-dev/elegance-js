import { makeEl } from "../elements";
import type { ImageProps } from "./core";

const RESERVED = new Set(["sizes", "fill", "priority", "quality", "formats", "widths", "unoptimized", "placeholder"]);

export function Image(props: ImageProps) {
    const opts: Record<string, unknown> = { src: props.src };

    if (props.alt !== undefined) opts.alt = props.alt;
    if (props.width !== undefined) opts.width = props.width;
    if (props.height !== undefined) opts.height = props.height;
    if (props.className !== undefined) opts.className = props.className;
    if (props.style !== undefined) opts.style = props.style;
    if (props.id !== undefined) opts.id = props.id;
    if (props.loading !== undefined) opts.loading = props.loading;
    if (props.decoding !== undefined) opts.decoding = props.decoding;

    if (props.priority) {
        opts.loading = "eager";
        opts.fetchpriority = "high";
    }

    for (const key of Object.keys(props)) {
        if (RESERVED.has(key) || key in opts) continue;

        opts[key] = props[key];
    }

    return makeEl("img")(opts);
}