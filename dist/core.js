var reg, com, print, data, metadata, readJson, readYaml, be, hop, fs, chokidar, c, lit, spawn, exec, l, z, j, zj, R, most, most_create, create_rsync_cmd, to_bool, execFinale, create_continue, create_proc, wait, diff, sanatize_cmd, main, disp, entry;
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
execFinale = function*(data, logger, cont){
  var postscript, i$, len$, cmd, results$ = [];
  postscript = data['exec-finale'];
  logger(postscript.length, 'ok', " exec-finale ");
  for (i$ = 0, len$ = postscript.length; i$ < len$; ++i$) {
    cmd = postscript[i$];
    logger('verbose', cmd);
    results$.push((yield cont(cmd)));
  }
  return results$;
};
create_continue = function(dryRun, buildname){
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
        return reject([txt, buildname]);
      });
    }
  };
};
create_proc = function(data, logger, cont, options){
  return function*(){
    var locale, i$, len$, txt, cmd, disp, remotetask, E, I;
    locale = data['exec-locale'];
    logger(locale.length, 'ok', " exec-locale ");
    for (i$ = 0, len$ = locale.length; i$ < len$; ++i$) {
      txt = locale[i$];
      logger('verbose', txt);
      (yield cont(txt));
    }
    if (!data.remotehost) {
      if (!data['exec-remote'].length) {
        (yield* execFinale(data, logger, cont));
      }
      (yield 'done');
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
    remotetask = data['exec-remote'];
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
    (yield* execFinale(data, logger, cont));
    (yield 'done');
  };
};
wait = function(f, t){
  return setTimeout(f, t);
};
diff = R.pipe(R.aperture(2), R.map(function(arg$){
  var x, y;
  x = arg$[0], y = arg$[1];
  return y - x;
}));
sanatize_cmd = function(cmd){
  if (cmd.split('\n').length > 1) {
    return '\n' + cmd;
  } else {
    return cmd;
  }
};
main = function(data, buildname, options){
  var logger, cont, is_watch, I, proc, $file_watch, $proc;
  logger = print.create_logger(buildname, options.verbose);
  cont = create_continue(options.dryRun, buildname);
  l("");
  if (!data.remotehost && data['exec-remote'].length) {
    logger('warn', lit([" ⛔    ", " warn "], [c.er1, c.er1]), " remotehost address not defined for task.");
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
      return most.just('done');
    }
    return most.generate(proc).recoverWith(function(arg$){
      var cmdtxt, buildname;
      cmdtxt = arg$[0], buildname = arg$[1];
      l(lit(["[" + metadata.name + "]" + buildname, "[ ", "⚡️", "    error ", "] ", sanatize_cmd(cmdtxt)], [c.er1, c.er2, c.er3, c.er2, c.er2, c.er1]));
      return most.just('done');
    });
  });
  return $proc.switchLatest();
};
disp = {};
disp.single = hop.ma(function(data, signal){
  if (signal !== 'done') {
    return false;
  }
  if (data.options.noWatch) {
    return false;
  }
  if (data.def.watch === false) {
    return 'only_config';
  }
  return true;
}, function(type, data, signal){
  switch (type) {
  case 'only_config':
    return l(lit(["[" + metadata.name + "]", " .. only watching config file ", data.filename + ""], [c.ok, c.warn, c.blue]));
  default:
    return l(c.ok("[" + metadata.name + "] .. returning to watch .."));
  }
}).def();
disp.multiple = hop.ma(function(arg$, signal){
  var count, data, ws, res$, i$, ref$, len$, I, torna;
  count = arg$[0], data = arg$[1];
  if (signal !== 'done') {
    return false;
  }
  if (count !== data.cmd.length) {
    return false;
  }
  if (data.options.noWatch === true) {
    return false;
  }
  res$ = [];
  for (i$ = 0, len$ = (ref$ = data.cmd).length; i$ < len$; ++i$) {
    I = ref$[i$];
    res$.push(data.user[I].watch);
  }
  ws = res$;
  if (R.sum(ws) === 0) {
    return 'only_config';
  }
  torna = R.zipWith(function(cmd, ws){
    if (ws) {
      return cmd;
    } else {}
  }, data.cmd, ws);
  return R.without([void 8], torna);
}, function(torna, arg$){
  var count, data, txt;
  count = arg$[0], data = arg$[1];
  switch (torna) {
  case 'only_config':
    l(lit(["[" + metadata.name + "]", " .. only watching config file ", data.filename + ""], [c.ok, c.warn, c.blue]));
    break;
  default:
    txt = "[" + torna.join("][") + "]";
    l(lit(["[" + metadata.name + "]", txt, " .. returning to watch .."], [c.ok, c.er1, c.ok]));
  }
  return {
    seed: [1, data]
  };
}).def(function(arg$, signal){
  var count, data;
  count = arg$[0], data = arg$[1];
  if (signal === 'done') {
    return {
      seed: [count + 1, data]
    };
  } else {
    return {
      seed: [count, data]
    };
  }
});
entry = hop.wh(function(data){
  return data.cmd.length === 0;
}, function(data){
  var $, $fin;
  $ = main(data.def, "", data.options);
  $fin = $;
  $fin = $.tap(function(signal){
    return disp.single(data, signal);
  });
  return $fin;
}).def(function(data){
  var user, allstreams, i$, ref$, len$, key, $;
  user = data.user;
  allstreams = [];
  for (i$ = 0, len$ = (ref$ = data.cmd).length; i$ < len$; ++i$) {
    key = ref$[i$];
    $ = main(user[key], "[" + key + "]", data.options);
    allstreams.push($);
  }
  return most.mergeArray(allstreams).loop(disp.multiple, [1, data]);
});
reg.core = entry;