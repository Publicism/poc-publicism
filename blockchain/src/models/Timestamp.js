// @flow

import _ from 'lodash';

import proto from '../lib/proto';

const MILLI = 1000;
const MICRO = 1000000;

type Proto = { seconds: string, nanos: number }

export default class Timestamp {
    seconds: number;
    nanos: number;

    constructor(date: Date) {
        this.seconds = _.toInteger(date.getTime() / MILLI);
        this.nanos = _.toInteger(date.getTime() % MILLI) * MICRO;
    }

    static fromProto(raw: Proto): Timestamp {
        let milliseconds = parseInt(raw.seconds) + (raw.nanos % MICRO);
        return new Timestamp(new Date(milliseconds));
    }

    toDate(): Date {
        return new Date(this.seconds + (this.nanos % MICRO));
    }

    toProto(): proto.Timestamp {
        return new proto.Timestamp().setSeconds(this.seconds).setNanos(this.nanos);
    }
}
