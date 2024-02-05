import Color from "./color.js";

export default class GradingToolScaleGraph extends HTMLElement {
  constructor(min, max, value, unit) {
    super(state);
    this._state = state;
  }

  connectedCallback() {
    this.classList.add("tool-ScaleGraph");

    // max bucket height
    const minHeight = 6;
    const maxHeight = 40;

    // shortcut
    const scale = this._state.data.scale;
    const result = this._state.data.result;

    // grades
    const grades = document.createElement("div");
    grades.classList.add("tool-ScaleGraph_Grades");
    this.appendChild(grades);

    // buckets
    const buckets = document.createElement("div");
    buckets.classList.add("tool-ScaleGraph_Buckets");
    this.appendChild(buckets);

    // stops
    const stops = document.createElement("div");
    stops.classList.add("tool-ScaleGraph_Stops");
    this.appendChild(stops);

    // buckets
    for (let i = scale.buckets.length - 1; i >= 0; i--) {
      const data = scale.buckets[i];

      // grade
      const grade = document.createElement("div");
      grade.classList.add("tool-ScaleGraph_Grade");
      this._state.addEventListener(
        "scale-changed",
        () => {
          const data = this._state.data.scale.buckets[i];
          if (!data) {
            return;
          }
          grade.style.width = `${data.width}%`;
          grade.textContent = data.grade;
        },
        { init: true }
      );
      grades.appendChild(grade);

      // bucket
      const bucket = document.createElement("div");
      bucket.classList.add("tool-ScaleGraph_Bucket");
      this._state.addEventListener(
        "scale-changed",
        () => {
          const data = this._state.data.scale.buckets[i];
          if (!data) {
            return;
          }
          const height = minHeight + (data.percentMin / 100.0) * maxHeight;
          bucket.style.width = `${data.width}%`;
          bucket.style.borderBottom = `${height}px ${
            Color["palette" + (16 - i)]
          } solid`;
        },
        { init: true }
      );

      // add current grade, if possible
      this._state.addEventListener(
        "result-changed",
        () => {
          const result = this._state.data.result;
          if (result.grade) {
            if (result.grade == data.grade) {
              grade.classList.add("tool-ScaleGraph_Grade-highlight");
              grade.style.backgroundColor = Color["palette" + (16 - i)] + "40";
              bucket.style.backgroundColor = Color["palette" + (16 - i)] + "40";
            } else {
              grade.classList.remove("tool-ScaleGraph_Grade-highlight");
              grade.style.backgroundColor = "transparent";
              bucket.style.backgroundColor = "transparent";
            }
          }
        },
        { init: true }
      );
      buckets.appendChild(bucket);

      // stop
      const stop = document.createElement("div");
      stop.classList.add("tool-ScaleGraph_Stop");
      this._state.addEventListener(
        "scale-changed",
        () => {
          const data = this._state.data.scale.buckets[i];
          if (!data) {
            return;
          }
          stop.style.width = `${data.width}%`;
          stop.textContent = `${data.percentMin}%`;
        },
        { init: true }
      );
      stops.appendChild(stop);
    }

    // on template change
    this._state.addEventListener("scale-change", () => {
      const scale = this._state.data.scale;
      for (let i = scale.buckets.length - 1; i >= 0; i--) {
        const index = scale.buckets.length - i - 1;
        const data = scale.buckets[i];

        // update stops
        const stop = stops.children[index];
        stop.style.width = `${data.width}%`;
        stop.textContent = `${data.percentMin}%`;

        // update buckets
        const bucket = buckets.children[index];
        bucket.style.width = `${data.width}%`;
        bucket.textContent = data.grade;
      }
    });
  }
}

// register
window.customElements.define("grading-tool-scale-graph", GradingToolScaleGraph);
