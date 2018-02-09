const validator = new (require('../Validator'))();
const utils = new (require('../../utils/utils'))();



module.exports = (struct)=> {
    const { core, crudRouter, importRouter, exportRouter, encryptRouter } = struct;
    let router;
    const lists = [{ list: 'crudApiList', converter: 'crudConverter'}, { list: 'importApiList', converter: 'importConverter'}, { list: 'exportApiList', converter: 'exportConverter'}];
    lists.forEach((item)=>{
        Object.keys(core.conf.get(item.list)).forEach((routeName)=>{
            switch(item.list){
                case 'crudApiList': router = crudRouter;
                    break;
                case 'importApiList': router = importRouter;
                    break;
                case 'exportApiList': router = exportRouter;
                    break;

            }
            const [ method, ...name ] = routeName.split('-');
            const restParams = core.conf.get(item.converter)[routeName].request[EXTERNAL_API.schema];
            router[restParams.method.toLowerCase()](`/${name.join('-')}/*`, async (ctx, next)=>{
                const values = ctx.params[0].split('/');
                const keys = restParams.schema.split('/');
                const core = ctx.app.core;
                const interInterface = ctx.app.core.interInterface;
                const exterInterface = ctx.app.core.exterInterface;
                const msg = {
                    [routeName]:{}
                };
                keys.forEach((key, idx)=> msg[routeName][key] = values[idx]);
                const struct = {
                    path: values,
                    schema: keys,
                    msg: msg,
                    converter: core.exterInterface.converter,
                    result:{}
                };
                if(ctx.request.body.Value && ctx.request.body.Value.data){
                    msg[utils.getName(msg)].Value  = ctx.request.body.Value.data;
                    msg[utils.getName(msg)].ValueLength = ('00000' + ctx.request.body.Value.data.length).slice(-5)
                }
                const validated = validator.checkRestParams(struct).result();
                if(validated.valid) interInterface.request(exterInterface.converter.convert(msg));
                else ctx.body = validated;
                const AKMmsg = await new Promise((resolve,reject)=> core.AKMEmitter.on('AKM response', (msg)=> resolve(msg)));
                ctx.body = AKMmsg.error ? AKMmsg: { request: interInterface.converter.convert(exterInterface.converter.convert(msg)), response: AKMmsg  }
            })
        });

    });
};