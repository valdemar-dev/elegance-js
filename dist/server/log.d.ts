declare enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}
declare let logLevel: LogLevel;
declare function setLogLevel(level: LogLevel): void;
declare function formatToLog(level: LogLevel, ...args: unknown[]): string;
declare function formattedLog(level: LogLevel, ...args: unknown[]): void;
export { formattedLog, setLogLevel, LogLevel, logLevel, formatToLog, };
