``#!/usr/bin/env node
``

{data,com,print} = require "./data"

global_data = data

#--------------------------------------------

{read-json,most,j,exec,chokidar,most_create,updateNotifier,fs,metadata,optionParser,tampax,readline} = com

{dotpat,spawn} = com

{l,z,zj,j,R,lit,c,wait,noop} = com.hoplon.utils


be = com.hoplon.types

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

parser.addOption \n,'no-watch',null,\no_watch

parser.addOption \s,'silent',null,\silent

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

      -w --watch-config-file     restart on config file change

      -c --config                path to YAML configuration file

      -l --list                  list all user commands

      -m --auto-make-directory   make remote directory if it doesn't exist

      -n --no-watch              force disable any and all watches

      -s --silent                do not show remotemon messages

      ---- shorthands ----

      CF <-- for configuration file

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

silent = parser.silent.count!

if not silent

  print.show-header!

if (parser.version.count! > 0)
  return

isvar = R.test /^\w+=/

vars = rest
|> R.filter isvar
|> R.map R.split '='

args = R.reject isvar,rest

#-------------[find file]-------------

search_for_default_config_file = (dirname) ->

  out = " ls -lAh #{dirname} | grep -v '^d' | awk 'NR>1 {print $NF}'"

  out
  |> exec
  |> R.split "\n"
  |> R.filter (str) -> str is ".#{metadata.name}.yaml"
  |> R.map (x) -> dirname + "/" + x

get_all_yaml_files = (custom) ->

  fin = []

  if (fs.existsSync custom)

    fin.push custom

  fin.push ...search_for_default_config_file process.cwd!

  upper-path = (R.init ((process.cwd!).split "/")).join "/"

  fin.push ...search_for_default_config_file upper-path

  fin

findfile = (filename) ->

  allfiles = get_all_yaml_files filename

  if (allfiles.length is 0)

    l lit do
      ["[#{metadata.name}]"," • Error •"," cannot find ANY configuration file."]
      [c.er3,c.er1,c.warn]

    return false

  filenames =  [(c.er1 I) for I in allfiles].join c.warn " > "

  if not silent

    l lit do
      ["[#{metadata.name}]"," using ",filenames]
      [c.er1,c.er1,c.er1]

  return allfiles

#-------------[looking for '.remotemon.yaml']---------------

user_config_file = parser.config.value!

all_files = findfile user_config_file

if not all_files then return void

if (parser.list.count! > 0)

  wcf = 0

else

  wcf = parser.watch_config_file.count!


info = {}

  ..cmdname               = args[0]
  ..cmdargs               = R.drop 1,args
  ..vars                  = vars
  ..all_files             = all_files
  ..cmd_filename          = null

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



# [handle vars parsing gets really messy, be careful ]

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

modify_yaml = (filename,cmdargs) ->

  data = filename |> fs.readFileSync |> R.toString

  tokens = yaml_tokenize data

  torna = vars.get tokens

  torna = vars.edit torna,cmdargs,tokens

  torna = R.flatten torna

  yaml_text = vars.stringify torna

  yaml_text


# modify_yaml = (filename,cmdargs)

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


# exec_list_option (alldata)

tampax_parse = (yaml_text,cmdargs,filename) ->

  (resolve,reject) <- nPromise

  (err,rawjson) <- tampax.yamlParseString yaml_text,[...cmdargs]

  if err

    print.failed_in_tampax_parsing filename,err

    resolve \error.validator.tampaxparsing

    return

  resolve [filename,rawjson]

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

defargs_main = be.undefnull.cont (...,state)-> [\arr,state.cmdargs.length,[]]

.alt be.arr.cont (arr,...,state) ->

  len = R.max arr.length,state.cmdargs.length

  [\arr,len,arr]

.alt be.str.cont (str,...,state) ->

  len = R.max 1,state.cmdargs.length

  [\arr,len,[str]]

.alt be.int.pos.cont (num,...,state) ->

  len = R.max num,state.cmdargs.length

  [\req,len,[]]

.err [\:defargs.type,'is not of type array / str / int.pos']

# ----------------------------------------

V.defargs = defargs_main

.cont (data,...,state) ->

  [__,len,list] = data

  data[2] = mergeArray len,data[2],state.cmdargs

  data

.and (impdefargs,...,info) ->

  [type,len,list] = impdefargs

  if (type is \req) and (len > list.length)

    return [false,[\:defargs.req,len]]

  true

.err (E,...,info) ->

  path = [\defargs]

  if info.cmdname

    path.unshift info.cmdname

  [type,msg] = E

  F = switch type
  | \:defargs.req  => print.defargs_req
  | \:defargs.type => print.basicError
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

V.maybe               = {}

V.maybe.bool          = be.bool.or unu

V.maybe.num           = be.num.or unu

V.maybe.str           = be.str.or unu

V.maybe.obj           = be.obj.or unu

V.maybe.arr           = be.arr.or unu

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


