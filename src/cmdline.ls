``#!/usr/bin/env node
``

bani = require "./validator"

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

      -v --verbose            more detail

      -vv                     much more detail

      -h --help               display help message

      -V --version            displays version number

      -d --dry-run            perform a trial run without making any changes

      -w --watch-config-file  restart on config file change by default.

      -c --config             path to YAML configuration file

      -l --list               list all user commands

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
    ..verbose           = parser.verbose.count!
    ..dryRun            = parser.dryRun.count!
    ..watch_config_file = wcf
    ..list              = parser.list.count!



validator data


# $ = do

#   most_create (add,end,error) ->

#     if data.options.watch_config_file

#       watcher = (chokidar.watch filenames,{awaitWriteFinish:true})

#       watcher.on \change,add

#       setTimeout add,0

#       return -> watcher.close!;end!

#     else

#       setTimeout add,0

# $.skip 1

# .tap !->

#   l lit do
#       ["\n[#{metadata.name}]"," configuration file ","#{filename}"," itself has changed, restarting watch.."]
#       [c.ok,c.pink,c.warn,c.pink]


# .drain!

# #---------------------------

# # all the diff errors


# \error.validator.tampaxparsing    # config file issue.
# \error.validator.main             # config file validation failed.
# \error.validator.modify-yaml      # config file issue.
# \error.validator.no_remotehost    # ok

# \error.core.unable_to_ssh         # config file issue ( ssh address is wrong ).
# \error.core.cmd                   # ok
# \error.core.infinteloop           # ok

# \done.core.exit.closed            # ok
# \done.core.exit.open              # ok
# \done.core.exit.open_only_config  # ok



# #---------------------------

# handleE = ([signal,log]) ->

#   [status,type,which,watch] = dotpat signal

#   wcf = data.options.watch_config_file

#   if wcf and ("#{status}.#{type}" is \error.validator)

#     msg = lit ["{"," returning to watching broken config file(s), make sure to fix your errors. ","}"],[c.er1,c.grey,c.er1]

#     l lit do
#       ["[#{metadata.name}] ",msg]
#       [c.warn,null]

#   switch watch
#   | \open             =>
#     msg = c.grey "returning to watch"
#   | \open_only_config =>
#     msg = c.grey "returning to watching config file(s)."
#   | \closed => return

#   switch status
#   | \error =>
#     log.normal \warn,msg
#   | \done  =>
#     log.normal \ok,msg





# $.chain ->

#   torna = validator data

#   torna

# .switchLatest!

# .observe handleE

# .catch handleE
