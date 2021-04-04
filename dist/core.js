var ext, com, print, data, metadata, readJson, readYaml, hoplon, fs, most, most_create, exec, chokidar, spawn, readline, ref$, c, R, lit, l, z, j, zj, oxo, be, sanatize_cmd_internal, sanatize_cmd, create_rsync_cmd, execFinale, init_continuation, create_proc, diff, main, entry;
ext = require("./data");
com = ext.com, print = ext.print, data = ext.data;
metadata = com.metadata;
readJson = com.readJson, readYaml = com.readYaml, hoplon = com.hoplon, fs = com.fs, most = com.most, most_create = com.most_create, exec = com.exec, chokidar = com.chokidar, spawn = com.spawn;
readline = com.readline;
ref$ = hoplon.utils, c = ref$.c, R = ref$.R, lit = ref$.lit, l = ref$.l, z = ref$.z, j = ref$.j, zj = ref$.zj;
oxo = hoplon.guard;
be = hoplon.types;
sanatize_cmd_internal = be.str.cont(function(cmd){
  if (cmd.split('\n').length > 1) {
    return '\n' + cmd;
  }
  if (cmd.length > 45) {
    return '\n' + cmd;
  } else {
    return cmd;
  }
}).fix('<< program screwed up >>');
sanatize_cmd = function(txt){
  return sanatize_cmd_internal.auth(txt).value;
};
create_rsync_cmd = function(rsync, remotehost){
  var txt, str, obnormal, obarr, des, src, i$, len$, I, ref$, key, val, cmd;
  txt = "";
  str = rsync.str, obnormal = rsync.obnormal, obarr = rsync.obarr, des = rsync.des, src = rsync.src;
  for (i$ = 0, len$ = str.length; i$ < len$; ++i$) {
    I = str[i$];
    txt += "--" + I + " ";
  }
  for (i$ = 0, len$ = obnormal.length; i$ < len$; ++i$) {
    ref$ = obnormal[i$], key = ref$[0], val = ref$[1];
    txt += "--" + key + "='" + val + "' ";
  }
  for (key in obarr) {
    val = obarr[key];
    txt += ("--" + key + "={") + (fn$()).join(',') + "} ";
  }
  cmd = "rsync " + txt + src.join(" ") + " " + (remotehost + ":" + des[0]);
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
execFinale = function*(data, log, cont){
  var postscript, i$, len$, cmd, results$ = [];
  postscript = data['exec-finale'];
  log.normal(postscript.length, 'ok', " exec-finale ", c.warn(" (" + postscript.length + ") "));
  for (i$ = 0, len$ = postscript.length; i$ < len$; ++i$) {
    cmd = postscript[i$];
    log.verbose(cmd);
    results$.push((yield cont(cmd)));
  }
  return results$;
};
init_continuation = function(buildname, dryRun){
  return function(cmd){
    var status;
    if (dryRun) {
      status = 0;
    } else {
      status = spawn(cmd).status;
    }
    switch (status) {
    case 0:
      return new Promise(function(resolve){
        return setTimeout(resolve, 0);
      });
    default:
      return new Promise(function(resolve, reject){
        return reject([cmd, buildname]);
      });
    }
  };
};
create_proc = function(data, options, log, cont){
  return function*(){
    var locale, i$, len$, cmd, remotehost, ref$, each, disp, remotetask, E, I;
    locale = data['exec-locale'];
    log.normal(locale.length, 'ok', " exec-locale ", c.warn(" (" + locale.length + ") "));
    for (i$ = 0, len$ = locale.length; i$ < len$; ++i$) {
      cmd = locale[i$];
      log.verbose(cmd);
      (yield cont(cmd));
    }
    if (!data.remotehost) {
      if (!data['exec-remote'].length) {
        (yield* execFinale(data, log, cont));
      }
      (yield 'error.core.no_remotehost');
      return;
    }
    if (data.rsync) {
      remotehost = data.remotehost;
      for (i$ = 0, len$ = (ref$ = data.rsync).length; i$ < len$; ++i$) {
        each = ref$[i$];
        cmd = create_rsync_cmd(each, remotehost);
        disp = [" ", each.src.join(" "), " ~> ", remotehost, ":", each.des].join("");
        log.normal('ok', lit([" rsync", " start "], [0, c.warn]), disp);
        log.verbose("....", cmd);
        (yield cont(cmd));
        log.normal('ok', lit([" rsync ", "✔️ ok "], [0, c.ok]));
      }
    }
    remotetask = data['exec-remote'];
    disp = c.warn(" (" + remotetask.length + ") ") + data.remotehost + ":" + data.remotefold;
    log.normal(remotetask.length, 'ok', " exec.remote ", disp);
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
      log.verbose(I, cmd);
      (yield cont(cmd));
    }
    (yield* execFinale(data, log, cont));
    (yield 'done.core.exit');
  };
};
diff = R.pipe(R.aperture(2), R.map(function(arg$){
  var x, y;
  x = arg$[0], y = arg$[1];
  return y - x;
}));
main = function(data, options, log, handle_cmd){
  var I, proc, $file_watch, $proc;
  if (!data.remotehost && data['exec-remote'].length) {
    log.normal('warn', lit([" ⛔    ", " warn "], [c.er1, c.er1]), " remotehost address not defined for task.");
  }
  log.normal(data.watch, 'ok', c.ok(" ↓ watching "), c.grey(" { working directory } → " + process.cwd()), " " + (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = data.watch).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push(c.blue(I));
    }
    return results$;
  }()).join(c.pink(" | ")));
  proc = create_proc(data, options, log, handle_cmd);
  $file_watch = most_create(function(add, end, error){
    var watcher;
    if (data.initialize) {
      add('init');
    }
    if (data.watch) {
      watcher = chokidar.watch(data.watch, data.chokidar);
      watcher.on('change', add);
      return function(){
        watcher.close();
        end();
      };
    }
  });
  $proc = $file_watch.timestamp().loop(function(db, ob){
    var ref$, first, second, fin;
    db.shift();
    db.push(Math.floor(ob.time / 2000));
    ref$ = diff(db), first = ref$[0], second = ref$[1];
    fin = {
      seed: db
    };
    if (first === second) {
      l(lit(["[" + metadata.name + "]", "[ ", "⚡️", "    error ", "] ", "infinite loop detected ", ob.value, " is offending file, ignoring event."], [c.er1, c.er2, c.er3, c.er2, c.er2, c.er1, c.warn, c.er1]));
      fin.value = 'err';
    } else {
      fin.value = 'ok';
    }
    return fin;
  }, [0, 0, 0]).map(function(status){
    if (status === 'err') {
      return most.just('error.core.infinteloop');
    }
    return most.generate(proc).recoverWith(function(arg$){
      var cmdtxt, buildname, txt;
      cmdtxt = arg$[0], buildname = arg$[1];
      txt = sanatize_cmd(cmdtxt);
      if (cmdtxt === undefined) {
        buildname = " << program screwed up >> ";
      }
      l(lit(["[" + metadata.name + "]" + buildname, "[ ", "⚡️", "    error ", "] ", txt], [c.er1, c.er2, c.er3, c.er2, c.er2, c.er1]));
      return most.just('error.core.cmd');
    });
  });
  return $proc.switchLatest();
};
entry = function(data, state){
  var buildname, configs, opts, verbose, logger, handle_cmd, rl;
  if (data.cmd === undefined) {
    buildname = "";
    configs = data.def;
  } else {
    buildname = "[" + data.cmd + "]";
    configs = data.user[data.cmd];
  }
  opts = data.options;
  if (configs.verbose) {
    verbose = configs.verbose;
  } else {
    verbose = opts.verbose;
  }
  logger = print.create_logger(buildname, verbose);
  handle_cmd = init_continuation(buildname, opts.dryRun);
  rl = readline.createInterface({
    input: process.stdin
  });
  rl.on('line', function(input){
    process.stdout.write(input + "\n");
  });
  return main(configs, opts, logger, handle_cmd).tap(function(signal){
    if (signal === undefined) {
      return;
    }
    if (configs.watch) {
      return l(c.ok("[" + metadata.name + "] .. returning to watch .."));
    } else {
      return rl.close();
    }
  });
};
module.exports = entry;