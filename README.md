# Whoopsie

[![Build Status](https://img.shields.io/travis/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://travis-ci.org/wildlyinaccurate/whoopsie)
[![Coverage Status](https://img.shields.io/coveralls/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://coveralls.io/repos/github/wildlyinaccurate/whoopsie/badge.svg?branch=master)

Whoopsie is a visual regression tool for testing responsive web sites.

## Installation

```
$ npm install -g whoopsie
```

> **Note:** Whoopsie requires Node.js 8 or higher and a recent version of ImageMagick.

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

Reporters can be specified when running `whoopsie test` by passing the `--reporter` flag. More than one reporter can be specified.

### `json` (default)

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
                "id": "capture$af47bcbd",
                "url": "http://www.bbc.com/news/",
                "imagePath": "/tmp/whoopsie-capture$af47bcbd.png"
            },
            "test": {
                "id": "capture$50380d46",
                "url": "http://www.test.bbc.com/news/",
                "imagePath": "/tmp/whoopsie-capture$50380d46.png"
            },
            "diff": {
                "total": 0,
                "percentage": 0,
                "id": "compare$48c4c849",
                "imagePath": "/tmp/whoopsie-compare$48c4c849.png"
            },
            "viewport": {
                "width": 320,
                "height": 480,
                "isMobile": true,
                "javascriptDisabled": true,
                "name": "Core Experience"
            }
        },
        {
            "base": {
                "id": "capture$a82dce5a",
                "url": "http://www.bbc.com/news/",
                "imagePath": "/tmp/whoopsie-capture$a82dce5a.png"
            },
            "test": {
                "id": "capture$a0854fc8",
                "url": "http://www.test.bbc.com/news/",
                "imagePath": "/tmp/whoopsie-capture$a0854fc8.png"
            },
            "diff": {
                "total": 4750.12,
                "percentage": 0.0724822,
                "id": "compare$33624d4c",
                "imagePath": "/tmp/whoopsie-compare$33624d4c.png"
            },
            "viewport": {
                "width": 320,
                "height": 480,
                "isMobile": true
            }
        }
    ]
}
```

### `gallery`

Outputs test results as an HTML gallery.

[![](./example-output.png)](./example-output.png)

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
