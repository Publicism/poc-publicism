module.exports = (struct)=>{
    const { core, crudRouter } = struct;
    crudRouter.get('/',(ctx, next)=> ctx.body = { version: EXTERNAL_API.version });
};