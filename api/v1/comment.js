var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var CommentProxy = require('../../proxy').Comment;
var UserProxy = require('../../proxy').User;
var EventProxy = require('eventproxy') //异步协作
var _ = require('lodash')
var message    = require('../../common/message');
var config = require('../../config')
/**
 * 列表接口
 * @param req
 * @param res
 * @param next
 */
var commentList = function(req, res, next){
    var article_id = req.params.id
    if(!article_id){
        return res.json(responseData(201,'缺少参数'))
    }
    var proxy = new EventProxy()
    var data = {}
    proxy.fail(next);
    CommentProxy.getRepliesByArticleId(article_id, proxy.done(function(replies){
        data.replies = replies.map(function (reply) {
            reply.user = _.pick(reply.user, ['loginname', 'avatar','_id']);
            reply = _.pick(reply, ['id', 'user', 'content', 'pics', 'create_at', 'reply_id','fabulous']);
            return reply;
        });
        proxy.emit('full_replies', data)
    }))
    proxy.all('full_replies', function (data) {
        return res.json(responseData(200,'获取成功',data))
    });
}
exports.commentList = commentList

/**
 * 添加文章评论接口
 */
var add = function (req, res, next) {
    var content = req.body.r_content;
    var pics = req.body.pics;
    var reply_id = req.body.reply_id;   //是否是二级回复
    var master_id = req.body.master_id;   //被回复者id  没有则表示回复管理员
    var article_id = req.body.article_id;   //文章id
    var str = validator.trim(String(content));
    if (str === '') {
        return res.json(responseData(201,'缺少必要参数'))
    }
    CommentProxy.newAndSave(content, pics, req.session.user._id, reply_id,article_id, function (err, reply) {
        if(err){
            return res.json(responseData(201,'网络错误'))
        }
        if(master_id){
            message.sendArtReplyMessage(master_id, req.session.user._id, reply._id, article_id);
        }else{
            UserProxy.getUserByLoginName(Object.keys(config.admins)[0], function (err, user) {
                if(err){
                    console.log(err)
                }
                message.sendArtReplyMessage(user._id, req.session.user._id, reply._id, article_id);
            });
        }

        return res.json(responseData(200,'发送成功'))
    });
};
exports.add = add

//软删除
exports.delete = function (req, res, next) {
    let comment_id = req.params.id
    if(!comment_id){
        return res.json(responseData(201,'缺少必要参数'))
    }
    CommentProxy.getCommentById(comment_id, function (err, comment) {
        if (err) {
            return res.json(responseData(201,'网络错误'))
        }
        if(comment.user_id.toString() != req.session.user._id){
            return res.json(responseData(201,'非法的操作'))
        }
        comment.deleted = true;
        comment.save(function (err) {
            if (err) {
                return res.json(responseData(201,'网络错误'))
            }
            return res.json(responseData(200,'删除成功'))
        });
    })
}

/**
 * 赞
 */
var fabulous = function (req, res, next) {
    let comment_id = req.params.id
    if(!comment_id){
        return res.json(responseData(201,'缺少必要参数'))
    }
    CommentProxy.getCommentById(comment_id, function (err, comment) {
        if (err) {
            return res.json(responseData(201,'网络错误'))
        }
        comment.fabulous += 1
        comment.save(function (err) {
            if (err) {
                return res.json(responseData(201,'网络错误'))
            }
            return res.json(responseData(200,'点赞成功'))
        });
    })
}
exports.fabulous = fabulous
