const chai = require('chai');
const expect = chai.expect;
const Configurator = require('../classes/Configurator');
const ExterInterface = require('../classes/ExterInterface');
const errorHandler = new (require('../classes/ErrorHandler'))();

describe('ExterInterface', ()=> {
    it('init', (done) => {
        (async function () {
            const conf = await new Configurator();
            const exterInterface = new ExterInterface(conf);
            await exterInterface.init().catch(errorHandler.sendException);
            setTimeout(done, 1000)
        })();
    });
});