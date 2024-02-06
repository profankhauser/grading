import GradingScreenMainTopbar from "./topbar.js";
import GradingScreenMainBottombar from "./bottombar.js";
import GradingBlockText from "../../blocks/text.js";
import GradingBlockSlider from "../../blocks/slider.js";
import GradingBlockGrade from "../../blocks/grade.js";
import GradingToolDropdown from "../../tool/dropdown.js";
import * as actions from "../../actions.js";

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

      const button = this._newPlusButton(i);
      this.appendChild(button);

      const element = new BLOCKS[block.type](this._state, block);
      this.appendChild(element);
    }

    const button = this._newPlusButton(blocks.length);
    this.appendChild(button);

    // bottombar
    let bottombar = new GradingScreenMainBottombar(this._state);
    this.appendChild(bottombar);
  }

  _newPlusButton(index) {
    // text
    let text = document.createElement("div");
    text.classList.add("app-Screen_PlusButtonText");
    text.innerText = "+";

    // button
    let button = document.createElement("button");
    button.classList.add("app-Screen_PlusButton");
    button.appendChild(text);
    button.addEventListener("click", (event) => {
      let dropdown = new GradingToolDropdown(button, [
        {
          title: "Add text block",
          click: () => {
            actions.addBlockToDoc(this._state, index, "text");
          },
        },
        {
          title: "Add slider block",
          click: () => {
            actions.addBlockToDoc(this._state, index, "slider");
          },
        },
        {
          title: "Add grade block",
          click: () => {
            actions.addBlockToDoc(this._state, index, "grade");
          },
        },
      ]);
      dropdown.open();
    });
    return button;
  }
}

// register
window.customElements.define("grading-screen-main", GradingScreenMain);
