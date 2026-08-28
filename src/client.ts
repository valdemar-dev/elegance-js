declare const __VIEW_TRANSITIONS: boolean;

declare global {
    var __initialAtomValues: Record<string, any> | undefined;
    var _getAtom: (id: string, initial?: any) => ReturnType<typeof atom>;
    var __bind: (el: Element, type: string, fn: Function, owner: any) => void;
    var __navCallbacks: Array<() => void>;
    var __hydrate: (regions: Array<any[]>, handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }> }>) => Promise<void> | void;
}

{
    const _s = document.querySelector('script[data-tag="iav"]');
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
                _L.forEach(c => c._markDirty());
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

    return (props?: Record<string, unknown>, children?: Array<VirtualNode>) => {
        return {
            __type: "live",
            __componentId: __id,
            __instanceId: `${__id}#${nextInstanceId++}`,
            props: props ?? {},
            children: children,
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
    document.addEventListener(eventType, _delegatedListener, true);
}

for (const et of [
    'click', 'input', 'change', 'submit', 'keydown', 'keyup',
    'mousemove', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout',
    'focus', 'blur', 'pointerdown', 'pointerup', 'pointermove',
]) { ensureEventDelegated(et); }

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
const SVG_TAGS = new Set(["svg","path","circle","polygon","polyline","rect","line","g","text","tspan","defs","use","clipPath","mask","linearGradient","radialGradient","stop","ellipse","image","symbol","marker","pattern","filter","feGaussianBlur","feOffset","feMerge","feMergeNode","title","desc","foreignObject","switch","view"]);

function createEl(tag: string): Element {
    return SVG_TAGS.has(tag)
        ? document.createElementNS(SVG_NS, tag)
        : document.createElement(tag);
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
                const s = String(v);
                if (el.getAttribute(key) !== s) el.setAttribute(key, s);
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
    if (typeof node === "string" || typeof node === "number") return document.createTextNode(String(node));
    if (node === null || node === false || node === undefined) return document.createTextNode("");
    if (node.__rawHTML) return document.createRange().createContextualFragment(node.content).firstElementChild!;
    if (node.__type === "element") {
        const el = createEl(node.tag);
        const k = getVKey(node);
        if (k !== null) (el as any).__vkey = k;
        applyOptions(el, node.options ?? {}, owner, false);
        for (const child of node.children ?? []) el.appendChild(vnodeToDom(child, owner));
        return el;
    }
    if (node.__type === "live") return mount(node, owner);
    return document.createDocumentFragment();
}

function patchChildren(el: Element, vc: any[], owner?: any): void {
    const hasKeys = vc.some(c => getVKey(c) !== null);

    if (hasKeys) {
        const keyedDom = new Map<string, Node>();
        for (const child of Array.from(el.childNodes)) {
            const k = (child as any).__vkey;
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
                if (k !== null) (fresh as any).__vkey = k;
                newChildren.push(fresh);
            }
        }

        for (const stale of keyedDom.values()) (stale as any).__instance?._destroy();

        for (let i = 0; i < newChildren.length; i++) {
            const desired = newChildren[i]!;
            const current = el.childNodes[i] ?? null;
            if (current !== desired) el.insertBefore(desired, current);
        }

        while (el.childNodes.length > newChildren.length) {
            const last = el.lastChild!;
            (last as any).__instance?._destroy();
            el.removeChild(last);
        }
    } else {
        const dc = Array.from(el.childNodes);
        const common = Math.min(dc.length, vc.length);
        for (let i = 0; i < common; i++) patch(dc[i]!, vc[i], owner);
        for (let i = common; i < vc.length; i++) el.appendChild(vnodeToDom(vc[i], owner));
        for (let i = dc.length - 1; i >= vc.length; i--) {
            (dc[i] as any).__instance?._destroy();
            el.removeChild(dc[i]!);
        }
    }
}

function patch(dom: Node, vn: any, owner?: any): Node {
    if (vn === null || vn === false) {
        if (dom.nodeType === Node.TEXT_NODE && dom.nodeValue === "") return dom;
        const t = document.createTextNode("");
        (dom as any).__instance?._destroy();
        dom.parentNode?.replaceChild(t, dom);
        return t;
    }
    if (typeof vn === "string" || typeof vn === "number") {
        const s = String(vn);
        if (dom.nodeType === Node.TEXT_NODE) { if (dom.nodeValue !== s) dom.nodeValue = s; return dom; }
        const t = document.createTextNode(s);
        dom.parentNode?.replaceChild(t, dom);
        return t;
    }
    if (vn.__rawHTML) return document.createRange().createContextualFragment(vn.content).firstElementChild!;
    if (vn.__type === "element") {
        if (dom.nodeType === Node.ELEMENT_NODE && (dom as Element).tagName.toLowerCase() === vn.tag) {
            const el = dom as Element;
            const normOptions: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(vn.options ?? {})) normOptions[k === "className" ? "class" : k] = v;
            const k = getVKey(vn);
            if (k !== null) (el as any).__vkey = k;
            for (const name of el.getAttributeNames()) if (!(name in normOptions)) el.removeAttribute(name);
            applyOptions(el, normOptions, owner, false);
            patchChildren(el, vn.children ?? [], owner);
            return el;
        }
        const fresh = vnodeToDom(vn, owner);
        dom.parentNode?.replaceChild(fresh, dom);
        return fresh;
    }
    if (vn.__type === "live") {
        const ex = (dom as any).__instance;
        if (ex?.cid === vn.__componentId) { ex.props = vn.props; ex.children = vn.children ?? []; ex._markDirty(); return dom; }
        const old = (dom as any).__instance;
        const rendered = mount(vn, owner);
        dom.parentNode?.replaceChild(rendered, dom);
        old?._destroy();
        return rendered;
    }
    return dom;
}

