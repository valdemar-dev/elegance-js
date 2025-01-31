// src/server/state.ts
var debounce = (delay) => {
  let timer;
  return (callback) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, delay);
  };
};
var Subject = class {
  constructor(initialValue, id, enforceRuntimeTypes = false, debounceUpdateMs = null, pathname = "", scope = 1 /* LOCAL */, resetOnPageLeave = false) {
    this.observers = [];
    this.enforceRuntimeTypes = enforceRuntimeTypes;
    this.value = initialValue;
    this.id = id;
    this.pathname = pathname;
    this.scope = scope;
    this.resetOnPageLeave = resetOnPageLeave;
    if (debounceUpdateMs) {
      this.debounce = debounce(debounceUpdateMs);
    }
  }
  set(newValue) {
    if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
      console.error(`Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`);
      return;
    }
    this.value = newValue;
  }
  add(entry) {
    if (!Array.isArray(this.value)) {
      console.error(`The add method of a subject may only be used if the subject's value is an Array.`);
      return;
    }
    this.value.push(entry);
  }
  remove(entry) {
    if (!Array.isArray(this.value)) {
      console.error(`The remove method of a subject may only be used if the subject's value is an Array.`);
      return;
    }
    const index = this.value.indexOf(entry);
    if (!index) console.error(`Element ${entry} does not exist in this subject, therefore it cannot be removed.`);
    this.value.splice(index, 1);
  }
  get() {
    return this.value;
  }
};
var ServerStateController = class {
  constructor(pathname) {
    this.subjectStore = [];
    this.observerStore = [];
    this.pathname = pathname;
  }
  create(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.pathname === this.pathname && sub.id === id;
    });
    if (existingSubject) {
      console.info(
        `%cSubject with ID ${id} already exists, therefore it will not be re-created.`,
        "font-size: 12px; color: #aaaaff"
      );
      return existingSubject;
    }
    const subject = new Subject(
      initialValue,
      id,
      enforceRuntimeTypes,
      debounceUpdateMs,
      this.pathname,
      1 /* LOCAL */,
      resetOnPageLeave
    );
    this.subjectStore.push(subject);
    return subject;
  }
  createGlobal(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.scope === 2 /* GLOBAL */ && sub.id === id;
    });
    if (existingSubject) {
      console.info(
        `%cGlobal Subject with ID ${id} already exists, therefore it will not be re-created.`,
        "font-size: 12px; color: #aaaaff"
      );
      return existingSubject;
    }
    const subject = new Subject(
      initialValue,
      id,
      enforceRuntimeTypes,
      debounceUpdateMs,
      "",
      2 /* GLOBAL */,
      resetOnPageLeave
    );
    this.subjectStore.push(subject);
    return subject;
  }
  getGlobal(id) {
    const subject = this.subjectStore.find((sub) => {
      return sub.scope === 2 /* GLOBAL */ && sub.id === id;
    });
    if (!subject) {
      throw new Error(`Could not find a global subject with the ID of ${id}.`);
    }
    return subject;
  }
  get(id) {
    const subject = this.subjectStore.find((sub) => {
      return sub.pathname === this.pathname && sub.id === id;
    });
    if (!subject) {
      console.error(`Could not find a subject with the ID of ${id} in the page ${this.pathname}`);
      return;
    }
    return subject;
  }
  storeObserver(id, scope) {
    this.observerStore.push({ [id]: scope });
  }
};

// src/server/renderer.ts
var renderRecursively = (element, index) => {
  let returnString = "";
  if (typeof element === "boolean") return returnString;
  else if (typeof element === "number" || typeof element === "string") {
    return returnString + element;
  } else if (Array.isArray(element)) {
    return returnString + element.join(", ");
  }
  returnString += `<${element.tag}`;
  for (const [attrName, attrValue] of Object.entries(element.options)) {
    if (typeof attrValue === "object") {
      throw `Internal error, attr ${attrName} has obj type.`;
    }
    returnString += ` ${attrName.toLowerCase()}="${attrValue}"`;
  }
  returnString += ">";
  for (const child of element.children) {
    returnString += renderRecursively(child, index + 1);
  }
  returnString += `</${element.tag}>`;
  return returnString;
};

// src/shared/bindBrowserElements.ts
var elementsWithAttributesAndChildren = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "body",
  "blockquote",
  "button",
  "canvas",
  "cite",
  "code",
  "colgroup",
  "data",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "pre",
  "progress",
  "q",
  "section",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "u",
  "ul",
  "var",
  "video",
  "details",
  "datalist"
];
var elementsWithAttributesOnly = [
  "audio",
  "base",
  "br",
  "col",
  "embed",
  "link",
  "meta",
  "noscript",
  "source",
  "track",
  "wbr",
  "area",
  "command",
  "picture",
  "progress",
  "html",
  "head"
];
var elementsWithChildrenOnly = [
  "title",
  "template"
];
var define = (tagName, hasAttr, hasChildren) => {
  return (...args) => {
    let options = {};
    let children = [];
    if (hasAttr && args.length > 0 && typeof args[0] === "object") {
      options = args[0];
      if (hasChildren && args.length > 1) {
        children = args.slice(1);
      }
    } else if (hasChildren && args.length > 0) {
      children = args;
    }
    return {
      tag: tagName,
      getOptions: options ?? {},
      children
    };
  };
};
Object.assign(globalThis, {
  ...elementsWithAttributesAndChildren.reduce((acc, el) => {
    acc[el] = define(el, true, true);
    return acc;
  }, {}),
  ...elementsWithChildrenOnly.reduce((acc, el) => {
    acc[el] = define(el, false, true);
    return acc;
  }, {}),
  ...elementsWithAttributesOnly.reduce((acc, el) => {
    acc[el] = define(el, true, false);
    return acc;
  }, {})
});

// src/server/render.ts
var serverSideRenderPage = async (page, pathname) => {
  if (!page) {
    throw `No Page Provided.`;
  }
  const state = new ServerStateController(pathname);
  const bodyHTML = renderRecursively(page, 0);
  console.log(bodyHTML);
  return {
    bodyHTML,
    storedEventListeners: [],
    storedState: state.subjectStore,
    storedObservers: state.observerStore,
    onHydrateFinish: void 0
  };
};
export {
  serverSideRenderPage
};
