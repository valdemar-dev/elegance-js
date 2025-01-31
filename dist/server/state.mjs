// src/server/state.ts
var debounce = (delay) => {
  let timer;
  return (callback) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, delay);
  };
};
var SubjectScope = /* @__PURE__ */ ((SubjectScope2) => {
  SubjectScope2[SubjectScope2["LOCAL"] = 1] = "LOCAL";
  SubjectScope2[SubjectScope2["GLOBAL"] = 2] = "GLOBAL";
  return SubjectScope2;
})(SubjectScope || {});
var Subject = class {
  constructor(initialValue, id, enforceRuntimeTypes = false, debounceUpdateMs = null, pathname = "", scope = 1 /* LOCAL */, resetOnPageLeave = false) {
    this.observers = [];
    this.enforceRuntimeTypes = enforceRuntimeTypes;
    this.value = initialValue;
    this.id = id;
    this.pathname = pathname;
    this.scope = scope;
    this.resetOnPageLeave = resetOnPageLeave;
    if (debounceUpdateMs) {
      this.debounce = debounce(debounceUpdateMs);
    }
  }
  set(newValue) {
    if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
      console.error(`Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`);
      return;
    }
    this.value = newValue;
  }
  add(entry) {
    if (!Array.isArray(this.value)) {
      console.error(`The add method of a subject may only be used if the subject's value is an Array.`);
      return;
    }
    this.value.push(entry);
  }
  remove(entry) {
    if (!Array.isArray(this.value)) {
      console.error(`The remove method of a subject may only be used if the subject's value is an Array.`);
      return;
    }
    const index = this.value.indexOf(entry);
    if (!index) console.error(`Element ${entry} does not exist in this subject, therefore it cannot be removed.`);
    this.value.splice(index, 1);
  }
  get() {
    return this.value;
  }
};
var ServerStateController = class {
  constructor(pathname) {
    this.subjectStore = [];
    this.observerStore = [];
    this.pathname = pathname;
  }
  create(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.pathname === this.pathname && sub.id === id;
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
      this.pathname,
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
      return sub.pathname === this.pathname && sub.id === id;
    });
    if (!subject) {
      console.error(`Could not find a subject with the ID of ${id} in the page ${this.pathname}`);
      return;
    }
    return subject;
  }
  storeObserver(id, scope) {
    this.observerStore.push({ [id]: scope });
  }
};
export {
  ServerStateController,
  SubjectScope
};
