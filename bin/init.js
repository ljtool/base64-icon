import inquirer from 'inquirer'
import * as fs from 'fs'
import msg from '../utils/msg.js'

const init = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'cssUrl',
        message: '请输入字体css文件url',
      },
      {
        type: 'input',
        name: 'cssPath',
        message: '请输入保存css文件相对路径',
      },
    ])
    .then((answers) => {
      let content = JSON.stringify(answers, null, '  ')
      fs.writeFile('base64-icon.json', content, (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(msg.success('base64-icon.json文件创建成功!'))
      })
    })
    .catch((err) => {
      console.error('error', err)
    })
}
export default init
