import defaultDoc from "../docs/default.json.js";

export const boot = (state) => {
  // load doc from URL or default
  let doc = fetchDocFromURL();
  if (!doc) {
    doc = defaultDoc;
  }
  state.data.doc = doc;

  // calculate
  recalculateScale(state);
  recalculateResult(state);

  // recalculate on point changes
  state.addEventListener("block-points-changed", () => {
    recalculateResult(state);
  });

  // setup main screen and show
  state.data.screen = "main";
  state.dispatchEvent("screen-changed");
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
