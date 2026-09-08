declare const __VIEW_TRANSITIONS: boolean;

declare global {
    var __initialAtomValues: Record<string, any> | undefined;
    var _getAtom: (id: string, initial?: any) => ReturnType<typeof atom>;
    var __bind: (el: Element, type: string, fn: Function, owner: any) => void;
    var __navCallbacks: Array<() => void>;
    var __hydrate: (regions: Array<any[]>, handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }> }>) => Promise<void> | void;
}

const doc = document;
const loc = location;
const TE = 3, EL = 1;

const qs = (e: any, s: string) => e.querySelector(s);
const qa = (e: any, s: string) => e.querySelectorAll(s);
const ga = (e: any, k: string) => e.getAttribute(k);
const gan = (e: any) => e.getAttributeNames();
const ac = (e: any, c: any) => e.appendChild(c);
const rc = (o: any, n: any) => (o.parentNode?.replaceChild(n, o), n);
const rawToDom = (s: string): Node => {
    const f = doc.createRange().createContextualFragment(s);
    return f.firstElementChild ?? f.firstChild ?? doc.createTextNode("");
};
const fetchDoc = async (u: string) =>
    new DOMParser().parseFromString(await (await fetch(u, { headers: { Accept: "text/html" } })).text(), "text/html");
const bpSel = (p: string) => `script[data-bundle="true"][data-pathname="${p}"]`;

{
    const _s = qs(doc, 'script[data-tag="iav"]');
    if (_s) try { globalThis.__initialAtomValues = JSON.parse(_s.textContent || "{}").atoms || {}; } catch {}
}

const CHUNK_SIZE = 512;

let currentInst: any = null;

function atom(id: string, initial: any) {
    let _v = initial;
    const _L = new Set<any>();
    const _C = new Set<(v: any) => void>();
    const self = {
        id,
        get value() {
            if (currentInst) { _L.add(currentInst); currentInst._deps.add(self); }
            return _v;
        },
        set value(n: any) {
            if (!Object.is(_v, n)) {
                _v = n;
                _L.forEach(c => c._md());
                _C.forEach(c => c(n));
            }
        },
        _removeListener(c: any) { _L.delete(c); },
        _addUserCallback(c: (_: any) => void) { _C.add(c); },
        _removeUserCallback(c: (_: any) => void) { _C.delete(c); },
    };
    return self;
}

const atomRegistry = new Map<string, ReturnType<typeof atom>>();

function _getAtom(id: string, initial?: any) {
    if (atomRegistry.has(id)) return atomRegistry.get(id)!;
    const sv = globalThis.__initialAtomValues?.[id];
    const a = atom(id, sv !== undefined ? sv : initial);
    atomRegistry.set(id, a);
    return a;
}

const track = (a: ReturnType<typeof atom>, cb: (v: any) => void) => a._addUserCallback(cb);
const untrack = (a: ReturnType<typeof atom>, cb: (v: any) => void) => a._removeUserCallback(cb);

const componentConfigs = new Map<string, any>();
const instanceMap = new Map<string, any>();
let nextInstanceId = 0;
const view = (fn: Function) => fn;

interface ClientComponentConfig extends ComponentConfig {
    __id: string,
};

function component(cfg: ClientComponentConfig) {
    const { __id, view: viewFn } = cfg;

    if (!viewFn) {
        console.error(`Component "${__id}": did not provide a view() method.`);
        return;
    }

    componentConfigs.set(__id, cfg);

    return (props?: Record<string, unknown>, ...childrenArgs: Array<VirtualNode>) => {
        const children: Array<VirtualNode> = [];
        const stack = [...childrenArgs];
        while (stack.length > 0) {
            const item = stack.shift()!;
            if (Array.isArray(item)) stack.unshift(...item);
            else children.push(item);
        }
        return {
            __type: "live",
            __componentId: __id,
            __instanceId: `${__id}#${nextInstanceId++}`,
            props: props ?? {},
            children,
        };
    };
}

const rawHTML = (content: string) => ({ content, __rawHTML: true });

