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
var Header_exports = {};
__export(Header_exports, {
  Header: () => Header
});
module.exports = __toCommonJS(Header_exports);
var import_createState = require("../../server/createState");
var import_observe = require("../../server/observe");
var import_Link = require("../../components/Link");
var import_loadHook = require("../../server/loadHook");
const hasUserScrolled = (0, import_createState.createState)(false);
(0, import_loadHook.createLoadHook)({
  deps: [hasUserScrolled],
  fn: (state, hasUserScrolled2) => {
    const handleScroll = () => {
      const pos = {
        x: window.scrollX,
        y: window.scrollY
      };
      if (pos.y > 20) {
        if (hasUserScrolled2.value === true) return;
        hasUserScrolled2.value = true;
        hasUserScrolled2.signal();
      } else {
        if (hasUserScrolled2.value === false) return;
        hasUserScrolled2.value = false;
        hasUserScrolled2.signal();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }
});
const Header = () => header(
  {
    class: "sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"
  },
  div(
    {
      class: (0, import_observe.observe)(
        [hasUserScrolled],
        (hasUserScrolled2) => {
          const defaultClass = "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";
          if (hasUserScrolled2) return defaultClass + "border-b-background-800 bg-background-950";
          return defaultClass + "bg-background-900 border-b-transparent";
        }
      )
    },
    div(
      {
        class: "max-w-[900px] w-full mx-auto flex pr-2 px-3 sm:px-5 sm:min-[calc(900px+1rem)]:px-0"
      },
      div(
        {
          class: "flex min-w-max w-full items-center z-10"
        },
        (0, import_Link.Link)(
          {
            href: "/",
            class: "flex items-center gap-1 h-full"
          },
          p({
            class: "font-niconne pointer-fine:group-hover:text-background-950 font-bold text-xl sm:text-3xl relative top-0 z-20 duration-300 pointer-events-none",
            innerText: "Elegance"
          }),
          p({
            innerText: "JS",
            class: "font-bold pointer-fine:group-hover:text-background-950 relative top-0 text-xl sm:text-3xl z-10 text-accent-400 duration-300 pointer-events-none"
          })
        )
      ),
      div(
        {
          class: "flex py-2 sm:py-4 flex relative items-center justify-end w-full"
        },
        (0, import_Link.Link)({
          prefetch: "hover",
          class: "z-10 text-xs uppercase font-bold px-4 py-2 rounded-full duration-300 bg-accent-400 text-primary-900 pointer-fine:group-hover:bg-background-950 pointer-fine:group-hover:text-accent-400 group-hover:hover:bg-text-50 group-hover:hover:text-background-950",
          href: "/docs/basics",
          innerText: "Docs"
        })
      )
    )
  )
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Header
});
