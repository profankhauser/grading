export default class GradingToolMarkdownArea extends HTMLElement {
  constructor(content) {
    super();
    this._content = content;
    this._converter = new showdown.Converter({
      noHeaderId: true,
      tables: true,
      tasklists: true,
      simpleLineBreaks: true,
      simplifiedAutoLink: true,
    });
  }

  connectedCallback() {
    this.classList.add("tool-MarkdownArea");

    // viewer
    let viewer = document.createElement("div");
    viewer.classList.add("tool-MarkdownArea_Viewer");
    viewer.innerHTML = this._converter.makeHtml(this._content);
    this.appendChild(viewer);

    // editor
    let editor = document.createElement("div");
    editor.classList.add("tool-MarkdownArea_Editor");
    editor.contentEditable = true;

    // interaction
    viewer.addEventListener("click", () => {
      editor.innerText = this._content;
      viewer.replaceWith(editor);
      editor.focus();
    });

    editor.addEventListener("focusout", () => {
      // update viewer
      let newText = editor.innerText;
      viewer.innerHTML = this._converter.makeHtml(newText);
      editor.replaceWith(viewer);

      // update if changed
      if (newText !== this._content) {
        this._content = newText;

        // emit change event with new markdown
        this.dispatchEvent(
          new CustomEvent("content-changed", { detail: this._content })
        );
      }
    });
  }
}

// register
window.customElements.define(
  "grading-tool-markdown-area",
  GradingToolMarkdownArea
);
