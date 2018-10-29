var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var ArticleProxy = require('../../proxy').Article  //方法
//var eventproxy = require('eventproxy') //异步协作
/**
 * 文章列表
 * @param req
 * @param res
 * @param next
 */
var show = function(req, res, next){
    return res.json(responseData(200,'success','我是文章列表'))
}
exports.show = show

/**
 * 创建新文章
 * @param req
 * @param res
 * @param next
 */
var create = function (req, res, next) {
    var title = validator.trim(req.body.title || '')
    var content = validator.trim(req.body.content || '')

    //验证
    var error_msg
    if(title === ''){
        error_msg = '标题不可为空'
    }else if(content === ''){
        error_msg = '内容不可为空'
    }else if(title.length < 5 || title.length > 100){
        error_msg = '标题字太多或太少'
    }
    if(error_msg){
        res.status(400)
        return res.json(responseData(400,error_msg))
    }

    //保存数据
    ArticleProxy.newAndSave(title, content, 1, function(err, article){   //1 作者id 此接口需要登录 authorId  req.user.id
        if(err) return next(err)

       // var proxy = new eventproxy()
       // proxy.all('score_saved', function(){
            res.json(responseData(200,'success',article.id));
       // })
       // proxy.emit('score_saved')
    })

}
exports.create = create