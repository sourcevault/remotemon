ext = require "./data"

core = require "./core"

{com,print,data,metadata} = ext

{l,z,j,R} = com.hoplon.utils

#----------------------------------------------------

{read-json,exec,fs,tampax,most_create,most,metadata} = com

{zj,j,lit,c,optionator,R} = com.hoplon.utils

be = com.hoplon.types

maybe = be.maybe

log = (x) -> l x ; x

ME     = {}

rm     = {}

util   = {}

#----------------------------------------------------

filter-for-config-file = R.pipe do
  R.split "\n"
  R.filter (str) -> (str is ".#{metadata.name}.yaml")

ME.findfile = (filename) ->

  switch R.type filename
  | \String =>

    if not (fs.existsSync filename)

      l lit do
        [ "[#{metadata.name}]","[Error]"," cannot find configuration file ","#{filename}","."]
        [c.er3,c.er1,c.warn,c.er1]

      return false

    return filename

  | \Undefined,\Null =>

    name = metadata.name

    raw = exec " ls -lAh . | grep -v '^d' | awk 'NR>1 {print $NF}'"

    isthere = filter-for-config-file raw

    if isthere.length is 1

      l lit do
        ["[#{name}] using ", (process.cwd! + "/.#{name}.yaml")]
        [c.ok,c.warn]

      return isthere[0]

    raw = exec " ls -lAh .. | grep -v '^d' | awk 'NR>1 {print $NF}'"

    isthere = filter-for-config-file raw

    if isthere.length is 1

      l lit do
        ["[#{name}]"," using ",(((R.init ((process.cwd!).split "/")).join "/") + "/.#{name}.yaml")]
        [c.ok,c.grey,c.warn]

      return ("../" + isthere[0])

    middle = " - " + (c.pink ".#{name}.yaml") + " or " + (c.pink "/../.#{name}.yaml") + " not present.\n"

    l lit do
      [
        "[#{name}][Error]\n"
        middle
        " - custom config file is also not provided."
      ]
      [c.er3,0,c.grey]

    return false

  | otherwise =>

    l lit do
      [ "[#{name}][Error] .config can only be string type."]
      [c.er1,c.warn,c.er1]

    return false


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

