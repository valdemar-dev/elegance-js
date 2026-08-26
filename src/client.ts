declare const __VIEW_TRANSITIONS: boolean;

declare global {
    var __initialAtomValues: Record<string, any> | undefined;
    var __bind: (el: Element, type: string, fn: Function, owner: any) => void;
    var __navCallbacks: Array<() => void>;
    var __hydrate: (regions: Array<any[]>, handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }> }>) => Promise<void> | void;
}

const RUNTIME_URL = `${location.origin}/client-runtime.js`;
const ensureRuntime = () =>
    (globalThis as any).__hydrate ? Promise.resolve() : import(RUNTIME_URL);

const pageLoadCallbacks: Array<{ pathname: string; cb: () => any; options: Record<string, any> }> = [];
const cleanupFns = new Map<string, Array<() => void>>();

const onPageLoad = (cb: (...args: any) => any, options: Record<string, any> = {}) =>
    pageLoadCallbacks.push({ pathname: location.pathname, cb, options });

function runPageCleanup() {
    for (const [scope, fns] of cleanupFns) {
        if (!location.pathname.startsWith(scope)) {
            fns.forEach(f => f());
            cleanupFns.delete(scope);
        }
    }
}

function runPageCallbacks() {
    const current = location.pathname;
    for (const { pathname, cb, options } of pageLoadCallbacks) {
        const scoped = options?.type === "scoped";
        const unscoped = !options?.type || options.type === "unscoped";
        if (unscoped) {
            const cleanup = cb();
            if (typeof cleanup === "function") cleanupFns.get("/")?.push(cleanup);
            continue;
        }
        const scope = scoped ? pathname.slice(0, pathname.lastIndexOf("/")) || "/" : pathname;
        if (!current.startsWith(scope)) continue;
        if (scoped && cleanupFns.has(scope)) continue;
        if (!cleanupFns.has(scope)) cleanupFns.set(scope, []);
        const cleanup = cb();
        if (typeof cleanup === "function") cleanupFns.get(scope)!.push(cleanup);
    }
}

const delegatedHandlers = new WeakMap<Element, { inst: any; handlers: Record<string, Function> }>();

function _delegatedListener(e: any) {
    let target = e.target;
    while (target && target instanceof Element) {
        const meta = delegatedHandlers.get(target);
        if (meta?.handlers[e.type]) {
            Object.defineProperties(e, {
                currentTarget: { configurable: true, value: target },
                target: { configurable: true, value: target },
                delegateTarget: { configurable: true, value: target },
            });
            try {
                meta.handlers[e.type].call(target, meta.inst?._self ?? null, e);
            } catch (err) {
                meta.inst?._handleError(err);
            }
            return;
        }
        target = target.parentElement;
    }
}

const _registeredEventTypes = new Set<string>();
function ensureEventDelegated(eventType: string) {
    if (_registeredEventTypes.has(eventType)) return;
    _registeredEventTypes.add(eventType);
    document.addEventListener(eventType, _delegatedListener, true);
}

for (const et of "click,input,change,submit,keydown,keyup,mousemove,mousedown,mouseup,mouseenter,mouseleave,mouseover,mouseout,focus,blur,pointerdown,pointerup,pointermove".split(","))
    ensureEventDelegated(et);

function bind(el: Element, type: string, fn: Function, owner: any) {
    let m = delegatedHandlers.get(el);
    if (!m) delegatedHandlers.set(el, m = { inst: owner, handlers: {} });
    else m.inst = owner;
    ensureEventDelegated(type);
    m.handlers[type] = fn;
}

globalThis.__bind = bind;
globalThis.__navCallbacks = [];

const elementFactory = (tag: string) => (options: any, ...children: any[]) => {
    const isOptions = options !== null && typeof options === "object" && !Array.isArray(options) && !options?.__type;
    const raw = isOptions ? children : [options, ...children];
    let kids: any[] = raw;
    for (let i = 0; i < raw.length; i++) {
        if (Array.isArray(raw[i])) { kids = raw.flat(Infinity); break; }
    }
    const merged: any[] = [];
    for (const child of kids) {
        if ((typeof child === "string" || typeof child === "number") &&
            (typeof merged[merged.length - 1] === "string" || typeof merged[merged.length - 1] === "number")) {
            merged[merged.length - 1] = String(merged[merged.length - 1]) + String(child);
        } else {
            merged.push(child);
        }
    }
    return { __type: "element", tag, options: isOptions ? options : {}, children: merged };
};

const tagFactoryCache = new Map<string, (options: any, ...children: any[]) => any>();

(globalThis as any).__tags = new Proxy({}, {
    get(_, tag: string) {
        let fn = tagFactoryCache.get(tag);
        if (!fn) tagFactoryCache.set(tag, fn = elementFactory(tag));
        return fn;
    },
});

