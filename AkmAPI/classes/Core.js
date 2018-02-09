const InterInterface = require('./InterInterface');
const ExterInterface = require('./ExterInterface');
const Configurator = require('./Configurator');

const EventEmitter = require('events');
class AKMEmitter extends EventEmitter {}

module.exports =  class Core {
    constructor(){
        return new Promise((resolve, reject)=>{
            const self = this;
            this.conf = {};
            (async function () {
                self.conf = await new Configurator().catch(reject);
                self.interInterface = new InterInterface(self);
                self.exterInterface = new ExterInterface(self);
                self.AKMEmitter = new AKMEmitter();
                self.AKMEmitter.setMaxListeners(0);
                resolve(self);
            })()
        });
    }
    init(){
        return this.exterInterface.init();
    }
};