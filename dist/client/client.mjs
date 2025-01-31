// src/client/client.ts
var pageData = pd[window.location.pathname];
if (!pageData) {
  throw `Invalid Elegance Configuration. Page.JS is not properly sent to the Client. Pathname: ${window.location.pathname}}`;
}
var serverState = pageData.state;
var serverObservers = pageData.ooa;
var state = {
  subjects: [],
  populate: () => {
    for (const [key, value] of Object.entries(serverState)) {
      state.subjects.push({
        id: parseInt(key),
        value,
        observers: []
      });
    }
  },
  get: (id) => state.subjects.find((s) => s.id === id),
  set: (id, value) => {
    const subject = state.get(id);
    if (!subject) throw `No subject with id ${id}`;
    subject.value = value;
  },
  signal: (id) => {
    const subject = state.get(id);
    if (!subject) throw `No subject with id ${id}`;
    const observers = subject.observers;
    for (const observer of observers) {
      observer(subject.value);
    }
  },
  observe: (id, observer) => {
    const subject = state.get(id);
    if (!subject) throw `No subject with id ${id}`;
    subject.observers.push(observer);
  }
};
state.populate();
if (serverObservers) {
  for (const observer of serverObservers) {
    const el = document.querySelector(`[key="${observer.key}"]`);
    const subject = state.get(observer.id);
    state.observe(subject.id, (value) => {
      el[observer.attribute] = observer.update(value);
    });
  }
  setInterval(() => {
    const subject = state.get(0);
    state.set(subject.id, subject.value + 1);
    state.signal(subject.id);
  }, 1e3);
}
