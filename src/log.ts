let quiet = false;

function setQuiet(value: boolean) {
    quiet = value;
}

function getTimestamp(): string {
    const now = new Date();
    return now.toLocaleString(undefined, {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function color(text: string, code: number): string {
    return `\x1b[${code}m${text}\x1b[0m`;
}

function logInfo(...args: unknown[]) {
    if (quiet) return;
    console.info(`${getTimestamp()} ${color("[INFO]:", 34)}`, ...args);
}

function logWarn(...args: unknown[]) {
    if (quiet) return;
    console.warn(`${getTimestamp()} ${color("[WARN]:", 33)}`, ...args);
}

function logError(...args: unknown[]) {
    if (quiet) return;
    console.error(`${getTimestamp()} ${color("[ERROR]:", 31)}`, ...args);
}

const log = {
    info: logInfo,
    warn: logWarn,
    error: logError,
};

export { log, setQuiet };
