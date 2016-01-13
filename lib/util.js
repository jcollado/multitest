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

function mkdir (path) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(path, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
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
  mkdir,
  exists
}
