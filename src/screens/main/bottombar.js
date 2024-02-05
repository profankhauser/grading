import Color from "../../tool/color.js";

export default class GradingScreenMainBottombar extends HTMLElement {
  constructor(state) {
    super();
    this._state = state;
  }

  connectedCallback() {
    this.classList.add("bottombar-Bottombar", "bottombar-Bottombar_Evaluator");

    // shortcut into state criteria
    //const template = this._state.state.template;
    //const evaluation = this._state.state.evaluation;

    // color bar
    const bar = document.createElement("div");
    bar.classList.add("bottombar-Bar");
    this.appendChild(bar);
    this._state.addEventListener(
      "result-changed",
      () => {
        const i = this._state.data.scale.grades.indexOf(
          this._state.data.result.grade
        );
        bar.style.borderTop = `6px ${Color["palette" + (16 - i)]} solid`;
      },
      { init: true }
    );

    // row
    const row = document.createElement("div");
    row.classList.add("bottombar-Row");
    this.appendChild(row);

    // page
    const page = document.createElement("div");
    page.classList.add("bottombar-Page");
    row.appendChild(page);

    // points
    const points = this._createSummaryItem(
      "Points",
      () =>
        `${this._state.data.result.points}/${this._state.data.scale.pointsMax}`
    );
    page.appendChild(points);

    // percent
    const percent = this._createSummaryItem(
      "Percent",
      () => `${this._state.data.result.percent}%`
    );
    page.appendChild(percent);

    // grade
    const grade = this._createSummaryItem(
      "Grade",
      () => `${this._state.data.result.grade}`
    );
    page.appendChild(grade);
  }

  _createSummaryItem(titleText, valueFunc) {
    // item
    let item = document.createElement("div");
    item.classList.add("bottombar_SummaryItem");

    // title
    const title = document.createElement("div");
    title.classList.add("bottombar_SummaryItemTitle");
    title.textContent = titleText;
    item.appendChild(title);

    // value
    const value = document.createElement("div");
    value.classList.add("bottombar_SummaryItemValue");
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
}

// register
window.customElements.define(
  "grading-screen-main-bottombar",
  GradingScreenMainBottombar
);
