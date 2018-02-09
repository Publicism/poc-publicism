module.exports = (struct)=>{
    const { core, explorerRouter } = struct;
    explorerRouter.get('*',(ctx, next)=> {
        const interList = ctx.app.core.interInterface.converter.list;
        const exterList = ctx.app.core.exterInterface.converter.list;
        const struct = {
            interList: interList,
            exterList: [{ name:'CRUD methods',list:exterList[0] }, { name:'Import methods',list:exterList[1] },{ name:'Export methods',list:exterList[2] }, { name:'Encrypt methods',list:exterList[3] }, { name:'Decrypt methods',list:exterList[4] }],
            title: EXPLORER_TITLE
        };
        ctx.render('index', struct)})
};