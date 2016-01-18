'use strict'

const childProcess = require('child_process')
const fs = require('fs')

const promisify = require('promisify-function')

function exec (command, options) {
  return new Promise(function (resolve, reject) {
    childProcess.exec(command, options, function (err, stdout, stderr) {
      if (err) {
        reject(err)
      } else {
        resolve({command, stdout, stderr})
      }
    })
  })
}

function exists (path) {
  return new Promise(function (resolve, reject) {
    fs.exists(path, function (exists) {
      if (exists) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

module.exports = {
  exec,
  exists,
  mkdir: promisify(fs.mkdir),
  readFile: promisify(fs.readFile)
}
