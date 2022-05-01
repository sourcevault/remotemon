``#!/usr/bin/env node
``

{global_data,com,print} = require "./data"

#--------------------------------------------

{read-json,most,j,exec,chokidar,most_create,fs,metadata,optionParser,tampax,readline} = com

{dotpat,spawn,yaml,compare_version,boxen,emphasize,child_process} = com

{l,z,zj,j,R,lit,c,wait,noop} = com.hoplon.utils

be = com.hoplon.types

cp = child_process

homedir = (require \os).homedir!

#--------------------------------------------

CONFIG_FILE_NAME = ".remotemon.yaml"

#--------------------------------------------

cmd_data = new optionParser!

cmd_data.addOption \h,'help',null,\help

cmd_data.addOption \v,'verbose',null,\verbose

cmd_data.addOption \V,'version',null,\version

cmd_data.addOption \d,'dry-run',null,\dryRun

cmd_data.addOption \w,'watch-config-file',null,\watch_config_file

cmd_data.addOption \l,'list',null,\list

cmd_data.addOption \m,'auto-make-directory',null,\auto_make_directory

cmd_data.addOption \n,'no-watch',null,\no_watch

cmd_data.addOption \s,'silent',null,\silent

#--------------------------------------------

cmd_data.addOption \c,'cat',null,\cat

cmd_data.addOption \e,'edit',null,\edit

cmd_data.addOption \p,'project',null,\project

.argument \PROJECT

#--------------------------------------------

question_init =  ->

  rl = readline.createInterface {input:process.stdin,output:process.stdout,terminal:false}

  out = {}

  out.ask = (str) ->*

    yield new Promise ( resolve, reject ) ->

      rl.question str,(user) -> resolve user

  out.close = -> rl.close!

  out

if not (metadata.name) then return false

init = ->*

  config-dir-exists = fs.existsSync "#{homedir}/.config"

  cfolder = "#{homedir}/.config/config.remotemon.yaml"

  rm-config-file-exists = fs.existsSync cfolder

  if not config-dir-exists

    exec "mkdir #{homedir}/.config"

  if not rm-config-file-exists

    exec "cp ./src/config.remotemon.yaml #{homedir}/.config/"

  config_yaml_text = (fs.readFileSync "#{homedir}/.config/config.remotemon.yaml").toString!

  doc = yaml.parseDocument config_yaml_text

  service_dir = doc.getIn [\service_directory]

  # -------------------------------------------

  edit_config_file = false

  if not service_dir

    q = question_init!

    str = c.er1 "[#{metadata.name}] service directory path : "

    service_dir = yield from q.ask str

    if not ((R.last service_dir) in ["/","\\"])

      service_dir = service_dir + "/"

    doc.setIn [\service_directory],service_dir

    edit_config_file = true

    str1 = c.grey "service directory is set to " + c.warn service_dir

    str2 = (c.grey "can be changed anytime by editing ") + (c.warn "#{homedir}/.config/config.remotemon.yaml")

    l str1

    l str2

    q.close!

  else

    if not ((R.last service_dir) in ["/","\\"])

      service_dir = service_dir + "/"

      doc.setIn [\service_directory],service_dir

      edit_config_file = true

  lastchecktime = doc.getIn [\last_check_time]

  current_version_number = doc.getIn [\current_version_number]

  epoc  = (Date.now!)/1000

  time_in_seconds = 1*24*60*60 # check once a day

  re = /.*latest.*: (.*)/gm

  if lastchecktime is 0

    doc.setIn [\last_check_time],epoc

    edit_config_file = true

  if (((epoc - lastchecktime)) > time_in_seconds)

    raw = exec "npm view #{metadata.name}"

    ret = re.exec raw

    vn = ret[1]

    if (compare_version metadata.version,vn) is 1

      doc.setIn [\last_check_time],epoc

      edit_config_file = true

      do

        <- process.on \exit

        msg = do
          "update available " + (c.er2 vn) + c.ok (" ➝ " +  metadata.version) + "\n\n" +
           c.grey "> npm i -g remotemon \n" +
           c.grey "> yarn global add remotemon \n" +
           c.grey "> pnpm add -g remotemon"


        boxen.then (mo) ->

          boite = mo.default

          console.log boite do
            msg
            {padding: 1,borderColor:"green",textAlignment:"left"}

  corde = yaml.stringify doc

  if edit_config_file

    fs.writeFileSync cfolder,corde

  doc_as_json = doc.toJSON!

  yield doc_as_json

