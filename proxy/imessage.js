var EventProxy = require('eventproxy');
var _ = require('lodash');

var Imessage = require('../models').Imessage;
var User       = require('./user')


/**
 *
 * @param content
 * @param type text文本   time时间
 * @param pic
 * @param user_id
 * @param callback
 */
exports.newAndSave = function (content, type, pic, user_id, callback) {

    var imessage       = new Imessage();
    imessage.content  = content;
    imessage.type  = type;
    imessage.user_id = user_id;

    if (pic) {
        imessage.pic = pic;
    }

    imessage.save(function (err) {
        callback(err, imessage);
    });
};

/**
 * 根据用户ID，获取未读消息的数量
 * Callback:
 * 回调函数参数列表：
 * - err, 数据库错误
 * - count, 未读消息数量
 * @param {String} id 用户ID
 * @param {Function} callback 获取消息数量
 */
exports.getCountByQuery = function (query, callback) {
    Imessage.count(query, callback);
};



/**
 * 根据用户ID，获取我的消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 未读消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getIMessages = function (query, opt,cb) {

    Imessage.find(query, {}, opt,  function (err, msgs) {
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
                var user_id = msgs[i].user_id;
                User.getUserById(user_id, function (err, user) {  //回复者
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
 *
 * @param callback
 */
exports.getMessageByTimeType = function (callback) {
    Imessage.findOne({'type':'time',deleted:false}, null, {sort: [{'create_at':-1}]}, callback);
};


