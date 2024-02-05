export default class State {
  constructor() {
    this.listeners = {};
    this.data = {};
  }

  // listen to changes
  addEventListener(name, callback, options = {}) {
    // create new listener array slot for name
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }

    // register as listener
    this.listeners[name].push(callback);

    // with init: true - we call the callback once when added
    if (options.init) {
      callback();
    }
  }

  // notify that something changed
  dispatchEvent(name) {
    // check if listeners exist
    if (!this.listeners[name]) {
      return false;
    }

    // call listeners
    for (const callback of this.listeners[name]) {
      callback();
    }
  }
}
