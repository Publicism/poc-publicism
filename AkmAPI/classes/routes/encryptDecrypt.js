const encrypt = new (require('../EncryptDecrypt'))();
const encryptNative = new (require('../EncryptDecryptNative'))();
const errorHandler = new (require('../ErrorHandler'))();

module.exports = (struct)=>{
    switch((struct.core.conf.get()).encryptor){
        case 'AKM': encrypt.init(struct);
            break;
        case 'native': encryptNative.init(struct);
            break;
        default:
            errorHandler.sendError('Encryptor not found [default.json -> encryptor]')
    }
};