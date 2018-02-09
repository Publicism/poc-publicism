const Router = require('koa-router');
const routes = require('./routes');

module.exports = class Routers {
  constructor(core, app){
      this.core = core;
      this.crudRouter = new Router({ prefix: `/${EXTERNAL_API.ver}` });
      this.explorerRouter = new Router({ prefix: `/${EXTERNAL_API.ver}/explorer` });
      this.importRouter = new Router({ prefix: `/${EXTERNAL_API.ver}/import` });
      this.exportRouter = new Router({ prefix: `/${EXTERNAL_API.ver}/export` });
      this.encryptRouter = new Router({ prefix: `/${EXTERNAL_API.ver}/encrypt` });
      this.decryptRouter = new Router({ prefix: `/${EXTERNAL_API.ver}/decrypt` });
      Object.keys(routes).forEach((route)=> routes[route](this));
  }
};