// DEV specific configuration

module.exports = {

    host: '127.0.0.1',
    port: process.env.dmsport,
    sslPort: process.env.sslport,
    blockchain: {
        host: '127.0.0.1',
        port: process.env.bcapiport
    },
    currentMemberId: process.env.memberid,
    machinomy: {
        account: process.env.machinomyAccount, // 0x05e8e3f35582003646c5ad20b54e122128449d45
    }

};