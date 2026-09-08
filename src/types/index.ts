export * from "./component";
export * from "./config";
export * from "./elements";
export * from "./jsx";
export * from "./server-actions";

export type { CssConfig, CssTransformer, CssModulesConfig } from "../css/core";

declare global {
    var navigate: (url: string, push?: boolean, doViewTransition?: boolean) => Promise<void>;
    var fetchPage: (url: string) => Promise<{ doc: Document; mod: any } | null>;
}
