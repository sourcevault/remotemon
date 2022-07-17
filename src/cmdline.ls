``#!/usr/bin/env node
``

{global_data,com,print} = require "./data"

#--------------------------------------------

{read-json,most,exec,chokidar,most_create} = com

{fs,metadata,optionParser,tampax,readline} = com

{emphasize,child_process,rm_empty_lines,path} = com

{dotpat,spawn,yaml,compare_version,boxen,moment} = com

{l,z,zj,j,R,lit,c,wait,noop,jspc} = com.hoplon.utils

be = com.hoplon.types

guard = com.hoplon.guard

cp = child_process

os = require \os

homedir = os.homedir!

release = os.release!

re = /Microsoft/g

if (release.match re)

  isWSL = true

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

cmd_data.addOption \r,'resume',null,\resume

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

    yield new Promise (resolve, reject) ->

      rl.question str,(user) -> resolve user

  out.close = -> rl.close!

  out

if not (metadata.name) then return false

try
  rest = cmd_data.parse!
catch E
  print.optionParser (R.drop 2,process.argv)
  return

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

      -ll                        show history of all commands called

      -m --auto-make-directory   make remote directory if it doesn't exist ( with user permission )

         -mm                     ( with root permission )

      -n --no-watch              force disable any and all watches

      -s --silent                do not show #{metadata.name} messages

      -e --edit                  make permanent edits to #{CONFIG_FILE_NAME} values

      -p --project               folder name to look for #{CONFIG_FILE_NAME}

      -r --resume                resume from failpoint if remotemon can pattern match command with older build failure

      ---- shorthands ----

      CF <-- for configuration file

    values for internal variables (using .var object) can be changed using '=' (similar to makefiles) :

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

#----------------------------

init = ->*

  CONFIG_DIR = "#{homedir}/.config"

  REMOTEMON_DIR = CONFIG_DIR + "/remotemon/"

  CONFIG_FILE = REMOTEMON_DIR + "config.remotemon.yaml"

  DEF_CONFIG_FILE = path.resolve (__dirname + '/../config.remotemon.yaml')

  z DEF_CONFIG_FILE

  HIST_FILE = REMOTEMON_DIR + "hist.json"

  DEF_HIST_FILE = path.resolve (__dirname + '/../hist.json')

  if not fs.existsSync CONFIG_DIR

    exec "mkdir " + CONFIG_DIR

  if not fs.existsSync REMOTEMON_DIR

    exec "mkdir " + REMOTEMON_DIR

  if not fs.existsSync CONFIG_FILE

    exec "cp " + DEF_CONFIG_FILE + " " + REMOTEMON_DIR

  if not fs.existsSync HIST_FILE

    exec "cp " + DEF_HIST_FILE + " " + REMOTEMON_DIR

  config_yaml_text = CONFIG_FILE
  |> fs.readFileSync
  |> R.toString

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

    str2 = (c.grey "can be changed anytime by editing ") + (c.warn CONFIG_FILE)

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

    if (compare_version vn,metadata.version) is 1

      doc.setIn [\last_check_time],epoc

      edit_config_file = true

      do

        <- process.on \exit

        msg = do
          "update available " + (c.er2 metadata.version) + c.ok (" ➝ " +  vn) + "\n\n" +
           c.grey "> sudo npm i -g remotemon \n" +
           c.grey "> sudo yarn global add remotemon \n" +
           c.grey "> sudo pnpm add -g remotemon"

        boxen.then (mo) ->

          boite = mo.default

          console.log boite do
            msg
            {padding: 1,borderColor:"green",textAlignment:"left"}

  corde = yaml.stringify doc

  if edit_config_file

    do

      <- wait 0

      (err) <- fs.writeFile CONFIG_FILE,corde

      c.er1 err

  user_doc = doc.toJSON!

  prog_doc = DEF_CONFIG_FILE
  |> fs.readFileSync
  |> R.toString
  |> yaml.parse

  fin_doc = R.mergeLeft user_doc,prog_doc

  fin_doc.HIST_FILE = HIST_FILE

  yield fin_doc


#----------------------------

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

  [type,msg] = E

  switch type
  | \:defarg.req   =>

    print.defarg_req do
      msg
      info.cmdname + " "

  | \:defarg.type  => fallthrough
  | otherwise      =>

    path = [...[info.cmdname],\defarg]

    print.basicError msg,path,info.configfile

# ----------------------------------------

san_inpwd =  (l,g) ->

  switch R.type l
  | \Boolean => return l
  | otherwise =>
    switch R.type g
    | \Boolean => return g
    | otherwise => return false

san_obj = be.obj.fix -> {}
.wrap!

san_arr = be.arr.fix -> []

san_user_script = (lin) ->

  lin = rm_empty_lines lin

  todisp = R.join '\n' <| R.init lin

  toexit = R.last lin

  [todisp,toexit]

run_script = (str,inpwd,project,path) ->

  lines = str.split '\n'

  sp = (lines[0].split " ")

  interpreter = sp[sp.length - 1]

  lines.shift!

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

    throw SERR

  user_lines = (sortir.stdout.toString!).split "\n"

  [to_disp,to_exit] = san_user_script user_lines

  if not (to_disp is '')

    console.log to_disp
    # process.stdout.write to_disp

  return to_exit

