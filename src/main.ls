{z,read-json,read-yaml,R} = require "./common"



init = R.tryCatch do
  (filename) ->
    z read-yaml ""
  ->

    z "error"


  # try

  #   user_file_content =

  # catch E

  #   l do
  #     c.er "[#{module_name}] unable to read yaml config file #{yaml_filename}."



  # read-yaml ""


module.exports = init