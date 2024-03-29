import * as actions from "../../actions.js";

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
      window.scrollTo(0, 0);
    });
    left.appendChild(title);

    // docs
    const docsButton = document.createElement("a");
    docsButton.classList.add("topbar-Button");
    docsButton.textContent = "Docs";
    docsButton.href = "https://github.com/profankhauser/grading";
    left.appendChild(docsButton);

    // about
    const aboutButton = document.createElement("a");
    aboutButton.classList.add("topbar-Button");
    aboutButton.textContent = "About";
    aboutButton.href = "https://fankhauser.io";
    left.appendChild(aboutButton);

    // right
    const right = document.createElement("div");
    right.classList.add("topbar-Right");
    page.appendChild(right);

    // open action
    const openAction = this._newAction("Open", () => {
      actions.openFile(this._state);
    });
    right.appendChild(openAction);

    // save action
    const saveAction = this._newAction("Save", () => {
      actions.saveFile(this._state);
    });
    right.appendChild(saveAction);

    // reset action
    const resetAction = this._newAction("Reset", () => {
      actions.reset(this._state);
    });
    right.appendChild(resetAction);

    // copy url to clipboard action
    const copyURLAction = this._newAction("Copy URL", () => {
      actions.copyURLToClipboard(this._state);
    });
    right.appendChild(copyURLAction);

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
