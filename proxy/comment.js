var models = require('../models')
var Comment = models.Comment
var EventProxy = require('eventproxy')
var at         = require('../common/at')
var User       = require('./user')

/**
 * 创建并保存一条回复信息
 * @param {String} content 回复内容
 * @param {String} userId 回复用户id
 * @param {Array} pics 图片数组  可以为空
 * @param {String} [replyId] 回复ID，当二级回复时设定该值
 * @param {String} [articleId] 文章id
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function (content, pics, userId, replyId,articleId, callback) {
    if (typeof replyId === 'function') {
        callback = replyId;
        replyId  = null;
    }
    var comment       = new Comment();
    comment.content   = content;
    comment.user_id = userId;
    comment.article_id = articleId;

    if (replyId) {
        comment.reply_id = replyId;
    }
    if (pics) {
        comment.pics = pics;
    }
    comment.save(function (err) {
        callback(err, comment);
    });
};

/**
 * 获取所有评论 时间降序
 * Callback:
 * - err, 数据库异常
 * - replies, 回复列表
 * @param {Function} callback 回调函数
 */
exports.getRepliesByArticleId = function (articleId,cb) {
    Comment.find({deleted: false,article_id:articleId}, '', {sort: [{'create_at': -1}]}, function (err, replies) {
        if (err) {
            return cb(err);
        }
        if (replies.length === 0) {
            return cb(null, []);
        }
        var proxy = new EventProxy();
        proxy.after('reply_find', replies.length, function () {
            cb(null, replies);
        });
        for (var j = 0; j < replies.length; j++) {
            (function (i) {
                var user_id = replies[i].user_id;
                User.getUserById(user_id, function (err, user) {  //回复者
                    if (err) {
                        return cb(err);
                    }
                    replies[i].user = user || { _id: '' };
                    //proxy.emit('reply_find');
                    at.linkUsers(replies[i].content, function (err, str) {
                        if (err) {
                            return cb(err);
                        }
                        replies[i].content = str;
                        proxy.emit('reply_find');
                    });
                });
            })(j);
        }
    });
};
/**
 * 根据ID
 * Callback:
 * - err, 数据库异常
 * @param {String} id
 * @param {Function} callback 回调函数
 */
exports.getCommentById = function (id, callback) {
    if (!id) {
        return callback();
    }
    Comment.findOne({_id: id,deleted:false}, callback);
};