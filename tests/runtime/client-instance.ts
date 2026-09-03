import { fileURLToPath } from "node:url";

export interface ClientApi {
    view: (fn: Function) => Function;
    component: (cfg: any) => ((props?: any, children?: any) => any) | undefined;
    onPageLoad: Function;
    track: Function;
    untrack: Function;
    navigate: Function;
    fetchPage: Function;
    rawHTML: (content: string) => { content: string; __rawHTML: true };
    _getAtom: (id: string, initial?: any) => any;
    _action: Function;
}

let instanceCounter = 0;

export async function freshClient(): Promise<ClientApi> {
    const real = fileURLToPath(new URL("../../src/client.ts", import.meta.url));
    const pretend = `tests/runtime/instances/client-${instanceCounter++}.ts`;
    await import(`copycat://${pretend}?real=${encodeURIComponent(real)}`);

    const g = globalThis as any;
    return {
        view: g.view,
        component: g.component,
        onPageLoad: g.onPageLoad,
        track: g.track,
        untrack: g.untrack,
        navigate: g.navigate,
        fetchPage: g.fetchPage,
        rawHTML: g.rawHTML,
        _getAtom: g._getAtom,
        _action: g._action,
    };
}
