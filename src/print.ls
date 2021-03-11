com = {}
  ..metadata   = {}
    ..name     = null
    ..repourl  = null
    ..homepage = null
    ..version  = null

com.fs               = require \fs

com.most             = require \most

com.chokidar         = require \chokidar

com.optionator       = require \optionator

hoplon               = require \hoplon

com.hoplon           = hoplon

com.most_create      = (require "@most/create").create

child_process        = require \child_process

com.child_process    = child_process

com.tampax           = require \tampax

com.updateNotifier   = require \update-notifier

com.spawn            = (cmd) ->

  child_process.spawnSync cmd,{shell:true,stdio:"inherit"}

com.exec             = (cmd) -> (child_process.execSync cmd).toString!

com.read-json = (filename) ->

  com.fs.readFileSync filename
  |> com.hoplon.utils.R.toString
  |> JSON.parse

print = {}

# ----------------------------------------------------------------------------

export com,print

# ----------------------------------------------------------------------------

{c,l,lit,j,read-json,R,z,create_stack} = hoplon.utils

show_stack = create_stack 2,[]

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

    show_stack!

# ----------------------------------------------------------------

metadata = com.metadata

show_name = (filename) ->

  l lit do
    ["[#{metadata.name}]","[dataError]\n"]
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

  [init,last] =  clean_path path

  txt =
    [
      "  " + init.join "."
      "." + last.join "."
      " <-- error here"
    ]

  if msg
    txt.push "\n\n #{msg}","  "

  l lit do
    txt
    [c.warn,c.er3,c.er2,c.pink]

print.unable-to-read-config-yaml = (filename) ->

  l lit do
    ["[#{metadata.name}]","[parseError]"]
    [c.warn,c.er1]

  l "\n  " + c.er2 filename

  emsg = [
    "\n"
    c.pink "  make sure :\n\n"
    c.blue "   - correct path is provided.\n"
    c.blue "   - .yaml file can be parsed without error.\n"
    c.blue "   - .yaml file has no duplicate field."
    ]

  l c.grey emsg.join ""


print.rsyncError = (msg,path,filename,type) ->

  show_name filename

  l show_body path

  [itype,imsg] = msg

  switch itype
  | \duo =>
    l lit ["\n  ",("."+ imsg[0]),imsg[1]],[0,c.er3,c.pink]
  | \uno =>
    l lit ["\n  ",imsg],[0,c.er1]


  l c.grey "\n  please refer to docs to provide valid values."

# ----------------------------------------------------------------

print.incorrect_arg_num = ->

  l lit do
    ["[#{metadata.name}]","[inputError]\n"]
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
    ["[#{metadata.name}][ cmdFailure ] ",cmdname]
    [c.er2,c.warn]

print.ob_in_str_list = ([type],path,filename) ->

  show_name filename

  txt = switch type
  | \object       => "object not accepted in string list."
  | \empty_object => "empty object found, it's likely a YAML alias referencing issue."

  l show_body do
    path
    txt

print.failed_in_tampex_parsing = (filename) ->

  l lit do
    ["[#{metadata.name}]","[parseError]"]
    [c.warn,c.er1]

  l "\n  " + c.er2 filename

  emsg = [
    "\n"
    c.pink "  yaml/tampex parsing error."
    ]

  l c.grey emsg.join ""


print.in_selected_key = ([vname,cmd_str],path,filename,topmsg) ->

  l lit do
    ["[#{metadata.name}]","[ cmdFailure ] \n"]
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


print.usercmd_not_defined = (msg,path,filename) ->

  show_name filename

  l lit do
    ["  #{msg}"," is not a valid user defined task."]
    [c.warn,c.er2]

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
      "[argumentError]\n\n"
      "   match for arguments failed.\n\n"
      "   " + (j arguments)
    ]
    [c.er2,c.er3,c.warn,c.pink]

# ----------------------------------------------------------------

create_logger = (buildname,verbose) ->

  ob = {buildname,verbose}

  -> show arguments,ob


show = hoplon.guard.unary

.wh do

  ([type]) -> (typeof type) in [\boolean \number]

  (args,state) ->

    if args[0]

      show (R.drop 1,args),state

    else then return void


.ar 3,([type,procname,buildtxt],state) ->

  buildname = state.buildname

  switch type
  | \ok            =>

    procname = (c.ok "[") + (c.pink "#{procname}") + (c.ok "]")

  | \warn          =>

    procname = lit ["[","#{procname}","]"],[c.pink,null,c.pink]

  | \no_buildname  =>

    buildname = ""

  l lit do
    ["[#{metadata.name}]",buildname,"#{procname}",buildtxt]
    [c.ok,c.er1,c.ok,c.grey]


.ar 2,
  ([type,txt],state) ->
    switch type
    | \verbose =>

      if state.verbose
        l ("> " + txt)

    | otherwise =>

      show [type,txt,""],state


.ar 1,([txt]) -> l txt

.def!

# ----------------------------------------------------------------

print_wrap = (f)-> ->

  f ...arguments

  l c.grey "\n[docs] #{metadata.homepage}\n"

  show_stack new Error!

for I,key of print

  if I in [\cmdError] then continue

  print[I] = print_wrap key

print.show-header = -> l lit do
  ["[#{metadata.name}]","[     version ]"," #{metadata.version}"]
  [c.ok,c.grey,c.grey]

print.create_logger = create_logger

print.show = (disp,txt) !->

  if disp

    switch typeof disp

    | \string   =>

      num = parseInt disp[0]

      l (c.ok "[#{metadata.name}]"),txt[num]

    | otherwise =>

      l (c.ok "[#{metadata.name}]"),txt