const importBundle = (tag: HTMLScriptElement): Promise<any> => {
    const src = tag.getAttribute("src");
    if (src) return import(new URL(src, location.href).href);
    const blobCode = tag.textContent!.replace(
        /(['"])\/chunks\//g,
        `$1${location.origin}/chunks/`,
    );
    return import(URL.createObjectURL(new Blob([blobCode], { type: "text/javascript" })));
};

function patchHead(nh: HTMLHeadElement): void {
    const nt = nh.querySelector("title");
    if (nt) {
        let t = document.head.querySelector("title");
        if (!t) { t = document.createElement("title"); document.head.appendChild(t); }
        if (t.textContent !== nt.textContent) t.textContent = nt.textContent;
    }

    for (const m of nh.querySelectorAll<HTMLMetaElement>("meta")) {
        const name = m.getAttribute("name");
        const property = m.getAttribute("property");
        const equiv = m.getAttribute("http-equiv");
        const charset = m.getAttribute("charset");
        const sel = name ? `meta[name="${name}"]`
            : property ? `meta[property="${property}"]`
            : equiv ? `meta[http-equiv="${equiv}"]`
            : charset ? "meta[charset]" : null;
        const existing = sel && document.head.querySelector(sel);
        if (existing) {
            for (const a of m.getAttributeNames()) existing.setAttribute(a, m.getAttribute(a)!);
        } else {
            document.head.appendChild(m.cloneNode(true));
        }
    }

    const hrefs = new Set(
        [...document.head.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]")].map(l => l.href)
    );
    for (const l of nh.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]")) {
        if (!hrefs.has(l.href)) document.head.appendChild(l.cloneNode(true));
    }

    const srcs = new Set(
        [...document.head.querySelectorAll<HTMLScriptElement>("script[src]")].map(s => s.src)
    );
    for (const s of nh.querySelectorAll<HTMLScriptElement>("script[src]")) {
        if (s.getAttribute("data-bundle") === "true" || srcs.has(s.src)) continue;
        const ns = document.createElement("script");
        for (const a of s.getAttributeNames()) ns.setAttribute(a, s.getAttribute(a)!);
        document.head.appendChild(ns);
    }
}

async function loadPage(
    url: string,
    regions: Array<any[]>,
    handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }> }>,
    doc?: Document,
): Promise<void> {
    if (!doc) {
        doc = new DOMParser().parseFromString(
            await (await fetch(url, { headers: { Accept: "text/html" } })).text(),
            "text/html",
        );
    }

    const hyd = doc.querySelector('script[data-tag="hydration"]');
    if (hyd) try { globalThis.__initialAtomValues = JSON.parse(hyd.textContent || "{}").atoms || {}; } catch {}

    patchHead(doc.head);

    const next = new Set(doc.body.getAttributeNames());
    for (const a of document.body.getAttributeNames()) if (!next.has(a)) document.body.removeAttribute(a);
    for (const a of next) document.body.setAttribute(a, doc.body.getAttribute(a)!);

    document.body.replaceChildren(...Array.from(doc.body.childNodes));

    if (regions?.length || handlers?.length) await ensureRuntime();
    await globalThis.__hydrate?.(regions, handlers);
}

function scroll() {
    if (location.hash) {
        const el = document.querySelector(location.hash);
        el?.scrollIntoView();
    } else {
        scrollTo(0, 0);
    }
}

const prefersReducedMotion = () => ((typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null)?.matches) ?? false;

async function navigate(url: string, push = true, vt?: boolean): Promise<void> {
    const target = new URL(url, location.href);
    if (target.pathname === location.pathname) {
        if (push && target.href !== location.href) history.pushState(null, "", url);
        scroll();
        return;
    }
    if (push) history.pushState(null, "", url);

    const doc = new DOMParser().parseFromString(
        await (await fetch(url, { headers: { Accept: "text/html" } })).text(),
        "text/html",
    );
    const tag = doc.querySelector<HTMLScriptElement>(`script[data-bundle="true"][data-pathname="${target.pathname}"]`);

    if (doc.querySelector('template[data-region]')) await ensureRuntime();

    let mod: any;
    if (tag) {
        mod = await importBundle(tag);
    } else {
        try {
            mod = await import(`${target.pathname === "/" ? "" : target.pathname}/bundle.js`);
        } catch {
            console.error("navigate: no bundle found for this pathname.");
            return;
        }
    }

    runPageCleanup();

    const result = (mod.default ?? (() => null))();
    if (!Array.isArray(result?.regions)) {
        console.error("navigate: target is not an Elegance page.");
        return;
    }
    if (result.handlers?.length && !globalThis.__hydrate) await ensureRuntime();

    const apply = () => loadPage(url, result.regions, result.handlers, doc);
    const wantsVT = typeof document.startViewTransition === "function" && !prefersReducedMotion() && (vt ?? __VIEW_TRANSITIONS);

    if (wantsVT) {
        const t = document.startViewTransition(() => apply());
        try { await t.finished; } catch {}
    } else {
        await apply();
    }

    runPageCallbacks();
    globalThis.__navCallbacks.forEach(f => f());
    scroll();
}

async function hydrate() {
    const bundleTag = document.querySelector<HTMLScriptElement>(
        `script[data-bundle="true"][data-pathname="${location.pathname}"]`,
    );
    if (!bundleTag) return;

    if (document.querySelector('template[data-region]')) await ensureRuntime();

    const mod = await importBundle(bundleTag);
    const result = (mod.default || (() => null))();
    if (!Array.isArray(result?.regions)) return;
    if (result.handlers?.length && !globalThis.__hydrate) await ensureRuntime();

    await globalThis.__hydrate?.(result.regions, result.handlers);
    runPageCallbacks();
    scroll();

    window.addEventListener("beforeunload", () => runPageCleanup());
}

window.addEventListener("popstate", () => navigate(location.pathname + location.search + location.hash, false));

async function _action(target: string, params: unknown) {
    const res = await fetch(`${location.origin}/__action`, {
        method: "POST",
        body: JSON.stringify(params ?? {}),
        headers: {
            "Content-Type": "application/json",
            "Elegance-Action": target,
        },
    });
    if (!res.ok) return null;
    return res.json();
}

Object.assign(globalThis, { navigate, onPageLoad, _action, });

requestAnimationFrame(() => hydrate());