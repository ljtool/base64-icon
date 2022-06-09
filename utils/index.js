import * as fs from 'fs'
import crypto from 'crypto'
import path, { resolve } from 'path'

export const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }
}

export const readFileAsync = promisify(fs.readFile)

export const encodeToDataUrl = async (path) => {
  const buff = await readFileAsync(path)
  return buff.toString('base64')
}

// 内容md5
export const md5 = (text) => {
  return crypto.createHash('md5').update(text).digest('hex')
}

// 存文件
export const writeFile = (path, content) => {
  fs.writeFileSync(path, content)
}
// 读取文件内容
export const readFile = (path) => {
  return fs.readFileSync(path, 'utf-8')
}
// 检查是否存在指定的文件
export const isExistsFile = (path) => {
  try {
    return fs.existsSync(path)
  } catch (error) {
    console.log(error)
  }
}

// 读取目前文件的内容, 计算MD5值, 并对比前后是否有更新
export const checkUpdate = (writeBuffer, path) => {
  const fileMD5 = md5(writeBuffer)
  if (fileMD5 !== readFile(path)) {
    writeFile(path, fileMD5)
    return true
  }
  return false
}

// 递归创建目录 异步方法
export const mkdir = (dirname) => {
  if (!fs.existsSync(dirname)) {
    mkdir(path.resolve(dirname, '../'))
    fs.mkdirSync(dirname)
  }
}
