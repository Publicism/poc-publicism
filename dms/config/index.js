const _ = require('lodash');

const defaults = require('./default.js');
const config = require('./' + (process.env.NODE_ENV || 'dev') + '.js');

module.exports = _.merge({}, defaults, config);
