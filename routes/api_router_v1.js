/**
 * api 接口路由 v1
 * by chuckchen 2018.10.13
 */

var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');


var articleController = require('../api/v1/article')   //文章
var signController = require('../api/v1/sign')   //

/* 文章 */
router.get('/articlelist', articleController.show); //列表
router.post('/article/create', articleController.create); //创建

/* 登陆注册模块 */
router.post('/signup', signController.signup);  //注册
router.post('/login', signController.login);  //登陆
router.get('/signout', signController.signout);  //登出
router.get('/active_account', signController.activeAccount);  //帐号激活
router.get('/getsession',auth.userRequired, signController.getsession);

module.exports = router;