export const ShowDeprecationWarning = (msg: string) => {
    console.warn("\x1b[31m", msg); 
    console.trace("Stack Trace:")
};