import Color from "./color.js";

export default class GradingToolScaleTable extends HTMLElement {
  constructor(min, max, value, unit) {
    super(state);
    this._state = state;
  }

  connectedCallback() {
    this.classList.add("tool-ScaleTable");

    // shortcut
    const scale = this._state.data.scale;
    const result = this._state.data.result;

    // table
    const table = document.createElement("table");
    table.classList.add("tool-ScaleTable_Table");
    this.appendChild(table);

    // new row
    const row = document.createElement("tr");
    table.appendChild(row);

    // points
    const points = document.createElement("th");
    points.classList.add("tool-ScaleTable_Header");
    points.textContent = "Points";
    row.appendChild(points);

    // percent
    const percent = document.createElement("th");
    percent.classList.add("tool-ScaleTable_Header");
    percent.textContent = "Percent";
    row.appendChild(percent);

    // grade
    const grade = document.createElement("th");
    grade.classList.add("tool-ScaleTable_Header");
    grade.textContent = "Grade";
    row.appendChild(grade);

    // buckets
    for (let i = 0; i < scale.buckets.length; i++) {
      const data = scale.buckets[i];

      // new row
      const row = document.createElement("tr");
      row.classList.add("tool-ScaleTable_Row");

      // add current grade, if possible
      this._state.addEventListener(
        "result-changed",
        () => {
          const result = this._state.data.result;
          if (result.grade) {
            if (result.grade == data.grade) {
              row.classList.add("tool-ScaleTable_Row-highlight");
              row.style.backgroundColor = Color["palette" + (16 - i)] + "40";
            } else {
              row.classList.remove("tool-ScaleTable_Row-highlight");
              row.style.backgroundColor = "transparent";
            }
          }
        },
        { init: true }
      );

      table.appendChild(row);

      // points
      const points = document.createElement("td");
      points.classList.add("tool-ScaleTable_Points");
      row.appendChild(points);

      // percent
      const percent = document.createElement("td");
      percent.classList.add("tool-ScaleTable_Percent");
      row.appendChild(percent);

      // grade
      const grade = document.createElement("td");
      grade.classList.add("tool-ScaleTable_Grade");
      grade.style.borderLeft = `6px ${Color["palette" + (16 - i)]} solid`;
      row.appendChild(grade);

      // listen for changes
      this._state.addEventListener(
        "scale-changed",
        () => {
          const scale = this._state.data.scale;
          const data = scale.buckets[i];
          points.textContent = `${data.pointsMin} → ${data.pointsMax}`;
          percent.textContent = `${data.percentMin}% → ${data.percentMax}%`;
          grade.textContent = data.grade;
        },
        { init: true }
      );
    }
  }
}

// register
window.customElements.define("grading-tool-scale-table", GradingToolScaleTable);
