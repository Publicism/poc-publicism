// @flow

import grpc from 'grpc';

import configuration from './configuration';

export default (server: grpc.Server): Promise<number> => {
    return configuration.grpcBinding().then(binding => {
        return server.bind(binding, grpc.ServerCredentials.createInsecure());
    });
}
