var ext, com, print, data, metadata, ref$, l, z, j, R, readJson, exec, fs, tampax, most_create, most, c, lit, chokidar, spawn, readline, dotpat, zj, noop, be, log, tlog, maybe, ME, rm, util, filterForConfigFile, sdir, get_all_yaml_files, unu, rm_all_undef, is_true, is_false, grouparr, organize_rsync, karr, mergeF, vre, yaml_tokenize, vars, isref, modifyYaml, $tampaxParse, handle_error, rmdef, only_str, exec_list_option, main_all, main_repeat, reparse_config_file, create_rsync_cmd, execFinale, prime_process, improve_signal, $empty, resolve_signal, print_final_message, diff, init_user_watch, init_continuation, zero, check_if_empty, create_logger, core, init_config_file_watch, entry, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
ext = require("./data");
com = ext.com, print = ext.print, data = ext.data, metadata = ext.metadata;
ref$ = com.hoplon.utils, l = ref$.l, z = ref$.z, j = ref$.j, R = ref$.R;
readJson = com.readJson, exec = com.exec, fs = com.fs, tampax = com.tampax, most_create = com.most_create, most = com.most, metadata = com.metadata, c = com.c, lit = com.lit, chokidar = com.chokidar, spawn = com.spawn, readline = com.readline;
dotpat = com.dotpat;
ref$ = com.hoplon.utils, zj = ref$.zj, j = ref$.j, lit = ref$.lit, c = ref$.c, R = ref$.R, noop = ref$.noop;
be = com.hoplon.types;
log = function(x){
  return l(x);
};
tlog = be.tap(log);
maybe = be.maybe;
ME = {};
rm = {};
util = {};
filterForConfigFile = R.pipe(R.split("\n"), R.filter(function(str){
  return str === "." + metadata.name + ".yaml";
}));
sdir = function(dirname){
  var out;
  return out = R.map(function(x){
    return dirname + "/" + x;
  })(
  R.filter(function(str){
    return str === "." + metadata.name + ".yaml";
  })(
  R.split("\n")(
  exec(
  " ls -lAh " + dirname + " | grep -v '^d' | awk 'NR>1 {print $NF}'"))));
};
get_all_yaml_files = function(custom){
  var fin, upperPath;
  fin = [];
  if (fs.existsSync(custom)) {
    fin.push(custom);
  }
  fin.push.apply(fin, sdir(process.cwd()));
  upperPath = R.init(process.cwd().split("/")).join("/");
  fin.push.apply(fin, sdir(upperPath));
  return fin;
};
ME.findfile = function(filename){
  var allfiles, filenames, I;
  allfiles = get_all_yaml_files(filename);
  if (allfiles.length === 0) {
    l(lit(["[" + metadata.name + "]", "[Error]", " cannot find ANY configuration file."], [c.er3, c.er1, c.warn]));
    return false;
  }
  filenames = c.er1("{ ") + (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = allfiles).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push(c.warn(I));
    }
    return results$;
  }()).join(c.er1(" } { ")) + c.er1(" }");
  l(lit(["[" + metadata.name + "]", " using ", filenames], [c.ok, null, null]));
  return allfiles;
};
ME.recursive_str_list = be.arr.map(be.arr.and(function(arr){
  var ret;
  ret = ME.recursive_str_list.auth(arr);
  if (ret['continue']) {
    return true;
  }
  return [false, ret.message, ret.path];
}).cont(R.flatten).or(be.obj.and(function(obj){
  var keys;
  keys = Object.keys(obj);
  switch (keys.length) {
  case 0:
    return [false, [':ob_in_str_list', 'empty_object']];
  default:
    return [false, [':ob_in_str_list', 'object']];
  }
})).or(be.str).or(be.undefnull)).edit(function(list){
  var out, i$, len$, I;
  out = [];
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    I = list[i$];
    switch (R.type(I)) {
    case 'Undefined':
    case 'null':
      break;
    case 'Array':
      out.push.apply(out, I);
      break;
    default:
      out.push(I);
    }
  }
  return out;
}).alt(be.str.cont(function(x){
  return [x];
})).err(function(msg){
  return msg[0];
}).err(function(msg){
  var type;
  type = msg[0];
  switch (type) {
  case ':ob_in_str_list':
    return msg;
  }
  return "not string or string list.";
});
ME.strlist = function(F){
  return ME.recursive_str_list.or(be.undefnull.cont(F));
};
ME.strlist.empty = ME.strlist(function(){
  return [];
});
ME.strlist.dot = ME.strlist(function(){
  return ["."];
});
ME.strlist['false'] = ME.strlist(false);
unu = be.undefnull.cont(void 8);
ME.maybe = {};
ME.maybe.bool = be.bool.or(unu);
ME.maybe.num = be.num.or(unu);
ME.maybe.str = be.str.or(unu);
ME.maybe.obj = be.obj.or(unu);
ME.maybe.arr = be.arr.or(unu);
rm_all_undef = function(obj){
  return JSON.parse(JSON.stringify(obj));
};
is_true = function(x){
  if (x === true) {
    return true;
  }
  return [false, 'not true'];
};
is_false = function(x){
  if (x === false) {
    return true;
  }
  return [false, 'not false'];
};
ME.rsync = {};
grouparr = R.pipe(R.unnest, R.groupBy(function(v){
  return v[0];
}), R.map(R.map(function(x){
  return x[1];
})));
ME.rsync.throw_if_error = function(detail, key){
  var path;
  if (!detail.error) {
    return true;
  }
  path = [key, detail.error[1]];
  return [false, detail.error];
};
organize_rsync = function(list, key, state){
  var fin, error, i$, len$, index, I, keys, k, val, ret, ref$;
  fin = {
    str: [],
    obnormal: [],
    obarr: {},
    des: [],
    src: [],
    error: false
  };
  error = [];
  error.push(':rsync');
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    index = i$;
    I = list[i$];
    switch (R.type(I)) {
    case 'String':
      if (!data.rsync.bool.has(I)) {
        error.push(['duo', [I, "not a valid boolean rsync option."]], arrayFrom$(key).concat([index]));
        fin.error = error;
        return fin;
      }
      fin.str.push(I);
      break;
    case 'Object':
      keys = Object.keys(I);
      switch (keys.length) {
      case 0:
        error.push(['uno', ["empty object without any attribute"]], arrayFrom$(key).concat([index]));
        fin.error = error;
        return fin;
      case 1:
        break;
      default:
        error.push(['uno', ["object can only have singular attribute."]], arrayFrom$(key).concat([index]));
        fin.error = error;
        return fin;
      }
      k = keys[0];
      if (!(data.rsync.compound.has(k) || (k === 'src' || k === 'des'))) {
        error.push(['duo', [k, " not a valid compound rsync option."]], arrayFrom$(key).concat([index]));
        fin.error = error;
        return fin;
      }
      val = I[k];
      if (k === 'des') {
        if (!(R.type(val) === 'String')) {
          error.push(['duo', ['des', " has to be string type."]], arrayFrom$(key).concat([index]));
          fin.error = error;
          return fin;
        }
        if (fin.des.length === 1) {
          error.push(['duo', ['des', " there can't be multiple remote folders as destination."]], arrayFrom$(key).concat([index]));
          fin.error = error;
          return fin;
        }
        fin.des.push(val);
      } else if (k === 'src' || data.rsync.filter.has(k)) {
        ret = ME.rsync.strarr.auth(val);
        if (ret.error) {
          error.push(['duo', [k, "can only be a list of string or just string."]], arrayFrom$(key).concat([index]));
          fin.error = error;
          return fin;
        }
        if (k === 'src') {
          fin.src.push(ret.value);
        } else {
          if (fin.obarr[k] === undefined) {
            fin.obarr[k] = [];
          }
          (ref$ = fin.obarr[k]).push.apply(ref$, ret.value);
        }
      } else {
        switch (R.type(val)) {
        case 'String':
        case 'Number':
          fin.obnormal.push([k, val.replace(/'/g, "'\\''")]);
          break;
        case 'Undefined':
        case 'Null':
          break;
        default:
          error.push(['duo', [k, "can only be a string (or number)."]], arrayFrom$(key).concat([index]));
          fin.error = error;
          return fin;
        }
      }
      break;
    default:
      error.push(['uno', ["not valid rsync option."]], arrayFrom$(key).concat([index]));
      fin.error = error;
      return fin;
    }
  }
  fin.src = R.flatten(fin.src);
  if (!fin.des[0]) {
    fin.des.push(state.origin.remotefold);
  }
  if (fin.src.length === 0) {
    fin.src.push(".");
  }
  return fin;
};
ME['false'] = be(is_false);
karr = be.known.arr;
ME.rsync.main = be(is_true).cont(function(){
  var state, list;
  state = arguments[arguments.length - 1];
  list = data.def.rsync.concat({
    des: state.origin.remotefold
  });
  return organize_rsync(R.flatten(list), [], state);
}).or(ME['false']).or(be.undefnull.cont(false)).or(be.arr.map(be.arr).err(function(msg, key){
  switch (key) {
  case undefined:
    return [':def', 'not array'];
  default:
    return ['not_array_of_array', key];
  }
}).and(karr.map(karr.cont(function(arr, key){
  var state;
  state = arguments[arguments.length - 1];
  return organize_rsync(R.flatten(arr), [key], state);
}).and(ME.rsync.throw_if_error)))).or(be.arr.cont(function(arr){
  var state;
  state = arguments[arguments.length - 1];
  return [organize_rsync(R.flatten(arr), [], state)];
}).and(ME.rsync.throw_if_error)).err(function(msg, path){
  var filtered, ref$, name, details, innerpath;
  filtered = be.flatro(msg);
  ref$ = filtered[0], name = ref$[0], details = ref$[1], innerpath = ref$[2];
  if (name === ':rsync') {
    return {
      message: [name, details],
      path: path.concat(innerpath)
    };
  }
  return {
    message: [details]
  };
});
ME.rsync.strarr = be.arr.map(be.str).or(be.str.cont(function(s){
  return [s];
})).or(be.undefnull.cont([]));
ME.execlist = ME.strlist.empty.cont(function(strlist){
  var i$, len$, str, results$ = [];
  for (i$ = 0, len$ = strlist.length; i$ < len$; ++i$) {
    str = strlist[i$];
    results$.push(str.replace(/'/g, "'''"));
  }
  return results$;
});
ME.chokidar = be.obj.on(data.chokidar.bools, ME.maybe.bool).on(['ignored', 'cwd'], ME.maybe.str).on('awaitWriteFinish', ME.maybe.obj.on(['stabilityThreshold', 'pollInterval'], ME.maybe.num).or(be.bool)).on(['interval', 'binaryInterval', 'depth'], ME.maybe.num);
ME.watch = function(undef, on_true){
  return ME.recursive_str_list.or(be.undefnull.cont(undef)).or(is_false).or(be(is_true).cont(on_true)).cont(function(data){
    if (data.length === 0) {
      return false;
    }
    return data;
  });
};
ME.user = be.obj.err([':custom_build']).or(be.undefnull.cont(function(){
  return {};
}).err(void 8)).and(be.restricted(data.selected_keys.arr)).alt(ME.strlist.empty.cont(function(list){
  return {
    'exec-locale': list
  };
})).on('initialize', ME.maybe.bool).on('watch', ME.watch(false, void 8)).on('verbose', be.num.or(unu)).on('ssh', be.str.or(unu)).on(['exec-remote', 'exec-locale', 'exec-finale'], ME.execlist).on('chokidar', ME.chokidar.or(unu)).on('rsync', ME.rsync.main);
ME.origin = be.obj.alt(be.undefnull.cont(function(){
  return {};
})).on('remotehost', be.str.or(unu)).on('remotefold', be.str.or(unu.cont("~"))).on('verbose', be.num.or(unu.cont(false))).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', ME.watch(["."], ["."])).on('ssh', be.str.or(be.undefnull.cont(data.def.ssh))).on(['exec-locale', 'exec-finale', 'exec-remote'], ME.execlist).on('chokidar', ME.chokidar.or(be.undefnull.cont(data.def.chokidar))).and(be(function(data){
  if (data.remotehost) {
    return true;
  } else {
    return false;
  }
}).fix(function(data){
  data.rsync = false;
  return data;
})).on('rsync', ME.rsync.main).map(function(value, key, __, state){
  var put;
  switch (data.selected_keys.set.has(key)) {
  case true:
    state.def[key] = value;
    break;
  case false:
    put = ME.user.auth(value, key, state);
    if (put['continue']) {
      state.user[key] = put.value;
    } else {
      return [false, [put.message], put.path];
    }
  }
  return true;
});
mergeF = function(a, b){
  if (b === void 8) {
    return a;
  }
  return b;
};
ME.main = be.obj.on('cmd', be.str.and(function(x){
  return !data.selected_keys.set.has(x);
}).err(function(x, id, __, state){
  return [':in_selected_key', [state.cmd, state.commandline]];
}).or(be.undef)).on('origin', ME.origin).and(function(raw){
  if (raw.cmd !== undefined && raw.user[raw.cmd] === undefined) {
    return [false, [':usercmd_not_defined', [raw.all_filenames, raw.cmd]]];
  }
  return true;
}).err(be.flatro).edit(function(__, state){
  var user, def, cmdname, value, i$, ref$, len$, I;
  user = state.user, def = state.def;
  for (cmdname in user) {
    value = user[cmdname];
    for (i$ = 0, len$ = (ref$ = ['watch', 'remotehost', 'remotefold', 'chokidar', 'ssh', 'initialize', 'global', 'verbose']).length; i$ < len$; ++i$) {
      I = ref$[i$];
      if (value[I] === undefined) {
        user[cmdname][I] = def[I];
      } else {
        user[cmdname][I] = value[I];
      }
    }
  }
  state.origin = void 8;
  return state;
});
vre = /(\s*#\s*){0,1}(\s*)(\S*):/;
yaml_tokenize = function(data){
  var lines, all, i$, len$, I, torna, __, iscommeted, spaces, name, asbool, acc, temp, to$, current;
  lines = data.split("\n");
  all = [];
  for (i$ = 0, len$ = lines.length; i$ < len$; ++i$) {
    I = lines[i$];
    torna = vre.exec(I);
    if (!(torna === null)) {
      __ = torna[0], iscommeted = torna[1], spaces = torna[2], name = torna[3];
      asbool = be.not.undef.auth(iscommeted)['continue'];
      all.push({
        name: name,
        iscommeted: asbool,
        nodec: false,
        txt: I,
        space: spaces.length
      });
    } else {
      all.push({
        nodec: true,
        space: 0,
        txt: I
      });
    }
  }
  acc = [];
  temp = [];
  for (i$ = 0, to$ = all.length; i$ < to$; ++i$) {
    I = i$;
    current = all[I];
    if (!current.nodec && current.space === 0) {
      if (I > 0) {
        acc.push(temp);
      }
      temp = [current];
    } else {
      temp.push(current);
    }
  }
  acc.push(temp);
  return acc;
};
vars = {};
vars.get = function(tokens){
  var index, I, all, current, K, edit;
  index = null;
  I = 0;
  all = [];
  while (I < tokens.length) {
    current = tokens[I];
    if (current[0].name === 'global') {
      index = I;
      K = 0;
      while (K < current.length) {
        edit = [];
        do {
          edit.push(current[K]);
          K += 1;
        } while (K < current.length && current[K].nodec);
        all.push(edit);
      }
    }
    I += 1;
  }
  return [index, all];
};
isref = /\s*\w*:\s*(&\w+\s*){0,1}/;
vars.edit = function(arg$, vars, tokens){
  var index, all, i$, len$, ref$, name, txt, j$, to$, I, current, firstline, isr, old_txt;
  index = arg$[0], all = arg$[1];
  for (i$ = 0, len$ = vars.length; i$ < len$; ++i$) {
    ref$ = vars[i$], name = ref$[0], txt = ref$[1];
    for (j$ = 1, to$ = all.length; j$ < to$; ++j$) {
      I = j$;
      current = all[I];
      if (current[0].name === name) {
        firstline = current[0];
        isr = isref.exec(firstline.txt);
        old_txt = current[0].txt;
        current[0].txt = isr[0] + txt;
        all[I] = [current[0]];
      }
    }
  }
  if (index) {
    tokens[index] = R.flatten(all);
  }
  return tokens;
};
vars.stringify = function(tokens){
  var str, i$, len$, I;
  str = "";
  for (i$ = 0, len$ = tokens.length; i$ < len$; ++i$) {
    I = tokens[i$];
    str += I.txt + '\n';
  }
  return str;
};
modifyYaml = function(filename, cmdargs){
  var data, tokens, torna, yaml_text;
  data = R.toString(
  fs.readFileSync(
  filename));
  tokens = yaml_tokenize(data);
  torna = vars.get(tokens);
  torna = vars.edit(torna, cmdargs, tokens);
  torna = R.flatten(torna);
  yaml_text = vars.stringify(torna);
  return yaml_text;
};
$tampaxParse = function(filename, yaml_text, cmdargs){
  var $;
  $ = most_create(function(add, end, error){
    return tampax.yamlParseString(yaml_text, arrayFrom$(cmdargs), function(err, rawJson){
      if (err) {
        print.failed_in_tampax_parsing(filename, err);
        add('error.validator.tampaxparsing');
        end();
      }
      add([filename, rawJson]);
      return end();
    });
  });
  return $;
};
handle_error = function(arg$){
  var message, path, value, topmsg, loc, Error, F;
  message = arg$.message, path = arg$.path, value = arg$.value;
  topmsg = message[0];
  loc = topmsg[0], Error = topmsg[1];
  F = (function(){
    switch (loc) {
    case ':in_selected_key':
      return print.in_selected_key;
    case ':req':
      return print.reqError;
    case ':res':
      return print.resError;
    case ':usercmd_not_defined':
      return print.could_not_find_custom_cmd;
    case ':rsync':
      return print.rsyncError;
    case ':ob_in_str_list':
      return print.ob_in_str_list;
    case ':custom_build':
      return print.custom_build;
    default:
      Error = message[0];
      return print.basicError;
    }
  }());
  F(Error, path, value.filename, message);
};
rmdef = R.reject(function(x){
  return data.selected_keys.set.has(x);
});
only_str = be.str.cont(function(str){
  return " - " + str;
}).or(be.arr.cont(function(arr){
  var fin, i$, len$, I;
  fin = "";
  for (i$ = 0, len$ = arr.length; i$ < len$; ++i$) {
    I = arr[i$];
    fin += "\n    - " + I;
  }
  return fin;
})).fix("").wrap();
exec_list_option = function(alldata){
  var i$, ref$, len$, ref1$, filename, data, lresult$, keys, user_ones, j$, to$, I, name, des, results$ = [];
  for (i$ = 0, len$ = (ref$ = R.reverse(alldata)).length; i$ < len$; ++i$) {
    ref1$ = ref$[i$], filename = ref1$[0], data = ref1$[1];
    lresult$ = [];
    l(lit(['> FILE ', filename], [c.warn, c.pink]));
    keys = Object.keys(data);
    user_ones = rmdef(keys);
    if (user_ones.length === 0) {
      l(lit(["  --- ", "< EMPTY >", " ---"], [c.pink, c.warn, c.pink]));
    }
    for (j$ = 0, to$ = user_ones.length; j$ < to$; ++j$) {
      I = j$;
      name = user_ones[I];
      des = only_str(data[name].description);
      lresult$.push(l(lit([" • ", name, des], [c.warn, c.ok, null])));
    }
    results$.push(lresult$);
  }
  return results$;
};
main_all = function(info){
  return function(alldata){
    var i$, len$, I, ref$, filename, data, state, torna;
    for (i$ = 0, len$ = alldata.length; i$ < len$; ++i$) {
      I = alldata[i$];
      if (I === 'error.validator.tampaxparsing') {
        return;
      }
    }
    if (info.options.list) {
      exec_list_option(alldata);
      return;
    }
    if (info.cmdname) {
      for (i$ = 0, len$ = alldata.length; i$ < len$; ++i$) {
        ref$ = alldata[i$], filename = ref$[0], data = ref$[1];
        state = {
          commandline: info.commandline,
          options: info.options,
          filename: filename,
          all_filenames: info.filenames,
          cmd: info.cmdname,
          origin: data,
          def: {},
          user: {}
        };
        torna = ME.main.auth(state, state);
        if (torna['continue']) {
          break;
        } else if (torna.message[0][0] !== ':usercmd_not_defined') {
          break;
        }
      }
    } else {
      state = {
        commandline: info.commandline,
        options: info.options,
        filename: alldata[0][0],
        cmd: info.cmdname,
        origin: alldata[0][1],
        def: {},
        user: {}
      };
      torna = ME.main.auth(state, state);
    }
    if (torna.error) {
      handle_error(torna);
      return;
    }
    info.filename = torna.value.filename;
    return init_config_file_watch(torna.value, info);
  };
};
main_repeat = function(info){
  return function(raw_data){
    var state, torna, ref$, configs, buildname, log;
    if (raw_data === 'error.validator.tampaxparsing') {
      return most.just('error._._.open_only_config');
    }
    state = {
      commandline: info.commandline,
      options: info.options,
      filename: info.filename,
      all_filenames: [info.filename],
      cmd: info.cmdname,
      origin: raw_data[1],
      def: {},
      user: {}
    };
    torna = ME.main.auth(state, state);
    if (torna.error) {
      handle_error(torna);
      return most.just('error._._.open_only_config');
    }
    ref$ = create_logger(torna.value), configs = ref$[0], buildname = ref$[1], log = ref$[2];
    return core(torna.value, info, log, configs, buildname);
  };
};
reparse_config_file = function(info){
  return function(){
    var filename, yamlText, E, $parsed;
    filename = info.filename;
    try {
      yamlText = modifyYaml(filename, info.vars);
    } catch (e$) {
      E = e$;
      print.failed_in_custom_parser(filename, E);
      return;
    }
    $parsed = $tampaxParse(filename, yamlText, info.cmdargs);
    return $parsed.map(main_repeat(info));
  };
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
prime_process = function(data, options, log, cont, rl){
  return function*(){
    var locale, i$, len$, cmd, remotehost, ref$, each, disp, status, remotetask, tryToSSH, checkDir, mkdir, E, userinput, I;
    locale = data['exec-locale'];
    log.normal(locale.length, 'ok', " exec-locale ", c.warn(" (" + locale.length + ") "));
    for (i$ = 0, len$ = locale.length; i$ < len$; ++i$) {
      cmd = locale[i$];
      log.verbose(cmd);
      (yield* cont(cmd));
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
        } else {
          log.normal('ok', lit([" rsync ", "✔️ ok "], [0, c.ok]), "");
        }
      }
    }
    remotetask = data['exec-remote'];
    if (remotetask.length && !options.dryRun) {
      tryToSSH = "ssh " + data.ssh + " " + data.remotehost + " 'ls'";
      checkDir = "ssh " + data.ssh + " " + data.remotehost + " 'ls " + data.remotefold + "'";
      mkdir = "ssh " + data.ssh + " " + data.remotehost + " 'sudo mkdir " + data.remotefold + "'";
      try {
        exec(tryToSSH);
      } catch (e$) {
        E = e$;
        l(lit(["[" + metadata.name + "]", " unable to ssh to remote address ", data.remotehost, "."], [c.er2, c.warn, c.er3, c.grey]));
        (yield 'error.core.unable_to_ssh');
        return;
      }
      try {
        exec(checkDir);
      } catch (e$) {
        E = e$;
        if (options.auto_make_directory) {
          userinput = 'y';
        } else {
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
        }
        if (userinput) {
          (yield* cont(mkdir));
          log.normal('ok', " exec.remote ", lit(['[✔️ ok ]', " " + data.remotehost + ":" + data.remotefold + " ", "created."], [c.ok, c.warn, c.ok]));
        }
      }
    }
    disp = lit([" (" + remotetask.length + ") ", data.remotehost + ":" + data.remotefold], [c.warn, c.grey]);
    log.normal(remotetask.length, 'ok', " exec.remote ", disp);
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
improve_signal = function(signal, config, log, rl, opts){
  var all_watches_are_closed, en;
  all_watches_are_closed = !(config.watch || opts.watch_config_file);
  if (!config.watch) {
    rl.close();
  }
  if (all_watches_are_closed) {
    return most.throwError(signal + ".closed");
  }
  if (opts.watch_config_file && !config.watch) {
    en = ".open_only_config";
  } else {
    en = '.open';
  }
  return most.just(signal + en);
};
$empty = most.empty();
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
}).alt(be.str).cont(improve_signal).fix($empty).wrap();
print_final_message = function(log){
  return function(signal){
    var ref$, status, type, which, watch, msg;
    ref$ = dotpat(signal), status = ref$[0], type = ref$[1], which = ref$[2], watch = ref$[3];
    switch (watch) {
    case 'open':
      msg = "returning to watch";
      break;
    case 'open_only_config':
      msg = "watching only config file";
      break;
    case 'closed':
      return $empty;
    }
    switch (status) {
    case 'error':
      log.normal('err', msg);
      break;
    case 'done':
      log.normal('ok', msg);
    }
    return $empty;
  };
};
diff = R.pipe(R.aperture(2), R.map(function(arg$){
  var x, y;
  x = arg$[0], y = arg$[1];
  return y - x;
}));
init_user_watch = function(data, options, log, handle_cmd, rl){
  var I, $init_file_watch, exec_all_user_cmds, $file_watch;
  log.normal(data.watch, 'ok', c.ok("  ↓ watching "), c.grey(" { working directory } → " + process.cwd()), " " + (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = data.watch).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push(c.blue(I));
    }
    return results$;
  }()).join(c.pink(" | ")));
  $init_file_watch = most_create(function(add, end, error){
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
  exec_all_user_cmds = prime_process(data, options, log, handle_cmd, rl);
  $file_watch = $init_file_watch.timestamp().loop(function(db, ob){
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
    return most.generate(exec_all_user_cmds);
  });
  return $file_watch.switchLatest().recoverWith(function(signal){
    return most.just(signal);
  }).chain(function(signal){
    return resolve_signal(signal, data, log, rl, options);
  });
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
zero = function(arr){
  return arr.length === 0;
};
check_if_empty = be.known.obj.on('exec-locale', zero).on('exec-finale', zero).on('exec-remote', zero).on('rsync', be.arr.and(zero).or(ME['false'])).cont(true).fix(false).wrap();
create_logger = function(data){
  var buildname, configs, verbose, log;
  if (data.cmd === undefined) {
    buildname = "";
    configs = data.def;
  } else {
    buildname = c.warn("[" + data.cmd + "]");
    configs = data.user[data.cmd];
  }
  if (configs.verbose) {
    verbose = configs.verbose;
  } else {
    verbose = data.options.verbose;
  }
  log = print.create_logger(buildname, verbose);
  return [configs, buildname, log];
};
core = function(data, info, log, configs, buildname){
  var handle_cmd, rl;
  if (!configs.remotehost && configs['exec-remote'].length) {
    log.normal('warn', c.er2(" ⚡️     error "), c.er1(" remotehost address not defined for task."));
    return;
  }
  if (check_if_empty(configs) && !info.options.watch_config_file) {
    l(lit(["[" + metadata.name + "]", " no user command to execute."], [c.warn, c.er1]));
    return;
  }
  handle_cmd = init_continuation(buildname, data.options.dryRun);
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  rl.on('line', function(input){
    process.stdout.write(input);
  });
  return init_user_watch(configs, data.options, log, handle_cmd, rl);
};
init_config_file_watch = function(data, info){
  var $config_watch, ref$, configs, buildname, log, pfm, rest, init;
  $config_watch = most_create(function(add, end, error){
    var watcher;
    if (data.options.watch_config_file) {
      watcher = chokidar.watch(data.filename, {
        awaitWriteFinish: true
      });
      watcher.on('change', add);
      setTimeout(add, 0);
      return function(){
        watcher.close();
        return end();
      };
    } else {
      return setTimeout(add, 0);
    }
  });
  ref$ = create_logger(data), configs = ref$[0], buildname = ref$[1], log = ref$[2];
  pfm = print_final_message(log);
  rest = $config_watch.skip(1).tap(function(){
    var msg;
    msg = lit(["configuration file ", data.filename + "", " itself has changed, restarting watch"], [c.ok, c.warn, c.ok]);
    log.normal('ok', msg);
  }).chain(reparse_config_file(info));
  init = $config_watch.take(1).map(function(){
    var out;
    out = core(data, info, log, configs, buildname);
    return out;
  });
  return most.mergeArray([init, rest]).switchLatest().tap(pfm).recoverWith(pfm).drain();
};
entry = function(info){
  var $all, i$, ref$, len$, I, yamlText, E, parsed;
  $all = [];
  for (i$ = 0, len$ = (ref$ = info.filenames).length; i$ < len$; ++i$) {
    I = ref$[i$];
    try {
      yamlText = modifyYaml(I, info.vars);
    } catch (e$) {
      E = e$;
      print.failed_in_custom_parser(I, E);
      return;
    }
    $all.push($tampaxParse(I, yamlText, info.cmdargs));
  }
  parsed = most.mergeArray($all).recoverWith(function(x){
    return most.just(x);
  }).reduce(function(accum, data){
    accum.push(data);
    return accum;
  }, []);
  return parsed.then(main_all(info));
};
module.exports = {
  validator: entry,
  findfile: ME.findfile,
  ext: ext
};