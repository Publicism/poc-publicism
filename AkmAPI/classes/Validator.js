let privateStruct = {};
const utils = new (require('../utils/utils'))();

module.exports =  class Validator {

    checkKeys(struct) {
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        const { msg, converter } = struct || privateStruct;
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        !struct.result.error && Object.keys(converter.list[utils.getName(msg)][msgMethod])
            .forEach((key) =>  key!==EXTERNAL_API.schema && !( converter.list[utils.getName(msg)][msgMethod][key] && msg[utils.getName(msg)][key]) ?
                !struct.result.error && !converter.list[utils.getName(msg)][msgMethod][key].optional ?
                    struct.result = this.setError(ERROR_KEY_NOT_FOUND, key)
                    : null
                : null
        );
        return this;
    }
    checkKeysWOValues(struct) {
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        const { msg, converter } = struct || privateStruct;
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        !struct.result.error && Object.keys(converter.list[utils.getName(msg)][msgMethod])
            .forEach((key) =>(!converter.list[utils.getName(msg)][msgMethod][key].value && key!=='convert' && !msg[utils.getName(msg)][key]) ?
                !struct.result.error && !converter.list[utils.getName(msg)][msgMethod][key].optional ?
                    struct.result = this.setError(ERROR_KEY_NOT_FOUND, key)
                    : null
                : null);
        return this;
    }

    checkTypes(struct) {
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        const { msg, converter } = struct || privateStruct;
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        !struct.result.error && Object.keys(converter.list[utils.getName(msg)][msgMethod])
            .forEach((key)=>  (key!==EXTERNAL_API.schema && converter.list[utils.getName(msg)][msgMethod][key].type && converter.list[utils.getName(msg)][msgMethod][key].type !== typeof msg[utils.getName(msg)][key]) ?
                !struct.result.error && key!=='Value'?
                    struct.result = this.setError(ERROR_WRONG_TYPE, key)
                    : null
                : null);
        return this;
    }
    checkMaxLengths(struct) {
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        const { msg, converter } = struct || privateStruct;
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        !struct.result.error && Object.keys(converter.list[utils.getName(msg)][msgMethod])
            .forEach((key)=>{
            ( key!==EXTERNAL_API.schema && converter.list[utils.getName(msg)][msgMethod][key].max && msg[utils.getName(msg)][key] && msg[utils.getName(msg)][key].length > converter.list[utils.getName(msg)][msgMethod][key].max)  ?
                !struct.result.error && key!=='Value' ?
                    struct.result = this.setError(ERROR_MAX_LENGTH_EXCEED, key)
                    : null
                : null});
        return this;
    }
    checkLengths(struct) {
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        const { msg, converter } = struct || privateStruct;
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        !struct.result.error && Object.keys(converter.list[utils.getName(msg)][msgMethod])
            .forEach((key)=> {
            (!converter.list[utils.getName(msg)][msgMethod][key].value && key!==EXTERNAL_API.schema && msg[utils.getName(msg)][key] && msg[utils.getName(msg)][key].length !== converter.list[utils.getName(msg)][msgMethod][key].max)  ?
                !struct.result.error && key!=='Value' ?
                    struct.result = this.setError(ERROR_LENGTH_WRONG, key)
                    : null
                : null });
        return this;
    }

    checkValues(struct) {
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        const { msg, converter } = struct || privateStruct;
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        !struct.result.error && Object.keys(converter.list[utils.getName(msg)][msgMethod])
            .forEach((key)=> converter.list[utils.getName(msg)][msgMethod][key].validation && key!==EXTERNAL_API.schema && converter.list[utils.getName(msg)][msgMethod][key].validation.value.indexOf(msg[utils.getName(msg)][key])< 0 ?
                !struct.result.error && !converter.list[utils.getName(msg)][msgMethod][key].optional ?
                    struct.result = this.setError(ERROR_WRONG_VALUE, key)
                    : null
                : null);
        return this;
    }

    checkName(struct){
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        const { msg, converter } = struct || privateStruct;
        const msgMethod = msg[utils.getName(msg)].partial ? 'partialRequest': 'request';
        (converter.list && converter.list[utils.getName(msg)]) ? null: struct.result = this.setError( ERROR_METHOD_NOT_FOUND, utils.getName(msg) );
        return this;

    }
    checkRestParams(struct){
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        struct.path.length !== struct.schema.length ? struct.result = this.setError(ERROR_PARAMS_WRONG, path): null;
        return this;
    }

    result(struct){
        ({ struct, privateStruct } = utils.memoize(struct, privateStruct));
        !struct.result.error ? struct.result = {valid: true, error: false }: null;
        return struct.result
    }
    setError(errText, subject){
        return { valid: false, error: errText, subject: subject }
    }
};