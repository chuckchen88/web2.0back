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

exports.User = mongoose.model('User')
exports.Tab = mongoose.model('Tab')
exports.Article = mongoose.model('Article')

