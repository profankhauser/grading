# grading

Grade projects, exams or theses in a transparent, reproducible, reusable and data protected fashion

Live at: https://profankhauser.github.io/grading

## Documents

A grading can be saved and opened as a JSON file.
You can have a look at the structure at [docs/default.json](docs/default.json).

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

## Data Link

To allow easy sharing of documents, each document maintains a current representation of the doc in the link following the `#` mark.
This allows to simply copy and share a URL with anybody or bookmark the link.

The part after the `#` mark is simply a [Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) encoded version of the doc stringified as JSON.

## Block Types

The following block types are supported:

### Text

A section of markdown text for information.

| Attribute | Value                     | Description                       |
| --------- | ------------------------- | --------------------------------- |
| `type`    | `text`                    | Defines the block type to `text`. |
| `text`    | `Markdown formatted text` | The text to display.              |

### Slider

A section with markdown text for information with a points slider.

| Attribute   | Value                     | Description                                  |
| ----------- | ------------------------- | -------------------------------------------- |
| `type`      | `slider`                  | Defines the block type to `slider`.          |
| `text`      | `Markdown formatted text` | The text to display.                         |
| `points`    | `5`                       | The points achieved in this block.           |
| `pointsMax` | `10`                      | The maximum points achievable in this block. |

### Grade

A section of markdown text followed by a grading results table.

| Attribute | Value                     | Description                        |
| --------- | ------------------------- | ---------------------------------- |
| `type`    | `grade`                   | Defines the block type to `grade`. |
| `text`    | `Markdown formatted text` | The text to display.               |

## Development

Clone the repo and run `./bin/serve` to start a local fileserver

## Dependencies

The project has no build dependencies and is created using standard web components (see https://developer.mozilla.org/en-US/docs/Web/Web_Components).

## About

This project is created and maintained by:

[Prof. Dr. Thomas Fankhauser](https://fankhauser.io)<br>
Heilbronn University
