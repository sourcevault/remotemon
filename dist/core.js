var reg, com, print, data, metadata, readJson, readYaml, be, hop, fs, chokidar, c, lit, spawn, exec, l, z, j, R, most, mostCreate, createRsyncCmd, create_logger, cont, create_proc, main, entry;
reg = require("./registry");
com = reg.com, print = reg.print, data = reg.data, metadata = reg.metadata;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, hop = com.hop, fs = com.fs;
chokidar = com.chokidar, c = com.c, lit = com.lit, spawn = com.spawn, exec = com.exec;
l = com.l, z = com.z, j = com.j, R = com.R, most = com.most, mostCreate = com.mostCreate;
createRsyncCmd = function(data){
  var rsync, str, i$, ref$, len$, I, key, cmd;
  rsync = data.rsync;
  str = "";
  for (i$ = 0, len$ = (ref$ = rsync.opt).length; i$ < len$; ++i$) {
    I = ref$[i$];
    switch (typeof I) {
    case 'string':
      str += "--" + I + " ";
      break;
    case 'object':
      key = Object.keys(I)[0];
      str += key + "=" + "\"" + I[key] + "\"" + " ";
    }
  }
  cmd = "rsync " + str + rsync.src.join(" ") + " " + (data.remotehost + ":" + data.remotefold);
  return cmd;
};
create_logger = function(verbose, buildname){
  this.verbose = verbose;
  this.buildname = buildname;
  return this;
};
create_logger.of = function(verbose, buildname){
  return new create_logger(verbose, buildname);
};
create_logger.prototype.full = function(show, procname, buildtxt, verbose){
  var module_name, buildname;
  buildtxt == null && (buildtxt = "");
  if (!show) {
    return;
  }
  module_name = metadata.name;
  buildname = this.buildname;
  lit(["[" + module_name + "]", buildname + "", "[" + procname + "] ", buildtxt], [c.ok, c.warn1, c.ok, c.blue]);
  if (this.verbose && verbose) {
    return l("> " + verbose);
  }
};
create_logger.prototype.part = function(txt){
  if (this.verbose) {
    return l("> " + txt);
  }
};
cont = function(arg$, txt){
  var status;
  status = arg$.status;
  switch (status) {
  case 0:
    return new Promise(function(resolve){
      return setTimeout(resolve, 0);
    });
  default:
    return new Promise(function(resolve, reject){
      return reject(txt);
    });
  }
};
create_proc = function(data, logger){
  return function*(){
    var i$, ref$, len$, txt, status, cmd, disp, I;
    logger.full(data.localbuild.length, " localbuild ");
    for (i$ = 0, len$ = (ref$ = data.localbuild).length; i$ < len$; ++i$) {
      txt = ref$[i$];
      logger.part(txt);
      status = spawn(txt);
      (yield cont(status, txt));
    }
    if (data.rsync) {
      cmd = createRsyncCmd(data);
      disp = [data.rsync.src.join(" "), "->", data.rsync.des].join(" ");
      logger.full(true, " .. attempting rsync.. ", disp, cmd);
      status = spawn(cmd);
      (yield cont(status, cmd));
    }
    disp = data.remotehost + ":" + data.remotefold;
    logger.full(data.remotetask.length, " remotetask ", disp);
    for (i$ = 0, len$ = (ref$ = data.remotetask).length; i$ < len$; ++i$) {
      I = ref$[i$];
      cmd = "ssh -tt -o LogLevel=QUIET " + data.remotehost + " \"" + ("cd " + data.remotefold + ";") + I + "\"";
      logger.part(cmd);
      status = spawn(cmd);
      (yield cont(status, cmd));
    }
    logger.full(data.postscript.length, " postscript ");
    for (i$ = 0, len$ = (ref$ = data.postscript).length; i$ < len$; ++i$) {
      cmd = ref$[i$];
      logger.part(cmd);
      status = spawn(cmd);
      (yield cont(status, cmd));
    }
    return logger.full(true, " done, ..returning to watch.. ");
  };
};
main = function(data, buildname, verbose){
  var logger, $, proc;
  logger = create_logger.of(verbose, buildname);
  logger.full(true, "   watching ", data.watch.join(" , "));
  $ = mostCreate(function(add, end, error){
    chokidar.watch(data.watch, data.chokidar).on('change', add);
    if (data.initialize) {
      add();
    }
  });
  proc = create_proc(data, logger);
  return $.map(function(){
    return most.generate(proc).recoverWith(function(cmdname){
      print.cmdError(cmdname);
      return most.empty();
    });
  }).switchLatest().drain();
};
entry = hop.wh(function(data){
  return data.cmd.length === 0;
}, function(data){
  return main(data.def, "", data.verbose);
}).def(function(data){
  var user, i$, ref$, len$, key, results$ = [];
  user = data.user;
  for (i$ = 0, len$ = (ref$ = data.cmd).length; i$ < len$; ++i$) {
    key = ref$[i$];
    results$.push(main(user[key], "[" + key + "]"));
  }
  return results$;
});
reg.core = entry;