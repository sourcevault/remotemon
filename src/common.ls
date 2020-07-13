# --------------------------------------------------------------------------------------

js-yaml       = require 'js-yaml'

js-render     = require 'json-stringify-pretty-compact'

fs            = require "fs"

child_process = require "child_process"

R             = require "ramda"

optionator    = require "optionator"

chokidar      = require "chokidar"

chalk         = require "chalk"

pretty-error  = require "pretty-error"

reg           = require "./registry"

# --------------------------------------------------------------------------------------

l = console.log

z = l

noop = !->

j = (json) !-> l js-render json

read-yaml = (name) -> js-yaml.safeLoad fs.readFileSync name

read-json = (filename) ->

  fs.readFileSync filename
  |> R.toString
  |> JSON.parse

# --------------------------------------------------------------------------------------

pe = {}
# --- private
  ..filterParsedError = null
  ..skip = null
  ..appendStyle = null
  ..init = null
# --- public
  ..main = null

pe.filterParsedError = (Error) ->

  Error._trace = R.drop 4,Error._trace

  Error

pe.skip = (traceLine,lineNumber) ->

  if traceLine.packageName is  "guard-js" then return true

  if traceLine.packageName is  "valleydate" then return true

  if traceLine.dir is "internal/main" then return true

  if traceLine.dir is "internal/modules/cjs" then return true

  if traceLine.what is "Object.print.stack" then return true

  if traceLine.what is "handle.fun.get.entry [as get]" then return true

  return false

pe.appendStyle =
  "pretty-error > header > title > kind":(display: "none")
  "pretty-error > header > colon":(display: "none")
  "pretty-error > header > message":(display:"none")

pe.init = ->

  local = (new prettyError!)

  local.skipNodeFiles!

  local.filterParsedError pe.filterParsedError

  local.skip pe.skip

  local.appendStyle pe.appendStyle

  local

pe.main = pe.init!

show-stack = !->

  str = pe.main.render (new Error!)

  l str

# --------------------------------------------------------

__dirname + "/../package.json"
|> R.tryCatch do
  (filename) !->

    raw = read-json filename

    pj = reg.packageJ

    pj.name = raw.name

    pj.repourl = raw.repository

    pj.homepage = raw.homepage

    pj.version = raw.version

  !->
    l reg.c.dark.er "unable to locate package.json of module."
    show-stack!

# --------------------------------------------------------


main =
  j             :j
  z             :z
  fs            :fs
  R             :R
  l             :l
  noop          :noop
  child_process :child_process
  chalk         :chalk
  read-yaml     :read-yaml
  js-yaml       :js-yaml
  optionator    :optionator
  chokidar      :chokidar
  read-json     :read-json
  show-stack    :show-stack

module.exports = main
