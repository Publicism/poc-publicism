// @flow

import _ from 'lodash';

import proto from '../lib/proto';
import DataObjectNetworkInfoItem from './DataObjectNetworkInfoItem';

export default class DataObjectNetworkInfo {
    list: Array<DataObjectNetworkInfoItem>;

    constructor(list: Array<DataObjectNetworkInfoItem>) {
        this.list = list;
    }

    static fromProto(raw: Object): DataObjectNetworkInfo {
        let list = _.map(raw.list, item => DataObjectNetworkInfoItem.fromProto(item));
        return new DataObjectNetworkInfo(list);
    }

    toProto(): proto.DataObjectNetworkInfo {
        return new proto.DataObjectNetworkInfo()
            .setList(_.map(this.list, i => i.toProto()));
    }
}
