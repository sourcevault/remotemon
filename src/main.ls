reg = require "./registry"

{com,print,data,exec} = reg

#---------------------------------------------------

{l,z,j,R} = com

{read-json,read-yaml,be,j} = com


main = (user-data) !->


  # z user-data







reg.exec = main
