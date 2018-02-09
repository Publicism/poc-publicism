global = Object.assign(global, require('../constants'));
const fs = require('fs-extra');


module.exports = class Configurator{
    constructor(){
        const self = this;
        let interResponseList = {};
        this.conf = require('nconf');
        this.environment = this.conf.get('NODE_ENV') || process.argv[1].search('mocha')>0 ? 'test':'dev';
        this.conf.argv().env();
        this.conf.file(this.environment, './config/' + this.environment.toLowerCase() + '.json');
        this.conf.file('default', './config/default.json');
        this.conf.add('interApiList', { type: 'file', file: `./${ INTERNAL_API.dir }/${ API_LIST_FILE }` });
        Object.keys(this.conf.get('interApiList'))
            .forEach((item)=> interResponseList[this.conf.get('interApiList')[item].response.replace(`${INTERNAL_API.ver}/`,'')] = item);
        this.conf.set('interResponseList', interResponseList);
        this.conf.add('crudApiList', { type: 'file', file: `./${ EXTERNAL_API.dir }/${ API_LIST_FILE }` });
        (fs.readdirSync(this.conf.get('lang'))).forEach(file => {
                global = Object.assign(global, require(`../${this.conf.get('lang')}/${file}`));
        });

        Configurator.interInterface(this);
        return new Promise((resolve, reject)=>{
            Promise.all([
                Configurator.converter({
                    self: self,
                    conf: self.conf,
                    apiDir: INTERNAL_API.dir,
                    apiVer: INTERNAL_API.ver,
                    getName: 'interApiList',
                    setName: 'interConverter',
                }),
                Configurator.converter({
                    self: self,
                    conf: self.conf,
                    apiDir: EXTERNAL_API.dir,
                    apiVer: EXTERNAL_API.ver,
                    getName: 'crudApiList',
                    setName: 'crudConverter',
                }),
                Configurator.converter({
                    self: self,
                    conf: self.conf,
                    apiDir: EXTERNAL_API.dir,
                    apiVer: EXTERNAL_API.ver,
                    getName: 'importApiList',
                    setName: 'importConverter',
                }),
                Configurator.converter({
                    self: self,
                    conf: self.conf,
                    apiDir: EXTERNAL_API.dir,
                    apiVer: EXTERNAL_API.ver,
                    getName: 'exportApiList',
                    setName: 'exportConverter',
                }),
                Configurator.converter({
                    self: self,
                    conf: self.conf,
                    apiDir: EXTERNAL_API.dir,
                    apiVer: EXTERNAL_API.ver,
                    getName: 'encryptApiList',
                    setName: 'encryptConverter',
                })
,
                Configurator.converter({
                    self: self,
                    conf: self.conf,
                    apiDir: EXTERNAL_API.dir,
                    apiVer: EXTERNAL_API.ver,
                    getName: 'decryptApiList',
                    setName: 'decryptConverter',
                })
                
            ]).then(()=> resolve(self)).catch(reject)
        });
    }
    get(options){
      return this.conf.get(options)
    }
    static interInterface(self){
        const { conf } = self;
        let options = conf.get('certificates');

        delete options.path;
        options = Object.assign(options, conf.get('interInterface'));
        options.checkServerIdentity = (host, cert)=> undefined;
        conf.set('interInterface:options', options);
    }
    static converter(struct){
        return new Promise((resolve, reject)=>{
            const { conf, apiDir, apiVer, getName, setName } = struct;
            let list = conf.get(getName);
            let idsObj = {};
            let idsPromiseArray=[];
            Object.keys(list)
                .forEach((method)=> Object.keys(list[method])
                  .forEach((property)=> idsPromiseArray.push((fs.readFile(`./${ apiDir }/${list[method][property]}.json`)))));
            Promise.all(idsPromiseArray).then((valueArray)=> {
                valueArray.map((id) => JSON.parse(id.toString()))
                  .forEach((level) => Object.keys(level).map((item) => idsObj[item] = level[item]));

                Object.keys(list).forEach((method) => Object.keys(list[method])
                  .forEach((property) => {
                    list[method][property] = idsObj[list[method][property].replace(`${ apiVer }\/`,'')]}));

                conf.set(setName, list);
                resolve()
            });
        });
        
    }
};