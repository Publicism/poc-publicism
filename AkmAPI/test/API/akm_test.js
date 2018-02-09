global = Object.assign(global, require('../../constants'));
const h = require('highland');
const chai = require('chai');
const expect = chai.expect;
const request = require('request-promise');
const testUtils = new (require('../utils/TestUtils'))();
const tls = require('tls');
const fs = require('fs-extra');
const EventEmitter = require('events');
class AKMEmitter extends EventEmitter {}

describe.skip('AKM', ()=> {
    it('encrypt test', (done) => {
        (async function () {
            console.time('encryption');
            const aKMEmitter = new AKMEmitter();
            aKMEmitter.setMaxListeners(0);
            console.time(`Create ${TEST_BIG_FILE}`);
            await fs.writeFile(TEST_BIG_FILE, testUtils.genBigFileData()).catch(console.error);
            console.timeEnd(`Create ${TEST_BIG_FILE}`);
            const options = {
                host:'52.178.152.197'
            };
            let stats = fs.statSync(TEST_BIG_FILE).size;
            options.port = 6003;
            options.key = `${process.cwd()}/config/certificates/AKMClientPrivateKey.pem`;
            options.ca = `${process.cwd()}/config/certificates/AKMRootCACertificate.pem`;
            options.cert = `${process.cwd()}/config/certificates/AKMClientCertificate.pem`;
            options.ca = await fs.readFile(options.ca).catch(console.error);
            options.key = await fs.readFile(options.key).catch(console.error);
            options.cert = await fs.readFile(options.cert).catch(console.error);
            options.checkServerIdentity = (host, cert)=> undefined;
            const client = await tls.connect(options);
            client.on('error', (e)=> {
                console.error(e);
            });
            client.on('data', (AKMMsg)=> {
                aKMEmitter.emit('AKM response', AKMMsg);
                // console.log(String.fromCharCode(...AKMMsg))
            });
            let msgForAkm;
/*            let msgForAkm='000982019YNBIN16272YNNYvvvvvvvvvvvvvvvvTestKey01                                                       ';
            const Value = '1234567890'.repeat(1627)+'en';
            client.write( Buffer.concat([new Buffer.from(msgForAkm), Buffer.from(Value)]));
            msgForAkm='NNBIN16272YNNN';
            client.write( Buffer.concat([new Buffer.from(msgForAkm), Buffer.from(Value)]));
            msgForAkm='NNBIN16272YNNN';
            client.write( Buffer.concat([new Buffer.from(msgForAkm), Buffer.from(Value)]));
            msgForAkm='NNBIN16272YNNN';
            client.write( Buffer.concat([new Buffer.from(msgForAkm), Buffer.from(Value)]));*/
            let first = true;
            h(fs.createReadStream(TEST_BIG_FILE, { highWaterMark: CHUNK_SIZE })).flatMap((chunk)=>{
                if(first){
                    msgForAkm='000982019YNBIN16272YNNYvvvvvvvvvvvvvvvvTestKey01                                                       ';
                    first = false;
                } else if(stats>CHUNK_SIZE) {
                    msgForAkm='NNBIN16272YNNN';
                    console.log(stats);
                } else {
                    msgForAkm='NNBIN16272YNNY';
                    client.write( Buffer.concat([new Buffer.from(msgForAkm), Buffer.from(chunk)]));
                    console.timeEnd('encryption');
                    done();
                }
                client.write( Buffer.concat([new Buffer.from(msgForAkm), Buffer.from(chunk)]));
                stats = stats - chunk.length;
                return h(new Promise((resolve,reject)=> {
                    aKMEmitter.on('AKM response', (AKMmsg)=> {
                        resolve(Buffer.from(Array.from(AKMmsg).splice(44)));

                    })
                }));
                }).pipe(fs.createWriteStream(TEST_BIG_FILE.replace('txt','enc')));
        })()
    })
});