// src/client/client.ts
var pageData = pd[window.location.pathname];
if (!pageData) {
  throw `Invalid Elegance Configuration. Page.JS is not properly sent to the Client. Pathname: ${window.location.pathname}}`;
}
var serverState = pageData.state;
var serverObservers = pageData.ooa;
var stateObjectAttributes = pageData.soa;
var isInWatchMode = pageData.w;
var pageLoadHooks = pageData.plh;
if (isInWatchMode) {
  const evtSource = new EventSource("http://localhost:3001/events");
  evtSource.onmessage = async (event) => {
    console.log(`Message: ${event.data}`);
    if (event.data === "reload") {
      const newHTML = await fetch(window.location.href);
      document.body = new DOMParser().parseFromString(await newHTML.text(), "text/html").body;
      const link = document.querySelector("[rel=stylesheet]");
      if (!link) {
        return;
      }
      const href = link.getAttribute("href");
      link.setAttribute("href", href.split("?")[0] + "?" + (/* @__PURE__ */ new Date()).getTime());
    } else if (event.data === "hard-reload") {
      window.location.reload();
    }
  };
}
var state = {
  subjects: {},
  populate: () => {
    for (const [subjectName, value] of Object.entries(serverState)) {
      const subject = value;
      state.subjects[subjectName] = {
        id: subject.id,
        value: subject.value,
        observers: []
      };
    }
  },
  get: (id) => Object.values(state.subjects).find((s) => s.id === id),
  set: (subject, value) => {
    subject.value = value;
    state.subjects[Object.keys(subject)[0]] = subject;
  },
  signal: (subject) => {
    const observers = subject.observers;
    for (const observer of observers) {
      observer(subject.value);
    }
  },
  observe: (subject, observer) => {
    subject.observers.push(observer);
  }
};
state.populate();
globalThis.getSubjects = () => state.subjects;
pd[window.location.pathname].sm = state;
if (serverObservers) {
  for (const observer of serverObservers) {
    const el = document.querySelector(`[key="${observer.key}"]`);
    let values = [];
    for (const id of observer.ids) {
      const subject = state.get(id);
      if (!subject) throw `No subject with id ${id}`;
      values.push(subject.value);
      const updateFunction = (value) => {
        values = values.sort();
        values[id] = value;
        el[observer.attribute] = observer.update(...values);
      };
      state.observe(subject, updateFunction);
    }
  }
}
if (stateObjectAttributes) {
  for (const soa of stateObjectAttributes) {
    const el = document.querySelector(`[key="${soa.key}"]`);
    const subject = state.get(soa.id);
    if (!subject) throw `SOA, no subject with ID: ${soa.id}`;
    el[soa.attribute] = (event) => subject.value(state, event);
  }
}
if (pageLoadHooks) {
  for (const pageLoadHook of pageLoadHooks) {
    pageLoadHook(state);
  }
}
