let url = "/";
export const data = { state: [{ id: 8, value: function anonymous(state, event) {
  ((_, isOpen2) => {
    isOpen2.value = !isOpen2.value;
    isOpen2.signal();
  })(event, ...state.getAll([{ id: 4 }]));
} }, { id: 9, value: function anonymous2(state, event) {
  ((_, useDarkMode2) => {
    useDarkMode2.value = false;
    useDarkMode2.signal();
  })(event, ...state.getAll([{ id: 3 }]));
} }, { id: 10, value: function anonymous3(state, event) {
  ((_, useDarkMode2) => {
    useDarkMode2.value = true;
    useDarkMode2.signal();
  })(event, ...state.getAll([{ id: 3 }]));
} }], soa: [{ "id": 8, "key": 2, "attribute": "onclick" }, { "id": 6, "key": 4, "attribute": "onclick" }, { "id": 2, "key": 5, "attribute": "onclick" }, { "id": 6, "key": 6, "attribute": "onclick" }, { "id": 2, "key": 7, "attribute": "onclick" }, { "id": 6, "key": 8, "attribute": "onclick" }, { "id": 2, "key": 9, "attribute": "onclick" }, { "id": 6, "key": 10, "attribute": "onclick" }, { "id": 2, "key": 11, "attribute": "onclick" }, { "id": 6, "key": 12, "attribute": "onclick" }, { "id": 2, "key": 13, "attribute": "onclick" }, { "id": 9, "key": 14, "attribute": "onclick" }, { "id": 10, "key": 15, "attribute": "onclick" }], ooa: [{ key: 1, attribute: "class", update: (value) => {
  let classList = "ease bg-background-10 text-text-10 dark:bg-text-10 dark:text-background-10 font-inter grid grid-cols-1 sm:gap-8 gap-0 sm:grid-cols-[300px_auto] grid-rows-[auto_auto] sm:grid-rows-1 h-full h-screen w-screen sm:pt-0 pt-[calc(2rem+24px)]";
  if (value === true) {
    classList += " dark";
  }
  return classList;
}, refs: [{ id: 3 }] }, { key: 3, attribute: "class", update: (value) => {
  let classList = "px-4 sm:p-8 sm:pr-0 inset-0 z-10 sm:bg-transparent top-[calc(24px_+_2rem)] sm:top-0 text-text-10 dark:text-background-10 dark:bg-text-10 bg-background-10 sm:relative fixed flex flex-col h-[calc(100%-calc(24px+2rem))] sm:h-full w-full max-w-[600px]   ";
  if (value === true) {
    classList += "translate-x-0 sm:translate-x-0";
  } else {
    classList += "-translate-x-full sm:translate-x-0";
  }
  return classList;
}, refs: [{ id: 4 }] }] };
if (!globalThis.ld) {
  globalThis.ld = {};
}
;
globalThis.ld[url] = data;
