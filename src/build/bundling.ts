import esbuild from "esbuild";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative, dirname } from "node:path";
import { globMatch } from "../processing/oxc";
import { getConfig } from "../config";

type PackageRules = {
    name: string;
    bundle: string[];
    noBundle: string[];
};

const packageRulesCache = new Map<string, PackageRules>();

function parseEntry(entry: string): { name: string; glob: string } {
    const e = entry.startsWith("./") ? entry.slice(2) : entry;
    if (e.startsWith("@")) {
        const parts = e.split("/");
        return { name: parts[0] + "/" + parts[1], glob: parts.slice(2).join("/") };
    }
    const parts = e.split("/");
    return { name: parts[0] ?? "", glob: parts.slice(1).join("/") };
}

function subpathOf(specifier: string): string {
    if (specifier.startsWith("@")) {
        return specifier.split("/").slice(2).join("/");
    }
    return specifier.split("/").slice(1).join("/");
}

function loadPackageRules(root: string): PackageRules | undefined {
    const cached = packageRulesCache.get(root);
    if (cached) return cached;

    const pkgJsonPath = join(root, "package.json");
    if (!existsSync(pkgJsonPath)) return undefined;

    let json: any;
    try {
        json = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
    } catch {
        return undefined;
    }

    const elegance = json.elegance;
    if (!elegance || typeof elegance !== "object") return undefined;

    const rules: PackageRules = {
        name: json.name ?? "",
        bundle: Array.isArray(elegance.bundle) ? elegance.bundle : [],
        noBundle: Array.isArray(elegance["no-bundle"]) ? elegance["no-bundle"] : [],
    };

    if (rules.bundle.length === 0 && rules.noBundle.length === 0) return undefined;

    packageRulesCache.set(root, rules);
    return rules;
}

function findPackageRoot(filePath: string): string | null {
    let dir = filePath;
    for (;;) {
        const parent = dirname(dir);
        if (parent === dir) return null;
        if (existsSync(join(dir, "package.json"))) return dir;
        dir = parent;
    }
}

function getPackageRules(specifier: string, resolveDir: string): { path: string; root: string; rules: PackageRules } | null {
    const require_ = createRequire(join(resolveDir, "noop.js"));
    let resolved: string;
    try {
        resolved = require_.resolve(specifier);
    } catch {
        return null;
    }

    const real = realpathSync(resolved);
    const root = findPackageRoot(real);
    if (!root) return null;

    const realRoot = realpathSync(root);
    const rules = loadPackageRules(realRoot);
    if (!rules) return null;

    return { path: real, root: realRoot, rules };
}

export const eleganceBundlePlugin: esbuild.Plugin = {
    name: "elegance-bundle",
    setup(build) {
        build.onResolve({ filter: /^[^./]/ }, async (args) => {
            if (args.path.startsWith("node:") || args.path.startsWith("nodejs:")) return;
            if (!args.resolveDir) return;

            const pkg = getPackageRules(args.path, args.resolveDir);
            if (!pkg) return;

            const subpath = subpathOf(args.path);

            const self = pkg.rules.bundle.some((entry) => globMatch(entry.replace(/^\.\//, ""), subpath));
            if (self) return { path: pkg.path, external: false };

            const config = await getConfig();
            const include = (config as any).bundling?.include ?? [];
            for (const entry of include) {
                const { name, glob } = parseEntry(entry);
                if (name === pkg.rules.name && (glob === "" || globMatch(glob, subpath))) {
                    return { path: pkg.path, external: false };
                }
            }
        });
    },
};

export async function computeBannedGlobs(): Promise<string[]> {
    const config = await getConfig();
    const b = (config as any).bundling ?? {};
    const cwd = process.cwd();
    const globs: string[] = [];

    for (const entry of b.noBundle ?? []) {
        const { name, glob } = parseEntry(entry);
        const require_ = createRequire(join(cwd, "noop.js"));
        let pkgRoot: string | null = null;
        try {
            pkgRoot = dirname(require_.resolve(`${name}/package.json`));
        } catch {
            pkgRoot = null;
        }
        if (pkgRoot) {
            const base = relative(cwd, realpathSync(pkgRoot));
            globs.push(join(base, glob || "**"));
        } else {
            globs.push(entry.startsWith("./") ? entry.slice(2) : entry);
        }
    }

    for (const [root, rules] of packageRulesCache) {
        const base = relative(cwd, root);
        for (const entry of rules.noBundle) {
            globs.push(join(base, entry));
        }
    }

    return globs;
}
