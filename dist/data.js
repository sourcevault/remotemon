var reg, com, print, packageJ, data, l, z, j, R, x$;
reg = require("./registry");
com = reg.com, print = reg.print, packageJ = reg.packageJ, data = reg.data;
l = com.l, z = com.z, j = com.j, R = com.R;
data.chokidar = {};
data.def = {};
data.chokidar.bools = ['persistent', 'ignoreInitial', 'followSymlinks', 'disableGlobbing', 'usePolling', 'alwaysStat', 'ignorePermissionErrors', 'atomic'];
data.rsync = {};
data.rsync.compound = new Set(['backup-dir', 'suffix', 'chmod', 'block-size', 'rsh', 'rsync-path', 'max-delete', 'max-size', 'max-size', 'partial-dir', 'timeout', 'contimeout', 'modify-window', 'temp-dir', 'fuzzy', 'compare-dest', 'copy-dest', 'link-dest', 'compress-level', 'skip-compress', 'filter', 'files-from', 'address', 'port', 'sockopts', 'out-format', 'log-file', 'log-file-format', 'password-file', 'bwlimit', 'write-batch', 'only-write-batch', 'read-batch', 'protocol', 'iconv', 'checksum-seed', 'exclude', 'exclude-from', 'include', 'include-from']);
data.rsync.filter = new Set(['exclude', 'exclude-from', 'include', 'include-from']);
data.rsync.bool = new Set(['verbose', 'quiet', 'no-motd', 'checksum', 'archive', 'relative', 'no-OPTION', 'recursive', 'no-implied-dirs', 'backup', 'update', 'inplace', 'append', 'append-verify', 'dirs', 'links', 'copy-links', 'copy-unsafe-links', 'safe-links', 'copy-dirlinks', 'keep-dirlinks', 'hard-links', 'perms', 'executability', 'acls', 'xattrs', 'owner', 'group', 'devices', 'specials', 'devices', 'specials', 'times', 'omit-dir-times', 'super', 'fake-super', 'sparse', 'dry-run', 'whole-file', 'one-file-system', 'existing', 'ignore-existing', 'remove-soucre-files', 'del', 'delete', 'delete-before', 'delete-during', 'delete-delay', 'delete-after', 'delete-excluded', 'ignore-errors', 'force', 'partial', 'delay-updates', 'prune-empty-dirs', 'numeric-ids', 'ignore-times', 'size-only', 'compress', 'cvs-exclude', 'F', 'from0', 'protect-args', 'blocking-io', 'stats', '8-bit-output', 'human-readable', 'progress', 'P', 'itemize-changes', 'list-only']);
x$ = data.selected_keys = {};
x$.arr = ['watch', 'remotehost', 'remotefold', 'chokidar', 'rsync', 'initialize', 'exec.locale', 'exec.remote', 'exec.finale', 'ssh', 'global'];
data.selected_keys.set = new Set(data.selected_keys.arr);
data.def.rsync = [
  {
    src: '.'
  }, 'recursive', 'quiet'
];
data.def.ssh = "-tt -o LogLevel=QUIET";
data.def.chokidar = {
  awaitWriteFinish: true
};
module.exports = data;