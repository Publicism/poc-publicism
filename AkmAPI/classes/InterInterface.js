const tls = require('tls');
const fs = require('fs-extra');
const btoa = require('btoa');
const Converter = require('../classes/AkmMsgConverter');
const Stream = require('stream');
const utils = new (require('../utils/utils'))();

let inactive = true;

module.exports =  class InnerInterface {
    constructor(core){
        this.core = core;
        this.converter = new Converter(core);
        this.RequestID = null;
    }
    connect(options, response ){
        return new Promise((resolve, reject)=>{
            const self = this;
            if(inactive){
                (async function () {
                    let whoAmI;
                    options.port === options.adminPort ? whoAmI='admin': whoAmI='client';
                    options.key = `${ CERTIFICATES_PATH }/${options[whoAmI].key}`;
                    options.ca = `${ CERTIFICATES_PATH }/${options[whoAmI].ca}`;
                    options.cert = `${ CERTIFICATES_PATH }/${options[whoAmI].cert}`;
                    options.ca = typeof options.ca !=='string' ? options.ca: await fs.readFile(options.ca).catch(reject);
                    options.key = typeof options.key!=='string' ? options.key: await fs.readFile(options.key).catch(reject);
                    options.cert = typeof options.cert!=='string' ? options.cert: await fs.readFile(options.cert).catch(reject);
                    self.client = tls.connect(options, resolve);
                    self.client.on('error', (e)=> {
                        self.core.AKMEmitter.emit('AKM response', '0000899993642');
                        reject(e);
                    });
                    self.client.on('data', (data)=> {
                        response(self, data)});
                    inactive = false;
                })()
            } else setTimeout(async function(){ return await self.connect }, THROTTLE )
        })

    }

    async request(msg, response){
        const self = this;
        let options = this.core.conf.get('interInterface:options');
        (this.core.conf.get('adminRouters')).indexOf(utils.getName(msg)) >=0 ? options.port = options.adminPort: null;
        await this.connect(options, response ? response: self.response);
        if(!msg.error) {
            let msgForAkm = this.converter.convert(msg);
            this.RequestID = msgForAkm.RequestID ? msgForAkm.RequestID: this.RequestID;
            this.client.write( msg[utils.getName(msg)].Value ?
                Buffer.concat([new Buffer.from(msgForAkm.value), Buffer.from(msg[utils.getName(msg)].Value)])
                :new Buffer.from(msgForAkm.value));
        } else {
            this.client.end();
            this.core.AKMEmitter.emit('AKM response', msg);
        }
    }
    async eDecrypt(msg){
        const self = this;
        if(!msg.error) {
            let msgForAkm = this.converter.convert(msg);
            this.RequestID = msgForAkm.RequestID ? msgForAkm.RequestID: this.RequestID;
            this.client.write( msg[utils.getName(msg)].Value ?
                Buffer.concat([new Buffer.from(msgForAkm.value), Buffer.from(msg[utils.getName(msg)].Value)])
                :new Buffer.from(msgForAkm.value));
        } else {
            this.client.end();
            this.core.AKMEmitter.emit('AKM response', msg);
        }
    }
    
    edResponse(self, AKMmsg){
        let msg = self.converter.decompose(self.core, AKMmsg, self.RequestID);
        self.core.AKMEmitter.emit('AKM response', msg);
    }
    response(self, AKMmsg){
        self.client.end();
        inactive = true;
        let msg = self.converter.decompose(self.core, AKMmsg);
        self.core.AKMEmitter.emit('AKM response', msg);
    }
};