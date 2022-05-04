com = {}
  ..metadata   = {}
    ..name     = null
    ..repourl  = null
    ..homepage = null
    ..version  = null

com.fs               = require \fs

most                 = require \most

com.most             = most

com.chokidar         = require \chokidar

hoplon               = require \hoplon

{z,wait}             = hoplon.utils

com.hoplon           = hoplon

most_create          = (require "@most/create").create

com.most_create      = most_create

child_process        = require \child_process

readline             = require \readline

com.optionParser     = require \option-parser

com.tampax           = require \tampax

com.yaml             = require \yaml

com.path             = require \path

com.child_process    = child_process

cp                   = child_process

be                   = hoplon.types

com.readline         = readline

com.compare_version  = require \../dist/compare.version.js

``
var boxen = import('boxen')
var emphasize =  import('emphasize')
``

com.emphasize        = emphasize

com.boxen            = boxen

R = hoplon.utils.R

dotpat = be.str.edit R.split "."
.or be.undef.cont []
.wrap!

dotpat.take = (amount,signal) ->

  sig = dotpat signal

  (R.take amount,sig).join "."

com.dotpat = dotpat

# ----------------------------------------------------------------------------

com.spawn = (cmd,dir,inpwd) ->

  if inpwd

    cwd = undefined

  else

    cwd = dir

  cp.spawnSync do
    cmd
    []
    {
      shell:'bash'
      stdio:'inherit'
      windowsVerbatimArguments:true
      cwd:cwd
    }
    # {shell:'sh',stdio:'inherit',windowsVerbatimArguments:true,cwd:cwd}

# ----------------------------------------------------------------------------

com.exec = (cmd,dryRun = false) ->

  if not dryRun

    (child_process.execSync cmd).toString!

com.read-json = (filename) ->

  com.fs.readFileSync filename
  |> com.hoplon.utils.R.toString
  |> JSON.parse

print = {}

# ----------------------------------------------------------------------------

export com,print

# ----------------------------------------------------------------------------

{c,l,lit,j,read-json,R,z,create_stack} = hoplon.utils

show_stack = create_stack 2,['node:internal']

__dirname + \/../package.json

|> R.tryCatch do
  (filename) !->

    raw          = com.read-json filename

    pj           = {}

    pj.name      = raw.name

    pj.repourl   = raw.repository

    pj.homepage  = raw.homepage

    pj.version   = raw.version

    com.metadata = pj

  !->

    l c.er2 "- | unable to locate or parse package.json of module."

    show_stack new Error!

# ----------------------------------------------------------------

metadata = com.metadata

show_name = (filename = '') ->

  l lit do
    ["[#{metadata.name}]"," • dataError • ",filename,"\n"]
    [c.er3,c.er2,c.warn,null]


rdot = /\./

clean_path = R.pipe do
  R.map (txt) ->

    if rdot.exec txt

      return "\"" + txt + "\""

    txt
  R.splitAt -1


show_body = (path,msg) ->

  [init,last] = clean_path path

  txt =
    [
      "  " + init.join "."
      "." + last.join "."
      " <-- error here"
    ]

  if msg
    txt.push "\n\n  #{msg}","  "

  lit do
    txt
    [c.warn,c.er3,c.er2,c.er1]


print.rsyncError = (msg,path,filename) ->

  show_name filename

  l show_body path

  [itype,imsg] = msg

  switch itype
  | \duo =>
    l lit ["\n  ",("."+ imsg[0] + " "),imsg[1]],[0,c.er3,c.pink]
  | \uno =>
    l lit ["\n  ",imsg],[0,c.er1]


  l c.grey "\n  please refer to docs to provide valid values."


# ----------------------------------------------------------------

print.incorrect_arg_num = ->

  l lit do
    ["[#{metadata.name}]"," • inputError\n"]
    [c.er2,c.er3]

  l lit do
    ["  ","incorrect number of arguments for function."]
    [0,c.er1,c.er3,c.er1]

# ----------------------------------------------------------------

