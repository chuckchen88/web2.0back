/**
 * 用户schema
 */
var mongoose = require('mongoose')
var BaseModel = require('./base_model')
var Schema = mongoose.Schema

//定义schema
var UserSchema = new Schema({
    name: { type: String},
    loginname: { type: String},
    pass: { type: String },
    email: { type: String},
    profile_image_url: {type: String},
    signature: { type: String },
    avatar: { type: String },
    topic_count: { type: Number, default: 0 },
    reply_count: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    accessToken: {type: String},
    active: { type: Boolean, default: false },

    //重置密码使用 链接过期时间24小时
    retrieve_time: {type: Number},
    retrieve_key: {type: String},
})
UserSchema.plugin(BaseModel)

/*UserSchema.virtual('avatar_url').get(function () {    //当获取avatar_url属性时，返回url
    var url = this.avatar || 'http://img'
    return url;
});
UserSchema.pre('save', function(next){  //在保存前调用
    var now = new Date();
    this.update_at = now;
    next();
});*/
mongoose.model('User', UserSchema)