rest = cmd_data.parse!

if (cmd_data.help.count!) > 0

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

      -c --cat                   dump the output of the current #{CONFIG_FILE_NAME} being used

      -cc                        same as -c but with comments

      -ccc                       show raw json for final process state

      -l --list                  list all user commands

      -m --auto-make-directory   make remote directory if it doesn't exist ( with user permission )

         -mm                     ( with root permission )

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


silent = cmd_data.silent.count!

edit = cmd_data.edit.count!

concatenate = cmd_data.cat.count!

if (cmd_data.version.count! > 0)

  l c.er1 "[#{metadata.name}] version #{metadata.version}"

  return

isvar = R.test /^[\.\w\/]+=/

check_if_number = (str_data) ->

  isnum = Number str_data

  if not (isnum === NaN) then return isnum

  return str_data

vars = rest
|> R.filter isvar
|> R.map R.pipe do
  R.split '='
  R.over do
    R.lensIndex 0
    R.split "/"
  R.over do
    R.lensIndex 1
    check_if_number

args = R.reject isvar,rest

#----------------------------

# args = ['hostapd.restart']

# vars = [ [ 'file', 'changelog.md' ] ]

V = {}

#-------------[looking for '.remotemon.yaml']---------------

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

san_mappable = (str,type = \obj) ->

  try

    sortir = JSON.parse str

    switch R.type sortir
    | \Array, \Object => return sortir
    | otherwise =>
      switch type
      | \arr => return []
      | \obj => return {}

  catch

    switch type
    | \arr => return []
    | \obj => return {}



san_inpwd =  be.bool.fix false
.wrap!


rm_empty_lines =  R.pipe do

  do

    (str) <- R.filter

    if str.length is 0 then return false

    else return true

san_user_script = (lin) ->

  lin = rm_empty_lines lin

  todisp = R.join '\n' <| R.init lin

  toexit = R.last lin

  [todisp,toexit]

run_script = (str,inpwd,project,path) ->

  lines = str.split '\n'

  sp = (lines[0].split " ")

  interpreter = sp[sp.length - 1]

  lines.unshift!

  script = lines.join "\n"

  cmd = script.replace /"/g,'\\"'

  cwd = if inpwd then undefined else project

  stdin = "#{interpreter} <<<\"#{cmd}\""

  sortir = cp.spawnSync do
    stdin
    []
    {
      shell:'bash'
      windowsVerbatimArguments:true
      cwd:cwd
    }

  err_msg = sortir.stderr.toString!

  if (err_msg.length > 0)

    print.error_in_user_script err_msg,path

  user_lines = (sortir.stdout.toString!).split "\n"

  [to_disp,to_exit] = san_user_script user_lines

  process.stdout.write to_disp

  return to_exit

T = {}

T.yaml_map = do

  (gv) <- be.obj.and 

  props = Object.getOwnPropertyNames gv

  c = ['schema','items','range']

  not ((R.without props,c).length)

loop_yaml_map = (yaml_map,pwd,project) !->

  for {key,value} in yaml_map.items

    if ((T.yaml_map.auth value).continue)

      loop_yaml_map value,pwd,project

    else if ((typeof value.value) is \string)

      inner_value = value.value

      to_replace = run_script inner_value,pwd,project

      value.value = to_replace

gs_path = {}

  ..loop = null
  ..main = null


gs_path.loop = be.obj.alt be.arr

.forEach -> (gs_path.loop.auth ...arguments).continue

.or do

  be.str.and (str) ->

    lines = str.split '\n'

    if (lines.length > 1) and ((str[0] + str[1]) is "#!")

      return true

    false

  .tap (str,...,hist) ->

    path = []

    for I from 1 til (arguments.length - 1)

      path.unshift arguments[I]

    hist.push path


