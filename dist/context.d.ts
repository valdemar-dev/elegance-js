export declare const runAls: {
    <R>(store: Record<string, any>, callback: () => R): R;
    <R, TArgs extends any[]>(store: Record<string, any>, callback: (...args: TArgs) => R, ...args: TArgs): R;
};
export declare const getStore: () => Record<string, any>;
