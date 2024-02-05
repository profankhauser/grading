export default class GradingToolRange extends HTMLElement {
  constructor(min, max, value, unit, options = {}) {
    super();
    this._min = min;
    this._max = max;
    this._value = value;
    this._unit = unit;
    this._options = options;

    this._calculatePercent();
  }

  connectedCallback() {
    this.classList.add("tool-Range");

    // input
    let input = document.createElement("input");
    input.classList.add("tool-Range_Input");
    input.setAttribute("type", "range");
    input.setAttribute("min", this._min);
    input.setAttribute("max", this._max);
    input.setAttribute("step", 1);
    input.value = this._value;
    this.appendChild(input);

    // legend
    let legend = document.createElement("div");
    legend.classList.add("tool-Range_Legend");
    this.appendChild(legend);

    let left = document.createElement("div");
    left.classList.add("tool-Range_LegendLeft");
    legend.appendChild(left);

    let min = document.createElement("div");
    min.classList.add("tool-Range_LegendMin");
    min.textContent = `${this._min} ${this._unit}`;
    left.appendChild(min);

    let middle = document.createElement("div");
    middle.classList.add("tool-Range_LegendMiddle");
    legend.appendChild(middle);

    let current = document.createElement("div");
    current.classList.add("tool-Range_LegendCurrent");
    if (this._options.hidePercent) {
      current.textContent = `${this._value} ${this._unit}`;
    } else {
      current.textContent = `${this._value} ${this._unit} (${this._percent}%)`;
    }
    middle.appendChild(current);

    let right = document.createElement("div");
    right.classList.add("tool-Range_LegendRight");
    legend.appendChild(right);

    let max = document.createElement("div");
    max.classList.add("tool-Range_LegendMax");
    max.textContent = `${this._max} ${this._unit}`;
    right.appendChild(max);

    // while moving slider events
    input.addEventListener("input", (event) => {
      this._value = parseInt(input.value);
      this._calculatePercent();

      // update current value
      if (this._options.hidePercent) {
        current.textContent = `${this._value} ${this._unit}`;
      } else {
        current.textContent = `${this._value} ${this._unit} (${this._percent}%)`;
      }

      // emit change event with new value
      this.dispatchEvent(
        new CustomEvent("value-changed", { detail: this._value })
      );
    });
  }

  _calculatePercent() {
    this._percent = parseInt(
      (parseFloat(this._value) / parseFloat(this._max)) * 100
    );
  }
}

// register
window.customElements.define("grading-tool-range", GradingToolRange);
