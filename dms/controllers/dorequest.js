const _ = require('lodash');

const utils = require('../utils');
const config = require('../config');

module.exports = (app, client) => {
    /**
     * Get Blockchain request history of all data objects
     */
    app.get('/dorequests', (req, res) => {
        client.getDataObjectRequests({}, (err, response) => {
            if (err) {
                return res.status(500).send(err.toString());
            }

            let objects = response.list || [];

            response = _.map(objects, (n) => {
                return {
                    requestid: n.id.id.toString(),
                    memberid: n.memberId.id.toString(),
                    objectid: n.dataObjectId.id.toString(),
                    requestdate: new Date(parseInt(n.createdAt.seconds) * 1000)
                };
            });

            return res.status(200).json(response);
        });
    });

    /**
     * Put DO request into DataObjectRequestHistory in blockchain and
     * request DO from other Members by DMS-to-DMS communication
     */
    app.post('/dorequests', (req, res) => {
        const objectId = req.body.doid.toString();
        const token = req.body.token ? req.body.token.toString() : '';

        console.info('Data Object requested: %s', objectId);

        utils.getAllMembers(client, (members, err) => {
            if (err) {
                return res.status(500).send(err.toString());
            }

            let params = {
                dataObjectId: {
                    id: Buffer.from(objectId)
                },
                memberIds: _.map(members, (n) => {
                    return {
                        id: Buffer.from(n.memberid.toString())
                    };
                })
            };

            client.getDataObjectNetworkInfo(params, (err, response) => {
                if (err) {
                    return res.status(500).send(err.toString());
                }

                let membersWithDO = response.list;

                if (membersWithDO.length === 0) {
                    return res.status(200).json({dorequestid: 0});
                }

                params = {
                    dataObjectId: {
                        id: Buffer.from(objectId)
                    },
                    memberId: {
                        id: Buffer.from(config.currentMemberId.toString())
                    }
                };

                client.makeRequest(params, (err, response) => {
                    if (err) {
                        return res.status(500).send(err.toString());
                    }

                    let doRequestId = response.id.id.toString();
                    let promises = [];

                    membersWithDO.forEach((i) => {
                        const p = new Promise((resolve) => {
                            const memberId = i.memberId.id.toString();

                            // We do not need to discover already owned DO
                            if (memberId !== config.currentMemberId.toString() || process.env.NODE_ENV === 'test') {
                                utils.getDOFilesFromMember(
                                    memberId,
                                    objectId,
                                    token,
                                    doRequestId,
                                    client,
                                    i.available.hash.toString(),
                                    resolve
                                );
                            } else {
                                resolve();
                            }
                        });

                        promises.push(p);
                    });
                    promises.reduce((prevTaskPromise, task)=> {
                        return prevTaskPromise.then(task);
                    }, promises[0]);
                    Promise
                        .all(promises)
                        .then((errs) => {
                            errs = errs.filter((e) => {
                                return e;
                            });

                            return errs.length
                                ? res.status(500).send(errs[0].toString())
                                : res.status(200).json({dorequestid: doRequestId});
                        });
                });
            });
        });
    });

    /**
     *
     */
    app.post('/pricerequests', (req, res) => {
        let objectId = req.body.doid;

        console.info('Data Object price requested: %s', objectId);

        utils.getAllMembers(client, (members, err) => {
            if (err) {
                return res.status(500).send(err.toString());
            }

            let params = {
                dataObjectId: {
                    id: Buffer.from(objectId)
                },
                memberIds: _.map(members, (n) => {
                    return {
                        id: Buffer.from(n.memberid.toString())
                    };
                })
            };

            client.getDataObjectNetworkInfo(params, (err, response) => {
                if (err) {
                    return res.status(500).send(err.toString());
                }

                let objects = response.list || [];
                let object = _.find(objects, {item: 'available'});

                if (!object) {
                    return res.status(404).send('Cannot find data object.');
                }

                let info = JSON.parse(object.available.info);
                let price = parseFloat(info.price);
                let memberId = object.memberId.id.toString();

                return res.status(200).json({
                    memberid: memberId,
                    price: price
                });
            });
        });
    });

    /**
     * Show DO request details by Id
     */
    app.get('/dorequests/:id', (req, res) => {
        let doId = req.params.id.toString();

        utils.getAllMembers(client, (members, err) => {
            if (err) {
                return res.status(500).send(err.toString());
            }

            let params = {
                dataObjectId: {
                    id: Buffer.from(doId)
                },
                memberIds: _.map(members, (n) => {
                    return {
                        id: Buffer.from(n.memberid.toString())
                    };
                })
            };

            client.getDataObjectNetworkInfo(params, (err, response) => {
                if (err) {
                    return res.status(500).send(err.toString());
                }

                let objects = response.list || [];

                response = _.map(objects, (n) => {
                    let memberId = n.memberId.id.toString();
                    let hash = n.available.hash.toString();

                    let ret = {
                        memberid: memberId,
                        dostatus: n.item === 'available' ? 'publisher' : 'requester',
                        dohash: hash,
                        docreatedate: new Date(parseInt(n.available.createdAt.seconds) * 1000),
                        doupdatedate: new Date(parseInt(n.available.updatedAt.seconds) * 1000)
                    };

                    const files = utils.getDOFiles(doId, memberId);

                    if (files !== false) {
                        ret.files = files;

                        const uploadedHash = utils.getDOFilesHash(doId, memberId);

                        if (uploadedHash !== hash) {
                            ret.dorequeststatus = 'hash mismatch';
                        } else {
                            ret.dorequeststatus = 'complete';
                        }
                    } else {
                        ret.dorequeststatus = 'not found';
                    }

                    return ret;
                });

                _.forEach(members, (n) => {
                    if (_.find(response, (o) => _.isEqual(o.memberid, n.memberid.toString())) !== undefined) {
                        return;
                    }

                    response.push({
                        memberid: n.memberid.toString(),
                        dostatus: 'requester',
                        dohash: null,
                        dorequeststatus: utils.checkDiscoveredDOContent(n.memberid.toString(), doId)
                            ? 'complete'
                            : 'not found'
                    });
                });

                return res.status(200).json(response);
            });
        });
    });
};
