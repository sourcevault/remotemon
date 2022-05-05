SRC_NAME = $(shell ls src)

SRC_NAME = $(shell ls src | grep ".\(ls\)")

TEST_NAME = $(shell ls test | grep ".\(ls\|yaml\)")

# SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile --watch .remotemon.yaml

SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile --watch ./test/var/.remotemon.yaml

# SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile 


TEST_FILES = ${TEST_NAME:%=--watch test/%}

MAKEFLAGS += --no-print-directory

file = test/test.js

pkg:
	yaml2json -p src/package.yaml > package.json


compile:
	lsc --no-header -cbo dist src
	lsc -cb test
	yaml2json -p src/package.yaml > package.json

# 	remotemon --config test/opt.yaml -w foo

# 	remotemon longname -w foo bar
# 	cd ../convert
# 	remotemon -vv -p yt audio "https://www.youtube.com/watch\?v\=cckKH0yLO2I"

# 	remotemon --project test

# 	remotemon -p yt video https://www.youtube.com/watch\?v\=eXNEpQCXHaE

# 	remotemon -p router hostapd.status

# 	remotemon -vv longname
# 	remotemon -p yt audio https://www.youtube.com/watch\?v\=EZgcSJ6D8cQ

# 	remotemon ext=ex4 remotehost="192.148.92.1"

# 	remotemon -p remotemon/test/var longname foo bar ext=456
# 	remotemon -p remotemon/test/var longname foo
# 	remotemon -w -p remotemon/test/var longname
	remotemon -p mono/autousb prompt

# 	remotemon -c ./test/opt.yaml version.update


# 	remotemon --config test/opt.yaml pkg


# 	remotemon --config test/opt.yaml -l

# 	file=hello foo bar

w.compile:
# 	nodemon  --exec "make compile || exit 1" ${SRC_FILES} ${TEST_FILES}
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
