# multitest

[![npm](https://img.shields.io/npm/v/multitest.svg)](https://www.npmjs.com/package/multitest)
[![Build Status](https://travis-ci.org/jcollado/multitest.svg?branch=master)](https://travis-ci.org/jcollado/multitest)
[![Coverage Status](https://coveralls.io/repos/jcollado/multitest/badge.svg?branch=master&service=github)](https://coveralls.io/github/jcollado/multitest?branch=master)
[![Dependency Status](https://david-dm.org/jcollado/multitest.svg)](https://david-dm.org/jcollado/multitest)
[![devDependency Status](https://david-dm.org/jcollado/multitest/dev-status.svg)](https://david-dm.org/jcollado/multitest#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

Run `npm test` using multiple `node` versions

`multitest` is a commandline tool to execute the test cases of a given project
using different `node` versions.

The flow the tool when executed for the first time is as follows:
- Get versions from `.travis.yml` file
- Clone code in `<project>/.multitest/<version>`
- Run `nvm use <version> && npm install && npm test`

After the first run, `git pull` is executed instead of `git clone`. This way,
there's no need to clone code again and re-install dependencies from scratch.

## Installation

The recommended way to install `multitest` is as a development dependency for a project:

```bash
npm install --save-dev multitest
```

and then integrate it in the project workflow as an `npm` script. More information about this in the [configuration section](#configuration) below.

However, when the tool is installed for the first time, it's fine to install it globally and give it a try from the command line:

```bash
npm install -g multitest
```

## Usage

To run `npm test` for every `node` version found in the travis configuration file:

```bash
multitest
```

## Command line options

- `-l/--log-level [logLevel]`: Log level

This flag can be used to set the level of verbosity of the output. The default value is `info` which outputs a reasonable amount of information. To troubleshoot problems, `debug` is recommended.

## Configuration

For a better integration in the project workflow, the recommended way to run `multitest` is through `npm` scripts. One way to do that would be as follows:

- Add `multitest` script to run `multitest` manually when needed
- Call the `multitest` script in either `preversion` and/or `prepublish` script

This would be an example of such a configuration:

```json
{
  "scripts": {
    "multitest": "multitest",
    "preversion": "npm run multitest"
  }
}
```

In addition to this, if some hook configuration module is used such as [`ghooks`](https://www.npmjs.com/package/ghooks) it could be a good idea to run `multitest` as a precommit hook.

## Contributing

Any contribution is more than welcome. In particular, if:

- there's something that doesn't work as expected or you have an idea for a nice to have feature, then please submit an issue [here](https://github.com/jcollado/multitest/issues/new)
- you know how to fix a problem or improve the code, then please submit a pull request [here](https://github.com/jcollado/multitest/compare)
