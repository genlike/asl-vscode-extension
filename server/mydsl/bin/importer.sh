#!/bin/bash
typeofbuild="$1"
all="All"
outputDir=$2
APP_HOME="`pwd -P`"

#unzip $2 -d ./src-gen

#

java -cp ../lib/org.itlingo.asl.ide-1.0.0-SNAPSHOT-ls.jar org.itlingo.asl.importer.Program 1 "$APP_HOME/src-gen" "output.asl" $1

mv output.asl $2/output$(date +%s).asl

#rm -R $APP_HOME/src-gen