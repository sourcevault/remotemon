ext = require "./print"

{hoplon} = ext.com

{l,z,j,R} = hoplon.utils

data = {}

export {com:ext.com,print:ext.print,global_data:data}

data.rsync = {}

data.rsync.compound = new Set do
 *\backup-dir \suffix \chmod \block-size \rsh \rsync-path \max-delete \max-size
  \max-size \partial-dir \timeout \contimeout \modify-window \temp-dir \fuzzy
  \compare-dest \copy-dest \link-dest \compress-level \skip-compress \filter
  \files-from \address \port \sockopts \out-format \log-file \log-file-format
  \password-file \bwlimit \write-batch \only-write-batch \read-batch \protocol
  \iconv \checksum-seed \exclude \exclude-from \include \include-from \info

data.rsync.filter = new Set do
  *\exclude \exclude-from \include \include-from

data.rsync.bool = new Set do
 *\verbose \quiet \no-motd \checksum \archive \relative \no-OPTION \recursive
  \no-implied-dirs \backup \update \inplace \append \append-verify \dirs \links
  \copy-links \copy-unsafe-links \safe-links \copy-dirlinks \keep-dirlinks \hard-links
  \perms \no-perms \executability \acls \xattrs \owner \group \devices \specials \devices
  \specials \times \omit-dir-times \super \fake-super \sparse \dry-run \whole-file
  \one-file-system \existing \ignore-existing \remove-soucre-files \del \delete
  \delete-before \delete-during \delete-delay \delete-after \delete-excluded \ignore-errors
  \force \partial \delay-updates \prune-empty-dirs \numeric-ids \ignore-times \size-only
  \compress \cvs-exclude \F \from0 \protect-args \blocking-io \stats \8-bit-output
  \human-readable \progress \P \itemize-changes \list-only

data.selected_keys = {}

  ..arr =
     \ssh
     \var 
     \pre
     \pwd #
     \watch #
     \rsync #
     \local
     \final
     \ignore
     \defarg
     \remote 
     \silent #
     \verbose #
     \initialize #
     \remotefold #
     \remotehost #
     \description
     \defarg.required

  ..undef =
     \ssh
     \watch
     \pwd
     # \pre
     # \rsync
     # \local
     # \remote
     # \final
     # \defarg
     \ignore
     \silent
     \verbose
     \initialize
     \remotefold
     \remotehost
     # \description


data.selected_keys.set = new Set data.selected_keys.arr
