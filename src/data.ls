reg = require "./registry"

{com,print,packageJ,data} = reg

{l,z,j,R} = com

data.chokidar = {}


data.chokidar.bools =
  *\persistent \ignoreInitial \followSymlinks \disableGlobbing \usePolling
   \alwaysStat \ignorePermissionErrors \atomic

data.flag = {}

data.flag.object-props = new Set do
 *\chmod \block-size \rsh \rsync-path \max-delete \max-size \max-size \partial-dir
  \timeout \contimeout \modify-window \temp-dir \fuzzy \compare-dest \copy-dest
  \link-dest \compress-level \skip-compress \filter \exclude \exclude-from
  \include \include-from \files-from \address \port \sockopts \out-format \log-file
  \log-file-format \password-file \bwlimit \write-batch \only-write-batch \read-batch
  \protocol \iconv \checksum-seed

data.flag.filter = new Set do
  *\exclude \exclude-from \include \include-from

data.flag.bool = new Set do
 *\verbose \quiet \no-motd \checksum \archive \relative \no-OPTION \recursive
  \no-implied-dirs \backup \update \inplace \append \append-verify \dirs \links
  \copy-links \copy-unsafe-links \safe-links \copy-dirlinks \keep-dirlinks \hard-links
  \perms \executability \acls \xattrs \owner \group \devices \specials \devices
  \specials \times \omit-dir-times \super \fake-super \sparse \dry-run \whole-file
  \one-file-system \existing \ignore-existing \remove-soucre-files \del \delete
  \delete-before \delete-during \delete-delay \delete-after \delete-excluded \ignore-errors
  \force \partial \delay-updates \prune-empty-dirs \numeric-ids \ignore-times \size-only
  \compress \cvs-exclude \F \from0 \protect-args \blocking-io \stats \8-bit-output
  \human-readable \progress \P \itemize-changes \list-only


data.selected_keys = {}

  ..arr = [\watch \remotehost \localbuild \remotetask \chokidar \rsync \remotefold \initialize]

data.selected_keys.set = new Set data.selected_keys.arr


module.exports = data