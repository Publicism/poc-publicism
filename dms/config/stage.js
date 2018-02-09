// TEST specific configuration

module.exports = {

    host: '0.0.0.0',
    port: '8080',
    sslPort: '8081',
    blockchain: {
        host: '127.0.0.1',
        port: '5000'
    },
    currentMemberId: process.env.memberid,
    machinomy: {
        address: 'http://13.93.217.3:22000',
        account: process.env.machinomyAccount,
        password: 'blockchain',
        networkId: '87234'
    }

};
