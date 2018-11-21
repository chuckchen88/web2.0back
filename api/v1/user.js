var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var UserProxy = require('../../proxy').User;
var MessageProxy = require('../../proxy').Message;
var SysProxy = require('../../proxy').Sys;
var eventproxy = require('eventproxy') //异步协作
var _ = require('lodash')
/**
 *
 * @param req
 * @param res
 * @param next
 */
var getUserInfoBySession = function (req, res, next) {
    var loginname = req.session.user.loginname?req.session.user.loginname:'';
    var ep        = new eventproxy();
    ep.fail(next);
    UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
        if (!user) {
            return res.json(responseData(201,'用户不存在'))
        }
        return res.json(responseData(200,'获取成功',user))
    }));
};
exports.getUserInfoBySession = getUserInfoBySession;
/**
 * 根据当前用户获取消息列表
 * @param req
 * @param res
 * @param next
 */
var getUserNews = function (req, res, next) {
    var user_id = req.session.user._id?req.session.user._id:'';
    var ep        = new eventproxy();
    var data = {}

    ep.fail(next);
    MessageProxy.getMessageByUserId(user_id, ep.done(function (msgs) {
        data.msgs = msgs.map(function (msg) {
            msg.user = _.pick(msg.user, ['loginname', 'avatar','_id']);
            msg = _.pick(msg, ['_id', 'user', 'author_id', 'has_read', 'create_at', 'master_id','reply_id','type','article_id']);
            return msg;
        });

        return res.json(responseData(200,'获取成功',data.msgs))
    }));
};
exports.getUserNews = getUserNews;
/**
 * 修改头像
 * @param req
 * @param res
 * @param next
 */
exports.updateAvatar = function(req, res, next){
    var loginname = req.session.user.loginname?req.session.user.loginname:'';
    var avatar = req.body.avatar;
    var ep        = new eventproxy();
    ep.fail(next);
    UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
        if (!user) {
            return res.json(responseData(201,'用户不存在'))
        }
        user.avatar = avatar
        user.save(function(err){
            if(err){
                return next(err)
            }
            return res.json(responseData(200,'修改成功',user))
        })
    }));
}
/**
 * 获取未读消息数量
 * @param req
 * @param res
 * @param next
 */
var hasNotReadCount = function (req, res, next) {
    var userId = req.session.user._id.toString();

    var ep = new eventproxy();
    ep.fail(next);

    SysProxy.getCountHasNotRead(userId, ep.done(function(syscount){
        ep.emit('sys', syscount);  //系统消息未读数
    }))
    MessageProxy.getMessagesCount(userId, ep.done(function (mycount) {
        ep.emit('my', mycount);  //我的消息未读数
    }))
    ep.all('sys', 'my',
        function (syscount,  mycount) {
            return res.json(responseData(200,'获取成功',syscount+mycount))
        });

};

exports.hasNotReadCount = hasNotReadCount;
/**
 * 已读一个我的信息
 * @param req
 * @param res
 * @param next
 */
var hasReadOne = function (req, res, next) {
    let msg_id = req.params.id

    var ep = new eventproxy();
    ep.fail(next);
    MessageProxy.updateOneMessageToRead(msg_id, ep.done(function(msg){console.log(msg)
        return res.json(responseData(200,'成功'))
    }))

}
exports.hasReadOne = hasReadOne