reg = require "./registry"

require "./print" # [...load print.js...]

require "./data" # [...load data.js...]

{com,print,data,metadata} = reg

#----------------------------------------------------

{l,z,j,R} = com

{read-json,read-yaml,be,j,optionator,lit,c} = com

maybe = be.maybe

log = (x) -> l x ; x

#----------------------------------------------------

ME     = {}

rm     = {}

util   = {}

ME.has = (props) -> (ob) ->

  for key in props

    if (ob.hasOwnProperty key)

      return true

  return false

ME.has_file_filter = ME.has data.flag.filter

ETYPE = (name) -> (msg) -> [name,msg]

rm-empty-str = R.filter do
  (x) ->
    if x.length is 0
      return false
    else
      return true

util.str2arr = (x) -> [x]

ME.strlistE = (msg) ->

  msg = R.flatten msg

  [type1,txt,type2] = msg

  switch type1

  | \list     => [\list,txt]

  | otherwise =>

    switch type2

    | \merge    => [\merge]

    | otherwise => [\prime,"not a Array of string or just string."]


ME.recursive-str-list = be.arr.map do
  be.arr.and (arr) ->

      ret = ME.recursive-str-list.auth arr

      if ret.continue then return true

      [false,ret.message,ret.path]

  .or be.str
  .or be.obj.jam \merge

.alt be.str.cont util.str2arr
.cont R.flatten


ME.strlist = (F) ->

  ME.recursive-str-list
  .or be.undefnull.cont F
  .err ME.strlistE

ME.strlist.empty       = ME.strlist -> []

ME.strlist.dot         = ME.strlist -> ["."]

ME.strlist.undef       = ME.strlist undefined

unu                    = be.undefnull.cont undefined

util.catprime          = ([msg]) -> ["prime",msg]

rm.secondmsg           = (F) -> F.err util.catprime

ME.maybe               = {}

ME.maybe.bool          = be.bool.or unu

ME.maybe.num           = be.num.or unu

ME.maybe.str           = be.str.or unu

ME.maybe.obj           = be.obj.or unu

ME.maybe.arr           = be.arr.or unu

#--------------------------------------------------------------

rm-all-undef           = (obj) -> JSON.parse JSON.stringify obj

#--------------------------------------------------------------

merge = R.mergeDeepWith (A,B) -> B

ME.flag = {}

ME.flag.object = be.obj
.and (ob) ->

  keys = Object.keys ob

  if not ((keys.length) is 1)

    return [
      false
      [
        \flag,[\not-single,"object can only have singular attribute."]
      ]
    ]

  k = keys[0]

  if not (data.flag.object-props.has k)
    return [
      false
      [
        \flag,[\not-valid,[".#{k}"," not a valid compound rsync option."]]
      ]
    ]

  true

.cont (ob) ->

  if ([val for key,val of ob][0]) in [undefined,null]

    return undefined

  else

    return ob


ME.flag.string = be.maybe.str
.err [\data,"not string or singular object"]
.and (str) ->

  if not (data.flag.bool.has str)

    return [
      false
      [
        \flag,[\not-valid,["#{str}"," not a valid boolean rsync option."]]
      ]
    ]

  true

#----------------------------------------------------

ME.chokidar = ME.maybe.obj
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


ME.flag.main = be
.arr.map do
  ME.flag.string
  .or do
    ME.flag.object
    .cont (ob) ->

      key = (Object.keys ob)[0]

      if key in [\exclude,\include,\exclude-from,\include-from]
        return [{"#{key}":I} for I in ob["#{key}"]]

      ob

  .or do
    be.arr.and (arr) ->

      ret = ME.flag.main.auth arr

      if ret.continue then return true

      [false,ret.message,ret.path]

.cont R.flatten

ME.rsync   = ME.maybe.obj
.on \des   , ME.strlist.undef
.on \src   , ME.maybe.str
.on \flags , ME.flag.main


ME.user = be.obj.or be.undefnull.cont -> {}

.and be.restricted [\watch \localbuild \remotetask \remotehost \chokidar \rsync \initialize]

.on \initialize   , ME.maybe.bool

.on \watch        , ME.strlist.undef

.on \remotetask   , ME.strlist.undef

.on \localbuild   , ME.strlist.undef

.on \chokidar     , ME.chokidar

.on \rsync        , ME.rsync.or unu


ME.main = be.required [\remotehost,\remotefold]

# ----------------------------------------

.on \initialize  , be.bool.or be.undefnull.cont true

.on \watch       , ME.strlist.dot

.on \localbuild  , ME.strlist.empty

# ----------------------------------------

.on \remotetask  , ME.strlist.empty

.on \chokidar    , ME.chokidar


.on \rsync do
  be.obj.alt be.undefnull.cont -> {}
  .on \src,be.str.or be.undefnull.cont "."
  .on \des,ME.strlist -> [&3.origin.remotefold]

  .and ME.rsync.or be.undefnull.cont []


.and (data,state) ->

  for I in state.cmd

    if not data[I]
      return [false,[\usercmd_not_defined,I]]

  true

.map (value,key,state) ->

  {fin} = state

  switch data.selected_keys.set.has key

  | true  =>

    fin.def[key] = value

  | false =>

    put = ME.user.auth value,key,state

    if put.continue

      fin.user[key] = put.value

    else

      return [false,[\usercmd,put.message],put.path]

  state.fin = rm-all-undef fin

  true

.err (msg,path,{filename})  ->

  z msg,path

  # F = swtch loc
  # | \req  => print.req
  # | \data => print.dataError
  # | \flag => print.dataError

  # F msg,path,filename,loc

.cont (__,{fin}) ->

  {user,def} = fin

  nuser = {}

  for key,value of user

    nuser[key] = merge def,value

  fin.user = nuser

  fin

.cont reg.core

# --------------------------------------------------------------------

entry = (data) ->

  FILENAME = process.cwd! + "/" + data.filename

  try

    raw = read-yaml FILENAME

  catch Er

    if data.verbose

      l Er

    print.unable-to-read-config-yaml data.filename


  state = {
    filename : data.filename
    origin   : raw
    cmd      : data.cmd
    fin:
      {...data,def:{},user:{}}
    }

  ME.main.auth raw,state


reg.validator = entry