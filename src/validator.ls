ext = require "./data"

core = require "./core"

{com,print,data,metadata} = ext

{l,z,j,R} = com.hoplon.utils

#----------------------------------------------------------

{read-json,exec,fs,tampax,most_create,most,metadata,c,lit} = com

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

  filenames =  (c.er1 "[ ") + ([(c.warn I) for I in allfiles].join c.er1 " ][ ") + (c.er1 " ]")

  l lit do
    ["[#{metadata.name}]"," using ",filenames]
    [c.ok,c.grey,null]

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
    be.obj.and (obj) ->

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
    | "Undefined","Null" => void
    | "Array" =>
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

is_true = (x) -> x is true

is_false = (x) -> x is false

ME.rsync = {}

grouparr = R.pipe do
  R.unnest
  R.groupBy (v) -> v[0]
  R.map R.map (x) -> x[1]

ME.rsync.check_if_error = (detail) ->

  if detail.error then return [false,detail.error[0],detail.error[1]]

  true

organize-rsync = (list) ->

  if (list is false) then return false

  fin = {str:[],obnormal:[],obarr:[],des:[],src:[],error:false}

  for I,index in list

    switch R.type I
    | \String =>

      if not (data.rsync.bool.has I)

        fin.error = [\:rsync,[\duo,[I,"not a valid boolean rsync option."]]]

        fin.error = [fin.error,index]

        return fin

      fin.str.push I

    | \Object   =>

      keys = Object.keys I

      switch keys.length
      | 0         =>

        fin.error = [\:rsync,[\uno,["empty object without any attribute"]]]

        fin.error = [fin.error,index]

        return fin

      | 1         => void

      | otherwise =>

        fin.error = [\:rsync,[\uno,["object can only have singular attribute."]]]

        fin.error = [fin.error,index]

        return fin

      k = keys[0]

      if not ((data.rsync.compound.has k) or (k in [\src,\des]))

        fin.error = [\:rsync,[\duo,[k," not a valid compound rsync option."]]]

        fin.error = [fin.error,index]

        return fin

      # ------------------------------------------------------------------------

      val = I[k]

      if k is \des

        if not (((R.type val)) is \String)

          fin.error = [\:rsync,[\duo,[\des," has to be string type."]]]

          fin.error = [fin.error,index]

          return fin

        if fin.des.length is 1

          fin.error = [\:rsync,[\duo,[\des," there can't be multiple remote folders as destination."]]]

          fin.error = [fin.error,index]

          return fin

        fin.des.push val

      else if (k is \src) or (data.rsync.filter.has k)

        ret = ME.rsync.strarr.auth val

        if ret.error

          fin.error = [\:rsync,[\duo,[k,"can only be a list of string or just string."]]]

          fin.error = [fin.error,index]

          return fin

        if k is \src

          fin.src.push ret.value

        else

          fin.obarr.push [[k,I] for I in ret.value]

      else

        switch R.type val
        | \String,\Number  =>
          fin.obnormal.push [k,(val.replace /'/g,"'\\''")]
        | \Undefined,\Null => void
        | otherwise =>

          fin.error = [\:rsync,[\duo,[k,"can only be a string (or number)."]]]

          fin.error = [fin.error,index]

          return fin

    | "Array"   =>

      result = organize-rsync I

      if result.error

        fin.error = result.error[0]

        fin.error = [fin.error,[index,result.error[1]]]

        return fin

      fin.str      = R.concat fin.str,result.str
      fin.obnormal = R.concat fin.obnormal,result.obnormal
      fin.obarr    = R.concat fin.obarr,result.obarr
      fin.src      = R.concat fin.src,result.src

    | otherwise =>

      fin.error = [\:rsync,[\uno,["not valid rsync option."]]]

      fin.error = [fin.error,index]

      return fin

  fin.obarr = grouparr fin.obarr

  fin.src = R.flatten fin.src

  fin


ME.rsync.core = be.arr

.edit organize-rsync

.and ME.rsync.check_if_error

.cont (fin) ->

  state = R.last arguments

  if (not fin.des[0])

    (fin.des.push state.origin.remotefold)

  if (fin.src.length is 0)

    fin.src.push "."

  fin


ME.rsync.main = be is_true

.cont ->

  state = R.last arguments
  data.def.rsync.concat (des:state.origin.remotefold)

.or be.arr.map ME.rsync.core

.and ME.rsync.core

.alt ME.rsync.core

.cont (data) -> [data]

.or is_false

.or be.undefnull.cont false

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

.err be.flatato

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

.cont core

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

      error \error.validator.tampaxparsing

      return

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

only_str_interal = be.str.cont (str) -> " - " + str

.fix ""

only_str = (str) -> (only_str_interal.auth str).value

exec_list_option = (alldata) ->

  for [filename,data] in R.reverse alldata

    l lit ['> FILE ',filename],[c.warn,c.blue]

    keys = Object.keys data

    user_ones = rmdef keys

    if user_ones.length is 0

      l lit ["  --- ","< EMPTY >"," ---"],[c.pink,c.warn,c.pink]

    for I in user_ones

      des = only_str data[I].description

      l lit [" • ",I,des],[c.warn,c.ok,c.pink]




main = (info) -> (alldata) ->

  for I in alldata

    if I in [\error.validator.tampaxparsing]

      return most.just I

  if info.options.list

    exec_list_option alldata

    return most.just \ok

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

      if torna.continue then return torna.value

      if not ((torna.message[0][0]) is \:usercmd_not_defined)
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

    return most.just \error.validator.main

  most.just \ok

entry = (info) -> # validator

  $all = []

  for I in info.filenames

    try

      yaml-text = modify-yaml I,info.vars

    catch E

      print.failed_in_custom_parser I,E

      return most.just \error.validator.modify-yaml

    $all.push $tampax-parse I,yaml-text,info.cmdargs

  # --------------------------------------------------

  parsed = most.mergeArray $all
  .recoverWith (x) -> most.just x
  .reduce do
    (accum,data) -> (accum.push data); accum
    []

  P = parsed
  .then main info

  most.fromPromise P


module.exports =
  *validator:entry
   findfile:ME.findfile
   ext:ext

# --------------------------------

