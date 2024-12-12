// src/server/createPageInfo.ts
var createPageInfo = ({
  storedEventListeners,
  renderingMethod
}) => {
  let storedEventListenersString = storedEventListeners.map((storedEL) => `{id:${storedEL.eleganceID},els:[${storedEL.eventListeners.map((el) => el)}]}`);
  return `{rm:${renderingMethod},sels:[${storedEventListenersString}]}`;
};
export {
  createPageInfo
};