const pageLoadCallbacks: Array<{ pathname: string; cb: () => any, options: PageLoadOptions }> = [];
const cleanupFns = new Map<string, Array<() => void>>();

type PageLoadOptions = {
    type?: "scoped" | "unscoped",
};

const onPageLoad = (cb: ((...args: any) => any), options: PageLoadOptions = {}) =>
    pageLoadCallbacks.push({ pathname: loc.pathname, cb, options });

function runPageCleanup() {
    for (const [scope, fns] of cleanupFns) {
        if (!loc.pathname.startsWith(scope)) {
            fns.forEach(f => f());
            cleanupFns.delete(scope);
        }
    }
}

function runPageCallbacks() {
    const current = loc.pathname;
    for (const { pathname, cb, options } of pageLoadCallbacks) {
        const scoped = options?.type === "scoped";
        const unscoped = !options?.type || options.type === "unscoped";

        if (unscoped) {
            const cleanup = cb();
            if (typeof cleanup === "function") cleanupFns.get("/")?.push(cleanup);
            continue;
        }

        const scope = scoped
            ? pathname.slice(0, pathname.lastIndexOf("/")) || "/"
            : pathname;
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
                delegateTarget: { configurable: true, value: target }
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
    doc.addEventListener(eventType, _delegatedListener, true);
}

function bind(el: Element, type: string, fn: Function, owner: any) {
    let m = delegatedHandlers.get(el);
    if (!m) delegatedHandlers.set(el, m = { inst: owner, handlers: {} });
    else m.inst = owner;
    ensureEventDelegated(type);
    m.handlers[type] = fn;
}

globalThis.__bind = bind;
globalThis.__navCallbacks = [];

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set("svg path circle polygon polyline rect line g text tspan defs use clipPath mask linearGradient radialGradient stop ellipse image symbol marker pattern filter feGaussianBlur feOffset feMerge feMergeNode title desc foreignObject switch view".split(" "));

function createEl(tag: string): Element {
    return SVG_TAGS.has(tag)
        ? doc.createElementNS(SVG_NS, tag)
        : doc.createElement(tag);
}

function applyOptions(el: Element, options: Record<string, unknown>, owner: any, isHydrate = false) {
    for (const [k, v] of Object.entries(options)) {
        const key = k === "className" ? "class" : k;
        if (key === "key") continue;
        if (key.startsWith("on") && typeof v === "function") {
            globalThis.__bind(el, key.slice(2).toLowerCase(), v, owner);
        } else if (!isHydrate) {
            if (typeof v === "boolean") el.toggleAttribute(key, v);
            else if (v !== "false") {
                const s = v && typeof v === "object" ? Object.entries(v).map(([k, sv]) => `${k.replace(/[A-Z]/g, c => "-" + c.toLowerCase())}:${sv}`).join(";") : String(v);
                if (ga(el, key) !== s) el.setAttribute(key, s);
            }
        }
    }
}

function getVKey(vn: any): string | null {
    if (vn == null || typeof vn !== "object") return null;
    if (vn.__type === "element" && vn.options?.key != null) return String(vn.options.key);
    if (vn.__type === "live"    && vn.props?.key  != null) return String(vn.props.key);
    return null;
}

function vnodeToDom(node: any, owner?: any): Node {
    if (typeof node === "string" || typeof node === "number") return doc.createTextNode(String(node));
    if (node === null || node === false || node === undefined) return doc.createTextNode("");
    if (node.__rawHTML) return rawToDom(node.content);
    if (node.__type === "element") {
        const el = createEl(node.tag);
        const k = getVKey(node);
        if (k !== null) (el as any)._k = k;
        applyOptions(el, node.options ?? {}, owner, false);
        for (const child of node.children ?? []) ac(el, vnodeToDom(child, owner));
        return el;
    }
    if (node.__type === "live") return mount(node, owner);
    return doc.createDocumentFragment();
}

function patchChildren(el: Element, vc: any[], owner?: any): void {
    const hasKeys = vc.some(c => getVKey(c) !== null);

    if (hasKeys) {
        const keyedDom = new Map<string, Node>();
        for (const child of Array.from(el.childNodes)) {
            const k = (child as any)._k;
            if (k != null) keyedDom.set(k, child);
        }

        const newChildren: Node[] = [];
        for (const vchild of vc) {
            const k = getVKey(vchild);
            if (k !== null && keyedDom.has(k)) {
                const existing = keyedDom.get(k)!;
                keyedDom.delete(k);
                newChildren.push(patch(existing, vchild, owner));
            } else {
                const fresh = vnodeToDom(vchild, owner);
                if (k !== null) (fresh as any)._k = k;
                newChildren.push(fresh);
            }
        }

        for (const stale of keyedDom.values()) (stale as any)._i?._d();

        for (let i = 0; i < newChildren.length; i++) {
            const desired = newChildren[i]!;
            const current = el.childNodes[i] ?? null;
            if (current !== desired) el.insertBefore(desired, current);
        }

        while (el.childNodes.length > newChildren.length) {
            const last = el.lastChild!;
            el.removeChild(last);
            (last as any)._i?._d();
        }
    } else {
        const dc = Array.from(el.childNodes);
        const common = Math.min(dc.length, vc.length);
        for (let i = 0; i < common; i++) patch(dc[i]!, vc[i], owner);
        for (let i = common; i < vc.length; i++) ac(el, vnodeToDom(vc[i], owner));
        for (let i = dc.length - 1; i >= vc.length; i--) {
            el.removeChild(dc[i]!);
            (dc[i] as any)._i?._d();
        }
    }
}

function patch(dom: Node, vn: any, owner?: any): Node {
    if (vn === null || vn === false) {
        if (dom.nodeType === TE && dom.nodeValue === "") return dom;
        const t = doc.createTextNode("");
        rc(dom, t);
        (dom as any)._i?._d();
        return t;
    }
    if (typeof vn === "string" || typeof vn === "number") {
        const s = String(vn);
        if (dom.nodeType === TE) { if (dom.nodeValue !== s) dom.nodeValue = s; return dom; }
        const t = doc.createTextNode(s);
        return rc(dom, t);
    }
    if (vn.__rawHTML) return rc(dom, rawToDom(vn.content));
    if (vn.__type === "element") {
        if (dom.nodeType === EL && (dom as Element).tagName.toLowerCase() === vn.tag) {
            const el = dom as Element;
            const normOptions: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(vn.options ?? {})) normOptions[k === "className" ? "class" : k] = v;
            const k = getVKey(vn);
            if (k !== null) (el as any)._k = k;
            for (const name of gan(el)) if (!(name in normOptions)) el.removeAttribute(name);
            applyOptions(el, normOptions, owner, false);
            patchChildren(el, vn.children ?? [], owner);
            return el;
        }
        const fresh = vnodeToDom(vn, owner);
        return rc(dom, fresh);
    }
    if (vn.__type === "live") {
        const ex = (dom as any)._i;
        if (ex?.cid === vn.__componentId) { ex._p = vn.props; ex._c = vn.children ?? []; ex._md(); return dom; }
        const old = (dom as any)._i;
        const rendered = mount(vn, owner);
        rc(dom, rendered);
        old?._d();
        return rendered;
    }
    return dom;
}

