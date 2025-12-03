#!/usr/bin/env bash

pattern=".*\.(css|ts|tsx|md|json)$"

cmd="grep  -E '$pattern' | xargs prettier --config=.prettierrc"

if [ "$CI" = "true" ] || [ "$CHECK" = "true" ]; then
    cmd="$cmd --check"
else
    cmd="$cmd --write"
fi

echo ${cmd}

# Check to see if a pipe exists on stdin.
if [ -p /dev/stdin ]; then
        echo "Found piped files"
        cat | eval ${cmd}
else
        echo "Pretty all the files"
        git ls-files | eval ${cmd}
fi
