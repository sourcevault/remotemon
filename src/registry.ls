
chalk = require "chalk"

registry = {}

  ..packageJ = {}
    ..name = null
    ..repourl = null
    ..homepage = null
    ..version = null

  ..c = {}
    ..dark = {}
      ..ok    = chalk.green.bold
      ..er    = chalk.hex "FF0000"
      ..warn  = chalk.hex "FFFFCD"



module.exports = registry
