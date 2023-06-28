# Whoopsie

[![Build Status](https://img.shields.io/travis/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://travis-ci.org/wildlyinaccurate/whoopsie)
[![Coverage Status](https://img.shields.io/coveralls/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://coveralls.io/repos/github/wildlyinaccurate/whoopsie/badge.svg?branch=master)

Whoopsie is a visual regression tool for testing responsive web sites.

## Installation

```
$ npm install -g whoopsie
```

## Configuration

See [config/sample.yaml](./config/sample.yaml) for a sample configuration file.

## Usage

### Commands

#### `gallery`

Run visual regression tests and generate an HTML gallery containing the results. This command is an alias for `whoopsie test --reporter gallery`.

```
$ whoopsie gallery path/to/config.yaml
```

#### `test`

Run visual regression tests. Uses the `json` reporter by default.

```
$ whoopsie test path/to/config.yaml
```

#### `generate-gallery`

Generate a gallery from the JSON output of `whoopsie test`. Useful if you generate JSON results in CI and want to view the results in a gallery locally.

```
$ whoopsie generate-gallery path/to/config.yaml
```

#### `validate-config`

Check that the configuration file is valid.

```
$ whoopsie validate-config path/to/config.yaml
```

### Options

| Name            | Default value      | Description                                     |
|-----------------|--------------------|-------------------------------------------------|
| `--reporter`    | `json`             | Test result reporter(s) to use.                 |
| `--concurrency` | `os.cpus().length` | Number of tests to run concurrently             |
| `--verbose`     | `<Off>`            | Print extra information while running           |
| `--debug`       | `<Off>`            | Print extra debugging information while running |
| `--quiet`       | `<Off>`            | Only print errors while running                 |

## Reporters

Reporters can be specified when running `whoopsie test` by passing the `--reporter` flag. More than one reporter can be specified. The default reporter is `json`.

### `gallery`

Outputs test results as an HTML gallery.

[![](./example-output.png)](./example-output.png)

### `json`

Outputs test results as JSON.

```json
{
    "summary": {
        "total": 2,
        "failures": 0,
        "passes": 2
    },
    "results": [
        {
            "base": {
                "type": "selector",
                "selector": ".nw-c-top-stories",
                "id": "capture$ad367858",
                "page": {
                    "path": "/news",
                    "selectors": [
                        ".nw-c-top-stories",
                        ".nw-c-must-see"
                    ],
                    "url": "http://www.bbc.com/news"
                },
                "imagePath": "/tmp/whoopsie-capture$ad367858-0.png"
            },
            "test": {
                "type": "selector",
                "selector": ".nw-c-top-stories",
                "id": "capture$c1dbebb0",
                "page": {
                    "path": "/news",
                    "selectors": [
                        ".nw-c-top-stories",
                        ".nw-c-must-see"
                    ],
                    "url": "http://www.test.bbc.com/news"
                },
                "imagePath": "/tmp/whoopsie-capture$c1dbebb0-0.png"
            },
            "diff": {
                "total": 0,
                "percentage": 0,
                "id": "compare$520b7196",
                "imagePath": "/tmp/whoopsie-compare$520b7196.png"
            },
            "viewport": {
                "width": 640,
                "isMobile": true
            }
        },
        {
            "base": { ... },
            "test": { ... },
            "diff": { ... },
            "viewport": { ... }
        }
    ]
}
```

## Docker

If you prefer to run Whoopsie in a container, you can use the official Docker image:

```
$ docker pull wildlyinaccurate/whoopsie
$ docker run --rm --volume $PWD:/whoopsie --workdir /whoopsie \
    wildlyinaccurate/whoopsie \
    whoopsie gallery /whoopsie/path/to/config.yaml
```

## License

[ISC](./LICENSE)
