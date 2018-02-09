module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 22000,
            network_id: '*' // Match any network id
        },
        test: {
            host: '104.42.227.163',
            port: 22000,
            network_id: '*' // Match any network id
        },
        stage: {
            host: '13.93.217.3',
            port: 22000,
            network_id: '*' // Match any network id
        }
    }
};
