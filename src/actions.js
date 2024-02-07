import defaultDoc from "../docs/default.json.js";

export const boot = (state) => {
  // recalculate on point changes
  state.addEventListener("block-result-changed", () => {
    recalculateResult(state);
  });

  // update url when result changed
  state.addEventListener("result-changed", () => {
    updateDocInURL(state);
  });

  // update url when scale changed
  state.addEventListener("scale-changed", () => {
    updateDocInURL(state);
  });

  // load doc from URL or default
  let doc = fetchDocFromURL();
  if (!doc) {
    // clone default doc
    doc = JSON.parse(JSON.stringify(defaultDoc));
  }
  // load
  loadDoc(state, doc);
};

const loadDoc = (state, doc) => {
  // set as doc
  state.data.doc = doc;

  // calculate
  recalculateScale(state);
  recalculateResult(state);

  // setup main screen and show
  state.data.screen = "main";
  state.dispatchEvent("screen-changed");
};

export const reset = (state) => {
  // clone
  const doc = JSON.parse(JSON.stringify(defaultDoc));
  loadDoc(state, doc);
};

// parse state from url
const fetchDocFromURL = () => {
  let encodedData = window.location.hash;

  // no data provided
  if (encodedData == "") {
    return false;
  }

  try {
    // remove leading # and parse from base64
    return decodeAndParseJSON(encodedData.substring(1));
  } catch (error) {
    return false;
  }
};

const decodeAndParseJSON = (base64) => {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
};

const stringifyJSONAndEncode = (data) => {
  const text = JSON.stringify(data);
  const bytes = new TextEncoder().encode(text);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
};

const updateDocInURL = (state) => {
  let newHash = stringifyJSONAndEncode(state.data.doc);
  let currentHash = window.location.hash.substring(1);
  if (newHash !== currentHash) {
    history.pushState(null, null, document.location.pathname + "#" + newHash);
  }
};

// calculate the full grading scale with buckets, etc.
const recalculateScale = (state) => {
  const scale = {
    pointsMax: 0,
    grades: [
      1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 4.3, 4.7, 5.0, 5.3, 5.7,
      6.0,
    ],
  };

  // collect points
  const blocks = state.data.doc.blocks;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.pointsMax) {
      scale.pointsMax += block.pointsMax;
    }
  }

  // x: grades
  // y: points
  const x1 = 1.0;
  const y1 = parseFloat(state.data.doc.config.percentForGrade1);
  const x2 = 4.0;
  const y2 = parseFloat(state.data.doc.config.percentForGrade4);

  // calculate slope (each point less degrades the grade)
  scale.slope = (y1 - y2) / (x1 - x2);

  // calculate offset
  scale.offset = y2 - x2 * scale.slope;

  // store grade by percent
  // index = percent, result is rounded grade
  scale.indexGradeByPercent = [];
  for (let i = 0; i <= 100; i++) {
    scale.indexGradeByPercent[i] = roundedGrade(scale, i);
  }

  // store grade by points
  // index = points, result is rounded grade
  scale.indexGradeByPoints = [];
  for (let i = 0; i <= scale.pointsMax; i++) {
    const percent = roundedPercent(scale, i);
    const grade = scale.indexGradeByPercent[percent];
    scale.indexGradeByPoints[i] = grade;
  }

  // create buckets
  scale.buckets = [];
  for (let i = 0; i < scale.grades.length; i++) {
    const grade = scale.grades[i];
    scale.buckets[i] = {
      grade: grade,
      percentMin: 0,
      percentMax: 0,
      pointsMin: "-",
      pointsMax: "-",
      width: 0,
    };
  }

  // populate buckets with percent
  let lastGrade = 0;
  for (let i = 100; i >= 0; i--) {
    const grade = scale.indexGradeByPercent[i];
    const bucket = scale.buckets[scale.grades.indexOf(grade)];

    // percent
    bucket.percentMin = i;
    if (lastGrade != grade) {
      bucket.percentMax = i;
    }

    // width
    bucket.width = bucket.percentMax - bucket.percentMin + 1;
    // make width sum 100
    if (i == 0) {
      bucket.width -= 1;
    }

    lastGrade = grade;
  }

  // populate buckets with points
  lastGrade = 0;
  for (let i = 0; i <= scale.pointsMax; i++) {
    const grade = scale.indexGradeByPoints[i];
    const bucket = scale.buckets[scale.grades.indexOf(grade)];

    bucket.pointsMax = i;
    if (lastGrade != grade) {
      bucket.pointsMin = i;
    }

    lastGrade = grade;
  }

  // publish
  state.data.scale = scale;
  state.dispatchEvent("scale-changed");
};

