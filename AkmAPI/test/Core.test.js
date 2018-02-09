const chai = require('chai');
const expect = chai.expect;
const Core = require('../classes/Core');
const errorHandler = new (require('../classes/ErrorHandler'))();

describe('Core', ()=> {
    it('constructor', (done) => {
        (async function () {
            const core = await new Core();
            done()
        })()
    });
    it('init', (done) => {
        (async function () {
            const core = await new Core();
            await core.exterInterface.init().catch(errorHandler.sendException);
            await core.exterInterface.request({
                [TEST_METHOD]: {
                    KeyName: TEST_KEY_NAME,
                    Instance: TEST_KEY_INSTANCE,
                    KeyFormat:'B64'
                }
            });
            setTimeout(done, 1000)
        })();
    });
    
});