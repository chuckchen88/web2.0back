var models = require('../models')
var User = models.User
var uuidv4 = require('uuid/v4')   //生成唯一id，标识单个记录
var utility = require('utility');  //加密  md5  sha1 base64 escape 时间

/**
 * 添加用户
 * @param name
 * @param loginname
 * @param pass
 * @param email
 * @param avatar_url
 * @param callback
 */
exports.newAndSave = function(name, loginname, pass, email, avatar_url, callback){
    var user = new User()
    user.name = name
    user.loginname = loginname
    user.pass = pass
    user.email = email
    user.avatar = avatar_url
    user.accessToken = uuidv4()

    user.save(callback)
}
/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} query 关键字
 * ''   字段
 * @param {Object} opt 选项 skip limit
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, opt, callback) {
    User.find(query, '', opt, callback);
};
/**
 * 根据登录名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName = function (loginName, callback) {
    User.findOne({'loginname': new RegExp('^'+loginName+'$', "i")}, callback);
};
/**
 * 根据邮箱，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */
exports.getUserByMail = function (email, callback) {
    User.findOne({email: email}, callback);
};
/**
 * 根据用户ID，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
    if (!id) {
        return callback();
    }
    User.findOne({_id: id}, callback);
};
/**
 * 根据查询条件，获取一个用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} name 用户名
 * @param {String} key 激活码
 * @param {Function} callback 回调函数
 */
exports.getUserByNameAndKey = function (loginname, key, callback) {
    User.findOne({loginname: loginname, retrieve_key: key}, callback);
};

/**
 * 生成头像链接
 * @param email
 * @returns {string}
 */
var makeGravatar = function (email) {
    return 'http://www.gravatar.com/avatar/' + utility.md5(email.toLowerCase()) + '?size=48'
}
exports.makeGravatar = makeGravatar