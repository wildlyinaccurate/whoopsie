# Whoopsie

[![Build Status](https://img.shields.io/travis/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://travis-ci.org/wildlyinaccurate/whoopsie)
[![Coverage Status](https://img.shields.io/coveralls/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://coveralls.io/repos/github/wildlyinaccurate/whoopsie/badge.svg?branch=master)

Whoopsie is a visual regression tool for testing responsive web sites.

## Installation

```
$ npm install -g whoopsie
```

## Configuration

By default Whoopsie will read configuration from `.whoopsie-config.yml` in the current directory. See [config/sample.yml](./config/sample.yml) for a sample configuration file.

Configuration can be loaded from another path with the `--config` or `-c` flag:

```
$ whoopsie test -c path/to/config.yml
```

## Usage

### Commands

#### `gallery`

Run visual regression tests and generate an HTML gallery containing the results. This command is an alias for `whoopsie test --reporter gallery`.

```
$ whoopsie gallery
```

#### `test`

Run visual regression tests. Uses the `json` reporter by default.

```
$ whoopsie test
```

#### `generate-gallery`

Generate a gallery from the JSON output of `whoopsie test`. Useful if you generate JSON results in CI and want to view the results in a gallery locally.

```
$ whoopsie generate-gallery
```

#### `validate-config`

Check that the configuration file is valid.

```
$ whoopsie validate-config
```

### Options

| Name                    | Default value      | Description                                              |
|-------------------------|--------------------|----------------------------------------------------------|
| `--reporter` or `r`     | `json`             | Test result reporter(s) to use                           |
| `--concurrency` or `-C` | `4`                | Number of tests to run concurrently                      |
| `--verbose` or `-v`     | `<Off>`            | Print extra information while running                    |
| `--debug` or `-vv`      | `<Off>`            | Print extra information and debug messages while running |
| `--quiet` or `-q`       | `<Off>`            | Only print errors while running                          |

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
    whoopsie gallery
```

## License

[ISC](./LICENSE)
