export * from "./component";
export * from "./config";
export * from "./elements";
export * from "./jsx";
export * from "./server-actions";

declare global {
    var navigate: (url: string, push?: boolean) => Promise<void>;
}
