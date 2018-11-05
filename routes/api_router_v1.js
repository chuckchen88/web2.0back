/**
 * api 接口路由 v1
 * by chuckchen 2018.10.13
 */

var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');


var articleController = require('../api/v1/article')   //文章
var signController = require('../api/v1/sign')   //
var userController = require('../api/v1/user')   //

/* 文章 */
router.get('/articlelist', articleController.show); //列表
router.post('/article/create', articleController.create); //创建

/* 登陆注册模块 */
router.post('/signup', signController.signup);  //注册
router.post('/login', signController.login);  //登陆
router.get('/signout', signController.signout);  //登出
router.post('/forgetpass', signController.forgetPass);  //忘记密码  发送邮箱
router.get('/checkemail/:key/:name', signController.checkEmail);  //忘记密码  验证邮箱
router.post('/updatePass', signController.updatePass);  //忘记密码  提交
router.get('/active_account/:key/:name', signController.activeAccount);  //帐号激活
router.get('/getsession',auth.userRequired, signController.getsession);

/* 个人中心 */
router.get('/getuserinfo',auth.userRequired, userController.getUserInfoBySession);


module.exports = router;