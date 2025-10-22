// node_modules/elegance-js/dist/index.mjs
var loadHook = (deps, fn, bind) => {
  const stringFn = fn.toString();
  const depsArray = (deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of depsArray) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const isAsync = fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
    bind: bind || ""
  });
};
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
}
var state = (value, options) => {
  const serverStateEntry = {
    id: __SERVER_CURRENT_STATE_ID__ += 1,
    value,
    type: 1,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  if (Array.isArray(value)) {
    serverStateEntry.reactiveMap = reactiveMap;
  }
  return serverStateEntry;
};
var reactiveMap = function(template, deps) {
  const subject = this;
  const dependencies = state(deps || []);
  const templateFn = state(template);
  loadHook(
    [subject, templateFn, dependencies],
    (state2, subject2, templateFn2, dependencies2) => {
      const el = document.querySelector(
        `[map-id="${subject2.id}"]`
      );
      if (!el) {
        console.error(`Couldn't find map tag with map-id=${subject2.id}`);
        return;
      }
      const parentElement = el.parentElement;
      const nextSibling = el.nextSibling;
      el.remove();
      const value = subject2.value;
      const deps2 = state2.getAll(dependencies2.value.map((dep) => ({ id: dep.id, bind: dep.bind })));
      const attributes = [];
      const currentlyWatched = [];
      const createElements = () => {
        const state3 = pd[client.currentPage].stateManager;
        for (let i = 0; i < value.length; i += 1) {
          const htmlElement = client.renderRecursively(templateFn2.value(value[i], i, ...deps2), attributes);
          htmlElement.setAttribute("map-id", subject2.id.toString());
          const elementKey = ((i - 1) * -1).toString();
          htmlElement.setAttribute("key", elementKey);
          for (const attribute of attributes) {
            let values = {};
            const type = attribute.type;
            switch (type) {
              case 2: {
                const { field, subjects, updateCallback } = attribute;
                for (const reference of subjects) {
                  const subject3 = state3.get(reference.id, reference.bind);
                  const updateFunction = (value2) => {
                    values[subject3.id] = value2;
                    try {
                      const newValue = updateCallback(...Object.values(values));
                      let attribute2 = field === "class" ? "className" : field;
                      htmlElement[attribute2] = newValue;
                    } catch (e) {
                      console.error(e);
                      return;
                    }
                  };
                  updateFunction(subject3.value);
                  state3.observe(subject3, updateFunction, elementKey);
                  currentlyWatched.push({
                    key: elementKey,
                    subject: subject3
                  });
                }
                break;
              }
              case 1: {
                const { field, element, subjects, eventListener: eventListener22 } = attribute;
                const lc = field.toLowerCase();
                const fn = (event) => {
                  eventListener22(event, ...subjects);
                };
                element[lc] = fn;
                break;
              }
            }
          }
          parentElement.insertBefore(htmlElement, nextSibling);
          attributes.splice(0, attributes.length);
        }
      };
      const removeOldElements = () => {
        const list = Array.from(document.querySelectorAll(`[map-id="${subject2.id}"]`));
        for (const el2 of list) {
          el2.remove();
        }
        const pageData = pd[client.currentPage];
        const state3 = pageData.stateManager;
        for (const watched of currentlyWatched) {
          state3.unobserve(watched.subject, watched.key);
        }
        currentlyWatched.splice(0, currentlyWatched.length);
      };
      createElements();
      const uniqueId = `${Date.now()}`;
      state2.observe(subject2, (value2) => {
        removeOldElements();
        createElements();
      }, uniqueId);
    }
  );
  return globalThis.template({
    "map-id": subject.id
  });
};
var eventListener = (dependencies, eventListener22) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: __SERVER_CURRENT_STATE_ID__ += 1,
    type: 1,
    value: new Function(
      "state",
      "event",
      `(${eventListener22.toString()})(event, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

// node_modules/elegance-js/dist/components/Link.mjs
var loadHook2 = (deps, fn, bind) => {
  const stringFn = fn.toString();
  const depsArray = (deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of depsArray) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const isAsync = fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
    bind: bind || ""
  });
};
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
}
var eventListener2 = (dependencies, eventListener22) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: __SERVER_CURRENT_STATE_ID__ += 1,
    type: 1,
    value: new Function(
      "state",
      "event",
      `(${eventListener22.toString()})(event, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};
loadHook2(
  [],
  () => {
    const anchors = Array.from(document.querySelectorAll("a[prefetch]"));
    const elsToClear = [];
    for (const anchor of anchors) {
      const prefetch = anchor.getAttribute("prefetch");
      const href = new URL(anchor.href);
      switch (prefetch) {
        case "load":
          client.fetchPage(href);
          break;
        case "hover":
          const fn = () => {
            client.fetchPage(href);
          };
          anchor.addEventListener("mouseenter", fn);
          elsToClear.push({
            el: anchor,
            fn
          });
          break;
      }
    }
    return () => {
      for (const listener of elsToClear) {
        listener.el.removeEventListener("mouseenter", listener.fn);
      }
    };
  }
);
var navigate = eventListener2(
  [],
  (event) => {
    const target = new URL(event.currentTarget.href);
    const client2 = globalThis.client;
    const sanitizedTarget = client2.sanitizePathname(target.pathname);
    const sanitizedCurrent = client2.sanitizePathname(window.location.pathname);
    if (sanitizedTarget === sanitizedCurrent) {
      if (target.hash === window.location.hash) return event.preventDefault();
      return;
    }
    event.preventDefault();
    client2.navigateLocally(target.href);
  }
);

// pages/layout.ts
var toastContent = state("");
loadHook(
  [toastContent],
  (state2, toastContent2) => {
    const toastElement = document.getElementById("toaster");
    if (!toastElement) return;
    const showToast = () => {
      toastElement.hidden = false;
      toastElement.style.transform = "translateY(100%)";
      void toastElement.offsetWidth;
      toastElement.style.transitionDuration = "300ms";
      toastElement.style.transform = "translateY(-1rem)";
    };
    const el = () => {
      toastElement.hidden = true;
      toastContent2.value = "";
      toastElement.removeEventListener("transitionend", el);
    };
    const hideToast = () => {
      toastElement.style.transform = "translateY(100%)";
      toastElement.addEventListener("transitionend", el);
    };
    let timerId;
    const observer = (value) => {
      if (value === "") return;
      toastElement.innerText = value;
      showToast();
      if (timerId) {
        clearTimeout(timerId);
        toastElement.removeEventListener("transitionend", el);
      }
      timerId = setTimeout(() => {
        hideToast();
      }, 3e3);
    };
    const id = Date.now().toString();
    observer(toastContent2.value);
    state2.observe(toastContent2, observer, id);
    return () => toastContent2.observers.delete(id);
  }
);

// pages/utils/mdToElegance.ts
var headingStyles = "pb-2 mt-12";
var headingMap = {
  "#": (children) => h1({ class: headingStyles + " text-4xl" }, children),
  "##": (children) => h2({ class: headingStyles + " text-3xl" }, children),
  "###": (children) => h3({ class: headingStyles + " text-2xl" }, children),
  "####": (children) => h4({ class: headingStyles + " text-xl" }, children),
  "#####": (children) => h5({ class: headingStyles + " text-lg" }, children),
  "######": (children) => h6({ class: headingStyles + " text-base" }, children)
};
var codeElement = (children) => {
  const codeContent = state(children);
  return div(
    {
      class: "bg-text-00 p-2 rounded-sm w-max hover:cursor-pointer hover:opacity-80 duration-100 select-none my-2",
      onClick: eventListener(
        [codeContent, toastContent],
        async (_, codeContent2, toastContent2) => {
          await navigator.clipboard.writeText(`${codeContent2.value}`);
          toastContent2.value = "Copied to Clipboard";
          toastContent2.signal();
        }
      )
    },
    code(
      {
        class: "font-plex-mono"
      },
      children
    )
  );
};
var applyFormatter = (parts, regex, creator, recurse = false) => {
  const newParts = [];
  for (let part of parts) {
    if (typeof part !== "string") {
      newParts.push(part);
      continue;
    }
    let lastIndex = 0;
    let match;
    const re = new RegExp(regex.source, "g");
    while ((match = re.exec(part)) !== null) {
      const content = match[1];
      if (match.index > lastIndex) {
        newParts.push(part.slice(lastIndex, match.index));
      }
      const parsedContent = recurse ? parseInline(content) : [content];
      newParts.push(creator(parsedContent));
      lastIndex = re.lastIndex;
    }
    if (lastIndex < part.length) {
      newParts.push(part.slice(lastIndex));
    }
  }
  return newParts;
};
var applyLinkFormatter = (parts) => {
  const newParts = [];
  for (let part of parts) {
    if (typeof part !== "string") {
      newParts.push(part);
      continue;
    }
    let lastIndex = 0;
    const re = /\[([^\]]*)\]\(([^\)]*)\)/g;
    let match;
    while ((match = re.exec(part)) !== null) {
      if (match.index > lastIndex) {
        newParts.push(part.slice(lastIndex, match.index));
      }
      const text = match[1];
      const url = match[2];
      const parsedText = parseInline(text);
      newParts.push(a({ href: url }, ...parsedText));
      lastIndex = re.lastIndex;
    }
    if (lastIndex < part.length) {
      newParts.push(part.slice(lastIndex));
    }
  }
  return newParts;
};
var parseInline = (text) => {
  let parts = [text];
  parts = applyFormatter(parts, /`(.*?)`/, (children) => codeElement(children));
  parts = applyLinkFormatter(parts);
  parts = applyFormatter(parts, /\*\*(.*?)\*\*/, (children) => strong({}, children), true);
  parts = applyFormatter(parts, /\*(.*?)\*/, (children) => em({}, children), true);
  return parts;
};
var mdToElegance = (mdContent) => {
  const lines = mdContent.split("\n");
  const output = [];
  let currentParaLines = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentParaLines.length > 0) {
        const paraChildren = [];
        for (let i = 0; i < currentParaLines.length; i++) {
          let paraLine = currentParaLines[i];
          const trailingSpaces = paraLine.length - paraLine.trimEnd().length;
          const brCount = Math.floor(trailingSpaces / 2);
          let content = paraLine.replace(/ {2,}$/, "").trimEnd();
          paraChildren.push(...parseInline(content));
          for (let j = 0; j < brCount; j++) {
            paraChildren.push(br({}));
          }
        }
        output.push(p({}, ...paraChildren));
        currentParaLines = [];
      }
      continue;
    }
    let isHeading = false;
    for (let level = 1; level <= 6; level++) {
      const token = "#".repeat(level);
      if (trimmed.startsWith(token + " ")) {
        if (currentParaLines.length > 0) {
          const paraChildren = [];
          for (let i = 0; i < currentParaLines.length; i++) {
            let paraLine = currentParaLines[i];
            const trailingSpaces = paraLine.length - paraLine.trimEnd().length;
            const brCount = Math.floor(trailingSpaces / 2);
            let content2 = paraLine.replace(/ {2,}$/, "").trimEnd();
            paraChildren.push(...parseInline(content2));
            for (let j = 0; j < brCount; j++) {
              paraChildren.push(br({}));
            }
          }
          output.push(p({}, ...paraChildren));
          currentParaLines = [];
        }
        const content = trimmed.slice(token.length + 1);
        const children = parseInline(content);
        const headingFunc = headingMap[token];
        output.push(headingFunc(children));
        isHeading = true;
        break;
      }
    }
    if (!isHeading) {
      currentParaLines.push(line);
    }
  }
  if (currentParaLines.length > 0) {
    const paraChildren = [];
    for (let i = 0; i < currentParaLines.length; i++) {
      let paraLine = currentParaLines[i];
      const trailingSpaces = paraLine.length - paraLine.trimEnd().length;
      const brCount = Math.floor(trailingSpaces / 2);
      let content = paraLine.replace(/ {2,}$/, "").trimEnd();
      paraChildren.push(...parseInline(content));
      for (let j = 0; j < brCount; j++) {
        paraChildren.push(br({}));
      }
    }
    output.push(p({}, ...paraChildren));
  }
  return output;
};
export {
  mdToElegance
};
