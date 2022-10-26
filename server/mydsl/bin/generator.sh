#!/bin/bash
inputFile=$2
typeofbuild=$1
outputDir=$3
APP_HOME="`pwd -P`"

rm $APP_HOME/generator.properties
rm -R $APP_HOME/src-gen
echo "PLATFORM=$typeofbuild" > $APP_HOME/generator.properties

java -jar generator.jar $2
mv $APP_HOME/src-gen $outputDir