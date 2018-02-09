const chai = require('chai');
const expect = chai.expect;
const Configurator = require('../classes/Configurator');
const AkmMsgConverter = require('../classes/AkmMsgConverter');
const errorHandler = new (require('../classes/ErrorHandler'))();

describe('AkmMsgConverter', ()=> {
    let conf = {};
    let akmMsgConverter = {};
    before((done)=>{
        (async function () {
            conf = await new Configurator();
            akmMsgConverter = new AkmMsgConverter(conf);
            done();
        })()
    });
    it('constructor', (done) => {
        expect(akmMsgConverter.list).to.be.an('object');
        expect(akmMsgConverter.list).to.be.an('object');
        expect(akmMsgConverter.list[TEST_METHOD]).to.be.an('object');
        expect(akmMsgConverter.list[TEST_METHOD].request).to.be.an('object');
        done();
    });
    
    it('validator error check', (done) => {
        const fakeName = 'Fake method name';
        expect(akmMsgConverter.convert({ [fakeName]: { }}))
            .to.deep.equal({ valid: false, error: ERROR_METHOD_NOT_FOUND, subject: fakeName });
        expect(akmMsgConverter.convert({ [TEST_METHOD]: { }}))
            .to.deep.equal({ valid: false, error: ERROR_KEY_NOT_FOUND, subject: 'KeyName' });
        expect(akmMsgConverter.convert({ [TEST_METHOD]: { KeyName: TEST_KEY_NAME+(' ').repeat(40), Instance: TEST_KEY_INSTANCE, KeyFormat: TEST_KEY_FORMAT }}))
            .to.deep.equal({ valid: false, error: ERROR_LENGTH_WRONG, subject: 'KeyName' });
        expect(akmMsgConverter.convert({ [TEST_METHOD]: { KeyName: TEST_KEY_NAME_CONVERTED, Instance: TEST_KEY_INSTANCE_CONVERTED, KeyFormat:'WRG' }}))
            .to.deep.equal({ valid: false, error: ERROR_WRONG_VALUE, subject: 'KeyFormat' });
        done();
    });

    it('get-symmetric-key convert', (done) => {
        expect(akmMsgConverter.convert({
            [TEST_METHOD]: {
            KeyName: TEST_KEY_NAME_CONVERTED,
            Instance: TEST_KEY_INSTANCE_CONVERTED,
            KeyFormat:'B64'
        }
    })).to.deep.equal({ RequestID: '2002', value: `000712001${TEST_KEY_NAME_CONVERTED}${TEST_KEY_INSTANCE_CONVERTED}B64` });
        done()
    });
});