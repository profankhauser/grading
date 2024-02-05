export default {
  config: {
    percentForGrade1: 95,
    percentForGrade4: 50,
  },
  blocks: [
    {
      type: "text",
      text: "## Databases 1: Evaluation\n\n\nHello",
    },
    {
      type: "slider",
      text: "## Project Pitch\nVery nice",
      points: 10,
      pointsMax: 10,
    },
    {
      type: "slider",
      text: "## Presentation",
      points: 4,
      pointsMax: 15,
    },
    {
      type: "grade",
      text: "## Grade",
    },
    {
      type: "text",
      text: "With best regards,\nProf. Dr. Thomas Fankhauser",
    },
  ],
};
