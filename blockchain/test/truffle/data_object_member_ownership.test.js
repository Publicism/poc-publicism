const Contract = artifacts.require('./DataObjectMemberOwnerships.sol')
const util = require('../../dist/lib/util')

contract('DataObjectMemberOwnerships', accounts => {
  let sender = accounts[0]

  describe('.add', () => {
    it('add record', () => {
      let memberId = Buffer.from('member')
      let dataObjectId = Buffer.from('dataObjectId')
      let dataObjectHash = Buffer.from('dataObjectHash')
      let dataObjectInfo = JSON.stringify({ type: 'fake' })
      
      return Contract.deployed().then(instance => {
        return instance.add(util.toHex(memberId), util.toHex(dataObjectId), util.toHex(dataObjectHash), dataObjectInfo, { from: accounts[0] }).then(() => {
          return instance.getId()
        }).then(id => {
          return instance.get(id)
        }).then(stored => {
          let memberIdStored = util.toBuffer(stored[0])
          let dataObjectIdStored = util.toBuffer(stored[1])
          let dataObjectHashStored = util.toBuffer(stored[2])
          let dataObjectInfoStored = stored[3]
          let origin = stored[4]
          assert.deepEqual(memberIdStored, util.padEnd(memberId))
          assert.deepEqual(dataObjectIdStored, util.padEnd(dataObjectId))
          assert.deepEqual(dataObjectHashStored, util.padEnd(dataObjectHash))
          assert.deepEqual(dataObjectInfoStored, dataObjectInfo)
          assert.equal(origin, sender)
        })
      })
    })
  })

  describe('.update', () => {
    it('update record', () => {
      let memberId = Buffer.from('member')
      let dataObjectId = Buffer.from('dataObjectId')
      let dataObjectHash = Buffer.from('dataObjectHash')
      let dataObjectInfo = JSON.stringify({ type: 'fake' })
      
      let newMemberId = Buffer.from('anotherMember')
      let newDataObjectHash = Buffer.from('anotherDataObjectHash')
      let newDataObjectInfo = JSON.stringify({ type: 'new fake' })
      
      return Contract.deployed().then(instance => {
        return instance.add(util.toHex(memberId), util.toHex(dataObjectId), util.toHex(dataObjectHash), dataObjectInfo, { from: accounts[0] }).then(() => {
          return instance.getId()
        }).then(id => {
          return instance.update(id, util.toHex(newMemberId), util.toHex(newDataObjectHash), newDataObjectInfo).then(() => {
            return instance.get(id)
          })
        }).then(stored => {
          let memberIdStored = util.toBuffer(stored[0])
          let dataObjectIdStored = util.toBuffer(stored[1])
          let dataObjectHashStored = util.toBuffer(stored[2])
          let dataObjectInfoStored = stored[3]
          let origin = stored[4]
          assert.deepEqual(memberIdStored, util.padEnd(newMemberId))
          assert.deepEqual(dataObjectIdStored, util.padEnd(dataObjectId))
          assert.deepEqual(dataObjectHashStored, util.padEnd(newDataObjectHash))
          assert.deepEqual(dataObjectInfoStored, newDataObjectInfo)
          assert.equal(origin, sender)
        })
      })
    })
  })

  describe('.remove', () => {
    it('remove record', () => {
      let memberId = Buffer.from('member')
      let dataObjectId = Buffer.from('dataObjectId')
      let dataObjectHash = Buffer.from('dataObjectHash')
      let dataObjectInfo = JSON.stringify({ type: 'fake' })
      
      return Contract.deployed().then(instance => {
        return instance.add(util.toHex(memberId), util.toHex(dataObjectId), util.toHex(dataObjectHash), dataObjectInfo, { from: accounts[0] }).then(() => {
          return instance.getId()
        }).then(id => {
          return instance.remove(id).then(() => {
            return instance.get(id)
          })
        }).then(stored => {
          let memberIdStored = stored[0]
          let dataObjectIdStored = stored[1]
          let dataObjectHashStored = stored[2]
          let dataObjectInfoStored = stored[3]
          let origin = stored[4]
          assert.equal(memberIdStored, util.zeroHex(32))
          assert.equal(dataObjectIdStored, util.zeroHex(32))
          assert.equal(dataObjectHashStored, util.zeroHex(32))
          assert.equal(dataObjectInfoStored, '')
          assert.equal(origin, util.zeroHex(20))
        })
      })
    })
  })
})
