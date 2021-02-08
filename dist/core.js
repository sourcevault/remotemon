var reg, com, print, data, metadata, readJson, readYaml, be, hop, fs, chokidar, c, lit, spawn, exec, l, z, j, R, most, most_create, create_rsync_cmd, create_logger, show, create_continue, create_proc, main, entry;
reg = require("./registry");
com = reg.com, print = reg.print, data = reg.data, metadata = reg.metadata;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, hop = com.hop, fs = com.fs;
chokidar = com.chokidar, c = com.c, lit = com.lit, spawn = com.spawn, exec = com.exec;
l = com.l, z = com.z, j = com.j, R = com.R, most = com.most, most_create = com.most_create;
create_rsync_cmd = function(data){
  var rsync, txt, str, obnormal, obarr, des, src, i$, len$, I, ref$, key, val, cmd;
  rsync = data.rsync;
  txt = "";
  str = rsync.str, obnormal = rsync.obnormal, obarr = rsync.obarr, des = rsync.des, src = rsync.src;
  for (i$ = 0, len$ = str.length; i$ < len$; ++i$) {
    I = str[i$];
    txt += "--" + I + " ";
  }
  for (i$ = 0, len$ = obnormal.length; i$ < len$; ++i$) {
    ref$ = obnormal[i$], key = ref$[0], val = ref$[1];
    txt += key + "='" + val + "' ";
  }
  for (key in obarr) {
    val = obarr[key];
    txt += ("--" + key + "={") + (fn$()).join(',') + "} ";
  }
  cmd = "rsync " + txt + src.join(" ") + " " + (data.remotehost + ":" + des[0]);
  return cmd;
  function fn$(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = val).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push("'" + I + "'");
    }
    return results$;
  }
};
create_logger = function(buildname, verbose){
  var ob;
  ob = {
    buildname: buildname,
    verbose: verbose
  };
  return function(){
    return show(arguments, ob);
  };
};
show = hop.unary.wh(function(arg$){
  var type;
  type = arg$[0];
  return typeof type === 'number';
}, function(args, state){
  switch (args[0]) {
  case 0:
    break;
  default:
    return show(R.drop(1, args), state);
  }
}).ar(3, function(arg$, state){
  var type, procname, buildtxt;
  type = arg$[0], procname = arg$[1], buildtxt = arg$[2];
  switch (type) {
  case 'ok':
    procname = c.ok("[") + c.grey(procname + "") + c.ok("]");
    break;
  case 'warn':
    procname = lit(["[", procname + "", "]"], [c.pink, null, c.pink]);
  }
  return l(lit(["[" + metadata.name + "]", state.buildname + "", procname + "", buildtxt], [c.ok, c.pink, c.ok, c.pink]));
}).ar(2, function(arg$, state){
  var type, txt;
  type = arg$[0], txt = arg$[1];
  switch (type) {
  case 'verbose':
    if (state.verbose) {
      return l("> " + txt);
    }
    break;
  default:
    return show([type, txt, ""], state);
  }
}).ar(1, function(arg$){
  var txt;
  txt = arg$[0];
  return l(txt);
}).def();
create_continue = function(dryRun){
  return function(txt){
    var status;
    if (dryRun) {
      status = 0;
    } else {
      status = spawn(txt).status;
    }
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
};
create_proc = function(data, logger, cont){
  return function*(){
    var locale, i$, len$, txt, cmd, disp, remotetask, I, postscript;
    locale = data['exec.locale'];
    logger(locale.length, 'ok', " exec.locale ");
    for (i$ = 0, len$ = locale.length; i$ < len$; ++i$) {
      txt = locale[i$];
      logger('verbose', txt);
      (yield cont(txt));
    }
    if (!data.remotefold || !data.remotehost) {
      (yield null);
      return;
    }
    if (data.rsync) {
      cmd = create_rsync_cmd(data);
      disp = [" ", data.rsync.src.join(" "), " ~> ", data.remotehost, ":", data.rsync.des].join("");
      logger('ok', lit([" rsync", " start "], [0, c.warn]), disp);
      logger('verbose', cmd);
      (yield cont(cmd));
      logger('ok', lit([" rsync", "    ✔️ "], [0, c.ok]));
    }
    disp = " " + data.remotehost + ":" + data.remotefold;
    remotetask = data['exec.remote'];
    logger(remotetask.length, 'ok', " exec.remote ", disp);
    for (i$ = 0, len$ = remotetask.length; i$ < len$; ++i$) {
      I = remotetask[i$];
      cmd = "ssh -tt -o LogLevel=QUIET " + data.remotehost + " \"" + ("cd " + data.remotefold + ";") + I + "\"";
      logger('verbose', cmd);
      (yield cont(cmd));
    }
    postscript = data['exec.finale'];
    logger(postscript.length, 'ok', " exec.finale ");
    for (i$ = 0, len$ = postscript.length; i$ < len$; ++i$) {
      cmd = postscript[i$];
      logger('verbose', cmd);
      (yield cont(cmd));
    }
    (yield null);
  };
};
main = function(data, buildname, verbose, dryRun){
  var logger, cont, I, $, proc;
  logger = create_logger(buildname, verbose);
  cont = create_continue(dryRun);
  if (!data.remotefold || !data.remotehost) {
    logger('warn', lit([" ⛔    ", " warn "], [c.pink, c.warn]), ".remotemon or(and) .remotehost not defined.");
  }
  logger('ok', "    watching ", c.grey("[ working directory ] → " + process.cwd()));
  logger("> " + (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = data.watch).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push(c.warn(I));
    }
    return results$;
  }()).join(c.pink(" | ")));
  $ = most_create(function(add, end, error){
    chokidar.watch(data.watch, data.chokidar).on('change', add);
    if (data.initialize) {
      add();
    }
  });
  proc = create_proc(data, logger, cont);
  return $.map(function(){
    return most.generate(proc).recoverWith(function(cmdname){
      l(lit(["[" + metadata.name + "]", "[ ", "⚡️", "    error ", "] ", cmdname], [c.er1, c.er2, c.er3, c.er2, c.er2, c.er1]));
      return most.empty();
    });
  }).switchLatest();
};
entry = hop.wh(function(data){
  return data.cmd.length === 0;
}, function(data){
  var $;
  $ = main(data.def, "", data.verbose, data.dryRun);
  return $.tap(function(x){
    if (x === null) {
      return l(c.ok("[" + metadata.name + "] .. returning to watch .."));
    }
  }).drain();
}).def(function(data){
  var user, allstreams, i$, ref$, len$, key, $, F;
  user = data.user;
  allstreams = [];
  for (i$ = 0, len$ = (ref$ = data.cmd).length; i$ < len$; ++i$) {
    key = ref$[i$];
    $ = main(user[key], "[" + key + "]", data.verbose, data.dryRun);
    allstreams.push($);
  }
  F = function(state, x){
    var txt;
    if (x === null) {
      state += 1;
    }
    if (state === data.cmd.length) {
      txt = "[" + data.cmd.join("][") + "]";
      l(lit(["[" + metadata.name + "]", txt, " .. returning to watch .."], [c.ok, c.pink, c.ok]));
      return {
        seed: 0
      };
    }
    return {
      seed: state
    };
  };
  return most.mergeArray(allstreams).loop(F, 0).drain();
});
reg.core = entry;