// src/client/state.ts
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
    this.enforceRuntimeTypes = enforceRuntimeTypes;
    this.observers = [];
    this.value = initialValue;
    this.initialValue = structuredClone(initialValue);
    this.id = id;
    this.pathname = pathname;
    this.scope = scope;
    this.resetOnPageLeave = resetOnPageLeave;
    if (debounceUpdateMs) {
      this.debounce = debounce(debounceUpdateMs);
    }
  }
  observe(callback) {
    if (typeof callback !== "function") {
      throw new Error("The provided callback function must be a function.");
    }
    if (callback.length !== 1) {
      throw new Error("The callback function must take one parameter (new value of the subject).");
    }
    this.observers.push({ callback });
  }
  signal() {
    const notifyObservers = async () => {
      const value = this.get();
      for (const observer of this.observers) {
        observer.callback(value);
      }
    };
    if (this.debounce) {
      this.debounce(notifyObservers);
    } else {
      notifyObservers();
    }
  }
  set(newValue) {
    if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
      throw `Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`;
    }
    this.value = newValue;
  }
  add(entry) {
    if (!Array.isArray(this.value)) {
      throw `The add method of a subject may only be used if the subject's value is an Array.`;
    }
    this.value.push(entry);
  }
  remove(entry) {
    if (!Array.isArray(this.value)) {
      throw `The remove method of a subject may only be used if the subject's value is an Array.`;
    }
    const index = this.value.indexOf(entry);
    if (!index) throw `Element ${entry} does not exist in this subject, therefore it cannot be removed.`;
    this.value.splice(index, 1);
  }
  reset() {
    this.value = this.initialValue;
  }
  get() {
    return this.value;
  }
  getInitialValue() {
    return this.initialValue;
  }
};
var StateController = class {
  constructor() {
    this.subjectStore = [];
  }
  create(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.pathname === window.location.pathname && sub.id === id;
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
      window.location.pathname,
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
      return sub.pathname === window.location.pathname && sub.id === id;
    });
    if (!subject) {
      throw new Error(`Could not find a subject with the ID of ${id} in the page ${window.location.pathname}`);
    }
    return subject;
  }
  observe(id, callback, scope = 1 /* LOCAL */) {
    if (scope === 1 /* LOCAL */) {
      const subject = this.get(id);
      subject.observe(callback);
    } else {
      const subject = this.getGlobal(id);
      subject.observe(callback);
    }
  }
  resetEphemeralSubjects() {
    this.subjectStore = this.subjectStore.filter((subj) => subj.resetOnPageLeave === false);
  }
  cleanSubjectObservers() {
    for (const subject of this.subjectStore) {
      subject.observers = [];
    }
  }
};
export {
  StateController
};