const flatten = (a: any[]): any[] =>
    (a as any).flat(Infinity).filter((c: any) => c != null && c !== false && c !== "");

function hydrateTree(vn: any, dom: Node, owner?: any): void {
    if (vn == null || vn === false || dom.nodeType === TE || vn.__rawHTML) return;
    if (Array.isArray(vn)) {
        const flat = flatten(vn);
        const dc = significantChildren(dom as Element);
        for (let i = 0; i < Math.min(flat.length, dc.length); i++) hydrateTree(flat[i], dc[i]!, owner);
        return;
    }
    if (vn.__type === "element") {
        applyOptions(dom as Element, vn.options ?? {}, owner, true);
        const k = getVKey(vn);
        if (k !== null) (dom as any)._k = k;
        const dc = significantChildren(dom as Element);
        const vc = flatten(vn.children ?? []);
        for (let i = 0; i < Math.min(dc.length, vc.length); i++) hydrateTree(vc[i]!, dc[i]!, owner);
        return;
    }
    if (vn.__type === "live") bootstrapComponent(vn, dom, owner);
}

function execView(inst: any): any {
    if (inst._failed) {
        const fb = inst.config.fallback;
        return typeof fb === "function" ? fb(inst._failed, inst._self, inst._atoms) : fb;
    }
    currentInst = inst;
    for (const a of inst._deps) a._removeListener(inst);
    inst._deps.clear();
    try {
        return inst.config.view({ self: inst._self, atoms: inst._atoms, children: inst._c, });
    } finally {
        currentInst = null;
    }
}