gs_path = {}

  ..js = {}
    ..loop = null
    ..main = null
  ..yl = {}
    ..loop = null
    ..main = null

  ..loop = null
  ..main = null
  ..yaml = null
  ..shebang = /!#|#!/
  ..tampax = /\{{.*}}/
  ..linebreak = /\n/

get_str_type = (str) ->

  has_shebang = str.match gs_path.shebang
  has_expansion = str.match gs_path.tampax
  has_linebreak = str.match gs_path.linebreak

  is_script = false

  is_tampax = false

  if has_shebang and has_linebreak

    is_script = true

  if has_expansion

    is_tampax = true

  [is_script,is_tampax]

handle_path_dot = {}

handle_path_dot.save = be.str

.tap do

  (index,path,hist) ->

    if (index.match "\\.")

      hist.dotpath.push [...path,index]

.alt be.num

.cont (index,path) ->

  path.concat index

.wrap!

handle_path_dot.save_matrix = (path,y-index,hist) ->

  for each,x-index in path

    if (R.type each) is \String

      if each.match "\\."

        hist.dotmatrix.push [y-index,x-index]

symbol_script = Symbol 'is_script'

gs_path.js.loop = (unknown,path,ref)->

  w = R.type unknown

  if (w is \Object)

    for index,value of unknown

      npath = handle_path_dot.save index,path,ref

      gs_path.js.loop value,npath,ref

  else if (w is \Array)

    for value,index in unknown

      npath = handle_path_dot.save index,path,ref

      gs_path.js.loop value,npath,ref

  else

    spath = path.join "."

    if (not (global_data.selected_keys.set.has path[0])) and not (path[0] is ref.cmdname)
      return

    if (path[0] is \defarg) or (path[1] is \defarg)
      return

    ref.all[spath] = unknown

    handle_path_dot.save_matrix do
      path
      ref.pall.length
      ref

    ref.pall.push path

    if (w is \String)

      [is_script,is_tampax] = get_str_type unknown

      if is_script

        ref.script_all.push spath

        ref.script[spath] = path

        unknown = symbol_script

      if is_tampax

        ref.tampax[spath] = void

        ref.tampax_all.push path

    if (path[0] is \var)

      ref.glovar[((R.drop 1,path).join ".")] = unknown

    if (path[1] is \var)

      [cmdname] = path

      index_name = R.drop 2,path |> R.join "."

      ref.cmdvar[index_name] = unknown


gs_path.yl.loop  = be do

  (obj) ->

    a = yaml.isMap obj.value

    a

.tap (obj,type,path,ref) ->

  items = obj.value.items

  for each in items

    p = [...path,each.key.value]

    gs_path.yl.loop.auth each,\map,p,ref

.or do

  be do

    (obj) ->

      b = yaml.isSeq obj.value

      b

  .tap (obj,type,path,ref) ->

    items = obj.value.items

    for each,index in items

      p = [...path,index]

      gs_path.yl.loop.auth each,\seq,p,ref

.or do

  be.tap (obj,type,path,ref) ->

      switch type
      | \map =>
        if (yaml.isAlias obj.value)
          sortir = {alias:obj.value.source,path:path}
          ref.alias.push sortir
        if (obj.value.anchor)
          ref.anchor[obj.value.anchor] = (path.join '.')
      | \seq =>
        if (obj.anchor)
          ref.anchor[obj.anchor] = (path.join '.')

gs_path.js.main = (obj,cmdname) ->

  hist = {}
    ..script_all  = []
    ..tampax      = {}
    ..tampax_all  = []
    ..dotpath     = []
    ..dotmatrix   = []
    ..all         = {}
    ..pall        = []
    ..glovar      = {}
    ..cmdvar      = {}
    ..script      = {}
    ..cmdname     = cmdname

  gs_path.js.loop obj,[],hist

  hist


gs_path.yl.main = (obj) ->

  hist = {}
    ..alias = []
    ..anchor = {}

  ym = obj.contents

  input = {}

  input.value = obj.contents

  gs_path.yl.loop.auth input,\map,[],hist

  hist

gs_path.yl.find_cmd_name = (contents) ->

  all_top_values = []

  for each in contents.items
    all_top_values.push each.key.value

  only_cmds = R.difference all_top_values,global_data.selected_keys.arr

  only_cmds

rm_merge_key = (data) ->

  clean = []

  for each in data.alias

    {path} = each

    if ((R.last path) is '<<') then continue

    if (path[0] is \var) then continue

    if (path[1] is \var) then continue

    clean.push each

  sortir = {}

  for {alias,path} in clean

    p = path.join '.'

    sortir[p] = alias

  sortir

san_defarg = (js,info) -> (path) ->

  defarg  = do
    (san_arr.auth R.path path,js).value
    |> V.defarg.auth _,info

  if defarg.error then throw SERR

  arr = defarg.value[2]

  return arr

update_defarg = (defarg,type) !->

  for str,index in defarg[type]

    if (R.type str) isnt \String
      continue

    [is_script,is_tampax] = get_str_type str

    if is_script

      defarg.script_all.push do
        type + '.' + index

      defarg.script.add type + "." + index

    if is_tampax

      # defarg.tampax[type + "." + index] = void

      defarg.tampax_all.push [type,index]

