const path = require('path');

const rootPath = path.join(__dirname, '../uploads');
const indexHtml = path.join(__dirname, '../../web/dist/index.html');
const dataObjectsPath = path.join(rootPath, 'dataobjects');
const discoveredDataObjectsPath = path.join(dataObjectsPath, 'discovered');

module.exports = {

    host: '127.0.0.1',
    localhost: '0.0.0.0',
    port: '9091',
    sslPort: '9092',
    indexHtml: indexHtml,
    uploads: {
        rootPath: rootPath,
        dataObjects: dataObjectsPath,
        discoveredDataObjects: discoveredDataObjectsPath,
        dataObjectsUrl: '/uploads/dataobjects'
    },
    blockchain: {
        host: '127.0.0.1',
        port: '5000'
    },
    currentMemberId: 1,
    cert: {
        isEnabled: false,
        server: {
            keyName: './certificates/server/server.key',
            certName: './certificates/server/server.crt',
            caName: './certificates/ca/ca.crt'
        },
        client: {
            keyName: './certificates/client/client.key',
            certName: './certificates/client/client.crt',
            caName: './certificates/ca/ca.crt'
        }
    },
    mongo: {
        address: 'mongodb://localhost:27017',
        database: 'dms'
    },
    machinomy: {
        address: 'http://127.0.0.1:22000',
        account: '0xd8cc7da026c44af04dc73578b17efb7f6f87a0f9', // 0x05e8e3f35582003646c5ad20b54e122128449d45
        password: 'blockchain',
        networkId: '1'
    }

};
