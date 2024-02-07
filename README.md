# grading

Grade projects, exams or theses in a transparent, reproducible, reusable and data protected fashion

Live at: https://profankhauser.github.io/grading

## Documents

A grading can be saved and opened as a JSON file.
You can have a look at the structure at [docs/default.json]{docs/default.json}.

```json
{
  "config": {
    "percentForGrade1": 95,
    "percentForGrade4": 50
  },
  "blocks": [
    {
      "type": "text",
      "text": "Some markdown formatted text ..."
    },
    {
      "type": "slider",
      "text": "Some markdown formatted text ...",
      "points": 0,
      "pointsMax": 10
    },
    {
      "type": "grade",
      "text": "Some markdown formatted text ..."
    }
  ]
}
```

## Development

Clone the repo and run `./bin/serve` to start a local fileserver

## Dependencies

The project has no build dependencies and is created using standard web components (see https://developer.mozilla.org/en-US/docs/Web/Web_Components).

## About

This project is created and maintained by:

[Prof. Dr. Thomas Fankhauser](https://fankhauser.io)<br>
Heilbronn University
