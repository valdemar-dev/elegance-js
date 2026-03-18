import crypto from "crypto";
/**
 * Use cryptographically secure random bytes to generate un-escaped HTML that cannot be replicated by any component in-order to unescape itself.
 */
const RAW_SECRET = crypto.randomBytes(32);
const PREFIX = "\uE000RAW:";
const SEP = "\uE001";
const SUFFIX = "\uE002";
/**
 * Make an HTML string not be escaped by the Elegance compiler.
 *
 * A wrapped string from process A cannot be unwrapped in process B.
 *
 * **IMPORTANT:** Do not use this in client components. This functions exists for the *server* to prevent HTML injection.
 * For most needs element({ innerHTML: "<p>Hello, World!</p>", }); should be enough.
 * NOTE: Does not return suitable HTML, must be sent to the compiler for processing.
 * @param html Any HTML string.
 * @returns HTML string that will not be escaped by the compiler.
 */
function raw(html) {
    const mac = crypto.createHmac("sha256", RAW_SECRET)
        .update(html)
        .digest("base64url");
    return PREFIX + mac + SEP + html + SUFFIX;
}
function maybeContainsRaw(s) {
    return s.includes(PREFIX);
}
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function unwrapAllRaw(input) {
    if (!maybeContainsRaw(input))
        return escapeHtml(input);
    let out = "";
    let i = 0;
    while (i < input.length) {
        const start = input.indexOf(PREFIX, i);
        if (start === -1) {
            out += escapeHtml(input.slice(i));
            break;
        }
        out += escapeHtml(input.slice(i, start));
        const macStart = start + PREFIX.length;
        const sepIndex = input.indexOf(SEP, macStart);
        if (sepIndex === -1) {
            out += escapeHtml(input.slice(start));
            break;
        }
        const suffixIndex = input.indexOf(SUFFIX, sepIndex + 1);
        if (suffixIndex === -1) {
            out += escapeHtml(input.slice(start));
            break;
        }
        const mac = input.slice(macStart, sepIndex);
        const html = input.slice(sepIndex + 1, suffixIndex);
        const expected = crypto.createHmac("sha256", RAW_SECRET)
            .update(html)
            .digest("base64url");
        const macBuf = Buffer.from(mac);
        const expBuf = Buffer.from(expected);
        if (macBuf.length === expBuf.length &&
            crypto.timingSafeEqual(macBuf, expBuf)) {
            out += html;
        }
        else {
            out += escapeHtml(input.slice(start, suffixIndex + 1));
        }
        i = suffixIndex + SUFFIX.length;
    }
    return out;
}
export { raw, unwrapAllRaw, };
