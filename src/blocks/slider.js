import GradingToolMarkdownArea from "../tool/markdown-area.js";
import GradingToolRange from "../tool/range.js";

export default class GradingBlockSlider extends HTMLElement {
  constructor(state, block) {
    super();
    this._state = state;
    this._block = block;
  }

  connectedCallback() {
    this.classList.add("block-Block", "block-Block_Slider");

    // text
    let text = new GradingToolMarkdownArea(this._block.text);
    text.addEventListener("content-changed", (event) => {
      this._block.text = event.detail;
      this._state.dispatchEvent("block-text-changed");
    });
    this.appendChild(text);

    // points
    const points = new GradingToolRange(
      0,
      this._block.pointsMax,
      this._block.points,
      "points"
    );
    points.addEventListener("value-changed", (event) => {
      this._block.points = event.detail;
      this._state.dispatchEvent("block-result-changed");
    });
    this.appendChild(points);
  }
}

// register
window.customElements.define("grading-block-slider", GradingBlockSlider);