organize_rsync = (data,cmdname) ->

  {rsync,remotefold} = data

  if rsync is false then return data

  if (rsync is true)

    rsync = [(global_data.def.rsync.concat (des:remotefold))]

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

  data

# ------------------------------------------------------------------------

V.rsync.init = be.bool

.or be.undefnull.cont false

.or do

  be.arr.map be.arr

  .err (msg,key) ->

    switch key
    | undefined => [\:def,'not array']
    | otherwise => [\not_array_of_array,key]

.or do
  be.arr.cont (a) -> [a]

#----------------------------------------------------

V.user = be.obj

.or be.undefnull.cont -> {}

.and be.restricted global_data.selected_keys.arr

.alt do
  V.strlist.empty
  .cont (list) -> {'exec-locale':list}

.on \initialize               , V.maybe.bool

.on \watch                    , V.watch.user

.on \verbose                  , be.num.or unu

.on \ignore                   , V.ignore.user

.on \ssh                      , be.str.or unu

.on [\exec-remote,\exec-locale,\exec-finale] , V.execlist

.on \rsync                    , V.rsync.init

.on [\remotehost,\remotefold] , be.str.or unu.cont (v,key,...,origin) -> origin[key]

.cont organize_rsync

.and V.rsync.throw_if_error


#----------------------------------------------------

V.def = be.obj

.on [\remotehost,\remotefold]  , be.str.or unu

.on \verbose     , be.num.or unu.cont false

.on \initialize  , be.bool.or be.undefnull.cont true

.on \watch       , V.watch.def

.on \ignore      , V.ignore.def

.on \ssh         , be.str.or be.undefnull.cont global_data.def.ssh

.on [\exec-locale,\exec-finale,\exec-remote] , V.execlist

.on \rsync       , V.rsync.init

.cont organize_rsync

.and V.rsync.throw_if_error

.map (value,key,...,{def,user,origin}) ->

  switch global_data.selected_keys.set.has key

  | true  =>

    def[key] = value

  | false =>

    put = V.user.auth value,key,origin

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

  | \:ob_in_str_list       => print.ob_in_str_list     #

  | otherwise              =>

    [Error] = message

    print.basicError

  F Error,path,info.cmd_filename

  void

# ----------------------------------------

zero = (arr) -> (arr.length is 0)

check_if_empty = be.known.obj
.on \exec-locale,zero
.on \exec-finale,zero
.on \exec-remote,zero
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

  defargs = V.defargs.auth lconfig.defargs,info

  if defargs.error then return \error

  [...,args] = defargs.value

  [__,origin] = yield tampax_parse yaml_text,args,info.cmd_filename

  vout = V.def.auth do
    origin
    (def:{},user:{},origin:origin,info:info)

  if vout.error then return \error

  gconfig = vout.value

  [lconfig,log,buildname] = create_logger info,gconfig

  if info.options.watch_config_file

    lconfig.watch.unshift info.cmd_filename

  [lconfig,log,buildname]


init_continuation = (dryRun) -> (cmd,type = \async) ->*

  if dryRun

    status = 0

  else

    {status} = spawn cmd

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

  postscript = lconfig['exec-finale']

  log.normal do
    postscript.length
    \ok
    " exec-finale"
    c.warn "(#{postscript.length}) "

  for cmd in postscript

    log.verbose cmd

    yield from cont cmd

exec_rsync = (data,each) ->*

  {info,lconfig,log,cont} = data

  {remotehost,remotefold} = lconfig

  cmd = create_rsync_cmd each,remotehost

  disp = (each.src.join " ") + " ->" + " " + remotehost + ":" + each.des

  log.normal do
    true
    \ok
    lit [" rsync"," start"],[0,c.warn]
    c.grey disp

  log.verbose "rsync ... ",cmd

  status = yield from cont cmd,\sync

  if status isnt \ok

    log.normal do
      \err_light
      lit [" rsync"," break"],[c.pink,c.er2]
      ""

    yield nPromise (resolve,reject) -> reject status

  else

    log.normal do
      true
      \ok
      lit [" rsync ","✔️ ok"],[0,c.ok]
      ""


bko = be.known.obj

check_if_remote_needed = bko

.on \remotehost  , be.undef

.or bko.on \remotefold , be.undef

.and do

  bko.on \exec-remote , be.not zero
  .or do
    bko.on \rsync     , be.not V.isFalse

.cont true

.fix false

.wrap!

check_if_remotehost_present = (data) ->*

  {lconfig,log} = data

  tryToSSH = "ssh #{lconfig.ssh} #{lconfig.remotehost} 'ls'"

  try

    exec tryToSSH

  catch E

    log.normal do
      \err
      ""
      lit do
        ["unable to ssh to remote address ",lconfig.remotehost,"."]
        [c.er1,c.er2,c.er1]

    yield nPromise (resolve,reject) -> reject \error

    return


