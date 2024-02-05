export default class GradingScreenMainTopbar extends HTMLElement {
  constructor(state) {
    super();
    this._state = state;
  }

  connectedCallback() {
    this.classList.add("topbar-Topbar");

    // page
    const page = document.createElement("div");
    page.classList.add("topbar-Page");
    this.appendChild(page);

    // left
    const left = document.createElement("div");
    left.classList.add("topbar-Left");
    page.appendChild(left);

    const logo = document.createElement("div");
    logo.classList.add("topbar-Logo");
    left.appendChild(logo);

    const title = document.createElement("h1");
    title.classList.add("topbar-Title");
    title.textContent = "Grading";
    title.addEventListener("click", () => {
      this._state.openHome();
    });
    left.appendChild(title);

    // right
    const right = document.createElement("div");
    right.classList.add("topbar-Right");
    page.appendChild(right);

    // open action
    const openAction = this._newAction("Open", () => {
      //this._state.newEvaluation();
    });
    right.appendChild(openAction);

    // save action
    const exportAction = this._newAction("Export", () => {
      //this._state.newEvaluation();
    });
    right.appendChild(exportAction);

    // reset action
    const resetAction = this._newAction("Reset", () => {
      //this._state.newEvaluation();
    });
    right.appendChild(resetAction);

    // print
    const printAction = this._newAction("Create PDF", () => {
      window.print();
    });
    right.appendChild(printAction);
  }

  _newAction(text, click) {
    const action = document.createElement("button");
    action.classList.add("topbar-Action");
    action.addEventListener("click", click);

    const actionText = document.createElement("div");
    actionText.classList.add("topbar-ActionText");
    actionText.textContent = text;
    action.appendChild(actionText);

    return action;
  }
}

// register
window.customElements.define(
  "grading-screen-main-topbar",
  GradingScreenMainTopbar
);
