var EventProxy = require('eventproxy');
var _ = require('lodash');

var Sys = require('../models').Sys;

/**
 * 管理员后台发送广播通知
 * @param title
 * @param content
 * @param callback
 */
exports.newAndSave = function(title,content,callback){
    var sys = new Sys()
    sys.title = title
    sys.content = content

    sys.save(callback)
}

/**
 * 获取系统消息列表
 * Callback:
 * - err, 数据库异常
 * - replies, 回复列表
 * @param {Function} callback 回调函数
 */
exports.getMsgs = function (user_id,cb) {
    Sys.find({deleted: false}, '', {sort: [{'create_at': -1}]}, function (err, msgs) {
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
                if(msgs[i].has_read_user_ids.indexOf(user_id) > -1){
                    msgs[i].has_read = true;
                    proxy.emit('reply_find');
                }else{
                    msgs[i].has_read = false;
                    proxy.emit('reply_find');
                }
            })(j);
        }
    });
};
/**
 * 获取当前用户未读取的系统信息数量
 * @param user_id
 * @param callback
 */
exports.getCountHasNotRead = function (user_id,callback) {
    Sys.count({has_read_user_ids:{$nin:[user_id]}}).exec(callback)
}

/**
 * 系统消息ID，获取详情
 * Callback:
 * - err, 数据库异常
 * - messages, 未读消息列表
 * @param {String} sysId
 * @param {Function} callback 回调函数
 */
exports.getMessageBySysId = function (sysId, callback) {
    Sys.findOne({_id: sysId,deleted:false}, null, {}, callback);
};