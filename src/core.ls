ext = require "./data"

{com,print,data,metadata} = ext

{l,z,j,R} = com.hoplon.utils

#----------------------------------------------------------

{read-json,exec,fs,tampax,most_create,most,metadata,c,lit,chokidar,spawn,readline} = com

{dotpat} = com

{zj,j,lit,c,R,noop} = com.hoplon.utils

be = com.hoplon.types

log = (x) -> l x

tlog = be.tap log

maybe = be.maybe

ME     = {}

rm     = {}

util   = {}

#----------------------------------------------------------

filter-for-config-file = R.pipe do
  R.split "\n"
  R.filter (str) -> (str is ".#{metadata.name}.yaml")

sdir = (dirname) ->

  out = " ls -lAh #{dirname} | grep -v '^d' | awk 'NR>1 {print $NF}'"
  |> exec
  |> R.split "\n"
  |> R.filter (str) -> str is ".#{metadata.name}.yaml"
  |> R.map (x) -> dirname + "/" + x

get_all_yaml_files = (custom) ->

  fin = []

  if (fs.existsSync custom)

    fin.push custom

  fin.push ...sdir process.cwd!

  upper-path = (R.init ((process.cwd!).split "/")).join "/"

  fin.push ...sdir upper-path

  fin

ME.findfile = (filename) ->

  allfiles = get_all_yaml_files filename

  if (allfiles.length is 0)

    l lit do
      ["[#{metadata.name}]","[Error]"," cannot find ANY configuration file."]
      [c.er3,c.er1,c.warn]

    return false

  filenames =  (c.er1 "{ ") + ([(c.warn I) for I in allfiles].join c.er1 " } { ") + (c.er1 " }")

  l lit do
    ["[#{metadata.name}]"," using ",filenames]
    [c.ok,null,null]

  return allfiles

# #----------------------------------------------------

ME.recursive_str_list = be.arr
.map do
  be.arr
  .and (arr) ->

    ret = ME.recursive_str_list.auth arr

    if ret.continue then return true

    return [false,ret.message,ret.path]

  .cont R.flatten
  .or do
    be.obj.and (obj) -> # Error Path

      keys = Object.keys obj

      switch keys.length

      | 0 => return [false,[\:ob_in_str_list,\empty_object]]

      | otherwise => return [false,[\:ob_in_str_list,\object]]

  .or be.str
  .or be.undefnull

.edit (list) ->

  out = []

  for I in list

    switch R.type I
    | \Undefined,\null => void
    | \Array =>
      out.push ...I
    | otherwise =>
      out.push I

  out

.alt be.str.cont (x) -> [x]

.err (msg) -> msg[0]

.err (msg) ->

  [type] = msg

  switch type
  | \:ob_in_str_list => return msg

  "not string or string list."

ME.strlist = (F) ->

  ME.recursive_str_list
  .or be.undefnull.cont F


ME.strlist.empty       = ME.strlist -> []

ME.strlist.dot         = ME.strlist -> ["."]

ME.strlist.false       = ME.strlist false

unu                    = be.undefnull.cont void

ME.maybe               = {}

ME.maybe.bool          = be.bool.or unu

ME.maybe.num           = be.num.or unu

ME.maybe.str           = be.str.or unu

ME.maybe.obj           = be.obj.or unu

ME.maybe.arr           = be.arr.or unu

#--------------------------------------------------------------

rm_all_undef           = (obj) -> JSON.parse JSON.stringify obj

#--------------------------------------------------------------

is_true = (x) ->

  if (x is true) then return true

  [false,'not true']

is_false = (x) ->

  if (x is false) then return true

  [false,'not false']


ME.rsync = {}

grouparr = R.pipe do
  R.unnest
  R.groupBy (v) -> v[0]
  R.map R.map (x) -> x[1]

ME.rsync.throw_if_error = (detail,key) ->

  if (not detail.error) then return true

  path = [key,detail.error[1]]

  [false,detail.error]


