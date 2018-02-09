// @flow

const ethereumJsUtil = require('ethereumjs-util')
const _ = require('lodash')

/**
 * Convert anything to Buffer.
 * 
 * @param {string} buffer
 * @return {Buffer}
 */
const toBuffer = ethereumJsUtil.toBuffer

/**
 * Convert Buffer to hex.
 * 
 * @param {Buffer} buffer
 * @return {string}
 */
const toHex = ethereumJsUtil.bufferToHex

/**
 * Remove left zero-padding.
 */
const unpad = (buffer: Buffer): Buffer => {
  let bytes = _.dropWhile(buffer, byte => byte === 0)
  return Buffer.from(bytes)
}

/**
 * Left pad buffer with zeroes up to a full specified size.
 */
const padStart = (buffer: Buffer, size: number = 32): Buffer => {
  let padding = Buffer.alloc(size - buffer.length)
  return Buffer.concat([padding, buffer])
}

/**
 * Right pad buffer with zeroes up to a full specified size.
 */
const padEnd = (buffer: Buffer, size: number = 32): Buffer => {
  let target = Buffer.alloc(size)
  buffer.copy(target)
  return target
}

const zeroHex = (length: number = 32, prefixed: boolean = true): string => {
  let prefix = ''
  if (prefixed) prefix = '0x'
  return prefix + Buffer.alloc(length).toString('hex')
}

const padHex = (buffer: Buffer): string => {
  return toHex(padStart(buffer))
}

const unpadHex = (string: string): Buffer => {
  return unpad(toBuffer(string))
}

const randomBuffer = (upperBound: number = 1000000) => {
  return Buffer.from(_.random(upperBound).toString())
}

const ethereumTimestampToDate = (timestamp: BigNumber): Date => {
  return new Date(timestamp * 1000)
}

const util = {
  toBuffer,
  toHex,
  unpad,
  padEnd,
  padStart,
  zeroHex,
  padHex,
  unpadHex,
  randomBuffer,
  ethereumTimestampToDate
}

module.exports = util

export default util