check_if_remotedir_present = (data) ->*

  {info,lconfig,log,cont} = data

  checkDir = "ssh #{lconfig.ssh} #{lconfig.remotehost} 'ls #{lconfig.remotefold}'"

  try

    exec checkDir

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
              " exec-remote"
              lit do
                ["cannot continue exec-remote without remotefolder ",lconfig.remotefold,"."]
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
        " exec-remote"
        lit [' ✔️ ok •'," #{lconfig.remotehost}:#{lconfig.remotefold} ", "created with ","#{msg}"," permissions."],[c.ok,c.warn,c.grey,c.ok,c.grey]


remote_main_proc = (data,remotetask) ->*

  {lconfig,log,cont,info} = data

  {remotehost,remotefold} = lconfig

  disp = lit [("(#{remotetask.length}) "),(remotehost + ":" + remotefold)],[c.warn,c.grey]

  log.normal do
    remotetask.length
    \ok
    " exec-remote"
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
      " ⚡️ ⚡️ error"
      c.er2 ".remotehost/.remotefold ( required for task ) not defined."

    yield \error

    return

  if (check_if_empty lconfig)

    log.normal do
      \err
      " ⚡️ ⚡️ error"
      c.er1 "empty execution, no user command to execute."

    yield \error

    return

  {remotehost,remotefold} = lconfig

  locale                  = lconfig['exec-locale']

  remotetask              = lconfig['exec-remote']

  log.normal do
    locale.length
    \ok
    " exec-locale"
    c.warn "(#{locale.length})"

  for cmd in locale

    log.verbose cmd

    yield from cont cmd

  if lconfig.rsync or (remotetask.length and (not info.options.dryRun))

    yield from check_if_remotehost_present data

  if lconfig.rsync

    for each in lconfig.rsync

      yield from exec_rsync data,each

  if remotetask.length and (not info.options.dryRun)

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
      " ⚡️ ⚡️ error"
      c.er1("infinite loop detected ") + (c.warn ob.value) + c.er1(" is offending file, ignoring event.")

    if (lconfig.watch.length > 0)

      log.normal do
        \ok
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

.cont ([cmdtxt],log)->

  log.normal do
    \err_light
    " ⚡️ ⚡️ error"
    cmdtxt

  \error

.alt be.str

.wrap!


print_final_message = (log,lconfig,info) -> (signal) !->

  signal = resolve_signal signal,log

  if (lconfig.watch.length is 0) or (info.options.no_watch > 0)

    lconfig.rl.close!

    return

  if info.options.watch_config_file

    msg = (c.pink "*CF") + (c.er2 " returning to watch")

  else

    msg = "returning to watch"

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
      "    watching"
      [(c.warn I) for I in disp].join " "

    log.normal do
      (should_I_watch and lconfig.ignore.length)
      \err_light
      "     ignored"
      [(c.warn I) for I in lconfig.ignore].join " "


  ms_file_watch = do

    (add,end,error) <- most_create

    if lconfig.initialize

      add null  # uncomment when done

      # add info.cmd_filename  # delete when done

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


  cont = init_continuation info.options.dryRun

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

  filename = info.cmd_filename

  try

    yaml_text = modify_yaml filename,info.vars

  catch E

    print.failed_in_custom_parser filename,E

    return

  fup = yield tampax_parse yaml_text,info.cmdargs,filename

  if (fup is \error.validator.tampaxparsing) then return

  [filename,gconfig] = fup

  if info.cmdname

    lconfig = gconfig[info.cmdname]

    defargs = lconfig.defargs

  else

    lconfig = gconfig

    defargs = gconfig.defargs

  vari = yield from update lconfig,yaml_text,info

  if (vari is \error) then return

  [lconfig,log] = vari

  ms_create_watch lconfig,info,log



get_all = (info) ->*

  raw = {}

  raw.unparsed = {}

  raw.parsed   = []

  for filename in info.all_files

    try

      yaml_text = modify_yaml filename,info.vars

      raw.unparsed[filename] = yaml_text

    catch E

      print.failed_in_custom_parser filename,E

      return

    fup = yield tampax_parse yaml_text,info.cmdargs,filename

    if (fup is \error.validator.tampaxparsing) then return

    raw.parsed.push fup

  if info.options.list

    exec_list_option raw.parsed

    return

  if info.cmdname

    if global_data.selected_keys.set.has info.cmdname

      print.in_selected_key info.cmdname,info.cmdline

      return

    found = false

    for [filename,gconfig] in raw.parsed

      if gconfig[info.cmdname]
        found = true
        info.cmd_filename = filename
        break

    if not found

      print.could_not_find_custom_cmd info.cmdname

      return

    lconfig = gconfig[info.cmdname]

  else

    [[filename,gconfig]]     = raw.parsed

    lconfig                  = gconfig

    info.cmd_filename        = filename

  vari = yield from update lconfig,raw.unparsed[info.cmd_filename],info

  if vari is \error then return

  [lconfig,log] = vari

  # ---------------------------------------------------------

  ms_create_watch lconfig,info,log

most.generate get_all,info

.drain!


