# Whoopsie

[![Build Status](https://img.shields.io/travis/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://travis-ci.org/wildlyinaccurate/whoopsie)
[![Coverage Status](https://img.shields.io/coveralls/wildlyinaccurate/whoopsie.svg?style=flat-square)](https://coveralls.io/repos/github/wildlyinaccurate/whoopsie/badge.svg?branch=master)

Whoopsie is a visual regression tool for testing responsive web sites.

## Installation

```
$ npm install -g whoopsie
```

## Usage

```
$ whoopsie test path/to/config.yaml
```

### Options

| Name            | Default value      | Description                          |
|-----------------|--------------------|--------------------------------------|
| `--concurrency` | `os.cpus().length` | Number of tests to run cooncurrently |
| `--verbose`     | `<Off>`            | Enable verbose output                |

> **Note:** Whoopsie requires Node.js v6.0 or higher to run.

## Configuration

See [config/sample.yaml](./config/sample.yaml) for a sample configuration file.

## Example Output

[![](./example-output.png)](./example-output.png)

## License

[ISC](./LICENSE)
