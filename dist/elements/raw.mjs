import crypto from "crypto";
const RAW_SECRET = crypto.randomBytes(32);
const PREFIX = "\uE000RAW:";
const SEP = "\uE001";
const SUFFIX = "\uE002";
function raw(html) {
  const mac = crypto.createHmac("sha256", RAW_SECRET).update(html).digest("base64url");
  return PREFIX + mac + SEP + html + SUFFIX;
}
function maybeContainsRaw(s) {
  return s.includes(PREFIX);
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function unwrapAllRaw(input) {
  if (!maybeContainsRaw(input)) return escapeHtml(input);
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
    const expected = crypto.createHmac("sha256", RAW_SECRET).update(html).digest("base64url");
    const macBuf = Buffer.from(mac);
    const expBuf = Buffer.from(expected);
    if (macBuf.length === expBuf.length && crypto.timingSafeEqual(macBuf, expBuf)) {
      out += html;
    } else {
      out += escapeHtml(input.slice(start, suffixIndex + 1));
    }
    i = suffixIndex + SUFFIX.length;
  }
  return out;
}
export {
  raw,
  unwrapAllRaw
};
