
inputFile = $2
typeofbuild = $1
outputDir=dirname $inputFile
APP_HOME="`pwd -P`"

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
else
    JAVACMD="java"
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
fi

# Collect all arguments for the java command, following the shell quoting and substitution rules
eval set -- $DEFAULT_JVM_OPTS $JAVA_OPTS $MYDSL_STANDALONE_OPTS -jar $APP_HOME/bin/org.xtext.itlingo.asl.ide-1.0.0-SNAPSHOT-ls.jar "$APP_ARGS"

rm $APP_HOME/bin/generator.proprieties
echo "PLATFORM=$typeofbuild" > $APP_HOME/bin/generator.proprieties

exec "$JAVACMD" "$2"
mv  -R $APP_HOME/bin/src-gen $outputDir