yaml_parse = (doc,info) ->

  try

    doc.setSchema '1.1'

    js = doc.toJS!

    return js

  catch E

    print.yaml_parse_fail do
      (String E)
      info

    throw SERR

re_curly = /\{{([\w\.]*)}}/gm

get_curly = (str) ->

  found = true

  sortir = []

  while found

    found = re_curly.exec str

    if found
      sortir.push found[1]

  sortir

tampax_abs = {}

clear = {}

merge_ref_defarg = (defarg,ref) ->

  ref.project = defarg.project

  ref.localpwd = defarg.localpwd

  ref.globalpwd = defarg.globalpwd

  nset = new Set [...ref.script,...defarg.script]

  ref.script = nset

  n_script_all = [...defarg.script_all,...ref.script_all]

  ref.script_all = n_script_all

  for index,value of defarg.tampax

    ref.tampax[index] = value

  for str,index in defarg.defarg

    ref.all[('defarg.' + index)] = str

    path = ['defarg',index]

    ref.pall.push path

  p = ref.cmdname + \.defarg

  for str,index in defarg[p]

    ref.all[p + '.' + index] = str

    path = [ref.cmdname,\defarg,index]

    handle_path_dot.save_matrix path,ref.pall.length,ref

    ref.pall.push path


clear.tampax = (name,ref,path) ->

  expansions = ref.tampax[name]

  str = ref.all[name]

  for each in expansions

    has_tampax = Boolean ref.tampax[each]

    is_script = ref.script[each]

    exists = ref.all[each]

    if is_script

      save = "[#{each}:script]"

    else if has_tampax

      if not path.has each

        istr = clear.tampax do
          each
          ref
          new Set [...path,each]

      else

        istr = "[#{each}:loop]"

      save = istr

    else if exists

      save = exists

    else

      save = "[#{each}:void]"

    str = str.replace "{{#{each}}}",save

  str

clear.tampax_fin = (name,ref,path) !->

  expansion = ref.tampax[name]

  str = ref.all[name]

  for each in expansion

    has_tampax = Boolean ref.tampax[each]

    exists = ref.all[each]

    if has_tampax

      if not path.has each

        save = clear.tampax do
          each
          ref
          new Set [...path,each]

      else

        save = "[#{each}:loop]"

    else if exists

      save = exists

    else

      save = "[#{each}:void]"

    str = str.replace "{{#{each}}}",save

  ref.all[name] = str



clear.script = (ref) ->

  script_all = ref.script_all

  # script_all = [ref.script_all[0]]

  for each in script_all

    has_tampax = ref.tampax[each]

    exists = ref.all[each]

    if has_tampax

      script_text = clear.tampax do
        each
        ref
        new Set [each]

    else

      script_text = exists

    [init] = each.split '.'

    if (init is ref.cmdname)
      pwd = ref.localpwd
    else
      pwd = ref.globalpwd

    val = run_script script_text,pwd,ref.project,each

    ref.all[each] = val

    ref.script[each] = void

    delete ref.tampax[each]

  tampax = ref.tampax

  for each of tampax

    clear.tampax_fin do
      each
      ref
      new Set [each]

tampax_abs.defarg = (defarg,ref) ->

  local_path = ref.cmdname + ".defarg"

  for each in defarg.tampax_all

    [loc,index] = each

    switch loc
    | \defarg =>
      varspace = ref.glovar
      link     = "var."
      num_link = "defarg."
    | local_path  =>
      varspace = ref.cmdvar
      link     = ref.cmdname + ".var."
      num_link = ref.cmdname + ".defarg."

    str = defarg[loc][index]

    matches = get_curly str

    allspace = ref.all

    rep = []

    for I in matches

      found = varspace[I]

      if found

        rstr = link + I

        rep.push rstr

        str = str.replace "{{#{I}}}","{{#{rstr}}}"

        defarg[loc][index] = str

      else

        found = allspace[I]

        rstr = I

        ifnum = parseInt I

        if not found

          if ((ifnum is 0) or ifnum)

            rstr = num_link + ifnum

            str = str.replace "{{#{I}}}","{{#{rstr}}}"

            defarg[loc][index] = str

          else if (loc is local_path)

            found = ref.glovar[I]

            if found

              rstr = "var." + I

              str = str.replace "{{#{I}}}","{{#{rstr}}}"

              defarg[loc][index] = str

        rep.push rstr

    defarg.tampax[(each.join '.')] = rep

  delete defarg.tampax_all

tampax_abs.ref = (defarg,ref) ->

  cmdname = ref.cmdname

  for each in ref.tampax_all

    [loc,index] = each

    switch loc
    | cmdname =>
      varspace = ref.cmdvar
      link     = ref.cmdname + '.var.'
      num_link = ref.cmdname + ".defarg."
    | otherwise  =>
      varspace = ref.glovar
      link     = 'var.'
      num_link = "defarg."

    p = each.join "."

    str = ref.all[p]

    matches = get_curly str

    allspace = ref.all

    rep = []

    for I in matches

      # z I

      found = varspace[I]

      if found

        rstr = link + I

        rep.push rstr

        str = str.replace "{{#{I}}}","{{#{rstr}}}"

        ref.all[p] = str

      else

        found = allspace[I]

        rstr = I

        ifnum = parseInt I

        if not found

          if ((ifnum is 0) or ifnum)

            rstr = num_link + ifnum

            str = str.replace "{{#{I}}}","{{#{rstr}}}"

            ref.all[p] = str

          else if ( loc is cmdname )

            found = ref.glovar[I]

            if found

              rstr = "var." + I

              str = str.replace "{{#{I}}}","{{#{rstr}}}"

              ref.all[p] = str

        rep.push rstr

    ref.tampax[p] = rep

  delete ref.tampax_all


