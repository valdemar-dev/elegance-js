import util from "node:util";
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["NONE"] = 0] = "NONE";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
})(LogLevel || (LogLevel = {}));
let logLevel = LogLevel.INFO;
function setLogLevel(level) {
    logLevel = level;
}
function formatToLog(level, ...args) {
    if (level === LogLevel.NONE) {
        throw new Error("Can't log with LogLevel none.");
    }
    let tag;
    let tagColor;
    let msgColor;
    switch (level) {
        case LogLevel.ERROR:
            tag = "[ERROR]";
            tagColor = "\x1b[41;30m"; // red bg, black text
            msgColor = "\x1b[31m"; // red text
            break;
        case LogLevel.WARN:
            tag = "[WARN]";
            tagColor = "\x1b[43;30m"; // yellow bg, black text
            msgColor = "\x1b[33m"; // yellow text
            break;
        case LogLevel.INFO:
            tag = "[INFO]";
            tagColor = "\x1b[44;37m"; // blue bg, white text
            msgColor = "\x1b[36m"; // cyan text
            break;
        case LogLevel.DEBUG:
            tag = "[DEBUG]";
            tagColor = "\x1b[45;37m"; // magenta bg, white text
            msgColor = "\x1b[90m"; // gray text
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
        if (typeof arg === "string")
            return arg;
        return util.inspect(arg, { colors: false, depth: null });
    }).join('');
}
function formattedLog(level, ...args) {
    if (level > logLevel) {
        return;
    }
    const str = formatToLog(level, ...args);
    console.log(str);
}
export { formattedLog, setLogLevel, LogLevel, logLevel, formatToLog, };
