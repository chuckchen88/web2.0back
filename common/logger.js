var config = require('../config')
var pathLib = require('path')
var env = process.env.NODE_ENV || "development"
var log4js = require('log4js')

var level = config.debug && env !== 'test' ? 'DEBUG' : 'ERROR'
log4js.configure({
    appenders: { cheese: { type: 'file', filename: pathLib.join(config.log_dir, 'cheese.log')}},
    categories: { default: { appenders: ['cheese'], level: level}}
})
var logger = log4js.getLogger('cheese')

module.exports = logger