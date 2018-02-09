const express = require('express');
const app = express();
const appSecure = express();
const fs = require('mz/fs');
const path = require('path');
const bodyParser = require('body-parser');
const grpc = require('grpc');
const program = require('commander');
const https = require('https');
const machinomy = require('machinomy');
const Web3 = require('web3');
const cors = require('cors');

const blockchain = grpc.load(path.join(__dirname, '../protos/blockchain.proto')).dcms.blockchain;

const config = require('./config');

program
    .option('-h, --host <host>', 'Host')
    .option('-p, --port <port>', 'Port', parseInt)
    .option('-s, --secure-port <securePort>', 'Secure port', parseInt)
    .option('-m, --member-id <memberId>', 'Current Member Id', parseInt)
    .option('--machinomy-account <machinomyAccount>')
    .option('--machinomy-password <machinomyPassword>')
    .parse(process.argv);

// Override currentMemberId if arg is passed
program.memberId ? config.currentMemberId = program.memberId : null;

// Override port
program.port ? config.port = program.port : null;
program.securePort ? config.sslPort = program.securePort : null;

// Override host
if (program.host) {
    config.host = program.host;
} else if (process.env.host) {
    config.host = process.env.host;
}

// Setup HTTPS server
const serverOptions = {
    key: fs.existsSync(config.cert.server.keyName) ? fs.readFileSync(config.cert.server.keyName) : null,
    cert: fs.existsSync(config.cert.server.certName) ? fs.readFileSync(config.cert.server.certName) : null,
    ca: fs.existsSync(config.cert.server.caName) ? fs.readFileSync(config.cert.server.caName) : null,
    requestCert: true,
    rejectUnauthorized: false
};
// Setup GRPC client
const client = new blockchain.Blockchain(
    config.blockchain.host + ':' + config.blockchain.port,
    grpc.credentials.createInsecure()
);

// Setup Machinomy payment system
if (program.machinomyAccount) {
    config.machinomy.account = program.machinomyAccount;
}

if (program.machinomyPassword) {
    config.machinomy.password = program.machinomyPassword;
}

machinomy.configuration.web3 = () => {
    return new Web3(new Web3.providers.HttpProvider(config.machinomy.address));
};

machinomy.configuration.contractAddress = () => {
    return require('./build/contracts/Broker.json').networks[config.machinomy.networkId].address;
};

const paywall = new machinomy.Paywall(
    machinomy.configuration.web3(),
    config.machinomy.account,
    'http://' + config.host + ':' + config.port
);

// Setup Express middlewares
app.use(express.static(path.join(__dirname, '/../web/dist')));
app.use('/uploads', express.static(config.uploads.rootPath));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '10mb'
}));
app.use(cors({
    origin: '*',
    credentials: true,
    allowedHeaders: [
        'content-type',
        'paywall-version',
        'paywall-address',
        'paywall-gateway',
        'paywall-price',
        'paywall-token',
        'authorization'
    ],
    exposedHeaders: ['paywall-version', 'paywall-address', 'paywall-gateway', 'paywall-price', 'paywall-token']
}));
app.use(paywall.middleware());

// This is temporary hardcoded pathes. They may change after merge with frontend UI.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
});

// Declare controllers
require('./controllers/system')(app);
require('./controllers/member')(app, client);
require('./controllers/do')(app, client);
require('./controllers/dosecure')(appSecure, client);
require('./controllers/dorequest')(app, client);
require('./controllers/balance')(app, client, paywall);

// Wildcard route
app.get('*', (req, res) => {
    res.sendFile(config.indexHtml);
});

// Run servers
(async function () {
    let cert;

    try {
        cert = await fs.readFile(config.cert.server.certName);
    } catch (e) {
        if (config.cert.isEnabled) {
            console.error('Unable to read certificate. Terminating.');

            process.exit(-1); // Do not allow to start if server cert cannot be accessed
        }
    }

    try {
        machinomy.configuration.web3().eth.getStorageAt(machinomy.configuration.contractAddress(), 0);
    } catch (e) {
        console.error('Unable to find Broker contract. Terminating.');

        process.exit(-1); // Do not allow to start if server cert cannot be accessed
    }

    const data = {
        id: {
            id: Buffer.from(config.currentMemberId.toString())
        },
        name: 'Member ' + config.currentMemberId.toString(),
        info: Buffer.from(JSON.stringify({
            dmscertificate: cert,
            host: config.host,
            dmsport: config.sslPort,
            webport: config.port,
            paymentport: config.port
        })).toString()
    };

    const error = await(new Promise((resolve) => {
        client.updateMember(data, resolve);
    }));

    error ? console.warn(error.toString()) : null;

    app.listen(config.port, config.localhost, () => {
        console.log('Express app listening at http://%s:%s', config.localhost, config.port);
        console.log('Member Id is %s', config.currentMemberId);
    });

    https.createServer(serverOptions, appSecure).listen(config.sslPort, () => {
        console.log('Secure server listening at https://%s:%s', config.host, config.sslPort);
    });

    if (process.env.NODE_ENV) {
        console.log('Environment: ' + process.env.NODE_ENV);
    }
})();

module.exports = {
    server: app,
    serverSecure: appSecure
};
