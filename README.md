### Developer machine prerequisites

Coming soon...

### To install and build all components please run the script
```bash
bash buildAll.sh
```

### To run all Member services locally

1st console (Blockchain network):

Note: VirtualBox and Vagrant should be installed
```bash
cd ci/quorum && vagrant up && vagrant ssh
```

After the previous command you should be logged to Ubuntu
Run the command inside the guest OS
```bash
bash /vagrant/run_quorum_in_vagrant.sh
```

2nd console (Blockchain API):

```bash
cd blockchain/ && yarn run truffle-migrate && yarn run serve  
```

3rd console (DMS service):  

```bash
cd dms/ && yarn run truffle-migrate && memberid=1 dmsport=8080 sslport=8081 node app.js
```

### To run additional DMS for second Member emulation (the project folder will be dublicated in parent folder)

4th console (DMS service 2nd Member):  

```bash
cd .. && rm -rf blockchain_poc_M2/ && cp -r blockchain_poc/ blockchain_poc_M2 && cd blockchain_poc_M2/dms/ && cd ../dms && bash scripts/genkey_ci.sh . localhost blockchain && memberid=2 dmsport=8082 sslport=8083 node app.js
```

### Run testrpc for tests
Prerequisites: https://github.com/ethereumjs/testrpc
cd blockchain && yarn run testrpc


### Run Geth node for tests
Prerequisites: https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum

The following script inits geth test network with 5 test accounts (type "y" to remove blockchain database when asked)
Initial balance of each account is 1 Ether (10^18 wei) but can be changed in CustomGenesis.json  
```bash
cd ci/geth/ && bash init-dev.sh
```

After init and all subsequent times you can start network by running this script alone
```bash
cd ci/geth/ && bash start-dev.sh
```

### Project environment servers

Note: SSH private key and password for all servers:
```bash
ci/misc/id_rsa
blockchain
```
1)
Environment: not defined  
Purpose: not used for now  
Hosting: Hetzner  
OS: Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-71-generic x86_64)  
ssh -i "private key path" ubuntu@devstack.lasman.info  

2)
Environment: QA  
Purpose: Quorum blockchain network  
Hosting: Azure  
Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-64-generic x86_64)  
ssh -i "private key path" ubuntu@104.42.227.163  

3)
Environment: QA  
Purpose: QA Member 1 applications stack  
Hosting: Azure  
OS: Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-78-generic x86_64)  
ssh -i "private key path" ubuntu@13.64.145.98  
WEB interface: http://13.64.145.98:8080  

4)
Environment: QA  
Purpose: Member 2 applications stack  
Hosting: Azure  
OS: Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-78-generic x86_64)  
ssh -i "private key path" ubuntu@138.91.192.90  
WEB interface: http://138.91.192.90:8080  

5)
Environment: Stage  
Purpose: Quorum blockchain network  
Hosting: Azure  
OS: Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-75-generic x86_64)  
ssh -i "private key path" andriian@13.93.217.3  

6)
Environment: QA Deploy  
Purpose: Member 1 services stack  
Hosting: Azure  
Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-78-generic x86_64)  
ssh -i "private key path" ubuntu@13.91.107.114  
WEB interface: 
Member1: http://13.91.107.114:8010
Member1: http://13.91.107.114:8020
Member1: http://13.91.107.114:8030

