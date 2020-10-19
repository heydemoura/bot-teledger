#!/bin/bash
#

while inotifywait -e modify ./journal.dat; do
    cd $ACCOUNTING_DIR;
    git add .
    git commit -m "New Transaction"
    git push origin develop
done
