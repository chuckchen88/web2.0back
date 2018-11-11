var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var UserProxy = require('../../proxy').User;
var SysProxy = require('../../proxy').Sys;
var EventProxy = require('eventproxy') //异步协作
var _ = require('lodash')

/**
 * 系统消息接口
 * @param req
 * @param res
 * @param next
 */
var sysmsgs = function(req, res, next){
    var proxy = new EventProxy()
    var data = {}
    var user_id = req.session.user._id

    proxy.fail(next);
    SysProxy.getMsgs(user_id, proxy.done(function(msgs){
        data.msgs = msgs.map(function (msg) {
            msg = _.pick(msg, ['id', 'title', 'content', 'create_at', 'has_read']);
            return msg;
        });
        proxy.emit('full_msgs', data)
    }))
    proxy.all('full_msgs', function (data) {
        return res.json(responseData(200,'获取成功',data.msgs))
    });
}
exports.sysmsgs = sysmsgs
/**
 * 详情
 * @param req
 * @param res
 * @param next
 */
var oneMsg = function (req, res, next) {
    let msg_id = req.params.id
    var user_id = req.session.user._id.toString()
    var proxy = new EventProxy()
    proxy.fail(next);

    if (!msg_id) {
        return res.json(responseData(201,'缺少必要参数'))
    }
    SysProxy.getMessageBySysId(msg_id, function(err,msg){
        if (err) {
            return res.json(responseData(201,'网络错误，请稍后重试'))
        }
        if(msg.has_read_user_ids.indexOf(user_id) <= -1){
            msg.has_read_user_ids.push(user_id) //标记为已读
            msg.save(function (err) {
                if (err) {
                    return res.json(responseData(201,'网络错误，请稍后重试'))
                }
            });
        }
        return res.json(responseData(200,'获取成功',msg))
    })
}
exports.oneMsg = oneMsg