run_global_var_script = (yjson,doc,info) ->*

  cmdname = info.cmdname

  project = info.options.project

  inpwd = san_inpwd yjson.inpwd

  vpaths = gs_path.main yjson.var,[\var]

  apaths = gs_path.main yjson.defarg,[\defarg]

  apaths.push ...vpaths

  for path in apaths

    script = R.path path,yjson

    to_replace = run_script script,inpwd,project,path

    doc.setIn path,to_replace

  if cmdname

    if global_data.selected_keys.set.has cmdname

      print.in_selected_key cmdname,info.cmdline

      return \error

    found = yjson[cmdname]

    if not found

      print.could_not_find_custom_cmd cmdname

      return \error

    if found.inpwd

      inpwd = inpwd

    vpaths = gs_path.main do
      yjson[cmdname].var
      [cmdname,\var]

    apaths = gs_path.main do
      yjson[cmdname].defarg
      [cmdname,\defarg]

    apaths.push ...vpaths

    for path in apaths

      script = R.path path,yjson

      to_replace = run_script script,inpwd,project,path

      doc.setIn path,to_replace

  String doc

pathset_to_blank = (obj,path) ->

  ou = obj

  for I from 0 til ((path.length) - 1)

    ou = ou[path[I]]

  ou[path[path.length - 1]] = ''

  obj

make_script_blank = (obj) !->

  mpath = gs_path.main obj

  for path in mpath

    pathset_to_blank obj,path



gs_path.main = (obj,path = []) ->

  hist = []

  gs_path.loop.auth obj,hist

  sortir = []

  for I in hist

    sortir.push [...path,...I]

  sortir

get_path = (doc,path) ->

  doc.getIn path
  |> String 
  |> JSON.parse _,path
  |> gs_path.main _,path

update_doc = (info,doc) ->

  cmdname = info.cmdname

  path = {}
    ..G_var    = []
    ..G_defarg = []
    ..L_var    = []
    ..L_defarg = []

  if cmdname is undefined

    for [key,value] in info.vars

      if (key[0] is \var)

        key.unshift!

      doc.setIn [\var,...key],value

    v_path = [\var]

    d_path = [\defarg]

    path.L_var = get_path doc,v_path

    path.L_defarg = get_path doc,d_path

  else

    for [key,value] in info.vars

      if (key[0] is \var)

        init = []

      else

        init = [cmdname,'var']

      p = [...init,...key]

      doc.setIn p,value

    v_path = [cmdname,\var]

    d_path = [cmdname,\defarg]

    path.G_var = get_path doc,[\var]

    path.G_defarg = get_path doc,[\defarg]

    path.L_var = get_path doc,v_path

    path.L_defarg = get_path doc,d_path

  [v_path,d_path,path]

modyaml = (info) ->*

  configfile = info.configfile

  data = configfile |> fs.readFileSync |> R.toString

  doc = yaml.parseDocument data

  [v_path,d_path,a_path] = update_doc info,doc

  json = doc.toJS!

  defargdoc = R.view (R.lensPath d_path),json

  defarg = V.defarg.auth defargdoc,info

  if defarg.error then return [\error.defarg]

  arr = defarg.value[2]

  l_vars = R.view (R.lensPath v_path),json

  g_vars = R.view (R.lensPath [\var]),json

  merged = do
    R.mergeDeepLeft arr,l_vars
    |> R.mergeDeepLeft _,json

  make_script_blank merged

  project = info.options.project

  for path in a_path.L_defarg

    doc.getIn path
    |> tampax _,merged
    |> run_script _,inpwd,project,path
    |> doc.setIn path,_

  # z String doc
  


  # init_parse = yield tampax_parse do
  #   String doc
  #   merged
  #   configfile

  # zj merged

  # if (init_parse is \error.validator.tampaxparsing) then return [\error.validator.tampaxparsing]

  # final_yaml = yield from run_global_var_script init_parse,doc,info

  # z String doc.getIn v_path

  # z final_yaml

  # z String doc.getIn d_path



  # yield tampax_parse final_yaml,merged

  # z final_yaml



  # [(String doc),merged,doc]

  []

nPromise = (f) -> new Promise f

rmdef = R.reject (x) -> global_data.selected_keys.set.has x

# --- { only_str } for displaying list

only_str = be.str.cont (str) -> " - " + str

.or be.arr.cont (arr) ->

  fin  = ""

  for I in arr

    fin += "\n    - " + I

  fin

.fix ""

