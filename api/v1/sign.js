var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var UserProxy = require('../../proxy').User;
var eventproxy = require('eventproxy') //异步协作
var tools = require('../../common/tools')
var utility = require('utility');
var mail = require('../../common/mail');
var config = require('../../config');
var SITE_ROOT_URL = 'http://' + config.host;
var authMiddleWare = require('../../middlewares/auth')
/**
 * @api {post} /v1/signup 用户注册
 * @apiVersion 1.0.0
 * @apiName signup
 * @apiGroup User
 *
 * @apiParam {String} loginname  登陆用户名
 * @apiParam {String} email  邮箱
 * @apiParam {String} pass   密码
 * @apiParam {String} re_pass  重复密码
 *
 * @apiSuccess {Number} code  状态码.
 * @apiSuccess {String} msg   状态描述
 * @apiSuccess {Array} data  数据
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *  {
 *     "code": 200,
 *      "msg": "success",
 *      "data": "我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。"
 *  }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422
 *  {
 *     "code": 422,
 *      "msg": "用户名至少需要5个字符"
 *  }
 *  @apiSampleRequest /v1/signup
 */
var signup = function(req, res, next){
    var loginname = validator.trim(req.body.loginname || '').toLowerCase()
    var email     = validator.trim(req.body.email || '').toLowerCase()
    var pass      = validator.trim(req.body.pass || '')
    var rePass    = validator.trim(req.body.re_pass || '')

    var ep = new eventproxy()
    ep.fail(next)
    ep.on('prop_err', function (msg) {
        res.status(422)
        return res.json(responseData(422,msg))
    });

    // 验证信息的正确性
    if ([loginname, pass, rePass, email].some(function (item) { return item === ''; })) {
        ep.emit('prop_err', '信息不完整。')
        return
    }
    if (loginname.length < 5) {
        ep.emit('prop_err', '用户名至少需要5个字符。')
        return
    }
    if (!tools.validateId(loginname)) {
        return ep.emit('prop_err', '用户名不合法。')
    }
    if (!validator.isEmail(email)) {
        return ep.emit('prop_err', '邮箱不合法。')
    }
    if (pass !== rePass) {
        return ep.emit('prop_err', '两次密码输入不一致。')
    }
    // END 验证信息的正确性

    UserProxy.getUsersByQuery({'$or': [
            {'loginname': loginname},
            {'email': email}
        ]}, {}, function (err, users) {
        if (err) {
            return next(err);
        }
        if (users.length > 0) {
            ep.emit('prop_err', '用户名或邮箱已被使用。');
            return;
        }
        var avatarUrl = UserProxy.makeGravatar(email);
        tools.bhash(pass, ep.done(function(passhash){
            UserProxy.newAndSave(loginname, loginname, passhash, email, avatarUrl, function (err) {
                if (err) {
                    return next(err);
                }
                mail.sendActiveMail(email, utility.md5(email + passhash + config.session_secret), loginname);
                return res.json(responseData(200,'success','我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'))
            })
        }))
    })
}
exports.signup = signup
/**
 * 登陆
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.login = function (req, res, next) {
    var loginname = validator.trim(req.body.loginname).toLowerCase();
    var pass      = validator.trim(req.body.pass);
    var ep        = new eventproxy();

    ep.fail(next);

    if (!loginname || !pass) {
        res.status(422);
        return res.render('sign/signin', { error: '信息不完整。' });
    }

    var getUser;
    if (loginname.indexOf('@') !== -1) {  //如果存在@ 说明是邮箱
        getUser = UserProxy.getUserByMail;
    } else {
        getUser = UserProxy.getUserByLoginName;
    }

    ep.on('login_error', function (login_error) {
        res.status(403);
        return res.json(responseData(403,login_error))
    });

    getUser(loginname, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return ep.emit('login_error','用户名错误');
        }
        var passhash = user.pass;//数据库中的密码
        tools.bcompare(pass, passhash, ep.done(function (bool) {
            if (!bool) {
                return ep.emit('login_error','密码错误');
            }
            if (!user.active) {
                // 重新发送激活邮件
                mail.sendActiveMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.loginname);
                res.status(403);
                return res.json(responseData(403,'账号未激活',{ error: '此帐号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。' }))
            }
            // store session cookie
            authMiddleWare.gen_session(user, res);
            req.session.user = user
            return res.json(responseData(200,'登陆成功',user))
        }));
    });
};

exports.getsession =  function(req, res, next){
    res.send(req.session.user)
}

/**
 * 登出
 * @param req
 * @param res
 * @param next
 */
exports.signout = function (req, res, next) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, { path: '/' });
    return res.json(responseData(200,'登出成功'))
};
/**
 * 账号激活
 * @param req
 * @param res
 * @param next
 */
exports.activeAccount = function (req, res, next) {
    var key  = validator.trim(req.query.key);
    var name = validator.trim(req.query.name);

    UserProxy.getUserByLoginName(name, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('[ACTIVE_ACCOUNT] no such user: ' + name));
        }
        var passhash = user.pass;
        if (!user || utility.md5(user.email + passhash + config.session_secret) !== key) {
            return res.send('信息有误，帐号无法被激活。')
        }
        if (user.active) {
            return res.send('帐号已经是激活状态。')
        }
        user.active = true;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            return res.send("帐号已被激活，<span id='num'>5</span>秒后自动跳转<a href="+SITE_ROOT_URL+">登录</a><script>var i = 5;var timer = setInterval(function() {if(i<=1){clearInterval(timer);window.location.href='"+SITE_ROOT_URL+"'};i--;document.getElementById('num').innerText=i;},1000);</script>")
        });
    });
};