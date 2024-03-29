import GradingToolMarkdownArea from "../tool/markdown-area.js";
import GradingToolScaleGraph from "../tool/scale-graph.js";
import GradingToolScaleTable from "../tool/scale-table.js";
import GradingToolDropdown from "../tool/dropdown.js";
import * as actions from "../actions.js";

export default class GradingBlockGrade extends HTMLElement {
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

    // summary
    const summary = document.createElement("div");
    summary.classList.add("block-Grade_Summary");
    this.appendChild(summary);

    // graph
    const graph = new GradingToolScaleGraph(this._state);
    graph.classList.add("block-Grade_Graph");
    this.appendChild(graph);

    // summary -> points
    const summaryPoints = this._createSummaryItem(
      "Points",
      () =>
        `${this._state.data.result.points}/${this._state.data.scale.pointsMax}`
    );
    summary.appendChild(summaryPoints);

    // summary -> percent
    const summaryPercent = this._createSummaryItem(
      "Percent",
      () => `${this._state.data.result.percent}%`
    );
    summary.appendChild(summaryPercent);

    // summary -> grade
    const summaryGrade = this._createSummaryItem(
      "Grade",
      () => `${this._state.data.result.grade}`
    );
    summary.appendChild(summaryGrade);

    // table
    const table = new GradingToolScaleTable(this._state);
    table.classList.add("block-Grade_Table");
    this.appendChild(table);
  }

  _createSummaryItem(titleText, valueFunc) {
    // item
    let item = document.createElement("div");
    item.classList.add("block-Grade_SummaryItem");

    // title
    const title = document.createElement("div");
    title.classList.add("block-Grade_SummaryItemTitle");
    title.textContent = titleText;
    item.appendChild(title);

    // value
    const value = document.createElement("div");
    value.classList.add("block-Grade_SummaryItemValue");
    this._state.addEventListener(
      "result-changed",
      () => {
        value.textContent = valueFunc();
      },
      { init: true }
    );
    this._state.addEventListener(
      "scale-changed",
      () => {
        value.textContent = valueFunc();
      },
      { init: true }
    );
    item.appendChild(value);

    return item;
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
window.customElements.define("grading-block-grade", GradingBlockGrade);
