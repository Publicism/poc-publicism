const Koa = require('koa');
const app = new Koa();
const Core = require('./classes/Core');
const koaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
// const bodyParser = require('koa-body');
const json = require('koa-json');
const logger = require('./classes/Logger');
const Pug = require('koa-pug');
const Routers = require('./classes/Routers');
const errorHandler = new (require('./classes/ErrorHandler'))();
const exceptions = ['uncaughtException', 'unhandledRejection', 'UnhandledPromiseRejectionWarning'];

module.exports = Server = class Server{
    constructor(){
        this.core = {};
    }
    async start() {
        this.core = await new Core();
        await this.core.exterInterface.init().catch(errorHandler.sendException);
        const routers = new Routers(this.core, app);
        const conf = this.core.conf;
        const port = conf.get('RESTful').port;
        const pug = new Pug({
            viewPath: './views',
            basedir: './views',
            debug: false,
            pretty: false,
            compileDebug: false,
            app: app
        });
        app.use(koaLogger())
            .use(bodyParser({ multipart: true }))
            .use(routers.crudRouter.routes())
            .use(routers.explorerRouter.routes())
            .use(routers.exportRouter.routes())
            .use(routers.encryptRouter.routes())
            .use(routers.decryptRouter.routes())
            .use(routers.importRouter.routes());
        
        app.core = this.core;
        app.use(require('koa-static')(`${__dirname}/public`));
        logger.log(REST_START_MSG + port);
        
        const conn = app.listen(port);
        app.on('error', (err)=> this.stop(conn, err));
        return conn
    };
    stop(connection, err){
        connection.close();
        err ? errorHandler.sendException(err): null;
    };
};

if(process.argv[1].search('mocha')<0){
    (async function () {
        const server = new Server();
        const connection = await server.start().catch(errorHandler.sendException);
        exceptions.forEach((exception)=> process.on(exception, (ex)=> server.stop(connection, ex)))
    })();
}



