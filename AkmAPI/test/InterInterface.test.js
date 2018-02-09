const chai = require('chai');
const expect = chai.expect;
const Configurator = require('../classes/Configurator');
const InterInterface = require('../classes/InterInterface');
const EventEmitter = require('events');
class AKMEmitter extends EventEmitter {}

const errorHandler = new (require('../classes/ErrorHandler'))();

describe('InterInterface', ()=> {
    it('connect', (done) => {
        (async function () {
            const conf = await new Configurator();
            conf.AKMEmitter = new AKMEmitter();
            const interInterface = new InterInterface(conf);
            done();
        })();
    });
});