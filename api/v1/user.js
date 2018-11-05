var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var UserProxy = require('../../proxy').User;
var eventproxy = require('eventproxy') //异步协作

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
