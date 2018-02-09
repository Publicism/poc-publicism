FROM ubuntu:16.04

#RUN set -eu -o pipefail

# install build deps
RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:ethereum/ethereum
RUN apt-get install -y build-essential unzip libdb-dev libsodium-dev zlib1g-dev libtinfo-dev sysvbanner wrk

# install constellation
RUN apt-get install wget
RUN wget -q https://github.com/jpmorganchase/constellation/releases/download/v0.0.1-alpha/ubuntu1604.zip
RUN unzip ubuntu1604.zip
RUN cp ubuntu1604/constellation-node /usr/local/bin && chmod 0755 /usr/local/bin/constellation-node
RUN cp ubuntu1604/constellation-enclave-keygen /usr/local/bin && chmod 0755 /usr/local/bin/constellation-enclave-keygen
RUN rm -rf ubuntu1604.zip ubuntu1604

# install golang
ENV GOREL go1.7.3.linux-amd64.tar.gz
RUN wget -q https://storage.googleapis.com/golang/$GOREL
RUN tar xfz $GOREL
RUN mv go /usr/local/go
RUN rm -f $GOREL
ENV PATH $PATH:/usr/local/go/bin
#RUN echo 'PATH=$PATH:/usr/local/go/bin' >> /home/ubuntu/.bashrc

# make/install quorum
RUN apt-get install -y git
RUN git clone https://github.com/jpmorganchase/quorum.git
RUN cd quorum && git checkout tags/v1.2.0
RUN cd quorum && make all
RUN cp quorum/build/bin/geth /usr/local/bin
RUN cp quorum/build/bin/bootnode /usr/local/bin

# install Porosity (commented out for now)
# RUN wget -q https://github.com/jpmorganchase/quorum/releases/download/v1.2.0/porosity
# RUN mv porosity /usr/local/bin && chmod 0755 /usr/local/bin/porosity

# copy examples
RUN apt-get update
RUN apt-get install -y solc
COPY /examples/7nodes /quorum-examples/7nodes/

EXPOSE 22000-22006/tcp

CMD ["bash", "-c", "cd /quorum-examples/7nodes/ && bash raft-init.sh && bash raft-start.sh && tail -f qdata/logs/1.log"]