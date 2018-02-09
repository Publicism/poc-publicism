const Converter = require('../classes/ExterConverter');

module.exports =  class ExterInterface {
    constructor(core){
        this.core = core;
    }
    init(){
        const self = this;
        return new Promise((resolve, reject)=>{
            (async function () {
                self.converter = new Converter(self.core);
                resolve()
            })()
        })
    }
    request(msg){
        this.core.interInterface.request(this.core.exterInterface.converter.convert(msg))
    }
};