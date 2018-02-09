const path = require('path');
const archiver = require('archiver');
const fs = require('fs');
const os = require('os');
const MongoClient = require('mongodb').MongoClient;

const config = require('../config');

module.exports = (app, client) => {
    /**
     * This is to receive requests from backend (Node.js) instances of
     * other Members who want some DO content from this instance
     */
    app.get('/dos/:id', (req, res) => {
        const memberId = req.header('Member-Id').toString();
        const token = req.header('Payment-Token') ? req.header('Payment-Token').toString() : '';
        const doId = req.params.id.toString();

        if (memberId) {
            console.log('Recieved request from Member %s for Data Object %s', memberId, doId);
        }
        let params = {
            id: Buffer.from(config.currentMemberId.toString())
        };

        client.getMemberDataObjects(params, (err, response) => {
            if (err) {
                return res.status(500).send(err.toString());
            }

            const objects = response.dataObjects || [];

            const object = objects.find((el) => {
                if (el.id.id.toString() === doId) {
                    return el;
                }
            });

            if (!object) {
                console.log(`Cannot find data object ${doId}`);

                return res.status(404).send('Cannot find data object.');
            }

            const info = JSON.parse(object.info);
            const price = info.price;

            // Check for predefined Access List
            const isAllowed = info.permissions.find((el) => {
                if (el === 'all' || el === memberId) {
                    return el;
                }
            });

            if (!isAllowed) {
                console.log(`Member ${memberId} is not allowed to request DO ${doId}`);

                return res.status(403).send('You are not allowed to perform this action.');
            }

            // Check if we recieved bucks for this DO
            if (price) {
                if (!token) {
                    return res.status(403).send('No payment token provided.');
                }

                MongoClient.connect(config.mongo.address, (err, db) => {
                    if (err) {
                        return res.status(500).send(err.toString());
                    }

                    const data = {
                        memberId: memberId,
                        doId: doId,
                        price: price,
                        token: token
                    };

                    db.collection('payment_tokens').findOne(data, (err) => {
                        db.close();

                        if (err) {
                            return res.status(403).send('Error checking payment status.');
                        } else {
                            console.log('Payment info found for token %s found.', token);

                            sendArchive(doId);
                        }
                    });
                });
            } else {
                sendArchive(doId);
            }

            function sendArchive(doId) {
                const scanPath = path.join(config.uploads.dataObjects, doId, '/');
                const tmpArchivePath = path.join(os.tmpdir(), doId + '.zip');
                const stream = fs.createWriteStream(tmpArchivePath);
                const archive = archiver('zip');

                archive.pipe(stream);
                archive.directory(scanPath, false);
                archive.finalize();

                stream.on('close', () => {
                    console.log('Sending ZIP archive with DO files');

                    return res.status(200).sendFile(tmpArchivePath);
                });
            }
        });
    });
};
