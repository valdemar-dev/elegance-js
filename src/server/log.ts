import util from "node:util";

enum LogLevel {
    NONE,
    ERROR,
    WARN,
    INFO,
    DEBUG,
}

let logLevel: LogLevel = LogLevel.INFO;

function setLogLevel(level: LogLevel) {
    logLevel = level;
}

function formatToLog(level: LogLevel, ...args: unknown[]) {
    if (level === LogLevel.NONE) {
        throw new Error("Can't log with LogLevel none.");
    }

    let color: string;
    let msg: string;
    switch (level) {
        case LogLevel.ERROR:
            msg = "[ERROR]";
            color = "\x1b[41m\x1b[30m";
            break;
        case LogLevel.WARN:
            msg = "[WARN]";
            color = "\x1b[33m";
            break;
        case LogLevel.INFO:
            msg = "[INFO]";
            color = "\x1b[36m";
            break;
        case LogLevel.DEBUG:
            msg = "[DEBUG]";
            color = "\x1b[90m";
            break;
    }
    
    const CLEAR_COLOR = "\x1b[0m";
    const ts = new Date().toLocaleTimeString("en-us");

    const formatArgs = [`${ts} Elegance-JS ${color}${msg}: `, `${color}`,...args, "\x1b[0m"];

    return formatArgs.map(arg => {
        if (typeof arg === 'string') return arg;

        return util.inspect(arg, { colors: false, depth: null });
    }).join('');
}

function formattedLog(level: LogLevel, ...args: unknown[]) {
    if (level > logLevel) {
        return;
    }

    const str = formatToLog(level, ...args);

    console.log(str);
}

export {
    formattedLog,
    setLogLevel,
    LogLevel,
    logLevel,
    formatToLog,
}