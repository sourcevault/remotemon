reg = require "./registry"

{com,print,data,metadata} = reg

defsymbol = Symbol "default"
#---------------------------------------------------

{l,z,j,R} = com

{read-json,read-yaml,be,hop,exec,fs} = com

{chokidar,c,lit} = com

create-rsync-cmd = (data) ->

  rsync = data.rsync

  str = ""

  for I in rsync.flags

    switch typeof I
    | \string =>

      str += "--" + I + " "

    | \object =>

      key = (Object.keys I)[0]

      str += key + "=" + "\"" + I[key] + "\"" + " "

  "rsync " + str + rsync.src + " " + (data.remotehost + ":" + data.remotefold)


cast = (data,buildname,filename,verbose) -> ->

  name = metadata.name

  if not (data.localbuild.length is 0)

    lit ["[#{name}][ localbuild ]#{buildname} "],[c.ok,c.warn]

  for I in data.localbuild

    if verbose

      l ("> " + I)

    try

      l exec I

  rsync-cmd = create-rsync-cmd data

  str = [data.rsync.src,"->","[ " + (data.rsync.des.join " ") + " ]"].join " "

  if verbose

    lit ["[#{name}][      rsync ]#{buildname} ",str],[c.ok,c.warn]

    l ("> " + rsync-cmd)

  else


    lit ["[#{name}][      rsync ]#{buildname} ",str],[c.ok,c.warn]

    try

      l exec rsycn-cmd

  try


    str =  data.remotehost + " " + data.remotefold

    lit ["[#{name}][ remotetask ]#{buildname} ",str],[c.ok,c.warn]

    for I in data.remotetask

      cmd = ("ssh " + data.remotehost + " \"" + "cd #{data.remotefold};" + I + "\"")

      if verbose

        l "> " + cmd

      try

        l exec cmd


main = (data,buildname,filename,verbose) ->

  cmdtext = switch buildname
  | defsymbol => ""
  | otherwise => "[#{buildname}]"

  G = cast data,cmdtext,filename,verbose

  lit ["[#{metadata.name}][   watching ]#{cmdtext} ","#{data.watch.join ' , '}"],[c.ok,c.warn]

  chokidar.watch data.watch,data.chokidar

  .on \change,G

  if data.initialize

    G!


entry = hop

.wh do

  (data) -> data.cmd.length is 0

  (data) ->

    main data.def,defsymbol,data.filename,data.verbose

.def (data) ->

  l c.warn "[#{metadata.name}] #{metadata.version}"

  user = data.user

  for key in data.cmd

    main user[key],key,data.filename,data.verbose


reg.core = entry



