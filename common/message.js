var models       = require('../models');
var eventproxy   = require('eventproxy');
var Message      = models.Message;
var User         = require('../proxy').User;

var _            = require('lodash');

/**
 * 插入文章回复信息
 * @param master_id
 * @param author_id
 * @param topic_id
 * @param reply_id
 * @param callback
 */
exports.sendArtReplyMessage = function (master_id, author_id, reply_id, article_id,callback) {
    callback = callback || _.noop;
    var ep = new eventproxy();
    ep.fail(callback);

    var message       = new Message();
    message.type      = 'artReply';
    message.master_id = master_id;
    message.author_id = author_id;
    message.article_id  = article_id;
    message.reply_id  = reply_id;

    message.save(ep.done('message_saved'));
    ep.all('message_saved', function (msg) {
        callback(null, msg);
    });
};
/**
 * 插入留言回复信息
 * @param master_id  被回复者
 * @param author_id   回复者
 * @param reply_id   回复id
 * @param callback
 */
exports.sendLeaveReplyMessage = function (master_id, author_id, reply_id, callback) {
    callback = callback || _.noop;
    var ep = new eventproxy();
    ep.fail(callback);

    var message       = new Message();
    message.type      = 'leaveReply';
    message.master_id = master_id;
    message.author_id = author_id;
    message.reply_id  = reply_id;

    message.save(ep.done('message_saved'));
    ep.all('message_saved', function (msg) {
        callback(null, msg);
    });
};
/**
 * 插入文章@用户信息
 * @param master_id
 * @param author_id
 * @param topic_id
 * @param reply_id
 * @param callback
 */
exports.sendAtMessage = function (master_id, author_id, topic_id, reply_id, callback) {
    callback = callback || _.noop;
    var ep = new eventproxy();
    ep.fail(callback);

    var message       = new Message();
    message.type      = 'artAt';
    message.master_id = master_id;
    message.author_id = author_id;
    message.topic_id  = topic_id;
    message.reply_id  = reply_id;

    message.save(ep.done('message_saved'));
    ep.all('message_saved', function (msg) {
        callback(null, msg);
    });
};
