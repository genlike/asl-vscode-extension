#!/bin/bash
inputFile=$2
typeofbuild="$1"
all="All"
outputDir=$3
APP_HOME="`pwd -P`"

rm $APP_HOME/generator.properties
rm -R $APP_HOME/src-gen

if [ "$typeofbuild" != "$all" ]; then
    echo "PLATFORM=$typeofbuild" > $APP_HOME/generator.properties
fi

java -jar generator.jar $2
mv $APP_HOME/src-gen $outputDir