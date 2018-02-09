// @flow

export type EmptyProto = {}

export default class Empty {
    toProto(): EmptyProto {
        return {};
    }
}
