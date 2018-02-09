const Contract = artifacts.require('./DataObjectHistory.sol')
const util = require('../../dist/lib/util')

contract('DataObjectHistory', accounts => {
  let sender = accounts[0]

  it('add and retrieve record', () => {
    let memberId = util.padStart(Buffer.from('member'))
    let dataObjectId = util.padStart(Buffer.from('dataObjectId'))
    let dataObjectHash = util.padStart(Buffer.from('dataObjectHash'))
    
    return Contract.deployed().then(instance => {
      return instance.add(util.toHex(memberId), util.toHex(dataObjectId), util.toHex(dataObjectHash), { from: accounts[0] }).then(() => {
        return instance.getId()
      }).then(id => {
        return instance.get(id)
      }).then(stored => {
        let memberIdStored = util.toBuffer(stored[0])
        let dataObjectIdStored = util.toBuffer(stored[1])
        let dataObjectHashStored = util.toBuffer(stored[2])
        let origin = stored[3]
        assert.deepEqual(memberIdStored, memberId)
        assert.deepEqual(dataObjectIdStored, dataObjectId)
        assert.deepEqual(dataObjectHashStored, dataObjectHash)
        assert.equal(origin, sender)
      })
    }) 
  })
})