const flatten = (a: any[]): any[] =>
    (a as any).flat(Infinity).filter((c: any) => c != null && c !== false && c !== "");

function hydrateTree(vn: any, dom: Node, owner?: any): void {
    if (vn == null || vn === false || dom.nodeType === Node.TEXT_NODE || vn.__rawHTML) return;
    if (Array.isArray(vn)) {
        const flat = flatten(vn);
        const dc = significantChildren(dom as Element);
        for (let i = 0; i < Math.min(flat.length, dc.length); i++) hydrateTree(flat[i], dc[i]!, owner);
        return;
    }
    if (vn.__type === "element") {
        applyOptions(dom as Element, vn.options ?? {}, owner, true);
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
        return inst.config.view({ self: inst._self, atoms: inst._atoms, children: inst.children, });
    } finally {
        currentInst = null;
    }
}

function bootstrapComponent(desc: any, existingDom?: Node, owner?: any): any {
    const cid = desc.__componentId;
    const instanceId = desc.__instanceId;
    const cfg = componentConfigs.get(cid);
    if (!cfg) return existingDom ?? document.createDocumentFragment();

    const existingOnDom = existingDom ? (existingDom as any).__instance : undefined;
    if (existingOnDom && existingOnDom.cid === cid) {
        existingOnDom.props = desc.props ?? {};
        existingOnDom.children = desc.children ?? [];
        existingOnDom.config = cfg;
        existingOnDom._failed = null;
        existingOnDom._markDirty();
        return existingOnDom;
    }

    if (existingDom && (existingDom as any).__instance) {
        (existingDom as any).__instance._destroy();
    }

    const atomsObj: any = {};
    if (cfg.atoms) for (const key in cfg.atoms) atomsObj[key] = _getAtom(`${cid}:${key}`, cfg.atoms[key]);

    let inst: any;
    const self: any = { get props() { return inst.props; }, get children() { return inst.children; }, get root() { return inst.root; } };

    inst = {
        cid, instanceId, config: cfg,
        props: desc.props ?? {},
        children: desc.children ?? [],
        _deps: new Set<ReturnType<typeof atom>>(),
        _scheduled: false,
        _failed: null,
        _self: self,
        _atoms: atomsObj,
        _boundary: owner?.config?.fallback ? owner : owner?._boundary ?? null,
        _handlingError: false,
        _destroyed: false,
        _navigationCallback: null,
        root: existingDom || null,
        _markDirty() {
            if (this._scheduled || this._failed) return;
            this._scheduled = true;
            queueMicrotask(() => {
                this._scheduled = false;
                try {
                    const vn = execView(this);
                    if (vn && typeof vn === "object" && (vn.__type === "element" || vn.__type === "live"))
                        this.root = patch(this.root, vn, this);
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
                        inst.root = patch(inst.root, vn, inst);
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
        _destroy() {
            if (inst._destroyed) return;
            inst._destroyed = true;
            try {
                inst._onMountCleanup?.();
                inst._onNavigateCleanup?.();
                if (inst._navigationCallback)
                    globalThis.__navCallbacks.splice(globalThis.__navCallbacks.indexOf(inst._navigationCallback), 1);
                cfg.onUnmount?.(self, atomsObj);
                instanceMap.delete(instanceId);
                for (const a of inst._deps) a._removeListener(inst);
                inst._deps.clear();
                if (inst.root) {
                    for (const el of inst.root.querySelectorAll("*")) {
                        (el as any).__instance?._destroy();
                    }
                }
                inst.root?.remove();
            } catch (err) {
                console.error("Error during component cleanup:", err);
            }
        },
    };

    instanceMap.set(instanceId, inst);

    try {
        cfg.init?.(self, atomsObj);

        const vn = execView(inst);
        if (existingDom) {
            hydrateTree(vn, existingDom, inst);
            inst.root = existingDom;
            (existingDom as any).__instance = inst;
        } else {
            const dom = vnodeToDom(vn, inst);
            inst.root = dom instanceof Element ? dom : document.createElement("div");
            (inst.root as any).__instance = inst;
        }

        if (cfg.onMount || cfg.onNavigate) queueMicrotask(() => {
            try {
                const cleanup = cfg?.onMount?.(self, atomsObj);
                if (typeof cleanup === "function") inst._onMountCleanup = cleanup;

                const navigationCallback = () => {
                    if (typeof inst._onNavigateCleanup === "function") inst._onNavigateCleanup();
                    const cleanup = cfg?.onNavigate?.(self, atomsObj);
                    if (typeof cleanup === "function") inst._onNavigateCleanup = cleanup;
                };
                inst._navigationCallback = navigationCallback;
                globalThis.__navCallbacks.push(navigationCallback);
                navigationCallback();
            } catch (err) {
                inst._handleError(err);
            }
        });
    } catch (err) {
        inst._handleError(err);
        if (!inst.root) inst.root = document.createElement("div");
    }

    return inst;
}

function mount(desc: any, owner?: any): Node {
    return bootstrapComponent(desc, undefined, owner).root;
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
    const src = tag.getAttribute("src");
    if (src) return import(new URL(src, location.href).href);

    const blobCode = tag.textContent!.replace(
        /(['"])\/chunks\//g,
        `$1${location.origin}/chunks/`,
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

    for (const marker of document.body.querySelectorAll<Element>('template[data-region]')) {
        const regionIdx = parseInt(marker.getAttribute('data-region')!, 10);
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
            for (let i = 0; i < count; i++) {
                while (sibling?.nodeType === Node.TEXT_NODE && !(sibling.nodeValue ?? "").trim())
                    sibling = sibling.nextSibling!;
                const syntheticDesc = { __type: "live", __componentId: cid, __instanceId: `${cid}#${nextInstanceId++}`, props };
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
            for (const el of document.querySelectorAll<HTMLElement>(`[e-id="${eid}"]`)) {
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
        n => !(n.nodeType === Node.TEXT_NODE && !(n.nodeValue ?? "").trim())
    );
}

function detachNode(node: ChildNode): void {
    if (node.nodeType === Node.ELEMENT_NODE)
        for (const child of Array.from((node as Element).childNodes)) detachNode(child);
    const inst = (node as any).__instance;
    if (inst) {
        inst._destroy();
    } else {
        node.parentNode?.removeChild(node);
    }
}

function syncOptions(from: Element, to: Element): void {
    const next = new Set(to.getAttributeNames());
    for (const a of from.getAttributeNames()) if (!next.has(a)) from.removeAttribute(a);
    for (const a of to.getAttributeNames()) {
        const v = to.getAttribute(a)!;
        if (from.getAttribute(a) !== v) from.setAttribute(a, v);
    }
}

function morphKids(parent: Element, incoming: Element): void {
    const existing = significantChildren(parent);
    const wanted = significantChildren(incoming);

    const sameShape = existing.length === wanted.length && existing.every((n, i) => {
        const w = wanted[i]!;

        return n.nodeType === w.nodeType && (n.nodeType !== Node.ELEMENT_NODE || (n as Element).tagName === (w as Element).tagName);
    });

    if (!sameShape) {
        for (const child of Array.from(parent.childNodes)) detachNode(child);
        for (const child of Array.from(incoming.childNodes)) parent.appendChild(child.cloneNode(true));

        return;
    }

    const len = Math.max(existing.length, wanted.length);
    for (let i = 0; i < len; i++) {
        const cur = existing[i];
        const want = wanted[i];

        if (!want) {
            detachNode(cur!);
        } else if (!cur) {
            parent.appendChild(want.cloneNode(true));
        } else if (cur.nodeType === Node.ELEMENT_NODE && want.nodeType === Node.ELEMENT_NODE && (cur as Element).tagName === (want as Element).tagName) {
            const inst = (cur as any).__instance;
            if (!inst) {
                syncOptions(cur as Element, want as Element);
                morphKids(cur as Element, want as Element);
            }
        } else {
            const inst = (cur as any).__instance;
            if (inst) {
                inst._destroy();
            } else {
                parent.replaceChild(want.cloneNode(true), cur);
            }
        }
    }
}

globalThis.__hydrate = (regions: Array<any[]>, handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }> }>) => {
    for (const inst of instanceMap.values()) inst._destroy();
    return hydrateWithRegions(regions, handlers);
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
    handlers?: Array<{ eid: number; h: Array<{ event: string; fn: Function }>; count?: number }>,
    doc?: Document
): Promise<void> {
    if (!doc) {
        doc = new DOMParser().parseFromString(
            await (await fetch(url, { headers: { Accept: "text/html" } })).text(),
            "text/html"
        );
    }

    const hyd = doc.querySelector('script[data-tag="hydration"]');
    if (hyd) try {
        globalThis.__initialAtomValues = JSON.parse(hyd.textContent || "{}").atoms || {};
    } catch {}

    patchHead(doc.head);
    syncOptions(document.body, doc.body);
    morphKids(document.body, doc.body);

    await hydrateWithRegions(regions, handlers);
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

    const mod = await importBundle(bundleTag);
    const result = (mod.default || (() => null))();
    if (!Array.isArray(result?.regions)) return;

    await hydrateWithRegions(result.regions, result.handlers);
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

Object.assign(globalThis, { view, component, onPageLoad, track, untrack, navigate, rawHTML, _getAtom, _action, });

requestAnimationFrame(() => hydrate());