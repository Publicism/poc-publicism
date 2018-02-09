#!/bin/bash
pm2 describe $1 > /dev/null
RUNNING=$?

if [ "${RUNNING}" -ne 0 ]; then
  echo "process not found"
else	
  pm2 stop $1
  pm2 delete $1
fi;