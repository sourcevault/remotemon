![](https://raw.githubusercontent.com/sourcevault/remotemon/dev/logo.jpg)

**Install**
```js
npm install -g remotemon
```

`remotemon` is a cli automation tool for building/copying/executing code on remote machines and monitoring the result.

Its main use-case is for developing / running scripts on remote machines like the raspberry pi ..

.. but can also be used for purposes that would normally be done using  `make` / `nodemon` 😀.

```bash
remotemon rpi.update # to update rpi 😎
remotemon dns # to change default dns 🧐
remotemon rpi.zsh # install zsh and get oh-my-zsh on the raspberry pi 😏
remotemon ssh45 # to change default ssh port to 45 👮🏼‍♂️
```

<!-- ![](https://github.com/sourcevault/remotemon/blob/dev/example.png) -->
![](./example.png)

#### 🟡 How to Use

`remotemon` operates using `YAML` configuration files ( similar to makefiles ), by default it assumes a file named `.remotemon.yaml` as the configuration file to use.

It searches for  `.remotemon.yaml` in working directory and one folder up ( only ).

Running `remotemon` without any arguments makes `remotemon` execute default routine present in provided configuration file :

```zsh
~/app:(dev*) remotemon
```

First argument to `remotemon` is the name of the build routine to use, specified through our configuration `.yaml` file, subsequent arguments can be used internally as variables using handlebar syntax (eg. `{{0}}`).

```zsh
~/app:(dev*) remotemon test1
```

`remotemon` accepts configuration file with different names than `.remotemon.yaml`, using  `--config` flag :

```zsh
~/app:(dev*) remotemon --config ./custom_config.yaml
```

#### 🟡 Creating Configuration `YAML` File

- **Quick Example**

```yaml
  remotehost: pi@192.152.65.12
  remotefold: ~/test
  exec-locale: make local
  exec-remote: make remote
```

```yaml
  remotehost: pi@192.152.65.12
  remotefold: ~/test
  exec-locale: make local
  exec-remote: make remote
  chokidar:                     # chokidar options
    awaitWriteFinish: true
```

```yaml
  remotehost: pi@192.152.65.12
  remotefold: ~/test
  exec-locale: make local
  exec-remote: make remote
  chokidar:
    awaitWriteFinish: true
  rsync:                        # rsync options
    - recursive
    - exclude:
      - .gitignore
      - .ls
      - .git
```

```yaml
  remotehost: pi@192.152.65.12
  remotefold: ~/test
  exec-locale: make local
  exec-remote: make remote
  chokidar:
    awaitWriteFinish: true
  rsync:
    - recursive
    - exclude:
      - .gitignore
      - .ls
      - .git
  test1:                        # custom routine
    remotefold: ~/test1
```


- **Creating named builds**

  Named builds can be created at top-level as long as the name does not clash with selected keywords ( ,`remotehost`,`remotefold`,`exec-locale`,`exec-remote`,`chokidar`,`initialize`,`ssh`,`watch` and `rsync` ).


```yaml
mybuild1:
  remotehost: pi@192.152.65.12
  remotefold: ~/test
  exec-locale: make pi1
  exec-remote: make mybuild1
mybuild2:
  remotehost: pi@192.168.43.51
  remotefold: ~/build
  exec-locale: make pi2
  exec-remote: make mybuild2
```

values not provided in a build are merged with default provided at top-level, in case defaults don't exist at top level then values are extracted from module's internal defaults.

```yaml
rsync:
  - recursive
  - exclude:
    - .gitignore
    - .ls
    - .gi
mybuild1:
  remotehost: pi@192.152.65.12
  remotefold: ~/test
  exec-locale: make pi1
  exec-remote: make mybuild1
mybuild2:
  remotehost: pi@192.152.65.12
  remotefold: ~/build
  exec-locale: make pi2
  exec-remote: make mybuild2
```

In the above config file for example, `mybuild1` and `mybuild2` get their rsync values from the common `rsync` field.

Since rsync's default `src` and `des` are not provided by user in our config file, they are derived from `remotemon`'s internal defaults.

#### 🟡 **all configuration options**

- `remotehost`  - `{username}@{ipaddress}` / ssh name of remote client.
- `remotefold`  - folder in remote client where we want to execute our script.
- `watch`       - local file(s) or folders(s) to watch for changes.
- `ignore`      - files to **not** watch.
- `exec-locale` - local script to run before copying files to remote client and executing our scripts.
- `exec-remote` - command to execute in remote client.
- `exec-finale` - command to execute after `exec-remote` returns `exit 0`.
- `ssh`         - custom `ssh` config options, default is `-tt -o LogLevel=QUIET`.
- `verbose`     - hardcode verbose level of printing for command.
- `description` - provide a brief description of what the command does.
- `defarg`      - default values for empty commandline arguments, for enforcing minimum commandline arguments, a number can be provided.
- `initialize`  - boolean value to specify if a first run is performed or not when command is run, default is `true`.
- `chokidar`- options to use for ![chokidar](https://github.com/paulmillr/chokidar) module :
  - `awaitWriteFinish`
    -  `stabilityThreshold`
    - `pollInterval`

  - `persistent`▪️`ignoreInitial`▪️`followSymlinks`▪️`disableGlobbing`▪️`usePolling`▪️`alwaysStat`▪️`ignorePermissionErrors`▪️`atomic`▪️`interval`▪️`binaryInterval`▪️`depth`▪️`ignored`▪️`cwd`

- `rsync` - rsync options ( currently supported ) :
    - `src` - source folder(s) to sync.
    - `des` - destination folder in remote client.
    - `recursive`▪️`verbose`▪️`quiet`▪️`no-motd`▪️`exclude:`▪️`checksum`▪️`archive`▪️`relative`▪️`no-OPTION`▪️`no-implied-dirs`▪️`backup`▪️`update`▪️`inplace`▪️`append`▪️`append-verify`▪️`dirs`▪️`links`▪️`copy-links`▪️`copy-unsafe-links`▪️`safe-links`▪️`copy-dirlinks`▪️`keep-dirlinks`▪️`hard-links`▪️`perms`▪️`executability`▪️`chmod:`▪️`acls`▪️`xattrs`▪️`owner`▪️`group`▪️`devices`▪️`specials`▪️`devices`▪️`specials`▪️`times`▪️`omit-dir-times`▪️`super`▪️`fake-super`▪️`sparse`▪️`dry-run`▪️`whole-file`▪️`one-file-system`▪️`existing`▪️`ignore-existing`▪️`remove-soucre-files`▪️`del`▪️`delete`▪️`delete-before`▪️`delete-during`▪️`delete-delay`▪️`delete-after`▪️`delete-excluded`▪️`ignore-errors`▪️`force`▪️`partial`▪️`delay-updates`▪️`prune-empty-dirs`▪️`numeric-ids`▪️`ignore-times`▪️`size-only`▪️`compress`▪️`cvs-exclude`▪️`F`▪️`from0`▪️`protect-args`▪️`blocking-io`▪️`stats`▪️`8-bit-output`▪️`human-readable`▪️`progress`▪️`P`▪️`itemize-changes`▪️`list-only`

    - `block-size:`▪️`rsh:`▪️`rsync-path:`▪️`max-delete:`▪️`max-size:`▪️`max-size:`▪️`partial-dir:`▪️`timeout:`▪️`contimeout:`▪️`modify-window:`▪️`temp-dir:`▪️`fuzzy:`▪️`compare-dest:`▪️`copy-dest:`▪️`link-dest:`▪️`compress-level:`▪️`skip-compress:`▪️`filter:`▪️`exclude:`▪️`exclude-from:`▪️`include:`▪️`include-from:`▪️`files-from:`▪️`address:`▪️`port:`▪️`sockopts:`▪️`out-format:`▪️`log-file:`▪️`log-file-format:`▪️`password-file:`▪️`bwlimit:`▪️`write-batch:`▪️`only-write-batch:`▪️`read-batch:`▪️`protocol:`▪️`iconv:`▪️`checksum-seed:`


#### 🟡 `cli` variables

- **Named**

  In `make` we can change internal variables (eg.`env`,`file`) from the command line in this way:

  ```bash
  make file=/dist/main.js
  make env=prod file=/dist/main.js
  make compile env=prod file=/dist/main.js
  ```
  in remotemon the same thing can do done :

  ```bash
  remotemon file=/dist/main.js
  ```

  it changes the internal value(s) of **associated key** in `global`:

  ```yaml
  global:
  file: /dist/main.js # <-- old value replaced with value taken from commandline
  remotehost: pi@192.152.65.12
  remotefold: ~/test
  exec-locale: make local {{global.file}}
  exec-remote: make remote
  ```

  this way we can edit the values of our makefile without opening either `.remotemon.yaml` or `makefile`.

- **Unnamed**

  Sometimes it's more convenient to not have to name your variables.

  Instead of `remotemon file=/dist/main.js` we would like to do `remotemon /dist/main.js`.

  We can in situation like that use numbered templating `{{0}}`,`{{1}}` in our config file.

  `defarg` field can also be used to provide default values if the user does not specify them.

  If we know the most common file name is `/dist/main.js` we could use `defarg: [/dist/main.js]` to not have to always provide the filename as an argument.

***When not to use remotemon ?***

- when your build process gets complicated enough to warrant the use of gulpfiles, makefiles, etc.

- `remotemon` is meant for situations where you are constantly having to configure linux system files, but also developing and running code on remote machines, that involves complicated `rsync` and `ssh` commands, but prefer to change those files from the comfort of your favorite local text editor - not everybody uses vim.

##### 🟡 all commandline options

- `--watch-config-file` or `-w`  restarts on config file change by default.

- `--dry-run` or `-d` would disable all execution, used for checking and making sure all the commands are accurate.

- `--verbose,-v` ( also  `-vv`)  would show all the command in their full form.

- `-l,--list` to see all the different commands from the command line itself.

- `-m --auto-make-directory` make remote directory if it doesn't exist.

- `-V --version` displays version number

- `-c --config` path to YAML configuration file

- `-n --no-watch` force disable any and all watches

- `-s --silent` do not show `remotemon` message

##### 🔴 Bugs

- [same object ref doesn't work #6](https://github.com/arthurlacoste/tampa/issues/6)

For now it's not possible for `remotemon` to do two levels of referencing in config file, as `remotemon` uses `tampax`, and the issue is with `tampax`, write your config files to work around the issue ( for now ).


#### LICENCE

- Code released under BSD-3-Clause.
- Documentation and images released under CC BY-NC-ND 4.0.
- details can be found [here](https://github.com/sourcevault/remotemon/blob/dev/COPYING.txt).



