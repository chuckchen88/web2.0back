var bcrypt = require('bcryptjs'); //加密
var moment = require('moment')    //格式化时间
moment.locale('zh-cn')

/**
 * 格式化时间
 * @param date
 * @param friendly
 * @returns {*}
 */
exports.formatDate = function(date, friendly){
    date = moment(date)
    if(friendly){
        return date.fromNow()
    }else{
        return date.format('YYYY-MM-DD HH:mm')
    }
}
/**
 * 验证字符串是否合法（用户名）
 * @param str
 * @returns {boolean}
 */
exports.validateId = function (str) {
    return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};
/**
 * 密码加密
 * @param str
 * @param callback
 */
exports.bhash = function (str, callback) {
    bcrypt.hash(str, 10, callback);
};
/**
 * 验证密码加密
 * @param str
 * @param hash
 * @param callback
 */
exports.bcompare = function (str, hash, callback) {
    bcrypt.compare(str, hash, callback);
};
/**
 * 统一返回数据
 * @param code [num]  状态码
 * @param message [string] 提示信息
 * @param data [array] 数据
 * @returns {*}
 */
exports.responseData = function(code,message,data){
    return {code:code,msg:message,data:data};
}

/**
 *
 * @param message
 * @param res
 */
exports.errorMessage = function (message,res){
    var result=`<script>alert('${message}');history.back()</script>`;
    res.send(result)
}
/**
 *
 * @param message
 * @param res
 */
exports.successMessage = function (url, message,res){
    var result=`<script>alert('${message}');location.href='${url}';</script>`;
    res.send(result)
}