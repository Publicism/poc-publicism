const h = require('highland');
const validator = new (require('./Validator'))();
const utils = new (require('../utils/utils'))();
const errorHandler = new (require('./ErrorHandler'))();
const Stream = require('stream');
const fs = require('fs-extra');

module.exports = class EncryptDecrypt{
    init(struct){
        const { core, encryptRouter, decryptRouter } = struct;
        let router, encryption, decryption;
        const lists = [{ list: 'encryptApiList', converter: 'encryptConverter'}, { list: 'decryptApiList', converter: 'decryptConverter'}];
        lists.forEach((item)=>{
            Object.keys(core.conf.get(item.list)).forEach((routeName)=> {
                switch(item.list){
                    case 'encryptApiList': router = encryptRouter;
                        encryption= {
                            textProp: 'CipherText',
                            lengthProp: 'PlainTextLength',
                            confProp: 'encryptionRouters'
                        };
                        break;
                    case 'decryptApiList': router = decryptRouter;
                        decryption= {
                            textProp: 'PlainText',
                            lengthProp: 'CipherTextLength',
                            confProp: 'decryptionRouters'
                        };
                        break;
                }
                const [method, ...name] = routeName.split('-');
                const restParams = core.conf.get(item.converter)[routeName].request[EXTERNAL_API.schema];
                router[restParams.method.toLowerCase()](`/${name.join('-')}/*`,
                    async (ctx, next)=> await this.router({
                        ctx: ctx,
                        next: next,
                        restParams: restParams,
                        routeName: routeName,
                        lengthProp: item.list==='encryptApiList' ? encryption.lengthProp: decryption.lengthProp,
                        textProp: item.list==='encryptApiList' ? encryption.textProp: decryption.textProp,
                        confProp: item.list==='encryptApiList' ? encryption.confProp: decryption.confProp
                    }));
            });
        });
    }
    async router(routerStruct){
        const { ctx, next, restParams, routeName, lengthProp, textProp, confProp } = routerStruct;
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
            msgSetup: EncryptDecrypt.MsgSetup(),
            lengthProp: lengthProp,
            textProp: textProp,
            result:{}
        };
        let options = core.conf.get('interInterface:options');
        (core.conf.get(confProp)).indexOf(utils.getName(msg)) >=0 ? options.port = options.encryptDecryptPort: null;
        await interInterface.connect(options, interInterface.edResponse);
        struct.msgSetup.init(msg);
        const stream = this.chunkEncryptDecrypt(struct);
        ctx.body = new Stream.Readable().wrap(stream);
    }
    chunkEncryptDecrypt(struct) {
        const { ctx, msg, interInterface, core, exterInterface, msgSetup, lengthProp, textProp } = struct;
        let start = true;
        let block=[];
        return h(ctx.req).flatMap((chunk)=> {
            switch(EncryptDecrypt.checkState(start, msg)) {
                case 'start':
                    msgSetup.start(msg);
                    start = false;
                    break;
                case 'part':
                    msgSetup.part(msg);
                    break;
                case 'final':
                    msgSetup.final(msg, chunk.length);
                    break;
            }
            msgSetup.default(msg, chunk, lengthProp);
            // console.log('input chunk: ',chunk.length);
            const validated = validator.checkRestParams(struct).result();
            if(validated.valid) interInterface.eDecrypt(exterInterface.converter.convert(msg));
            else return h.nil;
            msg[utils.getName(msg)].ValueLength = msg[utils.getName(msg)].ValueLength - chunk.length;
            return h(new Promise((resolve,reject)=> core.AKMEmitter
                .on('AKM response', function listener(AKMmsg) {
                    core.AKMEmitter.removeListener('AKM response', listener);
                    // AKMmsg[textProp] ? console.log('return chunk length:', AKMmsg[textProp].length):null;
                    AKMmsg[textProp] ? resolve(AKMmsg[textProp]): reject(AKMmsg)}))
                .catch((AKMmsgError)=> {
                    errorHandler.sendError(AKMmsgError);
                    ctx.body = AKMmsgError;
                    ctx.res.statusCode = 500;
            }));
        })
    }
    static checkState(start, msg){
        if(start) return 'start';
        if(msg[utils.getName(msg)].ValueLength) return 'part';
        else return 'final';
    }
    static MsgSetup(){
        return {
            init: (msg)=>{
                const IV = String.fromCharCode(...Array.from(new Array(16),()=> parseInt(Math.floor(Math.random()*99).toString(16))));
                msg[utils.getName(msg)].ValueLength = parseInt(msg[utils.getName(msg)].ValueLength);
                return msg;
            },
            start: (msg)=>{
                msg[utils.getName(msg)].NewKeyFlag = 'Y';
                msg[utils.getName(msg)].EndOfRequestFlag = 'Y';
                msg[utils.getName(msg)].FinalFlag = 'N';
                msg[utils.getName(msg)].NewIVFlag = 'Y';
                msg[utils.getName(msg)].Instance = msg[utils.getName(msg)].Instance ? msg[utils.getName(msg)].Instance:'    ';
                return msg;
            },
            part: (msg)=>{
                msg[utils.getName(msg)].partial = true;
                msg[utils.getName(msg)].NewKeyFlag='N';
                msg[utils.getName(msg)].NewIVFlag='N';
                return msg;
            },
            final: (msg, length)=>{
                msg[utils.getName(msg)].FinalFlag = 'Y';
                // msg[utils.getName(msg)].PaddingFlag = '7';
                msg[utils.getName(msg)].ValueLength = length;
                return msg;
            },
            default: (msg, chunk, lengthProp)=>{
                msg[utils.getName(msg)].Value = chunk;
                msg[utils.getName(msg)][lengthProp] = ('00000' + chunk.length).slice(-5);
                return msg;
            }
        }
    }
};