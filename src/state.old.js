export default class State {
  constructor() {
    this.listeners = {};

    // fetch state
    this.parseStateFromHash();
    this.updateStateHash();
    this.updateStateFingerprint();

    // listen to back/forward button in browser
    window.addEventListener("popstate", () => {
      this.parseStateFromHash();
      this.dispatchEvent("view-changed");
    });

    // listen for scale change
    this.addEventListener("template-points-changed", () => {
      this.calculateScale();
      this.dispatchEvent("template-scale-changed");
    });

    // listen for point changes
    this.addEventListener("evaluation-points-changed", () => {
      this.calculateGrade();
      this.dispatchEvent("evaluation-scale-changed");
    });
  }

  emptyTemplateCriterion() {
    return {
      title: "New Criterion",
      description: "Please describe the criterion here",
      feedback: "Add feedback ...",
      points: 10,
    };
  }

  // reset template
  resetTemplateState() {
    this.state.template = {
      header: "# New Evaluation",
      criteria: [
        this.emptyTemplateCriterion(),
        this.emptyTemplateCriterion(),
        this.emptyTemplateCriterion(),
      ],
      summary: "## Summary\n\nAdd summary ...",
      grade: "## Grade\n\nThis results in the following grade:",
      greeting: "With best regards",
      link: "## Link\n\nYou can view this evaluation at:",
      fingerprint: "## Fingerprint\n\nThe SHA-256 hash for this document is:",
      scale: {
        percentForGrade1: 95,
        percentForGrade4: 50,
        pointsUnit: "points",
        grades: [
          1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 4.3, 4.7, 5.0, 5.3,
          5.7, 6.0,
        ],
      },
    };
  }

  // reset evaluation
  resetEvaluationState() {
    this.state.evaluation = {
      criteria: Array.from(
        { length: this.state.template.criteria.length },
        () => ({})
      ),
      scale: {},
    };
  }

  // reset full state
  resetState() {
    this.state = { view: "home" };
    this.resetTemplateState();
    this.resetEvaluationState();
  }

  // start with a fresh page
  reset() {
    this.resetState();
    this.calculateScale();
    this.updateStateHash();
    this.dispatchEvent("view-changed");
  }

  // listen to changes
  addEventListener(name, callback, options = {}) {
    // allow array input
    if (Array.isArray(name)) {
      for (let i = 0; i < name.length; i++) {
        this.addEventListener(name[i], callback, options);
      }
      return;
    }

    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push(callback);

    // with init: true - we call the callback once when added
    if (options.init) {
      callback();
    }
  }

  // notify that something changed
  dispatchEvent(name) {
    // update hash
    this.updateStateHash();
    this.updateStateFingerprint();

    // check if listeners exist
    if (!this.listeners[name]) {
      return false;
    }

    // call listeners
    for (const callback of this.listeners[name]) {
      callback();
    }
  }

  // create base64 string
  encodeState() {
    const raw = JSON.stringify(this.state);

    // compress -> base64 -> URL save
    return LZString.compressToEncodedURIComponent(raw);
  }

  // parse base64 string into state
  decodeState(data) {
    // URL save -> base64 -> decompress
    const raw = LZString.decompressFromEncodedURIComponent(data);
    this.state = JSON.parse(raw);
  }

  // create sha-256 hash of state
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  async fingerprintText(text) {
    // encode as (utf-8) Uint8Array
    const msgUint8 = new TextEncoder().encode(text);

    // hash the message
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);

    // convert buffer to byte array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  }

  // parse state from hash
  parseStateFromHash() {
    let data = window.location.hash;
    if (data == "") {
      this.reset();
      return;
    }
    // remove leading #
    data = data.substring(1);
    try {
      this.decodeState(data);
    } catch (error) {
      console.error("unable to parse state from hash - creating new state");
      this.reset();
    }
  }

  // update fingerprint
  async updateStateFingerprint() {
    let hash = window.location.hash.substring(1);

    // update fingerprint
    let newFingerprint = await this.fingerprintText(hash);
    if (newFingerprint != this.fingerprint) {
      this.fingerprint = newFingerprint;
      this.dispatchEvent("fingerprint-changed");
    }
  }

  // add new state hash and change visible url
  async updateStateHash() {
    let newHash = this.encodeState();
    let currentHash = window.location.hash.substring(1);
    if (newHash !== currentHash) {
      history.pushState(null, null, document.location.pathname + "#" + newHash);
      this.dispatchEvent("link-changed");
    }
  }

  // calculate current grading scale
  calculateScale() {
    // shortcut
    const scale = this.state.template.scale;

    // max points
    scale.maxPoints = 0;
    for (let i = 0; i < this.state.template.criteria.length; i++) {
      const criterion = this.state.template.criteria[i];
      scale.maxPoints += criterion.points;
    }

    // simple percent validation
    if (scale.percentForGrade4 > scale.percentForGrade1) {
      scale.percentForGrade1 = scale.percentForGrade4 + 1;
    }

    // x: grades
    // y: points
    const x1 = 1.0;
    const y1 = scale.percentForGrade1;
    const x2 = 4.0;
    const y2 = scale.percentForGrade4;

    // calculate slope (each point less degrades the grade)
    scale.slope = (y1 - y2) / (x1 - x2);

    // calculate offset
    scale.offset = y2 - x2 * scale.slope;

    // populate grade table
    scale.gradeTable = [];
    for (let i = 0; i <= 100; i++) {
      const grade = this.roundedGrade(i);
      scale.gradeTable[i] = grade;
    }

    // populate points table
    scale.pointsTable = [];
    for (let i = 0; i <= scale.maxPoints; i++) {
      const percent = this.roundedPercent(i);
      const grade = this.roundedGrade(percent);
      scale.pointsTable[i] = grade;
    }

    // create buckets
    scale.buckets = [];
    for (let i = 0; i < scale.grades.length; i++) {
      const grade = scale.grades[i];
      scale.buckets[i] = {
        grade: grade,
        minPercent: 0,
        maxPercent: 0,
        minPoints: "-",
        maxPoints: "-",
        width: 0,
      };
    }

    // populate buckets with percent
    let lastGrade = 0;
    for (let i = 100; i >= 0; i--) {
      const grade = scale.gradeTable[i];
      const bucket = scale.buckets[scale.grades.indexOf(grade)];

      // percent
      bucket.minPercent = i;
      if (lastGrade != grade) {
        bucket.maxPercent = i;
      }

      // width
      bucket.width = bucket.maxPercent - bucket.minPercent + 1;
      // make width sum 100
      if (i == 0) {
        bucket.width -= 1;
      }

      lastGrade = grade;
    }

    // populate buckets with points
    lastGrade = 0;
    for (let i = 0; i <= scale.maxPoints; i++) {
      const grade = scale.pointsTable[i];
      const bucket = scale.buckets[scale.grades.indexOf(grade)];

      bucket.maxPoints = i;
      if (lastGrade != grade) {
        bucket.minPoints = i;
      }

      lastGrade = grade;
    }
  }

  // func to calculate exact grade by percent
  exactGrade(percent) {
    // shortcut
    const scale = this.state.template.scale;
    const exact = (percent - scale.offset) / scale.slope;

    // round
    return Math.round((exact + Number.EPSILON) * 100) / 100.0;
  }

  // func to calculate rounded grade by percent
  roundedGrade(percent) {
    // shortcut
    const scale = this.state.template.scale;

    // calculate exact grade
    const exact = this.exactGrade(percent);

    // walk through allowed, rounded grades and return grade
    for (let i = 0; i < scale.grades.length; i++) {
      const candidate = scale.grades[i];
      if (exact <= candidate) {
        return candidate;
      }
    }
    // worst possible grade
    return scale.grades[scale.grades.length - 1];
  }

  // calculate percent from points
  roundedPercent(points) {
    const maxPoints = this.state.template.scale.maxPoints;
    return Math.round((points / maxPoints) * 100);
  }

  calculateGrade() {
    //shortcut
    const evaluation = this.state.evaluation;

    // total points
    evaluation.scale.points = 0;
    for (let i = 0; i < this.state.evaluation.criteria.length; i++) {
      const criterion = this.state.evaluation.criteria[i];
      if (criterion.points) {
        evaluation.scale.points += criterion.points;
      }
    }

    // percent
    const maxPoints = this.state.template.scale.maxPoints;
    evaluation.scale.percent = Math.round(
      (evaluation.scale.points / maxPoints) * 100
    );

    // grade
    evaluation.scale.grade = this.roundedGrade(evaluation.scale.percent);
  }

  // open home view
  openHome() {
    this.state.view = "home";
    this.updateStateHash();
    this.dispatchEvent("view-changed");
  }

  // keep template, reset evaluation
  newEvaluation() {
    this.resetEvaluationState();
    this.calculateScale();
    this.calculateGrade();
    this.state.view = "evaluator";
    this.updateStateHash();
    this.dispatchEvent("view-changed");
  }

  // reset evaluation and open templater view
  editTemplate() {
    this.resetEvaluationState();
    this.state.view = "templater";
    this.updateStateHash();
    this.dispatchEvent("view-changed");
  }

  // reset template & evaluation and open templater view
  newTemplate() {
    this.resetEvaluationState();
    this.resetTemplateState();
    this.calculateScale();
    this.state.view = "templater";
    this.updateStateHash();
    this.dispatchEvent("view-changed");
  }

  // adds a new template criterion
  addTemplateCriterionAfter(index) {
    const criterion = this.emptyTemplateCriterion();
    this.state.template.criteria.splice(index + 1, 0, criterion);
  }

  // adds a new template criterion
  removeTemplateCriterion(index) {
    // keep at least 1 criteria
    if (this.state.template.criteria.length <= 1) {
      return;
    }
    this.state.template.criteria.splice(index, 1);
  }
}
