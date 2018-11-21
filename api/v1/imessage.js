var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var Imessage = require('../../proxy').Imessage  //方法
var eventproxy = require('eventproxy') //异步协作
var _ = require('lodash')
/**
 * 聊天信息列表 分页
 * @param req
 * @param res
 * @param next
 */
var chatlist = function(req, res, next){
    var page = parseInt(req.params.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 12;

    var proxy = new eventproxy();
    proxy.fail(next);
    var query = {'deleted':false}
    var options = { skip: (page - 1) * limit, limit: limit, sort: [{'create_at': -1}]}

    Imessage.getCountByQuery(query,proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    Imessage.getIMessages(query,options,proxy.done('msgs', function (msgs) {
        msgs = msgs.map(function (msg) {
            msg.user = _.pick(msg.user, ['loginname', 'avatar']);
            msg = _.pick(msg, ['content','user_id','type','create_at','user']);
            return msg;
        });
        proxy.emit('msgs', msgs)
        return msgs;
    }))

    proxy.all('msgs', 'pages',
        function (msgs,  pages) {
            var data = {}
            data.msgs = msgs
            data.total_page = pages

            return res.json(responseData(200,'获取成功',data))
        });
}
exports.chatlist = chatlist