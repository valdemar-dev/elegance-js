export const ShowDeprecationWarning = (msg: string) => {
    console.warn("\x1b[31m", msg, "\x1b[0m"); 
    console.trace("Stack Trace:")
};