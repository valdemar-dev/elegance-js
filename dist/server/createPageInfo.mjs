// src/server/createPageInfo.ts
var formatNicer = (value) => {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return value;
};
var createPageInfo = ({
  storedEventListeners,
  storedState,
  storedObservers,
  pathname,
  onHydrateFinish
}) => {
  let pageDataScriptText = "<script e-pi>(globalThis.__PAGE_INFOS__ ||= []).push({";
  pageDataScriptText += `a:"${pathname}",`;
  const storedEventListenersString = storedEventListeners.map((storedEL) => `{id:${storedEL.eleganceID},els:[${storedEL.eventListeners.map((el) => el)}]}`);
  pageDataScriptText += `b:[${storedEventListenersString}],`;
  const storedStateString = storedState.map(
    (state) => `{id:"${state.id}",        v:${formatNicer(state.value)},        ert:${state.enforceRuntimeTypes},        s:"${state.scope}",        db:${state.debounce ?? 0},        ropl:${state.resetOnPageLeave}},`
  );
  pageDataScriptText += `c:[${storedStateString}],`;
  if (onHydrateFinish) {
    pageDataScriptText += `d:${onHydrateFinish.toString().replace(/\s+/g, "")},`;
  }
  const storedObserversString = storedObservers.map((os) => Object.entries(os).map(([key, value]) => `{${key}:"${value}"},`));
  pageDataScriptText += `e:[${storedObserversString}],`;
  pageDataScriptText += "})</script>";
  return pageDataScriptText;
};
export {
  createPageInfo
};