print.incorrect_custom = (__,key)->

  l lit do
    ["[#{metadata.name}]"," • incorrect custom task name ","\n"]
    [c.er2,c.er3,c.er2,null]

  l lit do
    ["  ",key," <-- custom task name cannot contain"," \"/\" ","character. "]
    [null,c.er3,c.er1,c.er3,c.er1]

print.reqError = (props,path,filename) ->

  show_name filename

  [init,[last]] = R.splitAt -1,path

  l lit do
    [
      "  mandatory value #{c.er1("." + last)} not present.\n\n"
      "  all mandatory value(s) :\n"
    ]
    [c.grey,c.grey]


  l c.er1 "  ." + props.join " ."

print.defarg_req = (len) ->

  l lit do
    ["[#{metadata.name}]"," • dataError \n"]
    [c.er2,c.er3]

  l lit ["  command requires minimum of ",len," commandline argument."],[c.er2,c.er3,c.er2]


print.cmdError = (cmdname) ->

  l lit do
    ["[#{metadata.name}] • cmdFailure • ",cmdname]
    [c.er2,c.warn]

print.ob_in_str_list = (type,path,filename) ->

  show_name filename

  txt = switch type
  | \object       => "object not accepted in string list."
  | \empty_object => "empty object found, it could be a YAML alias referencing issue."

  l show_body do
    path
    txt

print.failed_in_mod_yaml = (filename,E) ->

  l lit do
    ["[#{metadata.name}]"," • parseError •"," unable to read YAML file."]
    [c.warn,c.er3,c.er1]

  l "\n  " + (c.pink com.path.resolve filename)

  l c.er1 "\n  " + E


print.failed_in_tampax_parsing = (filename,E) ->

  l lit do
    ["[#{metadata.name}]"," • parseError •"," yaml/tampex parsing error."]
    [c.warn,c.er2,c.er1]

  l "\n  " + (c.pink com.path.resolve filename) + "\n"

  l c.grey E

  emsg = [
    "\n"
    c.warn "  make sure :\n\n"
    c.er1 "   - YAML file(s) can be parsed without error.\n"
    c.er1 "   - YAML file(s) has no duplicate field.\n"
    c.er1 "   - YAML file(s) is not empty.\n"
    c.er1 "   - correct path is provided."
    ]

  l emsg.join ""


print.in_selected_key = (key,cmd_str) ->

  l lit do
    ["[#{metadata.name}]"," • cmdFailure •\n"]
    [c.er2,c.er3]

  l lit do
    ["  #{key}"," is a selected key, cannot be used as a task name.\n"]
    [c.er3,c.warn]

  l lit do
    ["  ",(cmd_str.join " ")]
    [null,c.er1]


print.error_in_user_script = (err_msg,path) ->

  l lit do
    ["[#{metadata.name}]"," • cmdFailure •"," error in user script.\n"]
    [c.er2,c.er3,c.er1]

  l lit do
    ["  ",(path.join ".")," <-- error here.\n"]
    [null,c.warn,c.er3]

  
  process.stdout.write c.grey err_msg


# ----------------------------------------------------------------

print.resError = (props,path,filename) ->

  show_name filename

  key = R.last path

  l show_body do
    path
    [
      (c.grey "unrecognized config key") + (c.er3 " #{key}") + "\n"
      c.grey "only acceptable keys are :\n"
      c.pink "- "+ props.join " \n  - "
    ].join "\n  "


print.could_not_find_custom_cmd = (cmdname) ->

  l lit do
    ["[#{metadata.name}]"," • dataError\n"]
    [c.er2,c.er3]

  l lit do
    [" unable to locate ","#{cmdname}"," task in config file."]
    [c.er1,c.warn,c.er1]


print.custom_build = (msg,path,filename)->

  show_name filename

  l show_body do
    path
    [
      (c.grey "unrecognized value provided.") + "\n"
      c.grey "only acceptable value types :\n"
      c.pink "- array of string ( defaults to local )."
      c.pink "- object with restricted keys :"
      c.warn "\n  - "+ data.selected_keys.arr.join "\n  - "
    ].join "\n "

# ----------------------------------------------------------------

print.basicError = (msg,path,filename) ->

  show_name filename

  l show_body path,msg


