reg = require "./registry"

require "./print"      #  [...load print.js...]

require "./data"       #  [...load data.js....]

require "./core"       #  [...load core.js....]

require "./validator"  #  [...load validator.js...]


{com,print,metadata} = reg

#---------------------------------------------------

{l,z,j,R,fs,lit,c} = com

{read-json,read-yaml,be,j,optionator,hop,exec} = com

#---------------------------------------------------

try

  current_version = (read-json (__dirname + "/../package.json")).version

catch Er

  print.unable-to-parse-package-json!

#---------------------------------------------------

cmd_options =
  prepend: "Usage: remotemon [ config file path ] [ command name ]"
  append : current_version
  options:
     *option: 'help'
      alias: 'h'
      type: 'Boolean'
      description: 'displays help'
     *option: 'config'
      alias: 'c'
      type: 'String'
      description: 'path to configuration file'
     *option: 'verbose'
      alias: 'v'
      type: 'Boolean'
      description: 'verbose messages'


cmdparser = optionator cmd_options

#---------------------------------------------------

validate = {}

filter-for-config-file = R.pipe do
  R.split "\n"
  R.filter (str) -> (str is ".#{metadata.name}.yaml")

validate.config = (opt) ->

  switch R.type opt.config
  | \String =>

    if not (fs.existsSync opt.config)

      lit do
        [ "[#{metadata.name}][Error] cannot find configuration file ","#{opt.config}","."]
        [c.er1,c.warn,c.er1]

      return false

    return opt

  | \Undefined,\Null =>

    name = metadata.name

    raw = exec " ls -lAh . | grep -v '^d' | awk 'NR>1 {print $NF}'"

    isthere = filter-for-config-file raw

    if isthere.length is 1

      lit do
        ["[#{name}] using ",".#{name}.yaml"]
        [c.ok,c.warn]

      opt.config = isthere[0]

      return opt

    raw = exec " ls -lAh .. | grep -v '^d' | awk 'NR>1 {print $NF}'"

    isthere = filter-for-config-file raw

    if isthere.length is 1

      lit do
        ["[#{name}] using ","../.#{name}.yaml"]
        [c.ok,c.warn]

      opt.config = "../" + isthere[0]

      return opt

    lit do
      ["[#{name}][Error] ","config file not provided and .#{name}.yaml also not present."]
      [c.er1,c.warn]

    return false

  | otherwise =>

    lit do
      [ "[#{name}][Error] .config can only be string type."]
      [c.er1,c.warn,c.er1]

    return false



entry = hop

.arn do
  [0,1,2]
  print.incorrect_arg_num
.arma do
  0
  ->

    opt = cmdparser.parseArgv process.argv

    if opt.help

      cmdparser.generateHelp!

      return false

    opt.config = "./test/opts1.yaml" # config

    out = validate.config opt

    out

  (opt)->

    cmd = opt._

    data = {}
      ..cmd       = cmd
      ..filename  = opt.config
      ..verbose   = opt.verbose


    reg.validator data


# .ar 1 , (obj) ->

# .ar 2 , (filename,cmd) ->

.def!






reg.pkg = entry

module.exports = entry