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
  const isAsync = options.fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
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
var tokenize = (input) => {
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
var escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
var highlightCode = (code) => {
  const tokens = tokenize(code);
  return tokens.map(
    (token) => token.type === "" /* Whitespace */ ? token.value : `<span class="${token.type}">${escapeHtml(token.value)}</span>`
  ).join("");
};

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
