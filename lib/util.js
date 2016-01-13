'use strict'

const childProcess = require('child_process')
const fs = require('fs')

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

function promisify (fn) {
  return function () {
    const args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      function callback (err) {
        if (err) {
          reject(err)
        } else {
          const data = Array.prototype.slice.call(arguments, 1)
          resolve(data)
        }
      }
      fn.apply(null, args.concat(callback))
    })
  }
}

module.exports = {
  exec,
  exists,
  mkdir: promisify(fs.mkdir),
  readFile: promisify(fs.readFile)
}