check_if_circular_ref = (defarg,ref) !->

  for each,item of defarg.tampax

    for I in item

      if I is each

        print.circular_ref I

        throw SERR

  for loc,matches of ref.tampax

    for each in matches

      if loc is each

        print.circular_ref loc

        throw SERR

replace_dot = {}

replace_dot.encode = (ref) ->

  for [y-axis,x-axis] in ref.dotmatrix

    path = ref.pall[y-axis]

    str = path[x-axis]

    nstr = str |> R.split "." |> R.join ": "

    oldpath = path.join '.'

    path[x-axis] = nstr

    npath = path.join '.'

    val = ref.all[oldpath]

    delete ref.all[oldpath]

    ref.all[npath] = val

pathops = guard
.ar 2,(path,obj) -> pathops path,obj,'',\del
.ar 3,(path,obj,str) -> pathops path,obj,str,\mod
.def do
  (path,obj,str,type) ->

    ou = obj

    lastname = path[path.length - 1]

    for I from 0 til ((path.length) - 1)

      ou = ou[path[I]]

    switch type
    | \del =>
      delete ou[lastname]
    | \mod =>
      ou[lastname] = str

    obj


replace_dot.decode = (ref,js) ->

  for each in ref.dotpath

    [newpath,last] = R.splitAt -1,each

    nstr = last[0] |> R.split "." |> R.join ": "

    newpath.push nstr

    val = R.path newpath,js

    pathops each,js,val

    pathops newpath,js

  js

modyaml = (info) ->*

  configfile = info.configfile

  data = configfile |> fs.readFileSync |> R.toString

  doc = parseDoc data,info

  allcmdnames = gs_path.yl.find_cmd_name doc.contents

  cmd_equ_func = args[0] |> R.equals

  is_cmd = R.find cmd_equ_func,allcmdnames

  if is_cmd

    info.cmdname = args[0]

    info.cmdargs = R.drop 1,args

  else

    info.cmdname = void

    info.cmdargs = args

  nominal_path = null

  # ----

  cmdname = info.cmdname

  if cmdname is undefined

    for [key,value] in info.vars

      if (key[0] is \var)

        key.shift!

      doc.setIn [\var,...key],value

    nominal_path = []

  else

    p_cmdvar = [cmdname,'var']

    p_empty  = []

    for [key,value] in info.vars

      if (key[0] is \var)

        init = p_empty

        p = key

      else

        init = p_cmdvar

        p = [...init,...key]

        alt_p = [\var,...key]

        if ((doc.getIn p) is undefined) and doc.getIn alt_p

          p = alt_p

      doc.setIn p,value

    nominal_path = [cmdname]

  v_path = [...nominal_path,\var]

  d_path = [...nominal_path,\defarg]

  js_all = yaml_parse doc,info

  js = {}

  if info.options.edit or info.options.list

    return [js_all,doc]

  sk = global_data.selected_keys.set

  for index,value of js_all

    if (sk.has index) or (index is cmdname)

      js[index] = value

  ref = gs_path.js.main js,cmdname

  for index,path of ref.script

    if not ((path[0] in [\var,\defarg]) or (path[1] in [\var,\defarg]))

      print.script_in_wrong_place index

      throw SERR

  defarg = {}

  defarg.project = info.options.project

  defarg.defarg = null

  defarg[(ref.cmdname + '.defarg')] = {}

  defarg.localpwd = null

  defarg.globalpwd = null

  defarg.script_all = []

  defarg.script = new Set!

  defarg.tampax = {}

  defarg.tampax_all = []

  sd = san_defarg js,info

  defarg.defarg = sd [\defarg]

  update_defarg defarg,\defarg

  defarg.globalpwd = san_inpwd do
    js.inpwd
    info.options.inpwd

  if cmdname

    if global_data.selected_keys.set.has cmdname

      print.in_selected_key cmdname,info.cmdline

      throw SERR

    if not js[cmdname]

      print.could_not_find_custom_cmd cmdname,info

      throw SERR

    inpwd = san_inpwd do
      js[cmdname].inpwd
      js.inpwd

    defarg.localpwd = inpwd

    a_path = [cmdname,\defarg]

    p = cmdname + \.defarg

    defarg[p] = sd a_path

    update_defarg defarg,p


  else

    update_defarg defarg,\defarg

  tampax_abs.defarg defarg,ref

  tampax_abs.ref defarg,ref

  delete ref.glovar

  delete ref.cmdvar

  check_if_circular_ref defarg,ref

  merge_ref_defarg defarg,ref

  clear.script ref

  replace_dot.encode ref

  cd = com.hoplon.utils.flat.unflatten ref.all

  clean_data = replace_dot.decode ref,cd

  [clean_data,doc]


