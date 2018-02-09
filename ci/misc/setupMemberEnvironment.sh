#1. Node v8.1.0
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

#2. Truffle framework for Ethereum blockchain:
npm install -g truffle

#3. Yarn:
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

#4. Angular CLI:
sudo npm install -g @angular/cli

#5. Mongod + start as in the doc https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start

#5. PM2 
sudo npm install pm2 -g

#6. Gitlab runner + setup (register, install?, start?) https://docs.gitlab.com/runner/install/linux-repository.html
sudo apt-get install gitlab-ci-multi-runner=1.10.0
# sudo gitlab-runner register

#7. Make directories 
sudo mkdir -p /var/www/prd/web
sudo mkdir -p /var/www/prd/dms
sudo mkdir -p /var/www/prd/blockchain
sudo mkdir -p /var/www/prd/proto

#8 Blockchain micropayments library

npm install -g machinomy
sudo machinomy setup