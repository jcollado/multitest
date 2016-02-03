import childProcess from 'child_process'
import fs from 'fs'

import promisify from 'promisify-function'

const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)

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

export { exec, exists, mkdir, readFile }
