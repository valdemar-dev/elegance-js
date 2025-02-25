// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (value, options) => {
  const serverStateEntry = {
    id: currentId++,
    value,
    type: 1 /* STATE */,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  return serverStateEntry;
};
var createEventListener = ({
  eventListener,
  dependencies = [],
  params
}) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: currentId++,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener.toString()})({ event, ...${JSON.stringify(params || {})} }, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

// src/server/loadHook.ts
var createLoadHook = (options) => {
  const stringFn = options.fn.toString();
  const deps = (options.deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`,
    bind: options.bind || ""
  });
};

// src/server/observe.ts
var observe = (refs, update) => {
  const returnValue = {
    type: 2 /* OBSERVER */,
    initialValues: refs.map((ref) => ref.value),
    update,
    refs: refs.map((ref) => ({
      id: ref.id,
      bind: ref.bind
    }))
  };
  return returnValue;
};

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
        const type = this.keywords.has(value) ? "text-amber-100 font-semibold" /* Keyword */ : "text-orange-300" /* Identifier */;
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

// src/docs/docs/components/CodeBlock.ts
var isToastShowing = createState(false);
var toastTimeoutId = createState(0);
var copyCode = createEventListener({
  dependencies: [
    isToastShowing,
    toastTimeoutId
  ],
  eventListener: async (params, isToastShowing2, toastTimeoutId2) => {
    const children = params.event.currentTarget.children;
    const pre2 = children.item(0);
    const content = pre2.innerText;
    await navigator.clipboard.writeText(content);
    if (toastTimeoutId2.value !== 0) clearTimeout(toastTimeoutId2.value);
    isToastShowing2.value = true;
    isToastShowing2.signal();
    const timeoutId = window.setTimeout(() => {
      isToastShowing2.value = false;
      isToastShowing2.signal();
    }, 3e3);
    toastTimeoutId2.value = timeoutId;
  }
});
var Toast = (bind) => {
  createLoadHook({
    bind,
    deps: [
      toastTimeoutId,
      isToastShowing
    ],
    fn: (state, toastTimeoutId2, isToastShowing2) => {
      return () => {
        clearTimeout(toastTimeoutId2.value);
        isToastShowing2.value = false;
        isToastShowing2.signal();
      };
    }
  });
  return div(
    {
      class: observe(
        [isToastShowing],
        (isShowing) => {
          const modularClass = isShowing ? "right-8" : "right-0 translate-x-full";
          return `fixed z-50 shadow-lg rounded-sm duration-200 bottom-4 px-4 py-2 w-max bg-background-950 ` + modularClass;
        }
      )
    },
    h1({
      class: "font-mono uppercase"
    }, "copied to clipboard")
  );
};
var escapeHtml2 = (str) => {
  const replaced = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  return replaced;
};
var CodeBlock = (value, parse = true) => div(
  {
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode
  },
  pre({}, parse ? highlightCode(value) : escapeHtml2(value))
);
export {
  CodeBlock,
  Toast
};
