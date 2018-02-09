// @flow

import _ from 'lodash';

import proto from '../lib/proto';
import StoredDataObject from './StoredDataObject';

export default class DataObjectsList {
    dataObjects: Array<StoredDataObject>;

    constructor(storedDataObjects: Array<StoredDataObject>) {
        this.dataObjects = storedDataObjects;
    }

    toProto(): proto.DataObjectsList {
        return new proto.DataObjectsList()
            .setDataObjects(_.map(this.dataObjects, r => r.toProto()));
    }
}
