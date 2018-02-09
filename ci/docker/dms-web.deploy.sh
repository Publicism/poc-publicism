cp docker/dms-web/docker-compose.yml ./
cp docker/dms-web/.env ./
cp docker/dms-web/Dockerfile ./
sudo docker build -t dms-web .
sudo docker-compose up -d
rm Dockerfile
rm .env
rm docker-compose.yml