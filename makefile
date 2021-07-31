SRC_NAME = $(shell ls src)

SRC_NAME = $(shell ls src | grep ".\(ls\)")

TEST_NAME = $(shell ls test | grep ".\(ls\|yaml\)")

SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile --watch .remotemon.yaml

# SRC_FILES = ${SRC_NAME:%=--watch src/%} --watch makefile


TEST_FILES = ${TEST_NAME:%=--watch test/%}

MAKEFLAGS += --no-print-directory

file = test/test.js

pkg:
	yaml2json src/package.yaml > package.json

compile:
	lsc --no-header -cbo dist src
	lsc -cb test
	make pkg

# 	remotemon --config ../router/.remotemon.yaml -w

# 	remotemon --config test/opt.yaml -w foo


# 	remotemon longname -w foo bar

	remotemon bar



# 	remotemon -c ./test/opt.yaml version.update


# 	remotemon --config test/opt.yaml pkg


# 	remotemon --config test/opt.yaml -l

# 	file=hello foo bar

w.compile:
	nodemon  --exec "make compile || exit 1" ${SRC_FILES} ${TEST_FILES}
# 	nodemon  --exec "make compile || exit 1" ${SRC_FILES}

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

nothing:

w.sudo:
	nodemon  --exec "sudo apt-get update"