function bootstrapComponent(desc: any, existingDom?: Node, owner?: any): any {
    const cid = desc.__componentId;
    const iid = desc.__instanceId;
    const cfg = componentConfigs.get(cid);
    if (!cfg) {
        console.error(`[elegance] Component "${cid}" was rendered server-side but is not registered client-side. Region skipped.`);
        return existingDom ?? doc.createDocumentFragment();
    }

    const existingOnDom = existingDom ? (existingDom as any)._i : undefined;
    if (existingOnDom && existingOnDom.cid === cid) {
        existingOnDom._p = desc.props ?? {};
        existingOnDom._c = desc.children ?? [];
        existingOnDom.config = cfg;
        existingOnDom._failed = null;
        existingOnDom._md();
        return existingOnDom;
    }

    let replaceContent = false;
    if (existingDom && (existingDom as any)._i) {
        (existingDom as any)._i._d(true);
        replaceContent = true;
    }

    const atomsObj: any = {};
    if (cfg.atoms) for (const key in cfg.atoms) atomsObj[key] = _getAtom(`${cid}:${key}`, cfg.atoms[key]);

    let inst: any;
    const self: any = { get props() { return inst._p; }, get children() { return inst._c; }, get root() { return inst._r; } };

    inst = {
        cid, iid, config: cfg,
        _p: desc.props ?? {},
        _c: desc.children ?? [],
        _deps: new Set<ReturnType<typeof atom>>(),
        _scheduled: false,
        _failed: null,
        _self: self,
        _atoms: atomsObj,
        _boundary: owner?.config?.fallback ? owner : owner?._boundary ?? null,
        _handlingError: false,
        _destroyed: false,
        _nv: null,
        _r: existingDom || null,
        _md() {
            if (this._scheduled || this._failed) return;
            this._scheduled = true;
            queueMicrotask(() => {
                this._scheduled = false;
                try {
                    const vn = execView(this);
                    if (vn && typeof vn === "object" && (vn.__type === "element" || vn.__type === "live"))
                        this._r = patch(this._r, vn, this);
                } catch (e) {
                    this._handleError(e);
                }
            });
        },
        _handleError(e: any) {
            if (inst._handlingError || inst._destroyed) return;
            inst._handlingError = true;
            try {
                if (cfg.fallback) {
                    inst._failed = e;
                    const vn = execView(inst);
                    if (vn && typeof vn === "object" && (vn.__type === "element" || vn.__type === "live"))
                        inst._r = patch(inst._r, vn, inst);
                } else if (inst._boundary) {
                    inst._boundary._handleError(e);
                } else {
                    console.error("Unhandled component error:", e);
                }
            } catch (err) {
                console.error("Error rendering fallback:", err);
            } finally {
                inst._handlingError = false;
            }
        },
        _d(keepRoot = false) {
            if (inst._destroyed) return;
            inst._destroyed = true;
            try {
                inst._om?.();
                inst._on?.();
                if (inst._nv)
                    globalThis.__navCallbacks.splice(globalThis.__navCallbacks.indexOf(inst._nv), 1);
                cfg.onUnmount?.(self, atomsObj);
                instanceMap.delete(iid);
                for (const a of inst._deps) a._removeListener(inst);
                inst._deps.clear();
                if (inst._r) {
                    for (const el of inst._r.querySelectorAll("*")) {
                        (el as any)._i?._d();
                    }
                }
                if (!keepRoot) inst._r?.remove();
            } catch (err) {
                console.error("Error during component cleanup:", err);
            }
        },
    };

    instanceMap.set(iid, inst);

    try {
        cfg.init?.(self, atomsObj);

        const vn = execView(inst);
        if (existingDom) {
            if (replaceContent) (existingDom as any).replaceChildren(vnodeToDom(vn, inst));
            else hydrateTree(vn, existingDom, inst);
            inst._r = existingDom;
            (existingDom as any)._i = inst;
        } else {
            const dom = vnodeToDom(vn, inst);
            inst._r = dom instanceof Element ? dom : doc.createElement("div");
            (inst._r as any)._i = inst;
        }

        if (cfg.onMount || cfg.onNavigate) queueMicrotask(() => {
            try {
                const cleanup = cfg?.onMount?.(self, atomsObj);
                if (typeof cleanup === "function") inst._om = cleanup;

                const navigationCallback = () => {
                    if (typeof inst._on === "function") inst._on();
                    const cleanup = cfg?.onNavigate?.(self, atomsObj);
                    if (typeof cleanup === "function") inst._on = cleanup;
                };
                inst._nv = navigationCallback;
                globalThis.__navCallbacks.push(navigationCallback);
                navigationCallback();
            } catch (err) {
                inst._handleError(err);
            }
        });
    } catch (err) {
        inst._handleError(err);
        if (!inst._r) inst._r = doc.createElement("div");
    }

    return inst;
}

