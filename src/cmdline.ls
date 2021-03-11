``#!/usr/bin/env node
``

bani = require "./validator"

{ext,validator,findfile} = bani

{com,print} = ext

#---------------------------------------------------

{read-json,most,j,optionator,exec,chokidar,most_create,updateNotifier,fs,metadata} = com

{l,z,j,R,lit,c} = com.hoplon.utils

be = com.hoplon.types

#---------------------------------------------------

cmd_options =

  prepend: "Usage: remotemon [ command name ]"

  append : metadata.version

  options:

     *option: 'help'
      alias: 'h'
      type: 'Boolean'
      description: 'displays help'

     *option: 'config'
      alias: 'c'
      type: 'String'
      description: 'path to configuration file'

     *option: 'verbose'
      alias: 'v'
      type: 'Boolean'
      description: 'verbose messages'

     *option: 'version'
      alias: 'V'
      type: 'Boolean'
      description: 'displays version number'

     *option: 'dry-run'
      alias: 'd'
      type: 'Boolean'
      description: 'perform a trial run without making any changes'

     *option: 'no-watch'
      alias: 'n'
      type: 'Boolean'
      description: 'disable all watches ( globally ), watches don\'t get created.'

cmdparser = optionator cmd_options

if not (metadata.name) then return false

try

  opt = cmdparser.parseArgv process.argv

catch E

  l E.toString!

  return

if opt.help

  l cmdparser.generateHelp!

  str =
    """

    By default remotemon will look for .remotemon.yaml in current directory and one level up (only).

    using --config <filename>.yaml option will direct remotemon to use <filename>.yaml as config file :

    > remotemon --config custom.yaml
    > remotemon --config custom.yaml --verbose

    values for internal variables can be changed using '=' (similar to makefiles) :

    > remotemon --config custom.yaml --verbose file=dist/main.js

    documentation @ [ https://github.com/sourcevault/remotemon ]

    """

  l str

  return 0

try

  pkg = require "../package.json"

  notifier = updateNotifier {pkg}

  notifier.notify!

#---------------------------------------------------

split_by_var = (rest) ->

  fin = {cmd:[],vars:[]}

  for I in rest

    which = I.split "="

    switch which.length
    | 1 =>
      fin.cmd.push which[0]
    | 2 =>
      fin.vars.push which


  vars = {}

  for I in fin.vars

    vars[I[0]] = I[1]

  fin.vars = vars

  fin


#---------------------------------------------------

print.show-header!

if opt.version

  return 0

#-------------[looking for 'makefile']--------------

filename = opt.config

filename = findfile filename

if not filename then return null

info_from_user = split_by_var opt._

data = {}
  ..cmd         = info_from_user.cmd
  ..vars        = info_from_user.vars
  ..filename    = filename

  ..commandline = R.drop 2,process.argv

  ..options     = {}
    ..verbose     = opt.verbose
    ..dryRun      = opt.dryRun
    ..noWatch     = opt.noWatch

$ = do

  most_create (add,end,error) ->

    if data.options.noWatch

      setTimeout add,0

    else

      watcher = (chokidar.watch filename,{awaitWriteFinish:true})

      watcher.on \change,add

      setTimeout add,0

      return -> watcher.close!;end!


$.skip 1

.tap !->

  l lit do
      ["\n[#{metadata.name}]"," configuration file ","#{filename}"," itself has changed, restarting watch.."]
      [c.ok,c.pink,c.warn,c.pink]

.drain!

$.chain ->

  validator data

.map (vo) ->

  if vo.continue then return vo.value

  switch vo.message
  |  \error.validate,\error.parse =>
    print.show do
      not data.options.noWatch
      lit do
        [".. returning to watching broken config file, make sure to fix your errors .."]
        [c.er1]

  most.empty!

.switchLatest!
.drain!

