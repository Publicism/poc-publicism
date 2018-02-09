// @flow

import path from 'path'
import grpc from 'grpc'

const PROTO_PATH = path.resolve(__dirname, '../../../protos/blockchain.proto')
export default grpc.load(PROTO_PATH).dcms.blockchain