.wrap!

# exec_list_option (alldata)

function exec_list_option yjson,info

  l lit ['> FILE ',info.configfile],[c.warn,c.pink]

  keys = Object.keys yjson

  user_ones = rmdef keys

  if user_ones.length is 0

    l lit ["  --- ","< EMPTY >"," ---"],[c.pink,c.warn,c.pink]

  for I from 0 til user_ones.length

    name = user_ones[I]

    des = only_str yjson[name].description

    l lit [" • ",name,des],[c.warn,c.ok,null]

function exec_cat_option yaml_text,concat_count

  hash_first = RegExp '^#'

  pod <- emphasize.then

  lines = yaml_text.split "\n"

  interm = []

  switch concat_count

  | 1 =>

    for I in lines
      if not (hash_first.exec I) and (I.length isnt 0)
        interm.push I

  | 2 =>

    interm = lines

  text = interm.join '\n'

  (pod.emphasize.highlightAuto text).value


tampax_parse = (yaml_text,cmdargs,filename) ->

  (resolve,reject) <- nPromise

  (err,rawjson) <- tampax.yamlParseString yaml_text,cmdargs

  if err

    err = (err.split "\n")[0]

    print.failed_in_tampax_parsing filename,err

    resolve \error.validator.tampaxparsing

    return

  resolve rawjson

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

#----------------------------------------

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

V.strlist             = (F) -> V.rsl.or be.undefnull.cont F

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

  sortir = []

  for str in strlist

    nstr = str.replace /'/g,"'\''"

    sortir.push nstr

  sortir

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

    rsync = [(state.info.options.rsync.concat add)]

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
        ssh = [[\rsh,"ssh #{state.origin.ssh.option}"]]
      else
        ssh = []

      obnormal.push ...ssh


  data

# ---------------------------------------------------

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

#---------------------------------------------------

dangling_colon = (arr) ->

  sortir = ""

  re = /;\s*/

  for str in arr

    str = str.replace re,";"

    if not (str[(str.length - 1)] is ";")

      str = str + ";"

    sortir += str

  sortir

#---------------------------------------------------

V.ssh = be.obj

.on \option, be.str.or unu

.on \startwith, do
  be.arr.map be.str
  .or be.undefnull.cont -> []

.alt be.str.cont (str) -> (option:str,startwith:[])

.alt be.undefnull.cont -> (option:void,startwith:[])

#----------------------------------------------------

V.def_ssh = V.ssh

.cont (ob,...,state) ->

  {origin} = state

  if ob.startwith.length is 0

    ob.startwith.push "cd #{origin.remotefold}"

  if ob.option is void

    ob.option = state.info.options.ssh

  ob.startwith = dangling_colon ob.startwith

  ob

#----------------------------------------------------

V.user_ssh = V.ssh

#----------------------------------------------------

handle_ssh = (user,def) !->

  if (user.ssh.startwith.length is 0)

    user.ssh.startwith = def.ssh.startwith

  if not user.ssh.option

    user.ssh.option = def.ssh.option

#----------------------------------------------------

V.vars = be.obj.or be.undefnull.cont -> {}

.cont (ob,...,info)-> 

  R.mergeDeepLeft ob,info.origin.var

#----------------------------------------------------

V.user = be.obj

.err "custom user defined task, has to be object."

.or be.undefnull.cont -> {}

.and be.restricted global_data.selected_keys.arr

.err "key not recognized."

.alt do
  V.strlist.empty
  .cont (list) -> {'local':list}

.on [\initialize,\inpwd,\silent] , be.bool.or unu

.on \watch                       , V.watch.user

.on \verbose                     , be.num.or unu

.on \ignore                      , V.ignore.user

.on [\pre,\remote,\local,\final] , V.execlist

.on \rsync                       , V.rsync.init

.on [\remotehost,\remotefold]    , be.str.or unu.cont (v,key,...,{origin}) -> origin[key]

.cont organize_rsync

.and V.rsync.throw_if_error

.on \ssh                         , V.user_ssh

.on \var                         , V.vars

#----------------------------------------------------

V.def = be.obj

.on [\remotehost,\remotefold]    , be.str.or unu

.on [\inpwd,\silent]             , be.bool.or be.undefnull.cont false

