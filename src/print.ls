{l,z,chalk,R,guard,guardjs,module-name} = require "./common"

{pretty-error,noops} = require "./common"

# registry = require "./registry"

# c = {}

#   ..ok   = chalk.green.bold
#   ..er   = chalk.hex "FF0000"
#   ..warn = chalk.hex "FFFFCD"
#   ..black = chalk.rgb(128, 128, 128).bold

# repo-url = "https://github.com/sourcevault/valleydate"

# print = {}

# help =
#   c.black "[      docs] #{repo-url}"

# pe = (new prettyError!)

# pe.skipNodeFiles!

# pe.filterParsedError (Error) ->

#   Error._trace = R.drop 4,Error._trace

#   Error

# pe.skip (traceLine,lineNumber) ->

#   if traceLine.packageName is  "guard-js" then return true

#   if traceLine.dir is "internal/modules/cjs" then return true

#   if traceLine.what is "Object.print.stack" then return true

#   if traceLine.what is "handle.fun.get.entry [as get]" then return true

#   return false


# pe.appendStyle do
#   "pretty-error > header > title > kind":(display: "none")
#   "pretty-error > header > colon":(display: "none")
#   "pretty-error > header > message":(display:"none")

