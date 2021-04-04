ext = require "./data"

#--------------------------------------------------------------------------------------

{com,print,data} = ext

metadata = com.metadata

{read-json,read-yaml,hoplon,fs,most,most_create,exec,chokidar,spawn}    = com

{readline}                                                              = com

{c,R,lit,l,z,j,zj}                                                      = hoplon.utils


#---------------------------------------------------------------------------------------

oxo = hoplon.guard

be  = hoplon.types

# break bash command into multiple lines

sanatize_cmd_internal = be.str

.cont (cmd) ->

  if ((cmd.split '\n').length > 1) then return ('\n' + cmd)

  if (cmd.length > 45) then return ('\n' + cmd)

  else then return cmd

.fix '<< program screwed up >>'

sanatize_cmd = (txt) -> (sanatize_cmd_internal.auth txt).value

#---------------------------------------------------------------------------------------

create_rsync_cmd = (rsync,remotehost) ->

  txt = ""

  {str,obnormal,obarr,des,src} = rsync

  for I in str

    txt += "--" + I + " "

  for [key,val] in obnormal

    txt += "--#{key}='#{val}' "

  for key,val of obarr

    txt += "--#{key}={" + (["\'#{I}\'" for I in val].join ',') + "} "

  cmd = "rsync " + txt + (src.join " ") + " " + (remotehost + ":" + des[0])

  cmd

exec-finale = (data,log,cont) ->*

  postscript = data['exec-finale']

  log.normal do
    postscript.length
    \ok
    " exec-finale "
    c.warn " (#{postscript.length}) "

  for cmd in postscript

    log.verbose cmd

    yield cont cmd

init_continuation = (buildname,dryRun) -> (cmd) ->

  if dryRun

    status = 0

  else

    {status} = spawn cmd

  switch status
  | 0         => new Promise (resolve) -> setTimeout resolve,0
  | otherwise => new Promise (resolve,reject) -> reject [cmd,buildname]

create_proc = (data,options,log,cont) -> ->*

  locale = data['exec-locale']

  log.normal do
    locale.length
    \ok
    " exec-locale "
    c.warn " (#{locale.length}) "

  for cmd in locale

    log.verbose cmd

    yield cont cmd

  if (not data.remotehost)

    if not data['exec-remote'].length

      yield from exec-finale data,log,cont

    yield \error.core.no_remotehost

    return

  if data.rsync

    remotehost = data.remotehost

    for each in data.rsync

      cmd = create_rsync_cmd each,remotehost

      disp   = [" ",(each.src.join " ")," ~> ",remotehost,":",each.des].join ""

      log.normal do
        \ok
        lit [" rsync"," start "],[0,c.warn]
        disp

      log.verbose "....",cmd

      yield cont cmd

      log.normal do
        \ok
        lit [" rsync ","✔️ ok "],[0,c.ok]


  remotetask = data['exec-remote']

  disp = (c.warn " (#{remotetask.length}) ") + data.remotehost + ":" + data.remotefold

  log.normal do
    remotetask.length
    \ok
    " exec.remote "
    disp

  if remotetask.length and (not options.dryRun)

    cmd = "ssh #{data.ssh} #{data.remotehost} 'ls #{data.remotefold}'"

    try

      exec cmd

    catch E

      l lit do
        ["[#{metadata.name}]"," #{data.remotefold}"," does not exist, creating new directory .."]
        [c.ok,c.warn,c.blue]

      cmd = "ssh #{data.ssh} #{data.remotehost} 'mkdir #{data.remotefold}'"

      yield cont cmd

  for I in remotetask

    cmd = "ssh #{data.ssh} " + data.remotehost + " '" + "cd #{data.remotefold};" + I + "'"

    log.verbose I,cmd

    yield cont cmd

  yield from exec-finale data,log,cont

  yield \done.core.exit

  return

diff = R.pipe do
  R.aperture 2
  R.map ([x,y]) -> y - x

main = (data,options,log,handle_cmd) ->

  if (not data.remotehost) and data['exec-remote'].length

    log.normal do
      \warn
      lit [" ⛔    "," warn "],[c.er1,c.er1]
      " remotehost address not defined for task."

  log.normal do
    data.watch
    \ok
    c.ok " ↓ watching "
    c.grey " { working directory } → #{process.cwd!}"
    " " + [(c.blue I) for I in data.watch].join (c.pink " | ")

  proc = create_proc data,options,log,handle_cmd

  $file_watch =  most_create (add,end,error) ->

    if data.initialize

      add \init

    if data.watch

      watcher = chokidar.watch data.watch,data.chokidar

      watcher.on \change,add

      !-> watcher.close!; end!


  $proc = $file_watch
  .timestamp!
  .loop do
    (db,ob) ->

      db.shift!

      db.push Math.floor (ob.time/2000)

      [first,second] = diff db

      fin = {seed:db}

      if (first is second)

        l lit do
          [
            "[#{metadata.name}]"
            "[ ","⚡️","    error ","] "
            "infinite loop detected "
            ob.value
            " is offending file, ignoring event."
          ]
          [c.er1,c.er2,c.er3,c.er2,c.er2,c.er1,c.warn,c.er1]

        fin.value = \err

      else

        fin.value = \ok

      return fin

    [0,0,0]

  .map (status) ->

    if status is \err then return most.just \error.core.infinteloop

    most.generate proc
    .recoverWith ([cmdtxt,buildname]) ->

      txt = sanatize_cmd cmdtxt

      if (cmdtxt is undefined)

        buildname = " << program screwed up >> "

      l lit do
        ["[#{metadata.name}]#{buildname}","[ ","⚡️","    error ","] ",txt]
        [c.er1,c.er2,c.er3,c.er2,c.er2,c.er1]

      most.just \error.core.cmd


  $proc.switchLatest!

# ---------

entry = (data,state) ->

  if (data.cmd is undefined)

    buildname = ""

    configs = data.def

  else

    buildname = "[#{data.cmd}]"

    configs = data.user[data.cmd]

  #----------------------------------

  opts = data.options

  if configs.verbose

    verbose = configs.verbose

  else

    verbose = opts.verbose

  logger = print.create_logger buildname,verbose

  handle_cmd = init_continuation buildname,opts.dryRun

  rl = readline.createInterface {input:process.stdin}

  rl.on \line,(input) !->

    process.stdout.write input + "\n"

  #----------------------------------

  main configs,opts,logger,handle_cmd

  .tap (signal) ->

    if (signal is undefined) then return

    if configs.watch

      l c.ok "[#{metadata.name}] .. returning to watch .."

    else

      rl.close!

module.exports = entry
