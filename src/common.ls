js-yaml = require 'js-yaml'

render = require 'json-stringify-pretty-compact'

fs = require "fs"

child_process = require "child_process"

R = require "ramda"

optionator = require "optionator"

chokidar = require "chokidar"

chalk = require "chalk"

validator = require "is-my-json-valid"

l = console.log

j = (json) -> l render json

read-yaml = (name) -> js-yaml.safeLoad fs.readFileSync name

read-json = (filename) ->

  fs.readFileSync filename
  |> R.toString
  |> JSON.parse

z = l

main =
  render        :render
  chalk         :chalk
  j             :j
  z             :z
  fs            :fs
  R             :R
  child_process :child_process
  l             :l
  read-yaml     :read-yaml
  js-yaml       :js-yaml
  optionator    :optionator
  chokidar      :chokidar
  read-json     :read-json

module.exports = main
