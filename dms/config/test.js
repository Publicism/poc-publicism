// TEST specific configuration

module.exports = {

    host: '127.0.0.1',
    port: '8081',
    sslPort: '8082',
    blockchain: {
        host: '127.0.0.1',
        port: '5000'
    },
    currentMemberId: 1,
    machinomy: {
        address: 'http://104.42.227.163:22000',
        account: process.env.machinomyAccount,
        password: 'blockchain',
        networkId: '1'
    }
};
