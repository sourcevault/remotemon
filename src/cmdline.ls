``#!/usr/bin/env node
``

bani = require "./core"

{ext,validator,findfile} = bani

{com,print} = ext

#--------------------------------------------

{read-json,most,j,exec,chokidar,most_create,updateNotifier,fs,metadata,optionParser} = com

{dotpat} = com

{l,z,zj,j,R,lit,c} = com.hoplon.utils

be = com.hoplon.types

noop = ->

#--------------------------------------------

parser = new optionParser!

parser.addOption \h,'help',null,\help

parser.addOption \v,'verbose',null,\verbose

parser.addOption \V,'version',null,\version

parser.addOption \d,'dry-run',null,\dryRun

parser.addOption \w,'watch-config-file',null,\watch_config_file

parser.addOption \c,'config',null,\config
.argument \FILE

parser.addOption \l,'list',null,\list

parser.addOption \m,'auto-make-directory',null,\auto_make_directory


if not (metadata.name) then return false

try

  rest = parser.parse!

catch E

  l E.toString!

  return

try

  pkg = require "../package.json"

  notifier = updateNotifier {pkg}

  notifier.notify!

if (parser.help.count!) > 0

  str =
    """
    remotemon version #{metadata.version}

    options:

      -v --verbose               more detail

      -vv                        much more detail

      -h --help                  display help message

      -V --version               displays version number

      -d --dry-run               perform a trial run without making any changes

      -w --watch-config-file     restart on config file change by default.

      -c --config                path to YAML configuration file

      -l --list                  list all user commands

      -m --auto-make-directory   make remote directory if it doesn't exist.

    By default remotemon will look for .remotemon.yaml in current directory and one level up (only).

    using --config <filename>.yaml option will direct remotemon to use <filename>.yaml as config file :

    > remotemon --config custom.yaml
    > remotemon --config custom.yaml -v

    values for internal variables (using .global object) can be changed using '=' (similar to makefiles) :

    > remotemon --config custom.yaml --verbose file=dist/main.js

    [ documentation ] @ [ https://github.com/sourcevault/remotemon\#readme.md ]

    """

  l str

  return

print.show-header!

if parser.version.count! > 0
  return

isvar = R.test /\=/

vars = rest
|> R.filter isvar
|> R.map R.split '='

args = R.reject isvar,rest

#-------------[looking for 'makefile']--------------

filename = parser.config.value!

filenames = findfile filename

if not filenames then return void

if (parser.list.count! > 0)

  wcf = 0

else

  wcf = parser.watch_config_file.count!


data = {}

  ..cmdname     = args[0]
  ..cmdargs     = R.drop 1,args
  ..vars        = vars
  ..filenames   = filenames

  ..commandline = R.drop 2,process.argv

  ..options     = {}
    ..verbose             = parser.verbose.count!
    ..dryRun              = parser.dryRun.count!
    ..watch_config_file   = wcf
    ..list                = parser.list.count!
    ..auto_make_directory = parser.auto_make_directory.count!

validator data