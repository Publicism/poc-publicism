module.exports = Object.freeze({
    INTERNAL_API:{
        dir:'config/schemes/internalAPI',
        ver:'v4.5.0.001'
    } ,
    EXTERNAL_API:{
        dir:'config/schemes/externalAPI',
        ver:'v0.1',
        version:'v0.1.0',
        schema:'RESTful'
    },
    THROTTLE:1000,
    TEST_BIG_FILE:'./bigfile.txt',
    FROM_CHAR_CODE: 33,
    TO_CHAR_CODE: 126,
    CHUNK_SIZE: 16256,
    REPEAT_STRING: 500,
    API_LIST_FILE:'apiList.json',
    CERTIFICATES_PATH:"./config/certificates",
    TEST_METHOD: 'get-symmetric-key',
    TEST_KEY_NAME:'TestKey01',
    TEST_KEY_INSTANCE:' ',
    TEST_KEY_FORMAT:'B64',
    TEST_IV:'1111111111111111',
    TEST_KEY_NAME_CONVERTED:`TestKey01                               `,
    TEST_KEY_INSTANCE_CONVERTED:'                        '
});