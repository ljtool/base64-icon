import * as fs from 'fs'
import path from 'path'
import { encodeToDataUrl, isExistsFile, mkdir } from '../utils/index.js'
import msg from '../utils/msg.js'
import ora from 'ora'
import request from 'request'
import https from 'https'

const loading = ora('loading...')
const __dirname = path.resolve()
const pullIconConfigSrc = path.join(__dirname, 'base64-icon.json')
let fontFamily = 'i'
// 暂存font file
const fontFile = path.join(__dirname, 'iconfont.woff2')

// 下载文件到本地disk
const downFile = (fileHash, projectUrlSrc) => {
  return new Promise((resolve, reject) => {
    const url = `${projectUrlSrc.substring(
      0,
      projectUrlSrc.length - 4
    )}.woff?t=${fileHash}`
    console.error('url', url)
    try {
      const file = fs.createWriteStream(fontFile)
      console.log('fontFile', fontFile)
      https.get(url, function (response) {
        response.pipe(file)
        file.on('finish', function () {
          file.close(() => {
            resolve(fontFile)
          })
        })
        file.on('error', function (err) {
          fs.unlink(fontFile)
          reject(err)
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}
const appendFontFace = async (
  body,
  projectUrlSrc,
  targetFileSrc,
  fontFamily
) => {
  // 匹配文件hash值
  const hash = /\?t=(.*?)'\)/
  const fileHash = hash.exec(body)[1] || ''

  const isDownSuccess = await downFile(fileHash, projectUrlSrc)
  if (isDownSuccess) {
    const fileBase64Content = await encodeToDataUrl(fontFile)
    const prefixContent = `@font-face {
      font-family: '${fontFamily}';
      src: url('data:application/font-woff;charset=utf-8;base64,${fileBase64Content}') format('woff2');
    }`
    fs.appendFile(targetFileSrc, prefixContent, function (err) {
      if (err) throw err
      loading.stop()
      console.log(msg.success('图标同步完成'))
    })
  }
}
const start = () => {
  if (isExistsFile(pullIconConfigSrc)) {
    let config = fs.readFileSync(pullIconConfigSrc)
    config = JSON.parse(config)
    let { cssUrl = '', cssPath = '' } = config
    console.error(cssUrl, cssPath)
    // 检查项目ID
    if (!cssUrl) {
      console.log(msg.warning('请在base64-icon.json配置文件中配置项目URL'))
      process.exit()
    }
    // 检查写入目标文件
    if (!cssPath) {
      console.log(msg.warning('请在base64-icon.json配置文件配置目标文件路径'))
      process.exit()
    } else {
      cssPath = path.join(__dirname, cssPath)
    }
    if (!isExistsFile(cssPath)) {
      const dirArr = cssPath.split('\\')
      const fileName = dirArr[dirArr.length - 1]
      const dirUrl = cssPath.substring(0, cssPath.length - fileName.length)
      mkdir(dirUrl)
      fs.closeSync(fs.openSync(cssPath, 'w'))
    }
    loading.start()
    if (cssUrl.startsWith('//')) {
      cssUrl = 'https:' + cssUrl
    }
    request.get(cssUrl + '?t=' + Date.now(), (err, res, body) => {
      if (err) {
        loading.stop()
        console.log(msg.error('请求失败'), cssUrl, err)
        process.exit()
      }
      if (res.statusCode === 200) {
        // 写入自定义内容
        fs.open(cssPath, 'w', function (err, fd) {
          if (err) throw err
          // 创建写入内容缓冲区
          const writeBuffer = new Buffer.from(body)
          fs.writeSync(fd, writeBuffer, 345)
          fontFamily = /font-family: "(\w)" !important;/.exec(body)[1]
          appendFontFace(body, cssUrl, cssPath, fontFamily)
        })
      }
    })
  } else {
    console.log(msg.warning('请在项目下配置base64-icon.json配置文件'))
    process.exit()
  }
}

export default start
