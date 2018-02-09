cd blockchain && rm -rf node_modules/ && yarn install --pure-lockfile
cd ../dms && rm -rf node_modules/ && yarn install --pure-lockfile
cd ../web && rm -rf node_modules/ && yarn install --pure-lockfile && yarn run build
# generate TLS certificates
cd ../dms && bash scripts/genkey_ci.sh . localhost blockchain
# cleanup updoads
cd uploads/dataobjects/ && find . ! -name 'discovered' -type d -exec rm -rf {} +
cd discovered/ && find . -type d -exec rm -rf {} +
# cleanup log file of micropayments
> ~/.machinomy/storage.db