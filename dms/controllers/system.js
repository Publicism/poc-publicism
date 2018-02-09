const Telnet = require('telnet-client');
const fs = require('fs');

const config = require('../config');

module.exports = (app) => {
    app.get('/systemchecks', (req, res) => {
        Promise
            .all([
                new Promise((resolve) => {
                    let params = {
                        host: config.blockchain.host,
                        port: config.blockchain.port
                    };

                    let connection = new Telnet();

                    connection.on('connect', () => {
                        connection.end();

                        resolve({
                            checkname: 'Blockchain API',
                            checkstatus: 'OK',
                            checkdescription: null
                        });
                    });

                    connection.on('error', () => {
                        resolve({
                            checkname: 'Blockchain API',
                            checkstatus: 'ERROR',
                            checkdescription: 'Cannot connect to Blockchain API'
                        });
                    });

                    connection.connect(params);
                }),
                new Promise((resolve) => {
                    if (!fs.existsSync(config.uploads.rootPath)) {
                        resolve({
                            checkname: 'Data Storage',
                            checkstatus: 'ERROR',
                            checkdescription: 'Upload directory does not exist'
                        });
                    } else {
                        try {
                            fs.accessSync(config.uploads.rootPath, fs.W_OK);

                            resolve({
                                checkname: 'Data Storage',
                                checkstatus: 'OK',
                                checkdescription: null
                            });
                        } catch (e) {
                            resolve({
                                checkname: 'Data Storage',
                                checkstatus: 'WARNING',
                                checkdescription: 'Upload directory exists but is not writable'
                            });
                        }
                    }
                })
            ])
            .then((result) => {
                return res.status(200).json(result);
            })
            .catch((err) => {
                return res.status(500).send(err);
            });
    });

    app.get('/memberid', (req, res) => {
        return res.status(200).json({currentMemberId: config.currentMemberId});
    });
};
