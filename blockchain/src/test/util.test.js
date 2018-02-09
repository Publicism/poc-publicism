// @flow

'use strict'

import mocha from 'mocha'
import assert from 'assert'

import util from '../lib/util'

mocha.describe('util', () => {
  mocha.describe('.padEnd', () => {
    mocha.it('adds zeroes to the right', () => {
      let input = util.toBuffer('0x6d656d6265724964')
      let expected = util.toBuffer('0x6d656d6265724964000000000000000000000000000000000000000000000000')
      let padded = util.padEnd(input)
      assert.deepEqual(padded, expected)
    })
  })

  mocha.describe('.padStart', () => {
    mocha.it('adds zeroes to the left', () => {
      let input = util.toBuffer('0x6d656d6265724964')
      let expected = util.toBuffer('0x0000000000000000000000000000000000000000000000006d656d6265724964')
      let padded = util.padStart(input)
      assert.deepEqual(padded, expected)
    })
  })

  mocha.describe('.unpad', () => {
    mocha.it('remove leading zeroes', () => {
      let input = util.toBuffer('0x0000000000000000000000000000000000000000000000006d656d6265724964')
      let expected = util.toBuffer('0x6d656d6265724964')
      let unpadded = util.unpad(input)
      assert.deepEqual(unpadded, expected)
    })
  })
})
