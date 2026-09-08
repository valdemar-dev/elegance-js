import { createHash } from "node:crypto";
import { relative } from "node:path";

/**
 * `test` decides which file paths the transformer handles, `transform`
 * receives the raw file contents (already processed by earlier matching
 * transformers) and must return CSS
 */
export type CssTransformer = {
    test: RegExp;
    transform: (source: string, file: string) => string | Promise<string>;
};

export type CssModulesConfig = {
    /** Set this to false to treat *.module.css files as plain global stylesheets. */
    enabled?: boolean;
    /**
     * Override how local class names are scoped. this MUST be deterministic!
     * 
     * the same (name, file, css) triplet is compiled independently for the
     * server and client bundles and thusly both results ought to match.
     */
    generateScopedName?: (name: string, file: string, css: string) => string;
};

export type CssConfig = {
    /** Compilers for preprocessor languages (Sass, Less, PostCSS, Tailwind, ..). */
    transformers?: CssTransformer[];
    /** CSS Modules support for `*.module.css` files. Defaults to enabled. */
    modules?: CssModulesConfig;
};

export function isModulesEnabled(config: CssConfig | undefined): boolean {
    if (!config) return true;
    if (!config.modules) return true;

    return config.modules.enabled === true;
}

export function scopedNameGenerator(config: CssConfig | undefined): (name: string, file: string, css: string) => string {
    if (config && typeof config.modules === "object" && config.modules.generateScopedName) {
        return config.modules.generateScopedName;
    }

    return (name: string, file: string): string => {
        const rel  = relative(process.cwd(), file).replace(/\\/g, "/");
        const hash = createHash("sha1").update(rel).digest("base64url").slice(0, 6);

        return `${name}_${hash}`;
    };
}

function stringEnd(src: string, start: number): number {
    const q = src[start]!;

    for (let i = start + 1; i < src.length; i++) {
        if (src[i] === "\\") { 
            i++; 
            continue; 
        }
        
        if (src[i] === q) {
            return i + 1;
        }
    }

    return src.length;
}

function commentEnd(src: string, start: number): number {
    const end = src.indexOf("*/", start + 2);

    return end === -1 ? src.length : end + 2;
}

/**
 * this scopes every class used in a selector (`.button` into `.button_x1y2z3`)
 * then it leaves `:global(...)` selectors untouched, and returns the local -> scoped
 * mapping for use as the JS module export.
 */
export function scopeCssModule(
    source: string,
    file: string,
    generateScopedName?: (name: string, file: string, css: string) => string,
): { css: string; classMap: Record<string, string> } {
    const generate = generateScopedName ?? scopedNameGenerator(undefined);
    const classMap = new Map<string, string>();

    const scope = (name: string): string => {
        let scoped = classMap.get(name);
        
        if (scoped === undefined) {
            scoped = generate(name, file, source);
            classMap.set(name, scoped);
        }
        
        return scoped;
    };

    const scopeSelector = (selector: string): string => {
        let out = "";
        let i   = 0;

        while (i < selector.length) {
            const c = selector[i]!;

            if (c === "/" && selector[i + 1] === "*") {
                const stop = commentEnd(selector, i);

                out += selector.slice(i, stop);
                i = stop;

                continue;
            }

            if (c === "\"" || c === "'") {
                const stop = stringEnd(selector, i);

                out += selector.slice(i, stop);
                i = stop;

                continue;
            }

            if (c === ":" && selector.startsWith("global", i + 1)) {
                let k = i + 7;

                while (k < selector.length && /\s/.test(selector[k]!)) {
                    k++;
                }

                if (selector[k] === "(") {
                    let p  = k + 1;
                    let pd = 1;

                    while (p < selector.length && pd > 0) {
                        if (selector[p] === "(") {
                            pd++;
                        } else if (selector[p] === ")") {
                            pd--;
                        } else if (selector[p] === "\"" || selector[p] === "'") { 
                            p = stringEnd(selector, p); 
                            continue; 
                        }
                        
                        p++;
                    }

                    out += selector.slice(i, p);
                    i = p;
                    
                    continue;
                }
            }

            if (c === "." && /[A-Za-z_-]/.test(selector[i + 1] ?? "")) {
                let j = i + 1;
                
                while (j < selector.length && /[\w-]/.test(selector[j]!)) {
                    j++;
                }
                
                out += "." + scope(selector.slice(i + 1, j));
                i = j;
                
                continue;
            }

            out += c;
            i++;
        }

        return out;
    };

    let css   = "";
    let i     = 0;
    let depth = 0;

    while (i < source.length) {
        const c = source[i]!;

        if (c === "/" && source[i + 1] === "*") {
            const stop = commentEnd(source, i);
            
            css += source.slice(i, stop);
            i = stop;
            
            continue;
        }

        if (c === "\"" || c === "'") {
            const stop = stringEnd(source, i);
            
            css += source.slice(i, stop);
            i = stop;
            
            continue;
        }

        if (c === "{") { 
            depth++; 
            css += c; 
            i++; 
        
            continue; 
        }
        
        if (c === "}") { 
            depth = Math.max(0, depth - 1); 
            css += c; 
            i++; 
        
            continue; 
        }

        let j      = i;
        let stopCh = "";

        while (j < source.length) {
            const cj = source[j]!;

            if (cj === "{" || cj === "}" || cj === ";") { 
                stopCh = cj; 
                break; 
            }
            
            if (cj === "\"" || cj === "'") { 
                j = stringEnd(source, j); 
                continue; 
            }
            
            if (cj === "/" && source[j + 1] === "*") { 
                j = commentEnd(source, j); 
                continue; 
            }
            
            j++;
        }

        const prelude = source.slice(i, j);

        css += stopCh === "{" ? scopeSelector(prelude) : prelude;
        i = j;

        if (stopCh) {
            css += stopCh;
            
            if (stopCh === "{") depth++;
            if (stopCh === "}") depth = Math.max(0, depth - 1);
            
            i++;
        }
    }

    return { 
        css, 
        classMap: Object.fromEntries(classMap) 
    };
}
