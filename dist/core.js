var ext, com, print, data, metadata, readJson, readYaml, hoplon, fs, most, most_create, exec, chokidar, spawn, readline, dotpat, ref$, c, R, lit, l, z, j, zj, oxo, be, sanatize_cmd_internal, sanatize_cmd, create_rsync_cmd, execFinale, init_continuation, create_proc, diff, main, $Empty, handle_fin, resolve_signal, entry;
ext = require("./data");
com = ext.com, print = ext.print, data = ext.data;
metadata = com.metadata;
readJson = com.readJson, readYaml = com.readYaml, hoplon = com.hoplon, fs = com.fs, most = com.most, most_create = com.most_create, exec = com.exec, chokidar = com.chokidar, spawn = com.spawn;
readline = com.readline, dotpat = com.dotpat;
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
  return function*(cmd, type){
    var status;
    type == null && (type = 'async');
    if (dryRun) {
      status = 0;
    } else {
      status = spawn(cmd).status;
    }
    if (status !== 0) {
      switch (type) {
      case 'async':
        (yield new Promise(function(resolve, reject){
          return reject([cmd, buildname]);
        }));
        break;
      case 'sync':
        return [cmd, buildname];
      }
    }
    return 'ok';
  };
};
create_proc = function(data, options, log, cont, rl){
  return function*(){
    var locale, i$, len$, cmd, remotehost, ref$, each, disp, status, remotetask, tryToSSH, checkDir, mkdir, E, userinput, I;
    locale = data['exec-locale'];
    log.normal(locale.length, 'ok', " exec-locale ", c.warn(" (" + locale.length + ") "));
    for (i$ = 0, len$ = locale.length; i$ < len$; ++i$) {
      cmd = locale[i$];
      log.verbose(cmd);
      (yield* cont(cmd));
    }
    if (!data.remotehost) {
      if (!data['exec-remote'].length) {
        (yield* execFinale(data, log, cont));
        (yield 'done.core.exit');
      } else {
        (yield 'error.core.no_remotehost');
      }
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
        status = (yield* cont(cmd, 'sync'));
        if (status !== 'ok') {
          log.normal('warn', lit([" rsync", " break "], [c.pink, c.er3]), "");
          (yield new Promise(fn$));
        }
      }
    }
    remotetask = data['exec-remote'];
    disp = lit([" (" + remotetask.length + ") ", data.remotehost + ":" + data.remotefold], [c.warn, c.grey]);
    log.normal(remotetask.length, 'ok', " exec.remote ", disp);
    if (remotetask.length && !options.dryRun) {
      tryToSSH = "ssh " + data.ssh + " " + data.remotehost + " 'ls'";
      checkDir = "ssh " + data.ssh + " " + data.remotehost + " 'ls " + data.remotefold + "'";
      mkdir = "ssh " + data.ssh + " " + data.remotehost + " 'mkdir " + data.remotefold + "'";
      try {
        exec(tryToSSH);
      } catch (e$) {
        E = e$;
        l(lit(["[" + metadata.name + "]", " unable to ssh to remote address ", data.remotehost, "."], [c.er2, c.warn, c.er3, c.grey]));
        (yield 'error.validator.unable_to_ssh');
        return;
      }
      try {
        exec(checkDir);
      } catch (e$) {
        E = e$;
        userinput = (yield new Promise(function(resolve){
          var Q;
          Q = lit(["[" + metadata.name + "]", " " + data.remotefold, " does not exist on remote, do you want to create directory ", data.remotehost + ":" + data.remotefold, " ? [y/n] "], [c.ok, c.warn, c.grey, c.warn, c.grey]);
          return rl.question(Q, function(answer){
            if (answer === 'y' || answer === 'Y') {
              resolve(true);
              return;
            }
            resolve(false);
          });
        }));
        if (userinput) {
          (yield* cont(mkdir));
          log.normal('ok', " exec.remote ", lit(['[✔️ ok ]', " " + data.remotehost + ":" + data.remotefold + " ", "created."], [c.ok, c.warn, c.ok]));
        }
      }
    }
    for (i$ = 0, len$ = remotetask.length; i$ < len$; ++i$) {
      I = remotetask[i$];
      cmd = ("ssh " + data.ssh + " ") + data.remotehost + " '" + ("cd " + data.remotefold + ";") + I + "'";
      log.verbose(I, cmd);
      (yield* cont(cmd));
    }
    (yield* execFinale(data, log, cont));
    (yield 'done.core.exit');
    function fn$(resolve, reject){
      return reject(status);
    }
  };
};
diff = R.pipe(R.aperture(2), R.map(function(arg$){
  var x, y;
  x = arg$[0], y = arg$[1];
  return y - x;
}));
main = function(data, options, log, handle_cmd, rl){
  var I, proc, $file_watch, $proc;
  log.normal(data.watch, 'ok', c.ok("  ↓ watching "), c.grey(" { working directory } → " + process.cwd()), " " + (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = data.watch).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push(c.blue(I));
    }
    return results$;
  }()).join(c.pink(" | ")));
  proc = create_proc(data, options, log, handle_cmd, rl);
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
    return most.generate(proc);
  });
  return $proc.switchLatest();
};
$Empty = most.empty();
handle_fin = function(signal, config, log, rl, opts){
  var all_watches_are_closed, en;
  all_watches_are_closed = !(config.watch || opts.watch_config_file);
  if (!config.watch) {
    rl.close();
  }
  if (all_watches_are_closed) {
    return most.throwError([signal + ".closed", log]);
  }
  if (opts.watch_config_file && !config.watch) {
    en = ".open_only_config";
  } else {
    en = '.open';
  }
  return most.just([signal + en, log]);
};
resolve_signal = be.arr.on(1, be.str.fix(' << program screwed up >> ')).on(0, be.str.fix('<< program screwed up >>').cont(function(cmd){
  cmd = cmd.replace(/'''/g, "'");
  if (cmd.split('\n').length > 1) {
    return '\n' + cmd;
  }
  if (cmd.length > 45) {
    return '\n' + cmd;
  } else {
    return cmd;
  }
})).cont(function(arg$){
  var cmdtxt, buildname;
  cmdtxt = arg$[0], buildname = arg$[1];
  l(lit(["[" + metadata.name + "]" + buildname, "[ ", "⚡️", "    error ", "] ", cmdtxt], [c.er1, c.er2, c.er3, c.er2, c.er2, c.er1]));
  return 'error.core.cmd';
}).alt(be.str).cont(handle_fin).fix($Empty);
entry = function(data, state){
  return z(data, state);
};
module.exports = entry;