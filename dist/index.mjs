export * from "./client/observer";
import { eventListener } from "./client/eventListener";
import { loadHook } from "./client/loadHook";
import { state } from "./client/state";
import { startEleganceRuntime } from "./server/runtime";
const test = true;
export {
  eventListener,
  loadHook,
  startEleganceRuntime,
  state,
  test
};
