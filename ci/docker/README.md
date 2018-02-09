# !!!!!! [WIP] Docker deployment is not ready to be used !!!!

## Deploy Web UI and DMS service

git clone http://gitlab.provectus-it.com/e-commerce/blockchain_poc.git

cd blockchain_poc/docker/dms-web/

sudo docker build -t dms-web .

sudo docker-compose up -d

## Deploy Blockchain API service

git clone http://gitlab.provectus-it.com/e-commerce/blockchain_poc.git

cd blockchain_poc

cp docker/bc-api/Dockerfile ./

sudo docker build -t bc-api .

sudo docker run -p 5000:5000 bc-api

rm Dockerfile