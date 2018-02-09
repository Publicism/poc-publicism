/* eslint-disable no-unused-vars */

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const fs = require('fs');
const grpc = require('grpc');
const tmp = require('tmp');
const path = require('path');
const {server} = require('../app');
const config = require('../config');
const blockchain = grpc.load(path.join(__dirname, '../../protos/blockchain.proto')).dcms.blockchain;
const client = new blockchain.Blockchain(
    config.blockchain.host + ':' + config.blockchain.port,
    grpc.credentials.createInsecure()
);
let doId = null;

chai.use(chaiHttp);

describe('api', function() {
    this.timeout(10000);
    it('should perform gas check', (done) => {
        (async function() {
            let data = {
                id: {
                    id: Buffer.from(config.currentMemberId.toString())
                },
                name: 'Member ' + config.currentMemberId.toString(),
                info: Buffer.from(JSON.stringify({
                    dmscertificate: fs.existsSync(config.cert.server.certName)
                        ? fs.readFileSync(config.cert.server.certName)
                        : '',
                    dmslocation: config.host + ':' + config.sslPort
                })).toString()
            };
            const error = await(new Promise((cb) => client.updateMember(data, cb)));
            if (error) throw new Error(error);
            done();
        })();
    });
    it('should perform system check on /systemchecks GET', (done) => {
        chai
            .request(server)
            .get('/systemchecks')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.deep.property('[0].checkname');
                res.body.should.have.deep.property('[0].checkstatus');

                done();
            });
    });

    it('should get memeber statuses on /memberstatuses GET', (done) => {
        chai
            .request(server)
            .get('/memberstatuses')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.deep.property('[0].memberid');
                res.body.should.have.deep.property('[0].memberstatus');
                res.body.should.have.deep.property('[0].membername');
                res.body.should.have.deep.property('[0].address');

                done();
            });
    });

    /*
        it('should add new DO on /dos POST', (done) => {
        let tmpObj = tmp.fileSync();

        chai
            .request(server)
            .post('/dos')
            .send({
                name: 'test',
                price: 10
            })
            .attach('file', fs.readFileSync(tmpObj.name), 'test.png')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('newobjectid');

                doId = res.body.newobjectid;

            done();
            });
        });
    */
    /*

        it('should get my DOs on /members/me/dos/all GET', (done) => {
        chai
            .request(server)
            .get('/members/me/dos/all')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.deep.property('[0].doid');
                res.body.should.have.deep.property('[0].dohash');
                res.body.should.have.deep.property('[0].createdate');
                res.body.should.have.deep.property('[0].updatedate');
                res.body.should.have.deep.property('[0].files');

                done();
                });
        });
    */

    it('should add DO request on /dorequests POST positive', (done) => {
        chai
            .request(server)
            .post('/dorequests')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({doid: doId})
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('dorequestid');

                done();
            });
    });

    /*
        it('should add DO request on /dorequests POST negative', (done) => {
        process.env.forNegativeTesting = true;

        chai
            .request(server)
            .post('/dorequests')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({doid: doId})
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('dorequestid');
                res.body.should.have.property('error');

                delete process.env.forNegativeTesting;

                done();
            });
        });
    */
    /*
        it('should get DO requests on /dorequests GET', (done) => {
        chai
            .request(server)
            .get('/dorequests')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.deep.property('[0].requestid');
                res.body.should.have.deep.property('[0].memberid');
                res.body.should.have.deep.property('[0].objectid');
                res.body.should.have.deep.property('[0].requestdate');

                done();
            });
        });

        it('should get DO request details /dorequests/:id GET', (done) => {
            chai
            .request(server)
            .get('/dorequests/' + doId)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.deep.property('[0].memberid');
                res.body.should.have.deep.property('[0].dostatus');
                res.body.should.have.deep.property('[0].dohash');
                res.body.should.have.deep.property('[0].docreatedate');
                res.body.should.have.deep.property('[0].doupdatedate');
                res.body.should.have.deep.property('[0].dorequeststatus');
                res.body.should.have.deep.property('[0].files');

                done();
            });
        });

        it('should get DO request details /dorequests/:id GET', (done) => {
        chai
            .request(server)
            .get('/dorequests/' + doId)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.deep.property('[0].memberid');
                res.body.should.have.deep.property('[0].dostatus');
                res.body.should.have.deep.property('[0].dohash');
                res.body.should.have.deep.property('[0].docreatedate');
                res.body.should.have.deep.property('[0].doupdatedate');
                res.body.should.have.deep.property('[0].dorequeststatus');
                res.body.should.have.deep.property('[0].files');

                done();
            });
        });*/
});

/* eslint-enable no-unused-vars */
