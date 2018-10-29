var config = require('../config')
var UserProxy  = require('../proxy').User;
var mongoose   = require('mongoose');
var UserModel  = mongoose.model('User');
var responseData = require('../common/tools').responseData;  //统一返回数据封装


/**
 * 需要管理员权限
 */
exports.adminRequired = function (req, res, next) {
    if (!req.session.user) {
        return res.json(responseData(403,'你还没有登录。'))
    }
    if (!req.session.user.is_admin) {
        return res.json(responseData(408,'需要管理员权限。'))
    }
    next();
};

/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
    if (!req.session || !req.session.user || !req.session.user._id) {
        res.status(403)
        return res.json(responseData(403,'你还没有登录。'))
    }
    next();
};

/**
 * 设置session
 * @param user
 * @param res
 */
function gen_session(user, res) {
    var auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
    var opts = {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        signed: true,
        httpOnly: true
    };
    res.cookie(config.auth_cookie_name, auth_token, opts); //cookie 有效期30天
}
exports.gen_session = gen_session;

/**
 * 验证用户是否登陆
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.authUser = function (req, res, next) {
    var ep = new eventproxy();
    ep.fail(next);

    // Ensure current_user always has defined.
    res.locals.current_user = null;

    ep.all('get_user', function (user) {
        if (!user) {
            return next();
        }
        user = res.locals.current_user = req.session.user = new UserModel(user);

        if (config.admins.hasOwnProperty(user.loginname)) {
            user.is_admin = true;
        }

    });

    if (req.session.user) {
        ep.emit('get_user', req.session.user);
    } else {
        var auth_token = req.signedCookies[config.auth_cookie_name];
        if (!auth_token) {
            return next();
        }

        var auth = auth_token.split('$$$$');
        var user_id = auth[0];
        UserProxy.getUserById(user_id, ep.done('get_user'));
    }
};