organize_rsync = (list,key,state) ->

  fin = {str:[],obnormal:[],obarr:{},des:[],src:[],error:false}

  error = []

  error.push \:rsync

  for I,index in list

    switch R.type I
    | \String =>

      if not (data.rsync.bool.has I)

        error.push [\duo,[I,"not a valid boolean rsync option."]],[...key,index]

        fin.error = error

        return fin

      fin.str.push I

    | \Object   =>

      keys = Object.keys I

      switch keys.length
      | 0         =>

        error.push [\uno,["empty object without any attribute"]],[...key,index]

        fin.error = error

        return fin

      | 1         => void

      | otherwise =>

        error.push [\uno,["object can only have singular attribute."]],[...key,index]

        fin.error = error

        return fin

      k = keys[0]

      if not ((data.rsync.compound.has k) or (k in [\src,\des]))

        error.push [\duo,[k," not a valid compound rsync option."]],[...key,index]

        fin.error = error

        return fin

      # ------------------------------------------------------------------------

      val = I[k]

      if k is \des

        if not (((R.type val)) is \String)

          error.push [\duo,[\des," has to be string type."]],[...key,index]

          fin.error = error

          return fin

        if fin.des.length is 1

          error.push [\duo,[\des," there can't be multiple remote folders as destination."]],[...key,index]

          fin.error = error

          return fin

        fin.des.push val

      else if (k is \src) or (data.rsync.filter.has k)

        ret = ME.rsync.strarr.auth val

        if ret.error

          error.push [\duo,[k,"can only be a list of string or just string."]],[...key,index]

          fin.error = error

          return fin

        if k is \src

          fin.src.push ret.value

        else

          if fin.obarr[k] is undefined

            fin.obarr[k] = []

          fin.obarr[k].push  ...ret.value

      else

        switch R.type val
        | \String,\Number  =>
          fin.obnormal.push [k,(val.replace /'/g,"'\\''")]
        | \Undefined,\Null => void
        | otherwise =>

          error.push [\duo,[k,"can only be a string (or number)."]],[...key,index]

          fin.error = error

          return fin

    | otherwise =>

      error.push [\uno,["not valid rsync option."]],[...key,index]

      fin.error = error

      return fin

  fin.src = R.flatten fin.src

  if (not fin.des[0])

    fin.des.push state.origin.remotefold

  if (fin.src.length is 0)

    fin.src.push "."

  fin


# ------------------------------------------------------------------------


ME.false = be is_false

karr = be.known.arr

ME.rsync.main = be is_true

.cont (...,state)->

  list = data.def.rsync.concat (des:state.origin.remotefold)

  organize_rsync (R.flatten list),[],state

.or ME.false

.or be.undefnull.cont false

.or do

  be.arr.map be.arr

  .err (msg,key) ->

    switch key
    | undefined => [\:def,'not array']
    | otherwise => [\not_array_of_array,key]

  .and do
    karr.map do
      karr
      .cont (arr,key,...,state) -> organize_rsync (R.flatten arr),[key],state
      .and ME.rsync.throw_if_error


.or do
  be.arr.cont (arr,...,state) -> [organize_rsync (R.flatten arr),[],state]

  .and ME.rsync.throw_if_error


.err (msg,path) ->

  filtered = be.flatro msg

  [[name,details,innerpath]] = filtered

  if name is \:rsync

    return message:[name,details],path:path.concat innerpath

  return message:[details]


#----------------------------------------------------

ME.rsync.strarr = be.arr.map be.str
.or be.str.cont (s) -> [s]
.or be.undefnull.cont []

#----------------------------------------------------

ME.execlist = ME.strlist.empty

.cont (strlist) -> [str.replace /'/g,"'\''" for str in strlist]

#----------------------------------------------------

ME.chokidar = be.obj
.on do
  data.chokidar.bools
  ME.maybe.bool
.on do
  [\ignored \cwd]
  ME.maybe.str
.on do
  \awaitWriteFinish
  ME.maybe.obj.on do
    [\stabilityThreshold \pollInterval]
    ME.maybe.num
  .or be.bool
.on do
  [\interval \binaryInterval \depth]
  ME.maybe.num

# ----------------------------------------

ME.watch = (undef,on_true) ->

  ME.recursive_str_list
  .or be.undefnull.cont undef
  .or is_false
  .or (be is_true).cont on_true
  .cont (data) ->
    if (data.length is 0) then return false
    data

# ----------------------------------------

ME.user = be.obj

.err [\:custom_build]

.or (be.undefnull.cont -> {}).err void

.and be.restricted data.selected_keys.arr

.alt do
  ME.strlist.empty
  .cont (list) -> {'exec-locale':list}

.on \initialize    , ME.maybe.bool

.on \watch         , ME.watch false,void

.on \verbose       , be.num.or unu

.on \ssh           , be.str.or unu

.on [\exec-remote,\exec-locale,\exec-finale],ME.execlist

.on \chokidar     , ME.chokidar.or unu

.on \rsync        , ME.rsync.main

# ----------------------------------------

ME.origin = be.obj.alt be.undefnull.cont -> {}

.on \remotehost  , be.str.or unu

.on \remotefold  , be.str.or unu.cont "~"

.on \verbose     , be.num.or unu.cont false

.on \initialize  , be.bool.or be.undefnull.cont true

.on \watch       , ME.watch ["."],["."]

.on \ssh         , do
  be.str.or be.undefnull.cont data.def.ssh

.on [\exec-locale,\exec-finale,\exec-remote],ME.execlist

.on \chokidar , ME.chokidar.or be.undefnull.cont data.def.chokidar

.and do

  be (data) -> if (data.remotehost) then return true else false

  .fix (data) ->

    data.rsync = false

    data

.on \rsync,ME.rsync.main

.map (value,key,__,state) ->

  switch data.selected_keys.set.has key

  | true  =>

    state.def[key] = value

  | false =>

    put = ME.user.auth value,key,state

    if put.continue

      state.user[key] = put.value

    else

      return [false,[put.message],put.path]

  true

# ----------------------------------------

mergeF = (a,b)->

  if (b is void) then return a

  b

ME.main = be.obj

.on \cmd do

  be.str.and (x) ->
    not data.selected_keys.set.has x
  .err (x,id,__,state) ->
    [\:in_selected_key,[state.cmd,state.commandline]]
  .or be.undef

.on \origin,ME.origin

.and (raw) ->

  if (raw.cmd isnt undefined) and (raw.user[raw.cmd] is undefined)

    return [false,[\:usercmd_not_defined,[raw.all_filenames,raw.cmd]]]

  true


# ----------------------------------------

.err be.flatro

.edit (__,state) ->

  {user,def} = state

  for cmdname,value of user

    for I in [\watch,\remotehost,\remotefold,\chokidar,\ssh,\initialize,\global,\verbose]

      if (value[I] is undefined)

        user[cmdname][I] = def[I]

      else

        user[cmdname][I] = value[I]

  state.origin = void

  state

# ------ [handle vars parsing gets really messy, be careful ] ------

vre = /(\s*#\s*){0,1}(\s*)(\S*):/

yaml_tokenize = (data) ->

  lines = data.split "\n"

  all = []

  for I in lines

    torna = vre.exec I

    if not (torna is null)

      [__,iscommeted,spaces,name] = torna

      asbool = (be.not.undef.auth iscommeted).continue

      all.push do
        {
          name:name
          iscommeted:asbool
          nodec:false
          txt:I
          space:spaces.length
        }

    else

      all.push do
        {
          nodec:true
          space:0
          txt:I
        }

  acc = []

  temp = []

  for I from 0 til all.length

    current = all[I]

    if (not (current.nodec) and (current.space is 0))

      if (I > 0)

        acc.push temp

      temp = [current]

    else

      temp.push current

  acc.push temp

  acc

vars = {}

vars.get = (tokens) ->

  index = null

  I = 0

  all = []

  while I < tokens.length

    current = tokens[I]

    if (current[0].name is \global)

      index = I

      K = 0

      while K < current.length

        edit = []

        do

          edit.push current[K]

          K += 1

        while (K < current.length) and (current[K].nodec)

        all.push edit

    I += 1

  [index,all]

isref = /\s*\w*:\s*(&\w+\s*){0,1}/

vars.edit = ([index,all],vars,tokens) ->

  for [name,txt] in vars

    for I from 1 til all.length

      current = all[I]

      if current[0].name is name

        firstline = current[0]

        isr = isref.exec firstline.txt

        old_txt = current[0].txt

        current[0].txt = isr[0] + txt

        all[I] = [current[0]]

  if index

    tokens[index] = R.flatten all

  tokens

vars.stringify = (tokens) ->

  str = ""

  for I in tokens

    str += I.txt + '\n'

  str

# --------------------------------------------------------------------

modify-yaml = (filename,cmdargs) ->

  data = filename |> fs.readFileSync |> R.toString

  tokens = yaml_tokenize data

  torna = vars.get tokens

  torna = vars.edit torna,cmdargs,tokens

  torna = R.flatten torna

  yaml_text = vars.stringify torna

  yaml_text

# --------------------------------------------------------------------

$tampax-parse = (filename,yaml_text,cmdargs) ->

  $ = do

    (add,end,error) <- most_create

    (err,raw-json) <- tampax.yamlParseString yaml_text,[...cmdargs]

    if err

      print.failed_in_tampax_parsing filename,err

      add \error.validator.tampaxparsing

      end!

    add [filename,raw-json]

    end!

  $

handle_error = ({message,path,value}) !->

  [topmsg] = message

  [loc,Error] = topmsg

  F = switch loc

  | \:in_selected_key      => print.in_selected_key      # done checking

  | \:req                  => print.reqError             # | not to rm |

  | \:res                  => print.resError             # | not to rm |

  | \:usercmd_not_defined  => print.could_not_find_custom_cmd

  | \:rsync                => print.rsyncError           # mostly okay

  | \:ob_in_str_list       => print.ob_in_str_list       #

  | \:custom_build         => print.custom_build

  | otherwise              =>

    [Error] = message

    print.basicError

  F Error,path,value.filename,message


rmdef = R.reject (x) -> data.selected_keys.set.has x

only_str = be.str.cont (str) -> " - " + str

.or be.arr.cont (arr) ->

  fin  = ""

  for I in arr

    fin += "\n    - " + I

  fin

.fix ""

.wrap!


exec_list_option = (alldata) ->

  for [filename,data] in R.reverse alldata

    l lit ['> FILE ',filename],[c.warn,c.pink]

    keys = Object.keys data

    user_ones = rmdef keys

    if user_ones.length is 0

      l lit ["  --- ","< EMPTY >"," ---"],[c.pink,c.warn,c.pink]

    for I from 0 til user_ones.length

      name = user_ones[I]

      des = only_str data[name].description

      l lit [" • ",name,des],[c.warn,c.ok,null]




main_all = (info) -> (alldata) ->

  for I in alldata

    if I in [\error.validator.tampaxparsing]
      return

  if info.options.list

    exec_list_option alldata

    return

  if info.cmdname

    for [filename,data] in alldata

      state =
        commandline   : info.commandline
        options       : info.options
        filename      : filename
        all_filenames : info.filenames
        cmd           : info.cmdname
        origin        : data
        def           : {}
        user          : {}

      torna = ME.main.auth state,state

      if torna.continue
        break
      else if ((torna.message[0][0]) isnt \:usercmd_not_defined)
        break

  else

    state =
      commandline : info.commandline
      options     : info.options
      filename    : alldata[0][0]
      cmd         : info.cmdname
      origin      : alldata[0][1]
      def         : {}
      user        : {}


    torna = ME.main.auth state,state

  if torna.error

    handle_error torna

    return

  info.filename = torna.value.filename

  init_config_file_watch torna.value,info


main_repeat = (info) -> (raw_data) ->

  if (raw_data is \error.validator.tampaxparsing)
    return most.just \error._._.open_only_config

  state =
    commandline   : info.commandline
    options       : info.options
    filename      : info.filename
    all_filenames : [info.filename]
    cmd           : info.cmdname
    origin        : raw_data[1]
    def           : {}
    user          : {}

  torna = ME.main.auth state,state

  if torna.error

    handle_error torna

    return most.just \error._._.open_only_config

  [configs,buildname,log] = create_logger torna.value

  core torna.value,info,log,configs,buildname


reparse_config_file = (info) -> ->

  filename = info.filename

  try

    yaml-text = modify-yaml filename,info.vars

  catch E

    print.failed_in_custom_parser filename,E

    return

  $parsed = $tampax-parse filename,yaml-text,info.cmdargs

  $parsed
  .map main_repeat info


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

prime_process = (data,options,log,cont,rl) -> ->*

  locale = data['exec-locale']

  log.normal do
    locale.length
    \ok
    " exec-locale "
    c.warn " (#{locale.length}) "


  for cmd in locale

    log.verbose cmd

    yield from cont cmd

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

      else

        log.normal do
          \ok
          lit [" rsync ","✔️ ok "],[0,c.ok]
          ""

  remotetask = data['exec-remote']

  if remotetask.length and (not options.dryRun)

    tryToSSH = "ssh #{data.ssh} #{data.remotehost} 'ls'"

    checkDir = "ssh #{data.ssh} #{data.remotehost} 'ls #{data.remotefold}'"

    mkdir = "ssh #{data.ssh} #{data.remotehost} 'sudo mkdir #{data.remotefold}'"

    try

      exec tryToSSH

    catch E

      l lit do
          ["[#{metadata.name}]"," unable to ssh to remote address ",data.remotehost,"."]
          [c.er2,c.warn,c.er3,c.grey]

      yield \error.core.unable_to_ssh

      return

    try

      exec checkDir

    catch E

      if (options.auto_make_directory)

        userinput = \y

      else

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

  disp = lit [(" (#{remotetask.length}) "),(data.remotehost + ":" + data.remotefold)],[c.warn,c.grey]

  log.normal do
    remotetask.length
    \ok
    " exec.remote "
    disp

  for I in remotetask

    cmd = "ssh #{data.ssh} " + data.remotehost + " '" + "cd #{data.remotefold};" + I + "'"

    log.verbose I,cmd

    yield from cont cmd

  yield from exec-finale data,log,cont

  yield \done.core.exit

  return

# ---------

improve_signal = (signal,config,log,rl,opts) ->

  all_watches_are_closed = not (config.watch or opts.watch_config_file)

  if not config.watch

    rl.close!

  if all_watches_are_closed

    return most.throwError signal + ".closed"

  if ((opts.watch_config_file) and not config.watch)

    en = ".open_only_config"

  else

    en = '.open'


  most.just signal + en

$empty = most.empty!

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
.cont improve_signal

.fix $empty
.wrap!

# ---------


print_final_message = (log) -> (signal) ->

  [status,type,which,watch] = dotpat signal

  switch watch
  | \open             =>
    msg = "returning to watch"
  | \open_only_config =>
    msg = "watching only config file"
  | \closed           => return $empty

  switch status
  | \error =>
    log.normal \err,msg
  | \done  =>
    log.normal \ok,msg

  $empty


diff = R.pipe do
  R.aperture 2
  R.map ([x,y]) -> y - x

init_user_watch = (data,options,log,handle_cmd,rl) ->

  log.normal do
    data.watch
    \ok
    c.ok "  ↓ watching "
    c.grey " { working directory } → #{process.cwd!}"
    " " + [(c.blue I) for I in data.watch].join (c.pink " | ")

  $init_file_watch =  most_create (add,end,error) ->

    if data.initialize

      add \init

    if data.watch
      watcher = chokidar.watch data.watch,data.chokidar

      watcher.on \change,add

      !->
        watcher.close!
        end!


  exec_all_user_cmds = prime_process data,options,log,handle_cmd,rl

  $file_watch = $init_file_watch
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

    most.generate exec_all_user_cmds


  $file_watch.switchLatest!

  .recoverWith (signal) -> most.just signal

  .chain (signal)-> resolve_signal signal,data,log,rl,options


init_continuation = (buildname,dryRun) -> (cmd,type = \async) ->*

  if dryRun

    status = 0

  else

    {status} = spawn cmd

  if (status isnt 0)

    switch type
    | \async => yield new Promise (resolve,reject) -> reject [cmd,buildname]
    | \sync  => return [cmd,buildname]

  return \ok

zero = (arr) -> (arr.length is 0)

check_if_empty = be.known.obj
.on \exec-locale,zero
.on \exec-finale,zero
.on \exec-remote,zero
.on \rsync,(be.arr.and zero).or ME.false
.cont true
.fix false
.wrap!

create_logger = (data) ->

  if (data.cmd is undefined)

    buildname = ""

    configs = data.def

  else

    buildname = c.warn "[#{data.cmd}]"

    configs = data.user[data.cmd]

  if configs.verbose

    verbose = configs.verbose

  else

    verbose = data.options.verbose

  log = print.create_logger buildname,verbose

  [configs,buildname,log]

core = (data,info,log,configs,buildname) ->

  if ((not configs.remotehost) and (configs['exec-remote'].length))

    log.normal do
      \warn
      c.er2 " ⚡️     error "
      c.er1 " remotehost address not defined for task."

    return

  if (check_if_empty configs and not info.options.watch_config_file)

    l lit do
        ["[#{metadata.name}]"," no user command to execute."]
        [c.warn,c.er1]

    return

  handle_cmd = init_continuation buildname,data.options.dryRun

  rl = readline.createInterface {input:process.stdin,output:process.stdout,terminal:false}

  rl.on \line,(input) !-> process.stdout.write input

  init_user_watch configs,data.options,log,handle_cmd,rl

init_config_file_watch = (data,info) ->

  $config_watch = do

    most_create (add,end,error) ->

      if data.options.watch_config_file

        watcher = (chokidar.watch data.filename,{awaitWriteFinish:true})

        watcher.on \change,add

        setTimeout add,0

        return -> watcher.close!;end!

      else

        setTimeout add,0

  [configs,buildname,log] = create_logger data

  pfm = print_final_message log

  rest = $config_watch.skip 1

  .tap !->

    msg = lit do
      ["configuration file ","#{data.filename}"," itself has changed, restarting watch"]
      [c.ok,c.warn,c.ok]

    log.normal \ok,msg

  .chain reparse_config_file info


  init = $config_watch.take 1

  .map ->

    out = core data,info,log,configs,buildname

    out

  most.mergeArray [init,rest]
  .switchLatest!
  .tap pfm
  .recoverWith pfm
  .drain!


entry = (info) -> # validator

  $all = []

  for I in info.filenames

    try

      yaml-text = modify-yaml I,info.vars

    catch E

      print.failed_in_custom_parser I,E

      return

    $all.push $tampax-parse I,yaml-text,info.cmdargs

  #--------------------------------------------------

  parsed = most.mergeArray $all
  .recoverWith (x) -> most.just x
  .reduce do
    (accum,data) -> (accum.push data); accum
    []

  parsed
  .then main_all info



module.exports =
  *validator:entry
   findfile:ME.findfile
   ext:ext

# --------------------------------

