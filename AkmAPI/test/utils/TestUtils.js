const imports = [
    'import-symmetric-key',
    'import-rsa-public-key',
    'import-rsa-private-key',
    'import-certificate',
    'import-private-key'
];
const exports_ = [
    'export-symmetric-key',
    'export-certificate',
    'export-rsa-public-key'
];
const encrypt = [
    'encrypt-with-symmetric-key'
];
const decrypt = [
    'decrypt-with-symmetric-key'
];

module.exports = class TestUtils{
    requestMap(requestObj){
        const returnObj = {
            path:'',
            msg:{},
            url:'http://'
        };
        returnObj.msg[requestObj.ConvMethod] = {};
        imports.indexOf(requestObj.ConvMethod)>=0 ? returnObj.path += `/${requestObj.ConvMethod.split('-')[0]}/${requestObj.APImethod}`: null;
        exports_.indexOf(requestObj.ConvMethod)>=0 ? returnObj.path += `/${requestObj.ConvMethod.split('-')[0]}/${requestObj.APImethod}`: null;
        encrypt.indexOf(requestObj.ConvMethod)>=0 ? returnObj.path += `/${requestObj.ConvMethod.split('-')[0]}/${requestObj.APImethod}`: null;
        decrypt.indexOf(requestObj.ConvMethod)>=0 ? returnObj.path += `/${requestObj.ConvMethod.split('-')[0]}/${requestObj.APImethod}`: null;
        requestObj.convert.forEach((item)=>{
            returnObj.msg[requestObj.ConvMethod][item] = requestObj[item];
            returnObj.path+=`/${requestObj[item]}`
        });
        returnObj.url += `${ requestObj.conf.host }:${ requestObj.conf.port }/${ EXTERNAL_API.ver }${returnObj.path}`;
        return returnObj
    };
    genBigFileData(){
        let str = '';
        let strLong='';
        for(let i=FROM_CHAR_CODE, max=TO_CHAR_CODE;i<=max;i++) str+=String.fromCharCode(i);
        for(let i=0, max=REPEAT_STRING;i<=max;i++) strLong+=str;
        return strLong;
    }
};