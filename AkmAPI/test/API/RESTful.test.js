const h = require('highland');
const chai = require('chai');
const expect = chai.expect;
const server = new (require('../../server'))();
const request = require('request-promise');
const fs = require('fs-extra');
const testUtils = new (require('../utils/TestUtils'))();
const utils = new (require('../../utils/utils'))();
const errorHandler = new (require('../../classes/ErrorHandler'))();


describe('RESTful', ()=> {
    let  connection, confOptions, url, path, msg, core;
    const rsaKey = TEST_KEY_NAME.replace('1','2');
    const publicKey = { name: 'RPublic', file: 'public.pem' };
    const privateKey = { name: 'RPrivate', file: 'private.pem' };
    const certificate = { caName: 'ca', caFile: 'ca.pem', clientName: 'client', clientFile: 'client.pem' };
    const symmetricKey = TEST_KEY_NAME;
    const deleteSymOps = {
        uri: `http://localhost:3000/v0.1/symmetric-key/${symmetricKey}`,
        method: 'DELETE',
        json: true
    };
    const deleteRsaOps = {
        uri: `http://localhost:3000/v0.1/rsa-keys/${symmetricKey}`,
        method: 'DELETE',
        json: true
    };
    const IV = TEST_IV;
    
    before((done) => {

        (async function () {
            console.time(`Create ${TEST_BIG_FILE}`);
            await fs.writeFile(TEST_BIG_FILE, testUtils.genBigFileData()).catch(errorHandler.sendError);
            console.timeEnd(`Create ${TEST_BIG_FILE}`);
            connection = await server.start();
            core = server.core;
            confOptions = core.conf.get('RESTful');
            done()
        })();
    });
    describe('POST сreate-symmetric-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'сreate-symmetric-key',
                APImethod:'symmetric-key',
                KeyName: symmetricKey,
                KeySizeBits:'0256',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                RolloverCode:'N',
                RolloverDays:'0000',
                Deletable:'Y',
                MirrorKey:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                convert:[ 'APImethod', 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate',
                    'RolloverCode', 'RolloverDays', 'Deletable', 'MirrorKey', 'AccessFlag', 'UserName', 'GroupName' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'сreate-symmetric-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'Deletable': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyName': `${symmetricKey}                               `,
                    'KeySizeBits': '0256',
                    'MirrorKey': 'N',
                    'RolloverCode': 'N',
                    'RolloverDays': '0000',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          '
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1002", value:`005841001${symmetricKey}                               02560000000000000000N0000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       `});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'POST',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('GET get-symmetric-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'GET',
                conf: confOptions,
                ConvMethod:'get-symmetric-key',
                APImethod:'symmetric-key',
                KeyName:symmetricKey,
                Instance: ' ',
                KeyFormat: 'BIN',
                convert:['APImethod', 'KeyName',  'Instance', 'KeyFormat' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({ 'get-symmetric-key':
                { KeyName: `${symmetricKey}                               `,
                    Instance: '                        ',
                    KeyFormat: 'BIN' } });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "2002", value:`000712001${symmetricKey}                                                       BIN`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'GET',
                json: true
            };
            (async function () {
               const result = await request(options);
               fs.writeFileSync('./data.txt', new Buffer(result.response.KeyValue.data));
                expect(result).to.be.an('object');
                done()
            })();
        });
        it.skip('request and write', (done) => {
            const options = {
                uri: url,
                method: 'GET',
                json: true
            };
            (async function () {
                const result = await request(options);
                const value = result.response.KeyValue.trim();
                await fs.writeFile(`./test/${result.response.KeyName.trim()}.${result.response.KeyFormat}`, result.response.KeyValue);
                done()
            })();
        });
        
    });
    describe('DELETE delete-symmetric-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'DELETE',
                conf: confOptions,
                ConvMethod:'delete-symmetric-key',
                APImethod:'symmetric-key',
                KeyName:symmetricKey,
                convert:[ 'APImethod', 'KeyName' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'delete-symmetric-key': {
                    'KeyName': `${symmetricKey}                               `
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1016", value:`000441015${symmetricKey}                               `});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'DELETE',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST сreate-rsa-keys', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'сreate-rsa-keys',
                APImethod:'rsa-keys',
                KeyName: rsaKey,
                KeySizeBits:'01024',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                DeletableFlag:'Y',
                MirrorFlag:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                convert:[ 'APImethod', 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate', 'DeletableFlag',
                    'MirrorFlag', 'AccessFlag', 'UserName', 'GroupName' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'сreate-rsa-keys': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'DeletableFlag': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyName': `${rsaKey}                               `,
                    'KeySizeBits': '01024',
                    'MirrorFlag': 'N',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          '
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1208", value:`005801207${rsaKey}                               010240000000000000000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       `});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'POST',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('GET get-rsa-public-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'GET',
                conf: confOptions,
                ConvMethod:'get-rsa-public-key',
                APImethod:'rsa-public-key',
                KeyName: rsaKey,
                Instance: ' ',
                KeyFormat: 'DER',
                convert:['APImethod', 'KeyName',  'Instance', 'KeyFormat' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({ 'get-rsa-public-key':
                { KeyName: `${rsaKey}                               `,
                    Instance: '                        ',
                    KeyFormat: 'DER' } });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "2024", value:`000712023${rsaKey}                                                       DER`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'GET',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('GET get-rsa-private-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'GET',
                conf: confOptions,
                ConvMethod:'get-rsa-private-key',
                APImethod:'rsa-private-key',
                KeyName: rsaKey,
                Instance: ' ',
                KeyFormat: 'DER',
                convert:['APImethod', 'KeyName',  'Instance', 'KeyFormat' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({ 'get-rsa-private-key':
                { KeyName: `${rsaKey}                               `,
                    Instance: '                        ',
                    KeyFormat: 'DER' } });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "2026", value:`000712025${rsaKey}                                                       DER`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'GET',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('DELETE delete-rsa-keys', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'DELETE',
                conf: confOptions,
                ConvMethod:'delete-rsa-keys',
                APImethod:'rsa-keys',
                KeyName:rsaKey,
                convert:[ 'APImethod', 'KeyName' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'delete-rsa-keys': {
                    'KeyName': `${rsaKey}                               `
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1218", value:`000441217${rsaKey}                               `});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'DELETE',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST import-symmetric-key RSA', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-symmetric-key',
                APImethod:'symmetric-key',
                KeyName:symmetricKey,
                KeySizeBits:'0256',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                RolloverCode:'N',
                RolloverDays:'0000',
                Deletable:'Y',
                MirrorKey:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                KeyFormat:'RSA',
                RSAPrivateKeyName:'private',
                RSAPaddingMode:'2',
                convert:[ 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate', 'RolloverCode',
                    'RolloverDays', 'Deletable', 'MirrorKey', 'AccessFlag', 'UserName', 'GroupName', 'KeyFormat', 'RSAPrivateKeyName', 'RSAPaddingMode']
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-symmetric-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'Deletable': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyFormat': 'RSA',
                    'KeyName': `${symmetricKey}                               `,
                    'KeySizeBits': '0256',
                    'MirrorKey': 'N',
                    'RSAPaddingMode': '2',
                    'RSAPrivateKeyName': 'private                                                         ',
                    'RolloverCode': 'N',
                    'RolloverDays': '0000',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          '
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1024", value:`009081023${symmetricKey}                               02560000000000000000N0000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       RSAprivate                                                         2`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: fs.readFileSync(`./test/API/${symmetricKey}.RSA`)
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                // await request(deleteSymOps);
                done()
            })();
        });
    });
    describe('POST import-symmetric-key BIN', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-symmetric-key',
                APImethod:'symmetric-key',
                KeyName:symmetricKey,
                KeySizeBits:'0256',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                RolloverCode:'N',
                RolloverDays:'0000',
                Deletable:'Y',
                MirrorKey:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                KeyFormat:'BIN',
                RSAPrivateKeyName:'private',
                RSAPaddingMode:'2',
                convert:[ 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate', 'RolloverCode',
                    'RolloverDays', 'Deletable', 'MirrorKey', 'AccessFlag', 'UserName', 'GroupName', 'KeyFormat', 'RSAPrivateKeyName', 'RSAPaddingMode']
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-symmetric-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'Deletable': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyFormat': 'BIN',
                    'KeyName': `${symmetricKey}                               `,
                    'KeySizeBits': '0256',
                    'MirrorKey': 'N',
                    'RSAPaddingMode': '2',
                    'RSAPrivateKeyName': 'private                                                         ',
                    'RolloverCode': 'N',
                    'RolloverDays': '0000',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          '
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1024", value:`009081023${symmetricKey}                               02560000000000000000N0000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       BINprivate                                                         2`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: fs.readFileSync(`./test/API/${symmetricKey}.BIN`)
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST import-symmetric-key B16', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-symmetric-key',
                APImethod:'symmetric-key',
                KeyName:symmetricKey,
                KeySizeBits:'0256',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                RolloverCode:'N',
                RolloverDays:'0000',
                Deletable:'Y',
                MirrorKey:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                KeyFormat:'B16',
                RSAPrivateKeyName:'private',
                RSAPaddingMode:'2',
                convert:[ 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate', 'RolloverCode',
                    'RolloverDays', 'Deletable', 'MirrorKey', 'AccessFlag', 'UserName', 'GroupName', 'KeyFormat', 'RSAPrivateKeyName', 'RSAPaddingMode']
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-symmetric-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'Deletable': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyFormat': 'B16',
                    'KeyName': `${symmetricKey}                               `,
                    'KeySizeBits': '0256',
                    'MirrorKey': 'N',
                    'RSAPaddingMode': '2',
                    'RSAPrivateKeyName': 'private                                                         ',
                    'RolloverCode': 'N',
                    'RolloverDays': '0000',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          '
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1024", value:`009081023${symmetricKey}                               02560000000000000000N0000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       B16private                                                         2`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: fs.readFileSync(`./test/API/${symmetricKey}.B16`)
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                // await request(deleteSymOps);
                done()
            })();
        });
    });
    describe('POST import-symmetric-key B64', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-symmetric-key',
                APImethod:'symmetric-key',
                KeyName:symmetricKey,
                KeySizeBits:'0256',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                RolloverCode:'N',
                RolloverDays:'0000',
                Deletable:'Y',
                MirrorKey:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                KeyFormat:'B64',
                RSAPrivateKeyName:'private',
                RSAPaddingMode:'2',
                convert:[ 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate', 'RolloverCode',
                    'RolloverDays', 'Deletable', 'MirrorKey', 'AccessFlag', 'UserName', 'GroupName', 'KeyFormat', 'RSAPrivateKeyName', 'RSAPaddingMode']
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-symmetric-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'Deletable': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyFormat': 'B64',
                    'KeyName': `${symmetricKey}                               `,
                    'KeySizeBits': '0256',
                    'MirrorKey': 'N',
                    'RSAPaddingMode': '2',
                    'RSAPrivateKeyName': 'private                                                         ',
                    'RolloverCode': 'N',
                    'RolloverDays': '0000',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          '
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1024", value:`009081023${symmetricKey}                               02560000000000000000N0000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       B64private                                                         2`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: fs.readFileSync(`./test/API/${symmetricKey}.B64`)
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                await request(deleteSymOps);
                done()
            })();
        });
    });
    describe('GET export-symmetric-key BIN', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'GET',
                conf: confOptions,
                ConvMethod:'export-symmetric-key',
                APImethod:'symmetric-key',
                KeyName:symmetricKey,
                KeyInstance: ' ',
                KeyFormat: 'BIN',
                RSACertificateName:' ',
                RSAPaddingMode:'2',
                convert:[ 'KeyName',  'KeyInstance', 'KeyFormat', 'RSACertificateName', 'RSAPaddingMode' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'export-symmetric-key': {
                    'KeyFormat': 'BIN',
                    'KeyInstance': '                        ',
                    'KeyName': `${symmetricKey}                               `,
                    'RSACertificateName': '                                                                ',
                    'RSAPaddingMode': '2'
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1026", value:`001361025${symmetricKey}                                                       BIN                                                                2`});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'GET',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                await request(deleteSymOps);
                done()
            })();
        });
        
    });
    describe('POST import-rsa-public-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-rsa-public-key',
                APImethod:'rsa-public-key',
                KeyName: publicKey.name,
                KeySizeBits:'02048',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                DeletableFlag:'Y',
                MirrorFlag:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                ValueCode:'DER',
                ValueLength:'',
                convert:[ 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate', 'DeletableFlag', 'MirrorFlag',
                    'AccessFlag', 'UserName', 'GroupName', 'ValueCode', 'ValueLength' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-rsa-public-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'DeletableFlag': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyName': `${publicKey.name}                                 `,
                    'KeySizeBits': '02048',
                    'MirrorFlag': 'N',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          ',
                    'ValueCode': 'DER',
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1230", value:`005881229${publicKey.name}                                 020480000000000000000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       DER`});
            done();
        });
        it('request', (done) => {
            const pubkeyFile = fs.readFileSync(`./test/API/${publicKey.file}`);
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: pubkeyFile
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('GET export-rsa-public-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'GET',
                conf: confOptions,
                ConvMethod:'export-rsa-public-key',
                APImethod:'rsa-public-key',
                KeyName: publicKey.name,
                Instance:' ',
                convert:[ 'KeyName',  'Instance' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'export-rsa-public-key': {
                    'Instance': '                        ',
                    'KeyName': `${publicKey.name}                                 `,
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1228", value:`000681227${publicKey.name}                                                         `});
            done();
        });
        it('request', (done) => {
            const pubkeyFile = fs.readFileSync(`./test/API/${publicKey.file}`);
            const options = {
                uri: url,
                method: 'GET',
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST import-rsa-private-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-rsa-private-key',
                APImethod:'rsa-private-key',
                KeyName: publicKey.name,
                KeySizeBits:'02048',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                DeletableFlag:'Y',
                MirrorFlag:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                ValueCode:'DER',
                convert:[ 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate', 'DeletableFlag', 'MirrorFlag',
                    'AccessFlag', 'UserName', 'GroupName', 'ValueCode', 'ValueLength' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-rsa-private-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'DeletableFlag': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyName': `${publicKey.name}                                 `,
                    'KeySizeBits': '02048',
                    'MirrorFlag': 'N',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          ',
                    'ValueCode': 'DER'
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1224", value:`005881223${publicKey.name}                                 020480000000000000000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       DER`});
            done();
        });
        it('request', (done) => {
            const pubkeyFile = fs.readFileSync(`./test/API/${publicKey.file}`);
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: pubkeyFile
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST import-private-key', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-private-key',
                APImethod:'private-key',
                PrivateKeyName: privateKey.name,
                OverwriteFlag:'Y',
                convert:[ 'PrivateKeyName',  'OverwriteFlag' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-private-key': {
                    'PrivateKeyName': `${privateKey.name}                                                        `,
                    'OverwriteFlag': 'Y',
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1144", value:`000741143${privateKey.name}                                                        Y`});
            done();
        });
        it('request', (done) => {
            const privateKeyFile = fs.readFileSync(`./test/API/${privateKey.file}`);
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: privateKeyFile
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST import-certificate', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'import-certificate',
                APImethod:'certificate',
                CertificateName: certificate.caName,
                CertificateType:'A',
                OverwriteFlag:'Y',
                ValueLength:'',
                convert:[ 'CertificateType', 'CertificateName', 'OverwriteFlag' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'import-certificate': {
                    'CertificateName': `${certificate.caName}                                                              `,
                    'CertificateType': 'A',
                    'OverwriteFlag': 'Y'
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1140", value:`000751139A${certificate.caName}                                                              Y`});
            done();
        });
        it('request', (done) => {
            const pubkeyFile = fs.readFileSync(`./test/API/${certificate.caFile}`);
            const options = {
                uri: url,
                method: 'POST',
                body:{
                    Value: pubkeyFile
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST export-certificate', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'GET',
                conf: confOptions,
                ConvMethod:'export-certificate',
                APImethod:'certificate',
                CertificateName: certificate.caName,
                CertificateType:'A',
                ValueLength:'',
                convert:[ 'CertificateType', 'CertificateName' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'export-certificate': {
                    'CertificateName': `${certificate.caName}                                                              `,
                    'CertificateType': 'A'
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1154", value:`001361153A${certificate.caName}                                                              `});
            done();
        });
        it('request', (done) => {
            const pubkeyFile = fs.readFileSync(`./test/API/${certificate.caFile}`);
            const options = {
                uri: url,
                method: 'GET',
                body:{
                    Value: pubkeyFile
                },
                json: true
            };
            (async function () {
                const result = await request(options).catch(errorHandler.sendError);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('DELETE delete-certificate', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'DELETE',
                conf: confOptions,
                ConvMethod:'delete-certificate',
                APImethod:'certificate',
                CertificateType:'A',
                CertificateName: certificate.caName,
                convert:[ 'APImethod', 'CertificateType', 'CertificateName' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'delete-certificate': {
                    'CertificateName': `${certificate.caName}                                                              `,
                    'CertificateType': 'A'
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1142", value:`000691141A${certificate.caName}                                                              `});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'DELETE',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST сreate-symmetric-key for encryption', ()=> {
        it('External Convert', (done) => {
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'сreate-symmetric-key',
                APImethod:'symmetric-key',
                KeyName: symmetricKey,
                KeySizeBits:'0256',
                ActivationDate:'00000000',
                ExpirationDate:'00000000',
                RolloverCode:'N',
                RolloverDays:'0000',
                Deletable:'Y',
                MirrorKey:'N',
                AccessFlag:'1',
                UserName:'admin1',
                GroupName:'akm_admin',
                convert:[ 'APImethod', 'KeyName',  'KeySizeBits', 'ActivationDate', 'ExpirationDate',
                    'RolloverCode', 'RolloverDays', 'Deletable', 'MirrorKey', 'AccessFlag', 'UserName', 'GroupName' ]
            }));
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'сreate-symmetric-key': {
                    'AccessFlag': '1',
                    'ActivationDate': '00000000',
                    'Deletable': 'Y',
                    'ExpirationDate': '00000000',
                    'GroupName': 'akm_admin                                                                                                                                                                                                                                                       ',
                    'KeyName': `${symmetricKey}                               `,
                    'KeySizeBits': '0256',
                    'MirrorKey': 'N',
                    'RolloverCode': 'N',
                    'RolloverDays': '0000',
                    'UserName': 'admin1                                                                                                                                                                                                                                                          '
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            expect(core.interInterface.converter.convert((core.exterInterface.converter.convert(msg))))
                .to.deep.equal({ RequestID: "1002", value:`005841001${symmetricKey}                               02560000000000000000N0000YN1admin1                                                                                                                                                                                                                                                          akm_admin                                                                                                                                                                                                                                                       `});
            done();
        });
        it('request', (done) => {
            const options = {
                uri: url,
                method: 'POST',
                json: true
            };
            (async function () {
                const result = await request(options);
                expect(result).to.be.an('object');
                done()
            })();
        });
    });
    describe('POST encrypt-with-symmetric-key', ()=> {
        it('External Convert', (done) => {
            const stats = fs.statSync(TEST_BIG_FILE);
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'encrypt-with-symmetric-key',
                APImethod:'with-symmetric-key',
                Instance:'',
                PaddingFlag:'7',
                PackedFlag:'N',
                CipherTextFormat:'BIN',
                PlainTextLength: CHUNK_SIZE.toString(),
                ValueLength: stats.size.toString(),
                KeyName: symmetricKey,
                IV: IV,
                convert:[ 'PaddingFlag', 'CipherTextFormat', 'PlainTextLength', 'PackedFlag', 'KeyName',  'Instance',  'ValueLength','IV' ]
            }));
            msg[utils.getName(msg)].NewKeyFlag = 'Y';
            msg[utils.getName(msg)].EndOfRequestFlag = 'Y';
            msg[utils.getName(msg)].FinalFlag = 'N';
            msg[utils.getName(msg)].NewIVFlag = 'Y';
            msg[utils.getName(msg)].Instance = msg[utils.getName(msg)].Instance ? msg[utils.getName(msg)].Instance:' ';
            msg[utils.getName(msg)].ValueLength = stats.size;
            msg[utils.getName(msg)].IV = IV;
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'encrypt-with-symmetric-key': {
                    'CipherTextFormat': 'BIN',
                    'EndOfRequestFlag': 'Y',
                    'FinalFlag': 'N',
                    'IV': IV,
                    'Instance': '                        ',
                    'KeyName': `${symmetricKey}                               `,
                    'NewIVFlag': 'Y',
                    'NewKeyFlag': 'Y',
                    'PackedFlag': 'N',
                    'PaddingFlag': '7',
                    'PlainTextLength': CHUNK_SIZE.toString(),
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            
            let convertedMsg =  core.exterInterface.converter.convert(msg);
            expect(core.interInterface.converter.convert(convertedMsg))
                .to.deep.equal({ RequestID: "2020", value:`000982019Y7${msg[utils.getName(msg)].CipherTextFormat}${CHUNK_SIZE.toString()}YNNY${msg[utils.getName(msg)].IV}${symmetricKey}                                                       `});
            convertedMsg[utils.getName(msg)].partial = true;
            expect(core.interInterface.converter.convert(convertedMsg))
                .to.deep.equal({ RequestID: null, value:`Y7BIN${CHUNK_SIZE.toString()}YNNY`});
            done();
        });
        it('request', (done) => {
            fs.createReadStream(TEST_BIG_FILE, { highWaterMark: CHUNK_SIZE }).pipe(request.post(url))
                .on('data',(chunk)=> console.log(chunk.length))
                .pipe(fs.createWriteStream(TEST_BIG_FILE.replace('txt','enc')))
                .on('finish', done);

        });
    });
    describe('POST decrypt-with-symmetric-key', ()=> {
        it('External Convert', (done) => {
            const stats = fs.statSync(TEST_BIG_FILE);
            ({ url, path, msg } = testUtils.requestMap({
                method:'POST',
                conf: confOptions,
                ConvMethod:'decrypt-with-symmetric-key',
                APImethod:'with-symmetric-key',
                Instance:'',
                PaddingFlag: '7',
                PackedFlag:'N',
                CipherTextFormat:'BIN',
                PlainTextFormat:'BIN',
                CipherTextLength: (CHUNK_SIZE+16).toString(),
                ValueLength: stats.size.toString(),
                KeyName: symmetricKey,
                IV: IV,
                convert:[ 'PaddingFlag', 'CipherTextFormat', 'CipherTextLength', 'PlainTextFormat', 'PackedFlag', 'KeyName',  'Instance',  'ValueLength', 'IV' ]
            }));
            msg[utils.getName(msg)].NewKeyFlag = 'Y';
            msg[utils.getName(msg)].EndOfRequestFlag = 'Y';
            msg[utils.getName(msg)].FinalFlag = 'N';
            msg[utils.getName(msg)].NewIVFlag = 'Y';
            msg[utils.getName(msg)].Instance = msg[utils.getName(msg)].Instance ? msg[utils.getName(msg)].Instance:' ';
            msg[utils.getName(msg)].ValueLength = stats.size;
            expect(core.exterInterface.converter.convert(msg)).to.deep.equal({
                'decrypt-with-symmetric-key': {
                    'CipherTextFormat': 'BIN',
                    'PlainTextFormat': 'BIN',
                    'EndOfRequestFlag': 'Y',
                    'FinalFlag': 'N',
                    'IV': IV,
                    'Instance': '                        ',
                    'KeyName': `${symmetricKey}                               `,
                    'NewIVFlag': 'Y',
                    'NewKeyFlag': 'Y',
                    'PackedFlag': 'N',
                    'PaddingFlag': '7',
                    'CipherTextLength': (CHUNK_SIZE+16).toString(),
                }
            });
            done();
        });
        it('Internal Convert', (done) => {
            
            let convertedMsg =  core.exterInterface.converter.convert(msg);
            expect(core.interInterface.converter.convert(convertedMsg))
                .to.deep.equal({ RequestID: "2022", value:`001012021Y7${msg[utils.getName(msg)].CipherTextFormat}${(CHUNK_SIZE+16).toString()}${msg[utils.getName(msg)].PlainTextFormat}YNNY${msg[utils.getName(msg)].IV}${symmetricKey}                                                       `});
            convertedMsg[utils.getName(msg)].partial = true;
            expect(core.interInterface.converter.convert(convertedMsg))
                .to.deep.equal({ RequestID: null, value:`Y7BIN${(CHUNK_SIZE+16).toString()}BINYNNY`});
            done();
        });
        it('request', (done) => {
            fs.createReadStream(TEST_BIG_FILE.replace('txt','enc'), { highWaterMark: CHUNK_SIZE+16 }).pipe(request.post(url))
                .on('data',(chunk)=> console.log(chunk.length))
                .pipe(fs.createWriteStream(TEST_BIG_FILE.replace('txt','dec')))
                .on('finish', done);

        });
    });
    after((done)=>{
        (async function () {
            console.time(`Delete ${TEST_BIG_FILE}`);
            await fs.unlink(TEST_BIG_FILE).catch(errorHandler.sendError);
            console.timeEnd(`Delete ${TEST_BIG_FILE}`);
            server.stop(connection);
            done();
        })();
    })
});