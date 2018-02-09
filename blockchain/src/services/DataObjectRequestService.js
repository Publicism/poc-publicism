// @flow

import StoredDataObjectRequest from '../models/StoredDataObjectRequest'
import DataObjectRequestStore from '../storage/DataObjectRequestStore'
import DataObjectRequestsList from '../models/DataObjectRequestList'
import DataObjectRequest from '../models/DataObjectRequest'

export default class DataObjectRequestService {
  requestStore: DataObjectRequestStore

  constructor (requestStore: DataObjectRequestStore) {
    this.requestStore = requestStore
  }

  makeRequest (dataObjectRequest: DataObjectRequest): Promise<StoredDataObjectRequest> {
    let dataObjectId = dataObjectRequest.dataObjectId
    let memberId = dataObjectRequest.memberId
    return this.requestStore.makeRequest(memberId, dataObjectId)
  }

  getDataObjectRequests(): Promise<DataObjectRequestsList> {
    return this.requestStore.getDataObjectRequests()
  }
}
