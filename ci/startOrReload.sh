#!/bin/bash
pm2 describe $1 > /dev/null
RUNNING=$?

if [ "${RUNNING}" -ne 0 ]; then
  pm2 start $2 --name $1
else
  pm2 stop $1
  pm2 delete $1
  pm2 start $2 --name $1
fi;