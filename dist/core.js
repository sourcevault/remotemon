var reg, com, print, data, metadata, readJson, readYaml, be, hop, fs, chokidar, c, lit, spawn, exec, l, z, j, zj, R, most, most_create, create_rsync_cmd, to_bool, create_logger, show, create_continue, create_proc, main, if_show_return_to_watch, entry;
reg = require("./registry");
com = reg.com, print = reg.print, data = reg.data, metadata = reg.metadata;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, hop = com.hop, fs = com.fs;
chokidar = com.chokidar, c = com.c, lit = com.lit, spawn = com.spawn, exec = com.exec;
l = com.l, z = com.z, j = com.j, zj = com.zj, R = com.R, most = com.most, most_create = com.most_create;
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
to_bool = function(x){
  if (x) {
    return true;
  } else {
    return false;
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
  var type, ref$;
  type = arg$[0];
  return (ref$ = typeof type) === 'boolean' || ref$ === 'number';
}, function(args, state){
  if (args[0]) {
    return show(R.drop(1, args), state);
  } else {}
}).ar(3, function(arg$, state){
  var type, procname, buildtxt;
  type = arg$[0], procname = arg$[1], buildtxt = arg$[2];
  switch (type) {
  case 'ok':
    procname = c.ok("[") + c.pink(procname + "") + c.ok("]");
    break;
  case 'warn':
    procname = lit(["[", procname + "", "]"], [c.pink, null, c.pink]);
  }
  return l(lit(["[" + metadata.name + "]", state.buildname + "", procname + "", buildtxt], [c.ok, c.er1, c.ok, c.grey]));
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
create_proc = function(data, logger, cont, options){
  return function*(){
    var locale, i$, len$, txt, cmd, disp, remotetask, E, I, postscript;
    locale = data['exec.locale'];
    logger(locale.length, 'ok', " exec.locale ");
    for (i$ = 0, len$ = locale.length; i$ < len$; ++i$) {
      txt = locale[i$];
      logger('verbose', txt);
      (yield cont(txt));
    }
    if (!data.remotefold || !data.remotehost) {
      (yield 'done');
      return 'beme';
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
    if (remotetask.length && !options.dryRun) {
      cmd = "ssh " + data.ssh + " " + data.remotehost + " 'ls " + data.remotefold + "'";
      try {
        exec(cmd);
      } catch (e$) {
        E = e$;
        l(lit(["[" + metadata.name + "]", " " + data.remotefold, " does not exist, creating new directory .."], [c.ok, c.warn, c.blue]));
        cmd = "ssh " + data.ssh + " " + data.remotehost + " 'mkdir " + data.remotefold + "'";
        (yield cont(cmd));
      }
    }
    for (i$ = 0, len$ = remotetask.length; i$ < len$; ++i$) {
      I = remotetask[i$];
      cmd = ("ssh " + data.ssh + " ") + data.remotehost + " '" + ("cd " + data.remotefold + ";") + I + "'";
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
    (yield 'done');
    return 'beme';
  };
};
main = function(data, buildname, options){
  var logger, cont, is_watch, I, proc, $file_watch, $proc;
  logger = create_logger(buildname, options.verbose);
  cont = create_continue(options.dryRun);
  if (!data.remotefold || !data.remotehost) {
    logger('warn', lit([" ⛔    ", " warn "], [c.er1, c.er1]), " .remotehost or(and) .remotefold not defined.");
  }
  is_watch = to_bool(data.watch && !options.noWatch);
  logger(is_watch, 'ok', "    watching ", c.grey("[ working directory ] → " + process.cwd()));
  logger(is_watch, "> " + (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = data.watch).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push(c.warn(I));
    }
    return results$;
  }()).join(c.pink(" | ")));
  proc = create_proc(data, logger, cont, options);
  $file_watch = most_create(function(add, end, error){
    var watcher;
    if (data.initialize) {
      add('init');
    }
    if (data.watch && !options.noWatch) {
      watcher = chokidar.watch(data.watch, data.chokidar);
      watcher.on('change', add);
      return function(){
        watcher.close();
        end();
      };
    } else {}
  });
  $proc = $file_watch.map(function(changed){
    var $inner;
    $inner = most.generate(proc).recoverWith(function(cmdname){
      l(lit(["[" + metadata.name + "]", "[ ", "⚡️", "    error ", "] ", cmdname], [c.er1, c.er2, c.er3, c.er2, c.er2, c.er1]));
      return most.empty();
    });
    return $inner;
  });
  return $proc.switchLatest();
};
if_show_return_to_watch = function(data, count){
  var ws, i$, ref$, len$, I, torna;
  if (!(count === data.cmd.length)) {
    return false;
  }
  if (data.options.noWatch === true) {
    return false;
  }
  ws = [];
  for (i$ = 0, len$ = (ref$ = data.cmd).length; i$ < len$; ++i$) {
    I = ref$[i$];
    ws.push(data.user[I].watch);
  }
  if (R.sum(ws) === 0) {
    return 'only_config';
  }
  torna = R.zipWith(function(cmd, ws){
    if (ws) {
      return cmd;
    } else {}
  }, data.cmd, ws);
  return R.without([void 8], torna);
};
entry = hop.wh(function(data){
  return data.cmd.length === 0;
}, function(data){
  var $, is_watch, $fin;
  $ = main(data.def, "", data.options);
  is_watch = if_show_return_to_watch(data, 0);
  $fin = $.tap(function(x){
    if (x === 'done') {
      switch (is_watch) {
      case 'only_config':
        return l(lit(["[" + metadata.name + "]", " .. only watching config file ", data.filename + ""], [c.ok, c.warn, c.blue]));
      case false:
        break;
      default:
        return l(c.ok("[" + metadata.name + "] .. returning to watch .."));
      }
    }
  });
  return $fin;
}).def(function(data){
  var user, allstreams, i$, ref$, len$, key, $, F;
  user = data.user;
  allstreams = [];
  for (i$ = 0, len$ = (ref$ = data.cmd).length; i$ < len$; ++i$) {
    key = ref$[i$];
    $ = main(user[key], "[" + key + "]", data.options);
    allstreams.push($);
  }
  F = function(state, x){
    var torna, txt;
    if (x === 'done') {
      state += 1;
    }
    torna = if_show_return_to_watch(data, state);
    if (torna) {
      switch (torna) {
      case 'only_config':
        l(lit(["[" + metadata.name + "]", " .. only watching config file ", data.filename + ""], [c.ok, c.warn, c.blue]));
        break;
      case false:
        break;
      default:
        txt = "[" + torna.join("][") + "]";
        l(lit(["[" + metadata.name + "]", txt, " .. returning to watch .."], [c.ok, c.warn, c.ok]));
      }
      return {
        seed: 0
      };
    }
    return {
      seed: state
    };
  };
  return most.mergeArray(allstreams).loop(F, 0);
});
reg.core = entry;