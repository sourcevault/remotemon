reg = require "./registry"

{com,print} = reg

{l,z,lit} = com

{c,read-json,R,z,show-stack} = com


__dirname + "/../package.json"

|> R.tryCatch do
  (filename) !->

    raw          = read-json filename

    pj           = {}

    pj.name      = raw.name

    pj.repourl   = raw.repository

    pj.homepage  = raw.homepage

    pj.version   = raw.version

    reg.metadata = pj

  !->

    l c.er "- | unable to locate or parse package.json of module."

    show-stack!

# ----------------------------------------------------------------

metadata = reg.metadata

show_name = (filename) ->

  lit do
    ["[#{metadata.name}]","[dataError]\n"]
    [c.er2,c.er3]

  l " " + (c.er1 filename) + "\n"

print.unable-to-read-config-yaml = (filename) ->

  lit do
    ["[#{metadata.name}]","[parseError]"]
    [c.warn,c.er1]

  l "\n  " + c.er2 filename


  l c.grey do
    "\n"
    "  make sure :\n\n"
    "   - correct path is provided.\n"
    "   - .yaml file can be parsed without error.\n"
    "   - .yaml file has no duplicate field."


print.dataError = (msg,path,filename,type) ->


  show_name filename

  l c.grey "  invalid type at :\n"

  init = R.init path
  last = R.last path

  lit do
    ["  ",(init.join "."),("." + last)," <-- error here"]
    [0,c.er1,c.er3,c.er1]

  intro = switch type
  | \data     => "\n  value is "
  | otherwise => "\n  "

  [itype,text] = msg

  switch itype
  | \not-valid =>
    lit [intro,...text,"\n"],[0,c.warn,c.er2]
  | otherwise  =>
    l c.er1 ("\n  " + msg + "\n")


  l c.grey "  please refer to docs to provide valid values."

# ----------------------------------------------------------------

print.flag = (msg,path,filename) ->

  show_name filename

  l c.grey "  invalid type at :\n"

  init = R.init path
  last = R.last path

  lit do
    ["  ",(init.join "."),("." + last)," <-- error here"]
    [0,c.er1,c.er3,c.er1]

  l c.er2 "\n  value is #{msg}\n"

  l c.grey "  please refer to docs to provide valid values."

# ----------------------------------------------------------------

print.incorrect_arg_num = ->

  lit do
    ["[#{metadata.name}]","[inputError]\n"]
    [c.er2,c.er3]


  lit do
    ["  ","incorrect number of arguments for function."]
    [0,c.er1,c.er3,c.er1]



# ----------------------------------------------------------------

print.unable-to-parse-package-json = ->

# ----------------------------------------------------------------

print.req = (props,path,filename) ->

  show_name filename

  [init,last] = R.splitAt -1,path


  lit do
    [
      " required value not present in: "
      "\n\n "
      (init.join ".")
      "." + (last.join ".")
      " <-- error here"
      "\n"
    ]
    [c.grey,0,c.warn,c.er3,c.er2]

  l c.grey " all required value(s) in object:\n"

  l c.er1 " ." + props.join " ."

# ----------------------------------------------------------------

print_wrap = (f)-> ->

  f ...arguments

  l c.grey "\n[docs] #{metadata.homepage}"

  show-stack!

for I,key of print

  print[I] = print_wrap key
