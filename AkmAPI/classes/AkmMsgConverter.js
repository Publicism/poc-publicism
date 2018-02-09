const validator = new (require('./Validator'))();
const utils = new (require('../utils/utils'))();


module.exports =  class AkmMsgConverter {
    constructor(core){
        this.list = core.conf.get('interConverter');
    }
    convert(msg){
        const validated = validator
            .checkName({ msg, converter: this , result: {}})
            .checkKeysWOValues()
            .checkLengths()
            .checkValues()
            .result();
        if(validated.valid) return AkmMsgConverter.convertValid(msg, this);
        else return validated;
    }
    decompose(core, AKMmsg, RequestID){
        let list, resultObj ={}, offcet = 0;
        const struct = { core: core, self: this };
        switch(AkmMsgConverter.responseAnalyse(AKMmsg)){
            case 'error':
                list = AkmMsgConverter.unhandledAkmErrors(AKMmsg);
                break;
            case 'part response':
                struct.responseId = RequestID;
                struct.msgMethod = 'partialResponse';
                list = AkmMsgConverter.getResponseList(struct);
                break;
            case 'full response':
                struct.responseId = String.fromCharCode(...AKMmsg.slice(5,9));
                struct.msgMethod = 'response';
                list = AkmMsgConverter.getResponseList(struct);
                break;
        }
        if(!list.error){
            list.convert.forEach((property)=>{
                if(property !=='ReturnCode' && !resultObj.error){
                    resultObj[property]= list[property].notString ?
                        AKMmsg.subarray(offcet, offcet+list[property].max)
                        : String.fromCharCode(...AKMmsg.subarray(offcet, offcet+list[property].max));
                } else if(!resultObj.error) {
                    String.fromCharCode(...AKMmsg.subarray(offcet, offcet+list[property].max))!=='0000' ? resultObj.error = true: null;
                    let resultCode = String.fromCharCode(...AKMmsg.subarray(offcet, offcet+list[property].max));
                    resultObj[property]= AKM_ERROR_CODES[resultCode] ? AKM_ERROR_CODES[resultCode]: resultCode;
                }
                offcet+= list[property].max;
            });
            resultObj.raw = AKMmsg;
            return resultObj;
        } else return list;
    }
    
    static convertValid(msg, self) {
        let converted = {
            value:'',
            RequestID: null
        };
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        self.list[utils.getName(msg)][msgMethod].convert
            .forEach((key) => {
                key === 'RequestID' ?  converted.RequestID = (parseInt(self.list[utils.getName(msg)][msgMethod][key].value) + 1).toString(): null;
                if(key!=='Value' && key!=='ValueLength'){
                    converted.value += (msg[utils.getName(msg)][key]  ?
                        msg[utils.getName(msg)][key]
                        : self.list[utils.getName(msg)][msgMethod][key].value)
                }
            });
        return converted;
    }
    
    static getResponseList(struct){
        const { core, responseId, self, msgMethod } = struct;
        return self.list[core.conf.get('interResponseList')[responseId]][msgMethod];
    }
    
    static unhandledAkmErrors(AKMmsg){
        return AKM_ERROR_CODES[String.fromCharCode(...AKMmsg.slice(9,))] ?
            validator.setError(AKM_ERROR_CODES[String.fromCharCode(...AKMmsg.slice(9,))], 'Unhandled AKM'):
            validator.setError(ERROR_RESPONSE_LENGTH_WRONG,  AKMmsg.length)
    }
    
    static responseAnalyse(response) {
        if (response.length === 13 && String.fromCharCode(...response.slice(0, 4)) === '0000') return 'error';
        if (response.length === 15 || response.length === 6) return 'error';
        if (String.fromCharCode(...response.slice(0, 4)) === '0000') return 'part response';
        return 'full response';
    }
};