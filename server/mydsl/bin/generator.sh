#!/bin/bash
inputFile=$2
typeofbuild=$1
outputDir=$(dirname "$inputFile")
APP_HOME="`pwd -P`"

rm $APP_HOME/generator.proprieties
echo "PLATFORM=$typeofbuild" > $APP_HOME/generator.proprieties

java -jar generator.jar $2
mv $APP_HOME/src-gen $outputDir