parseDoc = (data,info) ->

  doc = yaml.parseDocument data

  error = doc.errors[0]

  if error

    print.yaml_parse_fail do
      error.toString!
      info

    throw SERR

  if not doc.contents

    print.yaml_parse_fail do
      'yaml file is empty.'
      info

    throw SERR

  return doc

show = R.tap (ob) !-> console.log [ob]

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

  l lit ['> FILE ',info.configfile],[c.er2,c.blue]

  keys = Object.keys yjson

  user_ones = rmdef keys

  if user_ones.length is 0

    l lit ["  --- ","< EMPTY USER CMD >"," ---"],[c.pink,c.er2,c.pink]

  for I from 0 til user_ones.length

    name = user_ones[I]

    des = only_str yjson[name].description

    l lit [" • ",name,des],[c.warn,c.warn,c.grey]

function exec_cat_option yaml_object,concat_count,info

  yaml_text = yaml_object.toString!

  hash_first = RegExp '^#'

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

  l (info.libs.emphasize.highlightAuto text).value


SERR = Symbol \error

OK   = Symbol \ok

tampax_parse = (yaml_text,cmdargs,filename) ->

  (resolve,reject) <- nPromise

  (err,rawjson) <- tampax.yamlParseString yaml_text,cmdargs

  if err

    err = (err.split "\n")[0]

    print.failed_in_tampax_parsing filename,err

    resolve SERR

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

  sortie = be.flatro all

  [type,msg] = sortie

  switch type
  | \:ob_in_str_list => return msg
  | otherwise        => "not string or string list."

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

ifTrue = (type) -> (...,state) ->

  val = state.origin[type]

  if Boolean val

    return val

  else

    return state.info.options[type]

#--------------------------------------------------------------

V.watch = {}

V.watch.main = V.rsl.or do
  be.undefnull.alt V.isFalse
  .cont -> []


#--------------------------------------------------------------

V.watch.def = V.watch.main
.or V.isTrue.cont (...,state) -> state.info.options.watch

#--------------------------------------------------------------

V.watch.user = V.watch.main

.or V.isTrue.cont ifTrue \watch

#--------------------------------------------------------------

V.ignore = {}

V.ignore.def = V.watch.main
.or V.isTrue.cont (...,state) -> state.info.options.ignore

#--------------------------------------------------------------

V.ignore.user = V.watch.main

.or V.isTrue.cont ifTrue \ignore

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

  for each,index in rsync
  
    if ((R.type each.des) isnt \String)

      msg = [".des is not defined. maybe remotefold is not defined."] 

      path = R.slice 1,-1,arguments

      tosend = do
        [ 
          false
          [\:rsync,[\uno,msg]]
          [\rsync,index,\des]
        ]
      
      return tosend

  return true

# ----------------------------------------

san_remotefold = (data,cmdname) ->
  
  if ((R.type data.remotefold) isnt \String)

    st = {}

    st.error = [
      [
        \def,"remotefold is undefined (unable to substitute .des in rsync).",[cmdname,'remotefold']
      ],
      []
    ]

    return [SERR,st]

  return [OK]

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

          error.push [\duo,[\des,"has to be string type."]],[index]

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

    if st is SERR then return data

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
        ssh = [[\rsh,"ssh #{st\
        ate.origin.ssh.option}"]]
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

dangling_colon = be.arr
.cont (arr) ->

  sortir = ""

  re = /;\s*/

  for str in arr

    str = str.replace re,";"

    if not (str[(str.length - 1)] is ";")

      str = str + ";"

    sortir += str

  sortir

.or be.str
.wrap!
#---------------------------------------------------

V.ssh = be.obj

.on \option, be.str.or unu

.on \startwith, do
  be.arr.map be.str
  .or be.undefnull.cont -> []

.alt be.str.cont (str) -> (option:str,startwith:[])

.alt be.undefnull.cont -> (option:void,startwith:[])

#----------------------------------------------------

san_path = (path) ->

  # if isWSL

  #   path = "\"#{path}\""

  path

V.def_ssh = V.ssh

.cont (ob,...,state) ->

  {origin} = state

  if ob.startwith.length is 0

    path = san_path origin.remotefold

    tsel = "cd #{path};"

    ob.startwith.push tsel

  if ob.option is void

    ob.option = state.info.options.ssh.option

  ob.startwith = dangling_colon ob.startwith

  ob

#----------------------------------------------------

V.user_ssh = V.ssh

#----------------------------------------------------

handle_ssh = (user,def) !->

  if (user.ssh.startwith.length is 0)

    if user.remotefold

      path = san_path user.remotefold

      tsel = "cd #{path}"

      user.ssh.startwith.push tsel

    else

      user.ssh.startwith = def.ssh.startwith

  user.ssh.startwith = dangling_colon user.ssh.startwith

  if not user.ssh.option

    user.ssh.option = def.ssh.option

#----------------------------------------------------

V.def_vars = be.obj.or be.undefnull.cont -> {}

#----------------------------------------------------

V.user_vars = V.def_vars

.cont (ob,...,state)-> 

  out = R.mergeDeepLeft ob,state.origin.var

  out

#----------------------------------------------------

str_to_num = be.str.cont (str) -> Number str
.and be.int.pos
.or be.int.pos

