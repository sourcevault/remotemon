![](https://raw.githubusercontent.com/sourcevault/remotemon/dev/logo.jpg)

[![Build Status](https://travis-ci.org/sourcevault/remotemon.svg?branch=dev)](https://travis-ci.org/sourcevault/remotemon)

![](https://raw.githubusercontent.com/sourcevault/remotemon/dev/rm_when_ready.jpg)

```
npm install remotemon
// github               much install |
npm install sourcevault/remotemon#dist
```

#### How to Use

`remotemon` works purely through a single `YAML` configration file ( similar to makefiles ), by default it assumes a file named `.remotemon.yaml` as it's configration file.

It looks for  `.remotemon.yaml` in working directory and one folder up ( only ).

Running `remotemon` without any arguments makes remotemon execute default routine present in configuration file :

```zsh
sourcevault ~ code/app:(dev*) remotemon
```

`remotemon` accepts arguments which are name(s) of build routines we want to use specified through our configuration `.yaml` file.

```zsh
sourcevault ~ code/app:(dev*) remotemon test1
```

`remotemon` also accepts configuration file with a different name than `.remotemon.yaml`, using  `--config` flag :

```zsh
sourcevault ~ code/app:(dev*) remotemon --config ./custom_config.yaml
```


#### Creating Configuration `YAML` File

- **Quick Example**

  - ```yaml
    remotehost: pi@192.168.43.50  # required ( remotemon won't run without it ).
    remotefold: ~/test            # required
    localbuild: make local
    remotetask: make remote
    ```

  - ```yaml
    remotehost: pi@192.168.43.50
    remotefold: ~/test
    localbuild: make local
    remotetask: make remote
    chokidar:                     # chokidar options
      awaitWriteFinish: true
    ```

  - ```yaml
    remotehost: pi@192.168.43.50
    remotefold: ~/test
    localbuild: make local
    remotetask: make remote
    chokidar:
      awaitWriteFinish: true
    rsync:                        # rsync options
      flags:
        - recursive
        - exclude:
          - .gitignore
          - .ls
          - .git
          - .opts
    ```

  - ```yaml
    remotehost: pi@192.168.43.50
    remotefold: ~/test
    localbuild: make local
    remotetask: make remote
    chokidar:
      awaitWriteFinish: true
    rsync:
      flags:
        - recursive
        - exclude:
          - .gitignore
          - .ls
          - .git
          - .opts
    test1:                        # custom routine
      remotefold: ~/test1
    ```

- **All Configuration Options**

  - `remotehost` - `{username}@{ipaddress}` / ssh name of remote client.
  - `remotefold` - folder in remote client where we want to execute our script.
  - `watch` - local file(s) or folders(s) to watch for changes.
  - `localbuild` - local script to run before copying files to remote client and executing our scripts.
  - `remotetask`- command to execute in remote client.

  - `chokidar`- options to use for ![chokidar](https://github.com/paulmillr/chokidar) module :
    - `awaitWriteFinish`
      -  `stabilityThreshold`
      - `pollInterval`
    - `persistent`
    - `ignoreInitial`
    - `followSymlinks`
    - `disableGlobbing`
    - `usePolling`
    - `alwaysStat`
    - `ignorePermissionErrors`
    - `atomic`
    - `interval`
    - `binaryInterval`
    - `depth`
    - `ignored`
    - `cwd`

  - `rsync` - options for rsync :
    - `src` - source folder(s) to sync.
    - `des` - destination folder in remote client.
    - `flags` - rsync flags ( currently supported ) :

      - `recursive`
      - `verbose`
      - `quiet`
      - `no-motd`
      - `exclude:`
      - `checksum`
      - `archive`
      - `relative`
      - `no-OPTION`
      - `no-implied-dirs`
      - `backup`
      - `update`
      - `inplace`
      - `append`
      - `append-verify`
      - `dirs`
      - `links`
      - `copy-links`
      - `copy-unsafe-links`
      - `safe-links`
      - `copy-dirlinks`
      - `keep-dirlinks`
      - `hard-links`
      - `perms`
      - `executability`
      - `chmod:`
      - `acls`
      - `xattrs`
      - `owner`
      - `group`
      - `devices`
      - `specials`
      - `devices`
      - `specials`
      - `times`
      - `omit-dir-times`
      - `super`
      - `fake-super`
      - `sparse`
      - `dry-run`
      - `whole-file`
      - `one-file-system`
      - `block-size:`
      - `rsh:`
      - `rsync-path:`
      - `existing`
      - `ignore-existing`
      - `remove-soucre-files`
      - `del`
      - `delete`
      - `delete-before`
      - `delete-during`
      - `delete-delay`
      - `delete-after`
      - `delete-excluded`
      - `ignore-errors`
      - `force`
      - `max-delete:`
      - `max-size:`
      - `max-size:`
      - `partial`
      - `partial-dir:`
      - `delay-updates`
      - `prune-empty-dirs`
      - `numeric-ids`
      - `timeout:`
      - `contimeout:`
      - `ignore-times`
      - `size-only`
      - `modify-window:`
      - `temp-dir:`
      - `fuzzy:`
      - `compare-dest:`
      - `copy-dest:`
      - `link-dest:`
      - `compress`
      - `compress-level:`
      - `skip-compress:`
      - `cvs-exclude`
      - `filter:`
      - `F`
      - `exclude:`
      - `exclude-from:`
      - `include:`
      - `include-from:`
      - `files-from:`
      - `from0`
      - `protect-args`
      - `address:`
      - `port:`
      - `sockopts:`
      - `blocking-io`
      - `stats`
      - `8-bit-output`
      - `human-readable`
      - `progress`
      - `P`
      - `itemize-changes`
      - `out-format:`
      - `log-file:`
      - `log-file-format:`
      - `password-file:`
      - `list-only`
      - `bwlimit:`
      - `write-batch:`
      - `only-write-batch:`
      - `read-batch:`
      - `protocol:`
      - `iconv:`
      - `checksum-seed:`

- **Creating named builds**

  Named builds can be created at top-level as long as the name does not class with selected keywords ( `remotehost`,`remotefold`,`localbuild`,`remotetask`,`chokidar` and `rsync`.


  ```yaml
  mybuild1:
    remotehost: pi@192.168.43.50
    remotefold: ~/test
    localbuild: make pi1
    remotetask: make mybuild1
  mybuild2:
    remotehost: pi@192.168.43.51
    remotefold: ~/build
    localbuild: make pi2
    remotetask: make mybuild2
  ```

  values not provided in a build are merged with default provided at top-level , in case defaults don't exist at top level then valves are extracted from module's internal defaults.

  ```yaml
  rsync:
    flags:
      - recursive
      - exclude:
        - .gitignore
        - .ls
        - .git
        - .opts
  mybuild1:
    remotehost: pi@192.168.43.50
    remotefold: ~/test
    localbuild: make pi1
    remotetask: make mybuild1
  mybuild2:
    remotehost: pi@192.168.43.51
    remotefold: ~/build
    localbuild: make pi2
    remotetask: make mybuild2
  ```

In the above config file for example, `mybuild1` and `mybuild2` get their rsync values from the common `rsync` field.

Since rsync's default `src` and `des` are not provided by user in our config file, they are derived from `remotemon`'s internal defaults.

#### LICENCE

- Code released under BSD-3-Clause.
- Documentation and images released under CC BY-NC-ND 4.0.
- details can be found [here](https://github.com/sourcevault/remotemon/blob/dev/COPYING.txt).