function mount(desc: any, owner?: any): Node {
    return bootstrapComponent(desc, undefined, owner)._r;
}

const elementFactory = (tag: string) => (options: any, ...children: any[]) => {
    const isOptions = options !== null && typeof options === "object" && !Array.isArray(options) && !options?.__type;
    const raw = isOptions ? children : [options, ...children];

    // only flatten when nested arrays are actually present, slight speedup
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
    const src = ga(tag, "src");
    if (src) return import(new URL(src, loc.href).href);

    const blobCode = tag.textContent!.replace(
        /(['"])\/chunks\//g,
        `$1${loc.origin}/chunks/`,
    );

    const blob = new Blob([blobCode], { type: "text/javascript" });
    const url  = URL.createObjectURL(blob);

    return import(url);
}

async function drainBootstrapQueue(queue: Array<{ desc: any; dom: Node }>): Promise<void> {
    let i = 0;
    while (i < queue.length) {
        const end = Math.min(i + CHUNK_SIZE, queue.length);
        for (; i < end; i++) bootstrapComponent(queue[i]!.desc, queue[i]!.dom);
        if (i < queue.length) await new Promise<void>(r => requestIdleCallback(r as any));
    }
}

async function hydrateWithRegions(
    regions: Array<any[]>,
    handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }>; count?: number }>
): Promise<void> {
    const queue: Array<{ desc: any; dom: Node }> = [];

    for (const marker of qa(doc.body, 'template[data-region]')) {
        const regionIdx = parseInt(ga(marker, 'data-region')!, 10);
        if (isNaN(regionIdx)) continue;

        const entries = regions[regionIdx];
        if (!entries?.length) {
            continue;
        }

        let sibling: Node | null = marker.nextSibling;
        for (const entry of entries) {
            const cid: string = entry.__cid ?? entry.__componentId;
            const count: number = entry.count ?? 1;
            const props: Record<string, any> = entry.props ?? {};
            const children: Array<VirtualNode> = entry.children ?? [];
            for (let i = 0; i < count; i++) {
                while (sibling?.nodeType === TE && !(sibling.nodeValue ?? "").trim())
                    sibling = sibling.nextSibling!;
                const syntheticDesc = { __type: "live", __componentId: cid, __instanceId: `${cid}#${nextInstanceId++}`, props, children };
                if (sibling !== null) {
                    queue.push({ desc: syntheticDesc, dom: sibling });
                    sibling = sibling.nextSibling;
                } else {
                    marker.parentNode?.insertBefore(mount(syntheticDesc), marker.nextSibling);
                }
            }
        }
    }

    await drainBootstrapQueue(queue);

    if (handlers) {
        for (const { eid, h } of handlers) {
            for (const { event } of h) ensureEventDelegated(event);
            for (const el of qa(doc, `[e-id="${eid}"]`)) {
                let m = delegatedHandlers.get(el);
                if (!m) delegatedHandlers.set(el, m = { inst: null, handlers: {} });
                for (const { event, fn } of h) {
                    if (typeof fn === "function") m.handlers[event] = fn;
                }
            }
        }
    }
}

