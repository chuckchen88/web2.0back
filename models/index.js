var mongoose = require('mongoose')
var config = require('../config')

//连接数据库
mongoose.connect(config.db, {
    poolSize: 20,
    useNewUrlParser:true
}, function(err){
    if(err){
        //log
        console.log(err)
    }else{
        console.log('success')
    }
})

//modles
require('./article')
require('./user')
require('./tab')
require('./work')
require('./leavewords')
require('./comment')
require('./message')
require('./sys')

exports.User = mongoose.model('User')
exports.Tab = mongoose.model('Tab')
exports.Article = mongoose.model('Article')
exports.Work = mongoose.model('Work')
exports.LeaveWord = mongoose.model('LeaveWord')
exports.Comment = mongoose.model('Comment')
exports.Message = mongoose.model('Message')
exports.Sys = mongoose.model('Sys')

