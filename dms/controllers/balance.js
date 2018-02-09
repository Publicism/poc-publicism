const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const uuidv4 = require('uuid/v4');
const machinomy = require('machinomy');
const querystring = require('querystring');
const path = require('path');

const utils = require('../utils');
const config = require('../config');

module.exports = (app, client, paywall) => {
    /**
     * Make payment for another member
     */
    app.post('/balance/pay', (req, res) => {
        const memberId = req.body.memberid;
        const doId = req.body.doid;
        const price = req.body.price;

        utils.getAllMembers(client, (members, err) => {
            if (err) {
                return res.status(500).send(err);
            }

            console.log('Trying to pay %s wei to member %s for DO %s.', price, memberId, doId);

            const paymentAddress = utils.paymentAddressByMember(members, memberId) + '/balance/receive?'
                + querystring.stringify({
                    memberid: config.currentMemberId.toString(),
                    doid: doId,
                    price
                });

            machinomy
                .buy(paymentAddress, config.machinomy.account, config.machinomy.password)
                .then((response) => {
                    const json = JSON.parse(response);

                    return res.status(200).json({token: json.token});
                });
        });
    });

    /**
     * Recieve payment from another member
     */
    app.get('/balance/receive', (req, res) => {
        const memberId = req.query.memberid.toString();
        const doId = req.query.doid.toString();
        const price = parseFloat(req.query.price);

        console.log('Recieved payment of %s wei from member %s for DO %s.', price, memberId, doId);

        let params = {
            dataObjectId: {
                id: Buffer.from(doId)
            },
            memberIds: [
                {
                    id: Buffer.from(config.currentMemberId.toString())
                }
            ]
        };

        client.getDataObjectNetworkInfo(params, (err, response) => {
            if (err) {
                return res.status(500).send(err.toString());
            }

            const list = response.list || [];
            let object = _.find(list, (o) => {
                return o.available && o.available.id.id.toString() === doId;
            });

            if (!object) {
                return res.status(404).send('Cannot find data object.');
            }

            object = object.available;

            const info = JSON.parse(object.info);

            // TODO: Probably check some access?

            if (info.price !== price) {
                return res.status(400).send('Invalid price specified.');
            }

            paywall.guard(price, () => {
                MongoClient.connect(config.mongo.address, (err, db) => {
                    if (err) {
                        return res.status(500).send(err.toString());
                    }

                    const token = uuidv4().toString();

                    const data = {
                        createdAt: new Date(),
                        memberId: memberId,
                        doId: doId,
                        price: price,
                        token: token
                    };

                    db
                        .collection('payment_tokens')
                        .createIndex({createdAt: 1}, {expireAfterSeconds: 120}, () => { // 2 mins for now
                            db
                                .collection('payment_tokens')
                                .insertOne(data, (err) => {
                                    db.close();

                                    if (err) {
                                        return res.status(500).send(err.toString());
                                    }

                                    console.log('Token %s stored in temp db.', token);

                                    return res.status(200).json({token: token});
                                });
                        });
                });
            })(req, res);
        });
    });

    /**
     * Get current balance data
     */
    app.get('/balance/current', (req, res) => {
        const web3 = machinomy.configuration.web3();
        const storagePath = path.join(machinomy.configuration.baseDirPath(), 'storage.db');
        const storage = machinomy.storage.build(web3, storagePath, 'receiver');

        utils.getCurrentBalance(storage)
            .then(json => {
                return res.status(200).json(json);
            })
            .catch(e => {
                console.error(e);

                return res.status(500).send(e);
            });
    });

    /**
     * Settle balance
     */
    app.post('/balance/settle', (req, res) => {
        const web3 = machinomy.configuration.web3();
        const storagePath = path.join(machinomy.configuration.baseDirPath(), 'storage.db');
        const storage = machinomy.storage.build(web3, storagePath, 'receiver');

        utils.getMachinomyUnsettledChannels(storage)
            .then(channels => {
                let promises = [];

                _.each(channels, c => {
                    promises.push(utils.closeMachinomyChannel(c.channelId, storage));
                });

                Promise.all(promises)
                    .then(() => {
                        utils.getCurrentBalance(storage)
                            .then(json => {
                                return res.status(200).json(json);
                            })
                            .catch(e => {
                                return res.status(500).send(e);
                            });
                    })
                    .catch(e => {
                        return res.status(500).send(e);
                    });
            })
            .catch(e => {
                console.error(e);

                return res.status(500).send(e);
            });
    });
};
