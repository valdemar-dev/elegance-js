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

    let tag: string;
    let tagColor: string;
    let msgColor: string;

    switch (level) {
        case LogLevel.ERROR:
            tag = "[ERROR]";
            tagColor = "\x1b[41;30m"; // red bg, black text
            msgColor = "\x1b[31m";    // red text
            break;
        case LogLevel.WARN:
            tag = "[WARN]";
            tagColor = "\x1b[43;30m"; // yellow bg, black text
            msgColor = "\x1b[33m";    // yellow text
            break;
        case LogLevel.INFO:
            tag = "[INFO]";
            tagColor = "\x1b[44;37m"; // blue bg, white text
            msgColor = "\x1b[36m";    // cyan text
            break;
        case LogLevel.DEBUG:
            tag = "[DEBUG]";
            tagColor = "\x1b[45;37m"; // magenta bg, white text
            msgColor = "\x1b[90m";    // gray text
            break;
    }

    const ts = new Date().toLocaleTimeString("en-us");

    const formattedArgs = [
        `${ts} Elegance-JS `,
        `${tagColor}${tag}\x1b[0m `,
        msgColor,
        ...args,
        "\x1b[0m"
    ];

    return formattedArgs.map(arg => {
        if (typeof arg === "string") return arg;
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