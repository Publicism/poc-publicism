const Members = artifacts.require("./Members.sol");

contract('Members', accounts => {
  describe('.update', () => {
    context('no member', () => {
      it('add member', () => {
        let id = 1
        let name = 'First Member'
        let info = JSON.stringify({ type: 'fake' })
        return Members.deployed().then(instance => {
          return instance.update(id, name, info, { from: accounts[0] }).then(() => {
            return instance.get(id)
          }).then(returned => {
            assert.deepEqual(returned, [name, info])
          })
        })
      })
    })
    context('member present', () => {
      it('update member', () => {
        let id = 11
        let nameA = 'First Member'
        let infoA = JSON.stringify({ type: 'fake' })
        let nameB = 'Updated Member'
        let infoB = JSON.stringify({ type: 'stillFake' })

        return Members.deployed().then(instance => {
          return instance.update(id, nameA, infoA, { from: accounts[0] }).then(() => {
            return instance.update(id, nameB, infoB)
          }).then(() => {
            return instance.get(id)
          }).then(returned => {
            assert.deepEqual(returned, [nameB, infoB])
          })
        })    
      })
    })
  })

  describe('.get', () => {
    context('no member', () => {
      it('return empty strings', () => {
        let id = 666
        return Members.deployed().then(instance => {
          return instance.get(id)
        }).then(returned => {
          assert.deepEqual(returned, ['', ''])
        })
      })
    })
    context('member present', () => {
      it('return name and info', () => {
        let id = 1
        let name = 'First Member'
        let info = JSON.stringify({ type: 'fake' })
        return Members.deployed().then(instance => {
          return instance.update(id, name, info, { from: accounts[0] }).then(() => {
            return instance.get(id)
          }).then(returned => {
            assert.deepEqual(returned, [name, info])
          })
        })
      })
    })
  })

  describe('.remove', () => {
    it('remove member', () => {
      let id = 111
      let name = 'First Member'
      let info = JSON.stringify({ type: 'fake' })
      return Members.deployed().then(instance => {
        return instance.update(id, name, info, { from: accounts[0] }).then(() => {
          return instance.remove(id)
        }).then(() => {
          return instance.get(id)
        }).then(returned => {
          assert.deepEqual(returned, ['', ''])
        })
      })
    })
  })
});
