``#!/usr/bin/env node
``

{data,com,print} = require "./data"

global_data = data

#--------------------------------------------

{read-json,most,j,exec,chokidar,most_create,updateNotifier,fs,metadata,optionParser,tampax,readline} = com

{dotpat,spawn,yaml,yamlTypes} = com

{l,z,zj,j,R,lit,c,wait,noop} = com.hoplon.utils

be = com.hoplon.types

#--------------------------------------------

CONFIG_FILE_NAME = ".remotemon.yaml"

#--------------------------------------------

parser = new optionParser!

parser.addOption \h,'help',null,\help

parser.addOption \v,'verbose',null,\verbose

parser.addOption \V,'version',null,\version

parser.addOption \d,'dry-run',null,\dryRun

parser.addOption \w,'watch-config-file',null,\watch_config_file

parser.addOption \l,'list',null,\list

parser.addOption \m,'auto-make-directory',null,\auto_make_directory

parser.addOption \n,'no-watch',null,\no_watch

parser.addOption \s,'silent',null,\silent

#--------------------------------------------

parser.addOption \e,'edit',null,\edit

parser.addOption \p,'project',null,\project

.argument \PROJECT

#--------------------------------------------

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
    #{metadata.name} version #{metadata.version}

    options:

      -v --verbose               more detail

      -vv                        much more detail

      -h --help                  display help message

      -V --version               displays version number

      -d --dry-run               perform a trial run without making any changes

      -w --watch-config-file     restart on config file change

      -l --list                  list all user commands

      -m --auto-make-directory   make remote directory if it doesn't exist ( with user permission )

        -mm                      ( with root permission )

      -n --no-watch              force disable any and all watches

      -s --silent                do not show #{metadata.name} messages

      -e --edit                  make permanent edits to #{CONFIG_FILE_NAME} values

      -p --project               folder name to look for #{CONFIG_FILE_NAME}

      ---- shorthands ----

      CF <-- for configuration file

    values for internal variables (using .global object) can be changed using '=' (similar to makefiles) :

    > #{metadata.name} --verbose file=dist/main.js

    [ documentation ] @ [ #{metadata.homepage} ]

    """

  l str

  return

silent = parser.silent.count!

edit   = parser.edit.count!

if not (silent or edit)

  print.show-header!

if (parser.version.count! > 0)
  return

isvar = R.test /^[\.\w]+=/


vars = rest
|> R.filter isvar
|> R.map R.pipe do
  R.split '='
  R.over do
    R.lensIndex 0
    R.pipe do
      R.split "."
      (key) ->

        if key.length is 1

          name = key[0]

          if not global_data.selected_keys.set.has name

            key.unshift "global"

          return key

        key

args = R.reject isvar,rest

# args = ['hostapd.restart']

# vars = [ [ 'file', 'changelog.md' ] ]

#-------------[looking for '.remotemon.yaml']---------------

project_name = parser.project.value!

if not project_name

  project_name = process.cwd!
  |> R.split '/'
  |> R.last

config_file_name = "../" + project_name + "/" + CONFIG_FILE_NAME

if not (fs.existsSync config_file_name)

  l do
    c.er3 "[#{metadata.name}]"
    c.er3 "• Error •"
    c.er1 "project"
    c.warn project_name
    c.er1 "does not have a"
    c.warn CONFIG_FILE_NAME
    c.er1 "file."

  return


if (parser.list.count! > 0)

  wcf = 0

else

  wcf = parser.watch_config_file.count!


info = {}

  ..cmdname               = args[0]
  ..cmdargs               = R.drop 1,args
  ..vars                  = vars
  ..filename              = config_file_name

  ..timedata              = [0,0,0]

  ..cmdline               = R.drop 2,process.argv

  ..options     = {}
    ..verbose             = parser.verbose.count!
    ..dryRun              = parser.dryRun.count!
    ..watch_config_file   = wcf
    ..list                = parser.list.count!
    ..auto_make_directory = parser.auto_make_directory.count!
    ..no_watch            = parser.no_watch.count!
    ..silent              = silent
    ..edit                = edit
    ..project             = project_name


modyaml = (info) ->

  data = info.filename |> fs.readFileSync |> R.toString

  doc = yaml.parseDocument data

  vars = info.vars

  doc-items = doc.contents.items

  glob = R.find do
    R.pathEq [\key,\value],\global
    doc-items

  if not glob

    glob = new yamlTypes.Pair do
      ({value:"global",range:[0,6],type:"PLAIN"})
      new yamlTypes.YAMLMap!

    doc-items.unshift glob

  # z doc-items[0].value.items[1].value.items[1].value.items

  # z doc-items[0].value.items[1].value.items[1].value.value

  for [key,value] in vars

    toreach  = R.init key

    finalkey = R.last key

    current  = doc-items

    stop     = false

    for I in toreach

      next = R.find do
        R.pathEq [\key,\value],I
        current

      if next

        current = next.value.items

      else

        stop = true

        break

    if stop then continue

    innermost = R.find do
      R.pathEq [\key,\value],finalkey
      current

    if innermost

      if (innermost.value is null)

        innermost.value = new yamlTypes.Scalar value

      else

        tochange = innermost.value

        if tochange.value

          tochange.value = value

          if tochange.range

            tochange.range = [tochange.range[0],tochange.range[0] + value.length]

        else if tochange.items

          seq = new yamlTypes.YAMLSeq!

          innermost.value = seq

          seq.items = [(new yamlTypes.Scalar value)]

    else

      current.push do
        new yamlTypes.Pair do
          finalkey
          new yamlTypes.Scalar value


  yaml.stringify doc




nPromise = (f) -> new Promise f

rmdef = R.reject (x) -> global_data.selected_keys.set.has x

only_str = be.str.cont (str) -> " - " + str

.or be.arr.cont (arr) ->

  fin  = ""

  for I in arr

    fin += "\n    - " + I

  fin

.fix ""

.wrap!

function exec_list_option yjson,info


  l lit ['> FILE ',info.filename],[c.warn,c.pink]

  keys = Object.keys yjson

  user_ones = rmdef keys

  if user_ones.length is 0

    l lit ["  --- ","< EMPTY >"," ---"],[c.pink,c.warn,c.pink]

  for I from 0 til user_ones.length

    name = user_ones[I]

    des = only_str yjson[name].description

    l lit [" • ",name,des],[c.warn,c.ok,null]


# exec_list_option (alldata)

tampax_parse = (yaml_text,cmdargs,filename) ->

  (resolve,reject) <- nPromise

  (err,rawjson) <- tampax.yamlParseString yaml_text,[...cmdargs]

  if err

    print.failed_in_tampax_parsing filename,err

    resolve \error.validator.tampaxparsing

    return

  resolve rawjson

V = {}

V.check_config_file = be.known.obj

.on \cmd do
  be.str.and (cmd) -> not global_data.selected_keys.set.has cmd
  .or be.undef

.err (msg,path,state) ->

  [\:in_selected_key,[state.cmd,state.cmdline]]

.and (raw) ->

  if (raw.cmd isnt undefined) and (raw.origin[raw.cmd] is undefined)

    return [false,[\:usercmd_not_defined,raw.cmd]]

  true

# ----------------------------------------

mergeArray = (deflength,def,arr) ->

  [...,tail] = def

  if tail is Infinity

    len =  def.length - 1

    rest = arr.splice len,arr.length

    if rest.length > 0

      rest =  [rest.join " "]

    arr = [...arr,...rest]

    def[len] = ''


  fin = []

  for I from 0 til deflength

    if (arr[I] is undefined) and (def[I] is undefined)

      break

    else if (arr[I] is undefined)

      fin[I] = def[I]

    else

      fin[I] = arr[I]


  fin

# ----------------------------------------

defarg_main = be.undefnull.cont (...,state)-> [\arr,state.cmdargs.length,[]]

.alt be.arr.cont (arr,...,state) ->

  len = R.max arr.length,state.cmdargs.length

  [\arr,len,arr]

.alt be.str.cont (str,...,state) ->

  len = R.max 1,state.cmdargs.length

  [\arr,len,[str]]

.or do

  be (x) -> (x is Infinity)

  .cont (...,state) ->

    data = state.cmdargs.join " "

    [\arr,1,[data]]

.alt be.int.pos.cont (num,...,state) ->

  len = R.max num,state.cmdargs.length

  [\req,len,[]]

.err [\:defarg.type,'is not of type array / str / int.pos']

# ----------------------------------------

V.defarg = defarg_main

.cont (data,...,state) ->

  [__,len,list] = data

  data[2] = mergeArray len,data[2],state.cmdargs

  data

.and (impdefarg,...,info) ->

  [type,len,list] = impdefarg

  if (type is \req) and (len > list.length)

    return [false,[\:defarg.req,len]]

  true

.err (E,...,info) ->

  path = [\defarg]

  if info.cmdname

    path.unshift info.cmdname

  [type,msg] = E

  F = switch type
  | \:defarg.req   => print.defarg_req
  | \:defarg.type  => print.basicError
  | otherwise      => print.basicError

  F msg,path,info.cmd_filename

# ----------------------------------------

unu = be.undefnull.cont void

# ----------------------------------------

# recursive_str_list

V.rsl  = be.arr.cont R.flatten
.map do
  be.str
  .or do
    be.obj.and (obj) -> # Error Path

      keys = Object.keys obj

      switch keys.length

      | 0 => return [false,[\:ob_in_str_list,\empty_object]]

      | otherwise => return [false,[\:ob_in_str_list,\object]]

  .or unu
.alt be.str.cont (x) -> [x]
.err (all) ->

  [msg] = be.flatro all

  [type] = msg

  switch type
  | \:ob_in_str_list => return msg

  "not string or string list."

.cont R.without [void]

#--------------------------------------------------------------

V.strlist = (F) -> V.rsl.or be.undefnull.cont F

V.strlist.empty       = V.strlist -> []

V.strlist.dot         = V.strlist -> ["."]

V.strlist.false       = V.strlist false

#--------------------------------------------------------------

is_false = (x) ->

  if (x is false) then return true

  [false,'not false']

is_true = (x) ->

  if (x is true) then return true

  [false,'not true']

#--------------------------------------------------------------

V.isFalse = be is_false

V.isTrue = be is_true

#--------------------------------------------------------------

V.watch = {}

V.watch.main = V.rsl.or V.isFalse.cont -> []

#--------------------------------------------------------------

V.watch.def = V.watch.main

.or be.undefnull.cont ["."]

.or V.isTrue.cont ["."]

#--------------------------------------------------------------

V.watch.user = V.watch.main

.or unu

.or V.isTrue.cont void

#--------------------------------------------------------------

V.ignore = {}

V.ignore.def = V.rsl

.or be.undefnull.cont []

.or V.isFalse.cont -> []

#--------------------------------------------------------------

V.ignore.user = V.rsl.or unu

#--------------------------------------------------------------

V.execlist = V.strlist.empty.cont (strlist) ->

  fin = []

  for str in strlist

    nstr = str.replace /'/g,"'\''"

    fin.push nstr

  fin

# ----------------------------------------

V.str2arr = be.arr.map be.str

.or be.str.cont (str) -> [str]

.or be.undefnull.cont -> []

V.rsync = {}

V.rsync.throw_if_error = (data) ->

  rsync = data.rsync

  if (rsync is false) then return true

  if rsync.error

    [msg,index] = rsync.error

    tosend = [false,[\:rsync,msg],[\rsync,...index]]

    return tosend

  return true


# ----------------------------------------

rsync_arr2obj = (data,cmdname,remotefold) ->

  fin = {str:[],obnormal:[],obarr:{},des:null,src:[],error:false}

  error = []

  list = R.flatten data

  for I,index in list

    switch R.type I
    | \String =>

      if not (global_data.rsync.bool.has I)

        error.push [\duo,[I,"not a valid boolean rsync option."]],[index]

        fin.error = error

        return fin

      fin.str.push I

    | \Object   =>

      keys = Object.keys I

      switch keys.length
      | 0         =>

        error.push [\uno,["empty object without any attribute"]],[index]

        fin.error = error

        return fin

      | 1         => void

      | otherwise =>

        error.push [\uno,["object can only have singular attribute."]],[index]

        fin.error = error

        return fin

      k = keys[0]

      if not ((global_data.rsync.compound.has k) or (k in [\src,\des]))

        error.push [\duo,[k," not a valid compound rsync option."]],[index]

        fin.error = error

        return fin

      # ------------------------------------------------------------------------

      val = I[k]

      if k is \des

        if not (((R.type val)) is \String)

          error.push [\duo,[\des," has to be string type."]],[index]

          fin.error = error

          return fin

        if fin.des

          error.push [\duo,[\des," there can't be multiple remote folders as destination."]],[index]

          fin.error = error

          return fin

        fin.des = val

      else if (k is \src) or (global_data.rsync.filter.has k)

        ret = V.str2arr.auth val

        if ret.error

          error.push [\duo,[k,"can only be a list of string or just string."]],[index,...ret.path]

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

          error.push [\duo,[k,"can only be a string (or number)."]],[index]

          fin.error = error

          return fin

    | otherwise =>

      error.push [\uno,["not valid rsync option."]],[index]

      fin.error = error

      return fin

  fin.src = R.flatten fin.src

  if not fin.des

    fin.des = remotefold

  if (fin.src.length is 0)

    fin.src.push "."

  fin

ifrsh = ([key]) -> (key is \rsh)

organize_rsync = (data,cmdname,...,state) ->

  {rsync,remotefold} = data

  if rsync is false then return data

  if (rsync is true)

    add = [(des:remotefold)]

    rsync = [(global_data.def.rsync.concat add)]

  fin = []

  for I from 0 til rsync.length

    st = rsync_arr2obj rsync[I],cmdname,remotefold

    if st.error

      st.error[1].unshift I

      data.rsync = st

      return data

    else

      fin.push st

  data.rsync = fin

  for {obnormal} in data.rsync

    if not (R.find ifrsh,obnormal)

      if data.ssh
        ssh = [[\rsh,"ssh #{data.ssh}"]]
      else if state.origin.ssh
        ssh = [[\rsh,"ssh #{state.origin.ssh}"]]
      else
        ssh = []

      obnormal.push ...ssh

  data

# ------------------------------------------------------------------------

V.rsync.init = be.bool

.or be.undefnull.cont false

.or do

  be.arr.map be.arr

  .err (msg,key) ->

    switch key
    | undefined => [\:rsync_top,'not array']
    | otherwise => [\not_array_of_array,key]

.or do
  be.arr.cont (a) -> [a]

#----------------------------------------------------

V.user = be.obj

.or be.undefnull.cont -> {}

.and be.restricted global_data.selected_keys.arr

.alt do
  V.strlist.empty
  .cont (list) -> {'local':list}

.on [\initialize,\inpwd]      , be.bool.or unu

.on \watch                    , V.watch.user

.on \verbose                  , be.num.or unu

.on \ignore                   , V.ignore.user

.on [\remote,\local,\final]   , V.execlist

.on \rsync                    , V.rsync.init

.on [\remotehost,\remotefold] , be.str.or unu.cont (v,key,...,{origin}) -> origin[key]

.cont organize_rsync

.and V.rsync.throw_if_error

.on \ssh                      , be.str.or unu

#----------------------------------------------------

V.def = be.obj

.on [\remotehost,\remotefold]  , be.str.or unu

.on \inpwd       , be.bool.or be.undefnull.cont false

.on \verbose     , be.num.or unu.cont false

.on \initialize  , be.bool.or be.undefnull.cont true

.on \watch       , V.watch.def

.on \ignore      , V.ignore.def

.on [\local,\final,\remote] , V.execlist

.on \rsync       , V.rsync.init

.cont organize_rsync

.and V.rsync.throw_if_error

.on \ssh         , be.str.or be.undefnull.cont global_data.def.ssh

.map (value,key,...,state) ->

  {def,user} = state

  switch global_data.selected_keys.set.has key

  | true  =>

    def[key] = value

  | false =>

    put = V.user.auth value,key,state

    if put.continue

      user[key] = put.value

    else

      return [false,[put.message],put.path]

  true

.cont (...,{user,def}) ->

  for cmdname,value of user

    for I in data.selected_keys.undef

      if (value[I] is undefined)

        user[cmdname][I] = def[I]

      else

        user[cmdname][I] = value[I]

  {user,def}


.err (message,path,...,{info}) !->

  [topmsg] = be.flatro message

  [loc,Error] = topmsg


  F = switch loc

  | \:in_selected_key      => print.in_selected_key    # done checking

  | \:res                  => print.resError           # | not to rm |

  | \:rsync                => print.rsyncError         # mostly okay

  | \:ob_in_str_list       => print.ob_in_str_list

  | \:rsync_top            => print.basicError

  | otherwise              =>

    [Error] = message

    print.basicError

  F Error,path,info.cmd_filename

  void

# ----------------------------------------

zero = (arr) -> (arr.length is 0)

check_if_empty = be.known.obj
.on \local,zero
.on \final,zero
.on \remote,zero
.on \rsync,(be.arr.and zero).or V.isFalse
.cont true
.fix false
.wrap!

# ----------------------------------------

create_logger = (info,gconfig) ->

  cmdname = info.cmdname

  if (cmdname is undefined)

    lconfig = gconfig.def

    buildname = ""

  else

    lconfig = gconfig.user[cmdname]

    buildname = info.cmdname

  if lconfig.verbose

    verbose = lconfig.verbose

  else

    verbose = info.options.verbose

  log = print.create_logger buildname,verbose,info.options.silent

  [lconfig,log,buildname]

update = (lconfig,yaml_text,info)->*

  defarg = V.defarg.auth lconfig.defarg,info

  if defarg.error then return \error

  [...,args] = defarg.value

  origin = yield tampax_parse yaml_text,args,info.filename

  vout = V.def.auth do
    origin
    (def:{},user:{},origin:origin,info:info)

  if vout.error then return \error

  gconfig = vout.value

  [lconfig,log,buildname] = create_logger info,gconfig

  if info.options.watch_config_file

    lconfig.watch.unshift info.filename

  [lconfig,log,buildname]


init_continuation = (dryRun,dir,inpwd) -> (cmd,type = \async) ->*

  if dryRun

    status = 0

  else

    {status} = spawn cmd,dir,inpwd

  if (status isnt 0)

    switch type

    | \async => yield new Promise (resolve,reject) -> reject [cmd]

    | \sync  => return [cmd]

  return \ok

arrToStr = (arr) ->

  gap = switch arr.length
  | 0 => ""
  | 1 => " "
  | otherwise => " "

  (arr.join " ") + gap

create_rsync_cmd = (rsync,remotehost) ->

  txt = ""

  {str,obnormal,obarr,des,src} = rsync

  for I in str

    txt += "--" + I + " "

  for [key,val] in obnormal

    txt += "--#{key}='#{val}' "

  for key,val of obarr

    txt += "--#{key}={" + (["\'#{I}\'" for I in val].join ',') + "} "

  cmd = "rsync " + txt + (arrToStr src) + (remotehost + ":" + des)

  cmd

exec-finale = (data) ->*

  {info,lconfig,log,cont} = data

  postscript = lconfig['final']

  log.normal do
    postscript.length
    \ok
    " final"
    c.warn "#{postscript.length}"

  for cmd in postscript

    log.verbose cmd

    yield from cont cmd


exec_rsync = (data,each) ->*

  {info,lconfig,log,cont} = data

  {remotehost,remotefold} = lconfig

  cmd = create_rsync_cmd each,remotehost

  disp =  lit do
    [(remotehost + ":" + each.des),(c.warn " <- "),(each.src.join " , ")]
    [c.grey,c.warn,c.grey]

  log.normal do
    true
    \ok
    lit ["sync"," start"],[0,c.warn]
    c.grey disp

  log.verbose "rsync ... ",cmd

  status = yield from cont cmd,\sync

  if status isnt \ok

    log.normal do
      \err_light
      lit ["sync"," break"],[c.pink,c.er2]
      ""

    yield nPromise (resolve,reject) -> reject status

  else

    log.normal do
      true
      \ok
      lit ["sync ","✔️ ok"],[0,c.ok]
      ""

bko = be.known.obj

check_if_remote_needed = bko

.on \remotehost  , be.undef

.or bko.on \remotefold , be.undef

.and do

  bko.on \remote , be.not zero
  .or do
    bko.on \rsync     , be.not V.isFalse

.cont true

.fix false

.wrap!

check_if_remotehost_present = (data) ->*

  {lconfig,log,cont} = data

  tryToSSH = "ssh #{lconfig.ssh} #{lconfig.remotehost} 'ls'"

  try

    exec tryToSSH

  catch E

    log.normal do
      \err
      lit do
        ["unable to ssh to remote address ",lconfig.remotehost,"."]
        [c.er1,c.er2,c.er1]

    yield nPromise (resolve,reject) -> reject \error

  return


check_if_remotedir_present = (data) ->*

  {info,lconfig,log,cont} = data

  checkDir = "ssh #{lconfig.ssh} #{lconfig.remotehost} 'ls #{lconfig.remotefold}'"

  try

    exec checkDir,info.options.dryRun

  catch E

    if info.options.auto_make_directory

      switch info.options.auto_make_directory
      | 1         =>
        userinput = \y
      | otherwise =>
        userinput = \r

    else

      userinput = yield new Promise (resolve,reject) ->

        Q = lit do
          ["[#{metadata.name}]"," #{lconfig.remotefold}"," not on remote, create directory ","#{lconfig.remotehost}:#{lconfig.remotefold}"," ? [r (as root)|y (as user)|n] "]
          [c.ok,c.warn,c.grey,c.warn,c.grey]

        lconfig.rl.question Q,(input) !->

          switch input
          | \y,\Y     => resolve \y
          | \r,\R     => resolve \r
          | otherwise =>

            log.normal do
              \err
              "remote"
              lit do
                ["cannot continue remote without remotefolder ",lconfig.remotefold,"."]
                [c.er1,c.warn,c.er1,c.er1]

            reject \error

    if userinput

      [cmd,msg] = switch userinput
      | \y => ["mkdir","user"]
      | \r => ["sudo mkdir","root"]

      mkdir = "ssh #{lconfig.ssh} #{lconfig.remotehost} '#{cmd} #{lconfig.remotefold}'"

      yield from cont mkdir

      log.normal do
        \ok
        "remote"
        lit [' ✔️ ok •'," #{lconfig.remotehost}:#{lconfig.remotefold} ", "created with ","#{msg}"," permissions."],[c.ok,c.warn,c.grey,c.ok,c.grey]


remote_main_proc = (data,remotetask) ->*

  {lconfig,log,cont,info} = data

  {remotehost,remotefold} = lconfig

  disp = lit [("#{remotetask.length} "),"• ",(remotehost + ":" + remotefold)],[c.warn,c.ok,c.grey]

  log.normal do
    remotetask.length
    \ok
    "remote"
    disp

  for I in remotetask

    cmd = "ssh #{lconfig.ssh} " + remotehost + " '" + "cd #{remotefold};" + I + "'"

    log.verbose I,cmd

    yield from cont cmd

onchange = (data) ->*

  {info,lconfig,log,cont} = data

  if check_if_remote_needed lconfig

    log.normal do
      \err
      " ⚡️⚡️ error"
      c.er2 ".remotehost/.remotefold ( required for task ) not defined."

    yield \error

    return

  if (check_if_empty lconfig)

    log.normal do
      \err
      " ⚡️⚡️ error"
      c.er1 "empty execution, no user command to execute."

    yield \error

    return

  {remotehost,remotefold} = lconfig

  local                   = lconfig['local']

  remotetask              = lconfig['remote']

  log.normal do
    local.length
    \ok
    "local"
    c.warn "#{local.length}"

  for cmd in local

    log.verbose cmd

    yield from cont cmd

  if lconfig.rsync or (remotetask.length and (not info.options.dryRun))

    yield from check_if_remotehost_present data

  if lconfig.rsync

    for each in lconfig.rsync

      yield from exec_rsync data,each

  if remotetask.length

    if (not info.options.dryRun)

      yield from check_if_remotedir_present data

    yield from remote_main_proc data,remotetask

  yield from exec-finale data

  yield \done

  return


diff = R.pipe do
  R.aperture 2
  R.map ([x,y]) -> y - x

ms_empty = most.empty!

handle_inf = (log,lconfig) -> (db,ob) ->

  db.shift!

  time_bin_size = 500

  db.push Math.floor (ob.time/time_bin_size)

  [first,second] = diff db

  fin = {seed:db}

  if (first is second)

    fin.value = [\err,ob.value]

    log.normal do
      \err
      " ⚡️⚡️ error"
      c.er1("infinite loop detected ") + (c.warn ob.value) + c.er1(" is offending file, ignoring event.")

    if (lconfig.watch.length > 0)

      log.normal do
        \err
        " returing to watch "

    fin.value = ms_empty

  else

    fin.value = most.just ob.value

  fin


resolve_signal = be.arr

.on 0,
  be.str.fix '<< program screwed up >>'
  .cont (cmd) ->

    cmd = cmd.replace /'''/g,"'"

    if ((cmd.split '\n').length > 1) then return ('\n' + cmd)

    if (cmd.length > 45) then return ('\n' + cmd)

    else then return cmd

.cont ([cmdtxt],log,info)->

  l ""

  if info.options.verbose is 2
    log.normal \err_light,"exit 1",cmdtxt
  else
    log.normal \err_light,"exit 1"

  \error

.alt be.str

.wrap!


print_final_message = (log,lconfig,info) -> (signal) !->

  signal = resolve_signal signal,log,info

  if (lconfig.watch.length is 0) or (info.options.no_watch > 0)

    lconfig.rl.close!

    return

  if info.options.watch_config_file

    msg = (c.warn "returning to watch ") + (c.pink "*CF")

  else

    msg = c.warn "returning to watch"

  switch signal
  | \error =>
    log.normal \err,msg
  | \done  =>
    log.normal \ok,msg


ms_create_watch = (lconfig,info,log) ->

  should_I_watch = (lconfig.watch.length > 0) and (info.options.no_watch is 0)

  if should_I_watch

    disp = lconfig.watch

    if info.options.watch_config_file and (disp.length > 0)

      disp = R.drop 1,disp

      disp.unshift c.pink "CF"

    log.normal do
      should_I_watch
      \err_light
      "watch"
      [(c.warn I) for I in disp].join " "

    log.normal do
      (should_I_watch and lconfig.ignore.length)
      \err_light
      "ignore"
      [(c.warn I) for I in lconfig.ignore].join " "


  ms_file_watch = do

    (add,end,error) <- most_create

    if lconfig.initialize

      add null  # uncomment when done

      # add info.cmd_filename  # delete when done

    # rl = readline.createInterface {terminal:false}

    rl = readline.createInterface {input:process.stdin,output:process.stdout,terminal:false}

    rl.on \line,(input) !->

      process.stdout.write input

    lconfig.rl = rl

    #--------------------------------------------------------------------------------------

    if should_I_watch

      watcher = chokidar.watch do
        lconfig.watch
        *awaitWriteFinish:true
         ignored:lconfig.ignore
         ignorePermissionErrors:true

      watcher.on \change,add

      !->
        watcher.close!
        rl.close!
        lconfig.rl = void
        end!

  cont = init_continuation do
    info.options.dryRun
    info.options.project
    lconfig.inpwd

  ms = do

    ms_file_watch

    .timestamp!

    .loop (handle_inf log,lconfig),info.timedata

    .switchLatest!

    .takeWhile (filename) ->

      if (filename is info.cmd_filename) then return false

      true


    .continueWith (filename) ->

      most.generate restart,info,log,cont

      .drain!

      most.empty!


    .tap (filename) ->

      data = {info,lconfig,log,cont}

      most.generate onchange,data

      .recoverWith (x) -> most.just x

      .tap print_final_message log,lconfig,info

      .drain!

  ms.drain!

restart = (info,log)->*

  msg = lit do
    ["#{info.cmd_filename}"," changed, restarting watch"]
    [c.warn,c.er1]

  log.normal \err,msg

  {filename} = info

  try

    yaml_text = modyaml filename,info.vars

  catch E

    print.failed_in_mod_yaml filename,E

    return

  fup = yield tampax_parse yaml_text,info.cmdargs,filename

  if (fup is \error.validator.tampaxparsing) then return

  [filename,gconfig] = fup

  if info.cmdname

    lconfig = gconfig[info.cmdname]

    defarg  = lconfig.defarg

  else

    lconfig = gconfig

    defarg  = gconfig.defarg

  vari = yield from update lconfig,yaml_text,info

  if (vari is \error) then return

  [lconfig,log] = vari

  ms_create_watch lconfig,info,log

get_all = (info) ->*

  try

    yaml_text = modyaml info

    if info.options.edit

      fs.writeFileSync info.filename,yaml_text

      return

  catch E

    print.failed_in_mod_yaml filename,E

    return

  yjson = yield tampax_parse yaml_text,info.cmdargs,info.filename

  if (yjson is \error.validator.tampaxparsing) then return

  if info.options.list

    exec_list_option yjson,info

    return

  if info.cmdname

    if global_data.selected_keys.set.has info.cmdname

        print.in_selected_key info.cmdname,info.cmdline

        return

    found = yjson[info.cmdname]

    if not found

      print.could_not_find_custom_cmd info.cmdname

      return

    lconfig = yjson[info.cmdname]


  else

    lconfig = yjson

  vari = yield from update lconfig,yaml_text,info

  if vari is \error then return

  [lconfig,log] = vari

  # ---------------------------------------------------------

  ms_create_watch lconfig,info,log

most.generate get_all,info

.drain!
