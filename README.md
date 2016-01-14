# multitest

[![npm](https://img.shields.io/npm/v/multitest.svg)](https://www.npmjs.com/package/multitest)
[![Dependency Status](https://david-dm.org/jcollado/multitest.svg)](https://david-dm.org/jcollado/multitest)
[![devDependency Status](https://david-dm.org/jcollado/multitest/dev-status.svg)](https://david-dm.org/jcollado/multitest#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Run `npm test` using multiple `node`/`io.js` versions

`multitest` is a commandline tool to execute the test cases of a given project
using different `node`/`io.js` versions.

The flow the tool when executed for the first time is as follows:
- Get versions from `.travis.yml` file
- Clone code in `<project>/.multitest/<version>`
- Run `nvm use <version> && npm install && npm test`

After the first run, `git pull` is executed instead of `git clone`. This way,
there's no need to clone code again and re-install dependencies from scratch.
