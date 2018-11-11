var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');
var tabController = require('../controllers/tab')   //
var articleController = require('../controllers/article')   //
var workController = require('../controllers/work')   //
var sysController = require('../controllers/sys')   //
var upload = require('../common/upload')
var config = require('../config')

/* 首页 */
router.get('/',auth.adminRequired, function(req, res, next) {
    res.render('admin/index',{user:req.session.user});
});
/*栏目模块*/
router.get('/tabs',auth.adminRequired, tabController.index);
router.get('/tabs/add',auth.adminRequired, function(req, res, next) {
    res.render('admin/tab_add');
});
router.post('/tabs/create',auth.adminRequired, tabController.create);
router.get('/tabs/edit/:id',auth.adminRequired, tabController.editPage);
router.post('/tabs/update',auth.adminRequired, tabController.update);
router.get('/tabs/delete/:id',auth.adminRequired, tabController.delete);
/*文章模块*/
router.get('/articles',auth.adminRequired,articleController.index);  //列表
router.get('/articles/add',auth.adminRequired,articleController.createPage);  //新建页面
router.post('/articles/create',auth.adminRequired,articleController.create);  //提交
router.get('/articles/edit/:id',auth.adminRequired,articleController.editPage);  //编辑页面
router.post('/articles/update',auth.adminRequired,articleController.update);  //编辑动作
router.get('/articles/delete/:id',auth.adminRequired,articleController.delete);  //编辑动作
/*上传图片*/
router.post('/upload',auth.userRequired,upload.single('file'), function (req, res, next) {  //单个图片上传接口
    res.json({"code": 0,"msg": "图片上传成功","data": {"src": config.upload+'/'+req.file.filename,"title":req.file.filename}})
});
/*作品管理模块*/
router.get('/works',auth.adminRequired,workController.index);  //列表
router.get('/works/add',auth.adminRequired,function (req, res, next) {
    res.render('admin/work_add');
});  //新建页面
router.post('/works/create',auth.adminRequired,workController.create);  //提交
router.get('/works/edit/:id',auth.adminRequired,workController.editPage);  //编辑页面
router.post('/works/update',auth.adminRequired,workController.update);  //编辑动作
router.get('/works/delete/:id',auth.adminRequired,workController.delete);  //编辑动作

/*消息管理模块--系统消息*/
router.get('/sysmsg/add',auth.adminRequired,function (req, res, next) {
    res.render('admin/sysmsg_add');
});
router.post('/sysmsg/create',auth.adminRequired,sysController.create);  //提交

module.exports = router;
