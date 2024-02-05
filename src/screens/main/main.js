import GradingScreenMainTopbar from "./topbar.js";
import GradingScreenMainBottombar from "./bottombar.js";
import GradingBlockText from "../../blocks/text.js";
import GradingBlockSlider from "../../blocks/slider.js";
import GradingBlockGrade from "../../blocks/grade.js";

const BLOCKS = {
  text: GradingBlockText,
  slider: GradingBlockSlider,
  grade: GradingBlockGrade,
};

export default class GradingScreenMain extends HTMLElement {
  constructor(state) {
    super();
    this._state = state;
  }

  connectedCallback() {
    this.classList.add("app-Screen");

    // topbar
    let topbar = new GradingScreenMainTopbar(this._state);
    this.appendChild(topbar);

    // iterate blocks
    const blocks = this._state.data.doc.blocks;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const element = new BLOCKS[block.type](this._state, block);
      this.appendChild(element);
    }

    // bottombar
    let bottombar = new GradingScreenMainBottombar(this._state);
    this.appendChild(bottombar);
  }
}

// register
window.customElements.define("grading-screen-main", GradingScreenMain);