// calculate the current results based on a scale
const recalculateResult = (state) => {
  const result = {
    points: 0,
    percent: 0,
    grade: 0,
  };

  // collect points
  const blocks = state.data.doc.blocks;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.points) {
      result.points += block.points;
    }
  }

  // calculate percent
  result.percent = roundedPercent(state.data.scale, result.points);

  // lookup grade
  result.grade = state.data.scale.indexGradeByPoints[result.points];

  // publish result
  state.data.result = result;
  state.dispatchEvent("result-changed");
};

// func to calculate exact grade by percent
const exactGrade = (scale, percent) => {
  // shortcut
  const exact = (percent - scale.offset) / scale.slope;

  // round
  return Math.round((exact + Number.EPSILON) * 100) / 100.0;
};

// func to calculate rounded grade by percent
const roundedGrade = (scale, percent) => {
  // calculate exact grade
  const exact = exactGrade(scale, percent);

  // walk through allowed, rounded grades and return grade
  for (let i = 0; i < scale.grades.length; i++) {
    const candidate = scale.grades[i];
    if (exact <= candidate) {
      return candidate;
    }
  }
  // worst possible grade
  return scale.grades[scale.grades.length - 1];
};

const roundedPercent = (scale, points) => {
  return Math.round((points / scale.pointsMax) * 100);
};

// opens a file from a local device and loads it as a doc
export const openFile = (state) => {
  // create file input
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "application/json");

  // handle file read
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const doc = JSON.parse(reader.result);
    loadDoc(state, doc);
    input.remove();
  });

  // handle file selected
  input.addEventListener("change", () => {
    if (input.files.length !== 1) {
      return;
    }
    const file = input.files[0];
    reader.readAsText(file, "utf-8");
  });

  // open dialog
  input.click();
};

// saves the current doc to a file by download
export const saveFile = (state) => {
  // stringify doc and create an object url for it
  const data = JSON.stringify(state.data.doc, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // create tmp link to dowload the object from the url
  const link = document.createElement("a");
  link.href = url;
  link.download = "grading.json";
  link.target = "_blank";
  link.click();

  // cleanup
  URL.revokeObjectURL(url);
  link.remove();
};

// copies the current url to the clipboard
export const copyURLToClipboard = (state) => {
  navigator.clipboard.writeText(window.location.href);
};

// creates a new block
const BLOCK_TEMPLATES = {
  text: {
    type: "text",
    text: "## New Text Block\n\n\nPlease add some text here ...",
  },
  slider: {
    type: "slider",
    text: "## New Slider Block\n\n\nPlease add some text here ...",
    points: 0,
    pointsMax: 10,
  },
  grade: {
    type: "grade",
    text: "## New Grade Block\n\n\nPlease add some text here ...",
  },
};

export const addBlockToDoc = (state, index, type) => {
  // clone new block from template type
  const newBlock = JSON.parse(JSON.stringify(BLOCK_TEMPLATES[type]));

  // insert into doc at index
  state.data.doc.blocks.splice(index, 0, newBlock);

  // reload doc
  loadDoc(state, state.data.doc);
};

export const deleteBlockFromDoc = (state, block) => {
  // find index of block
  const index = state.data.doc.blocks.indexOf(block);

  // delete block from doc at index
  state.data.doc.blocks.splice(index, 1);

  // reload doc
  loadDoc(state, state.data.doc);
};

export const setPointsMaxInBlock = (state, block, newPointsMax) => {
  // ensure at least 1 point is set
  if (newPointsMax < 1) {
    newPointsMax = 1;
  }

  // set new points max
  block.pointsMax = newPointsMax;

  // adapt existing points, if needed
  if (block.points > newPointsMax) {
    block.points = newPointsMax;
  }

  // reload doc
  loadDoc(state, state.data.doc);
};
