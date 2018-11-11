var Sys         = require('../proxy').Sys;
var validator = require('validator')   //验证
var eventproxy = require('eventproxy') //异步协作
var tools = require('../common/tools')

//创建
exports.create = function (req, res, next) {
    var title = validator.trim(req.body.title);
    var content     = validator.trim(req.body.content);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('prop_err', function (msg) {
        return tools.errorMessage('创建失败',res);
    });
    Sys.newAndSave(title, content, function (err) {
        if (err) {
            return next(err);
        }
        return tools.successMessage('/admin/tabs','创建成功',res);
    });
};