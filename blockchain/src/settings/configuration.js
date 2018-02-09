// @flow

import Web3 from 'web3';
import Promise from 'bluebird';
import config from 'config';
import Db from 'mongodb/lib/db';
import MongoClient from 'mongodb';

import { DataObjectMemberOwnershipContract } from '../storage/DataObjectMemberOwnershipContract';
import { DataObjectMemberOwnershipStore } from '../storage/DataObjectMemberOwnershipStore';
import { DataObjectRequestHistoryContract } from '../storage/DataObjectRequestHistoryContract';
import DataObjectService from '../services/DataObjectService';
import BlockchainController from '../controllers/BlockchainController';
import DataObjectRequestService from '../services/DataObjectRequestService';
import DataObjectRequestStore from '../storage/DataObjectRequestStore';
import { MembersContract } from '../storage/MembersContract';
import MembersStore from '../storage/MembersStore';
import MembersService from '../services/MembersService';

class Configuration {
    constructor() {
        this.config = config;
    }

    grpcBinding(): Promise<string> {
        let address: string = this.config.get('server.address');
        let port: number = this.config.get('server.port');

        return Promise.resolve(address + ':' + port.toString());
    }

    memberId(): Promise<Buffer> {
        return Promise.resolve(Buffer.from('memberId'));
    }

    account(): Promise<string> {
        return Promise.resolve(this.config.get('eth.account'));
    }

    web3(): Promise<Web3> {
        let api = this.config.get('eth.api');
        let provider = new Web3.providers.HttpProvider(api);
        return Promise.resolve(new Web3(provider));
    }

    dbAddress(): Promise<string> {
        return Promise.resolve(this.config.get('mongo.address'));
    }

    dbName(): Promise<string> {
        return Promise.resolve(this.config.get('mongo.database'));
    }

    db(): Promise<Db> {
        return Promise.join(this.dbAddress(), this.dbName(), (address, dbName) => {
            let connectionString = address + '/' + dbName;
            return MongoClient.connect(connectionString);
        });
    }

    dataObjectMemberOwnershipContract(): Promise<DataObjectMemberOwnershipContract> {
        return Promise.join(this.web3(), this.account(), (web3, account) => {
            return new DataObjectMemberOwnershipContract(account, web3.currentProvider);
        });
    }

    dataObjectMemberOwnershipStore(): Promise<DataObjectMemberOwnershipStore> {
        return Promise.join(this.dataObjectMemberOwnershipContract(), this.db(), (contract, db) => {
            return new DataObjectMemberOwnershipStore(contract, db);
        });
    }

    dataObjectService(): Promise<DataObjectService> {
        return this.dataObjectMemberOwnershipStore().then(store => {
            return new DataObjectService(store);
        });
    }

    dataObjectRequestHistoryContract(): Promise<DataObjectRequestHistoryContract> {
        return Promise.join(this.web3(), this.account(), (web3, account) => {
            return new DataObjectRequestHistoryContract(account, web3.currentProvider);
        });
    }

    dataObjectRequestStore(): Promise<DataObjectRequestStore> {
        return Promise.join(this.dataObjectRequestHistoryContract(), this.db(), (contract, db) => {
            return new DataObjectRequestStore(contract, db);
        });
    }

    dataObjectRequestService(): Promise<DataObjectRequestService> {
        return this.dataObjectRequestStore().then(store => {
            return new DataObjectRequestService(store);
        });
    }

    membersContract(): Promise<MembersContract> {
        return Promise.join(this.web3(), this.account(), (web3, account) => {
            return new MembersContract(account, web3.currentProvider);
        });
    }

    membersStore(): Promise<MembersStore> {
        return this.membersContract().then(contract => {
            return new MembersStore(contract);
        });
    }

    membersService(): Promise<MembersService> {
        return this.membersStore().then(store => {
            return new MembersService(store);
        });
    }

    blockchainController(): BlockchainController {
        return Promise.join(this.dataObjectService(), this.dataObjectRequestService(), this.membersService(), (dataObject, dataObjectRequest, members) => {
            return new BlockchainController(dataObject, dataObjectRequest, members);
        });
    }
}

export default new Configuration();
