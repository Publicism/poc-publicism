const Contract = artifacts.require('./DataObjectRequestHistory.sol')
const util = require('../../dist/lib/util')

contract('DataObjectRequestHistory', accounts => {
  let sender = accounts[0]

  it('add and retrieve record', () => {
    let memberId = Buffer.from('member')
    let dataObjectId = Buffer.from('dataObjectId')
    
    return Contract.deployed().then(instance => {
      return instance.add(util.toHex(memberId), util.toHex(dataObjectId), { from: accounts[0] }).then(() => {
        return instance.getId()
      }).then(id => {
        return instance.get(id)
      }).then(stored => {
        let memberIdStored = util.toBuffer(stored[0])
        let dataObjectIdStored = util.toBuffer(stored[1])
        let origin = stored[2]
        assert.deepEqual(memberIdStored, util.padEnd(memberId))
        assert.deepEqual(dataObjectIdStored, util.padEnd(dataObjectId))
        assert.equal(origin, sender)
      })
    }) 
  })
})
