#!/usr/bin/env node
import { program } from 'commander'
import init from './init.js'
import start from './start.js'

program.description('base64-icon')

program
  .command('init')
  .description('初始化')
  .alias('i')
  .action(() => {
    init()
  })

program
  .command('start')
  .description('开始...')
  .alias('s')
  .action(() => {
    start()
  })
program.parse(process.argv)

if (!program.args.length) {
  program.help()
}
