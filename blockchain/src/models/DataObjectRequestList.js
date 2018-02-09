// @flow

import _ from 'lodash';

import proto from '../lib/proto';
import StoredDataObjectRequest from './StoredDataObjectRequest';

export default class DataObjectRequestsList {
    list: Array<StoredDataObjectRequest>;

    constructor(list: Array<StoredDataObjectRequest>) {
        this.list = list;
    }

    toProto(): proto.DataObjectRequestsList {
        return new proto.DataObjectRequestsList()
            .setList(_.map(this.list, r => r.toProto()));
    }
}
