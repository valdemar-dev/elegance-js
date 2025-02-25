// src/docs/utils/MEGALEXER.ts
var Lexer = class {
  constructor(input) {
    this.keywords = /* @__PURE__ */ new Set([
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
      "type",
      "extends",
      "implements",
      "export"
    ]);
    this.input = input;
    this.index = 0;
    this.length = input.length;
  }
  tokenize() {
    const tokens = [];
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
    while (this.index < this.length) {
      const currentChar = this.input[this.index];
      if (/\s/.test(currentChar)) {
        const value = this.readWhile((c) => /\s/.test(c));
        tokens.push({ type: "" /* Whitespace */, value, position: this.index });
        continue;
      }
      if (currentChar === "/") {
        if (this.peek() === "/") {
          const value = this.readLineComment();
          tokens.push({ type: "text-gray-400" /* Comment */, value, position: this.index });
          continue;
        } else if (this.peek() === "*") {
          const value = this.readBlockComment();
          tokens.push({ type: "text-gray-400" /* Comment */, value, position: this.index });
          continue;
        }
      }
      if (currentChar === '"' || currentChar === "'") {
        const value = this.readString(currentChar);
        tokens.push({ type: "text-green-200" /* String */, value, position: this.index });
        continue;
      }
      if (/\d/.test(currentChar)) {
        const value = this.readWhile((c) => /[\d\.]/.test(c));
        tokens.push({ type: "text-blue-400" /* Number */, value, position: this.index });
        continue;
      }
      if (/[a-zA-Z_$]/.test(currentChar)) {
        const value = this.readWhile((c) => /[a-zA-Z0-9_$]/.test(c));
        const type = this.keywords.has(value) ? "text-amber-100" /* Keyword */ : "text-orange-300" /* Identifier */;
        tokens.push({ type, value, position: this.index });
        continue;
      }
      if (operatorChars.has(currentChar)) {
        let value = currentChar;
        this.index++;
        if (this.index < this.length && operatorChars.has(this.input[this.index])) {
          value += this.input[this.index++];
        }
        tokens.push({ type: "" /* Operator */, value, position: this.index });
        continue;
      }
      if (punctuationChars.has(currentChar)) {
        tokens.push({ type: "text-gray-400" /* Punctuation */, value: currentChar, position: this.index + 1 });
        this.index++;
        continue;
      }
      tokens.push({ type: "" /* Unknown */, value: currentChar, position: this.index + 1 });
      this.index++;
    }
    return tokens;
  }
  readWhile(predicate) {
    const start = this.index;
    while (this.index < this.length && predicate(this.input[this.index])) {
      this.index++;
    }
    return this.input.slice(start, this.index);
  }
  readLineComment() {
    let value = this.input[this.index] + this.input[this.index + 1];
    this.index += 2;
    while (this.index < this.length && this.input[this.index] !== "\n") {
      value += this.input[this.index++];
    }
    return value;
  }
  readBlockComment() {
    let value = this.input[this.index] + this.input[this.index + 1];
    this.index += 2;
    while (this.index < this.length && !(this.input[this.index] === "*" && this.peek() === "/")) {
      value += this.input[this.index++];
    }
    if (this.index < this.length) {
      value += this.input[this.index++] + this.input[this.index++];
    }
    return value;
  }
  readString(quoteType) {
    let value = this.input[this.index++];
    while (this.index < this.length && this.input[this.index] !== quoteType) {
      if (this.input[this.index] === "\\") {
        value += this.input[this.index++];
        if (this.index < this.length) {
          value += this.input[this.index++];
        }
      } else {
        value += this.input[this.index++];
      }
    }
    if (this.index < this.length) {
      value += this.input[this.index++];
    }
    return value;
  }
  peek(offset = 1) {
    return this.index + offset < this.length ? this.input[this.index + offset] : "";
  }
};
function postProcessTokens(tokens) {
  const processed = [];
  let insideObject = false;
  const braceStack = [];
  const nextNonWhitespace = (i) => {
    let j = i + 1;
    while (j < tokens.length && tokens[j].type === "" /* Whitespace */) {
      j++;
    }
    return tokens[j];
  };
  const prevNonWhitespace = (i) => {
    let j = i - 1;
    while (j >= 0 && tokens[j].type === "" /* Whitespace */) {
      j--;
    }
    return tokens[j];
  };
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.type === "text-gray-400" /* Punctuation */) {
      if (token.value === "{") {
        braceStack.push(token);
        insideObject = true;
      } else if (token.value === "}") {
        braceStack.pop();
        if (braceStack.length === 0) {
          insideObject = false;
        }
      }
    }
    if (token.type === "text-orange-300" /* Identifier */) {
      const next = nextNonWhitespace(i);
      if (next && next.type === "text-gray-400" /* Punctuation */ && next.value === "(") {
        token = { ...token, type: "text-orange-300" /* FunctionCall */ };
      }
    }
    if (insideObject && (token.type === "text-orange-300" /* Identifier */ || token.type === "text-green-200" /* String */)) {
      const next = nextNonWhitespace(i);
      if (next && next.type === "text-gray-400" /* Punctuation */ && next.value === ":") {
        token = { ...token, type: "" /* ObjectKey */ };
      }
    }
    if (insideObject) {
      const prev = prevNonWhitespace(i);
      if (prev && prev.type === "text-gray-400" /* Punctuation */ && prev.value === ":") {
        if (token.type !== "text-gray-400" /* Punctuation */ || token.value !== "," && token.value !== "}") {
          token = { ...token, type: "" /* ObjectValue */ };
        }
      }
    }
    processed.push(token);
  }
  return processed;
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function highlightCode(code) {
  const lexer = new Lexer(code);
  let tokens = lexer.tokenize();
  tokens = postProcessTokens(tokens);
  return tokens.map(
    (token) => token.type === "" /* Whitespace */ ? token.value : `<span class="${token.type}">${escapeHtml(token.value)}</span>`
  ).join("");
}
export {
  highlightCode
};
