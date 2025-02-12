// src/helpers/createEventListener.ts
var createEventListener = (fn) => fn;

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (augment) => {
  for (const [key, value] of Object.entries(augment)) {
    globalThis.__SERVER_CURRENT_STATE__[key] = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
  }
  return globalThis.__SERVER_CURRENT_STATE__;
};

// src/components/Link.ts
var Link = ({
  href
}, ...children) => {
  return a(
    {
      href,
      onClick: serverState.navigate
    },
    ...children
  );
};
var serverState = createState({
  navigate: createEventListener((state, event) => {
    event.preventDefault();
    navigateLocally(event.target.href);
  })
});
export {
  Link
};
