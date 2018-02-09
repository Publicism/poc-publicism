const _ = require('lodash');
const uuid = require('uuid');

const utils = require('../utils');
const config = require('../config');

const dataObjectsPath = config.uploads.dataObjects;

module.exports = (app, client) => {
    /**
     * List all DOs stored in the blockchain
     */
    app.get('/members/me/dos/all', (req, res) => {
        let params = {
            id: Buffer.from(config.currentMemberId.toString())
        };

        client.getMemberDataObjects(params, (err, response) => {
            if (err) {
                return res.status(500).send(err.toString());
            }

            const objects = response.dataObjects || [];

            const clientResponse = _.map(objects, (n) => {
                const id = n.id.id.toString();

                return {
                    doid: id,
                    dohash: n.hash.toString(),
                    info: JSON.parse(n.info),
                    createdate: new Date(parseInt(n.createdAt.seconds, 10) * 1000),
                    updatedate: new Date(parseInt(n.updatedAt.seconds, 10) * 1000),
                    files: utils.getDOFiles(id)
                };
            });

            return res.status(200).json(clientResponse);
        });
    });

    /**
     * Add new file with new DO content to local Member file system, put new record into blockchain.
     */
    app.post('/dos', (req, res) => {
        const objectIdBuffer = Buffer.alloc(16);

        uuid.v4(null, objectIdBuffer);

        const objectId = objectIdBuffer.toString('hex');

        if (objectId === false) {
            return res.status(500).send('failed');
        }

        utils.uploadDOtoDataStorage(req, dataObjectsPath, objectId)
            .then(hash => {
                const info = {type: req.body.type};

                if (req.body.name !== undefined) {
                    info.name = req.body.name;
                }

                if (req.body.price !== undefined) {
                    info.price = parseFloat(req.body.price);
                }

                info.permissions = (req.body.permissions || []);

                if (info.permissions.length === 0) {
                    info.permissions = ['all']
                } else if (info.permissions.indexOf(config.currentMemberId.toString()) === -1) {
                    info.permissions.unshift(config.currentMemberId.toString());
                }

                let data = {
                    memberId: {
                        id: Buffer.from(config.currentMemberId.toString())
                    },
                    dataObject: {
                        id: {
                            id: Buffer.from(objectId.toString())
                        },
                        hash: Buffer.from(hash.toString()),
                        info: Buffer.from(JSON.stringify(info)).toString()
                    }
                };

                client.addDataObject(data, (err) => {
                    if (err) {
                        return res.status(500).send(err.toString());
                    }

                    res.status(200).json({newobjectid: objectId});
                });
            })
            .catch(e => {
                console.error(e);

                return res.status(500).send(e);
            });
    });

    /**
     * Update DO content
     */
    app.post('/dos/:id', (req, res) => {
        utils.uploadDOtoDataStorage(req, dataObjectsPath, req.params.id)
        .then((hash) => {
            if (!hash) {
                return res.status(500).send('failed');
            } else {
                let info = {type: req.body.type};

                if (req.body.name !== undefined) {
                    info.name = req.body.name;
                }

                if (req.body.price !== undefined) {
                    info.price = parseFloat(req.body.price);
                }

                info.permissions = (req.body.permissions || []).filter((m) => {
                    return m !== config.currentMemberId.toString();
                });
                info.permissions.unshift(config.currentMemberId.toString());


                let data = {
                    id: {
                        id: Buffer.from(req.params.id)
                    },
                    memberId: {
                        id: Buffer.from(config.currentMemberId.toString())
                    },
                    hash: Buffer.from(hash),
                    info: Buffer.from(JSON.stringify(info)).toString()
                };

                client.updateDataObject(data, (err) => {
                    if (err) {
                        return res.status(500).send(err.toString());
                    }

                    return res.status(200).send('success');
                });
            }
        })
        .catch((err) => {
            if (err) {
                return res.status(404).send('failed');
            } else {
                return res.status(500).send('internal server error');
            }
        })
    });

    /**
     * Get all data objects from all members
     * */
    app.get('/members/all/dos/all', (req, res) => {
        utils.getAllMembers(client, (members, err) => {
            if (err) {
                return res.status(404).send(err);
            }

            // hard-coded result
            let dos = [];
            let params = {};
            let p = members.map((el) => {
                params.id = Buffer.from(el.memberid);
                return new Promise((resolve, reject) => {
                    client.getMemberDataObjects(params, (err, response) => {
                        if (err) {
                            reject(err);
                        }

                        let objects = response.dataObjects || [];

                        response = _.map(objects, (n) => {
                            let id = n.id.id.toString();

                            return {
                                doid: id,
                                // doname: `DO_${id}_member_${el.memberid}`,
                                dohash: n.hash.toString(),
                                info: JSON.parse(n.info),
                                createdate: new Date(parseInt(n.createdAt.seconds) * 1000),
                                updatedate: new Date(parseInt(n.updatedAt.seconds) * 1000),
                                files: utils.getDOFiles(id),
                                // dofilesystemlink: '/uploads/dataobjects/' + id,
                                // price: Math.round(Math.random() * 100 * req.params.id),
                                memberid: parseInt(el.memberid)
                            };
                        });
                        dos = dos.concat(response);
                        resolve();
                    });
                });
            });
            Promise.all(p)
                .then(() => {
                    return res.status(200).json(dos);
                })
                .catch((err) => {
                    return res.status(500).send(err.toString());
                });
        });
    });

    /**
     * Get all data objects from specified member
     * */
    app.get('/members/:id/dos/all', (req, res) => {
        utils.getAllMembers(client, (members, err) => {
            if (err) {
                return res.status(404).send(err);
            }

            let params = {
                id: Buffer.from(req.params.id)
            };
            client.getMemberDataObjects(params, (err, response) => {
                if (err) {
                    return res.status(500).send(err.toString());
                }

                let objects = response.dataObjects || [];

                response = _.map(objects, (n) => {
                    let id = n.id.id.toString();

                    return {
                        doid: id,
                        // doname: `DO_${id}_member_${req.params.id}`,
                        dohash: n.hash.toString(),
                        info: JSON.parse(n.info),
                        createdate: new Date(parseInt(n.createdAt.seconds) * 1000),
                        updatedate: new Date(parseInt(n.updatedAt.seconds) * 1000),
                        files: utils.getDOFiles(id),
                        // dofilesystemlink: '/uploads/dataobjects/' + id,
                        // price: Math.round(Math.random() * 100 * req.params.id),
                        memberid: parseInt(req.params.id)
                    };
                });

                return res.status(200).json(response);
            });
        });
    });
};
