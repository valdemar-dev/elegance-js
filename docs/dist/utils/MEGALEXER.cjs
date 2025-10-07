"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var MEGALEXER_exports = {};
__export(MEGALEXER_exports, {
  highlightCode: () => highlightCode
});
module.exports = __toCommonJS(MEGALEXER_exports);
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2["Keyword"] = "text-amber-100 font-semibold";
  TokenType2["Identifier"] = "text-orange-300";
  TokenType2["FunctionCall"] = "text-red-300";
  TokenType2["Number"] = "text-blue-400";
  TokenType2["String"] = "text-green-200";
  TokenType2["Comment"] = "text-gray-400";
  TokenType2["Punctuation"] = "text-gray-400";
  TokenType2["Boolean"] = "text-blue-200";
  TokenType2["Operator"] = "";
  TokenType2["Whitespace"] = "";
  TokenType2["Unknown"] = "";
  return TokenType2;
})(TokenType || {});
const tokenize = (input) => {
  const tokens = [];
  const length = input.length;
  let index = 0;
  const keywords = /* @__PURE__ */ new Set([
    "if",
    "else",
    "for",
    "while",
    "function",
    "return",
    "class",
    "const",
    "let",
    "var",
    "interface",
    "extends",
    "implements",
    "export",
    "import",
    "from"
  ]);
  const operatorChars = /* @__PURE__ */ new Set([
    "+",
    "-",
    "*",
    "/",
    "%",
    "=",
    ">",
    "<",
    "!",
    "&",
    "|",
    "^",
    "~",
    "?",
    ":"
  ]);
  const punctuationChars = /* @__PURE__ */ new Set([
    ";",
    ",",
    ".",
    "(",
    ")",
    "{",
    "}",
    "[",
    "]"
  ]);
  const peek = (offset = 1) => index + offset < length ? input[index + offset] : "";
  const readWhile = (predicate) => {
    const start = index;
    while (index < length && predicate(input[index])) {
      index++;
    }
    return input.slice(start, index);
  };
  const readString = (quoteType) => {
    let value = input[index++];
    while (index < length && input[index] !== quoteType) {
      if (input[index] === "\\") {
        value += input[index++];
        if (index < length) {
          value += input[index++];
        }
      } else {
        value += input[index++];
      }
    }
    if (index < length) {
      value += input[index++];
    }
    return value;
  };
  const readLineComment = () => {
    const start = index;
    index += 2;
    while (index < length && input[index] !== "\n") {
      index++;
    }
    return input.slice(start, index);
  };
  const readBlockComment = () => {
    const start = index;
    index += 2;
    while (index < length && !(input[index] === "*" && peek() === "/")) {
      index++;
    }
    if (index < length) {
      index += 2;
    }
    return input.slice(start, index);
  };
  while (index < length) {
    const char = input[index];
    const startPos = index;
    if (/\s/.test(char)) {
      const value = readWhile((c) => /\s/.test(c));
      tokens.push({ type: "" /* Whitespace */, value, position: startPos });
      continue;
    }
    if (char === "/") {
      if (peek() === "/") {
        const value = readLineComment();
        tokens.push({ type: "text-gray-400" /* Comment */, value, position: startPos });
        continue;
      } else if (peek() === "*") {
        const value = readBlockComment();
        tokens.push({ type: "text-gray-400" /* Comment */, value, position: startPos });
        continue;
      }
    }
    if (char === '"' || char === "'") {
      const value = readString(char);
      tokens.push({ type: "text-green-200" /* String */, value, position: startPos });
      continue;
    }
    if (/\d/.test(char)) {
      const value = readWhile((c) => /[\d\.]/.test(c));
      tokens.push({ type: "text-blue-400" /* Number */, value, position: startPos });
      continue;
    }
    if (/[a-zA-Z_$]/.test(char)) {
      const value = readWhile((c) => /[a-zA-Z0-9_$]/.test(c));
      let type = "text-orange-300" /* Identifier */;
      if (keywords.has(value)) {
        type = "text-amber-100 font-semibold" /* Keyword */;
      } else if (value === "true" || value === "false") {
        type = "text-blue-200" /* Boolean */;
      }
      let tempIndex = index;
      while (tempIndex < length && /\s/.test(input[tempIndex])) {
        tempIndex++;
      }
      if (tempIndex < length && input[tempIndex] === "(") {
        type = "text-red-300" /* FunctionCall */;
      }
      tokens.push({ type, value, position: startPos });
      continue;
    }
    if (operatorChars.has(char)) {
      let value = char;
      index++;
      if (index < length && operatorChars.has(input[index])) {
        value += input[index++];
      }
      tokens.push({ type: "" /* Operator */, value, position: startPos });
      continue;
    }
    if (punctuationChars.has(char)) {
      tokens.push({ type: "text-gray-400" /* Punctuation */, value: char, position: startPos });
      index++;
      continue;
    }
    tokens.push({ type: "" /* Unknown */, value: char, position: startPos });
    index++;
  }
  return tokens;
};
const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const highlightCode = (code) => {
  const tokens = tokenize(code);
  return tokens.map(
    (token) => token.type === "" /* Whitespace */ ? token.value : `<span class="${token.type}">${escapeHtml(token.value)}</span>`
  ).join("");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  highlightCode
});
