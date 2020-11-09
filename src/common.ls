# --------------------------------------------------------------------------------------

fs            = require "fs"

flyd          = require "flyd"

R             = require "ramda"

js-yaml       = require 'js-yaml'

hop           =  require "hoplon"

chokidar      = require "chokidar"

cc            = require "cli-color"

be            = require "valleydate"

optionator    = require "optionator"

pretty-error  = require "pretty-error"

child_process = require "child_process"

jspc          = require "@aitodotai/json-stringify-pretty-compact"

# --------------------------------------------------------------------------------------

l = console.log

z = l

{execSync} = require "child_process"

exec = (cmd)->  (execSync cmd).toString!

noop = !->

j = (x) -> l jspc do
  x
  {
    maxLength:30
    margins:true
  }

read-yaml = (name) -> js-yaml.safeLoad fs.readFileSync name


read-json = (filename) ->

  fs.readFileSync filename
  |> R.toString
  |> JSON.parse

# -------------------------------------------------------------------------------------------------------

pe = new prettyError!

pe.skipNodeFiles!

pe.filterParsedError (Error) ->

  Error._trace = R.takeLast 6,Error._trace

  Error

pe.skip (traceLine,lineNumber) ->


  if (traceLine.dir is "internal/modules/cjs") then return true

  if (traceLine.dir is "internal/modules") then return true

  if (R.includes "valleydate",traceLine.packages) then return true

  return false


pe.appendStyle do
  "pretty-error > header > title > kind":(display: "none")
  "pretty-error > header > colon":(display: "none")
  "pretty-error > header > message":(display:"none")

# -  - - - - - - - - - - - - - - - - - - - - - - - - --  - - - - - - - - - - - - - - - - - - - - - - - - -

show-stack = !->

  str = pe.render (new Error!)

  l str

# -  - - - - - - - - - - - - - - - - - - - - - - - - --  - - - - - - - - - - - - - - - - - - - - - - - - -


lit = (strs,cols) ->

    if strs.length > cols.length

      diff = strs.length - cols.length

      I = cols.length

      In = strs.length

      while I < In

        cols[I] = null

        I += 1

    lit.internal strs,cols

lit.internal = R.pipe do
  R.zipWith (x,f) ->
    switch R.type f
    | \Function => f x
    | otherwise => x
  R.join ""
  console.log

# -  - - - - - - - - - - - - - - - - - - - - - - - - --  - - - - - - - - - - - - - - - - - - - - - - - - -

c = {}
  ..ok    = cc.xterm 2
  ..er1   = cc.xterm 3
  ..er2   = cc.xterm 13
  ..er3   = cc.xterm 1
  ..warn  = cc.xterm 11
  ..grey  = cc.xterm 8



main =
  j             :j
  z             :z
  R             :R
  l             :l
  c             :c
  be            :be
  fs            :fs
  lit           :lit
  hop           :hop
  exec          :exec
  flyd          :flyd
  noop          :noop
  js-yaml       :js-yaml
  chokidar      :chokidar
  read-yaml     :read-yaml
  read-json     :read-json
  optionator    :optionator
  show-stack    :show-stack
  pretty-error  :pretty-error
  child_process :child_process

module.exports = main