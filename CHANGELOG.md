# changelog

`1.2.6`

- informs user if unable to `ssh` into `remotehost`, provides option to create remote directory.

- added `-m --auto-make-directory   make remote directory if it doesn't exist` option.

- `defargs` field added.

- major internal refactor.

- `rsync` field accepts array specifying multiple `rsync` commands.

- accepts unnamed commandline arguments that are used as `{{0}}`,`{{1}}`,`{{3}}` templating values in config file.

`1.2.4`

- `description` field added for usercmd.

`1.2.3`

- `verbose` level can be hardcoded for each separate command.

`1.2.2`

- `rsync` accepts multiple values, which means it can be called on multiple destination folder.

- `remotemon` only accepts a single command.

- `-vv` multiple level of verbose logging.

- multiple config files can be used.

- `-l,--list` to see all the different commands from the command line itself.

`1.1.2`

- custom build accepts array.str ( defaults to `exec-locale` values).

- all `exec.*` changed to `exec-*`

`1.0.0`

- `remotemon` no longer uses a custom parser with `!join` operator, but uses [`tampax`](https://github.com/arthurlacoste/tampa/) ( much ♥️ ) for yaml parsing.
