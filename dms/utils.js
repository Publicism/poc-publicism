const path = require('path');
const https = require('https');
const _ = require('lodash');
const glob = require('glob');
const hashFiles = require('hash-files');
const os = require('os');
const extract = require('unzip').Extract;
const mkdirp = require('mkdirp-promise');
const dataUriToBuffer = require('data-uri-to-buffer');
const atob = require('atob');
const x509 = require('x509');
const machinomy = require('machinomy');
const fs = require('mz/fs');

const config = require('./config');

/**
 * Uploads Data Object to specific folder
 *
 * @param {Object} req upload request containing frontend form data
 * @param {String} dirPath path to upload directory
 * @param {Number} objectId Data Object Id
 * @return {Promise}
 */
const uploadDOtoDataStorage = (req, dirPath, objectId) => {
    return new Promise((topResolve, topReject) => {
        if (objectId === undefined) {
            return topReject('Object Id is undefined!');
        }

        const uploadDir = path.join(dirPath, objectId);
        let uploadFiles;

        if (req.body.type === 'html' && req.body.content) {
            uploadFiles = () => {
                return new Promise((resolve, reject) => {
                    mkdirp(uploadDir)
                        .then(() => {
                            let destination = path.join(uploadDir, 'index.html');

                            fs.writeFile(destination, req.body.content)
                                .then(() => {
                                    console.log('Created new file index.html for DO ' + objectId);

                                    resolve();
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        })
                        .catch(e => {
                            reject(e);
                        });
                });
            }
        } else if (req.body.file) {
            uploadFiles = () => {
                return new Promise((resolve, reject) => {
                    mkdirp(uploadDir)
                        .then(() => {
                            let fileName = generateFileName(path.extname(req.body.file.name));
                            let destination = path.join(uploadDir, fileName);

                            fs.writeFile(destination, dataUriToBuffer(req.body.file.blob))
                                .then(() => {
                                    console.log('Uploaded new file ' + fileName + ' for DO ' + objectId);

                                    resolve();
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        })
                        .catch(e => {
                            reject(e);
                        });
                });
            }
        } else {
            return topReject('Unable to detect uploaded content type.');
        }

        uploadFiles()
            .then(() => {
                fs.exists(uploadDir)
                    .then(() => {
                        hashFiles({
                            files: path.join(uploadDir, '**'),
                            algorithm: 'md5'
                        }, (err, hash) => {
                           if (err) {
                               return topReject(e);
                           }

                           return topResolve(hash);
                        });
                    });
            });
    });
};

/**
 * Makes direct request to specifict member to get DO content by request id
 *
 * @param {string} memberId Member Id
 * @param {string} objectId Data Object Id
 * @param {string} token
 * @param {string} doRequestId Data Object Request Id
 * @param {Object} client
 * @param {string} hash
 * @param {function} callback
 */
const getDOFilesFromMember = (memberId, objectId, token, doRequestId, client, hash, callback) => {
    getAllMembers(client, (members, err) => {
        if (err) {
            callback(err);

            return false;
        }

        const memberAddress = addressByMember(members, memberId);
        const [host, port] = memberAddress.split('/')[2].split(':');
        const headers = {
            'Member-Id': config.currentMemberId,
            'DO-Request-Id': doRequestId,
            'Payment-Token': token
        };

        console.log('Trying to get Data Object %s from Member %s (%s)', objectId, memberId, memberAddress);

        const options = {
            host: host,
            port: port,
            path: '/dos/' + objectId,
            headers: headers,
            key: fs.existsSync(config.cert.client.keyName) ? fs.readFileSync(config.cert.client.keyName) : null,
            cert: process.env.forNegativeTesting
                ? fs.readFileSync(config.cert.server.certName)
                : fs.readFileSync(config.cert.client.certName),
            ca: fs.existsSync(config.cert.client.caName) ? fs.readFileSync(config.cert.client.caName) : null,
            checkServerIdentity: (host, cert) => undefined
        };

        new Promise((resolve, reject) => {
            const client = https
                .request(options, (response) => {
                    const responseFingerprint = (response.connection.getPeerCertificate()).fingerprint;
                    const localCertFingerprint = members[_.findIndex(members, ['memberid', memberId])].fingerprint;

                    if (!config.cert.isEnabled || responseFingerprint === localCertFingerprint) {
                        if (response.statusCode === 404) {
                            reject({message: 'Cannot find data object uploded files.'});

                            return;
                        }

                        if (response.statusCode === 403) {
                            reject({message: 'Not authorized to get this DO'});

                            return;
                        }

                        let tmpFilePath = path.join(os.tmpdir(), objectId + '.zip');
                        let stream = fs.createWriteStream(tmpFilePath);
                        let discoveredPath = path.join(config.uploads.discoveredDataObjects, memberId, objectId);

                        response.pipe(stream);

                        stream.on('close', () => {
                            console.log('ZIP archive downloaded');

                            mkdirp(discoveredPath)
                                .then(() => {
                                    fs
                                        .createReadStream(tmpFilePath)
                                        .pipe(extract({path: discoveredPath}))
                                        .on('close', () => {
                                            const discoveredHash = hashFiles.sync({
                                                files: path.join(discoveredPath, '**'),
                                                algorithm: 'md5'
                                            });

                                            if (discoveredHash !== hash) {
                                                console.warn('Hash mismatch!');
                                            }

                                            console.log(
                                                'Member %s returned Data Object %s by DO request %s',
                                                memberId,
                                                objectId,
                                                doRequestId
                                            );

                                            resolve();
                                        });
                                })
                                .catch(e => {
                                    reject(e);
                                });


                        });
                    } else {
                        reject({
                            message: 'error:0B080074:x509 certificate routines:X509_check_private_key:key values mismatch'
                        });
                    }
                })
                .on('error', (e) => {
                    console.error('Something goes wrong:\n%s', e);
                });

            client.end();
        }).then(() => {
            callback();
        }).catch((err) => {
            // TODO Better error handling
            err.message === 'error:0B080074:x509 certificate routines:X509_check_private_key:key values mismatch'
                ? console.error('Security Error: Wrong certificate!')
                : console.error(err.message);

            callback(err.message);
        });
    });
};

/**
 * @param {array} members
 * @param {string} memberId
 * @return {string}
 */
const addressByMember = (members, memberId) => {
    const memberInfo = _.find(members, (m) => {
        return m.memberid.toString() === memberId.toString();
    });
    const address = memberInfo.host + ':' + memberInfo.dmsport;

    return address.match(/^http/) ? address : 'https://' + address;
};

/**
 * @param {array} members
 * @param {string} memberId
 * @return {string}
 */
const paymentAddressByMember = (members, memberId) => {
    const memberInfo = _.find(members, (m) => {
        return m.memberid.toString() === memberId.toString();
    });
    const address = memberInfo.host + ':' + memberInfo.paymentport;

    return address.match(/^http/) ? address : 'http://' + address;
};

/**
 * @param {string} memberId
 * @param {string} objectId
 * @return {boolean}
 */
const checkDiscoveredDOContent = (memberId, objectId) => {
    let discoveredDOpath = path.join(config.uploads.discoveredDataObjects, memberId, objectId);

    return fs.existsSync(discoveredDOpath);
};

/**
 * @param {Object} client
 * @param {Function} callback
 */
const getAllMembers = (client, callback) => {
    client.getAllMembers({}, (err, response) => {
        if (err) {
            callback(null, err.toString());
        }

        let members = response.list || [];

        members = _.map(members, (m) => {
            const id = m.id.id.toString();
            const info = JSON.parse(m.info);
            const fingerprint = x509.parseCert(atob(info.dmscertificate)).fingerPrint;

            return {
                memberid: id,
                membername: m.name,
                memberstatus: 'Online',
                address: info.host + ':' + info.dmsport,
                host: info.host,
                dmsport: info.dmsport,
                webport: info.webport,
                paymentport: info.paymentport,
                fingerprint: fingerprint
            };
        });

        callback(members);
    });
};

/**
 * @param {string} ext
 * @return {string}
 */
const generateFileName = (ext) => {
    let date = new Date();

    return date.getTime().toString() + ext;
};

/**
 * @param {string} objectId
 * @param {string} memberId
 * @return {array|bool}
 */
const getDOFiles = (objectId, memberId = null) => {
    let scanDir = null;
    let urlPrefix = config.uploads.dataObjectsUrl;

    if (memberId && memberId !== config.currentMemberId.toString()) {
        scanDir = path.join(config.uploads.dataObjects, 'discovered', memberId, objectId);
        urlPrefix += '/discovered/' + memberId;
    } else {
        scanDir = path.join(config.uploads.dataObjects, objectId);
    }

    if (!fs.existsSync(scanDir)) {
        return false;
    }

    let files = glob.sync(scanDir + '/*');
    let ret = [];

    files.forEach((f) => {
        let type = null;

        switch (path.extname(f)) {
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
                type = 'image';

                break;
            case '.html':
            case '.md':
                type = 'code';

                break;
            default:
                type = 'misc';
        }

        ret.push({
            name: path.basename(f),
            url: urlPrefix + '/' + objectId + '/' + path.basename(f),
            type: type
        });
    });

    return ret;
};

/**
 * @param {string} objectId
 * @param {string} memberId
 * @return {string}
 */
const getDOFilesHash = (objectId, memberId = null) => {
    let scanDir = null;

    if (memberId && memberId !== config.currentMemberId.toString()) {
        scanDir = path.join(config.uploads.dataObjects, 'discovered', memberId, objectId);
    } else {
        scanDir = path.join(config.uploads.dataObjects, objectId);
    }

    return hashFiles.sync({
        files: path.join(scanDir, '**'),
        algorithm: 'md5'
    });
};

/**
 * @param {object} storage
 * @return {Promise}
 */
const getCurrentBalance = (storage) => {
    return new Promise((topResovle, topReject) => {
        const getIncomingAmount = new Promise((resolve, reject) => {
            let amount = 0;

            getMachinomyUnsettledChannels(storage)
                .then(channels => {
                    _.each(channels, c => {
                        amount += c.spent;
                    });

                    resolve(amount);
                })
                .catch(e => {
                    reject(e);
                });
        });

        const getOutcomingAmount = new Promise((resolve, reject) => {
            let amount = 0;

            getMachinomyUnsettledChannels(storage, 'sender')
                .then(channels => {
                    _.each(channels, c => {
                        amount += c.spent;
                    });

                    resolve(amount);
                })
                .catch(e => {
                    reject(e);
                });
        });

        Promise.all([getIncomingAmount, getOutcomingAmount])
            .then(result => {
                const web3 = machinomy.configuration.web3();
                const balance = web3.eth.getBalance(config.machinomy.account);
                const json = {
                    balance: balance,
                    incoming: result[0],
                    outcoming: result[1]
                };

                topResovle(json);
            })
            .catch(e => {
                topReject(e);
            });
    });
};

/**
 * @todo Move somewhere else
 * @param {string} namespace
 * @param {object} storage
 * @return {Promise}
 */
const getMachinomyUnsettledChannels = (storage, namespace = 'receiver') => {
    return new Promise((topResolve, topReject) => {
        const web3 = machinomy.configuration.web3();

        storage.channels.all()
            .then(found => {
                let promises = [];

                _.each(found, paymentChannel => {
                    promises.push(new Promise((resolve, reject) => {
                        machinomy.contract(web3)
                            .getState(paymentChannel.channelId)
                            .then(state => {
                                if (state < 2 && paymentChannel[namespace] === config.machinomy.account) {
                                    paymentChannel.state = state;

                                    resolve(paymentChannel);
                                } else {
                                    resolve();
                                }
                            })
                            .catch(e => {
                                console.error(e);

                                reject();
                            });
                    }));
                });

                Promise.all(promises)
                    .then(result => {
                        topResolve(_.filter(result));
                    })
                    .catch(e => {
                        console.error(e);

                        topReject();
                    });
            })
            .catch(e => {
                console.error(e);

                topReject();
            });
    });
};

/**
 * @todo Move somewhere else
 * @param {string} channelId
 * @param {object} storage
 */
const closeMachinomyChannel = (channelId, storage) => {
    return new Promise((resolve, reject) => {
        const web3 = machinomy.configuration.web3();
        const contract = machinomy.contract(web3);

        web3.personal.unlockAccount(config.machinomy.account, config.machinomy.password, 1000);

        storage.channels.firstById(channelId)
            .then(paymentChannel => {
                contract.getState(channelId)
                    .then(state => {
                        switch (state) {
                            case 0: // open
                                console.log('Channel ' + channelId + ' is open');

                                if (config.machinomy.account === paymentChannel.sender) {
                                    console.log('Skipping...');

                                    resolve(); // Do not settle if I am sender..for now..
                                    /*startSettle(config.machinomy.account, contract, paymentChannel)
                                        .then(() => {
                                            resolve();
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });*/
                                } else if (config.machinomy.account === paymentChannel.receiver) {
                                    console.log('Claiming...');

                                    claim(storage, contract, paymentChannel)
                                        .then(() => {
                                            resolve();
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                }

                                break;
                            case 1: // settling
                                console.log('Channel ' + channelId + ' is settling');

                                if (config.machinomy.account === paymentChannel.sender) {
                                    console.log('Skipping...');

                                    resolve(); // Do not settle if I am sender..for now..
                                    /*finishSettle(config.machinomy.account, contract, paymentChannel)
                                        .then(() => {
                                            resolve();
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });*/
                                } else if (config.machinomy.account === paymentChannel.receiver) {
                                    console.log('Claiming...');

                                    claim(storage, contract, paymentChannel)
                                        .then(() => {
                                            resolve();
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                }

                                break;
                            case 2: // settled, nothing to do
                                console.log('Channel ' + channelId + ' is settled');

                                resolve();

                                break;
                            default:
                                reject('Unsupported channel state: ' + state);
                        }
                    })
                    .catch(e => {
                        reject(e);
                    });
            })
            .catch(e => {
                reject(e);
            });
    });
};

/**
 * @todo Move somewhere else
 * @param {object} storage
 * @param {object} contract
 * @param {object} paymentChannel
 */
const claim = (storage, contract, paymentChannel) => {
    return new Promise((resolve, reject) => {
        let channelId = paymentChannel.channelId;

        console.log('Trying to claim from channel %s...', channelId);

        storage.payments.firstMaximum(channelId)
            .then(paymentDoc => {
                let canClaim = contract.canClaim(
                    channelId,
                    paymentDoc.value,
                    Number(paymentDoc.v),
                    paymentDoc.r,
                    paymentDoc.s
                );

                if (canClaim) {
                    contract.claim(
                        paymentChannel.receiver,
                        paymentChannel.channelId,
                        paymentDoc.value,
                        Number(paymentDoc.v),
                        paymentDoc.r,
                        paymentDoc.s
                    ).then(value => {
                        console.log('Claimed ' + value + ' out of ' + paymentChannel.value + ' from channel '
                            + channelId);

                        resolve();
                    }).catch(e => {
                        reject(e);
                    });
                } else {
                    reject('Can not claim ' + paymentDoc.value + ' from channel ' + channelId);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

/**
 * @todo Move somewhere else
 * @param {string} account
 * @param {object} contract
 * @param {object} paymentChannel
 */
const startSettle = (account, contract, paymentChannel) => {
    return new Promise((resolve, reject) => {
        contract.canStartSettle(account, paymentChannel.channelId)
            .then(canStartSettle => {
                if (canStartSettle) {
                    contract.startSettle(account, paymentChannel.channelId, paymentChannel.spent)
                        .then(() => {
                            console.log('Start settling channel ' + paymentChannel.channelId);

                            resolve();
                        })
                        .catch(e => {
                            reject(e);
                        });
                } else {
                    reject('Can not start settling channel ' + paymentChannel.channelId);
                }
            });
    });
};

/**
 * @todo Move somewhere else
 * @param {string} account
 * @param {object} contract
 * @param {object} paymentChannel
 */
const finishSettle = (account, contract, paymentChannel) => {
    return new Promise((resolve, reject) => {
        if (contract.canFinishSettle(account, paymentChannel.channelId)) {
            contract.finishSettle(account, paymentChannel.channelId)
                .then(payment => {
                    console.log('Settled to pay ' + payment + ' to ' + paymentChannel.receiver);

                    resolve();
                })
                .catch(e => {
                    reject(e);
                });
        } else {
            let until = contract.getUntil(paymentChannel.channelId);

            reject('Can not finish settle until ' + until);
        }
    });
};

module.exports = {
    uploadDOtoDataStorage: uploadDOtoDataStorage,
    getDOFilesFromMember: getDOFilesFromMember,
    paymentAddressByMember: paymentAddressByMember,
    checkDiscoveredDOContent: checkDiscoveredDOContent,
    getAllMembers: getAllMembers,
    getDOFiles: getDOFiles,
    getDOFilesHash: getDOFilesHash,
    getCurrentBalance: getCurrentBalance,
    getMachinomyUnsettledChannels: getMachinomyUnsettledChannels,
    closeMachinomyChannel: closeMachinomyChannel
};
