import State from "../state.js";
import GradingScreenMain from "../screens/main/main.js";
import * as actions from "../actions.js";

const SCREENS = {
  main: GradingScreenMain,
};

export default class GradingApp extends HTMLElement {
  constructor() {
    super();
    this._state = new State();
    window.state = this._state;
  }

  connectedCallback() {
    this.classList.add("app-App");

    // create screen
    let screen = document.createElement("div");
    this.appendChild(screen);

    // watch for changes
    this._state.addEventListener("screen-changed", () => {
      let newScreen = new SCREENS[this._state.data.screen](this._state);
      screen.replaceWith(newScreen);
      screen = newScreen;
    });

    // let's boot
    actions.boot(this._state);
  }
}

// register
window.customElements.define("grading-app", GradingApp);
