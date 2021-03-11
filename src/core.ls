ext = require "./data"

#---------------------------------------------------

{com,print,data} = ext

metadata = com.metadata

{read-json,read-yaml,hoplon,fs,most,most_create,spawn,exec,chokidar}  = com

{c,R,lit,l,z,j,zj}                                                    = hoplon.utils

oxo = hoplon.guard

create_rsync_cmd = (data) ->

  rsync = data.rsync

  txt = ""

  {str,obnormal,obarr,des,src} = rsync

  for I in str

    txt += "--" + I + " "

  for [key,val] in obnormal

    txt += "#{key}='#{val}' "

  for key,val of obarr

    txt += "--#{key}={" + (["\'#{I}\'" for I in val].join ',') + "} "

  cmd = "rsync " + txt + (src.join " ") + " " + (data.remotehost + ":" + des[0])

  cmd

to_bool = (x) ->

  if x then return true
  else then return false

exec-finale = (data,logger,cont) ->*

  postscript = data['exec-finale']

  logger do
    postscript.length
    \ok
    " exec-finale "

  for cmd in postscript

    logger \verbose,cmd

    yield cont cmd


create_continue = (dryRun,buildname) -> (txt) ->

  if dryRun

    status = 0

  else

    {status} = spawn txt

  switch status
  | 0         => new Promise (resolve) -> setTimeout resolve,0
  | otherwise => new Promise (resolve,reject) -> reject [txt,buildname]

create_proc = (data,logger,cont,options) -> ->*

  locale = data['exec-locale']

  logger do
    locale.length
    \ok
    " exec-locale "

  for cmd in locale

    logger \verbose,cmd

    yield cont cmd

  if (not data.remotehost)

    if not (data['exec-remote'].length)

      yield from exec-finale data,logger,cont

    yield \done

    return

  if data.rsync

    cmd = create_rsync_cmd data

    disp   = [" ",(data.rsync.src.join " ")," ~> ",data.remotehost,":",data.rsync.des].join ""

    logger do
      \ok
      lit [" rsync"," start "],[0,c.warn]
      disp

    logger \verbose,cmd

    yield cont cmd

    logger do
      \ok
      lit [" rsync","    ✔️ "],[0,c.ok]

  disp = " " + data.remotehost + ":" + data.remotefold

  remotetask = data['exec-remote']

  logger do
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

    logger \verbose, cmd

    yield cont cmd

  yield from exec-finale data,logger,cont

  yield \done

  return

wait = (f,t) -> setTimeout f,t

diff = R.pipe do
  R.aperture 2
  R.map ([x,y]) -> y - x

sanatize_cmd = (cmd) ->

  if ((cmd.split '\n').length > 1) then return ('\n' + cmd)
  else then return cmd

main = (data,buildname,options) ->

  logger = print.create_logger buildname,options.verbose

  cont = create_continue options.dryRun,buildname

  l ""

  if (not data.remotehost) and data['exec-remote'].length

    logger do
      \warn
      lit [" ⛔    "," warn "],[c.er1,c.er1]
      " remotehost address not defined for task."

  is_watch = to_bool ((data.watch) and not (options.noWatch))

  logger do
    is_watch
    \ok
    "    watching "
    c.grey "[ working directory ] → #{process.cwd!}"

  logger do
    is_watch
    "> " + [(c.warn I) for I in data.watch].join (c.pink " | ")

  proc = create_proc data,logger,cont,options

  $file_watch =  most_create (add,end,error) ->

    if data.initialize

      add \init

    if ((data.watch) and not (options.noWatch))

      watcher = chokidar.watch data.watch,data.chokidar

      watcher.on \change,add

      !-> watcher.close!; end!

    else

      return void

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

    if status is \err then return most.just \done

    most.generate proc
    .recoverWith ([cmdtxt,buildname]) ->

      l lit do
        ["[#{metadata.name}]#{buildname}","[ ","⚡️","    error ","] ",(sanatize_cmd cmdtxt)]
        [c.er1,c.er2,c.er3,c.er2,c.er2,c.er1]

      most.just \done


  $proc.switchLatest!

disp = {}

disp.single = oxo

.ma do

  (data,signal) ->

    if (signal isnt \done) then return false

    if data.options.noWatch then return false

    if ((data.def.watch) is false) then return \only_config

    true

  (type,data,signal) ->

    switch type
    | \only_config =>

      l lit do
        ["[#{metadata.name}]"," .. only watching config file ","#{data.filename}"]
        [c.ok,c.warn,c.blue]

    | otherwise    =>

      l c.ok "[#{metadata.name}] .. returning to watch .."

.def!

disp.multiple = oxo

.ma do

  ([count,data],signal) ->

    if (signal isnt \done) then return false

    if (count isnt data.cmd.length) then return false

    if ((data.options.noWatch) is true) then return false

    ws = [data.user[I].watch for I in data.cmd]

    if ((R.sum ws) is 0) then return \only_config

    torna = R.zipWith do
      (cmd,ws) ->
        if ws then return cmd
        else return void
      data.cmd
      ws

    R.without [void],torna

  (torna,[count,data]) ->

    switch torna
    | \only_config =>

      l lit do
        ["[#{metadata.name}]"," .. only watching config file ","#{data.filename}"]
        [c.ok,c.warn,c.blue]

    | otherwise    =>

      txt = "[" + (torna.join "][") + "]"

      l lit do
        ["[#{metadata.name}]",txt," .. returning to watch .."]
        [c.ok,c.er1,c.ok]

    {seed:[1,data]}

.def ([count,data],signal) ->

  if signal is \done
    seed:[(count + 1), data]
  else
    seed:[count,data]

entry = oxo

.wh do

  (data) -> data.cmd.length is 0

  (data) ->

    $ = main do
      data.def
      ""
      data.options

    $fin = $

    $fin = $.tap (signal) -> disp.single data,signal

    $fin


.def (data) ->

  user = data.user

  allstreams = []

  for key in data.cmd

    $ = main do
      user[key]
      "[#{key}]"
      data.options

    allstreams.push $

  most.mergeArray allstreams
  .loop disp.multiple,[1,data]


module.exports = entry
