import GradingToolMarkdownArea from "../tool/markdown-area.js";

export default class GradingBlockText extends HTMLElement {
  constructor(state, block) {
    super();
    this._state = state;
    this._block = block;
  }

  connectedCallback() {
    this.classList.add("block-Block", "block-Block_Text");

    // text
    let text = new GradingToolMarkdownArea(this._block.text);
    text.addEventListener("content-changed", (event) => {
      this._block.text = event.detail;
      this._state.dispatchEvent("block-text-changed");
    });
    this.appendChild(text);
  }
}

// register
window.customElements.define("grading-block-text", GradingBlockText);
