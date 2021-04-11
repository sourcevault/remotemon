ext = require "./data"

#--------------------------------------------------------------------------------------

{com,print,data} = ext

metadata = com.metadata

{read-json,read-yaml,hoplon,fs,most,most_create,exec,chokidar,spawn}    = com

{readline,dotpat}                                                       = com

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

init_continuation = (buildname,dryRun) -> (cmd,type = 'async') ->*

  if dryRun

    status = 0

  else

    {status} = spawn cmd

  if (status isnt 0)

    switch type
    | \async => yield new Promise (resolve,reject) -> reject [cmd,buildname]
    | \sync  => return [cmd,buildname]

  return \ok

create_proc = (data,options,log,cont,rl) -> ->*

  locale = data['exec-locale']

  log.normal do
    locale.length
    \ok
    " exec-locale "
    c.warn " (#{locale.length}) "

  for cmd in locale

    log.verbose cmd

    yield from cont cmd

  if (not data.remotehost)

    if not data['exec-remote'].length

      yield from exec-finale data,log,cont

      yield \done.core.exit

    else

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

      status = yield from cont cmd,\sync

      if status isnt \ok

        log.normal do
          \warn
          lit [" rsync"," break "],[c.pink,c.er3]
          ""

        yield new Promise (resolve,reject) -> reject status

  remotetask = data['exec-remote']

  disp = lit [(" (#{remotetask.length}) "),(data.remotehost + ":" + data.remotefold)],[c.warn,c.grey]

  log.normal do
    remotetask.length
    \ok
    " exec.remote "
    disp

  if remotetask.length and (not options.dryRun)

    tryToSSH = "ssh #{data.ssh} #{data.remotehost} 'ls'"

    checkDir = "ssh #{data.ssh} #{data.remotehost} 'ls #{data.remotefold}'"

    mkdir = "ssh #{data.ssh} #{data.remotehost} 'mkdir #{data.remotefold}'"

    try

      exec tryToSSH

    catch E

      l lit do
          ["[#{metadata.name}]"," unable to ssh to remote address ",data.remotehost,"."]
          [c.er2,c.warn,c.er3,c.grey]

      yield \error.validator.unable_to_ssh

      return

    try

      exec checkDir

    catch E

      userinput = yield new Promise (resolve) ->

        Q = lit do
          ["[#{metadata.name}]"," #{data.remotefold}"," does not exist on remote, do you want to create directory ","#{data.remotehost}:#{data.remotefold}"," ? [y/n] "]
          [c.ok,c.warn,c.grey,c.warn,c.grey]

        rl.question Q,(answer) !->

          if answer in [\y,\Y]
            (resolve true)
            return

          resolve false

      if userinput

        yield from cont mkdir

        log.normal do
          \ok
          " exec.remote "
          lit ['[✔️ ok ]'," #{data.remotehost}:#{data.remotefold} ", "created."],[c.ok,c.warn,c.ok]

  for I in remotetask

    cmd = "ssh #{data.ssh} " + data.remotehost + " '" + "cd #{data.remotefold};" + I + "'"

    log.verbose I,cmd

    yield from cont cmd

  yield from exec-finale data,log,cont

  yield \done.core.exit

  return

diff = R.pipe do
  R.aperture 2
  R.map ([x,y]) -> y - x

main = (data,options,log,handle_cmd,rl) ->


  log.normal do
    data.watch
    \ok
    c.ok "  ↓ watching "
    c.grey " { working directory } → #{process.cwd!}"
    " " + [(c.blue I) for I in data.watch].join (c.pink " | ")

  proc = create_proc data,options,log,handle_cmd,rl

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

  $proc.switchLatest!


# ---------

$Empty = most.empty!

handle_fin = (signal,config,log,rl,opts) ->

  all_watches_are_closed = not (config.watch or opts.watch_config_file)

  if not config.watch

    rl.close!

  if all_watches_are_closed

    return most.throwError [(signal + ".closed"),log]

  if ((opts.watch_config_file) and not config.watch)

    en = ".open_only_config"

  else

    en = '.open'

  most.just [(signal + en),log]


resolve_signal = be.arr
.on 1,be.str.fix ' << program screwed up >> '
.on 0,
  be.str.fix '<< program screwed up >>'
  .cont (cmd) ->

    cmd = cmd.replace /'''/g,"'"

    if ((cmd.split '\n').length > 1) then return ('\n' + cmd)
    if (cmd.length > 45) then return ('\n' + cmd)
    else then return cmd

.cont ([cmdtxt,buildname])->

  l lit do
      ["[#{metadata.name}]#{buildname}","[ ","⚡️","    error ","] ",cmdtxt]
      [c.er1,c.er2,c.er3,c.er2,c.er2,c.er1]

  \error.core.cmd

.alt be.str
.cont handle_fin

.fix $Empty

# ---------


entry = (data,state) ->

  z data,state

  # if (data.cmd is undefined)

  #   buildname = ""

  #   configs = data.def

  # else

  #   buildname = "[#{data.cmd}]"

  #   configs = data.user[data.cmd]

  # #----------------------------------

  # opts = data.options

  # if configs.verbose

  #   verbose = configs.verbose

  # else

  #   verbose = opts.verbose

  # log = print.create_logger buildname,verbose

  # #----------------------------------

  # if (not configs.remotehost) and (configs['exec-remote'].length)

  #   log.normal do
  #     \warn
  #     c.er2 " ⚡️     error "
  #     c.er1 " remotehost address not defined for task."

  #   return most.just [\error.validator.no_remotehost,log]

  # #----------------------------------

  # handle_cmd = init_continuation buildname,opts.dryRun

  # rl = readline.createInterface {input:process.stdin,output:process.stdout,terminal:false}

  # rl.on \line,(input) !->

  #   process.stdout.write input

  # #----------------------------------

  # main configs,opts,log,handle_cmd,rl

  # .recoverWith (signal) -> most.just signal

  # .chain (signal) ->

    # (resolve_signal.auth signal,configs,log,rl,opts).value






module.exports = entry