function significantChildren(el: Element): ChildNode[] {
    return Array.from(el.childNodes).filter(
        n => !(n.nodeType === TE && !(n.nodeValue ?? "").trim())
    );
}

function detachNode(node: ChildNode): void {
    if (node.nodeType === EL)
        for (const child of Array.from((node as Element).childNodes)) detachNode(child);
    const inst = (node as any)._i;
    if (inst) {
        inst._d();
    } else {
        node.parentNode?.removeChild(node);
    }
}

function syncOptions(from: Element, to: Element): void {
    const next = new Set(gan(to));
    for (const a of gan(from)) if (!next.has(a)) from.removeAttribute(a);
    for (const a of gan(to)) {
        const v = ga(to, a)!;
        if (ga(from, a) !== v) from.setAttribute(a, v);
    }
}

function morphKids(parent: Element, incoming: Element): void {
    const existing = significantChildren(parent);
    const wanted = significantChildren(incoming);

    const sameShape = existing.length === wanted.length && existing.every((n, i) => {
        const w = wanted[i]!;

        return n.nodeType === w.nodeType && (n.nodeType !== EL || (n as Element).tagName === (w as Element).tagName);
    });

    if (!sameShape) {
        for (const child of Array.from(parent.childNodes)) detachNode(child);
        for (const child of Array.from(incoming.childNodes)) ac(parent, child.cloneNode(true));

        return;
    }

    const len = Math.max(existing.length, wanted.length);
    for (let i = 0; i < len; i++) {
        const cur = existing[i];
        const want = wanted[i];

        if (!want) {
            detachNode(cur!);
        } else if (!cur) {
            ac(parent, want.cloneNode(true));
        } else if (cur.nodeType === EL && want.nodeType === EL && (cur as Element).tagName === (want as Element).tagName) {
            const inst = (cur as any)._i;
            if (!inst) {
                syncOptions(cur as Element, want as Element);
                morphKids(cur as Element, want as Element);
            }
        } else {
            const inst = (cur as any)._i;
            if (inst) {
                inst._d();
            } else {
                parent.replaceChild(want.cloneNode(true), cur);
            }
        }
    }
}

globalThis.__hydrate = (regions: Array<any[]>, handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }> }>) => {
    for (const inst of instanceMap.values()) inst._d();
    return hydrateWithRegions(regions, handlers);
};

function patchHead(nh: HTMLHeadElement): void {
    const nt = qs(nh, "title");
    if (nt) {
        let t = qs(doc.head, "title");
        if (!t) { t = doc.createElement("title"); doc.head.appendChild(t); }
        if (t.textContent !== nt.textContent) t.textContent = nt.textContent;
    }

    for (const m of qa(nh, "meta")) {
        const name = ga(m, "name");
        const property = ga(m, "property");
        const equiv = ga(m, "http-equiv");
        const charset = ga(m, "charset");
        const sel = name ? `meta[name="${name}"]`
            : property ? `meta[property="${property}"]`
            : equiv ? `meta[http-equiv="${equiv}"]`
            : charset ? "meta[charset]" : null;
        const existing = sel && qs(doc.head, sel);
        if (existing) {
            for (const a of gan(m)) existing.setAttribute(a, ga(m, a)!);
        } else {
            doc.head.appendChild(m.cloneNode(true));
        }
    }

    const nhHrefs = new Set(
        [...qa(nh, "link[rel=stylesheet]")].map((l: any) => l.href)
    );
    const hrefs = new Set(
        [...qa(doc.head, "link[rel=stylesheet]")].map((l: any) => l.href)
    );
    for (const l of qa(doc.head, "link[rel=stylesheet]")) {
        l.disabled = !nhHrefs.has(l.href);
    }
    for (const l of qa(nh, "link[rel=stylesheet]")) {
        if (!hrefs.has(l.href)) doc.head.appendChild(l.cloneNode(true));
    }

    const srcs = new Set(
        [...qa(doc.head, "script[src]")].map((s: any) => s.src)
    );
    for (const s of qa(nh, "script[src]")) {
        if (ga(s, "data-bundle") === "true" || srcs.has(s.src)) continue;
        const ns = doc.createElement("script");
        for (const a of gan(s)) ns.setAttribute(a, ga(s, a)!);
        doc.head.appendChild(ns);
    }
}