.on \verbose                     , be.num.or be.undefnull.cont 0

.on \initialize                  , be.bool.or be.undefnull.cont true

.on \watch                       , V.watch.def

.on \var                         , be.obj.or be.undefnull.cont -> {}

.on \ignore                      , V.ignore.def

.on [\pre,\local,\final,\remote] , V.execlist

.on \rsync                       , V.rsync.init

.cont organize_rsync

.and V.rsync.throw_if_error

.on \ssh, V.def_ssh

.map (value,key,...,state) ->

  {def,user} = state

  switch global_data.selected_keys.set.has key

  | true  =>

    def[key] = value

  | false =>

    if (key.match "/")

      return [false,[\:incorrect-custom-name]]

    put = V.user.auth value,key,state

    if put.continue

      user[key] = put.value

    else

      return [false,[put.message],put.path]

  true


.cont (...,{user,def}) ->

  for cmdname,value of user

    handle_ssh value,def

    for I in global_data.selected_keys.undef

      if (value[I] is undefined)

        user[cmdname][I] = def[I]

      else

        user[cmdname][I] = value[I]

  {user,def}

.err (message,path,val,...,{info}) !->

  sortir = be.flatro message

  [topmsg] = sortir

  [loc,Error] = topmsg

  F = switch loc

  | \:in_selected_key        => print.in_selected_key    # done checking

  | \:res                    => print.resError           # | not to rm |

  | \:rsync                  => print.rsyncError         # mostly okay

  | \:ob_in_str_list         => print.ob_in_str_list

  | \:rsync_top              => print.basicError

  | \:incorrect-custom-name  => print.incorrect_custom

  | otherwise                =>

    Error = topmsg

    print.basicError

  F Error,path,info.configfile

  void

# ----------------------------------------

zero = (arr) -> (arr.length is 0)

check_if_empty = be.known.obj

.on [\pre,\local,\final,\remote],zero

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

  silent = lconfig.silent or info.options.silent

  log = print.create_logger buildname,verbose,silent

  [lconfig,log,buildname]

update = (lconfig,origin,info)->*

  vout = V.def.auth do
    origin
    (def:{},user:{},origin:origin,info:info)

  if vout.error then return \error

  gconfig = vout.value

  [lconfig,log,buildname] = create_logger info,gconfig

  if (info.options.concat is 3)

    do
      pod <- emphasize.then
      l (pod.emphasize.highlightAuto j lconfig).value

    return \disp

  if info.options.watch_config_file

    lconfig.watch.unshift info.configfile

  [lconfig,log,buildname]


init_continuation = (dryRun,dir,inpwd) -> (cmd,type = \async) ->*

  if dryRun

    status = 0

  else

    sortir = spawn cmd,dir,inpwd

    {status} = sortir


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

  tryToSSH = "ssh #{lconfig.ssh.option} #{lconfig.remotehost} 'ls'"

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

  checkDir = "ssh #{lconfig.ssh.option} #{lconfig.remotehost} 'ls #{lconfig.remotefold} 2>&1'"

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

      mkdir = "ssh #{lconfig.ssh.option} #{lconfig.remotehost} '#{cmd} #{lconfig.remotefold}'"

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

    cmd = "ssh #{lconfig.ssh.option} #{remotehost} '#{lconfig.ssh.startwith} #{I}'"

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

  local                   = lconfig.local

  remotetask              = lconfig.remote

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

  process.stdout.cursorTo 0

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


ms_create_watch = (lconfig,info,log) ->*

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

    if lconfig.inpwd

      cwd = undefined

    else

      cwd =  info.options.project

    if should_I_watch

      watcher = chokidar.watch do
        lconfig.watch
        *awaitWriteFinish:true
         ignored:lconfig.ignore
         ignorePermissionErrors:true
         cwd:cwd

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

  pre                   = lconfig.pre

  log.normal do
    pre.length
    \ok
    "pre"
    c.warn "#{pre.length}"

  for cmd in pre

    log.verbose cmd

    yield from cont cmd

  ms = do

    ms_file_watch

    .timestamp!

    .loop (handle_inf log,lconfig),info.timedata

    .switchLatest!

    .takeWhile (filename) ->

      if filename is CONFIG_FILE_NAME
        if info.options.watch_config_file
          return false

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