print.no_match_for_arguments = ->

  l lit do
    [
      "[#{metadata.name}]"
      " • argumentError \n\n"
      "   match for arguments failed.\n\n"
      "   " + (j arguments)
    ]
    [c.er2,c.er3,c.warn,c.pink]

# ----------------------------------------------------------------

internal = {}

internal.normal = hoplon.guard.unary

.wh do

  ([type]) -> (typeof type) isnt \string

  (args,state) !->

    if args[0]

      internal.normal (R.drop 1,args),state


.ar 1,([txt],state) !->

  l lit ["[#{metadata.name}] ",txt],[c.ok,null]

.ar 2,([type,txt_1],state) !->

  switch type
  | \ok            =>

    brac_color = c.ok

    txt_color = c.grey

  | \warn          =>

    brac_color = c.er1

    txt_color = c.grey

  | \err           =>

    brac_color = c.er3

    txt_color = c.er2

  txt_1 = lit [txt_1],[brac_color,txt_color,brac_color]

  internal.normal [type,false,txt_1],state

.ar 3,([type,txt_1,disp],state) ->

  buildname = state.buildname

  switch type
  | \ok            =>

    color_process_name  = c.ok

    color_buildname_dot = c.ok

    color_buildname     = c.ok

    color_finaltxt      = c.ok

  | \warn          =>

    color_process_name  = c.warn

    color_buildname_dot = c.warn

    color_buildname     = c.warn

    color_finaltxt      = c.warn

  | \err            =>

    color_process_name  = c.er3

    color_buildname_dot = c.er3

    color_buildname     = c.er3

    color_finaltxt      = c.er2

  | \err_light      =>

    color_process_name  = c.er1

    color_buildname_dot = c.er1

    color_buildname     = c.er1

    color_finaltxt      = c.er1

  procname = (color_buildname_dot  " • ") + (color_buildname txt_1)

  procdot = " •"

  if not txt_1

    procname = ""

  if buildname

    buildname = (color_buildname_dot " • ") + (color_buildname buildname)

  else

    buildname = ""

  l lit do
    ["[#{metadata.name}]",      buildname,       procname,            procdot,     " " + disp]
    [  color_process_name,           null,           null,color_buildname_dot, color_finaltxt]


.ar 4,([type,txt_1,txt_2,txt_3],state) !->

  normal_internal [type,txt_1,txt_2],state

  l " " + txt_3

.def!

# ----------------------------------------------------------------

internal.verbose = hoplon.guard.unary

.ar 2,([txt_1,txt_2],state) ->

  vl = state.verbose_level

  if (vl is 1)

    disp = txt_1.replace /\'''/g,"'"

  else if (vl > 1)

    disp = txt_2.replace /\'''/g,"'"

  else if (vl is 0)

    return

  l "> " + disp

.ar 1,([txt_1],state) ->

  if state.verbose_level

    disp = txt_1.replace /\'''/g,"'"

    l "> " + disp

.def!


internal.dry = hoplon.guard.unary

.ar 1,([txt],state) !->

  l txt

.ar 2,([type,txt],state) !->

  color = switch type
  | \ok  => c.ok
  | \err => c.er1

  l color "[#{metadata.name}] #{txt}"

.def!


show = {}

show_main = (type) -> ->

    if not @silent

      internal[type] arguments,@

show.normal  = show_main \normal

show.dry     = show_main \dry

show.verbose = -> internal.verbose arguments,@

# ----------------------------------------------------------------

create_logger = (buildname,verbose,silent) ->

  instance                = Object.create show

  instance.buildname      = buildname

  instance.verbose_level  = verbose

  instance.silent         = silent

  instance

# ----------------------------------------------------------------


print_wrap = (f)-> ->

  f ...arguments

  l c.grey "\n[docs] #{metadata.homepage}\n"

  show_stack new Error!

for I,key of print

  if I in [\cmdError] then continue

  print[I] = print_wrap key

print.show-header = -> l lit do

  ["[#{metadata.name}]"," v#{metadata.version}"]
  [c.er1,c.er1]


print.create_logger = create_logger