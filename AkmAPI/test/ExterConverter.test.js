const chai = require('chai');
const expect = chai.expect;
const Configurator = require('../classes/Configurator');
const ExterConverter = require('../classes/ExterConverter');
const errorHandler = new (require('../classes/ErrorHandler'))();

describe('ExterConverter', ()=> {
    let conf = {};
    let exterConverter = {};
    before((done)=>{
        (async function () {
            conf = await new Configurator();
            exterConverter = new ExterConverter(conf);
            done();
        })()
    });
    it('constructor', (done) => {
        expect(exterConverter.list).to.be.an('array');
        expect(exterConverter.list).to.be.an('array');
        expect(exterConverter.list[0][TEST_METHOD]).to.be.an('object');
        expect(exterConverter.list[0][TEST_METHOD].request).to.be.an('object');
        done();
    });
    it('validator error check', (done) => {
        const fakeName = 'Fake-method-name';
        const methodName = TEST_METHOD;
        expect(exterConverter.convert({ [fakeName]: { }}))
            .to.deep.equal({ valid: false, error: ERROR_METHOD_NOT_FOUND, subject: fakeName });
        expect(exterConverter.convert({ [TEST_METHOD]: { }}))
            .to.deep.equal({ valid: false, error: ERROR_KEY_NOT_FOUND, subject: 'KeyName' });
        expect(exterConverter.convert({ [TEST_METHOD]: { KeyName: TEST_KEY_NAME, Instance: TEST_KEY_INSTANCE }}))
            .to.deep.equal({ valid: false, error: ERROR_KEY_NOT_FOUND, subject: 'KeyFormat' });
        expect(exterConverter.convert({ [TEST_METHOD]: { KeyName: { wrong:'wrong type'},
            Instance: { wrong:'wrong type'}, KeyFormat: { wrong:'wrong type'} }}))
            .to.deep.equal({ valid: false, error: ERROR_WRONG_TYPE, subject: 'KeyName' });
        expect(exterConverter.convert({ [TEST_METHOD]: { KeyName: TEST_KEY_NAME+(' ').repeat(40), Instance: TEST_KEY_INSTANCE, KeyFormat: TEST_KEY_FORMAT }}))
            .to.deep.equal({ valid: false, error: ERROR_MAX_LENGTH_EXCEED, subject: 'KeyName' });
        expect(exterConverter.convert({ [TEST_METHOD]: { KeyName: TEST_KEY_NAME, Instance: TEST_KEY_INSTANCE, KeyFormat:'WRG' }}))
            .to.deep.equal({ valid: false, error: ERROR_WRONG_VALUE, subject: 'KeyFormat' });
        done();
    });
    it('get-symmetric-key convert', (done) => {
        expect(exterConverter.convert({
            [TEST_METHOD]: {
                KeyName: TEST_KEY_NAME,
                Instance: TEST_KEY_INSTANCE,
                KeyFormat:TEST_KEY_FORMAT
            }
        })).to.deep.equal({
            [TEST_METHOD]:{
                KeyName: TEST_KEY_NAME_CONVERTED,
                Instance: TEST_KEY_INSTANCE_CONVERTED,
                KeyFormat: TEST_KEY_FORMAT
            }
        });
        done()
    });
});