V.defarg_required = str_to_num
.or do
  be.undefnull
  .cont (obj,...,state) ->

    if (arguments.length is 4)

      defarg = state.origin[arguments[2]].defarg

    else if (arguments.length is 3)

      defarg = state.origin.defarg

    if not defarg

      defarg = []

    max_null = 0

    for I in defarg
      if I is null
        max_null += 1
      else
        break

    max_null


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

.on \defarg                      , san_arr

.on \verbose                     , str_to_num.or unu

.on \ignore                      , V.ignore.user

.on [\pre,\remote,\local,\final] , V.execlist

.on \rsync                       , V.rsync.init

.on \defarg.required             , V.defarg_required

.on [\remotehost,\remotefold]    , be.str.or unu.cont (v,key,...,{origin}) -> origin[key]

.cont organize_rsync

.and V.rsync.throw_if_error

.on \ssh                         , V.user_ssh

.on \var                         , V.user_vars

#----------------------------------------------------

disp = (num) -> -> console.log num

V.def = be.obj

.on [\remotehost,\remotefold]    , be.str.or unu

.on [\inpwd,\silent]             , be.bool.or be.undefnull.cont false

.on \verbose                     , str_to_num.or be.undefnull.cont 0

.on \initialize                  , be.bool.or be.undefnull.cont true

.on \watch                       , V.watch.def

.on \defarg                      , san_arr

.on \defarg.required             , V.defarg_required

.on \ignore                      , V.ignore.def

.on [\pre,\local,\final,\remote] , V.execlist

.on \rsync                       , V.rsync.init

.on \var                         , V.def_vars

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

.and (...,{info}) ->

  if info.options.concat is 3

    return [false,[\:concat]]

  true

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

  | \:concat                 => noop

  | otherwise                => 

    Error = Error[0]

    print.basicError

  if (info.options.concat is 3)

    libs = info.libs

    clone = R.clone info

    clone.libs = void

    print_json = (json) -> l (libs.emphasize.highlight \json,j json).value

    print_json clone
    l "-------------"
    print_json val


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

update = (gjson,info)->*

  add = (def:{},user:{},origin:gjson,info:info)

  vout = V.def.auth gjson,add

  if vout.error then return SERR

  gjson = vout.value

  [lconfig,log,buildname] = create_logger info,gjson

  if info.options.watch_config_file

    lconfig.watch.unshift info.configfile

  [lconfig,log,buildname]


init_continuation = (dryRun,dir,inpwd) -> (cmd,location = [],type = \async) ->*

  if dryRun

    status = 0

  else

    sortir = spawn cmd,dir,inpwd

    {status} = sortir

  if (status isnt 0)

    switch type

    | \async => yield new Promise (resolve,reject) ->  reject [cmd,location]

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

  tsel = remotehost + ":" + des

  # if isWSL

  #   tsel = "\'#{tsel}\'"

  cmd = "rsync " + txt + (arrToStr src) + tsel

  cmd

exec_finale = (data) ->*

  {info,lconfig,log,cont} = data

  postscript = lconfig['final']

  log.normal do
    postscript.length
    \ok
    " final"
    c.warn "#{postscript.length}"

  for cmd,index in postscript

    log.verbose cmd

    yield from cont cmd,[\final,index]

exec_rsync = (data,each,index) ->*

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

  status = yield from cont cmd,[\rsync,index],\sync

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

check_if_remote_not_defined = bko
.on do
  *[\and,\remote,(be.arr.and be.not zero)]
   [\alt,[\remotehost,\remotefold],be.undefnull]
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
        ["unable to ssh to remote address '",lconfig.remotehost,"'."]
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

      yield from cont mkdir,[]

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

  for I,index in remotetask

    cmd = "ssh #{lconfig.ssh.option} #{remotehost} '#{lconfig.ssh.startwith} #{I}'"

    log.verbose I,cmd

    yield from cont cmd,[\remote,index]

onchange = (data) ->*

  {info,lconfig,log,cont} = data

  req = lconfig[\defarg.required]

  if ( req > info.cmdargs.length)

    print.defarg_req req,(info.cmdname + " ")

    yield \error

    return

  if check_if_remote_not_defined lconfig

    log.normal do
      \err
      " ⚡️⚡️ error"
      c.er2 ".remotehost/.remotefold ( required for task ) not defined."

    yield \error

    return

  if (check_if_empty lconfig)

    log.normal do
      \err
      "⚡️⚡️ error"
      c.er1 "empty execution, no command to execute / unable to find user command."

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

  for cmd,index in local

    log.verbose cmd

    yield from cont cmd,[\local,index]

  if lconfig.rsync or (remotetask.length and (not info.options.dryRun))

    yield from check_if_remotehost_present data

  if lconfig.rsync

    for each,index in lconfig.rsync

      yield from exec_rsync data,each,index

  if remotetask.length

    if (not info.options.dryRun)

      yield from check_if_remotedir_present data

    yield from remote_main_proc data,remotetask

  yield from exec_finale data

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

.cont ([cmdtxt,location],log,info)->

  process.stdout.cursorTo 0

  if info.options.verbose is 2

    log.normal \err_light,"exit 1",cmdtxt

  else

    log.normal \err_light,"exit 1"

  [\error,location]

.or do
  be (x) -> (R.type x) is \Error
  .cont (E) ->
    l '----'
    l c.er2 E.stack
    l '----'
    []

.alt be.str.cont (str) -> [str]
.wrap!

