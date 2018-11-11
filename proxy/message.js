var EventProxy = require('eventproxy');
var _ = require('lodash');

var Message = require('../models').Message;
var User       = require('./user')



/**
 * 根据用户ID，获取未读消息的数量
 * Callback:
 * 回调函数参数列表：
 * - err, 数据库错误
 * - count, 未读消息数量
 * @param {String} id 用户ID
 * @param {Function} callback 获取消息数量
 */
exports.getMessagesCount = function (id, callback) {
    Message.count({master_id: id, has_read: false}, callback);
};



/**
 * 根据用户ID，获取我的消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 未读消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getMessageByUserId = function (userId, cb) {

    Message.find({master_id: userId}, null, {sort: [{'create_at':-1}]}, function (err, msgs) {
        if (err) {
            return cb(err);
        }
        if (msgs.length === 0) {
            return cb(null, []);
        }
        var proxy = new EventProxy();
        proxy.after('reply_find', msgs.length, function () {
            cb(null, msgs);
        });
        for (var j = 0; j < msgs.length; j++) {
            (function (i) {
                var author_id = msgs[i].author_id;
                User.getUserById(author_id, function (err, user) {  //回复者
                    if (err) {
                        return cb(err);
                    }
                    msgs[i].user = user || { _id: '' };
                    proxy.emit('reply_find');
                });
            })(j);
        }
    });
};


/**
 * 将单个我的消息设置成已读
 */
exports.updateOneMessageToRead = function (msg_id, callback) {
    callback = callback || _.noop;
    if (!msg_id) {
        return callback();
    }
    var query = { _id: msg_id };
    Message.updateOne(query, {"$set":{ has_read: true }}).exec(callback);
};

