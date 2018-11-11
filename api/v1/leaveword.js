var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var LeaveWordProxy = require('../../proxy').LeaveWord;
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
var words = function(req, res, next){
    var proxy = new EventProxy()
    var data = {}
    proxy.fail(next);
    LeaveWordProxy.getReplies(proxy.done(function(replies){
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
exports.words = words

/**
 * 添加留言接口
 */
var add = function (req, res, next) {
    var content = req.body.r_content;
    var pics = req.body.pics;
    var reply_id = req.body.reply_id;   //是否是二级回复
    var master_id = req.body.master_id;   //被回复者id  没有则表示回复管理员
    var str = validator.trim(String(content));
    if (str === '') {
        return res.json(responseData(201,'缺少必要参数'))
    }
    LeaveWordProxy.newAndSave(content, pics, req.session.user._id, reply_id, function (err, reply) {
        if(err){
            return res.json(responseData(201,'网络错误'))
        }
        if(master_id){
            message.sendLeaveReplyMessage(master_id, req.session.user._id, reply._id);
        }else{
            UserProxy.getUserByLoginName(Object.keys(config.admins)[0], function (err, user) {
                if(err){
                    console.log(err)
                }
                message.sendLeaveReplyMessage(user._id, req.session.user._id, reply._id);
            });
        }

        return res.json(responseData(200,'发送成功'))
    });
};
exports.add = add

//软删除
exports.delete = function (req, res, next) {
    let leave_id = req.params.id
    if(!leave_id){
        return res.json(responseData(201,'缺少必要参数'))
    }
    LeaveWordProxy.getLeaveWordById(leave_id, function (err, leave) {
        if (err) {
            return res.json(responseData(201,'网络错误'))
        }
        if(leave.user_id.toString() != req.session.user._id){
            return res.json(responseData(201,'非法的操作'))
        }
        leave.deleted = true;
        leave.save(function (err) {
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
    let leave_id = req.params.id
    if(!leave_id){
        return res.json(responseData(201,'缺少必要参数'))
    }
    LeaveWordProxy.getLeaveWordById(leave_id, function (err, leave) {
        if (err) {
            return res.json(responseData(201,'网络错误'))
        }
        leave.fabulous += 1
        leave.save(function (err) {
            if (err) {
                return res.json(responseData(201,'网络错误'))
            }
            return res.json(responseData(200,'点赞成功'))
        });
    })
}
exports.fabulous = fabulous
