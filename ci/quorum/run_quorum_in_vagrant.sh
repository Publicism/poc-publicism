#!/usr/bin/env bash

rm -rf ~/test/ &&
cp -r /vagrant/examples/7nodes/ ~/test/ &&
cd ~/test/ &&
bash ~/test/raft-init.sh &&
bash ~/test/raft-start.sh