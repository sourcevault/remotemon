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

com.updateNotifier   = require \update-notifier

child_process        = require \child_process

readline             = require \readline

com.optionParser     = require \option-parser

com.tampax           = require \tampax

com.child_process    = child_process

cp                   = child_process

be                   = hoplon.types

com.readline         = readline

R = hoplon.utils.R

dotpat = be.str.edit R.split "."
.or be.undef.cont []
.wrap!

dotpat.take = (amount,signal) ->

  sig = dotpat signal

  (R.take amount,sig).join "."

com.dotpat = dotpat

# ----------------------------------------------------------------------------

com.spawn = (cmd) ->

  cp.spawnSync do
    cmd
    []
    {shell:'bash',stdio:'inherit',windowsVerbatimArguments:true}

# ----------------------------------------------------------------------------

com.exec = (cmd) -> (child_process.execSync cmd).toString!

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

show_name = (filename) ->

  l lit do
    ["[#{metadata.name}]"," • dataError •\n"]
    [c.er2,c.er3]

  if filename
    l "  " + (c.er1 filename) + "\n"

rdot = /\./

clean_path = R.pipe do
  R.map (txt) ->

    if rdot.exec txt

      return "\"" + txt + "\""

    txt
  R.drop 1
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
    [c.warn,c.er3,c.er2,c.pink]


print.rsyncError = (msg,path,filename,type) ->

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
    ["[#{metadata.name}]"," • inputError •\n"]
    [c.er2,c.er3]

  l lit do
    ["  ","incorrect number of arguments for function."]
    [0,c.er1,c.er3,c.er1]

# ----------------------------------------------------------------

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

print.failed_in_custom_parser = (filename,E) ->

  l lit do
    ["[#{metadata.name}]"," • parseError •"," unable to modify global variable in YAML file."]
    [c.warn,c.er3,c.er1]

  l "\n  " + c.er2 filename + "\n"

  l c.grey E


print.failed_in_tampax_parsing = (filename,E) ->

  l lit do
    ["[#{metadata.name}]"," • parseError •"," yaml/tampex parsing error."]
    [c.warn,c.er2,c.er1]

  l "\n  " + c.er2 filename + "\n"

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


print.in_selected_key = ([vname,cmd_str],path,filename,topmsg) ->

  l lit do
    ["[#{metadata.name}]"," • cmdFailure •\n"]
    [c.er2,c.er3]

  l lit do
    ["  .#{vname}"," is a selected key, cannot be used as a task name.\n"]
    [c.er3,c.warn]

  l lit do
    ["  ",(cmd_str.join " ")]
    [null,c.er1]

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
    ["[#{metadata.name}]"," • dataError •\n"]
    [c.er2,c.er3]

  l lit do
    [" unable to locate ","#{cmdname}"," task in config file(s)."]
    [c.pink,c.warn,c.pink]


print.custom_build = (msg,path,filename)->

  show_name filename

  l show_body do
    path
    [
      (c.grey "unrecognized value provided.") + "\n"
      c.grey "only acceptable value types :\n"
      c.pink "- array of string ( defaults to exec-locale )."
      c.pink "- object with restricted keys :"
      c.warn "\n  - "+ data.selected_keys.arr.join "\n  - "
    ].join "\n "

# ----------------------------------------------------------------

print.basicError = (msg,path,filename,all) ->

  vals = R.filter ((x) -> not (x is '')),all

  show_name filename

  l show_body path,vals[0]


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

normal_internal = hoplon.guard.unary

.wh do

  ([type]) -> (typeof type) isnt \string

  (args,state) ->

    if args[0]

      normal_internal (R.drop 1,args),state

    else then return void

.ar 1,([txt]) !->

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

  txt_1 = lit ["{ ",txt_1," }"],[brac_color,txt_color,brac_color]

  normal_internal [type,false,txt_1],state

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

  procname = (color_buildname_dot  " •") + (color_buildname txt_1)


  if txt_1

    procdot = " •"

  else

    procname = ""

    procdot  = ""


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

verbose_internal = hoplon.guard.unary

.ar 2,([txt_1,txt_2],state) ->

  switch state.verbose_level

  | 1 =>

    disp = txt_1.replace /\'''/g,"'"

  | 2 =>

    disp = txt_2.replace /\'''/g,"'"

  | otherwise =>

    return

  l "> " + disp

.ar 1,([txt_1],state) ->

  if state.verbose_level

    disp = txt_1.replace /\'''/g,"'"

    l "> " + disp

.def!

show = {}

show.normal  = !-> normal_internal arguments,@

show.verbose = !-> verbose_internal arguments,@


# ----------------------------------------------------------------

create_logger = (buildname,verbose) ->

  instance                = Object.create show

  instance.buildname      = buildname

  instance.verbose_level  = verbose

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