save_failed_build = (loc,info) !->

  startpoint = info.options.startpoint

  if info.options.resume
    if loc[0] is startpoint[0]
      loc[1] = loc[1] + startpoint[1]

  alldata = info.options.hist_file_address
  |> fs.readFileSync
  |> R.toString
  |> JSON.parse


  pdata = alldata[info.options.project]

  patt = info.cmdline.join " "

  fail = pdata.fail

  if not fail
    print.hist_file_corrupted info.options.hist_file_address
    return
  while fail.length > info.histsize 
    fail.shift!

  last = R.last fail

  if last and (last[0] is patt)
    fail.pop!

  fail.push [patt,loc]

  fs.writeFileSync do
    info.options.hist_file_address
    jspc alldata


print_final_message = (log,lconfig,info) -> (signal) !->

  [sig,loc] = resolve_signal signal,log,info

  if info.options.watch_config_file

    msg = (c.warn "returning to watch ") + (c.pink "*CF")

  else

    msg = c.warn "returning to watch"

  switch sig
  | \error =>

    save_failed_build loc,info

    message_type = \err

  | \done  =>

    message_type = \ok

  if not lconfig.should_I_watch

    lconfig.rl.close!

    return

  log.normal message_type,msg

ms_create_watch = (lconfig,info,log) ->*

  should_I_watch = (lconfig.watch.length > 0) and (info.options.no_watch is 0)

  lconfig.should_I_watch = should_I_watch

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

    rl = readline.createInterface do
      {input:process.stdin,
      output:process.stdout,
      terminal:false}

    rl.on \line,(input) !->

      process.stdout.write input

    lconfig.rl = rl

    #--------------------------------------------------------------------------------------

    if lconfig.inpwd

      cwd = undefined
      lconfig.CFname = info.configfile

    else

      cwd = info.options.project
      lconfig.CFname = '.remotemon.yaml'

    if should_I_watch

      watcher = chokidar.watch do
        lconfig.watch
        *ignored:lconfig.ignore
         awaitWriteFinish:true
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

  for cmd,index in pre

    log.verbose cmd

    yield from cont cmd,[\pre,index]

  ms = do

    ms_file_watch

    .timestamp!

    .loop (handle_inf log,lconfig),info.timedata

    .switchLatest!

    .takeWhile (filename) ->

      if filename is lconfig.CFname
        if info.options.watch_config_file
          return false

      true

    .continueWith (filename) ->

      most.generate restart,info,log

      .continueWith (SIG) ->

        if SIG is OK then return most.empty!

        lconfig.initialize = false

        do
          <- wait 0

          msg = lit do
            ["#{info.configfile}"," <--parse error"]
            [c.warn,c.er3]

          log.normal \err,msg

          msg = lit do
            ["setting up watch using using old configuration file.."]
            [c.er1]

          log.normal \err,msg

          most.generate ms_create_watch,lconfig,info,log
          .drain!

        most.empty!

      .drain!

      most.empty!

    .tap (filename) ->

      data = {info,lconfig,log,cont}

      most.generate onchange,data

      .recoverWith (x) -> most.just x

      .observe print_final_message log,lconfig,info

  ms.drain!

restart = (info,log) !->*

  msg = lit do
    ["#{info.configfile}"," changed, restarting watch.."]
    [c.warn,c.er1]

  log.normal \err,msg

  try

    [gjson] = yield from modyaml info

  catch E then return SERR

  sortir = yield from update gjson,info

  if (sortir in SERR) then return SERR

  [lconfig,log] = sortir

  aout = most.generate ms_create_watch,lconfig,info,log
  .drain!

  return OK

V.CONF = be.known.obj

.on \rsync,V.rsync.init

.on \ssh,V.ssh

.on \watch,be.undef.or be.arr.or be.str.cont (str) -> [str]

.on \inpwd,be.undef.or be.bool

.on \histsize,be.num.fix 100

.cont organize_rsync

.and V.rsync.throw_if_error

.err (message,path,...,info) ->

  [topmsg] = be.flatro message

  [loc,Error] = topmsg

  F = switch loc
  | \:rsync   => print.rsyncError
  | otherwise =>

    Error = topmsg

    print.basicError

  F Error,path,"~/.config/config.remotemon.yaml"

check_conf_file = (conf,info) ->

  D = {}

  D.rsync = conf.rsync

  D.ssh = conf.ssh

  D.remotefold = '<CONF dummy / ignore>'

  D.histsize = conf.histsize

  origin = {}

    ..ssh = conf.ssh

  sortir = V.CONF.auth D,info.cmdname,{origin,info}

  sortir.error

if_current_hist_empty = be.undef
.alt be.arr.and (a) -> a.length is 0
.cont true
.fix false
.wrap!



getunique = R.uniqWith do
  ([_,cmd1],[_,cmd2]) -> R.equals cmd1,cmd2

