cp docker/bc-api/Dockerfile ./
sudo docker build -t bc-api .
sudo docker run -p 5000:5000 bc-api
rm Dockerfile