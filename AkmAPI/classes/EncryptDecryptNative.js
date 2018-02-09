const h = require('highland');
const request = require('request-promise');
const errorHandler = new (require('./ErrorHandler'))();
const utils = new (require('../utils/utils'))();
const validator = new (require('./Validator'))();
const Stream = require('stream');

module.exports = class EncryptExample{
    init(struct){
        const { core, encryptRouter } = struct;
        const lists = [{ list: 'encryptApiList', converter: 'encryptConverter'}];
        lists.forEach((item)=>{
            Object.keys(core.conf.get(item.list)).forEach((routeName)=> {
                const [method, ...name] = routeName.split('-');
                const restParams = core.conf.get(item.converter)[routeName].request[EXTERNAL_API.schema];
                encryptRouter[restParams.method.toLowerCase()](`/${name.join('-')}/*`,
                    async (ctx, next)=> await this.router({
                        ctx: ctx,
                        next: next,
                        restParams: restParams,
                        routeName: routeName,
                    }));
                })
            });
    }
    async router(routerStruct){
        const { ctx, next, restParams, routeName } = routerStruct;
        const values = ctx.params[0].split('/');
        const keys = restParams.schema.split('/');
        const core = ctx.app.core;
        const interInterface = ctx.app.core.interInterface;
        const exterInterface = ctx.app.core.exterInterface;
        const msg = { [routeName]:{} };
        keys.forEach((key, idx)=> msg[routeName][key] = values[idx]);
        const struct = {
            path: values,
            schema: keys,
            msg: msg,
            converter: core.exterInterface.converter,
            ctx: ctx,
            interInterface: interInterface,
            exterInterface: exterInterface,
            core: core,
            result:{}
        };
        let options = core.conf.get('interInterface:options');
        const reqMsg = {
            'get-symmetric-key': {
                KeyName: msg[utils.getName(msg)].KeyName,
                Instance: msg[utils.getName(msg)].Instance ? msg[utils.getName(msg)].Instance: ' ',
                KeyFormat: msg[utils.getName(msg)].CipherTextFormat
            }
        };
        await interInterface.request(exterInterface.converter.convert(reqMsg));
        const symmetricKey = await new Promise((resolve,reject)=> core.AKMEmitter.on('AKM response', function listener(AKMmsg) {
            core.AKMEmitter.removeListener('AKM response', listener);
            AKMmsg ? resolve(AKMmsg.KeyValue): reject(AKMmsg)}));
        const stream = this.chunkEncryption(ctx, symmetricKey);
        ctx.body = new Stream.Readable().wrap(stream);
    }
    chunkEncryption(ctx, symmetricKey){
        //------------------------------------------------------------
        //this is an example code, need implement encryption/decryption
        return h(ctx.req).map((chunk)=> new Buffer(String.fromCharCode(...chunk).toUpperCase()))
        //------------------------------------------------------------
    }
};