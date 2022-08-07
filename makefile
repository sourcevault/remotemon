SRC_NAME = $(shell ls src)

SRC_NAME = $(shell ls src | grep ".\(ls\)")

TEST_NAME = $(shell ls test | grep ".\(ls\|yaml\)")

# SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile --watch .remotemon.yaml

# SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile --watch ./test/var/.remotemon.yaml


# SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile --watch ./test/var/.remotemon.yaml --watch /mnt/c/code/rpi/.remotemon.yaml

SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile

TEST_FILES = ${TEST_NAME:%=--watch test/%}

MAKEFLAGS += --no-print-directory

file = test/test.js

pkg:
	yaml2json -p src/package.yaml > package.json


create_configfile_error:
	sleep 6
	echo -e "\n3" >> /mnt/c/code/mono/gitfer/.remotemon.yaml
	sleep 5
	truncate -s-2 /mnt/c/code/mono/gitfer/.remotemon.yaml

compile:
	lsc --no-header -cbo dist src
	lsc -cb test
	yaml2json -p src/package.yaml > package.json

# 	remotemon --config test/opt.yaml -w foo

# 	remotemon longname -w foo bar
# 	cd ../convert

# 	remotemon --project test


# 	remotemon -p router hostapd.status

# 	remotemon -vv longname

# 	remotemon ext=ex4 remotehost="192.148.92.1"

# 	remotemon -p remotemon/test/var longname foo bar ext=456
# 	remotemon -p remotemon/test/var longname foo
# 	remotemon -w -p remotemon/test/var longname

# 	remotemon -ccc -d -p rpi send './imagine-utils' '~/imagine-utils'
# 	remotemon -ccc -p rpi cp.image.utils a -- -d -vv
# 	remotemon -ccc -p rpi cp.image.utils -- -d -vv

# 	remotemon -p rpi cp.image.utils -- -vv

# 	remotemon -p rpi -vvv send ./imagine-utils

#		remotemon -p rpi -vvv send ./imagine-utils

# 	./dist/cmdline.js -p rpi install.zsh -vv -d

# 	./dist/cmdline.js -p rpi fail.build --resume

# 	./dist/cmdline.js -w -p mono/gitfer fail.build 

# 	./dist/cmdline.js -w -p mono/gitfer fail.build
# 	./dist/cmdline.js -w -p mono/gitfer fail.build


# 	make create_configfile_error & ./dist/cmdline.js -w -p mono/gitfer fail.build 


	./dist/cmdline.js -p yt test

# 	./dist/cmdline.js -p mono/gitfer --ll

# 	./dist/cmdline.js -p yt video


# 	./dist/cmdline.js -p rpi fail.build --resume
# 	./dist/cmdline.js -p yt empty
# 	./dist/cmdline.js -p mono/hoplon -ll

# 	./dist/cmdline.js -p mono/autousb remote.install.node
# 	./dist/cmdline.js -p mono/autousb remote.install.node --resume
# 	./dist/cmdline.js -p mono/autousb remote.install.node --resume
# 	./dist/cmdline.js -p mono/autousb remote.install.node 

# 	./dist/cmdline.js -p rpi fail.build


# 	./dist/cmdline.js -p rpi -ll


# 	remotemon -p mono/hoplon test.proj proj=guard

# 	remotemon -p mono/hoplon -l




# 	remotemon -c ./test/opt.yaml version.update


# 	remotemon --config test/opt.yaml pkg


# 	remotemon --config test/opt.yaml -l

# 	file=hello foo bar

ncc:
	yq w -i src/package.yaml bin.remotemon 'bundle/index.js'
	lsc --no-header -cbo dist src
	lsc -cb test
	yaml2json -p src/package.yaml > package.json
	ncc --minify build ./dist/cmdline.js -o ./bundle
	yq w -i src/package.yaml bin.remotemon 'dist/cmdline.js'

r.ncc:
	make ncc
	./bundle/index.js -p rpi install.zsh -v -d machine=backup -ccc
# 	./dist/cmdline.js -p rpi install.zsh -v -d machine=backup -ccc

w.ncc:
	nodemon  --delay 1 --exec "make r.ncc || exit 1" ${SRC_FILES} 

w.compile:
# 	nodemon --exec "make compile || exit 1" ${SRC_FILES} ${TEST_FILES}
	nodemon  --delay 1 --exec "make compile || exit 1" ${SRC_FILES}

.ONESHELL:
SHELL = /bin/bash
.SHELLFLAGS = -ec

travis:
	@for i in test/*.js
	do
		node $$i
	done

testy:
	@lsc -co dist src
	@lsc -c test/*.ls
	make pkg
	make travis

w.testy:
	nodemon --exec "make testy" ${TEST_FILES} ${SRC_FILES}

w.sudo:
	nodemon  --exec "sudo apt-get update"


update-version:
	@update-version src/config.remotemon.yaml remotemon current_version_number
	@update-version src/package.yaml remotemon version



