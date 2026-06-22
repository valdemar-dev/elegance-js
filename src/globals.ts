import { makeEl } from "./elements";
import { renderContextStorage } from "./build/render";
import { importContext } from "./build/common";

/**
 * this is quite literallyll the worst file that i have ever seen in my entire life
 * i hate every single thing about this file, and the fact that it even exists at all.
 */
export function hookGlobals() // Assign all globals here.
// Some of these are stubs, things like track and untrack only exist in the browser.
{
    //@ts-ignore
    globalThis.__tags = new Proxy({}, {
        get(_, tag) {
            // technically slower maybe, we might want to just lazy return and store the returned value but idk
            return makeEl(tag as any);
        }
    });

    //@ts-ignore
    (globalThis as any).serverAction = (params) => {
        console.log("Register serverAction:", params.id);

        if (globalThis.__serverActions === undefined) globalThis.__serverActions = [];
        globalThis.__serverActions.push(params);
    };

    (globalThis as any).rawHTML = (content: string) => ({content, __rawHTML: true});

    (globalThis as any).onPageLoad = () => {
        // this is intentionally a no-op, you're *meant* to call this on the server, it's fine!
    };

    //@ts-ignore
    globalThis.atom = function (id: string, initial: any): any {
        const context = importContext.getStore();
        if (!context) {
            throw new Error("atom() called outside of import context. This is an invalid invocation.");
        }

        const seeds = context.atomSeeds;
        
        seeds.push({ id, initial });

        const atom: Atom<any> = {
            id,
            get value() {
                const ctx = renderContextStorage.getStore();
                if (!ctx) return initial;
                if (!ctx.atomValues.has(id)) {
                    ctx.atomValues.set(id, initial);
                    ctx.atomRegistry.push({ id });
                }
                return ctx.atomValues.get(id);
            },
            set value(v: any) {
                const ctx = renderContextStorage.getStore();
                if (!ctx) return;
                if (!ctx.atomValues.has(id)) {
                    ctx.atomValues.set(id, initial);
                    ctx.atomRegistry.push({ id });
                }
                ctx.atomValues.set(id, v);
            },
        };

        return atom;
    };

    //@ts-ignore
    globalThis.view = (fn: any) => fn;

    //@ts-ignore
    globalThis.component = function component(cfg: any): any {
        const { __id: cid, view, init, atoms } = cfg;

        if (!cid) throw "Invalid component call, was the preprocessor ran on this file?";

        if (!view) {
            throw new Error(`Component "${cid}": must provide 'view', otherwise the component cannot be rendered.`);
        }

        const generator = (props?: Record<string, unknown>, children?: Array<VirtualNode>) => {
            const atomsObj: any = {};
            if (atoms) {
                for (const key of Object.keys(atoms)) {
                    let value = atoms[key];
                    atomsObj[key] = {
                        get value() { return value },
                        set value(v: any) { value = v; },
                        id: `${cid}:${key}`,
                    };
                }
            }

            const self = {
                props: props ?? {},
                root: undefined,
            };

            const descriptor = {
                __type: "live",
                __componentId: cid,
                __definition: {
                    state: () => ({}),
                    callbacks: {},
                    render: () => view({ self, atoms: atomsObj, children }),
                    serverInit: async () => { if (init) await init(self, atomsObj); },
                },
                props: props ?? {},
            };

            const originalInit = descriptor.__definition.serverInit;
            descriptor.__definition.serverInit = async () => {
                await originalInit();
            };

            return descriptor;
        };

        generator.__config = { ...cfg, };
        return generator;
    };

    //@ts-ignore
    globalThis.track = () => {
        console.warn("WARNING: The track() function is a no-op on the server, make sure to only call it within browser-code.");
    };
    //@ts-ignore
    globalThis.untrack = () => {
        console.warn("WARNING: The untrack() function is a no-op on the server, make sure to only call it within browser-code.");
    };
}