exec_list_hist = (val,project_name) ->

  path = homedir + "/.config" + "/remotemon/" + "hist.json"

  val = path |> fs.readFileSync |> R.toString |> JSON.parse

  l lit ['> PROJECT ',project_name],[c.er2,c.blue]

  if if_current_hist_empty current_hist

    l lit [" --- ","< EMPTY HISTORY >"," --- "],[c.pink,c.warn,c.pink]

    return

  padLeft = com.hoplon.utils.pad.padLeft

  current_hist = getunique current_hist

  fin_string = []

  max_mid_len = 0

  max_time_len = 0

  for [time,cmd],index in current_hist

    mtime = moment time

    date = mtime.format 'MMM-DD'

    time = mtime.format 'hA'

    rel_time = moment(mtime.format('YYYYMMDDkkmmss'), 'YYYYMMDDkkmmss').fromNow!

    if time.length >= max_time_len

      max_time_len = time.length

    if rel_time.length >= max_mid_len

      max_mid_len = rel_time.length

    fin_string.push [date,time,rel_time,cmd]

  color = [c.warn,c.er1]

  for each,index in fin_string

    each[1] = padLeft each[1],max_time_len,' '

    each[2] = padLeft each[2],max_mid_len,' '

    l lit do
      [each[0],' ',each[1],' ',each[2],' ',(each[3].join ' ')],[c.pink,null,c.pink,null,c.grey,null,color[index%2]]


start_from_resume_point = (lconfig,info) ->

  [point,index] = info.options.startpoint

  order = [\pre,\local,\rsync,\remote,\final]

  [torm,cont] = R.splitWhen (R.equals point),order

  for each in torm

    lconfig[each] = []

  [__,tokeep] = R.splitAt index,lconfig[cont[0]]

  lconfig[cont[0]] = tokeep

  lconfig


get_all = (info) ->*

  pod = yield emphasize

  info.libs.emphasize = pod.emphasize

  pod = yield boxen

  info.libs.boxen = pod.default

  try

    [gjson,yaml_text] = yield from modyaml info


  catch E

    return

  if info.options.edit

    fs.writeFileSync info.configfile,yaml_text

    return

  switch info.options.list
  | 1 =>
    exec_list_option gjson,info
    return
  | 2 =>
    return

  concat = info.options.concat

  if concat in [1,2]

    exec_cat_option yaml_text,concat,info

    return

  sortir = yield from update gjson,info


  if sortir is SERR then return

  [lconfig,log] = sortir

  if info.options.resume

    lconfig = start_from_resume_point lconfig,info

  #  ---------------------------------------------------------

  log.dry \err,metadata.version

  log.normal do
    info.options.resume
    \err_light
    'starting from resume point'
    c.warn info.options.startpoint.join '.'

  most.generate ms_create_watch,lconfig,info,log
  .recoverWith (sig)->
    resolve_signal sig,log,info
    most.empty!
  .drain!

rm_resume = (cmdline) ->

  pluck = -1
  fin = cmdline

  for each,index  in cmdline

    if each in ["--resume","-r"]
      pluck = index

  if pluck isnt -1

    fin = R.remove pluck,1,cmdline

  fin

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

  cmdline = R.drop 2,process.argv

  cmdline = rm_resume cmdline

  info = {}

    ..cmdname               = null
    ..cmdargs               = null
    ..vars                  = vars
    ..configfile            = config_file_name
    ..timedata              = [0,0,0]
    ..cmdline               = cmdline
    ..defarg                = void
    ..libs        = {}
      ..emphasize  = null
      ..boxen      = null
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
      ..inpwd               = CONF.inpwd
      ..watch               = CONF.watch
      ..hist_file_address   = CONF.HIST_FILE
      ..histsize            = CONF.histsize
      ..resume              = cmd_data.resume.count!
      ..startpoint          = []

  z info

  if info.options.resume

    archive = CONF.HIST_FILE
    |> fs.readFileSync
    |> R.toString
    |> JSON.parse

    patt = info.cmdline.join ' '

    find_fun = R.propEq 0,patt

    data = archive[info.options.project]

    if not data

      print.project_hist_empty do
        info.options.project
        CONF.HIST_FILE

      return

    index = R.findIndex find_fun,data.fail

    if (index is -1)

      print.unable_to_find_resume patt,data.fail

      return

    start_point = (data.fail[index])[1]

    info.options.startpoint = start_point

  do

    <- wait 0

    (err,bin_data) <- fs.readFile CONF.HIST_FILE

    if err
      c.er1 err
      return

    try

      archive = JSON.parse bin_data.toString!

    catch

      print.hist_file_corrupted CONF.HIST_FILE

      return

    if not archive[project_name]

      local_hist = {call:[],fail:[]}

      archive[project_name] = local_hist

    else

      local_hist = archive[project_name]

    call = local_hist[\call]

    if not call 

      print.hist_file_corrupted CONF.HIST_FILE

      return

    if not info.options.list

      while call.length > CONF.histsize

        call.shift!

      last = R.last call

      if last and (R.equals last[1],info.cmdline)

        call.pop!

      call.push [((new Date!).getTime!),info.cmdline]

    (err) <- fs.writeFile CONF.HIST_FILE,(jspc archive)

    if err
      c.er1 err
      return

    if (info.options.list is 2)

      exec_list_hist archive,info.options.project

      return

  if info.options.list is 2
    return

  if (check_conf_file CONF,info)
    return


  most.generate get_all,info
  .recoverWith (E) -> 

    str = ' [ error at line 3086 ]'

    l c.er1 do
      E.toString! + str

    most.empty!
  .drain!


most.generate init
.tap main cmd_data
.recoverWith (E) -> l E.toString!;most.empty!
.drain!

