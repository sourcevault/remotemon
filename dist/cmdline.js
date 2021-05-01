#!/usr/bin/env node

var bani, ext, validator, findfile, com, print, readJson, most, j, exec, chokidar, most_create, updateNotifier, fs, metadata, optionParser, dotpat, ref$, l, z, zj, R, lit, c, wait, be, parser, rest, E, pkg, notifier, str, isvar, vars, args, filename, filenames, wcf, x$, data, y$;
bani = require("./core");
ext = bani.ext, validator = bani.validator, findfile = bani.findfile;
com = ext.com, print = ext.print;
readJson = com.readJson, most = com.most, j = com.j, exec = com.exec, chokidar = com.chokidar, most_create = com.most_create, updateNotifier = com.updateNotifier, fs = com.fs, metadata = com.metadata, optionParser = com.optionParser;
dotpat = com.dotpat;
ref$ = com.hoplon.utils, l = ref$.l, z = ref$.z, zj = ref$.zj, j = ref$.j, R = ref$.R, lit = ref$.lit, c = ref$.c, wait = ref$.wait;
be = com.hoplon.types;
parser = new optionParser();
parser.addOption('h', 'help', null, 'help');
parser.addOption('v', 'verbose', null, 'verbose');
parser.addOption('V', 'version', null, 'version');
parser.addOption('d', 'dry-run', null, 'dryRun');
parser.addOption('w', 'watch-config-file', null, 'watch_config_file');
parser.addOption('c', 'config', null, 'config').argument('FILE');
parser.addOption('l', 'list', null, 'list');
parser.addOption('m', 'auto-make-directory', null, 'auto_make_directory');
if (!metadata.name) {
  return false;
}
try {
  rest = parser.parse();
} catch (e$) {
  E = e$;
  l(E.toString());
  return;
}
try {
  pkg = require("../package.json");
  notifier = updateNotifier({
    pkg: pkg
  });
  notifier.notify();
} catch (e$) {}
if (parser.help.count() > 0) {
  str = "remotemon version " + metadata.version + "\n\noptions:\n\n  -v --verbose               more detail\n\n  -vv                        much more detail\n\n  -h --help                  display help message\n\n  -V --version               displays version number\n\n  -d --dry-run               perform a trial run without making any changes\n\n  -w --watch-config-file     restart on config file change by default.\n\n  -c --config                path to YAML configuration file\n\n  -l --list                  list all user commands\n\n  -m --auto-make-directory   make remote directory if it doesn't exist.\n\nBy default remotemon will look for .remotemon.yaml in current directory and one level up (only).\n\nusing --config <filename>.yaml option will direct remotemon to use <filename>.yaml as config file :\n\n> remotemon --config custom.yaml\n> remotemon --config custom.yaml -v\n\nvalues for internal variables (using .global object) can be changed using '=' (similar to makefiles) :\n\n> remotemon --config custom.yaml --verbose file=dist/main.js\n\n[ documentation ] @ [ https://github.com/sourcevault/remotemon#readme.md ]\n";
  l(str);
  return;
}
print.showHeader();
if (parser.version.count() > 0) {
  return;
}
isvar = R.test(/\=/);
vars = R.map(R.split('='))(
R.filter(isvar)(
rest));
args = R.reject(isvar, rest);
filename = parser.config.value();
filenames = findfile(filename);
if (!filenames) {
  return;
}
if (parser.list.count() > 0) {
  wcf = 0;
} else {
  wcf = parser.watch_config_file.count();
}
x$ = data = {};
x$.cmdname = args[0];
x$.cmdargs = R.drop(1, args);
x$.vars = vars;
x$.filenames = filenames;
x$.commandline = R.drop(2, process.argv);
y$ = x$.options = {};
y$.verbose = parser.verbose.count();
y$.dryRun = parser.dryRun.count();
y$.watch_config_file = wcf;
y$.list = parser.list.count();
y$.auto_make_directory = parser.auto_make_directory.count();
validator(data);