const chai = require('chai');
const expect = chai.expect;
const Configurator = require('../classes/Configurator');

describe('Configurator', ()=> {
    it('constructor', (done) => {
        (async function () {
            const conf = await new Configurator();
            expect(conf.environment).to.be.eq('test');
            const certificates = conf.get('certificates');
            const RESTful = conf.get('RESTful');
            const crudApiList = conf.get('crudApiList');
            const interApiList = conf.get('interApiList');
            const interInterface = conf.get('interInterface');
            const interResponseList = conf.get('interResponseList');
            const interConverter = conf.get('interConverter');
            const crudConverter = conf.get('crudConverter');
            expect(certificates).to.be.an('object');
            expect(certificates.admin).to.have.property('ca');
            expect(certificates.admin).to.have.property('key');
            expect(certificates.admin).to.have.property('cert');
            expect(certificates.client).to.have.property('ca');
            expect(certificates.client).to.have.property('key');
            expect(certificates.client).to.have.property('cert');
            expect(interInterface).to.be.an('object');
            expect(interInterface).to.have.property('options');
            expect(interInterface.options.admin).to.have.property('ca');
            expect(interInterface.options.admin).to.have.property('key');
            expect(interInterface.options.admin).to.have.property('cert');
            expect(interInterface.options.client).to.have.property('ca');
            expect(interInterface.options.client).to.have.property('key');
            expect(interInterface.options.client).to.have.property('cert');
            expect(interInterface.options).to.have.property('host');
            expect(interInterface.options).to.have.property('port');
            expect(interInterface.options).to.have.property('checkServerIdentity');
            expect(interConverter).to.have.property(TEST_METHOD);
            expect(RESTful).to.be.an('object');
            expect(crudApiList).to.be.an('object');
            expect(interApiList).to.be.an('object');
            expect(interResponseList).to.be.an('object');
            done();
        })();
    })
});