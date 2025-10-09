declare function setQuiet(value: boolean): void;
declare function logInfo(...args: unknown[]): void;
declare function logWarn(...args: unknown[]): void;
declare function logError(...args: unknown[]): void;
declare const log: {
    info: typeof logInfo;
    warn: typeof logWarn;
    error: typeof logError;
};
export { log, setQuiet };
