const validator = new (require('./Validator'))();
const utils = new (require('../utils/utils'))();


module.exports =  class ExterConverter {
    constructor(core){
        this.list = [ core.conf.get('crudConverter'), core.conf.get('importConverter'), core.conf.get('exportConverter'), core.conf.get('encryptConverter'), core.conf.get('decryptConverter')];
    }
    convert(msg){
        const list = this.list.filter((converter)=> converter[utils.getName(msg)])[0];
        const validated = validator
            .checkName({ msg, converter: { list: list }, result: {}})
            .checkKeys()
            .checkTypes()
            .checkMaxLengths()
            .checkValues()
            .result();
        if(validated.valid) return ExterConverter.convertValid(msg, this);
        else return validated;
    }
    static convertValid(msg, self) {
        let converted = { [utils.getName(msg)]: {} };
        const list = self.list.filter((converter)=> converter[utils.getName(msg)])[0];
        Object.keys(list[utils.getName(msg)].request)
            .forEach((key) => msg[utils.getName(msg)][key] && key!='RESTful' && key!='Value' && key!='ValueLength' && key!='partial'  ?
                converted[utils.getName(msg)][key] = `${msg[utils.getName(msg)][key]}${(' ').repeat(list[utils.getName(msg)].request[key].max - msg[utils.getName(msg)][key].length)}`
                : null);
        switch (utils.checkMsg(msg)){
            case 'Add spaces to Value':
                converted[Object.keys(converted)[0]].Value = `${msg[utils.getName(msg)].Value}${' '.repeat(list[utils.getName(msg)].request.Value.max - msg[utils.getName(msg)].Value.length)}`;
                break;
            case 'Binary Value':
                converted[Object.keys(converted)[0]].Value = msg[utils.getName(msg)].Value;
                break;
            case 'Setting Binary Value and calculate Length':
                converted[Object.keys(converted)[0]].Value = msg[utils.getName(msg)].Value;
                converted[Object.keys(converted)[0]].ValueLength = msg[utils.getName(msg)].ValueLength;
                msg[utils.getName(msg)].partial ? converted[Object.keys(converted)[0]].partial = msg[utils.getName(msg)].partial: null;
                break;
        }
        return converted;
    }
};