async function loadPage(
    url: string,
    regions: Array<any[]>,
    handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }>; count?: number }>,
    doc?: Document
): Promise<void> {
    if (!doc) {
        doc = await fetchDoc(url);
    }

    const hyd = qs(doc, 'script[data-tag="hydration"]');
    if (hyd) try {
        globalThis.__initialAtomValues = JSON.parse(hyd.textContent || "{}").atoms || {};
    } catch {}

    patchHead(doc.head);
    syncOptions(document.body, doc.body);
    morphKids(document.body, doc.body);

    await hydrateWithRegions(regions, handlers);
}

function scroll() {
    if (loc.hash) {
        qs(doc, loc.hash)?.scrollIntoView();
    } else {
        scrollTo(0, 0);
    }
}

const normPath = (p: string) => p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;

const prefersReducedMotion = () => ((typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null)?.matches) ?? false;

async function fetchPage(url: string): Promise<{ doc: Document; mod: any } | null> {
    const target = new URL(url, loc.href);
    target.pathname = normPath(target.pathname);

    const doc = await fetchDoc(url);
    const tag = qs(doc, bpSel(target.pathname)) as HTMLScriptElement | null;

    let mod: any;
    if (tag) {
        mod = await importBundle(tag);
    } else {
        try {
            mod = await import(`${target.pathname === "/" ? "" : target.pathname}/bundle.js`);
        } catch {
            console.error("fetchPage: no bundle found for this pathname.");
            return null;
        }
    }

    return { doc, mod };
}

let activePath = normPath(loc.pathname);

async function navigate(url: string, push = true, vt?: boolean): Promise<void> {
    const target = new URL(url, loc.href);
    target.pathname = normPath(target.pathname);
    if (target.pathname === activePath) {
        if (push && target.href !== loc.href) history.pushState(null, "", url);
        scroll();
        return;
    }
    if (push) history.pushState(null, "", url);

    const page = await fetchPage(url);
    if (!page) return;

    runPageCleanup();

    const result = (page.mod.default ?? (() => null))();
    if (!Array.isArray(result?.regions)) {
        console.error("navigate: target is not an Elegance page.");
        return;
    }

    const apply = () => loadPage(url, result.regions, result.handlers, page.doc);
    const wantsVT = typeof doc.startViewTransition === "function" && !prefersReducedMotion() && (vt ?? __VIEW_TRANSITIONS);

    if (wantsVT) {
        const t = doc.startViewTransition(() => apply());
        try { await t.finished; } catch {}
    } else {
        await apply();
    }
    activePath = target.pathname;

    runPageCallbacks();
    globalThis.__navCallbacks.forEach(f => f());
    scroll();
}

async function hydrate() {
    const bundleTag = qs(doc, bpSel(normPath(loc.pathname))) as HTMLScriptElement | null;
    if (!bundleTag) return;

    const mod = await importBundle(bundleTag);
    const result = (mod.default || (() => null))();
    if (!Array.isArray(result?.regions)) return;

    await hydrateWithRegions(result.regions, result.handlers);
    runPageCallbacks();
    scroll();

    window.addEventListener("beforeunload", () => runPageCleanup());
}

window.addEventListener("popstate", () => navigate(loc.pathname + loc.search + loc.hash, false));

async function _action(target: string, params: unknown) {
    const res = await fetch(`${loc.origin}/__action`, {
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

Object.assign(globalThis, { view, component, onPageLoad, track, untrack, navigate, fetchPage, rawHTML, _getAtom, _action, });

requestAnimationFrame(() => hydrate());