restart = (info,log) ->*

  msg = lit do
    ["#{info.configfile}"," changed, restarting watch"]
    [c.warn,c.er1]

  log.normal \err,msg

  try

    # [yaml_text,mods] = modyaml info

  catch E

    print.failed_in_mod_yaml filename,E

    return

  gconfig = yield tampax_parse yaml_text,mods,info.configfile

  if (gconfig is \error.validator.tampaxparsing) then return

  if info.cmdname

    lconfig = gconfig[info.cmdname]

  else

    lconfig = gconfig

  # vari = yield from update lconfig,yaml_text,info

  # if (vari in [\error,\disp]) then return

  # [lconfig,log] = vari

  # most.generate ms_create_watch,lconfig,info,log
  # .drain!

V.CONF = be.known.obj

.on \rsync,V.rsync.init

.on \ssh,V.ssh

.cont organize_rsync
.and V.rsync.throw_if_error
.err (message,path,...,info) ->

  [topmsg] = be.flatro message

  [loc,Error] = topmsg

  F = switch loc
  | \:rsync => print.rsyncError

  F Error,path,"~/.config/config.remotemon.yaml"

check_conf_file = (conf,info) ->

  D = {}

  D.rsync = conf.rsync

  D.ssh = conf.ssh

  D.remotefold = ''

  origin = {}
    ..ssh = conf.ssh

  sortir = V.CONF.auth D,info.cmdname,{origin,info}

  sortir.error

get_all = (info) ->*

  sortir = yield from modyaml info

  switch sortir[0]
  | \error.validator.tampaxparsing, \error.defarg =>
    return

  [yaml_text,mods,doc] = sortir

  if info.options.edit

    fs.writeFileSync info.configfile,yaml_text

    return

  return

  [yjson,lconfig] = sortir

  if info.options.list

    exec_list_option yjson,info

    return

  concat = info.options.concat

  if concat in [1,2]

    exec_cat_option yaml_text,concat

    return


  # vari = yield from update lconfig,yjson,info

  # if vari in [\error,\disp] then return

  # [lconfig,log] = vari

  # # ---------------------------------------------------------

  # log.dry \err,metadata.version

  # most.generate ms_create_watch,lconfig,info,log
  # .recoverWith (sig)->
  #   resolve_signal sig,log,info
  #   most.empty!
  # .drain!

main = (cmd_data) -> (CONF) ->

  project_name = cmd_data.project.value!

  if project_name

    service_directory = CONF.service_directory

    config_file_name = service_directory + project_name + "/" + CONFIG_FILE_NAME

    project_name = service_directory + project_name

  else

    config_file_name = "./" + CONFIG_FILE_NAME

    project_name = process.cwd!

  if not (fs.existsSync config_file_name)

    l do
      c.er3 "[#{metadata.name}]"
      c.er3 "• Error •"
      c.er1 "project/folder"
      c.warn project_name
      c.er1 "does not have a"
      c.warn CONFIG_FILE_NAME
      c.er1 "file."

    l do
      "\n   "
      c.er3 config_file_name
      'missing.'
      "\n"


    return

  if (cmd_data.list.count! > 0)

    wcf = 0

  else

    wcf = cmd_data.watch_config_file.count!

  info = {}

    ..cmdname               = args[0]
    ..cmdargs               = R.drop 1,args
    ..vars                  = vars
    ..configfile            = config_file_name
    ..timedata              = [0,0,0]
    ..cmdline               = R.drop 2,process.argv
    ..options     = {}
      ..verbose             = cmd_data.verbose.count!
      ..dryRun              = cmd_data.dryRun.count!
      ..watch_config_file   = wcf
      ..list                = cmd_data.list.count!
      ..auto_make_directory = cmd_data.auto_make_directory.count!
      ..no_watch            = cmd_data.no_watch.count!
      ..silent              = silent
      ..edit                = edit
      ..concat              = concatenate
      ..project             = project_name
      ..ssh                 = CONF.ssh
      ..rsync               = CONF.rsync

  if (check_conf_file CONF,info)
    return

  most.generate get_all,info
  .drain!


most.generate init
.tap main cmd_data
.recoverWith (E) -> l E.toString!;most.empty!
.drain!