replace_single_qoute = (list)->

  [I.replace /'/g,"'\''" for I in list]

ME.strlist = (F) ->

  ME.recursive_str_list
  .or be.undefnull.cont F


ME.strlist.empty       = ME.strlist -> []

ME.strlist.dot         = ME.strlist -> ["."]

ME.strlist.undef       = ME.strlist void

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

ME.rsync.string = (str) ->

  if not (data.rsync.bool.has str)

    return [
      false
      [
        \:rsync,[2,["#{str}"," not a valid boolean rsync option."]]
      ]
    ]


  true

ME.rsync.object = be.obj
.and (ob,__) ->

  keys = Object.keys ob

  if not ((keys.length) is 1)

    return [
      false
      [
        \:rsync,[1,["object can only have singular attribute."]]
      ]
    ]

  k = keys[0]

  if not ((data.rsync.compound.has k) or (k in [\src,\des]))
    return [
      false
      [
        \:rsync,[2,[k," not a valid compound rsync option."]]
      ]
    ]

  val = ob[k]

  if k in [\des,\src]

    if not (((R.type val)) is \String)

      return [
        false
        [
          \:rsync,[2,[k," can only be string type."]]
        ]
      ]


  true

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
          fin.obnormal.push [k,val]
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

ME.rsync.strarr = be.arr.map be.str
.or be.str.cont (s) -> [s]
.or be.undefnull.cont []

ME.watch = ME.strlist.undef
.or (be is_true).cont ["."]
.or is_false

ME.rsync.user = be.arr
.or be.undefnull.cont void
.alt be.bool.cont (val) ->

  if (val is true)

    rsync = &3.origin.rsync

    if rsync then return rsync
    else return data.def.rsync.concat (des:&3.origin.remotefold)

  else then false


.edit organize-rsync

.and ME.rsync.check_if_error

.cont (fin) ->

  if not fin.des[0]

    fin.des.push &3.origin.remotefold

  if (fin.src.length is 0)

    fin.src.push "."

  fin

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


ME.user = be.obj

.err [\:custom_build]

.or (be.undefnull.cont -> {}).err void

.and be.restricted data.selected_keys.arr

.on \initialize    , ME.maybe.bool

.on \watch         , do
  ME.strlist.undef
  .or (be is_true).cont ["."]
  .or is_false


.on \ssh           , be.str.or unu

.on [\exec-remote,\exec-locale,\exec-finale] , do

  ME.strlist.undef.cont replace_single_qoute

.on \chokidar     , ME.chokidar.or unu

.on \rsync        , ME.rsync.user

.or unu

.or do
  ME.strlist.empty
  .cont (list) -> {'exec-locale':list,rsync:false}

# ----------------------------------------

ME.origin = be.obj.alt be.undefnull.cont -> {}

.on \remotehost,be.str.or unu

.on \remotefold,be.str.or unu.cont "~"

.on \initialize  , be.bool.or be.undefnull.cont true

.on \watch       , do
  ME.strlist.dot
  .or (be is_true).cont ["."]
  .or is_false

.on \ssh         , do
  be.str.or be.undefnull.cont data.def.ssh

.on [\exec-locale,\exec-finale,\exec-remote], do

  ME.strlist.empty.cont replace_single_qoute

.on \chokidar , ME.chokidar.or be.undefnull.cont data.def.chokidar

.and do

  be (data) -> if (data.remotehost) then return true else false

  .fix (data) ->

    data.rsync = false

    data

.on \rsync do

  be.arr

  .alt be.undefnull.cont -> data.def.rsync.concat (des:&3.origin.remotefold)

  .alt (be (x) -> x is true).cont (val) -> (data.def.rsync.concat (des:&3.origin.remotefold))

  .edit organize-rsync

  .and ME.rsync.check_if_error

  .cont (fin) ->

      if fin

        if not fin.des[0] then (fin.des.push &3.origin.remotefold)

        if (fin.src.length is 0)

          fin.src.push "."

      fin

  .or is_false

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

.and (raw,__,state) ->

  for I in state.cmd

    if (raw[I] is undefined)
      return [false,[\:usercmd_not_defined,I]]

  true

# ----------------------------------------

mergeF = (a,b)->

  if (b is void) then return a

  b

ME.main = be.obj

.on \cmd do
  be.arr.map (x) -> not data.selected_keys.set.has x
  .err (x,id,__,state) -> [\:in_selected_key,[state.cmd[id],state.commandline]]

.on \origin,ME.origin

# ----------------------------------------

.err be.flatato

.err (all,path,state)  ->

  [topmsg] = all

  [loc,Error] = topmsg

  F = switch loc
  | \:in_selected_key     => print.in_selected_key      # done checking
  | \:req                 => print.reqError             # | not to rm |
  | \:res                 => print.resError             # | not to rm |
  | \:usercmd_not_defined => print.usercmd_not_defined  # done checking
  | \:rsync               => print.rsyncError           # mostly okay
  | \:ob_in_str_list      => print.ob_in_str_list       #
  | \:custom_build        => print.custom_build
  | otherwise             =>

    [Error] = all

    print.basicError

  F Error,path,state.filename,all # topmsg is not really needed, but put anyway.

  \error.validate

.edit (__,state) ->

  {user,def} = state

  nuser = {}

  for key,value of user

    nuser[key] = R.mergeDeepWith mergeF,def,value

  state.user = nuser

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

  for name,txt of vars

    for I from 1 til all.length

      current = all[I]

      if current[0].name is name

        firstline = current[0]

        isr = isref.exec firstline.txt

        old_txt = current[0].txt

        current[0].txt = isr[0] + " " + txt

        all[I] = [current[0]]

  if index

    tokens[index] = R.flatten all

  tokens

vars.stringify = (tokens) ->

  str = ""

  for I in tokens

    str += I.txt + '\n'

  str

# # --------------------------------------------------------------------


entry = (info) -> # validator

  try

    FILENAME = process.cwd! + "/" + info.filename

    data = FILENAME |> fs.readFileSync |> R.toString

    tokens = yaml_tokenize data

    torna = vars.get tokens

    torna = vars.edit torna,info.vars,tokens

    torna = R.flatten torna

    yaml_text = vars.stringify torna

    $ = do

      (add,end,error) <- most_create

      (err,raw-json) <- tampax.yamlParseString yaml_text,{...info.vars}

      if err

        l err

        print.failed_in_tampex_parsing info.filename

        add {continue:false,message:\error.parse}

        return

      state =
        commandline : info.commandline
        options     : info.options
        filename    : info.filename
        cmd         : info.cmd
        origin      : raw-json
        def         : {}
        user        : {}

      add ME.main.auth state,state

      end!

    return $

  catch Er

    print.unable-to-read-config-yaml info.filename

    l Er

    return most.just {continue:false,message:\error.read.parse}


module.exports =
  *validator:entry
   findfile:ME.findfile
   ext:ext

# --------------------------------

