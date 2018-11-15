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
var leavewordController = require('../api/v1/leaveword')   //
var commentController = require('../api/v1/comment')   //
var sysController = require('../api/v1/sys')   //
var workController = require('../api/v1/work')   //
var tabController = require('../api/v1/tab')   //
var upload = require('../common/upload')
var config = require('../config')

/* 文章 */
router.get('/articlelist/:tab_id/:page', articleController.articleList); //列表
router.get('/articlelist/:id', articleController.artDetails); //详情
router.get('/artfabulous/:id',auth.userRequired, articleController.fabulous); //点赞 需要登录
router.get('/tablist', tabController.index); //列表

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
router.get('/getuserinfo/notreadcount',auth.userRequired, userController.hasNotReadCount);
router.get('/getuserinfo/mynews',auth.userRequired, userController.getUserNews);
router.get('/myNews/hasReadOne/:id',auth.userRequired, userController.hasReadOne);
router.get('/getMyArticles/:page',auth.userRequired, articleController.getFabulousArticles);

//系统消息
router.get('/sysmsgs',auth.userRequired, sysController.sysmsgs);
router.get('/sysmsgs/:id',auth.userRequired, sysController.oneMsg);

/* 留言 */
router.post('/leaveAdd',auth.userRequired, leavewordController.add);
router.get('/leaveWord/delete/:id',auth.userRequired, leavewordController.delete);
router.get('/leaveWord/fabulous/:id',auth.userRequired, leavewordController.fabulous);
router.get('/leaveWordList',leavewordController.words);

/*文章评论*/
router.get('/commentList/:id',commentController.commentList);
router.post('/commentAdd',auth.userRequired, commentController.add);
router.get('/comment/fabulous/:id',auth.userRequired, commentController.fabulous);
router.get('/comment/delete/:id',auth.userRequired, commentController.delete);

/* 检测是否登录 */
router.get('/checkLogin',auth.userRequired,function(req,res,next){
    res.json({"code":0,"msg":"已登录"})
});

/*上传图片*/
router.post('/upload',auth.userRequired,upload.single('file'), function (req, res, next) {  //单个图片上传接口
    res.json({"code": 0,"msg": "图片上传成功","data": {"src": config.upload+'/'+req.file.filename,"title":req.file.filename}})
});

/* 作品 */
router.get('/worklist', workController.index); //列表

module.exports = router;