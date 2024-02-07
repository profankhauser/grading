import GradingToolMarkdownArea from "../tool/markdown-area.js";
import GradingToolRange from "../tool/range.js";
import GradingToolDropdown from "../tool/dropdown.js";
import * as actions from "../actions.js";

export default class GradingBlockSlider extends HTMLElement {
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

    // points
    const points = new GradingToolRange(
      0,
      this._block.pointsMax,
      this._block.points,
      "points"
    );
    points.classList.add("block-Block_SliderRange");
    points.addEventListener("value-changed", (event) => {
      this._block.points = event.detail;
      this._state.dispatchEvent("block-result-changed");
    });
    this.appendChild(points);
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
        {
          title: "Increment max points",
          click: () => {
            actions.setPointsMaxInBlock(
              this._state,
              this._block,
              this._block.pointsMax + 1
            );
          },
        },
        {
          title: "Decrement max points",
          click: () => {
            actions.setPointsMaxInBlock(
              this._state,
              this._block,
              this._block.pointsMax - 1
            );
          },
        },
        {
          title: "Set max points to 5",
          click: () => {
            actions.setPointsMaxInBlock(this._state, this._block, 5);
          },
        },
        {
          title: "Set max points to 10",
          click: () => {
            actions.setPointsMaxInBlock(this._state, this._block, 10);
          },
        },
        {
          title: "Set max points to 15",
          click: () => {
            actions.setPointsMaxInBlock(this._state, this._block, 15);
          },
        },
        {
          title: "Set max points to 20",
          click: () => {
            actions.setPointsMaxInBlock(this._state, this._block, 20);
          },
        },
      ]);
      dropdown.open();
    });
    return button;
  }
}

// register
window.customElements.define("grading-block-slider", GradingBlockSlider);
