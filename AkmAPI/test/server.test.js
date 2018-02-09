const chai = require('chai');
const expect = chai.expect;
const server = new (require('../server'))();
const request = require('request-promise');

describe('RESTful', ()=> {
    let connection = {};
    before((done) => {
        (async function () {
            connection = await server.start();
            done()
        })();
    });
    describe('GET ', ()=> {
        it(`/${EXTERNAL_API.ver}/`, (done) => {
            const confOptions = server.core.conf.get('RESTful');
            const options = {
                uri:`http://${ confOptions.host }:${ confOptions.port }/${ EXTERNAL_API.ver }`,
                json: true
            };
            (async function () {
                expect(await request(options)).to.deep.equal({ version: EXTERNAL_API.version});
                done()
            })();
        
        });
        it(`${ EXTERNAL_API.ver }/${TEST_METHOD.replace('get-','')}/${ TEST_KEY_NAME }//${ TEST_KEY_FORMAT }`, (done) => {
            const confOptions = server.core.conf.get('RESTful');
            const crudConverter = server.core.conf.get('crudConverter')[EXTERNAL_API.schema];
            const options = {
                uri:`http://${ confOptions.host }:${ confOptions.port }/${ EXTERNAL_API.ver }/${TEST_METHOD.replace('get-','')}/${ TEST_KEY_NAME }/ /${ TEST_KEY_FORMAT }`,
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });

    
    after((done)=>{
        server.stop(connection);
        done();
    })
});