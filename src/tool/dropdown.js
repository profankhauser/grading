export default class GradingToolDropdown extends HTMLElement {
  constructor(trigger, actions, options = {}) {
    super();
    this._trigger = trigger;
    this._actions = actions;
    this._options = options;
  }

  open() {
    this._trigger.after(this);
    this._triggerOpacity = this._trigger.style.opacity;
    this._trigger.style.opacity = 1;
  }

  close() {
    this._trigger.style.opacity = this._triggerOpacity;
    this.remove();
  }

  connectedCallback() {
    this.classList.add("tool-Dropdown");

    // background
    let bg = document.createElement("div");
    bg.classList.add("tool-Dropdown_Background");
    bg.addEventListener("click", (event) => {
      this.close();
    });
    this.appendChild(bg);

    // frame
    let frame = document.createElement("div");
    frame.classList.add("tool-Dropdown_Frame");
    frame.addEventListener("click", (event) => {
      this.close();
    });
    this.appendChild(frame);

    // panel
    let panel = document.createElement("div");
    panel.classList.add("tool-Dropdown_Panel");
    frame.appendChild(panel);

    // actions
    for (let i = 0; i < this._actions.length; i++) {
      const action = this._actions[i];

      let button = document.createElement("button");
      button.classList.add("tool-Dropdown_Button");
      let text = document.createElement("div");
      text.classList.add("tool-Dropdown_ButtonText");
      text.innerText = action.title;
      button.addEventListener("click", () => {
        action.click();
        this.close();
      });
      button.appendChild(text);
      panel.appendChild(button);
    }
  }
}

// register
window.customElements.define("grading-tool-dropdown", GradingToolDropdown);
