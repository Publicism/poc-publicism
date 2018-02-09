FROM mongo:latest

# PART 1: Node.js & nmp

RUN apt-get update && apt-get install nodejs \
    && apt-get install npm \
    && ln -s "$(which nodejs)" /usr/bin/node 

# PART 2: Ethereum Blockchain API 

# Copy project
WORKDIR blockchain_poc
COPY ./blockchain ./blockchain
COPY ./protos ./protos

# Setup project
RUN cd blockchain && npm install && truffle migrate --reset

# Expose ports
EXPOSE 5000

# Run app
ENTRYPOINT ["node", "dist/index.js"]