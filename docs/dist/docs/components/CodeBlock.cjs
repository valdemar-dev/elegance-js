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
var CodeBlock_exports = {};
__export(CodeBlock_exports, {
  CodeBlock: () => CodeBlock,
  Toast: () => Toast
});
module.exports = __toCommonJS(CodeBlock_exports);
var import_createState = require("../../../server/createState");
var import_loadHook = require("../../../server/loadHook");
var import_observe = require("../../../server/observe");
var import_MEGALEXER = require("../../utils/MEGALEXER");
const isToastShowing = (0, import_createState.createState)(false);
const toastTimeoutId = (0, import_createState.createState)(0);
const copyCode = (0, import_createState.createEventListener)({
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
const Toast = (bind) => {
  (0, import_loadHook.createLoadHook)({
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
      class: (0, import_observe.observe)(
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
const escapeHtml = (str) => {
  const replaced = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  return replaced;
};
const CodeBlock = (value, parse = true) => div(
  {
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode
  },
  pre({}, parse ? (0, import_MEGALEXER.highlightCode)(value) : escapeHtml(value))
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CodeBlock,
  Toast
});
