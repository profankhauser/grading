import GradingToolMarkdownArea from "../tool/markdown-area.js";
import GradingToolDropdown from "../tool/dropdown.js";
import * as actions from "../actions.js";

export default class GradingBlockText extends HTMLElement {
  constructor(state, block) {
    super();
    this._state = state;
    this._block = block;
  }

  connectedCallback() {
    this.classList.add("block-Block");

    // sidecar
    let sidecar = document.createElement("div");
    sidecar.classList.add("block-Sidecar");
    this.appendChild(sidecar);

    // options dropdown
    let options = this._newOptionsButton();
    sidecar.appendChild(options);

    // text
    let text = new GradingToolMarkdownArea(this._block.text);
    text.addEventListener("content-changed", (event) => {
      this._block.text = event.detail;
      this._state.dispatchEvent("block-text-changed");
    });
    this.appendChild(text);
  }

  _newOptionsButton() {
    // text
    let text = document.createElement("div");
    text.classList.add("block-Sidecar_OptionsButtonText");
    text.innerText = "...";

    // button
    let button = document.createElement("button");
    button.classList.add("block-Sidecar_OptionsButton");
    button.appendChild(text);
    button.addEventListener("click", (event) => {
      let dropdown = new GradingToolDropdown(button, [
        {
          title: "Delete block",
          click: () => {
            actions.deleteBlockFromDoc(this._state, this._block);
          },
        },
      ]);
      dropdown.open();
    });
    return button;
  }
}

// register
window.customElements.define("grading-block-text", GradingBlockText);
